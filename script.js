const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    
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
    
    // Проверяем, что элементы найдены
    if (!gridContainer) {
        console.error("Элемент #grid не найден!");
        return;
    }
    
    console.log("Grid container found:", gridContainer);
    
    // Инициализация игры
    initGame();
    
    function initGame() {
        console.log("Инициализация игры...");
        
        // Создаем пустую сетку 4x4
        grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid.push(Array(GRID_SIZE).fill(0));
        }
        
        score = 0;
        previousGrid = null;
        previousScore = 0;
        gameOver = false;
        
        // Добавляем 2 начальные плитки
        addRandomTile();
        addRandomTile();
        
        // Рендерим сетку
        renderGrid();
        
        // Сбрасываем UI
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        gameOverModal.classList.add("hidden");
        leaderboardModal.classList.add("hidden");
        
        const gameOverText = document.getElementById("game-over-text");
        gameOverText.textContent = "Игра окончена!";
        
        console.log("Игра инициализирована");
    }
    
    function renderGrid() {
        console.log("Рендеринг сетки...");
        
        // Очищаем контейнер БЕЗ innerHTML
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }
        
        // Создаем 16 плиток
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                
                const value = grid[r][c];
                if (value !== 0) {
                    const textNode = document.createTextNode(value.toString());
                    tile.appendChild(textNode);
                    tile.classList.add(`tile-${value}`);
                }
                
                gridContainer.appendChild(tile);
            }
        }
        
        // Обновляем счет
        if (scoreSpan) {
            const scoreText = document.createTextNode(score.toString());
            scoreSpan.innerHTML = '';
            scoreSpan.appendChild(scoreText);
        }
        
        console.log("Сетка отрендерена. Количество плиток:", gridContainer.children.length);
    }
    
    function addRandomTile() {
        // Находим все пустые ячейки
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            // Выбираем случайную пустую ячейку
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { r, c } = emptyCells[randomIndex];
            
            // С вероятностью 90% ставим 2, с 10% - 4
            grid[r][c] = Math.random() < 0.9 ? 2 : 4;
            
            return true;
        }
        
        return false;
    }
    
    function addStartTiles() {
        addRandomTile();
        addRandomTile();
    }
    
    function saveState() {
        if (!gameOver) {
            previousGrid = JSON.parse(JSON.stringify(grid));
            previousScore = score;
        }
    }
    
    undoBtn.addEventListener('click', () => {
        if (previousGrid && !gameOver) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            gameOver = false;
            gameOverModal.classList.add("hidden");
            renderGrid();
        }
    });
    
    // ЛОГИКА ДВИЖЕНИЯ ПЛИТОК
    function moveRowLeft(row) {
        // Убираем нули
        let filtered = row.filter(val => val !== 0);
        let result = [];
        let scoreAdd = 0;
        
        // Объединяем одинаковые плитки
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                result.push(mergedValue);
                scoreAdd += mergedValue;
                i++; // Пропускаем следующую плитку
            } else {
                result.push(filtered[i]);
            }
        }
        
        // Заполняем оставшееся пространство нулями
        while (result.length < GRID_SIZE) {
            result.push(0);
        }
        
        return { row: result, score: scoreAdd };
    }
    
    function rotateGrid(times) {
        // Вращаем сетку на 90 градусов * times
        for (let t = 0; t < times; t++) {
            let newGrid = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                newGrid.push([]);
                for (let j = 0; j < GRID_SIZE; j++) {
                    newGrid[i].push(grid[GRID_SIZE - 1 - j][i]);
                }
            }
            grid = newGrid;
        }
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
            rotateGrid(2); // 180 градусов
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(2); // Возвращаем обратно
        } else if (direction === "up") {
            rotateGrid(1); // 90 градусов против часовой
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(3); // Возвращаем обратно (270 по часовой)
        } else if (direction === "down") {
            rotateGrid(3); // 270 против часовой = 90 по часовой
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(1); // Возвращаем обратно
        }
        
        score = Math.floor(score);
        if (isNaN(score)) {
            score = 0;
        }
        
        return !gridsEqual(before, grid) || score !== beforeScore;
    }
    
    function gridsEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    
    function canMove() {
        // Проверяем, есть ли пустые клетки
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
        if (gameOver) {
            console.log("Игра окончена, нельзя ходить");
            return;
        }
        
        console.log("Движение:", direction);
        saveState();
        const moved = performMove(direction);
        
        if (moved) {
            console.log("Ход выполнен, добавляем новую плитку");
            addRandomTile();
            renderGrid();
            
            if (!canMove()) {
                gameOver = true;
                console.log("Игра окончена!");
                setTimeout(() => {
                    gameOverModal.classList.remove("hidden");
                }, 300);
            }
        } else {
            console.log("Нет возможных ходов в этом направлении");
        }
    }
    
    // ОБРАБОТЧИКИ КЛАВИАТУРЫ
    document.addEventListener("keydown", (e) => {
        console.log("Клавиша нажата:", e.key);
        
        if (gameOver) return;
        
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            
            if (e.key === "ArrowLeft") {
                console.log("Стрелка влево");
                move("left");
            } else if (e.key === "ArrowRight") {
                console.log("Стрелка вправо");
                move("right");
            } else if (e.key === "ArrowUp") {
                console.log("Стрелка вверх");
                move("up");
            } else if (e.key === "ArrowDown") {
                console.log("Стрелка вниз");
                move("down");
            }
        }
    });
    
    // Лидерборд и другие обработчики
    closeLeadersBtn.addEventListener('click', () => {
        leaderboardModal.classList.add("hidden");
    });
    
    leadersBtn.addEventListener('click', () => {
        renderLeadersList();
        leaderboardModal.classList.remove("hidden");
    });
    
    saveScoreBtn.addEventListener('click', () => {
        const name = usernameInput.value.trim() || "Аноним";
        const leaders = JSON.parse(localStorage.getItem("2048_leaders") || "[]");
        
        const numericScore = parseInt(score) || 0;
        
        leaders.push({ 
            name, 
            score: numericScore, 
            date: new Date().toISOString() 
        });
        
        leaders.sort((a, b) => (parseInt(b.score) || 0) - (parseInt(a.score) || 0));
        localStorage.setItem("2048_leaders", JSON.stringify(leaders.slice(0, 10)));
        
        const gameOverText = document.getElementById("game-over-text");
        gameOverText.textContent = "Ваш рекорд сохранен!";
        
        usernameInput.style.display = "none";
        saveScoreBtn.style.display = "none";
    });
    
    resumeBtn.addEventListener('click', () => {
        initGame();
    });
    
    restartBtn.addEventListener('click', () => {
        console.log("Начало новой игры");
        initGame();
    });
    
    function renderLeadersList() {
        while (leaderboardTable.firstChild) {
            leaderboardTable.removeChild(leaderboardTable.firstChild);
        }
        
        // Создаем заголовок таблицы
        const headerRow = document.createElement("tr");
        
        const placeHeader = document.createElement("th");
        placeHeader.appendChild(document.createTextNode("Место"));
        headerRow.appendChild(placeHeader);
        
        const nameHeader = document.createElement("th");
        nameHeader.appendChild(document.createTextNode("Имя"));
        headerRow.appendChild(nameHeader);
        
        const scoreHeader = document.createElement("th");
        scoreHeader.appendChild(document.createTextNode("Очки"));
        headerRow.appendChild(scoreHeader);
        
        const dateHeader = document.createElement("th");
        dateHeader.appendChild(document.createTextNode("Дата"));
        headerRow.appendChild(dateHeader);
        
        leaderboardTable.appendChild(headerRow);
        
        const leaders = JSON.parse(localStorage.getItem("2048_leaders") || "[]");
        
        if (leaders.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.appendChild(document.createTextNode("Пока нет рекордов"));
            row.appendChild(cell);
            leaderboardTable.appendChild(row);
            return;
        }
        
        leaders.forEach((leader, index) => {
            const row = document.createElement("tr");
            
            const placeCell = document.createElement("td");
            placeCell.appendChild(document.createTextNode((index + 1).toString()));
            row.appendChild(placeCell);
            
            const nameCell = document.createElement("td");
            nameCell.appendChild(document.createTextNode(leader.name));
            row.appendChild(nameCell);
            
            const scoreCell = document.createElement("td");
            scoreCell.appendChild(document.createTextNode((parseInt(leader.score) || 0).toString()));
            row.appendChild(scoreCell);
            
            const dateCell = document.createElement("td");
            dateCell.appendChild(document.createTextNode(new Date(leader.date).toLocaleDateString('ru-RU')));
            row.appendChild(dateCell);
            
            leaderboardTable.appendChild(row);
        });
    }
    
    // Свайпы для мобильных (опционально)
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
            if (dx > 0) move("right");
            else move("left");
        } else if (Math.abs(dy) > minSwipeDistance) {
            if (dy > 0) move("down");
            else move("up");
        }
    });
    
    // Загрузка сохраненной игры
    function loadGameState() {
        const savedState = localStorage.getItem('2048_gameState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                grid = state.grid || [];
                score = parseInt(state.score) || 0;
                previousGrid = state.previousGrid;
                previousScore = parseInt(state.previousScore) || 0;
                gameOver = state.gameOver || false;
                
                if (!Array.isArray(grid) || grid.length !== GRID_SIZE) {
                    throw new Error('Invalid grid data');
                }
                
                if (isNaN(score)) score = 0;
                
                console.log("Загружена сохраненная игра");
                renderGrid();
                
                if (gameOver) {
                    setTimeout(() => {
                        gameOverModal.classList.remove("hidden");
                    }, 100);
                }
                
            } catch (e) {
                console.log('Ошибка загрузки сохраненной игры, начинаем новую');
                initGame();
            }
        } else {
            initGame();
        }
    }
    
    loadGameState();
    
    console.log("Игра 2048 успешно загружена! Используйте стрелки для управления.");
});
