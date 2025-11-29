const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;

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
    const resumeBtn = document.getElementById("resume-btn");
    const leaderboardTable = document.getElementById("leaderboard-table");
    const closeLeadersBtn = document.getElementById("close-leaders-btn");

    function initGrid() {
        grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    }

    function renderGrid() {
        gridContainer.innerHTML = "";
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                const value = grid[r][c];
                if (value !== 0) {
                    tile.textContent = value;
                    tile.classList.add(`tile-${value}`);
                }
                gridContainer.appendChild(tile);
            }
        }
        scoreSpan.textContent = score;
    }

    function addRandomTile() {
        const empty = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return false;
        
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    function addStartTiles() {
        // Добавляем 2 начальные плитки
        addRandomTile();
        addRandomTile();
    }

    function saveState() {
        previousGrid = JSON.parse(JSON.stringify(grid));
        previousScore = score;
    }

    undoBtn.onclick = () => {
        if (previousGrid && !gameOver) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            gameOver = false;
            gameOverModal.classList.add("hidden");
            renderGrid();
        }
    };

    function moveRowLeft(row) {
        // Фильтруем нули
        let arr = row.filter(val => val !== 0);
        let newRow = [];
        let scoreAdd = 0;
        let i = 0;

        while (i < arr.length) {
            if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
                // Слияние одинаковых плиток
                const mergedValue = arr[i] * 2;
                newRow.push(mergedValue);
                scoreAdd += mergedValue;
                i += 2; // Пропускаем следующую плитку, так как она объединилась
            } else {
                newRow.push(arr[i]);
                i += 1;
            }
        }

        // Заполняем оставшиеся позиции нулями
        while (newRow.length < GRID_SIZE) {
            newRow.push(0);
        }

        return { row: newRow, score: scoreAdd };
    }

    function rotateGrid(times) {
        for (let t = 0; t < times; t++) {
            let newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
                }
            }
            grid = newGrid;
        }
    }

    function gridsEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function performMove(direction) {
        const before = JSON.parse(JSON.stringify(grid));
        const beforeScore = score;

        if (direction === "left") {
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
        } else if (direction === "right") {
            rotateGrid(2);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(2);
        } else if (direction === "up") {
            rotateGrid(3);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(1);
        } else if (direction === "down") {
            rotateGrid(1);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(3);
        }

        return !gridsEqual(before, grid) || score !== beforeScore;
    }

    function canMove() {
        // Проверяем есть ли пустые клетки
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) return true;
            }
        }

        // Проверяем возможные слияния по горизонтали
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                if (grid[r][c] === grid[r][c + 1]) return true;
            }
        }

        // Проверяем возможные слияния по вертикали
        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r < GRID_SIZE - 1; r++) {
                if (grid[r][c] === grid[r + 1][c]) return true;
            }
        }

        return false;
    }

    function move(direction) {
        if (gameOver) return;
        
        saveState();
        const moved = performMove(direction);
        
        if (moved) {
            addRandomTile();
            renderGrid();
            
            if (!canMove()) {
                gameOver = true;
                setTimeout(() => {
                    gameOverModal.classList.remove("hidden");
                }, 300);
            }
        }
    }

    // Закрытие таблицы лидеров
    closeLeadersBtn.onclick = () => {
        leaderboardModal.classList.add("hidden");
    };

    leadersBtn.onclick = () => {
        renderLeadersList();
        leaderboardModal.classList.remove("hidden");
    };

    saveScoreBtn.onclick = () => {
        const name = usernameInput.value.trim() || "Аноним";
        const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
        leaders.push({ 
            name, 
            score, 
            date: new Date().toISOString() 
        });
        // Сортируем по убыванию очков и оставляем топ-10
        leaders.sort((a, b) => b.score - a.score);
        localStorage.setItem("leaders", JSON.stringify(leaders.slice(0, 10)));
        
        document.getElementById("game-over-text").textContent = "Ваш рекорд сохранен!";
        usernameInput.style.display = "none";
        saveScoreBtn.style.display = "none";
    };

    resumeBtn.onclick = () => {
        // В данном случае "resume" означает начать заново после проигрыша
        startGame();
    };

    restartBtn.onclick = () => startGame();

    function renderLeadersList() {
        leaderboardTable.innerHTML = "<tr><th>Имя</th><th>Очки</th><th>Дата</th></tr>";
        const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
        
        if (leaders.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='3'>Пока нет рекордов</td>";
            leaderboardTable.appendChild(row);
            return;
        }
        
        leaders.forEach(leader => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${leader.name}</td>
                <td>${leader.score}</td>
                <td>${new Date(leader.date).toLocaleDateString()}</td>
            `;
            leaderboardTable.appendChild(row);
        });
    }

    function startGame() {
        score = 0;
        gameOver = false;
        initGrid();
        addStartTiles();
        previousGrid = null;
        previousScore = 0;
        renderGrid();
        
        // Сбрасываем модальное окно
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        document.getElementById("game-over-text").textContent = "Игра окончена!";
        gameOverModal.classList.add("hidden");
        leaderboardModal.classList.add("hidden");
    }

    // Инициализация игры
    startGame();

    // Обработчики клавиатуры
    document.addEventListener("keydown", e => {
        if (gameOver) return;
        
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            if (e.key === "ArrowLeft") move("left");
            if (e.key === "ArrowRight") move("right");
            if (e.key === "ArrowUp") move("up");
            if (e.key === "ArrowDown") move("down");
        }
    });

    // Свайпы для мобильных устройств
    let startX = 0, startY = 0;
    
    gridContainer.addEventListener("touchstart", e => {
        if (gameOver) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    gridContainer.addEventListener("touchend", e => {
        if (gameOver) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - startX;
        const dy = endY - startY;
        const minSwipeDistance = 30;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
            // Горизонтальный свайп
            if (dx > 0) move("right");
            else move("left");
        } else if (Math.abs(dy) > minSwipeDistance) {
            // Вертикальный свайп
            if (dy > 0) move("down");
            else move("up");
        }
    });
});