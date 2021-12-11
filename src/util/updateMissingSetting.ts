import { workspace } from "vscode";

// If the user hasn't updated the setting(key), update it with value
export default async (key: string, value: any) => {
  const parentIndex = key.lastIndexOf(".");
  const parentKey = parentIndex > -1 ? key.slice(0, parentIndex) : undefined;
  const fieldKey = parentIndex > -1 ? key.slice(parentIndex + 1) : key;

  const paddingConfig = workspace.getConfiguration(parentKey);
  const topInspection = paddingConfig.inspect(fieldKey);
  if (topInspection?.defaultValue === paddingConfig.get(fieldKey)) {
    console.debug(`Update setting => ${key}: ${value}`);
    await paddingConfig.update(fieldKey, value, true);
  }
};
