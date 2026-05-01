import React from "react";
import { Brain } from "lucide-react";

export default function MemoryList() {
  const memories = [
    "Defined socket event schema",
    "Optimized React re-renders",
    "Discussed UI architecture",
    "Linked sentiment API",
  ];

  return (
    // flex-1 here allows the memory list to fill the remaining vertical space of the sidebar
    <div className="p-5 flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-gray-400 shrink-0">
        <Brain size={16} />
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Memories
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {memories.map((memory, i) => (
          <div
            key={i}
            className="bg-gray-800/40 p-3.5 rounded-lg border border-gray-700/50 text-sm text-gray-300 hover:bg-gray-800/80 transition-colors cursor-default"
          >
            {memory}
          </div>
        ))}
      </div>
    </div>
  );
}
