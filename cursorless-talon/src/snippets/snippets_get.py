from talon import actions

from .snippet_types import (
    CustomInsertionSnippet,
    CustomWrapperSnippet,
    ListInsertionSnippet,
    ListWrapperSnippet,
)


def get_insertion_snippet(
    name: str, substitutions: dict[str, str] | None = None
) -> CustomInsertionSnippet:
    return CustomInsertionSnippet.create(
        actions.user.get_insertion_snippet(name),
        substitutions,
    )


def get_list_insertion_snippet(
    name: str,
    substitutions: dict[str, str] | None = None,
) -> ListInsertionSnippet | CustomInsertionSnippet:
    try:
        snippets = actions.user.get_insertion_snippets(name)
    except Exception as e:
        # Raised if the user has an older version of community
        if isinstance(e, KeyError):
            return get_insertion_snippet(name, substitutions)
        raise

    return ListInsertionSnippet(
        substitutions,
        [CustomInsertionSnippet.create(s) for s in snippets],
    )


def get_wrapper_snippet(name: str) -> CustomWrapperSnippet:
    return CustomWrapperSnippet.create(actions.user.get_wrapper_snippet(name))


def get_list_wrapper_snippet(name: str) -> ListWrapperSnippet | CustomWrapperSnippet:
    try:
        snippets = actions.user.get_wrapper_snippets(name)
    except Exception as e:
        # Raised if the user has an older version of community
        if isinstance(e, KeyError):
            return get_wrapper_snippet(name)
        raise

    return ListWrapperSnippet(
        [CustomWrapperSnippet.create(s) for s in snippets],
    )
