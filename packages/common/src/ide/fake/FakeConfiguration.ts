import { get } from "lodash-es";
import { Notifier } from "../../util/Notifier";
import {
  Configuration,
  ConfigurationScope,
  CONFIGURATION_DEFAULTS,
  CursorlessConfigKey,
  CursorlessConfiguration,
} from "../types/Configuration";
import { GetFieldType, Paths } from "../types/Paths";

interface ConfigurationScopeValues {
  scope: ConfigurationScope;
  values: Partial<CursorlessConfiguration>;
}

export default class FakeConfiguration implements Configuration {
  private notifier = new Notifier();
  private mocks: CursorlessConfiguration = {
    ...CONFIGURATION_DEFAULTS,
  };
  private scopes: ConfigurationScopeValues[] = [];

  constructor() {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    if (scope != null) {
      for (const { scope: candidateScope, values } of this.scopes) {
        if (scopeMatches(candidateScope, scope)) {
          return (get(values, path) ?? get(this.mocks, path)) as GetFieldType<
            CursorlessConfiguration,
            Path
          >;
        }
      }
    }

    return get(this.mocks, path) as GetFieldType<CursorlessConfiguration, Path>;
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  mockConfiguration<T extends CursorlessConfigKey>(
    key: T,
    value: CursorlessConfiguration[T],
  ): void {
    this.mocks[key] = value;
    this.notifier.notifyListeners();
  }

  mockConfigurationScope(
    scope: ConfigurationScope,
    values: Partial<CursorlessConfiguration>,
    noNotification: boolean = false,
  ): void {
    this.scopes.push({ scope, values });
    if (!noNotification) {
      this.notifier.notifyListeners();
    }
  }
}

function scopeMatches(
  candidateScope: ConfigurationScope,
  scope: ConfigurationScope,
): boolean {
  return candidateScope.languageId === scope.languageId;
}
