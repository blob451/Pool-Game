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
     * Initialize all snooker balls (placeholder: use pool layout for now)
     */
    setupBalls() {
        // Cue ball (placeholder position)
        this.balls.push(new Ball(150, height / 2, 'cue', 'white', 0));
        // Reds (example, not triangle yet)
        for (let i = 0; i < 7; i++) {
            this.balls.push(new Ball(350 + i * 22, height / 2, 'red', '#d62828', 1));
        }
        // Colors (yellow, green, brown, blue, pink, black - rough positions)
        this.balls.push(new Ball(220, height / 2 - 80, 'color', 'yellow', 2));
        this.balls.push(new Ball(220, height / 2 + 80, 'color', 'green', 3));
        this.balls.push(new Ball(220, height / 2,     'color', 'brown', 4));
        this.balls.push(new Ball(530, height / 2,     'color', 'blue', 5));
        this.balls.push(new Ball(650, height / 2 - 60, 'color', 'pink', 6));
        this.balls.push(new Ball(730, height / 2,      'color', 'black', 7));
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
        // UI: Scores
        fill(255);
        textSize(20);
        text(`Player 1: ${this.scoring.getScore(0)}`, 30, 30);
        text(`Player 2: ${this.scoring.getScore(1)}`, width - 180, 30);
        if (this.gameOver) {
            textSize(36);
            text('Game Over!', width / 2 - 100, height / 2);
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