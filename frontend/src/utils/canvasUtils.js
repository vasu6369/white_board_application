import { LIGHT_BACKGROUND, DARK_BACKGROUND } from '../constants';

export const getTextBounds = (context, path) => {
  const [point] = path.points;
  const lines = path.text.split('\n');
  context.save();
  const fontFamily = path.fontFamily || 'Inter, system-ui, sans-serif';
  context.font = `${path.fontSize}px ${fontFamily}`;
  const width = Math.max(...lines.map((line) => context.measureText(line || ' ').width), 24);
  context.restore();
  return { x: point.x, y: point.y, width, height: lines.length * path.fontSize * 1.25 };
};

export const drawTextSelection = (context, path) => {
  const bounds = getTextBounds(context, path);
  context.save();
  context.strokeStyle = '#2563eb';
  context.lineWidth = 1.5;
  context.setLineDash([6, 5]);
  context.strokeRect(bounds.x - 6, bounds.y - 5, bounds.width + 12, bounds.height + 10);
  context.restore();
};

export const getImageBounds = (path) => {
  const [point] = path.points;
  return {
    x: point.x,
    y: point.y,
    width: path.imgW || 0,
    height: path.imgH || 0,
  };
};

export const getImageResizeHandle = (path) => {
  const bounds = getImageBounds(path);
  const size = 14;
  return {
    x: bounds.x + bounds.width - size / 2,
    y: bounds.y + bounds.height - size / 2,
    width: size,
    height: size,
  };
};

export const drawImageSelection = (context, path) => {
  const bounds = getImageBounds(path);
  const handle = getImageResizeHandle(path);
  context.save();
  context.strokeStyle = '#2563eb';
  context.lineWidth = 1.5;
  context.setLineDash([7, 5]);
  context.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12);
  context.setLineDash([]);
  context.fillStyle = '#ffffff';
  context.fillRect(handle.x, handle.y, handle.width, handle.height);
  context.strokeRect(handle.x, handle.y, handle.width, handle.height);
  context.restore();
};

export const drawPath = (context, path, isDark = false) => {
  if (!path?.points?.length) return;
  if (path.tool === 'sticky') return;

  const bg = isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND;
  let drawColor = path.color;
  if (isDark) {
    if (path.color === '#111827') drawColor = '#ffffff';
    if (path.color === '#ffffff') drawColor = '#1e293b';
  }

  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = path.width;
  context.strokeStyle = path.tool === 'eraser' ? bg : drawColor;

  if (path.tool === 'highlighter') context.globalAlpha = 0.35;

  if (path.tool === 'image') {
    // Draw a cached image object stored on the path
    const [point] = path.points;
    if (path._imgEl) {
      context.drawImage(path._imgEl, point.x, point.y, path.imgW, path.imgH);
    }
  } else if (path.tool === 'text') {
    const [point] = path.points;
    const lines = path.text.split('\n');
    context.fillStyle = drawColor;
    const fontFamily = path.fontFamily || 'Inter, system-ui, sans-serif';
    context.font = `${path.fontSize}px ${fontFamily}`;
    context.textBaseline = 'top';
    lines.forEach((line, index) => {
      context.fillText(line, point.x, point.y + index * path.fontSize * 1.25);
    });
  } else if (path.tool === 'line') {
    context.beginPath();
    const [start, end = start] = path.points;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  } else if (path.tool === 'rectangle') {
    context.beginPath();
    const [start, end = start] = path.points;
    context.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    if (path.fill) {
      context.save();
      context.fillStyle = drawColor;
      context.globalAlpha = 0.25;
      context.fill();
      context.restore();
    }
    context.stroke();
  } else if (path.tool === 'ellipse') {
    context.beginPath();
    const [start, end = start] = path.points;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (path.fill) {
      context.save();
      context.fillStyle = drawColor;
      context.globalAlpha = 0.25;
      context.fill();
      context.restore();
    }
    context.stroke();
  } else {
    context.beginPath();
    context.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      const cur = path.points[i];
      const prev = path.points[i - 1];
      context.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) / 2, (prev.y + cur.y) / 2);
    }
    context.stroke();
  }

  context.restore();
};

/** Hydrate image paths (attach _imgEl) after receiving from server */
export const hydrateImagePaths = (paths) => {
  return paths.map((path) => {
    if (path.tool !== 'image' || path._imgEl) return path;
    const img = new Image();
    img.onload = () => { path._imgEl = img; };
    img.src = path.imgSrc;
    return { ...path };
  });
};
