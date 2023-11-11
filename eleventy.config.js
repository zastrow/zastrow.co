module.exports = (eleventyConfig) => {
	eleventyConfig.addCollection('posts', (api) => {
		return api.getFilteredByGlob("src/content/posts/*.md");
	});

	eleventyConfig.addCollection('books', (api) => {
		return api.getFilteredByGlob("src/content/books/*.md");
	});

	eleventyConfig.addCollection('micro', (api) => {
		return api.getFilteredByGlob("src/content/micro/*.md");
	});

	eleventyConfig.addPassthroughCopy({"./src/public/" : "/"});
	eleventyConfig.addWatchTarget("./src/public/");

	// Return your Object options:
	return {
		dir: {
			input: 'src/content',
			output: 'dist',
			includes: '../includes',
			layouts: '../layouts',
			data: '../data'
		}
	}
};
