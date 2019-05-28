const webpack = require('webpack');
const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
	entry: {
		index: path.join(__dirname, 'src/frontend/index.js')
	},

	module: {
		rules: [
			{
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
		]
	},

	output: {
		chunkFilename: '[name].[chunkhash].js',
		filename: '[name].js'
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
  },

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	}
};
