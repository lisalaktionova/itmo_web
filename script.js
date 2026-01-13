const SIZE = 4;
let grid, score, prevGrid, prevScore, gameOver;
let merged = [];

const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");

init();

function init() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    prevGrid = null;
    prevScore = 0;
    gameOver = false;
    merged = [];

    addTile(); addTile();
    render();
    saveGame();
}

function addTile() {
    const empty = [];
    for (let r=0;r<SIZE;r++)
        for (let c=0;c<SIZE;c++)
            if (grid[r][c] === 0) empty.push({r,c});

    if (!empty.length) return;
    const {r,c} = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random() < .9 ? 2 : 4;
}

function moveLeft(row) {
    const filtered = row.filter(v=>v);
    const res = [];
    const mergeIdx = [];
    let add = 0;

    for (let i=0;i<filtered.length;i++) {
        if (filtered[i] === filtered[i+1]) {
            res.push(filtered[i]*2);
            add += filtered[i]*2;
            mergeIdx.push(res.length-1);
            i++;
        } else res.push(filtered[i]);
    }
    while (res.length<SIZE) res.push(0);
    return {row:res, score:add, mergeIdx};
}

function rotate(times) {
    for (let t=0;t<times;t++) {
        grid = grid[0].map((_,i)=>grid.map(r=>r[i]).reverse());
    }
}

function move(dir) {
    if (gameOver) return;

    prevGrid = JSON.parse(JSON.stringify(grid));
    prevScore = score;
    merged = [];

    if (dir==="right") rotate(2);
    if (dir==="up") rotate(1);
    if (dir==="down") rotate(3);

    grid.forEach((row,r)=>{
        const res = moveLeft(row);
        grid[r]=res.row;
        score+=res.score;
        res.mergeIdx.forEach(c=>merged.push({r,c}));
    });

    if (dir==="right") rotate(2);
    if (dir==="up") rotate(3);
    if (dir==="down") rotate(1);

    addTile();
    render();
    saveGame();
}

function render() {
    gridEl.innerHTML="";
    grid.forEach((row,r)=>{
        row.forEach((v,c)=>{
            const d=document.createElement("div");
            d.className="tile";
            if(v){
                d.textContent=v;
                d.classList.add(`tile-${v}`);
                if (merged.some(m=>m.r===r&&m.c===c)) d.classList.add("tile-merged");
            }
            gridEl.appendChild(d);
        });
    });
    scoreEl.textContent=score;
}

function saveGame() {
    localStorage.setItem("2048", JSON.stringify({grid,score}));
}

/* controls */
document.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
});

document.getElementById("up-btn").onclick=()=>move("up");
document.getElementById("down-btn").onclick=()=>move("down");
document.getElementById("left-btn").onclick=()=>move("left");
document.getElementById("right-btn").onclick=()=>move("right");

document.getElementById("restart-btn").onclick=init;
document.getElementById("undo-btn").onclick=()=>{
    if(prevGrid){
        grid=prevGrid;
        score=prevScore;
        render();
    }
};
