// src/GameManager.js
/**
 * This version includes major fixes for physics stability and pocketing logic.
 */
class GameManager {
    constructor() {
        // PHYSICS ENGINE
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        
        // Increase physics precision to prevent tunneling
        this.engine.positionIterations = 8;
        this.engine.velocityIterations = 6;
        
        Matter.Engine.run(this.engine);

        // Allow global access
        window.world = this.world;

        // TABLE
        this.table = new Table();

        // CONSTANTS
        this.TABLE_WIDTH = this.table.width;
        this.TABLE_HEIGHT = this.table.height;
        this.TABLE_X = this.table.x;
        this.TABLE_Y = this.table.y;
        this.TABLE_LEFT_X = this.TABLE_X - this.TABLE_WIDTH / 2;
        this.BALL_RADIUS = Ball.snookerRadius();
        this.MAX_BALL_SPEED = 12;

        // GAME STATE
        this.gameState = 'AWAITING_SHOT';
        this.currentPlayer = 0;
        this.gameOver = false;
        this.pottedColorsThisTurn = [];
        this.cueBallNeedsRespotted = false;

        // BALLS & CUE
        this.balls = [];
        this.setupBalls();
        this.cueBall = this.balls.find(ball => ball.type === 'cue');
        this.cue = new Cue(this.cueBall);

        // SCORING
        this.scoring = new Scoring();
    }

