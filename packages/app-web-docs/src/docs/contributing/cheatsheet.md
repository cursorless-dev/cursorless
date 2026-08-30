# Cheatsheet

The cheatsheet can be activated locally to show your custom cheatsheet by saying `"cursorless cheatsheet"`, or visited on the web at https://www.cursorless.org/cheatsheet, which will show the default spoken forms.

The implementation of the local version of the cheatsheet is split between the Talon side and the extension side.

## Adding a new spoken form

When you add a new scope type, action, modifier, etc, you'll need to ensure that it shows up both locally and on the website. The website cheatsheet is constructed from the reference definitions in `lib-common`, so reference changes appear automatically. The local cheatsheet will usually update automatically as well. You can verify it by saying `"cursorless cheatsheet"` with your development version of `cursorless-talon` active in your Talon user directory. If it does not, you'll need to make fixes to [the Talon side of the cheatsheet](../../../../../cursorless-talon/src/cheatsheet).

## Running the cheatsheet in development mode

To verify that your changes will work on the web cheatsheet, or if you need to make changes to the cheatsheet itself, such as updating the legend, you can run the cheatsheet locally using by running the following command:

```
pnpm -F @cursorless/app-web serve
```

and then adding `/cheatsheet` to the preview URL. Changes should show up in realtime as you develop.
