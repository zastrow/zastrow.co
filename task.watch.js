'use strict';

const chokidar = require('chokidar');
const shell = require('shelljs');

chokidar.watch('src/styles/**/*.scss').on('change', () => {
	shell.exec('npm run styles');
});
