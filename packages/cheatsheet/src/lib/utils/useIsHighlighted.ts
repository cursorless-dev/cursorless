import { useCallback, useEffect, useState } from "preact/hooks";

// Check if window is defined (so if in the browser or in node.js).
const isBrowser = typeof window !== "undefined";

/**
 * Returns `true` if the URL hash is equal to the given `id`
 * @param id The id to match the hash against
 * @returns Boolean indicating whether the hash matches the given id
 */
export default function useIsHighlighted(id: string): boolean {
  if (!isBrowser) {
    return false;
  }
  const hash = useHash();
  return hash === `#${id}`;
}

const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash);

  const onHashChange = useCallback(() => {
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return hash;
};
