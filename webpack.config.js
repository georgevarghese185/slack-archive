const webpack = require('webpack');
const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

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
		filename: 'index.js'
	},

	mode: 'development',

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
