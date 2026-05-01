import React, { useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../../utils/socket";

export default function RoomList({ selectedRoomId, setSelectedRoomId }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  const getRooms = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/rooms`,
        {
          withCredentials: true,
        },
      );
      console.log(res);
      setRooms(res.data.rooms);
      // Set first room as selected if none selected
      if (res.data.rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(res.data.rooms[0]._id);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getRooms();
  }, [selectedRoomId]);

  useEffect(() => {
    const handleCreateRoom = async (msg) => {
      console.log("Room update received:", msg);
      await getRooms();
    };

    socket.on("create-room", handleCreateRoom);

    return () => {
      socket.off("create-room", handleCreateRoom);
    };
  }, []);

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-xl font-bold mb-8 tracking-wide text-gray-100">
        EchoRoom
      </h1>
      <button
        onClick={() => navigate("/create-room")}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 group mb-4"
      >
        <Plus
          size={18}
          className="group-hover:text-emerald-400 transition-colors"
        />
        <span className="font-medium">Create Room</span>
      </button>
      <nav className="flex-1 space-y-1">
        {rooms.map((room, idx) => (
          <button
            onClick={() => {
              setSelectedRoomId(room._id);
            }}
            key={idx}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              selectedRoomId === room._id
                ? "text-white bg-gray-800"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <MessageSquare
              size={18}
              className="group-hover:text-emerald-400 transition-colors"
            />
            <span className="font-medium">{room.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