    /**
     * Initialize all snooker balls in their correct starting positions.
     */
    setupBalls() {
        const baulkLineX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 5);
        const cueBallX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6);
        const dRadius = this.table.dRadius;
        const tableCenterY = this.TABLE_Y;

        const blueSpot = { x: this.TABLE_X, y: tableCenterY };
        const pinkSpot = { x: this.TABLE_LEFT_X + (this.TABLE_WIDTH * 9 / 12), y: tableCenterY };
        const blackSpot = { x: this.TABLE_LEFT_X + (this.TABLE_WIDTH * 10 / 11), y: tableCenterY };

        this.balls.push(new Ball(cueBallX, tableCenterY, 'cue', 'white', 0));
        this.balls.push(new Ball(baulkLineX, tableCenterY - dRadius, 'color', 'yellow', 2));
        this.balls.push(new Ball(baulkLineX, tableCenterY + dRadius, 'color', 'green', 3));
        this.balls.push(new Ball(baulkLineX, tableCenterY, 'color', 'brown', 4));
        this.balls.push(new Ball(blueSpot.x, blueSpot.y, 'color', 'blue', 5));
        this.balls.push(new Ball(pinkSpot.x, pinkSpot.y, 'color', 'pink', 6));
        this.balls.push(new Ball(blackSpot.x, blackSpot.y, 'color', 'black', 7));

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
     * Main update loop - the state machine.
     */
    update() {
        if (this.gameState === 'BALLS_MOVING') {
            this.checkPockets();
            
            for (const ball of this.balls) {
                if (ball.body.speed > this.MAX_BALL_SPEED) {
                    Matter.Body.setVelocity(ball.body, {
                        x: ball.body.velocity.x / ball.body.speed * this.MAX_BALL_SPEED,
                        y: ball.body.velocity.y / ball.body.speed * this.MAX_BALL_SPEED,
                    });
                }
            }
            
            if (this.cueBall && !this.table.isInPlayingArea(this.cueBall.body.position)) {
                 this.handleCueBallPocketed();
            }

            if (areBallsStationary(this.balls)) {
                this.gameState = 'HANDLING_TURN_END';
            }
        } else if (this.gameState === 'HANDLING_TURN_END') {
            this.handleTurnEndLogic();
        }
    }

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
            textAlign(LEFT, TOP);
        }
    }

    handleInput(eventType) {
        if (this.gameState !== 'AWAITING_SHOT' || this.gameOver) return;

        if (eventType === 'mousePressed') {
            this.cue.startAiming(createVector(mouseX, mouseY));
        } else if (eventType === 'mouseDragged') {
            this.cue.updateAiming(createVector(mouseX, mouseY));
        } else if (eventType === 'mouseReleased') {
            if (this.cue.aiming) {
                this.cue.shoot();
                this.gameState = 'BALLS_MOVING';
            }
        }
    }

    handleTurnEndLogic() {
        if (this.cueBallNeedsRespotted) {
            this.respotCueBall();
        }
        this.respotColors();
        this.switchPlayer();
        this.gameState = 'AWAITING_SHOT';
    }
    
    checkPockets() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            let ball = this.balls[i];
            if (!ball) continue;

            for (let pocket of this.table.pockets) {
                if (distance(ball.body.position.x, ball.body.position.y, pocket.x, pocket.y) < this.table.pocketRadius) {
                    if (ball.type === 'cue') {
                        this.handleCueBallPocketed();
                    } else {
                        // Immediately stop the ball
                        Matter.Body.setVelocity(ball.body, { x: 0, y: 0 });
                        
                        this.scoring.addPoints(this.currentPlayer, ball.value, `${ball.type} potted`);
                        ball.remove();
                        if (ball.type === 'color') {
                            this.pottedColorsThisTurn.push(ball);
                        }
                        this.balls.splice(i, 1);
                    }
                    break; 
                }
            }
        }
    }

    handleCueBallPocketed() {
        if (this.cueBallNeedsRespotted) return; // Prevent multiple calls

        this.scoring.addFoul(this.currentPlayer, 4, 'Cue ball potted');
        this.cueBallNeedsRespotted = true;
        
        if (this.cueBall) {
            Matter.Body.setVelocity(this.cueBall.body, { x: 0, y: 0 });
        }

        const cueBallIndex = this.balls.findIndex(b => b.type === 'cue');
        if (cueBallIndex !== -1) {
            this.balls[cueBallIndex].remove();
            this.balls.splice(cueBallIndex, 1);
        }
        this.cueBall = null;
    }

    respotCueBall() {
        const baulkLineX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 5);
        const dRadius = this.table.dRadius;
        let cueX, cueY;
        let positionFound = false;
        
        cueX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6);
        cueY = this.TABLE_Y;

        let collides = this.balls.some(b => b && b.body && distance(b.body.position.x, b.body.position.y, cueX, cueY) < this.BALL_RADIUS * 2);

        if(collides) {
            for (let i = 0; i < 20; i++) {
                const angle = random(-HALF_PI, HALF_PI);
                const radius = random(0, dRadius);
                cueX = baulkLineX - cos(angle) * radius;
                cueY = this.TABLE_Y - sin(angle) * radius;
                
                let innerCollides = this.balls.some(b => b && b.body && distance(b.body.position.x, b.body.position.y, cueX, cueY) < this.BALL_RADIUS * 2);
                if (!innerCollides) {
                    positionFound = true;
                    break;
                }
            }
        } else {
            positionFound = true;
        }

        if (!positionFound) {
             cueX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6);
             cueY = this.TABLE_Y;
        }

        const newCueBall = new Ball(cueX, cueY, 'cue', 'white', 0);
        this.balls.push(newCueBall);
        this.cueBall = newCueBall;
        this.cue.cueBall = newCueBall;
        this.cueBallNeedsRespotted = false;
    }

    respotColors() {
        for (let ball of this.pottedColorsThisTurn) {
            ball.resetPosition();
            Matter.World.add(this.world, ball.body);
            this.balls.push(ball);
        }
        this.pottedColorsThisTurn = [];
    }

    switchPlayer() {
        this.currentPlayer = 1 - this.currentPlayer;
    }

    reset() {
        for (let ball of this.balls) {
            ball.remove();
        }
        this.balls = [];
        this.pottedColorsThisTurn = [];
        this.setupBalls();
        
        this.cueBall = this.balls.find(ball => ball.type === 'cue');
        this.cue.cueBall = this.cueBall;
        
        this.scoring.reset();
        this.currentPlayer = 0;
        this.gameOver = false;
        this.cueBallNeedsRespotted = false;
        this.gameState = 'AWAITING_SHOT';
    }
}
