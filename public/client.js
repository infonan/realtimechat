// public/client.js
const socket = io();

const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const userCountSpan = document.getElementById("user-count");
const toggleBtn = document.getElementById("toggle-theme");

let username = "";
// ✅ Auto-login if username already saved in localStorage
const savedUsername = localStorage.getItem("chat-username");
if (savedUsername) {
  username = savedUsername;

  // Show chat screen, hide login
  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  // Enable input
  messageInput.disabled = false;
  messageForm.querySelector("button").disabled = false;

  // Emit new user to server
  socket.emit("new user", username);
}

// Disable message form until login
messageInput.disabled = true;
messageForm.querySelector("button").disabled = true;

// Handle login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (!username) return;

// ✅ Save username in localStorage
localStorage.setItem("chat-username", username);
  

  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  // Enable chat input
  messageInput.disabled = false;
  messageForm.querySelector("button").disabled = false;

  socket.emit("new user", username);
});

// Handle sending a message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();

  // Prevent sending if not logged in or message empty
  if (!username || !text) return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msg = { name: username, text, time };
  socket.emit("chat message", msg);
  messageInput.value = "";
});

// Load message history
socket.on("message history", (history) => {
  history.forEach((msg) => {
    appendMessage(msg);
  });
  messages.scrollTop = messages.scrollHeight;
});

// Receive a message
socket.on("chat message", (msg) => {
  appendMessage(msg);
  messages.scrollTop = messages.scrollHeight;
});

// User joined
socket.on("user joined", (name) => {
  appendSystemMessage(`${name} joined the chat`);
});

// User left
socket.on("user left", (name) => {
  appendSystemMessage(`${name} left the chat`);
});

// Update user count
socket.on("user count", (count) => {
  userCountSpan.textContent = count;
});

// Dark mode toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleBtn.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// Helper to append a message
function appendMessage(msg) {
  const item = document.createElement("li");
  item.innerHTML = `<strong>${msg.name}</strong> <span class="time">[${msg.time}]</span>: ${msg.text}`;
  messages.appendChild(item);
}

// Helper to append a system message
function appendSystemMessage(text) {
  const item = document.createElement("li");
  item.classList.add("system");
  item.textContent = text;
  messages.appendChild(item);
}
