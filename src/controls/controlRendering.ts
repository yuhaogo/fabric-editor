import { FILL, STROKE, twoMathPi } from '../constants';
import type { InteractiveFabricObject } from '../shapes/Object/InteractiveObject';
import { degreesToRadians } from '../util/misc/radiansDegreesConversion';
import type { Control } from './Control';

export type ControlRenderingStyleOverride = Partial<
  Pick<
    InteractiveFabricObject,
    | 'cornerStyle'
    | 'cornerSize'
    | 'cornerColor'
    | 'cornerStrokeColor'
    | 'cornerDashArray'
    | 'transparentCorners'
  >
>;

export type ControlRenderer<
  O extends InteractiveFabricObject = InteractiveFabricObject,
> = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: ControlRenderingStyleOverride,
  fabricObject: O,
) => void;

const rotateControlCanvas = getRotateControlCanvas();

// 绘制旋转控制器
function getRotateControlCanvas() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();

  canvas.width = 24;
  canvas.height = 24;
  if (!ctx) {
    throw new Error('Canvas 2d context not found');
  }
  img.src =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGCSURBVHgB7ZbtcYMwDIbf5jpANqhGYARvUEZgg2SDZoOwASO0nYB2AtoJkg1CJ0itw7TCZ5sPm1/Jc/ceX7IsLCED3DoPmM9Wi4z4/KzVan1hZQqtWuuidXXopFVpZUhMbpxfZ2hyEI8jz49ae+veh9Y3/pe8T8mzOTItEsDLKd+qNJOFUEiUgiOGuVVYxg5d3Rzm+CisyQnLsQuWr3llgyspCy5mORX8RZr7BhXCqEIcJdyfKqeEfINqYUyIo3YEsB8b1BvWiKdPZSP8voUGZMLwgHjI+CERzCk0QIkACqTlVfgesBHnhPX48T2QAZyxHk/m2E4NgOvhBV0BpWit5JjDSd+5ZAeL7QdZyNfGMuw/E9kqPxHHTpy/+4y4QfjaJmE5hGEX9FJ6Jm8Qh2xCRchwC/cvV0z+K0x8exfKBDT2A+KCMNwHYrf0P6eVCYo8Ngrdp3tJPTlj1wjntjZB2WmTGxohETmm/xFzMKPb7hIIXQp4Y2msCfmaV0nhzp2Z/AIIOrR87s3CiAAAAABJRU5ErkJggg==';
  img.onload = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 4, 5, 16, 16);
  };
  return canvas;
}

/**
 * Render a round control, as per fabric features.
 * This function is written to respect object properties like transparentCorners, cornerSize
 * cornerColor, cornerStrokeColor
 * plus the addition of offsetY and offsetX.
 * @param {CanvasRenderingContext2D} ctx context to render on
 * @param {Number} left x coordinate where the control center should be
 * @param {Number} top y coordinate where the control center should be
 * @param {Object} styleOverride override for FabricObject controls style
 * @param {FabricObject} fabricObject the fabric object for which we are rendering controls
 */
