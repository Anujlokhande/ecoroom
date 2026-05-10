import React from "react";
import AuraGrid from "./AuraGrid";
import MemoryList from "./MemoryList";

export default function SidebarRight({memoryChips, selectedRoomId}) {
  return (
    <>
      <AuraGrid selectedRoomId={selectedRoomId} />
      <MemoryList memoryChips={memoryChips} />
    </>
  );
}
