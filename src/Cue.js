// src/Cue.js
/**
 * Handles cue aiming, visual feedback, and shooting logic.
 * This version includes a realistic cue stick and a dynamic, graphical power bar.
 */
class Cue {
    constructor(cueBall) {
        this.cueBall = cueBall;
        this.aiming = false;
        this.start = null;
        this.end = null;
        
        this.maxPowerDist = 150;
        this.powerScale = 0.0001;

        this.cueLength = 380;
        this.cueButtWidth = 14;
        this.cueShaftWidth = 9;
        this.cueTipWidth = 7;
        this.cuePullback = 10;

        // Power bar colors
        this.powerColorLow = color(67, 160, 71);   // Green
        this.powerColorMid = color(253, 216, 53);  // Yellow
        this.powerColorHigh = color(211, 47, 47);   // Red
    }

    startAiming(mousePos) {
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
        if (!this.aiming || !this.cueBall || !this.cueBall.body) {
            this.aiming = false;
            return;
        }

        let forceVector = p5.Vector.sub(this.start, this.end);
        let dragDistance = constrain(forceVector.mag(), 0, this.maxPowerDist);
        let forceMagnitude = dragDistance * this.powerScale * 2;
        forceVector.setMag(forceMagnitude);

        Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position, { x: forceVector.x, y: forceVector.y });
        
        this.aiming = false;
        this.start = null;
        this.end = null;
    }

    draw() {
        if (!this.aiming || !this.start || !this.end || !this.cueBall || !this.cueBall.body) {
            return;
        }

        const cueBallPos = createVector(this.cueBall.body.position.x, this.cueBall.body.position.y);
        const dragVec = p5.Vector.sub(this.start, this.end);
        
        const angle = dragVec.heading();
        
        const power = constrain(dragVec.mag(), 0, this.maxPowerDist);
        const powerPercent = power / this.maxPowerDist;
        const pullBack = map(power, 0, this.maxPowerDist, 0, this.maxPowerDist * 0.6);

        push();
        translate(cueBallPos.x, cueBallPos.y);
        rotate(angle);

        const cueStart = -this.cuePullback - pullBack;
        const jointPosition = cueStart - this.cueLength * 0.75;

        // --- Draw Cue Stick ---
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

        // --- Draw Power Bar ---
        const powerBarYOffset = 35;
        const powerBarLength = 180;
        const powerBarHeight = 10;
        const powerBarX = cueStart - this.cueLength;

        // Power bar background
        noStroke();
        fill(0, 0, 0, 120);
        rect(powerBarX, powerBarYOffset, powerBarLength, powerBarHeight, 5);
        
        // Power bar fill
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
        
        // Power percentage text
        noStroke();
        fill(255, 220);
        textSize(12);
        textAlign(LEFT, CENTER);
        text(`${(powerPercent * 100).toFixed(0)}%`, powerBarX + powerBarLength + 10, powerBarYOffset + powerBarHeight / 2);

        pop(); // Restore original drawing state

        // --- Draw Aiming Guide Line ---
        push();
        stroke(255, 255, 255, 100);
        strokeWeight(1);
        drawingContext.setLineDash([3, 5]);
        line(cueBallPos.x, cueBallPos.y, this.end.x, this.end.y);
        drawingContext.setLineDash([]);
        pop();
    }
}
