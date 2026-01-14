const SIZE = 4;
const gridEl = document.getElementById("grid");
const tilesEl = document.getElementById("tiles");
const scoreEl = document.getElementById("score");

let grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
let tiles = {};
let score = 0;
let lastState = null;
let idCounter = 0;

/* ===== СОЗДАНИЕ СЕТКИ ===== */
for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    gridEl.appendChild(cell);
}

/* ===== ВСПОМОГАТЕЛЬНЫЕ ===== */
function position(r, c) {
    return `translate(${c * 25}%, ${r * 25}%)`;
}

/* ===== СОЗДАНИЕ ПЛИТКИ ===== */
function createTile(r, c, value) {
    const el = document.createElement("div");
    el.className = `tile tile-${value}`;
    el.textContent = value;
    el.style.transform = position(r, c);

    tilesEl.appendChild(el);

    const id = idCounter++;
    tiles[id] = { id, r, c, value, el };
    grid[r][c] = id;
}

/* ===== СЛУЧАЙНАЯ ПЛИТКА ===== */
function addRandomTile() {
    const empty = [];
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (grid[r][c] === null) empty.push({ r, c });

    if (!empty.length) return;

    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    createTile(r, c, Math.random() < 0.9 ? 2 : 4);
}

/* ===== UNDO ===== */
function saveState() {
    lastState = {
        grid: JSON.parse(JSON.stringify(grid)),
        score,
        tiles: Object.values(tiles).map(t => ({ ...t }))
    };
}

function undo() {
    if (!lastState) return;

    tilesEl.innerHTML = "";
    tiles = {};
    grid = lastState.grid;
    score = lastState.score;
    scoreEl.textContent = score;

    lastState.tiles.forEach(t => createTile(t.r, t.c, t.value));
}

/* ===== ДВИЖЕНИЕ ===== */
function move(direction) {
    saveState();
    let moved = false;

    const list = Object.values(tiles);

    if (direction === "left") list.sort((a, b) => a.c - b.c);
    if (direction === "right") list.sort((a, b) => b.c - a.c);
    if (direction === "up") list.sort((a, b) => a.r - b.r);
    if (direction === "down") list.sort((a, b) => b.r - a.r);

    list.forEach(tile => {
        let { r, c } = tile;

        while (true) {
            let nr = r, nc = c;
            if (direction === "left") nc--;
            if (direction === "right") nc++;
            if (direction === "up") nr--;
            if (direction === "down") nr++;

            if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;

            if (grid[nr][nc] === null) {
                grid[r][c] = null;
                r = nr; c = nc;
                grid[r][c] = tile.id;
                moved = true;
            } else {
                const other = tiles[grid[nr][nc]];
                if (other.value === tile.value) {
                    other.value *= 2;
                    other.el.textContent = other.value;
                    other.el.className = `tile tile-${other.value} tile-merged`;

                    score += other.value;
                    scoreEl.textContent = score;

                    tile.el.remove();
                    delete tiles[tile.id];
                    grid[r][c] = null;
                    moved = true;
                }
                break;
            }
        }

        if (tiles[tile.id]) {
            tile.r = r;
            tile.c = c;
            tile.el.style.transform = position(r, c);
        }
    });

    if (moved) setTimeout(addRandomTile, 200);
}

/* ===== УПРАВЛЕНИЕ ===== */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") move("left");
    if (e.key === "ArrowRight") move("right");
    if (e.key === "ArrowUp") move("up");
    if (e.key === "ArrowDown") move("down");
});

document.getElementById("undo").onclick = undo;
document.getElementById("restart").onclick = () => location.reload();

/* ===== СТАРТ ===== */
addRandomTile();
addRandomTile();
