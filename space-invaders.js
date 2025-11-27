const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Nastavení velikosti canvasu
canvas.width = 800;
canvas.height = 600;

// Herní proměnné
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let keys = {};

// Hráč
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 40,
  speed: 5,
  color: "#00ff00",
};

// Střely
let bullets = [];
const bulletSpeed = 7;
const bulletWidth = 4;
const bulletHeight = 15;

// Nepřátelé
let aliens = [];
let alienBullets = [];
const alienRows = 4;
const alienCols = 10;
const alienWidth = 40;
const alienHeight = 30;
const alienPadding = 10;
let alienSpeed = 1;
let alienDirection = 1;
let alienShootChance = 0.001;

// Inicializace nepřátel
function createAliens() {
  aliens = [];
  const startX = 50;
  const startY = 50;

  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      aliens.push({
        x: startX + col * (alienWidth + alienPadding),
        y: startY + row * (alienHeight + alienPadding),
        width: alienWidth,
        height: alienHeight,
        alive: true,
        type: row,
      });
    }
  }
}

// Kreslení hráče
function drawPlayer() {
  // Tělo lodi
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Kokpit
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + player.width / 2 - 5, player.y + 10, 10, 10);
}

// Kreslení nepřítele
function drawAlien(alien) {
  if (!alien.alive) return;

  const colors = ["#ff0000", "#ff6600", "#ffff00", "#ff00ff"];
  ctx.fillStyle = colors[alien.type];

  // Tělo nepřítele
  ctx.fillRect(alien.x, alien.y + 10, alien.width, alien.height - 10);

  // Oči
  ctx.fillStyle = "#fff";
  ctx.fillRect(alien.x + 10, alien.y + 15, 8, 8);
  ctx.fillRect(alien.x + alien.width - 18, alien.y + 15, 8, 8);

  // Antény
  ctx.strokeStyle = colors[alien.type];
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(alien.x + 10, alien.y + 10);
  ctx.lineTo(alien.x + 10, alien.y);
  ctx.moveTo(alien.x + alien.width - 10, alien.y + 10);
  ctx.lineTo(alien.x + alien.width - 10, alien.y);
  ctx.stroke();
}

// Kreslení střely
function drawBullet(bullet) {
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
}

// Kreslení střely nepřítele
function drawAlienBullet(bullet) {
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
}

// Pohyb hráče
function movePlayer() {
  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }
}

// Pohyb nepřátel
function moveAliens() {
  let moveDown = false;

  for (let alien of aliens) {
    if (!alien.alive) continue;

    alien.x += alienSpeed * alienDirection;

    if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
      moveDown = true;
    }
  }

  if (moveDown) {
    alienDirection *= -1;
    for (let alien of aliens) {
      if (alien.alive) {
        alien.y += 20;

        // Kontrola, zda nepřátelé dosáhli hráče
        if (alien.y + alien.height >= player.y) {
          gameOver();
        }
      }
    }
  }
}

// Střelba hráče
function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - bulletWidth / 2,
    y: player.y,
    width: bulletWidth,
    height: bulletHeight,
  });
}

// Střelba nepřátel
function alienShoot() {
  for (let alien of aliens) {
    if (alien.alive && Math.random() < alienShootChance) {
      alienBullets.push({
        x: alien.x + alien.width / 2 - bulletWidth / 2,
        y: alien.y + alien.height,
        width: bulletWidth,
        height: bulletHeight,
      });
    }
  }
}

// Aktualizace střel
function updateBullets() {
  // Střely hráče
  bullets = bullets.filter((bullet) => {
    bullet.y -= bulletSpeed;
    return bullet.y > 0;
  });

  // Střely nepřátel
  alienBullets = alienBullets.filter((bullet) => {
    bullet.y += bulletSpeed - 2;
    return bullet.y < canvas.height;
  });
}

// Detekce kolizí
function checkCollisions() {
  // Střely hráče vs nepřátelé
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    for (let alien of aliens) {
      if (!alien.alive) continue;

      if (
        bullet.x < alien.x + alien.width &&
        bullet.x + bullet.width > alien.x &&
        bullet.y < alien.y + alien.height &&
        bullet.y + bullet.height > alien.y
      ) {
        alien.alive = false;
        bullets.splice(i, 1);
        score += (4 - alien.type) * 10;
        updateScore();

        // Kontrola vítězství
        if (aliens.every((a) => !a.alive)) {
          nextLevel();
        }
        break;
      }
    }
  }

  // Střely nepřátel vs hráč
  for (let i = alienBullets.length - 1; i >= 0; i--) {
    const bullet = alienBullets[i];

    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.height > player.y
    ) {
      alienBullets.splice(i, 1);
      lives--;
      updateLives();

      if (lives <= 0) {
        gameOver();
      }
    }
  }
}

// Aktualizace skóre
function updateScore() {
  document.getElementById("score").textContent = score;
}

// Aktualizace životů
function updateLives() {
  document.getElementById("lives").textContent = lives;
}

// Aktualizace levelu
function updateLevel() {
  document.getElementById("level").textContent = level;
}

// Další level
function nextLevel() {
  level++;
  updateLevel();
  alienSpeed += 0.3;
  alienShootChance += 0.0002;
  createAliens();
}

// Game Over
function gameOver() {
  gameRunning = false;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOver").classList.remove("hidden");
}

// Restart hry
function restart() {
  score = 0;
  lives = 3;
  level = 1;
  alienSpeed = 1;
  alienShootChance = 0.001;
  bullets = [];
  alienBullets = [];
  gameRunning = true;

  updateScore();
  updateLives();
  updateLevel();

  createAliens();
  player.x = canvas.width / 2 - 25;

  document.getElementById("gameOver").classList.add("hidden");
  gameLoop();
}

// Hlavní herní smyčka
function gameLoop() {
  if (!gameRunning) return;

  // Vymazání canvasu
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pohyb
  movePlayer();
  moveAliens();
  updateBullets();
  alienShoot();

  // Kreslení
  drawPlayer();
  aliens.forEach(drawAlien);
  bullets.forEach(drawBullet);
  alienBullets.forEach(drawAlienBullet);

  // Kolize
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

// Ovládání klávesnice
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " ") {
    e.preventDefault();
    shoot();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Restart button
document.getElementById("restartBtn").addEventListener("click", restart);

// Spuštění hry
createAliens();
gameLoop();
