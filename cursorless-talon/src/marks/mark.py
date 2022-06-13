from dataclasses import dataclass
from pathlib import Path
from typing import Any

from talon import Context, Module, actions, app, cron, fs

from ..csv_overrides import init_csv_and_watch_changes
from .lines_number import DEFAULT_DIRECTIONS

mod = Module()
ctx = Context()


mod.list("cursorless_hat_color", desc="Supported hat colors for cursorless")
mod.list("cursorless_hat_shape", desc="Supported hat shapes for cursorless")

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
hat_colors = {
    "blue": "blue",
    "green": "green",
    "red": "red",
    "pink": "pink",
    "yellow": "yellow",
    "navy": "userColor1",
    "apricot": "userColor2",
}

hat_shapes = {
    "ex": "ex",
    "fox": "fox",
    "wing": "wing",
    "hole": "hole",
    "frame": "frame",
    "curve": "curve",
    "eye": "eye",
    "play": "play",
    "cross": "crosshairs",
    "bolt": "bolt",
}


@mod.capture(
    rule="[{user.cursorless_hat_color}] [{user.cursorless_hat_shape}] <user.any_alphanumeric_key>"
)
def cursorless_decorated_symbol(m) -> dict[str, Any]:
    """A decorated symbol"""
    hat_color = getattr(m, "cursorless_hat_color", "default")
    try:
        hat_style_name = f"{hat_color}-{m.cursorless_hat_shape}"
    except AttributeError:
        hat_style_name = hat_color
    return {
        "type": "decoratedSymbol",
        "symbolColor": hat_style_name,
        "character": m.any_alphanumeric_key,
    }


@dataclass
class CustomizableTerm:
    defaultSpokenForm: str
    cursorlessIdentifier: str
    value: Any


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
special_marks = [
    CustomizableTerm("this", "currentSelection", {"type": "cursor"}),
    CustomizableTerm("that", "previousTarget", {"type": "that"}),
    CustomizableTerm("source", "previousSource", {"type": "source"}),
    CustomizableTerm("nothing", "nothing", {"type": "nothing"}),
    # "last cursor": {"mark": {"type": "lastCursorPosition"}} # Not implemented
]

special_marks_map = {term.cursorlessIdentifier: term for term in special_marks}

special_marks_defaults = {
    term.defaultSpokenForm: term.cursorlessIdentifier for term in special_marks
}


mod.list("cursorless_special_mark", desc="Cursorless special marks")


@mod.capture(
    rule=(
        "<user.cursorless_decorated_symbol> | "
        "{user.cursorless_special_mark} |"
        "<user.cursorless_line_number>"  # row (ie absolute mod 100), up, down
    )
)
def cursorless_mark(m) -> dict[str, Any]:
    try:
        return m.cursorless_decorated_symbol
    except AttributeError:
        pass
    try:
        return special_marks_map[m.cursorless_special_mark].value
    except AttributeError:
        pass
    return m.cursorless_line_number


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

unsubscribe_hat_styles = None


def setup_hat_styles_csv():
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
        "hat_styles",
        {
            "hat_color": active_hat_colors,
            "hat_shape": active_hat_shapes,
        },
        [*hat_colors.values(), *hat_shapes.values()],
        no_update_file=is_shape_error or is_color_error,
    )

    if is_shape_error or is_color_error:
        app.notify("Error reading vscode settings. Restart talon; see log")


fast_reload_job = None
slow_reload_job = None


def on_ready():
    init_csv_and_watch_changes(
        "special_marks",
        {
            "special_mark": special_marks_defaults,
            "line_direction": DEFAULT_DIRECTIONS,
        },
    )

    setup_hat_styles_csv()

    vscode_settings_path: Path = actions.user.vscode_settings_path().resolve()

    def on_watch(path, flags):
        global fast_reload_job, slow_reload_job
        cron.cancel(fast_reload_job)
        cron.cancel(slow_reload_job)
        fast_reload_job = cron.after("500ms", setup_hat_styles_csv)
        slow_reload_job = cron.after("10s", setup_hat_styles_csv)

    fs.watch(vscode_settings_path, on_watch)


app.register("ready", on_ready)
