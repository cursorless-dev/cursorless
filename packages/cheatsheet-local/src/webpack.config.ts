// Generated using webpack-cli https://github.com/webpack/webpack-cli
/*eslint-env node*/

import {
  cheatsheetBodyClasses,
  fakeCheatsheetInfo,
  fakeFeatureUsageStats,
  defaultCheatsheetInfo,
  defaultFeatureUsageStats,
} from "@cursorless/cheatsheet";
import HtmlWebpackInlineSourcePlugin from "@effortlessmotion/html-webpack-inline-source-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration } from "webpack";

const isProduction = process.env.NODE_ENV === "production";

const config: Configuration = {
  entry: "./src/index.tsx",
  output: {
    publicPath: "/",
  },
  mode: isProduction ? "production" : "development",
  plugins: [
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/index.html",
      templateParameters: {
        bodyClasses: cheatsheetBodyClasses,
        cheatsheetInfo: isProduction ? JSON.stringify(fakeCheatsheetInfo) : JSON.stringify(defaultCheatsheetInfo, null, 2),
        cheatsheetUsageStats: isProduction ? JSON.stringify(fakeFeatureUsageStats) : JSON.stringify(defaultFeatureUsageStats, null, 2)
      },
      inlineSource: ".(js|css)$", // embed all javascript and css inline
    }),

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Not sure why this is not in the type definition
    new HtmlWebpackInlineSourcePlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
        options: {
          compilerOptions: {
            noEmit: false,
            emitDeclarationOnly: false,
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
};

export default () => config;
