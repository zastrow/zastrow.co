import chokidar from 'chokidar';
import shell from 'shelljs';

chokidar.watch('src/styles/**/*.scss').on('change', () => {
	shell.exec('npm run styles');
});

chokidar.watch('src/scripts/**/*.js').on('change', () => {
	shell.exec('npm run js');
});
