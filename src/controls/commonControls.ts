import { MOVING, RESIZING, ROTATE } from '../constants';
import { changeWidth } from './changeWidth';
import { Control } from './Control';
import { dragHandler } from './drag';
import { rotationStyleHandler, rotationWithSnapping } from './rotate';
import { scaleCursorStyleHandler, scalingEqually } from './scale';
import {
  scaleOrSkewActionName,
  scaleSkewCursorStyleHandler,
  scalingXOrSkewingY,
  scalingYOrSkewingX,
} from './scaleSkew';

// use this function if you want to generate new controls for every instance
export const createObjectDefaultControls = () => ({
  ml: new Control({
    x: -0.5,
    y: 0,
    sizeX: 6,
    sizeY: 18,
    controlType: 'diamond',
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  }),

  mr: new Control({
    x: 0.5,
    y: 0,
    sizeX: 6,
    sizeY: 18,
    controlType: 'diamond',
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  }),

  mb: new Control({
    x: 0,
    y: 0.5,
    sizeX: 18,
    sizeY: 6,
    controlType: 'diamond',
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  }),

  mt: new Control({
    x: 0,
    y: -0.5,
    sizeX: 18,
    sizeY: 6,
    controlType: 'diamond',
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  }),

  tl: new Control({
    x: -0.5,
    y: -0.5,
    sizeX: 8,
    sizeY: 8,
    controlType: 'square',
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    sizeX: 8,
    sizeY: 8,
    controlType: 'square',
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    sizeX: 8,
    sizeY: 8,
    controlType: 'square',
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    sizeX: 8,
    sizeY: 8,
    controlType: 'square',
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  mtr: new Control({
    x: 0,
    y: -0.5,
    sizeX: 24,
    sizeY: 24,
    controlType: 'circle',
    actionHandler: rotationWithSnapping,
    cursorStyleHandler: rotationStyleHandler,
    offsetY: -40,
    actionName: ROTATE,
  }),
});

export const createResizeControls = () => ({
  mr: new Control({
    x: 0.5,
    y: 0,
    sizeX: 6,
    sizeY: 18,
    controlType: 'diamond',
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: RESIZING,
  }),
  ml: new Control({
    x: -0.5,
    y: 0,
    sizeX: 6,
    sizeY: 18,
    controlType: 'diamond',
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: RESIZING,
  }),
});

export const createTextboxDefaultControls = () => ({
  ...createObjectDefaultControls(),
  ...createResizeControls(),
});

export const createFrameDefaultControls = ({ sizeX }: { sizeX: number }) => ({
  head: new Control({
    x: 0,
    y: -0.5,
    offsetY: -32,
    sizeX: sizeX,
    sizeY: 32,
    cursorStyleHandler: () => 'move',
    actionHandler: dragHandler,
    actionName: MOVING,
  }),
});
