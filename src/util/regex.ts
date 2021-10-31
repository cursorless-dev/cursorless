function _rightAnchored(regex: RegExp) {
  const { source, flags } = regex;

  return new RegExp(`(${source})$`, flags.replace("m", ""));
}

function _leftAnchored(regex: RegExp) {
  const { source, flags } = regex;

  return new RegExp(`^(${source})`, flags.replace("m", ""));
}

function makeCache<T, U>(func: (arg: T) => U) {
  const cache: Map<T, U> = new Map();

  function wrapper(arg: T): U {
    let cachedValue: U | undefined = cache.get(arg);

    if (cachedValue == null) {
      cachedValue = func(arg);
      cache.set(arg, cachedValue);
    }

    return cachedValue;
  }

  return wrapper;
}

export const rightAnchored = makeCache(_rightAnchored);
export const leftAnchored = makeCache(_leftAnchored);
