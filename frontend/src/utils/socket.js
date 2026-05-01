import { io } from "socket.io-client";
const URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export const socket = io(URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});
