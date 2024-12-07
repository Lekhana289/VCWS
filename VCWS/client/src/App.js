import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// WebSocket URL pointing to the Render backend
const socket = io('https://vcws-backend.onrender.com');

function App() {
  const [room, setRoom] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
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

    socket.on('updateUsers', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomMessage');
      socket.off('updateUsers');
    };
  }, []);

  const joinRoom = () => {
    if (room.trim() !== '' && nickname.trim() !== '') {
      socket.emit('joinRoom', { room, nickname });
      setError(null);
    } else {
      setError('Please enter both a valid room name and a nickname.');
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { room, nickname, message });
      setMessage('');
      setError(null);
    } else {
      setError('Message cannot be empty.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Virtual Co-Working Space</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
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
        <h2>Users in Room</h2>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
