import { SendHorizontal } from "lucide-react";
import React, { useState, useContext } from "react";
import { socket } from "../../utils/socket";
import { AuthContext } from "../../context/AuthContext";
import { useBranch } from "../../context/BranchContext";

export default function MessageInput({ selectedRoomId }) {
  const [message, setMessage] = useState("");
  const { user } = useContext(AuthContext);
  const { currentBranch } = useBranch();

  const sendMessage = () => {
    if (message.trim() && user && selectedRoomId) {
      socket.emit("chat-msg", {
        username: user.username,
        msg: message.trim(),
        roomId: selectedRoomId,
        branchId: currentBranch.id,
      });
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="p-4 bg-black/20 border-t border-gray-800 shrink-0">
      <div className="relative flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message to EchoRoom..."
          className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-shadow border border-gray-700 placeholder-gray-500 "
        />
        <button
          onClick={sendMessage}
          className=" text-white rounded-lg transition-shadow  px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        >
          <SendHorizontal size={20} />
        </button>
        {currentBranch.name != "General" ? (
          <button
            className=" text-red-300 text-sm rounded-xl  transition-shadow  px-3 py-1 hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            Merge
          </button>
        ) : null}
      </div>
    </div>
  );
}
