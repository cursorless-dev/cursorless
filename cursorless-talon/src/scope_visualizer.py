from talon import Module, actions

mod = Module()
mod.list("cursorless_show_scope_visualizer", desc="Show scope visualizer")
mod.list("cursorless_hide_scope_visualizer", desc="Hide scope visualizer")
mod.list(
    "cursorless_visualization_type",
    desc='Cursorless visualization type, e.g. "removal" or "iteration"',
)


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
