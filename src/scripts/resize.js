import navSetup from './nav';
const bodyElement = document.body;

export default function resizeWatcher() {
	window.addEventListener('resize',  () => {
		// Prevents Safari misalignment of animated
		// position absolute elements
		bodyElement.classList.add('pause-animation');
		setTimeout( () => {
			navSetup();
			bodyElement.classList.remove('pause-animation');
		}, 500)
	});
}
