---
title: New Blog, Who Dis?
ogimage:
  title: New Blog, Who&nbsp;Dis?
date: "2024-01-12T17:30:33-05:00"
preview: Ok, not really new. But, I didn't call the branch introducing this new design <code>overhaul</code> for nothing. I have hopes, plans, and dreams for this site, and want to share.
aliases:
  - /posts/2024/01/12/new-blog-who-and-nbsp-dis/
---

The last time I redesigned this site, was 2 years ago—almost to the day! It was the result of a realization that I had not given this site much attention, and was intended to be a low maintenance site. It had been, at the time, four years since my last blog post or really any update to the site, and I didn’t see that changing in the near future. With the push, I have seen in my Mastodon circle toward personal websites, I wanted to get back to it.

A new design won’t change my frequency of posting. That is going to take a concerted effort, which I’m strategizing and have mild optimism. However, I think what I added and changed will help me in coming back to write regularly. I hade three goals: make a design that kicked ass, provide automatic updates, and make blogging stand out.

There is a thing you need to know about my perspective of this website. Though you, dear reader, are taking the time to read this, I don’t think you are this site’s audience. My primary audience, for my site, is me. That may sound weird and egotistical, but it’s how I’ve always viewed my site. It is my place on the web to do whatever I want for no other reason than it’s what I want to do.

All that aside, I think I nailed the design. I love it anyway, and I’m super grateful to the artist and designers who inspired me to land on this design and choose the resource I ended up with. Additionally, there’s some pretty cool technical stuff driving the color palette, but that’s another post, too. What I will mention is that the fonts are from GitHub’s collection of fonts: Mona Sans for the main body copy and most of the headlines, Hubot Sans for the huge page headers, and Monaspace Neon for the subheadings and code. The other thing to mention is that while I have often had a color palette involving deep pink and orange, the aesthetic and header visual is inspired by a work by [LiL Tuffy](https://www.lil-tuffy.com) I have hanging in my office.

The next bit being automatic site updates isn’t actually new, but instead being more intentional with those automations. Many years ago, I got started with [Micro.blog](https://micro.blog), which works like a mixture of personal blog and social media. I liked the concept and automated everything I could to funnel activity into my site that was then publishing to Micro.blog. Whenever I would check in at a location on Foursquare, logged a book on GoodReads, or for a time, each post on the bird site would be funneled into my site via an [IFTTT](https://ifttt.com) Rube Goldberg machine. It worked, but after time it felt like noise between written posts.

Automation with the redesign is approached differently, but still involves some IFTTT tactics. When I set up Micro.blog, I was running WordPress so that I could use the IFTTT action to create content. This current version is built with [Eleventy](https://11ty.dev) and instead of using IFTTT to create content, all content is generated via APIs or RSS feeds directly by the Eleventy build. IFTTT, instead now only watches for changes to these things, and via Netlify web hooks kicks off a new deployment. These automations include the updated reading list portion of the site and my latest [Instapaper](https://instapaper.com) article.

Lastly, with making the blog stand out, I needed to do a few things. First, was clean up the cruft. I want my blog to be about what I write, not social media posts. I love the concept of Micro.blog, but in practice for me it's not how I want my content to mingle. All the micro posts including check-ins, books, and social media-like small posts were removed, leaving only my blog post writing. I still have a way to show some of this content, but it is separate from the blog. Next, I made the blog prominent on the homepage, but didn’t make the homepage the blog landing page. This allows me to keep the blog as a dedicated feature and able to stand on its own among the other content I want to have on this site. Lastly, I’m still figuring out writing regularly. I have ideas, but it’ll likely always be a work in progress.

I learned a lot through this design and build process, which will probably cause me to write more posts. Furthermore, I expect to cover plenty of technical topics, but I hope to get in some book reviews, or share cool resources. This site is where I hope to do a lot of my thinking, ideating, and iterating for years to come.
