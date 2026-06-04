import { useCallback, useEffect, useRef, useState } from 'react';
import { LIGHT_BACKGROUND, DARK_BACKGROUND, ERASER_SCALE, SHAPE_TOOLS } from '../constants';
import { drawPath, drawTextSelection, getTextBounds } from '../utils/canvasUtils';

export const useCanvas = ({
  tool,
  color,
  lineWidth,
  fillShapes,
  showGrid,
  isDark,
  fontFamily,
  paths,
  setPaths,
  redoStack,
  setRedoStack,
  selectedId,
  setSelectedId,
  textEditor,
  setTextEditor,
  emitPathAdd,
  emitPathUpdate,
}) => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const textInputRef = useRef(null);
  const drawingRef = useRef(false);
  const currentPathRef = useRef(null);
  const dragRef = useRef(null);
  const [eraserCursor, setEraserCursor] = useState(null);

  const fontSize = Math.max(18, lineWidth * 3 + 8);

  const redraw = useCallback(
    (drawPaths = paths) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      const bg = isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND;
      context.fillStyle = bg;
      context.fillRect(0, 0, rect.width, rect.height);

      if (showGrid) {
        context.save();
        context.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(23, 32, 51, 0.05)';
        context.lineWidth = 1;
        context.beginPath();
        const gridGap = 30;
        for (let x = 0; x < rect.width; x += gridGap) {
          context.moveTo(x, 0);
          context.lineTo(x, rect.height);
        }
        for (let y = 0; y < rect.height; y += gridGap) {
          context.moveTo(0, y);
          context.lineTo(rect.width, y);
        }
        context.stroke();
        context.restore();
      }

      drawPaths.forEach((path) => drawPath(context, path, isDark));
      const selectedPath = drawPaths.find((path) => path.id === selectedId && path.tool === 'text');
      if (selectedPath) drawTextSelection(context, selectedPath);
    },
    [paths, selectedId, showGrid, isDark]
  );

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;

      if (!canvas || !wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.setTransform(scale, 0, 0, scale, 0, 0);
      redraw(paths);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [paths, redraw]);

  const getPoint = (event) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const updateEraserCursor = (event) => {
    if (tool !== 'eraser') return;
    setEraserCursor(getPoint(event));
  };

  const findTextAtPoint = useCallback(
    (point) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const context = canvas.getContext('2d');
      if (!context) return null;

      for (let index = paths.length - 1; index >= 0; index -= 1) {
        const path = paths[index];
        if (path.tool !== 'text') continue;

        const bounds = getTextBounds(context, path);
        const inside =
          point.x >= bounds.x - 8 &&
          point.x <= bounds.x + bounds.width + 8 &&
          point.y >= bounds.y - 8 &&
          point.y <= bounds.y + bounds.height + 8;

        if (inside) return path;
      }

      return null;
    },
    [paths]
  );

  const commitText = useCallback(() => {
    if (!textEditor) return;

    const text = textEditor.value.trim();
    setTextEditor(null);

    if (!text) return;

    const textPath = {
      id: crypto.randomUUID(),
      tool: 'text',
      color: textEditor.color,
      width: lineWidth,
      fontSize: textEditor.fontSize,
      text,
      fontFamily: textEditor.fontFamily,
      points: [{ x: textEditor.x, y: textEditor.y }],
    };

    setPaths((current) => [
      ...current,
      textPath,
    ]);
    setRedoStack([]);
    emitPathAdd(textPath);
  }, [emitPathAdd, lineWidth, textEditor, setPaths, setRedoStack]);

  useEffect(() => {
    if (!textEditor || !textInputRef.current) return;
    textInputRef.current.focus();
  }, [textEditor]);

  const startDrawing = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = getPoint(event);

    if (tool === 'select') {
      commitText();
      const selectedText = findTextAtPoint(point);
      setSelectedId(selectedText?.id ?? null);

      if (selectedText) {
        dragRef.current = {
          id: selectedText.id,
          offsetX: point.x - selectedText.points[0].x,
          offsetY: point.y - selectedText.points[0].y,
        };
      }

      return;
    }

    setSelectedId(null);

    if (tool === 'text') {
      commitText();
      setTextEditor({
        x: point.x,
        y: point.y,
        value: '',
        color,
        fontSize,
        fontFamily,
      });
      return;
    }

    const pathWidth = tool === 'eraser' ? lineWidth * ERASER_SCALE : lineWidth;
    drawingRef.current = true;
    currentPathRef.current = {
      id: crypto.randomUUID(),
      tool,
      color,
      width: pathWidth,
      points: [point],
      fill: ['rectangle', 'ellipse'].includes(tool) && fillShapes,
    };
  };

  const draw = (event) => {
    if (dragRef.current) {
      event.preventDefault();
      const point = getPoint(event);
      const { id, offsetX, offsetY } = dragRef.current;
      let updatedPath = null;

      setPaths((current) =>
        current.map((path) => {
          if (path.id !== id) return path;

          updatedPath = { ...path, points: [{ x: point.x - offsetX, y: point.y - offsetY }] };
          return updatedPath;
        })
      );
      setRedoStack([]);
      if (updatedPath) emitPathUpdate(updatedPath);
      return;
    }

    if (!drawingRef.current || !currentPathRef.current) return;

    event.preventDefault();
    updateEraserCursor(event);
    const context = canvasRef.current.getContext('2d');
    const point = getPoint(event);
    currentPathRef.current.points = SHAPE_TOOLS.includes(currentPathRef.current.tool)
      ? [currentPathRef.current.points[0], point]
      : [...currentPathRef.current.points, point];
    redraw([...paths, currentPathRef.current]);
    drawPath(context, currentPathRef.current, isDark);
  };

  const stopDrawing = () => {
    if (dragRef.current) {
      dragRef.current = null;
      return;
    }

    if (!drawingRef.current || !currentPathRef.current) return;

    const finishedPath = currentPathRef.current;
    drawingRef.current = false;
    currentPathRef.current = null;
    setPaths((current) => [...current, finishedPath]);
    setRedoStack([]);
    emitPathAdd(finishedPath);
  };

  const leaveCanvas = () => {
    setEraserCursor(null);
    if (!dragRef.current) stopDrawing();
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    redraw(paths);
  }, [paths, redraw]);

  return {
    canvasRef,
    wrapperRef,
    textInputRef,
    eraserCursor,
    startDrawing,
    draw,
    stopDrawing,
    leaveCanvas,
    updateEraserCursor,
    downloadBoard,
    commitText,
    redraw,
  };
};
