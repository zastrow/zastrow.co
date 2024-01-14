const body = document.body;
const buttonDarkMode = document.querySelector('.js-mode-dark');
const buttonLightMode = document.querySelector('.js-mode-light');
const buttonAutoMode = document.querySelector('.js-mode-auto');

const allButtons = [buttonDarkMode, buttonAutoMode, buttonLightMode];
const deactivateButtons = () => allButtons.forEach(e => e.classList.remove('cmp-settings__mode-button--active'));

buttonAutoMode.classList.add('cmp-settings__mode-button--active');

buttonDarkMode.addEventListener('click', () => {
	deactivateButtons();
	body.classList.remove('mode-light');
	body.classList.add('mode-dark');
	buttonDarkMode.classList.add('cmp-settings__mode-button--active');
});

buttonLightMode.addEventListener('click', () => {
	deactivateButtons();
	body.classList.remove('mode-dark');
	body.classList.add('mode-light');
	buttonLightMode.classList.add('cmp-settings__mode-button--active');
});

buttonAutoMode.addEventListener('click', () => {
	deactivateButtons();
	body.classList.remove('mode-dark');
	body.classList.remove('mode-light');
	buttonAutoMode.classList.add('cmp-settings__mode-button--active');
});
