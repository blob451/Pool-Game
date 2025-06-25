// src/Ball.js
/**
 * Represents a ball (cue, red, or colored) on the snooker table.
 * Snooker version: standardized radius, true colors, and value/type assignment.
 */
class Ball {
    /**
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} type - 'cue' | 'red' | 'color'
     * @param {string} color - Ball color as hex or CSS color name
     * @param {number} value - Point value (0 for cue, 1 for red, 2-7 for colors)
     */
    constructor(x, y, type, color, value) {
        this.initialX = x;
        this.initialY = y;
        this.type = type;
        this.color = Ball.resolveColor(type, color);
        this.value = value;
        this.r = Ball.snookerRadius(); // Use consistent radius for all snooker balls

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
     * Draw the ball at its current position
     */
    show() {
        const pos = this.body.position;
        push();
        fill(this.color);
        noStroke();
        ellipse(pos.x, pos.y, this.r * 2);
        // Optional: draw ball value (for debug)
        // if (this.type !== 'cue') {
        //     fill(0,100);
        //     textSize(this.r+2);
        //     textAlign(CENTER, CENTER);
        //     text(this.value, pos.x, pos.y);
        // }
        pop();
    }

    /**
     * Respot the ball to its initial position
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

    /**
     * Get a realistic snooker ball radius (in px)
     */
    static snookerRadius() {
        return 11; // Standard, works with pocketRadius 16
    }

    /**
     * Return standard snooker colors as needed
     */
    static resolveColor(type, color) {
        if (type === 'cue') return '#fff';
        if (type === 'red') return '#d62828';
        // Color balls
        const snookerColors = {
            yellow: '#ffe74f',
            green:  '#3cb371',
            brown:  '#7c481c',
            blue:   '#3f83c9',
            pink:   '#ec7fa8',
            black:  '#10171b',
        };
        // Accept explicit color string or named color
        return snookerColors[color] || color;
    }
}
