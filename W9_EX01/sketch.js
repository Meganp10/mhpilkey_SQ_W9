// ============================================================
// Week 9 Example 1 — Card Flip Mechanic
// ============================================================
// This sketch introduces the core mechanics of a card
// matching game:
//   1. A grid of cards drawn with p5.js shapes
//   2. Click to flip a card face up
//   3. Two cards flipped — check if they match
//   4. Matched cards stay face up, unmatched flip back
//   5. Win when all pairs are matched
//
// No JSON, no levels yet — just the core mechanic.
// Example 2 adds multiple levels, JSON, and debug tools.
// ============================================================

// ------------------------------------------------------------
// CARD CONFIGURATION
// A 3x4 grid — 12 cards, 6 pairs.
// All layout values are defined as constants so they are
// easy to adjust without hunting through the code.
// ------------------------------------------------------------
const GRID_COLS = 3;
const GRID_ROWS = 4;
const CARD_W    = 120;
const CARD_H    = 160;
const CARD_GAP  = 16;

// Card back colour — stored as an array for use with fill()
const BACK_COLOR = [60, 60, 90];

// ------------------------------------------------------------
// CARD TYPES
// The 6 unique card types — each appears twice in the deck.
// symbol — which shape to draw on the card face
// color  — fill colour for the shape as an RGB array
// ------------------------------------------------------------
const CARD_TYPES = [
  { symbol: "circle",   color: [220, 80,  80]  },
  { symbol: "square",   color: [80,  180, 220] },
  { symbol: "triangle", color: [80,  200, 120] },
  { symbol: "diamond",  color: [220, 180, 60]  },
  { symbol: "star",     color: [180, 80,  220] },
  { symbol: "cross",    color: [220, 140, 60]  },
];

// ------------------------------------------------------------
// GAME STATE
// cards    — array of all card objects
// flipped  — indices of currently face-up unmatched cards
//            (max 2 at a time)
// moves    — total number of flips taken
// matchCount — number of pairs matched so far
// checking — true while we pause to show a mismatch before
//            flipping the cards back over
// checkTimer — counts down each frame during the pause
// ------------------------------------------------------------
let cards      = [];
let flipped    = [];
let moves      = 0;
let matchCount = 0;
let checking   = false;
let checkTimer = 0;

let gameWon = false;

// ============================================================
// setup()
// Runs once at the very start of the sketch.
// Canvas size is calculated from the grid constants so it
// always fits exactly — no magic numbers needed.
// ============================================================
function setup() {
  // Calculate canvas size from grid dimensions
  let w = GRID_COLS * CARD_W + (GRID_COLS + 1) * CARD_GAP;
  let h = GRID_ROWS * CARD_H + (GRID_ROWS + 1) * CARD_GAP + 60; // +60 for HUD
  createCanvas(w, h);
  textFont("monospace");
  buildDeck();
}

// ============================================================
// draw()
// Runs repeatedly in a loop after setup() finishes.
// Calls updateGame() to advance state, then draws everything.
// ============================================================
function draw() {
  background(20, 20, 35);

  drawHUD();
  updateGame();

  for (let i = 0; i < cards.length; i++) {
    drawCard(cards[i]);
  }

  if (gameWon) drawWinScreen();
}

// ------------------------------------------------------------
// buildDeck()
// Creates one pair for each card type, shuffles the deck
// using the Fisher-Yates algorithm, and positions each card
// in its grid slot.
//
// Fisher-Yates shuffle — the standard way to shuffle an array
// fairly. Works by iterating backwards and swapping each card
// with a randomly chosen card at or before its position.
// This guarantees every possible order is equally likely.
// ------------------------------------------------------------
function buildDeck() {
  cards      = [];
  flipped    = [];
  moves      = 0;
  matchCount = 0;
  checking   = false;
  gameWon    = false;

  // Create two cards for each type (one pair per type)
  let deck = [];
  for (let i = 0; i < CARD_TYPES.length; i++) {
    deck.push({ typeIndex: i });
    deck.push({ typeIndex: i });
  }

  // Fisher-Yates shuffle
  // Iterates from the last element backward, swapping each
  // with a random element at or before its position
  for (let i = deck.length - 1; i > 0; i--) {
    let j   = floor(random(i + 1));
    let tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }

  // Place shuffled cards into grid positions
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      let index = row * GRID_COLS + col;
      let x     = CARD_GAP + col * (CARD_W + CARD_GAP);
      let y     = 50 + CARD_GAP + row * (CARD_H + CARD_GAP); // 50px offset for HUD

      cards.push({
        x:         x,
        y:         y,
        typeIndex: deck[index].typeIndex,
        faceUp:    false, // is the card currently showing its face?
        matched:   false, // has this card been permanently matched?
      });
    }
  }
}

