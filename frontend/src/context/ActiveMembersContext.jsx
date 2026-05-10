import { useState } from "react";
import { createContext } from "react";

export const ActiveMembersContext = createContext();

export const ActiveMembersProvider = ({ children }) => {
    const [members, setMembers] = useState([]);
    return (
        <ActiveMembersContext.Provider value={{ members, setMembers }}>
            {children}
        </ActiveMembersContext.Provider>
    );
};