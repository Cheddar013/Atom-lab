const canvas = document.getElementById('sandboxCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 4;
const COLS = 125; // 500px / 4
const ROWS = 125;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

// Grid storage: 0 = Leeg, 1 = Zand, 2 = Water, 3 = Muur, 4 = Vuur, 5 = Hout
let grid = createGrid();
let currentElement = 'sand';
let isMouseDown = false;

function createGrid() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

const ELEMENT_MAP = {
  sand: 1,
  water: 2,
  wall: 3,
  fire: 4,
  wood: 5,
  erase: 0
};

const COLOR_MAP = {
  0: '#000000', // Leeg
  1: '#facc15', // Zand (Geel)
  2: '#3b82f6', // Water (Blauw)
  3: '#6b7280', // Muur (Grijs)
  4: '#ef4444', // Vuur (Rood)
  5: '#854d0e'  // Hout (Bruin)
};

// Event Listeners voor UI
document.querySelectorAll('.element-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentElement = e.target.dataset.type;
  });
});

document.getElementById('clear-btn').addEventListener('click', () => {
  grid = createGrid();
});

// Muis Interactie
canvas.addEventListener('mousedown', () => isMouseDown = true);
canvas.addEventListener('mouseup', () => isMouseDown = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!isMouseDown) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  // Borstelgrootte (2x2)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
        grid[ny][nx] = ELEMENT_MAP[currentElement];
      }
    }
  }
}

// Simuleringslogica (Falling Sand Mechanics)
function updatePhysics() {
  let nextGrid = grid.map(row => [...row]);

  for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      const cell = grid[y][x];

      // Zand Logica
      if (cell === 1) {
        if (y + 1 < ROWS && grid[y + 1][x] === 0) {
          nextGrid[y][x] = 0;
          nextGrid[y + 1][x] = 1;
        } else if (y + 1 < ROWS && x - 1 >= 0 && grid[y + 1][x - 1] === 0) {
          nextGrid[y][x] = 0;
          nextGrid[y + 1][x - 1] = 1;
        } else if (y + 1 < ROWS && x + 1 < COLS && grid[y + 1][x + 1] === 0) {
          nextGrid[y][x] = 0;
          nextGrid[y + 1][x + 1] = 1;
        }
      }

      // Water Logica
      else if (cell === 2) {
        if (y + 1 < ROWS && grid[y + 1][x] === 0) {
          nextGrid[y][x] = 0;
          nextGrid[y + 1][x] = 2;
        } else {
          const dir = Math.random() < 0.5 ? -1 : 1;
          if (x + dir >= 0 && x + dir < COLS && grid[y][x + dir] === 0) {
            nextGrid[y][x] = 0;
            nextGrid[y + dir ? y : y][x + dir] = 2;
          }
        }
      }

      // Vuur Logica
      else if (cell === 4) {
        if (Math.random() < 0.2) {
          nextGrid[y][x] = 0; // Vuur dooft uit
        } else {
          // Steek hout aan
          const neighbors = [
            [y-1, x], [y+1, x], [y, x-1], [y, x+1]
          ];
          for (let [ny, nx] of neighbors) {
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && grid[ny][nx] === 5) {
              nextGrid[ny][nx] = 4;
            }
          }
        }
      }
    }
  }

  grid = nextGrid;
}

// Rendering Function
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const type = grid[y][x];
      if (type !== 0) {
        ctx.fillStyle = COLOR_MAP[type];
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

// Main Game Loop
function loop() {
  updatePhysics();
  render();
  requestAnimationFrame(loop);
}

loop();
