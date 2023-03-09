/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli
/*eslint-env node*/

var HtmlWebpackInlineSourcePlugin = require("@effortlessmotion/html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const cheatsheetBodyClasses =
  require("@cursorless/cheatsheet").cheatsheetBodyClasses;
const fakeCheatsheetInfo = require("@cursorless/cheatsheet").fakeCheatsheetInfo;

const isProduction = process.env.NODE_ENV === "production";

/** @type { import('webpack').Configuration } */
const config = {
  entry: "./src/main.tsx",
  output: {
    // path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  mode: isProduction ? "production" : "development",
  plugins: [
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/index.html",
      templateParameters: {
        bodyClasses: cheatsheetBodyClasses,
        fakeCheatsheetInfo: JSON.stringify(fakeCheatsheetInfo),
      },
      inlineSource: ".(js|css)$", // embed all javascript and css inline
    }),

    new HtmlWebpackInlineSourcePlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
};

module.exports = () => config;
