const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const cors = require("cors");
const userRouters = require("./routers/userRouters");
const chatRouters = require("./routers/chatRouters");
const messageRouters = require("./routers/messageRouters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const initSocket = require("./config/socket");

dotenv.config();
connectDB();

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(
  cors({
    origin: "https://chit-chat-real-time-app.vercel.app", // Your Vercel domain
    credentials: true,
  }),
);

app.use(express.json()); // Accept JSON data

// ----------------- API Routes -----------------
app.use("/api/user", userRouters);
app.use("/api/chat", chatRouters);
app.use("/api/message", messageRouters);

// ----------------- Deployment Setup -----------------
app.get("/", (req, res) => {
  res.send("Chit-Chat API is running successfully!");
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`.yellow.bold);
});

// Initialize Socket.io
initSocket(server);
