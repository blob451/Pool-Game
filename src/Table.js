// src/Table.js
/**
 * This version uses push() and pop() in its main draw function for proper style isolation.
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

        // Playing area edges
        this.playMinX = this.x - this.width / 2;
        this.playMaxX = this.x + this.width / 2;
        this.playMinY = this.y - this.height / 2;
        this.playMaxY = this.y + this.height / 2;

        // Baulk line & D
        this.baulkLineX = this.playMinX + this.width / 5;
        this.dRadius = this.height / 6;

        // Ball spots
        this.spots = {
            black: { x: this.playMinX + (this.width * 10 / 11), y: this.y },
            pink:  { x: this.playMinX + (this.width * 9 / 12), y: this.y },
            blue:  { x: this.x, y: this.y },
            brown: { x: this.baulkLineX, y: this.y },
            yellow:{ x: this.baulkLineX, y: this.y + this.dRadius },
            green: { x: this.baulkLineX, y: this.y - this.dRadius },
        };

        // Pockets
        this.pocketRadius = 18;
        this.pockets = [
            { x: this.playMinX, y: this.playMinY },
            { x: this.x, y: this.playMinY },
            { x: this.playMaxX, y: this.playMinY },
            { x: this.playMinX, y: this.playMaxY },
            { x: this.x, y: this.playMaxY },
            { x: this.playMaxX, y: this.playMaxY },
        ];

        // Physics boundaries
        this.boundaries = [];
        this.createBoundaries();
    }
    
    isInPlayingArea(position) {
        return (
            position.x > this.playMinX &&
            position.x < this.playMaxX &&
            position.y > this.playMinY &&
            position.y < this.playMaxY
        );
    }

    isSpotOccupied(spotPosition, balls) {
        return balls.some(ball => 
            distance(ball.body.position.x, ball.body.position.y, spotPosition.x, spotPosition.y) < Ball.snookerRadius() * 2
        );
    }

    draw() {
        push(); // Isolate all table drawing styles
        this.drawWood();
        this.drawWoodShadow();
        this.drawRails();
        this.drawFelt();
        this.drawPocketShadows();
        this.drawPockets();
        this.drawMarkings();
        this.drawSpots();
        pop(); // Restore original styles
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
        const boundaryOptions = { 
            isStatic: true,
            restitution: 0.8,
            render: { visible: false },
            label: 'table_boundary' // Label for collision filtering
        };
        const railThickness = 16;
        const pocketOffset = this.pocketRadius * 1.8;

        const longRailWidth = (this.width / 2) - pocketOffset;
        
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX + longRailWidth / 2, this.playMinY - railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX - longRailWidth / 2, this.playMinY - railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX + longRailWidth / 2, this.playMaxY + railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX - longRailWidth / 2, this.playMaxY + railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        
        const shortRailHeight = this.height - (pocketOffset * 2);
        
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX - railThickness / 2, this.y, railThickness, shortRailHeight, boundaryOptions));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX + railThickness / 2, this.y, railThickness, shortRailHeight, boundaryOptions));

        for (let b of this.boundaries) {
            Matter.World.add(world, b);
        }
    }
}
