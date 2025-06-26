const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store online users count
let userCount = 0;

// Store chat history in memory (max 50 messages)
let messageHistory = [];

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  // Send existing chat history to the newly connected client
  socket.emit("message history", messageHistory);

  // Handle new user login
  socket.on("new user", (name) => {
    socket.username = name;
    userCount++;
    // Broadcast updated user count and join notification
    io.emit("user count", userCount);
    io.emit("user joined", name);
  });

  // Handle incoming chat messages
  socket.on("chat message", (msg) => {
    // Add to history and trim if necessary
    messageHistory.push(msg);
    if (messageHistory.length > 50) messageHistory.shift();

    // Broadcast the new message
    io.emit("chat message", msg);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (socket.username) {
      userCount--;
      // Broadcast updated user count and leave notification
      io.emit("user count", userCount);
      io.emit("user left", socket.username);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
