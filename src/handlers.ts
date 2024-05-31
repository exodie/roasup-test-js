import { Sprite } from "pixi.js";
import type { MinMaxCoords, Box, Path } from "./types";

export function setBoxes(leftLine: Sprite, rightLine: Sprite): Box {
  const { x, y, height } = leftLine;
  return {
    x: {
      from: x,
      to: rightLine.x,
    },
    y: {
      from: y,
      to: height,
    },
  };
}

export function checkAim(e: MouseEvent, minmax: MinMaxCoords): boolean {
  const { clientX, clientY } = e;
  const { minMaxX, minMaxY } = minmax;
  return (
    clientX >= minMaxX.min &&
    clientX <= minMaxX.max &&
    clientY >= minMaxY.min &&
    clientY <= minMaxY.max
  );
}

export function checkHitBox(box: Box, path: Path[]): boolean {
  const {
    x: { from: xFrom, to: xTo },
    y: { from: yFrom, to: yTo },
  } = box;

  const { x, y } = path[path.length - 1];
  return x >= xFrom && x <= xTo && y >= yFrom && y <= yTo;
}

export function createMinMax(car: Sprite): MinMaxCoords {
  const offsetX = 175;
  const offsetY = 250;
  const { x, y } = car;
  return {
    minMaxX: { min: x - offsetX, max: x + offsetX },
    minMaxY: { min: y - offsetY, max: y + offsetY },
  };
}
