import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,

  transports: [
    "websocket",
    "polling",
  ],

  auth: (callback) => {
    const token =
      localStorage.getItem("token");

    callback({
      token,
    });
  },
});

socket.on("connect", () => {
  console.log(
    "Authenticated socket connected:",
    socket.id
  );
});

socket.on("disconnect", () => {
  console.log(
    "Socket disconnected"
  );
});

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "Socket connection error:",
      error.message
    );
  }
);

export default socket;