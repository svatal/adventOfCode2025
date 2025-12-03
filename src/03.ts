// import { testInput as input } from "./03-input";
import { input } from "./03-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => line.split(``).map(Number));
  const first = parsed.reduce((acc, curr) => {
    const first = Math.max(...curr.slice(0, curr.length - 1));
    const firstIndex = curr.indexOf(first);
    const second = Math.max(...curr.slice(firstIndex + 1));
    return acc + first * 10 + second;
  }, 0);
  const second = parsed.reduce((acc, curr) => {
    const max = getMax(curr, 12);
    console.log(max);
    return acc + max;
  }, 0);
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
