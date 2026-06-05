import React, { useRef } from 'react';
import {
  Brush,
  Circle,
  Download,
  Eraser,
  Minus,
  MousePointer2,
  Palette,
  Redo2,
  RotateCcw,
  Slash,
  Square,
  Trash2,
  Type,
  Undo2,
  Grid,
  PaintBucket,
  Highlighter,
  Sun,
  Moon,
  Keyboard,
  StickyNote,
  ImagePlus,
} from 'lucide-react';
import { COLORS } from '../constants';

export const Toolbar = ({
  tool, setTool,
  color, setColor,
  lineWidth, setLineWidth,
  pathsLength, redoStackLength,
  onUndo, onRedo, onClearBoard, onResetView, onDownload,
  fillShapes, onToggleFill,
  showGrid, onToggleGrid,
  isDark, onToggleDark,
  fontFamily, setFontFamily,
  onShowShortcuts,
  onImageUpload,
}) => {
  const fileInputRef = useRef(null);

  return (
    <aside className="toolbar" aria-label="Whiteboard tools">
      {/* ── Drawing Tools ── */}
      <div className="tool-group">
        <button className={tool === 'pen'         ? 'active' : ''} title="Pen (P)"         onClick={() => setTool('pen')}><Brush size={20} /></button>
        <button className={tool === 'highlighter' ? 'active' : ''} title="Highlighter (H)" onClick={() => setTool('highlighter')}><Highlighter size={20} /></button>
        <button className={tool === 'eraser'      ? 'active' : ''} title="Eraser (E)"      onClick={() => setTool('eraser')}><Eraser size={20} /></button>
        <button className={tool === 'select'      ? 'active' : ''} title="Select (S)"      onClick={() => setTool('select')}><MousePointer2 size={20} /></button>
        <button className={tool === 'text'        ? 'active' : ''} title="Text (T)"        onClick={() => setTool('text')}><Type size={20} /></button>
        <button className={tool === 'sticky'      ? 'active' : ''} title="Sticky Note"     onClick={() => setTool('sticky')}><StickyNote size={20} /></button>
      </div>

      {/* ── Font Picker (text tool only) ── */}
      {tool === 'text' && (
        <div className="tool-group font-selector" style={{ borderRight: '1px solid rgba(23,32,51,0.1)', paddingRight: '12px' }}>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{
              height: '38px', padding: '0 8px', borderRadius: '8px',
              border: '1px solid rgba(23,32,51,0.14)',
              background: isDark ? '#1e293b' : '#ffffff',
              color:      isDark ? '#f8fafc' : '#253047',
              fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer',
            }}
          >
            <option value="Inter, system-ui, sans-serif">Sans-Serif</option>
            <option value="Georgia, serif">Serif</option>
            <option value="ui-monospace, SFMono-Regular, Consolas, monospace">Monospace</option>
            <option value="'Comic Sans MS', cursive, sans-serif">Handwritten</option>
          </select>
        </div>
      )}

      {/* ── Shapes ── */}
      <div className="tool-group shapes">
        <button className={tool === 'line'      ? 'active' : ''} title="Line (L)"      onClick={() => setTool('line')}><Slash size={20} /></button>
        <button className={tool === 'rectangle' ? 'active' : ''} title="Rectangle (R)" onClick={() => setTool('rectangle')}><Square size={20} /></button>
        <button className={tool === 'ellipse'   ? 'active' : ''} title="Ellipse (O)"   onClick={() => setTool('ellipse')}><Circle size={20} /></button>
      </div>

      {/* ── Canvas Options ── */}
      <div className="tool-group options">
        <button className={showGrid   ? 'active' : ''} title="Toggle Grid (G)"  onClick={onToggleGrid}><Grid size={20} /></button>
        <button
          className={fillShapes ? 'active' : ''}
          title="Fill Shapes"
          onClick={onToggleFill}
          disabled={!['rectangle', 'ellipse'].includes(tool)}
        >
          <PaintBucket size={20} />
        </button>
      </div>

      {/* ── Color Palette + Custom Picker ── */}
      <div className="tool-group colors" aria-label="Colors">
        <Palette size={18} />
        {COLORS.map((option) => (
          <button
            key={option}
            className={color === option ? 'swatch active-swatch' : 'swatch'}
            style={{ backgroundColor: option }}
            aria-label={`Use ${option}`}
            title={option}
            onClick={() => {
              setColor(option);
              if (tool === 'eraser' || tool === 'select') setTool('pen');
            }}
          />
        ))}
        {/* Custom color picker */}
        <label className="swatch custom-color-swatch" title="Custom color" style={{ backgroundColor: color, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', textShadow: '0 0 3px #0006', pointerEvents: 'none' }}>+</span>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              if (tool === 'eraser' || tool === 'select') setTool('pen');
            }}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          />
        </label>
      </div>

      {/* ── Brush Size ── */}
      <label className="slider">
        <Minus size={18} />
        <input type="range" min="2" max="26" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} aria-label="Brush size" />
        <span>{lineWidth}</span>
      </label>

      {/* ── Image Upload ── */}
      <div className="tool-group actions">
        <button title="Upload image (Ctrl+V to paste)" onClick={() => fileInputRef.current?.click()}><ImagePlus size={20} /></button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { onImageUpload(e.target.files[0]); e.target.value = ''; }} />
      </div>

      {/* ── History / Actions ── */}
      <div className="tool-group actions">
        <button disabled={!pathsLength}    title="Undo (Ctrl+Z)"   onClick={onUndo}><Undo2 size={20} /></button>
        <button disabled={!redoStackLength} title="Redo (Ctrl+Y)"  onClick={onRedo}><Redo2 size={20} /></button>
        <button disabled={!pathsLength}    title="Clear board"     onClick={onClearBoard}><Trash2 size={20} /></button>
        <button                            title="Reset view"       onClick={onResetView}><RotateCcw size={20} /></button>
        <button                            title="Download (Ctrl+D)" onClick={onDownload}><Download size={20} /></button>
      </div>

      {/* ── Theme + Shortcuts ── */}
      <div className="tool-group theme-toggle">
        <button className={isDark ? 'active' : ''} title={isDark ? 'Light mode' : 'Dark mode'} onClick={onToggleDark}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button title="Keyboard shortcuts (?)" onClick={onShowShortcuts}><Keyboard size={20} /></button>
      </div>
    </aside>
  );
};

export default Toolbar;
