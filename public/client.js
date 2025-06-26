// public/client.js
const socket = io();

const loginScreen = document.getElementById("login-screen");
const chatScreen  = document.getElementById("chat-screen");
const loginForm   = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const messageForm = document.getElementById("message-form");
const messageInput= document.getElementById("message-input");
const messages    = document.getElementById("messages");
const userCountSpan = document.getElementById("user-count");
const toggleBtn   = document.getElementById("toggle-theme");

let username = "";

// Handle previous messages
socket.on("message history", (history) => {
  history.forEach((msg) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${msg.name}</strong> <span class="time">[${msg.time}]</span>: ${msg.text}`;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
});

// Login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (!username) return;
  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  socket.emit("new user", username);
});

// Send message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msg = { name: username, text, time };
  socket.emit("chat message", msg);
  messageInput.value = "";
});

// Receive message
socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  item.innerHTML = `<strong>${msg.name}</strong> <span class="time">[${msg.time}]</span>: ${msg.text}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

// System notifications (join/leave)
socket.on("user joined", (name) => {
  const item = document.createElement("li");
  item.classList.add("system");
  item.textContent = `${name} joined the chat`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
socket.on("user left", (name) => {
  const item = document.createElement("li");
  item.classList.add("system");
  item.textContent = `${name} left the chat`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

// Online user count
socket.on("user count", (count) => {
  userCountSpan.textContent = count;
});

// Dark/light mode toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleBtn.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

