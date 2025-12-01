// import { testInput as input } from "./01-input";
import { input } from "./01-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => {
    const [dir, ...clicks] = line;
    return { dir, clicks: +clicks.join("") };
  });
  console.log(getFirst(), getSecond());

  function getFirst() {
    let num = 50;
    let zeros = 0;
    for (const { dir, clicks } of parsed) {
      if (dir === "L") {
        num -= clicks;
      } else {
        num += clicks;
      }
      num = ((num % 100) + 100) % 100;
      if (num === 0) {
        zeros++;
      }
    }
    return zeros;
  }

  function getSecond() {
    let num = 50;
    let zeros = 0;
    for (const { dir, clicks } of parsed) {
      const prevnum = num;
      if (dir === "L") {
        num -= clicks;
        while (num < 0) {
          num += 100;
          zeros++;
        }
        if (num === 0) {
          zeros++;
        }
        if (prevnum === 0) {
          zeros--; // revert one back
        }
      } else {
        num += clicks;
        while (num >= 100) {
          num -= 100;
          zeros++;
        }
      }
    }
    return zeros;
  }
}
