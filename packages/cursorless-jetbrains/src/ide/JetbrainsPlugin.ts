import {JetbrainsClient} from "./JetbrainsClient";
import {JetbrainsCommandServer} from "./JetbrainsCommandServer";

export class JetbrainsPlugin {

  constructor(
    readonly client: JetbrainsClient,
    readonly commandServer: JetbrainsCommandServer
    ) {
  }

}

export function createPlugin(client: JetbrainsClient,  commandServer: JetbrainsCommandServer): JetbrainsPlugin {
  return new JetbrainsPlugin(client, commandServer)
}
