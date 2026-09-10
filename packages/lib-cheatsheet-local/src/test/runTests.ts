import process from "node:process";
import Mocha from "mocha";
import { runMochaWebTests } from "@cursorless/lib-common/mocha-web-runner";

const mocha = new Mocha({ ui: "tdd", color: true });
process.exitCode = await runMochaWebTests(mocha);
