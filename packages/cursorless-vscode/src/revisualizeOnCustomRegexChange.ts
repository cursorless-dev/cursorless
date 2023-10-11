import {
  Disposable,
  Disposer, ScopeProvider, ScopeTypeInfo
} from "@cursorless/common";
import { ScopeVisualizer, VisualizationType } from "./ScopeVisualizerCommandApi";
import { isEqual } from "lodash";

/**
 * Attempts to ensure that the scope visualizer is still visualizing the same
 * scope type after the user changes one of their custom regexes. Because custom
 * regexes don't have a unique identifier, we have to do some guesswork to
 * figure out which custom regex the user changed. This function look for a
 * custom regex with the same spoken form as the one that was changed, and if it
 * finds one, it starts visualizing that one instead.
 *
 * @param scopeVisualizer The scope visualizer to listen to
 * @param scopeProvider Provides scope information
 * @returns A {@link Disposable} which will stop the callback from running
 */
export function revisualizeOnCustomRegexChange(
  scopeVisualizer: ScopeVisualizer,
  scopeProvider: ScopeProvider
): Disposable {
  let currentRegexScopeInfo: ScopeTypeInfo | undefined;
  let currentVisualizationType: VisualizationType | undefined;

  return new Disposer(
    scopeVisualizer.onDidChangeScopeType((scopeType, visualizationType) => {
      currentRegexScopeInfo =
        scopeType?.type === "customRegex"
          ? scopeProvider.getScopeInfo(scopeType)
          : undefined;
      currentVisualizationType = visualizationType;
    }),

    scopeProvider.onDidChangeScopeInfo((scopeInfos) => {
      if (currentRegexScopeInfo != null &&
        !scopeInfos.some((scopeInfo) => isEqual(scopeInfo.scopeType, currentRegexScopeInfo!.scopeType)
        )) {
        const replacement = scopeInfos.find(
          (scopeInfo) => scopeInfo.scopeType.type === "customRegex" &&
            isEqual(scopeInfo.spokenForm, currentRegexScopeInfo!.spokenForm)
        );
        if (replacement != null) {
          scopeVisualizer.start(
            replacement.scopeType,
            currentVisualizationType!
          );
        }
      }
    })
  );
}
