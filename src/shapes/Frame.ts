import type { FabricObjectProps, SerializedObjectProps } from './Object/types';
import type { TOptions } from '../typedefs';
import type {
  BasicTransformEvent,
  ObjectEvents,
  TPointerEvent,
} from '../EventTypeDefs';
import { FabricObject } from './Object/FabricObject';
import { classRegistry } from '../ClassRegistry';
import { createFrameDefaultControls } from '../controls/commonControls';
import {
  multiplyTransformMatrices,
  qrDecompose,
  transformPoint,
} from '../util';
import { Point } from '../Point';
import { FrameTitle } from './FrameTitle';

type UniqueFrameProps = {
  children: string[];
};

interface FrameProps extends FabricObjectProps, UniqueFrameProps {}

interface SerializedFrameProps extends SerializedObjectProps {}

interface FrameObjectEvents extends ObjectEvents {
  'frame:remove': {
    target: FabricObject;
  };
  'frame:add': {
    target: FabricObject;
  };
}

export class Frame<
  Props extends TOptions<FrameProps> = Partial<FrameProps>,
  SProps extends SerializedFrameProps = SerializedFrameProps,
  EventSpec extends FrameObjectEvents = FrameObjectEvents,
> extends FabricObject<Props, SProps, EventSpec> {
  /**
   * 标题
   */
  declare title: string;
  /**
   * 标题图层
   */
  declare titleText: FrameTitle;

  /**
   * 选择框
   */
  declare selectRect: FabricObject;

  /**
   * 编辑状态
   */
  isEditing: boolean;
  /**
   * 子图层id集合
   */
  declare children: string[];

  /**
   *
   * @param options
   */
  declare objects: FabricObject[];

  constructor(options: Props) {
    super();
    this.layerType = 'frame';
    this.setOptions({
      ...options,
      height: options.height,
      top: options.top,
    });

    this.controls = createFrameDefaultControls({ sizeX: this.width });
    this.frameInit();
  }

  frameInit() {
    this._renderFrameTitle();
    this._behavior();
  }

  _behavior() {
    this.on('transover', this._bindMouseover);
    this.on('transout', this._bindMouseout);
    this.on('selected', this._bindFrameSelected);
    this.on('moving', this._bindFrameMoving);
    this.on('mousedblclick', this._bindDblClick);
    this.on('deselected', this._bindFrameDeselected);
  }

  // 置顶当前画板与关联的子图层
  topFrame() {
    const _objects = this.objects || this.getObjects();
    this.canvas?.bringObjectToFront(this);
    _objects.forEach((object) => {
      this.canvas?.bringObjectToFront(object);
    });
  }

  // 获取子图层
  getObjects() {
    const allObjects = this.canvas?.getObjects();
    return (this.objects = this.children
      .map((id) => {
        const object = allObjects?.find((o) => o.id === id);
        return object;
      })
      .filter((o) => !!o));
  }

  setXY(point: Point): void {
    const offsetX = point.x - this.left;
    const offsetY = point.y - this.top;
    this.left = point.x;
    this.top = point.y;

    this.moveFrame({
      movement: {
        x: offsetX,
        y: offsetY,
      },
    });
    this.setCoords();
  }

  // 移动画板，同时移动关联的子图层
  moveFrame(
    e:
      | BasicTransformEvent<TPointerEvent>
      | {
          movement: {
            x: number;
            y: number;
          };
        },
  ) {
    const moveX = e.movement?.x || 0;
    const moveY = e.movement?.y || 0;

    const _objects = this.objects || this.getObjects();
    _objects.forEach((object) => {
      object.setX(object.left + moveX);
      object.setY(object.top + moveY);
      object.setCoords(); // 重新计算控制点坐标
    });
    this._moveFrameTitle();
    this.canvas?.requestRenderAll();
  }

  exitEditing() {
    if (this.titleText) {
      this.titleText.exitEditing();
    }
  }

  onDeselect(options?: { e?: TPointerEvent; object?: FabricObject }): boolean {
    this.isEditing && this.exitEditing();
    return super.onDeselect(options);
  }

  isOnScreen(): boolean {
    const isScreen = super.isOnScreen();
    if (!isScreen) {
      this.titleText.hide();
    } else {
      this.titleText.show();
    }
    return isScreen;
  }

  _moveFrameTitle() {
    const pointer = this._calcFrameTitlePosition();
    this.titleText.setXY(
      new Point({
        x: pointer.x,
        y: pointer.y,
      }),
    );
  }

  _bindDblClick() {
    if (this.titleText) {
      this.titleText.editing();
    }
  }

  _calcFrameTitlePosition() {
    const vpt = this.getViewportTransform();
    const pointer = transformPoint({ x: this.left, y: this.top }, vpt);
    return {
      x: pointer.x,
      y: pointer.y - 22,
    };
  }

  _bindFrameMoving(e: BasicTransformEvent<TPointerEvent>) {
    this.moveFrame(e);
  }

  // 选中了当前画板
  _bindFrameSelected() {
    this.topFrame();
    this.titleText.hover(true);
  }

  // 取消选中当前画板
  _bindFrameDeselected() {
    this.titleText.hover(false);
  }

  // 鼠标拖拽图层进入当前画板
  _bindMouseover() {
    const objects = this.canvas?.getActiveObjects();
    const _objects = this.objects || this.getObjects();

    if (objects?.length) {
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        if (
          object &&
          object.layerType !== 'frame' &&
          !_objects.includes(object)
        ) {
          const { id } = object;
          // 加入
          this.children.push(id);
          // 绑定 frameId
          object.set('frameId', this.id);
          this.canvas?.bringObjectToFront(object);
          this.fire('frame:add', {
            target: object,
          });
        }
      }
      this.getObjects();
    }
  }

  // 鼠标拖拽图层移出当前画板
  _bindMouseout() {
    const objects = this.canvas?.getActiveObjects();
    if (objects?.length) {
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        if (object && object.layerType !== 'frame') {
          const { id } = object;
          // 移除
          this.children = this.children.filter((c) => c !== id);
          // 去除 frameId
          object.set('frameId', '');
          this.canvas?.bringObjectToFront(object);
          this.fire('frame:remove', {
            target: object,
          });
        }
      }
      this.getObjects();
    }
  }

  renderCache(options?: any): void {
    if (this.titleText) {
      const pointer = this._calcFrameTitlePosition();
      this.titleText.setXY(
        new Point({
          x: pointer.x,
          y: pointer.y,
        }),
      );
    }
    super.renderCache(options);
  }

  _render(ctx: CanvasRenderingContext2D) {
    if (!this.titleText.container) {
      const element = this.canvas?.wrapperEl;
      if (element) {
        this.titleText.setContainer(element);
      }
    }
    const pointer = this._calcFrameTitlePosition();
    this.titleText.setXY(
      new Point({
        x: pointer.x,
        y: pointer.y,
      }),
    );

    this._renderFrame(ctx);
  }

  _renderFrameTitle() {
    const pointer = this._calcFrameTitlePosition();
    this.titleText = new FrameTitle({
      left: pointer.x,
      top: pointer.y,
      visible: false,
      text: this.title,
      onInput: (text) => {
        this.set('title', text);
        this.fire('modified', {
          action: 'title',
          target: this,
        });
      },
      onChange: (isEditing) => {
        this.isEditing = isEditing;
      },
    });
  }

  _renderFrame(ctx: CanvasRenderingContext2D) {
    const { width: w, height: h } = this;
    const x = -w / 2;
    const y = -h / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  _renderOutsideBorder(ctx: CanvasRenderingContext2D, size: Point) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      -size.x / 2 - 10,
      -size.y / 2 - 32,
      size.x + 20,
      size.y + 42,
      8,
    );
    ctx.rect(-size.x / 2, -size.y / 2, size.x, size.y);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(188, 222, 254, 1)';
    ctx.fill('evenodd');
    ctx.restore();
  }

  _renderBorder(ctx: CanvasRenderingContext2D): void {
    const vpt = this.getViewportTransform();
    const matrix = multiplyTransformMatrices(vpt, this.calcTransformMatrix());
    const options = qrDecompose(matrix);
    const size = this._getBorderSize(options, {});

    ctx.save();
    ctx.translate(options.translateX, options.translateY);
    this._renderOutsideBorder(ctx, size);
    ctx.restore();
  }

  _renderControls(ctx: CanvasRenderingContext2D): void {
    const vpt = this.getViewportTransform();
    const matrix = multiplyTransformMatrices(vpt, this.calcTransformMatrix());
    const options = qrDecompose(matrix);
    const size = this._getBorderSize(options, {});
    ctx.save();

    ctx.translate(options.translateX, options.translateY);
    this._renderOutsideBorder(ctx, size);
    ctx.restore();
  }
}

classRegistry.setClass(Frame);
