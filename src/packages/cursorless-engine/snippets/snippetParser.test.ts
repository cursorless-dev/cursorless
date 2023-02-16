/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See https://github.com/microsoft/vscode/blob/6915debdd61d3db26c39e831babf70b573b1baf0/LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from "assert";
import { SnippetParser } from "./vendor/vscodeSnippet/snippetParser";

suite("SnippetParser", () => {
  test("Marker, toTextmateString()", function () {
    function assertTextsnippetString(input: string, expected: string): void {
      const snippet = new SnippetParser().parse(input);
      const actual = snippet.toTextmateString();
      assert.strictEqual(actual, expected);
    }

    assertTextsnippetString(
      "${1|cho\\,ices,wi\\|th,esc\\\\aping,chall\\\\\\,enges|}",
      "${1|cho\\,ices,wi\\|th,esc\\\\aping,chall\\\\\\,enges|}",
    );
  });
});
