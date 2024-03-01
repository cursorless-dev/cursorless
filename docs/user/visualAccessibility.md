# Visual Accessibility

Cursorless has multiple settings that can be customized to improve accessibility for users with color blindness or other vision impairments. You can read or configure a list of all [IDE-side settings](./customization.md/#ide-side-settings) related to visual display by saying `cursorless settings` while your IDE is focused.

If you are a user with color blindness, it may be helpful to disable a subset or all colors and enable more shapes instead. If you are a user that prefers larger hats, you can also increase their baseline size and vertical offset, beyond what will be automatically scale based on your IDE zoom percentage.

One notable colorscheme is the [Greyscale for Night Owl theme](https://github.com/cursorless-dev/cursorless/wiki/Color-schemes#greyscale-for-night-owl-theme), which is designed to reduce visual stimulation and be compatible with most forms of color blindness. The colors are as follows, but can be changed easily to fit your preferences:

```
"default": "#848384",
"bright": "#ffffff",
"dark": "#333333",
```

To use this or any colorscheme, do the following:

- Say `cursorless settings` within your IDE
- Find your list of colors in `cursorless.colors.light` or `cursorless.colors.dark` depending on your preferred mode
- Replace the colors with the ones from the colorscheme
- Disable colors you do not want to see in `cursorless.hatEnablement.color`
- Change spoken forms if desired within your Cursorless settings folder located at`cursorless-settings/hat_styles.csv`
  - _Note: this is within your Talon configuration, not the IDE settings_
