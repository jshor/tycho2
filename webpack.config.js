var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');

var client = path.resolve('./src');

// require("!style!css!sass!./client/.scss");

var config = {

  devtool: 'eval',

  entry: {
    app: ['./src/app/index.js'],
    vendor: [
      'angular'
    ]
  },

  output: {
    filename: 'app.min.js',
    path: path.join(__dirname, 'dist'),
    noInfo: true,
    quiet: true,
    publicPath: '/client/'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        /* TODO: look for real webpack loaders for these things */
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
            'style', // backup loader when not building .css file
            'css!sass' // loaders to preprocess CSS
        )
      }
    ]
  },

  resolve: {
    root: [client],
    extensions: ['', '.js']
  },

  plugins: [
    new ExtractTextPlugin('styles.css', {allChunks: true}),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.min.js'), // dev only
    //new webpack.HotModuleReplacementPlugin(),//devonly
    new LiveReloadPlugin({
      appendScriptTag: true,
      ignore: /\/node_modules\//i
    }), // dev only
    new webpack.DefinePlugin({
      'DATA_SOURCE_URL': 'http://localhost:8080/api',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

module.exports = config;
