import json
from pathlib import Path
from typing import TypedDict

from talon import app

SPOKEN_FORMS_OUTPUT_PATH = Path.home() / ".cursorless" / "state.json"
STATE_JSON_VERSION_NUMBER = 0


class SpokenFormEntry(TypedDict):
    type: str
    id: str
    spokenForms: list[str]


class SpokenFormsOutput:
    """
    Writes spoken forms to a json file for use by the Cursorless vscode extension
    """

    def init(self):
        try:
            SPOKEN_FORMS_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        except Exception:
            error_message = (
                f"Error creating spoken form dir {SPOKEN_FORMS_OUTPUT_PATH.parent}"
            )
            print(error_message)
            app.notify(error_message)

    def write(self, spoken_forms: list[SpokenFormEntry]):
        with open(SPOKEN_FORMS_OUTPUT_PATH, "w", encoding="UTF-8") as out:
            try:
                out.write(
                    json.dumps(
                        {
                            "version": STATE_JSON_VERSION_NUMBER,
                            "spokenForms": spoken_forms,
                        }
                    )
                )
            except Exception:
                error_message = (
                    f"Error writing spoken form json {SPOKEN_FORMS_OUTPUT_PATH}"
                )
                print(error_message)
                app.notify(error_message)
