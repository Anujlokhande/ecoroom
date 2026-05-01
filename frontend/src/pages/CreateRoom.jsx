import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../utils/socket";

export default function CreateRoom() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !members.trim()) return;

    setLoading(true);
    try {
      const memberList = members
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);
      await axios.post(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/rooms`,
        { name: name.trim(), members: memberList },
        { withCredentials: true },
      );

      socket.emit("create-room", name);
      navigate("/chat");
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter room name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">
              Members (usernames, comma-separated)
            </label>
            <input
              type="text"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="user1, user2, user3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
