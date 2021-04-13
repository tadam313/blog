---
layout: post
title: Art of simplicity
tags: ['software_development', 'simplicity', 'complexity', 'project']
image: /assets/images/art-of-simplicity/simple-vs-complex.jpg
---

Every software project is complex or at least become complex after a while. This is -- let's say -- *expected* nowadays, since the usual requirements have blown up significantly (monitoring+alerting, real-time analytics, a\b testing etc...). No wonder... this is an awfull lot, which turns the codebase a big complex strand. Is there any way to keep things simple within this tangled web though? Let's see what we can do...

## Why simplicity?
Although it seems naturally obvious why we should thrive for simplicity it might worth an explanation. These days users are getting more and more tech in their lives, they naturally start questioning and mistrusting software systems. I've heard many times "it's too simple to be secure and reliable", somehow we tend to associate complexity with adequate software. This is a huge misconception that everyone should forget **ASAP**. In reality, complexity is only exposing maintenance burden to software projects and accelerate the rotting effect [^1]. Simplicity, in fact, can enable the team to iterate quicker and fix bugs more effectively.

![simple-vs-complex](/assets/images/art-of-simplicity/simple-vs-complex.jpg)

However not to confuse *simple* with *simplistic*. These are entirely different concepts, simple is not simplistic or poor. A software system is simple when it's obvious, elegant, does what it supposed to do and make sense to everyone. Meeting all these criteria is actually harder than produce a complex system. As Crockford said during one of his talk

> It's not hard to make something complicated but hard to make it sufficiently simple. - Douglas Crockford

## Iterative design
This is nice so far, but how do we achieve this after all? The only thing we need to do is not trying to do everything at once. We should narrow down our focus to a single task and ignore everything else, only work on the features *that we know* we need. This approach is called *iterative design*. I like this a lot, I think it generally helps to achieve the beautiful design.

So when we start a project we have a user story, let's start to design a system which satisfies our needs for that scope. Not less and not more, ignore logging, reporting, analytics, localisation, they don't matter now. Great, next sprint we have another story, let's change our design a bit, to work for the first and second stories, that's all for now. Continue this approach until the point when so-called *breakthrough* happens. This is the exact moment when we realized *x* stories (varies team by team, project by project) and finally we see the insight, the connection between the features to create a very nice abstraction. This is considered, a design milestone for the system which is reusable, shareable amongst teams etc. *Wait...* what happens if it turns out the abstraction is still not good enough... Let's start the process again, it's never-ending, the system is improving all the time.

![iterative_design](/assets/images/art-of-simplicity/iterative_design.gif)
*breakthrough in connection with value/refactoring [^2]*

One final question to ask: is this a guarantee to achieve simplicity? No, it's not... However, it *helps* you on the path by reducing the scope and keep your mind clear, keep all the things away that you don't need. No one can solve anything at once it's simple impossible. Less is more, one of my reminder of that:

> Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away - Antoine de Saint-Exupery

To recap iterative design, what we do is deferring the creation of an abstract design as much as we can, until we know enough to create that. Thus we can avoid rewriting the same components over and over again due to previously made wrong assumptions. This is an agile design method by the way which plays nicely with "maximizing the work not done" idea. Essentially that's what this is all about. Also, we're delivering user values from day 1, win-win situation.

## Refactoring FTW
Refactoring is an absolute must when we do design iteratively. None of the components are finalized, they are continuously evolving to realize the design. However, this lifeline can not be done without refactoring and changing them ever so often. Which means we need to touch existing parts of the system and change them. Adopting other agile techniques like **DRY** can make this process simpler and less painful to do.

![refactor](/assets/images/art-of-simplicity/refactor.jpg)

Another issue I experienced about refactoring is the product/engineering team communication. When a component "is working" that does not mean the team will never touch it ever again and can cross it on the list. This is always the source of confusion. Everyone must be on the same page and should accept the ever-evolving nature of iteratively designed software systems.

## Final thoughts
So why I'm writing about this, where does it come from? Well... I'm a huge fan of simplicity and I truly think it helps to achieve great and quality software. However, in practice I usually find it unexpectedly difficult to follow. This is probably due to the fact every person is different and *simple* is a subjective measurement, it means different things to every individual. Good communication and regular design reviews can help to overcome these difficulties and put everyone on the saem page.

Happy coding, and don't forge to *kiss - keep it simple stupid*.

[^1]: the phenomenon causing softwares to misbehave and degrade performance over time. Several factors can contribute (changing environments, dependencies not updates, memory leaks etc...). [More here](https://en.wikipedia.org/wiki/Software_rot).

[^2]: figure from [The Art of Agile development](http://www.jamesshore.com/Agile-Book) book - James Shore
