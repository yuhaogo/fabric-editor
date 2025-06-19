import { TextStyleDeclaration } from './Text/StyledText';
import { FabricText } from './Text/Text';
import { FabricObject } from './Object/FabricObject';
import type { ObjectEvents } from '../EventTypeDefs';
import type { TOptions } from '../typedefs';
import type { FabricObjectProps, SerializedObjectProps } from './Object/types';
import { classRegistry } from '../ClassRegistry';

type TextProps = {
  text: string;
  style: {
    fontSize: number;
    fontFamily: string;
  };
};

type UniqueRichTextProps = {
  left: number;
  top: number;
  width: number;
  height: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'right' | 'center';
};

interface SerializedTextProps extends SerializedObjectProps {}

interface RichTextProps extends FabricObjectProps, UniqueRichTextProps {}

export class RichText<
    Props extends TOptions<RichTextProps> = Partial<RichTextProps>,
    SProps extends SerializedTextProps = SerializedTextProps,
    EventSpec extends ObjectEvents = ObjectEvents,
  >
  extends FabricObject<Props, SProps, EventSpec>
  implements RichTextProps
{
  declare texts: TextProps[];

  declare writingMode: 'vertical' | 'horizontal';

  declare width: number;

  declare height: number;

  declare lineHeight: number;

  declare letterSpacing: number;

  declare left: number;

  declare top: number;

  declare textAlign: 'left' | 'right' | 'center';

  constructor(texts: TextProps[], options: Props) {
    super();
    this.texts = texts;
    this.setOptions(options);
  }

  _render(ctx: CanvasRenderingContext2D) {
    const lines = this.splitHorizontalTextToLines(ctx);
    this._renderLines(ctx, lines);
  }
  //将文本分割成行
  splitHorizontalTextToLines(ctx: CanvasRenderingContext2D) {
    const lines = [];
    const texts = this.texts;
    const maxWidth = this.width;
    for (let i = 0; i < texts.length; i++) {
      const { text, style } = texts[i];

      ctx.save();
      ctx.font = this._getFontDeclaration(style);

      let curentLine = '';
      let curentWidth = 0;
      for (let j = 0; j < text.length; j++) {
        const word = text[j];
        const wordWidth =
          ctx.measureText(word).width + (this.letterSpacing || 0);

        if (curentWidth + wordWidth > maxWidth) {
          lines.push({
            text: curentLine,
            style,
          });

          curentLine = word;
          curentWidth = wordWidth;
        } else {
          curentLine += word;
          curentWidth += wordWidth;
        }
      }
      if (curentLine) {
        lines.push({
          text: curentLine,
          style,
        });
      }

      ctx.restore();
    }

    return lines;
  }

  //渲染文本
  _renderLines(ctx: CanvasRenderingContext2D, lines: TextProps[]) {
    let rowHeight = 0;
    const x = this._getLeftOffset();
    const y = this._getTopOffset();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { text, style } = line;
      const { fontSize } = style;

      ctx.save();
      ctx.font = this._getFontDeclaration(style);
      //字体的字距
      const { fontBoundingBoxAscent } = ctx.measureText(text);

      // 精确计算行高（浏览器逻辑）
      const lineHeightValue = fontSize * this.lineHeight;

      const renderY = y + fontBoundingBoxAscent + rowHeight;
      console.log(x, renderY);
      ctx.fillText(text, x, renderY);
      ctx.restore();
      rowHeight += lineHeightValue;
    }
  }

  /**
   * return font declaration string for canvas context
   * @param {Object} [styleObject] object
   * @returns {String} font declaration formatted for canvas context.
   */
  _getFontDeclaration({
    fontFamily = '',
    fontStyle,
    fontWeight,
    fontSize,
  }: Partial<
    Pick<
      TextStyleDeclaration,
      'fontFamily' | 'fontStyle' | 'fontWeight' | 'fontSize'
    >
  > = {}): string {
    const parsedFontFamily =
      fontFamily.includes("'") ||
      fontFamily.includes('"') ||
      fontFamily.includes(',') ||
      FabricText.genericFonts.includes(fontFamily.toLowerCase())
        ? fontFamily
        : `"${fontFamily}"`;
    return [fontStyle, fontWeight, `${fontSize}px`, parsedFontFamily].join(' ');
  }

  /**
   * @private
   * @return {Number} Left offset
   */
  _getLeftOffset(): number {
    return -this.width / 2;
  }

  /**
   * @private
   * @return {Number} Top offset
   */
  _getTopOffset(): number {
    return -this.height / 2;
  }
}

classRegistry.setClass(FabricText);
