# Week 9 Example 2 — Memory Match (3 Levels)

## What This Example Demonstrates

> **Note for students:** This section is included in example files only to help you study. Do not include it in your Side Quest submissions.

This example builds on Example 1 by adding three JSON-driven levels, a canvas that resizes between levels, a running total move counter, and debug shortcuts for testing without playing through the whole game.

- **Multiple JSON files in `preload()`** — all three level files are loaded upfront and stored in `levelData` by number (`levelData[1]`, `levelData[2]`, `levelData[3]`); switching levels is instant because no loading happens mid-game
- **`loadLevel(num)`** — a single function handles all setup for any level: reads the JSON, sets grid dimensions and card types, clears cards, resizes the canvas, and builds the deck; calling `loadLevel(2)` is all that is needed to switch to level 2
- **`resizeCanvas()`** — resizes the canvas dynamically to fit each level's grid; cards must be cleared before calling it because the resize triggers an immediate redraw
- **Guard against stale data** — `drawCard()` checks `if (!cardTypes || cardTypes.length === 0) return` to skip drawing during the brief moment when `resizeCanvas()` redraws before new level data is assigned
- **`totalMoves` vs `levelMoves`** — `totalMoves` accumulates across all levels for the final score; `levelMoves` resets each level to show per-level performance; both are tracked in the HUD
- **`setTimeout()`** — used to wait 800ms before loading the next level after all pairs are matched; gives the player a moment to see the completed board; it mixes browser timing with p5's draw loop, which works here because no cards remain to be clicked during the wait
- **Debug panel** — toggled with D; drawn last so it sits on top of everything; shows shortcut buttons for jumping to any level or screen; always build these into your games early so you never have to play through from the start just to test one screen
- **Debug shortcuts** — `keyPressed()` handles D, S, W, and number keys 1–3 for instant navigation during development

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

Click cards to flip them. Match all pairs to advance to the next level. Complete all 3 levels to win.

**Debug shortcuts:**

- **D** — toggle debug panel
- **1 / 2 / 3** — jump directly to that level
- **S** — jump to start screen
- **W** — jump to win screen

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

The console will show any errors in your sketch.

## Assets

No external assets used. All visuals are generated with p5.js.

## References

N/A
