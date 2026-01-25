import { AssetCache } from '@11ty/eleventy-fetch';
import { extractFromXml } from '@extractus/feed-extractor';

export default async function() {
	// Get and transform the feed.
	let url = "https://www.instapaper.com/starred/rss/3029481/RyHhH3adWE7QM3ITrUa1l9BqQA";
	const res = await fetch(url)
	const xml = await res.text()
	const feed = extractFromXml(xml)

	// Define fetch cache asset
	let asset = new AssetCache("instapaper_likes_feed");

	// Check the cache refresh validity
	if(asset.isCacheValid("1d")) {
		// return cached data.
		return asset.getCachedValue(); // a promise
	}

	// Save the new cache as json
	await asset.save(feed, "json");

	// Return the data
	return feed;
};
