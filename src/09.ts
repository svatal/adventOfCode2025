// import { testInput as input } from "./09-input";
import { input } from "./09-input";
import { IPosition } from "./utils/position2D";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => {
    const [x, y] = line.split(",").map(Number);
    return { x, y };
  });
  // optimalization to reduce the number of candidates, not really needed - still finishes under 1s without it
  // const ppCandidates = getCandidates(true, true);
  // const npCandidates = getCandidates(false, true);
  // const pnCandidates = getCandidates(true, false);
  // const nnCandidates = getCandidates(false, false);
  // let first = Math.max(maxSqare(ppCandidates, nnCandidates), maxSqare(npCandidates, pnCandidates));
  const first = maxSqare(parsed, parsed);

  const horizontalBoundaryPoss: IPosition[] = [];
  const verticalBoundaryPoss: IPosition[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const red1 = parsed[i];
    const red2 = parsed[(i + 1) % parsed.length];
    // include the lower boundary, but not the upper boundary - we actually care about the space between the points, not the points themselves (=> shift half down)
    if (red1.y === red2.y) {
      const minX = Math.min(red1.x, red2.x);
      const maxX = Math.max(red1.x, red2.x);
      for (let ii = minX; ii < maxX; ii++) {
        horizontalBoundaryPoss.push({ x: ii, y: red1.y });
      }
    } else {
      const minY = Math.min(red1.y, red2.y);
      const maxY = Math.max(red1.y, red2.y);
      for (let ii = minY; ii < maxY; ii++) {
        verticalBoundaryPoss.push({ x: red1.x, y: ii });
      }
    }
  }
  const horizontalBoundaries = new Map<number, number[]>();
  for (const pos of horizontalBoundaryPoss) {
    if (!horizontalBoundaries.has(pos.x)) {
      horizontalBoundaries.set(pos.x, []);
    }
    horizontalBoundaries.get(pos.x)!.push(pos.y);
  }
  const columns = new Map(
    [...horizontalBoundaries.entries()].map(([x, ys]) => {
      ys.sort((a, b) => a - b);
      const ranges = [];
      for (let i = 0; i < ys.length; i += 2) {
        const y1 = ys[i];
        const y2 = ys[i + 1];
        if (y2 === undefined) {
          break;
        }
        ranges.push({ y1, y2 });
      }
      return [x, ranges];
    })
  );
  let second = 0;
  for (const c1 of parsed) {
    for (const c2 of parsed) {
      const xMin = Math.min(c1.x, c2.x);
      const xMax = Math.max(c1.x, c2.x);
      const yMin = Math.min(c1.y, c2.y);
      const yMax = Math.max(c1.y, c2.y);
      let isOk = true;
      for (let i = xMin; i < xMax; i++) {
        const ranges = columns.get(i);
        if (ranges === undefined) {
          continue;
        }
        const range = ranges.find((range) => yMin >= range.y1 && yMax <= range.y2);
        if (range === undefined) {
          isOk = false;
          break;
        }
      }
      if (!isOk) {
        continue;
      }
      const area = (Math.abs(c1.x - c2.x) + 1) * (Math.abs(c1.y - c2.y) + 1);
      second = Math.max(second, area);
    }
  }

  console.log(first, second);

  // function getCandidates(xPlus: boolean, yPlus: boolean): IPosition[] {
  //   let candidates = [...parsed];
  //   const validated: IPosition[] = [];
  //   const xBetter = xPlus ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
  //   const yBetter = yPlus ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
  //   do {
  //     let testing = candidates.pop()!;
  //     for (const other of candidates) {
  //       if ((xBetter(other.x, testing.x) || other.x === testing.x) && (yBetter(other.y, testing.y) || other.y === testing.y)) {
  //         testing = other;
  //       }
  //     }
  //     validated.push(testing);
  //     candidates = candidates.filter((c) => xBetter(c.x, testing.x) || yBetter(c.y, testing.y));
  //   } while (candidates.length > 0);
  //   return validated;
  // }

  function maxSqare(candidates1: IPosition[], candidates2: IPosition[]): number {
    let max = 0;
    for (const c1 of candidates1) {
      for (const c2 of candidates2) {
        max = Math.max(max, (Math.abs(c1.x - c2.x) + 1) * (Math.abs(c1.y - c2.y) + 1));
      }
    }
    return max;
  }
}
