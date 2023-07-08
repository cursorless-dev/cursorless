interface Fixture {
  input: string;
  expectedOutput: string[];
}

export const sentenceSegmenterFixture: Fixture[] = [
  {
    input: "Foo. Bar? Baz! bongo",
    expectedOutput: ["Foo.", "Bar?", "Baz!", "bongo"],
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
    input: " Foo \n\tbar ",
    expectedOutput: ["Foo \n\tbar"],
  },
  {
    input: " Foo \nbar. *",
    expectedOutput: ["Foo \nbar."],
  },
  {
    input: "* Foo bar\n*\n",
    expectedOutput: ["Foo bar"],
  },
];
