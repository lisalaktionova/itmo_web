// script.js — полный рабочий код игры 2048
// Не используем innerHTML/outerHTML при генерации игрового поля или таблицы лидеров.

const SIZE = 4;
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const undoBtn = document.getElementById('undo-btn');
const restartBtn = document.getElementById('restart-btn');
const leadersBtn = document.getElementById('leaders-btn');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverMessage = document.getElementById('gameOverMessage');
const nameInput = document.getElementById('nameInput');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const leadersModal = document.getElementById('leadersModal');
const leadersTableBody = document.querySelector('#leadersTable tbody');
const closeLeadersBtn = document.getElementById('closeLeadersBtn');
const leadersListSidebar = document.getElementById('leadersList');
const mobileControls = document.getElementById('mobile-controls');

let board = [];
let score = 0;
let best = Number(localStorage.getItem('2048_best') || 0);
let prevState = null; // для undo (хранит {board,score})
let gameOver = false;

bestEl.textContent = best;

// ------------ utils --------------
function createEl(tag, attrs = {}) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'text') e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  return e;
}
function clearChildren(node) { while (node.firstChild) node.removeChild(node.firstChild); }

// ------------ generate board cells dynamically --------------
function makeCells() {
  clearChildren(boardEl);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = createEl('div');
      cell.className = 'cell';
      cell.dataset.r = r; cell.dataset.c = c;
      // add inner tile wrapper
      const tile = createEl('div'); tile.className = 'tile';
      cell.appendChild(tile);
      boardEl.appendChild(cell);
    }
  }
}

// ------------ board logic --------------
function newGame() {
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  score = 0;
  prevState = null;
  gameOver = false;
  // initial 1-3 tiles
  const initial = Math.floor(Math.random()*3)+1;
  for (let i=0;i<initial;i++) spawnTiles(1);
  render();
  saveToStorage();
}

function spawnTiles(count=1) {
  // spawn 1..2 after moves, but limited by empty count
  const empties = [];
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (board[r][c]===0) empties.push([r,c]);
  if (empties.length===0) return;
  count = Math.min(count, empties.length);
  for (let i=0;i<count;i++){
    const idx = Math.floor(Math.random()*empties.length);
    const [r,c] = empties.splice(idx,1)[0];
    board[r][c] = Math.random()<0.9?2:4;
  }
}

function savePrevState(){
  prevState = { board: board.map(row=>row.slice()), score };
}

function undo(){
  if (gameOver) return;
  if (!prevState) return;
  board = prevState.board.map(row=>row.slice());
  score = prevState.score;
  prevState = null;
  render();
  saveToStorage();
}

function compressMergeLine(line){
  // input: array length 4
  let arr = line.filter(x=>x!==0);
  let gained = 0;
  for (let i=0;i<arr.length-1;i++){
    if (arr[i]===arr[i+1]){
      arr[i] = arr[i]*2;
      gained += arr[i];
      arr[i+1]=0;
      i++;
    }
  }
  arr = arr.filter(x=>x!==0);
  while(arr.length<4) arr.push(0);
  return {line:arr, gained};
}

function moveLeft(){
  if (gameOver) return;
  savePrevState();
  let moved = false;
  let gainedTotal = 0;
  for (let r=0;r<SIZE;r++){
    const old = board[r].slice();
    const {line, gained} = compressMergeLine(old);
    board[r] = line;
    if (line.toString() !== old.toString()) moved = true;
    gainedTotal += gained;
  }
  if (moved){
    score += gainedTotal;
    // spawn 1-2 new tiles after a move (as required)
    spawnTiles(Math.random()<0.3?2:1);
    if (score>best){ best=score; localStorage.setItem('2048_best', String(best)); bestEl.textContent = best; }
    render();
    saveToStorage();
    if (!canMove()) finishGame();
  } else {
    // если ничего не изменилось — откатываем prevState (undo не меняем)
    prevState = null;
  }
}

