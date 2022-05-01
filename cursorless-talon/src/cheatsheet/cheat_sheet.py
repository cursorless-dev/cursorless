import math
import webbrowser

from talon import Module, actions, cron, skia, ui
from talon.canvas import Canvas

from .get_list import get_list, get_lists
from .sections.actions import get_actions
from .sections.compound_targets import get_compound_targets
from .sections.scopes import get_scopes

mod = Module()
mod.mode("cursorless_cheat_sheet", "Mode for showing cursorless cheat sheet gui")
cheat_sheet = None

instructions_url = "https://www.cursorless.org/docs/"
instructions_text = "Full docs"
line_height = 34
outer_padding = 27
text_size = 16
url_text_size = 30
close_size = 24
header_size = 22
padding = 4

command_font = "monospace"
text_font = ""

background_color = "fafafa"
border_color = "000000"
text_color = "444444"
header_color = "000000"
command_background_color = "e9e9e9"
command_text_color = "282828"
url_color = "0046c9"


class CheatSheet:
    def __init__(self):
        self.need_resize = True
        self.resize_job = None
        self.last_mouse_pos = None
        # Initializes at minimum size we can calculate and set correct size later
        self.canvas = Canvas(0, 0, 1, 1)
        self.canvas.blocks_mouse = True
        self.canvas.register("draw", self.draw)
        self.canvas.register("mouse", self.mouse)
        self.canvas.freeze()

    def close(self):
        self.canvas.unregister("draw", self.draw)
        self.canvas.unregister("mouse", self.mouse)
        self.canvas.close()

    def debounce_resize(self, width: int, height: int):
        cron.cancel(self.resize_job)
        self.resize_job = cron.after("50ms", lambda: self.resize(width, height))

    def resize(self, width: int, height: int):
        if not self.need_resize:
            return
        self.need_resize = False
        screen = ui.main_screen()
        rect = ui.Rect(
            screen.x + (screen.width - width) / 2,
            screen.y + (screen.height - height) / 2,
            width,
            height,
        )
        self.canvas.rect = rect

    def mouse(self, e):
        if e.event == "mousedown" and e.button == 0:
            self.last_mouse_pos = e.gpos
        elif e.event == "mousemove" and self.last_mouse_pos:
            diff_x = e.gpos.x - self.last_mouse_pos.x
            diff_y = e.gpos.y - self.last_mouse_pos.y
            self.last_mouse_pos = e.gpos
            self.canvas.move(self.canvas.rect.x + diff_x, self.canvas.rect.y + diff_y)
        elif e.event == "mouseup" and e.button == 0:
            self.last_mouse_pos = None
            if is_in_rect(self.canvas, e.gpos, get_close_rect(self.canvas)):
                actions.user.cursorless_cheat_sheet_toggle()
            elif is_in_rect(self.canvas, e.gpos, self.url_rect):
                actions.user.cursorless_cheat_sheet_toggle()
                actions.user.cursorless_open_instructions()

    def draw(self, canvas):
        self.x = canvas.x + outer_padding
        self.w = 0
        self.max_y = 0

        self.draw_background(canvas)
        self.draw_legend(canvas)
        self.draw_close(canvas)
        self.draw_url(canvas)

        self.y = get_y(canvas)
        self.w = 0

        self.is_first_row_in_column = True

        self.draw_multicolumn_section(
            canvas, get_actions(), ["Actions", "More actions"]
        )

        self.next_column(canvas)

        self.draw_multicolumn_section(canvas, get_scopes(), ["Scopes", "More scopes"])

        self.draw_section(
            canvas,
            "Paired delimiters",
            get_lists(
                [
                    "wrapper_only_paired_delimiter",
                    "wrapper_selectable_paired_delimiter",
                    "selectable_only_paired_delimiter",
                ]
            ),
        )

        self.next_column(canvas)

        self.draw_section(canvas, "Special marks", get_list("special_mark"))

        self.draw_section(canvas, "Positions", get_list("position"))

        self.draw_section(
            canvas,
            "Compound targets",
            get_compound_targets(),
        )

        hat_colors = get_list("hat_color")
        if hat_colors:
            self.draw_section(canvas, "Colors", hat_colors)

        hat_shapes = get_list("hat_shape")
        if hat_shapes:
            self.draw_section(canvas, "Shapes", hat_shapes)

        # Needs to update this for the last column
        self.max_y = max(self.max_y, self.y)

        # Resize to fit content
        # NB: We debounce because for some reason draw gets called multiple
        # times in quick succession.
        self.debounce_resize(
            math.ceil(self.x - canvas.x + self.w + outer_padding),
            math.ceil(self.max_y - canvas.y + outer_padding),
        )

    def draw_section(self, canvas, header_text, items):
        if not self.is_first_row_in_column:
            self.y += line_height / 2

        self.is_first_row_in_column = False

        self.draw_header(canvas, header_text)
        self.draw_items(canvas, items)

    def draw_multicolumn_section(
        self, canvas, items, column_names: str, scopes_limit=25
    ):
        items_0 = slice_dict(items, 0, scopes_limit)
        items_1 = slice_dict(items, scopes_limit)

        self.draw_section(canvas, column_names[0], items_0)

        self.next_column(canvas)

        self.draw_section(canvas, column_names[1], items_1)

    def draw_background(self, canvas):
        radius = 10
        rrect = skia.RoundRect.from_rect(canvas.rect, x=radius, y=radius)
        canvas.paint.style = canvas.paint.Style.FILL
        canvas.paint.color = background_color
        canvas.draw_rrect(rrect)

        canvas.paint.style = canvas.paint.Style.STROKE
        canvas.paint.color = border_color
        canvas.draw_rrect(rrect)

    def draw_legend(self, canvas):
        canvas.paint.style = canvas.paint.Style.FILL
        canvas.paint.textsize = text_size
        canvas.paint.color = text_color
        self.y = canvas.y + canvas.height - line_height
        self.draw_value(
            canvas,
            "S = Current selection,     T = Target,     P = Paired delimiter,     F = Formatter",
        )

    def draw_close(self, canvas):
        canvas.paint.textsize = close_size
        canvas.paint.style = canvas.paint.Style.FILL
        rect = get_close_rect(canvas)
        padding = close_size * 0.375
        canvas.draw_text("X", rect.x + padding, rect.y + rect.height - padding)

    def draw_url(self, canvas):
        canvas.paint.textsize = url_text_size
        canvas.paint.color = url_color
        canvas.paint.style = canvas.paint.Style.FILL
        rect = get_url_rect(canvas)
        self.url_rect = rect
        draw_text(
            canvas, instructions_text, rect.x + line_height, rect.y + 1.5 * padding
        )

    def next_column(self, canvas):
        self.max_y = max(self.max_y, self.y)
        self.x = self.x + self.w + 1.5 * line_height
        self.y = get_y(canvas)
        self.w = 0
        self.is_first_row_in_column = True

    def draw_header(self, canvas, text):
        canvas.paint.typeface = text_font
        canvas.paint.color = header_color
        canvas.paint.textsize = header_size
        canvas.paint.style = canvas.paint.Style.FILL
        canvas.paint.font.embolden = True
        rect = canvas.paint.measure_text(text)[1]
        draw_text(canvas, text, self.x, self.y)
        self.y += line_height
        self.w = max(self.w, rect.width)

    def draw_items(self, canvas, items):
        canvas.paint.textsize = text_size
        canvas.paint.style = canvas.paint.Style.FILL
        canvas.paint.font.embolden = False
        if isinstance(items, dict):
            self.draw_dict(canvas, items)
        else:
            self.draw_list(canvas, items)

    def draw_dict(self, canvas, items):
        x_org = self.x
        y_org = self.y
        w_org = self.w

        self.w = 0
        for text in items.keys():
            self.draw_key(canvas, text)
        width_key = self.w

        self.x = x_org + width_key + line_height
        self.y = y_org
        self.w = 0
        for text in items.values():
            self.draw_value(canvas, text)
        width_value = self.w

        self.x = x_org
        self.w = max(w_org, width_key + line_height + width_value)

    def draw_list(self, canvas, items):
        for text in items:
            self.draw_key(canvas, text)

    def draw_key(self, canvas, text):
        canvas.paint.typeface = command_font
        rect = canvas.paint.measure_text(text)[1]

        canvas.paint.color = command_background_color
        radius = 4
        rrect = ui.Rect(
            self.x, self.y, rect.width + 2 * padding, text_size + 2 * padding
        )
        rrect = skia.RoundRect.from_rect(rrect, x=radius, y=radius)
        canvas.draw_rrect(rrect)

        canvas.paint.color = command_text_color
        draw_text(canvas, text, self.x + padding, self.y)

        self.y += line_height
        self.w = max(self.w, rect.width)

    def draw_value(self, canvas, text):
        canvas.paint.typeface = text_font
        canvas.paint.color = text_color
        rect = canvas.paint.measure_text(text)[1]
        draw_text(canvas, text, self.x, self.y)
        self.y += line_height
        self.w = max(self.w, rect.width)


