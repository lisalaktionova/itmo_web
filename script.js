const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
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

let board = [];
let score = 0;
let previousState = null; // для undo (хранит предыдущую доску и очки)
let gameOver = false;

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function createGrid() {
  // очищаем DOM-узел и внутреннее состояние
  clearChildren(grid);
  board = [];

  for (let i = 0; i < 4; i++) {
    board[i] = [];
    for (let j = 0; j < 4; j++) {
      const cell = document.createElement("div");
      cell.classList.add("tile");
      // не помещаем число сюда — это покажет drawBoard
      grid.appendChild(cell);
      board[i][j] = 0;
    }
  }

  // начальные 1-3 плитки (по заданию 1-3 случайных плитки)
  const initial = Math.floor(Math.random() * 3) + 1; // 1..3
  for (let k = 0; k < initial; k++) addRandomTile();

  score = 0;
  previousState = null;
  gameOver = false;
  drawBoard();
  updateScore();
}

function drawBoard() {
  const cells = document.querySelectorAll(".tile");
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const val = board[i][j];
      const el = cells[idx++];
      el.textContent = val === 0 ? "" : val;
      // можно добавить класс-цвета по значению
      el.className = "tile";
      if (val !== 0) el.classList.add("t-" + val);
    }
  }
}

function addRandomTile() {
  const empty = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) empty.push({ i, j });
    }
  }
  if (empty.length === 0) return;
  const count = Math.random() < 0.3 ? 2 : 1; // иногда 2 плитки
  for (let k = 0; k < count && empty.length > 0; k++) {
    const idx = Math.floor(Math.random() * empty.length);
    const spot = empty.splice(idx, 1)[0];
    board[spot.i][spot.j] = Math.random() < 0.9 ? 2 : 4;
  }
}

function saveState() {
  previousState = {
    board: board.map(row => row.slice()),
    score
  };
}

function undo() {
  if (!previousState || gameOver) return;
  board = previousState.board.map(row => row.slice());
  score = previousState.score;
  previousState = null;
  drawBoard();
  updateScore();
  saveToStorage();
}

function updateScore() {
  scoreEl.textContent = score;
}

function compressAndMergeLine(line) {
  // удаляем нули
  let arr = line.filter(x => x !== 0);
  let gained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] = arr[i] * 2;
      gained += arr[i];
      arr[i + 1] = 0;
      i++; // пропускаем следующий
    }
  }
  arr = arr.filter(x => x !== 0);
  while (arr.length < 4) arr.push(0);
  return { newLine: arr, gained };
}

// повернуть доску по часовой на 90 градусов
function rotateClockwise() {
  const newB = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newB[c][3 - r] = board[r][c];
    }
  }
  board = newB;
}

function moveLeft() {
    saveState();
    let moved = false;

    for (let i = 0; i < 4; i++) {
        let row = board[i].filter(x => x !== 0); // убрать нули

        // слияние плиток
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row[j + 1] = 0;
            }
        }

        // убрать нули после объединений
        row = row.filter(x => x !== 0);

        // добить нулями до 4
        while (row.length < 4) row.push(0);

        // записать строку обратно в board
        for (let j = 0; j < 4; j++) {
            if (board[i][j] !== row[j]) moved = true;
            board[i][j] = row[j];
        }
    }

    if (moved) {
        addRandomTile();
        drawBoard();
        updateScore();
        checkGameOver();
    }
}

function moveRight() {
    saveState();
    let moved = false;

    for (let i = 0; i < 4; i++) {
        let row = board[i].filter(x => x !== 0);

        // разворачиваем строку для удобства
        row.reverse();

        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row[j + 1] = 0;
            }
        }

        row = row.filter(x => x !== 0);

        while (row.length < 4) row.push(0);

        row.reverse(); // вернуть обратно

        for (let j = 0; j < 4; j++) {
            if (board[i][j] !== row[j]) moved = true;
            board[i][j] = row[j];
        }
    }

    if (moved) {
        addRandomTile();
        drawBoard();
        updateScore();
        checkGameOver();
    }
}

function moveUp() {
    saveState();
    let moved = false;

    for (let col = 0; col < 4; col++) {
        let column = [];

        for (let row = 0; row < 4; row++) {
            if (board[row][col] !== 0) column.push(board[row][col]);
        }

        for (let r = 0; r < column.length - 1; r++) {
            if (column[r] === column[r + 1]) {
                column[r] *= 2;
                score += column[r];
                column[r + 1] = 0;
            }
        }

        column = column.filter(x => x !== 0);

        while (column.length < 4) column.push(0);

        for (let row = 0; row < 4; row++) {
            if (board[row][col] !== column[row]) moved = true;
            board[row][col] = column[row];
        }
    }

    if (moved) {
        addRandomTile();
        drawBoard();
        updateScore();
        checkGameOver();
    }
}

