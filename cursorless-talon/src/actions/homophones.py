from typing import Optional

from talon import actions, app

from ..targets.target_types import CursorlessTarget, PrimitiveDestination
from .get_text import cursorless_get_text_action
from .replace import cursorless_replace_action


def cursorless_homophones_action(target: CursorlessTarget):
    """Replaced target with next homophone"""
    texts = cursorless_get_text_action(target, show_decorations=False)
    try:
        updated_texts = list(map(get_next_homophone, texts))
    except LookupError as e:
        app.notify(str(e))
        return
    destination = PrimitiveDestination("to", target)
    cursorless_replace_action(destination, updated_texts)


def get_next_homophone(word: str) -> str:
    homophones: Optional[list[str]] = actions.user.homophones_get(word)
    if not homophones:
        raise LookupError(f"Found no homophones for '{word}'")
    index = (homophones.index(word.lower()) + 1) % len(homophones)
    homophone = homophones[index]
    return format_homophone(word, homophone)


def format_homophone(word: str, homophone: str) -> str:
    if word.isupper():
        return homophone.upper()
    if word == word.capitalize():
        return homophone.capitalize()
    return homophone
