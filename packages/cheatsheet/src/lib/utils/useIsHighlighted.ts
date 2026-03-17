import { useCallback, useEffect, useState } from "preact/hooks";

/**
 * Returns `true` if the URL hash is equal to the given `id`
 * @param id The id to match the hash against
 * @returns Boolean indicating whether the hash matches the given id
 */
export default function useIsHighlighted(id: string): boolean {
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
