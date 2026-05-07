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

/**
 * Calculate estimated tree count based on upvote count
 * @param {number} upvoteCount - Number of upvotes
 * @returns {Promise<number>} Estimated tree count
 */
export async function calculateTreeCount(upvoteCount) {
  const impact = await fetchImpactCalculations(upvoteCount);
  return impact.treeCount;
}

/**
 * Calculate temperature reduction impact
 * @param {number} treeCount - Number of trees
 * @returns {Promise<number>} Temperature reduction in degrees Celsius
 */
export async function calculateTempReduction(treeCount) {
  const impact = await fetchImpactCalculations(treeCount);
  return impact.tempReduction;
}

/**
 * Calculate shade area coverage
 * @param {number} treeCount - Number of trees
 * @returns {Promise<number>} Shade area in square meters
 */
export async function calculateShadeArea(treeCount) {
  const impact = await fetchImpactCalculations(treeCount);
  return impact.shadeArea;
}

/**
 * Calculate CO2 sequestration impact
 * @param {number} treeCount - Number of trees
 * @returns {Promise<number>} CO2 sequestered in kg per year
 */
export async function calculateCO2(treeCount) {
  const impact = await fetchImpactCalculations(treeCount);
  return impact.co2;
}

/**
 * Calculate community stars based on upvote count
 * @param {number} upvoteCount - Number of upvotes
 * @returns {Promise<number>} Community star rating (0-5)
 */
export async function calculateCommunityStars(upvoteCount) {
  const impact = await fetchImpactCalculations(upvoteCount);
  return impact.stars;
}

/**
 * Fetch impact calculations from backend
 * @param {number} upvoteCount - Number of upvotes
 * @returns {Promise<Object>} Impact calculations
 */
async function fetchImpactCalculations(upvoteCount) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/impact/${upvoteCount}`);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching impact calculations:", error);
    throw error;
  }
}
