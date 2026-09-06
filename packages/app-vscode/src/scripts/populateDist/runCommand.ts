import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function runCommand(command: string) {
  const { stdout, stderr } = await execAsync(command);

  if (stderr) {
    throw new Error(stderr);
  }

  return stdout;
}
