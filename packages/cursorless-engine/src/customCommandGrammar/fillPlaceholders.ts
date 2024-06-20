import { Placeholder, WithPlaceholders } from "./WithPlaceholders";

export function fillPlaceholders<T>(
  input: WithPlaceholders<T>,
  values: unknown[],
): T {
  if (Array.isArray(input)) {
    return input.map((item) => fillPlaceholders(item, values)) as T;
  }

  if (typeof input === "object" && input != null) {
    const result: Partial<T> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key as keyof T] = fillPlaceholders((input as any)[key], values);
      }
    }
    return result as T;
  }

  if (isPlaceholder(input)) {
    return values[input.index] as T;
  }

  return input as T;
}

function isPlaceholder(value: unknown): value is Placeholder {
  return (
    typeof value === "object" &&
    value != null &&
    "type" in value &&
    value.type === "placeholder"
  );
}
