// src/Scoring.js
/**
 * Handles scoring and foul logic for snooker (basic version).
 * Supports legal points, foul points, and querying scores.
 */
class Scoring {
    constructor(numPlayers = 2) {
        this.scores = new Array(numPlayers).fill(0); // e.g., [player1, player2]
        this.foulHistory = [];
        this.potHistory = [];
    }

    /**
     * Award legal points to current player
     * @param {number} playerIdx - player index (0 or 1)
     * @param {number} points
     * @param {string} [desc] - optional note (e.g. "Red potted")
     */
    addPoints(playerIdx, points, desc = "") {
        this.scores[playerIdx] += points;
        if (desc) {
            this.potHistory.push({ player: playerIdx, points, desc, time: Date.now() });
        }
    }

    /**
     * Award foul points to opponent
     * @param {number} foulingPlayerIdx - index of player committing foul
     * @param {number} foulPoints - points awarded (min 4, max 7)
     * @param {string} [desc] - optional description
     */
    addFoul(foulingPlayerIdx, foulPoints, desc = "") {
        const opponent = (foulingPlayerIdx === 0) ? 1 : 0;
        this.scores[opponent] += foulPoints;
        this.foulHistory.push({
            foulingPlayer: foulingPlayerIdx,
            awardedTo: opponent,
            foulPoints,
            desc,
            time: Date.now()
        });
    }

    /**
     * Get current score for a player
     * @param {number} playerIdx
     * @returns {number}
     */
    getScore(playerIdx) {
        return this.scores[playerIdx];
    }

    /**
     * Reset all scores and histories (for new frame)
     */
    reset() {
        this.scores.fill(0);
        this.foulHistory = [];
        this.potHistory = [];
    }
}