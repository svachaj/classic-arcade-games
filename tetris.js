const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

// Nastavení canvasu
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = 4 * BLOCK_SIZE;
nextCanvas.height = 4 * BLOCK_SIZE;

// Herní proměnné
let score = 0;
let lines = 0;
let level = 1;
let gameRunning = true;
let isPaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Herní pole
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Tetromino tvary
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
];

const COLORS = [
  "#00f0f0", // I - azurová
  "#f0f000", // O - žlutá
  "#a000f0", // T - fialová
  "#00f000", // S - zelená
  "#f00000", // Z - červená
  "#0000f0", // J - modrá
  "#f0a000", // L - oranžová
];

// Současné tetromino
let currentPiece = {
  shape: [],
  color: "",
  x: 0,
  y: 0,
  type: 0,
};

let nextPiece = {
  shape: [],
  color: "",
  type: 0,
};

// Vytvoření nového tetromina
function createPiece() {
  const type = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[type],
    color: COLORS[type],
    x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
    y: 0,
    type: type,
  };
}

// Inicializace hry
function init() {
  nextPiece = createPiece();
  spawnPiece();
}

// Vytvoření nového padajícího dílu
function spawnPiece() {
  currentPiece = nextPiece;
  currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
  currentPiece.y = 0;
  nextPiece = createPiece();

  if (collision()) {
    gameOver();
  }
}

// Kreslení bloku
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

  // Stínování
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

  // Světlý efekt
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
}

// Kreslení pole
function drawBoard() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mřížka
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * BLOCK_SIZE, 0);
    ctx.lineTo(i * BLOCK_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * BLOCK_SIZE);
    ctx.lineTo(canvas.width, i * BLOCK_SIZE);
    ctx.stroke();
  }

  // Pevné bloky
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        drawBlock(col, row, board[row][col]);
      }
    }
  }
}

// Kreslení současného tetromina
function drawPiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
      }
    });
  });
}

// Kreslení následujícího tetromina
function drawNext() {
  nextCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  const offsetX = (4 - nextPiece.shape[0].length) / 2;
  const offsetY = (4 - nextPiece.shape.length) / 2;

  nextPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        nextCtx.fillStyle = nextPiece.color;
        nextCtx.fillRect((offsetX + x) * BLOCK_SIZE, (offsetY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        nextCtx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        nextCtx.strokeRect((offsetX + x) * BLOCK_SIZE, (offsetY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

// Detekce kolize
function collision() {
  return currentPiece.shape.some((row, dy) => {
    return row.some((value, dx) => {
      if (value) {
        let newX = currentPiece.x + dx;
        let newY = currentPiece.y + dy;
        return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
      }
      return false;
    });
  });
}

// Pohyb dolů
function moveDown() {
  currentPiece.y++;
  if (collision()) {
    currentPiece.y--;
    mergePiece();
    clearLines();
    spawnPiece();
  }
}

// Pohyb do stran
function move(dir) {
  currentPiece.x += dir;
  if (collision()) {
    currentPiece.x -= dir;
  }
}

// Rotace
function rotate() {
  const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse());

  const previousShape = currentPiece.shape;
  currentPiece.shape = rotated;

  // Wall kick - pokus o posunutí pokud se nevejde
  let offset = 0;
  while (collision() && offset < 4) {
    currentPiece.x += offset % 2 === 0 ? offset : -offset;
    offset++;
  }

  if (collision()) {
    currentPiece.shape = previousShape;
  }
}

// Okamžitý pád
function hardDrop() {
  while (!collision()) {
    currentPiece.y++;
  }
  currentPiece.y--;
  mergePiece();
  clearLines();
  spawnPiece();
}

// Sloučení tetromina s polem
function mergePiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const boardY = currentPiece.y + y;
        const boardX = currentPiece.x + x;
        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color;
        }
      }
    });
  });
}

// Mazání řádků
function clearLines() {
  let linesCleared = 0;

  outer: for (let row = ROWS - 1; row >= 0; row--) {
    for (let col = 0; col < COLS; col++) {
      if (!board[row][col]) {
        continue outer;
      }
    }

    // Řádek je plný
    board.splice(row, 1);
    board.unshift(Array(COLS).fill(0));
    linesCleared++;
    row++; // Zkontrolovat stejný řádek znovu
  }

  if (linesCleared > 0) {
    lines += linesCleared;
    score += [0, 100, 300, 500, 800][linesCleared] * level;

    // Zvýšení levelu každých 10 řádků
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 100);

    updateScore();
  }
}

// Aktualizace skóre
function updateScore() {
  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = lines;
  document.getElementById("level").textContent = level;
}

// Game Over
function gameOver() {
  gameRunning = false;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalLines").textContent = lines;
  document.getElementById("gameOver").classList.remove("hidden");
}

// Restart hry
function restart() {
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  gameRunning = true;
  isPaused = false;
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  updateScore();
  document.getElementById("gameOver").classList.add("hidden");

  init();
  lastTime = performance.now();
  gameLoop();
}

// Pauza
function togglePause() {
  isPaused = !isPaused;
  if (!isPaused) {
    lastTime = performance.now();
    gameLoop();
  }
}

// Hlavní herní smyčka
function gameLoop(time = 0) {
  if (!gameRunning || isPaused) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    moveDown();
    dropCounter = 0;
  }

  drawBoard();
  drawPiece();
  drawNext();

  requestAnimationFrame(gameLoop);
}

// Ovládání klávesnice
document.addEventListener("keydown", (e) => {
  if (!gameRunning || isPaused) {
    if (e.key === "p" || e.key === "P") {
      togglePause();
    }
    return;
  }

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      move(-1);
      break;
    case "ArrowRight":
      e.preventDefault();
      move(1);
      break;
    case "ArrowDown":
      e.preventDefault();
      moveDown();
      dropCounter = 0;
      break;
    case "ArrowUp":
      e.preventDefault();
      rotate();
      break;
    case " ":
      e.preventDefault();
      hardDrop();
      break;
    case "p":
    case "P":
      e.preventDefault();
      togglePause();
      break;
  }
});

// Restart button
document.getElementById("restartBtn").addEventListener("click", restart);

// Spuštění hry
init();
lastTime = performance.now();
gameLoop();
