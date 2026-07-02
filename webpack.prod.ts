import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack, { Configuration } from 'webpack';
import baseConfig from './webpack.base';

const { ModuleFederationPlugin } = webpack.container;

const config: Configuration = {
  ...baseConfig,
  mode: 'production',
  entry: {
    'dwt-mfe': './src/standalone.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'auto',
    clean: true,
  },
  plugins: [
    ...(baseConfig.plugins || []),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: true,
      chunks: ['dwt-mfe'],
    }),
    new ModuleFederationPlugin({
      name: 'dwt_mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/components/App',
      },
      shared: {
        react: { singleton: true, requiredVersion: '18.3.1', eager: true },
        'react-dom': { singleton: true, requiredVersion: '18.3.1', eager: true },
      },
    }),
  ],
  optimization: {
    minimize: true,
    splitChunks: false,
    runtimeChunk: false,
  },
};

export default config;