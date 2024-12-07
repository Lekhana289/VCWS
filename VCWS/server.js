const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'https://vcws-frontend-qlli7jd8g-lekhanas-projects-0722a45e.vercel.app/', // Updated Frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Welcome to the Virtual Co-Working Space Backend!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://vcws-frontend-qlli7jd8g-lekhanas-projects-0722a45e.vercel.app/', // Updated Frontend URL
    methods: ['GET', 'POST'],
  },
});

const roomUsers = {}; // { room: [{ socketId, nickname }] }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', ({ room, nickname }) => {
    if (room && nickname) {
      socket.join(room);
      if (!roomUsers[room]) roomUsers[room] = [];
      roomUsers[room].push({ socketId: socket.id, nickname });

      console.log(`User ${nickname} joined room: ${room}`);
      io.to(room).emit('roomMessage', `${nickname} has joined the room ${room}`);
      io.to(room).emit('updateUsers', roomUsers[room].map((user) => user.nickname));
    }
  });

  socket.on('sendMessage', ({ room, nickname, message }) => {
    if (room && message) {
      const timestamp = new Date().toLocaleTimeString();
      io.to(room).emit('roomMessage', `[${timestamp}] ${nickname}: ${message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter((user) => user.socketId !== socket.id);
      io.to(room).emit('updateUsers', roomUsers[room].map((user) => user.nickname));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
