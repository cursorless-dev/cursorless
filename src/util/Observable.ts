import { Notifier } from "../libs/common/util/Notifier";

export default class Observable<T> {
  private notifier = new Notifier<[T]>();

  constructor(private current_: T) {}

  public get current() {
    return this.current_;
  }

  public set current(value: T) {
    this.current_ = value;
    this.notifier.notifyListeners(this.current_);
  }

  public onDidChange = this.notifier.registerListener;
}
