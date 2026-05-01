import { Branch } from "../model/branch.model.js";

export const createBranch = async (req, res) => {
  try {
    const { name, roomId, parentMessageId } = req.body;
    if (!name || !roomId || !parentMessageId) {
      return res
        .status(400)
        .json({ msg: "All fields are required for creating branch" });
    }
    const user = req.user;
    if (!user) {
      return res.status(400).json({ msg: "User must be logged in" });
    }
    const createdBranch = await Branch.create({
      name,
      roomId,
      parentMessageId,
      createdBy: user._id,
    });
    if (!createdBranch) {
      return res
        .status(400)
        .json({ msg: "Something went wrong while creating branch" });
    }
    res.status(201).json(createdBranch);
  } catch (error) {
    console.log("Error While Creating Branch: ", error.message);
    res.status(409).json({ msg: error.message });
  }
};

export const getBranchesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const branches = await Branch.find({ roomId })
      .populate("parentMessageId", "message")
      .populate("createdBy", "name");

    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
