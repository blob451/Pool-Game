// src/UIManager.js
/**
 * This version uses push() and pop() to ensure proper style isolation for all UI elements.
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
        this.drawScoreboard();
        this.drawNewFrameButton();

        if (this.gameManager.gameState === 'AWAITING_NOMINATION') {
            this.drawNominationUI();
        }

        this.drawFoulMessage();

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

        // Central "Ball On" display (unless nominating)
        if (this.gameManager.gameState === 'AWAITING_SHOT') {
            fill(255);
            textSize(22);
            textAlign(CENTER, TOP);
            text(`Ball On: ${this.gameManager.ballOn.toUpperCase()}`, width / 2, 20);
        }
        pop();
    }

    drawNominationUI() {
        push(); // Isolate nomination UI styles
        fill(255);
        textSize(26);
        textAlign(CENTER, TOP);
        text('Nominate a Color', width / 2, 20);
        
        rectMode(CORNER);
        for (const btn of this.nominationButtons) {
            fill(btn.fill);
            stroke(255);
            strokeWeight(2);
            rect(btn.x, btn.y + 40, btn.width, btn.height, 5);
            
            fill(0);
            noStroke();
            textSize(18);
            textAlign(CENTER, CENTER);
            text(btn.label, btn.x + btn.width / 2, btn.y + 40 + btn.height / 2);
        }
        pop();
    }

    drawNewFrameButton() {
        push(); // Isolate button styles
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
        push(); // Isolate game over styles
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
    
    drawFoulMessage() {
        push(); // Isolate foul message styles
        if (this.gameManager.foulMessageTimer > 0) {
            const alpha = min(255, this.gameManager.foulMessageTimer * 3);
            fill(255, 60, 60, alpha);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(32);
            text(this.gameManager.foulMessage, width / 2, height / 2 - 150);
        }
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
                if (mx > btn.x && mx < btn.x + btn.width && my > btn.y + 40 && my < btn.y + 40 + btn.height) {
                    this.gameManager.handleNomination(btn.colorName);
                    return true;
                }
            }
        }
        
        return false;
    }
}
