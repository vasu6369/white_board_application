import React from 'react';
import { ERASER_SCALE } from '../constants';

export const CanvasArea = ({
  canvasRef,
  wrapperRef,
  textInputRef,
  tool,
  lineWidth,
  eraserCursor,
  textEditor,
  setTextEditor,
  startDrawing,
  draw,
  stopDrawing,
  leaveCanvas,
  updateEraserCursor,
  commitText,
}) => {
  return (
    <div className="canvas-wrap" ref={wrapperRef}>
      <canvas
        className={`${tool === 'eraser' ? 'eraser-active' : ''} ${
          tool === 'text' ? 'text-active' : ''
        } ${tool === 'select' ? 'select-active' : ''}`}
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerEnter={updateEraserCursor}
        onPointerMove={(event) => {
          updateEraserCursor(event);
          draw(event);
        }}
        onPointerUp={stopDrawing}
        onPointerCancel={leaveCanvas}
        onPointerLeave={leaveCanvas}
        aria-label="Drawing canvas"
      />
      {tool === 'eraser' && eraserCursor ? (
        <span
          className="eraser-cursor"
          style={{
            width: lineWidth * ERASER_SCALE,
            height: lineWidth * ERASER_SCALE,
            left: eraserCursor.x,
            top: eraserCursor.y,
          }}
        />
      ) : null}
      {textEditor ? (
        <textarea
          ref={textInputRef}
          className="text-editor"
          value={textEditor.value}
          style={{
            left: textEditor.x,
            top: textEditor.y,
            color: textEditor.color,
            fontSize: textEditor.fontSize,
          }}
          rows="1"
          aria-label="Whiteboard text"
          onChange={(event) =>
            setTextEditor((current) =>
              current ? { ...current, value: event.target.value } : current
            )
          }
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              commitText();
            }

            if (event.key === 'Escape') {
              setTextEditor(null);
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default CanvasArea;
