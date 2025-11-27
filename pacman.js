// Herní konfigurace
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;

// Herní stav
let score = 0;
let lives = 9;
let gameRunning = false;
let pacman = { x: 14, y: 23, direction: "right", nextDirection: "right", mouthOpen: true };
let ghosts = [];
let dots = [];
let powerPellets = [];
let frightMode = false;
let frightModeTimer = 0;

// Mapa bludiště (1 = zeď, 0 = prázdné, 2 = tečka, 3 = power pellet)
const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
  [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
  [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Inicializace duchů
function initGhosts() {
  ghosts = [
    { x: 13, y: 11, direction: "up", color: "#FF0000", name: "blinky", speed: 1 },
    { x: 14, y: 11, direction: "up", color: "#FFB8FF", name: "pinky", speed: 1 },
    { x: 13, y: 13, direction: "down", color: "#00FFFF", name: "inky", speed: 1 },
    { x: 14, y: 13, direction: "down", color: "#FFB851", name: "clyde", speed: 1 },
  ];
}

// Inicializace teček a power pelletů
function initDots() {
  dots = [];
  powerPellets = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (maze[row][col] === 2) {
        dots.push({ x: col, y: row });
      } else if (maze[row][col] === 3) {
        powerPellets.push({ x: col, y: row });
      }
    }
  }
}

