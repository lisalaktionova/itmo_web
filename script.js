const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    
    const scoreSpan = document.getElementById("score");
    const gridContainer = document.getElementById("grid");
    const undoBtn = document.getElementById("undo-btn");
    const restartBtn = document.getElementById("restart-btn");
    const leadersBtn = document.getElementById("leaders-btn");
    const gameOverModal = document.getElementById("game-over-modal");
    
    // Проверяем, что элементы найдены
    if (!gridContainer) {
        console.error("Элемент #grid не найден!");
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
        
        // Добавляем 2 начальные плитки
        addRandomTile();
        addRandomTile();
        
        // Рендерим сетку
        renderGrid();
        
        console.log("Игра инициализирована");
    }
    
    function renderGrid() {
        console.log("Рендеринг сетки...");
        
        // Очищаем контейнер
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }
        
        // Применяем стили к контейнеру сетки
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
        gridContainer.style.gridTemplateRows = "repeat(4, 1fr)";
        gridContainer.style.gap = "10px";
        gridContainer.style.backgroundColor = "#bbada0";
        gridContainer.style.borderRadius = "6px";
        gridContainer.style.padding = "10px";
        gridContainer.style.width = "320px";
        gridContainer.style.height = "320px";
        gridContainer.style.boxSizing = "border-box";
        
        // Создаем 16 плиток
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                
                // Базовые стили плитки
                tile.style.display = "flex";
                tile.style.justifyContent = "center";
                tile.style.alignItems = "center";
                tile.style.fontSize = "24px";
                tile.style.fontWeight = "bold";
                tile.style.borderRadius = "4px";
                tile.style.backgroundColor = "#cdc1b4";
                tile.style.color = "#776e65";
                
                const value = grid[r][c];
                if (value !== 0) {
                    tile.textContent = value;
                    
                    // Устанавливаем цвета в зависимости от значения
                    updateTileColor(tile, value);
                }
                
                gridContainer.appendChild(tile);
            }
        }
        
        // Обновляем счет
        if (scoreSpan) {
            scoreSpan.textContent = score;
        }
        
        console.log("Сетка отрендерена");
    }
    
    function updateTileColor(tile, value) {
        // Сбрасываем все возможные классы
        tile.className = "tile";
        
        if (value === 2) {
            tile.style.backgroundColor = "#eee4da";
        } else if (value === 4) {
            tile.style.backgroundColor = "#ede0c8";
        } else if (value === 8) {
            tile.style.backgroundColor = "#f2b179";
            tile.style.color = "#f9f6f2";
        } else if (value === 16) {
            tile.style.backgroundColor = "#f59563";
            tile.style.color = "#f9f6f2";
        } else if (value === 32) {
            tile.style.backgroundColor = "#f67c5f";
            tile.style.color = "#f9f6f2";
        } else if (value === 64) {
            tile.style.backgroundColor = "#f65e3b";
            tile.style.color = "#f9f6f2";
        } else if (value === 128) {
            tile.style.backgroundColor = "#edcf72";
            tile.style.color = "#f9f6f2";
            tile.style.fontSize = "20px";
        } else if (value === 256) {
            tile.style.backgroundColor = "#edcc61";
            tile.style.color = "#f9f6f2";
            tile.style.fontSize = "20px";
        } else if (value === 512) {
            tile.style.backgroundColor = "#edc850";
            tile.style.color = "#f9f6f2";
            tile.style.fontSize = "20px";
        } else if (value === 1024) {
            tile.style.backgroundColor = "#edc53f";
            tile.style.color = "#f9f6f2";
            tile.style.fontSize = "18px";
        } else if (value === 2048) {
            tile.style.backgroundColor = "#edc22e";
            tile.style.color = "#f9f6f2";
            tile.style.fontSize = "18px";
        } else {
            tile.style.backgroundColor = "#cdc1b4";
            tile.style.color = "#776e65";
            tile.style.fontSize = "24px";
        }
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
    
    function saveState() {
        previousGrid = JSON.parse(JSON.stringify(grid));
        previousScore = score;
    }
    
    // ЛОГИКА ДВИЖЕНИЯ
    
    function moveRowLeft(row) {
        // Убираем нули
        let filtered = row.filter(val => val !== 0);
        let result = [];
        let scoreAdd = 0;
        
        // Объединяем одинаковые плитки
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                result.push(filtered[i] * 2);
                scoreAdd += filtered[i] * 2;
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
        // Вращаем сетку (для движения вверх/вниз/вправо)
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
        let moved = false;
        const beforeScore = score;
        
        saveState();
        
        if (direction === "left") {
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (JSON.stringify(grid[r]) !== JSON.stringify(result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
        } 
        else if (direction === "right") {
            rotateGrid(2); // Поворачиваем 180 градусов
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (JSON.stringify(grid[r]) !== JSON.stringify(result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(2); // Возвращаем обратно
        }
        else if (direction === "up") {
            rotateGrid(1); // Поворачиваем на 90 градусов против часовой
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (JSON.stringify(grid[r]) !== JSON.stringify(result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(3); // Возвращаем обратно (поворачиваем на 270 по часовой)
        }
        else if (direction === "down") {
            rotateGrid(3); // Поворачиваем на 270 градусов против часовой (90 по часовой)
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (JSON.stringify(grid[r]) !== JSON.stringify(result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(1); // Возвращаем обратно
        }
        
        return moved || score !== beforeScore;
    }
    
    function move(direction) {
        console.log(`Движение: ${direction}`);
        
        const moved = performMove(direction);
        
        if (moved) {
            addRandomTile();
            renderGrid();
            checkGameOver();
        } else {
            console.log("Нет возможных ходов в этом направлении");
        }
    }
    
    function checkGameOver() {
        // Проверяем, есть ли пустые клетки
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) return false; // Есть пустые клетки - игра продолжается
            }
        }
        
        // Проверяем возможные слияния
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                if (grid[r][c] === grid[r][c + 1]) return false; // Можно слить по горизонтали
            }
        }
        
        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r < GRID_SIZE - 1; r++) {
                if (grid[r][c] === grid[r + 1][c]) return false; // Можно слить по вертикали
            }
        }
        
        // Игра окончена
        console.log("Игра окончена!");
        if (gameOverModal) {
            gameOverModal.classList.remove("hidden");
        }
        return true;
    }
    
    // ОБРАБОТЧИКИ СОБЫТИЙ
    
    document.addEventListener("keydown", (e) => {
        console.log("Нажата клавиша:", e.key);
        
        // Стрелки
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            move("left");
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            move("right");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move("up");
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            move("down");
        }
    });
    
    undoBtn.addEventListener('click', () => {
        console.log("Отмена хода");
        if (previousGrid) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            renderGrid();
        }
    });
    
    restartBtn.addEventListener('click', () => {
        console.log("Начало новой игры");
        initGame();
        if (gameOverModal) {
            gameOverModal.classList.add("hidden");
        }
    });
    
    leadersBtn.addEventListener('click', () => {
        console.log("Показать таблицу лидеров");
        // Здесь будет логика лидерборда
    });
    
    // Выводим сообщение в консоль при успешной загрузке
    console.log("Игра 2048 успешно загружена! Используйте стрелки для управления.");
});
