# 🎨 Collaborative Whiteboard

A real-time collaborative whiteboard application that allows multiple users to draw, create notes, add text, upload images, and collaborate live on a shared canvas using room-based communication.

Built with **React**, **Vite**, **Node.js**, and **Socket.IO**, this project provides a smooth and interactive whiteboard experience for teams, classrooms, brainstorming sessions, and remote collaboration.

---

## 🚀 Overview

Collaborative Whiteboard is a real-time drawing platform where users can create or join rooms and work together on a shared canvas.

Each room maintains its own board state, allowing participants to see updates instantly as users draw, edit, move objects, add text, upload images, and more.

The application uses **Socket.IO** for real-time communication between clients and the server.

---

# ✨ Features

## 👥 Room Management

* Create a new room
* Join an existing room using a Room ID
* Display current Room ID
* Copy Room ID
* Copy room share link
* Support for user nicknames
* View connected users in the room

---

## ⚡ Real-Time Collaboration

* Live multi-user collaboration
* Instant synchronization across participants
* Shared whiteboard state
* Room-based communication using Socket.IO

---

## 🖊️ Drawing Tools

* Pen Tool
* Highlighter Tool
* Eraser Tool
* Select / Move Tool
* Text Tool
* Sticky Notes

---

## 📐 Shape Tools

* Line
* Rectangle
* Ellipse

### Shape Options

* Filled Shapes
* Outline Shapes

---

## 🎨 Customization

* Color Palette
* Custom Color Picker
* Brush Size Slider
* Grid Toggle
* Dark Mode Toggle

---

## 🖼️ Image Support

* Upload Images
* Paste Images from Clipboard
* Drag Images
* Resize Images

---

## 📝 Text & Notes

### Text Blocks

* Create text anywhere on the board
* Drag text blocks
* Edit text content

### Sticky Notes

* Create sticky notes
* Edit sticky notes
* Drag sticky notes
* Delete sticky notes

---

## ↩️ Board Actions

* Undo
* Redo
* Clear Board
* Download Board as PNG

---

## ⌨️ Productivity Features

* Keyboard Shortcuts Modal
* Quick Shortcut Hint:

  ```
  Press ? for shortcuts
  ```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* Socket.IO Client
* Lucide React
* CSS

## Backend

* Node.js
* Socket.IO

---

# 📁 Project Structure

```text
Collaborative-Whiteboard/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── server.js
│   └── package.json
│
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/your-username/collaborative-whiteboard.git

cd collaborative-whiteboard
```

## Install Dependencies

### Root

```bash
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

---

# ▶️ Running the App

From the project root directory:

## Start Backend

```bash
npm run backend
```

Backend runs on:

```text
http://localhost:3002
```

---

## Start Frontend

```bash
npm run frontend
```

Frontend runs on:

```text
http://127.0.0.1:5173
```

---

# 🔧 Environment Variables

## Frontend

Create a `.env` file inside the `frontend` folder:

```env
VITE_SOCKET_URL=http://localhost:3002
```

---

## Backend

Create a `.env` file inside the `backend` folder:

```env
PORT=3002
```

---

# 📖 Usage Guide

## Create a Room

1. Open the application.
2. Click **Create Room**.
3. A new Room ID will be generated.
4. Share the Room ID or Room Link with collaborators.

---

## Join a Room

1. Open the application.
2. Enter a valid Room ID.
3. Provide a nickname (if enabled).
4. Click **Join Room**.

---

## Start Collaborating

Once users join the same room:

* Draw together in real time.
* Add shapes.
* Create text blocks.
* Add sticky notes.
* Upload images.
* Move and edit board elements.
* Download the final board as PNG.

---

# ⌨️ Keyboard Shortcuts

| Shortcut | Action                |
| -------- | --------------------- |
| P        | Pen Tool              |
| H        | Highlighter           |
| E        | Eraser Tool           |
| S        | Select / Move Tool    |
| T        | Text Tool             |
| R        | Rectangle Tool        |
| O        | Ellipse Tool          |
| L        | Line Tool             |
| G        | Toggle Grid           |
| Ctrl + Z | Undo                  |
| Ctrl + Y | Redo                  |
| Ctrl + D | Download Board        |
| Ctrl + V | Paste Image           |
| ?        | Open Shortcuts Modal  |
| Esc      | Close Shortcuts Modal |

---

# 🔄 Collaboration Flow

```text
User A Creates Room
          │
          ▼
      Room ID
          │
          ▼
 Share Room ID / Link
          │
          ▼
 User B Joins Room
          │
          ▼
 Socket.IO Connection
          │
          ▼
 Real-Time Synchronization
          │
          ▼
 Shared Whiteboard Updates
```

### Synchronized Events

The backend synchronizes:

* Added paths
* Updated paths
* Replaced board paths
* Cleared board
* Connected users

---

# ⚠️ Limitations

Current implementation stores room data in memory.

This means:

* Room data is lost when the backend restarts.
* No permanent board history.
* No user authentication.
* No database persistence.

---

# 🔮 Future Improvements

Potential enhancements for production deployment:

## Database Integration

* MongoDB
* PostgreSQL
* Firebase
* Supabase

## Additional Features

* User Authentication
* Persistent Board Storage
* Multiple Pages per Board
* Board Sharing Permissions
* Export to PDF
* Version History
* Real-Time Cursors
* Voice & Video Collaboration
* Cloud Image Storage
* Mobile Optimization

---

# 🚀 Production Deployment Notes

Before deploying:

### Configure Environment Variables

Update:

```env
VITE_SOCKET_URL
PORT
```

to production values.

### Configure CORS

Restrict allowed frontend origins in the Socket.IO server.

### Add Persistent Storage

Use a database to store:

* Rooms
* Whiteboard state
* Users
* Uploaded assets

---

# 📌 Important Notes

* Multiple users must join the same Room ID to collaborate.
* Whiteboard updates are synchronized in real time.
* Board data is stored only in server memory.
* Restarting the backend clears all room data.
* Production deployments should use persistent storage.

---

# 📄 License

This project is licensed under the MIT License.

Feel free to use, modify, and distribute this project for personal and commercial purposes.
