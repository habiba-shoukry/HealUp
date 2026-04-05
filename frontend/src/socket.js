import { io } from "socket.io-client";

const socket = io("https://healup-gtgv.onrender.com", {
  transports: ["websocket", "polling"], 
  reconnection: true,            
  reconnectionAttempts: 5,        
  reconnectionDelay: 2000,        
  withCredentials: true     
});

export default socket;