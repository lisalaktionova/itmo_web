const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;
let isAnimating = false;
let tileElements = [];

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

    initGame();

    function initGame() {
        score = 0;
        previousScore = 0;
        gameOver = false;
        previousGrid = null;
        isAnimating = false;
        tileElements = [];
        
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
        // Создаем или обновляем плитки
        if (tileElements.length === 0) {
            // Первый рендер - создаем все плитки
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const tile = document.createElement("div");
                    tile.className = "tile";
                    tile.dataset.row = r;
                    tile.dataset.col = c;
                    gridContainer.appendChild(tile);
                    tileElements.push({ element: tile, r, c });
                }
            }
        }
        
        updateTiles();
        saveGameState();
    }

    function updateTiles() {
        // Обновляем состояние всех плиток
        tileElements.forEach(tileData => {
            const { element, r, c } = tileData;
            const value = grid[r][c];
            
            // Очищаем классы
            element.className = "tile";
            element.textContent = "";
            
            if (value !== 0) {
                element.textContent = value.toString();
                element.classList.add(`tile-${value}`);
                element.classList.add(`position-${r}-${c}`);
            } else {
                element.classList.add("tile-empty");
            }
        });
        
        // Обновляем счет
        scoreSpan.textContent = Math.floor(score).toString();
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
        
        // Анимация появления новой плитки
        const tile = tileElements.find(t => t.r === r && t.c === c).element;
        tile.classList.add("tile-new");
        setTimeout(() => tile.classList.remove("tile-new"), 300);
        
        return true;
    }

    function addStartTiles() {
        addRandomTile();
        addRandomTile();
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
            updateTiles();
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

    async function performMove(direction) {
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

        const moved = !gridsEqual(before, grid) || score !== beforeScore;
        
        if (moved) {
            await animateMove(before, grid);
        }
        
        return moved;
    }

    async function animateMove(oldGrid, newGrid) {
        isAnimating = true;
        
        // Собираем информацию о перемещениях
        const movements = [];
        const mergedTiles = [];
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const oldValue = oldGrid[r][c];
                const newValue = newGrid[r][c];
                
                if (oldValue !== 0) {
                    // Ищем, куда переместилась эта плитка
                    let found = false;
                    for (let nr = 0; nr < GRID_SIZE && !found; nr++) {
                        for (let nc = 0; nc < GRID_SIZE && !found; nc++) {
                            if (newGrid[nr][nc] === oldValue && 
                                !movements.some(m => m.toRow === nr && m.toCol === nc)) {
                                
                                // Проверяем, было ли слияние
                                const wasMerged = oldValue < newGrid[nr][nc];
                                
                                movements.push({
                                    fromRow: r,
                                    fromCol: c,
                                    toRow: nr,
                                    toCol: nc,
                                    value: oldValue,
                                    merged: wasMerged
                                });
                                
                                if (wasMerged) {
                                    mergedTiles.push({ row: nr, col: nc, value: newGrid[nr][nc] });
                                }
                                
                                found = true;
                            }
                        }
                    }
                }
            }
        }
        
        // Анимируем перемещения
        const animationPromises = [];
        
        movements.forEach(move => {
            const fromTile = tileElements.find(t => t.r === move.fromRow && t.c === move.fromCol).element;
            const toTile = tileElements.find(t => t.r === move.toRow && t.c === move.toCol).element;
            
            // Создаем клон для анимации перемещения
            const clone = fromTile.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.left = fromTile.offsetLeft + 'px';
            clone.style.top = fromTile.offsetTop + 'px';
            clone.style.width = fromTile.offsetWidth + 'px';
            clone.style.height = fromTile.offsetHeight + 'px';
            clone.style.zIndex = '100';
            clone.classList.add('tile-moving');
            
            gridContainer.appendChild(clone);
            
            // Скрываем оригинальную плитку
            fromTile.classList.add('tile-hidden');
            
            // Обещание для анимации
            const promise = new Promise(resolve => {
                setTimeout(() => {
                    // Перемещаем клон
                    clone.style.transition = 'all 0.3s ease';
                    clone.style.left = toTile.offsetLeft + 'px';
                    clone.style.top = toTile.offsetTop + 'px';
                    
                    setTimeout(() => {
                        // Показываем конечную плитку
                        if (move.merged) {
                            toTile.classList.add('tile-merged');
                        }
                        
                        // Удаляем клон
                        clone.remove();
                        fromTile.classList.remove('tile-hidden');
                        
                        resolve();
                    }, 300);
                }, 10);
            });
            
            animationPromises.push(promise);
        });
        
        // Ждем завершения всех анимаций
        await Promise.all(animationPromises);
        
        // Обновляем отображение
        updateTiles();
        
        // Анимация для объединенных плиток
        mergedTiles.forEach(tile => {
            const element = tileElements.find(t => t.r === tile.row && t.c === tile.col).element;
            element.classList.add('tile-merged');
            setTimeout(() => element.classList.remove('tile-merged'), 300);
        });
        
        isAnimating = false;
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

    async function move(direction) {
        if (gameOver || isAnimating) return;
        
        saveState();
        const moved = await performMove(direction);
        
        if (moved) {
            addRandomTile();
            updateTiles();
            
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
                
                if (!Array.isArray(grid) || grid.length !== GRID_SIZE) {
                    throw new Error('Invalid grid data');
                }
                
                if (isNaN(score)) score = 0;
                
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

    // ... остальной код остается таким же (лидерборд, обработчики и т.д.)
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

    loadGameState();
    setupMobileControls();
});
