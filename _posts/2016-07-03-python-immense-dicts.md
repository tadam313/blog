---
layout: post
title: How to tame immense json in Python
tags: ['python', 'json', 'dictionaries', 'adapter pattern']
image: /assets/images/python_dicts/magic_face.png
---

Recently my team and me encountered a problem which didn't seem very complicated at first... The goal was to simply work with and process very large JSON objects in Python. We decided not to create a heavyweight, fully fledged model object as it takes time and we probably wouldn't need every part anyway, so we sticked at the good old dictionary. This choice has started to pay off, then all the sudden the realization came with a big sigh...

## JSON magic in Python

There are many ways to represent JSON objects in python (e.g namedtuple, plain python objects or simple strings) but maybe the most obvious choice is using the `dict`. Dictionaries in python are very powerful tools to deal with schemaless data without much pain. Every JSON structure almost certainly be easily representable by dicts, as Python syntactic rules allow you to do so (just a few slight modification required). _Amazing_, truly amazing that a language other than JS supports JSON "almost natively" on a syntactic basis.

{% highlight python %}
json = {
  "key": True,
  "list": ["value1", "value2"]
}
{% endhighlight %}

That is one of the countless reason I'm a big fan of Python. BUT... (aye, there is a big but here), there are a couple of drawbacks if you have to process very large and sparse JSON objects.

## JustSomeOrdinaryNagging

First of all, you'd better forget the 'dot' object access notation. Python dicts are just key-value storage, no class-sugar. Wee inconveniency but not a game changer... quite sure we can live with squared brackets...

The other issue is more tactile, though. Imagine a huge JSON with many gaps (meaning the fields are optional, maybe there maybe not...) and you have to access some key on the nth level. What would you do? Bear in mind, fields are optional...

### Using fallback value

So probably you end up something like this:

{% highlight python %}
values = huge_json.get("field1", {}).get("field2", {})...get("fieldn")
{% endhighlight %}

![what](/assets/images/python_dicts/what_face.jpg)

Frankly... it looks terrible. Note the second argument of every intermediary calls. It really should have to be there since `get` returns `None` as a default object (if the key is missing) and you get a `TypeError`, None does not have a get... This code smells indeed... too much noise for a single value access. Moreover, it's not the whole story ... it won't even work for all cases, can you spot the bug?

...

So the second argument of the get only takes effect if the field is *missing*, what if the field is there, but null? We'd still get a `TypeError`.

### Pythonic solution

Another way to tackle this problem is the so called **EAFP** (Easier to Ask for Forgiveness than Permission) approach. This is very common amongst python programmers, almost a _de-facto_ principle.

{% highlight python %}
try:
  values = huge_json["field1"]["field2"]...["fieldn"]
except KeyError:
  values = None
{% endhighlight %}

Definitely an improvement over the previous approach, feel free to use it, in a small scale it'd do, no doubt. The big advantage is the explicitness, like reading an english sentence. However I still think there is a room for improvement... I appreciate it's really straightforward and -- in many ways --  a pythonic solution but at the same time a bit verbose for my taste. Handling the `KeyError` may completely unrelated and could be undesired, moreover repeating it dozens of time can introduce another code smell. So what can we do about it?

## Adapter pattern FTW

As for the majority of software design problems, the answer is, of course, wrapping. Let's figure out your dream interface to access a certain JSON data in Python and then make it happen by converting the dict interface to your particular one. This is the exact definition of the adapter pattern.

> The Adapter design pattern allows otherwise incompatible classes to work together by converting the interface of one class into an interface expected by the clients. (source: [wikipedia](https://en.wikipedia.org/wiki/Adapter_pattern))

For a dictionary adapter, I'd certainly use a `defaultdict` which provides you the functionality of the aforementioned `get` method out of the box (just have to specify in the constructor what object should it return) to make it even simpler. Moreover, I'll expose some important data as a property using the python property decorator. But the choice is yours, as the whole fuss is about to conceal the nasty implementational details, you can do whatever you want under the hood, as long as it provides the expected interface.

Here is my very simple dict adapter:

{% gist tadam313/d8be41f092be6d8351b1834538e0c168 %}

_Note_: I removed priorly every `None` or empty objects, since `defaultdict` will cover both scenario, but it may depend on the usage...

The first question may come to your mind is *why we need all these Python magic methods here?*.

![magic](/assets/images/python_dicts/magic_face.png)

Well the sole purpose of them is to keep this adapter a *dict-like* entity. This brings real benefit if you have an existing codebase and you have to make something backward compatible. This way you don't have to touch the previously created bits of the code, this adapter completely substitutes dicts. At the same time, you're given a chance to improve the newly coming code quality and maintainability with this new toy in the inventory.

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
