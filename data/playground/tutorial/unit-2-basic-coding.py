def print_color(color, invert=False):
    if invert:
        print(invert_color(color))
    else:
        print(color)


def invert_color(color):
    if color == "black":
        return "white"


print_color("black")
