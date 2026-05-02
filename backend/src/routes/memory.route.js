import { Router } from "express";
import { getMemoryChip } from "../controllers/memory.controller.js";
import { authMiddleware } from "../middlewares/user.auth.middleware.js";

const router = Router();

router.route("/get-memory-chip/:roomId").get(authMiddleware, getMemoryChip);

export default router;