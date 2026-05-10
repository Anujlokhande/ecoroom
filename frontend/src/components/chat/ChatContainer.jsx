import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { socket } from "../../utils/socket";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Breadcrumbs from "../navigation/Breadcrumb";
import { useBranch } from "../../context/BranchContext";
import axios from "axios";
import { ActiveMembersContext } from "../../context/ActiveMembersContext";

export default function ChatContainer({ selectedRoomId}) {
  const { user } = useContext(AuthContext);
  const { resetToMain } = useBranch();
  const [branches, setBranches] = useState([]);
  const { members, setMembers } = useContext(ActiveMembersContext);

  // Fetch the branch list for the current room
  useEffect(() => {
    if (!selectedRoomId) {
      setBranches([]);
      return;
    }
    axios
      .get(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/branch/getbranches/${selectedRoomId}`,
        { withCredentials: true },
      )
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Failed to fetch branches:", err));
  }, [selectedRoomId]);

  // Reset branch navigation whenever the user switches rooms
  useEffect(() => {
    resetToMain();
  }, [selectedRoomId]);

  // Join / leave socket room
  useEffect(() => {
    if (!selectedRoomId || !user) return;

    socket.emit("join-room", {
      roomId: selectedRoomId,
      username: user.username,
    });

    const handleMemberJoin = (username) => {
      if(members.includes(username)) return;
      setMembers((prev) => [...prev, username]);
    };

    const handleActiveMembers = (activeMembers) => {
      setMembers(activeMembers);
    };

    socket.on("member-joined", handleMemberJoin);
    socket.on("active-members", handleActiveMembers);

    const handleNewBranch = (newBranch) => {
      setBranches((prev) => {
        // Prevent duplicate branch entries if we get it twice
        if (prev.some((b) => String(b._id) === String(newBranch._id))) return prev;
        return [...prev, newBranch];
      });
    };

    const handleMemberLeave = (username) => {
      setMembers((prev) => prev.filter((member) => member !== username));
    };

    socket.on("new-branch", handleNewBranch);
    socket.on("member-left", handleMemberLeave);

    return () => {
      socket.off("new-branch", handleNewBranch);
      socket.off("member-joined", handleMemberJoin);
      socket.off("active-members", handleActiveMembers);
      socket.off("member-left", handleMemberLeave);
      socket.emit("leave-room", {
        roomId: selectedRoomId,
        username: user.username,
      });
    };
  }, [selectedRoomId, user]);

  console.log("from chat container", members);

  return (
    <>
      <div className="chat-header">
        <Breadcrumbs branches={branches} />
      </div>
      <MessageList selectedRoomId={selectedRoomId} branches={branches} setBranches={setBranches} />
      <MessageInput selectedRoomId={selectedRoomId} />
    </>
  );
}
