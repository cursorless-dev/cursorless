import type {
  IDE,
  NormalizedIDE,
  ScopeProvider,
  TestHelpers,
} from "@cursorless/common";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";

export interface NeovimTestHelpers extends TestHelpers {
  ide: NormalizedIDE;
  neovimIDE: NeovimIDE;
  injectIde: (ide: IDE) => void;

  scopeProvider: ScopeProvider;

  runIntegrationTests(): Promise<void>;

  cursorlessTalonStateJsonPath: string;
  cursorlessCommandHistoryDirPath: string;
}
