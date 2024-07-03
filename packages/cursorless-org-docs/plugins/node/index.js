// eslint-disable-next-line
module.exports = function (context, options) {
  return {
    name: "node-plugin",
    // eslint-disable-next-line
    configureWebpack(config, isServer, utils) {
      return {
        externals: { ["node:fs"]: {} },
        resolve: {
          fallback: {
            fs: false,
            path: false,
          },
        },
      };
    },
  };
};
