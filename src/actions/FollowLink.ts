// 1import { env, Uri, window } from "vscode";
// import {
//   Action,
//   ActionPreferences,
//   ActionReturnValue,
//   Graph,
//   Target,
// } from "../typings/Types";
// import displayPendingEditDecorations from "../util/editDisplayUtils";
// import { getLinkForTarget } from "../util/getLinks";
// import { ensureSingleTarget } from "../util/targetUtils";

// export default class FollowLink implements Action {
//   getTargetPreferences: () => ActionPreferences[] = () => [
//     { insideOutsideType: "inside" },
//   ];

//   constructor(private graph: Graph) {
//     this.run = this.run.bind(this);
//   }

//   async run([targets]: [Target[]]): Promise<ActionReturnValue> {
//     const target = ensureSingleTarget(targets);

//     await displayPendingEditDecorations(
//       targets,
//       this.graph.editStyles.referenced
//     );

//     const link = await getLinkForTarget(target);
//     if (link) {
//       await this.openUri(link.target!);
//     } else {
//       await this.graph.actions.executeCommand.run(
//         [targets],
//         "editor.action.revealDefinition",
//         { restoreSelection: false }
//       );
//     }

//     return {
//       thatMark: targets.map((target) => target.selection),
//     };
//   }

//   private async openUri(uri: Uri) {
//     switch (uri.scheme) {
//       case "http":
//       case "https":
//         await env.openExternal(uri);
//         break;
//       case "file":
//         await window.showTextDocument(uri);
//         break;
//       default:
//         throw Error(`Unknown uri scheme '${uri.scheme}'`);
//     }
//   }
// }
