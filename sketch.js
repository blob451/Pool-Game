// Matter.js variables
let Engine, World, Bodies, Composite;
let engine, world;

function setup() {
  createCanvas(800, 400).parent('game-canvas');
  Engine = Matter.Engine;
  World = Matter.World;
  Bodies = Matter.Bodies;
  Composite = Matter.Composite;

  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0; // No gravity for pool table

  console.log('Matter.js engine created, setup complete.');
}

function draw() {
  background(32, 112, 40); // Pool table green
  Matter.Engine.update(engine, 1000 / 60);
  fill(255);
  textSize(20);
  text('Kick-off & Toolchain Stage', 40, 40);
  text('Frame rate: ' + nf(frameRate(), 2, 1), 40, 70);
}
