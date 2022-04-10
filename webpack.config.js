const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  entry: {app : './src/js/app.ts'},
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname, 'src/js')]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      } 
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    // new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({ template: './src/template.html' }),
    new FaviconsWebpackPlugin('./src/img/favicon/favicon-16x16.png')
  ]
}