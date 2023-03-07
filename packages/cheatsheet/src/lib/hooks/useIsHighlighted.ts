import { useHash } from 'react-use';

// Check if window is defined (so if in the browser or in node.js).
const isBrowser = typeof window !== 'undefined';

/**
 * Returns `true` if the URL hash is equal to the given `id`
 * @param id The id to match the hash against
 * @returns Boolean indicating whether the hash matches the given id
 */
export default function useIsHighlighted(id: string) {
  const [hash, _] = isBrowser ? useHash() : ['', null];

  return hash.length > 1 && hash.substring(1) === id;
}
