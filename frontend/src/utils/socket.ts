import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

let socket: Socket | null = null;

function connectSocket(){
  if (socket) return socket;
  
  const token = localStorage.getItem('token');
  socket = io('http://localhost:3000', {auth: {token}});

  socket.on('connect', () => {
    console.log('socket connected!');
  });

  socket.on('connect_error', (error) => {
    console.log(`connection error: ${error.message}!`);
  })

  socket.on('disconnect', () => {
    console.log('socket disconnected!');
  });

  return socket;
}

function getSocket(){
  return socket;
}

function disconnectSocket(){
  if (socket) socket.disconnect();
  socket = null;
}

export {connectSocket, getSocket, disconnectSocket}