function rotateClockwise(){
  const newB = Array.from({length:SIZE}, ()=>Array(SIZE).fill(0));
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) newB[c][SIZE-1-r] = board[r][c];
  board = newB;
}

function moveRight(){
  if (gameOver) return;
  savePrevState();
  // mirror rows
  for (let r=0;r<SIZE;r++) board[r].reverse();
  let moved=false, gainedTotal=0;
  for (let r=0;r<SIZE;r++){
    const old = board[r].slice();
    const {line,gained} = compressMergeLine(old);
    board[r]=line;
    if (line.toString()!==old.toString()) moved=true;
    gainedTotal += gained;
  }
  for (let r=0;r<SIZE;r++) board[r].reverse();
  if (moved){
    score += gainedTotal;
    spawnTiles(Math.random()<0.3?2:1);
    if (score>best){ best=score; localStorage.setItem('2048_best', String(best)); bestEl.textContent = best; }
    render(); saveToStorage();
    if (!canMove()) finishGame();
  } else prevState = null;
}

function moveUp(){
  if (gameOver) return;
  savePrevState();
  // transpose, moveLeft, transpose back
  rotateClockwise();
  rotateClockwise();
  rotateClockwise();
  moveLeft();
  rotateClockwise();
  // moveLeft took care of spawn/check/save so nothing else needed here
}

function moveDown(){
  if (gameOver) return;
  savePrevState();
  rotateClockwise();
  moveLeft();
  rotateClockwise();
  rotateClockwise();
  rotateClockwise();
}

// canMove check (empty or merge possible)
function canMove(){
  for (let r=0;r<SIZE;r++){
    for (let c=0;c<SIZE;c++){
      if (board[r][c]===0) return true;
      if (c<SIZE-1 && board[r][c]===board[r][c+1]) return true;
      if (r<SIZE-1 && board[r][c]===board[r+1][c]) return true;
    }
  }
  return false;
}

function finishGame(){
  gameOver = true;
  gameOverMessage.textContent = 'Игра окончена. Ваш счет: ' + score;
  nameInput.style.display = 'inline-block';
  saveScoreBtn.style.display = 'inline-block';
  gameOverModal.classList.remove('hidden');
}

// ---------- Rendering ----------
function render(){
  // update cells
  const cells = boardEl.querySelectorAll('.cell');
  let idx=0;
  for (let r=0;r<SIZE;r++){
    for (let c=0;c<SIZE;c++){
      const tileWrap = cells[idx].firstChild; // .tile
      const val = board[r][c];
      tileWrap.textContent = val===0 ? '' : String(val);
      // reset classes
      tileWrap.className = 'tile';
      if (val!==0) tileWrap.classList.add('t-' + val);
      idx++;
    }
  }
  scoreEl.textContent = score;
  bestEl.textContent = best;
  renderLeadersSidebar();
}

// ---------- Leaders / storage ----------
function getLeaders(){
  try{ return JSON.parse(localStorage.getItem('2048_leaders')||'[]'); } catch(e){ return []; }
}
function saveLeader(name, scoreVal){
  const leaders = getLeaders();
  leaders.push({name, score: scoreVal, date: new Date().toISOString()});
  leaders.sort((a,b)=>b.score - a.score);
  while (leaders.length>10) leaders.pop();
  localStorage.setItem('2048_leaders', JSON.stringify(leaders));
}
function renderLeadersSidebar(){
  clearChildren(leadersListSidebar);
  const leaders = getLeaders();
  if (leaders.length===0){
    const el = createEl('div',{}); el.textContent = 'Пока нет рекордов'; leadersListSidebar.appendChild(el);
    return;
  }
  leaders.forEach((l,idx)=>{
    const row = createEl('div'); row.className='leader-row';
    const left = createEl('div'); left.textContent = `${idx+1}. ${l.name}`;
    const right = createEl('div'); right.textContent = l.score + ' · ' + (new Date(l.date)).toLocaleString();
    row.appendChild(left); row.appendChild(right);
    leadersListSidebar.appendChild(row);
  });
}
function renderLeadersModal(){
  clearChildren(leadersTableBody);
  const leaders = getLeaders();
  leaders.forEach(l=>{
    const tr = createEl('tr');
    const td1 = createEl('td'); td1.textContent = l.name;
    const td2 = createEl('td'); td2.textContent = l.score;
    const td3 = createEl('td'); td3.textContent = (new Date(l.date)).toLocaleString();
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    leadersTableBody.appendChild(tr);
  });
}

