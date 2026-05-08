/**
 * shadeCalc.js - Frontend Shade Data Client
 *
 * Thin wrapper to fetch pre-calculated shade data from backend.
 * Backend aggregates data from Vancouver Open Data public-trees dataset.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

/**
 * Fetch shade data from backend
 * @returns {Promise<Object>} Pre-calculated shade data
 */
export async function fetchShadeData() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/shade-data`);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching shade data:", error);
    throw error;
  }
}

/**
 * Initialize and set shade data (for React hooks)
 * @param {Function} setCallback - setState callback
 * @returns {Promise<Object>} Shade data
 */
export async function initShadeData(setCallback) {
  try {
    const data = await fetchShadeData();
    if (setCallback && typeof setCallback === "function") {
      setCallback(data);
    }
    return data;
  } catch (error) {
    console.error("Failed to initialize shade data:", error);
    return null;
  }
}

// Average trunk diameter (cm) of a Vancouver street tree.
// Source: Vancouver Open Data street-trees dataset average DBH.
const AVG_VANCOUVER_DBH_CM = 50;
const AVG_CANOPY_RADIUS_M = AVG_VANCOUVER_DBH_CM * 0.08;

/**
 * Recommends how many trees to plant based on community upvotes.
 * @param {number} upvotes
 * @returns {number} 1, 2, or 3
 */
export function calculateTreeCount(upvotes) {
  if (upvotes >= 31) return 3;
  if (upvotes >= 11) return 2;
  return 1;
}

/**
 * Estimates shade coverage in m² for a given number of trees.
 * Formula: pi x canopy_radius^2 x trees
 * @param {number} trees
 * @returns {number}
 */
export function calculateShadeArea(trees) {
  return Math.round(Math.PI * Math.pow(AVG_CANOPY_RADIUS_M, 2) * trees);
}

/**
 * Estimates surface temperature reduction in degrees C.
 * Each tree provides approximately 0.8 degrees C of cooling.
 * Source: City of Vancouver Urban Forest Strategy
 * @param {number} trees
 * @returns {string} e.g. "-2.4"
 */
export function calculateTempReduction(trees) {
  return (trees * -0.8).toFixed(1);
}

/**
 * Estimates annual CO2 absorbed in kg/yr.
 * Each urban tree absorbs approximately 16 kg of CO2 per year.
 * Source: i-Tree Eco Vancouver 2015 report
 * @param {number} trees
 * @returns {number}
 */
export function calculateCO2(trees) {
  return trees * 16;
}

/**
 * Converts upvote count into a 1 to 5 star community impact rating.
 * @param {number} upvotes
 * @returns {number}
 */
export function calculateCommunityStars(upvotes) {
  if (upvotes >= 60) return 5;
  if (upvotes >= 31) return 4;
  if (upvotes >= 16) return 3;
  if (upvotes >= 6)  return 2;
  return 1;
}
