// Autolog.js v0.0.6
// Copyright (c) 2013 Gary S. Weaver, released under the MIT license.
// https://github.com/garysweaver/autolog.js

var Autolog = (function () {
  
  var _running = false,
      _includeFunctionBodies = false,
      _includeCallerLocation = true,
      _includeCallStack = false;

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

    if (!_includeFunctionBodies) {
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

  var _functionPrototypeCallOriginal = Function.prototype.call;
  var _functionPrototypeCallOverride = function (self) {
    try {
      var obj = typeof self === 'string' ? '"' + self + '"' : self,
          functionName = (typeof this === 'function') ? getFunctionName(this) : this,
          line = obj + '.' + functionName + ' (',
          wrapper = null; 
      
      for (var i = 1; i < arguments.length; i++) {
        wrapper = (typeof arguments[i] === 'string' ? '"' : '');
        line += (i > 1 ? ', ' : '') + '(' + (typeof arguments[i]) + ')' + wrapper + cleanValue(arguments[i]) + wrapper;
      }

      line += ')';

      if (_includeCallerLocation || _includeCallStack) {
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

            for (var i = 0, len = messageLines.length; i < len; i++) {
              var thisLine = messageLines[i];
              thisLine = thisLine.trim();

              if (thisLine.indexOf('autolog.js') == -1 &&
                   (thisLine.indexOf('ine ') > -1 ||
                    thisLine.indexOf('unction') > -1 ||
                    thisLine.indexOf('at ') > -1 ||
                    thisLine.indexOf('eval ') > -1 ||
                    (thisLine.indexOf('@') > -1 && thisLine.indexOf(':') > -1))) {
                if (_includeCallerLocation && !gotSource) {
                  line += '  source: ' + thisLine;
                  gotSource = true;
                }
                
                if (_includeCallStack) {
                  cleanStack += "\n " + thisLine;
                }
                else {
                  break;
                }
              }
            }

            if (_includeCallStack && cleanStack) {
              line += '  callStack: ' + cleanStack;
            }
          }
        }

        console.log(line); 
      }
    } catch (logfail) {
      if (typeof console !== 'undefined') {
        console.log("Autolog.js failure: " + logfail);
      }
    }

    return this.apply(self, arguments);
  };

  return {
    VERSION:'0.0.5',
    on:function(){Function.prototype.call = _functionPrototypeCallOverride;},
    off:function(){Function.prototype.call = _functionPrototypeCallOriginal;},
    includeFunctionBodies:function(val){_includeFunctionBodies = val;},
    includeCallerLocation:function(val){_includeCallerLocation = val;},
    includeCallStack:function(val){_includeCallStack = val;}
  }

})();
