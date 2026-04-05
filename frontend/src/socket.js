import { io } from "socket.io-client";
const socket = io("https://healup-gtgv.onrender.com/"); // need to match with server.js port
export default socket;