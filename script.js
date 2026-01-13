const GRID_SIZE = 4;
let grid = [];
let score = 0;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    
    const scoreSpan = document.getElementById("score");
    const gridContainer = document.getElementById("grid");
    const undoBtn = document.getElementById("undo-btn");
    const restartBtn = document.getElementById("restart-btn");
    const leadersBtn = document.getElementById("leaders-btn");
    
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
                    }
                }
                
                gridContainer.appendChild(tile);
                console.log(`Создана плитка [${r},${c}] = ${value}`);
            }
        }
        
        // Обновляем счет
        if (scoreSpan) {
            scoreSpan.textContent = score;
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
    
    // Обработчики кнопок
    restartBtn.addEventListener('click', () => {
        console.log("Начало новой игры");
        initGame();
    });
    
    undoBtn.addEventListener('click', () => {
        console.log("Отмена хода");
        // Здесь будет логика отмены
    });
    
    leadersBtn.addEventListener('click', () => {
        console.log("Показать таблицу лидеров");
        // Здесь будет логика лидерборда
    });
    
    // Выводим сообщение в консоль при успешной загрузке
    console.log("Игра 2048 успешно загружена!");
});
