interface TestCaseFixture {
  input: string;
  expectedRanges: string;
}

export const textDocumentRangeFixtures: TestCaseFixture[] = [
  { input: "", expectedRanges: "0:0-0:0" },
  { input: "aaa", expectedRanges: "0:0-0:3" },
  { input: "\naaa", expectedRanges: "0:0-0:0, 1:0-1:3" },
  { input: "aaa\n", expectedRanges: "0:0-0:3, 1:0-1:0" },
  { input: "\naaa\n", expectedRanges: "0:0-0:0, 1:0-1:3, 2:0-2:0" },
  { input: "\n", expectedRanges: "0:0-0:0, 1:0-1:0" },
  { input: "\n\n", expectedRanges: "0:0-0:0, 1:0-1:0, 2:0-2:0" },
  { input: "aaa\n\naaa", expectedRanges: "0:0-0:3, 1:0-1:0, 2:0-2:3" },
  {
    input: "aaa\nbbb\r\nccc",
    expectedRanges: "0:0-0:3, 1:0-1:3, 2:0-2:3",
  },
];
