import { io } from "socket.io-client";

const socket = io("https://healup-gtgv.onrender.com", {
  transports: ["websocket"], 
  withCredentials: true
});

export default socket;