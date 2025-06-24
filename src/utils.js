// src/utils.js
/**
 * Utility functions for snooker game
 */

/**
 * Euclidean distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Check if all balls are stationary (used before allowing a new shot)
 * @param {Ball[]} balls - array of Ball instances
 * @param {number} threshold - max velocity to consider as stationary
 * @returns {boolean}
 */
function areBallsStationary(balls, threshold = 0.15) {
    return balls.every(ball => {
        if (!ball.body) return true;
        const v = ball.body.velocity;
        return Math.abs(v.x) < threshold && Math.abs(v.y) < threshold;
    });
}

/**
 * Clamp a value between min and max
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}