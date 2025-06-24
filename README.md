# Pool Game
Graphics Programming midterm project.

## Stage 1: Kick-off & Toolchain stage:

- Initialized Pool Game project structure with essential files: index.html, sketch.js, style.css, and README.md.
- Integrated p5.js (rendering) and Matter.js (physics) via CDN links in index.html.
- Created static 800x400 canvas and minimal draw loop for future game development.
- Verified project loads with green background and displays frame rate.
- Confirmed working setup in both VS Code and Brackets environments.

## Stage 2: Core Engine Setup

- Configures Matter.js physics engine for stable, gravity-free 2D simulation.
- Sets static canvas size using constants for future refactoring.
- Debug prints for engine state on launch.
- Ready to add table boundaries and dynamic entities next.

## Stage 3: Table & Boundaries

- Expanded canvas size to 1300x800 for a larger, more realistic pool table background and extra UI space.
- Rendered a detailed visual table: green felt, wood border, and six marked pocket locations.
- Added four static Matter.js wall bodies to enclose the play area and prevent ball escape.
- All walls and pocket markers are visually overlaid for easy alignment and debugging.
- Project is now ready for adding the ball system and dynamic gameplay!

## Stage 4: Ball Formation & Cue Ball Drag

- Implemented the official English eight-ball “J” rack: correct corner colors, stripes, and black ball always centered.
- Ball color assignments are randomized each game (within formation rules).
- Added interactive cue ball drag-and-drop before break, constrained to the D area, with visual highlight while dragging.
- Improved code clarity, rack layout logic, and added explanatory comments.

## Stage 5: Mouse‑Dominant Shot Mechanic & Cue Visuals

- Cue stick is a long, detailed graphic (butt, shaft, tip, leather pad, shadow). It hovers ~8px behind the cue ball and rotates with mouse drag.
- Shot mechanics: ball launches opposite the drag direction, matching pool physics.
- Power indicator: a semi-transparent blue bar overlays the cue, increasing in length with drag. Max power occurs when drag reaches ⅓ of cue length for intuitive control.
- UI feedback: cursor changes to pointer during aiming, with on-screen prompts guiding placement, aiming, and power selection.
- Interactivity: before the break, the cue ball can be placed; after, drag to aim and release to shoot.

## Stage 6: Cue Ball Foul & Re-Spotting

- When the cue ball is pocketed, it is automatically re-spotted in the D area after all balls stop.
- Player is prompted to drag and place the cue ball before resuming play.
- Logic prevents overlap with other balls and restores all normal mechanics for the next turn.

## Stage 7: Refactoring and Polish Update

- Improved overall code structure for readability and maintainability.
- Enhanced game stability, ensuring robust cue ball placement and pocket interactions.
- Optimized physics performance and rendering efficiency.
- Visual enhancements include clearer cue mechanics, power indicators, and UI prompts.
- Comprehensive inline commenting and clean function modularization added.

## Stage 7.1: Polish pass: UI/visuals and ball animations

- Enhanced visual polish: overlays fade, ball pocketing animates, table/felt shading improved.
- Improved cue/shot feedback, foul message transitions, and D area highlight.