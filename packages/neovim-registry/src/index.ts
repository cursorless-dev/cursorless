import { NeovimRegistry } from "./NeovimRegistry";
import { registry } from "./singletons/registry.singleton";

export function getNeovimRegistry(): NeovimRegistry {
  return registry();
}
