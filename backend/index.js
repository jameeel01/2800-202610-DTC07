const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const Nomination = require("./models/Nomination");
const {
  connectDB,
  generateToken,
  formatUserResponse,
  verifyToken,
  isValidLatLng,
  calculateDistance,
} = require("./utils/utils");
const {
  formatShadeResponse,
  calculateTreeCount,
  calculateTempReduction,
  calculateShadeArea,
  calculateCO2,
  calculateCommunityStars,
} = require("./utils/shadeCalc");

const app = express();
const PORT = process.env.PORT || 5001;

// middleware & cors
app.use(express.json());
app.use(cors());

// basic routes
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

// auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check fields exist
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // check email not taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // generate token
    const token = generateToken(newUser._id, newUser.email);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check fields exist
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // verify password
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // generate token
    const token = generateToken(user._id, user.email);

    res.json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// nomination routes (create)
app.post("/api/nominations", verifyToken, async (req, res) => {
  try {
    let {
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

    // trim all strings
    streetAddress = streetAddress?.trim();
    neighborhood = neighborhood?.trim();
    nominatorName = nominatorName?.trim();
    nominatorEmail = nominatorEmail?.trim();
    title = title?.trim();
    description = description?.trim();

    // check required fields
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

    // parse & validate lat/lng are numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude must be valid numbers" });
    }

    // check within vancouver bounds
    if (!isValidLatLng(lat, lng)) {
      return res.status(400).json({
        error: "Location must be within Vancouver city boundaries",
      });
    }

    // validate category
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

    // save nomination
    const newNomination = new Nomination({
      location: {
        latitude: lat,
        longitude: lng,
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
    if (error.code === 11000) {
      return res.status(400).json({
        error: "A nomination already exists for this location from this user",
      });
    }
    res.status(500).json({ error: "Failed to create nomination" });
  }
});

// get all nominations (filter by neighborhood)
app.get("/api/nominations", async (req, res) => {
  try {
    const { neighborhood } = req.query;

    let filter = {};
    if (neighborhood) {
      filter["location.neighborhood"] = neighborhood;
    }

    const nominations = await Nomination.find(filter).sort({ createdAt: -1 });

    res.json(nominations);
  } catch (error) {
    console.error("Get nominations error:", error.message);
    res.status(500).json({ error: "Failed to retrieve nominations" });
  }
});

// get single nomination by id
app.get("/api/nominations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // validate mongodb objectid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid nomination ID" });
    }

    const nomination = await Nomination.findById(id);

    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }

    res.json(nomination);
  } catch (error) {
    console.error("Get nomination error:", error.message);
    res.status(500).json({ error: "Failed to retrieve nomination" });
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

// shade data from vancouver public-trees api
app.get("/api/shade-data", async (req, res) => {
  try {
    const url =
      "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/public-trees/records?limit=100";
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.results) {
      return res
        .status(500)
        .json({ error: "Failed to fetch tree data from Vancouver API" });
    }

    const shadeData = formatShadeResponse(data.results);
    res.json(shadeData);
  } catch (error) {
    console.error("Shade data fetch error:", error.message);
    res.status(500).json({ error: "Failed to retrieve shade data" });
  }
});

// calculate impact based on upvote count
app.get("/api/impact/:upvotes", (req, res) => {
  try {
    const upvotes = parseInt(req.params.upvotes, 10);

    if (isNaN(upvotes) || upvotes < 0) {
      return res
        .status(400)
        .json({ error: "Upvotes must be a non-negative number" });
    }

    const treeCount = calculateTreeCount(upvotes);
    const tempReduction = calculateTempReduction(treeCount);
    const shadeArea = calculateShadeArea(treeCount);
    const co2 = calculateCO2(treeCount);
    const stars = calculateCommunityStars(upvotes);

    res.json({
      upvotes,
      treeCount,
      tempReduction,
      shadeArea,
      co2,
      stars,
    });
  } catch (error) {
    console.error("Impact calculation error:", error.message);
    res.status(500).json({ error: "Failed to calculate impact" });
  }
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// start server after db connect
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
