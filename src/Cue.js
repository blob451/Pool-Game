// src/Cue.js
/**
 * Handles cue aiming, visual feedback, and shooting logic.
 * This version includes the Aim Assist tracer line and a restored cue design.
 */
class Cue {
    constructor(cueBall) {
        this.cueBall = cueBall;
        this.aiming = false;
        this.start = null;
        this.end = null;
        
        this.maxPowerDist = 150;
        this.powerScale = 0.0005;

        this.cueLength = 380;
        this.cueButtWidth = 14;
        this.cueShaftWidth = 9;
        this.cueTipWidth = 7;
        this.cuePullback = 10;

        this.railColor = color(116, 87, 48);

        this.powerColorLow = color(67, 160, 71);
        this.powerColorMid = color(253, 216, 53);
        this.powerColorHigh = color(211, 47, 47);

        this.isShooting = false;
        this.shootAnimation = {
            progress: 0,
            duration: 8,
            finalPower: 0,
            finalAngle: 0,
            initialPullback: 0
        };
    }

    startAiming(mousePos) {
        if (!this.cueBall) return;
        this.aiming = true;
        this.start = mousePos;
        this.end = mousePos;
    }

    updateAiming(mousePos) {
        if (!this.aiming) return;
        this.end = mousePos;
    }

    shoot() {
        if (!this.aiming) return;
        
        const forceVector = p5.Vector.sub(this.start, this.end);
        const distance = clamp(forceVector.mag(), 0, this.maxPowerDist);
        const power = distance * this.powerScale;

        this.shootAnimation.finalPower = power;
        this.shootAnimation.finalAngle = forceVector.heading();
        this.shootAnimation.initialPullback = distance;
        this.isShooting = true;
        this.aiming = false;
    }

    draw() {
        if (!this.cueBall) return;
        push();

        if (this.isShooting) {
            this.animateShot();
        } else if (this.aiming) {
            this.drawAimingCue();
        }

        pop();
    }
    
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

    animateShot() {
        this.shootAnimation.progress++;
        let animProgress = this.shootAnimation.progress / this.shootAnimation.duration;
        let easedProgress = (1 - Math.cos(animProgress * PI)) / 2;
        
        const currentPullback = lerp(this.shootAnimation.initialPullback, -this.cuePullback * 4, easedProgress);
        
        translate(this.cueBall.body.position.x, this.cueBall.body.position.y);
        rotate(this.shootAnimation.finalAngle);
        
        this._drawCueStick(currentPullback);
        
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
    
    drawAimingCue() {
        const forceVector = p5.Vector.sub(this.start, this.end);
        const distance = clamp(forceVector.mag(), 0, this.maxPowerDist);
        const angle = forceVector.heading();

        translate(this.cueBall.body.position.x, this.cueBall.body.position.y);
        rotate(angle);
        
        this._drawCueStick(distance);
        this._drawPowerBar(distance);
    }
    
    _drawCueStick(pullBack) {
        const cueStart = -this.cuePullback - pullBack;
        // The original butt was ~45% of the cue length. 2/5 of that is ~18%.
        // The joint position is the coordinate where the butt ends.
        // A higher multiplier means a shorter butt. (1 - 0.18) = 0.82
        const jointPosition = cueStart - this.cueLength * (1 - (0.45 * 2/5)); // Corrected calculation

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
    }
    
    _drawPowerBar(pullBack) {
        const powerPercent = pullBack / this.maxPowerDist;
        
        const cueStart = -this.cuePullback - pullBack;
        const powerBarYOffset = 35;
        const powerBarLength = 180;
        const powerBarHeight = 10;
        const powerBarX = cueStart - this.cueLength;

        noStroke();
        fill(0, 0, 0, 120);
        rect(powerBarX, powerBarYOffset, powerBarLength, powerBarHeight, 5);
        
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
        
        noStroke();
        fill(255, 220);
        textSize(12);
        textAlign(LEFT, CENTER);
        text(`${(powerPercent * 100).toFixed(0)}%`, powerBarX + powerBarLength + 10, powerBarYOffset + powerBarHeight / 2);
    }
}
