import type { Config } from "jest";
import { preactModuleNameMapper } from "@cursorless/lib-common/jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ...preactModuleNameMapper,
    "\\.(css|scss)$": "<rootDir>/src/test/styleMock.ts",
  },
};

export default config;
