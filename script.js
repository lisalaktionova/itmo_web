// script.js
const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;

document.addEventListener("DOMContentLoaded", () => {
    // Элементы
    const scoreSpan = document.getElementById("score");
    const gridContainer = document.getElementById("grid");
    const undoBtn = document.getElementById("undo-btn");
    const restartBtn = document.getElementById("restart-btn");
    const leadersBtn = document.getElementById("leaders-btn");
    const gameOverModal = document.getElementById("game-over-modal");
    const leaderboardModal = document.getElementById("leaderboard-modal");
    const usernameInput = document.getElementById("username");
    const saveScoreBtn = document.getElementById("save-score-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const closeLeadersBtn = document.getElementById("close-leaders-btn");
    const leaderboardTable = document.getElementById("leaderboard-table");

    // Инициализация сетки
    function initGrid() {
        grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    }

    // Рендер сетки
    function renderGrid() {
        gridContainer.innerHTML = "";
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                if (grid[r][c] !== 0) tile.classList.add("tile-" + grid[r][c]);
                tile.textContent = grid[r][c] || "";
                gridContainer.appendChild(tile);
            }
        }
        scoreSpan.textContent = score;
    }

    // Добавление случайной плитки
    function addRandomTile() {
        const empty = [];
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (grid[r][c] === 0) empty.push({ r, c });
        if (!empty.length) return false;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    function addStartTiles() {
        const count = 2; // стандартно 2 плитки
        for (let i = 0; i < count; i++) addRandomTile();
    }

    // Сохранение состояния для undo
    function saveState() {
        previousGrid = JSON.parse(JSON.stringify(grid));
        previousScore = score;
    }

    // Undo
    undoBtn.onclick = () => {
        if (previousGrid) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            renderGrid();
        }
    };

    // Логика движения плиток по строке влево
    function moveRowLeft(row) {
        let arr = row.filter(v => v !== 0);
        let scoreAdd = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                scoreAdd += arr[i];
                arr[i + 1] = 0;
                i++;
            }
        }
        arr = arr.filter(v => v !== 0);
        while (arr.length < GRID_SIZE) arr.push(0);
        score += scoreAdd;
        return arr;
    }

    // Поворот grid (по часовой) times раз
    function rotateGrid(times) {
        for (let t = 0; t < times; t++) {
            let newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
            for (let r = 0; r < GRID_SIZE; r++)
                for (let c = 0; c < GRID_SIZE; c++)
                    newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
            grid = newGrid;
        }
    }

    // Сравнение grid'ов
    function gridsEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // Выполнить ход: возвращает true если поле изменилось (т.е. ход был валидным)
    function performMove(direction) {
        // Сохраняем текущее состояние, чтобы сравнить позже
        const before = JSON.parse(JSON.stringify(grid));
        if (direction === "left") {
            for (let r = 0; r < GRID_SIZE; r++) grid[r] = moveRowLeft(grid[r]);
        } else if (direction === "right") {
            rotateGrid(2);
            for (let r = 0; r < GRID_SIZE; r++) grid[r] = moveRowLeft(grid[r]);
            rotateGrid(2);
        } else if (direction === "up") {
            rotateGrid(3);
            for (let r = 0; r < GRID_SIZE; r++) grid[r] = moveRowLeft(grid[r]);
            rotateGrid(1);
        } else if (direction === "down") {
            rotateGrid(1);
            for (let r = 0; r < GRID_SIZE; r++) grid[r] = moveRowLeft(grid[r]);
            rotateGrid(3);
        }
        return !gridsEqual(before, grid);
    }

    // Основная функция движения — проверяет изменение поля, добавляет плитку и рендерит
    function move(direction) {
        saveState(); // сохранить для undo
        const moved = performMove(direction);
        if (!moved) {
            // Если ничего не двинулось, откатывать state не нужно здесь — previousGrid содержит предыдущее состояние
            return;
        }
        addRandomTile();
        renderGrid();
        // Проверяем конец игры
        if (!canMove()) {
            // показываем модалку через небольшой timeout, чтобы UI успел обновиться
            setTimeout(() => {
                // показываем модалку конца игры
                gameOverModal.classList.remove("hidden");
            }, 50);
        }
    }

    // Проверяет, есть ли возможные ходы
    function canMove() {
        // Пустая клетка
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (grid[r][c] === 0) return true;

        // Горизонтальные слияния
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE - 1; c++)
                if (grid[r][c] === grid[r][c + 1]) return true;

        // Вертикальные слияния
        for (let c = 0; c < GRID_SIZE; c++)
            for (let r = 0; r < GRID_SIZE - 1; r++)
                if (grid[r][c] === grid[r + 1][c]) return true;

        return false;
    }

    // Лидерборд
    function renderLeadersList() {
        leaderboardTable.innerHTML = "";
        const header = document.createElement("tr");
        header.innerHTML = "<th>Имя</th><th>Очки</th><th>Дата</th>";
        leaderboardTable.appendChild(header);
        const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
        if (!leaders.length) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='3'>Пока нет рекордов</td>";
            leaderboardTable.appendChild(row);
            return;
        }
        leaders.forEach(l => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${l.name}</td><td>${l.score}</td><td>${new Date(l.date).toLocaleString()}</td>`;
            leaderboardTable.appendChild(row);
        });
    }

    leadersBtn.onclick = () => { renderLeadersList(); leaderboardModal.classList.remove("hidden"); };
    closeModalBtn.onclick = () => gameOverModal.classList.add("hidden");
    closeLeadersBtn.onclick = () => leaderboardModal.classList.add("hidden");
    restartBtn.onclick = startGame;

    saveScoreBtn.onclick = () => {
        const name = usernameInput.value.trim() || "Аноним";
        const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
        leaders.push({ name, score, date: new Date().toISOString() });
        leaders.sort((a, b) => b.score - a.score);
        localStorage.setItem("leaders", JSON.stringify(leaders.slice(0, 10)));
        document.getElementById("game-over-text").textContent = "Ваш рекорд сохранен!";
        usernameInput.style.display = "none";
        saveScoreBtn.style.display = "none";
        renderLeadersList();
        leaderboardModal.classList.remove("hidden");
        gameOverModal.classList.add("hidden");
    };

    // Старт игры
    function startGame() {
        score = 0;
        initGrid();
        addStartTiles();
        // Сброс undo
        previousGrid = null;
        previousScore = 0;
        renderGrid();
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        gameOverModal.classList.add("hidden");
    }

    startGame();

    // Клавиши
    document.addEventListener("keydown", (e) => {
        if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
            e.preventDefault();
        }
        if (e.key === "ArrowLeft") move("left");
        if (e.key === "ArrowRight") move("right");
        if (e.key === "ArrowUp") move("up");
        if (e.key === "ArrowDown") move("down");
    });

    // Свайпы
    let startX = 0, startY = 0;
    gridContainer.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, {passive: true});
    gridContainer.addEventListener("touchend", e => {
        let dx = e.changedTouches[0].clientX - startX;
        let dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 20) move("right");
            else if (dx < -20) move("left");
        } else {
            if (dy > 20) move("down");
            else if (dy < -20) move("up");
        }
    });
});
