// -------------------------------
// Load grid
// -------------------------------
function loadGrid() {
  const data = localStorage.getItem("gridData");
  if (data) return JSON.parse(data);

  return Array.from({ length: 17 }, () =>
    Array.from({ length: 6 }, () => ({ value: 0, color: "none" }))
  );
}

function saveGrid(grid) {
  localStorage.setItem("gridData", JSON.stringify(grid));
}

let grid = loadGrid();
let dragged = null;

//  Keypad state
let keypadTarget = null;
let keypadValue = "";
let keypadMode = "edit"; // "edit" or "search"

// -------------------------------
// Build grid UI
// -------------------------------
const gridEl = document.getElementById("grid");

function getLabel(r, c) {
  const col = String.fromCharCode(65 + c); // A–F
  const row = r + 1;                       // 1–17
  return col + row;
}

function renderGrid() {
  gridEl.innerHTML = "";

  for (let r = 0; r < 17; r++) {
    for (let c = 0; c < 6; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.background = grid[r][c].color === "none"
        ? "black"
        : grid[r][c].color;

      // Label
      const label = document.createElement("div");
      label.className = "cell-label";
      label.textContent = getLabel(r, c);
      cell.appendChild(label);

      // Value
      const value = document.createElement("div");
      value.className = "cell-value";
      value.textContent = grid[r][c].value === 0 ? "·" : grid[r][c].value;
      value.style.opacity = grid[r][c].value === 0 ? "0.25" : "1";


      // Make white cells readable
      if (grid[r][c].color === "white") {
        value.style.color = "black";
      } else {
        value.style.color = "white";
      }

      cell.appendChild(value);

      // ⭐ Tap to open keypad (edit mode)
      cell.onclick = () => openKeypad(r, c, "edit");

      // Right-click for color
      cell.oncontextmenu = (e) => {
        e.preventDefault();
        const color = document.getElementById("colorPicker").value;
        grid[r][c].color = color;
        saveGrid(grid);
        renderGrid();
      };

      // Drag start
      cell.onmousedown = () => {
        dragged = { r, c };
      };

      // Drop
      cell.onmouseup = () => {
        if (dragged) {
          const temp = grid[r][c];
          grid[r][c] = grid[dragged.r][dragged.c];
          grid[dragged.r][dragged.c] = temp;
          saveGrid(grid);
          renderGrid();
        }
        dragged = null;
      };

      gridEl.appendChild(cell);
    }
  }
}

renderGrid();

// -------------------------------
//  KEYPAD LOGIC
// -------------------------------
function openKeypad(r, c, mode = "edit") {
  keypadMode = mode;

  if (mode === "edit") {
    keypadTarget = { r, c };
  } else {
    keypadTarget = null; // search mode does not target a cell
  }

  keypadValue = "";
  document.getElementById("keypad-display").textContent = "";
  document.getElementById("keypad").classList.remove("hidden");
}

function closeKeypad() {
  keypadTarget = null;
  keypadValue = "";
  document.getElementById("keypad").classList.add("hidden");
}

// Number buttons
document.querySelectorAll(".key").forEach(btn => {
  btn.onclick = () => {
    keypadValue += btn.textContent;
    document.getElementById("keypad-display").textContent = keypadValue;
  };
});

// OK button
document.getElementById("keypad-ok").onclick = () => {

  // EDIT MODE
  if (keypadMode === "edit" && keypadTarget) {
    const { r, c } = keypadTarget;
    grid[r][c].value = keypadValue === "" ? 0 : Number(keypadValue);
    saveGrid(grid);
    renderGrid();
  }

  // SEARCH MODE
  if (keypadMode === "search") {
    runSearch(keypadValue);
  }

  closeKeypad();
};

// Cancel button
document.getElementById("keypad-cancel").onclick = closeKeypad;

document.getElementById("keypad-back").onclick = () => {
  keypadValue = keypadValue.slice(0, -1);
  document.getElementById("keypad-display").textContent = keypadValue;
};

// -------------------------------
// SEARCH LOGIC 
// -------------------------------
function runSearch(query) {
  let found = false;

  for (let r = 0; r < 17; r++) {
    for (let c = 0; c < 6; c++) {
      if (String(grid[r][c].value) === query) {
        highlightCell(r, c);
        found = true;
      }
    }
  }

  if (!found) alert("Pallet not found");
}




// Search button now opens keypad
document.getElementById("searchBtn").onclick = () => {
  openKeypad(null, null, "search");
};

// -------------------------------
// Highlight cell
// -------------------------------
function highlightCell(r, c) {
  const index = r * 6 + c;
  const cell = gridEl.children[index];
  cell.classList.add("highlight");

  setTimeout(() => cell.classList.remove("highlight"), 2000);

  cell.scrollIntoView({ behavior: "smooth", block: "center" });
}

// -------------------------------
// Reset
// -------------------------------
document.getElementById("resetBtn").onclick = () => {
  grid = Array.from({ length: 17 }, () =>
    Array.from({ length: 6 }, () => ({ value: 0, color: "none" }))
  );
  saveGrid(grid);
  renderGrid();
};




