import { Server as HttpServer } from 'http';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client';

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

    socket.on('join-room', async (roomId) => {
      if (!io) return;
      const userId = socket.data.user.userId;
      
      const isMember = await prisma.roomMember.findFirst({where: {roomId, userId}});
      if (!isMember) return;

      const roomName = `room-${roomId}`;
      socket.join(roomName);
      socket.data.roomId = roomId;

      const sockets = await io.in(roomName).fetchSockets()
      const users = sockets.map((s) => s.data.user).filter((u) => u && u.userId !== userId);
      
      socket.emit('room-users', users);
      socket.to(roomName).emit('user-joined', socket.data.user);
    });

    socket.on('leave-room', (roomId) => {
      const roomName = `room-${roomId}`;
      socket.to(roomName).emit('user-left', socket.data.user);
      socket.leave(roomName);
      socket.data.roomId = undefined;
    });

    socket.on('disconnecting', () => {
      if (socket.data.roomId) {
        const roomName = `room-${socket.data.roomId}`;
        socket.to(roomName).emit('user-left', socket.data.user);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('user ', socket.data.user.userId, ' disconnected. reason: ', reason);      
    });
  });

  return io;
}

export function getIo(){
  return io;
}
