from ..get_list import get_list, get_raw_list, make_readable


def get_scope_visualizer():
    show_scope_visualizer = list(get_raw_list("show_scope_visualizer").keys())[0]
    visualization_types = get_raw_list("visualization_type")

    return [
        *get_list("hide_scope_visualizer", "command"),
        {
            "id": "show_scope_visualizer",
            "type": "command",
            "variations": [
                {
                    "spokenForm": f"{show_scope_visualizer} <scope>",
                    "description": "Visualize <scope>",
                },
                *[
                    {
                        "spokenForm": f"{show_scope_visualizer} <scope> {spoken_form}",
                        "description": f"Visualize <scope> {make_readable(id).lower()} range",
                    }
                    for spoken_form, id in visualization_types.items()
                ],
            ],
        },
        {
            "id": "show_scope_sidebar",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "bar cursorless",
                    "description": "Show cursorless sidebar",
                },
            ],
        },
    ]
