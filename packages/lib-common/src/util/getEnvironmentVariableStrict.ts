import { getProcessEnv } from "./getProcessEnv";

export function getEnvironmentVariableStrict(name: string): string {
  const value = getProcessEnv()[name];
  if (value == null) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}
