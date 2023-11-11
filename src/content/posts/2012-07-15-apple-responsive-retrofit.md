---
author:
  display_name: zastrow
  email: philip@zastrow.co
  first_name: Philip
  last_name: Zastrow
  login: zastrow
categories:
  - Writing
date: "2012-07-15T09:10:45Z"
meta: {}
parent_id: "0"
password: ""
published: true
status: publish
title: Apple Responsive Retrofit
type: post
aliases:
  - /2012/07/apple-responsive-retrofit/
---
<p>Last week I helped out <a href="http://www.twitter.com/bencallahan">Ben Callahan</a> of <a href="http://seesparkbox.com">Sparkbox</a> with a bit of an experiment with Responsive Design. Ben has <a href="https://github.com/sparkbox/Responsive-Retrofitting/tree/gh-pages">created</a> a clever system to illustrate the ease of retrofitting an older, or non-responsive, website to be responsive. With this experiment Ben asked me to take on Apple’s website. To view the results of this experiment, check out the <a href="https://github.com/sparkbox/Responsive-Retrofitting/blob/gh-pages/README.md">GitHub README</a>.</p>
<p>Overall the project proved to be very educational. I clocked in about six hours to turn the Apple homepage responsive. Unfortunately this retrofit is specific to the MacBook Pro with Retina Display hero shot. The Apple website has several CSS files overwriting each other in some form or another. Globally this retrofit will work for the navigation and likely the footer. But to fully retrofit a site like Apple’s could take a week or so.</p>
<p>I started small and reworked the navigation to fit within the width of my iPhone and worked my way up the original 990px fixed width. Most of Apple’s shine and gloss on the nav are images, so that had to be stripped out. I replaced it with a simple linear gradient on each of the links.</p>
<figure>
<img alt="The Apple website at a responsively mobile screen size." src="/assets/2012/07/preview-retro-rwd-apple-392px.png" /><br />
<figcaption class="enlarge">
<a href="/media/retro-rwd-apple/retro-rwd-apple-392px.png">See full page at 392px width</a><br />
  </figcaption>
</figure>
<p>The two column nav worked well for smaller sizes and and as the screen size grew it made sense to progress to four columns. This is where it became apparent that Apple was using images for text in the nav items. This meant scaling the text was not an option without losing the integrity of the design. So the image text remained, as did the search bar under the nav items.</p>
<figure>
<img alt="The Apple website at a responsively small tablet screen size." src="/assets/2012/07/preview-retro-rwd-apple-678px.png" /><br />
<figcaption class="enlarge">
<a href="/media/retro-rwd-apple/retro-rwd-apple-678px.png">See full page at 678px width</a><br />
  </figcaption>
</figure>
<p>Apple built their website for 1024 × 768 screens, but not 768 × 1024. This is the point on Apple devices that Apple’s own website begins to scale down. The fun fluid part of responsive though, needs to account for the sizes between 768px and 1024px. So, the next major breakpoint still leaves the navigation as two rows and it stays that way until we get back to Apple’s original 990px width.</p>
<figure>
<img alt="The Apple website at a responsively small tablet screen size." src="/assets/2012/07/preview-retro-rwd-apple-907px.png" /><br />
<figcaption class="enlarge">
<a href="/media/retro-rwd-apple/retro-rwd-apple-907px.png">See full page at 907px width</a><br />
  </figcaption>
</figure>
<p>CSS is quite powerful. I have always approached CSS with my own designs, building from the ground up. Overwriting existing styles to make fixed widths fluid proved quite effective. I can see how an experiment like this can be used to show clients an effective way to take their website mobile without a complete overhaul from a visual or structural standpoint. Be sure to check the Responsive Retrofitting project on <a href="https://github.com/sparkbox/Responsive-Retrofitting/tree/gh-pages">GitHub</a>.</p>
