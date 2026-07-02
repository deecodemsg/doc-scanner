import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration as WebpackConfig } from 'webpack';
import { Configuration as DevServerConfig } from 'webpack-dev-server';
import webpack from 'webpack';                       
import baseConfig from './webpack.base.ts';

const { ModuleFederationPlugin } = webpack.container; 

interface Config extends WebpackConfig {
  devServer?: DevServerConfig;
}

const config: Config = {
  ...baseConfig,
  mode: 'development',
  entry: './src/standalone.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:3000/',
    clean: true,
  },
  plugins: [
    ...(baseConfig.plugins || []),
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
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: true,
    }),
  ],
  devServer: {
    port: 3000,
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    hot: true,
    historyApiFallback: true,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  devtool: 'source-map',
};

export default config;