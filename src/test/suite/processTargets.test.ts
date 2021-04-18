import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import NavigationMap from "../../NavigationMap";
import processTargets from "../../processTargets";
import { Target, Token } from "../../Types";
// import * as myExtension from '../../extension';

suite("processTargets", () => {
  test("simple processTargets", () => {
    const navigationMap = new NavigationMap();
    const token: Token = {
      text: "hello",
      range: new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 5)
      ),
      displayLine: 0,
      documentUri: vscode.Uri.parse("file://foo"),
    };
    navigationMap.addToken("red", "h", token);

    const target: Target = {
      type: "primitive",
      mark: {
        type: "decoratedSymbol",
        character: "h",
        symbolColor: "red",
      },
      position: "contents",
      selectionType: "token",
      transformation: { type: "identity" },
    };

    const expectedReturnValue = [
      [new vscode.Selection(token.range.start, token.range.end)],
    ];
    assert.deepStrictEqual(
      expectedReturnValue,
      // @ts-ignore
      processTargets(navigationMap, [target])
    );
  });
});
