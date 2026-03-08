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
    ScopeType,
    WrapperSnippetAction,
    to_scope_types,
)
from .snippets_get import (
    get_insertion_snippet,
    get_list_insertion_snippet,
    get_list_wrapper_snippet,
    get_wrapper_snippet,
)

mod = Module()
ctx = Context()

ctx.matches = r"""
tag: user.cursorless
and not tag: user.code_language_forced
"""

mod.list("cursorless_insert_snippet_action", desc="Cursorless insert snippet action")


@mod.action_class
class Actions:
    @staticmethod
    def cursorless_insert_snippet(
        body: str,
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
        action = InsertSnippetAction(snippet, destination)
        actions.user.private_cursorless_command_and_wait(action)

    @staticmethod
    def cursorless_wrap_with_snippet(
        body: str,
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
        action = WrapperSnippetAction(snippet, target)
        actions.user.private_cursorless_command_and_wait(action)

    # These actions use a single custom snippets since a language mode is forced

    @staticmethod
    def private_cursorless_insert_community_snippet(
        name: str,
        destination: CursorlessDestination,
    ):
        """Cursorless: Insert community snippet <name>"""
        action = InsertSnippetAction(
            get_insertion_snippet(name),
            destination,
        )
        actions.user.private_cursorless_command_and_wait(action)

    @staticmethod
    def private_cursorless_wrap_with_community_snippet(
        name: str,
        target: CursorlessTarget,
    ):
        """Cursorless: Wrap target with community snippet <name>"""
        action = WrapperSnippetAction(
            get_wrapper_snippet(name),
            target,
        )
        actions.user.private_cursorless_command_and_wait(action)


@ctx.action_class("user")
class UserActions:
    # Since we don't have a forced language mode, these actions send all the snippets.
    # (note that this is the default mode of action, as most of the time the user will not
    # have a forced language mode)

    @staticmethod
    def insert_snippet_by_name(
        name: str,
        # Don't add optional: we need to match the type in community
        substitutions: dict[str, str] = None,  # type: ignore
    ):
        action = InsertSnippetAction(
            get_list_insertion_snippet(name, substitutions),
            ImplicitDestination(),
        )
        actions.user.private_cursorless_command_and_wait(action)

    @staticmethod
    def private_cursorless_insert_community_snippet(
        name: str,
        destination: CursorlessDestination,
    ):
        action = InsertSnippetAction(
            get_list_insertion_snippet(name),
            destination,
        )
        actions.user.private_cursorless_command_and_wait(action)

    @staticmethod
    def private_cursorless_wrap_with_community_snippet(
        name: str,
        target: CursorlessTarget,
    ):
        action = WrapperSnippetAction(
            get_list_wrapper_snippet(name),
            target,
        )
        actions.user.private_cursorless_command_and_wait(action)
