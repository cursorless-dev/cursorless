// D1.1: Disallow vscode if not listed in package.json
// import { TextEditor } from "vscode";

// D1.1: Disallow vscode if not listed in package.json
// import * as vscode from "vscode";

// D1.2: Disallow external imports if not listed in package.json
// import { URI } from "vscode-uri";

// D1.2: Disallow external imports if not listed in package.json
// import { v4 as uuid } from "uuid";

// D2: Allow imports from internal packages listed in package.json
// import { textFormatters } from "@cursorless/common";

// D3 Disallow importing internal packages using non-preferred syntax
// import { Range } from "../../common";

// D4.1: Disallow internal imports not listed in package.json using
// non-preferred syntax
// import { openNewEditor } from "../../vscode-common";

// D4.2: Disallow internal imports not listed in package.json using preferred
// syntax
// import { runCursorlessCommand } from "@cursorless/vscode-common";

// D5.2: Disallow internal relative imports outside of package
// import { skipIfWindowsCi } from "../../cursorless-vscode-e2e/src/suite/skipIfWindowsCi";

// D5.2: Disallow internal relative imports outside of package
// import vscodeEdit from "../../cursorless-vscode-core/src/ide/vscode/VscodeEdit";

// D6.2: Allow imports from external packages listed in package.json (not vscode)
// import { sortBy } from "lodash";
