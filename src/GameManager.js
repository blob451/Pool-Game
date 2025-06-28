// src/GameManager.js
/**
 * Manages the core game logic, state, and physics simulation.
 */
class GameManager {
    /**
     * Initializes the physics engine, game components, and constants.
     */
    constructor() {
        // Establishes the Matter.js physics engine with specified gravity and iteration settings.
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        this.engine.positionIterations = 10;
        this.engine.velocityIterations = 8;
        
        // Creates and runs a runner to manage the engine's update cycle.
        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, this.engine);
        
        // Initializes the manager for handling shot replays.
        this.replayManager = new ReplayManager(this);

        // Sets up event listeners for physics collisions and engine updates.
        Matter.Events.on(this.engine, 'collisionStart', (event) => { this.handleCollisions(event); });
        Matter.Events.on(this.engine, 'afterUpdate', () => {
            if (this.replayManager) {
                this.replayManager.recordFrame();
            }
        });

        // Exposes the physics world globally for other modules.
        window.world = this.world;
        
        // Instantiates the table, scoring, and UI management systems.
        this.table = new Table();
        this.scoring = new Scoring();
        this.uiManager = new UIManager(this);

        // Defines constants for table dimensions and ball properties.
        this.TABLE_WIDTH = this.table.width;
        this.TABLE_HEIGHT = this.table.height;
        this.TABLE_X = this.table.x;
        this.TABLE_Y = this.table.y;
        this.TABLE_MIN_X = this.table.playMinX;
        this.TABLE_MAX_X = this.table.playMaxX;
        this.TABLE_MIN_Y = this.table.playMinY;
        this.TABLE_MAX_Y = this.table.playMaxY;
        this.BALL_RADIUS = Ball.snookerRadius();
        this.MAX_BALL_SPEED = 30;
        
        // Initializes arrays and objects for managing game elements.
        this.balls = [];
        this.ghostCueBall = { x: 0, y: 0, isValid: false };
        this.cue = new Cue(null);
        
        this.aimAssistEnabled = false;

