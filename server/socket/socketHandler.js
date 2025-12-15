const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active users per room
const rooms = new Map();

const socketHandler = (io) => {
    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Join a recipe editing room
        socket.on('joinRoom', (recipeId) => {
            socket.join(recipeId);

            // Track user in room
            if (!rooms.has(recipeId)) {
                rooms.set(recipeId, new Map());
            }

            const roomUsers = rooms.get(recipeId);
            roomUsers.set(socket.id, {
                id: socket.user._id,
                name: socket.user.name,
                avatar: socket.user.avatar,
                cursor: null,
                activeSection: null
            });

            // Broadcast updated presence to all users in room
            io.to(recipeId).emit('presenceUpdate', {
                users: Array.from(roomUsers.values())
            });

            console.log(`${socket.user.name} joined room: ${recipeId}`);
        });

        // Leave a recipe editing room
        socket.on('leaveRoom', (recipeId) => {
            socket.leave(recipeId);

            if (rooms.has(recipeId)) {
                const roomUsers = rooms.get(recipeId);
                roomUsers.delete(socket.id);

                if (roomUsers.size === 0) {
                    rooms.delete(recipeId);
                } else {
                    io.to(recipeId).emit('presenceUpdate', {
                        users: Array.from(roomUsers.values())
                    });
                }
            }

            console.log(`${socket.user.name} left room: ${recipeId}`);
        });

        // Handle ingredient changes
        socket.on('ingredientChange', (data) => {
            const { recipeId, ingredientIndex, field, value, operation } = data;

            // Broadcast to all other users in the room
            socket.to(recipeId).emit('ingredientChange', {
                ingredientIndex,
                field,
                value,
                operation, // 'update', 'add', 'delete'
                userId: socket.user._id,
                userName: socket.user.name
            });
        });

        // Handle step changes
        socket.on('stepChange', (data) => {
            const { recipeId, stepIndex, field, value, operation } = data;

            socket.to(recipeId).emit('stepChange', {
                stepIndex,
                field,
                value,
                operation,
                userId: socket.user._id,
                userName: socket.user.name
            });
        });

        // Handle title/description changes
        socket.on('recipeMetaChange', (data) => {
            const { recipeId, field, value } = data;

            socket.to(recipeId).emit('recipeMetaChange', {
                field,
                value,
                userId: socket.user._id,
                userName: socket.user.name
            });
        });

        // Handle cursor position updates
        socket.on('cursorUpdate', (data) => {
            const { recipeId, position, section } = data;

            if (rooms.has(recipeId)) {
                const roomUsers = rooms.get(recipeId);
                const user = roomUsers.get(socket.id);

                if (user) {
                    user.cursor = position;
                    user.activeSection = section;

                    socket.to(recipeId).emit('cursorUpdate', {
                        userId: socket.user._id,
                        userName: socket.user.name,
                        position,
                        section
                    });
                }
            }
        });

        // Handle version save notification
        socket.on('versionSaved', (data) => {
            const { recipeId, version } = data;

            socket.to(recipeId).emit('versionSaved', {
                version,
                savedBy: socket.user.name
            });
        });

        // Handle full recipe sync (for new joiners or conflicts)
        socket.on('requestSync', (recipeId) => {
            // Ask other users in the room to send current state
            socket.to(recipeId).emit('syncRequest', {
                requestedBy: socket.id
            });
        });

        socket.on('syncResponse', (data) => {
            const { targetSocketId, recipe } = data;
            io.to(targetSocketId).emit('syncData', { recipe });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);

            // Remove user from all rooms
            rooms.forEach((roomUsers, recipeId) => {
                if (roomUsers.has(socket.id)) {
                    roomUsers.delete(socket.id);

                    if (roomUsers.size === 0) {
                        rooms.delete(recipeId);
                    } else {
                        io.to(recipeId).emit('presenceUpdate', {
                            users: Array.from(roomUsers.values())
                        });
                    }
                }
            });
        });
    });
};

module.exports = socketHandler;
