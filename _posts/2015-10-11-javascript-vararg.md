---
layout: post
title: The myth of variable arguments
tags: ["javascript", "functions", "overloading", "ES6", "clean code"]
related_posts: ["http://ejohn.org/blog/javascript-method-overloading"]
---

Recently I run into many troubles when I tried to deal with variable arguments in javascript. I decided to write a post about it to demonstrate my problems and possible solutions. Start with the beginning, as you probably know javascript is a dynamic language and very permissive with functions. We declare thoose and simply use, easy enough. Not even required to invoke them with as many arguments as we declared. *Wait...* ooh-ooh here comes the problem.

## The problem

Let's me demonstrate the issue with a simple function declaration...

~~~ javascript
function makeCoffee(type, strength, milk, sugar) {
  // ...
}
~~~

Really simple, isn't it? The purpose is pretty obvious, it is the API of that hyper fancy programmable coffee machine robot which we are going to create. Invoking this function orders the robot to make a coffee and serve us without leaving the desk. (awesome, I definitely need one). OK probably no one wants to read a detailed documentation about this function, just use it. We really shouldn't design the API half-baked otherwise no-one will use it and we all know the consequences of caffeine dearth.

![freak_owl](/assets/images/varargs/freak_owl_meme.jpg)

Let's see some use case:

~~~ javascript
// I want a strong espresso with milk but no sugar
coffee = makeCoffe('espresso', 'strong', true);

// I want a latte with sugar
/ hmm strength and sugar were not specified
coffee = makeCoffe('latte', null, false, true);

// maybe it would work this way too
coffee = makeCoffe('latte', true);
~~~

Have a look at the last call. It is a quite valid expectation from such an API to define more than one reasonable variation for a single action. We call this kind of variation a **method signature**.

What is a method signature? Keep it simple: this is the declaration of a function, it should define four things:

* *arguments* and *types*
* *return value*
* method visibility *scope* (private, public, protected)
* possible *exception* that could occur during the function.

In Javascript, the signature is not really informative. The problem is that this definition might deceive us. At the first glance seems it declares argument names and order, however, this is really not true. We cannot even infer the argument order only from the pure declaration. What if we call this function with a different number of arguments? The rest will be `undefined`, ok, but what if we try to *overload* this function and need to have a different argument order for the different variation of the function. When we wanted to have a `'latte'` with sugar we don't want to specify any more information since that will be just a confusing noise in the code. So how are we going to overload functions in Javascript? :)

~~~ javascript
function makeCoffe(type, strength, milk, sugar) {
  if (arguments.length === 2) {
    // ohh different signature, reorder the arguments
    sugar = strength;
    // more safe but more ugly
    arguments[3] = arguments[1];
  }
  // ...
  setStrength(strength);
  // ...
}
~~~

![surprise](/assets/images/varargs/surprise_meme.jpg)

*Done...* wait, wuuut, any problem? **TONS**. First, can you spot the bug in the code? We assigned `strength` value to `sugar` since it holds the sugar value that was the second in the argument list, but we forget to clear that, still holds the sugar value. *Awww...* kernel panic occurred, the robot doesn't know anything about coffee type `true`. *Wait...* we could easily avoid this problem by using `arguments` variable itself which holds every parameters value by order and it is an array-like object ([not real array!!](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)). *Problem solved...* not so fast we have lost argument names. There is no real reason anymore to use arguments if we had an object holding every of them. *Sigh...* not so nice, and what about IntelliSense?

The main problem originates from the fact that we are trying to identify the specific function variation based on arguments in runtime! We should really look for some kind of declarative approach...

## The remedy

We could still do something about it. I created a gist to demonstrate my idea. It allows us to bind a single argument to its default order in the declaration no matter how many arguments we pass in at invocation. This way we don't have to inspect arguments anymore just use the values as usual.

{% gist tadam313/997b561edf4bbc1e3b86 %}

## How ES6 could save us all

Before this post is over I need to mention a new feature from ES6 which could completely replace my solution: *Destructuring Assignment*. Clarification is out of scope now, but you can read more about it [here](http://es6-features.org/#ParameterContextMatching){:target="blank"}. Using this solution you can write something like:

~~~ javascript
function makeCoffe({ type = 'latte', strength = 'mild', milk, sugar }) {
  // ...
  setType(type);
  setStrength(strength);
  // ...
}

makeCoffee({ type: 'espresso', milk: true });
~~~

This is actually awesome and resembles named arguments in many ways. I definitely recommend using this in ES6 projects, but for every other just grab mine. MIT licence, enjoy! :)