export function cleanId(id: string): string {
  return id.replace("private.", "").replace("experimental.", "");
}
