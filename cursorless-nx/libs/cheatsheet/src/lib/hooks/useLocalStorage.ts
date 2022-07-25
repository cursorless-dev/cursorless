import { useEffect, useState } from 'react';

function getStoredValue<T>(key: string): T | null {
  const stored = localStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    return getStoredValue<T>(key) ?? defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
