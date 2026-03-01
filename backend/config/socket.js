const { Server } = require("socket.io");

const initSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "https://chit-chat-real-time-app.vercel.app",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["my-custom-header"],
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      if (!userData || !userData._id) {
        console.log("Setup failed: No User ID");
        return;
      }
      socket.join(userData._id);
      console.log("User Connected & Joined Room:", userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Chat Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
      const chat = newMessageReceived.chat;
      if (!chat.users) return console.log("chat.users not defined");

      // Get the sender's ID for comparison
      const senderId = newMessageReceived.sender._id.toString();
      
      // Emit to all users in the chat except the sender
      chat.users.forEach((user) => {
        const userId = user._id.toString();
        // Skip the sender - they already know they sent a message
        if (userId === senderId) return;
        
        // Send notification and message to this user
        io.to(userId).emit("message received", newMessageReceived);
        console.log(`Message sent to user ${userId} from ${senderId}`);
      });
      
      // Also emit to the sender but only for their own chat updates
      // This ensures the sender sees their own message in real-time
      // io.to(senderId).emit("message received", newMessageReceived);
    });

    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
    });
  });

  return io;
};

module.exports = initSocket;
