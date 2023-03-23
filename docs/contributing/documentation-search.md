# Documentation search

The documentation search is powered by Algolia.

## Tweaking crawling / indexing / ranking

Unfortunately, today, the source of truth for the Algolia search configuration lives in the Algolia web console. Whenever we update the configuration, we update the copies that we keep in [source control](../../packages/cursorless-org-docs/config/algolia). In the future, we'd like to use the files in source control as the source of truth and deploy them to Algolia in CI. See #917.

To see what changes we've made to the default configuration, compare the contents of [this directory](../../packages/cursorless-org-docs/config/algolia) with https://github.com/cursorless-dev/cursorless/tree/e043ce4795ffcda5a3f5875d91887a09e0f9905b/website/config/algolia

### Crawler config

1. Use the [crawler console](https://crawler.algolia.com/admin/crawlers/ff3ea576-b9e0-4e01-8a19-110106760e74/configuration/edit) to experiment with the config until it works as expected.
2. Copy the new crawler config and paste it to [`crawler-settings.js`](../../docs-site/config/algolia/crawler-settings.js)
3. **IMPORTANT** Replace the `apiKey` field with `"<REDACTED>"`
4. File a PR to get feedback on the new config
5. Press the Save button in the crawler console to persist the new config.
6. Use [the crawler overview](https://crawler.algolia.com/admin/crawlers/ff3ea576-b9e0-4e01-8a19-110106760e74/overview) to start a new crawl.

### Index settings

1. Use the [Algolia console](https://www.algolia.com/apps/YTJQ4I3GBJ/explorer/configuration/cursorless/searchable-attributes) to tweak the settings until you're happy.
2. Click on _Manage index > Export Configuration_ to export the configuration json, saving it to [`index-settings.json`](../../packages/cursorless-org-docs/config/algolia/index-settings.json)
3. File a PR to get feedback on the new config.
