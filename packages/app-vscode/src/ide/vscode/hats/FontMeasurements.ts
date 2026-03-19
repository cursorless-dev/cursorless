export interface FontMeasurements {
  fontSize: number;
  characterWidth: number;
  characterHeight: number;
  clearCache(): Promise<void>;
  calculate(): Promise<void>;
}
