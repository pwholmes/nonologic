import time
import os
from flask import Flask, request, jsonify, send_from_directory

# Constants for cell states
FILLED = 1     # Cell is definitively filled
EMPTY = 0      # Cell is definitively empty
UNKNOWN = -1   # Cell's state is not yet determined

def generate_line_patterns(clue: list[int], length: int) -> list[list[int]]:
    """
    Generates all valid line patterns of a given length that match the clue.
    Each clue is a sequence of block lengths; valid patterns consist of FILLED blocks
    separated by at least one EMPTY cell, and padded with EMPTY cells to fit the exact length.
    """
    def helper(clue_idx: int, pos: int, line: list[int]):
        if len(line) > length:
            return
        if clue_idx == len(clue):
            if pos == length:
                results.append(line)
            elif pos < length:
                padded_line = line + [EMPTY] * (length - pos)
                results.append(padded_line)
            return

        max_start = length - sum(clue[clue_idx:]) - (len(clue) - clue_idx - 1)
        for start in range(pos, max_start + 1):
            new_line = line + [EMPTY] * (start - pos) + [FILLED] * clue[clue_idx]
            if clue_idx < len(clue) - 1:
                new_line.append(EMPTY)
            #helper(clue_idx + 1, start + clue[clue_idx] + 1, new_line)
            advance = clue[clue_idx] + (1 if clue_idx < len(clue) - 1 else 0)
            helper(clue_idx + 1, start + advance, new_line)

    results: list[list[int]] = []
    helper(0, 0, [])

    # Eliminate duplicates
    unique_results = [list(x) for x in set(tuple(p) for p in results)]

    return unique_results

def intersect_patterns(patterns: list[list[int]]) -> list[int]:
    """
    Takes a list of possible line patterns and returns a line where each cell is:
    - The common value if all patterns agree on it
    - UNKNOWN if patterns disagree
    """
    if not patterns:
        return []
    result: list[int] = []
    for cells in zip(*patterns):
        result.append(cells[0] if all(c == cells[0] for c in cells) else UNKNOWN)
    return result

def matches(partial: list[int], pattern: list[int]) -> bool:
    """
    Returns True if a pattern is compatible with the current known partial line.
    UNKNOWN values in 'partial' match anything.
    """
    return all(c == UNKNOWN or c == p for c, p in zip(partial, pattern))

def print_grid(grid: list[list[int]]):
    """
    Prints the current state of the puzzle grid to the terminal.
    FILLED = '#', EMPTY = '.', UNKNOWN = '?'
    Clears the screen before printing and adds a brief delay.
    """
    os.system('cls' if os.name == 'nt' else 'clear')
    for row in grid:
        print(''.join('#' if cell == FILLED else '.' if cell == EMPTY else '?' for cell in row))
    print()
    time.sleep(0.3)

class NonogramSolver:
    """
    Encapsulates the logic for solving a Nonogram puzzle using constraint propagation.
    Stores clues, grid state, and possible row/column patterns.
    """

    def __init__(self, row_clues: list[list[int]], col_clues: list[list[int]]):
        """
        Initializes the puzzle state.
        Precomputes all valid row and column patterns.
        """
        self.row_clues = row_clues
        self.col_clues = col_clues
        self.height = len(row_clues)
        self.width = len(col_clues)
        self.grid = [[UNKNOWN] * self.width for _ in range(self.height)]
        self.row_poss = [generate_line_patterns(clue, self.width) for clue in self.row_clues]
        self.col_poss = [generate_line_patterns(clue, self.height) for clue in self.col_clues]
        self.changed = True

    def is_solved(self) -> bool:
        """
        Returns True if the grid is completely filled with no UNKNOWNs and all clues are satisfied.
        """
        # Check for COMPLETENESS (no cells are unknown)
        if any(UNKNOWN in row for row in self.grid):
            return False

        # Check for CORRECTNESS (each row/col matches the given clues)
        for i, row in enumerate(self.grid):
            if row not in self.row_poss[i]:
                return False

        for j in range(self.width):
            col = [self.grid[i][j] for i in range(self.height)]
            if col not in self.col_poss[j]:
                return False

        return True
    
    def step(self) -> bool:
        """
        Performs one solving step:
        - Filters out impossible patterns for each row and column
        - Computes cell values that are consistent across all remaining possibilities
        - Updates the grid where new information is found
        - Returns True if any cell was updated, False otherwise
        """
        changed = False

        # Process rows
        for i in range(self.height):
            # Prune the set of possible row configurations based on the current state of the grid
            self.row_poss[i] = [p for p in self.row_poss[i] if matches(self.grid[i], p)]

            # Determine the new state of row based on the current set of possibilities.
            # intersect_patterns() examines all remaining possibilities and sets each cell as follows:
            # - A cell is 1 (FILLED) if all remaining possibilities have a 1 in that cell
            # - A cell is 1 (EMPTY) if all remaining possibilities have a 0 in that cell
            # - A cell is -1 (UNKNOWN) if the possibilities disagre about that cell
            new_row = intersect_patterns(self.row_poss[i])

            # Update the grid state with the new row.
            # If there has been any change, also updte the "changed" flag.  This is how we know if
            # we're still making progress.
            for j in range(self.width):
                if new_row[j] != UNKNOWN and self.grid[i][j] != new_row[j]:
                    self.grid[i][j] = new_row[j]
                    changed = True

        # Process columns.  Comments for this section are identical to those in the row loop above.
        for j in range(self.width):
            col = [self.grid[i][j] for i in range(self.height)]
            self.col_poss[j] = [p for p in self.col_poss[j] if matches(col, p)]
            new_col = intersect_patterns(self.col_poss[j])

            for i in range(self.height):
                if new_col[i] != UNKNOWN and self.grid[i][j] != new_col[i]:
                    self.grid[i][j] = new_col[i]
                    changed = True

        self.changed = changed
        return changed

    def solve(self):
        """
        Repeatedly performs steps until no further updates are possible.
        Prints grid after each step.
        """
        while self.step():
            print_grid(self.grid)
        return self.grid

    def get_grid(self) -> list[list[int]]:
        """
        Returns the current state of the grid.
        """
        return self.grid

    def get_total_possibilities(self) -> int:
        """Return the sum of the number of possible patterns for all rows and columns."""
        return sum(len(poss) for poss in self.row_poss) + sum(len(poss) for poss in self.col_poss)



# Flask App for Web API
app = Flask(__name__)
solver: NonogramSolver | None = None

@app.route('/')
def root():
    return send_from_directory('static', 'index.html')

@app.route("/load", methods=["POST"])
def load():
    global solver
    data = request.get_json()
    solver = NonogramSolver(data["rows"], data["cols"])
    grid = solver.get_grid()
    return jsonify({
        "grid": grid,
        "solved": solver.is_solved(),
        "changed": True,
        "total_possibilities": solver.get_total_possibilities()
    })

@app.route("/step", methods=["POST"])
def step():
    global solver
    if solver is None:
        return jsonify({"error": "No puzzle loaded"}), 400
    changed = solver.step()
    grid = solver.get_grid()
    return jsonify({
        "grid": grid,
        "solved": solver.is_solved(),
        "changed": changed,
        "total_possibilities": solver.get_total_possibilities()
    })

@app.route('/grid', methods=['GET'])
def get_grid():
    """
    Returns the current state of the grid.
    """
    if solver is None:
        return jsonify({"error": "Solver not initialized"}), 400
    return jsonify({"grid": solver.get_grid()})

if __name__ == '__main__':
    app.run(debug=True)
