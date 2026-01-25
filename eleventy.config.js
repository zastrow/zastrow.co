import 'dotenv/config';
import fs from 'fs';
import pluginRss from "@11ty/eleventy-plugin-rss";
import fg from 'fast-glob';
import MarkdownIt from "markdown-it";
import EleventyPluginOgImage from 'eleventy-plugin-og-image';
import { decode } from 'html-entities';
import yaml from "js-yaml";

export default (eleventyConfig) => {
	// COLLECTIONS
	// =====================================================================

	// Create Posts Collection
	// ---------------------------------------------------------------
	eleventyConfig.addCollection('posts', (api) => {
		const files = fg.sync(["src/content/posts/**/*.md"], {
			ignore: ["src/content/posts/index.md"]
		});
		return api.getFilteredByGlob(files).sort((a,b) => b.date - a.date);
	});

	// Create Projects Collection
	// ---------------------------------------------------------------
	eleventyConfig.addCollection('projects', (api) => {
		const files = fg.sync(["src/content/projects/**/*.md"], {
			ignore: ["src/content/projects/index.md"]
		});
		return api.getFilteredByGlob(files);
	});

	// Create Books Collection
	// ---------------------------------------------------------------
	eleventyConfig.addCollection('books', (api) => {
		return api.getFilteredByGlob("src/content/books/*.md")
			.sort((a, b) => b.data.date - a.data.date);
	});

// =====================================================================

	eleventyConfig.addFilter('fromJson', JSON.parse);
	eleventyConfig.addFilter('toJson', JSON.stringify);

	eleventyConfig.addFilter('decode', function(content) {
		return decode(content, {level: 'html5'});
	});

	eleventyConfig.addGlobalData("eleventyComputed.permalink", function() {
		return (data) => {
			// Always skip during non-watch/serve builds
			if(data.draft) {
				return false;
			}

			return data.permalink;
		}
	});


	eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

	eleventyConfig.addPairedShortcode('markdown', async (content) => {
		const md = MarkdownIt();
		return md.render(content.toString());
	})

	eleventyConfig.addShortcode('bookshop_link', async (isbn, slug, title) => {
		// Ideally we want to send readers directly to the page, however
		// the ISBN from ItalicType isn't always book available on Bookshop.
		// There may be an API to search for a book and get an active ISBN.
		// Affiliate link structure:
		// const url = `https://bookshop.org/a/84246/${ isbn }`;
		const searchURL = `https://bookshop.org/search?keywords=${slug}`;
		return `<a class="cmp-button" href="${searchURL}" rel="external" aria-label="Search for ${title} on Bookshop.org">Search for this book on Bookshop.org</a>`;
	});

	// OG IMAGE PLUGIN
	eleventyConfig.addPlugin(EleventyPluginOgImage, {
		satoriOptions: {
			fonts: [
				{
					name: 'Mona Sans',
					data: fs.readFileSync('./Mona-Sans-SemiBoldWide.woff'),
					weight: 500,
					style: 'normal'
				}
			]
		}
	});

	eleventyConfig.addGlobalData('environment', process.env.NODE_ENV);
	eleventyConfig.addGlobalData('site_url', process.env.SITE_URL);
	eleventyConfig.addGlobalData('time_zone', "America/New_York");
	eleventyConfig.addGlobalData('old_post_date', () => {
		const year = new Date().getFullYear();
		return year - 6;
	});
	eleventyConfig.addGlobalData('meta_description', 'Philip Zastrow is a product-minded developer and designer building polished, practical tools for real-world problems. Sharing my insights, discoveries, and dreams.');
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
