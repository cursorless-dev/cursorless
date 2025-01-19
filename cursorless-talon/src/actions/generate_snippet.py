import glob
from pathlib import Path

from talon import actions, settings

from ..targets.target_types import CursorlessExplicitTarget


def cursorless_generate_snippet_action(target: CursorlessExplicitTarget):
    actions.user.private_cursorless_command_no_wait(
        {
            "name": "generateSnippet",
            "target": target,
            "dirPath": get_dir_path(),
        }
    )


def get_dir_path() -> str:
    settings_dir = get_setting_dir()
    if settings_dir is not None:
        return settings_dir
    return get_community_snippets_dir()


def get_community_snippets_dir() -> str:
    files = glob.iglob(
        f"{actions.path.talon_user()}/**/snippets/snippets/*.snippet",
        recursive=True,
    )
    for file in files:
        return str(Path(file).parent)
    raise ValueError("Could not find community snippets directory")


def get_setting_dir() -> str | None:
    try:
        setting_dir = settings.get("user.snippets_dir")
        if not setting_dir:
            return None

        dir = Path(setting_dir)

        if not dir.is_absolute():
            user_dir = Path(actions.path.talon_user())
            dir = user_dir / dir

        return str(dir.resolve())
    except Exception:
        return None
