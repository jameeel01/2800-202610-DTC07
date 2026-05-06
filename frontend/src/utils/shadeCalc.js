// shadeCalc.js
// Helper functions for calculating the 4 impact stats on the Impact Estimate page.
//
// Sources:
//   - Average DBH: Vancouver Open Data street-trees dataset
//     https://opendata.vancouver.ca/explore/dataset/street-trees
//     (TODO: replace AVG_VANCOUVER_DBH_CM with value calculated in research task B8)
//   - Canopy radius formula: i-Tree Eco Vancouver 2015 report
//   - Temperature reduction: 0.8°C cooling per tree (City of Vancouver Urban Forest Strategy)
//   - CO2 absorption: 16 kg/yr per urban tree (i-Tree Eco Vancouver 2015 report)

// Average trunk diameter (in cm) of a Vancouver street tree.
// Placeholder — to be replaced with the real average calculated from the Vancouver Open Data API in task B8.
const AVG_VANCOUVER_DBH_CM = 50;

// Estimated canopy radius in metres, derived from trunk diameter.
// Formula: DBH (cm) × 0.08 = canopy radius (m)
const AVG_CANOPY_RADIUS_M = AVG_VANCOUVER_DBH_CM * 0.08;

/**
 * Recommends how many trees should be planted based on community upvotes.
 * More upvotes = more community demand = more trees recommended.
 *
 * @param {number} upvotes
 * @returns {number} 1, 2, or 3
 */
export function calculateTreeCount(upvotes) {
  if (upvotes >= 31) return 3;
  if (upvotes >= 11) return 2;
  return 1;
}

/**
 * Estimates total shade coverage in m² for a given number of trees.
 * Formula: π × canopy_radius² × number of trees
 *
 * @param {number} trees
 * @returns {number} shade area in m², rounded to nearest whole number
 */
export function calculateShadeArea(trees) {
  const area = Math.PI * Math.pow(AVG_CANOPY_RADIUS_M, 2) * trees;
  return Math.round(area);
}

/**
 * Estimates surface temperature reduction in °C for a given number of trees.
 * Each tree provides approximately 0.8°C of cooling within a 50m radius.
 *
 * @param {number} trees
 * @returns {string} e.g. "-2.4"
 */
export function calculateTempReduction(trees) {
  return (trees * -0.8).toFixed(1);
}

/**
 * Estimates annual CO2 absorbed in kg/yr for a given number of trees.
 * Each urban tree absorbs approximately 16 kg of CO2 per year.
 *
 * @param {number} trees
 * @returns {number} kg of CO2 per year
 */
export function calculateCO2(trees) {
  return trees * 16;
}

/**
 * Converts upvote count into a community impact rating from 1 to 5 stars.
 *
 * @param {number} upvotes
 * @returns {number} star rating between 1 and 5
 */
export function calculateCommunityStars(upvotes) {
  if (upvotes >= 60) return 5;
  if (upvotes >= 31) return 4;
  if (upvotes >= 16) return 3;
  if (upvotes >= 6)  return 2;
  return 1;
}

/**
 * Returns a short formatted summary string used in the map popup and nomination detail page.
 * Example output: "-2.4°C • 3 trees • 160 m²"
 *
 * @param {number} upvotes
 * @returns {string}
 */
export function formatImpactSummary(upvotes) {
  const trees = calculateTreeCount(upvotes);
  const temp  = calculateTempReduction(trees);
  const shade = calculateShadeArea(trees);
  return `${temp}°C • ${trees} ${trees === 1 ? "tree" : "trees"} • ${shade} m²`;
}
