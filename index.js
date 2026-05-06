const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Signaling Server Running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    // Important for Render
    allowEIO3: true,
    path: '/socket.io/'
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Jab koi room join kare (Room ID unique honi chahiye dono apps ke liye)
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // WebRTC Offer/Answer/Ice-Candidates ko relay karna
    socket.on('signal', (data) => {
        // data mein 'roomId' aur 'signalData' (SDP/ICE) hoga
        // Emit signalData directly as clients expect it
        socket.to(data.roomId).emit('signal', data.signalData);
    });

    // Control commands (Click/Swipe) ko relay karna
    socket.on('control-command', (data) => {
        socket.to(data.roomId).emit('control-command', data.command);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT =  10000;
server.listen(PORT, () => {
    console.log(`Signaling Server running on port ${PORT}`);
});