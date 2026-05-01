import { Router } from "express";
import { authMiddleware } from "../middlewares/user.auth.middleware.js";
import { getMessages } from "../controllers/chat.controller.js";

const router = Router();

router.route("/:roomId").get(authMiddleware, getMessages);

export default router;
