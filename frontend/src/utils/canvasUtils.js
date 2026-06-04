import { LIGHT_BACKGROUND, DARK_BACKGROUND } from '../constants';

export const getTextBounds = (context, path) => {
  const [point] = path.points;
  const lines = path.text.split('\n');
  context.save();
  const fontFamily = path.fontFamily || 'Inter, system-ui, sans-serif';
  context.font = `${path.fontSize}px ${fontFamily}`;
  const width = Math.max(...lines.map((line) => context.measureText(line || ' ').width), 24);
  context.restore();

  return {
    x: point.x,
    y: point.y,
    width,
    height: lines.length * path.fontSize * 1.25,
  };
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

export const drawPath = (context, path, isDark = false) => {
  if (!path?.points?.length) return;

  const bg = isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND;
  
  // High-contrast color adjustments for dark mode
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

  // Highlighter transparency
  if (path.tool === 'highlighter') {
    context.globalAlpha = 0.35;
  }

  if (path.tool === 'text') {
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
      context.globalAlpha = path.tool === 'highlighter' ? 0.15 : 0.25;
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
      context.globalAlpha = path.tool === 'highlighter' ? 0.15 : 0.25;
      context.fill();
      context.restore();
    }
    context.stroke();
  } else {
    // pen or highlighter
    context.beginPath();
    context.moveTo(path.points[0].x, path.points[0].y);

    for (let index = 1; index < path.points.length; index += 1) {
      const current = path.points[index];
      const previous = path.points[index - 1];
      const midX = (previous.x + current.x) / 2;
      const midY = (previous.y + current.y) / 2;
      context.quadraticCurveTo(previous.x, previous.y, midX, midY);
    }
    context.stroke();
  }

  context.restore();
};
