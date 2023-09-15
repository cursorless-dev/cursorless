from dataclasses import dataclass
from typing import Any, Literal, Optional, Union

from ..marks.mark_types import Mark

RangeTargetType = Literal["vertical"]


@dataclass
class PrimitiveTarget:
    type = "primitive"
    mark: Optional[Mark]
    modifiers: Optional[list[dict[str, Any]]]


@dataclass
class ImplicitTarget:
    type = "implicit"


@dataclass
class RangeTarget:
    type = "range"
    anchor: Union[PrimitiveTarget, ImplicitTarget]
    active: PrimitiveTarget
    excludeAnchor: bool
    excludeActive: bool
    rangeType: Optional[RangeTargetType]


@dataclass
class ListTarget:
    type = "list"
    elements: list[Union[PrimitiveTarget, RangeTarget]]


CursorlessTarget = Union[
    ListTarget,
    RangeTarget,
    PrimitiveTarget,
    ImplicitTarget,
]


@dataclass
class PrimitiveDestination:
    type = "primitive"
    insertionMode: Literal["to", "before", "after"]
    target: Union[ListTarget, RangeTarget, PrimitiveTarget]


@dataclass
class ImplicitDestination:
    type = "implicit"


@dataclass
class ListDestination:
    type = "list"
    destinations: list[PrimitiveDestination]


CursorlessDestination = Union[
    ListDestination,
    PrimitiveDestination,
    ImplicitDestination,
]
