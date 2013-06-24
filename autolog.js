// Autolog.js v0.0.2
// Copyright (c) 2013 Gary S. Weaver, released under the MIT license.
// https://github.com/garysweaver/autolog.js

var Autolog = (function () {
  
  var _running = false,
      _includeFunctionBodies = false,
      _includeCallerLocation = true,
      _includeCallStack = false;

  return {
    VERSION:'0.0.2',
    on:function(){_running = true;},
    off:function(){_running = false;},
    running:function(){return _running;},
    includeFunctionBodies:function(val){_includeFunctionBodies = val;},
    getIncludeFunctionBodies:function(){return _includeFunctionBodies;},
    includeCallerLocation:function(val){_includeCallerLocation = val;},
    getIncludeCallerLocation:function(){return _includeCallerLocation;},
    includeCallStack:function(val){_includeCallStack = val;},
    getIncludeCallStack:function(){return _includeCallStack;}
  }

})();


(function () {

  function getFunctionName(f) {

    if (f) {

      var name = f.toString().substr(9);
      name = name.substr(0, name.indexOf('('));

      if (name) {
        return name;
      }
      else {
        return 'anonymous';
      }
    } else {
      return 'null';
    }
  }

  function cleanValue(val) {

    var valStr = '' + val;

    if (!Autolog.getIncludeFunctionBodies()) {

      var result = '',
          braceDepth = 0;

      for (var i = 0, len = valStr.length; i < len; i++) {
        var c = valStr[i];

        //TODO: need to take quotes and escaped characters into account
        if (c == '}') {
          --braceDepth;
        }

        if (braceDepth == 0) {
          if (c == '}') {
            result += '...';
          }

          result += c;
        }

        if (c == '{') {
          ++braceDepth;
        }
      }

      return result;
    }

    return valStr;
  }

  Function.prototype.call = function (self) {

    try {
      if (Autolog.running()) {
        var obj = typeof self === 'string' ? '"' + self + '"' : self,
            functionName = (typeof this === 'function') ? getFunctionName(this) : this,
            line = obj + '.' + functionName + ' (',
            wrapper = null; 
        
        for (var i = 1; i < arguments.length; i++) {
          wrapper = (typeof arguments[i] === 'string' ? '"' : '');
          line += (i > 1 ? ', ' : '') + '(' + (typeof arguments[i]) + ')' + wrapper + cleanValue(arguments[i]) + wrapper;
        }

        line += ')';

        if (Autolog.getIncludeCallerLocation() || Autolog.getIncludeCallStack()) {
          try {
            throw new Error();
          }
          catch (ex) {
            var gotSource = false,
                cleanStack = '',
                messageLines = '',
                stackData = (ex.stack || ex.stacktrace || ex.message);
            
            if (stackData) {
              messageLines = stackData.toString().split("\n");
            }
            else {
              console.log("Autolog.js can't get call stack (ex.stack || ex.stacktrace || ex.message) was not truthy.");
            }

            for (var i = 0, len = messageLines.length; i < len; i++) {
              var thisLine = messageLines[i];
              thisLine = thisLine.trim();

              if (thisLine.indexOf('autolog.js') == -1 &&
                   (thisLine.indexOf('ine ') > -1 ||
                    thisLine.indexOf('unction') > -1 ||
                    thisLine.indexOf('at ') > -1 ||
                    thisLine.indexOf('eval ') > -1 ||
                    (thisLine.indexOf('@') > -1 && thisLine.indexOf(':') > -1))) {
                if (Autolog.getIncludeCallerLocation() && !gotSource) {
                  line += '  source: ' + thisLine;
                  gotSource = true;
                }
                
                if (Autolog.getIncludeCallStack()) {
                  cleanStack += "\n " + thisLine;
                }
                else {
                  break;
                }
              }
            }

            if (Autolog.getIncludeCallStack() && cleanStack) {
              line += '  callStack: ' + cleanStack;
            }
          }
        }

        console.log(line); 
      }
    } catch (logfail) {
      if (typeof console !== 'undefined') {
        console.log("autolog failure: " + logfail);
      }
    }

    if (arguments.length > 0) {
      // from http://stackoverflow.com/a/5244434
      return this.apply(self, Array.prototype.slice.apply(arguments, [1]));
    }
    else {
      return this.apply(self, Array.prototype.slice.apply(arguments));
    }
  }
})();
