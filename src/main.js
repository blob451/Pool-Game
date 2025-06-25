// src/main.js
/**
 * p5.js entry. This version includes mouseDragged to handle aiming correctly.
 */
let gameManager;

function setup() {
    // Full-size canvas for 1500x1000 px
    let canvas = createCanvas(1500, 1000);
    canvas.position(0, 0); // Always top-left
    gameManager = new GameManager();
}

function draw() {
    background(0, 110, 0); // dark outer background
    gameManager.update();
    gameManager.draw();

    // UI overlays (scores) are now the single source of truth for the score display.
    fill(255);
    textSize(28);
    textAlign(LEFT, TOP);
    text(`Player 1: ${gameManager.scoring.getScore(0)}`, 30, 16);
    textAlign(RIGHT, TOP);
    text(`Player 2: ${gameManager.scoring.getScore(1)}`, width - 30, 16);
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
