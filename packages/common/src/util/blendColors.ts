import tinycolor from "tinycolor2";

/**
 * Blends two colors together according to their alpha channels, with the top
 * color rendered on top of the base color.
 *
 * Basd on https://gist.github.com/JordanDelcros/518396da1c13f75ee057
 *
 * @param base The color to render underneath
 * @param top The color to render on top
 * @returns A color that is a blend of the two colors, with the top color
 * rendered on top of the base color
 */
export function blendColors(base: string, top: string): string {
  const baseRgba = tinycolor(base).toRgb();
  const topRgba = tinycolor(top).toRgb();
  const blendedAlpha = 1 - (1 - topRgba.a) * (1 - baseRgba.a);

  function interpolateChannel(channel: "r" | "g" | "b"): number {
    return Math.round(
      (topRgba[channel] * topRgba.a) / blendedAlpha +
        (baseRgba[channel] * baseRgba.a * (1 - topRgba.a)) / blendedAlpha,
    );
  }

  return tinycolor({
    r: interpolateChannel("r"),
    g: interpolateChannel("g"),
    b: interpolateChannel("b"),
    a: blendedAlpha,
  }).toHex8String();
}

export function blendMultipleColors(colors: string[]): string {
  let color = colors[0];
  for (let i = 1; i < colors.length; i++) {
    color = blendColors(color, colors[i]);
  }
  return color;
}