@mod.action_class
class Actions:
    def cursorless_cheat_sheet_toggle():
        """Toggle cursorless cheat sheet"""
        global cheat_sheet
        if cheat_sheet:
            actions.mode.disable("user.cursorless_cheat_sheet")
            cheat_sheet.close()
            cheat_sheet = None
        else:
            cheat_sheet = CheatSheet()
            actions.mode.enable("user.cursorless_cheat_sheet")

    def cursorless_open_instructions():
        """Open web page with cursorless instructions"""
        webbrowser.open(instructions_url)


def get_y(canvas):
    return canvas.y + outer_padding


def draw_text(canvas, text, x, y):
    canvas.draw_text(text, x, y + text_size + padding / 2)


def get_close_rect(canvas):
    wh = 1.5 * close_size
    cr = canvas.rect
    return ui.Rect(cr.x + cr.width - wh, cr.y, wh, wh)


def get_url_rect(canvas):
    rect = canvas.paint.measure_text(instructions_text)[1]
    width = rect.width + 2 * line_height
    height = line_height + padding
    cr = canvas.rect
    return ui.Rect(cr.x + cr.width - width, cr.y + cr.height - height, width, height)


def in_range(value, min, max):
    return value >= min and value <= max


def is_in_rect(canvas, mouse_pos, rect):
    return in_range(mouse_pos.x, rect.x, rect.x + rect.width) and in_range(
        mouse_pos.y, rect.y, rect.y + rect.height
    )


def slice_dict(dict: dict, start: int, end: int = None):
    keys = sorted(dict)[start:end]
    return {key: dict[key] for key in keys}
