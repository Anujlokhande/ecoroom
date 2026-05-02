import express, { urlencoded } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { User } from "./model/user.model.js";
import { Chat } from "./model/chat.model.js";
import jwt from "jsonwebtoken";
import { Memory } from "./model/memory.model.js";
import { memoryChipGenerator } from "./genai/memory.chip.js";

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
          isTimeCapsule: savedMessage.isTimeCapsule,
          revealedAt: savedMessage.revealedAt,
        });

        //memory chip generator
        const messageCount = await Chat.countDocuments({ roomId: msg.roomId, branchId: msg.branchId || "main" });
        
        if(messageCount && messageCount % 50 == 0){
          try{
            const rawMessages = await Chat.find({ roomId : msg.roomId, branchId: msg.branchId || "main" }).sort({createdAt: -1}).limit(50).populate("senderId", "username");
            const messages = rawMessages.map(msg => ({
                  text: msg.text,
                  username: msg.senderId?.username,
                  createdAt: msg.createdAt
            }));
            const memory = await memoryChipGenerator(messages);
            console.log(memory);
            
            // Resolve branchId: "main" is a string and cannot be cast to ObjectId. Use null instead.
            // const targetBranchId = (!msg.branchId || msg.branchId === "main") ? null : msg.branchId;

            const createdMemory = await Memory.create({
              roomId: msg.roomId,
              branchId: msg.branchId,
              ...memory
            });
            io.to(msg.roomId).emit("memory-chips", createdMemory);
          }catch(error){
            console.log("Error generating memory chip:", error);
          }
        }
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

  //time capsule message
  socket.on("capsule-msg", async (msg) => {
    if (!socket.user) {
      console.log("Unauthenticated socket attempted to send a message");
      return;
    }
    if (msg.username && msg.roomId && msg.msg) {
      try {
        const now = new Date();
        const releaseDate = new Date(msg.releaseAt);
        // Compare with start of day if only date is provided, but since now includes time,
        // let's just do a direct comparison. If releaseDate is midnight, it works.
        const isStillCapsule = now < releaseDate;

        const savedMessage = await Chat.create({
          text: msg.msg,
          senderId: socket.user._id,
          roomId: msg.roomId,
          branchId: msg.branchId || "main",
          isTimeCapsule: isStillCapsule,
          revealedAt: msg.releaseAt,
        });

        io.to(msg.roomId).emit("chat-msg", {
          username: socket.user.username,
          msg: isStillCapsule ? "This is a time capsule message" : msg.msg,
          roomId: msg.roomId,
          _id: savedMessage._id,
          createdAt: savedMessage.createdAt,
          branchId: savedMessage.branchId,
          isTimeCapsule: isStillCapsule,
          revealedAt: savedMessage.revealedAt,
        });
      } catch (error) {
        console.log("Error saving message:", error);
      }
    }
  });

  socket.on("reveal-time-capsule", async (data) => {
    if (!socket.user) {
      console.log("Unauthenticated socket attempted to reveal a message");
      return;
    }
    if (data.roomId && data.messageId) {
      try {
        const message = await Chat.findById(data.messageId);
        if (!message) {
          console.log("Message not found");
          return;
        }
        message.isTimeCapsule = false;
        await message.save();
        io.to(data.roomId).emit("reveal-time-capsule", {
          username: socket.user.username,
          msg: message.text,
          roomId: data.roomId,
          _id: message._id,
          createdAt: message.createdAt,
          branchId: message.branchId,
          revealedAt: message.revealedAt,
        });
      } catch (error) {
        console.log("Error revealing message:", error);
      }
    }
  });
});

//import routes
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.routes.js";
import roomRoute from "./routes/room.route.js";
import branchRoute from "./routes/branch.route.js";
import memoryRoute from "./routes/memory.route.js";

//routes
app.use("/api/v1", userRoute);
app.use("/api/v1/chats", chatRoute);
app.use("/api/v1/rooms", roomRoute);
app.use("/api/v1/branch", branchRoute);
app.use("/api/v1/memory", memoryRoute);

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
