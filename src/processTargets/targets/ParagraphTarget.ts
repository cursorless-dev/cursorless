import { TargetParameters } from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

export default class ParagraphTarget extends BaseTarget {
  constructor(parameters: TargetParameters) {
    super(parameters);
    this.delimiter = "\n\n";
  }

  // getRemovalHighlightRange(): Range | undefined {
  //   if (this.position != null) {
  //     return undefined;
  //   }
  //   return this.contentRange;
  // }
}
