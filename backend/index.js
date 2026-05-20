const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// password strength validator
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!hasUppercase) {
    return { valid: false, error: "Password must include an uppercase letter" };
  }
  if (!hasLowercase) {
    return { valid: false, error: "Password must include a lowercase letter" };
  }
  if (!hasNumber) {
    return { valid: false, error: "Password must include a number" };
  }
  if (!hasSpecialChar) {
    return { valid: false, error: "Password must include a special character" };
  }

  return { valid: true };
};

// in-memory cache for nominations
const cache = {
  nominations: null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000, // 5 minutes

  get() {
    if (!this.nominations || Date.now() - this.lastUpdated > this.ttl) {
      return null;
    }
    return this.nominations;
  },

  set(data) {
    this.nominations = data;
    this.lastUpdated = Date.now();
  },

  invalidate() {
    this.nominations = null;
    this.lastUpdated = null;
  },
};

// in-memory cache for shade data
const shadeCache = {
  data: null,
  lastUpdated: null,
  ttl: 24 * 60 * 60 * 1000, // 24 hours

  get() {
    if (!this.data || Date.now() - this.lastUpdated > this.ttl) {
      return null;
    }
    return this.data;
  },

  set(data) {
    this.data = data;
    this.lastUpdated = Date.now();
  },

  invalidate() {
    this.data = null;
    this.lastUpdated = null;
  },
};

const app = express();
const PORT = process.env.PORT || 5001;

// middleware & cors - allow localhost dev & deployed Vercel frontend
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5000",
    "https://2800-202610-dtc-07-c1pl3c22d-jameeel01s-projects.vercel.app",
  ],
  credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));

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

    // validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
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
      nominatorName,
      title,
      description,
      photoUrl,
      category,
      uploadedFiles,
    } = req.body;

    // extract user from token
    const nominatorId = req.user.userId;
    const nominatorEmail = req.user.email;

    // trim all strings
    streetAddress = streetAddress?.trim();
    neighborhood = neighborhood?.trim();
    nominatorName = nominatorName?.trim();
    title = title?.trim();
    description = description?.trim();

    // default category to 'other' if not provided
    category = category || "other";

    // check required fields
    if (
      !latitude ||
      !longitude ||
      !streetAddress ||
      !nominatorName ||
      !title ||
      !description
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
      uploadedFiles: uploadedFiles || [],
    });

    await newNomination.save();

    // invalidate cache
    cache.invalidate();

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

// get all nominations (filter by neighborhood) - includes upvoterIds & hasVoted check
app.get("/api/nominations", async (req, res) => {
  try {
    const { neighborhood } = req.query;

    // extract user from token if provided
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (decoded) {
        currentUserId = decoded.userId;
      }
    }

    // try cache first
    let nominations = cache.get();
    if (!nominations) {
      nominations = await Nomination.find().sort({ createdAt: -1 });
      cache.set(nominations);
    }

    // apply neighborhood filter if provided
    let filtered = nominations;
    if (neighborhood) {
      filtered = nominations.filter(
        (n) => n.location.neighborhood === neighborhood,
      );
    }

    // add hasVoted flag to each nomination
    const nominationsWithVoteStatus = filtered.map((nom) => {
      const nomObj = nom.toObject();
      nomObj.hasVoted = currentUserId
        ? nomObj.upvoterIds.some((id) => id.toString() === currentUserId)
        : false;
      return nomObj;
    });

    res.json(nominationsWithVoteStatus);
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

// edit nomination (only nominator can edit)
app.put("/api/nominations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, photoUrl } = req.body;

    // validate mongodb objectid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid nomination ID" });
    }

    // require auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const nomination = await Nomination.findById(id);
    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }

    // check if user is the nominator
    if (nomination.nominatorId.toString() !== decoded.userId) {
      return res
        .status(403)
        .json({ error: "Only the nominator can edit this nomination" });
    }

    // update allowed fields
    if (title) nomination.title = title.trim();
    if (description) nomination.description = description;
    if (category) nomination.category = category;
    if (photoUrl !== undefined) nomination.photoUrl = photoUrl;

    await nomination.save();

    // invalidate cache
    cache.invalidate();

    res.json({
      message: "Nomination updated successfully",
      nomination,
    });
  } catch (error) {
    console.error("Edit nomination error:", error.message);
    res.status(500).json({ error: "Failed to update nomination" });
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
    // try cache first
    let shadeData = shadeCache.get();
    if (shadeData) {
      return res.json(shadeData);
    }

    const url =
      "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/public-trees/records?limit=100";
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.results) {
      return res
        .status(500)
        .json({ error: "Failed to fetch tree data from Vancouver API" });
    }

    shadeData = formatShadeResponse(data.results);
    shadeCache.set(shadeData);
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

// upvote/unvote nomination
app.post("/api/nominations/:id/upvote", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // validate mongodb objectid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid nomination ID" });
    }

    const nomination = await Nomination.findById(id);
    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }

    // check if user already voted
    const hasVoted = nomination.upvoterIds.some(
      (voterId) => voterId.toString() === userId,
    );

    if (hasVoted) {
      // remove vote
      nomination.upvoterIds = nomination.upvoterIds.filter(
        (voterId) => voterId.toString() !== userId,
      );
      nomination.upvoteCount = Math.max(0, nomination.upvoteCount - 1);
    } else {
      // add vote
      nomination.upvoterIds.push(userId);
      nomination.upvoteCount += 1;
    }

    await nomination.save();

    // invalidate cache
    cache.invalidate();

    res.json({
      message: hasVoted ? "Vote removed" : "Vote added",
      nomination,
    });
  } catch (error) {
    console.error("Upvote error:", error.message);
    res.status(500).json({ error: "Failed to process vote" });
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
