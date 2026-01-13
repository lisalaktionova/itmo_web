const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;
let gameOver = false;

// Основная функция инициализации
function initGame() {
    console.log("=== ИНИЦИАЛИЗАЦИЯ ИГРЫ ===");
    
    // Проверяем элементы DOM
    const gridContainer = document.getElementById('grid');
    if (!gridContainer) {
        console.error("❌ Элемент #grid не найден!");
        return;
    }
    console.log("✅ Контейнер сетки найден");
    
    // Включаем режим отладки
    document.body.classList.add('debug');
    gridContainer.classList.add('debug');
    
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

// Функция рендеринга сетки - ИСПРАВЛЕНА!
function renderGrid() {
    console.log("=== РЕНДЕРИНГ СЕТКИ ===");
    
    const gridContainer = document.getElementById('grid');
    if (!gridContainer) {
        console.error("Контейнер сетки не найден при рендеринге");
        return;
    }
    
    // Очищаем контейнер
    gridContainer.innerHTML = '';
    
    // Визуализируем сетку 4x4
    console.log(`Создаем сетку ${GRID_SIZE}x${GRID_SIZE}...`);
    
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile debug'; // Добавляем класс отладки
            
            const value = grid[r][c];
            
            if (value !== 0) {
                tile.textContent = value;
                tile.classList.add(`tile-${value}`);
                console.log(`Плитка [${r},${c}] = ${value}`);
            } else {
                // Пустая плитка
                tile.textContent = '';
                tile.style.background = 'rgba(205, 193, 180, 0.35)';
                console.log(`Пустая плитка [${r},${c}]`);
            }
            
            // Добавляем атрибут для отладки
            tile.setAttribute('data-row', r);
            tile.setAttribute('data-col', c);
            tile.setAttribute('data-value', value);
            
            gridContainer.appendChild(tile);
        }
    }
    
    console.log(`✅ Сетка отрендерена. Создано плиток: ${gridContainer.children.length}`);
    
    // Проверяем, что создано 16 плиток
    if (gridContainer.children.length !== 16) {
        console.error(`❌ ОШИБКА: создано ${gridContainer.children.length} плиток вместо 16!`);
        
        // Принудительно создаем 16 плиток для отладки
        console.log("Принудительное создание 16 плиток...");
        gridContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile debug';
            tile.textContent = i % 5 === 0 ? (i + 2) : '';
            tile.style.background = i % 5 === 0 ? '#eee4da' : 'rgba(205,193,180,0.35)';
            tile.style.display = 'flex';
            tile.style.justifyContent = 'center';
            tile.style.alignItems = 'center';
            tile.style.fontSize = '35px';
            tile.style.fontWeight = 'bold';
            tile.style.borderRadius = '3px';
            gridContainer.appendChild(tile);
        }
    }
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

// Обновление счета
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Движение строки влево
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
            i++;
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

// Вращение сетки
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

// Выполнение движения
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

// Главная функция движения
function move(direction) {
    if (gameOver) {
        console.log("Игра окончена!");
        return;
    }
    
    // Сохраняем предыдущее состояние
    previousGrid = JSON.parse(JSON.stringify(grid));
    previousScore = score;
    
    const moved = performMove(direction);
    
    if (moved) {
        addRandomTile();
        renderGrid();
        
        // Проверяем конец игры
        if (!canMove()) {
            gameOver = true;
            console.log("🎮 ИГРА ОКОНЧЕНА!");
            showGameOver();
        }
    }
}

// Проверка возможности движения
function canMove() {
    // Проверяем пустые клетки
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) return true;
        }
    }
    
    // Проверяем возможные слияния
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

// Показ окна окончания игры
function showGameOver() {
    const modal = document.getElementById('game-over-modal');
    const finalScore = document.getElementById('final-score');
    
    if (modal && finalScore) {
        finalScore.textContent = score;
        modal.classList.remove('hidden');
    }
}

// Настройка виртуальных кнопок
function setupVirtualButtons() {
    document.getElementById('up-btn')?.addEventListener('click', () => move('up'));
    document.getElementById('down-btn')?.addEventListener('click', () => move('down'));
    document.getElementById('left-btn')?.addEventListener('click', () => move('left'));
    document.getElementById('right-btn')?.addEventListener('click', () => move('right'));
}

