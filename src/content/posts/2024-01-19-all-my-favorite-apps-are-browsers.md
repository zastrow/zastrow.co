---
title: All My Favorite Apps Are Browsers
date: "2024-01-19T22:30:00-05:00"
preview: Electron apps are just the tip of a very large iceberg when it comes to Web-based native apps. Utility apps like Fluid, Coherence X, and Unite allow any website to easily become an app, which has been a critical part of my daily workflow for over a decade.
---

Long before there was Electron and the popularity of web-based native apps, like Slack, VS Code, and Spotify, there was [Fluid](https://fluidapp.com) and [Mozilla Prism](https://en.wikipedia.org/wiki/Mozilla_Prism). These apps allowed the creation of what are called [single-site browsers](https://en.wikipedia.org/wiki/Site-specific_browser), also known as site-specific browsers, or simply SSBs. While, Mozilla Prism was sunsetted, Fluid still exists and is joined by [Unite](https://www.bzgapps.com/unite), [Coherence X](https://www.bzgapps.com/coherence), a CLI utility called [Nativefier](https://github.com/nativefier/nativefier), and even [Safari](https://support.apple.com/en-us/104996). I have been creating and using SSBs for over a decade, and I want to share how I use them.

My primary form of creating SSBs for years was Fluid. In fact, the popularity of Fluid was common in the early 2010s that there was a category of app icons known as Fluid icons, which would be high-quality icons of websites that were converted into an SSB. Designers would create icons to represent SSBs for GitHub, Google Reader, Gmail, Flickr, Basecamp, YouTube, and many more. What’s more was Fluid gave you the option to inject JavaScript and CSS into the pages of the SSB, allowing for customization to an incredible degree.

Around the time Google Reader was shuttered, I started using a self-hosted RSS app called Fever. The developer of this app anticipated that most users would create a Fluid app, so they provided an icon ready to use with an SSB.

## Why Single-Site Browsers

If you have not used an SSB, you may be wonder why someone would want to. Well, many people have various reasons, for me, it is <kbd>⌘</kbd> + <kbd>Tab</kbd> on Mac. I love the concept of windows on Mac far more than I like tabs in a browser. When there is a site I visit regularly that has a utility—such as a work task, like a project Kanban board, or a video viewing site—I create an SSB. This way I can open the app via my task bar, [Alfred](https://www.alfredapp.com), and interact with the content specific to that site. I can also use the <kbd>⌘</kbd> + <kbd>Tab</kbd> key commands to quickly jump between these contextual apps.

I know people really like to use pinned tabs or tab groups in their browser of choice to accomplish a similar form of [contextual computing](https://www.macsparky.com/blog/2021/01/mac-power-users-569-contextual-computing/). For me, I have found this problematic, as I will end up accidentally closing an essential tab or quitting the browser altogether. Separate apps help me context switch and keep me focused on the appropriate task.

## Making my Single-Site Browser

These days, my primary choice for creating SSBs are between Unite and Safari’s Add to Dock feature. Like any of my tools, I like to experiment and try out the alternatives. Fluid has had a rocky history of updates, which caused me to look into alternatives in the first place. Coherence is excellent for websites that work best in Chromium browsers, but one thing I didn’t like about it was how settings were handled, and at that, the lack of options compared to others. Nativifier is really nice and creates an Electron app, but the interface is CLI only and can become quite a cumbersome list of options.

Unite has been my default for a couple of years now—until Apple added the ability for Safari to create SSBs in macOS Sonoma. Between these two, I have a great method to quickly spin up custom SSB apps. I have found in the last couple of months that I have leaned more toward using Safari, but its settings options are quite limited compared to Unite. However, Safari is a great way to kick the tires of a site as an SSB without needing to do much customization that might come with a more advanced application like Unite.

Creating an SSB in Safari is the easiest. Open the site you want to use in Safari, then in the toolbar select File, and then Add to Dock. This will bring up a window that allows for customizing the name, the icon, and adjusting the URL if necessary. Once that is done, the newly created app is now in your Dock ready for you to launch. A nice feature of this is if you are logged in to an account, this new app preserves that state, while having a separate cache from Safari itself. However, the options when creating the app are the same when opening the app’s settings, with the added ability to clear the cache. Safari’s SSB isn’t the ideal tool if you want to set certain URLs to be accessible within this instance, such as subdomains or a related site.

Unite’s set up is about as easy to get started as Safari’s, and they have some popular websites ready to spin up, like Gmail and WhatsApp. Additionally, if you create multiple SSBs, Unite will list recently created apps as a quick launcher or as a way to uninstall the app. There are too many options that come with Unite for me to try to dive into them all, take a look at their [What’s New page](https://www.bzgapps.com/unite/whatsnewinunite) to get an ideal of the possibilities.

Beyond features, the primary differentiator is price. Safari comes baked-in on Mac, and so is the ability to create an SSB. However, it does require at least macOS 14 to use this feature. Unite, on the other hand, is a paid application, starting at $29.99 for a single license. It also comes as a part of a Setup subscription, which is how I have obtained it.


## Final Thoughts on Single-Site Browsers

I have two whole other related topics I need to at least mention. The first is icons and what processes I go to create custom icons for my SSBs. One tool I will often use is Image2Icon, but I will also use graphics tools like Sketch, Figma, Illustrator, and Photoshop to create more specific icons. For example, I have created per-team SSBs of Slack and created custom icons to match and differentiate visually. The second is URL redirecting, which I want to go into more detail, but I did [write a little bit about](https://zastrow.co/posts/2023/02/03/orion-and-finicky-browsers/) last year.

If you have not tried out a single-site browser yourself, I hope this post helps you to give them a shot. I have found them to be an invaluable aspect to my workflow and in helping keep me focused. I also love to talk about this type of thing, so feel free to hit me up on [Mastodon](https://mastodon.social/@zastrow) if you have any questions or are curious what’s the latest SSB I’ve made.
