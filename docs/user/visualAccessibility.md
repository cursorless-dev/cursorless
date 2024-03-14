# Visual Accessibility

Cursorless has multiple settings that can be customized to improve accessibility for users with color blindness or other vision impairments. This guide has a few techniques to help you customize Cursorless to fit your needs. The primary visual elements of Cursorless are the [hats](./README.md#decorated-symbol), so this guide will focus on customizing the hats.

## Make the hats bigger

Say `"cursorless settings"` and find the `cursorless.hatSize` setting. This setting allows you to increase the size of the hats. You may need to change the vertical offset of the hats to keep them from clipping the line below / above.

You may also want to increase your line height to allow you to make the hats even larger: say `"show settings say line height"` and increase the line height to your preference.

A reasonable place to start is to set the line height to 1.6 and the hat size to 70.

## Use shapes instead of colors

If you are a user with color blindness, it may be helpful to disable a subset or all colors and enable shapes instead. You can do so by saying `"cursorless settings"` and finding the `cursorless.hatEnablement.colors` and `cursorless.hatEnablement.shapes` settings.

## Tweak your color scheme

You can change the colors of the hats by saying `"cursorless settings"` and finding the `cursorless.colors.light` and `cursorless.colors.dark` settings.

There are several user-created color schemes available [on the Cursorless wiki](https://github.com/cursorless-dev/cursorless/wiki/Color-schemes). One notable color scheme is the [Greyscale for Night Owl theme](https://github.com/cursorless-dev/cursorless/wiki/Color-schemes#greyscale-for-night-owl-theme), which is designed to reduce visual stimulation and be compatible with most forms of color blindness. Instead of colors like "yellow", "green", etc, it uses "bright" and "dark". Here's how you use it:

1. Say `"cursorless settings"` and find the `cursorless.colors.light` or `cursorless.colors.dark` settings depending on your preferred mode
1. Change your `default` color to `#848384`
1. Change your `blue` color to `#ffffff`
1. Change your `green` color to `#333333`
1. Disable the other colors using the `cursorless.hatEnablement.colors` setting
1. Change spoken forms within your Cursorless settings folder located at `cursorless-settings/hat_styles.csv` so that you have `bright, blue` and `dark, green`. This is within your Talon configuration, not the IDE settings. This will change the spoken forms to match the new colors so that you can say eg `"take bright air"` to select the word "air" with a bright hat.
