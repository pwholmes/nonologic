const gridElement = document.getElementById("grid");
const statusMessage = document.getElementById("statusMessage");
const rowCluesElement = document.getElementById("rowClues");
const colCluesElement = document.getElementById("colClues");

// Define multiple puzzles
const puzzles = [
    {
        name: "5x5 Heart",
        rows: [[2,2], [5], [5], [3], [1]],
        cols: [[3], [4], [4], [4], [3]],
    },
    {
        name: "10x10 Squirrel",
        rows: [[3], [5,1], [5,3], [5,2,1], [3,4],
               [3,3], [3,4], [9], [6,1], [5]],
        cols: [[3,2], [4,4], [9], [6,3], [4,4],
               [5], [9], [6,1], [1,1,2], [2]],
    },
    {
        name: "15x15 Compass",
        rows: [[6], [9], [3,2], [2,3,2], [2,5,2], 
               [2,5,2], [2,2,2,2], [2,5,4], [7,3], [4,3],
               [2,4], [2,1,5], [11], [9], [5]],
        cols: [[5], [9], [3,2,3], [2,3,2], [2,3,4],
               [2,4,3], [2,2,2,3], [2,4,3], [2,3,4], [2,3,3],
               [2,2,4], [2,1,1,4], [2,5], [9], [6]],
    },
    {
        name: "15x20 Gorgon",
        rows: [[3,2], [5,2], [2,8,4], [2,4,2,2], [1,5,2,1],
               [3,9,3], [4,3], [5,2], [4,3,3], [2,5,3],
               [6,3], [6,3], [6,3], [15], [13]],          
        cols: [[0], [1,1], [2,1,2], [1,1,1,1], [1,1,1,1,3],
               [5,2,5], [3,3,6], [15], [15], [2,11],
               [1,2,2,2], [2,2,2], [1,1,2], [5,2], [7,2],
               [2,1,3,2], [1,6], [1,1,5], [2,1,3], [3]],
    },
    {
        name: "15x20 Minstrel",
        rows: [[2], [1,4], [2,1,4], [2,5], [3,2,1],
               [3,2,1,2], [5,3,2], [6,1,1,3], [5,2,2], [4,6],
               [3,5], [3,1,2], [3,1,2], [8], [1,2]],
        cols: [[0], [5], [5], [4], [2,3],
               [2,4], [2,8], [5,8], [4,7], [2,1,1],
               [2,2,3], [4,3,2], [4,2], [5], [4],
               [4], [3], [2], [2], [1]],
    }

];

// Set up puzzle selection dropdown
const puzzleSelect = document.getElementById("puzzleSelect");
puzzles.forEach((puzzle, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = puzzle.name;
    puzzleSelect.appendChild(opt);
});

// Track the currently selected puzzle
let selectedPuzzle = puzzles[0];
puzzleSelect.addEventListener("change", () => {
    selectedPuzzle = puzzles[puzzleSelect.value];
});

document.getElementById("startBtn").addEventListener("click", async () => {
    await fetch("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPuzzle),
    });
    await updateGridAndStatus();
});

document.getElementById("stepBtn").addEventListener("click", async () => {
    const res = await fetch("/step", { method: "POST" });
    const data = await res.json();
    await updateGridAndStatus(data);
});

document.getElementById("solveBtn").addEventListener("click", async () => {
    let changed = true;
    while (changed) {
        const res = await fetch("/step", { method: "POST" });
        const data = await res.json();
        changed = data.changed;
        await updateGridAndStatus(data);
        await new Promise(r => setTimeout(r, 200)); // animate delay
    }
});

async function updateGridAndStatus(stepData) {
    // If stepData not passed (like on /start), fetch grid only
    let data = stepData;
    if (!data) {
        const res = await fetch("/grid");
        data = await res.json();
    }
    
    if (!data.grid) return;

    // Show clues for the selected puzzle
    renderClues(selectedPuzzle);

    // Update the grid display
    gridElement.innerHTML = "";
    data.grid.forEach(row => {
        const rowDiv = document.createElement("div");
        row.forEach(cell => {
            const div = document.createElement("div");
            div.className = "cell " + (cell === 1 ? "filled" : cell === 0 ? "empty" : "unknown");
            rowDiv.appendChild(div);
        });
        gridElement.appendChild(rowDiv);
    });
    
    // Update the status message based on solver state
    if (data.solved) {
        statusMessage.textContent = "Puzzle solved!";
        statusMessage.style.color = "green";
    } else if (stepData && !stepData.changed) {
        statusMessage.textContent = "No further progress possible.";
        statusMessage.style.color = "red";
    } else {
        statusMessage.textContent = " ";
    }
}

// Render row and column clues for the current puzzle
function renderClues(puzzle) {
    // Render row clues
    rowCluesElement.innerHTML = "";
    puzzle.rows.forEach(() => {
        const div = document.createElement("div");
        div.className = "clue-row";
        rowCluesElement.appendChild(div);
    });
    // Fill row clues text after grid is rendered for alignment

    // Render column clues
    colCluesElement.innerHTML = "";
    const maxClueLen = Math.max(...puzzle.cols.map(clue => clue.length));
    const colCluesTable = document.createElement("div");
    colCluesTable.style.display = "flex";
    colCluesTable.style.alignItems = "end";
    puzzle.cols.forEach(() => {
        const clueDiv = document.createElement("div");
        clueDiv.className = "clue-col";
        clueDiv.style.display = "flex";
        clueDiv.style.flexDirection = "column";
        clueDiv.style.alignItems = "center";
        for (let i = 0; i < maxClueLen; i++) {
            const empty = document.createElement("div");
            empty.textContent = "\u00A0";
            clueDiv.appendChild(empty);
        }
        colCluesTable.appendChild(clueDiv);
    });
    colCluesElement.appendChild(colCluesTable);

    // After grid is rendered, fill in clue numbers for alignment
    setTimeout(() => {
        // Row clues
        const rowDivs = rowCluesElement.querySelectorAll(".clue-row");
        puzzle.rows.forEach((clue, i) => {
            rowDivs[i].textContent = clue.join(" ");
        });
        // Column clues
        const colDivs = colCluesElement.querySelectorAll(".clue-col");
        puzzle.cols.forEach((clue, j) => {
            const maxClueLen = Math.max(...puzzle.cols.map(c => c.length));
            for (let k = 0; k < clue.length; k++) {
                colDivs[j].children[maxClueLen - clue.length + k].textContent = clue[k];
            }
        });

        // Set --col-clues-height CSS variable to align row clues with grid
        const colCluesDiv = document.getElementById("colClues");
        const colCluesHeight = colCluesDiv.offsetHeight;
        document.getElementById("rowClues").style.setProperty('--col-clues-height', colCluesHeight + "px");
    }, 0);
}