import {
  SupportedLanguageId,
  supportedLanguageIds,
} from "../libs/cursorless-engine/languages/constants";

export function isLanguageSupported(
  languageId: string,
): languageId is SupportedLanguageId {
  return languageId in supportedLanguageIds;
}
