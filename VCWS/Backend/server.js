const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const userPoints = {}; // { socketId: points }
const userBadges = {}; // { socketId: [badges] }

const awardBadge = (socket, badge) => {
  if (!userBadges[socket.id]) userBadges[socket.id] = [];
  if (!userBadges[socket.id].includes(badge)) {
    userBadges[socket.id].push(badge);
    console.log(`Badge awarded to ${socket.id}: ${badge}`); // Debug log
    socket.emit('awardBadge', badge);
  }
};

setInterval(() => {
  for (const socketId in userPoints) {
    userPoints[socketId] = (userPoints[socketId] || 0) + 1;
    io.to(socketId).emit('updatePoints', userPoints[socketId]);
  }
}, 60000);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  userPoints[socket.id] = 0;

  socket.on('joinRoom', (room) => {
    if (room) {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
      io.to(room).emit('roomMessage', `User ${socket.id} has joined the room ${room}`);
    }
  });

  socket.on('sendMessage', ({ room, message }) => {
    if (room && io.sockets.adapter.rooms.has(room)) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] Message from ${socket.id} in room ${room}: ${message}`);
      userPoints[socket.id] = (userPoints[socket.id] || 0) + 1;

      // Award badges at milestones
      if (userPoints[socket.id] === 50) awardBadge(socket, '50 Points Badge');
      if (userPoints[socket.id] === 100) awardBadge(socket, '100 Points Badge');
      if (userPoints[socket.id] === 200) awardBadge(socket, '200 Points Badge');

      io.to(room).emit('roomMessage', `[${timestamp}] User ${socket.id}: ${message}`);
      io.to(socket.id).emit('updatePoints', userPoints[socket.id]);
    }
  });

  socket.on('getLeaderboard', () => {
    const leaderboard = Object.entries(userPoints)
      .map(([id, points]) => ({ id, points }))
      .sort((a, b) => b.points - a.points);
    socket.emit('leaderboard', leaderboard);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete userPoints[socket.id];
    delete userBadges[socket.id];
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
