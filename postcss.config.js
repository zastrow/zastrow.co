const postcssJitProps = require('postcss-jit-props');
const postcssCustomMedia = require('postcss-custom-media');
const postcssColorConverter = require('postcss-color-converter');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = {
	plugins: [
		postcssJitProps({
			files: [
				path.resolve(__dirname, 'node_modules/open-props/open-props.min.css'),
			]
		}),
		postcssCustomMedia,
		postcssColorConverter({outputColorFormat: 'hsl'}),
		autoprefixer
	]
}
