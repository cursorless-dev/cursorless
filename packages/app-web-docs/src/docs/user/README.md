---
slug: /
sidebar_position: 1
---

# Cursorless

Welcome to Cursorless! If you're new, start with the [tutorial](./tutorial/README.mdx) or the [learning resources](./learning-resources.md).

This guide assumes you've already [installed Cursorless](./installation.md).

Once you understand the concepts, you can browse the [online cheatsheet](https://www.cursorless.org/cheatsheet), or pull up a local cheatsheet with your custom spoken forms by saying `"cursorless cheatsheet"` or `"cursorless reference"` with VS Code focused. You can return to these docs by saying `"cursorless docs"` or `"cursorless help"` within VS Code.

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
