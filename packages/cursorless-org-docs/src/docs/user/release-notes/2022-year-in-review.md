---
slug: 2022-year-in-review
---

# 2022 Year in Review

Wow, 2022 was a big year for Cursorless! In total, we merged [315 PRs](https://github.com/cursorless-dev/cursorless/pulls?q=merged%3A2022-01-01..2022-12-31+sort%3Aupdated-asc) 🙌. Here are a few highlights:

- New programming languages (Scala, Markdown, Ruby, Xml, Php, Css, Rust, LaTeX)
- Created the docs website
- HTML cheatsheet
- New scope types ("paint", "link", "callee", "short paint")
- New modifiers ("head funk", "its", "previous funk", "next token", "three states", "first arg")
- Continuous delivery
- Hundreds of bug fixes
- Advanced video recorder / viewer
- Numerous videos, including a new tutorial
- Snippet insertion / automatic snippet generation
- Fully compositional modifiers (eg "first char second word air", "every line funk", etc)
- Experimental keyboard interface
- Jupyter notebook support

Here's a quick update on where we're focusing our efforts with Cursorless right now:

- Most development effort right now is going towards a core rewrite to enable #cursorless-everywhere. Cursorless is becoming a [language server](https://microsoft.github.io/language-server-protocol/), which is a big step towards enabling it to run in other IDEs, such as JetBrains, emacs, etc, as well as in other places such as a browser extension, and even globally using OCR / accessibility APIs to place hats anywhere on the screen
- The core rewrite will also enable metadata about Cursorless actions, scope types, etc to be accessible when generating our docs, so that they will always up-to-date, because they share the same source of truth as the Cursorless code base itself. This will also entail a major docs restructure to make it easier to find what you're looking for and understand how it all fits together. The new docs will include many more examples, including examples automatically generated from our test cases, which includes basically everything you can possibly do with Cursorless (we have >2.5k full end-to-end tests)
- We're also changing the way that we define our syntactic scopes, such as "funk", "state", etc, so that their behaviour is more consistent and predictable, as well as enabling new scopes, such as using "inside" to refer to Python function bodies

In the near term, we're planning to work on the following:

- [Interactive tutorials that run within your editor](https://github.com/cursorless-dev/cursorless/issues/934)
- [Bookmarking targets to allow more complex commands, even across multiple files](https://github.com/cursorless-dev/cursorless/issues/46)
- [A way to highlight newly released features](https://github.com/cursorless-dev/cursorless/issues/491)
- [A phrase-level undo command in VSCode](https://github.com/cursorless-dev/cursorless/issues/317)
- [Better support for custom user grammars built on top of the Cursorless engine](https://github.com/cursorless-dev/cursorless/issues/494)
- Changes that will enable more fluent chaining, such as [modifying the target of a bring in a single phrase](https://github.com/cursorless-dev/cursorless/issues/414)
- [Videos](https://github.com/cursorless-dev/cursorless/discussions/506)!

And that's just the beginning! Have a look at the [what's next](https://github.com/cursorless-dev/cursorless/wiki/What's-next) document; some of it has already been implemented, but there is still a long way to go
