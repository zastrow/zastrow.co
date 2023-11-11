---
author:
  display_name: zastrow
  email: philip@zastrow.co
  first_name: Philip
  last_name: Zastrow
  login: zastrow
categories:
  - Writing
date: "2012-07-31T09:13:34Z"
meta: {}
parent_id: "0"
password: ""
published: true
status: publish
title: The Broken Design Process
type: post
aliases:
  - /2012/07/the-broken-design-process/
---
<p>The web design process is broken and the forward momentum of Responsive Web Design is forcing a modern approach.</p>
<p>The typical design process involves creating an idealized concept image of a website in a photo editing application. Then ship that concept image off to the client, or approving authority, for their feedback and critique. Once the concept image has been modified to meet an agreeable state for the parties involved the concept image is replicated, that is remade from scratch, using markup and stylesheets. This replicating part of the process can be done by the same person who created the concept image, but most likely it is not.</p>
<p>In a fixed-width world, this process works. There are  likely discussions along the way as the replicator encounters issues the image creator didn’t anticipate. In the end the replication of the image is a fully functioning website. But, how can this process be effective when we strip out the pixels and replace them with percentages? Before RWD we could easily say that the image creator was the designer, the person in the process that held the grander vision for the look and feel. Likewise the replicator was the developer who made this vision a reality.</p>
<p>Since RWD’s inception, discussions have focused on developers, the replicators. The key piece of RWD stems from the formula that transforms fixed-widths to fluid and scaling objects: <code class="highlighter-rouge">target ÷ context = result</code>. The result tends to be a percentage with several decimal points following. A solution that is further revealing the flaws in the accepted web design process. As developer, and my coworker, <a href="http://www.twitter.com/erunyon">Erik Runyon</a> stated in a recent <a href="http://weedygarden.net/2012/07/why-i-stopped-using-8-decimal-point-widths-and-you-should-too/">blog post</a>:</p>
<blockquote>
<p>…browser vendors can’t agree on how to round decimal numbers. This leads to problems for us developers when it comes to building our pixel-perfect Photoshop designed layouts. In my opinion, the problem isn’t the browsers inconsistencies. The problem is that we’re still trying to replicate 960 grid Photoshop documents as web sites. If we weren’t, would we honestly be giving our columns widths of 24.2485AHHHHH%? Answer: no.</p>
</blockquote>
<p>Unfortunately, the pixel pushers have spent so much time in their photo editors that their toolset and their perception of design are skewed. Design is a beautiful blend of logic and art. A meeting point of the left hemisphere of the brain with the right. I believe web design is the most harmonious of those blends. Yet web designers habitually seclude themselves within a single tool and leave the remaining logic to be ironed out by developers. Web designers do not know their medium and Responsive Web Design requires an intimate knowledge of this medium.</p>
<p>With a website that is designed responsively, there is no longer one layout. Instead, responsively designed websites have a potentially infinite number of layouts. Each responsive layout requires a designer’s expressed attention. This means that a web designers primary tool can no longer be a photo editor, but rather CSS. A web designer’s medium is fluid and requires a different way of thinking. Designers need to handle issues such as typography as the screen size grows and shrinks.</p>
<p>This means the role of the designer changes. The idealized concept image is insufficient, inaccurate, and ultimately a disservice. The only true design is the one found in the medium, the browser. Our perfectionist tendencies need to be rerouted from pixel-perfect Photoshop documents to precisely laid out and designed websites. We need to use our tools to the best of their abilities. Photo editing software is perfect for creating graphics and textures. Layout, color, shape, and typography, these pillars of design are handled with CSS and markup. A knowledgeable and creative designer paired with these tools is a powerful and versatile force.</p>
<p>But, what about the design process? I don’t know what a shift in the design process will look like. We’re in very early stages of this at Notre Dame. Although prior to my position here I built all my own designs, the process was the same. My expectation is more time creating wireframes and conceptualizing. Maybe some rough sketches in Photoshop. Then on to the text editor, a web designer’s layout application. Once a working mockup of the site is approved, the designer can focus on the nitty-gritty parts to make sure everything fits just right on the infinite screen sizes. Developers can then focus on the higher-level functionality of the site and not worry with markup and making design decisions.</p>
<p>Ultimately it will take time, patience, trial, and error. Clients will need education on what to expect as far as deliverables. Project managers will have to adjust timelines and phases of projects. But, the necessary changes will be made. Web design is still a young format with many outstanding possibilities. With the advancements made in HTML5 and CSS3 and the progression of RWD, this is truly an exciting time to be a web designer.</p>
<p><strong>Update</strong></p>
<p><a href="https://twitter.com/kazuhito">Kazuhito Kidachi</a> took the time to <a href="http://kidachi.kazuhi.to/blog/archives/037559.html">translate this article</a> to Japanese.</p>
