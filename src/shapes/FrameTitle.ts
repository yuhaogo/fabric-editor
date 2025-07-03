import type { Point } from '../Point';

type FrameTitleProps = {
  text: string;
  top: number;
  left: number;
  visible: boolean;
  container?: HTMLElement;
  onInput: (text: string) => void;
  onChange: (isEditing: boolean) => void;
};

export class FrameTitle implements FrameTitleProps {
  text: string;

  left: number;

  top: number;

  visible: boolean;

  textarea: HTMLDivElement;

  container?: HTMLElement;

  onInput: (text: string) => void;

  constructor(props: FrameTitleProps) {
    this.text = props.text;
    this.top = props.top;
    this.left = props.left;
    this.container = props.container;
    this.visible = props.visible;
    this.onInput = props.onInput;
    this.onChange = props.onChange;

    this._init();
  }
  onChange: (isEditing: boolean) => void;

  _init() {
    const textarea = document.createElement('div');

    textarea.style.position = 'absolute';

    textarea.style.fontSize = '12px';

    textarea.style.padding = '0px';

    textarea.style.top = this.top + 'px';

    textarea.style.left = this.left + 'px';

    textarea.style.outline = 'none';

    textarea.style.background = 'transparent';

    textarea.style.border = '1px solid transparent';

    textarea.style.resize = 'none';

    textarea.style.border = 'none';

    textarea.style.touchAction = 'none';

    textarea.style.userSelect = 'none';

    textarea.style.color = 'rgba(126,126,126,1)';

    textarea.style.width = 'max-content';

    textarea.innerText = this.text;

    this.textarea = textarea;

    if (this.visible) {
      this.container?.append(this.textarea);
    }

    this._registerEvent();
  }

  _registerEvent() {
    this.textarea.addEventListener('input', () => {
      this.text = this.textarea.textContent || '';
      if (this.onInput) {
        this.onInput(this.text);
      }
    });

    this.textarea.addEventListener('dblclick', this.editing.bind(this));
  }

  _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  setContainer(container: HTMLElement) {
    this.container = container;
    if (container) {
      this.container.append(this.textarea);
      this.show();
    }
  }

  show() {
    this.visible = true;
    this.textarea.style.display = 'block';
  }

  hide() {
    this.visible = false;
    this.textarea.style.display = 'none';
  }

  setXY(point: Point) {
    this.left = point.x;
    this.top = point.y;
    this._updatePosition();
  }

  _updatePosition() {
    const textarea = this.textarea;
    textarea.style.top = this.top + 'px';
    textarea.style.left = this.left + 'px';
  }

  hover(hover: boolean) {
    if (hover) {
      this.textarea.style.color = 'rgba(47,110,224,1)';
    } else {
      this.textarea.style.color = '#000';
    }
  }

  /**
   * 编辑模式
   */
  editing() {
    const textarea = this.textarea;

    textarea.contentEditable = 'true';

    textarea.style.border = '1px solid blue';

    textarea.style.background = '#fff';

    textarea.style.userSelect = 'auto';

    textarea.style.color = '#000';

    textarea.addEventListener('mousedown', this._stopPropagation);

    textarea.addEventListener('selectstart', this._stopPropagation);

    document.addEventListener('mousedown', this.exitEditing.bind(this));

    if (this.onChange) {
      this.onChange(true);
    }
  }

  /**
   * 退出编辑模式
   */
  exitEditing() {
    const textarea = this.textarea;

    textarea.contentEditable = 'false';

    textarea.style.border = '1px solid transparent';

    textarea.style.userSelect = 'none';

    textarea.style.color = '#000';

    textarea.style.background = 'transparent';

    textarea.removeEventListener('mousedown', this._stopPropagation);

    textarea.removeEventListener('selectstart', this._stopPropagation);

    document.removeEventListener('mousedown', this.exitEditing.bind(this));

    if (this.onChange) {
      this.onChange(false);
    }
  }

  render() {
    this._updatePosition();
  }
}
