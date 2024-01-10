require('dotenv').config();
const pluginRss = require("@11ty/eleventy-plugin-rss");
const fg = require('fast-glob').sync;
const MarkdownIt = require("markdown-it");

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

// =====================================================================

	eleventyConfig.addPairedShortcode('markdown', async (content) => {
		const md = MarkdownIt();
		return md.render(content.toString());
	})

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
		templateFormats: [ "md", "liquid", "html", "njk" ],
		markdownTemplateEngine: "liquid",
		htmlTemplateEngine: "liquid",
		dataTemplateEngine: "njk",
	}
};
