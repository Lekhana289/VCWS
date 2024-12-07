const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'https://vcws-frontend-dl31bd34u-lekhanas-projects-0722a45e.vercel.app', // Frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://vcws-frontend-dl31bd34u-lekhanas-projects-0722a45e.vercel.app', // Frontend URL
    methods: ['GET', 'POST'],
  },
});

const roomUsers = {}; // { room: [nicknames] }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', ({ room, nickname }) => {
    if (room && nickname) {
      socket.join(room);
      if (!roomUsers[room]) roomUsers[room] = [];
      roomUsers[room].push(nickname);

      console.log(`User ${nickname} joined room: ${room}`);
      io.to(room).emit('roomMessage', `${nickname} has joined the room ${room}`);
      io.to(room).emit('updateUsers', roomUsers[room]);
    }
  });

  socket.on('sendMessage', ({ room, message }) => {
    if (room && message) {
      const timestamp = new Date().toLocaleTimeString();
      io.to(room).emit('roomMessage', `[${timestamp}] ${message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter((user) => user !== socket.id);
      io.to(room).emit('updateUsers', roomUsers[room]);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

