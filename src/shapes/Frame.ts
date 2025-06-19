import {
  FabricObjectProps,
  ObjectEvents,
  SerializedObjectProps,
} from 'fabric/node';
import { FabricObject } from './Object/FabricObject';
import { classRegistry } from '../ClassRegistry';

type UniqueFrameProps = {
  children: string[];
};

interface FrameProps extends FabricObjectProps, UniqueFrameProps {}

interface SerializedFrameProps extends SerializedObjectProps {}

export class Frame<
  Props extends FrameProps = FrameProps,
  SProps extends SerializedFrameProps = SerializedFrameProps,
  EventSpec extends ObjectEvents = ObjectEvents,
> extends FabricObject<Props, SProps, EventSpec> {
  /**
   * 子图层
   */
  declare children: string[];
  constructor(options: Props) {
    super();
    this.layerType = 'frame';
    this.selectable = false;
    this.setOptions(options);

    this.behavior();
  }

  behavior() {
    this.on('mouseover', this._bindMouseover);
    this.on('mouseout', this._bindMouseout);
  }

  _bindMouseover() {
    const object = this.canvas?.getActiveObject();
    if (object) {
      const { id } = object;
      // 加入
      this.children.push(id);
      // 绑定 frameId
      object.set('frameId', this.id);
    }
  }

  _bindMouseout() {
    console.trace();
    const object = this.canvas?.getActiveObject();
    if (object) {
      const { id } = object;
      // 移除
      this.children = this.children.filter((c) => c !== id);
      // 去除 frameId
      object.set('frameId', '');
    }
  }

  _render(ctx: CanvasRenderingContext2D) {
    this._renderFrame(ctx);
  }

  _renderFrame(ctx: CanvasRenderingContext2D) {
    const { width: w, height: h } = this;
    const x = -w / 2;
    const y = -h / 2;
    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.restore();
  }
}

classRegistry.setClass(Frame);
