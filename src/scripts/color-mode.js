const body = document.body;
const buttonDarkMode = document.querySelector('.js-mode-dark');
const buttonLightMode = document.querySelector('.js-mode-light');
const buttonAutoMode = document.querySelector('.js-mode-auto');

const modeList = document.querySelector('.cmp-settings__list');
const allButtons = [buttonDarkMode, buttonAutoMode, buttonLightMode];
const deactivateButtons = () => allButtons.forEach(e => e.classList.remove('cmp-settings__mode-button--active'));
const setActiveIndex = (index) => modeList.style.setProperty('--active-index', index);

const setDarkMode = () => {
	deactivateButtons();
	body.classList.remove('mode-light');
	body.classList.add('mode-dark');
	buttonDarkMode.classList.add('cmp-settings__mode-button--active');
	setActiveIndex(2);
}

const setLightMode = () => {
	deactivateButtons();
	body.classList.remove('mode-dark');
	body.classList.add('mode-light');
	buttonLightMode.classList.add('cmp-settings__mode-button--active');
	setActiveIndex(1);
}

const setAutoMode = () => {
	deactivateButtons();
	body.classList.remove('mode-dark');
	body.classList.remove('mode-light');
	buttonAutoMode.classList.add('cmp-settings__mode-button--active');
	setActiveIndex(0);
}

if (localStorage.getItem('color_mode') === 'dark') {
	setDarkMode();
}
else if (localStorage.getItem('color_mode') === 'light') {
	setLightMode();
}
else if (localStorage.getItem('color_mode') === 'auto') {
	setAutoMode();
}
else {
	buttonAutoMode.classList.add('cmp-settings__mode-button--active');
	setActiveIndex(0);
}

buttonDarkMode.addEventListener('click', () => {
	setDarkMode();
	localStorage.setItem('color_mode', 'dark');
});

buttonLightMode.addEventListener('click', () => {
	setLightMode();
	localStorage.setItem('color_mode', 'light');
});

buttonAutoMode.addEventListener('click', () => {
	setAutoMode();
	localStorage.setItem('color_mode', 'auto');
});
