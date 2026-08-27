import { Router } from "express";
import { getMyRooms, getRoomById, createRoom, joinRoomByCode, deleteRoom } from "../controllers/roomController";

const roomRouter = Router();

roomRouter.post('/join', joinRoomByCode);
roomRouter.post('/', createRoom);
roomRouter.get('/', getMyRooms);
roomRouter.get('/:roomId', getRoomById);
roomRouter.delete('/:roomId', deleteRoom);

export {roomRouter}