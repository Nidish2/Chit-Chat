import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client"; // Import socket-io

const ChatContext = createContext();

// Define Endpoint globally
const ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://chit-chat-a-real-time-chatting-app.onrender.com"
    : "http://localhost:5000";
var socket; // Global variable for this file

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) history.push("/");
  }, [history]);

  useEffect(() => {
    if (user) {
      // ✅ Socket connects ONCE when user logs in
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => {});

      socket.on("message received", (newMessageReceived) => {
        // If the received message is not from the currently selected chat, show notification
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          setNotification((prev) => {
            // Check if this message is not already in notifications
            if (!prev.some((n) => n._id === newMessageReceived._id)) {
              return [newMessageReceived, ...prev];
            }
            return prev;
          });

          // Play notification sound
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2066/2066-preview.mp3"
          );
          audio.play().catch((error) => {
            console.warn(
              "Audio play failed (likely due to browser autoplay policy or network):",
              error
            );
          });
        }
      });
    }
  }, [user, selectedChat]); // Re-run if user or selectedChat changes

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket: socket || null, // Ensure socket is always defined (even if null)
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
