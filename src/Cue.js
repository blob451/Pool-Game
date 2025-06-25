// src/Cue.js
/**
 * Handles cue aiming, visual feedback, and shooting logic.
 * This version has refined power scaling to prevent overly powerful shots.
 */
class Cue {
    constructor(cueBall) {
        this.cueBall = cueBall; // Reference to cue ball object
        this.aiming = false;
        this.start = null; // Mouse press position
        this.end = null;   // Mouse drag position
        
        // Constants adapted from your pool game for realistic power
        this.maxPowerDist = 150; // The maximum distance the mouse can be dragged for power.
        this.powerScale = 0.00035; // A scalar to convert drag distance to a reasonable physics force.
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
     * This method is now self-contained.
     */
    shoot() {
        if (!this.aiming || !this.cueBall || !this.cueBall.body) {
            this.aiming = false;
            return;
        }

        // Calculate the force vector from the drag direction
        let forceVector = p5.Vector.sub(this.start, this.end);
        
        // Constrain the drag distance to limit the power
        let dragDistance = constrain(forceVector.mag(), 0, this.maxPowerDist);
        
        // Calculate the final force magnitude
        let forceMagnitude = dragDistance * this.powerScale;
        forceVector.setMag(forceMagnitude);

        // Apply the force to the cue ball
        Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position, { x: forceVector.x, y: forceVector.y });
        
        // Reset aiming state
        this.aiming = false;
        this.start = null;
        this.end = null;
    }

    /**
     * Draw the cue line while aiming
     */
    draw() {
        if (this.aiming && this.start && this.end && this.cueBall && this.cueBall.body) {
            stroke(255, 255, 0, 200);
            strokeWeight(2);
            line(this.cueBall.body.position.x, this.cueBall.body.position.y, this.end.x, this.end.y);
            
            // Draw a power indicator
            let dragVec = p5.Vector.sub(this.start, this.end);
            let power = constrain(dragVec.mag(), 0, this.maxPowerDist);
            let powerPercent = (power / this.maxPowerDist) * 100;

            noStroke();
            fill(255);
            textAlign(CENTER);
            textSize(16);
            text(`Power: ${powerPercent.toFixed(0)}%`, this.end.x, this.end.y - 20);
        }
    }
}
