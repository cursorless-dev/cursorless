import assert from "node:assert";
import * as parser from "..";

suite("sentence-parser: Multiple sentences", function () {
  suite("Include ellipsis as ending if starts with capital", function () {
    const entry = "First sentence... Another sentence";
    const sentences = parser.getSentences(entry);

    test("should get two sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Two sentences", function () {
    const entry =
      "Lorem ipsum, dolor sed amat frequentor minimus. Second sentence.";
    const sentences = parser.getSentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (A)", function () {
    const entry =
      "On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration.";
    const sentences = parser.getSentences(entry);

    test("should get two sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (B)", function () {
    const entry =
      "Sen. Barack Obama became the 44th President of the US. Millions attended.";
    const sentences = parser.getSentences(entry);

    test("should get two sentence", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (C)", function () {
    const entry =
      "Barack Obama, previously Sen. of lorem ipsum, became the 44th President of the U.S. Millions attended.";
    const sentences = parser.getSentences(entry);

    test("should get two sentence", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (D)", function () {
    const entry =
      "Baril, a Richmond lawyer once nominated for a federal prosecutors job, endorsed a faith-based drug initiative in local jails patterned after the Henrico County jails therapeutic program called Project R.I.S.E. Just as important, he had a great foil across the net.";
    const sentences = parser.getSentences(entry);

    test("should get two sentence", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (E)", function () {
    const entry =
      "Newsletter AIDs CARE, EDUCATION AND TRAINING Issue No. 7. Acet Home Care, which moves into the building in July, will share the offices with two other AIDS charities, P.A.L.S. (Portsmouth AIDS Link Support) and the Link Project.";
    const sentences = parser.getSentences(entry);

    test("should get two sentence", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (F)", function () {
    const entry =
      "Another is expanded hours of operation -- from fewer than five hours a day to 9:30 a.m. to 4 p.m. Monday through Saturday. Sunday remains closed.";
    const sentences = parser.getSentences(entry);

    test("should get two sentence", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Difficult two sentences (G)", function () {
    const entry =
      "Gold Wing Road Rider's Association - Coffee break, Guzzardo's Italian Villa, eat, 6 p.m.; ride, 7 p.m. Then at 9 p.m. go home.";
    const sentences = parser.getSentences(entry);

    test("should get two sentence", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite(
    "Dot in middle of word is not skipped if followed by capital letter",
    function () {
      const entry = "Hello Barney.The bird in the word.";
      const sentences = parser.getSentences(entry);

      test("should get 2 sentences", function () {
        assert.equal(sentences.length, 2);
      });
    },
  );

  suite("Question- and exlamation mark", function () {
    const entry =
      "Hello this is my first sentence? There is also a second! A third";
    const sentences = parser.getSentences(entry);

    test("should get 3 sentences", function () {
      assert.equal(sentences.length, 3);
    });
  });

  suite("It should skip keywords/code with a dot in it", function () {
    const entry = "HELLO A.TOP IS NICE";
    const sentences = parser.getSentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 1);
    });
  });

  suite("If newlines are boundaries", function () {
    const entry =
      "Search on http://google.com\n\nThen send me an email: gg@gggg.kk";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Sentences with quotations", function () {
    const entry =
      "“If there’s no balance and your boss doesn’t provide support and work that’s meaningful, your chances of burning out are great.” What bothers most people in situations like these is “the lack of boundaries,” says Nancy Rothbard, the David Pottruck Professor of Management at the University of Pennsylvania’s Wharton School.";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Sentences with quotations", function () {
    const entry =
      "“If there’s no balance! And your boss doesn’t provide support and work that’s meaningful, your chances of burning out are great.” What bothers most people in situations like these is “the lack of boundaries,” says Nancy Rothbard, the David Pottruck Professor of Management at the University of Pennsylvania’s Wharton School.";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 3 sentences", function () {
      assert.equal(sentences.length, 3);
    });
  });

  suite("Sentences with a name ending a sentence", function () {
    const entry = `If your boss assumes he can interrupt you any time and it’s "impacting the way you do your job," you should communicate that "you feel stretched," says Hill. A growing body of research shows that being “always on” hurts results.`;
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("If newlines are boundaries (B)", function () {
    const entry =
      "FAMILIY HISTORY   ========================================== Nothing interesting";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });
});
