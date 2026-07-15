// ============================================================
// Week 9 Example 2 — Memory Match (3 Levels)
// ============================================================
// Builds on Example 1 by adding:
//   1. Three levels loaded from separate JSON files
//   2. Fixed canvas size with centred grid layout per level
//   3. Move counter carrying across all levels
//   4. Debug shortcuts for testing without playing through
//
// FILE STRUCTURE:
//   sketch.js        — game loop, states, all logic
//   data/level1.json — level 1 card data (3x4 grid, 6 pairs)
//   data/level2.json — level 2 card data (4x4 grid, 8 pairs)
//   data/level3.json — level 3 card data (4x5 grid, 10 pairs)
//
// DEBUG SHORTCUTS (available during any state):
//   D       — toggle debug panel
//   1, 2, 3 — jump directly to that level
//   S       — jump to start screen
//   W       — jump to win screen
//
// Always build debug shortcuts into your games early.
// Never make yourself play through the whole game just to
// test the final screen or the last level.
// ============================================================

// ------------------------------------------------------------
// GAME STATES
// ------------------------------------------------------------
const STATE_START = "start";
const STATE_PLAY = "play";
const STATE_WIN = "win";

let gameState = STATE_START;
let currentLevel = 1;
const MAX_LEVELS = 3;

// ------------------------------------------------------------
// CARD LAYOUT CONSTANTS
// Canvas is always 600x600. The grid is centred using
// offsetX and offsetY calculated in loadLevel().
// ------------------------------------------------------------
const CANVAS_W = 600;
const CANVAS_H = 800;
const CARD_W = 100;
const CARD_H = 130;
const CARD_GAP = 14;
const HUD_H = 55; // height reserved for the HUD at the top

const BACK_COLOR = [60, 60, 90];

// ------------------------------------------------------------
// GRID OFFSET
// Calculated in loadLevel() to centre the grid on the canvas.
// Used in buildDeck() to position each card.
// ------------------------------------------------------------
let offsetX = 0;
let offsetY = 0;

// ------------------------------------------------------------
// LEVEL DATA
// levelData stores the raw JSON for all three levels,
// loaded in preload(). Each level is accessed by number:
// levelData[1], levelData[2], levelData[3].
// ------------------------------------------------------------
let levelData = {};
let cards = [];
let flipped = [];
let cardTypes = [];
let gridCols = 0;
let gridRows = 0;

// ------------------------------------------------------------
// SCORE TRACKING
// totalMoves carries across all levels so the final score
// reflects the entire playthrough.
// levelMoves resets at the start of each level.
// ------------------------------------------------------------
let totalMoves = 0;
let levelMoves = 0;
let matchCount = 0;
let checking = false;
let checkTimer = 0;

// ------------------------------------------------------------
// DEBUG
// debugMode is toggled with the D key.
// When true, the debug panel is drawn on top of everything.
// ------------------------------------------------------------
let debugMode = false;

// ============================================================
// preload()
// Runs once before setup(). Loads all three level JSON files
// upfront so switching between levels is instant.
// ============================================================
function preload() {
  levelData[1] = loadJSON("data/level1.json");
  levelData[2] = loadJSON("data/level2.json");
  levelData[3] = loadJSON("data/level3.json");
}

// ============================================================
// setup()
// Fixed canvas size — the grid centres itself within it.
// ============================================================
function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  textFont("monospace");
}

// ============================================================
// draw()
// Runs repeatedly in a loop after setup() finishes.
// The debug panel is always drawn last so it sits on top.
// ============================================================
function draw() {
  background(20, 20, 35);

  if (gameState === STATE_START) {
    drawStartScreen();
  } else if (gameState === STATE_PLAY) {
    updateGame();
    drawCards();
    drawHUD();
  } else if (gameState === STATE_WIN) {
    drawWinScreen();
  }

  // Debug panel is drawn on top of everything when active
  if (debugMode) drawDebugPanel();
}

// ------------------------------------------------------------
// loadLevel(num)
// Reads the JSON for the given level number and sets up the
// grid, cards, and centred offsets for that level.
//
// offsetX and offsetY centre the grid horizontally and
// vertically within the fixed canvas.
// ------------------------------------------------------------
function loadLevel(num) {
  currentLevel = num;
  let data = levelData[num];

  // Guard — check the JSON has loaded before using it
  if (!data || !data.cards) {
    console.log("Level " + num + " data not ready yet");
    return;
  }

  gridCols = data.cols;
  gridRows = data.rows;
  cardTypes = data.cards;

  // Clear cards before recalculating layout
  cards = [];
  flipped = [];

  // Calculate grid dimensions
  let gridW = gridCols * CARD_W + (gridCols + 1) * CARD_GAP;
  let gridH = gridRows * CARD_H + (gridRows + 1) * CARD_GAP;

  // Centre the grid horizontally and vertically below the HUD
  offsetX = (CANVAS_W - gridW) / 2;
  offsetY = HUD_H + (CANVAS_H - HUD_H - gridH) / 2;

  buildDeck();

  // Reset per-level tracking
  levelMoves = 0;
  matchCount = 0;
  checking = false;
}