export function renderCircleControl(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: ControlRenderingStyleOverride,
  fabricObject: InteractiveFabricObject,
) {
  styleOverride = styleOverride || {};
  const xSize =
      this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
    ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
    transparentCorners =
      typeof styleOverride.transparentCorners !== 'undefined'
        ? styleOverride.transparentCorners
        : fabricObject.transparentCorners,
    methodName = transparentCorners ? STROKE : FILL,
    stroke =
      !transparentCorners &&
      (styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor);
  let myLeft = left,
    myTop = top,
    size;
  ctx.save();
  ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor || '';
  ctx.strokeStyle =
    styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor || '';
  // TODO: use proper ellipse code.
  if (xSize > ySize) {
    size = xSize;
    ctx.scale(1.0, ySize / xSize);
    myTop = (top * xSize) / ySize;
  } else if (ySize > xSize) {
    size = ySize;
    ctx.scale(xSize / ySize, 1.0);
    myLeft = (left * ySize) / xSize;
  } else {
    size = xSize;
  }
  ctx.beginPath();
  ctx.arc(myLeft, myTop, size / 2, 0, twoMathPi, false);
  ctx[methodName]();
  if (stroke) {
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Render a square control, as per fabric features.
 * This function is written to respect object properties like transparentCorners, cornerSize
 * cornerColor, cornerStrokeColor
 * plus the addition of offsetY and offsetX.
 * @param {CanvasRenderingContext2D} ctx context to render on
 * @param {Number} left x coordinate where the control center should be
 * @param {Number} top y coordinate where the control center should be
 * @param {Object} styleOverride override for FabricObject controls style
 * @param {FabricObject} fabricObject the fabric object for which we are rendering controls
 */
export function renderSquareControl(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: ControlRenderingStyleOverride,
  fabricObject: InteractiveFabricObject,
) {
  styleOverride = styleOverride || {};
  const xSize =
      this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
    ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
    transparentCorners =
      typeof styleOverride.transparentCorners !== 'undefined'
        ? styleOverride.transparentCorners
        : fabricObject.transparentCorners,
    methodName = transparentCorners ? STROKE : FILL,
    stroke =
      !transparentCorners &&
      (styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor),
    xSizeBy2 = xSize / 2,
    ySizeBy2 = ySize / 2;
  ctx.save();
  ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor || '';
  ctx.strokeStyle =
    styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor || '';
  ctx.translate(left, top);
  //  angle is relative to canvas plane
  const angle = fabricObject.getTotalAngle();
  ctx.rotate(degreesToRadians(angle));
  // this does not work, and fixed with ( && ) does not make sense.
  // to have real transparent corners we need the controls on upperCanvas
  // transparentCorners || ctx.clearRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
  ctx[`${methodName}Rect`](-xSizeBy2, -ySizeBy2, xSize, ySize);
  if (stroke) {
    ctx.strokeRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
  }
  ctx.restore();
}

export type ControlType = 'square' | 'circle' | 'diamond';
/**
 * 绘制新的控制器，顶点控制器为方形，中点控制器为药丸，旋转控制点为圆形
 * @param this
 * @param ctx
 * @param left
 * @param top
 * @param styleOverride
 * @param fabricObject
 */
export function renderSquare2Control(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  fabricObject: InteractiveFabricObject,
) {
  const controlType = this.controlType;
  ctx.save();
  ctx.translate(left, top);
  //  angle is relative to canvas plane
  const angle = fabricObject.getTotalAngle();
  switch (controlType) {
    case 'square':
      renderSquare(ctx, this.sizeX, this.sizeY, angle);
      break;
    case 'circle':
      renderCircle(ctx, this.sizeX, this.sizeY, this.hover);
      break;
    case 'diamond':
      renderDiamond(ctx, this.sizeX, this.sizeY, angle);
      break;
  }
  ctx.restore();
}

// 绘制方块控制器
function renderSquare(
  ctx: CanvasRenderingContext2D,
  sizeX: number,
  sizeY: number,
  angle: number,
) {
  const xSize = sizeX,
    ySize = sizeY,
    strokeWidth = 1,
    xSizeBy2 = xSize / 2,
    ySizeBy2 = ySize / 2;
  ctx.rotate(degreesToRadians(angle));

  ctx.fillStyle = '#D8FF00';
  ctx.strokeStyle = '#060A26';
  ctx.lineWidth = strokeWidth;
  ctx.fillRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
  ctx.strokeRect(-xSizeBy2 - 0.5, -ySizeBy2 - 0.5, xSize, ySize);
}

// 绘制圆形控制器
function renderCircle(
  ctx: CanvasRenderingContext2D,
  sizeX: number,
  sizeY: number,
  hover: boolean,
) {
  const xSize = sizeX,
    ySize = sizeY,
    xSizeBy2 = xSize / 2,
    ySizeBy2 = ySize / 2;
  let fillStyle = '#ffffff';
  if (hover) {
    fillStyle = '#D8FF00';
  }

  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;

  ctx.fillStyle = fillStyle;
  ctx.arc(0, 0, 12, 0, 2 * Math.PI);
  ctx.fill();
  ctx.drawImage(rotateControlCanvas, -xSizeBy2, -ySizeBy2, xSize, ySize);
}

// 绘制药丸控制器
function renderDiamond(
  ctx: CanvasRenderingContext2D,
  sizeX: number,
  sizeY: number,
  angle: number,
) {
  const xSize = sizeX,
    ySize = sizeY,
    strokeWidth = 1,
    xSizeBy2 = (xSize + strokeWidth) / 2,
    ySizeBy2 = (ySize + strokeWidth) / 2;

  ctx.rotate(degreesToRadians(angle));
  ctx.fillStyle = '#D8FF00';
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = '#060A26';
  ctx.beginPath();

  ctx.fillRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
  ctx.roundRect(
    -xSizeBy2,
    -ySizeBy2,
    xSize,
    ySize,
    sizeX < sizeY ? sizeX / 2 : sizeY / 2,
  );
  ctx.stroke();
  ctx.beginPath();
}
