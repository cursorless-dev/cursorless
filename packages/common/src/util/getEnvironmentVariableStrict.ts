export function getEnvironmentVariableStrict(name: string): string {
  const value = process.env[name];
  if (value == null) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}
