const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (room) => {
    socket.join(room);
    socket.to(room).emit("joined", "Your partner has joined!");
  });

  socket.on("draw", ({ room, x, y }) => {
    socket.to(room).emit("draw", { x, y });
  });
});

server.listen(10000, () => {
  console.log("✅ Socket.IO server running on port 10000");
});
