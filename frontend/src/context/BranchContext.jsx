// context/BranchContext.jsx
import { createContext, useContext, useState } from "react";

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [branchStack, setBranchStack] = useState([
    { id: "main", name: "General" },
  ]);

  const currentBranch = branchStack[branchStack.length - 1];

  const enterBranch = (branch) => {
    // branch = { id: "branch_xyz", name: "Trip Planning" }
    setBranchStack((prev) => [...prev, branch]);
  };

  const goBack = () => {
    if (branchStack.length === 1) return; // can't go back from main
    setBranchStack((prev) => prev.slice(0, -1));
  };

  const jumpTo = (index) => {
    setBranchStack((prev) => prev.slice(0, index + 1));
  };

  const resetToMain = () => {
    setBranchStack([{ id: "main", name: "General" }]);
  };

  // Jump directly to any branch (resets path to [main, targetBranch])
  const jumpToBranch = (branch) => {
    setBranchStack([{ id: "main", name: "General" }, branch]);
  };

  return (
    <BranchContext.Provider
      value={{
        branchStack,
        currentBranch,
        enterBranch,
        goBack,
        jumpTo,
        jumpToBranch,
        resetToMain,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
