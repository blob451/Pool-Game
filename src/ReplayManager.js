// src/ReplayManager.js
/**
 * Manages the recording and playback of shots, including features for
 * slow-motion and ghost ball overlays.
 */
class ReplayManager {
    /**
     * Initializes the ReplayManager with a reference to the main game manager.
     * @param {GameManager} gameManager - The central game manager instance.
     */
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.state = 'IDLE'; // Possible states: IDLE, RECORDING, REPLAYING
        
        this.replayData = []; // Stores the frames of a recorded shot.
        this.ghostData = null; // Stores the data for the ghost ball replay.

        this.replayFrameIndex = 0; // Current frame index for replay playback.
        this.ghostFrameIndex = 0; // Current frame index for ghost playback.
        
        this.isSlowMotion = false; // Flag for slow-motion playback.
    }

    /**
     * Updates the state of the replay or ghost animation each frame.
     */
    update() {
        if (this.state === 'REPLAYING') {
            const speed = this.isSlowMotion ? 0.4 : 1.0;
            this.replayFrameIndex += speed;

            // Loops the replay when it reaches the end.
            if (this.replayFrameIndex >= this.replayData.length) {
                this.replayFrameIndex = 0;
            }
        } 
        else if (this.state === 'IDLE' && this.ghostData) {
            this.ghostFrameIndex++;
            // Loops the ghost animation when it reaches the end.
            if (this.ghostFrameIndex >= this.ghostData.length) {
                this.ghostFrameIndex = 0;
            }
        }
    }

    /**
     * Draws the current replay frame if in the 'REPLAYING' state.
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
        const frame = this.replayData[Math.floor(this.replayFrameIndex)];
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

    /**
     * Renders the translucent ghost shot overlay if available.
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

    /**
     * Begins recording a new shot.
     */
    startRecording() {
        if (this.state !== 'IDLE') return;
        this.state = 'RECORDING';
        this.replayData = [];
        this.ghostFrameIndex = 0; 
        console.log("ReplayManager: Recording started.");
    }

    /**
     * Records the state of all balls for the current frame.
     */
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

    /**
     * Stops the current recording session.
     */
    stopRecording() {
        if (this.state !== 'RECORDING') return;
        this.state = 'IDLE';
        console.log(`ReplayManager: Recording stopped. ${this.replayData.length} frames captured.`);
    }

    /**
     * Starts playing back the recorded shot.
     */
    startReplay() {
        if (this.state !== 'IDLE' || this.replayData.length === 0) return;
        this.state = 'REPLAYING';
        this.replayFrameIndex = 0;
        this.isSlowMotion = false;
        console.log("ReplayManager: Replay started.");
    }

    /**
     * Stops the current replay and returns to an idle state.
     */
    stopReplay() {
        if (this.state !== 'REPLAYING') return;
        this.state = 'IDLE';
        this.replayFrameIndex = 0;
        console.log("ReplayManager: Replay finished.");
    }

    /**
     * Saves the current replay data as a ghost replay.
     */
    saveAsGhost() {
        if (this.replayData.length === 0) return;
        this.ghostData = JSON.parse(JSON.stringify(this.replayData));
        this.ghostFrameIndex = 0;
        console.log("ReplayManager: Current shot saved as Ghost Replay.");
    }

    /**
     * Clears the saved ghost replay data.
     */
    clearGhost() {
        this.ghostData = null;
        console.log("ReplayManager: Ghost data cleared.");
    }
    
    /**
     * Toggles slow-motion playback for the replay.
     */
    toggleSlowMotion() {
        this.isSlowMotion = !this.isSlowMotion;
        console.log(`ReplayManager: Slow motion ${this.isSlowMotion ? 'enabled' : 'disabled'}.`);
    }
}