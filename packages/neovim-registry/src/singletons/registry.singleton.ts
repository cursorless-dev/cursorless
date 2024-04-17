import { NeovimRegistry } from "../NeovimRegistry";

let registry_: NeovimRegistry | undefined;

export function injectRegistry(registry: NeovimRegistry | undefined) {
  registry_ = registry;
}

export function registry(): NeovimRegistry {
  if (registry_ == null) {
    throw Error("Tried to access registry before it was injected");
  }

  return registry_;
}
