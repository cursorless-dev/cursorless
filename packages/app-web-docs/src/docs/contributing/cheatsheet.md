# Cheatsheet

The cheatsheet can be activated locally to show your custom cheatsheet by saying `"cursorless cheatsheet"`, or visited on the web at https://www.cursorless.org/cheatsheet, which will show the default spoken forms.

The extension constructs the local cheatsheet from the canonical reference definitions in `lib-common` and the user's spoken-form lists in Talon's `state.json`. Talon only asks the extension to display it. Older Talon versions remain supported: the extension applies the spoken forms from their cheatsheet payload to the current structure, descriptions, and syntax.

## Adding a new spoken form

When you add a new scope type, action, modifier, etc, you'll need to ensure that it shows up both locally and on the website. Both cheatsheets are constructed from the reference definitions in `lib-common`, so reference changes appear automatically. The local version then applies the user's spoken forms from `state.json`. You can verify it by saying `"cursorless cheatsheet"` with your development version of `cursorless-talon` active in your Talon user directory. If a kind of spoken form is missing, add its raw Talon list to `state.json` rather than adding cheatsheet-specific assembly to Talon.

## Running the cheatsheet in development mode

To verify that your changes will work on the web cheatsheet, or if you need to make changes to the cheatsheet itself, such as updating the legend, you can run the cheatsheet locally using by running the following command:

```
pnpm -F @cursorless/app-web serve
```

and then adding `/cheatsheet` to the preview URL. Changes should show up in realtime as you develop.
