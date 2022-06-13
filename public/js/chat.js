const socket = io();

const $messageForm = document.getElementById("form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.getElementById("location");
const $messages = document.getElementById("messages");
const $sidebar = document.getElementById("sidebar");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById(
  "location-message-template"
).innerHTML;
const sideBarTemplate = document.getElementById("sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
   const $newMessage = $messages.lastElementChild
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
   const visibleHeight = $messages.offsetHeight
   const containerHeight = $messages.scrollHeight
   const scrollOffset = $messages.scrollTop + visibleHeight
   if (containerHeight - newMessageHeight <= scrollOffset) {
       $messages.scrollTop = $messages.scrollHeight
   }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (location) => {
  console.log(location);
  const html = Mustache.render(locationMessageTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, { room, users });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", e.target.elements.message.value, (message) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    console.log(message);
  });
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("GEO location is not supported by your browser");
  }
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $locationButton.removeAttribute("disabled");
        console.log("Location Shared");
      }
    );
  });
});

socket.emit("join", { room, username }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
