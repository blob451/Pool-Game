// src/Table.js
/**
 * Defines the physical and visual characteristics of the snooker table,
 * including its dimensions, boundaries, and markings.
 */
class Table {
    /**
     * Initializes the table's properties, such as dimensions, colours, and pocket locations.
     */
    constructor() {
        // Defines the dimensions of the playing area, inside the cushions.
        this.width = 1000;
        this.height = 500;

        // Sets the position of the table on the canvas.
        this.tableYOffset = 90;
        this.x = width / 2;
        this.y = height / 2 + this.tableYOffset;

        // Defines the dimensions and colours of the table's structural elements.
        this.woodThickness = 70;
        this.railWidth = 28;
        this.railColor = color(116, 87, 48);
        this.woodColor = color(90, 57, 20);
        this.woodShadowColor = color(60, 32, 10, 70);

        // Defines the colours for the felt playing surface.
        this.feltColor = color(26, 89, 26);
        this.feltShadowColor = color(12, 37, 15, 40);

        // Calculates the coordinates of the playing area's edges.
        this.playMinX = this.x - this.width / 2;
        this.playMaxX = this.x + this.width / 2;
        this.playMinY = this.y - this.height / 2;
        this.playMaxY = this.y + this.height / 2;

        // Defines the position of the baulk line and the radius of the 'D'.
        this.baulkLineX = this.playMinX + this.width / 5;
        this.dRadius = this.height / 6;

        // Defines the coordinates for spotting the coloured balls.
        this.spots = {
            black: { x: this.playMinX + (this.width * 10 / 11), y: this.y },
            pink:  { x: this.playMinX + (this.width * 9 / 12), y: this.y },
            blue:  { x: this.x, y: this.y },
            brown: { x: this.baulkLineX, y: this.y },
            yellow:{ x: this.baulkLineX, y: this.y + this.dRadius },
            green: { x: this.baulkLineX, y: this.y - this.dRadius },
        };

        // Defines the coordinates and radius of the pockets.
        this.pocketRadius = 18;
        this.pockets = [
            { x: this.playMinX, y: this.playMinY },
            { x: this.x, y: this.playMinY },
            { x: this.playMaxX, y: this.playMinY },
            { x: this.playMinX, y: this.playMaxY },
            { x: this.x, y: this.playMaxY },
            { x: this.playMaxX, y: this.playMaxY },
        ];

        // Initializes an array to hold the physics boundaries and creates them.
        this.boundaries = [];
        this.createBoundaries();
    }
    
    /**
     * Determines if a given position is within the playing area.
     * @param {object} position - The position to check, with x and y properties.
     * @returns {boolean} True if the position is inside the playing area.
     */
    isInPlayingArea(position) {
        return (
            position.x > this.playMinX &&
            position.x < this.playMaxX &&
            position.y > this.playMinY &&
            position.y < this.playMaxY
        );
    }

    /**
     * Checks if a designated spot on the table is occupied by another ball.
     * @param {object} spotPosition - The position of the spot to check.
     * @param {Ball[]} balls - An array of all balls currently on the table.
     * @returns {boolean} True if the spot is occupied.
     */
    isSpotOccupied(spotPosition, balls) {
        return balls.some(ball => 
            distance(ball.body.position.x, ball.body.position.y, spotPosition.x, spotPosition.y) < Ball.snookerRadius() * 2
        );
    }

    /**
     * Main rendering function for the table, called every frame.
     */
    draw() {
        push(); // Isolates all table drawing styles.
        this.drawWood();
        this.drawWoodShadow();
        this.drawRails();
        this.drawFelt();
        this.drawPocketShadows();
        this.drawPockets();
        this.drawMarkings();
        this.drawSpots();
        pop(); // Restores original styles.
    }

    /**
     * Renders the wooden frame of the table.
     */
    drawWood() {
        fill(this.woodColor);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.woodThickness * 2, this.height + this.woodThickness * 2, 8);
    }

    /**
     * Renders a shadow effect on the wooden frame.
     */
    drawWoodShadow() {
        noFill();
        stroke(this.woodShadowColor);
        strokeWeight(18);
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.woodThickness * 2 - 24, this.height + this.woodThickness * 2 - 24, 8);
        noStroke();
    }

    /**
     * Renders the cushions (rails) of the table.
     */
    drawRails() {
        fill(this.railColor);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width + this.railWidth * 2, this.height + this.railWidth * 2, 4);
    }

    /**
     * Renders the felt playing surface with a subtle gradient effect.
     */
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

    /**
     * Renders shadows around the pockets to give a sense of depth.
     */
    drawPocketShadows() {
        for (let p of this.pockets) {
            noStroke();
            fill(0, 0, 0, 33);
            ellipse(p.x, p.y, this.pocketRadius * 2.5);
        }
    }

    /**
     * Renders the black circles representing the pockets.
     */
    drawPockets() {
        fill(10, 10, 10);
        noStroke();
        for (let p of this.pockets) {
            ellipse(p.x, p.y, this.pocketRadius * 2);
        }
    }

    /**
     * Renders the baulk line and the 'D' on the playing surface.
     */
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

    /**
     * Renders the small white dots indicating the ball spots.
     */
    drawSpots() {
        for (let key in this.spots) {
            let s = this.spots[key];
            fill(255, 230);
            ellipse(s.x, s.y, 6);
        }
    }
    
    /**
     * Creates the static physics bodies that form the boundaries of the playing area.
     */
    createBoundaries() {
        const boundaryOptions = { 
            isStatic: true,
            restitution: 0.8,
            render: { visible: false },
            label: 'table_boundary' // Label for collision filtering.
        };
        const railThickness = 16;
        const pocketOffset = this.pocketRadius * 1.8;

        const longRailWidth = (this.width / 2) - pocketOffset;
        
        // Creates the top and bottom cushion boundaries.
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX + longRailWidth / 2, this.playMinY - railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX - longRailWidth / 2, this.playMinY - railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX + longRailWidth / 2, this.playMaxY + railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX - longRailWidth / 2, this.playMaxY + railThickness / 2, longRailWidth, railThickness, boundaryOptions));
        
        const shortRailHeight = this.height - (pocketOffset * 2);
        
        // Creates the left and right cushion boundaries.
        this.boundaries.push(Matter.Bodies.rectangle(this.playMinX - railThickness / 2, this.y, railThickness, shortRailHeight, boundaryOptions));
        this.boundaries.push(Matter.Bodies.rectangle(this.playMaxX + railThickness / 2, this.y, railThickness, shortRailHeight, boundaryOptions));

        // Adds all boundary bodies to the physics world.
        for (let b of this.boundaries) {
            Matter.World.add(world, b);
        }
    }
}