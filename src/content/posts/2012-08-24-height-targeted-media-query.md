---
author:
  display_name: zastrow
  email: philip@zastrow.co
  first_name: Philip
  last_name: Zastrow
  login: zastrow
categories:
  - Writing
date: "2012-08-24T11:36:38Z"
meta: {}
parent_id: "0"
password: ""
published: true
status: publish
title: Height Targeted Media Query
type: post
aliases:
  - /2012/08/height-targeted-media-query/
---
<p>With responsive design, we are very focused on widths. Our media queries, image sizes, containers, and so on are based on widths. It makes sense, but we’re not limited to that option alone. Media queries can grab a great deal of information, so why not target the window height?</p>
<p>We can do <code class="highlighter-rouge">@media (min-height:400px)</code> to modify vertically oriented objects at a shorter height. The best use case scenario I can imagine is a <code class="highlighter-rouge">position:fixed</code> side navigation that gets obscured and unusable by a short window height. Perhaps you have a large image you want to fill the screen, in the case of Notre Dame’s <a href="http://www.nd.edu">homepage</a>. With a height-based media query, we can resize the background image to maximize (or minimize) the space the image takes up.</p>
<p>I put together a <a href="/demo/2012/08/media-min-height">quick demo</a> to show how a <code class="highlighter-rouge">@media (min-height: x)</code> works.</p>
