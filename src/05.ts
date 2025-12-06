// import { testInput as input } from "./05-input";
import { input } from "./05-input";

export function doIt(progress: (...params: any[]) => void) {
  const [rangesS, idsS] = input.split(`\n\n`);
  const ranges = rangesS.split(`\n`).map((line) => {
    const [start, end] = line.split(`-`).map((n) => +n);
    return { start, end };
  });
  const ids = idsS.split(`\n`).map((n) => +n);

  const first = ids.filter((id) => ranges.some((range) => id >= range.start && id <= range.end)).length;

  let uniqueRanges: { start: number; end: number }[] = [];
  for (let { start, end } of ranges) {
    start = uniqueRanges.find((r) => r.start <= start && r.end >= start)?.start ?? start;
    end = uniqueRanges.find((r) => r.start <= end && r.end >= end)?.end ?? end;
    uniqueRanges = uniqueRanges.filter((r) => r.start < start || r.end > end);
    uniqueRanges.push({ start, end });
  }
  const second = uniqueRanges.reduce((acc, curr) => acc + (curr.end - curr.start + 1), 0);

  console.log(first, second);
}
