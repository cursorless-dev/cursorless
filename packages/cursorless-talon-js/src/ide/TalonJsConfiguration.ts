import type {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
  Disposable,
  GetFieldType,
  Listener,
  Paths,
} from "@cursorless/common";

export class TalonJsConfiguration implements Configuration {
  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    _path: Path,
    _scope?: ConfigurationScope | undefined,
  ): GetFieldType<CursorlessConfiguration, Path> {
    throw new Error("getOwnConfiguration not implemented.");
  }

  onDidChangeConfiguration(_listener: Listener): Disposable {
    throw new Error("onDidChangeConfiguration not implemented.");
  }
}
