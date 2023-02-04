import { TestCaseFixture } from "../../testUtil/TestCaseFixture";
import {
  SelectionPlainObject,
  TargetPlainObject,
} from "../../libs/common/testUtil/toPlainObject";
import { FixtureTransformation } from "./types";

// FIXME: Remove this before merging the PR
export const upgradeThatMarks: FixtureTransformation = (
  fixture: TestCaseFixture,
) => {
  fixture.initialState.thatMark = fixture.initialState.thatMark?.map(
    (rangePlainObject) => fixRange(rangePlainObject as any),
  );
  fixture.initialState.sourceMark = fixture.initialState.sourceMark?.map(
    (rangePlainObject) => fixRange(rangePlainObject as any),
  );

  if (fixture.finalState == null) {
    return fixture;
  }

  fixture.finalState.thatMark = fixture.finalState.thatMark?.map(
    (rangePlainObject) => fixRange(rangePlainObject as any),
  );
  fixture.finalState.sourceMark = fixture.finalState.sourceMark?.map(
    (rangePlainObject) => fixRange(rangePlainObject as any),
  );

  return fixture;
};

function fixRange(plainObject: SelectionPlainObject): TargetPlainObject {
  const { anchor, active } = plainObject;
  const isReversed =
    active.line < anchor.line ||
    (active.line === anchor.line && active.character < anchor.character);
  return {
    type: "UntypedTarget",
    contentRange: isReversed
      ? { start: active, end: anchor }
      : { start: anchor, end: active },
    isReversed,
    hasExplicitRange: !(
      active.line === anchor.line && active.character === anchor.character
    ),
  };
}
