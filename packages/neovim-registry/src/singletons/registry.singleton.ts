import { NeovimRegistry } from "../NeovimRegistry";

const registry_ = new NeovimRegistry();

export function registry(): NeovimRegistry {
  return registry_;
}
