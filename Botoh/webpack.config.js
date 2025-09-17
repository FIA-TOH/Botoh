const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const CopyPlugin = require("copy-webpack-plugin");
module.exports = (env) => {
  const isLeagueMode = env.LEAGUE_MODE === "true";

  return {
    mode: "production",
    target: "node",
    entry: "./src/room.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isLeagueMode ? "league.js" : "pub.js",
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          test: /\.hbs$/i,
          use: "raw-loader",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.LEAGUE_MODE": JSON.stringify(env.LEAGUE_MODE),
      }),
      new CopyPlugin({
        patterns: [{ from: "src/circuits/**/*.hbs", to: "[name][ext]" }],
      }),
    ],
    externals: [nodeExternals()],
  };
};
