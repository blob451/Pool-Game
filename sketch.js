let Engine, World, Bodies, Composite;
let engine, world;

// Canvas and table constants
const CANVAS_W = 1300;
const CANVAS_H = 800;
const TABLE_W = 900;
const TABLE_H = 450;
const FELT_MARGIN = 50;
const WALL_THICK = 22;
const POCKET_RADIUS = 24; // For future use

let tableLeft, tableRight, tableTop, tableBottom;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H).parent('game-canvas');
  Engine = Matter.Engine;
  World = Matter.World;
  Bodies = Matter.Bodies;
  Composite = Matter.Composite;

  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0;
  engine.positionIterations = 8;
  engine.velocityIterations = 6;

  // Table boundaries (physical walls)
  let x0 = (CANVAS_W - TABLE_W) / 2;
  let y0 = (CANVAS_H - TABLE_H) / 2;
  // Top
  tableTop = Bodies.rectangle(
    CANVAS_W / 2,
    y0 - WALL_THICK / 2,
    TABLE_W + WALL_THICK * 2,
    WALL_THICK,
    { isStatic: true, restitution: 1, friction: 0 }
  );
  // Bottom
  tableBottom = Bodies.rectangle(
    CANVAS_W / 2,
    y0 + TABLE_H + WALL_THICK / 2,
    TABLE_W + WALL_THICK * 2,
    WALL_THICK,
    { isStatic: true, restitution: 1, friction: 0 }
  );
  // Left
  tableLeft = Bodies.rectangle(
    x0 - WALL_THICK / 2,
    CANVAS_H / 2,
    WALL_THICK,
    TABLE_H + WALL_THICK * 2,
    { isStatic: true, restitution: 1, friction: 0 }
  );
  // Right
  tableRight = Bodies.rectangle(
    x0 + TABLE_W + WALL_THICK / 2,
    CANVAS_H / 2,
    WALL_THICK,
    TABLE_H + WALL_THICK * 2,
    { isStatic: true, restitution: 1, friction: 0 }
  );
  Composite.add(world, [tableTop, tableBottom, tableLeft, tableRight]);
}

function draw() {
  background(35, 22, 12); // Dark brown for table background

  // Table felt
  fill(32, 112, 40);
  stroke(180, 140, 50);
  strokeWeight(4);
  rect(
    (CANVAS_W - TABLE_W) / 2,
    (CANVAS_H - TABLE_H) / 2,
    TABLE_W,
    TABLE_H,
    40
  );

  // Wood border
  noFill();
  stroke(120, 70, 15);
  strokeWeight(FELT_MARGIN);
  rect(
    (CANVAS_W - TABLE_W) / 2 - FELT_MARGIN / 2,
    (CANVAS_H - TABLE_H) / 2 - FELT_MARGIN / 2,
    TABLE_W + FELT_MARGIN,
    TABLE_H + FELT_MARGIN,
    48
  );

  // Render table boundaries (for debug only)
  drawWall(tableTop);
  drawWall(tableBottom);
  drawWall(tableLeft);
  drawWall(tableRight);

  // Mark pocket locations (visual only)
  markPockets();

  // Update physics
  Engine.update(engine, 1000 / 60);

  // Overlay
  fill(255);
  noStroke();
  textSize(20);
  text('Table & Boundaries Stage', 40, 40);
}

function drawWall(body) {
  fill(160, 100, 0, 100);
  noStroke();
  push();
  translate(body.position.x, body.position.y);
  rotate(body.angle);
  rectMode(CENTER);
  rect(0, 0, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
  pop();
}

function markPockets() {
  // 6 pockets: 4 corners + mid-top/mid-bottom
  let x0 = (CANVAS_W - TABLE_W) / 2;
  let y0 = (CANVAS_H - TABLE_H) / 2;
  let x1 = x0 + TABLE_W;
  let y1 = y0 + TABLE_H;
  let midX = CANVAS_W / 2;
  let midY = CANVAS_H / 2;
  fill(0);
  stroke(200);
  strokeWeight(2);
  // Corners
  ellipse(x0, y0, POCKET_RADIUS * 2);
  ellipse(x1, y0, POCKET_RADIUS * 2);
  ellipse(x0, y1, POCKET_RADIUS * 2);
  ellipse(x1, y1, POCKET_RADIUS * 2);
  // Middles
  ellipse(midX, y0, POCKET_RADIUS * 2);
  ellipse(midX, y1, POCKET_RADIUS * 2);
}
