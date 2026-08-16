import { AuthRequest } from "../types/auth";
import { Response, NextFunction } from "express";
import { prisma } from "../db/client";

async function sendFriendRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.userId;
  const { addresseeId } = req.body;

  if (!userId) {
    return res.status(401).json({ err: "Необходима авторизация" });
  }

  if (!addresseeId) {
    return res.status(400).json({ err: "Нет ID адресата" });
  }

  if (addresseeId === userId) {
    return res
      .status(400)
      .json({ err: "Нельзя добавить самого себя в друзья" });
  }

  try {
    const addressee = await prisma.user.findUnique({
      where: {
        id: addresseeId,
      },
    });

    if (!addressee) {
      return res.status(404).json({ err: "Нет такого пользователя" });
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: userId,
            addresseeId: addresseeId,
          },
          {
            requesterId: addresseeId,
            addresseeId: userId,
          },
        ],
      },
    });

    if (!friendship) {
      const newFriendship = await prisma.friendship.create({
        data: {
          requester: { connect: { id: userId } },
          addressee: { connect: { id: addresseeId } },
          status: "PENDING",
        },
      });
      return res.status(201).json(newFriendship);
    }

    switch (friendship.status) {
      case "PENDING":
        return res
          .status(409)
          .json({ err: "Запрос уже отправлен или ожидает ответа" });
      case "ACCEPTED":
        return res.status(409).json({ err: "Вы уже друзья" });
      case "REJECTED":
        await prisma.friendship.update({
          where: {
            id: friendship.id,
          },
          data: {
            status: "PENDING",
          },
        });

        return res.status(200).json({ msg: "Запрос отправлен" });
    }
  } catch (error) {
    next(error);
  }
}

async function acceptFriendRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const requestId = req.params.id as string;
  const userId = req.user?.userId;
  const request = await prisma.friendship.findFirst({
    where: {
      id: requestId,
    },
  });

  if (!userId) {
    return res.status(401).json({ err: "Необходима авторизация" });
  }

  if (!request) {
    return res.status(404).json({ err: "Нет такого запроса" });
  }

  if (request.addresseeId !== userId) {
    return res
      .status(403)
      .json({ err: "Принять может только получатель запроса" });
  }

  if (request.status !== "PENDING") {
    return res.status(409).json({ err: "Запрос уже обработан" });
  }

  try {
    await prisma.friendship.update({
      where: {
        id: request.id,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    return res.json(200).json({ msg: "Запрос принят" });
  } catch (error) {
    next(error);
  }
}

async function rejectFriendRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const requestId = req.params;
  const userId = req.user?.userId;
  const { addresseeId } = req.body;
  const request = await prisma.friendship.findFirst({
    where: {
      id: requestId,
    },
  });

  if (!userId) {
    return res.status(401).json({ err: "Необходима авторизация" });
  }

  if (!request) {
    return res.status(404).json({ err: "Нет такого запроса" });
  }

  if (addresseeId !== userId) {
    return res
      .status(403)
      .json({ err: "Принять может только получатель запроса" });
  }

  if (request.status !== "PENDING") {
    return res.status(409).json({ err: "Запрос уже обработан" });
  }

  try {
    await prisma.friendship.update({
      where: {
        id: request.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    return res.json(200).json({ msg: "Запрос отклонен" });
  } catch (error) {
    next(error);
  }
}

async function getFriends(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ err: "Необходима авторизация" });
  }

  try {
    // Ищем все принятые дружбы, где пользователь участвует с ЛЮБОЙ стороны
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      // Подтягиваем обоих пользователей, но только публичные поля
      include: {
        requester: { select: { id: true, email: true } },
        addressee: { select: { id: true, email: true } },
      },
    });

    // Для каждой записи "друг" - это противоположная сторона
    const friends = friendships.map((friendship) =>
      friendship.requesterId === userId
        ? friendship.addressee
        : friendship.requester,
    );

    return res.status(200).json(friends);
  } catch (error) {
    next(error);
  }
}

async function getIncomingRequests(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ err: "Необходима авторизация" });
  }

  try {
    const incomingRequests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: "PENDING",
      },
      include: {
        requester: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(incomingRequests);
  } catch (error) {
    next(error);
  }
}

async function getOutgoingRequests(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ err: "Необходима авторизация" });
  }

  try {
    const outgoingRequests = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: "PENDING",
      },
      include: { addressee: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(outgoingRequests);
  } catch (error) {
    next(error);
  }
}

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
};
