const bodyElement = document.body;
const navOpenButton = document.querySelector('.js-nav-open');
const navCloseButton = document.querySelector('.js-nav-close');
const navElement = document.querySelector('.js-nav');
const navLinks = navElement.querySelectorAll('a');
const smallNav = window.matchMedia("(width < 56rem)");
const focusableElements = document.querySelectorAll(':where(a[href],button,input,video,audio,textarea,label,select,details,[contenteditable]):not([disabled])');

const unsetNavTabTrap = () => {
	// Remove tabindex from all focusable elements
	focusableElements.forEach(object => object.removeAttribute('tabindex'));
	// Add tabindex to nav items
	navLinks.forEach(link => link.setAttribute('tabindex', '-1'));
	navCloseButton.setAttribute('tabindex', '-1');
}

const setNavTabTrap = () => {
	// Add tabindex to all focusable elements
	focusableElements.forEach(object => object.setAttribute('tabindex', '-1'));
	// Remove tabindex from nav items
	navLinks.forEach(link => link.removeAttribute('tabindex'));
	navCloseButton.removeAttribute('tabindex');
}

const setClosedNav = () => {
	unsetNavTabTrap();
	navOpenButton.setAttribute('aria-expanded', false);
	navElement.setAttribute('aria-hidden', true);
	navElement.classList.remove('cmp-nav--open')
	bodyElement.classList.remove('nav-open');
}

const setOpendNav = () => {
	setNavTabTrap();
	navOpenButton.setAttribute('aria-expanded', true);
	navElement.setAttribute('aria-hidden', false);
	navElement.classList.add('cmp-nav--open')
	bodyElement.classList.add('nav-open');
}

const unsetSmallNav = () => {
	focusableElements.forEach(object => object.removeAttribute('tabindex'));
	navOpenButton.removeAttribute('aria-expanded');
	navElement.removeAttribute('aria-hidden');
	navElement.classList.remove('cmp-nav--open');
	bodyElement.classList.remove('nav-open');
}

export default function navSetup() {
	if (smallNav.matches) {
		setClosedNav();

		navOpenButton.addEventListener('click', () => {
			setOpendNav();
		});

		navCloseButton.addEventListener('click', () => {
			setClosedNav();
		});
	} else {
		unsetSmallNav();
	}
}
