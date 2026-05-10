import React, { useContext } from "react";
import { Users } from "lucide-react";
import { ActiveMembersContext } from "../../context/ActiveMembersContext";
import { AuthContext } from "../../context/AuthContext";
import { socket } from "../../utils/socket";

const STATUS_COLORS = {
  "Relaxed": "rgba(52, 211, 153, 0.6)", // Emerald
  "Focused": "rgba(96, 165, 250, 0.6)", // Blue
  "Busy": "rgba(248, 113, 113, 0.6)", // Red
  "Deep Work": "rgba(167, 139, 250, 0.6)" // Purple
};

const STATUS_ORDER = ["Relaxed", "Focused", "Busy", "Deep Work"];

export default function AuraGrid({ selectedRoomId }) {
  const {members} = useContext(ActiveMembersContext);
  const { user } = useContext(AuthContext);

  const handleAvatarClick = (memberObj) => {
    if (!user || memberObj.username !== user.username || !selectedRoomId) return;

    const currentIndex = STATUS_ORDER.indexOf(memberObj.status || "Relaxed");
    const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];

    socket.emit("update-status", { roomId: selectedRoomId, status: nextStatus });
  };

  return (
    <div className="p-5 border-b border-gray-800 shrink-0">
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <Users size={16} />
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Presence Auras
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {members && members.map((memberObj,idx) => (
          <div
            key={idx}
            className={`relative aspect-square rounded-full bg-gray-800 border border-gray-600 transition-all duration-300 hover:scale-110 ${user && memberObj.username === user.username ? 'cursor-pointer' : ''}`}
            style={{
              boxShadow: `0 0 15px ${STATUS_COLORS[memberObj.status || "Relaxed"]}`,
            }}
            onClick={() => handleAvatarClick(memberObj)}
            title={`${memberObj.username} - ${memberObj.status || "Relaxed"}`}
          >
            {memberObj.avatar ? (
              <img src={memberObj.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                {memberObj.username.charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
