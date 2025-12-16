import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token) {
            const newSocket = io('https://tastelab-mqir.onrender.com', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('presenceUpdate', (data) => {
                setActiveUsers(data.users);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [isAuthenticated, token]);

    const joinRoom = useCallback((recipeId) => {
        if (socket) {
            socket.emit('joinRoom', recipeId);
        }
    }, [socket]);

    const leaveRoom = useCallback((recipeId) => {
        if (socket) {
            socket.emit('leaveRoom', recipeId);
        }
    }, [socket]);

    const emitIngredientChange = useCallback((data) => {
        if (socket) {
            socket.emit('ingredientChange', data);
        }
    }, [socket]);

    const emitStepChange = useCallback((data) => {
        if (socket) {
            socket.emit('stepChange', data);
        }
    }, [socket]);

    const emitRecipeMetaChange = useCallback((data) => {
        if (socket) {
            socket.emit('recipeMetaChange', data);
        }
    }, [socket]);

    const emitCursorUpdate = useCallback((data) => {
        if (socket) {
            socket.emit('cursorUpdate', data);
        }
    }, [socket]);

    const emitVersionSaved = useCallback((data) => {
        if (socket) {
            socket.emit('versionSaved', data);
        }
    }, [socket]);

    const value = {
        socket,
        isConnected,
        activeUsers,
        joinRoom,
        leaveRoom,
        emitIngredientChange,
        emitStepChange,
        emitRecipeMetaChange,
        emitCursorUpdate,
        emitVersionSaved
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
