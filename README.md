# TasteLab

Real-time collaborative recipe editing platform built with the MERN stack.

## Features

- 🔐 **JWT Authentication** - Secure login and registration
- 👥 **Real-Time Collaboration** - Edit recipes together with Socket.IO
- 📜 **Version Control** - Save, compare, and restore recipe versions
- 🎨 **Premium Design** - Modern UI with animations and glassmorphism
- 📱 **Responsive** - Works on desktop and mobile

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install-all

# Or install separately
npm install
cd server && npm install
cd ../client && npm install
```

### Configure MongoDB

Edit `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/tastelab
# or for Atlas:
MONGODB_URI=mongodb+srv://your-connection-string
```

### Run Development Servers

```bash
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Project Structure

```
TasteLab/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── styles/
├── server/          # Express + Socket.IO backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── socket/
└── package.json
```

## Tech Stack

- **Frontend**: React, Vite, Socket.IO Client, React Router
- **Backend**: Node.js, Express, Socket.IO, JWT
- **Database**: MongoDB with Mongoose
- **Styling**: Vanilla CSS with design tokens

## License

MIT
