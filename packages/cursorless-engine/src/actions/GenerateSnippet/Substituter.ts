interface Substitution {
  randomId: string;
  to: string;
  isQuoted: boolean;
}

/**
 * This class constructs random strings that can be used as placeholders for the
 * strings you'd like to insert into a document. This functionality is useful if
 * the strings you'd like to insert might get modified by something like json
 * serialization. You proceed by calling {@link addSubstitution}  for each string you'd
 * like to put into your document.  This function returns a random id that you
 * can put into your text.  When you are done, call {@link makeSubstitutions}
 * on the final text to replace the random id's with the original strings you
 * desired.
 */
export default class Substituter {
  private substitutions: Substitution[] = [];

  /**
   * Get a random id that can be put into your text body that will then be
   * replaced by {@link to} when you call {@link makeSubstitutions}.
   * @param to The string that you'd like to end up in the final document after
   * replacements
   * @param isQuoted Use this variable to indicate that in the final text the
   * variable will end up quoted. This occurs if you use the replacement string
   * as a stand alone string in a json document and then you serialize it
   * @returns A unique random id that can be put into the document that will
   * then be substituted later
   */
  addSubstitution(to: string, isQuoted: boolean = false) {
    const randomId = makeid(10);

    this.substitutions.push({
      to,
      randomId,
      isQuoted,
    });

    return randomId;
  }

  /**
   * Performs substitutions on {@link text}, replacing the random ids generated
   * by {@link addSubstitution} with the values passed in for `to`.
   * @param text The text to perform substitutions on
   * @returns The text with variable substituted for the original values you
   * desired
   */
  makeSubstitutions(text: string) {
    this.substitutions.forEach(({ to, randomId, isQuoted }) => {
      const from = isQuoted ? `"${randomId}"` : randomId;
      // NB: We use split / join instead of replace because the latter doesn't
      // handle dollar signs well
      text = text.split(from).join(to);
    });

    return text;
  }
}

/**
 * Constructs a random id of the given length.
 *
 * From https://stackoverflow.com/a/1349426/2605678
 *
 * @param length Length of the string to generate
 * @returns A string of random digits of length {@param length}
 */
function makeid(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
