import { Room } from "../model/room.model.js";
import { User } from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createRoom = asyncHandler(async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ message: "Name and members are required" });
    }

    // Find users by usernames
    const users = await User.find({ username: { $in: members } }).select("_id");
    if (users.length !== members.length) {
      return res.status(400).json({ message: "Some members not found" });
    }

    const memberIds = users.map((user) => user._id);
    memberIds.push(req.user._id); // Add creator

    const room = await Room.create({
      name,
      members: memberIds,
    });

    res.status(201).json({ room, message: "Room created successfully" });
  } catch (error) {
    console.log(error.message);
  }
});

export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ members: req.user._id }).populate(
    "members",
    "username",
  );
  res.status(200).json({ rooms });
});
