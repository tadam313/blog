---
layout: post
title: Taste of mobile engineering
tags: ['mobile engineering', 'react native', 'Skyscanner']
image: /assets/images/art-of-simplicity/simple-vs-complex.jpg
---

Let's start with some facts, I do believe every company at some point starting to realize, they have to seriously consider mobile as a primary first-class citizen amongst the client software. This exact transition happened with Skyscanner as well not so long ago and we shifted our client efforts to the native mobile application. Ok but *wait...*, how can a company at this size from previous web background make such a move? Obviously, there had to be some middle ground, we had to find an incremental way to facilitate this effort to everyone not to be that daunting. Ok, so what had happened exactly? *React Native* happened :)

RN is super popular at this time, almost every company took on the train of promises. Promises of single codebase __write once run everywhere__, so we thought qhat could go wrong here? *Well...* we have spent almost a year with RN and we do believe it's a bit more like __learn once and write everywhere__. Don't get me wrong I totally believe single codebase for both platforms is entirely feasible, it's just *super hard*. That super hard, that the benefits probably don't justify doing it. So most of the time we ended up tailoring the code for both platforms especially the UI parts, for which the guidelines are different anyways. Oh and not to mention the setup when you need to integrate all this into an existing native codebase: so-called *"brownfield"* situation. I gave a talk about this in the NSBudapest meetup series.

<iframe src="//slides.com/tadam313/skyscanner-react-native/embed" width="576" height="420" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

This was an interesting and bumpy ride for us with so many problems to analyze and solve in many creative ways. Since I like challenges I definitely enjoyed the journey, however, I would not start it again. Nowadays Skyscanner does not actively invest a lot in React Native, more like maintain existing codebase and tweak them a little bit, new features preferred to be built in native. The reasons are very similar that [airbnb had](https://medium.com/airbnb-engineering/sunsetting-react-native-1868ba28e30a), we noticed the velocity of feature development with RN might not be less but sometimes more than building it twice on both platforms with ever-evolving native tools.

If you are interested in more reading materials about RN usage @ Skyscanner please take a look at this from my colleauge: [Testing RN bridges](https://medium.com/@SkyscannerEng/testing-react-native-ios-bridges-80c730659a83)
