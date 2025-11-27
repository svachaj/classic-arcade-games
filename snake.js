// Herní konfigurace
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Herní stav
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gameLoop;

// Obtížnost
const difficulties = {
  easy: 150,
  medium: 100,
  hard: 70,
  extreme: 40,
};

// Inicializace hry
function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  dx = 1;
  dy = 0;
  score = 0;
  updateScore();
  generateFood();
}

// Generování jídla
function generateFood() {
  let validPosition = false;
  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT),
    };

    // Zkontrolovat, že jídlo není na hadovi
    validPosition = !snake.some((segment) => segment.x === food.x && segment.y === food.y);
  }
}

// Vykreslení hada
function drawSnake() {
  snake.forEach((segment, index) => {
    // Gradient pro hlavu
    if (index === 0) {
      const gradient = ctx.createRadialGradient(
        segment.x * GRID_SIZE + GRID_SIZE / 2,
        segment.y * GRID_SIZE + GRID_SIZE / 2,
        2,
        segment.x * GRID_SIZE + GRID_SIZE / 2,
        segment.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2
      );
      gradient.addColorStop(0, "#00ff7f");
      gradient.addColorStop(1, "#00cc66");
      ctx.fillStyle = gradient;
    } else {
      // Gradient pro tělo
      const opacity = 1 - (index / snake.length) * 0.3;
      ctx.fillStyle = `rgba(0, 255, 127, ${opacity})`;
    }

    ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);

    // Oči pro hlavu
    if (index === 0) {
      ctx.fillStyle = "#000";
      const eyeSize = 3;

      if (dx !== 0) {
        // Pohyb vodorovně
        ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE / 2 - eyeSize - 2, segment.y * GRID_SIZE + GRID_SIZE / 3, eyeSize, eyeSize);
        ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE / 2 + 2, segment.y * GRID_SIZE + GRID_SIZE / 3, eyeSize, eyeSize);
      } else {
        // Pohyb svisle
        ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE / 3, segment.y * GRID_SIZE + GRID_SIZE / 2 - eyeSize - 2, eyeSize, eyeSize);
        ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE / 3, segment.y * GRID_SIZE + GRID_SIZE / 2 + 2, eyeSize, eyeSize);
      }
    }
  });
}

// Vykreslení jídla
function drawFood() {
  // Animované jídlo
  const pulse = Math.sin(Date.now() / 200) * 2 + GRID_SIZE / 2;

  const gradient = ctx.createRadialGradient(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    2,
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    pulse
  );
  gradient.addColorStop(0, "#ff0000");
  gradient.addColorStop(0.5, "#ff6600");
  gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Vykreslení mřížky
function drawGrid() {
  ctx.strokeStyle = "rgba(0, 255, 127, 0.1)";
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
}

// Pohyb hada
function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Teleport přes okraje
  if (head.x < 0) head.x = TILE_COUNT - 1;
  if (head.x >= TILE_COUNT) head.x = 0;
  if (head.y < 0) head.y = TILE_COUNT - 1;
  if (head.y >= TILE_COUNT) head.y = 0;

  snake.unshift(head);

  // Kontrola jídla
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    updateScore();
    generateFood();

    // Zvýšení rychlosti po každých 50 bodech
    if (score % 50 === 0) {
      gameSpeed = Math.max(gameSpeed - 5, 30);
      clearInterval(gameLoop);
      if (gameRunning && !gamePaused) {
        gameLoop = setInterval(update, gameSpeed);
      }
    }
  } else {
    snake.pop();
  }

  // Kontrola kolize se sebou
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }
}

// Vykreslení
function draw() {
  // Vymazání plátna
  ctx.fillStyle = "#001a0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawFood();
  drawSnake();
}

// Aktualizace hry
function update() {
  if (!gameRunning || gamePaused) return;

  moveSnake();
  draw();
}

// Aktualizace skóre
function updateScore() {
  document.getElementById("score").textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    document.getElementById("highScore").textContent = highScore;
  }
}

// Game over
function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);

  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOver").classList.remove("hidden");
  document.getElementById("startBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = true;
}

// Start hry
function startGame() {
  initGame();
  gameRunning = true;
  gamePaused = false;

  const difficulty = document.getElementById("difficulty").value;
  gameSpeed = difficulties[difficulty];

  clearInterval(gameLoop);
  gameLoop = setInterval(update, gameSpeed);

  document.getElementById("startBtn").disabled = true;
  document.getElementById("pauseBtn").disabled = false;
  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("difficulty").disabled = true;

  draw();
}

// Pauza
function togglePause() {
  gamePaused = !gamePaused;

  if (gamePaused) {
    clearInterval(gameLoop);
    document.getElementById("pauseBtn").textContent = "Pokračovat";

    // Zobrazit nápis PAUZA
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff7f";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUZA", canvas.width / 2, canvas.height / 2);
  } else {
    gameLoop = setInterval(update, gameSpeed);
    document.getElementById("pauseBtn").textContent = "Pauza";
    draw();
  }
}

// Ovládání klávesnicí
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      if (dy === 0) {
        dx = 0;
        dy = -1;
      }
      e.preventDefault();
      break;
    case "ArrowDown":
    case "s":
    case "S":
      if (dy === 0) {
        dx = 0;
        dy = 1;
      }
      e.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      if (dx === 0) {
        dx = -1;
        dy = 0;
      }
      e.preventDefault();
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (dx === 0) {
        dx = 1;
        dy = 0;
      }
      e.preventDefault();
      break;
    case " ":
    case "p":
    case "P":
      togglePause();
      e.preventDefault();
      break;
  }
});

// Tlačítka
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("restartBtn").addEventListener("click", startGame);

document.getElementById("difficulty").addEventListener("change", () => {
  if (!gameRunning) {
    const difficulty = document.getElementById("difficulty").value;
    gameSpeed = difficulties[difficulty];
  }
});

// Inicializace
document.getElementById("highScore").textContent = highScore;
initGame();
draw();
