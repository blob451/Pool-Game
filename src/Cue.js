// src/Cue.js
/**
 * Manages the player's cue, including aiming, power selection,
 * and the visual feedback for shooting.
 */
class Cue {
    /**
     * Initializes the cue with a reference to the cue ball and its properties.
     * @param {Ball} cueBall - The instance of the cue ball.
     */
    constructor(cueBall) {
        this.cueBall = cueBall;
        this.aiming = false; // Tracks if the player is currently aiming.
        this.start = null; // Stores the mouse position when aiming begins.
        this.end = null; // Stores the current mouse position during aiming.
        
        // Defines the parameters for shot power.
        this.maxPowerDist = 150;
        this.powerScale = 0.0005;

        // Defines the visual dimensions of the cue stick.
        this.cueLength = 380;
        this.cueButtWidth = 14;
        this.cueShaftWidth = 9;
        this.cueTipWidth = 7;
        this.cuePullback = 10;

        // Defines colours for the power indicator bar.
        this.powerColorLow = color(67, 160, 71);
        this.powerColorMid = color(253, 216, 53);
        this.powerColorHigh = color(211, 47, 47);

        // Manages the state and properties of the shooting animation.
        this.isShooting = false;
        this.shootAnimation = {
            progress: 0,
            duration: 8,
            finalPower: 0,
            finalAngle: 0,
            initialPullback: 0
        };
    }

    /**
     * Begins the aiming process.
     * @param {p5.Vector} mousePos - The current position of the mouse.
     */
    startAiming(mousePos) {
        if (!this.cueBall) return;
        this.aiming = true;
        this.start = mousePos;
        this.end = mousePos;
    }

    /**
     * Updates the aim based on the mouse's movement.
     * @param {p5.Vector} mousePos - The current position of the mouse.
     */
    updateAiming(mousePos) {
        if (!this.aiming) return;
        this.end = mousePos;
    }

    /**
     * Executes the shot by applying force to the cue ball.
     */
    shoot() {
        if (!this.aiming) return;
        
        // Calculates the force vector based on the distance the mouse was dragged.
        const forceVector = p5.Vector.sub(this.start, this.end);
        const distance = clamp(forceVector.mag(), 0, this.maxPowerDist);
        const power = distance * this.powerScale;

        // Sets up the properties for the shooting animation.
        this.shootAnimation.finalPower = power;
        this.shootAnimation.finalAngle = forceVector.heading();
        this.shootAnimation.initialPullback = distance;
        this.isShooting = true;
        this.aiming = false;
    }

    /**
     * Main rendering function for the cue, called every frame.
     */
    draw() {
        if (!this.cueBall) return;
        push();

        // Renders either the shooting animation or the aiming cue.
        if (this.isShooting) {
            this.animateShot();
        } else if (this.aiming) {
            this.drawAimingCue();
        }

        pop();
    }
    
    /**
     * Renders the aim assist tracer line if the feature is enabled.
     * @param {GameManager} gameManager - The main game manager instance.
     */
    drawAimTracer(gameManager) {
        if (!gameManager.aimAssistEnabled || !this.aiming || !this.cueBall) {
            return;
        }

        push();
        const direction = p5.Vector.sub(this.start, this.end).normalize();
        const startPoint = createVector(this.cueBall.body.position.x, this.cueBall.body.position.y);
        const endPoint = p5.Vector.add(startPoint, p5.Vector.mult(direction, 3000));

        stroke(255, 255, 255, 150);
        strokeWeight(2);
        line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        pop();
    }

