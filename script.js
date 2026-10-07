const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const bestScoreElement = document.querySelector('#best-score');
const statusElement = document.querySelector('#status');
const pauseButton = document.querySelector('#pause-button');
const restartButton = document.querySelector('#restart-button');

const gridSize = 20;
const tileSize = canvas.width / gridSize;
let snake;
let food;
let direction;
let nextDirection;
let score;
let isRunning;
let isPaused;
let waitingToStart;
let gameTimer;
let countdownTimer;
let bestScore = Number(localStorage.getItem('cobra-neon-best') || 0);
bestScoreElement.textContent = bestScore;

function startGame(waitForStart = false) {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  waitingToStart = waitForStart;
  isRunning = !waitForStart;
  isPaused = false;
  clearInterval(countdownTimer);
  scoreElement.textContent = score;
  statusElement.textContent = waitForStart ? 'Pressione espaço para iniciar' : 'Colete os pontos';
  pauseButton.textContent = 'II';
  placeFood();
  clearInterval(gameTimer);
  if (isRunning) gameTimer = setInterval(update, 115);
  draw();
}

function beginPreparedGame() {
  if (!waitingToStart) return;
  waitingToStart = false;
  let countdown = 3;
  statusElement.textContent = `Começando em ${countdown}...`;
  countdownTimer = setInterval(() => {
    countdown -= 1;
    if (countdown === 0) {
      clearInterval(countdownTimer);
      isRunning = true;
      statusElement.textContent = 'Colete os pontos';
      gameTimer = setInterval(update, 115);
      return;
    }
    statusElement.textContent = `Começando em ${countdown}...`;
  }, 1000);
}

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function update() {
  if (!isRunning || isPaused) return;
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) {
    endGame();
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreElement.textContent = bestScore;
      localStorage.setItem('cobra-neon-best', bestScore);
    }
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  context.fillStyle = '#e7edda';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(35, 107, 75, .08)';
  for (let line = 1; line < gridSize; line += 1) {
    context.beginPath();
    context.moveTo(line * tileSize, 0);
    context.lineTo(line * tileSize, canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, line * tileSize);
    context.lineTo(canvas.width, line * tileSize);
    context.stroke();
  }
  drawFood();
  snake.forEach((part, index) => {
    context.fillStyle = index === 0 ? '#236b4b' : '#3f9567';
    context.fillRect(part.x * tileSize + 2, part.y * tileSize + 2, tileSize - 4, tileSize - 4);
  });
}

function drawFood() {
  const center = { x: food.x * tileSize + tileSize / 2, y: food.y * tileSize + tileSize / 2 };
  context.fillStyle = '#f07d4f';
  context.beginPath();
  context.arc(center.x, center.y, tileSize * .3, 0, Math.PI * 2);
  context.fill();
}

function endGame() {
  isRunning = false;
  clearInterval(gameTimer);
  statusElement.textContent = `Fim de jogo: ${score} pontos`;
  draw();
  context.fillStyle = 'rgba(24, 34, 30, .72)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#fbfaf5';
  context.textAlign = 'center';
  context.font = '600 30px Space Grotesk, sans-serif';
  context.fillText('Fim de jogo', canvas.width / 2, canvas.height / 2 - 10);
  context.font = '16px DM Mono, monospace';
  context.fillText('Clique em “Novo jogo” para tentar novamente', canvas.width / 2, canvas.height / 2 + 28);
}

function changeDirection(newDirection) {
  const isOpposite = newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;
  if (!isOpposite) nextDirection = newDirection;
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? '▶' : 'II';
  statusElement.textContent = isPaused ? 'Jogo pausado' : 'Colete os pontos';
}

document.addEventListener('keydown', (event) => {
  const directions = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
  };
  if (directions[event.key]) {
    event.preventDefault();
    changeDirection(directions[event.key]);
  }
  if (event.key === ' ') {
    event.preventDefault();
    if (waitingToStart) beginPreparedGame();
    else togglePause();
  }
});

document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => {
    const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    changeDirection(directions[button.dataset.direction]);
  });
});

pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => startGame(true));
startGame();
