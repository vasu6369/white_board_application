import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['P'], action: 'Pen tool' },
  { keys: ['H'], action: 'Highlighter tool' },
  { keys: ['E'], action: 'Eraser tool' },
  { keys: ['S'], action: 'Select / Move tool' },
  { keys: ['T'], action: 'Text tool' },
  { keys: ['R'], action: 'Rectangle tool' },
  { keys: ['O'], action: 'Ellipse tool' },
  { keys: ['L'], action: 'Line tool' },
  { keys: ['G'], action: 'Toggle grid' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Y'], action: 'Redo' },
  { keys: ['Ctrl', 'D'], action: 'Download board' },
  { keys: ['Ctrl', 'V'], action: 'Paste image' },
  { keys: ['?'], action: 'Show this dialog' },
  { keys: ['Esc'], action: 'Close this dialog' },
];

export const ShortcutsModal = ({ onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <span className="shortcuts-modal-title">
            <Keyboard size={20} />
            Keyboard Shortcuts
          </span>
          <button className="shortcuts-close-btn" onClick={onClose} aria-label="Close shortcuts">
            <X size={20} />
          </button>
        </div>
        <div className="shortcuts-grid">
          {SHORTCUTS.map(({ keys, action }) => (
            <div key={action} className="shortcut-row">
              <span className="shortcut-action">{action}</span>
              <span className="shortcut-keys">
                {keys.map((k, i) => (
                  <React.Fragment key={k}>
                    <kbd className="kbd">{k}</kbd>
                    {i < keys.length - 1 && <span className="shortcut-plus">+</span>}
                  </React.Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
