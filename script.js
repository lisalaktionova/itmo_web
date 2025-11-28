document.addEventListener("DOMContentLoaded", () => {

const gridSize = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;

const scoreSpan = document.getElementById("score");
const gridContainer = document.getElementById("grid");

// --- Генерация пустого поля ---
function initGrid() {
    grid = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(0));
}

// --- Рендер поля ---
function renderGrid() {
    gridContainer.innerHTML = "";
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.textContent = grid[row][col] !== 0 ? grid[row][col] : "";
            gridContainer.appendChild(tile);
        }
    }
    scoreSpan.textContent = score;
}

// --- Добавление случайной плитки ---
function addRandomTile() {
    const emptyCells = [];

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === 0) emptyCells.push({ r, c });
        }
    }

    if (emptyCells.length === 0) return;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

// --- Стартовые плитки (1–3 штук) ---
function addStartTiles() {
    const howMany = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < howMany; i++) addRandomTile();
}

// --- Сохранение состояния для Undo ---
function saveState() {
    previousGrid = JSON.parse(JSON.stringify(grid));
    previousScore = score;
}

// --- Undo ---
document.getElementById("undo-btn").onclick = () => {
    if (previousGrid) {
        grid = JSON.parse(JSON.stringify(previousGrid));
        score = previousScore;
        renderGrid();
    }
};

// --- Движение строки ---
function moveRowLeft(row) {
    let filtered = row.filter(v => v !== 0);
    let merged = [];

    let i = 0;
    while (i < filtered.length) {
        if (filtered[i] === filtered[i + 1]) {
            merged.push(filtered[i] * 2);
            score += filtered[i] * 2;
            i += 2;
        } else {
            merged.push(filtered[i]);
            i += 1;
        }
    }

    while (merged.length < gridSize) merged.push(0);

    return merged;
}

// --- Поворот матрицы ---
function rotateGrid(times) {
    for (let t = 0; t < times; t++) {
        let newGrid = Array(gridSize)
            .fill(null)
            .map(() => Array(gridSize).fill(0));
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                newGrid[c][gridSize - 1 - r] = grid[r][c];
            }
        }
        grid = newGrid;
    }
}

// --- Движение ---
function move(direction) {
    saveState();

    if (direction === "left") {
        for (let r = 0; r < gridSize; r++) {
            grid[r] = moveRowLeft(grid[r]);
        }
    }
    if (direction === "right") {
        rotateGrid(2);
        for (let r = 0; r < gridSize; r++) {
            grid[r] = moveRowLeft(grid[r]);
        }
        rotateGrid(2);
    }
    if (direction === "up") {
        rotateGrid(3);
        for (let r = 0; r < gridSize; r++) {
            grid[r] = moveRowLeft(grid[r]);
        }
        rotateGrid(1);
    }
    if (direction === "down") {
        rotateGrid(1);
        for (let r = 0; r < gridSize; r++) {
            grid[r] = moveRowLeft(grid[r]);
        }
        rotateGrid(3);
    }

    addRandomTile();
    renderGrid();
    checkGameOver();
}

// --- Проверка на невозможность хода ---
function canMove() {
    for (let r = 0; r < gridSize; r++)
        for (let c = 0; c < gridSize; c++)
            if (grid[r][c] === 0) return true;

    for (let r = 0; r < gridSize; r++)
        for (let c = 0; c < gridSize - 1; c++)
            if (grid[r][c] === grid[r][c + 1]) return true;

    for (let r = 0; r < gridSize - 1; r++)
        for (let c = 0; c < gridSize; c++)
            if (grid[r][c] === grid[r + 1][c]) return true;

    return false;
}

// --- Конец игры ---
function checkGameOver() {
    if (!canMove()) {
        document.getElementById("game-over-modal").classList.remove("hidden");
    }
}

// --- Кнопка "Начать заново" ---
document.getElementById("restart-btn").onclick = startGame;

// --- Закрыть модалку ---
document.getElementById("close-modal-btn").onclick = () => {
    document.getElementById("game-over-modal").classList.add("hidden");
};

// --- Старт игры ---
function startGame() {
    score = 0;
    initGrid();
    addStartTiles();
    renderGrid();
}

startGame();

// --- Управление стрелками ---
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") move("left");
    if (e.key === "ArrowRight") move("right");
    if (e.key === "ArrowUp") move("up");
    if (e.key === "ArrowDown") move("down");
});

}); // конец DOMContentLoaded
