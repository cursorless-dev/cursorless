# Local command history

By default, Cursorless doesn't capture anything about your usage. However, we do have a way to opt in to a local, sanitized command history. This history is never sent to our servers, and any commands that may contain text will be sanitized.

The idea is that these statistics can be used in the future for doing local analyses to determine ways you can improve your Cursorless efficiency. We may also support a way for you to send your statistics to us for analysis in the future, but this will be opt-in only.

To enable local, sanitized command logging, enable the `cursorless.commandHistory` VSCode setting. You should see a checkbox in the settings UI when you say `"cursorless settings"`. You can also set it manually in your `settings.json`:

```json
  "cursorless.commandHistory": true
```

The logged commands can be found in your user directory, under `.cursorless/commandHistory`. You can delete this directory at any time to clear your history. Please don't delete the parent `.cursorless` directory, as this contains other files for use by Cursorless.
