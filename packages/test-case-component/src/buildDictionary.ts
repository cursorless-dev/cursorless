import { loadFixture } from "./loadFixture.js";

Promise.all([
  loadFixture("actions", "bringArgMadeAfterLook"),
  loadFixture("decorations", "chuckBlockAirUntilBatt"),
  loadFixture("decorations", "cutFine"),
  loadFixture("decorations", "chuckLineFine"),
  loadFixture("actions", "bringAirAndBatAndCapToAfterItemEach"),
]).then((allItems) => {
  allItems.forEach((item) => {
    if (item) {
      console.log(`
.wrapper
  .before
    ${item.before.replace(/\n/gi, "\n    ")}
  .during
    ${(item.during || item.before).replace(/\n/gi, "\n    ")}
    .command ${item.command}
  .after
    ${item.after.replace(/\n/gi, "\n    ")}
`);
    }
  });
});
