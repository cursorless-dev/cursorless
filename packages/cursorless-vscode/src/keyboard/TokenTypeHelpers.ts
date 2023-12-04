import { SectionTypes, TokenTypeValueMap } from "./TokenTypes";

export type SectionName = keyof SectionTypes;

export type TokenType = keyof TokenTypeValueMap;

type TokenTypeKeyDescriptorMap = {
  [K in keyof TokenTypeValueMap]: { type: K; value: TokenTypeValueMap[K] };
};

export type TokenTypeKeyMapMap = {
  readonly [K in keyof TokenTypeValueMap]: KeyMap<TokenTypeKeyDescriptorMap[K]>;
};

export type KeyDescriptor =
  TokenTypeKeyDescriptorMap[keyof TokenTypeKeyDescriptorMap];

export type KeyMap<T> = Record<string, T>;
