import sys

one = 1


def mapsAndLists():
    # immutable can serve as dictionary keys
    key1 = "a"
    key2 = False
    key3 = 1.5

    # Python "tuple" is "pair"/"round" scope
    _ = (1, 2, 3)

    # Python "list" is "list" scope
    _ = [1, 2, 3]
    _ = [sys.path[0], sys.path[1]]
    fruits = ["apple", "banana", "cherry", "kiwi", "mango"]
    _ = [x for x in fruits if "a" in x]

    # Python "set" is "list" scope
    _ = {1, 2, 3}

    # Python "dictionary" is "map" scope
    d1 = {"a": 1, "b": 2, "c": 3}
    _ = {key1: 1, key2: 2, key3: 3}
    _ = {value: key for (key, value) in d1.items()}

    # complex ones
    _ = [[1, 2, 3], 4, 5, 6]
    _ = [[1, 2, 3], {1, 2, 3}, {"a": 1, "b": 2, "c": 3}]
    _ = {{"a": 1, "b": 2, "c": 3}: 1, d1: 2}
    _ = {{1, 2, 3}: 1, {2, 3, 4}: 2}
    _ = ({1, 2, 3}, {1, 2, 3}, {1, 2, 3})