// ------------------------------------------------------------
// updateGame()
// Handles the mismatch timer each frame.
// When two non-matching cards are flipped, checking becomes
// true and checkTimer counts down. When it reaches 0, both
// cards are flipped back face down and the player can try again.
// ------------------------------------------------------------
function updateGame() {
  if (!checking) return;

  checkTimer--;
  if (checkTimer <= 0) {
    // Flip unmatched cards back face down
    for (let i = 0; i < flipped.length; i++) {
      cards[flipped[i]].faceUp = false;
    }
    flipped  = [];
    checking = false;
  }
}

// ------------------------------------------------------------
// drawCard(card)
// Draws either the card back or the card face depending
// on whether card.faceUp or card.matched is true.
// Matched cards show a coloured border to distinguish them
// from cards that are only temporarily flipped.
// push() and pop() isolate drawing styles to this function.
// ------------------------------------------------------------
function drawCard(card) {
  push();

  if (card.faceUp || card.matched) {
    // --- Card face ---
    let type = CARD_TYPES[card.typeIndex];

    // Slightly different background for matched cards
    fill(card.matched ? 50 : 40, card.matched ? 60 : 45, card.matched ? 70 : 65);

    // Coloured border for matched cards, plain grey for flipped
    stroke(card.matched ? color(type.color[0], type.color[1], type.color[2]) : 100);
    strokeWeight(card.matched ? 3 : 1);
    rect(card.x, card.y, CARD_W, CARD_H, 10);

    // Draw the symbol centred on the card
    let cx = card.x + CARD_W / 2;
    let cy = card.y + CARD_H / 2;
    drawSymbol(type.symbol, type.color, cx, cy, 40);

  } else {
    // --- Card back ---
    fill(BACK_COLOR[0], BACK_COLOR[1], BACK_COLOR[2]);
    stroke(80, 80, 120);
    strokeWeight(1);
    rect(card.x, card.y, CARD_W, CARD_H, 10);

    // Inner border pattern on the back
    noFill();
    stroke(80, 80, 130);
    strokeWeight(1);
    rect(card.x + 8, card.y + 8, CARD_W - 16, CARD_H - 16, 6);

    // Hover highlight — subtle white overlay when mouse is over
    if (isMouseOverCard(card) && !checking) {
      fill(255, 255, 255, 20);
      noStroke();
      rect(card.x, card.y, CARD_W, CARD_H, 10);
    }
  }

  pop();
}

