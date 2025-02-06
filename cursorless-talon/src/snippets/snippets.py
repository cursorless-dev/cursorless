from typing import Optional, Union

from talon import Context, Module, actions

from ..targets.target_types import (
    CursorlessDestination,
    CursorlessTarget,
    ImplicitDestination,
)
from .snippet_types import (
    CustomInsertionSnippet,
    CustomWrapperSnippet,
    InsertSnippetAction,
    ListInsertionSnippet,
    ListWrapperSnippet,
    ScopeType,
    WrapperSnippetAction,
    to_scope_types,
)
from .snippets_get import (
    get_custom_insertion_snippet,
    get_custom_wrapper_snippet,
    get_insertion_snippet,
    get_wrapper_snippet,
)

mod = Module()
ctx = Context()

ctx.matches = r"""
not tag: user.code_language_forced
"""

mod.list("cursorless_insert_snippet_action", desc="Cursorless insert snippet action")


def insert_snippet(
    snippet: CustomInsertionSnippet | ListInsertionSnippet,
    destination: CursorlessDestination,
):
    actions.user.private_cursorless_command_and_wait(
        InsertSnippetAction(snippet, destination),
    )


def wrap_with_snippet(
    snippet: CustomWrapperSnippet | ListWrapperSnippet,
    target: CursorlessTarget,
):
    actions.user.private_cursorless_command_and_wait(
        WrapperSnippetAction(snippet, target),
    )


def insert_community_snippet(
    name: str,
    substitutions: dict[str, str] | None,
    destination: CursorlessDestination,
    use_list: bool,
):
    snippet = (
        get_insertion_snippet(name, substitutions)
        if use_list
        else get_custom_insertion_snippet(name, substitutions)
    )
    insert_snippet(snippet, destination)


def wrap_with_community_snippet(
    name: str,
    target: CursorlessTarget,
    use_list: bool,
):
    snippet = (
        get_wrapper_snippet(name) if use_list else get_custom_wrapper_snippet(name)
    )
    wrap_with_snippet(snippet, target)


@ctx.action_class("user")
class UserActions:
    # These actions use list snippets since no language mode is forced

    def insert_snippet_by_name(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        # Don't add optional; We need to match the type in community
        substitutions: dict[str, str] = None,
    ):
        insert_community_snippet(
            name,
            substitutions,
            ImplicitDestination(),
            use_list=True,
        )

    def private_cursorless_insert_community_snippet(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        destination: CursorlessDestination,
    ):
        insert_community_snippet(
            name,
            substitutions=None,
            destination=destination,
            use_list=True,
        )

    def private_cursorless_wrap_with_community_snippet(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        target: CursorlessTarget,
    ):
        wrap_with_community_snippet(
            name,
            target,
            use_list=True,
        )


@mod.action_class
class Actions:
    def cursorless_insert_snippet(
        body: str,  # pyright: ignore [reportGeneralTypeIssues]
        destination: CursorlessDestination = ImplicitDestination(),
        scope_type: Optional[Union[str, list[str]]] = None,
    ):
        """Cursorless: Insert custom snippet <body>"""
        snippet = CustomInsertionSnippet(
            body,
            to_scope_types(scope_type) if scope_type else None,
            languages=None,
            substitutions=None,
        )
        insert_snippet(snippet, destination)

    def cursorless_wrap_with_snippet(
        body: str,  # pyright: ignore [reportGeneralTypeIssues]
        target: CursorlessTarget,
        variable_name: Optional[str] = None,
        scope: Optional[str] = None,
    ):
        """Cursorless: Wrap target with custom snippet <body>"""
        snippet = CustomWrapperSnippet(
            body,
            variable_name,
            ScopeType(scope) if scope else None,
            languages=None,
        )
        wrap_with_snippet(snippet, target)

    # These actions use a single custom snippets since a language mode is forced

    def private_cursorless_insert_community_snippet(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        destination: CursorlessDestination,
    ):
        """Cursorless: Insert community snippet <name>"""
        insert_community_snippet(
            name,
            substitutions=None,
            destination=destination,
            use_list=False,
        )

    def private_cursorless_wrap_with_community_snippet(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        target: CursorlessTarget,
    ):
        """Cursorless: Wrap target with community snippet <name>"""
        wrap_with_community_snippet(
            name,
            target,
            use_list=False,
        )
