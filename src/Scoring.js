// src/Scoring.js
/**
 * Handles scoring and foul logic for snooker. This version includes
 * a helper function to get the value of each colored ball.
 */
class Scoring {
    constructor(numPlayers = 2) {
        this.scores = new Array(numPlayers).fill(0);
        this.foulHistory = [];
        this.potHistory = [];
        this.ballValues = {
            'red': 1, 'yellow': 2, 'green': 3, 'brown': 4,
            'blue': 5, 'pink': 6, 'black': 7
        };
    }

    /**
     * Returns the point value for a given ball color name.
     * @param {string} colorName - The name of the color (e.g., 'blue').
     * @returns {number} The point value of the ball.
     */
    getBallValue(colorName) {
        return this.ballValues[colorName] || 0;
    }

    /**
     * Processes all legally potted balls at the end of a turn.
     * This is now only called for legal pots, so no foul check is needed here.
     * @param {Ball[]} pottedBalls - An array of Ball objects potted during the turn.
     * @param {number} playerIdx - The index of the current player.
     */
    processTurn(pottedBalls, playerIdx) {
        for (const ball of pottedBalls) {
            this.addPoints(playerIdx, ball.value, `${ball.colorName || ball.type} potted`);
        }
    }

    addPoints(playerIdx, points, desc = "") {
        this.scores[playerIdx] += points;
        if (desc) {
            this.potHistory.push({ player: playerIdx, points, desc, time: Date.now() });
        }
    }

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

    getScore(playerIdx) {
        return this.scores[playerIdx];
    }

    reset() {
        this.scores.fill(0);
        this.foulHistory = [];
        this.potHistory = [];
    }
}
