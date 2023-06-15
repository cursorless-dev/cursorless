export interface FontMeasurements {
  fontSize: number;
  characterWidth: number;
  characterHeight: number;
  clearCache(): void;
  calculate(): Promise<void>;
}
