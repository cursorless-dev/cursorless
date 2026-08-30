import type * as ClassicPreset from "@docusaurus/preset-classic";

type DocsOptions = Exclude<ClassicPreset.Options["docs"], false | undefined>;
type SidebarItemsGenerator = NonNullable<DocsOptions["sidebarItemsGenerator"]>;

interface Group {
  label: string;
  items: string[];
}

const items: (Group | string)[] = [
  "Cursorless",
  {
    label: "Getting started",
    items: ["Installation", "How-to guides"],
  },
  {
    label: "Reference",
    items: [
      "Actions",
      "Modifiers",
      "Scopes",
      "Targets",
      "Destinations",
      "Paired delimiters",
    ],
  },
  "Supported languages",
  {
    label: "Customization",
    items: ["Customization", "Hat assignment", "Visual Accessibility"],
  },
  {
    label: "Tools",
    items: ["Cursorless sidebar", "Scope visualizer", "Local command history"],
  },
  {
    label: "Advanced",
    items: ["Unicode support", "Experimental features"],
  },
  {
    label: "Project",
    items: ["Updating", "Glossary", "Release notes"],
  },
];

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
    return (
      docId != null &&
      typeof docsById.get(docId)?.frontMatter.sidebar_position === "number"
    );
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

  const sortedItems = sortByLabel(generatedItems);

  if (args.item.dirName !== "user") {
    return sortedItems;
  }

  const remainingItems = sortedItems.slice();

  function takeItem(label: string): NormalizedSidebarItem {
    const index = remainingItems.findIndex(
      (item) => getLabel(item)?.toLowerCase() === label.toLowerCase(),
    );
    const item = remainingItems[index];
    if (item == null) {
      throw new Error(`Missing generated sidebar item '${label}'`);
    }
    remainingItems.splice(index, 1);
    return item;
  }

  function createGroup(group: Group): NormalizedSidebarItem {
    const items = group.items.map(takeItem);
    const linkIndex = items.findIndex(
      (item) => item.type === "doc" && getLabel(item) === group.label,
    );
    const [link] = linkIndex === -1 ? [] : items.splice(linkIndex, 1);

    return {
      type: "category",
      label: group.label,
      collapsible: false,
      collapsed: false,
      ...(link?.type === "doc" ? { link: { type: "doc", id: link.id } } : {}),
      items,
    };
  }

  const groupedItems = items.map((item): NormalizedSidebarItem => {
    if (typeof item === "string") {
      return takeItem(item);
    }
    return createGroup(item);
  });

  if (remainingItems.length > 0) {
    const remainingJson = remainingItems
      .map((item) => {
        if (item.type === "category") {
          const { items, ...rest } = item;
          return JSON.stringify(rest);
        }
        return JSON.stringify(item);
      })
      .join(", ");
    throw new Error(
      `Unassigned generated user sidebar items: ${remainingJson}`,
    );
  }

  return groupedItems;
};
