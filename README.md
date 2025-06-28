# Snooker Game

A classic snooker game built with **p5.js** for rendering and **matter.js** for the physics engine. This project is designed with a modular structure, making it easy to understand, maintain, and extend.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Play](#how-to-play)
- [Core Components](#core-components)
- [Future Enhancements](#future-enhancements)

---

## Features

* **Realistic Physics**: Ball movements and collisions are powered by the robust matter.js physics engine.
* **Modular Architecture**: The code is organized into distinct, manageable modules, each with a clear responsibility.
* **Multiple Game Modes**: Includes a standard layout, a random ball placement mode, and a mode with only random red balls.
* **Interactive UI**: A clean and intuitive user interface provides all the necessary game information and controls.
* **Shot Replay System**: A replay manager that can record, playback, and even create "ghost" replays of previous shots.
* **Aim Assist**: An optional feature to help players line up their shots.

---

## Getting Started

To run the game, simply open the `index.html` file in a modern web browser that supports HTML5 and JavaScript. There are no other dependencies or build steps required.

---

## How to Play

* **Aiming**: Click and drag the mouse away from the cue ball to aim. The farther you drag, the more power you will apply to the shot.
* **Shooting**: Release the mouse button to strike the cue ball.
* **Game Modes**: Use the number keys `1`, `2`, and `3` to switch between different game modes at any time.
* **Replay**: After a shot, use the on-screen buttons to view a replay, save it as a "ghost" shot, or clear the ghost replay.

---

## Core Components

* **`main.js`**: The entry point of the application, responsible for setting up the p5.js canvas and handling the main game loop.
* **`GameManager.js`**: The central hub of the game, managing the game state, rules, and the interaction between all other modules.
* **`Table.js`**: Defines the snooker table, including its dimensions, pockets, and the physics boundaries for the balls.
* **`Ball.js`**: Represents the snooker balls, each with its own colour, value, and physics properties.
* **`Cue.js`**: Manages the logic for the player's cue, from aiming and power selection to the final shot animation.
* **`Scoring.js`**: Handles all scoring-related logic, including tracking player scores and processing fouls.
* **`UIManager.js`**: Responsible for rendering all user interface elements, such as the scoreboard, buttons, and informational panels.
* **`ReplayManager.js`**: A powerful tool for recording and replaying shots, adding a dynamic and engaging element to the game.
* **`utils.js`**: A collection of helper functions used across various modules to perform common tasks.

---

## Future Enhancements

This project is a solid foundation for a full-featured snooker game. Here are some ideas for future enhancements:

* **AI Opponent**: Implement an artificial intelligence so players can compete against the computer.
* **Sound Effects**: Add sound for ball collisions, pocketing balls, and other game events.
* **Multiplayer**: Extend the game to support online multiplayer functionality.
* **Snooker Rules**: Implement the full set of snooker rules, including "snookers required" and other complex scenarios.
* **Improved Graphics**: Enhance the visual presentation with more detailed textures, lighting, and animations.