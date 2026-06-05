import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';

const NOTE_COLORS = [
  { bg: '#fef08a', border: '#eab308', text: '#713f12' }, // yellow
  { bg: '#bbf7d0', border: '#22c55e', text: '#14532d' }, // green
  { bg: '#bfdbfe', border: '#3b82f6', text: '#1e3a8a' }, // blue
  { bg: '#fecaca', border: '#ef4444', text: '#7f1d1d' }, // red
  { bg: '#e9d5ff', border: '#a855f7', text: '#4a044e' }, // purple
  { bg: '#fed7aa', border: '#f97316', text: '#7c2d12' }, // orange
];

export const StickyNote = ({ note, onUpdate, onDelete, isDark }) => {
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const noteRef = useRef(null);
  const textareaRef = useRef(null);
  const scheme = NOTE_COLORS[note.colorIndex ?? 0];

  useEffect(() => {
    setText(note.text);
  }, [note.text]);

  const handleDragStart = (e) => {
    if (e.target.closest('textarea') || e.target.closest('button')) return;
    e.preventDefault();
    const rect = noteRef.current.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const container = noteRef.current.parentElement.getBoundingClientRect();
      const x = e.clientX - container.left - dragOffsetRef.current.x;
      const y = e.clientY - container.top - dragOffsetRef.current.y;
      onUpdate({ ...note, x, y });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, note, onUpdate]);

  useEffect(() => {
    if (editing && textareaRef.current) textareaRef.current.focus();
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    onUpdate({ ...note, text });
  };

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${dragging ? 'dragging' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        background: scheme.bg,
        border: `1.5px solid ${scheme.border}`,
        color: scheme.text,
      }}
      onPointerDown={handleDragStart}
    >
      <div className="sticky-note-header">
        <GripHorizontal size={14} style={{ opacity: 0.5 }} />
        <div className="sticky-note-color-dots">
          {NOTE_COLORS.map((c, i) => (
            <button
              key={i}
              className="sticky-dot"
              style={{ background: c.bg, border: `1.5px solid ${c.border}`, outline: note.colorIndex === i ? `2px solid ${c.border}` : 'none' }}
              onClick={() => onUpdate({ ...note, colorIndex: i })}
              title={`Change color`}
            />
          ))}
        </div>
        <button className="sticky-delete-btn" onClick={() => onDelete(note.id)} title="Delete note">
          <X size={13} />
        </button>
      </div>
      {editing ? (
        <textarea
          ref={textareaRef}
          className="sticky-textarea"
          style={{ color: scheme.text, background: scheme.bg }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          rows={4}
        />
      ) : (
        <div
          className="sticky-body"
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {text || <span style={{ opacity: 0.45 }}>Click to write…</span>}
        </div>
      )}
    </div>
  );
};

export { NOTE_COLORS };
export default StickyNote;
