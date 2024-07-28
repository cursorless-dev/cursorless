from talon import Context, app, ui

from .cursorless_everywhere_talon import (
    EditorChanges,
    EditorState,
    SelectionOffsets,
)

if app.platform == "windows":
    from talon.windows.ax import TextRange


# https://learn.microsoft.com/en-us/dotnet/api/system.windows.automation.text.textpatternrange?view=windowsdesktop-8.0

ctx = Context()

ctx.matches = r"""
os: windows
"""


@ctx.action_class("user")
class Actions:
    def cursorless_everywhere_get_editor_state() -> EditorState:
        el = ui.focused_element()

        if "Text2" not in el.patterns:
            raise ValueError("Focused element is not a text element")

        text_pattern = el.text_pattern2
        document_range = text_pattern.document_range
        caret_range = text_pattern.caret_range
        selection_ranges = text_pattern.selection
        selections: list[SelectionOffsets] = []

        for selection_range in selection_ranges:
            anchor, active = get_selection(document_range, selection_range, caret_range)
            selections.append(
                {
                    "anchor": anchor,
                    "active": active,
                }
            )

        return {
            "text": document_range.text,
            "selections": selections,
        }

    def cursorless_everywhere_set_selections(
        selections: list[SelectionOffsets],  # pyright: ignore [reportGeneralTypeIssues]
    ):
        if selections.length != 1:  # pyright: ignore [reportAttributeAccessIssue]
            raise ValueError("Only single selection supported")

        selection = selections[0]
        anchor = selection["anchor"]
        active = selection["active"]

        print(f"Setting selection to {anchor}, {active}")

        el = ui.focused_element()

        if "Text2" not in el.patterns:
            raise ValueError("Focused element is not a text element")

        text_pattern = el.text_pattern2
        document_range = text_pattern.document_range

        set_selection(document_range, anchor, active)

    def cursorless_everywhere_set_text(
        changes: EditorChanges,  # pyright: ignore [reportGeneralTypeIssues]
    ):
        """Set focused element text"""
        text = changes["text"]
        print(f"Setting text to '{text}'")

        el = ui.focused_element()

        if "Value" not in el.patterns:
            raise ValueError("Focused element is not a text element")

        el.value_pattern.value = text


def set_selection(document_range: TextRange, anchor: int, active: int):
    # This happens in slack, for example. The document range starts with a
    # newline and selecting first character we'll make the selection go outside
    # of the edit box.
    if document_range.text.startswith("\n") and anchor == 0 and active == 0:
        anchor = 1
        active = 1

    start = min(anchor, active)
    end = max(anchor, active)
    range = document_range.clone()
    range.move_endpoint_by_range("End", "Start", target=document_range)
    range.move_endpoint_by_unit("End", "Character", end)
    range.move_endpoint_by_unit("Start", "Character", start)
    range.select()


def get_selection(
    document_range: TextRange, selection_range: TextRange, caret_range: TextRange
) -> tuple[int, int]:
    range_before_selection = document_range.clone()
    range_before_selection.move_endpoint_by_range(
        "End",
        "Start",
        target=selection_range,
    )
    start = len(range_before_selection.text)

    range_after_selection = document_range.clone()
    range_after_selection.move_endpoint_by_range(
        "Start",
        "End",
        target=selection_range,
    )
    end = len(document_range.text) - len(range_after_selection.text)

    is_reversed = (
        caret_range.compare_endpoints("Start", "Start", target=selection_range) == 0
    )

    return (end, start) if is_reversed else (start, end)
