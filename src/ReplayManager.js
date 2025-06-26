// src/ReplayManager.js
/**
 * This version adds slow-motion playback to the replay system.
 */
class ReplayManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.state = 'IDLE';
        
        this.replayData = [];
        this.ghostData = null;

        this.replayFrameIndex = 0;
        this.ghostFrameIndex = 0;
        
        // --- NEW: Slow-motion state ---
        this.isSlowMotion = false;
    }

    /**
     * Called every frame. Advances the replay or ghost animation.
     */
    update() {
        if (this.state === 'REPLAYING') {
            const speed = this.isSlowMotion ? 0.4 : 1.0;
            this.replayFrameIndex += speed;

            if (this.replayFrameIndex >= this.replayData.length) {
                this.stopReplay();
            }
        } 
        else if (this.state === 'IDLE' && this.ghostData) {
            this.ghostFrameIndex++;
            if (this.ghostFrameIndex >= this.ghostData.length) {
                this.ghostFrameIndex = 0;
            }
        }
    }

    /**
     * Draws the main replay frame.
     */
    draw() {
        if (this.state === 'REPLAYING') {
            this.drawReplayFrame();
        }
    }

    /**
     * Renders a single frame of the replay, using the integer part of the frame index.
     */
    drawReplayFrame() {
        const frame = this.replayData[Math.floor(this.replayFrameIndex)];
        if (!frame) return;

        push();
        for (const ballState of frame) {
            const originalBall = this.gameManager.balls.find(b => b.body.id === ballState.id);
            if (originalBall) {
                fill(originalBall.color);
                noStroke();
                // --- FIXED: Used ballState.y instead of ball.y ---
                ellipse(ballState.x, ballState.y, originalBall.r * 2);
            }
        }
        pop();
    }

    /**
     * Renders the translucent ghost shot overlay.
     */
    drawGhost() {
        if (!this.ghostData || this.state !== 'IDLE') return;

        const frame = this.ghostData[this.ghostFrameIndex];
        if (!frame) return;

        push();
        for (const ballState of frame) {
            const originalBall = this.gameManager.balls.find(b => b.body.id === ballState.id);
            if (originalBall) {
                const ghostColor = color(originalBall.color);
                ghostColor.setAlpha(80);
                
                fill(ghostColor);
                noStroke();
                ellipse(ballState.x, ballState.y, originalBall.r * 2);
            }
        }
        pop();
    }

    // --- State Control Methods ---

    startRecording() {
        if (this.state !== 'IDLE') return;
        this.state = 'RECORDING';
        this.replayData = [];
        this.ghostFrameIndex = 0; 
        console.log("ReplayManager: Recording started.");
    }

    recordFrame() {
        if (this.state !== 'RECORDING') return;

        const frame = [];
        for (let i = 0; i < this.gameManager.balls.length; i++) {
            const ball = this.gameManager.balls[i];
            if (ball.body) {
                frame.push({
                    id: ball.body.id,
                    x: ball.body.position.x,
                    y: ball.body.position.y,
                    angle: ball.body.angle
                });
            }
        }
        this.replayData.push(frame);
    }

    stopRecording() {
        if (this.state !== 'RECORDING') return;
        this.state = 'IDLE';
        console.log(`ReplayManager: Recording stopped. ${this.replayData.length} frames captured.`);
    }

    startReplay() {
        if (this.state !== 'IDLE' || this.replayData.length === 0) return;
        this.state = 'REPLAYING';
        this.replayFrameIndex = 0;
        this.isSlowMotion = false; // Always start replay in normal speed
        console.log("ReplayManager: Replay started.");
    }

    stopReplay() {
        if (this.state !== 'REPLAYING') return;
        this.state = 'IDLE';
        this.replayFrameIndex = 0;
        console.log("ReplayManager: Replay finished.");
    }

    saveAsGhost() {
        if (this.replayData.length === 0) return;
        this.ghostData = JSON.parse(JSON.stringify(this.replayData));
        this.ghostFrameIndex = 0;
        console.log("ReplayManager: Current shot saved as ghost.");
    }

    clearGhost() {
        this.ghostData = null;
        console.log("ReplayManager: Ghost data cleared.");
    }
    
    toggleSlowMotion() {
        this.isSlowMotion = !this.isSlowMotion;
        console.log(`ReplayManager: Slow motion ${this.isSlowMotion ? 'enabled' : 'disabled'}.`);
    }
}
