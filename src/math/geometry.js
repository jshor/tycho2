/**
 * Returns the distance from the foci to the center of an ellipse.
 *
 * @param {Number} x - semimajor axis
 * @param {Number} y - semiminor axis
 * @returns {Number} focus of ellipse
 */
export function getFocus (x, y) {
  return Math.sqrt(Math.abs(Math.pow(x, 2) - Math.pow(y, 2)))
}
