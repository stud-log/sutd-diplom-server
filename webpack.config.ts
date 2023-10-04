import * as path from 'path';
import * as webpack from 'webpack';

const isDevelopment = process.env.NODE_ENV === 'development';

const config: webpack.Configuration = {
  entry: './src/index.ts',
  target: 'node',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
  devtool: isDevelopment ? 'inline-source-map' : false,
};

export default config;
