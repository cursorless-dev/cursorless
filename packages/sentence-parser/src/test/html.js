// /*jshint node:true, laxcomma:true */
// /*global describe:true, it:true */
// "use strict";

// const assert = require("assert");
// const tokenizer = require("../lib/tokenizer");

// suite("HTML markup", function () {
//   suite("HTML markup can be removed", function () {
//     const entry =
//       "<p>Hello this is my first sentence.</p> <br><br>There is also a second down the page.";
//     const sentences = tokenizer.sentences(entry, { sanitize: true });

//     test("should get 2 sentences", function () {
//       assert.equal(sentences.length, 2);
//     });
//   });

//   suite("Non-markup is not interfered with", function () {
//     const entry = "We find that a < b works. But in turn, c > x.";
//     const sentences = tokenizer.sentences(entry, { sanitize: false });

//     test("should get 2 sentences", function () {
//       assert.equal(sentences.length, 2);
//     });
//     test("should not be escaped", function () {
//       assert(!/&lt;/.test(sentences[0]));
//       assert(!/&gt;/.test(sentences[1]));
//     });
//   });

//   suite("Closing html boundaries (br, p) split sentences.", function () {
//     const entry =
//       "What the Experts Say <br /> <p>In certain circumstances:</p> “working for a manager who’s task-oriented and has a high need for achievement can be motivating,” says Linda Hill";
//     const sentences = tokenizer.sentences(entry, {
//       sanitize: false,
//       html_boundaries: true,
//     });

//     test("should get 3 sentences", function () {
//       assert.equal(sentences.length, 3);
//     });
//   });

//   suite("Closing html boundaries (div) split sentences.", function () {
//     const entry =
//       "<div>Lorem ipsum dolor sit amet, semper laoreet per.</div> <div>Dui pede donec, fermentum vivamus.</div> <div>Tellus vivamus ipsum.</div> <div>Elit eu nam.</div>";
//     const sentences = tokenizer.sentences(entry, {
//       sanitize: false,
//       html_boundaries: true,
//     });

//     test("should get 4 sentences", function () {
//       assert.equal(sentences.length, 4);
//     });
//   });

//   suite("List items boundaries (li) split sentences.", function () {
//     const entry =
//       "<li>Lorem ipsum dolor sit amet, interdum nulla, ipsum id vivamus</li><li>Suspendisse pellentesque, porttitor alias</li><li>Nulla in lacus</li>";
//     const sentences = tokenizer.sentences(entry, {
//       sanitize: false,
//       html_boundaries: true,
//       html_boundaries_tags: ["li", "div"],
//     });

//     test("should get 3 sentences", function () {
//       assert.equal(sentences.length, 3);
//     });
//   });
// });
