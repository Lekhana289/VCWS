import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Connect to the backend server

function App() {
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [points, setPoints] = useState(0); // Track user's points
  const [leaderboard, setLeaderboard] = useState([]); // Track leaderboard
  const [badges, setBadges] = useState([]); // Track user badges
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('roomMessage', (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    socket.on('updatePoints', (newPoints) => {
      setPoints(newPoints); // Update points in real time
    });

    socket.on('leaderboard', (data) => {
      setLeaderboard(data); // Update leaderboard
    });

    socket.on('awardBadge', (badge) => {
      console.log('Badge received:', badge); // Debug log
      setBadges((prevBadges) => [...prevBadges, badge]);
    });

    socket.on('errorMessage', (errorMsg) => {
      setError(errorMsg);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomMessage');
      socket.off('updatePoints');
      socket.off('leaderboard');
      socket.off('awardBadge');
      socket.off('errorMessage');
    };
  }, []);

  const joinRoom = () => {
    if (room.trim() !== '') {
      socket.emit('joinRoom', room);
      setError(null);
    } else {
      setError('Please enter a valid room name.');
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { room, message });
      setMessage('');
    } else {
      setError('Message cannot be empty.');
    }
  };

  const fetchLeaderboard = () => {
    socket.emit('getLeaderboard');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Virtual Co-Working Space</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Enter room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Messages</h2>
        {chat.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Points</h2>
        <p>{points} points</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Leaderboard</h2>
        <button onClick={fetchLeaderboard}>Refresh Leaderboard</button>
        <ul>
          {leaderboard.map((user, index) => (
            <li key={index}>{user.id}: {user.points} points</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Badges</h2>
        <ul>
          {badges.map((badge, index) => (
            <li key={index}>{badge}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;