// ------------------------------------------------------------
// drawSymbol(symbol, col, cx, cy, size)
// Draws a shape centred at (cx, cy) with the given size.
// Each symbol is a different p5.js drawing approach:
//   circle   — ellipse()
//   square   — rect() with rectMode(CENTER)
//   triangle — triangle()
//   diamond  — quad() (four-point polygon)
//   star     — beginShape() with alternating inner/outer radius
//   cross    — beginShape() with 12 vertices
// ------------------------------------------------------------
function drawSymbol(symbol, col, cx, cy, size) {
  fill(col[0], col[1], col[2]);
  noStroke();

  if (symbol === "circle") {
    ellipse(cx, cy, size * 2, size * 2);

  } else if (symbol === "square") {
    rectMode(CENTER); // draw rect from centre
    rect(cx, cy, size * 1.8, size * 1.8, 6);
    rectMode(CORNER); // restore default

  } else if (symbol === "triangle") {
    triangle(
      cx,        cy - size,  // top point
      cx - size, cy + size,  // bottom left
      cx + size, cy + size,  // bottom right
    );

  } else if (symbol === "diamond") {
    quad(
      cx,        cy - size, // top
      cx + size, cy,        // right
      cx,        cy + size, // bottom
      cx - size, cy,        // left
    );

  } else if (symbol === "star") {
    // Five-pointed star — 10 vertices alternating outer and inner radius
    beginShape();
    for (let i = 0; i < 10; i++) {
      let angle = (TWO_PI / 10) * i - HALF_PI;
      // Even indices = outer points, odd indices = inner points
      let r = i % 2 === 0 ? size : size * 0.45;
      vertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape(CLOSE);

  } else if (symbol === "cross") {
    // Plus-sign cross — 12 vertices tracing the outline
    let t = size * 0.35; // arm thickness
    beginShape();
    vertex(cx - t, cy - size); // top left of top arm
    vertex(cx + t, cy - size); // top right of top arm
    vertex(cx + t, cy - t);    // inner top right
    vertex(cx + size, cy - t); // right of right arm
    vertex(cx + size, cy + t); // right of right arm (bottom)
    vertex(cx + t, cy + t);    // inner bottom right
    vertex(cx + t, cy + size); // bottom right of bottom arm
    vertex(cx - t, cy + size); // bottom left of bottom arm
    vertex(cx - t, cy + t);    // inner bottom left
    vertex(cx - size, cy + t); // left of left arm (bottom)
    vertex(cx - size, cy - t); // left of left arm (top)
    vertex(cx - t, cy - t);    // inner top left
    endShape(CLOSE);
  }
}

// ------------------------------------------------------------
// mousePressed()
// A built-in p5.js event function — fires once per click.
// Checks which card was clicked and handles the flip logic:
//   1. Flip the clicked card face up
//   2. If two cards are now flipped, check for a match
//   3. Match: mark both as matched, check for win
//   4. No match: start the mismatch timer (checking = true)
// ------------------------------------------------------------
function mousePressed() {
  if (checking || gameWon) return;

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];

    // Skip already matched or currently face-up cards
    if (card.matched || card.faceUp) continue;

    if (isMouseOverCard(card)) {
      // Flip this card face up and record it
      card.faceUp = true;
      flipped.push(i);
      moves++;

      // If two cards are now face up, check for a match
      if (flipped.length === 2) {
        let a = cards[flipped[0]];
        let b = cards[flipped[1]];

        if (a.typeIndex === b.typeIndex) {
          // Match — mark both permanently face up
          a.matched = true;
          b.matched = true;
          flipped   = [];
          matchCount++;

          // All pairs matched — game is won
          if (matchCount === CARD_TYPES.length) {
            gameWon = true;
          }
        } else {
          // No match — pause then flip back
          // checkTimer controls how long the cards stay visible
          checking   = true;
          checkTimer = 50; // ~50 frames before flipping back
        }
      }

      break; // only flip one card per click
    }
  }
}

// ------------------------------------------------------------
// mouseClicked()
// A built-in p5.js event function — fires once per click.
// Used here separately from mousePressed() to handle the
// win screen reset, keeping the two responsibilities clear.
// ------------------------------------------------------------
function mouseClicked() {
  if (gameWon) buildDeck();
}

// ------------------------------------------------------------
// isMouseOverCard(card)
// Returns true if the mouse is currently inside the card's
// bounding rectangle. Used for click detection and hover highlight.
// ------------------------------------------------------------
function isMouseOverCard(card) {
  return (
    mouseX > card.x &&
    mouseX < card.x + CARD_W &&
    mouseY > card.y &&
    mouseY < card.y + CARD_H
  );
}

// ------------------------------------------------------------
// drawHUD()
// HUD = Heads Up Display.
// Shows move count and matched pairs at the top of the canvas.
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(160);
  textSize(14);
  textAlign(LEFT);
  textFont("monospace");
  text("Moves: " + moves, 16, 30);

  textAlign(RIGHT);
  text("Pairs: " + matchCount + " / " + CARD_TYPES.length, width - 16, 30);
}

// ------------------------------------------------------------
// drawWinScreen()
// Semi-transparent overlay drawn on top of the cards.
// Shows total moves taken and prompts the player to click
// anywhere to play again.
// ------------------------------------------------------------
function drawWinScreen() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  fill(80, 220, 160);
  textAlign(CENTER);
  textSize(40);
  textFont("monospace");
  text("You matched them all!", width / 2, height / 2 - 20);

  fill(200);
  textSize(16);
  text("Moves taken: " + moves, width / 2, height / 2 + 20);

  fill(255);
  textSize(14);
  text("Click anywhere to play again", width / 2, height / 2 + 55);
}
