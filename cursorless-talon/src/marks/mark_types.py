from typing import Literal, TypedDict, Union


class DecoratedSymbol(TypedDict):
    type: Literal["decoratedSymbol"]
    symbolColor: str
    character: str


SimpleMark = dict[Literal["type"], str]

LineNumberType = Literal["modulo100", "relative"]


class LineNumberMark(TypedDict):
    type: Literal["lineNumber"]
    lineNumberType: LineNumberType
    lineNumber: int


class LineNumberRange(TypedDict):
    type: Literal["range"]
    anchor: LineNumberMark
    active: LineNumberMark
    excludeAnchor: bool
    excludeActive: bool


LineNumber = Union[LineNumberMark, LineNumberRange]

Mark = Union[DecoratedSymbol, SimpleMark, LineNumber]
