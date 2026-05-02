import React, { useState } from "react";
import RoomList from "../navigation/RoomList";
import ChatContainer from "../chat/ChatContainer";
import SidebarRight from "../context/SidebarRight";
import { socket } from "../../utils/socket";
import { useEffect } from "react";
import { useBranch } from "../../context/BranchContext";
import axios from "axios";

export default function MainLayout() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [memoryChips, setMemoryChips] = useState([]);
  const [filteredMemoryChips, setFilteredMemoryChips] = useState([]);
  const { currentBranch } = useBranch();
  
  useEffect(() => {
    const handleMemoryChips = (data) => {
      setMemoryChips((prev) => [...prev, data]);
    };
    
    socket.on("memory-chips", handleMemoryChips);
    return () => {
      socket.off("memory-chips", handleMemoryChips);
    };
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    setMemoryChips([]);
    axios
      .get(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/memory/get-memory-chip/${selectedRoomId}`, {
        withCredentials: true,
      })
      .then(response => {
        const chips = response.data;
        setMemoryChips(chips);
      })
      .catch(error => console.error("Error fetching memories:", error));
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId || !currentBranch) {
      setFilteredMemoryChips([]);
      return;
    }

    const filteredChips = memoryChips.filter(
      (memory) => memory.roomId === selectedRoomId && memory.branchId === currentBranch.id
    );
    setFilteredMemoryChips(filteredChips);
  }, [memoryChips, selectedRoomId, currentBranch]);

  return (
    <div
      className="h-screen w-full flex overflow-hidden transition-colors duration-500 ease-in-out text-gray-100"
      style={{ backgroundColor: "var(--ambient-bg, #0f172a)" }} // Default to slate-900
    >
      {/* Left Sidebar - 20% */}
      <div className="w-[20%] h-full border-r border-gray-800 bg-black/20">
        <RoomList
          selectedRoomId={selectedRoomId}
          setSelectedRoomId={setSelectedRoomId}
        />
      </div>

      {/* Main Chat Window - 60% */}
      <div className="w-[60%] h-full flex flex-col">
        <ChatContainer selectedRoomId={selectedRoomId} />
      </div>

      {/* Right Sidebar - 20% */}
      <div className="w-[20%] h-full border-l border-gray-800 bg-black/20 flex flex-col">
        <SidebarRight memoryChips={filteredMemoryChips} />
      </div>
    </div>
  );
}
