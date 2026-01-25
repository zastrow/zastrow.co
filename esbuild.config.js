import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev');

const config = {
  entryPoints: ['src/scripts/scripts.js'],
  bundle: true,
  outfile: 'dist/scripts.js',
  minify: !isDev,
  sourcemap: isDev,
  target: ['es2020'],
  format: 'iife',
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for JS changes...');
} else {
  await esbuild.build(config);
  console.log('JS build complete');
}
