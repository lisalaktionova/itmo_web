const SIZE = 4;
const layer = document.getElementById("tiles-layer");
const scoreEl = document.getElementById("score");

let tiles = {};
let grid = Array.from({length:4},()=>Array(4).fill(null));
let score = 0;
let prevState = null;
let idCounter = 0;

/* background */
const bg = document.getElementById("grid-background");
for(let i=0;i<16;i++){
    const d=document.createElement("div");
    d.className="bg";
    bg.appendChild(d);
}

/* helpers */
function pos(r,c){
    return `translate(${c*25}%,${r*25}%)`;
}

function createTile(r,c,val){
    const el=document.createElement("div");
    el.className=`tile tile-${val}`;
    el.textContent=val;
    el.style.transform=pos(r,c);
    layer.appendChild(el);

    const id=idCounter++;
    tiles[id]={id,r,c,val,el};
    grid[r][c]=id;
}

function addRandom(){
    const empty=[];
    for(let r=0;r<4;r++)
        for(let c=0;c<4;c++)
            if(grid[r][c]===null) empty.push({r,c});
    if(!empty.length) return;
    const {r,c}=empty[Math.floor(Math.random()*empty.length)];
    createTile(r,c,Math.random()<.9?2:4);
}

function saveUndo(){
    prevState={
        grid: JSON.parse(JSON.stringify(grid)),
        score,
        tiles: Object.values(tiles).map(t=>({...t}))
    };
}

function restoreUndo(){
    if(!prevState) return;
    layer.innerHTML="";
    tiles={};
    grid=prevState.grid;
    score=prevState.score;
    scoreEl.textContent=score;

    prevState.tiles.forEach(t=>{
        createTile(t.r,t.c,t.val);
    });
}

function move(dir){
    saveUndo();
    let moved=false;

    const order=[...Object.values(tiles)];
    if(dir==="right") order.sort((a,b)=>b.c-a.c);
    if(dir==="left") order.sort((a,b)=>a.c-b.c);
    if(dir==="down") order.sort((a,b)=>b.r-a.r);
    if(dir==="up") order.sort((a,b)=>a.r-b.r);

    order.forEach(t=>{
        let r=t.r, c=t.c;
        while(true){
            let nr=r, nc=c;
            if(dir==="left") nc--;
            if(dir==="right") nc++;
            if(dir==="up") nr--;
            if(dir==="down") nr++;

            if(nr<0||nr>3||nc<0||nc>3) break;
            if(grid[nr][nc]===null){
                grid[r][c]=null;
                r=nr; c=nc;
                grid[r][c]=t.id;
                moved=true;
            } else {
                const other=tiles[grid[nr][nc]];
                if(other.val===t.val){
                    other.val*=2;
                    other.el.textContent=other.val;
                    other.el.className=`tile tile-${other.val} tile-merged`;
                    score+=other.val;
                    scoreEl.textContent=score;

                    t.el.remove();
                    delete tiles[t.id];
                    grid[r][c]=null;
                    moved=true;
                }
                break;
            }
        }
        t.r=r; t.c=c;
        if(tiles[t.id]) t.el.style.transform=pos(r,c);
    });

    if(moved){
        setTimeout(addRandom,200);
        saveGame();
    }
}

function saveGame(){
    localStorage.setItem("2048save",JSON.stringify({grid,score}));
}

function restartGame(){
    location.reload();
}

/* controls */
document.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
});

document.getElementById("left").onclick=()=>move("left");
document.getElementById("right").onclick=()=>move("right");
document.getElementById("up").onclick=()=>move("up");
document.getElementById("down").onclick=()=>move("down");
document.getElementById("undo").onclick=restoreUndo;
document.getElementById("restart").onclick=restartGame;

/* start */
addRandom(); addRandom();
