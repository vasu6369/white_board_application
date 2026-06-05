import { useCallback, useEffect, useRef, useState } from 'react';
import { LIGHT_BACKGROUND, DARK_BACKGROUND, ERASER_SCALE, SHAPE_TOOLS } from '../constants';
import {
  drawImageSelection,
  drawPath,
  drawTextSelection,
  getImageBounds,
  getImageResizeHandle,
  getTextBounds,
} from '../utils/canvasUtils';

export const useCanvas = ({
  tool, color, lineWidth, fillShapes, showGrid, isDark, fontFamily,
  paths, setPaths, redoStack, setRedoStack,
  selectedId, setSelectedId, textEditor, setTextEditor,
  emitPathAdd, emitPathUpdate,
}) => {
  const canvasRef    = useRef(null);
  const wrapperRef   = useRef(null);
  const textInputRef = useRef(null);
  const drawingRef      = useRef(false);
  const currentPathRef  = useRef(null);
  const dragRef         = useRef(null);
  const [eraserCursor, setEraserCursor] = useState(null);

  const fontSize = Math.max(18, lineWidth * 3 + 8);

  /* ── Redraw ─────────────────────────────────────────────────────── */
  const redraw = useCallback((drawPaths = paths) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND;
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,32,51,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gap = 30;
      for (let x = 0; x < rect.width; x += gap) { ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); }
      for (let y = 0; y < rect.height; y += gap) { ctx.moveTo(0, y); ctx.lineTo(rect.width, y); }
      ctx.stroke();
      ctx.restore();
    }

    drawPaths.forEach((p) => drawPath(ctx, p, isDark));
    const sel = drawPaths.find((p) => p.id === selectedId);
    if (sel?.tool === 'text') drawTextSelection(ctx, sel);
    if (sel?.tool === 'image') drawImageSelection(ctx, sel);
  }, [paths, selectedId, showGrid, isDark]);

  /* ── Resize ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width  = Math.max(1, Math.floor(rect.width  * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      canvas.style.width  = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.setTransform(scale, 0, 0, scale, 0, 0); redraw(paths); }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [paths, redraw]);

  useEffect(() => { redraw(paths); }, [paths, redraw]);

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const getPoint = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const updateEraserCursor = (e) => { if (tool === 'eraser') setEraserCursor(getPoint(e)); };

  const findTextAtPoint = useCallback((point) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (p.tool !== 'text') continue;
      const b = getTextBounds(ctx, p);
      if (point.x >= b.x - 8 && point.x <= b.x + b.width + 8 &&
          point.y >= b.y - 8 && point.y <= b.y + b.height + 8) return p;
    }
    return null;
  }, [paths]);

  const findImageAtPoint = useCallback((point) => {
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (p.tool !== 'image') continue;
      const b = getImageBounds(p);
      if (point.x >= b.x - 8 && point.x <= b.x + b.width + 8 &&
          point.y >= b.y - 8 && point.y <= b.y + b.height + 8) return p;
    }
    return null;
  }, [paths]);

  const findImageResizeHandleAtPoint = useCallback((point) => {
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (p.tool !== 'image') continue;
      const h = getImageResizeHandle(p);
      if (point.x >= h.x - 6 && point.x <= h.x + h.width + 6 &&
          point.y >= h.y - 6 && point.y <= h.y + h.height + 6) return p;
    }
    return null;
  }, [paths]);

  const commitText = useCallback(() => {
    if (!textEditor) return;
    const text = textEditor.value.trim();
    setTextEditor(null);
    if (!text) return;
    const textPath = {
      id: crypto.randomUUID(), tool: 'text', color: textEditor.color,
      width: lineWidth, fontSize: textEditor.fontSize,
      text, fontFamily: textEditor.fontFamily,
      points: [{ x: textEditor.x, y: textEditor.y }],
    };
    setPaths((c) => [...c, textPath]);
    setRedoStack([]);
    emitPathAdd(textPath);
  }, [emitPathAdd, lineWidth, textEditor, setPaths, setRedoStack]);

  useEffect(() => { if (textEditor && textInputRef.current) textInputRef.current.focus(); }, [textEditor]);

  /* ── Image helpers ───────────────────────────────────────────────── */
  const addImageToCanvas = useCallback((dataUrl) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect  = canvas.getBoundingClientRect();
      const scale = Math.min(1, Math.min(rect.width * 0.7 / img.width, rect.height * 0.7 / img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const x = Math.round((rect.width  - w) / 2);
      const y = Math.round((rect.height - h) / 2);
      const imgPath = {
        id: crypto.randomUUID(), tool: 'image',
        imgSrc: dataUrl, imgW: w, imgH: h, _imgEl: img,
        aspectRatio: w / h,
        points: [{ x, y }], color, width: 1,
      };
      setPaths((c) => [...c, imgPath]);
      setRedoStack([]);
      emitPathAdd({ ...imgPath, _imgEl: undefined }); // don't send DOM object
    };
    img.src = dataUrl;
  }, [color, setPaths, setRedoStack, emitPathAdd]);

  const handleImageUpload = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => addImageToCanvas(e.target.result);
    reader.readAsDataURL(file);
  }, [addImageToCanvas]);

  /* ── Pointer events ──────────────────────────────────────────────── */
  const startDrawing = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const point = getPoint(e);

    if (tool === 'select') {
      commitText();
      const resizeImage = findImageResizeHandleAtPoint(point);
      const sel = findTextAtPoint(point) || resizeImage || findImageAtPoint(point);
      setSelectedId(sel?.id ?? null);
      if (resizeImage) {
        dragRef.current = {
          id: resizeImage.id,
          mode: 'resize-image',
          startX: resizeImage.points[0].x,
          startY: resizeImage.points[0].y,
          aspectRatio: resizeImage.aspectRatio || resizeImage.imgW / resizeImage.imgH || 1,
        };
      } else if (sel) {
        dragRef.current = {
          id: sel.id,
          mode: 'move',
          offsetX: point.x - sel.points[0].x,
          offsetY: point.y - sel.points[0].y,
        };
      }
      return;
    }

    setSelectedId(null);

    if (tool === 'text') {
      commitText();
      setTextEditor({ x: point.x, y: point.y, value: '', color, fontSize, fontFamily });
      return;
    }

    if (tool === 'sticky') {
      const stickyPath = {
        id: crypto.randomUUID(),
        tool: 'sticky',
        color,
        width: 1,
        text: '',
        colorIndex: 0,
        points: [{ x: point.x, y: point.y }],
      };
      setPaths((current) => [...current, stickyPath]);
      setRedoStack([]);
      emitPathAdd(stickyPath);
      return;
    }

    const pathWidth = tool === 'eraser' ? lineWidth * ERASER_SCALE : lineWidth;
    drawingRef.current = true;
    currentPathRef.current = {
      id: crypto.randomUUID(), tool, color, width: pathWidth, points: [point],
      fill: ['rectangle', 'ellipse'].includes(tool) && fillShapes,
    };
  };

  const draw = (e) => {
    if (dragRef.current) {
      e.preventDefault();
      const point = getPoint(e);
      const { id, offsetX, offsetY, mode, startX, startY, aspectRatio } = dragRef.current;
      let updated = null;
      setPaths((c) => c.map((p) => {
        if (p.id !== id) return p;
        if (mode === 'resize-image' && p.tool === 'image') {
          const width = Math.max(48, point.x - startX);
          const height = Math.max(36, width / aspectRatio);
          updated = { ...p, imgW: Math.round(width), imgH: Math.round(height), aspectRatio };
        } else {
          updated = { ...p, points: [{ x: point.x - offsetX, y: point.y - offsetY }] };
        }
        return updated;
      }));
      setRedoStack([]);
      if (updated) emitPathUpdate(updated);
      return;
    }
    if (!drawingRef.current || !currentPathRef.current) return;
    e.preventDefault();
    updateEraserCursor(e);
    const ctx   = canvasRef.current.getContext('2d');
    const point = getPoint(e);
    currentPathRef.current.points = SHAPE_TOOLS.includes(currentPathRef.current.tool)
      ? [currentPathRef.current.points[0], point]
      : [...currentPathRef.current.points, point];
    redraw([...paths, currentPathRef.current]);
    drawPath(ctx, currentPathRef.current, isDark);
  };

  const stopDrawing = () => {
    if (dragRef.current) { dragRef.current = null; return; }
    if (!drawingRef.current || !currentPathRef.current) return;
    const finished = currentPathRef.current;
    drawingRef.current = false;
    currentPathRef.current = null;
    setPaths((c) => [...c, finished]);
    setRedoStack([]);
    emitPathAdd(finished);
  };

  const leaveCanvas = () => {
    setEraserCursor(null);
    if (!dragRef.current) stopDrawing();
  };

  const downloadBoard = () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return {
    canvasRef, wrapperRef, textInputRef, eraserCursor,
    startDrawing, draw, stopDrawing, leaveCanvas,
    updateEraserCursor, downloadBoard, commitText, redraw,
    handleImageUpload, addImageToCanvas,
  };
};
