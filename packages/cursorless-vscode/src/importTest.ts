// D1.2: Disallow external imports if not listed in package.json
// import { URI } from "vscode-uri";

// D1.2: Disallow external imports if not listed in package.json
// import { v4 as uuid } from "uuid";

// D2: Allow imports from internal packages listed in package.json
// import { runCursorlessCommand } from "@cursorless/vscode-common";

// D2: Allow imports from internal packages listed in package.json
// import { textFormatters } from "@cursorless/common";

// D2: Allow imports from internal packages listed in package.json
// import { VscodeIDE } from "@cursorless/cursorless-vscode-core";

// D5.1a: Disallow internal relative imports outside of package
// import vscodeEdit from "@cursorless/cursorless-vscode-core/ide/vscode/VscodeEdit";

// D5.1a: Disallow internal relative imports outside of package
// import vscodeEdit from "@cursorless/cursorless-vscode-core/src/ide/vscode/VscodeEdit";

// D5.2: Disallow internal relative imports outside of package
// import { skipIfWindowsCi } from "../../cursorless-vscode-e2e/src/suite/skipIfWindowsCi";

// D5.2a: Disallow internal relative imports outside of package even if you
// depend on the module
// import VscodeMessages from "../../cursorless-vscode-core/src/ide/vscode/VscodeMessages";

// D6.1: Allow imports from external packages listed in package.json (vscode)
// import * as vscode from "vscode";
