import {
  groupBy,
  serializeScopeType,
  type PlaintextScopeSupportFacet,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  type ScopeSupportFacetLevel,
} from "@cursorless/common";
import React, { useState, type JSX } from "react";
import { prettifyFacet, prettifyScopeType } from "./util";

export interface FacetWrapper {
  facet: ScopeSupportFacet | PlaintextScopeSupportFacet;
  supportLevel: ScopeSupportFacetLevel | undefined;
  info: ScopeSupportFacetInfo;
}

interface Props {
  facets: FacetWrapper[];
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

  const scopeGroups: Map<string, FacetWrapper[]> = groupBy(facets, (f) =>
    serializeScopeType(f.info.scopeType),
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
          const facets = scopeGroups.get(scopeType) ?? [];
          return (
            <div key={scopeType}>
              <h4>{prettifyScopeType(scopeType)}</h4>
              <ul>
                {facets.map((facet) => {
                  return (
                    <li key={facet.facet}>
                      <span className="facet-name" title={facet.facet}>
                        {prettifyFacet(facet.facet, false)}
                      </span>
                      : {facet.info.description}
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
