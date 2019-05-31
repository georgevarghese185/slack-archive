const webpack = require('webpack');
const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const dev = process.env.ENV == "development";

module.exports = {
	entry: ['@babel/polyfill', './src/frontend'],

	module: {
		rules: [
			{
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
			{
        test: /\.js$/,
        loader: 'babel-loader'
      },
		]
	},

	output: {
		filename: dev ? 'index.js' : 'index-[hash].js'
	},

	mode: dev ? 'development' : 'production',

	plugins: [
		new UglifyJSPlugin(),
		new VueLoaderPlugin()
	],

	devServer: {
		port: 8081,
    contentBase: path.join(__dirname, 'dist'),
    compress: true
  }
};
