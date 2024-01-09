const { AssetCache } = require('@11ty/eleventy-fetch');
const Airtable = require('airtable');

// Credit to Cassey Lottman on this approach
// https://www.cassey.dev/11ty-airtable-fetch/
const createBookFromRecord = (record) => ({
	title: record.get('Title'),
	author: record.get('Authors'),
	isbn: record.get('ISBN'),
	date: record.get('Date Finished'),
	rating: record.get('Star Rating'),
	review: record.get('Review')
});

module.exports = async function() {
	const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BOOKS_BASE_ID);

 // set up an object we'll populate with data.
	const books = [];

	const asset = new AssetCache("airtable_books_read");

	// check if the cache is fresh within the last day
	if(asset.isCacheValid("1d")) {
		// return cached data.
		return asset.getCachedValue();
	}

	try {
		await base(process.env.AIRTABLE_BOOKS_TABLE_ID).select({
			view: "Grid view"
		}).eachPage(function page(records, fetchNextPage) {
			try {
				records?.forEach((record) => {
					books.push(createBookFromRecord(record));
				});
			} catch (error) {
				console.log(error);
			}
			// To fetch the next page of records, call `fetchNextPage`.
			// If there are more records, `page` will get called again.
			// If there are no more records, the promise will resolve.
			fetchNextPage();
		});
			console.log("saving");
			await asset.save(books, "json");
			return books;
	} catch (err) {
		console.log(err);
		console.log("returning cached");
		return asset.getCachedValue();
	}
}
