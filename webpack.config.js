const path = require('path');

module.exports = {
	entry: './src/scripts/scripts.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'scripts.js',
	},
};
