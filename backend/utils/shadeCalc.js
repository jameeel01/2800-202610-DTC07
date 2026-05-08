/**
 * shadeCalc.js - Vancouver Tree Canopy Calculations
 *
 * Provides utilities to calculate tree canopy shade data.
 * Data aggregated from Vancouver Open Data public-trees dataset.
 *
 * Data Source: https://opendata.vancouver.ca/explore/dataset/public-trees/
 * API: OpenDatasoft Explore v2.1
 * Canopy Metric: diameter_cm (crown diameter in centimeters)
 */

/**
 * Calculate shadow coverage percentage based on canopy diameter
 * @param {number} diameterCm - Canopy diameter in centimeters
 * @returns {number} Shadow coverage percentage (0-100)
 */
function calculateShadowCoverage(diameterCm) {
  // approximation: shadow_percent = (diameter_cm / 2) + 5
  const shadowPercent = Math.min(diameterCm / 2 + 5, 100);
  return Math.round(shadowPercent);
}

/**
 * Get canopy size category based on diameter
 * @param {number} diameterCm - Canopy diameter in centimeters
 * @returns {string} Category: 'small', 'medium', or 'large'
 */
function getCanopyCategory(diameterCm) {
  if (diameterCm <= 20) return "small";
  if (diameterCm <= 40) return "medium";
  return "large";
}

/**
 * Format shade data from Vancouver API for response
 * @param {Array} trees - Array of tree records from API
 * @returns {Object} Formatted shade data
 */
function formatShadeResponse(trees) {
  const diameters = trees
    .map((tree) => tree.diameter_cm)
    .filter((d) => d !== null && !isNaN(d));

  const avgCanopyDiameter =
    diameters.length > 0
      ? parseFloat(
          (diameters.reduce((a, b) => a + b, 0) / diameters.length).toFixed(2),
        )
      : 0;

  const category = getCanopyCategory(avgCanopyDiameter);
  const shadowCoverage = calculateShadowCoverage(avgCanopyDiameter);

  return {
    totalTrees: trees.length,
    treesWithCanopyData: diameters.length,
    canopyData: {
      averageDiameter_cm: avgCanopyDiameter,
      canopySizeCategory: category,
      shadowCoverage,
    },
    sampleTrees: trees.slice(0, 5).map((tree) => ({
      common_name: tree.common_name,
      diameter_cm: tree.diameter_cm,
      height_m: tree.height_m,
      latitude: tree.geo_point_2d.lat,
      longitude: tree.geo_point_2d.lon,
    })),
  };
}

module.exports = {
  calculateShadowCoverage,
  getCanopyCategory,
  formatShadeResponse,
  calculateTreeCount,
  calculateTempReduction,
  calculateShadeArea,
  calculateCO2,
  calculateCommunityStars,
};

/**
 * Calculate estimated tree count based on upvote count
 * @param {number} upvoteCount - Number of upvotes
 * @returns {number} Estimated tree count
 */
function calculateTreeCount(upvoteCount) {
  // Estimate: ~5 trees per 10 upvotes
  return Math.ceil((upvoteCount / 10) * 5);
}

/**
 * Calculate temperature reduction impact
 * @param {number} treeCount - Number of trees
 * @returns {number} Temperature reduction in degrees Celsius
 */
function calculateTempReduction(treeCount) {
  // Estimate: ~0.3°C per tree within 50m radius
  return Math.round(treeCount * 0.3 * 10) / 10;
}

/**
 * Calculate shade area coverage
 * @param {number} treeCount - Number of trees
 * @returns {number} Shade area in square meters
 */
function calculateShadeArea(treeCount) {
  // Estimate: ~150 m² per mature tree during peak sun
  return Math.round(treeCount * 150);
}

/**
 * Calculate CO2 sequestration impact
 * @param {number} treeCount - Number of trees
 * @returns {number} CO2 sequestered in kg per year
 */
function calculateCO2(treeCount) {
  // Estimate: ~21 kg CO2/tree/year
  return Math.round(treeCount * 21);
}

/**
 * Calculate community stars based on upvote count
 * @param {number} upvoteCount - Number of upvotes
 * @returns {number} Community star rating (0-5)
 */
function calculateCommunityStars(upvoteCount) {
  // Scale: 1 star at 10 upvotes, 5 stars at 100+ upvotes
  const stars = Math.min(5, Math.max(1, Math.ceil(upvoteCount / 20)));
  return stars;
}
