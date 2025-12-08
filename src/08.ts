// import { testInput as input } from "./08-input";
import { input } from "./08-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => line.split(`,`).map(Number));
  const edges: { idx1: number; idx2: number; dist: number }[] = [];
  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      edges.push({ idx1: i, idx2: j, dist: dist(parsed[i], parsed[j]) });
    }
  }
  edges.sort((a, b) => a.dist - b.dist);

  let edgeCount = 0;
  let partitions = parsed.length;
  const groups = new Map(parsed.map((_, idx) => [idx, idx]));
  for (const { idx1, idx2 } of edges) {
    edgeCount++;
    const g1 = groups.get(idx1)!;
    const g2 = groups.get(idx2)!;
    if (g1 !== g2) {
      partitions--;
      groups.forEach((group, idx) => {
        if (group === g2) {
          groups.set(idx, g1);
        }
      });
      if (partitions === 1) {
        console.log("second:", parsed[idx1][0] * parsed[idx2][0]);
        break;
      }
    }
    if (edgeCount === 1000) {
      const groupsGrouped = Array.from(
        Array.from(groups.values())
          .reduce((acc, curr) => {
            acc.set(curr, (acc.get(curr) ?? 0) + 1);
            return acc;
          }, new Map<number, number>())
          .values()
      ).sort((a, b) => b - a);
      console.log("first:", groupsGrouped[0] * groupsGrouped[1] * groupsGrouped[2]);
    }
  }
}

function dist(p1: number[], p2: number[]) {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2);
}
