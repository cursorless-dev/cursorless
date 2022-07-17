import type { SupportedLanguageId } from "./constants";
import { supportedLanguageIds } from "./constants";

export function isLanguageSupported(
  languageId: string
): languageId is SupportedLanguageId {
  return languageId in supportedLanguageIds;
}
