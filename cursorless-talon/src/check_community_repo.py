from talon import app, registry

required_captures = [
    "number_small",
    "user.any_alphanumeric_key",
    "user.formatters",
    "user.ordinals_small",
]

required_actions = [
    "user.homophones_get",
    "user.reformat_text",
]


def onready():
    missing_captures = [
        capture for capture in required_captures if capture not in registry.captures
    ]
    missing_actions = [
        action for action in required_actions if action not in registry.actions
    ]
    errors = []
    if missing_captures:
        errors.append(f"Missing captures: {', '.join(missing_captures)}")
    if missing_actions:
        errors.append(f"Missing actions: {', '.join(missing_actions)}")
    if errors:
        errors.insert(0, "https://github.com/talonhub/community")
        message = "\n".join(errors)
        app.notify("Cursorless missing community repository", body=message)


app.register("ready", onready)
