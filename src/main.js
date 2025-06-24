// src/main.js
/**
 * Main entry point for Snooker Game (ported from Pool Game)
 * Handles p5.js setup/draw and global input, delegates all game logic to GameManager.
 */

let gameManager;

function setup() {
    createCanvas(800, 400); // (Resize to snooker proportions later)
    // Physics engine setup will now be handled inside GameManager
    gameManager = new GameManager();
}

function draw() {
    background(34, 139, 34); // Green felt background
    gameManager.update();    // Advance game state, physics, turns
    gameManager.draw();      // Render table, balls, cue, UI
}

function mousePressed() {
    gameManager.handleInput('mousePressed');
}

function mouseReleased() {
    gameManager.handleInput('mouseReleased');
}