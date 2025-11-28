const GRID_SIZE = 4;
let grid = [];
let score = 0;
let previousGrid = null;
let previousScore = 0;

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
const closeModalBtn = document.getElementById("close-modal-btn");
const closeLeadersBtn = document.getElementById("close-leaders-btn");
const leaderboardTable = document.getElementById("leaderboard-table");

// --- Инициализация пустого поля ---
function initGrid() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
}

// --- Рендер поля ---
function renderGrid() {
    gridContainer.innerHTML = "";
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            if (grid[r][c] !== 0) tile.classList.add("tile-" + grid[r][c]);
            tile.textContent = grid[r][c] || "";
            gridContainer.appendChild(tile);
        }
    }
    scoreSpan.textContent = score;
}

// --- Добавление случайной плитки ---
function addRandomTile() {
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++)
        for (let c = 0; c < GRID_SIZE; c++)
            if (grid[r][c] === 0) empty.push({r,c});
    if (!empty.length) return;
    const {r,c} = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

// --- Начальные плитки 1-3 ---
function addStartTiles() {
    const count = Math.floor(Math.random()*3)+1;
    for(let i=0;i<count;i++) addRandomTile();
}

// --- Сохранение состояния для Undo ---
function saveState() {
    previousGrid = JSON.parse(JSON.stringify(grid));
    previousScore = score;
}

// --- Undo ---
undoBtn.onclick = () => {
    if(previousGrid){
        grid = JSON.parse(JSON.stringify(previousGrid));
        score = previousScore;
        renderGrid();
    }
};

// --- Движение строки влево ---
function moveRowLeft(row){
    let arr = row.filter(v=>v!==0);
    let scoreAdd = 0;
    for(let i=0;i<arr.length-1;i++){
        if(arr[i]===arr[i+1]){
            arr[i]*=2;
            scoreAdd+=arr[i];
            arr[i+1]=0;
            i++;
        }
    }
    arr = arr.filter(v=>v!==0);
    while(arr.length<GRID_SIZE) arr.push(0);
    score+=scoreAdd;
    return arr;
}

// --- Поворот матрицы ---
function rotateGrid(times){
    for(let t=0;t<times;t++){
        let newGrid = Array(GRID_SIZE).fill().map(()=>Array(GRID_SIZE).fill(0));
        for(let r=0;r<GRID_SIZE;r++)
            for(let c=0;c<GRID_SIZE;c++)
                newGrid[c][GRID_SIZE-1-r] = grid[r][c];
        grid = newGrid;
    }
}

// --- Универсальное движение ---
function move(direction){
    saveState();
    if(direction==="left"){
        for(let r=0;r<GRID_SIZE;r++) grid[r] = moveRowLeft(grid[r]);
    }
    if(direction==="right"){
        rotateGrid(2);
        for(let r=0;r<GRID_SIZE;r++) grid[r] = moveRowLeft(grid[r]);
        rotateGrid(2);
    }
    if(direction==="up"){
        rotateGrid(3);
        for(let r=0;r<GRID_SIZE;r++) grid[r] = moveRowLeft(grid[r]);
        rotateGrid(1);
    }
    if(direction==="down"){
        rotateGrid(1);
        for(let r=0;r<GRID_SIZE;r++) grid[r] = moveRowLeft(grid[r]);
        rotateGrid(3);
    }
    addRandomTile();
    renderGrid();
    checkGameOver();
}

// --- Проверка доступных ходов ---
function canMove(){
    for(let r=0;r<GRID_SIZE;r++)
        for(let c=0;c<GRID_SIZE;c++)
            if(grid[r][c]===0) return true;
    for(let r=0;r<GRID_SIZE;r++)
        for(let c=0;c<GRID_SIZE-1;c++)
            if(grid[r][c]===grid[r][c+1]) return true;
    for(let c=0;c<GRID_SIZE;c++)
        for(let r=0;r<GRID_SIZE-1;r++)
            if(grid[r][c]===grid[r+1][c]) return true;
    return false;
}

// --- Конец игры ---
function checkGameOver(){
    if(!canMove()){
        gameOverModal.classList.remove("hidden");
    }
}

// --- Сохранение результата ---
saveScoreBtn.onclick = () => {
    const name = usernameInput.value.trim() || "Аноним";

    // Загружаем существующих лидеров
    const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");

    // Добавляем новый рекорд
    leaders.push({ name, score, date: new Date().toISOString() });

    // Сортируем и оставляем топ-10
    leaders.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaders", JSON.stringify(leaders.slice(0, 10)));

    // Обновляем модалку
    const text = document.getElementById("game-over-text");
    if (text) text.textContent = "Ваш рекорд сохранен!";

    // Скрываем инпут и кнопку сохранения
    usernameInput.style.display = "none";
    saveScoreBtn.style.display = "none";

    // Обновляем таблицу лидеров и сразу показываем её
    renderLeadersList();
    leaderboardModal.classList.remove("hidden");
    gameOverModal.classList.add("hidden");
};

// --- Таблица лидеров ---
function renderLeadersList(){
    leaderboardTable.innerHTML="";
    const header = document.createElement("tr");
    header.innerHTML="<th>Имя</th><th>Очки</th><th>Дата</th>";
    leaderboardTable.appendChild(header);
    const leaders = JSON.parse(localStorage.getItem("leaders")||"[]");
    if(!leaders.length){
        const row=document.createElement("tr");
        row.innerHTML="<td colspan='3'>Пока нет рекордов</td>";
        leaderboardTable.appendChild(row);
        return;
    }
    leaders.forEach(l=>{
        const row=document.createElement("tr");
        row.innerHTML=`<td>${l.name}</td><td>${l.score}</td><td>${new Date(l.date).toLocaleString()}</td>`;
        leaderboardTable.appendChild(row);
    });
}

});
// --- Кнопка лидеров ---
leadersBtn.onclick = ()=>{
    renderLeadersList();
    leaderboardModal.classList.remove("hidden");
};

// --- Закрытие модалок ---
closeModalBtn.onclick = ()=>gameOverModal.classList.add("hidden");
closeLeadersBtn.onclick = ()=>leaderboardModal.classList.add("hidden");

// --- Кнопка рестарта ---
restartBtn.onclick = startGame;

// --- Старт игры ---
function startGame(){
    score=0;
    initGrid();
    addStartTiles();
    renderGrid();
    usernameInput.value="";
    usernameInput.style.display="block";
    saveScoreBtn.style.display="block";
    gameOverModal.classList.add("hidden");
}

startGame();

// --- Управление стрелками ---
document.addEventListener("keydown",(e)=>{
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
});
