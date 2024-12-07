const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const FRONTEND_URL = 'https://vcws-frontend-qlli7jd8g-lekhanas-projects-0722a45e.vercel.app'; // Ensure this is accurate

// CORS middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Virtual Co-Working Space Backend!');
});

// Create HTTP and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

const roomUsers = {}; // { room: [{ socketId, nickname }] }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a room
  socket.on('joinRoom', ({ room, nickname }) => {
    if (room && nickname) {
      socket.join(room);
      if (!roomUsers[room]) roomUsers[room] = [];
      roomUsers[room].push({ socketId: socket.id, nickname });

      console.log(`User ${nickname} joined room: ${room}`);
      io.to(room).emit('roomMessage', `${nickname} has joined the room ${room}`);
      io.to(room).emit('updateUsers', roomUsers[room].map((user) => user.nickname));
    } else {
      console.log('Invalid room or nickname');
    }
  });

  // Handle sending messages
  socket.on('sendMessage', ({ room, nickname, message }) => {
    if (room && message) {
      const timestamp = new Date().toLocaleTimeString();
      io.to(room).emit('roomMessage', `[${timestamp}] ${nickname}: ${message}`);
    } else {
      console.log('Invalid room or message');
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter((user) => user.socketId !== socket.id);
      io.to(room).emit('updateUsers', roomUsers[room].map((user) => user.nickname));
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
