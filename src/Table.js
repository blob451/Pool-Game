// src/Table.js
/**
 * Represents the snooker table with final polish: minimal round corners, soft shadows, faint spot halos, no UI overlays.
 * Only table rendering here: all UI/score overlays should be handled outside Table.js.
 */
class Table {
    constructor() {
        // Table sizing (for 1200x600 canvas)
        this.width = 1000;
        this.height = 500;
        this.margin = 24; // Now much less margin
        this.x = width / 2;
        this.y = height / 2;

        // Layering sizes/colors
        this.railWidth = 28;
        this.railColor = color(116, 87, 48);
        this.wallWidth = 44;
        this.wallColor = color(90, 57, 20);
        this.wallShadowColor = color(60, 32, 10, 70);

        // Felt colors (gradient/fake shadow at edge)
        this.feltColor = color(26, 89, 26);
        this.feltShadowColor = color(12, 37, 15, 40);

        // Baulk line/D
        this.baulkLineX = this.x - this.width / 4;
        this.dRadius = 56;

        // Pockets
        this.pockets = [
            { x: this.x - this.width / 2, y: this.y - this.height / 2 },
            { x: this.x, y: this.y - this.height / 2 },
            { x: this.x + this.width / 2, y: this.y - this.height / 2 },
            { x: this.x - this.width / 2, y: this.y + this.height / 2 },
            { x: this.x, y: this.y + this.height / 2 },
            { x: this.x + this.width / 2, y: this.y + this.height / 2 },
        ];
        this.pocketRadius = 16;

        // Ball spots
        this.spots = {
            yellow:   { x: this.baulkLineX, y: this.y + this.dRadius, c: color(255, 234, 79, 30) },
            green:    { x: this.baulkLineX, y: this.y - this.dRadius, c: color(34, 177, 76, 24) },
            brown:    { x: this.baulkLineX, y: this.y, c: color(130, 60, 18, 20) },
            blue:     { x: this.x, y: this.y, c: color(63, 131, 201, 16) },
            pink:     { x: this.x + this.width / 4, y: this.y, c: color(255, 192, 203, 18) },
            black:    { x: this.x + this.width / 2 - 36, y: this.y, c: color(0, 0, 0, 30) },
        };

        // Physics boundaries (invisible, already correct)
        this.boundaries = [];
        this.createBoundaries();
    }

    draw() {
        // LAYER ORDER: Wood (outside) → Wood inner shadow → Rails → Felt → Pocket shadows → Pockets → Markings → Spots

        // Outer wood
        this.drawWood();
        this.drawWoodInnerShadow();
        this.drawRails();
        this.drawFelt();
        this.drawPocketShadows();
        this.drawPockets();
        this.drawMarkings();
        this.drawSpots();
    }

    drawWood() {
        fill(this.wallColor);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.wallWidth, this.height + this.wallWidth, 4);
    }

    drawWoodInnerShadow() {
        noFill();
        stroke(this.wallShadowColor);
        strokeWeight(10);
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.wallWidth - 16, this.height + this.wallWidth - 16, 4);
        noStroke();
    }

    drawRails() {
        fill(this.railColor);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.railWidth, this.height + this.railWidth, 4);
        // Rail shine
        stroke(255, 245, 180, 45);
        strokeWeight(3);
        noFill();
        rect(this.x, this.y, this.width + this.railWidth, this.height + this.railWidth, 4);
        noStroke();
    }

    drawFelt() {
        rectMode(CENTER);
        noStroke();
        fill(this.feltColor);
        rect(this.x, this.y, this.width, this.height, 3);
        // Felt shadow/gradient (manually faked)
        for (let i = 0; i < 8; i++) {
            fill(red(this.feltShadowColor), green(this.feltShadowColor), blue(this.feltShadowColor), 30 - i * 2);
            rect(this.x, this.y, this.width - i * 11, this.height - i * 11, 3);
        }
    }

    drawPocketShadows() {
        for (let p of this.pockets) {
            noStroke();
            fill(0, 0, 0, 33);
            ellipse(p.x, p.y, this.pocketRadius * 2.5);
        }
    }

    drawPockets() {
        fill(10, 10, 10);
        noStroke();
        for (let p of this.pockets) {
            ellipse(p.x, p.y, this.pocketRadius * 2);
        }
    }

    drawSpots() {
        for (let key in this.spots) {
            let s = this.spots[key];
            fill(s.c);
            ellipse(s.x, s.y, 13); // Very faint halo
            fill(255, 230);
            ellipse(s.x, s.y, 4);  // White spot
        }
    }

    drawMarkings() {
        // Baulk line (vertical, left side)
        stroke(255);
        strokeWeight(2);
        line(this.baulkLineX, this.y - this.height / 2, this.baulkLineX, this.y + this.height / 2);
        // D arc (faces INTO table)
        noFill();
        stroke(255);
        strokeWeight(2);
        arc(this.baulkLineX, this.y, this.dRadius * 2, this.dRadius * 2, HALF_PI, 3 * HALF_PI);
        // Double-draw for soft anti-aliasing
        stroke(255, 140);
        strokeWeight(4);
        arc(this.baulkLineX, this.y, this.dRadius * 2, this.dRadius * 2, HALF_PI, 3 * HALF_PI);
        noStroke();
    }

    createBoundaries() {
        this.boundaries = [];
        // Top
        this.boundaries.push(Matter.Bodies.rectangle(this.x, this.y - this.height / 2 - 8, this.width, 16, { isStatic: true, render: { visible: false } }));
        // Bottom
        this.boundaries.push(Matter.Bodies.rectangle(this.x, this.y + this.height / 2 + 8, this.width, 16, { isStatic: true, render: { visible: false } }));
        // Left
        this.boundaries.push(Matter.Bodies.rectangle(this.x - this.width / 2 - 8, this.y, 16, this.height, { isStatic: true, render: { visible: false } }));
        // Right
        this.boundaries.push(Matter.Bodies.rectangle(this.x + this.width / 2 + 8, this.y, 16, this.height, { isStatic: true, render: { visible: false } }));
        for (let b of this.boundaries) {
            Matter.World.add(world, b);
        }
    }
}
