const body = document.body;
const buttonDarkMode = document.querySelector('.js-mode-dark');
const buttonLightMode = document.querySelector('.js-mode-light');
const buttonAutoMode = document.querySelector('.js-mode-auto');

const allButtons = [buttonDarkMode, buttonAutoMode, buttonLightMode];
const deactivateButtons = () => allButtons.forEach(e => e.classList.remove('cmp-settings__mode-button--active'));

const setDarkMode = () => {
	deactivateButtons();
	body.classList.remove('mode-light');
	body.classList.add('mode-dark');
	buttonDarkMode.classList.add('cmp-settings__mode-button--active');
}

const setLightMode = () => {
	deactivateButtons();
	body.classList.remove('mode-dark');
	body.classList.add('mode-light');
	buttonLightMode.classList.add('cmp-settings__mode-button--active');
}

const setAutoMode = () => {
	deactivateButtons();
	body.classList.remove('mode-dark');
	body.classList.remove('mode-light');
	buttonAutoMode.classList.add('cmp-settings__mode-button--active');
}

const expandedCookieValue = document.cookie
	.split('; ')
	.find((row) => row.startsWith('zastrowcoColorMode='))
	?.split('=')[1];

if (expandedCookieValue === 'dark') {
	setDarkMode();
}
else if (expandedCookieValue === 'light') {
	setLightMode();
}
else if (expandedCookieValue === 'auto') {
	setAutoMode();
}
else {
	buttonAutoMode.classList.add('cmp-settings__mode-button--active');
}

buttonDarkMode.addEventListener('click', () => {
	setDarkMode();
	document.cookie = `zastrowcoColorMode=dark;`;
});

buttonLightMode.addEventListener('click', () => {
	setLightMode();
	document.cookie = `zastrowcoColorMode=light;`;
});

buttonAutoMode.addEventListener('click', () => {
	setAutoMode();
	document.cookie = `zastrowcoColorMode=auto;`;
});