// ---------- Save / load state ----------
function saveToStorage(){
  try{
    localStorage.setItem('2048_state', JSON.stringify({board, score, best, gameOver, prevState}));
  }catch(e){}
}
function loadFromStorage(){
  try{
    const s = JSON.parse(localStorage.getItem('2048_state')||'null');
    if (s && s.board){
      board = s.board;
      score = s.score||0;
      best = s.best||best;
      gameOver = !!s.gameOver;
      prevState = s.prevState || null;
      render();
      if (gameOver) {
        gameOverMessage.textContent = 'Игра окончена. Ваш счет: ' + score;
        gameOverModal.classList.remove('hidden');
      }
      return;
    }
  }catch(e){}
  // otherwise new game
  newGame();
}

// ---------- UI events ----------
window.addEventListener('keydown', (e)=>{
  if (gameOver) return;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();
    switch (e.key){
      case 'ArrowLeft': moveLeft(); break;
      case 'ArrowRight': moveRight(); break;
      case 'ArrowUp': moveUp(); break;
      case 'ArrowDown': moveDown(); break;
    }
  } else if (e.key.toLowerCase()==='u') undo();
});

undoBtn && undoBtn.addEventListener('click', ()=>undo());
restartBtn && restartBtn.addEventListener('click', ()=>{ prevState = null; newGame(); saveToStorage(); });
leadersBtn && leadersBtn.addEventListener('click', ()=>{
  renderLeadersModal();
  leadersModal.classList.remove('hidden');
  // hide mobile controls while viewing
  if (mobileControls) mobileControls.setAttribute('aria-hidden','true');
});
closeLeadersBtn && closeLeadersBtn.addEventListener('click', ()=>{
  leadersModal.classList.add('hidden');
  if (mobileControls) mobileControls.setAttribute('aria-hidden','false');
});

saveScoreBtn && saveScoreBtn.addEventListener('click', ()=>{
  const name = (nameInput.value || 'Аноним').slice(0,30);
  saveLeader(name, score);
  nameInput.style.display = 'none';
  saveScoreBtn.style.display = 'none';
  gameOverMessage.textContent = 'Ваш рекорд сохранен.';
  renderLeadersSidebar();
  renderLeadersModal();
  saveToStorage();
});
playAgainBtn && playAgainBtn.addEventListener('click', ()=>{ gameOverModal.classList.add('hidden'); newGame(); saveToStorage(); });

// mobile control buttons
if (mobileControls){
  mobileControls.querySelectorAll('button[data-dir]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const dir = btn.dataset.dir;
      if (dir==='up') moveUp();
      if (dir==='down') moveDown();
      if (dir==='left') moveLeft();
      if (dir==='right') moveRight();
    });
  });
}

// swipe
let touchStartX=0, touchStartY=0;
boardEl.addEventListener('touchstart', (e)=>{
  if (e.touches.length!==1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
boardEl.addEventListener('touchend', (e)=>{
  if (!touchStartX && !touchStartY) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) < 30) { touchStartX = touchStartY = 0; return; }
  if (absX > absY) { if (dx>0) moveRight(); else moveLeft(); }
  else { if (dy>0) moveDown(); else moveUp(); }
  touchStartX = touchStartY = 0;
});

// init
makeCells();
loadFromStorage();
renderLeadersSidebar();
updateBestUI = ()=>{ bestEl.textContent = best; }
window.addEventListener('beforeunload', ()=> saveToStorage());
