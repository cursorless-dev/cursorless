import type { Disposable } from "@cursorless/common";
import { cloneDeep } from "lodash-es";
import type { Uri, Webview, WebviewView } from "vscode";
import type { SpyWebViewEvent } from "@cursorless/vscode-common";

/**
 * Wraps a {@link WebviewView} and provides a way to spy on its events for
 * testing.
 */
export class SpyWebviewView {
  readonly webview: SpyWebview;
  private eventLog: SpyWebViewEvent[] = [];

  constructor(public view: WebviewView) {
    this.webview = new SpyWebview(this.eventLog, view.webview);
  }

  getEventLog(): SpyWebViewEvent[] {
    return cloneDeep(this.eventLog);
  }

  show(preserveFocus: boolean): void {
    this.view.show(preserveFocus);
    this.eventLog.push({ type: "viewShown", preserveFocus });
  }
}

class SpyWebview {
  constructor(
    private eventLog: SpyWebViewEvent[],
    private view: Webview,
  ) {
    this.view.onDidReceiveMessage((data) => {
      this.eventLog.push({ type: "messageReceived", data });
    });
  }

  set html(value: string) {
    this.view.html = value;
  }

  set options(value: { enableScripts: boolean; localResourceRoots: Uri[] }) {
    this.view.options = value;
  }

  onDidReceiveMessage(callback: (data: any) => void): Disposable {
    return this.view.onDidReceiveMessage(callback);
  }

  postMessage(data: any): Thenable<boolean> {
    this.eventLog.push({ type: "messageSent", data });
    return this.view.postMessage(data);
  }

  asWebviewUri(localResource: Uri): Uri {
    return this.view.asWebviewUri(localResource);
  }

  get cspSource(): string {
    return this.view.cspSource;
  }
}
