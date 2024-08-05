import type { FontMeasurements } from "./FontMeasurements";

export class FakeFontMeasurements implements FontMeasurements {
  fontSize = 12;
  characterWidth = 12;
  characterHeight = 12;

  async clearCache() {
    // Do nothing
  }

  async calculate() {
    // Do nothing
  }
}
