interface MessageSentEvent {
  type: "messageSent";
  data: any;
}
interface MessageReceivedEvent {
  type: "messageReceived";
  data: any;
}
interface ViewShownEvent {
  type: "viewShown";
  preserveFocus: boolean;
}

export type SpyWebViewEvent =
  | MessageSentEvent
  | MessageReceivedEvent
  | ViewShownEvent;
