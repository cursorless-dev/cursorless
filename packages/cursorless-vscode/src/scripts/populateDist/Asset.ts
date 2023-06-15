import { Context } from "./context";

export interface Asset {
  source?: string;

  /**
   * If `generateContent` is defined, then it will be called in order to
   * generate the content of the destination file. Mutually exclusive with
   * {@link source}.
   * @returns The content to write to the destination file, or `undefined` if
   * the destination file should not be created.
   */
  generateContent?(context: Context): Promise<string | undefined>;

  destination: string;

  /**
   * Indicates that it is ok for the file to not exist in dev mode
   */
  optionalInDev?: boolean;

  /**
   * Can be used to transform the given file's json before writing it to the
   * destination
   * @param json The input json
   * @returns The transformed json
   */
  transformJson?: (context: Context, json: any) => Promise<any>;
}
