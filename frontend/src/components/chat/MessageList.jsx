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

  // Create a new branch off a message 
  const handleCreateBranch = async (targetMsg) => {
    const name = prompt("Branch name?"); // replace with modal later
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
      // Normalise _id to string before storing
      const normalisedBranch = {
        ...newBranch,
        _id: String(newBranch._id),
        parentMessageId: String(newBranch.parentMessageId),
      };
      // Add to local branch list so the badge updates immediately
      setBranches((prev) => [...prev, normalisedBranch]);
      
      // Emit socket event to notify other clients in the room
      socket.emit("new-branch", normalisedBranch);

      // Navigate into the new branch
      enterBranch({ id: String(newBranch._id), name: newBranch.name });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch messages whenever room or branch changes ────────────────────────
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }
    setMessages([]);

    const fetchMessages = async () => {
      try {
        // Pass branchId as a query param — backend filters by it (default "main")
        const res = await axios.get(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/chats/${selectedRoomId}`,
          {
            params: { branchId: currentBranch.id },
            withCredentials: true,
          },
        );
        const fetchedMessages = res.data.messages || [];
        const transformed = fetchedMessages.map((m) => ({
          _id: m._id,           // ← keep _id so createBranch can use parentMessageId
          username: m.senderId.username,
          msg: m.text,
          createdAt: m.createdAt,
          branchId: m.branchId,
        }));
        setMessages(transformed);
      } catch (error) {
        console.log("Error fetching messages:", error.message);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedRoomId, currentBranch.id]);

  // ─── Real-time: only append messages belonging to the current branch ───────
  useEffect(() => {
    const handleMsg = (msg) => {
      // Filter by branch — only add to list if it matches what the user sees
      if ((msg.branchId || "main") !== currentBranch.id) return;
      setMessages((prev) => [
        ...prev,
        {
          _id: msg._id,
          username: msg.username,
          msg: msg.msg,
          createdAt: msg.createdAt || new Date(),
          branchId: msg.branchId || "main",
        },
      ]);
    };

    socket.on("chat-msg", handleMsg);
    return () => socket.off("chat-msg", handleMsg);
  }, [currentBranch.id]); // re-subscribe whenever branch changes

  // ─── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Helper: find a branch that branched off this message ─────────────────
  // parentMessageId may be a raw ObjectId string OR a populated Mongoose doc
  const getBranchForMessage = (msgId) => {
    const id = String(msgId);
    return branches?.find((b) => {
      const pmid = b.parentMessageId;
      // populated object: { _id: ObjectId, ... }
      if (pmid && typeof pmid === "object") return String(pmid._id) === id;
      // raw string / ObjectId
      return String(pmid) === id;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
            {currentBranch.id === "main" ? "💬" : "⎇"}
          </div>
          <p className="text-gray-400 font-medium">
            {currentBranch.id === "main"
              ? "No messages yet. Say something!"
              : `You're inside branch "${currentBranch.name}"`}
          </p>
          {currentBranch.id !== "main" && (
            <p className="text-gray-600 text-sm">Send the first message in this branch.</p>
          )}
        </div>
      )}

      {messages.map((msg, index) => {
        const isOwnMessage = msg.username === user?.username;
        const childBranch = getBranchForMessage(msg._id);
        // Normalise the childBranch id to a plain string before use
        const branchId = childBranch ? String(childBranch._id) : null;

        return (
          <div
            key={index}
            className={`flex gap-3 group items-end ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar — other user */}
            {!isOwnMessage && (
              <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 flex items-center justify-center text-xs font-semibold text-gray-300">
                {msg.username?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="flex flex-col gap-1 max-w-xs lg:max-w-md">
              {/* Sender name + time — other user */}
              {!isOwnMessage && (
                <div className="flex items-baseline gap-2 px-1">
                  <span className="text-xs font-semibold text-gray-300">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              {/* Bubble */}
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed ${
                  isOwnMessage
                    ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm"
                    : "bg-gray-700 text-gray-300 rounded-2xl rounded-bl-sm"
                }`}
              >
                {msg.msg}
              </div>

              {/* Time — own message */}
              {isOwnMessage && (
                <div className="flex justify-end px-1">
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Branch badge — hover reveal */}
            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-slate-400 cursor-pointer">
              <span className="text-emerald-500">⎇</span>

              {childBranch ? (
                // This message already has a branch — click to navigate into it
                <span
                  onClick={() =>
                    enterBranch({ id: branchId, name: childBranch.name })
                  }
                >
                  {childBranch.name}
                </span>
              ) : (
                // No branch yet — click to create one
                <span onClick={() => handleCreateBranch(msg)}>
                  {loading ? "…" : "Branch"}
                </span>
              )}
            </div>

            {/* Avatar — own user */}
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
