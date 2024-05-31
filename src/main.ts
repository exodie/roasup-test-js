import { Application, Graphics, Sprite } from "pixi.js";

import gsap from "gsap";

import { PixiPlugin, MotionPathPlugin } from "gsap/all";

import {
  blueCarImg,
  redCarImg,
  greenCarImg,
  yellowCarImg,
  lineImg,
  pRedImg,
  pYellowImg,
  buttonImg,
  failImg,
  gameLogoImg,
  handImg,
} from "./images";

import type { Path, MinMaxCoords, FinishDrawing } from "./types";

import { createMinMax, setBoxes, checkAim, checkHitBox } from "./handlers";

gsap.registerPlugin(MotionPathPlugin, PixiPlugin);

const app = new Application<HTMLCanvasElement>({
  background: "#545454",
  resizeTo: window,
});
const screenWidth = app.screen.width;
const screenHeight = app.screen.height;

if (!document.body.querySelector("canvas")) document.body.appendChild(app.view);

const greenCar = Sprite.from(greenCarImg);
const redCar = Sprite.from(redCarImg);
const yellowCar = Sprite.from(yellowCarImg);
const blueCar = Sprite.from(blueCarImg);
const pYellow = Sprite.from(pYellowImg);
const pRed = Sprite.from(pRedImg);
const failSign = Sprite.from(failImg);
const markingLine1 = Sprite.from(lineImg);
const markingLine2 = Sprite.from(lineImg);
const markingLine3 = Sprite.from(lineImg);
const markingLine4 = Sprite.from(lineImg);
const markingLine5 = Sprite.from(lineImg);
const button = Sprite.from(buttonImg);
const gameLogo = Sprite.from(gameLogoImg);
const hand = Sprite.from(handImg);
const customBack = new Graphics();

const tl: gsap.core.Timeline = gsap.timeline();

const redLine = new Graphics();
const yellowLine = new Graphics();
const canvasParts = [
  greenCar,
  blueCar,
  redCar,
  yellowCar,
  markingLine1,
  markingLine2,
  markingLine3,
  markingLine4,
  markingLine5,
  pYellow,
  pRed,
  hand,
  redLine,
  yellowLine,
  customBack,
  button,
  gameLogo,
  failSign,
];

const canvasItems: Sprite[] = [
  greenCar,
  blueCar,
  redCar,
  yellowCar,
  pRed,
  pYellow,
  hand,
  button,
  gameLogo,
  failSign,
];
const canvasItemsPositions: number[] = [
  0.1625, 0.8375, 0.275, 0.725, 0.6125, 0.3875, 0.325, 0.5, 0.5, 0.5,
];
const lines: Sprite[] = [
  markingLine1,
  markingLine2,
  markingLine3,
  markingLine4,
  markingLine5,
];
const linePositions: number[] = [0.05, 0.275, 0.5, 0.725, 0.95];

const lineYPos = 0;
const topCarsYPos = screenHeight * 0.2;
const pYPos = screenHeight * 0.2;
const botCarsYPos = screenHeight * 0.8;

const inactivityTimeout = 20_000;
let inactivityTimer: number | null = null;

resetInactivityTimer();

let drawingRed: boolean = false;
let drawingYellow: boolean = false;
let pathRed: Path[] = [];
let pathYellow: Path[] = [];

const finishDrawing: FinishDrawing = {
  red: false,
  yellow: false,
};

customBack.beginFill(0x000000, 0.5);
customBack.drawRect(0, 0, screenWidth, screenHeight);
customBack.endFill();
customBack.alpha = 0;

const playImgs = [
  greenCar,
  blueCar,
  redCar,
  yellowCar,
  markingLine1,
  markingLine2,
  markingLine3,
  markingLine4,
  markingLine5,
  pYellow,
  pRed,
  button,
  hand,
  gameLogo,
  failSign,
];

playImgs.forEach((obj) => obj.anchor.set(0.5));
customBack.position.set(0, 0);

button.alpha = 0;
gameLogo.alpha = 0;
failSign.alpha = 0;
failSign.scale.set(0.5);
button.scale.set(0.5);
gameLogo.scale.set(0.5);

canvasItems.forEach((tes, index) => {
  tes.x = screenWidth * canvasItemsPositions[index];
  tes.y = lineYPos;
});

pYellow.y = pYPos;
pRed.y = pYPos;

button.y = screenHeight * 0.85;
gameLogo.y = screenHeight * 0.35;

failSign.y = screenHeight * 0.5;
greenCar.y = topCarsYPos;
blueCar.y = topCarsYPos;
redCar.y = botCarsYPos;
yellowCar.y = botCarsYPos;
hand.y = screenHeight * 0.825;

lines.forEach((line, index) => {
  line.anchor.set(0);
  line.height = screenHeight * 0.275;
  line.x = screenWidth * linePositions[index];
  line.y = lineYPos;
});

const yellowBox = setBoxes(markingLine2, markingLine3);
const redBox = setBoxes(markingLine3, markingLine4);

canvasParts.forEach((obj) => app.stage.addChild(obj));

gsap.to(hand, {
  x: screenWidth * 0.675,
  y: screenHeight * 0.235,
  duration: 2,
});

