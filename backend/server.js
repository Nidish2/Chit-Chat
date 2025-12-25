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

// -----------------------------------------------------------------------------
// ✅ FIX: Allow Cross-Origin Popups (Google Login Security Policy)
// This tells the browser: "It's okay for popups (like Google) to talk to this window."
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// // CORS configuration (Optional if you need it later)
// const corsOptions = {
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));

app.use(express.json()); // Accept JSON data

// ----------------- API Routes -----------------
app.use("/api/user", userRouters);
app.use("/api/chat", chatRouters);
app.use("/api/message", messageRouters);

// ----------------- Deployment Setup -----------------
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  // Serve static files from the React frontend build folder
  app.use(express.static(path.join(__dirname1, "frontend", "build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is Running Successfully");
  });
}
// -----------------------------------------------------

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`.yellow.bold);
});

// Initialize Socket.io
initSocket(server);
