// src/Cue.js
/**
 * Handles cue aiming, visual feedback, and shooting logic.
 * This version includes a realistic cue stick, a dynamic power bar, and a striking animation.
 */
class Cue {
    constructor(cueBall) {
        this.cueBall = cueBall;
        this.aiming = false;
        this.start = null;
        this.end = null;
        
        this.maxPowerDist = 150;
        this.powerScale = 0.0005; // Reverted to original power scale as requested

        this.cueLength = 380;
        this.cueButtWidth = 14;
        this.cueShaftWidth = 9;
        this.cueTipWidth = 7;
        this.cuePullback = 10;

        this.powerColorLow = color(67, 160, 71);
        this.powerColorMid = color(253, 216, 53);
        this.powerColorHigh = color(211, 47, 47);

        // --- NEW: Animation state ---
        this.isShooting = false;
        this.shootAnimation = {
            progress: 0,
            duration: 8, // Animation duration in frames
            finalPower: 0,
            finalAngle: 0,
            initialPullback: 0
        };
    }

    startAiming(mousePos) {
        if (this.isShooting) return;
        this.aiming = true;
        this.start = mousePos.copy();
        this.end = mousePos.copy();
    }

    updateAiming(mousePos) {
        if (this.aiming) {
            this.end = mousePos.copy();
        }
    }

    shoot() {
        if (!this.aiming || !this.cueBall || !this.cueBall.body) return;

        // --- MODIFIED: Trigger animation instead of applying force directly ---
        const dragVec = p5.Vector.sub(this.start, this.end);
        const power = constrain(dragVec.mag(), 0, this.maxPowerDist);
        
        this.shootAnimation.finalPower = power * this.powerScale;
        this.shootAnimation.finalAngle = dragVec.heading();
        this.shootAnimation.initialPullback = map(power, 0, this.maxPowerDist, 0, this.maxPowerDist * 0.6);
        this.shootAnimation.progress = 0;
        
        this.isShooting = true;
        this.aiming = false; // Stop aiming visuals
    }

    draw() {
        if (this.isShooting) {
            this.drawShotAnimation();
        } else if (this.aiming && this.start && this.end && this.cueBall && this.cueBall.body) {
            this.drawAimingVisuals();
        }
    }

    drawAimingVisuals() {
        const cueBallPos = createVector(this.cueBall.body.position.x, this.cueBall.body.position.y);
        const dragVec = p5.Vector.sub(this.start, this.end);
        const angle = dragVec.heading();
        const power = constrain(dragVec.mag(), 0, this.maxPowerDist);
        const powerPercent = power / this.maxPowerDist;
        const pullBack = map(power, 0, this.maxPowerDist, 0, this.maxPowerDist * 0.6);

        this.drawCue(angle, pullBack);
        this.drawPowerBar(angle, powerPercent, pullBack);
        this.drawAimingGuideLine(cueBallPos);
    }
    
    drawShotAnimation() {
        this.shootAnimation.progress++;
        
        const t = this.shootAnimation.progress / this.shootAnimation.duration;
        // Ease-out quint function for a sharp, fast strike
        const easedT = 1 - Math.pow(1 - t, 5); 
        
        const lunge = this.shootAnimation.initialPullback * easedT;
        const currentPullback = this.shootAnimation.initialPullback - lunge;
        
        this.drawCue(this.shootAnimation.finalAngle, currentPullback);
        
        if (this.shootAnimation.progress >= this.shootAnimation.duration) {
            const forceVector = p5.Vector.fromAngle(this.shootAnimation.finalAngle).setMag(this.shootAnimation.finalPower);
            Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position, { x: forceVector.x, y: forceVector.y });
            
            this.isShooting = false; // End animation
        }
    }

    drawCue(angle, pullBack) {
        push();
        translate(this.cueBall.body.position.x, this.cueBall.body.position.y);
        rotate(angle);

        const cueStart = -this.cuePullback - pullBack;
        const jointPosition = cueStart - this.cueLength * 0.75;

        // Shadow
        stroke(10, 5, 0, 90);
        strokeWeight(this.cueButtWidth + 4);
        strokeCap(ROUND);
        line(cueStart - this.cueLength + 5, 5, cueStart + 5, 5);
        
        // Butt
        stroke(45, 35, 25);
        strokeWeight(this.cueButtWidth);
        strokeCap(SQUARE);
        line(cueStart - this.cueLength, 0, jointPosition, 0);
        
        // Brass Joint
        stroke(181, 137, 0);
        strokeWeight(this.cueButtWidth + 1);
        strokeCap(ROUND);
        line(jointPosition, 0, jointPosition + 4, 0);

        // Shaft
        stroke(224, 204, 169);
        strokeWeight(this.cueShaftWidth);
        line(jointPosition + 4, 0, cueStart - 5, 0);
        
        // Ferrule
        stroke(245, 245, 240);
        strokeWeight(this.cueTipWidth);
        line(cueStart - 5, 0, cueStart, 0);
        
        // Tip
        stroke(60, 90, 110);
        strokeWeight(this.cueTipWidth);
        point(cueStart, 0);

        pop();
    }

    drawPowerBar(angle, powerPercent, pullBack) {
        push();
        translate(this.cueBall.body.position.x, this.cueBall.body.position.y);
        rotate(angle);
        
        const cueStart = -this.cuePullback - pullBack;
        const powerBarYOffset = 35;
        const powerBarLength = 180;
        const powerBarHeight = 10;
        const powerBarX = cueStart - this.cueLength;

        // Background
        noStroke();
        fill(0, 0, 0, 120);
        rect(powerBarX, powerBarYOffset, powerBarLength, powerBarHeight, 5);
        
        // Fill
        let currentPowerColor;
        if (powerPercent <= 0.5) {
            let amount = powerPercent * 2;
            currentPowerColor = lerpColor(this.powerColorLow, this.powerColorMid, amount);
        } else {
            let amount = (powerPercent - 0.5) * 2;
            currentPowerColor = lerpColor(this.powerColorMid, this.powerColorHigh, amount);
        }
        
        fill(currentPowerColor);
        rect(powerBarX, powerBarYOffset, powerBarLength * powerPercent, powerBarHeight, 5);
        
        // Text
        noStroke();
        fill(255, 220);
        textSize(12);
        textAlign(LEFT, CENTER);
        text(`${(powerPercent * 100).toFixed(0)}%`, powerBarX + powerBarLength + 10, powerBarYOffset + powerBarHeight / 2);

        pop();
    }

    drawAimingGuideLine(cueBallPos) {
        push();
        stroke(255, 255, 255, 100);
        strokeWeight(1);
        drawingContext.setLineDash([3, 5]);
        line(cueBallPos.x, cueBallPos.y, this.end.x, this.end.y);
        drawingContext.setLineDash([]);
        pop();
    }
}
