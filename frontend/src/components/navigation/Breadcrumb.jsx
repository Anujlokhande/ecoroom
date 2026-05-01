import { ChevronRight, GitBranch, Home, ChevronDown, MessageSquare } from "lucide-react";
import { useBranch } from "../../context/BranchContext";
import { useState, useRef, useEffect } from "react";

export default function Breadcrumb({ branches = [] }) {
  const { branchStack, jumpTo, jumpToBranch, currentBranch } = useBranch();
  const isInBranch = branchStack.length > 1;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-black/10 shrink-0 relative">
      <div className="flex items-center gap-1 text-sm font-medium min-w-0">
        {/* Static app label */}
        <span className="text-gray-500 shrink-0">EchoRoom</span>
        <ChevronRight size={14} className="text-gray-700 shrink-0" />

        {/* Branch stack — one item per level */}
        {branchStack.map((branch, idx) => {
          const isLast = idx === branchStack.length - 1;
          const isMain = idx === 0;

          return (
            <span key={branch.id} className="flex items-center gap-1 min-w-0">
              {/* Separator between stack items */}
              {idx > 0 && (
                <ChevronRight size={14} className="text-gray-600 shrink-0" />
              )}

              <button
                onClick={() => !isLast && jumpTo(idx)}
                disabled={isLast}
                className={[
                  "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-150 text-sm truncate max-w-[180px]",
                  isLast
                    ? "text-white font-semibold cursor-default"
                    : "text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer",
                ].join(" ")}
                title={branch.name}
              >
                {isMain ? (
                  <Home size={13} className="shrink-0" />
                ) : (
                  <GitBranch size={13} className="shrink-0 text-emerald-400" />
                )}
                <span className="truncate">{branch.name}</span>
              </button>
            </span>
          );
        })}

        {/* Visual indicator when inside a branch */}
        {isInBranch && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800 shrink-0">
            branch
          </span>
        )}
      </div>

      {/* Branches Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-md transition-colors"
        >
          <GitBranch size={14} />
          <span>All Branches ({branches.length})</span>
          <ChevronDown size={14} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  jumpTo(0); // Jump back to main
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                  currentBranch.id === "main" ? "bg-emerald-900/40 text-emerald-400" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <MessageSquare size={14} className={currentBranch.id === "main" ? "text-emerald-400" : "text-gray-500"} />
                <span className="flex-1 truncate font-medium">Main Chat</span>
                {currentBranch.id === "main" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                )}
              </button>

              {branches.length > 0 && <div className="h-px bg-gray-800 my-1 mx-2" />}

              {branches.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No branches yet
                </div>
              ) : (
                branches.map((b) => {
                  const isActive = currentBranch.id === String(b._id);
                  return (
                    <button
                      key={b._id}
                      onClick={() => {
                        if (!isActive) {
                          jumpToBranch({ id: String(b._id), name: b.name });
                        }
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                        isActive ? "bg-emerald-900/40 text-emerald-400" : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <GitBranch size={14} className={isActive ? "text-emerald-400" : "text-gray-500"} />
                      <span className="flex-1 truncate">{b.name}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
