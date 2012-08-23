[![build status](https://secure.travis-ci.org/kevzettler/gigdig.png)](http://travis-ci.org/kevzettler/gigdig)
GigDig
====

A node.js cli tool to recursivlly crawl a disk and find directorys that take up gigs of space. Helpful for finding stray directories that use up a lot of your hard drive. Spawns tons of `du` child processes. Probably horribly inefficent but gets the job done.

Instalation
====
requires [node.js and npm](http://nodejs.org/#download)

`sudo npm install -g gigdig`


Usage
====

```bash
$> gigdig
```



