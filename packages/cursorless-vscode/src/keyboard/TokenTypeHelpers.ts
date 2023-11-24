import { SectionTypes, TokenTypeValueMap } from "./TokenTypes";

export type SectionName = keyof SectionTypes;

export type DefaultKeyMap = {
  [K in SectionName]?: KeyMap<SectionTypes[K]>;
};

export type TokenType = keyof TokenTypeValueMap;

type TokenTypeKeyDescriptorMap = {
  [K in keyof TokenTypeValueMap]: TokenTypeValueMap[K] extends undefined
    ? { type: K }
    : { type: K; value: TokenTypeValueMap[K] };
};

export type TokenTypeKeyMapMap = {
  readonly [K in keyof TokenTypeValueMap]: KeyMap<TokenTypeKeyDescriptorMap[K]>;
};

export type KeyDescriptor =
  TokenTypeKeyDescriptorMap[keyof TokenTypeKeyDescriptorMap];

export type KeyMap<T> = Record<string, T>;
