import React, { useState } from 'react';
import { Copy, Wifi, WifiOff, Users, Check } from 'lucide-react';

const AVATAR_PALETTE = [
  '#f43f5e','#ec4899','#d946ef','#a855f7','#6366f1',
  '#3b82f6','#0ea5e9','#06b6d4','#14b8a6','#10b981',
  '#22c55e','#eab308','#f97316',
];

const getUserColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const TYPE_LABELS = {
  pen: 'Pen strokes', highlighter: 'Highlights', eraser: 'Eraser strokes',
  line: 'Lines', rectangle: 'Rectangles', ellipse: 'Ellipses',
  text: 'Text blocks', image: 'Images', sticky: 'Sticky notes',
};

export const Topbar = ({
  roomId, pathsLength, isConnected, users = [], stickyCount = 0,
  copiedId, copiedLink, onCopyRoomId, onCopyRoomLink, onLeaveRoom, onShowShortcuts, paths = [],
}) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const visibleUsers  = users.slice(0, 4);
  const remainingCount = users.length - visibleUsers.length;

  // Build stats breakdown
  const typeCounts = {};
  paths.forEach((p) => { typeCounts[p.tool] = (typeCounts[p.tool] || 0) + 1; });
  if (stickyCount > 0) typeCounts['sticky'] = stickyCount;
  const statsEntries = Object.entries(typeCounts);

  return (
    <header className="topbar">
      <div>
        <h1>Whiteboard</h1>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <p
            className="stats-trigger"
            onMouseEnter={() => setStatsOpen(true)}
            onMouseLeave={() => setStatsOpen(false)}
            style={{ cursor: statsEntries.length ? 'help' : 'default' }}
          >
            {pathsLength + stickyCount} item{pathsLength + stickyCount === 1 ? '' : 's'} on canvas
            {statsEntries.length > 0 && <span style={{ marginLeft: 4, fontSize: '0.75rem', opacity: 0.6 }}>▾</span>}
          </p>
          {statsOpen && statsEntries.length > 0 && (
            <div className="stats-panel">
              {statsEntries.map(([type, count]) => (
                <div key={type} className="stats-row">
                  <span className="stats-type">{TYPE_LABELS[type] || type}</span>
                  <span className="stats-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="shortcut-hint" type="button" onClick={onShowShortcuts}>
          Press <kbd>?</kbd> for shortcuts
        </button>
      </div>

      <div className="collab-panel" aria-label="Collaboration status">
        {/* Avatar stack */}
        {users.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
            {visibleUsers.map((user, idx) => (
              <span key={idx} title={user} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: getUserColor(user), color: '#fff',
                fontWeight: 800, fontSize: '0.82rem',
                border: '2px solid #fff', marginLeft: idx === 0 ? 0 : -8,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: visibleUsers.length - idx,
              }}>
                {user.charAt(0).toUpperCase()}
              </span>
            ))}
            {remainingCount > 0 && (
              <span title={`${remainingCount} more`} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: '#64748b', color: '#fff',
                fontWeight: 800, fontSize: '0.78rem',
                border: '2px solid #fff', marginLeft: -8,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}>+{remainingCount}</span>
            )}
          </div>
        )}

        <button className={`room-id-pill ${copiedId ? 'copied' : ''}`} type="button" onClick={onCopyRoomId} title="Copy room ID">
          {copiedId ? (<>Copied Room ID! <Check size={16} /></>) : (<>Room ID: <strong>{roomId}</strong><Copy size={16} /></>)}
        </button>

        <span className={isConnected ? 'status online' : 'status offline'}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'Live' : 'Offline'}
        </span>

        <span className="status" title={users.join(', ')}>
          <Users size={16} />{users.length}
        </span>

        <button className={`copy-link ${copiedLink ? 'copied' : ''}`} type="button" onClick={onCopyRoomLink}>
          {copiedLink ? (<>Link Copied! <Check size={16} /></>) : (<><Copy size={16} />Copy link</>)}
        </button>

        <button className="copy-link" type="button" onClick={onLeaveRoom}>Change room</button>
      </div>
    </header>
  );
};

export default Topbar;
