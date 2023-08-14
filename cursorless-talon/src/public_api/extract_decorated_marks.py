from typing import Any

from ..actions.bring_move import BringMoveTargets
from ..actions.swap import SwapTargets
from ..targets.target_types import (
    ImplicitDestination,
    ImplicitTarget,
    ListDestination,
    ListTarget,
    PrimitiveDestination,
    PrimitiveTarget,
    RangeTarget,
)


def extract_decorated_marks(capture: Any) -> list[dict]:
    if isinstance(capture, ListTarget):
        return [
            mark
            for target in capture.elements
            for mark in extract_decorated_marks(target)
        ]

    if isinstance(capture, RangeTarget):
        return extract_decorated_marks(capture.anchor) + extract_decorated_marks(
            capture.active
        )

    if isinstance(capture, PrimitiveTarget):
        return extract_decorated_marks_from_primitive_target(capture)

    if isinstance(capture, ImplicitTarget):
        return []

    if isinstance(capture, ListDestination):
        return [
            mark
            for destination in capture.destinations
            for mark in extract_decorated_marks(destination)
        ]

    if isinstance(capture, PrimitiveDestination):
        return extract_decorated_marks(capture.target)

    if isinstance(capture, ImplicitDestination):
        return []

    if isinstance(capture, BringMoveTargets):
        return extract_decorated_marks(capture.source) + extract_decorated_marks(
            capture.destination
        )

    if isinstance(capture, SwapTargets):
        return extract_decorated_marks(capture.target1) + extract_decorated_marks(
            capture.target2
        )

    raise TypeError(f"Unknown capture type: {type(capture)}")


def extract_decorated_marks_from_primitive_target(target: PrimitiveTarget):
    if target.mark is None or target.mark["type"] != "decoratedSymbol":
        return []

    return [target.mark]
