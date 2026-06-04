import React from 'react';
import { Copy, Wifi, WifiOff, Users, Check } from 'lucide-react';

const AVATAR_PALETTE = [
  '#f43f5e', // rose
  '#ec4899', // pink
  '#d946ef', // fuchsia
  '#a855f7', // purple
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#10b981', // emerald
  '#22c55e', // green
  '#eab308', // yellow
  '#f97316', // orange
];

const getUserColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};

export const Topbar = ({
  roomId,
  pathsLength,
  isConnected,
  users = [],
  copiedId,
  copiedLink,
  onCopyRoomId,
  onCopyRoomLink,
  onLeaveRoom,
}) => {
  const visibleUsers = users.slice(0, 4);
  const remainingCount = users.length - visibleUsers.length;

  return (
    <header className="topbar">
      <div>
        <h1>Whiteboard</h1>
        <p>
          {pathsLength} item{pathsLength === 1 ? '' : 's'} on canvas
        </p>
      </div>
      <div className="collab-panel" aria-label="Collaboration status">
        {/* Avatars Stack */}
        {users.length > 0 && (
          <div className="users-avatar-stack" style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>
            {visibleUsers.map((user, idx) => {
              const color = getUserColor(user);
              // Get first letter of username
              const initial = user.charAt(0).toUpperCase();
              return (
                <span
                  key={idx}
                  title={user}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    border: '2px solid #ffffff',
                    marginLeft: idx === 0 ? '0' : '-8px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    cursor: 'default',
                    zIndex: visibleUsers.length - idx,
                  }}
                >
                  {initial}
                </span>
              );
            })}
            {remainingCount > 0 && (
              <span
                title={`${remainingCount} more users`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#64748b',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  border: '2px solid #ffffff',
                  marginLeft: '-8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  zIndex: 0,
                }}
              >
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        <button
          className={`room-id-pill ${copiedId ? 'copied' : ''}`}
          type="button"
          onClick={onCopyRoomId}
          title="Copy room ID"
        >
          {copiedId ? (
            <>
              Copied Room ID!
              <Check size={16} />
            </>
          ) : (
            <>
              Room ID: <strong>{roomId}</strong>
              <Copy size={16} />
            </>
          )}
        </button>

        <span className={isConnected ? 'status online' : 'status offline'}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'Live' : 'Offline'}
        </span>

        <span className="status" title={users.join(', ')}>
          <Users size={16} />
          {users.length}
        </span>

        <button
          className={`copy-link ${copiedLink ? 'copied' : ''}`}
          type="button"
          onClick={onCopyRoomLink}
        >
          {copiedLink ? (
            <>
              Link Copied!
              <Check size={16} />
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy link
            </>
          )}
        </button>
        <button className="copy-link" type="button" onClick={onLeaveRoom}>
          Change room
        </button>
      </div>
    </header>
  );
};

export default Topbar;
