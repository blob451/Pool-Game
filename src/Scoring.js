// src/Scoring.js
/**
 * Manages the scoring, foul tracking, and point attribution for the game.
 */
class Scoring {
    /**
     * Initializes the scoring system for a specified number of players.
     * @param {number} [numPlayers=2] - The number of players in the game.
     */
    constructor(numPlayers = 2) {
        this.scores = new Array(numPlayers).fill(0); // Array to hold player scores.
        this.foulHistory = []; // Logs all committed fouls.
        this.potHistory = []; // Logs all legally potted balls.
        // Defines the point value for each coloured ball.
        this.ballValues = {
            'red': 1, 'yellow': 2, 'green': 3, 'brown': 4,
            'blue': 5, 'pink': 6, 'black': 7
        };
    }

    /**
     * Retrieves the point value for a given ball colour.
     * @param {string} colorName - The name of the colour (e.g., 'blue').
     * @returns {number} The point value of the ball.
     */
    getBallValue(colorName) {
        return this.ballValues[colorName] || 0;
    }

    /**
     * Processes all legally potted balls at the end of a turn to update the score.
     * @param {Ball[]} pottedBalls - An array of Ball objects potted during the turn.
     * @param {number} playerIdx - The index of the current player.
     */
    processTurn(pottedBalls, playerIdx) {
        for (const ball of pottedBalls) {
            this.addPoints(playerIdx, ball.value, `${ball.colorName || ball.type} potted`);
        }
    }

    /**
     * Adds points to a player's score and logs the event.
     * @param {number} playerIdx - The index of the player earning the points.
     * @param {number} points - The number of points to add.
     * @param {string} [desc=""] - A description of the scoring event.
     */
    addPoints(playerIdx, points, desc = "") {
        this.scores[playerIdx] += points;
        if (desc) {
            this.potHistory.push({ player: playerIdx, points, desc, time: Date.now() });
        }
    }

    /**
     * Adds points to the opponent's score as a result of a foul and logs the foul.
     * @param {number} foulingPlayerIdx - The index of the player who committed the foul.
     * @param {number} foulPoints - The number of points awarded to the opponent.
     * @param {string} [desc=""] - A description of the foul.
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
     * Retrieves the current score for a specific player.
     * @param {number} playerIdx - The index of the player.
     * @returns {number} The player's current score.
     */
    getScore(playerIdx) {
        return this.scores[playerIdx];
    }

    /**
     * Resets all scores and history logs to their initial state.
     */
    reset() {
        this.scores.fill(0);
        this.foulHistory = [];
        this.potHistory = [];
    }
}