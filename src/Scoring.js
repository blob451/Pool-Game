// src/Scoring.js
/**
 * Handles scoring and foul logic. This version includes logic to process a turn's score
 * only after all events (pots, fouls) have been registered.
 */
class Scoring {
    constructor(numPlayers = 2) {
        this.scores = new Array(numPlayers).fill(0);
        this.foulHistory = [];
        this.potHistory = [];
    }

    /**
     * Processes all legally potted balls at the end of a turn.
     * @param {Ball[]} pottedBalls - An array of Ball objects potted during the turn.
     * @param {number} playerIdx - The index of the current player.
     * @param {boolean} wasFoulCommitted - True if a foul occurred on the shot.
     */
    processTurn(pottedBalls, playerIdx, wasFoulCommitted) {
        // If a foul was committed, no points are awarded for any potted balls.
        if (wasFoulCommitted) {
            return;
        }

        for (const ball of pottedBalls) {
            this.addPoints(playerIdx, ball.value, `${ball.color || ball.type} potted`);
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
