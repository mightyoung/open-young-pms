/**
 * Pretext-based text measurement utility
 * Provides accurate text height prediction for virtual scrolling and dynamic layouts
 */
import { prepare, layout } from 'pretext';

const DEFAULT_FONT = '14px Inter, -apple-system, sans-serif';
const DEFAULT_MAX_WIDTH = 800;

export function measureText(text, font = DEFAULT_FONT, maxWidth = DEFAULT_MAX_WIDTH) {
  try {
    const prepared = prepare({ text, font, maxWidth });
    const result = layout(prepared);
    return {
      height: result.height,
      lines: result.lines?.length || Math.ceil(result.height / (parseInt(font, 10) || 14 * 1.5)),
      lineHeight: parseInt(font, 10) || 14 * 1.5,
      charCount: text.length,
      font,
      maxWidth,
    };
  } catch (e) {
    return { height: 20, lines: 1, lineHeight: 20, charCount: text.length, font, maxWidth };
  }
}

export function measureMultiple(texts, font = DEFAULT_FONT, maxWidth = DEFAULT_MAX_WIDTH) {
  return texts.map(text => measureText(text, font, maxWidth));
}

export function estimateContainerHeight(totalItems, itemFont = DEFAULT_FONT, itemMaxWidth = DEFAULT_MAX_WIDTH) {
  const sampleHeight = measureText('示例文本', itemFont, itemMaxWidth).height;
  return totalItems * sampleHeight;
}
