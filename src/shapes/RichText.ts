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
}[];

type TextLineProps = {
  words: string[];
  styles: {
    [x in number]: {
      fontSize: number;
      fontFamily: string;
    };
  };
  position: {
    x: number;
    width: number;
  }[];
  lineHeight: number;
  maxAscent: number;
};

type UniqueRichTextProps = {
  left: number;
  top: number;
  width: number;
  height: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'right' | 'center' | string;
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
  splitHorizontalTextToLines(ctx: CanvasRenderingContext2D): TextLineProps[] {
    const lines = [];
    const texts = this.texts;
    const maxWidth = this.width;
    // 遍历每一段文本
    for (let i = 0; i < texts.length; i++) {
      const lineTexts = texts[i];
      let curentLine: string[] = [];
      let position: TextLineProps['position'] = [];
      let curentWidth = 0;
      let styles: TextLineProps['styles'] = {};
      let maxFontSize = 0;
      let maxAscent = 0;
      // 遍历每一段文本中的每一个节点
      for (let k = 0; k < lineTexts.length; k++) {
        const { text, style } = lineTexts[k];

        ctx.save();
        ctx.font = this._getFontDeclaration(style);

        if (style.fontSize > maxFontSize) {
          maxFontSize = style.fontSize;
        }
        // 遍历节点中的每一个字符
        for (let j = 0; j < text.length; j++) {
          const word = text[j];

          const { width } = ctx.measureText(word);
          const { actualBoundingBoxAscent } = ctx.measureText('H');
          const wordWidth = width + (this.letterSpacing || 0);
          const ascent = actualBoundingBoxAscent;
          if (ascent > maxAscent) {
            maxAscent = ascent;
          }

          if (curentWidth + wordWidth > maxWidth) {
            lines.push({
              words: curentLine,
              styles,
              position,
              lineHeight: maxFontSize * this.lineHeight,
              maxAscent:
                maxAscent + (maxFontSize * this.lineHeight - maxAscent) / 2,
            });

            curentLine = [word];
            position = [
              {
                x: 0,
                width: wordWidth,
              },
            ];
            curentWidth = wordWidth;
            maxFontSize = style.fontSize;
            styles = {
              [0]: style,
            };
          } else {
            curentLine.push(word);
            position.push({
              x: curentWidth,
              width: wordWidth,
            });
            styles[curentLine.length - 1] = style;
            curentWidth += wordWidth;
          }
        }

        ctx.restore();
      }
      if (curentLine) {
        lines.push({
          words: curentLine,
          styles,
          position,
          lineHeight: maxFontSize * this.lineHeight,
          maxAscent:
            maxAscent + (maxFontSize * this.lineHeight - maxAscent) / 2,
        });
      }
    }

    return lines;
  }

  //渲染文本
  _renderLines(ctx: CanvasRenderingContext2D, lines: TextLineProps[]) {
    let rowHeight = 0;
    const x = this._getLeftOffset();
    const y = this._getTopOffset();
    const textAlign = this.textAlign;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { words, styles, position, lineHeight, maxAscent } = line;
      // 偏移量
      let offsetX = 0;
      if (textAlign === 'center') {
        offsetX =
          (this.width -
            (position[position.length - 1].x +
              position[position.length - 1].width)) /
          2;
      } else if (textAlign === 'right') {
        offsetX =
          this.width -
          (position[position.length - 1].x +
            position[position.length - 1].width);
      }

      for (let j = 0; j < words.length; j++) {
        const word = words[j];
        const style = styles[j];
        const { x: positionX } = position[j];

        ctx.save();
        ctx.font = this._getFontDeclaration(style);

        const renderY = y + maxAscent + rowHeight;
        const renderX = x + offsetX + positionX;
        console.log(renderX, renderY);
        ctx.fillText(word, renderX, renderY);
        ctx.restore();
      }
      rowHeight += lineHeight;
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

classRegistry.setClass(RichText);
