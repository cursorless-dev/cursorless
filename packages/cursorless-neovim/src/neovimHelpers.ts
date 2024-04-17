import { NormalizedIDE, SpyIDE } from "@cursorless/common";
import { ide } from "@cursorless/cursorless-engine";
import { NeovimIDE } from "@cursorless/neovim-common";

// DEP-INJ: Delete this function. Is there a clean way to do it? Yes once we support pure dependency injection
export function getNeovimIDE(): NeovimIDE {
  const ide_ = ide();
  let neovimIDE: NeovimIDE;
  if (ide_ instanceof NeovimIDE) {
    neovimIDE = ide_;
  } else if (ide_ instanceof NormalizedIDE) {
    neovimIDE = ide_.original as NeovimIDE;
  } else if (ide_ instanceof SpyIDE) {
    const normalizedIDE = ide_.original as NormalizedIDE;
    neovimIDE = normalizedIDE.original as NeovimIDE;
  } else {
    throw Error("getNeovimIDE(): ide() is not NeovimIDE");
  }
  return neovimIDE;
}
