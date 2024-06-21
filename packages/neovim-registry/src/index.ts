import { NeovimRegistry } from "./NeovimRegistry";

export function getNeovimRegistry(): NeovimRegistry {
  if ((global as any)._neovimRegistry == null) {
    (global as any)._neovimRegistry = new NeovimRegistry();
  }
  return (global as any)._neovimRegistry;
}
