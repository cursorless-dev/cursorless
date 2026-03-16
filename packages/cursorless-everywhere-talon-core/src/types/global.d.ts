// This file contains global type definitions. We are not compiling as node or
// browser so by default console doesn't exist and print is something that
// quickjs adds.

declare namespace console {
  function debug(...objs: any): void;
  function log(...objs: any): void;
  function warn(...objs: any): void;
  function error(...objs: any): void;
}

declare namespace performance {
  function now(): number;
}

declare function setTimeout(callback: () => void, ms: number): void;
declare function clearTimeout(timeoutId: unknown): void;
