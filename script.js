const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");  // 只保留一個 startBtn
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const nameInput = document.getElementById("nameInput");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreDisplay = document.getElementById("finalScore");
const leaderboardDisplay = document.getElementById("leaderboard");
const restartBtn = document.getElementById("restartBtn");

let gridSize = 20;
let snake = [];
let dx = 1,
    dy = 0;
let food;
let timer;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let speed = 150;
const emojis = ['💋', '👙', '🍑', '💖'];
const emojiScores = {
    '💋': 1,
    '👙': 5,
    '🍑': 10,
    '💖': 20
};
let playerName = ""; // 儲存玩家名稱

highScoreDisplay.textContent = highScore;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

startBtn.addEventListener('click', () => {  // 修改這裡
    if (playerName) {
        nameInput.style.display = 'none';
        startBtn.style.display = 'none';
        startGame();
    } else {
        playerName = document.getElementById("playerName").value.trim();
        if (playerName) {
            nameInput.style.display = 'none';
            startBtn.style.display = 'none';
            startGame();
        } else {
            alert("請輸入玩家名稱！");
        }
    }
});

function startGame() {
    score = 0;
    scoreDisplay.textContent = score;
    snake = [{
        x: 10,
        y: 10
    }];
    dx = 1;
    dy = 0;
    food = randomFood();
    clearInterval(timer);
    timer = setInterval(gameLoop, speed);
}

function gameLoop() {
    moveSnake();

    if (checkCollision()) {
        gameOver();
        return;
    }

    if (eatFood()) {
        snake.push({});
        food = randomFood();
        changeBackground(score);
    }

    drawGame();
}

function moveSnake() {
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    snake.unshift(head);
    snake.pop();
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= Math.floor(canvas.width / gridSize) ||
        head.y < 0 || head.y >= Math.floor(canvas.height / gridSize)) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function eatFood() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        const foodScore = emojiScores[food.emoji] || 1;
        score += foodScore;
        scoreDisplay.textContent = score;
        return true;
    }
    return false;
}

function randomFood() {
    const tilesX = Math.floor(canvas.width / gridSize);
    const tilesY = Math.floor(canvas.height / gridSize);
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tilesX),
            y: Math.floor(Math.random() * tilesY),
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function drawGame() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${gridSize - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "white" : "hotpink";
        ctx.fillText(i === 0 ? "🍆" : "🟪",
            snake[i].x * gridSize + gridSize / 2,
            snake[i].y * gridSize + gridSize / 2);
    }

    ctx.fillStyle = "red";
    ctx.fillText(food.emoji,
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2);
}

function changeBackground(score) {
    let color1 = `hsl(${score * 10 % 360}, 70%, 40%)`;
    let color2 = `hsl(${(score * 10 + 100) % 360}, 70%, 40%)`;
    document.body.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
}

function gameOver() {
    clearInterval(timer);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
    showLeaderboard(); // 顯示排行榜

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = highScore;
    }

    startBtn.textContent = "再來一次";  // 修改這裡
    startBtn.style.display = 'block';
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dy === 0) {
        dx = 0;
        dy = -1;
    } else if (e.key === 'ArrowDown' && dy === 0) {
        dx = 0;
        dy = 1;
    } else if (e.key === 'ArrowLeft' && dx === 0) {
        dx = -1;
        dy = 0;
    } else if (e.key === 'ArrowRight' && dx === 0) {
        dx = 1;
        dy = 0;
    }
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startBtn.textContent = "開始遊戲"; // 修改這裡
    nameInput.style.display = 'block'; // 顯示名稱輸入框
    playerName = ""; // 清空玩家名稱
});

function showLeaderboard() {
    // 這裡先簡單顯示本地端最高分，後續可替換成從伺服器獲取排行榜
    leaderboardDisplay.innerHTML = `
        <h2>排行榜 (本地端)</h2>
        <ul>
            <li>${playerName}: ${score} 分 (你的分數)</li>
            <li>最高分: ${highScore} 分</li>
        </ul>
    `;
}
