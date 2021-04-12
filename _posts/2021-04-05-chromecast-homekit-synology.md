---
layout: post
title: Chromecast to homekit with Synology
tags: ['smart home', 'chromecast', 'homekit', 'synology']
---

I've been using homekit for quite a while now and I have to say, accessory/manufacturer coverage isn't the best... Luckily there is this wonderful open source project called [homebridge](https://homebridge.io/) which lets you connect unsupported devices to homekit ecosystem. I'm running homebridge on a Synology NAS - DS118 currently. I'm planning to share some details of this setup at later posts for now I'm focusing on Chromecast integration with homebridge.

![homekit](/assets/images/hb-chromecast/homekit-logo.png)

Synology DSM (the os of NAS) is a custom Linux port which means many libraries/binaries are missing or replaced, which complicate homebridge hosting. Multiple workarounds exist to mitigate this problem like using Docker or a Debian chroot replacing the Core Synology OS. None of them enlightened me since DS118 does not support Docker and chrooting seemed like too much hassle (performance-wise as well). I decided to do the "native approach".

To add Chromecast to homebridge I found a great plugin [homebridge-chromecast-television](https://www.npmjs.com/package/homebridge-chromecast-television) which adds Chromecast as a TV accessory (you can turn it off -> stop streaming, turn it on -> start streaming), it's a good start. Chromecast is using a discovery protocol called multicast DNS (aka Bonjour) which are not supported on Linux distros out of the box. In node js world an npm package [mdns](https://www.npmjs.com/package/mdns) doing this job which in turn using a native C extension lib which is called *libavahi-compat-libdnssd-dev* on debianesque systems.

Unfortunately, this package is not available for DSM (but it's indeed available for Debian, hence chrooting is the simpler way here), however, we can build the original version of [mDNSResponder](https://opensource.apple.com/tarballs/mDNSResponder/) created by Apple. It provides a POSIX version of this and DSM supports POSIX, which's promising. Missing ingredients are: *gcc* / *ldconfig* and *make* to compile this code and use the dynamic libraries. All of them can be installed using entware, which is a predecessor of [optware](https://en.wikipedia.org/wiki/Optware). Entware is an embedded OS package repository, today run mostly by the community with a vast selection of software packages. After getting entware, we can install these packages using `opkg install gcc / make ... etc` commands.

Now we can start compiling mDNSResponder/mDNSPosix folder using `make`. Good first attempt but it will fail unfortunatelly since by default it's trying to look for `cc` not `gcc`. By checking the make file it's driven by an env var so we can get around this using `CC=gcc make`... It still failing :cry: but not to worry this time it's complaining about missing `man` folders, let's create them (not that we'll use these man files often :smile:). Okay finally it's working, the following things should have happened:

* `dns_sd.h` copied to `/opt/lib` (header file used by mdns clients)
* `libdns_sd.so` copied to `/opt/lib`
* `libdns` manuals copied to `/usr/share/man/man8`
* `mdnsd` copied to `/opt/bin` (mdns daemon)
* `mdnsd.sh` copied to `/etc/init` (to start mdns daemon)
* `dns-sd` client installed to `/opt/bin` (cli client for mdns resolution / service registration)

At this point important to make sure that `/etc/nsswitc.conf` file has `mdns` before `dns` included for hostname. This instructs the system to use mdns lookup before the regular `dns` lookup takes place.

mDNS had a daemon-based address resolution, thus clients interact with a daemon, which is called mdnsd. We need to start it using `mdns.sh start` before attempting to do any discovery or address resolution. You can also stop it using `mdns.sh stop`.

{% highlight bash %}
passwd:     files
shadow:     files
group:      files
hosts:      files mdns dns
bootparams: files
{% endhighlight %}

Let's test this flow by doing `ping something.local`. It should say `Name or service not known` instead of `System error` as the former indicates that mdns resolution was indeed used to resolve the hostname but we could not do it as no such device exists in our network. That means mdns is set up on DSM! Yeah. Let's install `homebridge-chromecast-television` now. If you got any kind of error during installation which is related to node-gyp compilation then something must have still missing for mdns setup, please take another look.

Please refer to the documentation on how to include the package in homebridge, should be straightforward. Let's run it. Ouch... Something does not add up, you probably get an error something like this:

{% highlight javascript %}
{"code":-3008,"errno":-3008,"syscall":"getaddrinfo"}
{% endhighlight %}

![yoda](/assets/images/hb-chromecast/sad-yoda.jpg)

It's a tough one, it took me hours to figure out. It happens because `mdns` package uses nodeJS own implementation of address resolution, as the libavahi compat package does not provide one (called `DNSServiceGetAddrInfo`). Unfortunately, this implementation does not work on DSM (not quite sure why I have not investigated this further probably has something to do with missing V8 libs). However here we are not *libavahi* library here and the original Apple one that we've just compiled does have this resolution function, so we should try to make this package use it. This flag defined in the package `binding.gyp` let's find it inside the `node_module` folder, so it's something like: `.../node_modules/homebridge-chromecast-television/node_modules/mdns/binding.gyp`. This file instructs node-gyp (native addon compiler for node-js) how to compile C++ nodeJS bindings. The flag is called `HAVE_DNSSERVICEGETADDRINFO` and it's conditionally defined for macOS and Windows compilation, let's define it generally. Once it's done the compiled code would rely on libdns address resolution implementation instead of the one provided by Node. Now, we should recompile it using `node-gyp rebuild` command. Once that's done we're finally ready and roll ;)

![chromecast-homekit](/assets/images/hb-chromecast/chromecast.jpg)

_Note_: this is not a sustainable solution as every new npm install would break the flow, I already [contacted](https://github.com/agnat/node_mdns/issues/250) the mdns package author to figure out a solution.
