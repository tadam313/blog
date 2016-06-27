---
layout: post
title: How to tame immense json dicts
tags: ["python", "json", "dictionaries", "adapter pattern"]
---

Recently my team and me encountered a problem which didn't seem very severe, however -- as always -- if you spend some time on it digging deeper, you'd now, you are wrong. The goal was to simply work with and process very large JSON objects in Python. We decided not to create a heavyweight, fully fledged model object as it takes time and we probably wouldn't need every bit of that anyway, so we sticked at good old `dict`. This choice has started to pay off, then all the sudden the realization came with a big sigh...

## JSON magic in Python

There are many ways to represent JSON objects in python (e.g namedtuple, plain python objects or simple strings) but maybe the most obvious choice is using the `dict`. Dictionaries in python are very powerful tools to deal with schemaless data without much pain. Every JSON structure almost certainly be easily representable by dicts, as Python syntactic rules allow you to do so (just a few slight modification required). _Amazing_, truly amazing that a language other than JS supports JSON "natively" on a syntactic basis. *For the record: as far as I know you just have to change null -> None and booleans to start with capital letter to make a pythonic object tree*

{% highlight python %}

json = {
  "key": True,
  "list": ["value1", "value2"]
}

{% endhighlight %}

That is one of the countless reason I'm a big fan of Python. BUT... (aye, there is a big but here), there are a couple of drawbacks if you have to process very large and sparse JSON objects.

## JustSomeOrdinaryNagging

First of all, you'd better forget the 'dot' object access notation. While JSON objects in Javascript are actually real native objects declaration (and definition at the same time), in Python dicts are just key-value storage, no class-sugar there. Wee inconveniency but not a game changer... quite sure we can live with squared brackets...

The other issue is more tactile, though. Imagine a huge JSON with many gaps (meaning the fields are optional, maybe there maybe not...) and you have to access some key on the nth level. What would you do? Bear in mind, fields are optional... So probably you end up something like this:

{% highlight python %}

values = huge_json.get("field1", {}).get("field2", {})...get("fieldn")

{% endhighlight %}

![what](/assets/images/python_dicts/what_face.jpg)

Frankly... it looks terrible. Note the second argument of every intermediary calls. It really should have to be there since `get` returns `None` as a default object (if the key is missing) and you get a `TypeError`, None does not have a get... This code smells indeed... too much noise for a single value access. Moreover, it's not the whole story ... it won't even work for all cases, can you spot the bug?

So the second argument of the get only takes effect if the field is *missing*, what if the field is there, but null? We'd still get a `TypeError`. It's unacceptable we gotta do something about this...

## Adapter pattern FTW

As for the majority of software design problems, the answer is, of course, wrapping. Let's figure out your dream interface to access a certain JSON data in Python and then make it happen by converting the dict interface to your particular one. This is the exact definition of the adapter pattern.

> The Adapter design pattern allows otherwise incompatible classes to work together by converting the interface of one class into an interface expected by the clients. (source: [wikipedia](https://en.wikipedia.org/wiki/Adapter_pattern))

For a dictionary adapter, I'd certainly use a `defaultdict` which provides you the functionality of the aforementioned `get` method out of the box (just have to specify in the constructor what object should it return) to make it even simpler. Moreover, I'll expose some important data as a property using the python property decorator. But the choice is yours, as the whole fuss is about to conceal the nasty implementational details, you can do whatever you want under the hood, as long as it provides the expected interface.

Here is my simple dict adapter:

{% gist tadam313/d8be41f092be6d8351b1834538e0c168 %}

As you see, I didn't really want to bother with `None` or empty dicts, since using defaultdict the result will be the same anyway, no matter whether the data there but empty or completely missing, it's all the same. (as long as you keep certain conventions, see the disclaimer below). Again it might depend on your usage, if you're checking for key existence then it holds information whether the key is there or not. In this scenario I'd probably ask myself, do I really should do this way instead of using `set` for instance. If you really can't, fine, but then you'd need to handle the scenario I mentioned above, if the key is there, but `None`. That won't be a big hassle after all if you stick with the property decorators and hide every ugly logic.

The first question may come to your mind is *why we need all these Python magic methods here?*.

![magic](/assets/images/python_dicts/magic_face.png)

Well, you can leave those out if you want, the sole purpose of them is to keep this adapter a *dict-like* entity. This brings real benefit if you have an existing codebase and you have to make something backward compatible. This way you don't have to touch the previously created bits of the code, this adapter completely substitutes dicts. At the same time, you're given a chance to improve the newly coming code quality and maintainability with this new toy in the inventory.

*Sidenote: this solution still requires some convention to follow. If you're accessing primitive values (str, int, float, etc...) you'd better use `get` method, otherwise you may find yourself in unexpected situations. Why? Well, the default value for the underlying `defaultdict` is another `defaultdict` and so on so forth. What it means basically if any of the keys are not found, you'll get a `defaultdict`, which is not what you'd expect if you're searching for primitive values.*

{% highlight python %}

JsonObject({})["test"].startswith("test")

Traceback (most recent call last):
...
    JsonObject({})["test"].startswith("test")
AttributeError: 'collections.defaultdict' object has no attribute 'startswith'

{% endhighlight %}

*By using `get` it returns `None` which is probably more adapted pattern to indicate existence.*

Happy coding everyone!