app.view.addEventListener("pointerdown", handlePointerDown);
app.view.addEventListener("mousedown", handlePointerDown);
app.view.addEventListener("pointermove", handlePointerMove);
app.view.addEventListener("mousemove", handlePointerMove);
app.view.addEventListener("pointerup", handlePointerUp);
app.view.addEventListener("mouseup", handlePointerUp);

app.view.addEventListener("timeupdate", () => {});

function checkAndAnimateCars(): void {
  if (finishDrawing.red && finishDrawing.yellow) {
    animateCars(redCar, pathRed);
    animateCars(yellowCar, pathYellow);
  }
}

function failState(): void {
  gsap.to(playImgs, { alpha: 0, duration: 1 });
  gsap.to(failSign, { alpha: 1, duration: 1 });
}

function animateCars(car: Sprite, path: Path[]): void {
  if (path.length < 2) {
    failState();
    return;
  }

  tl.set(car, { x: path[0].x, y: path[0].y });

  tl.to(
    car,
    {
      duration: 2,
      motionPath: {
        path: path.map((point) => ({ x: point.x, y: point.y })),
        curviness: 5,
      },
    },
    0
  );

  tl.call(() => {
    gsap.to([playImgs, redLine, yellowLine], { alpha: 0, duration: 0.5 });
  });

  fadingAndStuff();
}

function resetInactivityTimer() {
  if (inactivityTimer !== null) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(fadingAndStuff, inactivityTimeout);
}

function fadingAndStuff(): void {
  tl.call(
    () => {
      customBack.visible = true;
      gsap.to(customBack, { alpha: 1 });

      gsap.to(failSign, {
        alpha: 1,
        duration: 0.5,
      });
      gsap.to(failSign.scale, { duration: 0.5, x: 1, y: 1 });

      gsap.to(failSign, {
        alpha: 0,
        duration: 0.5,
        delay: 1,
      });
      gsap.to(failSign.scale, { duration: 0.5, x: 0.5, y: 0.5, delay: 1 });
    },
    undefined,
    "-=1"
  );

  tl.to({}, { duration: 2.5, onComplete: revertToInitialState }, "-=2");
}

function revertToInitialState(): void {
  gsap.to(playImgs, { alpha: 1, duration: 2 });

  gsap.to(button.scale, { duration: 2, x: 1.25, y: 1.25 });
  gsap.to(gameLogo.scale, { duration: 2, x: 1.25, y: 1.25 });

  customBack.visible = true;

  drawingRed = false;
  drawingYellow = false;
  finishDrawing.red = false;
  finishDrawing.yellow = false;
  pathRed = [];
  pathYellow = [];

  hand.visible = false;
  failSign.visible = false;
  gameLogo.alpha = 1;
  button.alpha = 1;
  redCar.y = botCarsYPos;
  yellowCar.y = botCarsYPos;
  redCar.x = screenWidth * 0.275;
  yellowCar.x = screenWidth * 0.725;

  removeEvents();
}

function handlePointerDown(e: MouseEvent): void {
  hand.alpha = 0;

  const redMinMax: MinMaxCoords = createMinMax(redCar);
  const yellowMinMax: MinMaxCoords = createMinMax(yellowCar);

  drawingRed = checkAim(e, redMinMax);
  drawingYellow = checkAim(e, yellowMinMax);

  if (drawingRed) {
    pathRed = [];
  }
  if (drawingYellow) {
    pathYellow = [];
  }
}

function handlePointerMove(e: MouseEvent): void {
  if (drawingRed) {
    pathRed.push({ x: e.clientX, y: e.clientY });
    drawLine(redLine, pathRed, 0xd1191f);
  }
  if (drawingYellow) {
    pathYellow.push({ x: e.clientX, y: e.clientY });
    drawLine(yellowLine, pathYellow, 0xffc841);
  }
}

function drawLine(
  line: Graphics,
  path: Path[],
  color: number
): void {
  line.clear();
  line.lineStyle(15, color);
  for (let i = 1; i < path.length; i++) {
    line.moveTo(path[i - 1].x, path[i - 1].y);
    line.lineTo(path[i].x, path[i].y);
  }
}

function handlePointerUp(): void {
  if (drawingRed && checkHitBox(redBox, pathRed)) {
    drawingRed = false;
    finishDrawing.red = true;
    checkAndAnimateCars();
  } else if (drawingRed) {
    pathRed = [];
    redLine.clear();
  }

  if (drawingYellow && checkHitBox(yellowBox, pathYellow)) {
    drawingYellow = false;
    finishDrawing.yellow = true;
    checkAndAnimateCars();
  } else if (drawingYellow) {
    pathYellow = [];
    yellowLine.clear();
  }
}

function removeEvents(): void {
  app.view.removeEventListener("pointerdown", handlePointerDown);
  app.view.removeEventListener("mousedown", handlePointerDown);
  app.view.removeEventListener("pointermove", handlePointerMove);
  app.view.removeEventListener("mousemove", handlePointerMove);
  app.view.removeEventListener("pointerup", handlePointerUp);
  app.view.removeEventListener("mouseup", handlePointerUp);
  button.eventMode = "dynamic";
  button.onpointerup = () => (window.location.href = "https://roasup.com");
}

window.addEventListener("resize", () =>
  app.renderer.resize(window.innerWidth, window.innerHeight)
);
