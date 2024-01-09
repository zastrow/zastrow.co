require('dotenv').config();
const pluginRss = require("@11ty/eleventy-plugin-rss");
const fg = require('fast-glob').sync;

module.exports = (eleventyConfig) => {
	// COLLECTIONS
	// =====================================================================

	// Create Posts Collection
	// ---------------------------------------------------------------
	eleventyConfig.addCollection('posts', (api) => {
		const files = fg(["src/content/posts/**/*.md"], {
			ignore: ["src/content/posts/index.md"]
		});
		return api.getFilteredByGlob(files).sort((a,b) => b.date - a.date);
	});

	// Create Books Collection
	// ---------------------------------------------------------------
	// eleventyConfig.addCollection('books', (api) => {
	// 	const files = fg(["src/content/books/**/*.md"], {
	// 		ignore: ["src/content/books/index.md"]
	// 	});
	// 	return api.getFilteredByGlob(files).sort((a,b) => b.date - a.date);
	// });

	// Create Micro Collection (Not currently in use)
	// ---------------------------------------------------------------
	// eleventyConfig.addCollection('micro', (api) => {
	// 	const files = fg(["src/content/micro/**/*.md"], {
	// 		ignore: ["src/content/micro/index.md"]
	// 	});
	// 	return api.getFilteredByGlob(files).sort((a,b) => b.date - a.date);
	// });

	// Create All Collection for combined feed
	// ---------------------------------------------------------------
	eleventyConfig.addCollection('all', (api) => {
		// const files = fg(["src/content/posts/**/*.md", "src/content/books/**/*.md"], {
		// 	ignore: ["src/content/posts/index.md", "src/content/books/index.md"]
		// });
		// return api.getFilteredByGlob(files).sort((a,b) => b.date - a.date);
		return '';
	});

// =====================================================================

	eleventyConfig.addGlobalData('site_url', process.env.SITE_URL);

	eleventyConfig.addShortcode();

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
		},
		templateFormats: [ "md", "liquid", "html", ],
		markdownTemplateEngine: "liquid",
		htmlTemplateEngine: "liquid",
		dataTemplateEngine: "njk",
	}
};
