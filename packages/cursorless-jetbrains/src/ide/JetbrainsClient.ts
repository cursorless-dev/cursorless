export interface JetbrainsClient {
  hatsUpdated(hatsJson: string): void;
  documentUpdated(updateJson: string): void;
}
