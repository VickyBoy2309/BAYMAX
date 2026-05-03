const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// DB connection
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const labRoutes = require("./routes/labtestsRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Middleware imports
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Initialize app
const app = express();

// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/orders", orderRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is working perfectly" });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔥 Store users (VERY IMPORTANT for video call)
const users = {};

// Socket connection
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  // Call user
  socket.on("call-user", ({ to, offer, from }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit("call-made", {
        offer,
        from,
      });
    }
  });

  // Answer call
  socket.on("make-answer", ({ to, answer }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit("answer-made", {
        answer,
      });
    }
  });

  // ICE candidate
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit("ice-candidate", {
        candidate,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    // Remove user from list
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
