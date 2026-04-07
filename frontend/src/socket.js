import { io } from "socket.io-client";

// const socket = io("https://healup-gtgv.onrender.com", {
const socket = io("http://localhost:8001", {
  transports: ["websocket", "polling"], 
  reconnection: true,            
  reconnectionAttempts: 5,        
  reconnectionDelay: 2000,        
  withCredentials: true     
});

export default socket;