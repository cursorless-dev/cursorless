import { SupportedLanguageId, supportedLanguageIds } from "./constants";

export function isLanguageSupported(
  languageId: string,
): languageId is SupportedLanguageId {
  return supportedLanguageIds.includes(languageId as SupportedLanguageId);
}
