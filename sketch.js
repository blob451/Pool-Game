// Ball System: J-Shape Rack & Cue Ball Drag – Pool Game

let Engine, World, Bodies, Composite;
let engine, world;

const CANVAS_W = 1300;
const CANVAS_H = 800;
const TABLE_W = 900;
const TABLE_H = 450;
const FELT_MARGIN = 50;
const WALL_THICK = 22;
const POCKET_RADIUS = 24;

const BALL_DIAM = 26;
const BALL_RADIUS = BALL_DIAM / 2;

const BALL_WHITE = '#FFFFFF';
const BALL_RED = '#C30000';
const BALL_YELLOW = '#FFEA00';
const BALL_BLACK = '#111111';

let balls = [];
let tableLeft, tableRight, tableTop, tableBottom;
let cueBall, draggingCue = false, dragOffset = { x: 0, y: 0 };

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

  // Table boundaries
  let x0 = (CANVAS_W - TABLE_W) / 2;
  let y0 = (CANVAS_H - TABLE_H) / 2;
  tableTop = Bodies.rectangle(CANVAS_W / 2, y0 - WALL_THICK / 2, TABLE_W + WALL_THICK * 2, WALL_THICK, { isStatic: true, restitution: 1, friction: 0 });
  tableBottom = Bodies.rectangle(CANVAS_W / 2, y0 + TABLE_H + WALL_THICK / 2, TABLE_W + WALL_THICK * 2, WALL_THICK, { isStatic: true, restitution: 1, friction: 0 });
  tableLeft = Bodies.rectangle(x0 - WALL_THICK / 2, CANVAS_H / 2, WALL_THICK, TABLE_H + WALL_THICK * 2, { isStatic: true, restitution: 1, friction: 0 });
  tableRight = Bodies.rectangle(x0 + TABLE_W + WALL_THICK / 2, CANVAS_H / 2, WALL_THICK, TABLE_H + WALL_THICK * 2, { isStatic: true, restitution: 1, friction: 0 });
  Composite.add(world, [tableTop, tableBottom, tableLeft, tableRight]);

  balls = [];
  // Add cue ball (white), positioned in the “D” area (left quarter)
  let cueX = x0 + 130;
  let cueY = CANVAS_H / 2;
  cueBall = createBall(cueX, cueY, BALL_WHITE, 'cue');
  balls.push(cueBall);

  // Place J-shape rack formation for English Eight-Ball
  let rackBalls = createJShapeRack(x0, y0);
  for (let b of rackBalls) balls.push(b);
  for (let b of balls) Composite.add(world, b.body);
}

function createBall(x, y, color, type) {
  let body = Bodies.circle(x, y, BALL_RADIUS, {
    restitution: 0.98,
    friction: 0.025,
    frictionAir: 0.012,
    label: type,
    isStatic: false
  });
  return { body: body, color: color, type: type };
}

function createJShapeRack(x0, y0) {
  // Implementation per WPBA J-shape diagram, random color assignment (left-corner decides)
  const rackX = x0 + TABLE_W - 220;
  const rackY = CANVAS_H / 2;
  const rows = 5;

  // Randomly decide which color is left-corner
  const leftIsRed = Math.random() > 0.5;
  const RED = leftIsRed ? 'red' : 'yellow';
  const YELLOW = leftIsRed ? 'yellow' : 'red';

  // Build the 15-ball array, fill each slot as per J-diagram and requirements:
  let formation = Array(15).fill(null);
  // 8-ball in center of 3rd row (row=2, col=1; index=6)
  formation[6] = 'black';

  // Rear corners
  formation[10] = RED;     // (4,0) left
  formation[14] = YELLOW;  // (4,4) right

  // Next to corners (stripes of 2)
  let redStripe2 = [RED, RED];
  let yellowStripe2 = [YELLOW, YELLOW];
  shuffleInPlace(redStripe2);
  shuffleInPlace(yellowStripe2);
  formation[6 - 0] = redStripe2[0];  // (3,0)
  formation[13] = redStripe2[1];     // (4,3)
  formation[11] = yellowStripe2[0];  // (4,1)
  formation[12] = yellowStripe2[1];  // (4,2)

  // J-stripe of three (YELLOW) - right side
  let jStripe = [YELLOW, YELLOW, YELLOW];
  shuffleInPlace(jStripe);
  formation[9] = jStripe[0];  // (3,3)
  formation[8] = jStripe[1];  // (3,2)
  formation[4] = jStripe[2];  // (2,2)

  // Two reds inside J, next to black
  formation[5] = RED;  // (2,0)
  formation[7] = RED;  // (3,1)

  // Front ball same as left-corner
  formation[0] = RED;

  // Ball behind and to right (1) same as front, left (2) is other color
  formation[1] = RED;
  formation[2] = YELLOW;

  // Make sure all undefined slots are filled with random correct color
  let redsToFill = 7 - formation.filter(c => c === 'red').length;
  let yellowsToFill = 7 - formation.filter(c => c === 'yellow').length;
  let fillOrder = [];
  for (let i = 0; i < redsToFill; i++) fillOrder.push('red');
  for (let i = 0; i < yellowsToFill; i++) fillOrder.push('yellow');
  shuffleInPlace(fillOrder);

  for (let i = 0, f = 0; i < 15; i++) {
    if (!formation[i]) {
      formation[i] = fillOrder[f++];
    }
  }

  // Place balls according to formation
  let result = [];
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    let ballsInRow = row + 1;
    let x = rackX + row * (BALL_DIAM * 0.87);
    let yStart = rackY - (ballsInRow - 1) * (BALL_DIAM / 2);
    for (let col = 0; col < ballsInRow; col++) {
      let colorType = formation[idx];
      let color;
      if (colorType === 'red') color = BALL_RED;
      else if (colorType === 'yellow') color = BALL_YELLOW;
      else if (colorType === 'black') color = BALL_BLACK;
      else color = BALL_BLACK; // fallback
      result.push(createBall(x, yStart + col * BALL_DIAM, color, colorType));
      idx++;
    }
  }
  return result;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function draw() {
  background(35, 22, 12);
  drawTable();
  for (let b of balls) drawBall(b);
  Engine.update(engine, 1000 / 60);
  fill(255); noStroke(); textSize(20);
  text('Ball System: J-Rack Formation & Cue Ball Drag', 40, 40);
}

