import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
    ifStatement: supported,
    "statement.class": supported,
    "statement.interface": supported,
    "statement.enum": supported,
    "statement.field.class": supported,
    "statement.field.interface": supported,
    "statement.variable.uninitialized": supported,
    "statement.variable.initialized": supported,
    namedFunction: supported,
    "comment.line": supported,
    "string.singleLine": supported,
    "branch.if": supported,
    class: supported,
}