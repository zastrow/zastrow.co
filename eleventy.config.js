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

	// Create Projects Collection
	// ---------------------------------------------------------------
	eleventyConfig.addCollection('projects', (api) => {
		const files = fg(["src/content/projects/**/*.md"], {
			ignore: ["src/content/projects/index.md"]
		});
		return api.getFilteredByGlob(files);
	});

// =====================================================================

	eleventyConfig.addGlobalData("eleventyComputed.permalink", function() {
		return (data) => {
			// Always skip during non-watch/serve builds
			if(data.draft) {
				return false;
			}

			return data.permalink;
		}
	});

	eleventyConfig.addPairedShortcode('markdown', async (content) => {
		const md = MarkdownIt();
		return md.render(content.toString());
	})

	eleventyConfig.addShortcode('bookshop_link', async (isbn, slug, title) => {
		// Ideally we want to send readers directly to the page, however
		// the ISBN from ItalicType isn’t always book available on Bookshop.
		// There may be an API to search for a book and get an active ISBN.
		// Affiliate link structure:
		// const url = `https://bookshop.org/a/84246/${ isbn }`;
		const searchURL = `https://bookshop.org/search?keywords=${slug}`;
		return `<a class="cmp-button" href="${searchURL}" rel="external" aria-label="Search for ${title} on Bookshop.org">Search for this book on Bookshop.org</a>`;
	});

	eleventyConfig.addGlobalData('site_url', process.env.SITE_URL);
	eleventyConfig.addGlobalData('meta_description', 'Philip Zastrow. Designer, Engineer, and Web Accessibility Specialist. Website, Blog, and Dreams.');
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
