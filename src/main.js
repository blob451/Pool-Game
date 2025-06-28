// src/main.js
/**
 * Serves as the entry point for the p5.js sketch, managing the main game loop
 * and delegating user input to the GameManager.
 */
let gameManager;

/**
 * Initializes the canvas and the main game manager.
 */
function setup() {
    createCanvas(1500, 1000).position(0, 0);
    gameManager = new GameManager();
}

/**
 * The main game loop, which updates and renders the game state each frame.
 */
function draw() {
    background(0, 50, 0); // Establishes the outer background colour.
    gameManager.update();
    gameManager.draw();
}

/**
 * Handles keyboard inputs for starting different game modes and exiting replays.
 */
function keyPressed() {
    // Exits replay mode when the SPACE key is pressed.
    if (gameManager && gameManager.replayManager.state === 'REPLAYING' && key === ' ') {
        gameManager.replayManager.stopReplay();
        return; // Prevents other key actions during replay.
    }

    // Switches between game modes based on number key presses.
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

/**
 * Delegates the 'mousePressed' event to the game manager.
 */
function mousePressed() {
    gameManager.handleInput('mousePressed');
}

/**
 * Delegates the 'mouseDragged' event to the game manager.
 */
function mouseDragged() {
    gameManager.handleInput('mouseDragged');
}

/**
 * Delegates the 'mouseReleased' event to the game manager.
 */
function mouseReleased() {
    gameManager.handleInput('mouseReleased');
}