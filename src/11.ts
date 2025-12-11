// import { testInput as input } from "./11-input";
import { input } from "./11-input";

export function doIt(progress: (...params: any[]) => void) {
  const parsed = input.split(`\n`).map((line) => {
    const [src, targets] = line.split(": ");
    return { src, targets: targets.split(" ") };
  });
  const map = new Map<string, string[]>(parsed.map(({ src, targets }) => [src, targets]));
  const paths = new Map<string, IPathInfo>();
  const youPathInfo = getPaths("you");
  const first = youPathInfo.simplePathCount + youPathInfo.dacPathCount + youPathInfo.fftPathCount + youPathInfo.bothPathCount;

  const second = getPaths("svr").bothPathCount;
  console.log(first, second);

  interface IPathInfo {
    simplePathCount: number;
    dacPathCount: number;
    fftPathCount: number;
    bothPathCount: number;
  }
  function getPaths(src: string): IPathInfo {
    if (paths.has(src)) {
      return paths.get(src)!;
    }
    if (src === "out") {
      return { simplePathCount: 1, dacPathCount: 0, fftPathCount: 0, bothPathCount: 0 };
    }
    const targets = map.get(src)!;
    if (targets === undefined) console.log(src);
    let pathInfo: IPathInfo = { simplePathCount: 0, dacPathCount: 0, fftPathCount: 0, bothPathCount: 0 };
    for (const target of targets) {
      const targetPathInfo = getPaths(target);
      pathInfo.simplePathCount += targetPathInfo.simplePathCount;
      pathInfo.dacPathCount += targetPathInfo.dacPathCount;
      pathInfo.fftPathCount += targetPathInfo.fftPathCount;
      pathInfo.bothPathCount += targetPathInfo.bothPathCount;
    }
    if (src === "dac") {
      pathInfo.dacPathCount += pathInfo.simplePathCount;
      pathInfo.simplePathCount = 0;
      pathInfo.bothPathCount += pathInfo.fftPathCount;
      pathInfo.fftPathCount = 0;
    } else if (src === "fft") {
      pathInfo.fftPathCount += pathInfo.simplePathCount;
      pathInfo.simplePathCount = 0;
      pathInfo.bothPathCount += pathInfo.dacPathCount;
      pathInfo.dacPathCount = 0;
    }
    paths.set(src, pathInfo);
    return pathInfo;
  }
}
