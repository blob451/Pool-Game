// src/GameManager.js
/**
 * Implements deferred scoring, advanced re-spotting, and foul UI feedback.
 */
class GameManager {
    constructor() {
        // ... (engine, world, table setup remains the same)
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        this.engine.positionIterations = 10;
        this.engine.velocityIterations = 8;
        Matter.Events.on(this.engine, 'collisionStart', (event) => { this.handleCollisions(event); });
        Matter.Engine.run(this.engine);
        window.world = this.world;
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
        this.pottedColorsToRespot = [];
        this.cueBallNeedsRespotted = false;
        
        // TURN & RULE STATE
        this.ballOn = 'red'; 
        this.firstContact = null;
        this.turnEndedByFoul = false;
        this.potMadeThisTurn = [];
        
        // ENDGAME STATE
        this.endgamePhase = false;
        this.colorSequence = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        this.endgameColorIndex = 0;

        // UI
        this.nominationButtons = [];
        this.createNominationButtons();
        this.newFrameButton = { x: 30, y: 60, width: 120, height: 40, label: 'New Frame' };
        this.foulMessage = "";
        this.foulMessageTimer = 0;

        // BALLS & CUE
        this.balls = [];
        this.setupBalls();
        this.cueBall = this.balls.find(ball => ball.type === 'cue');
        this.cue = new Cue(this.cueBall);

        // SCORING
        this.scoring = new Scoring();
    }
    
    // ... (createNominationButtons remains the same)
    createNominationButtons() {
        const buttonWidth = 100; const buttonHeight = 40;
        const startX = (width / 2) - (this.colorSequence.length * (buttonWidth + 10) / 2);
        const yPos = 40;
        this.colorSequence.forEach((color, index) => {
            this.nominationButtons.push({ x: startX + index * (buttonWidth + 10), y: yPos, width: buttonWidth, height: buttonHeight, colorName: color, label: color.toUpperCase(), fill: Ball.resolveColor('color', color) });
        });
    }

