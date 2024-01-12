---
categories:
  - Writing
date: "2012-04-09T16:44:39Z"
meta: {}
published: true
status: publish
title: Issues with Dropbox on a Server
type: post
aliases:
  - /2012/04/issues-with-dropbox-on-a-server/
---
<p>I run this site using Marco Arment’s Second Crack. Great system for programming-knowledgeable folks who just want to write and not deal with some overladen CMS or Blog software like Drupal or Wordpress. My favorite feature of Second Crack is the ability to use Dropbox as an intermediary between my text editor and my website. I write in a text editor on my MacBook, iPad, or iPhone, save it in a folder on Dropbox, then Second Crack grabs the latest file marked to publish and creates the HTML on my site.</p>
<h3 id="simple-but-this-is-where-the-problems-began">Simple. But, this is where the problems began.</h3>
<p>I received an email last night from my host stating that I was in breech of the Terms of Service. Their reasoning was due to Storage/Backup Constraints. Panicked, I jumped into my account to see where the issue was. I looked up storage info and discovered that my Dropbox folder was topping out at 20 gigs!</p>
<h3 id="how-in-the-world-does-a-folder-full-of-text-files-reach-20gb">How in the world does a folder full of text files reach 20GB?</h3>
<p>Well, turns out Dropbox does a bit more than its free 2GB of space. Dropbox also saves versions and allows deleted files to be recovered. A great feature, however the data is stored on your computer, or in my case the server. This has been occurring since I first launched my site with Second Crack back in January.</p>
<p>After a bit of searching I found where this mass of files were located, a hidden folder called <code class="highlighter-rouge">.dropbox.cache</code>. Therein I found over 1,300 compressed files. After manually deleting them[^2], I contacted my host and they reinstated my account.</p>
<h3 id="but-i-cant-just-go-in-and-manually-remove-these-files">But, I can’t just go in and manually remove these files.</h3>
<p>When running Second Crack with Dropbox you need a couple of Crob Jobs running. The first grabs the latest files from the Dropbox folder and copies them to your website. The second runs Dropbox. In trying to figure out the issue I came across one more Cron Job that should be running while using Second Crack, one to clear Dropbox’s cache.</p>
<p><code class="highlighter-rouge">rm -R /path/to/Dropbox/.dropbox.cache/*</code></p>
<p>This Linux script removes all files from the Dropbox cache. So far I have seen no issues in doing this, but will certainly update if I do.</p>
