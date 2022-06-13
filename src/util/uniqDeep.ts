import { uniqWith, isEqual } from "lodash";

export default <T>(array: T[]): T[] => {
  return uniqWith(array, isEqual);
};
