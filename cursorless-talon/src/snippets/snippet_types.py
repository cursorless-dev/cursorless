from dataclasses import dataclass

from ..targets.target_types import CursorlessDestination, CursorlessTarget

# Scope types


@dataclass
class ScopeType:
    type: str


def to_scope_types(scope_types: str | list[str]) -> list[ScopeType]:
    if isinstance(scope_types, str):
        return [ScopeType(scope_types)]
    return [ScopeType(st) for st in scope_types]


# Community types


@dataclass
class CommunityInsertionSnippet:
    body: str
    languages: list[str] | None = None
    scopes: list[str] | None = None


@dataclass
class CommunityWrapperSnippet:
    body: str
    variable_name: str
    languages: list[str] | None
    scope: str | None


# Insertion snippets


@dataclass
class CustomInsertionSnippet:
    type = "custom"
    body: str
    scopeTypes: list[ScopeType] | None
    languages: list[str] | None
    substitutions: dict[str, str] | None

    @staticmethod
    def create(
        snippet: CommunityInsertionSnippet,
        substitutions: dict[str, str] | None = None,
    ):
        return CustomInsertionSnippet(
            snippet.body,
            to_scope_types(snippet.scopes) if snippet.scopes else None,
            # languages will be missing if the user has an older version of community
            snippet.languages if hasattr(snippet, "languages") else None,
            substitutions=substitutions,
        )


@dataclass
class ListInsertionSnippet:
    type = "list"
    substitutions: dict[str, str] | None
    snippets: list[CustomInsertionSnippet]


@dataclass
class InsertSnippetAction:
    name = "insertSnippet"
    snippetDescription: CustomInsertionSnippet | ListInsertionSnippet
    destination: CursorlessDestination


# Wrapper snippets


@dataclass
class CustomWrapperSnippet:
    type = "custom"
    body: str
    variableName: str | None
    scopeType: ScopeType | None
    languages: list[str] | None

    @staticmethod
    def create(snippet: CommunityWrapperSnippet):
        return CustomWrapperSnippet(
            snippet.body,
            snippet.variable_name,
            ScopeType(snippet.scope) if snippet.scope else None,
            # languages will be missing if the user has an older version of community
            snippet.languages if hasattr(snippet, "languages") else None,
        )


@dataclass
class ListWrapperSnippet:
    type = "list"
    snippets: list[CustomWrapperSnippet]


@dataclass
class WrapperSnippetAction:
    name = "wrapWithSnippet"
    snippetDescription: CustomWrapperSnippet | ListWrapperSnippet
    target: CursorlessTarget
