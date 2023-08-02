# Cheatsheet

The cheatsheet can be activated locally to show your custom cheatsheet by saying `"cursorless cheatsheet"`, or visited on the web at https://www.cursorless.org/cheatsheet, which will show the default spoken forms.

The implementation of the local version of the cheatsheet is split between the Talon side and the extension side.

## Adding a new spoken form

When you add a new scope type, action, modifier, etc, you'll need to ensure that it shows up both locally and on the website. It will usually automatically show up in the local cheatsheet. You can verify this by saying `"cursorless cheatsheet"` with your development version of `cursorless-talon` active in your Talon user directory, and inspecting the cheatsheet that appears. If it does not, you'll need to make fixes to [the Talon side of the cheatsheet](../../cursorless-talon/src/cheatsheet).

In either case, to get your changes to appear on the website, you need to update the defaults in [`defaults.json`](../../packages/cheatsheet/src/lib/sampleSpokenFormInfos/defaults.json). First make sure you have the `cursorless-talon-dev` user file set in your Talon home directory, as indicated in the [initial contributor setup instructions](CONTRIBUTING.md#initial-setup). Then you can say `"cursorless update cheatsheet"` to update the default spoken forms. Note that this will use your custom spoken forms, so you may need to do some manual cleanup.

## Running the cheatsheet in development mode

To verify that your changes will work on the web cheatsheet, or if you need to make changes to the cheatsheet itself, such as updating the legend, you can run the cheatsheet locally using by running the following command:

```
pnpm -F cursorless-org dev
```

and then adding `/cheatsheet` to the preview URL. Changes should show up in realtime as you develop.
