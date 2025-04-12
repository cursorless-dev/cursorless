import {
  camelCaseToAllDown,
  capitalize,
  groupBy,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  scopeSupportFacetInfos,
  type ScopeType,
  type SimpleScopeTypeType,
} from "@cursorless/common";
import React, { useState } from "react";

interface Props {
  facets: ScopeSupportFacet[];
  title: string;
  subtitle: string;
  description?: React.ReactNode;
  expanded?: boolean;
}

export function ScopeSupportForLevel({
  facets,
  title,
  subtitle,
  description,
  expanded: expandedProp,
}: Props): JSX.Element | null {
  const [expanded, setExpanded] = useState(expandedProp ?? false);

  if (facets.length === 0) {
    return null;
  }

  const renderBody = () => {
    if (!expanded) {
      return null;
    }

    const facetInfos = facets.map(
      (facet): AugmentedFacetInfo => ({
        facet,
        ...scopeSupportFacetInfos[facet],
      }),
    );
    const scopeGroups: Map<string, AugmentedFacetInfo[]> = groupBy(
      facetInfos,
      (facetInfo) => serializeScopeType(facetInfo.scopeType),
    );
    const scopeTypes = Array.from(scopeGroups.keys())
      .filter((scope) => !scope.startsWith("private."))
      .sort();

    return (
      <div className="card-body">
        {description && <p>{description}</p>}

        {scopeTypes.map((scopeType) => {
          const facetInfos = scopeGroups.get(scopeType) ?? [];
          return (
            <div key={scopeType}>
              <h4>{prettifyScopeType(scopeType)}</h4>
              <ul>
                {facetInfos.map((facetInfo) => {
                  return (
                    <li key={facetInfo.facet}>
                      <span className="facet-name" title={facetInfo.facet}>
                        {prettifyFacet(facetInfo.facet)}
                      </span>
                      : {facetInfo.description}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <h3>{title}</h3>
        {subtitle}
      </div>

      {renderBody()}
    </div>
  );
}

interface AugmentedFacetInfo extends ScopeSupportFacetInfo {
  facet: ScopeSupportFacet;
}

function prettifyScopeType(scopeType: string): string {
  return capitalize(camelCaseToAllDown(scopeType));
}

function prettifyFacet(facet: ScopeSupportFacet): string {
  const parts = facet.split(".").map(camelCaseToAllDown);
  if (parts.length === 1) {
    return capitalize(parts[0]);
  }
  const isIteration = parts[parts.length - 1] === "iteration";
  if (isIteration) {
    parts.pop();
  }
  const name = capitalize(parts.slice(1).join(" "));
  return isIteration ? `${name} (iteration)` : name;
}

function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}