// ------------------------------------------------------------
// buildDeck()
// Creates pairs from cardTypes, shuffles using Fisher-Yates,
// and positions each card using offsetX and offsetY.
// ------------------------------------------------------------
function buildDeck() {
  cards = [];

  // Create two cards for each type (one pair per type)
  let deck = [];
  for (let i = 0; i < cardTypes.length; i++) {
    deck.push({ typeIndex: i });
    deck.push({ typeIndex: i });
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    let tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }

  // Place shuffled cards into grid positions using offsets
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      let index = row * gridCols + col;
      cards.push({
        x: offsetX + CARD_GAP + col * (CARD_W + CARD_GAP),
        y: offsetY + CARD_GAP + row * (CARD_H + CARD_GAP),
        typeIndex: deck[index].typeIndex,
        faceUp: false,
        matched: false,
      });
    }
  }
}

// ------------------------------------------------------------
// updateGame()
// Handles the mismatch timer each frame during STATE_PLAY.
// ------------------------------------------------------------
function updateGame() {
  if (!checking) return;

  checkTimer--;
  if (checkTimer <= 0) {
    for (let i = 0; i < flipped.length; i++) {
      cards[flipped[i]].faceUp = false;
    }
    flipped = [];
    checking = false;
  }
}

// ============================================================
// DRAW FUNCTIONS
// ============================================================

function drawCards() {
  for (let i = 0; i < cards.length; i++) {
    drawCard(cards[i]);
  }
}

function drawCard(card) {
  if (!cardTypes || cardTypes.length === 0) return;

  push();

  if (card.faceUp || card.matched) {
    let type = cardTypes[card.typeIndex];

    fill(
      card.matched ? 50 : 40,
      card.matched ? 60 : 45,
      card.matched ? 70 : 65,
    );
    stroke(
      card.matched ? color(type.color[0], type.color[1], type.color[2]) : 100,
    );
    strokeWeight(card.matched ? 3 : 1);
    rect(card.x, card.y, CARD_W, CARD_H, 8);

    drawSymbol(
      type.symbol,
      type.color,
      card.x + CARD_W / 2,
      card.y + CARD_H / 2,
      32,
    );
  } else {
    fill(BACK_COLOR[0], BACK_COLOR[1], BACK_COLOR[2]);
    stroke(80, 80, 120);
    strokeWeight(1);
    rect(card.x, card.y, CARD_W, CARD_H, 8);

    noFill();
    stroke(80, 80, 130);
    rect(card.x + 7, card.y + 7, CARD_W - 14, CARD_H - 14, 5);

    if (isMouseOverCard(card) && !checking) {
      fill(255, 255, 255, 20);
      noStroke();
      rect(card.x, card.y, CARD_W, CARD_H, 8);
    }
  }

  pop();
}

function drawSymbol(symbol, col, cx, cy, size) {
  fill(col[0], col[1], col[2]);
  noStroke();

  if (symbol === "circle") {
    ellipse(cx, cy, size * 2, size * 2);
  } else if (symbol === "square") {
    rectMode(CENTER);
    rect(cx, cy, size * 1.8, size * 1.8, 5);
    rectMode(CORNER);
  } else if (symbol === "triangle") {
    triangle(cx, cy - size, cx - size, cy + size, cx + size, cy + size);
  } else if (symbol === "diamond") {
    quad(cx, cy - size, cx + size, cy, cx, cy + size, cx - size, cy);
  } else if (symbol === "star") {
    beginShape();
    for (let i = 0; i < 10; i++) {
      let angle = (TWO_PI / 10) * i - HALF_PI;
      let r = i % 2 === 0 ? size : size * 0.45;
      vertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape(CLOSE);
  } else if (symbol === "cross") {
    let t = size * 0.35;
    beginShape();
    vertex(cx - t, cy - size);
    vertex(cx + t, cy - size);
    vertex(cx + t, cy - t);
    vertex(cx + size, cy - t);
    vertex(cx + size, cy + t);
    vertex(cx + t, cy + t);
    vertex(cx + t, cy + size);
    vertex(cx - t, cy + size);
    vertex(cx - t, cy + t);
    vertex(cx - size, cy + t);
    vertex(cx - size, cy - t);
    vertex(cx - t, cy - t);
    endShape(CLOSE);
  }
}

// ------------------------------------------------------------
// drawHUD()
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(160);
  textSize(13);
  textAlign(LEFT);
  text("Level " + currentLevel + " / " + MAX_LEVELS, 16, 28);
  text("This level: " + levelMoves + " moves", 16, 44);

  textAlign(RIGHT);
  fill(200);
  text("Total moves: " + totalMoves, width - 16, 28);
  text("Pairs: " + matchCount + " / " + cardTypes.length, width - 16, 44);
}

