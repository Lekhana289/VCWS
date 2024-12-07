const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Use environment variables for CORS origin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL, // Frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // Frontend URL
    methods: ['GET', 'POST'],
  },
});

const roomUsers = {}; // { room: [{ nickname, id }] }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', ({ room, nickname }) => {
    if (room && nickname) {
      socket.join(room);

      if (!roomUsers[room]) roomUsers[room] = [];
      roomUsers[room].push({ nickname, id: socket.id });

      console.log(`User ${nickname} joined room: ${room}`);
      io.to(room).emit('roomMessage', `${nickname} has joined the room ${room}`);
      io.to(room).emit('updateUsers', roomUsers[room].map((user) => user.nickname));
    }
  });

  socket.on('sendMessage', ({ room, message }) => {
    if (room && message) {
      const timestamp = new Date().toLocaleTimeString();
      const user = roomUsers[room]?.find((user) => user.id === socket.id);
      const nickname = user ? user.nickname : 'Unknown User';
      io.to(room).emit('roomMessage', `[${timestamp}] ${nickname}: ${message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const room in roomUsers) {
      const userIndex = roomUsers[room].findIndex((user) => user.id === socket.id);
      if (userIndex !== -1) {
        const [removedUser] = roomUsers[room].splice(userIndex, 1);
        io.to(room).emit('roomMessage', `${removedUser.nickname} has left the room`);
        io.to(room).emit('updateUsers', roomUsers[room].map((user) => user.nickname));
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