// Настройка основных кнопок
function setupControlButtons() {
    // Отмена хода
    document.getElementById('undo-btn')?.addEventListener('click', () => {
        if (previousGrid && !gameOver) {
            grid = JSON.parse(JSON.stringify(previousGrid));
            score = previousScore;
            updateScore();
            renderGrid();
        }
    });
    
    // Начать заново
    document.getElementById('restart-btn')?.addEventListener('click', () => {
        initGame();
        gameOver = false;
        document.getElementById('game-over-modal')?.classList.add('hidden');
    });
    
    // Таблица лидеров
    document.getElementById('leaders-btn')?.addEventListener('click', showLeaderboard);
    document.getElementById('close-leaders-btn')?.addEventListener('click', () => {
        document.getElementById('leaderboard-modal')?.classList.add('hidden');
    });
    
    // Сохранить результат
    document.getElementById('save-score-btn')?.addEventListener('click', saveScore);
    
    // Новая игра
    document.getElementById('resume-btn')?.addEventListener('click', () => {
        initGame();
        document.getElementById('game-over-modal')?.classList.add('hidden');
    });
}

// Сохранение результата
function saveScore() {
    const usernameInput = document.getElementById('username');
    const gameOverText = document.getElementById('game-over-text');
    
    if (!usernameInput || !gameOverText) return;
    
    const name = usernameInput.value.trim() || 'Аноним';
    const leaders = JSON.parse(localStorage.getItem('2048_leaders') || '[]');
    
    leaders.push({
        name: name,
        score: score,
        date: new Date().toISOString()
    });
    
    leaders.sort((a, b) => b.score - a.score);
    const topLeaders = leaders.slice(0, 10);
    
    localStorage.setItem('2048_leaders', JSON.stringify(topLeaders));
    
    gameOverText.textContent = 'Ваш рекорд сохранен!';
    usernameInput.style.display = 'none';
    document.getElementById('save-score-btn').style.display = 'none';
}

// Показать таблицу лидеров
function showLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    const table = document.getElementById('leaderboard-table');
    
    if (!modal || !table) return;
    
    table.innerHTML = '';
    const leaders = JSON.parse(localStorage.getItem('2048_leaders') || '[]');
    
    if (leaders.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'Пока нет рекордов';
        row.appendChild(cell);
        table.appendChild(row);
    } else {
        const headerRow = document.createElement('tr');
        ['Место', 'Имя', 'Очки', 'Дата'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        leaders.forEach((leader, index) => {
            const row = document.createElement('tr');
            
            [index + 1, leader.name, leader.score, 
             new Date(leader.date).toLocaleDateString('ru-RU')].forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                row.appendChild(td);
            });
            
            table.appendChild(row);
        });
    }
    
    modal.classList.remove('hidden');
}

// Управление клавиатурой
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft': e.preventDefault(); move('left'); break;
            case 'ArrowRight': e.preventDefault(); move('right'); break;
            case 'ArrowUp': e.preventDefault(); move('up'); break;
            case 'ArrowDown': e.preventDefault(); move('down'); break;
        }
    });
}

// Свайпы для мобильных
function setupSwipeControls() {
    let startX, startY;
    const gridContainer = document.getElementById('grid');
    
    if (!gridContainer) return;
    
    gridContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    gridContainer.addEventListener('touchend', (e) => {
        if (!startX || !startY || gameOver) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - startX;
        const dy = endY - startY;
        const minSwipe = 30;
        
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
            dx > 0 ? move('right') : move('left');
        } else if (Math.abs(dy) > minSwipe) {
            dy > 0 ? move('down') : move('up');
        }
    });
}

// Загрузка игры
document.addEventListener('DOMContentLoaded', () => {
    console.log("=== ЗАГРУЗКА ИГРЫ 2048 ===");
    
    // Проверяем элементы
    const elements = ['grid', 'score', 'undo-btn', 'restart-btn'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        console.log(el ? `✅ #${id}` : `❌ #${id}`);
    });
    
    // Инициализация
    initGame();
    
    // Настройка управления
    setupKeyboardControls();
    setupVirtualButtons();
    setupControlButtons();
    setupSwipeControls();
    
    console.log("✅ Игра готова!");
    
    // Через 3 секунды убираем отладку
    setTimeout(() => {
        document.body.classList.remove('debug');
        document.getElementById('grid')?.classList.remove('debug');
        document.querySelectorAll('.tile.debug').forEach(tile => {
            tile.classList.remove('debug');
        });
    }, 3000);
});
