// src/Table.js
/**
 * Represents the snooker table, pockets, boundaries, and markings.
 * Handles drawing and physics boundary setup.
 */
class Table {
    constructor() {
        // Table size (for snooker, tweak as needed)
        this.width = 760;
        this.height = 380;
        this.x = width / 2;
        this.y = height / 2;
        // Baulk line and D radius (standard proportions)
        this.baulkLineX = this.x - this.width / 4;
        this.dRadius = 56; // Example value, tweak for realism
        // Pockets: 4 corners + 2 middles
        this.pockets = [
            { x: this.x - this.width / 2, y: this.y - this.height / 2 }, // Top-left
            { x: this.x,                y: this.y - this.height / 2 },   // Top-middle
            { x: this.x + this.width / 2, y: this.y - this.height / 2 }, // Top-right
            { x: this.x - this.width / 2, y: this.y + this.height / 2 }, // Bottom-left
            { x: this.x,                y: this.y + this.height / 2 },   // Bottom-middle
            { x: this.x + this.width / 2, y: this.y + this.height / 2 }, // Bottom-right
        ];
        this.pocketRadius = 18; // Snooker pockets are smaller than pool

        // Create boundaries for Matter.js
        this.boundaries = [];
        this.createBoundaries();
    }

    /**
     * Draw the table, baulk line, D, and pockets
     */
    draw() {
        // Table felt
        fill(34, 139, 34);
        rectMode(CENTER);
        noStroke();
        rect(this.x, this.y, this.width, this.height, 30); // Rounded corners

        // Table border
        stroke(120, 84, 37);
        strokeWeight(16);
        noFill();
        rect(this.x, this.y, this.width + 30, this.height + 30, 40);

        // Pockets
        this.drawPockets();

        // Baulk line
        stroke(255);
        strokeWeight(2);
        line(this.baulkLineX, this.y - this.height / 2, this.baulkLineX, this.y + this.height / 2);
        // D (arc)
        noFill();
        arc(this.baulkLineX, this.y, this.dRadius * 2, this.dRadius * 2, -HALF_PI, HALF_PI);
    }

    /**
     * Draw pocket holes
     */
    drawPockets() {
        noStroke();
        fill(0);
        for (let p of this.pockets) {
            ellipse(p.x, p.y, this.pocketRadius * 2);
        }
    }

    /**
     * Create static boundaries for the physics engine (rails)
     */
    createBoundaries() {
        // Top
        this.boundaries.push(Matter.Bodies.rectangle(this.x, this.y - this.height / 2 - 8, this.width, 16, { isStatic: true }));
        // Bottom
        this.boundaries.push(Matter.Bodies.rectangle(this.x, this.y + this.height / 2 + 8, this.width, 16, { isStatic: true }));
        // Left
        this.boundaries.push(Matter.Bodies.rectangle(this.x - this.width / 2 - 8, this.y, 16, this.height, { isStatic: true }));
        // Right
        this.boundaries.push(Matter.Bodies.rectangle(this.x + this.width / 2 + 8, this.y, 16, this.height, { isStatic: true }));

        for (let b of this.boundaries) {
            Matter.World.add(world, b);
        }
    }
}