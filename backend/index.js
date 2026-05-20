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

// upvote or un-upvote a nomination (requires login)
app.post("/api/nominations/:id/upvote", verifyToken, async (req, res) => {
  try {
    const nomination = await Nomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }

    const userId = req.user.userId;

    // default upvoterIds to empty array if it doesn't exist yet
    if (!nomination.upvoterIds) {
      nomination.upvoterIds = [];
    }

    const hasUpvoted = nomination.upvoterIds
      .map(String)
      .includes(String(userId));

    if (hasUpvoted) {
      // remove upvote
      nomination.upvoterIds.pull(userId);
      nomination.upvoteCount = Math.max(0, nomination.upvoteCount - 1);
    } else {
      // add upvote
      nomination.upvoterIds.push(userId);
      nomination.upvoteCount += 1;
    }

    await nomination.save();

    res.json({
      upvoteCount: nomination.upvoteCount,
      hasUpvoted: !hasUpvoted,
    });
  } catch (error) {
    console.error("Upvote error:", error.message);
    res.status(500).json({ error: "Failed to upvote" });
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

// in-memory rate limiter for AI endpoint
const aiRateLimit = new Map();
const AI_RATE_LIMIT_MS = 0; // 10 minutes

function checkAIRateLimit(userId) {
  const now = Date.now();
  const lastRequest = aiRateLimit.get(userId);

  if (lastRequest && now - lastRequest < AI_RATE_LIMIT_MS) {
    const waitSeconds = Math.ceil(
      (AI_RATE_LIMIT_MS - (now - lastRequest)) / 1000,
    );
    const waitMinutes = Math.ceil(waitSeconds / 60);
    return { limited: true, waitMinutes };
  }

  aiRateLimit.set(userId, now);
  return { limited: false };
}

// Gemini backend route
app.post("/api/ai/suggest", async (req, res) => {
  try {
    const identifier = req.user?.userId || req.ip;
    const rateCheck = checkAIRateLimit(identifier);

    if (rateCheck.limited) {
      return res.status(429).json({
        error: `Please wait ${rateCheck.waitMinutes} minute(s) before requesting again.`,
      });
    }

    const prompt = `
    You are an urban shade planning assistant for Vancouver, Canada.
    
    Suggest 3 specific spots in Vancouver that most need shade based on known high-traffic, low-canopy areas.
    
    Respond ONLY with a JSON array, no markdown, no explanation, just the array:
    [
      { "lat": 49.123, "lng": -123.456, "reason": "one sentence reason" },
      { "lat": 49.123, "lng": -123.456, "reason": "one sentence reason" },
      { "lat": 49.123, "lng": -123.456, "reason": "one sentence reason" }
    ]
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data));

    if (data.error) {
      const code = data.error.code;
      if (code === 503)
        return res.status(503).json({ error: "AI is busy, please try again." });
      if (code === 429)
        return res.status(429).json({ error: "AI daily limit reached." });
      if (code === 400)
        return res.status(400).json({ error: "AI API key issue." });
      return res.status(500).json({ error: "AI request failed." });
    }

    const parts = data.candidates[0].content.parts;
    const jsonPart = parts.find((p) => !p.thought) || parts[parts.length - 1];
    const text = jsonPart.text;
    console.log("Raw Gemma text:", text);

    const cleaned = text.replace(/```json|```/g, "").trim();

    let suggestions;
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      return res
        .status(500)
        .json({ error: "AI returned an unexpected response. Try again." });
    }

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return res
        .status(500)
        .json({ error: "AI couldn't find suggestions. Try again." });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("AI suggest error:", error.message);
    res.status(500).json({ error: "Failed to generate suggestions" });
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