// ------------------------------------------------------------
// drawStartScreen()
// ------------------------------------------------------------
function drawStartScreen() {
  fill(255);
  textAlign(CENTER);
  textSize(40);
  text("MEMORY MATCH", width / 2, height / 2 - 80);

  fill(160);
  textSize(15);
  text(
    "Match all the pairs to complete each level.",
    width / 2,
    height / 2 - 30,
  );
  text("3 levels — grid gets bigger each time.", width / 2, height / 2 - 8);

  fill(255);
  textSize(16);
  text("Click to start", width / 2, height / 2 + 50);

  fill(80);
  textSize(11);
  text("Press D to open debug panel", width / 2, height - 20);
}

// ------------------------------------------------------------
// drawWinScreen()
// ------------------------------------------------------------
function drawWinScreen() {
  background(20, 20, 35);

  fill(80, 220, 160);
  textAlign(CENTER);
  textSize(44);
  text("You did it!", width / 2, height / 2 - 60);

  fill(200);
  textSize(18);
  text("All 3 levels complete!", width / 2, height / 2 - 10);

  fill(255, 220, 80);
  textSize(22);
  text("Total moves: " + totalMoves, width / 2, height / 2 + 30);

  fill(160);
  textSize(14);
  text("Click to play again", width / 2, height / 2 + 75);

  fill(80);
  textSize(11);
  text("Press D to open debug panel", width / 2, height - 20);
}

// ------------------------------------------------------------
// drawDebugPanel()
// Shown when debugMode is true (press D to toggle).
// Drawn as a panel at the bottom of the canvas.
// The canvas is always the same size so this always appears
// in the same position regardless of which level is loaded.
// ------------------------------------------------------------
function drawDebugPanel() {
  fill(0, 0, 0, 200);
  noStroke();
  rect(0, height - 80, width, 80);

  fill(255, 220, 50);
  textSize(11);
  textAlign(LEFT);
  text("DEBUG MODE (D to close)", 12, height - 62);

  let buttons = [
    { label: "S: Start", x: 12 },
    { label: "1: Level 1", x: 100 },
    { label: "2: Level 2", x: 200 },
    { label: "3: Level 3", x: 300 },
    { label: "W: Win", x: 400 },
  ];

  for (let i = 0; i < buttons.length; i++) {
    let b = buttons[i];

    fill(60, 60, 90);
    stroke(100, 100, 140);
    strokeWeight(1);
    rect(b.x, height - 50, 88, 34, 4);

    fill(200);
    noStroke();
    textSize(12);
    textAlign(LEFT);
    text(b.label, b.x + 8, height - 28);
  }
}

// ============================================================
// INPUT
// ============================================================

function mousePressed() {
  if (gameState === STATE_START) {
    totalMoves = 0;
    loadLevel(1);
    gameState = STATE_PLAY;
    return;
  }

  if (gameState === STATE_WIN) {
    totalMoves = 0;
    gameState = STATE_START;
    return;
  }

  if (gameState === STATE_PLAY && !checking) {
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      if (card.matched || card.faceUp) continue;

      if (isMouseOverCard(card)) {
        card.faceUp = true;
        flipped.push(i);
        levelMoves++;
        totalMoves++;

        if (flipped.length === 2) {
          let a = cards[flipped[0]];
          let b = cards[flipped[1]];

          if (a.typeIndex === b.typeIndex) {
            a.matched = true;
            b.matched = true;
            flipped = [];
            matchCount++;

            if (matchCount === cardTypes.length) {
              if (currentLevel < MAX_LEVELS) {
                setTimeout(() => {
                  loadLevel(currentLevel + 1);
                }, 800);
              } else {
                gameState = STATE_WIN;
              }
            }
          } else {
            checking = true;
            checkTimer = 50;
          }
        }

        break;
      }
    }
  }
}

// ------------------------------------------------------------
// keyPressed()
// Debug shortcuts — D toggles panel, S/W/1/2/3 jump around.
// ------------------------------------------------------------
function keyPressed() {
  if (key === "d" || key === "D") {
    debugMode = !debugMode;
    return;
  }

  if (key === "s" || key === "S") {
    gameState = STATE_START;
    return;
  }

  if (key === "w" || key === "W") {
    gameState = STATE_WIN;
    return;
  }

  if (key === "1") {
    loadLevel(1);
    gameState = STATE_PLAY;
  }
  if (key === "2") {
    loadLevel(2);
    gameState = STATE_PLAY;
  }
  if (key === "3") {
    loadLevel(3);
    gameState = STATE_PLAY;
  }
}

// ------------------------------------------------------------
// isMouseOverCard(card)
// ------------------------------------------------------------
function isMouseOverCard(card) {
  return (
    mouseX > card.x &&
    mouseX < card.x + CARD_W &&
    mouseY > card.y &&
    mouseY < card.y + CARD_H
  );
}
