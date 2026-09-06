import { NeovimRegistry } from "./NeovimRegistry";

export function getNeovimRegistry(): NeovimRegistry {
  if ((globalThis as any)._neovimRegistry == null) {
    (globalThis as any)._neovimRegistry = new NeovimRegistry();
  }
  return (globalThis as any)._neovimRegistry;
}
