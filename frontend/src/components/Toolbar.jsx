import React from 'react';
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
} from 'lucide-react';
import { COLORS } from '../constants';

export const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
  pathsLength,
  redoStackLength,
  onUndo,
  onRedo,
  onClearBoard,
  onResetView,
  onDownload,
  fillShapes,
  onToggleFill,
  showGrid,
  onToggleGrid,
  isDark,
  onToggleDark,
  fontFamily,
  setFontFamily,
}) => {
  return (
    <aside className="toolbar" aria-label="Whiteboard tools">
      <div className="tool-group">
        <button
          className={tool === 'pen' ? 'active' : ''}
          aria-label="Pen"
          title="Pen"
          onClick={() => setTool('pen')}
        >
          <Brush size={20} />
        </button>
        <button
          className={tool === 'highlighter' ? 'active' : ''}
          aria-label="Highlighter"
          title="Highlighter"
          onClick={() => setTool('highlighter')}
        >
          <Highlighter size={20} />
        </button>
        <button
          className={tool === 'eraser' ? 'active' : ''}
          aria-label="Eraser"
          title="Eraser"
          onClick={() => setTool('eraser')}
        >
          <Eraser size={20} />
        </button>
        <button
          className={tool === 'select' ? 'active' : ''}
          aria-label="Pointer"
          title="Pointer"
          onClick={() => setTool('select')}
        >
          <MousePointer2 size={20} />
        </button>
        <button
          className={tool === 'text' ? 'active' : ''}
          aria-label="Text"
          title="Text"
          onClick={() => setTool('text')}
        >
          <Type size={20} />
        </button>
      </div>

      {tool === 'text' && (
        <div className="tool-group font-selector" style={{ borderRight: '1px solid rgba(23, 32, 51, 0.1)', paddingRight: '12px' }}>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{
              height: '38px',
              padding: '0 8px',
              borderRadius: '8px',
              border: '1px solid rgba(23, 32, 51, 0.14)',
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f8fafc' : '#253047',
              fontWeight: '700',
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            <option value="Inter, system-ui, sans-serif">Sans-Serif</option>
            <option value="Georgia, serif">Serif</option>
            <option value="ui-monospace, SFMono-Regular, Consolas, monospace">Monospace</option>
            <option value="'Comic Sans MS', cursive, sans-serif">Handwritten</option>
          </select>
        </div>
      )}

      <div className="tool-group shapes" aria-label="Shapes">
        <button
          className={tool === 'line' ? 'active' : ''}
          aria-label="Line"
          title="Line"
          onClick={() => setTool('line')}
        >
          <Slash size={20} />
        </button>
        <button
          className={tool === 'rectangle' ? 'active' : ''}
          aria-label="Rectangle"
          title="Rectangle"
          onClick={() => setTool('rectangle')}
        >
          <Square size={20} />
        </button>
        <button
          className={tool === 'ellipse' ? 'active' : ''}
          aria-label="Ellipse"
          title="Ellipse"
          onClick={() => setTool('ellipse')}
        >
          <Circle size={20} />
        </button>
      </div>

      <div className="tool-group options" aria-label="Canvas Options">
        <button
          className={showGrid ? 'active' : ''}
          aria-label="Toggle Grid"
          title="Toggle Grid"
          onClick={onToggleGrid}
        >
          <Grid size={20} />
        </button>
        <button
          className={fillShapes ? 'active' : ''}
          aria-label="Fill Shapes"
          title="Fill Shapes"
          onClick={onToggleFill}
          disabled={!['rectangle', 'ellipse'].includes(tool)}
        >
          <PaintBucket size={20} />
        </button>
      </div>

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
      </div>

      <label className="slider">
        <Minus size={18} />
        <input
          type="range"
          min="2"
          max="26"
          value={lineWidth}
          onChange={(event) => setLineWidth(Number(event.target.value))}
          aria-label="Brush size"
        />
        <span>{lineWidth}</span>
      </label>

      <div className="tool-group actions">
        <button disabled={!pathsLength} aria-label="Undo" title="Undo" onClick={onUndo}>
          <Undo2 size={20} />
        </button>
        <button disabled={!redoStackLength} aria-label="Redo" title="Redo" onClick={onRedo}>
          <Redo2 size={20} />
        </button>
        <button disabled={!pathsLength} aria-label="Clear" title="Clear" onClick={onClearBoard}>
          <Trash2 size={20} />
        </button>
        <button aria-label="Reset view" title="Reset view" onClick={onResetView}>
          <RotateCcw size={20} />
        </button>
        <button aria-label="Download" title="Download" onClick={onDownload}>
          <Download size={20} />
        </button>
      </div>

      <div className="tool-group theme-toggle">
        <button
          className={isDark ? 'active' : ''}
          aria-label="Toggle Theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={onToggleDark}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default Toolbar;
