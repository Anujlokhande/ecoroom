import React, { useState } from "react";
import RoomList from "../navigation/RoomList";
import ChatContainer from "../chat/ChatContainer";
import SidebarRight from "../context/SidebarRight";

export default function MainLayout() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

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
        <SidebarRight />
      </div>
    </div>
  );
}
