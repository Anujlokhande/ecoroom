import { SendHorizontal, Clock, CalendarDays, X } from "lucide-react";
import React, { useState, useContext, useEffect, useRef } from "react";
import { socket } from "../../utils/socket";
import { AuthContext } from "../../context/AuthContext";
import { useBranch } from "../../context/BranchContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import format from "date-fns/format";

export default function MessageInput({ selectedRoomId}) {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const datePickerRef = useRef(null);
  const sendButtonRef = useRef(null);

  const { user } = useContext(AuthContext);
  const { currentBranch } = useBranch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        sendButtonRef.current &&
        !sendButtonRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDatePickerOpen]);

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

  const handleCreateTimeCapsule = () => {
    if (!date) {
      alert("Please select a date and time for the time capsule.");
      return;
    }
    if (message.trim() && user && selectedRoomId) {
      socket.emit("capsule-msg", {
        username: user.username,
        msg: message.trim(),
        roomId: selectedRoomId,
        branchId: currentBranch.id,
        timeCapsule: true,
        releaseAt: date.toISOString(), 
      });
      setMessage("");
      setDate(null);
    }
  };

  const handleSend = () => {
    if (isDatePickerOpen) {
      handleCreateTimeCapsule();
      setIsDatePickerOpen(false);
    } else {
      sendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {/* Custom DatePicker dark theme styles */}
      <style>{`
        .capsule-picker .react-datepicker {
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        .capsule-picker .react-datepicker__header {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          padding-top: 0 !important;
        }
        .capsule-picker .react-datepicker__current-month {
          color: #fff !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          padding: 4px 0 8px !important;
        }
        .capsule-picker .react-datepicker__day-name {
          color: #6ee7b7 !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          width: 2rem !important;
        }
        .capsule-picker .react-datepicker__day {
          color: #d1d5db !important;
          border-radius: 8px !important;
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 1px !important;
          transition: background 0.15s, color 0.15s !important;
        }
        .capsule-picker .react-datepicker__day:hover {
          background: rgba(110, 231, 183, 0.15) !important;
          color: #6ee7b7 !important;
        }
        .capsule-picker .react-datepicker__day--selected,
        .capsule-picker .react-datepicker__day--keyboard-selected {
          background: #059669 !important;
          color: #fff !important;
          font-weight: 600 !important;
        }
        .capsule-picker .react-datepicker__day--outside-month {
          color: #4b5563 !important;
        }
        .capsule-picker .react-datepicker__day--disabled {
          color: #374151 !important;
          cursor: not-allowed !important;
        }
        .capsule-picker .react-datepicker__navigation-icon::before {
          border-color: #6ee7b7 !important;
        }
        .capsule-picker .react-datepicker__time-container {
          border-left: 1px solid rgba(255,255,255,0.08) !important;
          width: 90px !important;
        }
        .capsule-picker .react-datepicker__time-container .react-datepicker__time {
          background: transparent !important;
        }
        .capsule-picker .react-datepicker__time-container .react-datepicker__time-box {
          width: 90px !important;
        }
        .capsule-picker .react-datepicker__header--time {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          padding: 8px 0 !important;
        }
        .capsule-picker .react-datepicker-time__header {
          color: #6ee7b7 !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
        }
        .capsule-picker .react-datepicker__time-list-item {
          color: #d1d5db !important;
          font-size: 0.8rem !important;
          padding: 5px 0 !important;
          height: auto !important;
          line-height: 1.5 !important;
        }
        .capsule-picker .react-datepicker__time-list-item:hover {
          background: rgba(110, 231, 183, 0.15) !important;
          color: #6ee7b7 !important;
        }
        .capsule-picker .react-datepicker__time-list-item--selected {
          background: #059669 !important;
          color: #fff !important;
          font-weight: 600 !important;
        }
        .capsule-picker .react-datepicker__time-list {
          scrollbar-width: thin;
          scrollbar-color: #374151 transparent;
        }
        .capsule-picker .react-datepicker__month-container {
          float: left;
        }
      `}</style>

      <div className="p-4 bg-black/20 border-t border-gray-800 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to EchoRoom..."
            className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-shadow border border-gray-700 placeholder-gray-500"
          />
          <button
            ref={sendButtonRef}
            onClick={handleSend}
            className="text-white rounded-lg transition-shadow px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <SendHorizontal size={20} />
          </button>

          {/* time capsule */}
          <div className="relative flex items-center" ref={datePickerRef}>
            <button
              className={`flex items-center gap-1.5 text-sm font-medium rounded-xl transition-all duration-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
                isDatePickerOpen
                  ? "bg-emerald-700/80 text-emerald-100 shadow-lg shadow-emerald-900/30"
                  : "text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300"
              }`}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <Clock size={15} />
              Capsule
            </button>

            {isDatePickerOpen && (
              <div className="absolute bottom-[calc(100%+12px)] right-0 z-50 w-max">
                {/* Card */}
                <div className="bg-gray-950 border border-gray-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-emerald-400" />
                      <span className="text-sm font-semibold text-white">Schedule Time Capsule</span>
                    </div>
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* DatePicker */}
                  <div className="capsule-picker p-3">
                    <DatePicker
                      selected={date}
                      onChange={(d) => setDate(d)}
                      inline
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MM/dd/yyyy HH:mm"
                      minDate={new Date()}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900/60">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock size={12} className="text-emerald-500" />
                      {date
                        ? format(date, "MMM d, yyyy 'at' HH:mm")
                        : "No date selected"}
                    </span>
                    <button
                      onClick={() => {
                        handleCreateTimeCapsule();
                        setIsDatePickerOpen(false);
                      }}
                      disabled={!date || !message.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors duration-150"
                    >
                      <SendHorizontal size={12} />
                      Send Capsule
                    </button>
                  </div>
                </div>

                {/* Caret arrow */}
                <div className="flex justify-end pr-5">
                  <div className="w-3 h-3 bg-gray-800 rotate-45 -mt-1.5 border-r border-b border-gray-700/60" />
                </div>
              </div>
            )}
          </div>

          {/* merge */}
          {currentBranch.name != "General" ? (
            <button className="text-red-300 text-md rounded-xl transition-shadow px-3 py-2 hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
              Merge
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
