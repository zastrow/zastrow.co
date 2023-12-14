require('dotenv').config();
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = (eleventyConfig) => {
	eleventyConfig.addCollection('posts', (api) => {
		return api.getFilteredByGlob("src/content/posts/*.md").sort((a,b) => b.date - a.date);
	});

	eleventyConfig.addCollection('books', (api) => {
		return api.getFilteredByGlob("src/content/books/*.md").sort((a,b) => b.date - a.date);
	});

	eleventyConfig.addCollection('micro', (api) => {
		return api.getFilteredByGlob("src/content/micro/*.md").sort((a,b) => b.date - a.date);
	});

	eleventyConfig.addCollection('all', (api) => {
		return api.getFilteredByGlob(["src/content/posts/*.md", "src/content/books/*.md"]).sort((a,b) => b.date - a.date);
	});

	eleventyConfig.addGlobalData('site_url', process.env.SITE_URL);

	eleventyConfig.addPlugin(pluginRss);

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
