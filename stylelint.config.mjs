/** @type {import('stylelint').Config} */
const config = {
  extends: ["stylelint-config-standard", "stylelint-config-standard-scss"],
  rules: {
    "at-rule-empty-line-before": null,
  },
};

// oxlint-disable-next-line import/no-default-export
export default config;
