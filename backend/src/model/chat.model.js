import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    branchId: { type: String, default: "main" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
    isTimeCapsule:{
      type: Boolean,
      default: false,
    },
    revealedAt:{
      type: Date,
      default: null,
    }
  },
  { timestamps: true },
);

export const Chat = new mongoose.model("Chat", messageSchema);
