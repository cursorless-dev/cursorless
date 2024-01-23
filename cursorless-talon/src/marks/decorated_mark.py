from pathlib import Path
from typing import Any

from talon import Module, actions, cron, fs

from ..csv_overrides import init_csv_and_watch_changes
from .mark_types import DecoratedSymbol

mod = Module()

mod.list("cursorless_hat_color", desc="Supported hat colors for cursorless")
mod.list("cursorless_hat_shape", desc="Supported hat shapes for cursorless")
mod.list(
    "cursorless_unknown_symbol",
    "This list contains the term that is used to refer to any unknown symbol",
)


@mod.capture(rule="<user.any_alphanumeric_key> | {user.cursorless_unknown_symbol}")
def cursorless_grapheme(m) -> str:
    try:
        return m.any_alphanumeric_key
    except AttributeError:
        # NB: This represents unknown char in Unicode.  It will be translated
        # to "[unk]" by Cursorless extension.
        return "\uFFFD"


@mod.capture(
    rule="[{user.cursorless_hat_color}] [{user.cursorless_hat_shape}] <user.cursorless_grapheme>"
)
def cursorless_decorated_symbol(m) -> DecoratedSymbol:
    """A decorated symbol"""
    hat_color: str = getattr(m, "cursorless_hat_color", "default")
    try:
        hat_style_name = f"{hat_color}-{m.cursorless_hat_shape}"
    except AttributeError:
        hat_style_name = hat_color
    return {
        "type": "decoratedSymbol",
        "symbolColor": hat_style_name,
        "character": m.cursorless_grapheme,
    }


DEFAULT_COLOR_ENABLEMENT = {
    "blue": True,
    "green": True,
    "red": True,
    "pink": True,
    "yellow": True,
    "userColor1": False,
    "userColor2": False,
}

DEFAULT_SHAPE_ENABLEMENT = {
    "ex": False,
    "fox": False,
    "wing": False,
    "hole": False,
    "frame": False,
    "curve": False,
    "eye": False,
    "play": False,
    "bolt": False,
    "crosshairs": False,
}

# Fall back to full enablement in case of error reading settings file
# NB: This won't actually enable all the shapes and colors extension-side.
# It'll just make it so that the user can say them whether or not they are enabled
FALLBACK_SHAPE_ENABLEMENT = {
    "ex": True,
    "fox": True,
    "wing": True,
    "hole": True,
    "frame": True,
    "curve": True,
    "eye": True,
    "play": True,
    "bolt": True,
    "crosshairs": True,
}
FALLBACK_COLOR_ENABLEMENT = DEFAULT_COLOR_ENABLEMENT

unsubscribe_hat_styles: Any = None


def setup_hat_styles_csv(hat_colors: dict[str, str], hat_shapes: dict[str, str]):
    global unsubscribe_hat_styles

    (
        color_enablement_settings,
        is_color_error,
    ) = actions.user.vscode_get_setting_with_fallback(
        "cursorless.hatEnablement.colors",
        default_value={},
        fallback_value=FALLBACK_COLOR_ENABLEMENT,
        fallback_message="Error finding color enablement; falling back to full enablement",
    )

    (
        shape_enablement_settings,
        is_shape_error,
    ) = actions.user.vscode_get_setting_with_fallback(
        "cursorless.hatEnablement.shapes",
        default_value={},
        fallback_value=FALLBACK_SHAPE_ENABLEMENT,
        fallback_message="Error finding shape enablement; falling back to full enablement",
    )

    color_enablement = {
        **DEFAULT_COLOR_ENABLEMENT,
        **color_enablement_settings,
    }
    shape_enablement = {
        **DEFAULT_SHAPE_ENABLEMENT,
        **shape_enablement_settings,
    }

    active_hat_colors = {
        spoken_form: value
        for spoken_form, value in hat_colors.items()
        if color_enablement[value]
    }
    active_hat_shapes = {
        spoken_form: value
        for spoken_form, value in hat_shapes.items()
        if shape_enablement[value]
    }

    if unsubscribe_hat_styles is not None:
        unsubscribe_hat_styles()

    unsubscribe_hat_styles = init_csv_and_watch_changes(
        "hat_styles.csv",
        {
            "hat_color": active_hat_colors,
            "hat_shape": active_hat_shapes,
        },
        extra_ignored_values=[*hat_colors.values(), *hat_shapes.values()],
        no_update_file=is_shape_error or is_color_error,
    )

    if is_shape_error or is_color_error:
        actions.app.notify("Error reading vscode settings. Restart talon; see log")


fast_reload_job = None
slow_reload_job = None


def init_hats(hat_colors: dict[str, str], hat_shapes: dict[str, str]):
    setup_hat_styles_csv(hat_colors, hat_shapes)

    vscode_settings_path: Path = actions.user.vscode_settings_path().resolve()

    def on_watch(path, flags):
        global fast_reload_job, slow_reload_job
        cron.cancel(fast_reload_job)
        cron.cancel(slow_reload_job)
        fast_reload_job = cron.after(
            "500ms", lambda: setup_hat_styles_csv(hat_colors, hat_shapes)
        )
        slow_reload_job = cron.after(
            "10s", lambda: setup_hat_styles_csv(hat_colors, hat_shapes)
        )

    fs.watch(str(vscode_settings_path), on_watch)

    def unsubscribe():
        fs.unwatch(str(vscode_settings_path), on_watch)
        if unsubscribe_hat_styles is not None:
            unsubscribe_hat_styles()

    return unsubscribe