        // Starts a new game in the standard mode.
        this.startNewMode(1);
    }
    
    // --- MODE SETUP LOGIC ---

    /**
     * Resets the game and initiates a new mode based on the provided identifier.
     * @param {number} mode - The identifier for the game mode to start.
     */
    startNewMode(mode) {
        this.reset();
        switch (mode) {
            case 1:
                this._setupStandard();
                break;
            case 2:
                this._setupRandomAllBalls();
                break;
            case 3:
                this._setupRandomReds();
                break;
        }
        this.gameState = 'BALL_IN_HAND';
    }

    /**
     * Sets up the standard snooker ball layout.
     */
    _setupStandard() {
        const baulkLineX = this.TABLE_MIN_X + (this.TABLE_WIDTH / 5);
        const dRadius = this.table.dRadius;
        const tableCenterY = this.TABLE_Y;
        const blueSpot = { x: this.TABLE_X, y: tableCenterY };
        const pinkSpot = { x: this.TABLE_MIN_X + (this.TABLE_WIDTH * 9 / 12), y: tableCenterY };
        const blackSpot = { x: this.TABLE_MIN_X + (this.TABLE_WIDTH * 10 / 11), y: tableCenterY };
        
        // Places the coloured balls on their respective spots.
        const colors = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        colors.forEach(color => {
            let spot;
            if (color === 'yellow') spot = { x: baulkLineX, y: tableCenterY + dRadius };
            else if (color === 'green') spot = { x: baulkLineX, y: tableCenterY - dRadius };
            else if (color === 'brown') spot = { x: baulkLineX, y: tableCenterY };
            else if (color === 'blue') spot = blueSpot;
            else if (color === 'pink') spot = pinkSpot;
            else if (color === 'black') spot = blackSpot;
            const ball = new Ball(spot.x, spot.y, 'color', color, this.scoring.getBallValue(color));
            ball.colorName = color;
            this.balls.push(ball);
        });

        // Arranges the red balls in a triangle formation.
        const triangleApex = { x: pinkSpot.x + this.BALL_RADIUS * 2 + 2, y: pinkSpot.y };
        for (let row = 0; row < 5; row++) {
            const yStart = triangleApex.y - row * (this.BALL_RADIUS + 0.5);
            for (let col = 0; col <= row; col++) {
                const x = triangleApex.x + row * (this.BALL_RADIUS * 2 * 0.88);
                const y = yStart + col * (this.BALL_RADIUS * 2 + 1);
                const redBall = new Ball(x, y, 'red', '#d62828', 1);
                redBall.colorName = 'red';
                this.balls.push(redBall);
            }
        }
    }

    /**
     * Sets up the table with all balls placed in random positions.
     */
    _setupRandomAllBalls() {
        const objectBalls = [
            ...Array(15).fill({ type: 'red', colorName: 'red', value: 1 }),
            { type: 'color', colorName: 'yellow', value: 2 }, { type: 'color', colorName: 'green', value: 3 },
            { type: 'color', colorName: 'brown', value: 4 }, { type: 'color', colorName: 'blue', value: 5 },
            { type: 'color', colorName: 'pink', value: 6 }, { type: 'color', colorName: 'black', value: 7 }
        ];

        for (const ballInfo of objectBalls) {
            this._placeBallRandomly(ballInfo.type, ballInfo.colorName, ballInfo.value);
        }
    }

    /**
     * Sets up the table with coloured balls on their spots and red balls randomly placed.
     */
    _setupRandomReds() {
        const baulkLineX = this.TABLE_MIN_X + (this.TABLE_WIDTH / 5);
        const dRadius = this.table.dRadius;
        const tableCenterY = this.TABLE_Y;
        const blueSpot = { x: this.TABLE_X, y: tableCenterY };
        const pinkSpot = { x: this.TABLE_MIN_X + (this.TABLE_WIDTH * 9 / 12), y: tableCenterY };
        const blackSpot = { x: this.TABLE_MIN_X + (this.TABLE_WIDTH * 10 / 11), y: tableCenterY };
        
        // Places the coloured balls on their respective spots.
        const colors = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        colors.forEach(color => {
            let spot;
            if (color === 'yellow') spot = { x: baulkLineX, y: tableCenterY + dRadius };
            else if (color === 'green') spot = { x: baulkLineX, y: tableCenterY - dRadius };
            else if (color === 'brown') spot = { x: baulkLineX, y: tableCenterY };
            else if (color === 'blue') spot = blueSpot;
            else if (color === 'pink') spot = pinkSpot;
            else if (color === 'black') spot = blackSpot;
            const ball = new Ball(spot.x, spot.y, 'color', color, this.scoring.getBallValue(color));
            ball.colorName = color;
            this.balls.push(ball);
        });
        
        // Places the 15 red balls randomly.
        for (let i = 0; i < 15; i++) {
            this._placeBallRandomly('red', 'red', 1);
        }
    }

    /**
     * Places a single ball at a random, non-overlapping position on the table.
     * @param {string} type - The type of ball ('red' or 'color').
     * @param {string} colorName - The name of the ball's colour.
     * @param {number} value - The point value of the ball.
     */
    _placeBallRandomly(type, colorName, value) {
        let position;
        let validPosition = false;
        let attempts = 0;
        // Iteratively attempts to find a valid position.
        while (!validPosition && attempts < 100) { 
            position = {
                x: random(this.TABLE_MIN_X + this.BALL_RADIUS, this.TABLE_MAX_X - this.BALL_RADIUS),
                y: random(this.TABLE_MIN_Y + this.BALL_RADIUS, this.TABLE_MAX_Y - this.BALL_RADIUS),
            };
            validPosition = true;
            // Verifies the position is not too close to other balls.
            for (const ball of this.balls) {
                if (distance(position.x, position.y, ball.body.position.x, ball.body.position.y) < this.BALL_RADIUS * 2.2) {
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        }
        const color = type === 'red' ? '#d62828' : Ball.resolveColor(type, colorName);
        const ball = new Ball(position.x, position.y, type, color, value);
        ball.colorName = colorName;
        this.balls.push(ball);
    }

    // --- CORE GAME LOOP ---

    /**
     * Updates the game state each frame, managing ball movement and game logic.
     */
    update() {
        this.replayManager.update();

        // Skips game logic updates during replay.
        if (this.replayManager.state === 'REPLAYING') {
            return;
        }

        if (this.foulMessageTimer > 0) this.foulMessageTimer--;

        // Manages physics and game state transitions when balls are in motion.
        if (this.gameState === 'BALLS_MOVING' && !this.cue.isShooting) {
            // Constrains ball velocity to a maximum speed.
            for (const ball of this.balls) {
                if (ball.body.speed > this.MAX_BALL_SPEED) {
                    Matter.Body.setVelocity(ball.body, {
                        x: ball.body.velocity.x / ball.body.speed * this.MAX_BALL_SPEED,
                        y: ball.body.velocity.y / ball.body.speed * this.MAX_BALL_SPEED
                    });
                }
            }
            
            this.checkPockets();
            if (this.cueBall && !this.table.isInPlayingArea(this.cueBall.body.position)) this.handleCueBallPocketed();
            if (areBallsStationary(this.balls)) this.gameState = 'HANDLING_TURN_END';
        } else if (this.gameState === 'HANDLING_TURN_END') {
            this.handleTurnEndLogic();
        } else if (this.gameState === 'BALL_IN_HAND') {
            this.updateGhostBallPosition();
        }
    }

    /**
     * Renders all game objects on the canvas.
     */
    draw() {
        if (this.replayManager.state === 'REPLAYING') {
            this.table.draw();
            this.replayManager.draw();
        } else {
            this.table.draw();
            for (let ball of this.balls) ball.show();
            this.replayManager.drawGhost();
            this.cue.draw();
            this.cue.drawAimTracer(this);
        }
        this.uiManager.draw();
    }
    
    // --- INPUT AND STATE HANDLING ---
    
    /**
     * Processes user input based on the current game state.
     * @param {string} eventType - The type of mouse event ('mousePressed', 'mouseDragged', 'mouseReleased').
     */
    handleInput(eventType) {
        if (eventType === 'mousePressed' && this.uiManager.handleInput(mouseX, mouseY)) {
            return;
        }

        if (this.replayManager.state === 'REPLAYING') {
            return;
        }
        
        if (this.gameOver) return;

        // Handles aiming and shooting mechanics.
        if (this.gameState === 'AWAITING_SHOT') {
            if (eventType === 'mousePressed') this.cue.startAiming(createVector(mouseX, mouseY));
            else if (eventType === 'mouseDragged') this.cue.updateAiming(createVector(mouseX, mouseY));
            else if (eventType === 'mouseReleased' && this.cue.aiming) {
                this.firstContact = null; this.turnEndedByFoul = false; this.potMadeThisTurn = []; this.collisionLog = [];
                this.replayManager.startRecording();
                this.cue.shoot(); 
                this.gameState = 'BALLS_MOVING';
            }
        } else if (this.gameState === 'BALL_IN_HAND' && eventType === 'mousePressed' && this.ghostCueBall.isValid) {
            this.placeNewCueBall();
        }
    }

    /**
     * Sets the nominated ball and transitions the game state to await a shot.
     * @param {string} colorName - The colour of the nominated ball.
     */
    handleNomination(colorName) {
        this.ballOn = colorName;
        this.gameState = 'AWAITING_SHOT';
    }

    /**
     * Logs collisions between the cue ball and other objects.
     * @param {object} event - The collision event from the physics engine.
     */
    handleCollisions(event) {
        for (const pair of event.pairs) {
            let otherBody = (this.cueBall && pair.bodyA === this.cueBall.body) ? pair.bodyB : 
                            (this.cueBall && pair.bodyB === this.cueBall.body) ? pair.bodyA : null;

            if (otherBody) {
                let logEntry = null;
                const lastCollision = this.collisionLog[this.collisionLog.length - 1];
                if (otherBody.label === 'table_boundary') {
                    if (!lastCollision || lastCollision.type !== 'cushion') {
                        logEntry = { type: 'cushion' };
                    }
                } else {
                    const hitBall = this.balls.find(b => b.body === otherBody);
                    if (hitBall) {
                        if (!this.firstContact) this.firstContact = hitBall;
                        logEntry = { type: 'ball', color: hitBall.color };
                    }
                }
                if (logEntry) this.collisionLog.push(logEntry);
            }
        }
    }

    // --- TURN AND RULE LOGIC ---

    /**
     * Manages the logic at the end of a player's turn, including foul checks and scoring.
     */
    handleTurnEndLogic() {
        this.replayManager.stopRecording();
        
        this.checkForFouls();
        let legalPotMade = this.checkLegalPots();
        
        if (!this.turnEndedByFoul && this.potMadeThisTurn.length > 0) {
            this.scoring.processTurn(this.potMadeThisTurn, this.currentPlayer);
            this.uiManager.triggerScoreAnimation(this.currentPlayer);
        }
        
        // Transitions to the endgame phase if no red balls remain.
        if (!this.endgamePhase && !this.areRedsRemaining()) {
            this.endgamePhase = true;
            this.ballOn = this.colorSequence[0];
        }

        // Checks for a game-ending condition based on the score difference.
        const score1 = this.scoring.getScore(0);
        const score2 = this.scoring.getScore(1);
        if (this.calculatePointsRemaining() < Math.abs(score1 - score2)) this.gameOver = true;

        if (this.turnEndedByFoul || !legalPotMade) {
            this.switchPlayer();
        } else if (legalPotMade && this.ballOn === 'color') {
            this.gameState = 'AWAITING_NOMINATION';
            return;
        }

        if (this.cueBallNeedsRespotted) {
            this.gameState = 'BALL_IN_HAND';
            this.cueBallNeedsRespotted = false;
        } else {
            this.respotColors();
            this.gameState = 'AWAITING_SHOT';
        }
    }

    /**
     * Evaluates the first contact of the cue ball to determine if a foul occurred.
     */
    checkForFouls() {
        if (this.turnEndedByFoul) return;
        if (!this.firstContact) { this.commitFoul("Did not hit any ball", 4); return; }

        const hitBallName = this.firstContact.colorName || 'Red';
        const isColorNominated = this.colorSequence.includes(this.ballOn);

        if (this.endgamePhase) {
            if (this.firstContact.type !== 'color' || this.firstContact.colorName !== this.ballOn) { this.commitFoul(`Hit ${hitBallName} when ${this.ballOn} was on`, this.firstContact.value); }
        } else if (isColorNominated) {
            if (this.firstContact.type !== 'color' || this.firstContact.colorName !== this.ballOn) { this.commitFoul(`Hit ${hitBallName} when ${this.ballOn} was on`, 4); }
        } else if (this.ballOn === 'red' && this.firstContact.type !== 'red') {
            this.commitFoul(`Hit ${hitBallName} when a red was on`, this.firstContact.value);
        }
    }
    
    /**
     * Verifies potted balls against the rules to determine if the pot was legal.
     * @returns {boolean} True if a legal pot was made.
     */
    checkLegalPots() {
        let legalPotMade = false;
        if (this.potMadeThisTurn.length === 0) return false;
        const pottedRed = this.potMadeThisTurn.find(b => b.type === 'red');

        const pottedColors = this.potMadeThisTurn.filter(b => b.type === 'color');
        if (pottedColors.length > 1) {
            const highestValue = pottedColors.reduce((max, b) => Math.max(max, b.value), 0);
            this.commitFoul("Potted more than one color", highestValue);
            return false;
        }

        if (!this.turnEndedByFoul) this.potMadeThisTurn.forEach(p => this.currentBreak += p.value);

        if (this.endgamePhase) {
            const pottedTargetColor = this.potMadeThisTurn.find(b => b.colorName === this.ballOn);
            if (pottedTargetColor) {
                legalPotMade = true;
                this.endgameColorIndex++;
                if (this.endgameColorIndex < this.colorSequence.length) this.ballOn = this.colorSequence[this.endgameColorIndex];
                else this.gameOver = true;
            } else if (this.potMadeThisTurn.length > 0) this.commitFoul(`Potted wrong color in endgame`, 4);
        } else if (this.ballOn === 'color') {
            const pottedNominatedColor = this.potMadeThisTurn.find(b => b.colorName === this.ballOn);
            if (pottedNominatedColor) { legalPotMade = true; this.ballOn = 'red'; }
            if (pottedRed) this.commitFoul(`Potted a red when a color was on`, 4);
        } else if (this.ballOn === 'red') {
            const pottedColor = this.potMadeThisTurn.find(b => b.type === 'color');
            if (pottedRed) { legalPotMade = true; this.ballOn = 'color'; }
            if (pottedColor) this.commitFoul(`Potted a ${pottedColor.colorName} when a red was on`, pottedColor.value);
        }
        return legalPotMade;
    }

    /**
     * Commits a foul, assigning points to the opponent and displaying a message.
     * @param {string} reason - The description of the foul.
     * @param {number} points - The number of points for the foul.
     */
    commitFoul(reason, points) {
        if (this.turnEndedByFoul) return;
        this.foulMessage = `Foul: ${reason}`;
        this.foulMessageTimer = 180;
        this.scoring.addFoul(this.currentPlayer, Math.max(4, points), reason);
        this.turnEndedByFoul = true;
    }
    
    // --- UTILITY METHODS ---

    /**
     * Toggles the aim assistance feature on or off.
     */
    toggleAimAssist() {
        this.aimAssistEnabled = !this.aimAssistEnabled;
    }

    /**
     * Checks if any balls have entered the pockets and handles them accordingly.
     */
    checkPockets() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            let ball = this.balls[i];
            if (!ball) continue;
            for (let pocket of this.table.pockets) {
                if (distance(ball.body.position.x, ball.body.position.y, pocket.x, pocket.y) < this.table.pocketRadius) {
                    if (ball.type === 'cue') {
                        this.handleCueBallPocketed();
                    } else {
                        this.uiManager.addPocketAnimation(ball);
                        this.potMadeThisTurn.push(ball); 
                        ball.remove();
                        if (ball.type === 'color' && !this.endgamePhase) this.pottedColorsToRespot.push(ball);
                        this.balls.splice(i, 1);
                    }
                    break; 
                }
            }
        }
    }

    /**
     * Manages the consequences of the cue ball being pocketed.
     */
    handleCueBallPocketed() {
        if (this.cueBallNeedsRespotted) return;
        this.commitFoul('Cue ball potted', 4);
        this.cueBallNeedsRespotted = true;
        const cueBallIndex = this.balls.findIndex(b => b.type === 'cue');
        if (cueBallIndex > -1) {
            this.balls[cueBallIndex].remove();
            this.balls.splice(cueBallIndex, 1);
        }
        this.cueBall = null;
    }
    
    /**
     * Updates the position and validity of the ghost cue ball during 'ball in hand'.
     */
    updateGhostBallPosition() {
        this.ghostCueBall.x = mouseX;
        this.ghostCueBall.y = mouseY;
        let isValid = true;

        const dCenterX = this.table.baulkLineX;
        const dCenterY = this.table.y;
        if (mouseX > dCenterX || distance(mouseX, mouseY, dCenterX, dCenterY) > this.table.dRadius) {
            isValid = false;
        }

        for (const ball of this.balls) {
            if (distance(mouseX, mouseY, ball.body.position.x, ball.body.position.y) < this.BALL_RADIUS * 2) {
                isValid = false;
                break;
            }
        }
        this.ghostCueBall.isValid = isValid;
    }

    /**
     * Places a new cue ball on the table at the ghost ball's position.
     */
    placeNewCueBall() {
        const newCueBall = new Ball(this.ghostCueBall.x, this.ghostCueBall.y, 'cue', 'white', 0);
        newCueBall.colorName = 'cue';
        this.balls.push(newCueBall);
        this.cueBall = newCueBall;
        this.cue.cueBall = newCueBall;
        this.gameState = 'AWAITING_SHOT';
    }

    /**
     * Respots any potted coloured balls to their designated spots on the table.
     */
    respotColors() {
        for (let ball of this.pottedColorsToRespot) {
            let spot = this.findAvailableSpot(ball);
            ball.resetPosition(spot.x, spot.y);
            this.balls.push(ball);
            Matter.World.add(this.world, ball.body);
        }
        this.pottedColorsToRespot = [];
    }
    
    /**
     * Finds an available spot for a coloured ball, following standard snooker rules.
     * @param {Ball} ballToRespot - The ball that needs to be respotted.
     * @returns {object} The coordinates of the available spot.
     */
    findAvailableSpot(ballToRespot) {
        let ownSpot = this.table.spots[ballToRespot.colorName];
        if (!this.table.isSpotOccupied(ownSpot, this.balls)) {
            return ownSpot;
        }
        const spotPriority = ['black', 'pink', 'blue', 'brown', 'green', 'yellow'];
        for (const colorName of spotPriority) {
            const spotPosition = this.table.spots[colorName];
            if (!this.table.isSpotOccupied(spotPosition, this.balls)) {
                return spotPosition;
            }
        }
        return ownSpot;
    }
    
    /**
     * Switches control to the other player and resets turn-specific variables.
     */
    switchPlayer() {
        this.currentPlayer = 1 - this.currentPlayer;
        this.currentBreak = 0;
        this.collisionLog = [];
        this.aimAssistEnabled = false; 
        if (!this.endgamePhase) { this.ballOn = 'red'; }
        else { this.ballOn = this.colorSequence[this.endgameColorIndex]; }
    }
    
    /**
     * Checks if there are any red balls remaining on the table.
     * @returns {boolean} True if red balls are still in play.
     */
    areRedsRemaining() {
        return this.balls.some(ball => ball.type === 'red');
    }

    /**
     * Calculates the total points remaining on the table.
     * @returns {number} The sum of points from all remaining balls.
     */
    calculatePointsRemaining() {
        const redsLeft = this.balls.filter(b => b.type === 'red').length;
        if (redsLeft > 0) {
            return redsLeft * 8 + 27;
        }
        return this.balls.reduce((sum, ball) => {
            if (ball.type === 'color') { return sum + ball.value; }
            return sum;
        }, 0);
    }
    
    /**
     * Resets the entire game to its initial state for a new frame.
     */
    reset() {
        if (this.balls) {
            for (let ball of this.balls) ball.remove();
        }
        Matter.World.clear(this.world, true);
        this.balls = []; 
        this.pottedColorsToRespot = []; 
        this.potMadeThisTurn = []; 
        this.collisionLog = [];
        this.table.createBoundaries();
        
        this.cueBall = null; 
        this.cue.cueBall = null;
        
        this.scoring.reset();
        this.currentPlayer = 0;
        this.gameOver = false;
        this.cueBallNeedsRespotted = false;
        this.ballOn = 'red'; 
        this.firstContact = null;
        this.colorSequence = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        this.endgamePhase = false; 
        this.endgameColorIndex = 0;
        this.currentBreak = 0;
        this.aimAssistEnabled = false; 
    }
}