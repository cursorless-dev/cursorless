// @ts-nocheck
// From https://github.com/nodeca/js-yaml/issues/586#issuecomment-814310104
// This file ensures that simple objects and arrays (ie without array or object
// children) will be serialized inline, and also ensures that "fullTargets" will be inlined as well
// TODO: Add types

import * as yaml from "js-yaml";

function customDump(data: unknown, opts) {
  if (!(this instanceof customDump)) {
    return new customDump(data, opts);
  }
  this.data = data;
  this.opts = opts;
}

customDump.prototype.represent = function () {
  let result = yaml.dump(
    this.data,
    Object.assign({ replacer, schema }, this.opts)
  );
  result = result.trim();
  if (result.includes("\n")) {
    result = "\n" + result;
  }
  return result;
};

const customDumpType = new yaml.Type("!format", {
  kind: "scalar",
  resolve: () => false,
  instanceOf: customDump,
  represent: (d) => d.represent(),
});

let schema = yaml.DEFAULT_SCHEMA.extend({ implicit: [customDumpType] });

const isObject = (value: unknown) => typeof value === "object" && value != null;

function hasSimpleChildren(value: unknown) {
  if (isObject(value)) {
    return Object.values(value).every(
      (value) => !isObject(value) && !Array.isArray(value)
    );
  }
  if (Array.isArray(value)) {
    return value.every((value) => !isObject(value) && !Array.isArray(value));
  }
}

function replacer(key: string, value: unknown) {
  if (key === "") {
    return value;
  } // top-level, don't change this

  if (key === "fullTargets" || hasSimpleChildren(value)) {
    return customDump(value, { flowLevel: 0 });
  }

  return value; // default
}

const serialize = (obj: unknown) =>
  customDump(obj, { noRefs: true, quotingType: '"' }).represent().trim();

export default serialize;
