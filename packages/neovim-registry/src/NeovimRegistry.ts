import { EventEmitter } from "node:events";

export class NeovimRegistry {
  private apis: Map<string, any>;
  private commands: Map<string, any>;
  private eventEmitter: EventEmitter;

  constructor() {
    this.apis = new Map();
    this.commands = new Map();
    this.eventEmitter = new EventEmitter();
  }

  public registerExtensionApi(extensionId: string, api: any) {
    this.apis.set(extensionId, api);
  }

  public getExtensionApi(extensionId: string): any {
    return this.apis.get(extensionId);
  }

  public registerCommand(commandId: string, callback: any) {
    this.commands.set(commandId, callback);
  }

  public async executeCommand(commandId: string, ...rest: any[]): Promise<any> {
    return await this.commands.get(commandId)(...rest);
  }

  public onEvent(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): EventEmitter {
    return this.eventEmitter.on(eventName, listener);
  }
  public emitEvent(eventName: string | symbol, ...args: any[]): boolean {
    return this.eventEmitter.emit(eventName, ...args);
  }
}
