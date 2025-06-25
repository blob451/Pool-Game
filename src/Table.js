// src/Table.js
/**
 * All spots, markings, D, and baulk line use playing area edges (not canvas center).
 * Ball spots will now be in the correct snooker locations.
 */
class Table {
    constructor() {
        // PLAYING AREA (inside cushions)
        this.width = 1000;
        this.height = 500;

        // Table position: horizontally centered, vertically offset
        this.tableYOffset = 90;
        this.x = width / 2;
        this.y = height / 2 + this.tableYOffset;

        // Wall/rail sizing
        this.woodThickness = 70;
        this.railWidth = 28;
        this.railColor = color(116, 87, 48);
        this.woodColor = color(90, 57, 20);
        this.woodShadowColor = color(60, 32, 10, 70);

        // Felt
        this.feltColor = color(26, 89, 26);
        this.feltShadowColor = color(12, 37, 15, 40);

        // Playing area edges (felt area, inside rails/wood)
        this.playMinX = this.x - this.width / 2;
        this.playMaxX = this.x + this.width / 2;
        this.playMinY = this.y - this.height / 2;
        this.playMaxY = this.y + this.height / 2;

        // Baulk line & D
        this.baulkLineX = this.playMinX + this.width / 5; // 1/5 from left cushion
        this.dRadius = this.height / 6;

        // Ball spots (all vertical positions now from playMinY)
        this.spots = {
            black: { x: this.x, y: this.playMinY + this.height / 11 },
            pink:  { x: this.x, y: this.playMinY + this.height / 4 },
            blue:  { x: this.x, y: this.y },
            brown: { x: this.baulkLineX, y: this.y },
            yellow:{ x: this.baulkLineX, y: this.y + this.dRadius },
            green: { x: this.baulkLineX, y: this.y - this.dRadius },
        };

        // Pockets
        this.pockets = [
            { x: this.playMinX, y: this.playMinY },
            { x: this.x, y: this.playMinY },
            { x: this.playMaxX, y: this.playMinY },
            { x: this.playMinX, y: this.playMaxY },
            { x: this.x, y: this.playMaxY },
            { x: this.playMaxX, y: this.playMaxY },
        ];
        this.pocketRadius = 16;

        // Physics boundaries (invisible rails)
        this.boundaries = [];
        this.createBoundaries();
    }

    draw() {
        this.drawWood();
        this.drawWoodShadow();
        this.drawRails();
        this.drawFelt();
        this.drawPocketShadows();
        this.drawPockets();
        this.drawMarkings();
        this.drawSpots();
    }

    drawWood() {
        fill(this.woodColor);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.woodThickness * 2, this.height + this.woodThickness * 2, 8);
    }
    drawWoodShadow() {
        noFill();
        stroke(this.woodShadowColor);
        strokeWeight(18);
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.woodThickness * 2 - 24, this.height + this.woodThickness * 2 - 24, 8);
        noStroke();
    }
    drawRails() {
        fill(this.railColor);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.railWidth * 2, this.height + this.railWidth * 2, 4);
    }
    drawFelt() {
        fill(this.feltColor);
        rectMode(CENTER);
        noStroke();
        rect(this.x, this.y, this.width, this.height, 2);
        // Felt shadow/gradient
        for (let i = 0; i < 8; i++) {
            fill(red(this.feltShadowColor), green(this.feltShadowColor), blue(this.feltShadowColor), 30 - i * 2);
            rect(this.x, this.y, this.width - i * 12, this.height - i * 12, 2);
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
    drawMarkings() {
        stroke(255);
        strokeWeight(2);
        line(this.baulkLineX, this.playMinY, this.baulkLineX, this.playMaxY);
        noFill();
        arc(this.baulkLineX, this.y, this.dRadius * 2, this.dRadius * 2, HALF_PI, 3 * HALF_PI);
        stroke(255, 140);
        strokeWeight(4);
        arc(this.baulkLineX, this.y, this.dRadius * 2, this.dRadius * 2, HALF_PI, 3 * HALF_PI);
        noStroke();
    }
    drawSpots() {
        for (let key in this.spots) {
            let s = this.spots[key];
            fill(255, 230);
            ellipse(s.x, s.y, 6);
        }
    }
    createBoundaries() {
        this.boundaries = [];
        this.boundaries.push(Matter.Bodies.rectangle(this.x, this.playMinY - 8, this.width, 16, { isStatic: true, render: { visible: false } }));
        this.boundaries.push(Matter.Bodies.rectangle(this.x, this.playMaxY + 8, this.width, 16, { isStatic: true, render: { visible: false } }));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX - 8, this.y, 16, this.height, { isStatic: true, render: { visible: false } }));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX + 8, this.y, 16, this.height, { isStatic: true, render: { visible: false } }));
        for (let b of this.boundaries) {
            Matter.World.add(world, b);
        }
    }
}
