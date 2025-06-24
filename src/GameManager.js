// src/GameManager.js
/**
 * Manages main game state, turn, input, and coordinates all major systems (table, balls, cue, scoring).
 * Now features accurate snooker ball setup and correct integration with Table.js.
 */
class GameManager {
    constructor() {
        // PHYSICS ENGINE
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        // Disable gravity
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        Matter.Engine.run(this.engine);
        window.world = this.world; // Needed for Ball/Table

        // TABLE
        this.table = new Table();

        // BALLS
        this.balls = [];
        this.setupBalls();
        this.cueBall = this.balls.find(ball => ball.type === 'cue');

        // CUE
        this.cue = new Cue(this.cueBall);

        // SCORING
        this.scoring = new Scoring();

        // STATE
        this.currentPlayer = 0;
        this.gameOver = false;
        this.turnInProgress = false;
    }

    /**
     * Accurate snooker ball setup: 15 reds (triangle), 6 colors on spots, 1 cue ball in D.
     */
    setupBalls() {
        // --- 1. Cue Ball in D ---
        // Place cue ball inside D (left baulk half, center of D)
        this.balls.push(new Ball(this.table.baulkLineX, this.table.y, 'cue', 'white', 0));

        // --- 2. Colored balls ---
        const spotColors = [
            { key: 'yellow', color: 'yellow', value: 2 },
            { key: 'green',  color: 'green',  value: 3 },
            { key: 'brown',  color: '#7c481c', value: 4 },
            { key: 'blue',   color: 'blue',   value: 5 },
            { key: 'pink',   color: 'pink',   value: 6 },
            { key: 'black',  color: 'black',  value: 7 }
        ];
        for (const { key, color, value } of spotColors) {
            const s = this.table.spots[key];
            this.balls.push(new Ball(s.x, s.y, 'color', color, value));
        }

        // --- 3. Reds (15 in triangle, apex just behind pink) ---
        const r = 10; // Ball radius (should match Ball.js)
        const triangleRows = 5;
        const startX = this.table.spots.pink.x + r * 2 + 4; // Apex just behind pink
        const startY = this.table.spots.pink.y;
        let count = 0;
        for (let row = 0; row < triangleRows; row++) {
            const ballsInRow = triangleRows + row;
            const offsetX = startX + row * r * Math.sqrt(3); // equilateral triangle spacing
            const offsetY = startY - r * (ballsInRow - 1);
            for (let i = 0; i < ballsInRow; i++) {
                if (count >= 15) break;
                this.balls.push(new Ball(
                    offsetX,
                    offsetY + i * r * 2,
                    'red',
                    '#d62828',
                    1
                ));
                count++;
            }
        }
    }

    update() {
        // Physics is advanced by Matter.Engine.run (auto)
        this.checkPockets();
    }

    draw() {
        this.table.draw();
        for (let ball of this.balls) {
            ball.show();
        }
        this.cue.draw();
        // (No UI overlays here! Scores, etc. should be drawn in main draw())
        if (this.gameOver) {
            fill(255);
            textSize(36);
            text('Game Over!', width / 2, height / 2);
        }
    }

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
                        this.scoring.addFoul(this.currentPlayer, 4, 'Cue ball potted');
                        ball.resetPosition();
                    }
                    break;
                }
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = 1 - this.currentPlayer;
    }

    reset() {
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
