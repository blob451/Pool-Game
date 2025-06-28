// src/Ball.js
/**
 * Represents a single ball on the snooker table, defining its physical
 * properties, appearance, and behaviour.
 */
class Ball {
    /**
     * Initializes a new Ball instance with a specified position, type, and value.
     * @param {number} x - The initial horizontal position of the ball.
     * @param {number} y - The initial vertical position of the ball.
     * @param {string} type - The type of ball ('cue', 'red', or 'color').
     * @param {string} color - The colour of the ball, as a hex or CSS colour name.
     * @param {number} value - The point value of the ball.
     */
    constructor(x, y, type, color, value) {
        this.initialX = x; // Stores the initial x-position for resetting.
        this.initialY = y; // Stores the initial y-position for resetting.
        this.type = type; // The type of the ball.
        this.color = Ball.resolveColor(type, color); // Sets the visual colour of the ball.
        this.value = value; // The point value of the ball.
        this.r = Ball.snookerRadius(); // The radius of the ball.

        // Creates a circular physics body for the ball using Matter.js.
        this.body = Matter.Bodies.circle(x, y, this.r, {
            restitution: 0.9,
            friction: 0.01,
            frictionAir: 0.01,
            label: 'ball',
        });
        Matter.World.add(world, this.body); // Adds the ball's body to the physics world.
    }

    /**
     * Renders the ball on the canvas at its current position.
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
     * Resets the ball to its original position and sets its velocity to zero.
     */
    resetPosition() {
        Matter.Body.setPosition(this.body, { x: this.initialX, y: this.initialY });
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.body, 0);
    }

    /**
     * Removes the ball's physics body from the world.
     */
    remove() {
        Matter.World.remove(world, this.body);
    }

    /**
     * Provides the standard radius for a snooker ball.
     * @returns {number} The standard radius of the ball in pixels.
     */
    static snookerRadius() {
        return 11;
    }

    /**
     * Resolves the appropriate colour for a ball based on its type.
     * @param {string} type - The type of the ball.
     * @param {string} color - The specified colour name.
     * @returns {string} The hexadecimal colour code for the ball.
     */
    static resolveColor(type, color) {
        if (type === 'cue') return '#fff';
        if (type === 'red') return '#d62828';
        // Defines the standard hexadecimal colours for the coloured balls.
        const snookerColors = {
            yellow: '#ffe74f',
            green:  '#3cb371',
            brown:  '#7c481c',
            blue:   '#3f83c9',
            pink:   '#ec7fa8',
            black:  '#10171b',
        };
        // Returns the corresponding hex code or the provided colour if not standard.
        return snookerColors[color] || color;
    }
}