"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => entry
});
module.exports = __toCommonJS(src_exports);

// src/nativeIo.ts
var import_fs = require("fs");
var import_path2 = require("path");
var import_constants = require("constants");

// src/paths.ts
var import_os = require("os");
var import_path = require("path");
function getCommunicationDirPath() {
  const info = (0, import_os.userInfo)();
  const suffix = info.uid >= 0 ? `-${info.uid}` : "";
  return (0, import_path.join)((0, import_os.tmpdir)(), `neovim-command-server${suffix}`);
}
function getSignalDirPath() {
  return (0, import_path.join)(getCommunicationDirPath(), "signals");
}
function getRequestPath() {
  return (0, import_path.join)(getCommunicationDirPath(), "request.json");
}
function getResponsePath() {
  return (0, import_path.join)(getCommunicationDirPath(), "response.json");
}

// src/nativeIo.ts
var import_os2 = require("os");
var import_promises = require("fs/promises");

// src/constants.ts
var NEOVIM_COMMAND_TIMEOUT_MS = 3e3;

// src/nativeIo.ts
var InboundSignal = class {
  constructor(path) {
    this.path = path;
  }
  /**
   * Gets the current version of the signal. This version string changes every
   * time the signal is emitted, and can be used to detect whether signal has
   * been emitted between two timepoints.
   * @returns The current signal version or null if the signal file could not be
   * found
   */
  async getVersion() {
    try {
      return (await (0, import_promises.stat)(this.path)).mtimeMs.toString();
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
      return null;
    }
  }
};
var NativeIo = class {
  constructor() {
    this.responseFile = null;
  }
  async initialize() {
    const communicationDirPath = getCommunicationDirPath();
    console.warn(`Creating communication dir ${communicationDirPath}`);
    (0, import_fs.mkdirSync)(communicationDirPath, { recursive: true, mode: 504 });
    const stats = (0, import_fs.lstatSync)(communicationDirPath);
    const info = (0, import_os2.userInfo)();
    if (!stats.isDirectory() || stats.isSymbolicLink() || stats.mode & import_constants.S_IWOTH || // On Windows, uid < 0, so we don't worry about it for simplicity
    info.uid >= 0 && stats.uid !== info.uid) {
      throw new Error(
        `Refusing to proceed because of invalid communication dir ${communicationDirPath}`
      );
    }
  }
  async prepareResponse() {
    if (this.responseFile) {
      throw new Error("response is already locked");
    }
    this.responseFile = await (0, import_promises.open)(getResponsePath(), "wx");
  }
  async closeResponse() {
    if (!this.responseFile) {
      throw new Error("response is not locked");
    }
    await this.responseFile.close();
    this.responseFile = null;
  }
  /**
   * Reads the JSON-encoded request from the request file, unlinking the file
   * after reading.
   * @returns A promise that resolves to a Response object
   */
  async readRequest() {
    const requestPath = getRequestPath();
    const stats = await (0, import_promises.stat)(requestPath);
    const request = JSON.parse(await (0, import_promises.readFile)(requestPath, "utf-8"));
    if (Math.abs(stats.mtimeMs - (/* @__PURE__ */ new Date()).getTime()) > NEOVIM_COMMAND_TIMEOUT_MS) {
      throw new Error(
        "Request file is older than timeout; refusing to execute command"
      );
    }
    return request;
  }
  /**
   * Writes the response to the response file as JSON.
   * @param file The file to write to
   * @param response The response object to JSON-encode and write to disk
   */
  async writeResponse(response) {
    if (!this.responseFile) {
      throw new Error("response is not locked");
    }
    await this.responseFile.write(`${JSON.stringify(response)}
`);
  }
  getInboundSignal(name) {
    const signalDir = getSignalDirPath();
    const path = (0, import_path2.join)(signalDir, name);
    return new InboundSignal(path);
  }
};

// ../cursorless_fork/packages/neovim-registry/src/NeovimRegistry.ts
var import_node_events = require("node:events");
var NeovimRegistry = class {
  constructor() {
    this.apis = /* @__PURE__ */ new Map();
    this.commands = /* @__PURE__ */ new Map();
    this.eventEmitter = new import_node_events.EventEmitter();
  }
  registerExtensionApi(extensionId, api) {
    this.apis.set(extensionId, api);
  }
  getExtensionApi(extensionId) {
    return this.apis.get(extensionId);
  }
  registerCommand(commandId, callback) {
    this.commands.set(commandId, callback);
  }
  async executeCommand(commandId, ...rest) {
    return await this.commands.get(commandId)(...rest);
  }
  onEvent(eventName, listener) {
    return this.eventEmitter.on(eventName, listener);
  }
  emitEvent(eventName, ...args) {
    return this.eventEmitter.emit(eventName, ...args);
  }
};

