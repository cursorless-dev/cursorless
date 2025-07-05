import {
  groupBy,
  scopeSupportFacetInfos,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
} from "@cursorless/common";
import { serializeScopeType } from "@cursorless/common/src/util/serializeScopeType";
import React, { useState, type JSX } from "react";
import { prettifyFacet, prettifyScopeType } from "./util";

interface Props {
  facets: ScopeSupportFacet[];
  title: string;
  subtitle: string;
  description?: React.ReactNode;
  open?: boolean;
}

export function ScopeSupportForLevel({
  facets,
  title,
  subtitle,
  description,
  open: openProp,
}: Props): JSX.Element | null {
  const [open, setOpen] = useState(openProp ?? false);

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

  if (scopeTypes.length === 0) {
    return null;
  }

  const renderBody = () => {
    if (!open) {
      return (
        <div className="card__body pointer" onClick={() => setOpen(true)}>
          <i>+ Click to expand</i>
        </div>
      );
    }

    return (
      <div className="card__body">
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
                        {prettifyFacet(facetInfo.facet, false)}
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
    <div className={"card" + (open ? " open" : "")}>
      <div className="card__header pointer" onClick={() => setOpen(!open)}>
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
