import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';

const validateRoomId = (id) => {
  const trimmed = id.trim();
  if (trimmed.length < 3) {
    return 'Room ID must be at least 3 characters long.';
  }
  if (trimmed.length > 24) {
    return 'Room ID must be 24 characters or less.';
  }
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(trimmed)) {
    return 'Room ID can only contain letters, numbers, dashes, and underscores (no spaces or symbols).';
  }
  return null;
};

const validateUsername = (name) => {
  const trimmed = name.trim();
  if (trimmed.length > 20) {
    return 'Name must be 20 characters or less.';
  }
  return null;
};

export const RoomEntry = ({ onJoinRoom, onCreateRoom, initialRoomInput = '' }) => {
  const [roomInput, setRoomInput] = useState(initialRoomInput);
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState(() => {
    if (initialRoomInput) {
      return validateRoomId(initialRoomInput);
    }
    return '';
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const roomErr = validateRoomId(roomInput);
    if (roomErr) {
      setError(roomErr);
      return;
    }

    const userErr = validateUsername(usernameInput);
    if (userErr) {
      setError(userErr);
      return;
    }

    onJoinRoom(roomInput.trim(), usernameInput.trim());
  };

  const handleCreate = () => {
    setError('');
    const userErr = validateUsername(usernameInput);
    if (userErr) {
      setError(userErr);
      return;
    }
    onCreateRoom(usernameInput.trim());
  };

  return (
    <main className="room-entry">
      <section className="room-entry-panel">
        <div>
          <h1>Whiteboard</h1>
          <p>Create a shared room or join an existing one with its room ID.</p>
        </div>

        {error && (
          <div className="room-error-alert" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(254, 242, 242, 0.95)',
            color: '#b91c1c',
            fontSize: '0.84rem',
            fontWeight: '700',
            lineHeight: '1.35',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="room-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '8px', marginBottom: '8px' }}>
            <label htmlFor="username" style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 700 }}>
              Your Name
            </label>
            <input
              id="username"
              value={usernameInput}
              placeholder="e.g. Alex"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0 12px',
                border: '1px solid rgba(23, 32, 51, 0.14)',
                borderRadius: '8px',
                color: '#172033',
                background: '#ffffff',
              }}
              onChange={(event) => setUsernameInput(event.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label htmlFor="room-id" style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 700 }}>
              Room ID
            </label>
            <div className="room-field">
              <input
                id="room-id"
                value={roomInput}
                placeholder="team-board"
                onChange={(event) => setRoomInput(event.target.value)}
              />
              <button type="submit">
                <LogIn size={18} />
                Join
              </button>
            </div>
          </div>
        </form>

        <button className="create-room" type="button" onClick={handleCreate}>
          Create new room
        </button>
      </section>
    </main>
  );
};

export default RoomEntry;
