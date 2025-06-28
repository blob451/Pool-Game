// src/utils.js
/**
 * Provides a collection of utility functions used throughout the game.
 */

/**
 * Calculates the Euclidean distance between two points in a 2D space.
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} The distance between the two points.
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Determines if all balls on the table have come to a stop.
 * @param {Ball[]} balls - An array of all Ball instances.
 * @param {number} [threshold=0.15] - The maximum velocity to be considered stationary.
 * @returns {boolean} True if all balls are stationary.
 */
function areBallsStationary(balls, threshold = 0.15) {
    return balls.every(ball => {
        if (!ball.body) return true;
        const v = ball.body.velocity;
        return Math.abs(v.x) < threshold && Math.abs(v.y) < threshold;
    });
}

/**
 * Constrains a numerical value to be within a specified range.
 * @param {number} val - The value to clamp.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} The clamped value.
 */
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}