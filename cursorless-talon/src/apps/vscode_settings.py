import os
import traceback
from pathlib import Path
from typing import Any

from talon import Context, Module, actions

from ..vendor.jstyleson import loads

mod = Module()

windows_ctx = Context()
mac_ctx = Context()
linux_ctx = Context()

windows_ctx.matches = r"""
os: windows
"""
mac_ctx.matches = r"""
os: mac
"""
linux_ctx.matches = r"""
os: linux
"""


@mod.action_class
class Actions:
    def vscode_settings_path() -> Path:
        """Get path of vscode settings json file"""

    def vscode_get_setting(key: str, default_value: Any = None):
        """Get the value of vscode setting at the given key"""
        path: Path = actions.user.vscode_settings_path()
        settings: dict = loads(path.read_text())

        if default_value is not None:
            return settings.get(key, default_value)
        else:
            return settings[key]

    def vscode_get_setting_with_fallback(
        key: str,
        default_value: Any,
        fallback_value: Any,
        fallback_message: str,
    ) -> tuple[Any, bool]:
        """Returns a vscode setting with a fallback in case there's an error

        Args:
            key (str): The key of the setting to look up
            default_value (Any): The default value to return if the setting is not defined
            fallback_value (Any): The value to return if there is an error looking up the setting
            fallback_message (str): The message to show to the user if we end up having to use the fallback

        Returns:
            tuple[Any, bool]: The value of the setting or the default or fall back, along with boolean which is true if there was an error
        """
        try:
            return actions.user.vscode_get_setting(key, default_value), False
        except Exception:
            print(fallback_message)
            traceback.print_exc()
            return fallback_value, True


def pick_path(paths: list[Path]) -> Path:
    existing_paths = [path for path in paths if path.exists()]
    return max(existing_paths, key=lambda path: path.stat().st_mtime)


@mac_ctx.action_class("user")
class MacUserActions:
    def vscode_settings_path() -> Path:
        application_support = Path.home() / "Library/Application Support"
        return pick_path(
            [
                application_support / "Code/User/settings.json",
                application_support / "VSCodium/User/settings.json",
            ]
        )


@linux_ctx.action_class("user")
class LinuxUserActions:
    def vscode_settings_path() -> Path:
        xdg_config_home = Path(
            os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")
        )
        flatpak_apps = Path.home() / ".var/app"
        return pick_path(
            [
                xdg_config_home / "Code/User/settings.json",
                xdg_config_home / "VSCodium/User/settings.json",
                xdg_config_home / "Code - OSS/User/settings.json",
                flatpak_apps / "com.visualstudio.code/config/Code/User/settings.json",
                flatpak_apps / "com.vscodium.codium/config/VSCodium/User/settings.json",
                flatpak_apps
                / "com.visualstudio.code-oss/config/Code - OSS/User/settings.json",
            ]
        )


@windows_ctx.action_class("user")
class WindowsUserActions:
    def vscode_settings_path() -> Path:
        appdata = Path(os.environ["APPDATA"])
        return pick_path(
            [
                appdata / "Code/User/settings.json",
                appdata / "VSCodium/User/settings.json",
            ]
        )
