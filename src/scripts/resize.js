const bodyElement = document.body;

window.addEventListener('resize',  () => {
	// Prevents Safari misalignment of animated
	// position absolute elements
	bodyElement.classList.add('resize');
	setTimeout( () => {
		bodyElement.classList.remove('resize');
	}, 500)
});
