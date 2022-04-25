from talon import actions, app

from .get_text import get_text


def run_homophones_action(targets: dict):
    """Replaced target with next homophone"""
    texts = get_text(targets, show_decorations=False)
    try:
        updated_texts = list(map(lambda text: get_next_homophone(text), texts))
    except LookupError as e:
        app.notify(str(e))
        return
    actions.user.cursorless_replace(targets, updated_texts)


def get_next_homophone(word: str):
    homophones = actions.user.homophones_get(word)
    if not homophones:
        raise LookupError(f"Found no homophones for '{word}'")
    index = (homophones.index(word.lower()) + 1) % len(homophones)
    homophone = homophones[index]
    return format_homophone(word, homophone)


def format_homophone(word: str, homophone: str):
    if word.isupper():
        return homophone.upper()
    if word == word.capitalize():
        return homophone.capitalize()
    return homophone
