import { Router } from "express";
import { authMiddleware } from "../middlewares/user.auth.middleware.js";
import {
  createBranch,
  getBranchesByRoom,
} from "../controllers/branch.controller.js";

const router = Router();
router.route("/create").post(authMiddleware, createBranch);
router.route("/getbranches/:roomId").get(authMiddleware, getBranchesByRoom);
export default router;
