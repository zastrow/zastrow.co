---
categories:
  - Writing
date: "2013-01-25T14:31:00Z"
meta: {}
published: true
status: publish
title: CSS Ratios
type: post
aliases:
  - /2013/01/css-ratios/
---
<p>The more sites I design responsively, the more I see the need for maintaining an element’s aspect ratio. The idea being that as the browser window widens and shrinks, both the element’s height and width scale proportionately.</p>
<p>However, there is not a clear and simple way to do this. Most solutions I’ve found require a minimum of two elements to make this type of functionality work. Other solutions require Javascript instead of straight CSS. While not nearly as bad, this feels a bit like the old way to achieve rounded corners before <code class="highlighter-rouge">border-radius</code>.</p>
<p>What I want is a CSS property that can maintain set proportions for any given element. Currently there is only one element that has this functionality with the least amount of CSS. An <code class="highlighter-rouge">img</code> tag with a percentage-based <code class="highlighter-rouge">max-width</code> or <code class="highlighter-rouge">width</code> property will scale the element’s height proportionate to the displayed width as the window size changes. As far as I’m aware there is no way to make an element behave like an <code class="highlighter-rouge">img</code> tag.</p>
<p>Maybe an expansion of the box model is in order so we can say <code class="highlighter-rouge">box-sizing: img-box;</code>, which should also inherit the properties of <code class="highlighter-rouge">border-box</code>. Another option could be a straight <code class="highlighter-rouge">ratio:maintain;</code> declaration could be added to handles this. We may need to throw in our dimensions as well, so maybe there are <code class="highlighter-rouge">ratio-height</code> and <code class="highlighter-rouge">ratio-width</code> properties added. Of course if CSS ever gains some rudimentary math functions, we might be able to take care of our ratios there.</p>
<h2 id="blah-blah-blahhow-about-a-use-case">Blah, blah, blah…how about a use case?</h2>
<p>The biggest area I see this need is for embedded content. This is content that often ought to scale like an image, particularly videos. I also see cases where an element does nothing but display a background image, like a logo, and that element needs to scale proportionately to the window size. I’ve used methods to create proportionately scaling buttons as well.</p>
<h2 id="you-could-just-use-media-queries">You could just use media queries</h2>
<p>Well, yeah…I’m still going to use media queries, but responsive design is about the in between. I might have media queries that even kill the whole proportions thing, but the ability to have it in an area where it makes sense would be nice.</p>
<h2 id="fine-fineyou-said-there-were-options-for-ratios-now">Fine, fine…you said there were options for ratios now</h2>
<p>Yes, thank you.</p>
<p>I have two options to show. They’re CSS only—that’s my criteria for this. So, with out further ado…</p>
<h3 id="two-elements-and-a-pseudo">Two Elements and a :pseudo</h3>
<p>This is probably the more common solution as far as I’m aware. The idea is to use an <code class="highlighter-rouge">:after</code> pseudo element and a child element to create the ratios. In the below example I’ve separated the <code class="highlighter-rouge">padding-top</code> property into individually scoped <code class="highlighter-rouge">:after</code> pseudo elements. The ratios I’m using are the more common video types; 4:3, 16:9, and the epic 2.39:1.</p>
<p data-height="300" data-theme-id="21151" data-slug-hash="wBFaD" data-default-tab="html,result" data-user="zastrow" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/zastrow/pen/wBFaD/">Aspect Ratio Containers</a> by Philip Zastrow (<a href="http://codepen.io/zastrow">@zastrow</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<p><script async="" src="//assets.codepen.io/assets/embed/ei.js"></script></p>
<h3 id="the-hidden-image">The Hidden Image</h3>
<p>I’m actually using this method on the <a href="http://magazine.nd.edu">Notre Dame Magazine</a> website. Unfortunately this is the modern-day equivalent of the <a href="http://en.wikipedia.org/wiki/Spacer_GIF">spacer gif</a>. The idea is that the image size with a <code class="highlighter-rouge">max-width</code> or <code class="highlighter-rouge">width</code> property with a percent-based value would scale the parent element in a proportionate manner.</p>
<p data-height="300" data-theme-id="21151" data-slug-hash="FELlc" data-default-tab="html,result" data-user="zastrow" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/zastrow/pen/FELlc/">IMG-based Aspect Ratio Containers</a> by Philip Zastrow (<a href="http://codepen.io/zastrow">@zastrow</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<p><script async="" src="//assets.codepen.io/assets/embed/ei.js"></script></p>
<p>You can also use <a href="http://cdpn.io/rCpIB">this method</a> to add some additional CSS styling to an image that can’t be added directly to an <code class="highlighter-rouge">img</code> tag.</p>
<h2 id="final-thoughts">Final Thoughts</h2>
<p>As far as solutions I’m aware of, I think the <strong>Two Elements and a :pseudo</strong> is the way to go for most cases. However, I can see and have had situations where the <strong>Hidden Image</strong> method makes the most sense. If you go the image route make sure it is working semantically and not just used for sizing the element. In the case with the Notre Dame Magazine website, the <code class="highlighter-rouge">img</code> tag has a <code class="highlighter-rouge">title</code> attribute describing the image in the background.</p>
<p>Keep in mind that these ratios don’t need to be something that exist outside of media queries. Let the content dictate the layout and use of ratios.</p>
