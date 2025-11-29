const GRID_SIZE = 4;
let grid = [];
let score = 0;

let previousGrid = null;
let previousScore = 0;

document.addEventListener("DOMContentLoaded", () => {
    const scoreSpan = document.getElementById("score");
    const gridContainer = document.getElementById("grid");
    const undoBtn = document.getElementById("undo-btn");
    const restartBtn = document.getElementById("restart-btn");
    const leadersBtn = document.getElementById("leaders-btn");

    const gameOverModal = document.getElementById("game-over-modal");
    const leaderboardModal = document.getElementById("leaderboard-modal");

    const usernameInput = document.getElementById("username");
    const saveScoreBtn = document.getElementById("save-score-btn");
    const restartFromLeaders = document.getElementById("restart-btn-2");

    const leaderboardTable = document.getElementById("leaderboard-table");

    /* ---------------- ИНИЦ ---------------- */

    function initGrid() {
        grid = Array(GRID_SIZE)
            .fill()
            .map(() => Array(GRID_SIZE).fill(0));
    }

    function renderGrid(animations = {}) {
        gridContainer.innerHTML = "";

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";

                const value = grid[r][c];
                if (value) {
                    tile.classList.add("tile-" + value);
                    tile.textContent = value;

                    // анимация появления
                    if (animations.new && animations.new.some(t => t.r === r && t.c === c)) {
                        tile.classList.add("tile-new");
                    }

                    // анимация слияния
                    if (animations.merged && animations.merged.some(t => t.r === r && t.c === c)) {
                        tile.classList.add("tile-merged");
                    }
                }

                gridContainer.appendChild(tile);
            }
        }

        scoreSpan.textContent = score;
    }

    /* ---------------- СЛУЧАЙНАЯ ПЛИТКА ---------------- */

    function addRandomTile(animations) {
        const empty = [];
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (grid[r][c] === 0) empty.push({ r, c });

        if (empty.length === 0) return;

        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;

        animations.new.push({ r, c });
    }

    /* ---------------- UNDO ---------------- */

    function saveState() {
        previousGrid = JSON.parse(JSON.stringify(grid));
        previousScore = score;
    }

    undoBtn.onclick = () => {
        if (previousGrid) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            renderGrid();
        }
    };

    /* ---------------- ЛОГИКА ДВИЖЕНИЯ ---------------- */

    function moveRowLeft(row, mergedCoords, rowIndex) {
        let arr = row.filter(v => v !== 0);
        let scoreAdd = 0;

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                scoreAdd += arr[i];

                mergedCoords.push({ r: rowIndex, c: i });
                arr[i + 1] = 0;
                i++;
            }
        }

        arr = arr.filter(v => v !== 0);
        while (arr.length < GRID_SIZE) arr.push(0);

        score += scoreAdd;
        return arr;
    }

    function rotateGrid(times) {
        for (let t = 0; t < times; t++) {
            let newGrid = Array(GRID_SIZE)
                .fill()
                .map(() => Array(GRID_SIZE).fill(0));

            for (let r = 0; r < GRID_SIZE; r++)
                for (let c = 0; c < GRID_SIZE; c++)
                    newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];

            grid = newGrid;
        }
    }

    function gridsEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function performMove(direction, animations) {
        const before = JSON.parse(JSON.stringify(grid));
        const merged = [];

        if (direction === "left") {
            for (let r = 0; r < GRID_SIZE; r++)
                grid[r] = moveRowLeft(grid[r], merged, r);

        } else if (direction === "right") {
            rotateGrid(2);
            for (let r = 0; r < GRID_SIZE; r++)
                grid[r] = moveRowLeft(grid[r], merged, r);
            rotateGrid(2);

        } else if (direction === "up") {
            rotateGrid(3);
            for (let r = 0; r < GRID_SIZE; r++)
                grid[r] = moveRowLeft(grid[r], merged, r);
            rotateGrid(1);

        } else if (direction === "down") {
            rotateGrid(1);
            for (let r = 0; r < GRID_SIZE; r++)
                grid[r] = moveRowLeft(grid[r], merged, r);
            rotateGrid(3);
        }

        animations.merged = merged;

        return !gridsEqual(before, grid);
    }

    /* ---------------- ПРОВЕРКА ХОДОВ ---------------- */

    function canMove() {
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (grid[r][c] === 0) return true;

        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE - 1; c++)
                if (grid[r][c] === grid[r][c + 1]) return true;

        for (let c = 0; c < GRID_SIZE; c++)
            for (let r = 0; r < GRID_SIZE - 1; r++)
                if (grid[r][c] === grid[r + 1][c]) return true;

        return false;
    }

    function move(direction) {
        const animations = { new: [], merged: [] };

        saveState();

        const moved = performMove(direction, animations);
        if (!moved) return;

        addRandomTile(animations);
        renderGrid(animations);

        if (!canMove()) {
            setTimeout(() => gameOverModal.classList.remove("hidden"), 150);
        }
    }

    /* ---------------- ЛИДЕРБОРД ---------------- */

    function renderLeaders() {
        leaderboardTable.innerHTML = `
            <tr><th>Имя</th><th>Очки</th><th>Дата</th></tr>
        `;

        const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");

        if (!leaders.length) {
            leaderboardTable.innerHTML += "<tr><td colspan='3'>Нет рекордов</td></tr>";
            return;
        }

        leaders.forEach(l => {
            leaderboardTable.innerHTML += `
                <tr>
                    <td>${l.name}</td>
                    <td>${l.score}</td>
                    <td>${new Date(l.date).toLocaleString()}</td>
                </tr>
            `;
        });
    }

    leadersBtn.onclick = () => {
        renderLeaders();
        leaderboardModal.classList.remove("hidden");
    };

    restartFromLeaders.onclick = () => {
        leaderboardModal.classList.add("hidden");
    };

    saveScoreBtn.onclick = () => {
        const name = usernameInput.value.trim() || "Аноним";

        const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
        leaders.push({ name, score, date: new Date().toISOString() });
        leaders.sort((a, b) => b.score - a.score);

        localStorage.setItem("leaders", JSON.stringify(leaders.slice(0, 10)));

        leaderboardModal.classList.remove("hidden");
        gameOverModal.classList.add("hidden");
    };

    /* ---------------- СТАРТ ---------------- */

    function startGame() {
        score = 0;
        initGrid();

        const animations = { new: [], merged: [] };
        addRandomTile(animations);
        addRandomTile(animations);

        previousGrid = null;
        previousScore = 0;

        renderGrid(animations);
        usernameInput.value = "";
        usernameInput.style.display = "block";
    }

    restartBtn.onclick = startGame;

    startGame();

    /* ---------------- КЛАВИАТУРА ---------------- */

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") move("left");
        if (e.key === "ArrowRight") move("right");
        if (e.key === "ArrowUp") move("up");
        if (e.key === "ArrowDown") move("down");
    });

    /* ---------------- СВАЙПЫ ---------------- */

    let startX = 0, startY = 0;

    gridContainer.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    gridContainer.addEventListener("touchend", e => {
        let dx = e.changedTouches[0].clientX - startX;
        let dy = e.changedTouches[0].clientY - startY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) move("right");
            else if (dx < -30) move("left");
        } else {
            if (dy > 30) move("down");
            else if (dy < -30) move("up");
        }
    });
});


