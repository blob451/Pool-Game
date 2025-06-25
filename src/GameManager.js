// src/GameManager.js
/**
 * Balls use corrected Table.js spots based on playing area, not canvas center.
 * Red triangle is packed just below the pink spot, leaving room for the black.
 */
class GameManager {
    constructor() {
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        Matter.Engine.run(this.engine);
        window.world = this.world;
        this.table = new Table();
        this.balls = [];
        this.setupBalls();
        this.cueBall = this.balls.find(ball => ball.type === 'cue');
        this.cue = new Cue(this.cueBall);
        this.scoring = new Scoring();
        this.currentPlayer = 0;
        this.gameOver = false;
        this.turnInProgress = false;
    }

    setupBalls() {
        const r = Ball.snookerRadius();

        // Cue ball in D, safely below brown
        const dCenter = { x: this.table.baulkLineX, y: this.table.y };
        this.balls.push(new Ball(dCenter.x, dCenter.y + this.table.dRadius / 3, 'cue', 'white', 0));

        // Colors from Table.js's corrected spots
        const spotConfig = [
            { key: 'yellow', value: 2 },
            { key: 'green', value: 3 },
            { key: 'brown', value: 4 },
            { key: 'blue', value: 5 },
            { key: 'pink', value: 6 },
            { key: 'black', value: 7 },
        ];
        for (const { key, value } of spotConfig) {
            const s = this.table.spots[key];
            this.balls.push(new Ball(s.x, s.y, 'color', key, value));
        }

        // Reds (15 in triangle, apex just below pink, base above black)
        const pink = this.table.spots.pink;
        const apexX = pink.x;
        const apexY = pink.y + r + 2; // Apex just below pink

        let count = 0;
        let rows = 5;
        for (let row = 0; row < rows; row++) {
            let ballsInRow = row + 1;
            let y0 = apexY - r * (ballsInRow - 1);
            let x = apexX + row * r * Math.sqrt(3);
            for (let i = 0; i < ballsInRow; i++) {
                if (count >= 15) break;
                this.balls.push(new Ball(
                    x,
                    y0 + i * r * 2,
                    'red',
                    'red',
                    1
                ));
                count++;
            }
        }
    }

    update() { this.checkPockets(); }

    draw() {
        this.table.draw();
        for (let type of ['color', 'red', 'cue']) {
            for (let ball of this.balls) if (ball.type === type) ball.show();
        }
        this.cue.draw();
        if (this.gameOver) {
            fill(255); textSize(36); textAlign(CENTER, CENTER);
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

    switchPlayer() { this.currentPlayer = 1 - this.currentPlayer; }

    reset() {
        for (let ball of this.balls) ball.remove();
        this.balls = [];
        this.setupBalls();
        this.scoring.reset();
        this.currentPlayer = 0;
        this.gameOver = false;
    }
}
