import { Listener } from "../../util/Notifier";
import {
  Configuration,
  CursorlessConfigKey,
  CursorlessConfiguration,
  Disposable,
} from "../ide.types";

export default class SpyConfiguration implements Configuration {
  constructor(private original: Configuration) {}

  onDidChangeConfiguration(listener: Listener<[]>): Disposable {
    return this.original.onDidChangeConfiguration(listener);
  }

  getOwnConfiguration<T extends CursorlessConfigKey>(
    key: T
  ): CursorlessConfiguration[T] | undefined {
    return this.original.getOwnConfiguration(key);
  }

  getSpyValues() {
    return undefined;
  }
}