// ../cursorless_fork/packages/neovim-registry/src/index.ts
function getNeovimRegistry() {
  if (global._neovimRegistry == null) {
    global._neovimRegistry = new NeovimRegistry();
  }
  return global._neovimRegistry;
}

// src/commandRunner.ts
var CommandRunner = class {
  constructor(io) {
    this.io = io;
    this.reloadConfiguration = this.reloadConfiguration.bind(this);
    this.runCommand = this.runCommand.bind(this);
    this.reloadConfiguration();
  }
  reloadConfiguration() {
  }
  /**
   * Reads a command from the request file and executes it.  Writes information
   * about command execution to the result of the command to the response file,
   * If requested, will wait for command to finish, and can also write command
   * output to response file.  See also documentation for Request / Response
   * types.
   */
  async runCommand() {
    console.warn("------------------------------------------------------------------------------");
    await this.io.prepareResponse();
    let request;
    try {
      request = await this.io.readRequest();
    } catch (err) {
      await this.io.closeResponse();
      throw err;
    }
    const { commandId, args, uuid, returnCommandOutput, waitForFinish } = request;
    const warnings = [];
    try {
      if (!commandId.match(this.allowRegex)) {
        throw new Error("Command not in allowList");
      }
      if (this.denyRegex != null && commandId.match(this.denyRegex)) {
        throw new Error("Command in denyList");
      }
      const commandPromise = getNeovimRegistry().executeCommand(commandId, ...args);
      let commandReturnValue = null;
      if (returnCommandOutput) {
        commandReturnValue = await commandPromise;
      } else if (waitForFinish) {
        await commandPromise;
      }
      await this.io.writeResponse({
        error: null,
        uuid,
        returnValue: commandReturnValue,
        warnings
      });
    } catch (err) {
      await this.io.writeResponse({
        error: err.message,
        uuid,
        warnings
      });
    }
    await this.io.closeResponse();
  }
};

// src/singletons/commandRunner.singleton.ts
var cmdRunner_;
function injectCommandRunner(cmdRunner) {
  cmdRunner_ = cmdRunner;
}
function commandRunner() {
  if (cmdRunner_ == null) {
    throw Error("Tried to access CommandRunner before it was injected");
  }
  return cmdRunner_;
}

// src/extension.ts
async function activate() {
  const io = new NativeIo();
  await io.initialize();
  const commandRunner2 = new CommandRunner(io);
  let focusedElementType;
  injectCommandRunner(commandRunner2);
  return {
    /**
     * The type of the focused element in vscode at the moment of the command being executed.
     */
    getFocusedElementType: () => focusedElementType,
    /**
     * These signals can be used as a form of IPC to indicate that an event has
     * occurred.
     */
    signals: {
      /**
       * This signal is emitted by the voice engine to indicate that a phrase has
       * just begun execution.
       */
      prePhrase: io.getInboundSignal("prePhrase")
    }
  };
}

// src/index.ts
function entry(plugin) {
  plugin.setOptions({ dev: false });
  plugin.registerFunction("CommandServerTest", () => test(plugin), {
    sync: false
  });
  plugin.registerFunction(
    "CommandServerLoadExtension",
    async () => await loadExtension(plugin),
    { sync: false }
  );
  plugin.registerFunction(
    "CommandServerRunCommand",
    () => runCommand(),
    { sync: false }
  );
}
function test(plugin) {
  const currentDate = /* @__PURE__ */ new Date();
  const currentDateStr = currentDate.toLocaleString();
  console.warn("test(): " + currentDateStr);
}
async function loadExtension(plugin) {
  console.warn("loadExtension(command-server): start");
  await activate();
  console.warn("loadExtension(command-server): done");
}
async function runCommand() {
  console.warn("runCommand(command-server): start");
  commandRunner().runCommand();
  console.warn("runCommand(command-server): done");
}
//# sourceMappingURL=index.cjs.map
