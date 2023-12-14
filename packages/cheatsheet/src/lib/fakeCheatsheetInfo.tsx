import { FeatureUsageStats } from "@cursorless/common";

// Should we just use the sampleData thats more realistic
// This will avoid the need to have this file and more ways to build the cheatsheet

export const fakeCheatsheetInfo = {
  sections: [
    {
      name: "foo",
      id: "foo",
      items: [
        {
          id: "bar",
          type: "bar",
          variations: [
            {
              spokenForm: "Hello <target>",
              description: "Some hello <target>",
            },
          ],
        },
      ],
    },
  ],
};

export const fakeFeatureUsageStats: FeatureUsageStats = {
  featureUsageCount: {
    bar: 1000,
  },
};
