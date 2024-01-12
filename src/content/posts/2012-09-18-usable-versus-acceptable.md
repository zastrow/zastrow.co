---
categories:
  - Writing
date: "2012-09-18T10:49:43Z"
meta: {}
published: true
status: publish
title: Usable versus Acceptable
type: post
aliases:
  - /2012/09/usable-versus-acceptable/
---
<p>Web design has to account for multiple scenarios. Various browsers and devices produce different results with the same styles and markup. It’s a problem as old as the web design profession. Where, then, is the line between usable and acceptable in these differing results?</p>
<p>A scenario I face so commonly I forget about it is rounded corners. It is an aesthetic choice web designers have been using for a decade, but until recently was difficult to implement. With CSS3’s <code class="highlighter-rouge">border-radius</code> a rounded corner is quick to make. Older browsers, such as Internet Explorer 8, don’t support this feature and create normal 90 degree corners. The straight corners don’t hinder usability and typically the integrity of the design is maintained. In my opinion, this is an acceptable design difference between the browsers.</p>
<p>CSS is now at the point where we can produce highly detailed and beautiful elements without the need of images. This leads me to another scenario I’ve come across recently. For a project I’m currently designing, I made a lovely CSS-generated indicator for pagination.</p>
<figure>
<img alt="CSS3-generated indicators in Webkit" src="/assets/2012/09/css3-indicator.png" /><br />
</figure>
<p>However, the same CSS and HTML in Internet Explorer 8 produces very different results. The spherical indicators become flat, square boxes. The necessary elements are there for these indicators to be completely useful and accessible, but the design integrity is diminished.</p>
<figure>
<img alt="Flat indicators in Internet Explorer 8" src="/assets/2012/09/ie8-indicator.png" /><br />
</figure>
<p>Older browsers can’t always just be labeled good enough. This result raises questions of acceptability with some subjective answers.</p>
<ul>
<li>Is the time to make the differences acceptable cost-effective?</li>
<li>What do the website’s analytics indicate about this particular browser?</li>
<li>Does this meet personal quality goals, especially in light of the analytics results?</li>
</ul>
<p>Even if this difference is considered acceptable, it may not be to the client. It is ultimately their website, and they may consider it worthwhile to pay more for more acceptable results.</p>
<p>On a side note, this kind of situation is a good argument for delivering HTML-based <a href="http://seesparkbox.com/foundry/our_new_responsive_design_deliverable_the_style_prototype">style prototypes</a> to clients instead of highly-designed image comps. Style prototypes won’t resolve this kind of situation, but should help educate the client early on.</p>
