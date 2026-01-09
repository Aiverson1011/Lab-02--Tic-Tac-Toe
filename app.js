// Tic-Tac-Toe: HTML/CSS/JS only

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const cpuToggle = document.getElementById("cpuToggle");

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let state;


const playerXInput = document.getElementById("playerX");
const playerOInput = document.getElementById("playerO");


// ----- Game state helpers -----
function newGameState() {
  return {
    board: Array(9).fill(null),
    current: "X",
    winner: null,
    winLine: null,
    vsCPU: false,
    locked: false,
    players: {
      X: "Player X",
      O: "Player O",
    },
  };
}


function getWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winLine: line };
    }
  }
  const isDraw = board.every((cell) => cell !== null);
  if (isDraw) return { winner: "draw", winLine: null };
  return { winner: null, winLine: null };
}

// --- Player Management --- 

function updatePlayerNames() {
  state.players.X = playerXInput.value.trim() || "Player X";

  if (state.vsCPU) {
    state.players.O = "CPU";
    playerOInput.disabled = true;
  } else {
    state.players.O = playerOInput.value.trim() || "Player O";
    playerOInput.disabled = false;
  }
}




// ----- Rendering -----
function render() {
  boardEl.innerHTML = "";

  state.board.forEach((value, idx) => {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Cell ${idx + 1}`);
    btn.textContent = value ?? "";

    const disabled =
      state.locked || state.winner !== null || state.board[idx] !== null;
    btn.disabled = disabled;

    if (state.winLine && state.winLine.includes(idx)) {
      btn.classList.add("win");
    }

    btn.addEventListener("click", () => handleMove(idx));
    boardEl.appendChild(btn);
  });

  statusEl.textContent = getStatusText();
}

function getStatusText() {
  if (state.winner === "draw") return "It’s a draw.";

  if (state.winner) {
    return `${state.players[state.winner]} wins!`;
  }

  return `${state.players[state.current]}’s turn`;
}


// ----- Moves -----
function handleMove(index) {
  if (state.locked) return;
  if (state.winner) return;
  if (state.board[index] !== null) return;

  placeMark(index, state.current);

  playerXInput.disabled = true;
  playerOInput.disabled = true;


  // If vs CPU and it's now O's turn, make CPU move
  if (!state.winner && state.vsCPU && state.current === "O") {
    cpuMove();
  }
}

function placeMark(index, mark) {
  state.board[index] = mark;

  const result = getWinner(state.board);
  state.winner = result.winner;
  state.winLine = result.winLine;

  if (!state.winner) {
    state.current = mark === "X" ? "O" : "X";
  }

  render();
}

// ----- CPU (simple but not terrible) -----
// Strategy: win if possible, block if needed, otherwise center, then corners, then sides.
function cpuMove() {
  state.locked = true;
  render();

  // Small delay so it feels like the CPU "thinks"
  setTimeout(() => {
    const idx = pickCpuIndex(state.board);
    if (idx !== null && state.current === "O" && !state.winner) {
      placeMark(idx, "O");
    }
    state.locked = false;
    render();
  }, 250);
}

function pickCpuIndex(board) {
  const empty = board
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);

  // 1) Win
  for (const i of empty) {
    const copy = board.slice();
    copy[i] = "O";
    if (getWinner(copy).winner === "O") return i;
  }

  // 2) Block X
  for (const i of empty) {
    const copy = board.slice();
    copy[i] = "X";
    if (getWinner(copy).winner === "X") return i;
  }

  // 3) Center
  if (board[4] === null) return 4;

  // 4) Corners
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // 5) Sides
  const sides = [1, 3, 5, 7].filter((i) => board[i] === null);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  return null;
}

// ----- Events -----
resetBtn.addEventListener("click", () => {
  const keepCpuSetting = state?.vsCPU ?? false;
  state = newGameState();
  state.vsCPU = keepCpuSetting;
  cpuToggle.checked = keepCpuSetting;
  playerXInput.disabled = false;
  playerOInput.disabled = false;

  render();
});

cpuToggle.addEventListener("change", (e) => {
  state.vsCPU = e.target.checked;

  // If they toggle CPU on while it's O's turn, let CPU play immediately
  if (!state.winner && state.vsCPU && state.current === "O") {
    cpuMove();
  }
  render();
});

playerXInput.addEventListener("input", () => {
  updatePlayerNames();
  render();
});

playerOInput.addEventListener("input", () => {
  updatePlayerNames();
  render();
});

cpuToggle.addEventListener("change", (e) => {
  state.vsCPU = e.target.checked;
  updatePlayerNames();

  if (!state.winner && state.vsCPU && state.current === "O") {
    cpuMove();
  }
  render();
});


// ----- Init -----
state = newGameState();
render();
