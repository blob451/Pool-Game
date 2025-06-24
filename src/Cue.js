// src/Cue.js
/**
 * Handles cue aiming, visual feedback, and shooting logic.
 * Integrates user input (mouse drag) with cue ball force application.
 */
class Cue {
    constructor(cueBall) {
        this.cueBall = cueBall; // Reference to cue ball object
        this.aiming = false;
        this.start = null; // Mouse press position
        this.end = null;   // Mouse drag position
        this.maxPower = 100; // Max drag distance for power
        this.powerScale = 0.005; // Tweak to set realistic shot strength
    }

    /**
     * Start aiming (on mousePressed)
     * Only allow if all balls are stationary (handled in GameManager)
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
     * Shoot the cue ball (on mouseReleased)
     * Applies force based on drag direction/length
     */
    shoot() {
        if (this.aiming && this.end && this.start) {
            let force = p5.Vector.sub(this.start, this.end);
            let magnitude = constrain(force.mag(), 0, this.maxPower) * this.powerScale;
            force.setMag(magnitude);
            // Apply force to cue ball (Matter.js expects {x, y})
            Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position, { x: force.x, y: force.y });
            this.aiming = false;
            this.start = null;
            this.end = null;
        }
    }

    /**
     * Draw the cue line while aiming
     */
    draw() {
        if (this.aiming && this.start && this.end) {
            stroke(255, 255, 0);
            strokeWeight(3);
            line(this.cueBall.body.position.x, this.cueBall.body.position.y, this.end.x, this.end.y);
        }
    }
}