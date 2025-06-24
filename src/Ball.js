// src/Ball.js
/**
 * Represents a ball (cue, red, or colored) on the snooker table.
 * Handles physics body creation, rendering, and respotting (for colors).
 */
class Ball {
    /**
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} type - 'cue' | 'red' | 'color'
     * @param {string} color - Fill color (e.g. 'white', '#d62828')
     * @param {number} value - Point value (0 for cue, 1 for red, 2-7 for colors)
     */
    constructor(x, y, type, color, value) {
        this.initialX = x;
        this.initialY = y;
        this.type = type;
        this.color = color;
        this.value = value;
        this.r = 10; // Ball radius (tune for snooker)

        // Matter.js body
        this.body = Matter.Bodies.circle(x, y, this.r, {
            restitution: 0.9,
            friction: 0.01,
            frictionAir: 0.01,
            label: 'ball',
        });
        Matter.World.add(world, this.body);
    }

    /**
     * Draw the ball at its current position (called from GameManager.draw())
     */
    show() {
        const pos = this.body.position;
        push();
        fill(this.color);
        noStroke();
        ellipse(pos.x, pos.y, this.r * 2);
        pop();
    }

    /**
     * Respot the ball to its initial position (for colors after being potted)
     */
    resetPosition() {
        Matter.Body.setPosition(this.body, { x: this.initialX, y: this.initialY });
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.body, 0);
    }

    /**
     * Remove the ball from the physics world
     */
    remove() {
        Matter.World.remove(world, this.body);
    }
}