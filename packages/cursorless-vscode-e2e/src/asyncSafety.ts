import type { Context, Done } from "mocha";

/**
 * if an async returns after the method times out,
 * it will cause a "done() called multiple times" error.
 * In the context of a running webdriver, this is potentially very bad.
 * We need to be able to quit the driver gracefully under any circumstances.
 * This allows methods to time out while an async is pending,
 * and will avoid calling done twice in this case.
 *
 * From https://github.com/mochajs/mocha/issues/967#issuecomment-810484206
 * @param fn The test function to run
 * @returns A safely wrapped test function
 */
export default function asyncSafety(fn: () => Promise<void>) {
  return function (this: Context, done: Done) {
    const runnable = this.runnable();

    fn.bind(this)()
      .then(() => {
        // for successful I think we only need timedOut? not sure though, might have side effects
        // when the duration check is added it will get stuck and never complete on a second runthrough
        if (!runnable.timedOut) {
          done();
        }
      })
      .catch((err: unknown) => {
        if (!runnable.timedOut && !runnable.duration) {
          done(err);
        }
      });
  };
}