function moveDown() {
    saveState();
    let moved = false;

    for (let col = 0; col < 4; col++) {
        let column = [];

        for (let row = 0; row < 4; row++) {
            if (board[row][col] !== 0) column.push(board[row][col]);
        }

        // вниз → разворот
        column.reverse();

        for (let r = 0; r < column.length - 1; r++) {
            if (column[r] === column[r + 1]) {
                column[r] *= 2;
                score += column[r];
                column[r + 1] = 0;
            }
        }

        column = column.filter(x => x !== 0);

        while (column.length < 4) column.push(0);

        // вернуть обратно
        column.reverse();

        for (let row = 0; row < 4; row++) {
            if (board[row][col] !== column[row]) moved = true;
            board[row][col] = column[row];
        }
    }

    if (moved) {
        addRandomTile();
        drawBoard();
        updateScore();
        checkGameOver();
    }
}

function canMove() {
  // если есть пустая клетка — можно
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true;
    }
  }
  // проверим соседей по горизонтали
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === board[r][c + 1]) return true;
    }
  }
  // и по вертикали
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function finishGame() {
  gameOver = true;
  const text = document.getElementById("game-over-text");
  if (text) text.textContent = "Игра окончена! Ваш счет: " + score;
  // показываем модалку
  if (gameOverModal) gameOverModal.classList.remove("hidden");
}

function saveScore() {
  const name = (usernameInput && usernameInput.value.trim()) || "Аноним";
  const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
  leaders.push({ name, score, date: new Date().toISOString() });
  leaders.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaders", JSON.stringify(leaders.slice(0, 10)));
  // UI-подтверждение
  const text = document.getElementById("game-over-text");
  if (text) text.textContent = "Ваш рекорд сохранен.";
  if (usernameInput) usernameInput.style.display = "none";
  if (saveScoreBtn) saveScoreBtn.style.display = "none";
  renderLeadersList();
}

function renderLeadersList() {
  clearChildren(leaderboardTable);
  // Заголовок таблицы
  const header = document.createElement("tr");
  header.innerHTML = "<th>Имя</th><th>Очки</th><th>Дата</th>";
  leaderboardTable.appendChild(header);

  const leaders = JSON.parse(localStorage.getItem("leaders") || "[]");
  if (leaders.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "Пока нет рекордов";
    row.appendChild(cell);
    leaderboardTable.appendChild(row);
    return;
  }
  leaders.forEach(l => {
    const row = document.createElement("tr");
    const nameTd = document.createElement("td");
    const scoreTd = document.createElement("td");
    const dateTd = document.createElement("td");
    nameTd.textContent = l.name;
    scoreTd.textContent = l.score;
    dateTd.textContent = (new Date(l.date)).toLocaleString();
    row.appendChild(nameTd);
    row.appendChild(scoreTd);
    row.appendChild(dateTd);
    leaderboardTable.appendChild(row);
  });
}

function showLeaders() {
  renderLeadersList();
  leaderboardModal.classList.remove("hidden");
  // скрываем мобильные контролы/кнопки при просмотре (если есть)
}

function saveToStorage() {
  try {
    localStorage.setItem("2048_state", JSON.stringify({
      board, score, gameOver
    }));
  } catch (e) {
    // ignore
  }
}

function loadFromStorage() {
  try {
    const s = JSON.parse(localStorage.getItem("2048_state") || "null");
    if (s && s.board) {
      board = s.board;
      score = s.score || 0;
      gameOver = !!s.gameOver;
      drawBoard();
      updateScore();
      if (gameOver) {
        if (gameOverModal) gameOverModal.classList.remove("hidden");
      }
      return;
    }
  } catch (e) { /* ignore */ }
  // если нет сохранения — создаём новую игру
  createGrid();
}

// События
window.addEventListener("keydown", (e) => {
  if (gameOver) return;
  switch (e.key) {
    case "ArrowLeft": e.preventDefault(); moveLeft(); break;
    case "ArrowRight": e.preventDefault(); moveRight(); break;
    case "ArrowUp": e.preventDefault(); moveUp(); break;
    case "ArrowDown": e.preventDefault(); moveDown(); break;
    case "u": // клавиша 'u' для undo
    case "U":
      undo(); break;
    default: break;
  }
});

undoBtn && undoBtn.addEventListener("click", () => undo());
restartBtn && restartBtn.addEventListener("click", () => { createGrid(); saveToStorage(); });
leadersBtn && leadersBtn.addEventListener("click", () => showLeaders());
saveScoreBtn && saveScoreBtn.addEventListener("click", () => saveScore());
closeModalBtn && closeModalBtn.addEventListener("click", () => { if (gameOverModal) gameOverModal.classList.add("hidden"); });
closeLeadersBtn && closeLeadersBtn.addEventListener("click", () => { if (leaderboardModal) leaderboardModal.classList.add("hidden"); });

// touch (свайпы) — простая реализация
let touchStartX = 0, touchStartY = 0;
grid && grid.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
grid && grid.addEventListener("touchend", (e) => {
  if (!touchStartX && !touchStartY) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) < 30) return; // шум
  if (absX > absY) {
    if (dx > 0) moveRight(); else moveLeft();
  } else {
    if (dy > 0) moveDown(); else moveUp();
  }
  touchStartX = touchStartY = 0;
});

// старт
loadFromStorage();
renderLeadersList();
updateScore();

// сохраняем перед выгрузкой страницы
window.addEventListener("beforeunload", () => saveToStorage());
