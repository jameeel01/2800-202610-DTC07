/**
 * shadeCalc.js - Frontend Shade Data Client
 *
 * Thin wrapper to fetch pre-calculated shade data from backend.
 * Backend aggregates data from Vancouver Open Data public-trees dataset.
 */

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

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
