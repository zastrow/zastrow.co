const links = document.querySelectorAll('a[href]');
const deco = document.querySelector('.cmp-site-header__title');

deco.style.setProperty('--rotation-start', localStorage.getItem('rotation'));

links.forEach((link) => {
	link.addEventListener('click', () => {
		document.body.classList.add('pause-animation');
		const rotateValue = getComputedStyle(deco, ':before').rotate;
		localStorage.setItem('rotation', rotateValue);
	});
})
