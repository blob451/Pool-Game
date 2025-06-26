// src/ReplayManager.js

class ReplayManager {
    constructor(gameManager) {
        this.gameManager = gameManager; // Reference to the main game manager
        this.state = 'IDLE'; // Can be 'IDLE', 'RECORDING', 'REPLAYING'
        
        this.replayData = []; // Stores the entire recorded shot, frame by frame
        this.ghostData = null; // Stores a saved replay for the ghost feature

        this.replayFrameIndex = 0; // Tracks the current frame during playback
        this.ghostFrameIndex = 0; // Tracks the ghost's frame index during live play
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
    }

    /**
     * Called every frame to draw the replay or ghost visuals.
     */
    draw() {
        if (this.state === 'REPLAYING') {
            this.drawReplayFrame();
        } else if (this.state === 'IDLE' && this.ghostData) {
            // Logic for drawing the ghost will go here in Phase 3
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
            // Find the original ball's color to draw it correctly
            const originalBall = this.gameManager.balls.find(b => b.body.id === ballState.id);
            if (originalBall) {
                fill(originalBall.color);
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
        this.replayData = []; // Clear previous recording
        console.log("ReplayManager: Recording started.");
    }

    recordFrame() {
        if (this.state !== 'RECORDING') return;

        const frame = [];
        for (const ball of this.gameManager.balls) {
            if (ball.body) { // Ensure the ball hasn't been removed
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
}
