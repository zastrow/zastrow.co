import navSetup from './nav';
const bodyElement = document.body;

export default function resizeWatcher() {
	window.addEventListener('resize',  () => {
		// Prevents Safari misalignment of animated
		// position absolute elements
		bodyElement.classList.add('resize');
		setTimeout( () => {
			navSetup();
			bodyElement.classList.remove('resize');
		}, 500)
	});
}
