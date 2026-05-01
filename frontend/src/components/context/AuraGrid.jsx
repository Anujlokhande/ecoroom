import React from "react";
import { Users } from "lucide-react";

export default function AuraGrid() {
  const activeUsers = [
    { id: 1, auraColor: "rgba(52, 211, 153, 0.6)" }, // Emerald
    { id: 2, auraColor: "rgba(96, 165, 250, 0.6)" }, // Blue
    { id: 3, auraColor: "rgba(248, 113, 113, 0.6)" }, // Red
    { id: 4, auraColor: "rgba(167, 139, 250, 0.6)" }, // Purple
  ];

  return (
    <div className="p-5 border-b border-gray-800 shrink-0">
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <Users size={16} />
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Presence Auras
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="aspect-square rounded-full bg-gray-800 border border-gray-600 transition-all duration-300 hover:scale-110 cursor-pointer"
            style={{
              boxShadow: `0 0 15px ${user.auraColor}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
