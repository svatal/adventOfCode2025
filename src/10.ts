// import { testInput as input } from "./10-input";
import { input } from "./10-input";
import { solve, equalTo } from "yalps";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => {
    const [_, lights, buttons, joltage] = line.match(/\[(.*)\] (.*) \{(.*)\}/)!;
    return {
      lights: lights.split("").map((light) => light === "#"),
      buttons: buttons.split(" ").map((match) => match.slice(1, -1).split(",").map(Number)),
      joltage: joltage.split(",").map(Number),
    };
  });
  const first = parsed.map(({ lights, buttons }) => getStepsForLights(lights, buttons)).reduce((acc, curr) => acc + curr, 0);

  const s = parsed.map(({ buttons, joltage }) => {
    return solve({
      objective: "click",
      direction: "minimize",
      constraints: joltage.map((joltage, jIdx) => [`joiltage${jIdx}`, equalTo(joltage)]),
      variables: buttons.map((button, bIdx) => [`button${bIdx}`, [["click", 1] as const, ...button.map((idx) => [`joiltage${idx}`, 1] as const)]]),
      integers: true,
    }).result;
  });
  const second = s.reduce((acc, curr) => acc + curr, 0);
  console.log(first, second);
}

function getStepsForLights(lights: boolean[], buttons: number[][]): number {
  if (lights.every((light) => !light)) {
    return 0;
  }
  const queue = [{ currentLights: [...lights].map((_) => false), steps: 0, nextIdx: 0 }];
  do {
    const { currentLights, steps, nextIdx } = queue.shift()!;
    for (let i = nextIdx; i < buttons.length; i++) {
      const button = buttons[i];
      const nextLights = applyButtonToLights(currentLights, button);
      if (nextLights.every((light, idx) => light === lights[idx])) {
        return steps + 1;
      }
      queue.push({ currentLights: nextLights, steps: steps + 1, nextIdx: i + 1 });
    }
  } while (true);
}

function applyButtonToLights(lights: boolean[], button: number[]): boolean[] {
  const res = [...lights];
  button.forEach((idx) => (res[idx] = !res[idx]));
  return res;
}
