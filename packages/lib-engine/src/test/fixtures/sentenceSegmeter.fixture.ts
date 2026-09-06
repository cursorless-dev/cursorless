interface Fixture {
  input: string;
  expectedOutput: string[];
}

export const sentenceSegmenterFixture: Fixture[] = [
  {
    input: "Foo foo. Bar? Baz! bongo",
    expectedOutput: ["Foo foo.", "Bar?", "Baz!", "bongo"],
  },
  {
    input: "Hello, Mr. Anderson.",
    expectedOutput: ["Hello, Mr. Anderson."],
  },
  {
    input: "Visit example.com now!",
    expectedOutput: ["Visit example.com now!"],
  },
  {
    input: "Foo.bar",
    expectedOutput: ["Foo.bar"],
  },
  {
    input: " Foo ",
    expectedOutput: ["Foo"],
  },
  {
    input: "1Foo",
    expectedOutput: ["1Foo"],
  },
  {
    input: "_foo",
    expectedOutput: ["_foo"],
  },
  {
    input: "* foo",
    expectedOutput: ["foo"],
  },
  {
    input: " Foo \n\tbar ",
    expectedOutput: ["Foo \n\tbar"],
  },
  {
    input: "* Foo \nbar. *",
    expectedOutput: ["Foo \nbar."],
  },
  {
    input: "Foo bar. Baz bongo.",
    expectedOutput: ["Foo bar.", "Baz bongo."],
  },
  {
    input: "Foo bar. \nBaz bongo.",
    expectedOutput: ["Foo bar.", "Baz bongo."],
  },
  {
    input: "Foo Bar. \nBaz bongo.",
    expectedOutput: ["Foo Bar.", "Baz bongo."],
  },
  {
    input: "Foo \n*\nbar",
    expectedOutput: ["Foo", "bar"],
  },
  {
    input: "Foo\n\nbar",
    expectedOutput: ["Foo", "bar"],
  },
  {
    input: "Foo bar...",
    expectedOutput: ["Foo bar..."],
  },
  {
    input: "Å\nä\nö",
    expectedOutput: ["Å\nä\nö"],
  },
];
