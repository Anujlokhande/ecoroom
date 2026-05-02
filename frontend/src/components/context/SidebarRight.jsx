import React from "react";
import AuraGrid from "./AuraGrid";
import MemoryList from "./MemoryList";

export default function SidebarRight({memoryChips}) {
  return (
    <>
      <AuraGrid />
      <MemoryList memoryChips={memoryChips} />
    </>
  );
}
