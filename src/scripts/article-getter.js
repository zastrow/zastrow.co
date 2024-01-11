import getRandomSpread from './random-numbers';

export default async function articleUpdater() {
	const sourceElement = document.querySelector('.js-article-source');
	const linkElement = document.querySelector('.js-article-link');

	if (sourceElement && linkElement) {
		const response = await fetch("/json/articles.json");
		const data = await response.json();
		const dataLength = await data.length - 1;
		const randomEntry = await getRandomSpread(0, dataLength);

		if (randomEntry) {
			sourceElement.innerText = data[randomEntry].source;
			linkElement.innerText = data[randomEntry].title;
			linkElement.setAttribute('href', data[randomEntry].link);
		}
	}
}
