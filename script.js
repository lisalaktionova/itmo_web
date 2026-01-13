const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;

// Основная функция инициализации
function initGame() {
    console.log("=== ИНИЦИАЛИЗАЦИЯ ИГРЫ ===");
    
    // Проверяем, что элементы DOM существуют
    const gridContainer = document.getElementById('grid');
    if (!gridContainer) {
        console.error("❌ Элемент #grid не найден!");
        return;
    }
    console.log("✅ Контейнер сетки найден");
    
    // Создаем пустую сетку 4x4
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        grid.push([0, 0, 0, 0]);
    }
    
    // Сбрасываем счет
    score = 0;
    updateScore();
    
    // Добавляем 2 начальные плитки
    console.log("Добавляем начальные плитки...");
    addRandomTile();
    addRandomTile();
    
    // Рендерим сетку
    renderGrid();
    
    console.log("✅ Игра инициализирована");
    console.log("Текущая сетка:", grid);
}

// Функция добавления случайной плитки
function addRandomTile() {
    console.log("Добавление случайной плитки...");
    
    // Находим все пустые клетки
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({r, c});
            }
        }
    }
    
    console.log(`Найдено пустых клеток: ${emptyCells.length}`);
    
    if (emptyCells.length > 0) {
        // Выбираем случайную пустую клетку
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // С вероятностью 90% - 2, 10% - 4
        const value = Math.random() < 0.9 ? 2 : 4;
        
        console.log(`Добавляем ${value} в клетку [${randomCell.r}, ${randomCell.c}]`);
        
        grid[randomCell.r][randomCell.c] = value;
        return true;
    }
    
    console.log("Нет пустых клеток для добавления плитки");
    return false;
}

// Функция рендеринга сетки
function renderGrid() {
    console.log("=== РЕНДЕРИНГ СЕТКИ ===");
    
    const gridContainer = document.getElementById('grid');
    if (!gridContainer) {
        console.error("Контейнер сетки не найден при рендеринге");
        return;
    }
    
    // Очищаем контейнер
    gridContainer.innerHTML = '';
    
    // Создаем сетку 4x4
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            
            const value = grid[r][c];
            if (value !== 0) {
                tile.textContent = value;
                tile.classList.add(`tile-${value}`);
                
                // Добавляем анимацию для новых плиток
                tile.classList.add('new');
                setTimeout(() => {
                    tile.classList.remove('new');
                }, 200);
            }
            
            gridContainer.appendChild(tile);
        }
    }
    
    console.log("✅ Сетка отрендерена");
    console.log("Количество плиток в DOM:", gridContainer.children.length);
}

// Функция обновления счета
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Функция движения влево для одной строки
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
    
    // Заполняем нулями до размера 4
    while (result.length < GRID_SIZE) {
        result.push(0);
    }
    
    return { row: result, score: scoreAdd };
}

// Функция вращения сетки
function rotateGrid(times) {
    for (let t = 0; t < times; t++) {
        const newGrid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            newGrid.push([]);
            for (let j = 0; j < GRID_SIZE; j++) {
                newGrid[i].push(grid[GRID_SIZE - 1 - j][i]);
            }
        }
        grid = newGrid;
    }
}

// Основная функция движения
function performMove(direction) {
    console.log(`Выполнение движения: ${direction}`);
    
    const before = JSON.parse(JSON.stringify(grid));
    const beforeScore = score;
    
    switch(direction) {
        case 'left':
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            break;
            
        case 'right':
            rotateGrid(2);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(2);
            break;
            
        case 'up':
            rotateGrid(3);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(1);
            break;
            
        case 'down':
            rotateGrid(1);
            for (let r = 0; r < GRID_SIZE; r++) {
                const result = moveRowLeft(grid[r]);
                grid[r] = result.row;
                score += result.score;
            }
            rotateGrid(3);
            break;
    }
    
    // Проверяем, было ли движение
    const moved = JSON.stringify(before) !== JSON.stringify(grid);
    
    if (moved) {
        console.log("✅ Движение выполнено");
        updateScore();
    } else {
        console.log("❌ Нет движения");
    }
    
    return moved;
}

// Функция проверки возможности движения
function canMove() {
    // Проверяем пустые клетки
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

// Главная функция движения
function move(direction) {
    if (gameOver) {
        console.log("Игра окончена!");
        return;
    }
    
    // Сохраняем предыдущее состояние для отмены
    previousGrid = JSON.parse(JSON.stringify(grid));
    previousScore = score;
    
    const moved = performMove(direction);
    
    if (moved) {
        // Добавляем новую плитку
        addRandomTile();
        
        // Рендерим обновленную сетку
        renderGrid();
        
        // Проверяем конец игры
        if (!canMove()) {
            gameOver = true;
            console.log("🎮 ИГРА ОКОНЧЕНА!");
            showGameOver();
        }
    }
}

// Показ окна окончания игры
function showGameOver() {
    const modal = document.getElementById('game-over-modal');
    const finalScore = document.getElementById('final-score');
    
    if (modal && finalScore) {
        finalScore.textContent = score;
        modal.classList.remove('hidden');
    }
}

// Обработчики событий для виртуальных кнопок
function setupVirtualButtons() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    if (upBtn) upBtn.addEventListener('click', () => move('up'));
    if (downBtn) downBtn.addEventListener('click', () => move('down'));
    if (leftBtn) leftBtn.addEventListener('click', () => move('left'));
    if (rightBtn) rightBtn.addEventListener('click', () => move('right'));
}

