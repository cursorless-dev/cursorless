import { FontMeasurements } from "./FontMeasurements";

export class FakeFontMeasurements implements FontMeasurements {
  fontSize = 12;
  characterWidth = 12;
  characterHeight = 12;

  clearCache() {
    // Do nothing
  }

  async calculate() {
    // Do nothing
  }
}
