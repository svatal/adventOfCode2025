// import { testInput as input } from "./12-input";
import { input } from "./12-input";
import { IPosition } from "./utils/position2D";

export function doIt(progress: (...params: any[]) => void) {
  const pattersS = input.split(`\n\n`);
  const areasS = pattersS.pop()!;
  const patterns = pattersS.map((patternS) => {
    const [idxS, ...patternLines] = patternS.split(`\n`);
    return {
      idx: +idxS.split(`:`)[0],
      pattern: patternLines.map((line) => line.split(``)),
    };
  });
  const areas = areasS.split(`\n`).map((line) => {
    const [shape, countsS] = line.split(`: `);
    const [width, height] = shape.split(`x`).map(Number);
    const counts = countsS.split(` `).map(Number);
    return { width, height, counts };
  });

  // Generate all orientations for each pattern
  const patternOrientations: Pattern[] = [];
  for (const pattern of patterns) {
    const orientations = generateAllOrientations(pattern.pattern);
    patternOrientations[pattern.idx] = orientations;
  }

  // Solve each area
  let solvableCount = 0;
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    progress(`Solving area ${i + 1}/${areas.length}`);
    if (solveArea(area, patternOrientations)) {
      solvableCount++;
    }
  }

  console.log(solvableCount);
}

function rotatePatternToRight(pattern: string[][]): string[][] {
  const rows = pattern.length;
  const cols = pattern[0].length;
  return Array.from({ length: cols }, (_, rowIdx) => Array.from({ length: rows }, (_, cellIdx) => pattern[rows - 1 - cellIdx][rowIdx]));
}

function flipPattern(pattern: string[][]): string[][] {
  return pattern.map((row) => row.reverse());
}

function isSamePattern(pattern1: string[][], pattern2: string[][]): boolean {
  if (pattern1.length !== pattern2.length) return false;
  return pattern1.every((row, rowIdx) => {
    if (row.length !== pattern2[rowIdx].length) return false;
    return row.every((cell, cellIdx) => pattern2[rowIdx][cellIdx] === cell);
  });
}

interface Pattern {
  orientations: PatternOrientation[];
  area: number;
}

interface PatternOrientation {
  pattern: string[][];
  rowIntervals: Interval[][];
  width: number;
  height: number;
}

function generateAllOrientations(pattern: string[][]): Pattern {
  const candidates: string[][][] = [];
  for (let rot = 0; rot < 4; rot++) {
    candidates.push(pattern, flipPattern(pattern));
    pattern = rotatePatternToRight(pattern);
  }
  const orientations: PatternOrientation[] = [];
  const seen: string[][][] = [];
  for (const candidate of candidates) {
    if (!seen.some((p) => isSamePattern(p, candidate))) {
      seen.push(candidate);
      orientations.push({
        pattern: candidate,
        rowIntervals: toRowIntervals(candidate),
        width: candidate[0]?.length ?? 0,
        height: candidate.length,
      });
    }
  }

  return {
    orientations,
    area: pattern.reduce((acc, row) => acc + row.filter((cell) => cell === "#").length, 0),
  };
}

interface AbsoluteInterval {
  offset: IPosition;
  length: number;
}

function toRowIntervals(pattern: string[][]): Interval[][] {
  return pattern.map((row) => {
    const intervals: Interval[] = [];
    let currentStart = -1;
    row.forEach((cell, cellIdx) => {
      if (cell === "#") {
        if (currentStart === -1) {
          currentStart = cellIdx;
        }
      } else {
        if (currentStart !== -1) {
          intervals.push({ x: currentStart, length: cellIdx - currentStart });
          currentStart = -1;
        }
      }
    });
    if (currentStart !== -1) {
      intervals.push({ x: currentStart, length: row.length - currentStart });
    }
    return intervals;
  });
}

interface Interval {
  x: number;
  length: number;
}

interface EmptySpaceOnRow {
  intervals: Interval[];
  maxLength: number;
}

function match(available: EmptySpaceOnRow, occupy: Interval): EmptySpaceOnRow | undefined {
  const resSpace: Interval[] = [];
  const occupyEnd = occupy.x + occupy.length;

  for (let idx = 0; idx < available.intervals.length; idx++) {
    const int = available.intervals[idx];
    const intEnd = int.x + int.length;

    if (intEnd < occupy.x) {
      // Interval is completely before occupy, keep it
      resSpace.push(int);
    } else if (int.x > occupyEnd) {
      // Interval is completely after occupy, keep it and all remaining
      resSpace.push(int, ...available.intervals.slice(idx + 1));
      break;
    } else if (int.x <= occupy.x && intEnd >= occupyEnd) {
      // Interval completely contains occupy, split it
      if (int.x < occupy.x) {
        resSpace.push({ x: int.x, length: occupy.x - int.x });
      }
      if (intEnd > occupyEnd) {
        resSpace.push({ x: occupyEnd, length: intEnd - occupyEnd });
      }
      resSpace.push(...available.intervals.slice(idx + 1));
      break;
    }
  }

  const maxLength = resSpace.reduce((acc, curr) => Math.max(acc, curr.length), 0);
  return { intervals: resSpace, maxLength };
}

