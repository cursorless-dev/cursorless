import { NeovimClient, NvimPlugin } from "neovim";
import { ExtensionContext } from "../../types/ExtensionContext";

export class NeovimExtensionContext extends ExtensionContext {
  private client: NeovimClient;

  // get extensionMode(): ExtensionMode {
  //   return this.context.extensionMode;
  // }

  // get subscriptions(): { dispose(): any }[] {
  //   return this.context.subscriptions;
  // }

  // get extensionPath(): string {
  //   return this.context.extensionPath;
  // }

  // get storagePath(): string | undefined {
  //   return this.context.storagePath;
  // }

  // get globalStoragePath(): string {
  //   return this.context.globalStoragePath;
  // }

  // get logPath(): string {
  //   return this.context.logPath;
  // }

  constructor(
    // private context: ExtensionContext,
    plugin: NvimPlugin,
  ) {
    super();
    this.client = plugin.nvim as NeovimClient;
  }

  // asAbsolutePath(relativePath: string): string {
  //   throw new Error("Method not implemented.");
  // }
}
