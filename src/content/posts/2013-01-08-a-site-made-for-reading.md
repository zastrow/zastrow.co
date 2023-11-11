---
author:
  display_name: zastrow
  email: philip@zastrow.co
  first_name: Philip
  last_name: Zastrow
  login: zastrow
categories:
  - Writing
date: "2013-01-08T16:28:55Z"
meta: {}
parent_id: "0"
password: ""
published: true
status: publish
title: A site made for reading
type: post
aliases:
  - /2013/01/a-site-made-for-reading/
---
<p>2012 was an incredible year. It kicked off with an intense, ground-up revamp of the <a href="http://www.nd.edu">University of Notre Dame homepage</a>. This site caused an avalanche of humbling accolades<sup id="fnref:-2013-01-08"><a href="#fn:1-2013-01-08" class="cmp-footnote">1</a></sup>. Following the launch of the Notre Dame homepage, focus shifted to numerous other projects, including the <a href="http://science.nd.edu">College of Science</a>, the <a href="http://provost.nd.edu">Provost’s Office</a>, and the <a href="http://architecture.nd.edu">School of Architecture</a>. All great projects to further many of the standards set with the main university site. The year’s end brought a wonderful and challenging project—the redesign of the <a href="http://magazine.nd.edu">Notre Dame Magazine</a> website, which launched this past Friday.</p>
<p>The Notre Dame Magazine website is a bit of a dream project for me. Content is priority. Mobile traffic is high. What really helped—the folks at the magazine recognized these things. They wanted a website that could supersede the print edition.</p>
<h2 id="design-choices">Design Choices</h2>
<p>I had a clear personal goal with this project. The magazine’s content had to provide a distraction-free and pleasant reading experience. In particular, the content of this website had to look incredible on a Retina iPad. This meant finding some great fonts to use, and <a href="http://www.theleagueofmoveabletype.com">The League of Moveable Type</a> did not disappoint. The primary fonts of the site were <a href="http://www.theleagueofmoveabletype.com/chunk">Chunk</a>, for the headlines, and <a href="http://www.theleagueofmoveabletype.com/sorts-mill-goudy">Sorts Mill Goudy</a>, for the body copy. Additionally <a href="http://www.fontsquirrel.com/fonts/PT-Sans">PTSans</a>, by <a href="http://www.paratype.com">Paratype</a>, was used as a sans-serif alternate font for buttons, navigation, and other places as needed.</p>
<p>Once I had my typefaces gathered, layout work started. Good responsive layout work starts at mobile. Mobile is raw content presentation. No frills, just text. Any floats attributed to an image are cut away. The image takes up the width of the screen, on its own line. As the layout expands on to larger screens the image positions take on more requirements.</p>
<p>I find left-aligned images to be distracting to the content on a webpage. To limit how a left-aligned image cuts into the content, the image width maxes out at around one-sixth to one-fifth the width of the content. Right-aligned images are awesome—these images breakout of the implied constraints of the content, quite beautifully. Finally our inline images maintain that full-width of the content that started off on the smaller, mobile screens.</p>
<h2 id="navigation">Navigation</h2>
<p>One aspect of this site became apparent early on, the content makes pages long. From the start of the mobile layout, I wanted an accessible button to aid in navigating the page. In the top right, a touchable red button stays with you from the top of the page to the bottom. Upon interaction the button produces a few some essential pieces. A button to return to the page top<sup id="fnref:-2013-01-08"><a href="#fn:2-2013-01-08" class="cmp-footnote">2</a></sup>, the first few menu items with a link to the rest of the menu, and finally a search box.</p>
<p>Once the layout had the required space needed, the menu was brought to left of the content and the search bar nested in the site’s header. Like the mobile layout’s navigation button, the menu stays with you the length of the page. However, a problem came about on the articles. The menu broke my main rule for this site, no distractions. So a hybrid of the mobile navigation and the main menu was created specifically for news pages<sup id="fnref:-2013-01-08"><a href="#fn:3-2013-01-08" class="cmp-footnote">3</a></sup>.</p>
<h2 id="final-bits">Final bits</h2>
<p>I am very pleased with the results of this project. This is the first SASS site launched by the web team, an experience I hope to talk about soon<sup id="fnref:-2013-01-08"><a href="#fn:4-2013-01-08" class="cmp-footnote">4</a></sup>. The reactions so far have been quite positive, though we’re still in the midst of post-launch clean-up.</p>
<div class="cmp-footnotes">
<ol>
<li id="fn:1-2013-01-08">
<p>The list includes, but is not limited to: <a href="http://www.implementingresponsivedesign.com">Implementing Responsive Design</a> by <a href="http://timkadlec.com">Tim Kadlec</a>, <a href="http://www.the-mobile-book.com">The Mobile Book</a> by <a href="http://www.smashingmagazine.com">Smashing Magazine</a>,  <a href="http://www.netmagazine.com/features/top-25-responsive-sites-2012">Net Magazine’s Top 25 Responsive Sites of 2012</a>, and <a href="http://www.amazon.com/gp/product/193382087X/ref=as_li_ss_tl?ie=UTF8&amp;tag=philandrobi-20&amp;linkCode=as2&amp;camp=1789&amp;creative=390957&amp;creativeASIN=193382087X">Content Everywhere</a> by <a href="http://sarawb.com">Sara Wachter-Boettcher</a>&nbsp;<a href="#fnref:-2013-01-08" class="cmp-footnotes__return-link">&#9650;</a></p>
</li>
<li id="fn:2-2013-01-08">
<p>Many of my colleagues were unfamiliar with back to top feature of iOS’s status bar, so I found this button very necessary. Not to mention other mobiles that might not have a similar native feature.&nbsp;<a href="#fnref:-2013-01-08" class="cmp-footnotes__return-link">&#9650;</a></p>
</li>
<li id="fn:3-2013-01-08">
<p>This approach was suggested by my director, <a href="http://www.twitter.com/GTownNick">Nick Johnson</a>, and inspired by the navigation found on YouTube’s homepage and video pages.&nbsp;<a href="#fnref:-2013-01-08" class="cmp-footnotes__return-link">&#9650;</a></p>
</li>
<li id="fn:4-2013-01-08">
<p>Along with other technical aspects of this site.&nbsp;<a href="#fnref:-2013-01-08" class="cmp-footnotes__return-link">&#9650;</a></p>
</li>
</ol>
</div>
