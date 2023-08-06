from talon import Module, actions, app

from .csv_overrides import init_csv_and_watch_changes

mod = Module()
mod.list("cursorless_show_scope_visualizer", desc="Show scope visualizer")
mod.list("cursorless_hide_scope_visualizer", desc="Hide scope visualizer")
mod.list(
    "cursorless_visualization_type",
    desc='Cursorless visualization type, e.g. "removal" or "iteration"',
)

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
visualization_types = {
    "removal": "removal",
    "iteration": "iteration",
}


@mod.action_class
class Actions:
    def private_cursorless_show_scope_visualizer(
        scope_type: dict, visualization_type: str
    ):
        """Shows scope visualizer"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.showScopeVisualizer", scope_type, visualization_type
        )

    def private_cursorless_hide_scope_visualizer():
        """Hides scope visualizer"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.hideScopeVisualizer"
        )


def on_ready():
    init_csv_and_watch_changes(
        "scope_visualizer",
        {
            "show_scope_visualizer": {"visualize": "showScopeVisualizer"},
            "hide_scope_visualizer": {"visualize nothing": "hideScopeVisualizer"},
            "visualization_type": visualization_types,
        },
    )


app.register("ready", on_ready)
