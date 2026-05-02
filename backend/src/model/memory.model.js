import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    branchId: {
        type: String,
        required: true,
        default: "main"
    },
    summary:{
        type: String,
        required: true
    },
    user_intent:{
        type: String,
        required: true
    },
    important_events:{
        type: [String],
        required: true
    },
    outcome:{
        type: String,
        required: true
    },
    importance_score:{
        type: Number,
        required: true
    }
})

export const Memory = mongoose.model("Memory", memorySchema)