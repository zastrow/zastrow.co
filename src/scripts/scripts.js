const bodyElement = document.body;
const navOpenButton = document.querySelector('.js-nav-open');
const navCloseButton = document.querySelector('.js-nav-close');
const navElement = document.querySelector('.js-nav');

navElement.setAttribute('aria-hidden', true);

navOpenButton.addEventListener('click', (event) => {
	navElement.setAttribute('aria-hidden', false);
	navElement.classList.add('cmp-nav--open')
	bodyElement.classList.add('nav-open');
});

navCloseButton.addEventListener('click', (event) => {
	navElement.setAttribute('aria-hidden', true);
	navElement.classList.remove('cmp-nav--open')
	bodyElement.classList.remove('nav-open');
});
