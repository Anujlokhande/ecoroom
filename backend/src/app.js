import express, { urlencoded } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { User } from "./model/user.model.js";
import { Chat } from "./model/chat.model.js";
import jwt from "jsonwebtoken";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.split("=");
    if (!name) return cookies;
    cookies[name.trim()] = decodeURIComponent(rest.join("=").trim());
    return cookies;
  }, {});

//io
io.use(async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token =
      socket.handshake.auth.token ||
      cookies.accessToken ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("No token found, allowing connection for debugging");
      socket.user = null; // Allow connection without auth for now
      return next();
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    socket.user = null; // Allow connection for debugging
    next();
  }
});

io.on("connection", (socket) => {
  const username = socket.user?.username || "Guest";
  console.log("Socket: ", socket.id, "User:", username);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(username, " has joined the room");
    io.to(roomId).emit("room-notice", username);
  });

  socket.on("chat-msg", async (msg) => {
    console.log(msg);
    if (!socket.user) {
      console.log("Unauthenticated socket attempted to send a message");
      return;
    }
    if (msg.roomId && msg.username && msg.msg) {
      try {
        const savedMessage = await Chat.create({
          text: msg.msg,
          senderId: socket.user._id,
          roomId: msg.roomId,
          branchId: msg.branchId || "main",
        });
        io.to(msg.roomId).emit("chat-msg", {
          username: socket.user.username,
          msg: msg.msg,
          roomId: msg.roomId,
          _id: savedMessage._id,
          createdAt: savedMessage.createdAt,
          branchId: savedMessage.branchId, // ← required for client-side branch filtering
        });
      } catch (error) {
        console.log("Error saving message:", error);
      }
    }
  });

  socket.on("leave-room", ({ roomId, username }) => {
    socket.leave(roomId);
    console.log(`${username} left room: ${roomId}`);
  });

  socket.on("create-room", (roomId) => {
    console.log(roomId);
    io.emit("create-room", "created group");
  });
  socket.on("new-branch", (branch) => {
    // Broadcast the new branch to everyone else in the room
    if (branch && branch.roomId) {
      socket.to(branch.roomId).emit("new-branch", branch);
    }
  });
});

//import routes
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.routes.js";
import roomRoute from "./routes/room.route.js";
import branchRoute from "./routes/branch.route.js";

//routes
app.use("/api/v1", userRoute);
app.use("/api/v1/chats", chatRoute);
app.use("/api/v1/rooms", roomRoute);
app.use("/api/v1/branch", branchRoute);

app.get("/", (req, res) => {
  res.status(200).send("hello");
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
});

export default server;
