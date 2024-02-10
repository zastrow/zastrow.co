---
title: The Value of Getting Lost
date: 2024-02-10T02:51:43.162Z
updated: 2024-02-10T02:48:39.869Z
preview: I used to use a method of intentionally getting lost to learn my way
  around a physical area. Today, I use a similar practice of getting lost to get
  familiar with a larger codebase, when I first start out with it. I’ll share a
  couple of approaches I take to get a deeper understanding of the architecture
  and actions of the code.
---
In the early days of my career, I worked at different local web and tech agencies that often required client meetings on-site at their location. I would pad my departure time, intending to get lost en route. I found that by getting lost within the knowable area of my client’s location, that I was able to get a more in-depth understanding of the area as a whole. Eventually, I no longer needed to leave early because I knew my way around town well enough. I apply this same strategy to familiarizing myself with a new codebase.

For the last two weeks, I’ve been doing some contract work, which means a brand-new codebase to learn my way around. To get a good idea of the architecture, I’ve been taking a few extra minutes while working a feature to explore. This has looked a couple of different ways as I have gone along, but they have both yielded a wider understanding of the project.

## Modular Way Finding

The first practice, is to follow the definition links in my text editor. I’ve been splitting my time between Nova and VS Code the last couple of weeks, and both have a feature that pressing the <kbd>⌘</kbd> and clicking on a definition in your code will take you to its source. When there is a list of `import`s at the top of the file, this can provide a quick understanding of what all is being used, and how. Furthermore, this feature works within the file to see when and where a definition is called in context.

## Console Log Landmarks

My second practice is to create a bunch of `console.log`s in the JS, especially within conditionals and other functions. I’m not as interested in what all each conditional and function does, but when they are activated from within the browser. You may prefer to use the `debugger` for such a task; however, I find that takes too deep a look at what I’m aiming to do. I can go through the files I’m working with and set a bunch of `console.log`s before I get to my task. Then as I am working, different logs will pop up in the console as I work, and I start to understand what initiates a function to be called.


## Conclusion

Modular way finding reminds me of how, after a client meeting, I would wander on my way home. I’d see how far a major road would go, or keep an eye out for familiar road names. On the other hand, creating several logs is similar to how I would turn on random roads that might lead me to different neighborhoods. While driving, I’d suddenly see a landmark I recognized and my brain would connect my current location to where I had come from.

Setting up rules and guardrails, to help you get lost in your codebase, can be an effective technique to grasp a fuller picture. It’s a practice that must be intentional and done in a way that it does not occupy more than a few minutes at a time. The important thing is to make the mental connection between where you are to where you’ve been.