function drawTable() {
  fill(32, 112, 40);
  stroke(180, 140, 50); strokeWeight(4);
  rect((CANVAS_W - TABLE_W) / 2, (CANVAS_H - TABLE_H) / 2, TABLE_W, TABLE_H, 40);
  noFill(); stroke(120, 70, 15); strokeWeight(FELT_MARGIN);
  rect((CANVAS_W - TABLE_W) / 2 - FELT_MARGIN / 2, (CANVAS_H - TABLE_H) / 2 - FELT_MARGIN / 2, TABLE_W + FELT_MARGIN, TABLE_H + FELT_MARGIN, 48);
  drawWall(tableTop); drawWall(tableBottom); drawWall(tableLeft); drawWall(tableRight);
  markPockets();
  drawBaulkLineAndD();
}

function drawWall(body) {
  fill(160, 100, 0, 80);
  noStroke(); push();
  translate(body.position.x, body.position.y); rotate(body.angle);
  rectMode(CENTER); rect(0, 0, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
  pop();
}

function markPockets() {
  let x0 = (CANVAS_W - TABLE_W) / 2;
  let y0 = (CANVAS_H - TABLE_H) / 2;
  let x1 = x0 + TABLE_W;
  let y1 = y0 + TABLE_H;
  let midX = CANVAS_W / 2;
  fill(0); stroke(200); strokeWeight(2);
  ellipse(x0, y0, POCKET_RADIUS * 2);
  ellipse(x1, y0, POCKET_RADIUS * 2);
  ellipse(x0, y1, POCKET_RADIUS * 2);
  ellipse(x1, y1, POCKET_RADIUS * 2);
  ellipse(midX, y0, POCKET_RADIUS * 2);
  ellipse(midX, y1, POCKET_RADIUS * 2);
}

function drawBaulkLineAndD() {
  let x0 = (CANVAS_W - TABLE_W) / 2;
  let baulkX = x0 + TABLE_W * 0.25;
  let yTop = (CANVAS_H - TABLE_H) / 2;
  let yBot = yTop + TABLE_H;
  stroke(255, 220, 180); strokeWeight(3);
  line(baulkX, yTop + 3, baulkX, yBot - 3);
  let dRadius = TABLE_H * 0.20;
  noFill(); stroke(255, 220, 180); strokeWeight(3);
  arc(baulkX, CANVAS_H / 2, dRadius * 2, dRadius * 2, HALF_PI, 3 * HALF_PI);
}

function drawBall(b) {
  fill(b.color); stroke(40); strokeWeight(2);
  ellipse(b.body.position.x, b.body.position.y, BALL_DIAM);
  // Highlight cue ball if dragging
  if (b === cueBall && draggingCue) {
    noFill(); stroke(255, 220, 0); strokeWeight(4);
    ellipse(b.body.position.x, b.body.position.y, BALL_DIAM + 10);
  }
}

function mousePressed() {
  if (isCueBall(mouseX, mouseY)) {
    draggingCue = true;
    dragOffset.x = cueBall.body.position.x - mouseX;
    dragOffset.y = cueBall.body.position.y - mouseY;
    Matter.Body.setStatic(cueBall.body, true);
  }
}

function mouseDragged() {
  if (draggingCue) {
    let px = mouseX + dragOffset.x;
    let py = mouseY + dragOffset.y;
    let x0 = (CANVAS_W - TABLE_W) / 2;
    let baulkX = x0 + TABLE_W * 0.25;
    let dRadius = TABLE_H * 0.20;
    let cx = baulkX, cy = CANVAS_H / 2;
    let angle = atan2(py - cy, px - cx);
    let distToCenter = dist(px, py, cx, cy);
    if (distToCenter > dRadius) {
      px = cx + cos(angle) * dRadius;
      py = cy + sin(angle) * dRadius;
    }
    if (px > baulkX) px = baulkX;
    Matter.Body.setPosition(cueBall.body, { x: px, y: py });
  }
}

function mouseReleased() {
  if (draggingCue) {
    draggingCue = false;
    Matter.Body.setStatic(cueBall.body, false);
  }
}

function isCueBall(mx, my) {
  let dx = mx - cueBall.body.position.x;
  let dy = my - cueBall.body.position.y;
  return sqrt(dx * dx + dy * dy) < BALL_RADIUS + 6;
}

function allBallsStopped() {
  for (let b of balls) if (b.body.speed > 0.2) return false;
  return true;
}
