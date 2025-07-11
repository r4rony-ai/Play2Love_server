const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // You can change this to your Vercel domain for security
    methods: ["GET", "POST"]
  }
});

const roomUsers = {}; // { roomCode: [user1, user2] }

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("join", ({ room, username }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // Track users in room
    if (!roomUsers[room]) roomUsers[room] = [];
    if (!roomUsers[room].includes(username)) {
      roomUsers[room].push(username);
    }

    // Notify users in room
    io.to(room).emit("joined", roomUsers[room]);
    io.to(room).emit("user-list", roomUsers[room]);
    console.log(`✅ ${username} joined ${room}`);
  });

  socket.on("draw", (data) => {
    socket.to(data.room).emit("draw", data);
  });

  socket.on("start-game", ({ room }) => {
    socket.to(room).emit("start-game");
  });

  socket.on("disconnect", () => {
    const { room, username } = socket;
    if (room && username && roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter((user) => user !== username);
      io.to(room).emit("user-list", roomUsers[room]);
    }
    console.log("❌ A user disconnected");
  });
});

// Just a basic homepage
app.get("/", (req, res) => {
  res.send("🟢 Play2Love Socket.IO Server Running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