interface AreaState {
  rows: EmptySpaceOnRow[];
  width: number;
  height: number;
}

function createInitialState(width: number, height: number): AreaState {
  const rows: EmptySpaceOnRow[] = [];
  for (let y = 0; y < height; y++) {
    rows.push({
      intervals: [{ x: 0, length: width }],
      maxLength: width,
    });
  }
  return { rows, width, height };
}

function canPlacePattern(state: AreaState, orientation: PatternOrientation, x: number, y: number): boolean {
  // Check bounds
  if (x < 0 || y < 0 || x + orientation.width > state.width || y + orientation.height > state.height) {
    return false;
  }

  // Check each row of the pattern
  for (let rowIdx = 0; rowIdx < orientation.rowIntervals.length; rowIdx++) {
    const patternRow = orientation.rowIntervals[rowIdx];
    if (patternRow.length === 0) continue; // Empty row, skip

    const stateRow = state.rows[y + rowIdx];
    if (!stateRow) return false;

    // Check each interval in this pattern row
    for (const patternInterval of patternRow) {
      const actualX = x + patternInterval.x;
      const actualInterval: Interval = { x: actualX, length: patternInterval.length };

      // Check if this interval fits in available space
      let fits = stateRow.intervals.some((int) => int.x <= actualInterval.x && int.x + int.length >= actualInterval.x + actualInterval.length);
      if (!fits) {
        return false;
      }
    }
  }

  return true;
}

function placePattern(state: AreaState, orientation: PatternOrientation, x: number, y: number): AreaState | undefined {
  if (!canPlacePattern(state, orientation, x, y)) {
    return undefined;
  }

  // Create new state with updated rows
  const newRows: EmptySpaceOnRow[] = [];
  for (let rowIdx = 0; rowIdx < state.rows.length; rowIdx++) {
    let row = state.rows[rowIdx];
    if (rowIdx < y || rowIdx >= y + orientation.height) {
      // Row not affected, copy as is
      newRows.push(row);
    } else {
      // This row is affected by the pattern
      const patternRow = orientation.rowIntervals[rowIdx - y];
      if (patternRow.length === 0) {
        newRows.push(row); // Empty pattern row, no change
      } else {
        // Remove each pattern interval from available space
        for (const patternInterval of patternRow) {
          const actualX = x + patternInterval.x;
          const actualInterval: Interval = { x: actualX, length: patternInterval.length };

          const result = match(row, actualInterval);
          if (!result) {
            return undefined; // Should not happen if canPlacePattern worked
          }
          row = result;
        }
        newRows.push(row);
      }
    }
  }

  return {
    ...state,
    rows: newRows,
  };
}

interface PatternTask {
  patternIdx: number;
  count: number;
  pattern: Pattern;
  area: number;
}

function solveArea(area: { width: number; height: number; counts: number[] }, patterns: Pattern[]): boolean {
  // Early pruning: check if total area matches
  const totalArea = area.width * area.height;
  let totalPatternArea = 0;
  const tasks: PatternTask[] = [];

  for (let i = 0; i < area.counts.length; i++) {
    if (area.counts[i] > 0) {
      const pattern = patterns[i];
      if (pattern.orientations.length === 0) {
        return false; // No valid orientations
      }
      const patternArea = pattern.area;
      totalPatternArea += patternArea * area.counts[i];
      tasks.push({
        patternIdx: i,
        count: area.counts[i],
        pattern,
        area: patternArea,
      });
    }
  }

  if (totalPatternArea > totalArea) {
    return false; // Impossible: patterns need more space than available
  }

  // Sort tasks by area (largest first) and then by number of orientations (fewer first)
  tasks.sort((a, b) => {
    if (b.area !== a.area) return b.area - a.area;
    return a.pattern.orientations.length - b.pattern.orientations.length;
  });

  const initialState = createInitialState(area.width, area.height);

  function solveRecursive(state: AreaState, taskIdx: number, remainingCounts: number[]): boolean {
    if (taskIdx >= tasks.length) {
      return true; // All patterns placed
    }

    const task = tasks[taskIdx];
    if (remainingCounts[task.patternIdx] === 0) {
      return solveRecursive(state, taskIdx + 1, remainingCounts);
    }

    // Try each orientation
    for (const orientation of task.pattern.orientations) {
      // Try each position
      for (let y = 0; y <= state.height - orientation.height; y++) {
        // Find valid x positions for this row
        const stateRow = state.rows[y];
        if (!stateRow || stateRow.maxLength < orientation.width) {
          continue; // Skip this row, pattern won't fit
        }

        // Try x positions where pattern could fit
        for (const availableInterval of stateRow.intervals) {
          if (availableInterval.length < orientation.width) continue;

          for (let x = availableInterval.x; x <= availableInterval.x + availableInterval.length - orientation.width; x++) {
            const newState = placePattern(state, orientation, x, y);
            if (newState) {
              const newRemainingCounts = [...remainingCounts];
              newRemainingCounts[task.patternIdx]--;
              if (solveRecursive(newState, taskIdx, newRemainingCounts)) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  }

  return solveRecursive(initialState, 0, [...area.counts]);
}
