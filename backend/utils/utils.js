const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_change_this";

// connect to mongodb
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// create jwt token
function generateToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

// format user response object
function formatUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

// verify jwt in authorization header
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }
}

// vancouver city bounds (approx)
const VANCOUVER_BOUNDS = {
  minLat: 49.19,
  maxLat: 49.32,
  minLng: -123.25,
  maxLng: -123.07,
};

// check if coords are within vancouver
function isValidLatLng(latitude, longitude) {
  return (
    latitude >= VANCOUVER_BOUNDS.minLat &&
    latitude <= VANCOUVER_BOUNDS.maxLat &&
    longitude >= VANCOUVER_BOUNDS.minLng &&
    longitude <= VANCOUVER_BOUNDS.maxLng
  );
}

// calculate distance between two coords using haversine formula (in km)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  connectDB,
  generateToken,
  formatUserResponse,
  verifyToken,
  isValidLatLng,
  calculateDistance,
};
