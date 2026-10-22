import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import type { Configuration } from "webpack";
import dotenv from "dotenv";
import baseConfig from "./webpack.base.ts";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * HOST can be:
 * 1. Set via REACT_APP_HOST env var (will be compiled into the app)
 * 2. Auto-detected at runtime from window.location (if not set)
 * Default: localhost:3000
 */
const ENV_HOST = process.env.REACT_APP_HOST;
const HOST = ENV_HOST || "http://localhost:3000";
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
      // If REACT_APP_HOST not explicitly set, pass empty string to allow runtime detection
      "process.env.REACT_APP_HOST": JSON.stringify(ENV_HOST || ''),
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
