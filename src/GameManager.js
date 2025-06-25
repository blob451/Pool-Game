// src/GameManager.js
/**
 * Manages main game state, turn, input, and coordinates all major systems (table, balls, cue, scoring).
 * Starts as a Pool-to-Snooker base, ready for snooker rule expansion.
 */
class GameManager {
    constructor() {
        // PHYSICS ENGINE
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        Matter.Engine.run(this.engine);

        // Allow global access (needed for Ball, Table, etc)
        window.world = this.world;

        // TABLE
        this.table = new Table();

        // Add table constants for easier calculations
        this.TABLE_WIDTH = this.table.width;
        this.TABLE_HEIGHT = this.table.height;
        this.TABLE_X = this.table.x;
        this.TABLE_Y = this.table.y;
        this.TABLE_LEFT_X = this.TABLE_X - this.TABLE_WIDTH / 2;
        this.BALL_RADIUS = 10; // As defined in Ball.js

        // BALLS
        this.balls = [];
        this.setupBalls();
        // CUE BALL (keep reference for Cue class)
        this.cueBall = this.balls.find(ball => ball.type === 'cue');

        // CUE
        this.cue = new Cue(this.cueBall);

        // SCORING
        this.scoring = new Scoring();

        // STATE
        this.currentPlayer = 0; // 0 = Player 1, 1 = Player 2
        this.gameOver = false;
        this.turnInProgress = false;
    }

    /**
     * Initialize all snooker balls in their correct starting positions.
     */
    setupBalls() {
        // Define spot locations based on table dimensions
        const baulkLineX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 5);
        const cueBallX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6);
        const dRadius = this.table.dRadius;

        const tableCenterY = this.TABLE_Y;

        const blueSpot = { x: this.TABLE_X, y: tableCenterY };
        const pinkSpot = { x: this.TABLE_LEFT_X + (this.TABLE_WIDTH * 9 / 12), y: tableCenterY };
        const blackSpot = { x: this.TABLE_LEFT_X + (this.TABLE_WIDTH * 10 / 11), y: tableCenterY };

        // Place colored balls
        // Cue ball spawns inside the 'D'
        this.balls.push(new Ball(cueBallX, tableCenterY, 'cue', 'white', 0));
        // Baulk line colors
        this.balls.push(new Ball(baulkLineX, tableCenterY - dRadius, 'color', 'yellow', 2)); // Yellow
        this.balls.push(new Ball(baulkLineX, tableCenterY + dRadius, 'color', 'green', 3)); // Green
        this.balls.push(new Ball(baulkLineX, tableCenterY, 'color', 'brown', 4)); // Brown
        // Other colors
        this.balls.push(new Ball(blueSpot.x, blueSpot.y, 'color', 'blue', 5)); // Blue
        this.balls.push(new Ball(pinkSpot.x, pinkSpot.y, 'color', 'pink', 6)); // Pink
        this.balls.push(new Ball(blackSpot.x, blackSpot.y, 'color', 'black', 7)); // Black

        // Place 15 red balls in a triangle
        const triangleApex = { x: pinkSpot.x + this.BALL_RADIUS * 2 + 2, y: pinkSpot.y };
        const ballDiameter = this.BALL_RADIUS * 2;
        
        for (let row = 0; row < 5; row++) {
            const yStart = triangleApex.y - row * (this.BALL_RADIUS + 0.5);
            for (let col = 0; col <= row; col++) {
                const x = triangleApex.x + row * (ballDiameter * 0.88);
                const y = yStart + col * (ballDiameter + 1);
                this.balls.push(new Ball(x, y, 'red', '#d62828', 1));
            }
        }
    }

    /**
     * Main update loop: advance physics, check pockets, manage state
     */
    update() {
        // Physics is advanced by Matter.Engine.run (auto)
        this.checkPockets();
    }

    /**
     * Draw all elements
     */
    draw() {
        this.table.draw();
        for (let ball of this.balls) {
            ball.show();
        }
        this.cue.draw();
        
        if (this.gameOver) {
            fill(255);
            textSize(36);
            textAlign(CENTER, CENTER);
            text('Game Over!', width / 2, height / 2);
            textAlign(LEFT, TOP); // Reset alignment
        }
    }

    /**
     * Handles all mouse input from main.js
     * @param {string} eventType
     */
    handleInput(eventType) {
        if (this.gameOver) return;
        if (eventType === 'mousePressed') {
            if (areBallsStationary(this.balls)) {
                this.cue.startAiming(createVector(mouseX, mouseY));
                this.turnInProgress = true;
            }
        } else if (eventType === 'mouseReleased') {
            if (this.turnInProgress) {
                this.cue.updateAiming(createVector(mouseX, mouseY));
                this.cue.shoot();
                this.turnInProgress = false;
            }
        }
    }

    /**
     * Check if any ball falls into a pocket; remove and handle scoring
     */
    checkPockets() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            let ball = this.balls[i];
            for (let pocket of this.table.pockets) {
                if (distance(ball.body.position.x, ball.body.position.y, pocket.x, pocket.y) < this.table.pocketRadius) {
                    if (ball.type !== 'cue') {
                        this.scoring.addPoints(this.currentPlayer, ball.value, `${ball.type} potted`);
                        ball.remove();
                        this.balls.splice(i, 1);
                    } else {
                        // Cue ball potted: foul (minimum 4 points to opponent)
                        this.scoring.addFoul(this.currentPlayer, 4, 'Cue ball potted');
                        ball.resetPosition();
                    }
                    break;
                }
            }
        }
    }

    /**
     * Switch to next player
     */
    switchPlayer() {
        this.currentPlayer = 1 - this.currentPlayer;
    }

    /**
     * Reset the game
     */
    reset() {
        // Remove all old balls
        for (let ball of this.balls) {
            ball.remove();
        }
        this.balls = [];
        this.setupBalls();
        this.scoring.reset();
        this.currentPlayer = 0;
        this.gameOver = false;
    }
}
