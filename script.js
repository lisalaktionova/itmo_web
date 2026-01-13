const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;
let isAnimating = false;

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

    const upBtn = document.getElementById("up-btn");
    const downBtn = document.getElementById("down-btn");
    const leftBtn = document.getElementById("left-btn");
    const rightBtn = document.getElementById("right-btn");

    // Проверяем, что все элементы найдены
    console.log("Grid container:", gridContainer);
    console.log("Score span:", scoreSpan);

    // Инициализация
    initGame();

    function initGame() {
        console.log("Initializing game...");
        
        score = 0;
        previousScore = 0;
        gameOver = false;
        previousGrid = null;
        isAnimating = false;
        
        initGrid();
        addStartTiles();
        renderGrid();
        
        // Сбрасываем UI
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        gameOverModal.classList.add("hidden");
        leaderboardModal.classList.add("hidden");
        
        const gameOverText = document.getElementById("game-over-text");
        gameOverText.textContent = "Игра окончена!";
        
        console.log("Game initialized");
    }

    function initGrid() {
        grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid.push(Array(GRID_SIZE).fill(0));
        }
        console.log("Grid initialized:", grid);
    }

    function renderGrid() {
        console.log("Rendering grid...");
        
        if (!gridContainer) {
            console.error("Grid container not found!");
            return;
        }
        
        // Очищаем контейнер
        gridContainer.innerHTML = "";
        
        // Устанавливаем стиль для сетки
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
        gridContainer.style.gap = "10px";
        gridContainer.style.backgroundColor = "#bbada0";
        gridContainer.style.borderRadius = "6px";
        gridContainer.style.padding = "10px";
        gridContainer.style.boxSizing = "border-box";
        
        // Создаем плитки
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                
                // Устанавливаем базовые стили
                tile.style.display = "flex";
                tile.style.justifyContent = "center";
                tile.style.alignItems = "center";
                tile.style.fontSize = "24px";
                tile.style.fontWeight = "bold";
                tile.style.borderRadius = "4px";
                tile.style.backgroundColor = "#cdc1b4";
                tile.style.aspectRatio = "1 / 1";
                tile.style.color = "#776e65";
                
                const value = grid[r][c];
                if (value !== 0) {
                    tile.textContent = value.toString();
                    
                    // Цвета для разных значений
                    if (value === 2) tile.style.backgroundColor = "#eee4da";
                    else if (value === 4) tile.style.backgroundColor = "#ede0c8";
                    else if (value === 8) {
                        tile.style.backgroundColor = "#f2b179";
                        tile.style.color = "#f9f6f2";
                    }
                    else if (value === 16) {
                        tile.style.backgroundColor = "#f59563";
                        tile.style.color = "#f9f6f2";
                    }
                    else if (value === 32) {
                        tile.style.backgroundColor = "#f67c5f";
                        tile.style.color = "#f9f6f2";
                    }
                    else if (value === 64) {
                        tile.style.backgroundColor = "#f65e3b";
                        tile.style.color = "#f9f6f2";
                    }
                    else if (value === 128) {
                        tile.style.backgroundColor = "#edcf72";
                        tile.style.color = "#f9f6f2";
                        tile.style.fontSize = "20px";
                    }
                    else if (value === 256) {
                        tile.style.backgroundColor = "#edcc61";
                        tile.style.color = "#f9f6f2";
                        tile.style.fontSize = "20px";
                    }
                    else if (value === 512) {
                        tile.style.backgroundColor = "#edc850";
                        tile.style.color = "#f9f6f2";
                        tile.style.fontSize = "20px";
                    }
                    else if (value === 1024) {
                        tile.style.backgroundColor = "#edc53f";
                        tile.style.color = "#f9f6f2";
                        tile.style.fontSize = "18px";
                    }
                    else if (value === 2048) {
                        tile.style.backgroundColor = "#edc22e";
                        tile.style.color = "#f9f6f2";
                        tile.style.fontSize = "18px";
                    }
                }
                gridContainer.appendChild(tile);
            }
        }
        
        // Обновляем счет
        if (scoreSpan) {
            scoreSpan.textContent = Math.floor(score).toString();
        }
        
        console.log("Grid rendered with", gridContainer.children.length, "tiles");
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
        console.log("Start tiles added");
    }

    function saveState() {
        if (!gameOver && !isAnimating) {
            previousGrid = JSON.parse(JSON.stringify(grid));
            previousScore = score;
        }
    }

    undoBtn.addEventListener('click', () => {
        if (previousGrid && !gameOver && !isAnimating) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            gameOver = false;
            gameOverModal.classList.add("hidden");
            renderGrid();
        }
    });

    function moveRowLeft(row) {
        let arr = row.filter(val => val !== 0);
        let newRow = [];
        let scoreAdd = 0;
        let i = 0;

        while (i < arr.length) {
            if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
                const mergedValue = arr[i] * 2;
                newRow.push(mergedValue);
                scoreAdd += mergedValue;
                i += 2;
            } else {
                newRow.push(arr[i]);
                i += 1;
            }
        }

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

        score = Math.floor(score);
        if (isNaN(score)) score = 0;

        return !gridsEqual(before, grid) || score !== beforeScore;
    }

    function canMove() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) return true;
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                if (grid[r][c] === grid[r][c + 1]) return true;
            }
        }

        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r < GRID_SIZE - 1; r++) {
                if (grid[r][c] === grid[r + 1][c]) return true;
            }
        }

        return false;
    }

    function move(direction) {
        if (gameOver || isAnimating) return;
        
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

    // Остальные функции (setupMobileControls, saveScoreBtn и т.д.) остаются без изменений

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

    restartBtn.addEventListener('click', () => initGame());

    function renderLeadersList() {
        while (leaderboardTable.firstChild) {
            leaderboardTable.removeChild(leaderboardTable.firstChild);
        }
        
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
            row.appendChild(cell);
            leaderboardTable.appendChild(row);
            return;
        }
        
        leaders.forEach((leader, index) => {
            const row = document.createElement("tr");
            
            const placeCell = document.createElement("td");
            placeCell.textContent = (index + 1).toString();
            row.appendChild(placeCell);
            
            const nameCell = document.createElement("td");
            nameCell.textContent = leader.name;
            row.appendChild(nameCell);
            
            const scoreCell = document.createElement("td");
            scoreCell.textContent = (parseInt(leader.score) || 0).toString();
            row.appendChild(scoreCell);
            
            const dateCell = document.createElement("td");
            dateCell.textContent = new Date(leader.date).toLocaleDateString('ru-RU');
            row.appendChild(dateCell);
            
            leaderboardTable.appendChild(row);
        });
    }

    document.addEventListener("keydown", e => {
        if (gameOver || isAnimating) return;
        
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            if (e.key === "ArrowLeft") move("left");
            if (e.key === "ArrowRight") move("right");
            if (e.key === "ArrowUp") move("up");
            if (e.key === "ArrowDown") move("down");
        }
    });

    let startX = 0, startY = 0;
    
    gridContainer.addEventListener("touchstart", e => {
        if (gameOver || isAnimating) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    gridContainer.addEventListener("touchend", e => {
        if (gameOver || isAnimating) return;
        
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

    // Проверяем, есть ли сохраненная игра
    const savedState = localStorage.getItem('2048_gameState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            grid = state.grid || [];
            score = parseInt(state.score) || 0;
            previousGrid = state.previousGrid;
            previousScore = parseInt(state.previousScore) || 0;
            gameOver = state.gameOver || false;
            
            if (Array.isArray(grid) && grid.length === GRID_SIZE) {
                console.log("Loaded saved game");
                renderGrid();
            } else {
                initGame();
            }
        } catch (e) {
            console.log("Invalid saved state, starting new game");
            initGame();
        }
    } else {
        initGame();
    }
});
