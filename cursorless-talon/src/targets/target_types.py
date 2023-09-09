from dataclasses import dataclass
from typing import Literal, Union

RangeTargetType = Literal["vertical"]


@dataclass
class PrimitiveTarget:
    type = "primitive"
    mark: dict | None
    modifiers: list[dict] | None


@dataclass
class ImplicitTarget:
    type = "implicit"


@dataclass
class RangeTarget:
    type = "range"
    anchor: PrimitiveTarget | ImplicitTarget
    active: PrimitiveTarget
    excludeAnchor: bool
    excludeActive: bool
    rangeType: RangeTargetType | None


@dataclass
class ListTarget:
    type = "list"
    elements: list[PrimitiveTarget | RangeTarget]


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
    target: ListTarget | RangeTarget | PrimitiveTarget


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
