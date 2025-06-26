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

// ✅ Check if user already logged in
const savedUsername = localStorage.getItem("chat-username");
if (savedUsername) {
  username = savedUsername;
  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  enableChat(); // ✅ Enable message form and emit user
  socket.emit("new user", username);
}

// ✅ Login form handler
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (!username) return;

  localStorage.setItem("chat-username", username);

  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  enableChat();
  socket.emit("new user", username);
});

// ✅ Enable message form
function enableChat() {
  messageInput.disabled = false;
  messageForm.querySelector("button").disabled = false;

  // Optional logout button
  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.onclick = () => {
    localStorage.removeItem("chat-username");
    location.reload();
  };
  logoutBtn.style.marginLeft = "10px";
  document.querySelector("header").appendChild(logoutBtn);
}

// ✅ Handle sending messages
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!username || !text) return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msg = { name: username, text, time };
  socket.emit("chat message", msg);
  messageInput.value = "";
});

// ✅ Load message history
socket.on("message history", (history) => {
  history.forEach((msg) => appendMessage(msg));
  messages.scrollTop = messages.scrollHeight;
});

// ✅ New message
socket.on("chat message", (msg) => {
  appendMessage(msg);
  messages.scrollTop = messages.scrollHeight;
});

// ✅ User joined/left
socket.on("user joined", (name) => appendSystemMessage(`${name} joined the chat`));
socket.on("user left", (name) => appendSystemMessage(`${name} left the chat`));

// ✅ User count update
socket.on("user count", (count) => {
  userCountSpan.textContent = count;
});

// ✅ Dark mode toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleBtn.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// ✅ Helpers
function appendMessage(msg) {
  const item = document.createElement("li");
  item.innerHTML = `<strong>${msg.name}</strong> <span class="time">[${msg.time}]</span>: ${msg.text}`;
  messages.appendChild(item);
}
function appendSystemMessage(text) {
  const item = document.createElement("li");
  item.classList.add("system");
  item.textContent = text;
  messages.appendChild(item);
  }
