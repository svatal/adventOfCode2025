// import { testInput as input } from "./06-input";
import { input } from "./06-input";

export function doIt(progress: (...params: any[]) => void) {
  const lines = input.split(`\n`);
  const parsed1: string[][] = [];
  lines.forEach((line) => line.match(/[^\s]+/g)?.forEach((n, i) => (parsed1[i] = [...(parsed1[i] || []), n])));
  const first = parsed1.map(evaluate).reduce((acc, curr) => acc + curr, 0);

  const columns = lines[0].split(``).map((_, columnIdx) =>
    lines
      .map((line) => line[columnIdx])
      .filter((n) => n !== " ")
      .join("")
  );
  let second = 0;
  let acc: string[] = [];
  columns.push("");
  columns.forEach((column) => {
    if (column === "") {
      if (acc.length === 0) return;
      const op = acc[0].slice(-1);
      acc[0] = acc[0].slice(0, -1);
      second += evaluate([...acc, op]);
      acc = [];
    } else {
      acc.push(column);
    }
  });

  console.log(first, second);
}

function evaluate(arr: string[]): number {
  const [op, ...rest] = arr.reverse();
  if (op === "+") {
    return rest.reduce((acc, curr) => acc + +curr, 0);
  } else if (op === "*") {
    return rest.reduce((acc, curr) => acc * +curr, 1);
  }
  throw "not implemented";
}
