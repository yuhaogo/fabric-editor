import type {
  ControlCursorCallback,
  TransformActionHandler,
} from '../EventTypeDefs';
import { ROTATING } from '../constants';
import { radiansToDegrees } from '../util/misc/radiansDegreesConversion';
import { isLocked, NOT_ALLOWED_CURSOR } from './util';
import { wrapWithFireEvent } from './wrapWithFireEvent';
import { wrapWithFixedAnchor } from './wrapWithFixedAnchor';

// 获取旋转的鼠标样式
const getRotateCursor = (rotate: number): string => {
  rotate = (rotate + 180) % 360;
  const svgStr = `<svg width='20' height='18' viewBox='0 0 20 18' fill='none' xmlns='http://www.w3.org/2000/svg' transform='rotate(${rotate})'><g filter='url(#filter0_d_1_29)'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.5 9H7.11538L5.21967 11.2004C6.55813 12.3429 8.21114 13.0179 9.99997 13.0179C11.7888 13.0179 13.4418 12.3429 14.7803 11.2004L15.6044 12.157C14.0505 13.5371 12.1078 14.3571 9.99997 14.3571C7.89219 14.3571 5.94941 13.5371 4.3955 12.157L2.5 14.3571V9ZM12.8846 9H17.5V14.3571L12.8846 9Z' fill='black'/><path d='M7.30479 9.16318L7.66076 8.75H7.11538H2.5H2.25V9V14.3571V15.0303L2.6894 14.5203L4.4214 12.51C5.98353 13.8264 7.91126 14.6071 9.99997 14.6071C12.0887 14.6071 14.0164 13.8264 15.5786 12.5099L17.3106 14.5203L17.75 15.0303V14.3571V9V8.75H17.5H12.8846H12.3392L12.6952 9.16318L14.4244 11.1703C13.1629 12.1803 11.6389 12.7679 9.99997 12.7679C8.36107 12.7679 6.83702 12.1803 5.57557 11.1703L7.30479 9.16318Z' stroke='white' stroke-width='0.5'/></g><defs><filter id='filter0_d_1_29' x='0' y='6.5' width='20' height='11.2035' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='1'/><feComposite in2='hardAlpha' operator='out'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1_29'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1_29' result='shape'/></filter></defs></svg>`;
  return `image-set(url("data:image/svg+xml;utf8,${encodeURIComponent(
    svgStr,
  )}") 1x) 0 0, pointer`;
};

/**
 * Find the correct style for the control that is used for rotation.
 * this function is very simple and it just take care of not-allowed or standard cursor
 * @param {Event} eventData the javascript event that is causing the scale
 * @param {Control} control the control that is interested in the action
 * @param {FabricObject} fabricObject the fabric object that is interested in the action
 * @return {String} a valid css string for the cursor
 */
export const rotationStyleHandler: ControlCursorCallback = (
  eventData,
  control,
  fabricObject,
) => {
  if (fabricObject.lockRotation) {
    return NOT_ALLOWED_CURSOR;
  }
  control.setHover(true);
  return getRotateCursor(fabricObject.angle || 0);
};

/**
 * Action handler for rotation and snapping, without anchor point.
 * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
 * @param {Event} eventData javascript event that is doing the transform
 * @param {Object} transform javascript object containing a series of information around the current transform
 * @param {number} x current mouse x position, canvas normalized
 * @param {number} y current mouse y position, canvas normalized
 * @return {Boolean} true if some change happened
 * @private
 */
const rotateObjectWithSnapping: TransformActionHandler = (
  eventData,
  { target, ex, ey, theta, originX, originY },
  x,
  y,
) => {
  const pivotPoint = target.translateToOriginPoint(
    target.getRelativeCenterPoint(),
    originX,
    originY,
  );

  if (isLocked(target, 'lockRotation')) {
    return false;
  }

  const lastAngle = Math.atan2(ey - pivotPoint.y, ex - pivotPoint.x),
    curAngle = Math.atan2(y - pivotPoint.y, x - pivotPoint.x);
  let angle = radiansToDegrees(curAngle - lastAngle + theta);

  if (target.snapAngle && target.snapAngle > 0) {
    const snapAngle = target.snapAngle,
      snapThreshold = target.snapThreshold || snapAngle,
      rightAngleLocked = Math.ceil(angle / snapAngle) * snapAngle,
      leftAngleLocked = Math.floor(angle / snapAngle) * snapAngle;

    if (Math.abs(angle - leftAngleLocked) < snapThreshold) {
      angle = leftAngleLocked;
    } else if (Math.abs(angle - rightAngleLocked) < snapThreshold) {
      angle = rightAngleLocked;
    }
  }

  // normalize angle to positive value
  if (angle < 0) {
    angle = 360 + angle;
  }
  angle %= 360;

  const hasRotated = target.angle !== angle;
  // TODO: why aren't we using set?
  target.angle = angle;
  return hasRotated;
};

export const rotationWithSnapping = wrapWithFireEvent(
  ROTATING,
  wrapWithFixedAnchor(rotateObjectWithSnapping),
);
