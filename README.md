# Pool-Game
Graphics Programming midterm project

## Commit 1: Kick-off & Toolchain stage:

- Initialized Pool Game project structure with essential files: index.html, sketch.js, style.css, and README.md.
- Integrated p5.js (rendering) and Matter.js (physics) via CDN links in index.html.
- Created static 800x400 canvas and minimal draw loop for future game development.
- Verified project loads with green background and displays frame rate.
- Confirmed working setup in both VS Code and Brackets environments.

## Commit 2: Core Engine Setup

- Configures Matter.js physics engine for stable, gravity-free 2D simulation.
- Sets static canvas size using constants for future refactoring.
- Debug prints for engine state on launch.
- Ready to add table boundaries and dynamic entities next.

## Commit 3: Table & Boundaries

- Expanded canvas size to 1300x800 for a larger, more realistic pool table background and extra UI space.
- Rendered a detailed visual table: green felt, wood border, and six marked pocket locations.
- Added four static Matter.js wall bodies to enclose the play area and prevent ball escape.
- All walls and pocket markers are visually overlaid for easy alignment and debugging.
- Project is now ready for adding the ball system and dynamic gameplay!