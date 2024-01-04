# My Website

Here it is, the repo for my personal website, [zastrow.co](https://zastrow.co).

Here are the details:

## Eleventy
This site is generated using [Eleventy](https://11ty.dev) with [Liquid](http://liquidjs.com) templates

## Open Props
I have included the [Open Props](https://open-props.style) library because it is a great resource for premade values. Since I already use a number of similar values in my defaults, it made since to lean on something established so I could get up in running faster. I am using the [Just In Time PostCSS plugin](https://github.com/GoogleChromeLabs/postcss-jit-props) to only load Open Props values I am actually using.

## Sass
While there have been incredible advances with CSS processors and I could even use Eleventy to concatenate files, Sass continues to stand the test of time for me and packs so many useful features in on dependency.

## To Build

1. Clone/Fork the repo
2. Run `npm install` to install all dependencies
3. Run `npm start` to kick off a local build
4. Open the site in your favorite browser [localhost:8080](http://localhost:8080)

