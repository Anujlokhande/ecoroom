import { Router } from "express";
import {
  loginUser,
  logoutUser,
  RefreshToken,
  registerUser,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/user.auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/newToken").post(RefreshToken);
router.route("/me").get(authMiddleware, getCurrentUser);

export default router;
