// import { testInput as input } from "./07-input";
import { input } from "./07-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => line.split(``));

  let beamIdxs = new Map<number, number>([[parsed[0].indexOf("S"), 1]]);
  let splits = 0;
  for (let i = 1; i < parsed.length; i++) {
    const nextIdxs = new Map<number, number>();
    for (const [idx, count] of beamIdxs) {
      if (parsed[i][idx] === "^") {
        nextIdxs.set(idx + 1, (nextIdxs.get(idx + 1) ?? 0) + count);
        nextIdxs.set(idx - 1, (nextIdxs.get(idx - 1) ?? 0) + count);
        splits++;
      }
      if (parsed[i][idx] === ".") {
        nextIdxs.set(idx, (nextIdxs.get(idx) ?? 0) + count);
      }
    }
    beamIdxs = nextIdxs;
  }
  const first = splits;

  const second = Array.from(beamIdxs.values()).reduce((acc, curr) => acc + curr, 0);
  console.log(first, second);
}
