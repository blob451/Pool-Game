// src/ReplayManager.js
/**
 * This version adds the "Ghost Shot" functionality for saving and overlaying replays.
 */
class ReplayManager {
    constructor(gameManager) {
        this.gameManager = gameManager; // Reference to the main game manager
        this.state = 'IDLE'; // Can be 'IDLE', 'RECORDING', 'REPLAYING'
        
        this.replayData = []; // Stores the entire recorded shot, frame by frame
        // [GHOST] Stores a saved replay for the ghost feature
        this.ghostData = null; 

        this.replayFrameIndex = 0; // Tracks the current frame during playback
        // [GHOST] Tracks the ghost's frame index during live play
        this.ghostFrameIndex = 0; 
    }

    /**
     * Called every frame by the main p5.js draw loop.
     * Its behavior depends on the current state.
     */
    update() {
        if (this.state === 'REPLAYING') {
            this.replayFrameIndex++;
            if (this.replayFrameIndex >= this.replayData.length) {
                this.stopReplay();
            }
        } 
        // [GHOST] Update the ghost frame index during live play if a ghost is active.
        else if (this.state === 'IDLE' && this.ghostData) {
            this.ghostFrameIndex++;
            // Loop the ghost animation if it reaches the end
            if (this.ghostFrameIndex >= this.ghostData.length) {
                this.ghostFrameIndex = 0;
            }
        }
    }

    /**
     * Called by GameManager to draw the main replay.
     */
    draw() {
        if (this.state === 'REPLAYING') {
            this.drawReplayFrame();
        }
    }

    /**
     * Renders a single frame of the replay.
     */
    drawReplayFrame() {
        const frame = this.replayData[this.replayFrameIndex];
        if (!frame) return;

        push();
        for (const ballState of frame) {
            const originalBall = this.gameManager.balls.find(b => b.body.id === ballState.id);
            if (originalBall) {
                fill(originalBall.color);
                noStroke();
                ellipse(ballState.x, ballState.y, originalBall.r * 2);
            }
        }
        pop();
    }

    // [GHOST] Renders the translucent ghost shot overlay.
    drawGhost() {
        if (!this.ghostData || this.state !== 'IDLE') return;

        const frame = this.ghostData[this.ghostFrameIndex];
        if (!frame) return;

        push();
        for (const ballState of frame) {
            const originalBall = this.gameManager.balls.find(b => b.body.id === ballState.id);
            if (originalBall) {
                // Get the ball's color and set its alpha for transparency
                const ghostColor = color(originalBall.color);
                ghostColor.setAlpha(80); // 80 out of 255 for a nice ghost effect
                
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
        // [GHOST] Reset ghost playback on every new shot
        this.ghostFrameIndex = 0; 
        console.log("ReplayManager: Recording started.");
    }

    recordFrame() {
        if (this.state !== 'RECORDING') return;

        const frame = [];
        // Use a traditional for loop for performance, as this runs every physics tick
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
        console.log("ReplayManager: Replay started.");
    }

    stopReplay() {
        if (this.state !== 'REPLAYING') return;
        this.state = 'IDLE';
        this.replayFrameIndex = 0;
        console.log("ReplayManager: Replay finished.");
    }

    // [GHOST] Saves the last recorded shot as the ghost.
    saveAsGhost() {
        if (this.replayData.length === 0) return;
        // Create a deep copy of the replay data to prevent accidental modification
        this.ghostData = JSON.parse(JSON.stringify(this.replayData));
        this.ghostFrameIndex = 0;
        console.log("ReplayManager: Current shot saved as ghost.");
    }

    // [GHOST] Clears any saved ghost data.
    clearGhost() {
        this.ghostData = null;
        console.log("ReplayManager: Ghost data cleared.");
    }
}
