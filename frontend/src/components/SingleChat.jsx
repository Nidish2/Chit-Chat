import React, { useEffect, useState } from "react";
// ❌ REMOVE THIS: import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import {
  FormControl,
  Input,
  Box,
  Text,
  IconButton,
  Spinner,
  useToast,
  Flex,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";

var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  // ... states
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const toast = useToast();
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  // Get socket from context with null check
  const { selectedChat, user, socket } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      // ✅ USE GLOBAL SOCKET
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.type === "keydown" && event.key !== "Enter") return;
    if (
      (event.key === "Enter" || event.type === "click") &&
      newMessage.trim()
    ) {
      if (socket) {
        socket.emit("stop typing", selectedChat._id);
      }
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const messageContent = newMessage;
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          { content: messageContent, chatId: selectedChat._id },
          config
        );

        // ✅ USE GLOBAL SOCKET
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to Send Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  // Handle socket events with proper cleanup
  useEffect(() => {
    if (!socket) return; // Don't proceed if socket is not available

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleMessageReceived = (newMessageReceived) => {
      if (selectedChatCompare && selectedChatCompare._id === newMessageReceived.chat._id) {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    // Set up event listeners
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("message received", handleMessageReceived);

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("typing", handleTyping);
        socket.off("stop typing", handleStopTyping);
        socket.off("message received", handleMessageReceived);
      }
    };
  }, [socket, selectedChat]); // Re-run if socket or selectedChat changes

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // ... (Keep your typingHandler and Return JSX exactly the same) ...
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing logic
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    // ... (Your existing JSX code)
    // Just ensure the render part is untouched
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      width="100vw"
      maxWidth="100%"
      overflow="hidden"
    >
      {/* ... rest of your JSX ... */}
      {/* ... Just a quick check: Ensure <ScrollableChat messages={messages} /> is there ... */}
      {selectedChat ? (
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          borderRadius="lg"
          overflow="hidden"
        >
          {/* ... header ... */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            padding={3}
            bg="#E8E8E8"
            flex={1}
            overflowY="auto"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl id="message-input" isRequired marginTop={3}>
              {isTyping && (
                <div style={{ marginBottom: 10, marginLeft: 0 }}>
                  <Lottie
                    options={defaultOptions}
                    width={60}
                    height={50}
                  />
                </div>
              )}
              <Flex>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage}
                  flex={1}
                />
                <Button
                  onClick={sendMessage}
                  sx={{ ml: 2, background: "green.200", color: "black" }}
                >
                  Send
                </Button>
              </Flex>
            </FormControl>
          </Box>
        </Box>
      ) : (
        // ... empty state ...
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          bg="#F8F8F8"
          padding={3}
        >
          <Text fontSize="3xl" fontFamily="Work sans" color="gray.600">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
