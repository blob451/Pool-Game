// src/UIManager.js
/**
 * Manages all UI rendering and input for the snooker game.
 * This includes scoreboards, buttons, and game state messages.
 */
class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager; // A reference to the main game manager to access state

        // UI element properties
        this.nominationButtons = [];
        this.newFrameButton = { x: 30, y: 60, width: 120, height: 40, label: 'New Frame' };
        
        this.createNominationButtons();
    }

    createNominationButtons() {
        const colorSequence = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        const buttonWidth = 100;
        const buttonHeight = 40;
        const startX = (width / 2) - (colorSequence.length * (buttonWidth + 10) / 2);
        const yPos = 40;

        colorSequence.forEach((color, index) => {
            this.nominationButtons.push({
                x: startX + index * (buttonWidth + 10),
                y: yPos,
                width: buttonWidth,
                height: buttonHeight,
                colorName: color,
                label: color.toUpperCase(),
                fill: Ball.resolveColor('color', color)
            });
        });
    }

    /**
     * Main draw call for the entire UI.
     */
    draw() {
        this.drawNewFrameButton();

        if (this.gameManager.gameState === 'AWAITING_NOMINATION') {
            this.drawNominationUI();
        } else {
            // Placeholder for future info panel
            fill(255);
            textSize(22);
            textAlign(CENTER, TOP);
            text(`Ball On: ${this.gameManager.ballOn.toUpperCase()}`, width / 2, 16);
        }

        this.drawFoulMessage();

        if (this.gameManager.gameOver) {
            this.drawGameOverUI();
        }
    }

    drawNominationUI() {
        fill(255);
        textSize(26);
        textAlign(CENTER, TOP);
        text('Nominate a Color', width / 2, 10);

        for (const btn of this.nominationButtons) {
            fill(btn.fill);
            stroke(255);
            strokeWeight(2);
            rect(btn.x, btn.y, btn.width, btn.height, 5);
            
            fill(0);
            noStroke();
            textSize(18);
            textAlign(CENTER, CENTER);
            text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }

    drawNewFrameButton() {
        const btn = this.newFrameButton;
        fill(200, 220, 255);
        stroke(100);
        strokeWeight(1);
        rect(btn.x, btn.y, btn.width, btn.height, 5);

        fill(0);
        noStroke();
        textSize(18);
        textAlign(CENTER, CENTER);
        text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
    }
    
    drawGameOverUI() {
        fill(0, 0, 0, 180);
        rect(width/2, height/2, 400, 200, 10);

        const score1 = this.gameManager.scoring.getScore(0);
        const score2 = this.gameManager.scoring.getScore(1);
        const winner = score1 > score2 ? 'Player 1 Wins!' : 'Player 2 Wins!';
        
        fill(255);
        textSize(36);
        textAlign(CENTER, CENTER);
        text('Frame Over', width / 2, height / 2 - 40);
        
        textSize(28);
        text(winner, width / 2, height / 2 + 10);
    }
    
    drawFoulMessage() {
        if (this.gameManager.foulMessageTimer > 0) {
            const alpha = min(255, this.gameManager.foulMessageTimer * 3);
            fill(255, 60, 60, alpha);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(32);
            text(this.gameManager.foulMessage, width / 2, height / 2 - 150);
        }
    }
    
    /**
     * Handles clicks for all UI buttons.
     * @param {number} mx - The x-coordinate of the mouse.
     * @param {number} my - The y-coordinate of the mouse.
     * @returns {boolean} - True if a UI element was clicked, otherwise false.
     */
    handleInput(mx, my) {
        // Handle "New Frame" button click
        const btn = this.newFrameButton;
        if (mx > btn.x && mx < btn.x + btn.width && my > btn.y && my < btn.y + btn.height) {
            this.gameManager.reset();
            return true;
        }

        // Handle nomination button clicks
        if (this.gameManager.gameState === 'AWAITING_NOMINATION') {
            for (const btn of this.nominationButtons) {
                if (mx > btn.x && mx < btn.x + btn.width && my > btn.y && my < btn.y + btn.height) {
                    this.gameManager.handleNomination(btn.colorName);
                    return true;
                }
            }
        }
        
        return false;
    }
}
