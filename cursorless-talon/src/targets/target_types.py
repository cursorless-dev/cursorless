from typing import Literal, Optional, Union


@dataclass
class PrimitiveTarget:
    type = "primitive"
    mark: Optional[dict]
    modifiers: Optional[list[dict]]


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
    rangeType: Optional[str]


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
