// src/UIManager.js
/**
 * This version adjusts the UI layout, placing extension buttons next to mode buttons.
 */
class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;

        // UI element properties
        this.nominationButtons = [];
        this.modeButtons = [];
        this.replayButton = null;
        this.saveGhostButton = null;
        this.clearGhostButton = null;

        // Create all UI elements
        this.createNominationButtons();
        // The order is important here: create mode buttons first to get their position.
        this.createModeButtons();
        this.createReplayButtons(); // This now creates all extension buttons
        
        // Animation properties
        this.pocketAnimations = [];
        this.p1ScoreAnim = 0;
        this.p2ScoreAnim = 0;
    }

    createNominationButtons() {
        const colorSequence = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
        const buttonWidth = 100;
        const buttonHeight = 40;
        const startX = (width / 2) - (colorSequence.length * (buttonWidth + 10) / 2);
        const yPos = 80;

        this.nominationButtons = colorSequence.map((color, index) => ({
            x: startX + index * (buttonWidth + 10),
            y: yPos,
            width: buttonWidth,
            height: buttonHeight,
            colorName: color,
            label: color.toUpperCase(),
            fill: Ball.resolveColor('color', color)
        }));
    }

    createModeButtons() {
        const buttonWidth = 200;
        const buttonHeight = 40;
        const startX = width - buttonWidth - 30;
        const startY = 30;
        const spacing = 10;

        this.modeButtons = [
            { x: startX, y: startY, width: buttonWidth, height: buttonHeight, label: 'Mode 1: Game restart', mode: 1 },
            { x: startX, y: startY + buttonHeight + spacing, width: buttonWidth, height: buttonHeight, label: 'Mode 2: Random balls', mode: 2 },
            { x: startX, y: startY + (buttonHeight + spacing) * 2, width: buttonWidth, height: buttonHeight, label: 'Mode 3: Random reds', mode: 3 }
        ];
    }

    // This function now creates all extension-related buttons in a new column.
    createReplayButtons() {
        const buttonWidth = 200;
        const buttonHeight = 40;
        const spacing = 10;
        // Position the new column to the left of the mode buttons
        const startX = this.modeButtons[0].x - buttonWidth - spacing; 

        this.replayButton = {
            x: startX,
            y: this.modeButtons[0].y, // Align with top mode button
            width: buttonWidth,
            height: buttonHeight,
            label: 'Instant Replay'
        };
        
        this.saveGhostButton = {
            x: startX,
            y: this.modeButtons[1].y, // Align with middle mode button
            width: buttonWidth,
            height: buttonHeight,
            label: 'Ghost Replay'
        };

        this.clearGhostButton = {
            x: startX,
            y: this.modeButtons[2].y, // Align with bottom mode button
            width: buttonWidth,
            height: buttonHeight,
            label: 'Clear Ghost'
        };
    }

    /**
     * Main draw call for the entire UI.
     */
    draw() {
        this.drawPocketAnimations();
        this.drawScoreboard();
        this.drawCollisionLog();
        this.drawModeButtons();
        this.drawInfoPanel();
        this.drawReplayUI();

        if (this.gameManager.gameState === 'BALL_IN_HAND') {
            this.drawBallInHandUI();
        }

        if (this.gameManager.gameOver) {
            this.drawGameOverUI();
        }
    }
    
    drawPocketAnimations() {
        push();
        for (let i = this.pocketAnimations.length - 1; i >= 0; i--) {
            const anim = this.pocketAnimations[i];
            
            fill(red(anim.color), green(anim.color), blue(anim.color), anim.alpha);
            noStroke();
            ellipse(anim.x, anim.y, anim.radius * 2);

            anim.radius *= 0.95;
            anim.alpha -= 10;

            if (anim.alpha <= 0) {
                this.pocketAnimations.splice(i, 1);
            }
        }
        pop();
    }
    
    drawScoreboard() {
        push();
        const p1 = this.gameManager.scoring.getScore(0);
        const p2 = this.gameManager.scoring.getScore(1);
        const startX = 30;
        const startY = 30;
        const lineHeight = 30;

        fill(255);
        textSize(22 + this.p1ScoreAnim);
        textAlign(LEFT, TOP);
        text('Player 1', startX, startY);
        text(p1, startX + 150, startY);
        if (this.gameManager.currentPlayer === 0) {
            fill(255, 223, 0);
            ellipse(startX - 15, startY + 12, 10, 10);
        }

        fill(255);
        textSize(22 + this.p2ScoreAnim);
        text('Player 2', startX, startY + lineHeight);
        text(p2, startX + 150, startY + lineHeight);
        if (this.gameManager.currentPlayer === 1) {
            fill(255, 223, 0);
            ellipse(startX - 15, startY + lineHeight + 12, 10, 10);
        }
        
        if (this.gameManager.currentBreak > 0) {
            fill(255);
            textSize(20);
            text(`Break: ${this.gameManager.currentBreak}`, startX, startY + lineHeight * 2.5);
        }

        this.p1ScoreAnim *= 0.9;
        this.p2ScoreAnim *= 0.9;
        
        pop();
    }

    drawCollisionLog() {
        if (this.gameManager.collisionLog.length === 0) return;
        push();
        const startX = 30;
        const yPos = 30 + 30 + 35; 
        const iconSize = 14;
        const iconSpacing = 5;

        fill(255, 255, 255, 200);
        textSize(14);
        textAlign(LEFT, CENTER);
        text("Collisions:", startX, yPos);

        let currentX = startX + 85;

        for (const entry of this.gameManager.collisionLog) {
            if (entry.type === 'ball') {
                fill(entry.color);
                stroke(0, 50);
                strokeWeight(1);
                ellipse(currentX, yPos, iconSize);
            } else if (entry.type === 'cushion') {
                fill(100, 100, 100);
                noStroke();
                rectMode(CENTER);
                rect(currentX, yPos, iconSize, iconSize / 2, 2);
            }
            currentX += iconSize + iconSpacing;
        }
        pop();
    }

    drawInfoPanel() {
        push();
        textAlign(CENTER, TOP);
        
        let infoText = "";
        let textColor = color(255);
        let panelAlpha = 0;

        if (this.gameManager.gameState === 'BALL_IN_HAND') {
            infoText = "Place Cue Ball in the D";
            panelAlpha = 180;
        } else if (this.gameManager.foulMessageTimer > 0) {
            infoText = this.gameManager.foulMessage;
            textColor = color(255, 80, 80);
            
            const maxTime = 180;
            const fadeDuration = 30;
            if (this.gameManager.foulMessageTimer > maxTime - fadeDuration) {
                panelAlpha = map(this.gameManager.foulMessageTimer, maxTime, maxTime - fadeDuration, 0, 180);
            } else if (this.gameManager.foulMessageTimer < fadeDuration) {
                panelAlpha = map(this.gameManager.foulMessageTimer, 0, fadeDuration, 0, 180);
            } else {
                panelAlpha = 180;
            }
        } else if (this.gameManager.gameState === 'AWAITING_NOMINATION') {
            infoText = 'Nominate a Color';
            panelAlpha = 150;
            this.drawNominationButtons();
        } else if (this.gameManager.gameState === 'AWAITING_SHOT') {
            infoText = `Ball On: ${this.gameManager.ballOn.toUpperCase()}`;
            panelAlpha = 150;
        }

        if (infoText) {
            const panelWidth = 450;
            const panelHeight = 40;
            const panelX = width / 2;
            const panelY = 20;

            fill(0, 0, 0, panelAlpha);
            noStroke();
            rectMode(CENTER);
            rect(panelX, panelY + panelHeight / 2, panelWidth, panelHeight, 5);

            textColor.setAlpha(map(panelAlpha, 0, 180, 0, 255));
            fill(textColor);
            textSize(24);
            textAlign(CENTER, CENTER);
            text(infoText, panelX, panelY + panelHeight / 2);
        }
        pop();
    }
    
    drawBallInHandUI() {
        push();
        noStroke();
        fill(255, 255, 255, 30);
        arc(
            this.gameManager.table.baulkLineX,
            this.gameManager.table.y,
            this.gameManager.table.dRadius * 2,
            this.gameManager.table.dRadius * 2,
            HALF_PI,
            3 * HALF_PI
        );

        const ghost = this.gameManager.ghostCueBall;
        if (ghost.isValid) {
            fill(255, 255, 255, 150);
        } else {
            fill(255, 0, 0, 150);
        }
        noStroke();
        ellipse(ghost.x, ghost.y, this.gameManager.BALL_RADIUS * 2);
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

    drawModeButtons() {
        push();
        rectMode(CORNER);
        textAlign(CENTER, CENTER);
        
        for (const btn of this.modeButtons) {
            fill(200, 220, 255, 200);
            stroke(100);
            strokeWeight(1);
            rect(btn.x, btn.y, btn.width, btn.height, 5);
            
            fill(0);
            noStroke();
            textSize(16);
            text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
        pop();
    }

    drawReplayUI() {
        const replayManager = this.gameManager.replayManager;
        if (!replayManager) return;

        push();
        rectMode(CORNER);
        textAlign(CENTER, CENTER);

        const drawStyledButton = (btn) => {
            fill(200, 220, 255, 200);
            stroke(100);
            strokeWeight(1);
            rect(btn.x, btn.y, btn.width, btn.height, 5);
            
            fill(0);
            noStroke();
            textSize(16);
            text(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        };
        
        if (replayManager.state === 'IDLE' && replayManager.replayData.length > 0) {
            drawStyledButton(this.replayButton);
            drawStyledButton(this.saveGhostButton);
        }

        if (replayManager.ghostData) {
            drawStyledButton(this.clearGhostButton);
        }

        if (replayManager.state === 'REPLAYING') {
            fill(0, 0, 0, 150);
            noStroke();
            rect(0, 0, width, height);
            
            fill(255);
            textSize(32);
            textAlign(CENTER, TOP);
            text('REPLAY MODE', width / 2, 20);
            
            textSize(18);
            text('Press any key to exit', width / 2, 60);
        }
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
        const replayManager = this.gameManager.replayManager;
        if (replayManager && replayManager.state === 'IDLE') {
            if (replayManager.replayData.length > 0) {
                const replayBtn = this.replayButton;
                if (mx > replayBtn.x && mx < replayBtn.x + replayBtn.width && my > replayBtn.y && my < replayBtn.y + replayBtn.height) {
                    replayManager.startReplay();
                    return true;
                }
                
                const saveBtn = this.saveGhostButton;
                if (mx > saveBtn.x && mx < saveBtn.x + saveBtn.width && my > saveBtn.y && my < saveBtn.y + saveBtn.height) {
                    replayManager.saveAsGhost();
                    return true;
                }
            }
            
            if (replayManager.ghostData) {
                const clearBtn = this.clearGhostButton;
                if (mx > clearBtn.x && mx < clearBtn.x + clearBtn.width && my > clearBtn.y && my < clearBtn.y + clearBtn.height) {
                    replayManager.clearGhost();
                    return true;
                }
            }
        }

        for (const btn of this.modeButtons) {
            if (mx > btn.x && mx < btn.x + btn.width && my > btn.y && my < btn.y + btn.height) {
                this.gameManager.startNewMode(btn.mode);
                return true;
            }
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

    addPocketAnimation(ball) {
        this.pocketAnimations.push({
            x: ball.body.position.x,
            y: ball.body.position.y,
            radius: ball.r,
            color: color(ball.color),
            alpha: 255
        });
    }

    triggerScoreAnimation(playerIndex) {
        if (playerIndex === 0) {
            this.p1ScoreAnim = 12;
        } else {
            this.p2ScoreAnim = 12;
        }
    }
}
