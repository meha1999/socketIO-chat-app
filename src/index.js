const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  socket.on("join", ({ room, username }, callback) => {
    const { error, user } = addUser({ id: socket.id, room, username });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has been joined !`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    if (!message) {
      return callback("Empty messages are not allowed");
    }

    const user = getUser(socket.id);
    const filter = new Filter();
    io.to(user.room).emit("message", generateMessage(user.username, message));
    if (filter.isProfane(message)) {
      callback("Delivered You Naughty Dog !!");
    } else {
      callback("Delivered ✓✓");
    }
  });

  socket.on("sendLocation", (data, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${data.latitude},${data.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port} cucaracha`);
});
