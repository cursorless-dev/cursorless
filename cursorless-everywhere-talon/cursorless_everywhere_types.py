from typing import Literal, TypedDict


class SelectionOffsets(TypedDict):
    anchor: int
    active: int


class CharacterRangeOffsets(TypedDict):
    type: Literal["character"]
    start: int
    end: int


class LineRange(TypedDict):
    type: Literal["line"]
    start: int
    end: int


GeneralizedRangeOffsets = CharacterRangeOffsets | LineRange


class FlashDescriptorOffsets(TypedDict):
    style: str
    range: GeneralizedRangeOffsets


class EditorState(TypedDict):
    text: str
    selections: list[SelectionOffsets]


class EditorChange(TypedDict):
    text: str
    rangeOffset: int
    rangeLength: int


class EditorEdit(TypedDict):
    # The new document content after the edit
    text: str

    # A list of changes that were made to the document. If you can not handle
    # this, you can ignore it and just replace the entire document with the
    # value of the `text` field above.
    changes: list[EditorChange]