// Обработчики для основных кнопок
function setupControlButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const restartBtn = document.getElementById('restart-btn');
    const leadersBtn = document.getElementById('leaders-btn');
    const saveScoreBtn = document.getElementById('save-score-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const closeLeadersBtn = document.getElementById('close-leaders-btn');
    
    // Отмена хода
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (previousGrid && !gameOver) {
                grid = JSON.parse(JSON.stringify(previousGrid));
                score = previousScore;
                updateScore();
                renderGrid();
                console.log("Отмена хода");
            }
        });
    }
    
    // Начать заново
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            console.log("Начало новой игры");
            initGame();
            gameOver = false;
            const modal = document.getElementById('game-over-modal');
            if (modal) modal.classList.add('hidden');
        });
    }
    
    // Показать таблицу лидеров
    if (leadersBtn) {
        leadersBtn.addEventListener('click', showLeaderboard);
    }
    
    // Закрыть таблицу лидеров
    if (closeLeadersBtn) {
        closeLeadersBtn.addEventListener('click', () => {
            const modal = document.getElementById('leaderboard-modal');
            if (modal) modal.classList.add('hidden');
        });
    }
    
    // Сохранить результат
    if (saveScoreBtn) {
        saveScoreBtn.addEventListener('click', saveScore);
    }
    
    // Продолжить игру
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            initGame();
            const modal = document.getElementById('game-over-modal');
            if (modal) modal.classList.add('hidden');
        });
    }
}

// Сохранение результата
function saveScore() {
    const usernameInput = document.getElementById('username');
    const gameOverText = document.getElementById('game-over-text');
    
    if (!usernameInput || !gameOverText) return;
    
    const name = usernameInput.value.trim() || 'Аноним';
    
    // Получаем текущие рекорды
    const leaders = JSON.parse(localStorage.getItem('2048_leaders') || '[]');
    
    // Добавляем новый результат
    leaders.push({
        name: name,
        score: score,
        date: new Date().toISOString()
    });
    
    // Сортируем по убыванию и оставляем топ-10
    leaders.sort((a, b) => b.score - a.score);
    const topLeaders = leaders.slice(0, 10);
    
    // Сохраняем
    localStorage.setItem('2048_leaders', JSON.stringify(topLeaders));
    
    // Обновляем UI
    gameOverText.textContent = 'Ваш рекорд сохранен!';
    usernameInput.style.display = 'none';
    document.getElementById('save-score-btn').style.display = 'none';
    
    console.log(`Рекорд сохранен: ${name} - ${score} очков`);
}

// Показать таблицу лидеров
function showLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    const table = document.getElementById('leaderboard-table');
    
    if (!modal || !table) return;
    
    // Очищаем таблицу
    table.innerHTML = '';
    
    // Получаем рекорды
    const leaders = JSON.parse(localStorage.getItem('2048_leaders') || '[]');
    
    if (leaders.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'Пока нет рекордов';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        row.appendChild(cell);
        table.appendChild(row);
    } else {
        // Создаем заголовок
        const headerRow = document.createElement('tr');
        ['Место', 'Имя', 'Очки', 'Дата'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Добавляем строки с рекордами
        leaders.forEach((leader, index) => {
            const row = document.createElement('tr');
            
            const placeCell = document.createElement('td');
            placeCell.textContent = index + 1;
            row.appendChild(placeCell);
            
            const nameCell = document.createElement('td');
            nameCell.textContent = leader.name;
            row.appendChild(nameCell);
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = leader.score;
            row.appendChild(scoreCell);
            
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(leader.date).toLocaleDateString('ru-RU');
            row.appendChild(dateCell);
            
            table.appendChild(row);
        });
    }
    
    // Показываем модальное окно
    modal.classList.remove('hidden');
}

// Обработчик клавиатуры
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                move('right');
                break;
            case 'ArrowUp':
                e.preventDefault();
                move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                move('down');
                break;
        }
    });
}

// Свайпы для мобильных
function setupSwipeControls() {
    let startX, startY;
    
    const gridContainer = document.getElementById('grid');
    if (!gridContainer) return;
    
    gridContainer.addEventListener('touchstart', (e) => {
        if (gameOver) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    gridContainer.addEventListener('touchend', (e) => {
        if (gameOver || !startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - startX;
        const dy = endY - startY;
        const minSwipe = 30;
        
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
            // Горизонтальный свайп
            if (dx > 0) move('right');
            else move('left');
        } else if (Math.abs(dy) > minSwipe) {
            // Вертикальный свайп
            if (dy > 0) move('down');
            else move('up');
        }
        
        startX = null;
        startY = null;
    });
}

// Основная функция инициализации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log("=== ЗАГРУЗКА ИГРЫ 2048 ===");
    
    // Проверяем наличие всех необходимых элементов
    const requiredElements = [
        'grid', 'score', 'undo-btn', 'restart-btn', 'leaders-btn',
        'game-over-modal', 'leaderboard-modal'
    ];
    
    let allElementsFound = true;
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Элемент #${id} не найден!`);
            allElementsFound = false;
        } else {
            console.log(`✅ Элемент #${id} найден`);
        }
    });
    
    if (!allElementsFound) {
        console.error("Не все необходимые элементы найдены. Проверьте HTML.");
        return;
    }
    
    // Инициализируем игру
    initGame();
    
    // Настраиваем управление
    setupKeyboardControls();
    setupVirtualButtons();
    setupControlButtons();
    setupSwipeControls();
    
    console.log("✅ Игра 2048 готова к использованию!");
    console.log("Управление: стрелки на клавиатуре или свайпы на мобильном");
});
