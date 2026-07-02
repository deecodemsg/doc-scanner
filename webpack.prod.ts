import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack, { Configuration } from "webpack";
import dotenv from "dotenv";
import baseConfig from "./webpack.base";

dotenv.config();

const HOST = process.env.REACT_APP_HOST || "http://localhost:3000";
const DWT_PRODUCT_KEY = process.env.REACT_APP_DWT_PRODUCT_KEY || '';
const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || `${HOST}/api/upload`;

const { ModuleFederationPlugin } = webpack.container;

const config: Configuration = {
  ...baseConfig,
  mode: "production",
  entry: {
    "dwt-mfe": "./src/standalone.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    publicPath: "auto",
    clean: true,
  },
  plugins: [
    ...(baseConfig.plugins || []),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: true,
      chunks: ["dwt-mfe"],
    }),
    new ModuleFederationPlugin({
      name: "dwt_mfe",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/components/App",
      },
      shared: {
        react: { singleton: true, requiredVersion: "18.3.1", eager: true },
        "react-dom": {
          singleton: true,
          requiredVersion: "18.3.1",
          eager: true,
        },
      },
    }),
    new webpack.DefinePlugin({
      "process.env.REACT_APP_HOST": JSON.stringify(HOST),
      "process.env.REACT_APP_DWT_PRODUCT_KEY": JSON.stringify(DWT_PRODUCT_KEY),
      "process.env.REACT_APP_UPLOAD_URL": JSON.stringify(UPLOAD_URL),
    }),
  ],
  optimization: {
    minimize: true,
    splitChunks: false,
    runtimeChunk: false,
  },
};

export default config;
