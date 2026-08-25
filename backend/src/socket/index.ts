import { Server as HttpServer } from 'http';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer){
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string,
        email: string
      };
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log('connected. socket: ', socket.id, '\tuserId: ', socket.data.user.userId);

    socket.on('disconnect', (reason) => {
      console.log('user ', socket.data.user.userId, ' disconnected. reason: ', reason);      
    });
  });

  return io;
}

function getIo(){
  return io;
}
