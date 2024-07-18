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


def extract_decorated_marks(capture: Any) -> list[Any]:
    match capture:
        case PrimitiveTarget(mark=mark):
            if mark is None or mark["type"] != "decoratedSymbol":
                return []
            return [mark]
        case ImplicitTarget():
            return []
        case RangeTarget(anchor=anchor, active=active):
            return extract_decorated_marks(anchor) + extract_decorated_marks(active)
        case ListTarget(elements=elements):
            return [
                mark for target in elements for mark in extract_decorated_marks(target)
            ]
        case PrimitiveDestination(target=target):
            return extract_decorated_marks(target)
        case ImplicitDestination():
            return []
        case ListDestination(destinations=destinations):
            return [
                mark
                for destination in destinations
                for mark in extract_decorated_marks(destination)
            ]
        case BringMoveTargets(source=source, destination=destination):
            return extract_decorated_marks(source) + extract_decorated_marks(
                destination
            )
        case SwapTargets(target1=target1, target2=target2):
            return extract_decorated_marks(target1) + extract_decorated_marks(target2)
        case _:
            raise TypeError(f"Unknown capture type: {type(capture)}")
