import { User } from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);

    if (!token) {
      const err = new Error("Unauthorized access");
      err.statusCode = 401;
      throw err;
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      const err = new Error("User is not defined");
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    throw error;
  }
});
