import { AuthRequest } from "../types/auth";
import { Response, NextFunction } from "express";
import { prisma } from "../db/client";
import crypto from "node:crypto"

async function createRoom(req: AuthRequest, res: Response, next: NextFunction) {
  const name = req.body.name;
  const bookId = req.body.bookId;

  const userId = req.user?.userId;
  if (!userId){
    return res.status(401).json({error: "Необходима авторизация!"});
  }

  if (!name || name.trim().length > 50) {
    return res.status(400).json({error: "Невалидное название"});
  }

  const book = await prisma.book.findUnique({
    where: {
      id: bookId
    }
  });

  if (!book) {
    return res.status(404).json({error: "Книга не найдена"});
  }

  const inviteCode = crypto.randomBytes(6).toString('hex');

  const newRoom = await prisma.room.create({
    data: {
      name: name,
      inviteCode: inviteCode,
      bookId: bookId,
      creatorId: userId,
      roomMembers: {
        create: {
          userId: userId
        }
      }
    }});

    return res.status(201).json({msg: `Комната создана: ${newRoom}\nКод для приглашения: ${inviteCode}`});
}

async function joinRoomByCode(req: AuthRequest, res: Response, next: NextFunction) {
  const inviteCode = req.body.inviteCode;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({error: "Необходима авторизация!"});
  }

  if (!inviteCode) {
    return res.status(400).json({err: "Нужен код приглашения!"});
  }

  const room = await prisma.room.findFirst({
    where: {
      inviteCode: inviteCode,
    },
    include: { roomMembers: true }
  });

  if (!room) {
    return res.status(404).json({err: "Комната не найдена"});
  }

  const alreadyMember = room.roomMembers.some((u) => userId === u.userId);
  if (alreadyMember) {
    return res.status(409).json({err: "Ты уже участник"});
  }

  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: userId
    }
  })

  return res.status(200).json(room);
}

async function getMyRooms(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({error: "Необходима авторизация!"});
  }

  const rooms = await prisma.room.findMany({
    where: {
      roomMembers: {
        some: {
          userId
        }
      }
    },
    include: {
      book: {select: {title: true}},
      creator: {select: {email: true}},
      _count: {select: {roomMembers: true}}
    }
  });

  return res.status(200).json(rooms);
}

async function getRoomById(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  const roomId = req.params.roomId as string;

  if (!userId) {
    return res.status(401).json({error: "Необходима авторизация!"});
  }

  const room = await prisma.room.findUnique({
    where: {
      id: roomId
    },
    include: {
      book: {select: {title: true}},
      roomMembers: {
        include: {
          user: {select: {email: true, id: true}}
        }
      }
    }
  });

  if (!room) {
    return res.status(404).json({err: "Комната не найдена"});
  }

  const isMember = room.roomMembers.some((u) => u.userId === userId);
  if (!isMember) {
    return res.status(403).json({err: "Ты не состоишь в этой комнате"});
  }

  return res.status(200).json(room);
}

async function deleteRoom(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  const roomId = req.params.roomId as string;

  if (!userId) {
    return res.status(401).json({error: "Необходима авторизация!"});
  }

  if (!roomId) {
    return res.status(400).json({error: "Необходимо передать ID комнаты"});
  }

  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    }
  });

  if (!room) {
    return res.status(404).json({error: "Комната не найдена"});
  }

  if (room.creatorId !== userId) {
    return res.status(409).json({error: "Ты не создатель комнаты"});
  }

  await prisma.room.delete({
    where: {
      id: roomId
    }
  });

  return res.status(200).json({msg: "Комната удалена"});
}

export {getMyRooms, getRoomById, createRoom, joinRoomByCode, deleteRoom}