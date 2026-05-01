const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Nomination = require("./models/Nomination");

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_change_this";

// MongoDB setup with Mongoose
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());

// Basic Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API server!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// UNCOMMENT FOR TEST.JS
// app.post("/api/test", (req, res) => {
//   const { data } = req.body;
//   res.json({ received: data, message: "Data received successfully" });
// });

// Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Nomination Endpoints
app.post("/api/nominations", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      streetAddress,
      neighborhood,
      nominatorId,
      nominatorName,
      nominatorEmail,
      title,
      description,
      photoUrl,
      category,
    } = req.body;

    // Validate required fields
    if (
      !latitude ||
      !longitude ||
      !streetAddress ||
      !nominatorId ||
      !nominatorName ||
      !nominatorEmail ||
      !title ||
      !description ||
      !category
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify category is valid
    const validCategories = [
      "bus stop",
      "park",
      "sidewalk",
      "schoolyard",
      "plaza",
      "other",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Create new nomination
    const newNomination = new Nomination({
      location: {
        latitude,
        longitude,
        streetAddress,
        neighborhood,
      },
      nominatorId,
      nominatorName,
      nominatorEmail,
      title,
      description,
      photoUrl: photoUrl || null,
      category,
    });

    await newNomination.save();

    res.status(201).json({
      message: "Nomination submitted successfully",
      nomination: newNomination,
    });
  } catch (error) {
    console.error("Nomination error:", error.message);
    res.status(500).json({ error: "Failed to create nomination" });
  }
});

app.get("/api/users", (req, res) => {
  res.json({
    users: [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server after DB connection
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
