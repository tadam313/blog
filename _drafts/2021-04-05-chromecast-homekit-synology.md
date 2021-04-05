---
layout: post
title: Adding Chromecast to homekit with Synology
tags: ['smart home', 'chromecast', 'homekit', 'synology']
---

Luckily there is this wonderfull open source project called [https://homebridge.io/](homebridge) which let's you connect unsupported devices to homekit ecosystem. I'm going to focus more on the core homebridge at later posts, for now let's stick to Chromecast integration. A Synology NAS (which I own) is a perfect candidate to run homebridge core, however there are some gotchas. which are the reason why this post exists :) Unfortunately Synology DSM (the os of NAS) is a custom linux port which means many libraries / binaries are actually missing or replaced on it. This makes running homebridge a little bit more involved task. Multipel solutions exists for this problem like using Docker or a Debian chroot replacing the Core synology OS. For me none of them really work: my model does not support docker and chroot solution for me seems to intrusive and has some downsides (e.g SSH access ...). So I decided to go down the harder route and figure out how to run this on default DSM.

To add Chromecast to homebridge I found a great plugin [homebridge-chromecast-television](https://www.npmjs.com/package/homebridge-chromecast-television) which actually adds Chromecast as a TV accessory (you can turn it off -> stop streaming, turn it on -> start streaming), it's a good start. Problem is Chromecast is using a discovery protocol called multicast DNS which are not supported by linux distros out of the box, so no hope for DSM. If we inspect package.json we'll see the node implementation of this included in [https://www.npmjs.com/package/mdns](mdns) npm package which in turn using a native C extension lib. From the README of this package:

>>> On debianesque systems the package name is libavahi-compat-libdnssd-dev, on fedoraesque systems the package is avahi-compat-libdns_sd-devel. On other platforms Apple's mDNSResponder is recommended. Care should be taken not to install more than one mDNS stack on a system.

Unfortunately avahi libavahi compat packages are not available for DSM (but it's available for Debian, hence chrooting is the simpler way here). All right so let's start build the Apple one on DSM! :) Luckily it provides a POSIX version of this and DSM supports POSIX, that's promising. Missing ingrediants here are: gcc / ldconfig / make to actually compile this code and use the dynamic libraries. All of them can be installed using entware, which is a predecessor of [https://en.wikipedia.org/wiki/Optware](optware). Entware is an embedded OS package repository today run mostly by community and you can find wide range of packages there. After integrating entware, we can install these packages using `opkg install gcc / make ... etc` commands. 

Once that's done we can start compiling mDNSResponder/mDNSPosix folder using `make`. Good first attempt but it will fail unfortunatelly since by default it's trying to look for `cc` not `gcc`. By checking the make file it's driven by an env var so we can get around this using `CC=gcc make`. 

... It still failing :( not to worry this time it's complaining about missing `man` folders, let's create them (not that we'll use these man files often :)). Okay finally it's working, the following things should have happened:

* dns_sd.h copied to /opt/lib (header file used by mdns clients)
* mdnsd.sh copied to /etc/init (to start mdns daemon)
* 

At this point it's important to make sure that /etc/nsswitc.conf file has `mdns` before `dns` included for hostname. This instructs the system to use mdns lookup before the regular `dns` lookup takes place for hostnames.

Let's test this flow by doing `ping something.local`. It should say `hostname unknown` instead of `System error` as the former indicates that mdns resolution was indeed used to resolve the hostname but we could not do it as no such device exists in our network. That means mdns is setup on DSM! Yeah. Let's install `homebridge-chromecast-television` now. If you got any kind of error during installation which is related to node-gyp compilation then something must have still missing for mdns setup, please take another look.

Please refer to documentation how to include the package in homebridge, should be straightforward. Let's run it. Ouch... Something does not add up, you probably get an error something like this:

3008...

It's a tough one, it took me hours to figure out, but don't worry it's fixable. It happens because `mdns` package (which is dependency of `homebridge-chromecast-television`) uses a custom implementation of address resolution in linux systems, as the libavahi compat package does not provide one (called `DNSServiceGetAddrInfo`). Unfortunately this does not work on DSM (not quite sure why, I have not investigated this further). However here we are not doing a standard setup here and the library we've just compiled does have this resolution function, so we should try to make this package use it. This flag defined in the package `binding.gyp` let's find it inside the `node_module` folder, so it's something like: `.../node_modules/homebridge-chromecast-television/node_modules/mdns/binding.gyp` as it's a peerdependnecy. This file instructs node-gyp (native addon compiler for node-js) how to compile the native client. The flag is called `HAVE_DNSSERVICEGETADDRINFO` and it's conditionally defined for Mac and Windows compilation, let's define it generally (outside of `conditions`). Once it's done the compiled code would rely on this native address resolution implementation instead of the one provided by the package. No we should recompile it using `node-gyp rebuild` command. Once that's done we're finally ready and roll ;)

Note: this is not a sustainable and considered a one-off hotfix. The next npm install will change peerdependency and we'll need to redo the whole monkey patch. Still trying to find a reasonable long-term solution here :)


nm $(sudo ldconfig -p | grep -Eoh '\/.+\/libdns_sd.so$') | grep DNSServiceGetAddrInfo 
