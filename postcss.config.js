import postcssJitProps from 'postcss-jit-props';
import postcssCustomMedia from 'postcss-custom-media';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	plugins: [
		postcssJitProps({
			files: [
				path.resolve(__dirname, 'node_modules/open-props/open-props.min.css'),
			]
		}),
		postcssCustomMedia,
		autoprefixer
	]
}
