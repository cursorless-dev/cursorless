export function normalizeCaptureName(name: string): string {
  return name.replace(/(\.(start|end))?(\.(startOf|endOf))?$/, "");
}
