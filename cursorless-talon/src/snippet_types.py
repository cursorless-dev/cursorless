from dataclasses import dataclass

from .targets.target_types import CursorlessDestination, CursorlessTarget


@dataclass
class ScopeType:
    type: str


# Insertion snippets


@dataclass
class CustomInsertionSnippet:
    name = "custom"
    body: str
    scopesTypes: list[ScopeType] | None = None
    languages: list[str] | None = None
    substitutions: dict[str, str] | None = None


@dataclass
class ListInsertionSnippet:
    name = "list"
    snippets: list[CustomInsertionSnippet]


@dataclass
class InsertSnippetAction:
    name = "insertSnippet"
    snippetDescription: CustomInsertionSnippet | ListInsertionSnippet
    destination: CursorlessDestination


# Wrapper snippets


@dataclass
class CustomWrapperSnippet:
    name = "custom"
    body: str
    variableName: str | None = None
    scopeType: ScopeType | None = None
    languages: list[str] | None = None


@dataclass
class ListWrapperSnippet:
    name = "list"
    snippets: list[CustomWrapperSnippet]


@dataclass
class WrapperSnippetAction:
    name = "wrapWithSnippet"
    snippetDescription: CustomWrapperSnippet | ListWrapperSnippet
    target: CursorlessTarget


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
    languages: list[str] | None = None
    scope: str | None = None
