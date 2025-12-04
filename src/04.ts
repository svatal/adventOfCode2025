// import { testInput as input } from "./04-input";
import { input } from "./04-input";
import { IPosition, neighbors8, valueInMap } from "./utils/position2D";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => line.split(""));
  const first = getRemovableCells().length;
  let second = 0;
  do {
    const toRemove = getRemovableCells();
    if (toRemove.length === 0) {
      break;
    }
    toRemove.forEach((pos) => {
      parsed[pos.y][pos.x] = ".";
    });
    second += toRemove.length;
  } while (true);

  console.log(first, second);

  function getRemovableCells(): IPosition[] {
    return parsed.reduce((acc, curr, currIdx) => [...acc, ...curr.map((symbol, cellIdx) => ({ x: cellIdx, y: currIdx, symbol })).filter(canBeRemoved)], [] as IPosition[]);
  }

  function canBeRemoved(cell: IPosition & { symbol: string | undefined }): boolean {
    return cell.symbol === "@" && neighbors8(cell).filter((pos) => valueInMap(parsed)(pos) === "@").length < 4;
  }
}
