const EleventyFetch = require('@11ty/eleventy-fetch');
const {extractFromXml} = require('@extractus/feed-extractor');

module.exports = async function() {
	let url = "https://www.instapaper.com/starred/rss/3029481/RyHhH3adWE7QM3ITrUa1l9BqQA";
	/* This returns a promise */
	const instaData = EleventyFetch(url, {
		duration: "1d",
		type: "xml"
	}).then((results) => {
		const parser = extractFromXml(results);
		return parser;
	});

	return instaData;
};

