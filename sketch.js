// Matter.js Aliases
let Engine, World, Bodies, Composite;
let engine, world;

// Canvas constants
const CANVAS_W = 800;
const CANVAS_H = 400;

function setup() {
  // p5.js Canvas
  createCanvas(CANVAS_W, CANVAS_H).parent('game-canvas');

  // Matter.js Module Shortcuts
  Engine = Matter.Engine;
  World = Matter.World;
  Bodies = Matter.Bodies;
  Composite = Matter.Composite;

  // Create Physics Engine
  engine = Engine.create();
  world = engine.world;

  // Disable gravity (top-down table)
  world.gravity.y = 0;

  // Physics engine tuning for stability
  engine.positionIterations = 8; // Default is 6
  engine.velocityIterations = 6; // Default is 4

  // Debug: Print engine config
  console.log('Matter.js engine created:', {
    gravity: world.gravity,
    positionIterations: engine.positionIterations,
    velocityIterations: engine.velocityIterations
  });
}

function draw() {
  background(32, 112, 40); // Pool table green

  // Advance physics engine at fixed time step (60 FPS)
  Engine.update(engine, 1000 / 60);

  // UI Overlay
  fill(255);
  textSize(20);
  text('Core Engine Setup Stage', 40, 40);
  text('Frame rate: ' + nf(frameRate(), 2, 1), 40, 70);
}