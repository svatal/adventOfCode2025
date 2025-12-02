// import { testInput as input } from "./02-input";
import { input } from "./02-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`,`).map(
    (line) => line.split(`-`) //
  );
  const invalidIds1: number[] = [];
  const invalidIds2: Set<number> = new Set();
  for (const [start, end] of parsed) {
    generateInvalidIds1(start, end, invalidIds1);
    generateInvalidIds2(start, end, invalidIds2);
  }
  const first = invalidIds1.reduce((acc, curr) => acc + curr, 0);
  const second = Array.from(invalidIds2).reduce((acc, curr) => acc + curr, 0);
  console.log(first, second);
}

function generateInvalidIds1(start: string, end: string, invalidIds: number[]) {
  const firstPart = start.substring(0, Math.floor(start.length / 2));
  let startNumHalf = start.length % 2 === 0 ? +firstPart : Math.pow(10, Math.ceil(start.length / 2) - 1);
  do {
    const num = +`${startNumHalf}${startNumHalf}`;
    startNumHalf++;
    if (num < +start) {
      continue;
    }
    if (num > +end) {
      break;
    }
    invalidIds.push(num);
  } while (true);
}

function generateInvalidIds2(start: string, end: string, invalidIds: Set<number>) {
  const startNum = +start;
  const endNum = +end;
  for (let partCount = 2; partCount <= end.length; partCount++) {
    const partLength = Math.ceil(start.length / partCount);
    let startNumPart = Math.pow(10, partLength - 1);
    do {
      const num = +startNumPart.toString().repeat(partCount);
      startNumPart++;
      if (num < startNum) {
        continue;
      }
      if (num > endNum) {
        break;
      }
      invalidIds.add(num);
    } while (true);
  }
}
