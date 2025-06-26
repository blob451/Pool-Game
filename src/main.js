// src/main.js
/**
 * p5.js entry point. Includes keyPressed() for mode switching and replay exit.
 */
let gameManager;

function setup() {
    createCanvas(1500, 1000).position(0, 0);
    gameManager = new GameManager();
}

function draw() {
    background(0, 50, 0); // A darker green for the outer area
    gameManager.update();
    gameManager.draw();
}

function keyPressed() {
    // [REPLAY] If in replay mode, any key press will stop the replay.
    if (gameManager && gameManager.replayManager.state === 'REPLAYING') {
        gameManager.replayManager.stopReplay();
        return; // Prevent other key actions during replay.
    }

    if (key === '1') {
        console.log("Starting Mode 1: Standard Layout");
        gameManager.startNewMode(1);
    } else if (key === '2') {
        console.log("Starting Mode 2: Random All Balls");
        gameManager.startNewMode(2);
    } else if (key === '3') {
        console.log("Starting Mode 3: Random Reds Only");
        gameManager.startNewMode(3);
    }
}

function mousePressed() {
    gameManager.handleInput('mousePressed');
}

function mouseDragged() {
    gameManager.handleInput('mouseDragged');
}

function mouseReleased() {
    gameManager.handleInput('mouseReleased');
}
