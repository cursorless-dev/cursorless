from talon import Context

ctx = Context()
ctx.matches = r"""
tag: user.cursorless_default_vocabulary
"""

# https://github.com/talonhub/community/blob/9acb6c9659bb0c9b794a7b7126d025603b4ed726/core/keys/keys.py#L10
initial_default_alphabet = "air bat cap drum each fine gust harp sit jury crunch look made near odd pit quench red sun trap urge vest whale plex yank zip".split()

# https://github.com/talonhub/community/blob/9acb6c9659bb0c9b794a7b7126d025603b4ed726/core/keys/keys.py#L24
digits = "zero one two three four five six seven eight nine".split()

# https://github.com/talonhub/community/blob/9acb6c9659bb0c9b794a7b7126d025603b4ed726/core/keys/keys.py#L139C1-L171C2
punctuation_words = {
    "back tick": "`",
    "comma": ",",
    # Workaround for issue with conformer b-series; see #946
    "coma": ",",
    "period": ".",
    "full stop": ".",
    "semicolon": ";",
    "colon": ":",
    "forward slash": "/",
    "question mark": "?",
    "exclamation mark": "!",
    "exclamation point": "!",
    "asterisk": "*",
    "hash sign": "#",
    "number sign": "#",
    "percent sign": "%",
    "at sign": "@",
    "and sign": "&",
    "ampersand": "&",
    # Currencies
    "dollar sign": "$",
    "pound sign": "£",
    "hyphen": "-",
    "L paren": "(",
    "left paren": "(",
    "R paren": ")",
    "right paren": ")",
}

# https://github.com/talonhub/community/blob/9acb6c9659bb0c9b794a7b7126d025603b4ed726/core/keys/keys.py#L172
symbol_key_words = {
    "dot": ".",
    "point": ".",
    "quote": "'",
    "question": "?",
    "apostrophe": "'",
    "L square": "[",
    "left square": "[",
    "square": "[",
    "R square": "]",
    "right square": "]",
    "slash": "/",
    "backslash": "\\",
    "minus": "-",
    "dash": "-",
    "equals": "=",
    "plus": "+",
    "grave": "`",
    "tilde": "~",
    "bang": "!",
    "down score": "_",
    "underscore": "_",
    "paren": "(",
    "brace": "{",
    "left brace": "{",
    "brack": "{",
    "bracket": "{",
    "left bracket": "{",
    "r brace": "}",
    "right brace": "}",
    "r brack": "}",
    "r bracket": "}",
    "right bracket": "}",
    "angle": "<",
    "left angle": "<",
    "less than": "<",
    "rangle": ">",
    "R angle": ">",
    "right angle": ">",
    "greater than": ">",
    "star": "*",
    "hash": "#",
    "percent": "%",
    "caret": "^",
    "amper": "&",
    "pipe": "|",
    "dub quote": '"',
    "double quote": '"',
    # Currencies
    "dollar": "$",
    "pound": "£",
}

any_alphanumeric_keys = {
    **{w: chr(ord("a") + i) for i, w in enumerate(initial_default_alphabet)},
    **{digits[i]: str(i) for i in range(10)},
    **punctuation_words,
    **symbol_key_words,
}


@ctx.capture("user.any_alphanumeric_key", rule="|".join(any_alphanumeric_keys.keys()))
def any_alphanumeric_key(m) -> str:
    return any_alphanumeric_keys[str(m)]
