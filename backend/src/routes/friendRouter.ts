import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
} from "../controllers/friendController";

const friendRouter = Router();

friendRouter.post("/request", sendFriendRequest);

friendRouter.get("/", getFriends);

friendRouter.get("/requests/incoming", getIncomingRequests);

friendRouter.get("/requests/outgoing", getOutgoingRequests);

friendRouter.post("/:id/accept", acceptFriendRequest);

friendRouter.post("/:id/reject", rejectFriendRequest);

export { friendRouter };
