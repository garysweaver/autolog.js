Autolog.js
=====

Logs Function.prototype.call executions to console.log, with caller stack line or full caller stack, with optionally elipsized function bodies.

This allows you see what is going on to a limited extent as Javascript is executed, similar to a trace log to console.

Example output in Chrome's JavaScript Console:

    [object NamedNodeMap].toString ()  source: at isArrayLike (http://example.org/assets/angular.js?body=1:39:83) 
    undefined.anonymous ((object)[object Attr], (number)0)  source: at forEach (http://example.org/assets/angular.js?body=1:55:20)
    undefined.anonymous ((object)$compile,$parse,function ($compile, $parse) {...}, (string)"select")  source: at forEach (http://example.org/assets/angular.js?body=1:59:22)

Original direction came from this [answer][answer] from HBP on StackOverflow.

Submit a pull request if you'd like to clean it up, extend it, fix it, make it available to npm/node, bower, etc.

### Usage

To turn on:

    Autolog.on();

To turn off:

    Autolog.off();

### Configuration

    Autolog.includeCallerLocation(true);
    Autolog.includeCallStack(false);
    Autolog.includeFunctionBodies(false);

### License

Copyright (c) 2013 Gary S. Weaver, released under the [MIT license][lic].

[answer]: http://stackoverflow.com/a/5244434/178651
[lic]: http://github.com/garysweaver/autolog.js/blob/master/LICENSE
