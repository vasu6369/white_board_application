import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useCanvas } from './hooks/useCanvas';
import { getRoomFromUrl, createRoomId } from './utils/roomUtils';
import { COLORS } from './constants';
import RoomEntry from './components/RoomEntry';
import Topbar from './components/Topbar';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import ShortcutsModal from './components/ShortcutsModal';

function App() {
  const [roomId, setRoomId] = useState(getRoomFromUrl);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(6);
  const [paths, setPaths] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [textEditor, setTextEditor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [fillShapes, setFillShapes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, sans-serif');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const hydrateImages = useCallback((incomingPaths) => {
    return incomingPaths.map((path) => {
      if (path.tool !== 'image' || path._imgEl || !path.imgSrc) return path;

      const image = new Image();
      const hydratedPath = { ...path, _imgEl: image };
      image.onload = () => setPaths((current) => [...current]);
      image.src = path.imgSrc;
      return hydratedPath;
    });
  }, []);

  // Hook 1: Socket synchronization and networking
  const {
    isConnected,
    emitPathAdd,
    emitPathUpdate,
    emitPathsReplace,
    emitBoardClear,
    disconnectSocket,
  } = useSocket(roomId, username, {
    onBoardInit: (serverPaths) => {
      setPaths(hydrateImages(serverPaths));
      setRedoStack([]);
      setSelectedId(null);
      setTextEditor(null);
    },
    onPathAdd: (path) => {
      const [hydratedPath] = hydrateImages([path]);
      setPaths((current) => (current.some((item) => item.id === path.id) ? current : [...current, hydratedPath]));
    },
    onPathUpdate: (path) => {
      const [hydratedPath] = hydrateImages([path]);
      setPaths((current) => current.map((item) => (item.id === path.id ? hydratedPath : item)));
    },
    onPathsReplace: (serverPaths) => {
      setPaths(hydrateImages(serverPaths));
      setRedoStack([]);
      setSelectedId(null);
    },
    onBoardClear: () => {
      setPaths([]);
      setRedoStack([]);
      setSelectedId(null);
      setTextEditor(null);
    },
    onPresenceChange: () => {
      // Presence count is now superseded by room:users array length
    },
    onUsersChange: (userList) => {
      setUsers(userList);
    },
  });

  // Hook 2: Canvas drawing, resizing, and pointer logic
  const {
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
    handleImageUpload,
  } = useCanvas({
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
  });

  const openRoom = (nextRoomId, userNickname) => {
    const cleanedRoomId = nextRoomId.trim();
    if (!cleanedRoomId) return;

    const finalNickname = userNickname?.trim() || `Guest_${Math.floor(Math.random() * 1000)}`;
    setUsername(finalNickname);

    const params = new URLSearchParams(window.location.search);
    params.set('room', cleanedRoomId);
    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
    
    disconnectSocket();
    setPaths([]);
    setRedoStack([]);
    setSelectedId(null);
    setTextEditor(null);
    setUsers([]);
    setRoomId(cleanedRoomId);
  };

  const leaveRoom = () => {
    window.history.pushState(null, '', window.location.pathname);
    disconnectSocket();
    setPaths([]);
    setRedoStack([]);
    setSelectedId(null);
    setTextEditor(null);
    setUsers([]);
    setUsername('');
    setRoomId('');
  };

  const createRoom = (userNickname) => {
    openRoom(createRoomId(), userNickname);
  };

  const joinRoom = (roomInput, userNickname) => {
    openRoom(roomInput, userNickname);
  };

  const undo = () => {
    setTextEditor(null);
    setSelectedId(null);
    setPaths((current) => {
      if (!current.length) return current;
      const next = current.slice(0, -1);
      setRedoStack((stack) => [current[current.length - 1], ...stack]);
      emitPathsReplace(next);
      return next;
    });
  };

  const redo = () => {
    setTextEditor(null);
    setSelectedId(null);
    setRedoStack((current) => {
      if (!current.length) return current;
      const [restored, ...next] = current;
      setPaths((pathList) => {
        const restoredPaths = [...pathList, restored];
        emitPathsReplace(restoredPaths);
        return restoredPaths;
      });
      return next;
    });
  };

  const clearBoard = () => {
    setTextEditor(null);
    setSelectedId(null);
    setPaths([]);
    setRedoStack([]);
    emitBoardClear();
  };

  const updateStickyNote = (note) => {
    const updatedPath = {
      id: note.id,
      tool: 'sticky',
      color: note.color || '#fef08a',
      width: 1,
      text: note.text,
      colorIndex: note.colorIndex,
      points: [{ x: note.x, y: note.y }],
    };

    setPaths((current) => current.map((path) => (path.id === note.id ? updatedPath : path)));
    emitPathUpdate(updatedPath);
  };

  const deleteStickyNote = (noteId) => {
    setPaths((current) => {
      const next = current.filter((path) => path.id !== noteId);
      emitPathsReplace(next);
      return next;
    });
  };

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (!roomId || !username || textEditor) return;

      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      } else if (event.ctrlKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        downloadBoard();
      } else if (event.key === '?') {
        setShowShortcuts(true);
      } else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        const keyToolMap = {
          p: 'pen',
          h: 'highlighter',
          e: 'eraser',
          s: 'select',
          t: 'text',
          r: 'rectangle',
          o: 'ellipse',
          l: 'line',
        };
        const nextTool = keyToolMap[event.key.toLowerCase()];
        if (nextTool) setTool(nextTool);
        if (event.key.toLowerCase() === 'g') setShowGrid((current) => !current);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [downloadBoard, roomId, textEditor, username]);

  useEffect(() => {
    const handlePaste = (event) => {
      if (!roomId || !username || textEditor) return;

      const imageItem = Array.from(event.clipboardData?.items || []).find((item) =>
        item.type.startsWith('image/')
      );
      const imageFile = imageItem?.getAsFile();
      if (imageFile) handleImageUpload(imageFile);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageUpload, roomId, textEditor, username]);

  if (!roomId || !username) {
    return (
      <RoomEntry
        onJoinRoom={joinRoom}
        onCreateRoom={createRoom}
        initialRoomInput={roomId || ''}
      />
    );
  }

  return (
    <main className={`app ${isDark ? 'dark' : ''}`}>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        pathsLength={paths.length}
        redoStackLength={redoStack.length}
        onUndo={undo}
        onRedo={redo}
        onClearBoard={clearBoard}
        onResetView={() => redraw(paths)}
        onDownload={downloadBoard}
        fillShapes={fillShapes}
        onToggleFill={() => setFillShapes(!fillShapes)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        onShowShortcuts={() => setShowShortcuts(true)}
        onImageUpload={handleImageUpload}
      />

      <section className="board-shell">
        <Topbar
          roomId={roomId}
          pathsLength={paths.length}
          isConnected={isConnected}
          users={users}
          copiedId={copiedId}
          copiedLink={copiedLink}
          onCopyRoomId={copyRoomId}
          onCopyRoomLink={copyRoomLink}
          onLeaveRoom={leaveRoom}
          paths={paths}
        />

        <CanvasArea
          canvasRef={canvasRef}
          wrapperRef={wrapperRef}
          textInputRef={textInputRef}
          tool={tool}
          lineWidth={lineWidth}
          eraserCursor={eraserCursor}
          textEditor={textEditor}
          setTextEditor={setTextEditor}
          startDrawing={startDrawing}
          draw={draw}
          stopDrawing={stopDrawing}
          leaveCanvas={leaveCanvas}
          updateEraserCursor={updateEraserCursor}
          commitText={commitText}
          paths={paths}
          onUpdateSticky={updateStickyNote}
          onDeleteSticky={deleteStickyNote}
          isDark={isDark}
        />
      </section>
      {showShortcuts ? <ShortcutsModal onClose={() => setShowShortcuts(false)} /> : null}
    </main>
  );
}

export default App;
