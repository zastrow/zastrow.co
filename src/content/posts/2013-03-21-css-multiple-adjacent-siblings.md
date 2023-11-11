---
author:
  display_name: zastrow
  email: philip@zastrow.co
  first_name: Philip
  last_name: Zastrow
  login: zastrow
categories:
  - Writing
date: "2013-03-21T02:30:00Z"
meta: {}
parent_id: "0"
password: ""
published: true
status: publish
title: CSS Multiple Adjacent Siblings
type: post
aliases:
  - /2013/03/css-multiple-adjacent-siblings/
---
<p>Ever need to style an element, but only if another sibling element was present?</p>
<p>I hit just that scenario this morning. I’m working on a site that has a landing page for four different sections of the website. For the most part the layout of the landing pages are the same, except one or two that does not contain an area for bugs<sup id="fnref:1-2013-03-21"><a href="#fn:1-2013-03-21" class="cmp-footnote">1</a></sup>. At the large screen views, I want the <code class="highlighter-rouge">.bugs</code> container to be the first of three columns, followed by <code class="highlighter-rouge">.col1</code> which usually contains events, and then <code class="highlighter-rouge">.col2</code> which usually contains news.</p>
<p>At the default, small screen view these containers all stack.</p>
<figure class="no">
<img src="/assets/2013/03/sample1.png" alt="Mobile stacked containers" /><br />
</figure>
<p>By the time we hit a portrait tablet screen size, <code class="highlighter-rouge">.col1</code> and <code class="highlighter-rouge">.col2</code> are side by side with the <code class="highlighter-rouge">.bugs</code> container above them at full width.</p>
<figure class="no">
<img src="/assets/2013/03/sample2.png" alt="Tablet stacked containers with two columns" /><br />
</figure>
<p>To achieve this I am simply adding the following to my CSS at this media query</p>
<div class="highlighter-rouge">
<pre class="highlight"><code>.col1, .col2 { width:50%; }
</code></pre>
</div>
<p><small>Please note, I’m not getting into detail on how I have these containers oriented horizontally. The easiest is to add a <code class="highlighter-rouge">float</code> parameter to each container. However, I tend to use a <code class="highlighter-rouge">display:inline-block</code> approach, which I feel has more versatility.</small></p>
<p>By the time we are hitting our larger screens and landscape tablet sizes, all three containers are side by side as three columns.</p>
<figure class="no">
<img src="/assets/2013/03/sample3.png" alt="Large screen view with three columns" /><br />
</figure>
<p>Currently my CSS looks like this for these three containers:</p>
<figure class="highlight">
<div class="language-css highlighter-rouge">
<pre class="highlight"><code><span class="nc">.bugs</span> <span class="p">{</span> <span class="nl">width</span><span class="p">:</span><span class="m">20%</span><span class="p">;</span> <span class="p">}</span>
<span class="nc">.col1</span><span class="o">,</span>
<span class="nc">.col2</span> <span class="p">{</span> <span class="nl">width</span><span class="p">:</span><span class="m">40%</span><span class="p">;</span> <span class="p">}</span></code></pre>
</p></div>
</figure>
<p>This works out quite well as a good reorientation of the layout for these containers. As I said though, I have a couple pages that don’t have the <code class="highlighter-rouge">.bugs</code> containers and otherwise have the same skeletal markup. In those cases, I want to keep the widths on <code class="highlighter-rouge">.col1</code> and <code class="highlighter-rouge">.col2</code> at 50%. At the same time I don’t want to modify my markup on these pages if I can accomplish this with just CSS, which I can.</p>
<p>This is where CSS’s adjacent sibling selector come in. Essentially, this is a way to style an element, but only if it is immediately after another element. CSS-Tricks has a great rundown explaining the different child and sibling selectors available. A good way to think about the adjacent sibling selector is with an if statement. So, if <code class="highlighter-rouge">.element-a</code> is followed by <code class="highlighter-rouge">.element-b</code> then style <code class="highlighter-rouge">.element-b</code> like this.</p>
<p>In the situation I’m working with here is how I approached styling <code class="highlighter-rouge">.col1</code> and <code class="highlighter-rouge">.col2</code> if the <code class="highlighter-rouge">.bugs</code> container was present:</p>
<figure class="highlight">
<div class="language-css highlighter-rouge">
<pre class="highlight"><code><span class="nc">.bugs</span> <span class="p">{</span> <span class="nl">width</span><span class="p">:</span><span class="m">20%</span><span class="p">;</span> <span class="p">}</span>
<span class="nc">.bugs</span> <span class="o">+</span> <span class="nc">.col1</span><span class="o">,</span>
<span class="nc">.bugs</span> <span class="o">+</span> <span class="nc">.col1</span> <span class="o">+</span> <span class="nc">.col2</span> <span class="p">{</span> <span class="nl">width</span><span class="p">:</span><span class="m">40%</span><span class="p">;</span> <span class="p">}</span></code></pre>
</p></div>
</figure>
<p>This is in my media query targeting screens larger than 1000px wide. This changes the widths for <code class="highlighter-rouge">.col1</code> and <code class="highlighter-rouge">.col2</code>, but only if the <code class="highlighter-rouge">.bugs</code> container is present and proceeding them. Otherwise <code class="highlighter-rouge">.col1</code> and <code class="highlighter-rouge">.col2</code> retain the <code class="highlighter-rouge">width:50%;</code> from the previous media query. Also, notice in line three that we have multiple adjacent sibling selectors for one element. Without this then <code class="highlighter-rouge">.col2</code> would still have the <code class="highlighter-rouge">width:50%</code>. Nor could we use <code class="highlighter-rouge">.bugs + .col2</code> because those elements have <code class="highlighter-rouge">.col1</code> between them in the markup, which negates the adjacent sibling selector.</p>
<p>I was pleasantly surprised to find that it was possible to have multiple adjacent sibling selectors. What makes it more useful is after a quick jump in BrowserStack, I found that the multiple adjacent sibling selectors work as far back as IE7.</p>
<div class="cmp-footnotes">
<ol>
<li id="fn:1-2013-03-21">
<p>That is miscellaneous links and call to action buttons.&nbsp;<a href="#fnref:1-2013-03-21" class="cmp-footnotes__return-link">&#9650;</a></p>
</li>
</ol>
</div>
