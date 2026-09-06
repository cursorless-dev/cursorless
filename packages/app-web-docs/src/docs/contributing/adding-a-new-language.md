# Adding a new programming language

So you want Cursorless to support a new language? Great! Here's how to do it:

## 1. Add support to the [vscode-parse-tree](https://github.com/pokey/vscode-parse-tree) extension

Cursorless relies on the vscode-parse-tree extension to access the parse tree
of a document. See the
[docs](https://github.com/pokey/vscode-parse-tree/#adding-a-new-language) there
for how to add support for a new parser

## 2. Ensure file type is supported by VS Code

If you are adding support for a new language that isn't natively detected by VS Code, you will need to add the appropriate extension to the list of dependencies. The list of languages officially supported by VS Code is listed [in the VS Code docs](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers). If your language is in that list, you can skip this step and proceed to step 3. If your language is not in that list, you need to find a VS Code extension that adds support for your language, and add the id of the given extension to [`packages/lib-common/src/extensionDependencies.ts`](../../../../../packages/lib-common/src/extensionDependencies.ts) and then re-run `pnpm init-vscode-sandbox` to ensure it is installed. If you do not do this you will encounter errors when attempting to execute Cursorless commands in the next step. See [#1895](https://github.com/cursorless-dev/cursorless/issues/1895) for more info.

## 3. Register your language with Cursorless

1. Create a file with your scope support map to indicate which scopes you support. See eg [`markdown.ts`](../../../../../packages/lib-common/src/scopeSupportFacets/markdown.ts). At the start, you can leave the actual scope support table empty, so it will look something like the following (keeping in mind it's best to look at [`markdown.ts`](../../../../../packages/lib-common/src/scopeSupportFacets/markdown.ts) or another support file in case the following snippet rots):

   ```ts
   import {
     LanguageScopeSupportFacetMap,
     ScopeSupportFacetLevel,
   } from "./scopeSupportFacets.types";

   const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

   export const markdownScopeSupport: LanguageScopeSupportFacetMap = {};
   ```

2. Add an entry pointing to your support table to [the global scope support table](../../../../../packages/lib-common/src/scopeSupportFacets/languageScopeSupport.ts)

3. Create an empty `.scm` file in [`resources/queries/`](../../../../../resources/queries) to hold your parse tree patterns. It should be named after your language, eg `java.scm`.

You can file a PR with just these changes to get the ball rolling.

## 4. Define your language's scopes

Follow the instructions in [Adding a new scope](./adding-a-new-scope.md) to define the scopes for your language. Note that you can file a PR for each added scope, or do a couple at a time, but it's best _**not**_ to do them all at once, as smaller PRs make the review process easier.

## 5. Document your language

Run the following command from the repository root:

```sh
pnpm fix:meta
```

Meta Updater will generate the language's `.mdx` page in [`languages`](../user/languages) from its scope support map and scope test fixtures. The generated file is named after the language ID, for example `java.mdx`, and should not be edited manually.
