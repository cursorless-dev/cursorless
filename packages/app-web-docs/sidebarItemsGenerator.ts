import type * as ClassicPreset from "@docusaurus/preset-classic";

type DocsOptions = Exclude<ClassicPreset.Options["docs"], false | undefined>;
type SidebarItemsGenerator = NonNullable<DocsOptions["sidebarItemsGenerator"]>;

/**
 * Set directly in Markdown front matter. For `_category_.json`, set it under
 * `customProps`, which is Docusaurus's supported category metadata extension.
 */
const sidebarGroupKey = "sidebar_group";
const sidebarGroupPositionKey = "sidebar_group_position";

export const sidebarItemsGenerator: SidebarItemsGenerator = async ({
  defaultSidebarItemsGenerator,
  ...args
}) => {
  const generatedItems = await defaultSidebarItemsGenerator(args);

  type NormalizedSidebarItem = (typeof generatedItems)[number];
  const docsById = new Map(args.docs.map((doc) => [doc.id, doc]));

  function getLabel(item: NormalizedSidebarItem) {
    if (item.type === "doc" || item.type === "ref") {
      const doc = docsById.get(item.id);
      return doc?.frontMatter.sidebar_label ?? doc?.title;
    }
    if ("label" in item) {
      return item.label;
    }
    throw new Error(`Unexpected sidebar item type: ${item.type}`);
  }

  function hasExplicitPosition(item: NormalizedSidebarItem): boolean {
    let docId: string | undefined;
    if (item.type === "doc" || item.type === "ref") {
      docId = item.id;
    } else if (item.type === "category" && item.link?.type === "doc") {
      docId = item.link.id;
    }
    return docId != null && docsById.get(docId)?.sidebarPosition != null;
  }

  function getSidebarGroup(item: NormalizedSidebarItem): string | undefined {
    let sidebarGroup: unknown;
    if (item.type === "doc" || item.type === "ref") {
      sidebarGroup = docsById.get(item.id)?.frontMatter[sidebarGroupKey];
    } else if (item.type === "category") {
      sidebarGroup = item.customProps?.[sidebarGroupKey];
    }
    if (sidebarGroup === undefined) {
      return undefined;
    }
    if (typeof sidebarGroup !== "string" || sidebarGroup.trim().length === 0) {
      throw new Error(
        `Invalid ${sidebarGroupKey} for sidebar item '${getLabel(item)}'`,
      );
    }
    return sidebarGroup.trim();
  }

  function getSidebarGroupPosition(
    item: NormalizedSidebarItem,
  ): number | undefined {
    let sidebarGroupPosition: unknown;
    if (item.type === "doc" || item.type === "ref") {
      sidebarGroupPosition = docsById.get(item.id)?.frontMatter[
        sidebarGroupPositionKey
      ];
    } else if (item.type === "category") {
      sidebarGroupPosition = item.customProps?.[sidebarGroupPositionKey];
    }
    if (sidebarGroupPosition === undefined) {
      return undefined;
    }
    if (
      typeof sidebarGroupPosition !== "number" ||
      !Number.isFinite(sidebarGroupPosition)
    ) {
      // oxlint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Invalid ${sidebarGroupPositionKey} for sidebar item '${getLabel(item)}'`,
      );
    }
    return sidebarGroupPosition;
  }

  function getSidebarPosition(item: NormalizedSidebarItem): number | undefined {
    let docId: string | undefined;
    if (item.type === "doc" || item.type === "ref") {
      docId = item.id;
    } else if (item.type === "category" && item.link?.type === "doc") {
      docId = item.link.id;
    }
    return docId == null ? undefined : docsById.get(docId)?.sidebarPosition;
  }

  function sortByLabel(
    items: NormalizedSidebarItem[],
  ): NormalizedSidebarItem[] {
    const normalizedItems = items.map((item): NormalizedSidebarItem =>
      item.type === "category"
        ? { ...item, items: sortByLabel(item.items) }
        : item,
    );
    const unpositionedItems = normalizedItems
      .filter((item) => !hasExplicitPosition(item))
      .toSorted((a, b) =>
        (getLabel(a) ?? "").localeCompare(getLabel(b) ?? "", undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );

    return normalizedItems.map((item) => {
      if (hasExplicitPosition(item)) {
        return item;
      }
      const sortedItem = unpositionedItems.shift();
      if (sortedItem == null) {
        throw new Error("Missing unpositioned sidebar item");
      }
      return sortedItem;
    });
  }

  if (args.item.dirName !== "user") {
    return sortByLabel(generatedItems);
  }

  function createGroup(
    label: string,
    groupItems: NormalizedSidebarItem[],
  ): NormalizedSidebarItem {
    const items = groupItems.slice();
    const linkIndex = items.findIndex(
      (item) =>
        item.type === "doc" &&
        getLabel(item)?.toLowerCase() === label.toLowerCase(),
    );
    const [link] = linkIndex === -1 ? [] : items.splice(linkIndex, 1);

    return {
      type: "category",
      label,
      collapsible: false,
      collapsed: false,
      ...(link?.type === "doc" ? { link: { type: "doc", id: link.id } } : {}),
      items,
    };
  }

  const itemsByGroup = new Map<string, NormalizedSidebarItem[]>();
  const positionsByGroup = new Map<string, number>();
  const ungroupedItems: NormalizedSidebarItem[] = [];
  for (const item of generatedItems) {
    const sidebarGroup = getSidebarGroup(item);
    const sidebarGroupPosition = getSidebarGroupPosition(item);
    if (sidebarGroup == null) {
      if (sidebarGroupPosition != null) {
        throw new Error(
          `${sidebarGroupPositionKey} requires ${sidebarGroupKey} for sidebar item '${getLabel(item)}'`,
        );
      }
      ungroupedItems.push(item);
      continue;
    }

    if (sidebarGroupPosition != null) {
      const existingPosition = positionsByGroup.get(sidebarGroup);
      if (
        existingPosition != null &&
        existingPosition !== sidebarGroupPosition
      ) {
        throw new Error(
          `Conflicting ${sidebarGroupPositionKey} values for sidebar group '${sidebarGroup}': ${existingPosition} and ${sidebarGroupPosition}`,
        );
      }
      positionsByGroup.set(sidebarGroup, sidebarGroupPosition);
    }

    const groupItems = itemsByGroup.get(sidebarGroup) ?? [];
    groupItems.push(item);
    itemsByGroup.set(sidebarGroup, groupItems);
  }

  const topLevelItems = sortByLabel(ungroupedItems).map((item) => ({
    item,
    position: getSidebarPosition(item),
  }));
  for (const [label, groupItems] of itemsByGroup) {
    topLevelItems.push({
      item: createGroup(label, sortByLabel(groupItems)),
      position: positionsByGroup.get(label),
    });
  }

  return topLevelItems
    .toSorted((a, b) => {
      const aPosition = a.position ?? Number.POSITIVE_INFINITY;
      const bPosition = b.position ?? Number.POSITIVE_INFINITY;
      return aPosition === bPosition
        ? (getLabel(a.item) ?? "").localeCompare(getLabel(b.item) ?? "")
        : aPosition - bPosition;
    })
    .map(({ item }) => item);
};
