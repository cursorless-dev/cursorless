---
slug: /
---

# Cursorless

Welcome to Cursorless! If you're new, start with the [tutorial videos](https://www.youtube.com/watch?v=5mAzHGM2M0k&list=PLXv2sppxeoQZz49evjy4T0QJRIgc_JPqs) or the [how-to guides](./how-to.md).

This guide assumes you've already [installed Cursorless](./installation.md).

Once you understand the concepts, you can pull up a cheatsheet by saying `"cursorless reference"` or `"cursorless cheatsheet"` with VSCode focused. You can return to these docs by saying `"cursorless docs"` or `"cursorless help"` within VSCode.

To change any spoken forms, see [Customization](./customization.md).

## Overview

Every Cursorless command consists of an action performed on a target. For example, `"chuck bat"` deletes the token with a hat over the `b`: `"chuck"` is the action and `"bat"` is the target.

![`"chuck bat"`](./images/chuckBat.gif)

## Actions

An action determines what happens to a target. For example, `"chuck air"` removes the target, while `"take air"` selects it.

See the [action reference](./actions/README.md) for the complete list of actions, syntax, behavior, and examples.

## Targets

A target identifies the text or position that a command acts on. Targets can refer to a single token or selection, a containing scope, a range, or a list of several targets.

See the [target guide](./targets.md) to learn how marks, modifiers, scopes, ranges, and lists combine to form targets. For detailed lookup, use the [modifier reference](./modifiers/README.md) and [scope reference](./scopes/README.md).