    /**
     * Manages the animation of the cue stick striking the ball.
     */
    animateShot() {
        this.shootAnimation.progress++;
        let animProgress = this.shootAnimation.progress / this.shootAnimation.duration;
        let easedProgress = (1 - Math.cos(animProgress * PI)) / 2; // Easing for smooth animation.
        
        const currentPullback = lerp(this.shootAnimation.initialPullback, -this.cuePullback * 4, easedProgress);
        
        // Translates and rotates the coordinate system to draw the cue relative to the cue ball.
        translate(this.cueBall.body.position.x, this.cueBall.body.position.y);
        rotate(this.shootAnimation.finalAngle);
        
        this._drawCueStick(currentPullback);
        
        // Applies force to the cue ball at the end of the animation.
        if (this.shootAnimation.progress >= this.shootAnimation.duration) {
            const force = this.shootAnimation.finalPower;
            const angle = this.shootAnimation.finalAngle;
            Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position, {
                x: Math.cos(angle) * force,
                y: Math.sin(angle) * force
            });
            this.isShooting = false;
            this.shootAnimation.progress = 0;
        }
    }
    
    /**
     * Renders the cue stick and power bar while the player is aiming.
     */
    drawAimingCue() {
        const forceVector = p5.Vector.sub(this.start, this.end);
        const distance = clamp(forceVector.mag(), 0, this.maxPowerDist);
        const angle = forceVector.heading();

        translate(this.cueBall.body.position.x, this.cueBall.body.position.y);
        rotate(angle);
        
        this._drawCueStick(distance);
        this._drawPowerBar(distance);
    }
    
    /**
     * Renders the individual components of the cue stick.
     * @param {number} pullBack - The distance the cue is pulled back from the ball.
     */
    _drawCueStick(pullBack) {
        const cueStart = -this.cuePullback - pullBack;
        const jointPosition = cueStart - this.cueLength * (1 - (0.45 * 2/5));

        // Renders the shadow of the cue stick.
        stroke(10, 5, 0, 90);
        strokeWeight(this.cueButtWidth + 4);
        strokeCap(ROUND);
        line(cueStart - this.cueLength + 5, 5, cueStart + 5, 5);
        
        // Renders the butt of the cue.
        stroke(45, 35, 25);
        strokeWeight(this.cueButtWidth);
        strokeCap(SQUARE);
        line(cueStart - this.cueLength, 0, jointPosition, 0);
        
        // Renders the brass joint.
        stroke(181, 137, 0);
        strokeWeight(this.cueButtWidth + 1);
        strokeCap(ROUND);
        line(jointPosition, 0, jointPosition + 4, 0);

        // Renders the shaft of the cue.
        stroke(224, 204, 169);
        strokeWeight(this.cueShaftWidth);
        line(jointPosition + 4, 0, cueStart - 5, 0);
        
        // Renders the ferrule.
        stroke(245, 245, 240);
        strokeWeight(this.cueTipWidth);
        line(cueStart - 5, 0, cueStart, 0);
        
        // Renders the tip of the cue.
        stroke(60, 90, 110);
        strokeWeight(this.cueTipWidth);
        point(cueStart, 0);
    }
    
    /**
     * Renders the power bar UI element.
     * @param {number} pullBack - The current pullback distance, used to determine power.
     */
    _drawPowerBar(pullBack) {
        const powerPercent = pullBack / this.maxPowerDist;
        
        const cueStart = -this.cuePullback - pullBack;
        const powerBarYOffset = 35;
        const powerBarLength = 180;
        const powerBarHeight = 10;
        const powerBarX = cueStart - this.cueLength;

        // Renders the background of the power bar.
        noStroke();
        fill(0, 0, 0, 120);
        rect(powerBarX, powerBarYOffset, powerBarLength, powerBarHeight, 5);
        
        // Determines the colour of the power bar based on the power percentage.
        let currentPowerColor;
        if (powerPercent <= 0.5) {
            let amount = powerPercent * 2;
            currentPowerColor = lerpColor(this.powerColorLow, this.powerColorMid, amount);
        } else {
            let amount = (powerPercent - 0.5) * 2;
            currentPowerColor = lerpColor(this.powerColorMid, this.powerColorHigh, amount);
        }
        
        // Renders the filled portion of the power bar.
        fill(currentPowerColor);
        rect(powerBarX, powerBarYOffset, powerBarLength * powerPercent, powerBarHeight, 5);
        
        // Renders the text indicating the power percentage.
        noStroke();
        fill(255, 220);
        textSize(12);
        textAlign(LEFT, CENTER);
        text(`${(powerPercent * 100).toFixed(0)}%`, powerBarX + powerBarLength + 10, powerBarYOffset + powerBarHeight / 2);
    }
}