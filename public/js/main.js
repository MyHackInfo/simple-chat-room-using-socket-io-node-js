const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roonName = document.getElementById("room-name");
const userList = document.getElementById("users");

const url = new URL(window.location.href);
let username = url.searchParams.get("username");
let room = url.searchParams.get("room");

if (username === "" || room === "") {
  window.location.href = "http://localhost:3000/";
}
const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Getting server message
socket.on("message", (message) => {
  outputMessage(message);

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Getting room user data
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  // clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output Message
function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
            <p class="text">
              ${msg.txt}
            </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Output user list
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}

// Output room name
function outputRoomName(room) {
  roonName.innerHTML = room;
}
