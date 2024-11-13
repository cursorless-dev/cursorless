import {JetbrainsClient} from "./JetbrainsClient";
import {JetbrainsCommandServer} from "./JetbrainsCommandServer";

export class JetbrainsPlugin {
  readonly client: JetbrainsClient
  readonly commandServer: JetbrainsCommandServer

  constructor(
    private client: JetbrainsClient,
    private commandServer: JetbrainsCommandServer
    ) {
  }

}
