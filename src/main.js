// src/main.js
/**
 * p5.js entry point. This version is cleaned up, delegating all UI drawing to the UIManager.
 */
let gameManager;

function setup() {
    let canvas = createCanvas(1500, 1000);
    canvas.position(0, 0);
    gameManager = new GameManager();
}

function draw() {
    background(0, 50, 0); // A darker green for the outer area
    
    // GameManager now handles all game-related updates and drawing calls.
    gameManager.update();
    gameManager.draw();
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
