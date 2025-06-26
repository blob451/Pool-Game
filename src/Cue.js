// src/Cue.js
/**
 * Handles cue aiming, visual feedback, and shooting logic.
 * This version renders a full, stylized cue stick for aiming, with an improved, more realistic design.
 */
class Cue {
    constructor(cueBall) {
        this.cueBall = cueBall; // Reference to cue ball object
        this.aiming = false;
        this.start = null; // Mouse press position
        this.end = null;   // Mouse drag position
        
        // Constants for power calculation
        this.maxPowerDist = 150;
        this.powerScale = 0.00035;

        // Constants for cue appearance
        this.cueLength = 380; // Slightly longer for a more professional look
        this.cueButtWidth = 14;
        this.cueShaftWidth = 9;
        this.cueTipWidth = 7;
        this.cuePullback = 10; // The small gap between cue tip and ball
    }

    /**
     * Start aiming (on mousePressed)
     * @param {p5.Vector} mousePos
     */
    startAiming(mousePos) {
        this.aiming = true;
        this.start = mousePos.copy();
        this.end = mousePos.copy();
    }

    /**
     * Update aim position (on mouseDragged)
     * @param {p5.Vector} mousePos
     */
    updateAiming(mousePos) {
        if (this.aiming) {
            this.end = mousePos.copy();
        }
    }

    /**
     * Calculates and applies the force to the cue ball.
     */
    shoot() {
        if (!this.aiming || !this.cueBall || !this.cueBall.body) {
            this.aiming = false;
            return;
        }

        let forceVector = p5.Vector.sub(this.start, this.end);
        let dragDistance = constrain(forceVector.mag(), 0, this.maxPowerDist);
        let forceMagnitude = dragDistance * this.powerScale;
        forceVector.setMag(forceMagnitude);

        Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position, { x: forceVector.x, y: forceVector.y });
        
        this.aiming = false;
        this.start = null;
        this.end = null;
    }

    /**
     * Draw the stylized cue stick while aiming.
     */
    draw() {
        if (!this.aiming || !this.start || !this.end || !this.cueBall || !this.cueBall.body) {
            return;
        }

        const cueBallPos = createVector(this.cueBall.body.position.x, this.cueBall.body.position.y);
        const dragVec = p5.Vector.sub(this.start, this.end);
        
        const angle = dragVec.heading();
        
        const power = constrain(dragVec.mag(), 0, this.maxPowerDist);
        const powerPercent = (power / this.maxPowerDist) * 100;
        const pullBack = map(power, 0, this.maxPowerDist, 0, this.maxPowerDist * 0.6);

        push(); // Start isolated drawing state
        translate(cueBallPos.x, cueBallPos.y);
        rotate(angle);

        const cueStart = -this.cuePullback - pullBack;
        const jointPosition = cueStart - this.cueLength * 0.75; // 3/4 joint position

        // 1. Cue Shadow
        stroke(10, 5, 0, 90);
        strokeWeight(this.cueButtWidth + 4);
        strokeCap(ROUND);
        line(cueStart - this.cueLength + 5, 5, cueStart + 5, 5);
        
        // 2. Main Butt (darker, rich wood like ebony)
        stroke(45, 35, 25); // Dark ebony/rosewood color
        strokeWeight(this.cueButtWidth);
        strokeCap(SQUARE); // Gives the butt end a flat appearance
        line(cueStart - this.cueLength, 0, jointPosition, 0);
        
        // 3. Brass Joint
        stroke(181, 137, 0); // Brass color
        strokeWeight(this.cueButtWidth + 1); // Slightly thicker to appear as a joint
        strokeCap(ROUND);
        line(jointPosition, 0, jointPosition + 4, 0);

        // 4. Shaft (lighter ash wood)
        stroke(224, 204, 169); // Ash wood color
        strokeWeight(this.cueShaftWidth);
        line(jointPosition + 4, 0, cueStart - 5, 0);
        
        // 5. Ferrule (white part before the tip)
        stroke(245, 245, 240);
        strokeWeight(this.cueTipWidth);
        line(cueStart - 5, 0, cueStart, 0);
        
        // 6. Tip (leathery blue/brown)
        stroke(60, 90, 110);
        strokeWeight(this.cueTipWidth);
        point(cueStart, 0);
        
        pop(); // Restore original drawing state

        // Draw aiming line and power text
        push();
        stroke(255, 255, 255, 100);
        strokeWeight(1);
        drawingContext.setLineDash([3, 5]); // Create a dashed line for the aiming guide
        line(cueBallPos.x, cueBallPos.y, this.end.x, this.end.y);
        drawingContext.setLineDash([]); // Reset to solid line

        noStroke();
        fill(255);
        textAlign(CENTER);
        textSize(16);
        text(`Power: ${powerPercent.toFixed(0)}%`, this.end.x, this.end.y - 20);
        pop();
    }
}
