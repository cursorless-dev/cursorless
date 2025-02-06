from talon import actions

from .snippet_types import (
    CommunityInsertionSnippet,
    CommunityWrapperSnippet,
    CustomInsertionSnippet,
    CustomWrapperSnippet,
    ListInsertionSnippet,
    ListWrapperSnippet,
)


def get_insertion_snippet(
    name: str,
    substitutions: dict[str, str] | None,
) -> ListInsertionSnippet | CustomInsertionSnippet:
    try:
        return get_list_insertion_snippet(name, substitutions)
    except Exception as ex:
        if isinstance(ex, KeyError):
            return get_custom_insertion_snippet(name, substitutions)
        raise


def get_list_insertion_snippet(
    name: str,
    substitutions: dict[str, str] | None,
) -> ListInsertionSnippet:
    snippets: list[CommunityInsertionSnippet] = actions.user.get_insertion_snippets(
        name
    )
    return ListInsertionSnippet(
        substitutions,
        [CustomInsertionSnippet.create(s, substitutions=None) for s in snippets],
    )


def get_custom_insertion_snippet(
    name: str,
    substitutions: dict[str, str] | None,
) -> CustomInsertionSnippet:
    snippet: CommunityInsertionSnippet = actions.user.get_insertion_snippet(name)
    return CustomInsertionSnippet.create(snippet, substitutions)


def get_wrapper_snippet(name: str) -> ListWrapperSnippet | CustomWrapperSnippet:
    try:
        return get_list_wrapper_snippet(name)
    except Exception as ex:
        if isinstance(ex, KeyError):
            return get_custom_wrapper_snippet(name)
        raise


def get_list_wrapper_snippet(name: str) -> ListWrapperSnippet:
    snippets: list[CommunityWrapperSnippet] = actions.user.get_wrapper_snippets(name)
    return ListWrapperSnippet(
        [CustomWrapperSnippet.create(s) for s in snippets],
    )


def get_custom_wrapper_snippet(name: str) -> CustomWrapperSnippet:
    snippet: CommunityWrapperSnippet = actions.user.get_wrapper_snippet(name)
    return CustomWrapperSnippet.create(snippet)
