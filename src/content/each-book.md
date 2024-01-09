---
layout: book
pagination:
  data: read
  size: 1
  alias: book
permalink: "/books/{{ book.date | date: '%Y-%m-%d' }}-{{ book.title | slugify }}/index.html"
eleventyComputed:
  title: "Philip Read {{ book.title }}"
---
