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
  private _view: WebviewView;

  constructor(view: WebviewView) {
    this._view = view;
    this.webview = new SpyWebview(this.eventLog, view.webview);
  }

  get view(): WebviewView {
    return this._view;
  }

  set view(view: WebviewView) {
    this._view = view;
    this.webview.setView(view.webview);
  }

  getEventLog(): SpyWebViewEvent[] {
    return cloneDeep(this.eventLog);
  }

  show(preserveFocus: boolean): void {
    this._view.show(preserveFocus);
    this.eventLog.push({ type: "viewShown", preserveFocus });
  }
}

class SpyWebview {
  private view: Webview;
  private messageListenerDisposable?: Disposable;

  constructor(
    private eventLog: SpyWebViewEvent[],
    view: Webview,
  ) {
    this.view = view;
    this.setView(view);
  }

  setView(view: Webview): void {
    this.view = view;
    this.messageListenerDisposable?.dispose();
    this.messageListenerDisposable = this.view.onDidReceiveMessage((data) => {
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
