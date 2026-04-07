import { io } from "socket.io-client";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8001";

// const socket = io("https://healup-backend-2-0.onrender.com", {
const socket = io(BASE_URL, {
  transports: ["websocket", "polling"], 
  reconnection: true,            
  reconnectionAttempts: 5,        
  reconnectionDelay: 2000,        
  withCredentials: true     
});

export default socket;