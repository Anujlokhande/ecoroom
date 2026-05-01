import { Router } from "express";
import { createRoom, getRooms } from "../controllers/room.controller.js";
import { authMiddleware } from "../middlewares/user.auth.middleware.js";

const router = Router();

router
  .route("/")
  .post(authMiddleware, createRoom)
  .get(authMiddleware, getRooms);

export default router;
