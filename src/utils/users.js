const users = [];

const addUser = ({ id, room, username }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room) {
    return {
      error: "UserName and Room are required",
    };
  }

  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );
  if (existingUser) {
    return {
      error: "UserName is in use",
    };
  }

  const user = { id, room, username };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => (user.id === id));
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
};
