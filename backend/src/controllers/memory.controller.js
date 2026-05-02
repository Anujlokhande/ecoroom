import { Memory } from "../model/memory.model.js";

export const getMemoryChip = async (req, res) => {
    try {
        const { roomId } = req.params;
        // Fetch memories and sort them (newest first)
        const memoryChips = await Memory.find({ roomId }).sort({ _id: -1 });
        res.status(200).json(memoryChips);
    } catch (error) {
        console.error("Error fetching memory chips:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}