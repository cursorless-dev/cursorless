import { NvimPlugin } from "neovim";
import { NeovimRegistry } from "./NeovimRegistry";
import { injectRegistry, registry } from "./singletons/registry.singleton";

export default function entry(plugin: NvimPlugin) {
  plugin.setOptions({ dev: false });

  plugin.registerFunction(
    "RegistryLoadExtension",
    async () => await loadExtension(plugin),
    { sync: false },
  );
}

async function loadExtension(plugin: NvimPlugin) {
  console.warn("loadExtension(neovim-registry): start");
  const registry = new NeovimRegistry();
  injectRegistry(registry);
  console.warn("loadExtension(neovim-registry): done");
}

export function getNeovimRegistry(): NeovimRegistry {
  return registry();
}
