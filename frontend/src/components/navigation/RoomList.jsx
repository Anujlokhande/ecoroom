import React, { useEffect, useState, useContext } from "react";
import { MessageSquare, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../../utils/socket";
import { AuthContext } from "../../context/AuthContext";

export default function RoomList({ selectedRoomId, setSelectedRoomId }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  const getRooms = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/rooms`,
        {
          withCredentials: true,
        },
      );
      setRooms(res.data.rooms);
      // Set first room as selected if none selected
      if (res.data.rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(res.data.rooms[0]._id);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
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
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
              <div className="w-[18px] h-[18px] bg-gray-800 rounded"></div>
              <div className="flex-1 h-4 bg-gray-800 rounded"></div>
            </div>
          ))
        ) : (
          rooms.map((room, idx) => (
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
          ))
        )}
      </nav>

      {/* User Profile & Logout */}
      {user && (
        <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover bg-gray-800 border border-gray-600" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">{user.username}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={() => { logout(); navigate("/login"); }}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
