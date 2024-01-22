empty round: "()"
empty square: "[]"
empty curly: "{}"
empty diamond: "<>"
empty quad: '""'
empty twin: "''"
empty escaped quad: '\\"\\"'
empty escaped twin: "\\'\\'"
empty escaped round: "\\(\\)"
empty escaped curly: "\\{{\\}}"
tween <user.symbol_key>: user.insert_between("{symbol_key}", "{symbol_key}")
quad: user.insert_between('"', '"')
twin: user.insert_between("'", "'")
ski: user.insert_between("`", "`")
escaped quad: user.insert_between('\\"', '\\"')
escaped twin: user.insert_between("\\'", "\\'")
round: user.insert_between("(", ")")
escaped round: user.insert_between("\\(", "\\)")
escaped curly: user.insert_between("\\{{", "\\}}")
square: user.insert_between("[", "]")
curly: user.insert_between("{", "}")
diamond: user.insert_between("<", ">")
(diamond | angle) that:
    text = edit.selected_text()
    user.paste("<{text}>")
(curly | lace) that:
    text = edit.selected_text()
    user.paste("{{{text}}}")
(round | leper) that:
    text = edit.selected_text()
    user.paste("({text})")
(double | quad) that:
    text = edit.selected_text()
    user.paste("'{text}'")
(double quote | dubquote) that:
    text = edit.selected_text()
    user.paste('"{text}"')
(single | twin) that:
    text = edit.selected_text()
    user.paste("'{text}'")

big round:
    insert("()")
    key(left enter)
big square:
    insert("[]")
    key(left enter)
big curly:
    insert("{}")
    key(left enter)
