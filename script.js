const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;
let movedTiles = []; // Для анимации

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
    const mobileControls = document.getElementById("mobile-controls");

    // Виртуальные кнопки для мобильных
    const upBtn = document.getElementById("up-btn");
    const downBtn = document.getElementById("down-btn");
    const leftBtn = document.getElementById("left-btn");
    const rightBtn = document.getElementById("right-btn");

    // Инициализация
    loadGameState();
    setupMobileControls();

    function initGrid() {
        grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    }

    function renderGrid() {
        gridContainer.innerHTML = "";
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.dataset.row = r;
                tile.dataset.col = c;
                
                const value = grid[r][c];
                if (value !== 0) {
                    tile.textContent = value;
                    tile.classList.add(`tile-${value}`);
                    
                    // Анимация появления новых плиток
                    const isNew = movedTiles.some(t => t.r === r && t.c === c && t.isNew);
                    if (isNew) {
                        tile.classList.add('tile-new');
                        setTimeout(() => tile.classList.remove('tile-new'), 300);
                    }
                    
                    // Анимация слияния
                    const isMerged = movedTiles.some(t => t.r === r && t.c === c && t.merged);
                    if (isMerged) {
                        tile.classList.add('tile-merged');
                        setTimeout(() => tile.classList.remove('tile-merged'), 300);
                    }
                }
                gridContainer.appendChild(tile);
            }
        }
        scoreSpan.textContent = score;
        
        // Сохраняем состояние после рендера
        saveGameState();
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
        
        // Добавляем информацию для анимации
        movedTiles.push({ r, c, value: grid[r][c], isNew: true });
        
        return true;
    }

    function addStartTiles() {
        // Добавляем 2 начальные плитки
        addRandomTile();
        addRandomTile();
        movedTiles = []; // Сбрасываем после начальной генерации
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

    function moveRowLeft(row, rowIndex) {
        // Сохраняем исходные позиции для анимации
        const originalPositions = row.map((val, colIndex) => ({ 
            value: val, 
            from: colIndex 
        }));

        // Фильтруем нули
        let arr = row.filter(val => val !== 0);
        let newRow = [];
        let scoreAdd = 0;
        let i = 0;
        let merged = [];

        while (i < arr.length) {
            if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
                // Слияние одинаковых плиток
                const mergedValue = arr[i] * 2;
                newRow.push(mergedValue);
                scoreAdd += mergedValue;
                merged.push({ from: i, to: newRow.length - 1, value: mergedValue });
                i += 2;
            } else {
                newRow.push(arr[i]);
                i += 1;
            }
        }

        // Заполняем оставшиеся позиции нулями
        while (newRow.length < GRID_SIZE) {
            newRow.push(0);
        }

        // Собираем информацию о перемещениях для анимации
        const movements = [];
        let newCol = 0;
        
        for (let oldCol = 0; oldCol < originalPositions.length; oldCol++) {
            const original = originalPositions[oldCol];
            if (original.value !== 0) {
                // Ищем новую позицию этой плитки
                let found = false;
                for (let j = 0; j < newRow.length; j++) {
                    if (newRow[j] === original.value && !movements.some(m => m.to === j)) {
                        movements.push({
                            from: { r: rowIndex, c: oldCol },
                            to: { r: rowIndex, c: j },
                            value: newRow[j],
                            merged: merged.some(m => m.to === j)
                        });
                        newRow[j] = null; // Помечаем как обработанную
                        found = true;
                        break;
                    }
                }
                // Если не нашли - значит плитка была объединена
                if (!found) {
                    const merge = merged.find(m => m.value === original.value * 2);
                    if (merge) {
                        movements.push({
                            from: { r: rowIndex, c: oldCol },
                            to: { r: rowIndex, c: merge.to },
                            value: merge.value,
                            merged: true
                        });
                    }
                }
            }
        }

        return { row: newRow.filter(val => val !== null), score: scoreAdd, movements };
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
        movedTiles = [];

        if (direction === "left") {
            let allMovements = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r], r);
                grid[r] = result.row;
                score += result.score;
                allMovements = allMovements.concat(result.movements);
            }
            movedTiles = allMovements;
        } else if (direction === "right") {
            rotateGrid(2);
            let allMovements = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r], r);
                grid[r] = result.row;
                score += result.score;
                // Корректируем координаты для анимации
                const correctedMovements = result.movements.map(m => ({
                    from: { r: m.from.r, c: GRID_SIZE - 1 - m.from.c },
                    to: { r: m.to.r, c: GRID_SIZE - 1 - m.to.c },
                    value: m.value,
                    merged: m.merged
                }));
                allMovements = allMovements.concat(correctedMovements);
            }
            rotateGrid(2);
            movedTiles = allMovements;
        } else if (direction === "up") {
            rotateGrid(3);
            let allMovements = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r], r);
                grid[r] = result.row;
                score += result.score;
                // Корректируем координаты для анимации
                const correctedMovements = result.movements.map(m => ({
                    from: { r: m.from.c, c: GRID_SIZE - 1 - m.from.r },
                    to: { r: m.to.c, c: GRID_SIZE - 1 - m.to.r },
                    value: m.value,
                    merged: m.merged
                }));
                allMovements = allMovements.concat(correctedMovements);
            }
            rotateGrid(1);
            movedTiles = allMovements;
        } else if (direction === "down") {
            rotateGrid(1);
            let allMovements = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r], r);
                grid[r] = result.row;
                score += result.score;
                // Корректируем координаты для анимации
                const correctedMovements = result.movements.map(m => ({
                    from: { r: GRID_SIZE - 1 - m.from.c, c: m.from.r },
                    to: { r: GRID_SIZE - 1 - m.to.c, c: m.to.r },
                    value: m.value,
                    merged: m.merged
                }));
                allMovements = allMovements.concat(correctedMovements);
            }
            rotateGrid(3);
            movedTiles = allMovements;
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
                }, 500);
            }
        }
    }

    // Сохранение и загрузка состояния игры
    function saveGameState() {
        const gameState = {
            grid: grid,
            score: score,
            previousGrid: previousGrid,
            previousScore: previousScore,
            gameOver: gameOver
        };
        localStorage.setItem('2048_gameState', JSON.stringify(gameState));
    }

    function loadGameState() {
        const savedState = localStorage.getItem('2048_gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            grid = state.grid || [];
            score = state.score || 0;
            previousGrid = state.previousGrid;
            previousScore = state.previousScore;
            gameOver = state.gameOver || false;
            
            // Если нет сохраненной игры, инициализируем новую
            if (grid.length === 0) {
                initGrid();
                addStartTiles();
            }
        } else {
            initGrid();
            addStartTiles();
        }
        renderGrid();
    }

    // Настройка мобильного управления
    function setupMobileControls() {
        // Показываем/скрываем кнопки управления в зависимости от контекста
        const observer = new MutationObserver(() => {
            const isGameActive = !gameOverModal.classList.contains('hidden') && 
                               !leaderboardModal.classList.contains('hidden');
            mobileControls.style.display = isGameActive ? 'none' : 'grid';
        });

        observer.observe(gameOverModal, { attributes: true, attributeFilter: ['class'] });
        observer.observe(leaderboardModal, { attributes: true, attributeFilter: ['class'] });

        // Обработчики для виртуальных кнопок
        upBtn.onclick = () => move('up');
        downBtn.onclick = () => move('down');
        leftBtn.onclick = () => move('left');
        rightBtn.onclick = () => move('right');
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
        const leaders = JSON.parse(localStorage.getItem("2048_leaders") || "[]");
        leaders.push({ 
            name, 
            score, 
            date: new Date().toISOString() 
        });
        // Сортируем по убыванию очков и оставляем топ-10
        leaders.sort((a, b) => b.score - a.score);
        localStorage.setItem("2048_leaders", JSON.stringify(leaders.slice(0, 10)));
        
        document.getElementById("game-over-text").textContent = "Ваш рекорд сохранен!";
        usernameInput.style.display = "none";
        saveScoreBtn.style.display = "none";
    };

    resumeBtn.onclick = () => {
        startGame();
    };

    restartBtn.onclick = () => startGame();

    function renderLeadersList() {
        leaderboardTable.innerHTML = "<tr><th>Место</th><th>Имя</th><th>Очки</th><th>Дата</th></tr>";
        const leaders = JSON.parse(localStorage.getItem("2048_leaders") || "[]");
        
        if (leaders.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='4'>Пока нет рекордов</td>";
            leaderboardTable.appendChild(row);
            return;
        }
        
        leaders.forEach((leader, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${leader.name}</td>
                <td>${leader.score}</td>
                <td>${new Date(leader.date).toLocaleDateString('ru-RU')}</td>
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
        movedTiles = [];
        renderGrid();
        
        // Сбрасываем модальное окно
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        document.getElementById("game-over-text").textContent = "Игра окончена!";
        gameOverModal.classList.add("hidden");
        leaderboardModal.classList.add("hidden");
        
        // Сохраняем новое состояние
        saveGameState();
    }

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