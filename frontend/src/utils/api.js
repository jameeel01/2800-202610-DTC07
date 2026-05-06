// Base URL for all backend API calls.
// Set VITE_API_URL in your .env file to point at the deployed backend.
// Falls back to localhost for local development.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default API_URL;
