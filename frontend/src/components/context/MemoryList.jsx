import React, { useState } from "react";
import { Brain, X, Zap, Target, ListChecks, CheckCircle2 } from "lucide-react";

// --- Memory Detail Modal ---
function MemoryModal({ memory, onClose }) {
  if (!memory) return null;

  const score = memory.importance_score ?? 0;
  const scoreColor =
    score >= 8
      ? "#22d3ee"
      : score >= 5
      ? "#a78bfa"
      : "#6b7280";

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-lg mx-auto rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(145deg, #13151f 0%, #1a1d2e 100%)",
          maxHeight: "85vh",
          animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)`,
            opacity: 0.8
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0 ">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-2xl"
              style={{ background: `${scoreColor}15` }}
            >
              <Brain size={24} style={{ color: scoreColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100 tracking-wide">
                Memory Detail
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Zap size={14} style={{ color: scoreColor }} />
                <span className="text-xs font-semibold" style={{ color: scoreColor }}>
                  Importance Score: {score}/10
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 bg-gray-800/50 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-8 h-px bg-gray-800/80 shrink-0" />

        {/* Body */}
        <div className="px-8 py-6 space-y-8 overflow-y-auto hide-scrollbar">
          {/* Summary */}
          {memory.summary && (
            <Section
              icon={<Brain size={18} className="text-violet-400" />}
              label="Summary"
            >
              <p className="text-base text-gray-200 leading-relaxed font-medium">
                {memory.summary}
              </p>
            </Section>
          )}

          {/* User Intent */}
          {memory.user_intent && (
            <Section
              icon={<Target size={18} className="text-cyan-400" />}
              label="User Intent"
            >
              <p className="text-[15px] text-gray-400 leading-relaxed">
                {memory.user_intent}
              </p>
            </Section>
          )}

          {/* Important Events */}
          {memory.important_events?.length > 0 && (
            <Section
              icon={<ListChecks size={18} className="text-amber-400" />}
              label="Important Events"
            >
              <ul className="space-y-3">
                {memory.important_events.map((evt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[15px] text-gray-300 bg-[#1a1d2e]/50 p-4 rounded-xl border border-gray-800/50">
                    <span
                      className="mt-1.5 shrink-0 w-2 h-2 rounded-full"
                      style={{ background: "#f59e0b", boxShadow: "0 0 8px #f59e0b55" }}
                    />
                    <span className="leading-relaxed">{evt}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Outcome */}
          {memory.outcome && (
            <Section
              icon={<CheckCircle2 size={18} className="text-emerald-400" />}
              label="Outcome"
            >
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl">
                <p className="text-[15px] text-emerald-200/90 leading-relaxed">
                  {memory.outcome}
                </p>
              </div>
            </Section>
          )}

          {/* Fallback: plain string memory */}
          {typeof memory === "string" && (
            <p className="text-base text-gray-300 leading-relaxed">{memory}</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}

function Section({ icon, label, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </span>
      </div>
      <div className="pl-1">
        {children}
      </div>
    </div>
  );
}

// --- Main MemoryList ---
export default function MemoryList({memoryChips}) {
  const [selectedMemory, setSelectedMemory] = useState(null);

  // const memories = [
  //   {
  //     summary: "Defined socket event schema and optimized React re-renders for the EchoRoom chat UI.",
  //     user_intent: "Improve real-time performance and establish a clear event contract between frontend and backend.",
  //     important_events: [
  //       "Socket event schema was finalized with agreed field names.",
  //       "React component memoization was applied to prevent unnecessary re-renders.",
  //     ],
  //     outcome: "Stable real-time communication achieved with reduced render cycles.",
  //     importance_score: 8,
  //   },
  //   {
  //     summary: "Discussed UI architecture and component hierarchy for the sidebar panels.",
  //     user_intent: "Decide how to split the right sidebar into AuraGrid and MemoryList sections.",
  //     important_events: [
  //       "SidebarRight was split into two sub-components.",
  //       "Flex layout was chosen for responsive stacking.",
  //     ],
  //     outcome: "Clean component separation implemented and deployed.",
  //     importance_score: 6,
  //   },
  //   {
  //     summary: "Linked the sentiment analysis API to incoming messages.",
  //     user_intent: "Tag each message with an emotional tone for context-aware replies.",
  //     important_events: [
  //       "Sentiment API endpoint integrated into the message handler.",
  //       "Tone labels stored alongside each message object.",
  //     ],
  //     outcome: "Messages now carry a sentiment score visible in the Aura grid.",
  //     importance_score: 7,
  //   },
  //   {
  //     summary: "Implemented the Time Capsule feature for scheduled message delivery.",
  //     user_intent: "Allow users to send messages that are revealed at a future date.",
  //     important_events: [
  //       "Backend scheduling logic added using setTimeout with persistence.",
  //       "Frontend masked message UI built with reveal animation.",
  //     ],
  //     outcome: "Time Capsule messages are delivered and auto-revealed on schedule.",
  //     importance_score: 9,
  //   },
  // ];
  console.log(memoryChips);

  return (
    <div className="p-5 flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-gray-400 shrink-0">
        <Brain size={16} />
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Memory Chips
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 hide-scrollbar">
        {memoryChips?.length > 0 ? memoryChips.map((memory, i) => {
          const label =
            typeof memory === "string" ? memory : memory.summary;
          const score =
            typeof memory === "object" ? memory.importance_score : null;

          const scoreColor = 
            score >= 8 ? "#22d3ee" : 
            score >= 5 ? "#a78bfa" : 
            "#6b7280";

          return (
            <div
              key={i}
              onClick={() => setSelectedMemory(memory)}
              className="group relative py-3 px-3 rounded-lg cursor-pointer transition-colors duration-200 select-none hover:bg-gray-800/30"
            >
              {/* Minimal score indicator line */}
              {score != null && (
                <div 
                  className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full transition-all duration-200 group-hover:w-1 opacity-60 group-hover:opacity-100"
                  style={{ background: scoreColor }}
                />
              )}

              <div className="pl-2 flex flex-col gap-1.5">
                <p className="text-[13px] text-gray-400 group-hover:text-gray-200 transition-colors line-clamp-2 leading-relaxed">
                  {label}
                </p>
                {score != null && (
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Zap size={10} style={{ color: scoreColor }} />
                    <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: scoreColor }}>
                      Importance: {score}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        }): <p className="text-gray-400 text-sm">No Memory Chips</p>}
      </div>

      {/* Modal */}
      <MemoryModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />
    </div>
  );
}
