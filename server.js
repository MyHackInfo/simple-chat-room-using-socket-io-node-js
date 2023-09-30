import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import cors from "cors";
import http from "http";
import * as socketIo from "socket.io";
import { formatMessage } from "./utils/message.js";
import {
  getCurrentUser,
  getRoomUsers,
  userJoin,
  userLeave,
} from "./utils/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new socketIo.Server(server);

app.use(express.static(path.join(__dirname, "public")));

// Set up socket.io connection start
io.on("connection", (socket) => {
  // Join room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // welcome current user
    socket.emit("message", formatMessage("Mukhiya", "Welcome to ChatCord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage("Mukhiya", `${user.username} has join`));

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    // Disconnect event // user left the chat
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage("Mukhiya", `${user.username} left the chat`)
        );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });

  // listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log("server runing....", PORT);
});
