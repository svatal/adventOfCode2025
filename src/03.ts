// import { testInput as input } from "./03-input";
import { input } from "./03-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => line.split(``).map(Number));
  const first = parsed.reduce((acc, curr) => acc + getMax(curr, 2), 0);
  const second = parsed.reduce((acc, curr) => acc + getMax(curr, 12), 0);
  console.log(first, second);
}

function getMax(arr: number[], digitCount: number): number {
  const first = Math.max(...arr.slice(0, arr.length - digitCount + 1));
  if (digitCount === 1) {
    return first;
  }
  const firstIndex = arr.indexOf(first);
  const next = getMax(arr.slice(firstIndex + 1), digitCount - 1);
  return first * Math.pow(10, digitCount - 1) + next;
}