    setupBalls() {
        const baulkLineX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 5); const cueBallX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6);
        const dRadius = this.table.dRadius; const tableCenterY = this.TABLE_Y;
        const blueSpot = { x: this.TABLE_X, y: tableCenterY }; const pinkSpot = { x: this.TABLE_LEFT_X + (this.TABLE_WIDTH * 9 / 12), y: tableCenterY };
        const blackSpot = { x: this.TABLE_LEFT_X + (this.TABLE_WIDTH * 10 / 11), y: tableCenterY };
        
        this.balls.push(new Ball(cueBallX, tableCenterY, 'cue', 'white', 0));
        
        // Create colored balls and add a 'colorName' property to them
        const yellowBall = new Ball(baulkLineX, tableCenterY + dRadius, 'color', 'yellow', 2);
        yellowBall.colorName = 'yellow';
        this.balls.push(yellowBall);

        const greenBall = new Ball(baulkLineX, tableCenterY - dRadius, 'color', 'green', 3);
        greenBall.colorName = 'green';
        this.balls.push(greenBall);

        const brownBall = new Ball(baulkLineX, tableCenterY, 'color', 'brown', 4);
        brownBall.colorName = 'brown';
        this.balls.push(brownBall);

        const blueBall = new Ball(blueSpot.x, blueSpot.y, 'color', 'blue', 5);
        blueBall.colorName = 'blue';
        this.balls.push(blueBall);

        const pinkBall = new Ball(pinkSpot.x, pinkSpot.y, 'color', 'pink', 6);
        pinkBall.colorName = 'pink';
        this.balls.push(pinkBall);
        
        const blackBall = new Ball(blackSpot.x, blackSpot.y, 'color', 'black', 7);
        blackBall.colorName = 'black';
        this.balls.push(blackBall);

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

    update() {
        if (this.gameState === 'BALLS_MOVING') {
            this.checkPockets();
            for (const ball of this.balls) {
                if (ball.body.speed > this.MAX_BALL_SPEED) { Matter.Body.setVelocity(ball.body, { x: ball.body.velocity.x / ball.body.speed * this.MAX_BALL_SPEED, y: ball.body.velocity.y / ball.body.speed * this.MAX_BALL_SPEED }); }
            }
            if (this.cueBall && !this.table.isInPlayingArea(this.cueBall.body.position)) { this.handleCueBallPocketed(); }
            if (areBallsStationary(this.balls)) { this.gameState = 'HANDLING_TURN_END'; }
        } else if (this.gameState === 'HANDLING_TURN_END') {
            this.handleTurnEndLogic();
        }
    }

    draw() {
        this.table.draw();
        for (let ball of this.balls) { ball.show(); }
        this.cue.draw();
        this.drawNewFrameButton();

        if (this.gameState === 'AWAITING_NOMINATION') {
            this.drawNominationUI();
        } else {
            fill(255); textSize(22); textAlign(CENTER, TOP);
            text(`Ball On: ${this.ballOn.toUpperCase()}`, width / 2, 16);
        }

        this.drawFoulMessage();
        if (this.gameOver) { this.drawGameOverUI(); }
    }

    // ... (drawNominationUI, drawNewFrameButton, drawGameOverUI remain the same)
    drawNominationUI() {
        fill(255); textSize(26); textAlign(CENTER, TOP);
        text('Nominate a Color', width / 2, 10);
        for (const btn of this.nominationButtons) {
            fill(btn.fill); stroke(255); strokeWeight(2);
            rect(btn.x, btn.y, btn.width, btn.height, 5);
            fill(0); noStroke(); textSize(18); textAlign(CENTER, CENTER);
            text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }
    drawNewFrameButton() {
        const btn = this.newFrameButton;
        fill(200, 220, 255); stroke(100); strokeWeight(1);
        rect(btn.x, btn.y, btn.width, btn.height, 5);
        fill(0); noStroke(); textSize(18); textAlign(CENTER, CENTER);
        text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
    }
    drawGameOverUI() {
        fill(0, 0, 0, 180); rect(width/2, height/2, 400, 200, 10);
        const score1 = this.scoring.getScore(0); const score2 = this.scoring.getScore(1);
        const winner = score1 > score2 ? 'Player 1 Wins!' : 'Player 2 Wins!';
        fill(255); textSize(36); textAlign(CENTER, CENTER);
        text('Frame Over', width / 2, height / 2 - 40);
        textSize(28); text(winner, width / 2, height / 2 + 10);
    }
    
    drawFoulMessage() {
        if (this.foulMessageTimer > 0) {
            const alpha = min(255, this.foulMessageTimer * 3);
            fill(255, 60, 60, alpha);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(32);
            text(this.foulMessage, width / 2, height / 2 - 150);
            this.foulMessageTimer--;
        }
    }

    handleInput(eventType) {
        if (eventType === 'mousePressed') {
            const btn = this.newFrameButton;
            if (mouseX > btn.x && mouseX < btn.x + btn.width && mouseY > btn.y && mouseY < btn.y + btn.height) { this.reset(); return; }
        }
        if (this.gameOver) return;

        if (this.gameState === 'AWAITING_SHOT') {
            if (eventType === 'mousePressed') { this.cue.startAiming(createVector(mouseX, mouseY)); } 
            else if (eventType === 'mouseDragged') { this.cue.updateAiming(createVector(mouseX, mouseY)); } 
            else if (eventType === 'mouseReleased') {
                if (this.cue.aiming) {
                    this.firstContact = null; this.turnEndedByFoul = false; this.potMadeThisTurn = [];
                    this.cue.shoot(); this.gameState = 'BALLS_MOVING';
                }
            }
        } else if (this.gameState === 'AWAITING_NOMINATION' && eventType === 'mousePressed') {
            this.handleNominationClick(mouseX, mouseY);
        }
    }
    
    // ... (handleNominationClick, handleCollisions remain the same)
    handleNominationClick(mx, my) {
        for (const btn of this.nominationButtons) {
            if (mx > btn.x && mx < btn.x + btn.width && my > btn.y && my < btn.y + btn.height) {
                this.ballOn = btn.colorName; this.gameState = 'AWAITING_SHOT'; break;
            }
        }
    }
    handleCollisions(event) {
        if (this.firstContact) return;
        for (const pair of event.pairs) {
            let otherBody = null;
            if (this.cueBall && pair.bodyA === this.cueBall.body) { otherBody = pair.bodyB; }
            else if (this.cueBall && pair.bodyB === this.cueBall.body) { otherBody = pair.bodyA; }
            if (otherBody) {
                if (otherBody.label === 'table_boundary') continue;
                const hitBall = this.balls.find(b => b.body === otherBody);
                if (hitBall) { this.firstContact = hitBall; break; }
            }
        }
    }

    handleTurnEndLogic() {
        this.checkForFouls();
        let legalPotMade = this.checkLegalPots();
        this.scoring.processTurn(this.potMadeThisTurn, this.currentPlayer, this.turnEndedByFoul);
        
        if (!this.endgamePhase && !this.areRedsRemaining()) {
            this.endgamePhase = true;
            this.ballOn = this.colorSequence[this.endgameColorIndex];
        }

        const score1 = this.scoring.getScore(0); const score2 = this.scoring.getScore(1);
        const pointsLeft = this.calculatePointsRemaining();
        if (Math.abs(score1 - score2) > pointsLeft) { this.gameOver = true; }

        if (this.turnEndedByFoul || !legalPotMade) {
            this.switchPlayer();
        } else if (legalPotMade && this.ballOn === 'color') {
            this.gameState = 'AWAITING_NOMINATION';
            return;
        }

        if (this.cueBallNeedsRespotted) { this.respotCueBall(); }
        this.respotColors();
        this.gameState = 'AWAITING_SHOT';
    }

    // ... (checkForFouls and checkLegalPots remain the same logic, just updated for new variables)
    checkForFouls() {
        if (this.turnEndedByFoul) return;
        if (!this.firstContact) { this.commitFoul("Did not hit any ball", 4); return; }
        const isColorNominated = this.colorSequence.includes(this.ballOn);
        if (this.endgamePhase) {
            if (this.firstContact.type !== 'color' || this.firstContact.colorName !== this.ballOn) { this.commitFoul(`Hit a ${this.firstContact.colorName} ball when the ${this.ballOn} was on`, this.firstContact.value); }
        } else if (isColorNominated) {
            if (this.firstContact.type !== 'color' || this.firstContact.colorName !== this.ballOn) { this.commitFoul(`Hit a ${this.firstContact.colorName} ball when the ${this.ballOn} was on`, 4); }
        } else if (this.ballOn === 'red' && this.firstContact.type !== 'red') {
            this.commitFoul(`Hit a ${this.firstContact.colorName} ball when a red was on`, this.firstContact.value);
        }
    }
    checkLegalPots() {
        let legalPotMade = false;
        if (this.potMadeThisTurn.length === 0) return false;
        const isColorNominated = this.colorSequence.includes(this.ballOn);
        const pottedRed = this.potMadeThisTurn.find(b => b.type === 'red');
        if (this.endgamePhase) {
            const pottedTargetColor = this.potMadeThisTurn.find(b => b.type === 'color' && b.colorName === this.ballOn);
            if (pottedTargetColor) {
                legalPotMade = true; this.endgameColorIndex++;
                if (this.endgameColorIndex < this.colorSequence.length) { this.ballOn = this.colorSequence[this.endgameColorIndex]; }
                else { this.gameOver = true; }
            } else if (this.potMadeThisTurn.length > 0) { this.commitFoul(`Potted the wrong color during the endgame`, 4); }
        } else if (isColorNominated) {
            const pottedNominatedColor = this.potMadeThisTurn.find(b => b.colorName === this.ballOn);
            if (pottedNominatedColor) { legalPotMade = true; this.ballOn = 'red'; }
            if (pottedRed) { this.commitFoul(`Potted a red ball when a color was on`, 4); }
        } else if (this.ballOn === 'red') {
            const pottedColor = this.potMadeThisTurn.find(b => b.type === 'color');
            if (pottedRed) { legalPotMade = true; this.ballOn = 'color'; }
            if (pottedColor) { this.commitFoul(`Potted a ${pottedColor.colorName} ball when a red was on`, pottedColor.value); }
        }
        return legalPotMade;
    }

    commitFoul(reason, points) {
        if (this.turnEndedByFoul) return;
        this.foulMessage = `Foul: ${reason}`;
        this.foulMessageTimer = 180; // 3 seconds at 60fps
        const foulPoints = Math.max(4, points);
        this.scoring.addFoul(this.currentPlayer, foulPoints, reason);
        this.turnEndedByFoul = true;
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
                        Matter.Body.setVelocity(ball.body, { x: 0, y: 0 });
                        this.potMadeThisTurn.push(ball); 
                        ball.remove();
                        if (ball.type === 'color' && !this.endgamePhase) {
                            this.pottedColorsToRespot.push(ball);
                        }
                        this.balls.splice(i, 1);
                    }
                    break; 
                }
            }
        }
    }

    handleCueBallPocketed() {
        if (this.cueBallNeedsRespotted) return;
        this.commitFoul('Cue ball potted', 4);
        this.cueBallNeedsRespotted = true;
        if (this.cueBall) { Matter.Body.setVelocity(this.cueBall.body, { x: 0, y: 0 }); }
        const cueBallIndex = this.balls.findIndex(b => b.type === 'cue');
        if (cueBallIndex !== -1) {
            this.balls[cueBallIndex].remove(); this.balls.splice(cueBallIndex, 1);
        }
        this.cueBall = null;
    }

    respotCueBall() {
        const baulkLineX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 5);
        const dRadius = this.table.dRadius;
        let cueX, cueY; let positionFound = false;
        cueX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6); cueY = this.TABLE_Y;
        let collides = this.balls.some(b => b && b.body && distance(b.body.position.x, b.body.position.y, cueX, cueY) < this.BALL_RADIUS * 2);
        if (collides) {
            for (let i = 0; i < 20; i++) {
                const angle = random(-HALF_PI, HALF_PI); const radius = random(0, dRadius);
                cueX = baulkLineX - cos(angle) * radius; cueY = this.TABLE_Y - sin(angle) * radius;
                let innerCollides = this.balls.some(b => b && b.body && distance(b.body.position.x, b.body.position.y, cueX, cueY) < this.BALL_RADIUS * 2);
                if (!innerCollides) { positionFound = true; break; }
            }
        } else { positionFound = true; }
        if (!positionFound) { cueX = this.TABLE_LEFT_X + (this.TABLE_WIDTH / 6); cueY = this.TABLE_Y; }
        const newCueBall = new Ball(cueX, cueY, 'cue', 'white', 0);
        this.balls.push(newCueBall); this.cueBall = newCueBall;
        this.cue.cueBall = newCueBall; this.cueBallNeedsRespotted = false;
    }

    respotColors() {
        for (let ball of this.pottedColorsToRespot) {
            let spot = this.findAvailableSpot(ball);
            ball.resetPosition(spot.x, spot.y);
            Matter.World.add(this.world, ball.body);
            this.balls.push(ball);
        }
        this.pottedColorsToRespot = [];
    }
    
    findAvailableSpot(ballToRespot) {
        // Use the ball's colorName property to find its designated spot
        let ownSpot = this.table.spots[ballToRespot.colorName];
        if (!this.table.isSpotOccupied(ownSpot, this.balls)) {
            return ownSpot;
        }
        // If occupied, check spots in descending order of value
        for (const colorName in this.table.spots) {
            const spotPosition = this.table.spots[colorName];
            if (!this.table.isSpotOccupied(spotPosition, this.balls)) {
                return spotPosition;
            }
        }
        // If all spots are occupied, this is a rare case. For now, return its own spot.
        return ownSpot;
    }

    switchPlayer() {
        this.currentPlayer = 1 - this.currentPlayer;
        if (!this.endgamePhase) { this.ballOn = 'red'; }
        else { this.ballOn = this.colorSequence[this.endgameColorIndex]; }
    }
    
    areRedsRemaining() {
        return this.balls.some(ball => ball.type === 'red');
    }

    calculatePointsRemaining() {
        // Simplified: 8 points for a red + color, then 27 for the final colors.
        const redsLeft = this.balls.filter(b => b.type === 'red').length;
        if (redsLeft > 0) {
            return redsLeft * 8 + 27;
        }
        // If only colors are left, sum their values
        return this.balls.reduce((sum, ball) => {
            if (ball.type !== 'cue') { return sum + ball.value; }
            return sum;
        }, 0);
    }

    reset() {
        for (let ball of this.balls) { ball.remove(); }
        this.balls = []; this.pottedColorsToRespot = []; this.potMadeThisTurn = [];
        this.setupBalls();
        this.cueBall = this.balls.find(ball => ball.type === 'cue');
        this.cue.cueBall = this.cueBall;
        this.scoring.reset();
        this.currentPlayer = 0; this.gameOver = false;
        this.cueBallNeedsRespotted = false; this.gameState = 'AWAITING_SHOT';
        this.ballOn = 'red'; this.firstContact = null;
        this.endgamePhase = false; this.endgameColorIndex = 0;
    }
}
