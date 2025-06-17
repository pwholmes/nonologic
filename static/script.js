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
    },
    {
        name: "30x45 Frankenstein",
        rows: [[1,21], [1,2,20], [1,2,20], [5,1,20], [6,1,19],
               [3,2,16], [1,2,1,2,13], [5,1,5,11], [1,1,1,7,9], [1,2,2,1,4,3,8],
               [1,2,1,4,4,8], [1,4,1,2,1,4,7], [1,3,3,2,3,7], [1,1,2,4,5,6], [4,1,1,1,3,1,1,5],
               [4,1,1,3,2,3,5], [4,1,1,3,3,4,5], [4,1,2,3,5,5], [4,1,1,5,5,4], [4,1,1,1,1,3,5,4],
               [3,1,1,2,2,1,2,4], [3,2,1,2,4,1,4], [3,2,1,6,3,5], [4,1,1,1,3,3,5], [3,2,1,1,1,3,5,5],
               [2,5,1,2,1,1,5], [2,2,1,2,4,1,1,5], [2,2,3,1,6], [3,6,2,9], [7,6,2,9], 
               [6,6,2,9], [6,3,2,2,1,9], [6,4,1,3,7], [7,4,1,2,1,5], [7,2,2,3,2,4],
               [7,5,2,7,2], [8,4,3,4,1], [8,5,6,2,1,1], [8,2,7,2,1], [8,2,8,1],
               [11,3,8,1,], [6,1,2,3,1,2], [4,2,1,2,2,1,3], [4,1,2,3], [6,6,11]],
        cols: [[1,1,36], [4,2,30], [2,1,1,2,11,16], [4,3,2,6,1,2,15], [5,1,2,3,4,13,1],
               [5,3,4,2,2,2,1,13,1], [2,3,1,1,8,1,1], [9,2,3,5,1,1], [3,1,2,2,7,1,1], [1,2,2,2,12,2,1],
               [4,4,3,2,7,2,4,1,2], [5,4,3,1,6,1,3,1], [5,7,5,3,3,1], [5,9,9,2,1,1,3,1], [6,4,6,3,2,2,1,1],
               [6,5,7,4,1,1,6,1], [6,2,1,4,4,1,3,6,1], [7,1,3,2,3,3,2,8], [7,7,1,2,3,7], [8,5,1,1,1,1,2,5,1],
               [8,3,1,5,5,2,4,1,1], [9,1,5,3,4,1,2,3,1,1], [11,7,5,4,3,2,1], [13,6,1,5,4,1,1], [14,4,6,3,1,2,1],
               [18,12,1,2,1], [35,1], [35,3], [36,4], [45]],
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

const stepBtn = document.getElementById("stepBtn");
const solveBtn = document.getElementById("solveBtn");
const loadBtn = document.getElementById("loadBtn");

function setBusy(busy) {
    loadBtn.disabled = busy;
    stepBtn.disabled = busy || stepBtn._forceDisabled;
    solveBtn.disabled = busy || solveBtn._forceDisabled;
    document.body.style.cursor = busy ? "wait" : "";
}

// Track the currently selected puzzle
let selectedPuzzle = puzzles[0];
puzzleSelect.addEventListener("change", () => {
    selectedPuzzle = puzzles[puzzleSelect.value];
    stepBtn.disabled = true;
    stepBtn._forceDisabled = true;
    solveBtn.disabled = true;
    solveBtn._forceDisabled = true;
});

// Enable Step and Solve after Load is pressed
loadBtn.addEventListener("click", async () => {
    setBusy(true);
    statusMessage.textContent = "Please wait, loading...";
    statusMessage.style.color = "";
    try {
        await fetch("/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedPuzzle),
        });
        stepBtn._forceDisabled = false;
        solveBtn._forceDisabled = false;
        stepBtn.disabled = false;
        solveBtn.disabled = false;
        await updateGridAndStatus();
    } finally {
        setBusy(false);
    }
});

stepBtn.addEventListener("click", async () => {
    setBusy(true);
    statusMessage.textContent = "Please wait, processing...";
    statusMessage.style.color = "";
    try {
        const res = await fetch("/step", { method: "POST" });
        const data = await res.json();
        await updateGridAndStatus(data);
    } finally {
        setBusy(false);
    }
});

solveBtn.addEventListener("click", async () => {
    setBusy(true);
    statusMessage.textContent = "Solving...";
    statusMessage.style.color = "";
    stepBtn._forceDisabled = true;
    solveBtn._forceDisabled = true;
    stepBtn.disabled = true;
    solveBtn.disabled = true;
    try {
        let changed = true;
        while (changed) {
            const res = await fetch("/step", { method: "POST" });
            const data = await res.json();
            changed = data.changed;
            await updateGridAndStatus(data, true, false); // preserveStatus=true, isFinal=false
            await new Promise(r => setTimeout(r, 200)); // animate delay
        }
        // After solving, show final status (isFinal=true)
        await updateGridAndStatus(undefined, false, true);
    } finally {
        setBusy(false);
        // Step and Solve remain disabled after Solve is complete
    }
});

async function updateGridAndStatus(stepData, preserveStatus = false, isFinal = false) {
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

    // Only clear the status if not preserving status and not a final message
    if (data.solved) {
        statusMessage.textContent = "Puzzle solved!";
        statusMessage.style.color = "green";
    } else if (stepData && !stepData.changed) {
        statusMessage.textContent = "No further progress possible.";
        statusMessage.style.color = "red";
    } else if (!preserveStatus && !isFinal) {
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