import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1 className="display-4">Virtual Co-Working Space</h1>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Room and Nickname Section */}
      <div className="row mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={joinRoom}>
            Join Room
          </button>
        </div>
      </div>

      {/* Message Section */}
      <div className="row mb-3">
        <div className="col-md-10">
          <input
            type="text"
            className="form-control"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-success w-100" onClick={sendMessage}>
            Send Message
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5>Messages</h5>
            </div>
            <div className="card-body">
              {chat.length > 0 ? (
                chat.map((msg, index) => (
                  <p key={index} className="mb-1">
                    {msg}
                  </p>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Users in Room */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5>Users in Room</h5>
            </div>
            <div className="card-body">
              {users.length > 0 ? (
                <ul className="list-group">
                  {users.map((user, index) => (
                    <li key={index} className="list-group-item">
                      {user}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No users in the room.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
