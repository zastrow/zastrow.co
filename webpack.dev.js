const webpack = require('webpack');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common, {
	devtool: 'inline-source-map',
	mode: 'development',
	optimization: {
		minimize: false,
	},
});
