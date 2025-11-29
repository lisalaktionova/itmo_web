const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;
let movedTiles = [];

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

    //инициализация
    initGame();

    function initGame() {
        //полная инициализация с проверками
        score = 0;
        previousScore = 0;
        gameOver = false;
        previousGrid = null;
        movedTiles = [];
        
        initGrid();
        addStartTiles();
        renderGrid();
        
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        gameOverModal.classList.add("hidden");
        leaderboardModal.classList.add("hidden");
        
        const gameOverText = document.getElementById("game-over-text");
        gameOverText.textContent = "Игра окончена!";
    }

    function initGrid() {
        grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid.push(Array(GRID_SIZE).fill(0));
        }
    }

    function renderGrid() {
        //очищаем контейнер
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }
        
        //создаем плитки
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                
                const value = grid[r][c];
                if (value !== 0) {
                    tile.textContent = value.toString();
                    tile.classList.add(`tile-${value}`);
                    
                    //анимации
                    const isNew = movedTiles.some(t => t.r === r && t.c === c && t.isNew);
                    if (isNew) {
                        tile.classList.add('tile-new');
                        setTimeout(() => tile.classList.remove('tile-new'), 300);
                    }
                    
                    const isMerged = movedTiles.some(t => t.r === r && t.c === c && t.merged);
                    if (isMerged) {
                        tile.classList.add('tile-merged');
                        setTimeout(() => tile.classList.remove('tile-merged'), 300);
                    }
                }
                gridContainer.appendChild(tile);
            }
        }
        
        //обновляем счет
        scoreSpan.textContent = Math.floor(score).toString();
        
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
        
        movedTiles.push({ r, c, value: grid[r][c], isNew: true });
        
        return true;
    }

    function addStartTiles() {
        //добавляем 2 начальные плитки
        addRandomTile();
        addRandomTile();
        movedTiles = [];
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

    function moveRowLeft(row) {
        //фильтруем нули
        let arr = row.filter(val => val !== 0);
        let newRow = [];
        let scoreAdd = 0;
        let i = 0;
        while (i < arr.length) {
            if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
                //слияние
                const mergedValue = arr[i] * 2;
                newRow.push(mergedValue);
                scoreAdd += mergedValue;
                i += 2;
            } else {
                newRow.push(arr[i]);
                i += 1;
            }
        }

        //заполняем нулями
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
        movedTiles = [];
        let moved = false;

        if (direction === "left") {
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!gridsEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
        } else if (direction === "right") {
            rotateGrid(2);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!gridsEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(2);
        } else if (direction === "up") {
            rotateGrid(3);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!gridsEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(1);
        } else if (direction === "down") {
            rotateGrid(1);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                if (!gridsEqual(grid[r], result.row)) {
                    moved = true;
                }
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(3);
        }
        score = Math.floor(score);
        if (isNaN(score)) {
            score = 0;
        }

        return moved || score !== beforeScore;
    }

    function canMove() {
        //проверяем пустые клетки
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) return true;
            }
        }

        //проверяем возможные слияния
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
            try {
                const state = JSON.parse(savedState);
                grid = state.grid || [];
                score = parseInt(state.score) || 0;
                previousGrid = state.previousGrid;
                previousScore = parseInt(state.previousScore) || 0;
                gameOver = state.gameOver || false;
                
                //валидация данных
                if (!Array.isArray(grid) || grid.length !== GRID_SIZE) {
                    throw new Error('Invalid grid data');
                }
                if (isNaN(score)) {
                    score = 0;
                } 
            } catch (e) {
                console.log('Invalid saved state, starting new game');
                initGame();
                return;
            }
        } else {
            initGame();
            return;
        }
        renderGrid();
    }

    function setupMobileControls() {
        const observer = new MutationObserver(() => {
            const isModalOpen = !gameOverModal.classList.contains('hidden') || 
                              !leaderboardModal.classList.contains('hidden');
            mobileControls.style.display = isModalOpen ? 'none' : 'grid';
        });

        observer.observe(gameOverModal, { attributes: true, attributeFilter: ['class'] });
        observer.observe(leaderboardModal, { attributes: true, attributeFilter: ['class'] });

        upBtn.addEventListener('click', () => move('up'));
        downBtn.addEventListener('click', () => move('down'));
        leftBtn.addEventListener('click', () => move('left'));
        rightBtn.addEventListener('click', () => move('right'));
    }

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

    //обработчики клавиатуры
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

    //свайпы
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

    //загружаем сохраненную игру или начинаем новую
    loadGameState();
    setupMobileControls();
});