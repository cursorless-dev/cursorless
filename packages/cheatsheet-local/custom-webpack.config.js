const { merge } = require('webpack-merge');
const nrwlConfig = require('@nrwl/react/plugins/webpack.js'); // require the main @nrwl/react/plugins/webpack configuration function.

var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (config, context) => {
  nrwlConfig(config); // first call it so that it @nrwl/react plugin adds its configs,

  return merge(config, {
    output: {
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/index.html',
        inlineSource: '.(js|css)$', // embed all javascript and css inline
      }),
      new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    ],
  });
};
