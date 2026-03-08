// This file contains global type definitions. We are not compiling as node or
// browser so by default console doesn't exist and print is something that
// quickjs adds.

declare function print(...objs: any): void;

declare namespace console {
  function debug(...objs: any): void;
  function log(...objs: any): void;
  function warn(...objs: any): void;
  function error(...objs: any): void;
}
