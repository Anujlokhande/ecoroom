import { Chat } from "../model/chat.model.js";
import { Room } from "../model/room.model.js";

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { branchId = "main" } = req.query;
    console.log("room Id: ", roomId);
    if (!roomId) {
      return res.status(404).json({ msg: "Room Id not found" });
    }
    const messages = await Chat.find({ roomId, branchId })
      .populate("senderId", "username")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Error while fetching messages" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const rooms = await Room.find({
      members: id,
    });
    if (!rooms) {
      res.status(400).json({ msg: "no rooms availble" });
    }
    res.status(200).json(rooms);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "something went wrong in fetching rooms" });
  }
};
