# Week 9 Example 1 — Card Flip Mechanic

## What This Example Demonstrates

> **Note for students:** This section is included in example files only to help you study. Do not include it in your Side Quest submissions.

This example introduces the core mechanics of a card matching game — grid layout, flip state, match detection, and a mismatch timer — using only hardcoded data. Example 2 builds on this by adding JSON levels and debug tools.

- **Grid layout from constants** — canvas size is calculated from `GRID_COLS`, `GRID_ROWS`, `CARD_W`, `CARD_H`, and `CARD_GAP` so changing any constant automatically resizes the layout
- **Card objects** — each card has `x`, `y`, `typeIndex`, `faceUp`, and `matched` properties; `faceUp` is temporary (flipped back on mismatch), `matched` is permanent
- **Fisher-Yates shuffle** — the standard algorithm for shuffling an array fairly; iterates backwards and swaps each element with a randomly chosen one at or before its position; guarantees every order is equally likely
- **Two-card flip logic** — the `flipped` array stores indices of currently face-up unmatched cards; when it reaches length 2, the two cards are compared by `typeIndex`
- **Mismatch timer** — `checking` and `checkTimer` pause the game briefly after a mismatch so the player can see the cards before they flip back; `updateGame()` counts the timer down each frame
- **`faceUp` vs `matched`** — `faceUp` is true while a card is temporarily visible; `matched` is true permanently after a pair is found; `drawCard()` uses both to decide what to draw
- **`drawSymbol()`** — draws six different shapes using `ellipse()`, `rect()`, `triangle()`, `quad()`, and `beginShape()` / `vertex()`; demonstrates several p5.js drawing functions in one place
- **Hover highlight** — a subtle white overlay is drawn when `isMouseOverCard()` returns true and the game is not in the checking state
- **`mousePressed()` vs `mouseClicked()`** — both fire on a click; flip logic uses `mousePressed()` and the win screen reset uses `mouseClicked()` to keep the two responsibilities separate

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

Click any face-down card to flip it. Find all 6 matching pairs to win. Click anywhere on the win screen to play again.

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

The console will show any errors in your sketch.

## Assets

No external assets used. All visuals are generated with p5.js.

## References

N/A
