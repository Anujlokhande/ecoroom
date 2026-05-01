import React, { useEffect, useRef, useState, useContext } from "react";
import { socket } from "../../utils/socket";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useBranch } from "../../context/BranchContext";

export default function MessageList({ selectedRoomId, branches, setBranches }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const bottomRef = useRef(null);

  const { currentBranch, enterBranch } = useBranch();

  const handleCreateBranch = async (targetMsg) => {
    const name = prompt("Branch name?");
    if (!name) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/branch/create`,
        {
          name,
          roomId: selectedRoomId,
          parentMessageId: String(targetMsg._id),
        },
        { withCredentials: true },
      );
      const newBranch = res.data;

      const normalisedBranch = {
        ...newBranch,
        _id: String(newBranch._id),
        parentMessageId: String(newBranch.parentMessageId),
      };

      setBranches((prev) => [...prev, normalisedBranch]);
      socket.emit("new-branch", normalisedBranch);

      enterBranch({ id: String(newBranch._id), name: newBranch.name });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }
    setMessages([]);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/chats/${selectedRoomId}`,
          {
            params: { branchId: currentBranch.id },
            withCredentials: true,
          },
        );

        const fetchedMessages = res.data.messages || [];

        const transformed = fetchedMessages.map((m) => ({
          _id: m._id,
          username: m.senderId.username,
          msg: m.text,
          createdAt: m.createdAt,
          branchId: m.branchId,
          isTimeCapsule: m.isTimeCapsule,
          revealedAt: m.revealedAt,
        }));

        setMessages(transformed);

        transformed.forEach((m) => {
          if (m.isTimeCapsule) {
            handleRevealTimeCapsule(m);
          }
        });
      } catch (error) {
        console.log("Error fetching messages:", error.message);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedRoomId, currentBranch.id]);

  const handleRevealTimeCapsule = (msg) => {
    const now = new Date();
    const releaseDate = new Date(msg.revealedAt);
    const timeMs = releaseDate - now;

    if (timeMs > 0) {
      const timer = setTimeout(() => {
        socket.emit("reveal-time-capsule", {
          roomId: selectedRoomId,
          messageId: msg._id,
        });
        alert("revealed message");
      }, timeMs);

      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    const handleMsg = (msg) => {
      if ((msg.branchId || "main") !== currentBranch.id) return;

      const newMsg = {
        _id: msg._id,
        username: msg.username,
        msg: msg.msg,
        createdAt: msg.createdAt || new Date(),
        branchId: msg.branchId || "main",
        isTimeCapsule: msg.isTimeCapsule,
        revealedAt: msg.revealedAt,
      };

      setMessages((prev) => [...prev, newMsg]);

      if (msg.isTimeCapsule) {
        handleRevealTimeCapsule(msg);
      }
    };

    const handleReveal = (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(msg._id)
            ? { ...m, msg: msg.msg, isTimeCapsule: false }
            : m
        )
      );
    };

    socket.on("chat-msg", handleMsg);
    socket.on("reveal-time-capsule", handleReveal);

    return () => {
      socket.off("chat-msg", handleMsg);
      socket.off("reveal-time-capsule", handleReveal);
    };
  }, [currentBranch.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getBranchForMessage = (msgId) => {
    const id = String(msgId);
    return branches?.find((b) => {
      const pmid = b.parentMessageId;
      if (pmid && typeof pmid === "object") return String(pmid._id) === id;
      return String(pmid) === id;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth hide-scrollbar">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center ">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
            {currentBranch.id === "main" ? "💬" : "⎇"}
          </div>
          <p className="text-gray-400 font-medium">
            {currentBranch.id === "main"
              ? "No messages yet. Say something!"
              : `You're inside branch "${currentBranch.name}"`}
          </p>
        </div>
      )}

      {messages.map((msg, index) => {
        const isOwnMessage = msg.username === user?.username;
        const childBranch = getBranchForMessage(msg._id);
        const branchId = childBranch ? String(childBranch._id) : null;

        return (
          <div
            key={index}
            className={`flex gap-3 group items-end ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            {!isOwnMessage && (
              <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 flex items-center justify-center text-xs font-semibold text-gray-300">
                {msg.username?.[0]?.toUpperCase()}
              </div>
            )}

            {/* 🔥 LEFT badge for own messages */}
            {!msg.isTimeCapsule && isOwnMessage && (
              <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-slate-400 cursor-pointer">
                <span className="text-emerald-500">⎇</span>
                {childBranch ? (
                  <span
                    onClick={() =>
                      enterBranch({ id: branchId, name: childBranch.name })
                    }
                  >
                    {childBranch.name}
                  </span>
                ) : (
                  <span onClick={() => handleCreateBranch(msg)}>
                    {loading ? "…" : "Branch"}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1 max-w-xs lg:max-w-md">
              {!isOwnMessage && (
                <div className="flex items-baseline gap-2 px-1">
                  <span className="text-xs font-semibold text-gray-300">
                    {msg.username}
                  </span>
                </div>
              )}

              <div
                className={`px-4 py-2.5 text-sm ${
                  isOwnMessage
                    ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm"
                    : "bg-gray-700 text-gray-300 rounded-2xl rounded-bl-sm"
                }`}
              >
                {msg.msg}
              </div>
            </div>

            {/* 🔥 RIGHT badge for others */}
            {!msg.isTimeCapsule && !isOwnMessage && (
              <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-slate-400 cursor-pointer">
                <span className="text-emerald-500">⎇</span>
                {childBranch ? (
                  <span
                    onClick={() =>
                      enterBranch({ id: branchId, name: childBranch.name })
                    }
                  >
                    {childBranch.name}
                  </span>
                ) : (
                  <span onClick={() => handleCreateBranch(msg)}>
                    {loading ? "…" : "Branch"}
                  </span>
                )}
              </div>
            )}

            {isOwnMessage && (
              <div className="w-8 h-8 rounded-full bg-emerald-600 shrink-0 flex items-center justify-center text-xs font-semibold text-white">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}