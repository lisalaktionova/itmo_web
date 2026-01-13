const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    
    const scoreSpan = document.getElementById("score");
    const gameContainer = document.getElementById("game-container");
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
    const finalScoreSpan = document.getElementById("final-score");
    
    // Мобильные кнопки управления
    const upBtn = document.getElementById("up-btn");
    const downBtn = document.getElementById("down-btn");
    const leftBtn = document.getElementById("left-btn");
    const rightBtn = document.getElementById("right-btn");
    
    // Проверяем, что элементы найдены
    if (!gameContainer) {
        console.error("Элемент #game-container не найден!");
        return;
    }
    
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
        
        // Очищаем контейнер
        gameContainer.innerHTML = '';
        
        // Создаем сетку 4x4
        const gridElement = document.createElement("div");
        gridElement.id = "grid";
        gridElement.className = "grid";
        
        // Создаем 16 ячеек
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                // Создаем контейнер для плитки внутри ячейки
                const tileContainer = document.createElement("div");
                tileContainer.className = "tile-container";
                cell.appendChild(tileContainer);
                
                gridElement.appendChild(cell);
            }
        }
        
        gameContainer.appendChild(gridElement);
        
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
        
        // Сохраняем начальное состояние
        saveGameState();
        
        console.log("Игра инициализирована");
    }
    
    function renderGrid() {
        console.log("Рендеринг сетки...");
        
        // Обновляем счет
        if (scoreSpan) {
            scoreSpan.textContent = score;
        }
        
        // Очищаем все плитки
        document.querySelectorAll('.tile').forEach(tile => tile.remove());
        
        // Создаем плитки на основе grid
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const value = grid[r][c];
                if (value !== 0) {
                    createTile(r, c, value);
                }
            }
        }
    }
    
    function createTile(row, col, value) {
        // Находим ячейку
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;
        
        const tileContainer = cell.querySelector('.tile-container');
        if (!tileContainer) return;
        
        // Создаем плитку
        const tile = document.createElement("div");
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        tile.dataset.value = value;
        
        // Добавляем класс для анимации появления
        tile.classList.add('new');
        
        tileContainer.appendChild(tile);
        
        // Убираем класс анимации после завершения
        setTimeout(() => {
            tile.classList.remove('new');
        }, 300);
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
            const value = Math.random() < 0.9 ? 2 : 4;
            grid[r][c] = value;
            
            return true;
        }
        
        return false;
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
            saveGameState();
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
                scoreAdd += mergedValue; // Добавляем значение объединенной плитки
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
        // Вращаем сетку на 90 градусов по часовой стрелке * times
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
        let moved = false;
        let scoreAdd = 0;
        
        if (direction === "left") {
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!arraysEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                scoreAdd += result.score;
            }
        } else if (direction === "right") {
            rotateGrid(2); // 180 градусов
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!arraysEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                scoreAdd += result.score;
            }
            rotateGrid(2); // Возвращаем обратно
        } else if (direction === "up") {
            rotateGrid(3); // 270 градусов = 90 градусов против часовой
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!arraysEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                scoreAdd += result.score;
            }
            rotateGrid(1); // Возвращаем обратно
        } else if (direction === "down") {
            rotateGrid(1); // 90 градусов по часовой
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!arraysEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                scoreAdd += result.score;
            }
            rotateGrid(3); // Возвращаем обратно
        }
        
        score += scoreAdd;
        
        return moved || scoreAdd > 0;
    }
    
    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
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
            // Добавляем новую плитку
            addRandomTile();
            
            // Обновляем отображение
            renderGrid();
            
            if (!canMove()) {
                gameOver = true;
                console.log("Игра окончена! Финальный счет:", score);
                if (finalScoreSpan) {
                    finalScoreSpan.textContent = score;
                }
                setTimeout(() => {
                    gameOverModal.classList.remove("hidden");
                }, 300);
            }
            
            // Сохраняем состояние игры
            saveGameState();
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
    
    // Обработчики для мобильных кнопок
    upBtn.addEventListener('click', () => {
        console.log("Кнопка ВВЕРХ");
        move("up");
    });
    
    downBtn.addEventListener('click', () => {
        console.log("Кнопка ВНИЗ");
        move("down");
    });
    
    leftBtn.addEventListener('click', () => {
        console.log("Кнопка ВЛЕВО");
        move("left");
    });
    
    rightBtn.addEventListener('click', () => {
        console.log("Кнопка ВПРАВО");
        move("right");
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
        
        // Сортируем по убыванию очков
        leaders.sort((a, b) => (parseInt(b.score) || 0) - (parseInt(a.score) || 0));
        
        // Берем только топ-10
        const top10 = leaders.slice(0, 10);
        localStorage.setItem("2048_leaders", JSON.stringify(top10));
        
        const gameOverText = document.getElementById("game-over-text");
        gameOverText.textContent = "Ваш рекорд сохранен!";
        
        usernameInput.style.display = "none";
        saveScoreBtn.style.display = "none";
        
        // Обновляем таблицу лидеров
        renderLeadersList();
    });
    
    resumeBtn.addEventListener('click', () => {
        initGame();
    });
    
    restartBtn.addEventListener('click', () => {
        console.log("Начало новой игры");
        initGame();
    });
    
    function renderLeadersList() {
        // Очищаем таблицу
        while (leaderboardTable.firstChild) {
            leaderboardTable.removeChild(leaderboardTable.firstChild);
        }
        
        // Создаем заголовок таблицы
        const headerRow = document.createElement("tr");
        
        const placeHeader = document.createElement("th");
        placeHeader.textContent = "Место";
        headerRow.appendChild(placeHeader);
        
        const nameHeader = document.createElement("th");
        nameHeader.textContent = "Имя";
        headerRow.appendChild(nameHeader);
        
        const scoreHeader = document.createElement("th");
        scoreHeader.textContent = "Очки";
        headerRow.appendChild(scoreHeader);
        
        const dateHeader = document.createElement("th");
        dateHeader.textContent = "Дата";
        headerRow.appendChild(dateHeader);
        
        leaderboardTable.appendChild(headerRow);
        
        const leaders = JSON.parse(localStorage.getItem("2048_leaders") || "[]");
        
        if (leaders.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.textContent = "Пока нет рекордов";
            cell.style.textAlign = "center";
            cell.style.padding = "30px";
            row.appendChild(cell);
            leaderboardTable.appendChild(row);
            return;
        }
        
        leaders.forEach((leader, index) => {
            const row = document.createElement("tr");
            
            const placeCell = document.createElement("td");
            placeCell.textContent = index + 1;
            row.appendChild(placeCell);
            
            const nameCell = document.createElement("td");
            nameCell.textContent = leader.name;
            row.appendChild(nameCell);
            
            const scoreCell = document.createElement("td");
            scoreCell.textContent = leader.score;
            row.appendChild(scoreCell);
            
            const dateCell = document.createElement("td");
            dateCell.textContent = new Date(leader.date).toLocaleDateString('ru-RU');
            row.appendChild(dateCell);
            
            leaderboardTable.appendChild(row);
        });
    }
    
    // Свайпы для мобильных
    let startX = 0, startY = 0;
    
    gameContainer.addEventListener("touchstart", e => {
        if (gameOver) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    gameContainer.addEventListener("touchend", e => {
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
    
    // Сохранение состояния игры
    function saveGameState() {
        const state = {
            grid,
            score,
            previousGrid,
            previousScore,
            gameOver
        };
        localStorage.setItem('2048_gameState', JSON.stringify(state));
    }
    
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
                // Создаем сетку
                initGridStructure();
                renderGrid();
                
                if (gameOver) {
                    if (finalScoreSpan) {
                        finalScoreSpan.textContent = score;
                    }
                    setTimeout(() => {
                        gameOverModal.classList.remove("hidden");
                    }, 100);
                }
                
            } catch (e) {
                console.log('Ошибка загрузки сохраненной игры, начинаем новую:', e);
                initGame();
            }
        } else {
            initGame();
        }
    }
    
    // Создание структуры сетки
    function initGridStructure() {
        gameContainer.innerHTML = '';
        
        // Создаем сетку 4x4
        const gridElement = document.createElement("div");
        gridElement.id = "grid";
        gridElement.className = "grid";
        
        // Создаем 16 ячеек
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                // Создаем контейнер для плитки внутри ячейки
                const tileContainer = document.createElement("div");
                tileContainer.className = "tile-container";
                cell.appendChild(tileContainer);
                
                gridElement.appendChild(cell);
            }
        }
        
        gameContainer.appendChild(gridElement);
    }
    
    loadGameState();
    
    console.log("Игра 2048 успешно загружена! Используйте стрелки для управления.");
});
