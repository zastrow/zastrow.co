# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Philip Zastrow's personal website (zastrow.co), a static site built with Eleventy 3.x. It features blog posts, book reviews, project showcases, and curated content.

## Build Commands

```bash
npm install      # Install dependencies
npm start        # Development server with hot reload (localhost:8080)
npm run build    # Production build
```

Individual build steps:
```bash
npm run eleventy       # Generate HTML with Eleventy
npm run styles         # Compile Sass to CSS
npm run js             # Bundle JavaScript with esbuild
```

## Architecture

### Tech Stack
- **Eleventy 3.x** - Static site generator
- **Liquid/Nunjucks** - Templating
- **Sass** - CSS preprocessing with ITCSS + BEM architecture
- **esbuild** - JavaScript bundling
- **PostCSS** - CSS transformation with Open Props JIT loading

### Directory Structure
```
src/
├── content/          # Eleventy input (posts/, books/, pages/)
├── layouts/          # Page layouts (*.liquid)
├── includes/         # Reusable components
├── data/             # Global data files (JSON/JS)
├── styles/           # Sass files (ITCSS structure)
├── scripts/          # JavaScript modules
└── public/           # Static assets (passthrough)

dist/                 # Build output (generated)
```

### Key Configuration Files
- `eleventy.config.js` - Eleventy setup, collections, filters, plugins
- `esbuild.config.js` - JavaScript bundler configuration
- `postcss.config.js` - PostCSS with Open Props JIT, custom media, autoprefixer

### CSS Architecture (ITCSS + BEM)
Styles are organized in layers: settings → tools → generics → elements → objects → components. Components use BEM naming (e.g., `.cmp-button`).

### Content Collections
- **posts** - Blog posts from `src/content/posts/` (sorted by date descending)
- **books** - Book reviews from `src/content/books/`
- **projects** - Projects from `src/content/projects/`

### Frontmatter Patterns

Posts:
```yaml
---
title: Post Title
date: 2024-01-28
categories: [Writing]
preview: Short preview text
published: true
---
```

Books:
```yaml
---
layout: book
title: Book Title
author: Author Name
isbn: "ISBN"
date: 2024-01-28
rating: 5
permalink: /books/slug/
---
```

## Guidelines

- **Avoid modifying existing markdown content files** (e.g., now.md) unless specifically asked
- Creating new markdown files is acceptable when part of a task
- Node.js 20.x required (see .nvmrc)
