// src/UIManager.js
/**
 * This version implements a central information panel for all game state messages.
 */
class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;

        // UI element properties
        this.nominationButtons = [];
        this.newFrameButton = { x: width - 150, y: 50, width: 120, height: 40, label: 'New Frame' };
        
        this.createNominationButtons();
    }

    createNominationButtons() {
        const colorSequence = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        const buttonWidth = 100;
        const buttonHeight = 40;
        const startX = (width / 2) - (colorSequence.length * (buttonWidth + 10) / 2);
        const yPos = 80; // Lowered to make space for the info panel

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
        this.drawScoreboard();
        this.drawNewFrameButton();
        this.drawInfoPanel(); // Centralized info display

        if (this.gameManager.gameOver) {
            this.drawGameOverUI();
        }
    }
    
    drawScoreboard() {
        push(); // Isolate scoreboard styles
        const p1 = this.gameManager.scoring.getScore(0);
        const p2 = this.gameManager.scoring.getScore(1);
        const startX = 30;
        const startY = 30;
        const lineHeight = 30;

        // Player 1
        fill(255);
        textSize(22);
        textAlign(LEFT, TOP);
        text('Player 1', startX, startY);
        text(p1, startX + 150, startY);
        if (this.gameManager.currentPlayer === 0) {
            fill(255, 223, 0); // Gold for active player
            ellipse(startX - 15, startY + 12, 10, 10);
        }

        // Player 2
        fill(255);
        text('Player 2', startX, startY + lineHeight);
        text(p2, startX + 150, startY + lineHeight);
        if (this.gameManager.currentPlayer === 1) {
            fill(255, 223, 0);
            ellipse(startX - 15, startY + lineHeight + 12, 10, 10);
        }
        
        // Break score
        if (this.gameManager.currentBreak > 0) {
            fill(255);
            textSize(20);
            text(`Break: ${this.gameManager.currentBreak}`, startX, startY + lineHeight * 2);
        }
        pop();
    }

    /**
     * Draws the main information panel at the top of the screen.
     */
    drawInfoPanel() {
        push();
        textAlign(CENTER, TOP);
        
        let infoText = "";
        let textColor = color(255);

        // Determine what text to show based on game state
        if (this.gameManager.foulMessageTimer > 0) {
            infoText = this.gameManager.foulMessage;
            textColor = color(255, 80, 80);
        } else if (this.gameManager.gameState === 'AWAITING_NOMINATION') {
            infoText = 'Nominate a Color';
            this.drawNominationButtons(); // Draw buttons only when needed
        } else if (this.gameManager.gameState === 'AWAITING_SHOT') {
            infoText = `Ball On: ${this.gameManager.ballOn.toUpperCase()}`;
        }

        // Draw the panel background and text
        if (infoText) {
            const panelWidth = 450;
            const panelHeight = 40;
            const panelX = width / 2;
            const panelY = 20;

            fill(0, 0, 0, 150);
            noStroke();
            rectMode(CENTER);
            rect(panelX, panelY + panelHeight / 2, panelWidth, panelHeight, 5);

            fill(textColor);
            textSize(24);
            textAlign(CENTER, CENTER);
            text(infoText, panelX, panelY + panelHeight / 2);
        }
        pop();
    }
    
    drawNominationButtons() {
        push();
        rectMode(CORNER);
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
        pop();
    }

    drawNewFrameButton() {
        push();
        const btn = this.newFrameButton;
        rectMode(CORNER);
        
        fill(200, 220, 255, 200);
        stroke(100);
        strokeWeight(1);
        rect(btn.x, btn.y, btn.width, btn.height, 5);

        fill(0);
        noStroke();
        textSize(18);
        textAlign(CENTER, CENTER);
        text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        pop();
    }
    
    drawGameOverUI() {
        push();
        rectMode(CENTER);
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
        pop();
    }
    
    handleInput(mx, my) {
        const btn = this.newFrameButton;
        if (mx > btn.x && mx < btn.x + btn.width && my > btn.y && my < btn.y + btn.height) {
            this.gameManager.reset();
            return true;
        }

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
