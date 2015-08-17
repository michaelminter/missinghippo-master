## About

> Sinatra is a DSL for quickly creating web applications in Ruby with minimal effort:

This application is a boilerplate mixture of Sinatra DSL readied with latest front-end framework <a href="http://twitter.github.io/bootstrap/" target="_blank" alt="Twitter Bootstrap" title="Twitter Bootstrap">Twitter Bootstrap</a> and Javascript library <a href="http://jquery.com/" target="_blank" alt="jQuery" title="jQuery">jQuery</a>.

## Installation

Download repositiory

```
$ git clone git@github.com:michaelminter/sinatra-boilerplate.git --origin newprojectname
```

Change directory

```
$ cd newprojectname/
```

Create RVM environment (if <a href="http://sirupsen.com/get-started-right-with-rvm/" target="_blank" alt="Install RVM" title="Install RVM">installed</a>)

```
$ rvm --rvmrc --create 1.9.2@newprojectname
```

Confirm RVM setup

```
$ gem env gemdir
```

If you have bundler installed

```
bundle install
```

Run this application

```
$ shotgun app.rb
```

and load <http://0.0.0.0:9393> in your browser

### or

```
$ ruby app.rb
```

and load <http://0.0.0.0:4567> in your browser

> __Shotgun__ (_available in Gemfile_) will actually restart your application on every request. This has the advantage over other reloading techniques of always producing correct results. However, since it actually restarts your application, it is rather slow compared to the alternatives. Moreover, since it relies on fork, it is not available on Windows and JRuby.

