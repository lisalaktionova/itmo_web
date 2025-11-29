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

    loadGameState();
    setupMobileControls();

    function initGrid() {
        grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    }

    function renderGrid() {
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.dataset.row = r;
                tile.dataset.col = c;
                
                const value = grid[r][c];
                if (value !== 0) {
                    const textNode = document.createTextNode(value);
                    tile.appendChild(textNode);
                    tile.classList.add(`tile-${value}`);
                    
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
        
        const scoreText = document.createTextNode(score);
        scoreSpan.innerHTML = '';
        scoreSpan.appendChild(scoreText);
        
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
        addRandomTile();
        addRandomTile();
        movedTiles = [];
    }

    function saveState() {
        previousGrid = JSON.parse(JSON.stringify(grid));
        previousScore = score;
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

    function moveRowLeft(row, rowIndex) {
        const originalPositions = row.map((val, colIndex) => ({ 
            value: val, 
            from: colIndex 
        }));

        let arr = row.filter(val => val !== 0);
        let newRow = [];
        let scoreAdd = 0;
        let i = 0;
        let merged = [];

        while (i < arr.length) {
            if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
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

        while (newRow.length < GRID_SIZE) {
            newRow.push(0);
        }

        const movements = [];
        let newCol = 0;
        
        for (let oldCol = 0; oldCol < originalPositions.length; oldCol++) {
            const original = originalPositions[oldCol];
            if (original.value !== 0) {
                let found = false;
                for (let j = 0; j < newRow.length; j++) {
                    if (newRow[j] === original.value && !movements.some(m => m.to === j)) {
                        movements.push({
                            from: { r: rowIndex, c: oldCol },
                            to: { r: rowIndex, c: j },
                            value: newRow[j],
                            merged: merged.some(m => m.to === j)
                        });
                        newRow[j] = null;
                        found = true;
                        break;
                    }
                }
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
            const state = JSON.parse(savedState);
            grid = state.grid || [];
            score = state.score || 0;
            previousGrid = state.previousGrid;
            previousScore = state.previousScore;
            gameOver = state.gameOver || false;
            
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
        leaders.push({ 
            name, 
            score, 
            date: new Date().toISOString() 
        });
        leaders.sort((a, b) => b.score - a.score);
        localStorage.setItem("2048_leaders", JSON.stringify(leaders.slice(0, 10)));
        
        const gameOverText = document.getElementById("game-over-text");
        const textNode = document.createTextNode("Ваш рекорд сохранен!");
        gameOverText.innerHTML = '';
        gameOverText.appendChild(textNode);
        
        usernameInput.style.display = "none";
        saveScoreBtn.style.display = "none";
    });

    resumeBtn.addEventListener('click', () => {
        startGame();
    });

    restartBtn.addEventListener('click', () => startGame());

    function renderLeadersList() {
        while (leaderboardTable.firstChild) {
            leaderboardTable.removeChild(leaderboardTable.firstChild);
        }
        
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
            placeCell.appendChild(document.createTextNode(index + 1));
            row.appendChild(placeCell);
            
            const nameCell = document.createElement("td");
            nameCell.appendChild(document.createTextNode(leader.name));
            row.appendChild(nameCell);
            
            const scoreCell = document.createElement("td");
            scoreCell.appendChild(document.createTextNode(leader.score));
            row.appendChild(scoreCell);
            
            const dateCell = document.createElement("td");
            dateCell.appendChild(document.createTextNode(new Date(leader.date).toLocaleDateString('ru-RU')));
            row.appendChild(dateCell);
            
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
        
        usernameInput.value = "";
        usernameInput.style.display = "block";
        saveScoreBtn.style.display = "block";
        
        const gameOverText = document.getElementById("game-over-text");
        const textNode = document.createTextNode("Игра окончена!");
        gameOverText.innerHTML = '';
        gameOverText.appendChild(textNode);
        
        gameOverModal.classList.add("hidden");
        leaderboardModal.classList.add("hidden");
        
        saveGameState();
    }

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

    startGame();
});