// Vykreslení bludiště
function drawMaze() {
  ctx.strokeStyle = "#0066FF";
  ctx.lineWidth = 2;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (maze[row][col] === 1) {
        ctx.fillStyle = "#0066FF";
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// Vykreslení teček
function drawDots() {
  ctx.fillStyle = "#FFB897";
  dots.forEach((dot) => {
    ctx.beginPath();
    ctx.arc(dot.x * TILE_SIZE + TILE_SIZE / 2, dot.y * TILE_SIZE + TILE_SIZE / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Power pellets
  ctx.fillStyle = "#FFB897";
  powerPellets.forEach((pellet) => {
    ctx.beginPath();
    ctx.arc(pellet.x * TILE_SIZE + TILE_SIZE / 2, pellet.y * TILE_SIZE + TILE_SIZE / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Vykreslení Pac-Mana
function drawPacman() {
  const centerX = pacman.x * TILE_SIZE + TILE_SIZE / 2;
  const centerY = pacman.y * TILE_SIZE + TILE_SIZE / 2;
  const radius = TILE_SIZE / 2 - 2;

  let startAngle, endAngle;
  const mouthAngle = pacman.mouthOpen ? 0.2 : 0;

  switch (pacman.direction) {
    case "right":
      startAngle = mouthAngle;
      endAngle = 2 * Math.PI - mouthAngle;
      break;
    case "left":
      startAngle = Math.PI + mouthAngle;
      endAngle = Math.PI - mouthAngle;
      break;
    case "up":
      startAngle = Math.PI * 1.5 + mouthAngle;
      endAngle = Math.PI * 1.5 - mouthAngle;
      break;
    case "down":
      startAngle = Math.PI * 0.5 + mouthAngle;
      endAngle = Math.PI * 0.5 - mouthAngle;
      break;
  }

  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.lineTo(centerX, centerY);
  ctx.fill();
}

// Vykreslení duchů
function drawGhosts() {
  ghosts.forEach((ghost) => {
    const x = ghost.x * TILE_SIZE;
    const y = ghost.y * TILE_SIZE;

    if (frightMode) {
      ctx.fillStyle = "#0000FF";
    } else {
      ctx.fillStyle = ghost.color;
    }

    // Tělo ducha
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, Math.PI, 0);
    ctx.lineTo(x + TILE_SIZE - 2, y + TILE_SIZE);
    ctx.lineTo(x + TILE_SIZE - 5, y + TILE_SIZE - 3);
    ctx.lineTo(x + TILE_SIZE / 2 + 2, y + TILE_SIZE);
    ctx.lineTo(x + TILE_SIZE / 2 - 2, y + TILE_SIZE - 3);
    ctx.lineTo(x + 5, y + TILE_SIZE);
    ctx.lineTo(x + 2, y + TILE_SIZE);
    ctx.closePath();
    ctx.fill();

    // Oči
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x + 5, y + 6, 4, 6);
    ctx.fillRect(x + 11, y + 6, 4, 6);

    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 6, y + 8, 2, 3);
    ctx.fillRect(x + 12, y + 8, 2, 3);
  });
}

// Kontrola kolize
function canMove(x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return maze[y][x] !== 1;
}

// Pohyb Pac-Mana
function movePacman() {
  let newX = pacman.x;
  let newY = pacman.y;

  // Zkusit změnit směr
  switch (pacman.nextDirection) {
    case "right":
      newX++;
      break;
    case "left":
      newX--;
      break;
    case "up":
      newY--;
      break;
    case "down":
      newY++;
      break;
  }

  if (canMove(newX, newY)) {
    pacman.direction = pacman.nextDirection;
    pacman.x = newX;
    pacman.y = newY;
  } else {
    // Pokračovat v aktuálním směru
    newX = pacman.x;
    newY = pacman.y;
    switch (pacman.direction) {
      case "right":
        newX++;
        break;
      case "left":
        newX--;
        break;
      case "up":
        newY--;
        break;
      case "down":
        newY++;
        break;
    }
    if (canMove(newX, newY)) {
      pacman.x = newX;
      pacman.y = newY;
    }
  }

  // Teleport na druhou stranu
  if (pacman.x < 0) pacman.x = COLS - 1;
  if (pacman.x >= COLS) pacman.x = 0;

  // Animace úst
  pacman.mouthOpen = !pacman.mouthOpen;
}

// Pohyb duchů
function moveGhosts() {
  ghosts.forEach((ghost) => {
    const directions = ["up", "down", "left", "right"];
    const possibleDirections = [];

    directions.forEach((dir) => {
      let newX = ghost.x;
      let newY = ghost.y;

      switch (dir) {
        case "right":
          newX++;
          break;
        case "left":
          newX--;
          break;
        case "up":
          newY--;
          break;
        case "down":
          newY++;
          break;
      }

      if (canMove(newX, newY)) {
        possibleDirections.push(dir);
      }
    });

    if (possibleDirections.length > 0) {
      if (frightMode) {
        // Náhodný pohyb v frightMode
        ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      } else {
        // Jednoduchá AI - náhodný pohyb s preferencí k Pac-Manovi
        if (Math.random() < 0.7) {
          const dx = pacman.x - ghost.x;
          const dy = pacman.y - ghost.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            const preferredDir = dx > 0 ? "right" : "left";
            if (possibleDirections.includes(preferredDir)) {
              ghost.direction = preferredDir;
            } else {
              ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            }
          } else {
            const preferredDir = dy > 0 ? "down" : "up";
            if (possibleDirections.includes(preferredDir)) {
              ghost.direction = preferredDir;
            } else {
              ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            }
          }
        } else {
          ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
      }
    }

    switch (ghost.direction) {
      case "right":
        ghost.x++;
        break;
      case "left":
        ghost.x--;
        break;
      case "up":
        ghost.y--;
        break;
      case "down":
        ghost.y++;
        break;
    }
  });
}

// Kontrola kolizí s tečkami
function checkDotCollision() {
  for (let i = dots.length - 1; i >= 0; i--) {
    if (dots[i].x === pacman.x && dots[i].y === pacman.y) {
      dots.splice(i, 1);
      score += 10;
      updateScore();
    }
  }

  for (let i = powerPellets.length - 1; i >= 0; i--) {
    if (powerPellets[i].x === pacman.x && powerPellets[i].y === pacman.y) {
      powerPellets.splice(i, 1);
      score += 50;
      updateScore();
      activateFrightMode();
    }
  }

  // Výhra - všechny tečky sesbírány
  if (dots.length === 0 && powerPellets.length === 0) {
    alert("Gratulujeme! Vyhrál jste!");
    resetGame();
  }
}

// Aktivace fright módu
function activateFrightMode() {
  frightMode = true;
  frightModeTimer = 100; // 100 framů (asi 5 sekund)
}

// Kontrola kolizí s duchy
function checkGhostCollision() {
  ghosts.forEach((ghost, index) => {
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      if (frightMode) {
        // Sněz ducha
        score += 200;
        updateScore();
        // Reset pozice ducha
        ghost.x = 13 + (index % 2);
        ghost.y = 11 + Math.floor(index / 2);
      } else {
        // Ztráta života
        lives--;
        updateLives();
        if (lives <= 0) {
          gameOver();
        } else {
          resetPositions();
        }
      }
    }
  });
}

// Reset pozic
function resetPositions() {
  pacman.x = 14;
  pacman.y = 23;
  pacman.direction = "right";
  pacman.nextDirection = "right";
  initGhosts();
}

// Aktualizace skóre
function updateScore() {
  document.getElementById("score").textContent = score;
}

// Aktualizace životů
function updateLives() {
  document.getElementById("lives").textContent = lives;
}

// Game over
function gameOver() {
  gameRunning = false;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOver").classList.remove("hidden");
}

// Reset hry
function resetGame() {
  score = 0;
  lives = 3;
  updateScore();
  updateLives();
  resetPositions();
  initDots();
  frightMode = false;
  frightModeTimer = 0;
  document.getElementById("gameOver").classList.add("hidden");
}

// Herní smyčka
function gameLoop() {
  if (!gameRunning) return;

  // Vymazání plátna
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vykreslení
  drawMaze();
  drawDots();
  drawPacman();
  drawGhosts();

  // Pohyb
  movePacman();
  moveGhosts();

  // Kontroly
  checkDotCollision();
  checkGhostCollision();

  // Fright mode timer
  if (frightMode) {
    frightModeTimer--;
    if (frightModeTimer <= 0) {
      frightMode = false;
    }
  }

  setTimeout(gameLoop, 100); // ~10 FPS
}

// Ovládání klávesnicí
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      pacman.nextDirection = "up";
      e.preventDefault();
      break;
    case "ArrowDown":
      pacman.nextDirection = "down";
      e.preventDefault();
      break;
    case "ArrowLeft":
      pacman.nextDirection = "left";
      e.preventDefault();
      break;
    case "ArrowRight":
      pacman.nextDirection = "right";
      e.preventDefault();
      break;
  }
});

// Tlačítka
document.getElementById("startBtn").addEventListener("click", () => {
  if (!gameRunning) {
    resetGame();
    gameRunning = true;
    gameLoop();
  }
});

document.getElementById("restartBtn").addEventListener("click", () => {
  resetGame();
  gameRunning = true;
  gameLoop();
});

// Inicializace
initGhosts();
initDots();

// Vykreslení počátečního stavu
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawMaze();
drawDots();
drawPacman();
drawGhosts();
