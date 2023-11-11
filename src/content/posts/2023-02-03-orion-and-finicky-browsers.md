---
author:
  display_name: zastrow
  email: philip@zastrow.co
  first_name: Philip
  last_name: Zastrow
  login: zastrow
categories:
  - Writing
tags:
  - Writing
date: "2023-02-03T13:15:00Z"
published: true
status: publish
title: 'Orion and Finicky Browsers'
type: post
aliases:
  - /2023/03/orion-and-finicky-browsers/
---

As a web developer, I have several browsers installed. My primary browser that I check my work in are Safari, Firefox, and Chrome, which I’ll refer to as the big three. These three represent the most common rendering engines (the thing that turns code into a usable website). They each have a great suite of developer tools that are mostly the same or have similar feature implemented in slightly different ways, which help me get my job done. There’s be a resurgence the last several years in new browsers, and the majority of these browsers use one of big three’s rendering engines and then they build their own experience around additional features, like plugins, viewing modes, etc.

While I primarily do my work in the big three, I like to try out new browser regularly for my personal use, like browsing, reading, and such. Lately, that browser has been [Orion](https://browser.kagi.com) by [Kagi](https://kagi.com), which is search engine. Orion brings together all of the big three into one browser, where it uses Safari’s WebKit rendering engine, and then supports extensions from both Chrome and Firefox. In addition it’s overall aesthetic is very Safari-life, including its implementation of features such as Reader Mode, Tab Groups, and even how it handles Tab management.

What I’ve really come to love is a feature called Focus Mode. The new view removes all the browser user interface elements, leaving a window that only contains the webpage. I’ve found this view to be really handy for presenting my [reveal.js slide decks](https://revealjs.com), viewing online photo albums, or reading a well-designed site.

While I can keep talking about how nice Orion, is I have to be truthful, my default browser is actually [Finicky](https://github.com/johnste/finicky), and it neither renders websites nor actually has windowing. Instead it’s rerouter app that takes all the web URLs on my machine and then distributes them among my various browser via a JSON config file. With Finicky, I have Google Docs open up in Google Chrome, `localhost`, `127.0.0.1`, and `0.0.0.0` open up in Firefox by default, and then all other URLs head to Orion. This way I don’t have to think about which browser I’m opening a URL in, Finicky can handle the context and open the correct browser.

What’s more, I use the [Safirechrome workflow](https://www.packal.org/workflow/safirechrome) with [Alfred](https://alfred.app) so that while in Firefox, I can hit my [Hyper Key](https://brettterpstra.com/2017/06/15/a-hyper-key-with-karabiner-elements-full-instructions/) + <kbd>O</kbd> to open the current URL in either Safari or Chrome to continue development or debugging work.

I love trying out new browsers and with Finicky and Alfred and I don’t have choose a normal default browser, instead I can set which browser I want to use for the appropriate task.
