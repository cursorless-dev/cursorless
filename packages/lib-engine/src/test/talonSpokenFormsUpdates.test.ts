import assert from "node:assert/strict";
import type {
  IDE,
  TalonSpokenForms,
  TalonSpokenFormsPayload,
} from "@cursorless/lib-common";
import { FakeIDE, NeedsInitialTalonUpdateError } from "@cursorless/lib-common";
import { CustomSpokenForms } from "../spokenForms/CustomSpokenForms";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";
import { TokenGraphemeSplitter } from "../tokenGraphemeSplitter";

const consumers = [
  {
    name: "CustomSpokenForms",
    create: (ide: IDE, forms: TalonSpokenForms) => {
      const consumer = new CustomSpokenForms(ide, forms);
      return {
        ready: consumer.customSpokenFormsInitialized,
        subscribe: consumer.onDidChangeCustomSpokenForms,
        assertNewerResult: (failed: boolean, notifications: number) => {
          if (failed) {
            assert.deepEqual(consumer.spokenFormMap, defaultSpokenFormMap);
          } else {
            assert.deepEqual(
              consumer.spokenFormMap.grapheme["ä"]?.spokenForms,
              ["ä"],
            );
          }
          assert.equal(consumer.needsInitialTalonUpdate, failed);
          assert.equal(notifications, 1);
        },
        snapshot: () => ({
          map: consumer.spokenFormMap,
          needsInitialTalonUpdate: consumer.needsInitialTalonUpdate,
        }),
        dispose: () => consumer.dispose(),
      };
    },
  },
  {
    name: "TokenGraphemeSplitter",
    create: (ide: IDE, forms: TalonSpokenForms) => {
      const consumer = new TokenGraphemeSplitter(ide, forms);
      return {
        ready: consumer.ready,
        subscribe: consumer.registerAlgorithmChangeListener,
        assertNewerResult: (failed: boolean, notifications: number) => {
          assert.equal(consumer.normalizeGrapheme("ä"), failed ? "a" : "ä");
          assert.equal(notifications, failed ? 0 : 1);
        },
        snapshot: () => consumer.normalizeGrapheme("ä"),
        dispose: () => consumer.dispose(),
      };
    },
  },
];

function payload(id: string): TalonSpokenFormsPayload {
  return {
    version: 1,
    spokenForms: [{ type: "grapheme", id, spokenForms: [id] }],
  };
}

function createRequest() {
  let resolve!: (payload: TalonSpokenFormsPayload) => void;
  let reject!: (error: Error) => void;
  // oxlint-disable-next-line promise/param-names
  const promise = new Promise<TalonSpokenFormsPayload>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

for (const { name, create } of consumers) {
  suite(`${name} overlapping updates`, () => {
    for (const outcome of ["success", "missing file", "invalid JSON"]) {
      for (const newerFails of [false, true]) {
        test(`ignores older ${outcome} after newer ${newerFails ? "failure" : "success"}`, async () => {
          const requests: ReturnType<typeof createRequest>[] = [];
          // oxlint-disable-next-line unicorn/consistent-function-scoping
          let update: () => void | Promise<void> = () => {
            // No-op
          };
          const forms: TalonSpokenForms = {
            getSpokenForms: () => {
              const request = createRequest();
              requests.push(request);
              return request.promise;
            },
            onDidChange: (listener) => {
              update = listener;
              return {
                dispose: () => {
                  // No-op
                },
              };
            },
          };
          const ide = new FakeIDE();
          let messages = 0;
          ide.messages.showMessage = () => {
            messages++;
            return Promise.resolve(undefined);
          };
          const consumer = create(ide, forms);

          try {
            requests[0].resolve(payload("a"));
            await consumer.ready;
            let notifications = 0;
            consumer.subscribe(() => {
              notifications++;
            });

            const older = update();
            const newer = update();
            if (newerFails) {
              requests[2].reject(new NeedsInitialTalonUpdateError("Missing"));
            } else {
              requests[2].resolve(payload("ä"));
            }
            await newer;
            consumer.assertNewerResult(newerFails, notifications);
            const expected = consumer.snapshot();

            if (outcome === "success") {
              requests[1].resolve(payload("ø"));
            } else if (outcome === "missing file") {
              requests[1].reject(new NeedsInitialTalonUpdateError("Missing"));
            } else {
              requests[1].reject(new SyntaxError("Invalid JSON"));
            }
            await older;

            assert.deepEqual(consumer.snapshot(), expected);
            consumer.assertNewerResult(newerFails, notifications);
            assert.equal(messages, 0);
          } finally {
            consumer.dispose();
            ide.exit();
          }
        });
      }
    }
  });
}
