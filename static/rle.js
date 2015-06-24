// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;


// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 8;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });



/* memory initializer */ allocate([255,255,255,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
function runPostSets() {


}

var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
      return (ptr-num)|0;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_llvm_memset_p0i8_i32"] = _llvm_memset_p0i8_i32;

  
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  Module["_llvm_memcpy_p0i8_p0i8_i32"] = _llvm_memcpy_p0i8_p0i8_i32;



  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;

  function _free() {
  }
  Module["_free"] = _free;

  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  Module["_strlen"] = _strlen;

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  Module["ERRNO_CODES"] = ERRNO_CODES;
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  Module["ERRNO_MESSAGES"] = ERRNO_MESSAGES;
  
  
  var ___errno_state=0;
  Module["___errno_state"] = ___errno_state;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  Module["___setErrNo"] = ___setErrNo;
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  Module["TTY"] = TTY;
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  Module["MEMFS"] = MEMFS;
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
  
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
  
        if (!total) {
          // early out
          return callback(null);
        }
  
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
  
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
  
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
  
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat, node;
  
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
  
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
  
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
  
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  Module["IDBFS"] = IDBFS;
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  Module["NODEFS"] = NODEFS;
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  Module["_stdin"] = _stdin;
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  Module["_stdout"] = _stdout;
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  Module["_stderr"] = _stderr;
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }
  Module["_fflush"] = _fflush;var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
  
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          FS.FSNode.prototype = {};
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
  
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  Module["FS"] = FS;var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  Module["PATH"] = PATH;var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
  Module["Browser"] = Browser;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");



var FUNCTION_TABLE = [0, 0];

// EMSCRIPTEN_START_FUNCS

function _bitmap_decompress($output,$width,$height,$input,$size,$Bpp){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $rv;
 $1=$output;
 $2=$width;
 $3=$height;
 $4=$input;
 $5=$size;
 $6=$Bpp;
 $rv=0;
 var $7=$6;
 if(($7|0)==1){ label=2;break;}else if(($7|0)==2){ label=3;break;}else if(($7|0)==3){ label=4;break;}else if(($7|0)==4){ label=5;break;}else{label=6;break;}
 case 2: 
 var $9=$1;
 var $10=$2;
 var $11=$3;
 var $12=$4;
 var $13=$5;
 var $14=_bitmap_decompress1($9,$10,$11,$12,$13);
 $rv=$14;
 label=7;break;
 case 3: 
 var $16=$1;
 var $17=$2;
 var $18=$3;
 var $19=$4;
 var $20=$5;
 var $21=_bitmap_decompress2($16,$17,$18,$19,$20);
 $rv=$21;
 label=7;break;
 case 4: 
 var $23=$1;
 var $24=$2;
 var $25=$3;
 var $26=$4;
 var $27=$5;
 var $28=_bitmap_decompress3($23,$24,$25,$26,$27);
 $rv=$28;
 label=7;break;
 case 5: 
 var $30=$1;
 var $31=$2;
 var $32=$3;
 var $33=$4;
 var $34=$5;
 var $35=_bitmap_decompress4($30,$31,$32,$33,$34);
 $rv=$35;
 label=7;break;
 case 6: 
 label=7;break;
 case 7: 
 var $38=$rv;
 STACKTOP=sp;return $38;
  default: assert(0, "bad label: " + label);
 }

}
Module["_bitmap_decompress"] = _bitmap_decompress;

function _bitmap_decompress1($output,$width,$height,$input,$size){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $end;
 var $prevline;
 var $line;
 var $opcode;
 var $count;
 var $offset;
 var $isfillormix;
 var $x;
 var $lastopcode;
 var $insertmix;
 var $bicolour;
 var $code;
 var $colour1;
 var $colour2;
 var $mixmask;
 var $mask;
 var $mix;
 var $fom_mask;
 $2=$output;
 $3=$width;
 $4=$height;
 $5=$input;
 $6=$size;
 var $7=$5;
 var $8=$6;
 var $9=(($7+$8)|0);
 $end=$9;
 $prevline=0;
 $line=0;
 var $10=$3;
 $x=$10;
 $lastopcode=-1;
 $insertmix=0;
 $bicolour=0;
 $colour1=0;
 $colour2=0;
 $mask=0;
 $mix=-1;
 $fom_mask=0;
 label=2;break;
 case 2: 
 var $12=$5;
 var $13=$end;
 var $14=($12>>>0)<($13>>>0);
 if($14){label=3;break;}else{label=346;break;}
 case 3: 
 $fom_mask=0;
 var $16=$5;
 var $17=(($16+1)|0);
 $5=$17;
 var $18=HEAP8[($16)];
 $code=$18;
 var $19=$code;
 var $20=($19&255);
 var $21=$20>>4;
 $opcode=$21;
 var $22=$opcode;
 if(($22|0)==12|($22|0)==13|($22|0)==14){ label=4;break;}else if(($22|0)==15){ label=5;break;}else{label=9;break;}
 case 4: 
 var $24=$opcode;
 var $25=((($24)-(6))|0);
 $opcode=$25;
 var $26=$code;
 var $27=($26&255);
 var $28=$27&15;
 $count=$28;
 $offset=16;
 label=10;break;
 case 5: 
 var $30=$code;
 var $31=($30&255);
 var $32=$31&15;
 $opcode=$32;
 var $33=$opcode;
 var $34=($33|0)<9;
 if($34){label=6;break;}else{label=7;break;}
 case 6: 
 var $36=$5;
 var $37=(($36+1)|0);
 $5=$37;
 var $38=HEAP8[($36)];
 var $39=($38&255);
 $count=$39;
 var $40=$5;
 var $41=(($40+1)|0);
 $5=$41;
 var $42=HEAP8[($40)];
 var $43=($42&255);
 var $44=$43<<8;
 var $45=$count;
 var $46=$45|$44;
 $count=$46;
 label=8;break;
 case 7: 
 var $48=$opcode;
 var $49=($48|0)<11;
 var $50=($49?8:1);
 $count=$50;
 label=8;break;
 case 8: 
 $offset=0;
 label=10;break;
 case 9: 
 var $53=$opcode;
 var $54=$53>>1;
 $opcode=$54;
 var $55=$code;
 var $56=($55&255);
 var $57=$56&31;
 $count=$57;
 $offset=32;
 label=10;break;
 case 10: 
 var $59=$offset;
 var $60=($59|0)!=0;
 if($60){label=11;break;}else{label=22;break;}
 case 11: 
 var $62=$opcode;
 var $63=($62|0)==2;
 if($63){var $68=1;label=13;break;}else{label=12;break;}
 case 12: 
 var $65=$opcode;
 var $66=($65|0)==7;
 var $68=$66;label=13;break;
 case 13: 
 var $68;
 var $69=($68&1);
 $isfillormix=$69;
 var $70=$count;
 var $71=($70|0)==0;
 if($71){label=14;break;}else{label=18;break;}
 case 14: 
 var $73=$isfillormix;
 var $74=($73|0)!=0;
 if($74){label=15;break;}else{label=16;break;}
 case 15: 
 var $76=$5;
 var $77=(($76+1)|0);
 $5=$77;
 var $78=HEAP8[($76)];
 var $79=($78&255);
 var $80=((($79)+(1))|0);
 $count=$80;
 label=17;break;
 case 16: 
 var $82=$5;
 var $83=(($82+1)|0);
 $5=$83;
 var $84=HEAP8[($82)];
 var $85=($84&255);
 var $86=$offset;
 var $87=((($85)+($86))|0);
 $count=$87;
 label=17;break;
 case 17: 
 label=21;break;
 case 18: 
 var $90=$isfillormix;
 var $91=($90|0)!=0;
 if($91){label=19;break;}else{label=20;break;}
 case 19: 
 var $93=$count;
 var $94=$93<<3;
 $count=$94;
 label=20;break;
 case 20: 
 label=21;break;
 case 21: 
 label=22;break;
 case 22: 
 var $98=$opcode;
 switch(($98|0)){case 0:{ label=23;break;}case 8:{ label=28;break;}case 3:{ label=29;break;}case 6:case 7:{ label=30;break;}case 9:{ label=31;break;}case 10:{ label=32;break;}default:{label=33;break;}}break;
 case 23: 
 var $100=$lastopcode;
 var $101=$opcode;
 var $102=($100|0)==($101|0);
 if($102){label=24;break;}else{label=27;break;}
 case 24: 
 var $104=$x;
 var $105=$3;
 var $106=($104|0)==($105|0);
 if($106){label=25;break;}else{label=26;break;}
 case 25: 
 var $108=$prevline;
 var $109=($108|0)==0;
 if($109){label=27;break;}else{label=26;break;}
 case 26: 
 $insertmix=1;
 label=27;break;
 case 27: 
 label=33;break;
 case 28: 
 var $113=$5;
 var $114=(($113+1)|0);
 $5=$114;
 var $115=HEAP8[($113)];
 $colour1=$115;
 label=29;break;
 case 29: 
 var $117=$5;
 var $118=(($117+1)|0);
 $5=$118;
 var $119=HEAP8[($117)];
 $colour2=$119;
 label=33;break;
 case 30: 
 var $121=$5;
 var $122=(($121+1)|0);
 $5=$122;
 var $123=HEAP8[($121)];
 $mix=$123;
 var $124=$opcode;
 var $125=((($124)-(5))|0);
 $opcode=$125;
 label=33;break;
 case 31: 
 $mask=3;
 $opcode=2;
 $fom_mask=3;
 label=33;break;
 case 32: 
 $mask=5;
 $opcode=2;
 $fom_mask=5;
 label=33;break;
 case 33: 
 var $129=$opcode;
 $lastopcode=$129;
 $mixmask=0;
 label=34;break;
 case 34: 
 var $131=$count;
 var $132=($131|0)>0;
 if($132){label=35;break;}else{label=345;break;}
 case 35: 
 var $134=$x;
 var $135=$3;
 var $136=($134|0)>=($135|0);
 if($136){label=36;break;}else{label=39;break;}
 case 36: 
 var $138=$4;
 var $139=($138|0)<=0;
 if($139){label=37;break;}else{label=38;break;}
 case 37: 
 $1=0;
 label=347;break;
 case 38: 
 $x=0;
 var $142=$4;
 var $143=((($142)-(1))|0);
 $4=$143;
 var $144=$line;
 $prevline=$144;
 var $145=$2;
 var $146=$4;
 var $147=$3;
 var $148=(Math_imul($146,$147)|0);
 var $149=(($145+$148)|0);
 $line=$149;
 label=39;break;
 case 39: 
 var $151=$opcode;
 switch(($151|0)){case 3:{ label=261;break;}case 4:{ label=272;break;}case 8:{ label=283;break;}case 13:{ label=321;break;}case 14:{ label=332;break;}case 0:{ label=40;break;}case 1:{ label=69;break;}case 2:{ label=93;break;}default:{label=343;break;}}break;
 case 40: 
 var $153=$insertmix;
 var $154=($153|0)!=0;
 if($154){label=41;break;}else{label=45;break;}
 case 41: 
 var $156=$prevline;
 var $157=($156|0)==0;
 if($157){label=42;break;}else{label=43;break;}
 case 42: 
 var $159=$mix;
 var $160=$x;
 var $161=$line;
 var $162=(($161+$160)|0);
 HEAP8[($162)]=$159;
 label=44;break;
 case 43: 
 var $164=$x;
 var $165=$prevline;
 var $166=(($165+$164)|0);
 var $167=HEAP8[($166)];
 var $168=($167&255);
 var $169=$mix;
 var $170=($169&255);
 var $171=$168^$170;
 var $172=(($171)&255);
 var $173=$x;
 var $174=$line;
 var $175=(($174+$173)|0);
 HEAP8[($175)]=$172;
 label=44;break;
 case 44: 
 $insertmix=0;
 var $177=$count;
 var $178=((($177)-(1))|0);
 $count=$178;
 var $179=$x;
 var $180=((($179)+(1))|0);
 $x=$180;
 label=45;break;
 case 45: 
 var $182=$prevline;
 var $183=($182|0)==0;
 if($183){label=46;break;}else{label=57;break;}
 case 46: 
 label=47;break;
 case 47: 
 var $186=$count;
 var $187=$186&-8;
 var $188=($187|0)!=0;
 if($188){label=48;break;}else{var $195=0;label=49;break;}
 case 48: 
 var $190=$x;
 var $191=((($190)+(8))|0);
 var $192=$3;
 var $193=($191|0)<($192|0);
 var $195=$193;label=49;break;
 case 49: 
 var $195;
 if($195){label=50;break;}else{label=51;break;}
 case 50: 
 var $197=$x;
 var $198=$line;
 var $199=(($198+$197)|0);
 HEAP8[($199)]=0;
 var $200=$count;
 var $201=((($200)-(1))|0);
 $count=$201;
 var $202=$x;
 var $203=((($202)+(1))|0);
 $x=$203;
 var $204=$x;
 var $205=$line;
 var $206=(($205+$204)|0);
 HEAP8[($206)]=0;
 var $207=$count;
 var $208=((($207)-(1))|0);
 $count=$208;
 var $209=$x;
 var $210=((($209)+(1))|0);
 $x=$210;
 var $211=$x;
 var $212=$line;
 var $213=(($212+$211)|0);
 HEAP8[($213)]=0;
 var $214=$count;
 var $215=((($214)-(1))|0);
 $count=$215;
 var $216=$x;
 var $217=((($216)+(1))|0);
 $x=$217;
 var $218=$x;
 var $219=$line;
 var $220=(($219+$218)|0);
 HEAP8[($220)]=0;
 var $221=$count;
 var $222=((($221)-(1))|0);
 $count=$222;
 var $223=$x;
 var $224=((($223)+(1))|0);
 $x=$224;
 var $225=$x;
 var $226=$line;
 var $227=(($226+$225)|0);
 HEAP8[($227)]=0;
 var $228=$count;
 var $229=((($228)-(1))|0);
 $count=$229;
 var $230=$x;
 var $231=((($230)+(1))|0);
 $x=$231;
 var $232=$x;
 var $233=$line;
 var $234=(($233+$232)|0);
 HEAP8[($234)]=0;
 var $235=$count;
 var $236=((($235)-(1))|0);
 $count=$236;
 var $237=$x;
 var $238=((($237)+(1))|0);
 $x=$238;
 var $239=$x;
 var $240=$line;
 var $241=(($240+$239)|0);
 HEAP8[($241)]=0;
 var $242=$count;
 var $243=((($242)-(1))|0);
 $count=$243;
 var $244=$x;
 var $245=((($244)+(1))|0);
 $x=$245;
 var $246=$x;
 var $247=$line;
 var $248=(($247+$246)|0);
 HEAP8[($248)]=0;
 var $249=$count;
 var $250=((($249)-(1))|0);
 $count=$250;
 var $251=$x;
 var $252=((($251)+(1))|0);
 $x=$252;
 label=47;break;
 case 51: 
 label=52;break;
 case 52: 
 var $255=$count;
 var $256=($255|0)>0;
 if($256){label=53;break;}else{var $262=0;label=54;break;}
 case 53: 
 var $258=$x;
 var $259=$3;
 var $260=($258|0)<($259|0);
 var $262=$260;label=54;break;
 case 54: 
 var $262;
 if($262){label=55;break;}else{label=56;break;}
 case 55: 
 var $264=$x;
 var $265=$line;
 var $266=(($265+$264)|0);
 HEAP8[($266)]=0;
 var $267=$count;
 var $268=((($267)-(1))|0);
 $count=$268;
 var $269=$x;
 var $270=((($269)+(1))|0);
 $x=$270;
 label=52;break;
 case 56: 
 label=68;break;
 case 57: 
 label=58;break;
 case 58: 
 var $274=$count;
 var $275=$274&-8;
 var $276=($275|0)!=0;
 if($276){label=59;break;}else{var $283=0;label=60;break;}
 case 59: 
 var $278=$x;
 var $279=((($278)+(8))|0);
 var $280=$3;
 var $281=($279|0)<($280|0);
 var $283=$281;label=60;break;
 case 60: 
 var $283;
 if($283){label=61;break;}else{label=62;break;}
 case 61: 
 var $285=$x;
 var $286=$prevline;
 var $287=(($286+$285)|0);
 var $288=HEAP8[($287)];
 var $289=$x;
 var $290=$line;
 var $291=(($290+$289)|0);
 HEAP8[($291)]=$288;
 var $292=$count;
 var $293=((($292)-(1))|0);
 $count=$293;
 var $294=$x;
 var $295=((($294)+(1))|0);
 $x=$295;
 var $296=$x;
 var $297=$prevline;
 var $298=(($297+$296)|0);
 var $299=HEAP8[($298)];
 var $300=$x;
 var $301=$line;
 var $302=(($301+$300)|0);
 HEAP8[($302)]=$299;
 var $303=$count;
 var $304=((($303)-(1))|0);
 $count=$304;
 var $305=$x;
 var $306=((($305)+(1))|0);
 $x=$306;
 var $307=$x;
 var $308=$prevline;
 var $309=(($308+$307)|0);
 var $310=HEAP8[($309)];
 var $311=$x;
 var $312=$line;
 var $313=(($312+$311)|0);
 HEAP8[($313)]=$310;
 var $314=$count;
 var $315=((($314)-(1))|0);
 $count=$315;
 var $316=$x;
 var $317=((($316)+(1))|0);
 $x=$317;
 var $318=$x;
 var $319=$prevline;
 var $320=(($319+$318)|0);
 var $321=HEAP8[($320)];
 var $322=$x;
 var $323=$line;
 var $324=(($323+$322)|0);
 HEAP8[($324)]=$321;
 var $325=$count;
 var $326=((($325)-(1))|0);
 $count=$326;
 var $327=$x;
 var $328=((($327)+(1))|0);
 $x=$328;
 var $329=$x;
 var $330=$prevline;
 var $331=(($330+$329)|0);
 var $332=HEAP8[($331)];
 var $333=$x;
 var $334=$line;
 var $335=(($334+$333)|0);
 HEAP8[($335)]=$332;
 var $336=$count;
 var $337=((($336)-(1))|0);
 $count=$337;
 var $338=$x;
 var $339=((($338)+(1))|0);
 $x=$339;
 var $340=$x;
 var $341=$prevline;
 var $342=(($341+$340)|0);
 var $343=HEAP8[($342)];
 var $344=$x;
 var $345=$line;
 var $346=(($345+$344)|0);
 HEAP8[($346)]=$343;
 var $347=$count;
 var $348=((($347)-(1))|0);
 $count=$348;
 var $349=$x;
 var $350=((($349)+(1))|0);
 $x=$350;
 var $351=$x;
 var $352=$prevline;
 var $353=(($352+$351)|0);
 var $354=HEAP8[($353)];
 var $355=$x;
 var $356=$line;
 var $357=(($356+$355)|0);
 HEAP8[($357)]=$354;
 var $358=$count;
 var $359=((($358)-(1))|0);
 $count=$359;
 var $360=$x;
 var $361=((($360)+(1))|0);
 $x=$361;
 var $362=$x;
 var $363=$prevline;
 var $364=(($363+$362)|0);
 var $365=HEAP8[($364)];
 var $366=$x;
 var $367=$line;
 var $368=(($367+$366)|0);
 HEAP8[($368)]=$365;
 var $369=$count;
 var $370=((($369)-(1))|0);
 $count=$370;
 var $371=$x;
 var $372=((($371)+(1))|0);
 $x=$372;
 label=58;break;
 case 62: 
 label=63;break;
 case 63: 
 var $375=$count;
 var $376=($375|0)>0;
 if($376){label=64;break;}else{var $382=0;label=65;break;}
 case 64: 
 var $378=$x;
 var $379=$3;
 var $380=($378|0)<($379|0);
 var $382=$380;label=65;break;
 case 65: 
 var $382;
 if($382){label=66;break;}else{label=67;break;}
 case 66: 
 var $384=$x;
 var $385=$prevline;
 var $386=(($385+$384)|0);
 var $387=HEAP8[($386)];
 var $388=$x;
 var $389=$line;
 var $390=(($389+$388)|0);
 HEAP8[($390)]=$387;
 var $391=$count;
 var $392=((($391)-(1))|0);
 $count=$392;
 var $393=$x;
 var $394=((($393)+(1))|0);
 $x=$394;
 label=63;break;
 case 67: 
 label=68;break;
 case 68: 
 label=344;break;
 case 69: 
 var $398=$prevline;
 var $399=($398|0)==0;
 if($399){label=70;break;}else{label=81;break;}
 case 70: 
 label=71;break;
 case 71: 
 var $402=$count;
 var $403=$402&-8;
 var $404=($403|0)!=0;
 if($404){label=72;break;}else{var $411=0;label=73;break;}
 case 72: 
 var $406=$x;
 var $407=((($406)+(8))|0);
 var $408=$3;
 var $409=($407|0)<($408|0);
 var $411=$409;label=73;break;
 case 73: 
 var $411;
 if($411){label=74;break;}else{label=75;break;}
 case 74: 
 var $413=$mix;
 var $414=$x;
 var $415=$line;
 var $416=(($415+$414)|0);
 HEAP8[($416)]=$413;
 var $417=$count;
 var $418=((($417)-(1))|0);
 $count=$418;
 var $419=$x;
 var $420=((($419)+(1))|0);
 $x=$420;
 var $421=$mix;
 var $422=$x;
 var $423=$line;
 var $424=(($423+$422)|0);
 HEAP8[($424)]=$421;
 var $425=$count;
 var $426=((($425)-(1))|0);
 $count=$426;
 var $427=$x;
 var $428=((($427)+(1))|0);
 $x=$428;
 var $429=$mix;
 var $430=$x;
 var $431=$line;
 var $432=(($431+$430)|0);
 HEAP8[($432)]=$429;
 var $433=$count;
 var $434=((($433)-(1))|0);
 $count=$434;
 var $435=$x;
 var $436=((($435)+(1))|0);
 $x=$436;
 var $437=$mix;
 var $438=$x;
 var $439=$line;
 var $440=(($439+$438)|0);
 HEAP8[($440)]=$437;
 var $441=$count;
 var $442=((($441)-(1))|0);
 $count=$442;
 var $443=$x;
 var $444=((($443)+(1))|0);
 $x=$444;
 var $445=$mix;
 var $446=$x;
 var $447=$line;
 var $448=(($447+$446)|0);
 HEAP8[($448)]=$445;
 var $449=$count;
 var $450=((($449)-(1))|0);
 $count=$450;
 var $451=$x;
 var $452=((($451)+(1))|0);
 $x=$452;
 var $453=$mix;
 var $454=$x;
 var $455=$line;
 var $456=(($455+$454)|0);
 HEAP8[($456)]=$453;
 var $457=$count;
 var $458=((($457)-(1))|0);
 $count=$458;
 var $459=$x;
 var $460=((($459)+(1))|0);
 $x=$460;
 var $461=$mix;
 var $462=$x;
 var $463=$line;
 var $464=(($463+$462)|0);
 HEAP8[($464)]=$461;
 var $465=$count;
 var $466=((($465)-(1))|0);
 $count=$466;
 var $467=$x;
 var $468=((($467)+(1))|0);
 $x=$468;
 var $469=$mix;
 var $470=$x;
 var $471=$line;
 var $472=(($471+$470)|0);
 HEAP8[($472)]=$469;
 var $473=$count;
 var $474=((($473)-(1))|0);
 $count=$474;
 var $475=$x;
 var $476=((($475)+(1))|0);
 $x=$476;
 label=71;break;
 case 75: 
 label=76;break;
 case 76: 
 var $479=$count;
 var $480=($479|0)>0;
 if($480){label=77;break;}else{var $486=0;label=78;break;}
 case 77: 
 var $482=$x;
 var $483=$3;
 var $484=($482|0)<($483|0);
 var $486=$484;label=78;break;
 case 78: 
 var $486;
 if($486){label=79;break;}else{label=80;break;}
 case 79: 
 var $488=$mix;
 var $489=$x;
 var $490=$line;
 var $491=(($490+$489)|0);
 HEAP8[($491)]=$488;
 var $492=$count;
 var $493=((($492)-(1))|0);
 $count=$493;
 var $494=$x;
 var $495=((($494)+(1))|0);
 $x=$495;
 label=76;break;
 case 80: 
 label=92;break;
 case 81: 
 label=82;break;
 case 82: 
 var $499=$count;
 var $500=$499&-8;
 var $501=($500|0)!=0;
 if($501){label=83;break;}else{var $508=0;label=84;break;}
 case 83: 
 var $503=$x;
 var $504=((($503)+(8))|0);
 var $505=$3;
 var $506=($504|0)<($505|0);
 var $508=$506;label=84;break;
 case 84: 
 var $508;
 if($508){label=85;break;}else{label=86;break;}
 case 85: 
 var $510=$x;
 var $511=$prevline;
 var $512=(($511+$510)|0);
 var $513=HEAP8[($512)];
 var $514=($513&255);
 var $515=$mix;
 var $516=($515&255);
 var $517=$514^$516;
 var $518=(($517)&255);
 var $519=$x;
 var $520=$line;
 var $521=(($520+$519)|0);
 HEAP8[($521)]=$518;
 var $522=$count;
 var $523=((($522)-(1))|0);
 $count=$523;
 var $524=$x;
 var $525=((($524)+(1))|0);
 $x=$525;
 var $526=$x;
 var $527=$prevline;
 var $528=(($527+$526)|0);
 var $529=HEAP8[($528)];
 var $530=($529&255);
 var $531=$mix;
 var $532=($531&255);
 var $533=$530^$532;
 var $534=(($533)&255);
 var $535=$x;
 var $536=$line;
 var $537=(($536+$535)|0);
 HEAP8[($537)]=$534;
 var $538=$count;
 var $539=((($538)-(1))|0);
 $count=$539;
 var $540=$x;
 var $541=((($540)+(1))|0);
 $x=$541;
 var $542=$x;
 var $543=$prevline;
 var $544=(($543+$542)|0);
 var $545=HEAP8[($544)];
 var $546=($545&255);
 var $547=$mix;
 var $548=($547&255);
 var $549=$546^$548;
 var $550=(($549)&255);
 var $551=$x;
 var $552=$line;
 var $553=(($552+$551)|0);
 HEAP8[($553)]=$550;
 var $554=$count;
 var $555=((($554)-(1))|0);
 $count=$555;
 var $556=$x;
 var $557=((($556)+(1))|0);
 $x=$557;
 var $558=$x;
 var $559=$prevline;
 var $560=(($559+$558)|0);
 var $561=HEAP8[($560)];
 var $562=($561&255);
 var $563=$mix;
 var $564=($563&255);
 var $565=$562^$564;
 var $566=(($565)&255);
 var $567=$x;
 var $568=$line;
 var $569=(($568+$567)|0);
 HEAP8[($569)]=$566;
 var $570=$count;
 var $571=((($570)-(1))|0);
 $count=$571;
 var $572=$x;
 var $573=((($572)+(1))|0);
 $x=$573;
 var $574=$x;
 var $575=$prevline;
 var $576=(($575+$574)|0);
 var $577=HEAP8[($576)];
 var $578=($577&255);
 var $579=$mix;
 var $580=($579&255);
 var $581=$578^$580;
 var $582=(($581)&255);
 var $583=$x;
 var $584=$line;
 var $585=(($584+$583)|0);
 HEAP8[($585)]=$582;
 var $586=$count;
 var $587=((($586)-(1))|0);
 $count=$587;
 var $588=$x;
 var $589=((($588)+(1))|0);
 $x=$589;
 var $590=$x;
 var $591=$prevline;
 var $592=(($591+$590)|0);
 var $593=HEAP8[($592)];
 var $594=($593&255);
 var $595=$mix;
 var $596=($595&255);
 var $597=$594^$596;
 var $598=(($597)&255);
 var $599=$x;
 var $600=$line;
 var $601=(($600+$599)|0);
 HEAP8[($601)]=$598;
 var $602=$count;
 var $603=((($602)-(1))|0);
 $count=$603;
 var $604=$x;
 var $605=((($604)+(1))|0);
 $x=$605;
 var $606=$x;
 var $607=$prevline;
 var $608=(($607+$606)|0);
 var $609=HEAP8[($608)];
 var $610=($609&255);
 var $611=$mix;
 var $612=($611&255);
 var $613=$610^$612;
 var $614=(($613)&255);
 var $615=$x;
 var $616=$line;
 var $617=(($616+$615)|0);
 HEAP8[($617)]=$614;
 var $618=$count;
 var $619=((($618)-(1))|0);
 $count=$619;
 var $620=$x;
 var $621=((($620)+(1))|0);
 $x=$621;
 var $622=$x;
 var $623=$prevline;
 var $624=(($623+$622)|0);
 var $625=HEAP8[($624)];
 var $626=($625&255);
 var $627=$mix;
 var $628=($627&255);
 var $629=$626^$628;
 var $630=(($629)&255);
 var $631=$x;
 var $632=$line;
 var $633=(($632+$631)|0);
 HEAP8[($633)]=$630;
 var $634=$count;
 var $635=((($634)-(1))|0);
 $count=$635;
 var $636=$x;
 var $637=((($636)+(1))|0);
 $x=$637;
 label=82;break;
 case 86: 
 label=87;break;
 case 87: 
 var $640=$count;
 var $641=($640|0)>0;
 if($641){label=88;break;}else{var $647=0;label=89;break;}
 case 88: 
 var $643=$x;
 var $644=$3;
 var $645=($643|0)<($644|0);
 var $647=$645;label=89;break;
 case 89: 
 var $647;
 if($647){label=90;break;}else{label=91;break;}
 case 90: 
 var $649=$x;
 var $650=$prevline;
 var $651=(($650+$649)|0);
 var $652=HEAP8[($651)];
 var $653=($652&255);
 var $654=$mix;
 var $655=($654&255);
 var $656=$653^$655;
 var $657=(($656)&255);
 var $658=$x;
 var $659=$line;
 var $660=(($659+$658)|0);
 HEAP8[($660)]=$657;
 var $661=$count;
 var $662=((($661)-(1))|0);
 $count=$662;
 var $663=$x;
 var $664=((($663)+(1))|0);
 $x=$664;
 label=87;break;
 case 91: 
 label=92;break;
 case 92: 
 label=344;break;
 case 93: 
 var $668=$prevline;
 var $669=($668|0)==0;
 if($669){label=94;break;}else{label=177;break;}
 case 94: 
 label=95;break;
 case 95: 
 var $672=$count;
 var $673=$672&-8;
 var $674=($673|0)!=0;
 if($674){label=96;break;}else{var $681=0;label=97;break;}
 case 96: 
 var $676=$x;
 var $677=((($676)+(8))|0);
 var $678=$3;
 var $679=($677|0)<($678|0);
 var $681=$679;label=97;break;
 case 97: 
 var $681;
 if($681){label=98;break;}else{label=163;break;}
 case 98: 
 var $683=$mixmask;
 var $684=($683&255);
 var $685=$684<<1;
 var $686=(($685)&255);
 $mixmask=$686;
 var $687=$mixmask;
 var $688=($687&255);
 var $689=($688|0)==0;
 if($689){label=99;break;}else{label=103;break;}
 case 99: 
 var $691=$fom_mask;
 var $692=($691|0)!=0;
 if($692){label=100;break;}else{label=101;break;}
 case 100: 
 var $694=$fom_mask;
 var $701=$694;label=102;break;
 case 101: 
 var $696=$5;
 var $697=(($696+1)|0);
 $5=$697;
 var $698=HEAP8[($696)];
 var $699=($698&255);
 var $701=$699;label=102;break;
 case 102: 
 var $701;
 var $702=(($701)&255);
 $mask=$702;
 $mixmask=1;
 label=103;break;
 case 103: 
 var $704=$mask;
 var $705=($704&255);
 var $706=$mixmask;
 var $707=($706&255);
 var $708=$705&$707;
 var $709=($708|0)!=0;
 if($709){label=104;break;}else{label=105;break;}
 case 104: 
 var $711=$mix;
 var $712=$x;
 var $713=$line;
 var $714=(($713+$712)|0);
 HEAP8[($714)]=$711;
 label=106;break;
 case 105: 
 var $716=$x;
 var $717=$line;
 var $718=(($717+$716)|0);
 HEAP8[($718)]=0;
 label=106;break;
 case 106: 
 var $720=$count;
 var $721=((($720)-(1))|0);
 $count=$721;
 var $722=$x;
 var $723=((($722)+(1))|0);
 $x=$723;
 var $724=$mixmask;
 var $725=($724&255);
 var $726=$725<<1;
 var $727=(($726)&255);
 $mixmask=$727;
 var $728=$mixmask;
 var $729=($728&255);
 var $730=($729|0)==0;
 if($730){label=107;break;}else{label=111;break;}
 case 107: 
 var $732=$fom_mask;
 var $733=($732|0)!=0;
 if($733){label=108;break;}else{label=109;break;}
 case 108: 
 var $735=$fom_mask;
 var $742=$735;label=110;break;
 case 109: 
 var $737=$5;
 var $738=(($737+1)|0);
 $5=$738;
 var $739=HEAP8[($737)];
 var $740=($739&255);
 var $742=$740;label=110;break;
 case 110: 
 var $742;
 var $743=(($742)&255);
 $mask=$743;
 $mixmask=1;
 label=111;break;
 case 111: 
 var $745=$mask;
 var $746=($745&255);
 var $747=$mixmask;
 var $748=($747&255);
 var $749=$746&$748;
 var $750=($749|0)!=0;
 if($750){label=112;break;}else{label=113;break;}
 case 112: 
 var $752=$mix;
 var $753=$x;
 var $754=$line;
 var $755=(($754+$753)|0);
 HEAP8[($755)]=$752;
 label=114;break;
 case 113: 
 var $757=$x;
 var $758=$line;
 var $759=(($758+$757)|0);
 HEAP8[($759)]=0;
 label=114;break;
 case 114: 
 var $761=$count;
 var $762=((($761)-(1))|0);
 $count=$762;
 var $763=$x;
 var $764=((($763)+(1))|0);
 $x=$764;
 var $765=$mixmask;
 var $766=($765&255);
 var $767=$766<<1;
 var $768=(($767)&255);
 $mixmask=$768;
 var $769=$mixmask;
 var $770=($769&255);
 var $771=($770|0)==0;
 if($771){label=115;break;}else{label=119;break;}
 case 115: 
 var $773=$fom_mask;
 var $774=($773|0)!=0;
 if($774){label=116;break;}else{label=117;break;}
 case 116: 
 var $776=$fom_mask;
 var $783=$776;label=118;break;
 case 117: 
 var $778=$5;
 var $779=(($778+1)|0);
 $5=$779;
 var $780=HEAP8[($778)];
 var $781=($780&255);
 var $783=$781;label=118;break;
 case 118: 
 var $783;
 var $784=(($783)&255);
 $mask=$784;
 $mixmask=1;
 label=119;break;
 case 119: 
 var $786=$mask;
 var $787=($786&255);
 var $788=$mixmask;
 var $789=($788&255);
 var $790=$787&$789;
 var $791=($790|0)!=0;
 if($791){label=120;break;}else{label=121;break;}
 case 120: 
 var $793=$mix;
 var $794=$x;
 var $795=$line;
 var $796=(($795+$794)|0);
 HEAP8[($796)]=$793;
 label=122;break;
 case 121: 
 var $798=$x;
 var $799=$line;
 var $800=(($799+$798)|0);
 HEAP8[($800)]=0;
 label=122;break;
 case 122: 
 var $802=$count;
 var $803=((($802)-(1))|0);
 $count=$803;
 var $804=$x;
 var $805=((($804)+(1))|0);
 $x=$805;
 var $806=$mixmask;
 var $807=($806&255);
 var $808=$807<<1;
 var $809=(($808)&255);
 $mixmask=$809;
 var $810=$mixmask;
 var $811=($810&255);
 var $812=($811|0)==0;
 if($812){label=123;break;}else{label=127;break;}
 case 123: 
 var $814=$fom_mask;
 var $815=($814|0)!=0;
 if($815){label=124;break;}else{label=125;break;}
 case 124: 
 var $817=$fom_mask;
 var $824=$817;label=126;break;
 case 125: 
 var $819=$5;
 var $820=(($819+1)|0);
 $5=$820;
 var $821=HEAP8[($819)];
 var $822=($821&255);
 var $824=$822;label=126;break;
 case 126: 
 var $824;
 var $825=(($824)&255);
 $mask=$825;
 $mixmask=1;
 label=127;break;
 case 127: 
 var $827=$mask;
 var $828=($827&255);
 var $829=$mixmask;
 var $830=($829&255);
 var $831=$828&$830;
 var $832=($831|0)!=0;
 if($832){label=128;break;}else{label=129;break;}
 case 128: 
 var $834=$mix;
 var $835=$x;
 var $836=$line;
 var $837=(($836+$835)|0);
 HEAP8[($837)]=$834;
 label=130;break;
 case 129: 
 var $839=$x;
 var $840=$line;
 var $841=(($840+$839)|0);
 HEAP8[($841)]=0;
 label=130;break;
 case 130: 
 var $843=$count;
 var $844=((($843)-(1))|0);
 $count=$844;
 var $845=$x;
 var $846=((($845)+(1))|0);
 $x=$846;
 var $847=$mixmask;
 var $848=($847&255);
 var $849=$848<<1;
 var $850=(($849)&255);
 $mixmask=$850;
 var $851=$mixmask;
 var $852=($851&255);
 var $853=($852|0)==0;
 if($853){label=131;break;}else{label=135;break;}
 case 131: 
 var $855=$fom_mask;
 var $856=($855|0)!=0;
 if($856){label=132;break;}else{label=133;break;}
 case 132: 
 var $858=$fom_mask;
 var $865=$858;label=134;break;
 case 133: 
 var $860=$5;
 var $861=(($860+1)|0);
 $5=$861;
 var $862=HEAP8[($860)];
 var $863=($862&255);
 var $865=$863;label=134;break;
 case 134: 
 var $865;
 var $866=(($865)&255);
 $mask=$866;
 $mixmask=1;
 label=135;break;
 case 135: 
 var $868=$mask;
 var $869=($868&255);
 var $870=$mixmask;
 var $871=($870&255);
 var $872=$869&$871;
 var $873=($872|0)!=0;
 if($873){label=136;break;}else{label=137;break;}
 case 136: 
 var $875=$mix;
 var $876=$x;
 var $877=$line;
 var $878=(($877+$876)|0);
 HEAP8[($878)]=$875;
 label=138;break;
 case 137: 
 var $880=$x;
 var $881=$line;
 var $882=(($881+$880)|0);
 HEAP8[($882)]=0;
 label=138;break;
 case 138: 
 var $884=$count;
 var $885=((($884)-(1))|0);
 $count=$885;
 var $886=$x;
 var $887=((($886)+(1))|0);
 $x=$887;
 var $888=$mixmask;
 var $889=($888&255);
 var $890=$889<<1;
 var $891=(($890)&255);
 $mixmask=$891;
 var $892=$mixmask;
 var $893=($892&255);
 var $894=($893|0)==0;
 if($894){label=139;break;}else{label=143;break;}
 case 139: 
 var $896=$fom_mask;
 var $897=($896|0)!=0;
 if($897){label=140;break;}else{label=141;break;}
 case 140: 
 var $899=$fom_mask;
 var $906=$899;label=142;break;
 case 141: 
 var $901=$5;
 var $902=(($901+1)|0);
 $5=$902;
 var $903=HEAP8[($901)];
 var $904=($903&255);
 var $906=$904;label=142;break;
 case 142: 
 var $906;
 var $907=(($906)&255);
 $mask=$907;
 $mixmask=1;
 label=143;break;
 case 143: 
 var $909=$mask;
 var $910=($909&255);
 var $911=$mixmask;
 var $912=($911&255);
 var $913=$910&$912;
 var $914=($913|0)!=0;
 if($914){label=144;break;}else{label=145;break;}
 case 144: 
 var $916=$mix;
 var $917=$x;
 var $918=$line;
 var $919=(($918+$917)|0);
 HEAP8[($919)]=$916;
 label=146;break;
 case 145: 
 var $921=$x;
 var $922=$line;
 var $923=(($922+$921)|0);
 HEAP8[($923)]=0;
 label=146;break;
 case 146: 
 var $925=$count;
 var $926=((($925)-(1))|0);
 $count=$926;
 var $927=$x;
 var $928=((($927)+(1))|0);
 $x=$928;
 var $929=$mixmask;
 var $930=($929&255);
 var $931=$930<<1;
 var $932=(($931)&255);
 $mixmask=$932;
 var $933=$mixmask;
 var $934=($933&255);
 var $935=($934|0)==0;
 if($935){label=147;break;}else{label=151;break;}
 case 147: 
 var $937=$fom_mask;
 var $938=($937|0)!=0;
 if($938){label=148;break;}else{label=149;break;}
 case 148: 
 var $940=$fom_mask;
 var $947=$940;label=150;break;
 case 149: 
 var $942=$5;
 var $943=(($942+1)|0);
 $5=$943;
 var $944=HEAP8[($942)];
 var $945=($944&255);
 var $947=$945;label=150;break;
 case 150: 
 var $947;
 var $948=(($947)&255);
 $mask=$948;
 $mixmask=1;
 label=151;break;
 case 151: 
 var $950=$mask;
 var $951=($950&255);
 var $952=$mixmask;
 var $953=($952&255);
 var $954=$951&$953;
 var $955=($954|0)!=0;
 if($955){label=152;break;}else{label=153;break;}
 case 152: 
 var $957=$mix;
 var $958=$x;
 var $959=$line;
 var $960=(($959+$958)|0);
 HEAP8[($960)]=$957;
 label=154;break;
 case 153: 
 var $962=$x;
 var $963=$line;
 var $964=(($963+$962)|0);
 HEAP8[($964)]=0;
 label=154;break;
 case 154: 
 var $966=$count;
 var $967=((($966)-(1))|0);
 $count=$967;
 var $968=$x;
 var $969=((($968)+(1))|0);
 $x=$969;
 var $970=$mixmask;
 var $971=($970&255);
 var $972=$971<<1;
 var $973=(($972)&255);
 $mixmask=$973;
 var $974=$mixmask;
 var $975=($974&255);
 var $976=($975|0)==0;
 if($976){label=155;break;}else{label=159;break;}
 case 155: 
 var $978=$fom_mask;
 var $979=($978|0)!=0;
 if($979){label=156;break;}else{label=157;break;}
 case 156: 
 var $981=$fom_mask;
 var $988=$981;label=158;break;
 case 157: 
 var $983=$5;
 var $984=(($983+1)|0);
 $5=$984;
 var $985=HEAP8[($983)];
 var $986=($985&255);
 var $988=$986;label=158;break;
 case 158: 
 var $988;
 var $989=(($988)&255);
 $mask=$989;
 $mixmask=1;
 label=159;break;
 case 159: 
 var $991=$mask;
 var $992=($991&255);
 var $993=$mixmask;
 var $994=($993&255);
 var $995=$992&$994;
 var $996=($995|0)!=0;
 if($996){label=160;break;}else{label=161;break;}
 case 160: 
 var $998=$mix;
 var $999=$x;
 var $1000=$line;
 var $1001=(($1000+$999)|0);
 HEAP8[($1001)]=$998;
 label=162;break;
 case 161: 
 var $1003=$x;
 var $1004=$line;
 var $1005=(($1004+$1003)|0);
 HEAP8[($1005)]=0;
 label=162;break;
 case 162: 
 var $1007=$count;
 var $1008=((($1007)-(1))|0);
 $count=$1008;
 var $1009=$x;
 var $1010=((($1009)+(1))|0);
 $x=$1010;
 label=95;break;
 case 163: 
 label=164;break;
 case 164: 
 var $1013=$count;
 var $1014=($1013|0)>0;
 if($1014){label=165;break;}else{var $1020=0;label=166;break;}
 case 165: 
 var $1016=$x;
 var $1017=$3;
 var $1018=($1016|0)<($1017|0);
 var $1020=$1018;label=166;break;
 case 166: 
 var $1020;
 if($1020){label=167;break;}else{label=176;break;}
 case 167: 
 var $1022=$mixmask;
 var $1023=($1022&255);
 var $1024=$1023<<1;
 var $1025=(($1024)&255);
 $mixmask=$1025;
 var $1026=$mixmask;
 var $1027=($1026&255);
 var $1028=($1027|0)==0;
 if($1028){label=168;break;}else{label=172;break;}
 case 168: 
 var $1030=$fom_mask;
 var $1031=($1030|0)!=0;
 if($1031){label=169;break;}else{label=170;break;}
 case 169: 
 var $1033=$fom_mask;
 var $1040=$1033;label=171;break;
 case 170: 
 var $1035=$5;
 var $1036=(($1035+1)|0);
 $5=$1036;
 var $1037=HEAP8[($1035)];
 var $1038=($1037&255);
 var $1040=$1038;label=171;break;
 case 171: 
 var $1040;
 var $1041=(($1040)&255);
 $mask=$1041;
 $mixmask=1;
 label=172;break;
 case 172: 
 var $1043=$mask;
 var $1044=($1043&255);
 var $1045=$mixmask;
 var $1046=($1045&255);
 var $1047=$1044&$1046;
 var $1048=($1047|0)!=0;
 if($1048){label=173;break;}else{label=174;break;}
 case 173: 
 var $1050=$mix;
 var $1051=$x;
 var $1052=$line;
 var $1053=(($1052+$1051)|0);
 HEAP8[($1053)]=$1050;
 label=175;break;
 case 174: 
 var $1055=$x;
 var $1056=$line;
 var $1057=(($1056+$1055)|0);
 HEAP8[($1057)]=0;
 label=175;break;
 case 175: 
 var $1059=$count;
 var $1060=((($1059)-(1))|0);
 $count=$1060;
 var $1061=$x;
 var $1062=((($1061)+(1))|0);
 $x=$1062;
 label=164;break;
 case 176: 
 label=260;break;
 case 177: 
 label=178;break;
 case 178: 
 var $1066=$count;
 var $1067=$1066&-8;
 var $1068=($1067|0)!=0;
 if($1068){label=179;break;}else{var $1075=0;label=180;break;}
 case 179: 
 var $1070=$x;
 var $1071=((($1070)+(8))|0);
 var $1072=$3;
 var $1073=($1071|0)<($1072|0);
 var $1075=$1073;label=180;break;
 case 180: 
 var $1075;
 if($1075){label=181;break;}else{label=246;break;}
 case 181: 
 var $1077=$mixmask;
 var $1078=($1077&255);
 var $1079=$1078<<1;
 var $1080=(($1079)&255);
 $mixmask=$1080;
 var $1081=$mixmask;
 var $1082=($1081&255);
 var $1083=($1082|0)==0;
 if($1083){label=182;break;}else{label=186;break;}
 case 182: 
 var $1085=$fom_mask;
 var $1086=($1085|0)!=0;
 if($1086){label=183;break;}else{label=184;break;}
 case 183: 
 var $1088=$fom_mask;
 var $1095=$1088;label=185;break;
 case 184: 
 var $1090=$5;
 var $1091=(($1090+1)|0);
 $5=$1091;
 var $1092=HEAP8[($1090)];
 var $1093=($1092&255);
 var $1095=$1093;label=185;break;
 case 185: 
 var $1095;
 var $1096=(($1095)&255);
 $mask=$1096;
 $mixmask=1;
 label=186;break;
 case 186: 
 var $1098=$mask;
 var $1099=($1098&255);
 var $1100=$mixmask;
 var $1101=($1100&255);
 var $1102=$1099&$1101;
 var $1103=($1102|0)!=0;
 if($1103){label=187;break;}else{label=188;break;}
 case 187: 
 var $1105=$x;
 var $1106=$prevline;
 var $1107=(($1106+$1105)|0);
 var $1108=HEAP8[($1107)];
 var $1109=($1108&255);
 var $1110=$mix;
 var $1111=($1110&255);
 var $1112=$1109^$1111;
 var $1113=(($1112)&255);
 var $1114=$x;
 var $1115=$line;
 var $1116=(($1115+$1114)|0);
 HEAP8[($1116)]=$1113;
 label=189;break;
 case 188: 
 var $1118=$x;
 var $1119=$prevline;
 var $1120=(($1119+$1118)|0);
 var $1121=HEAP8[($1120)];
 var $1122=$x;
 var $1123=$line;
 var $1124=(($1123+$1122)|0);
 HEAP8[($1124)]=$1121;
 label=189;break;
 case 189: 
 var $1126=$count;
 var $1127=((($1126)-(1))|0);
 $count=$1127;
 var $1128=$x;
 var $1129=((($1128)+(1))|0);
 $x=$1129;
 var $1130=$mixmask;
 var $1131=($1130&255);
 var $1132=$1131<<1;
 var $1133=(($1132)&255);
 $mixmask=$1133;
 var $1134=$mixmask;
 var $1135=($1134&255);
 var $1136=($1135|0)==0;
 if($1136){label=190;break;}else{label=194;break;}
 case 190: 
 var $1138=$fom_mask;
 var $1139=($1138|0)!=0;
 if($1139){label=191;break;}else{label=192;break;}
 case 191: 
 var $1141=$fom_mask;
 var $1148=$1141;label=193;break;
 case 192: 
 var $1143=$5;
 var $1144=(($1143+1)|0);
 $5=$1144;
 var $1145=HEAP8[($1143)];
 var $1146=($1145&255);
 var $1148=$1146;label=193;break;
 case 193: 
 var $1148;
 var $1149=(($1148)&255);
 $mask=$1149;
 $mixmask=1;
 label=194;break;
 case 194: 
 var $1151=$mask;
 var $1152=($1151&255);
 var $1153=$mixmask;
 var $1154=($1153&255);
 var $1155=$1152&$1154;
 var $1156=($1155|0)!=0;
 if($1156){label=195;break;}else{label=196;break;}
 case 195: 
 var $1158=$x;
 var $1159=$prevline;
 var $1160=(($1159+$1158)|0);
 var $1161=HEAP8[($1160)];
 var $1162=($1161&255);
 var $1163=$mix;
 var $1164=($1163&255);
 var $1165=$1162^$1164;
 var $1166=(($1165)&255);
 var $1167=$x;
 var $1168=$line;
 var $1169=(($1168+$1167)|0);
 HEAP8[($1169)]=$1166;
 label=197;break;
 case 196: 
 var $1171=$x;
 var $1172=$prevline;
 var $1173=(($1172+$1171)|0);
 var $1174=HEAP8[($1173)];
 var $1175=$x;
 var $1176=$line;
 var $1177=(($1176+$1175)|0);
 HEAP8[($1177)]=$1174;
 label=197;break;
 case 197: 
 var $1179=$count;
 var $1180=((($1179)-(1))|0);
 $count=$1180;
 var $1181=$x;
 var $1182=((($1181)+(1))|0);
 $x=$1182;
 var $1183=$mixmask;
 var $1184=($1183&255);
 var $1185=$1184<<1;
 var $1186=(($1185)&255);
 $mixmask=$1186;
 var $1187=$mixmask;
 var $1188=($1187&255);
 var $1189=($1188|0)==0;
 if($1189){label=198;break;}else{label=202;break;}
 case 198: 
 var $1191=$fom_mask;
 var $1192=($1191|0)!=0;
 if($1192){label=199;break;}else{label=200;break;}
 case 199: 
 var $1194=$fom_mask;
 var $1201=$1194;label=201;break;
 case 200: 
 var $1196=$5;
 var $1197=(($1196+1)|0);
 $5=$1197;
 var $1198=HEAP8[($1196)];
 var $1199=($1198&255);
 var $1201=$1199;label=201;break;
 case 201: 
 var $1201;
 var $1202=(($1201)&255);
 $mask=$1202;
 $mixmask=1;
 label=202;break;
 case 202: 
 var $1204=$mask;
 var $1205=($1204&255);
 var $1206=$mixmask;
 var $1207=($1206&255);
 var $1208=$1205&$1207;
 var $1209=($1208|0)!=0;
 if($1209){label=203;break;}else{label=204;break;}
 case 203: 
 var $1211=$x;
 var $1212=$prevline;
 var $1213=(($1212+$1211)|0);
 var $1214=HEAP8[($1213)];
 var $1215=($1214&255);
 var $1216=$mix;
 var $1217=($1216&255);
 var $1218=$1215^$1217;
 var $1219=(($1218)&255);
 var $1220=$x;
 var $1221=$line;
 var $1222=(($1221+$1220)|0);
 HEAP8[($1222)]=$1219;
 label=205;break;
 case 204: 
 var $1224=$x;
 var $1225=$prevline;
 var $1226=(($1225+$1224)|0);
 var $1227=HEAP8[($1226)];
 var $1228=$x;
 var $1229=$line;
 var $1230=(($1229+$1228)|0);
 HEAP8[($1230)]=$1227;
 label=205;break;
 case 205: 
 var $1232=$count;
 var $1233=((($1232)-(1))|0);
 $count=$1233;
 var $1234=$x;
 var $1235=((($1234)+(1))|0);
 $x=$1235;
 var $1236=$mixmask;
 var $1237=($1236&255);
 var $1238=$1237<<1;
 var $1239=(($1238)&255);
 $mixmask=$1239;
 var $1240=$mixmask;
 var $1241=($1240&255);
 var $1242=($1241|0)==0;
 if($1242){label=206;break;}else{label=210;break;}
 case 206: 
 var $1244=$fom_mask;
 var $1245=($1244|0)!=0;
 if($1245){label=207;break;}else{label=208;break;}
 case 207: 
 var $1247=$fom_mask;
 var $1254=$1247;label=209;break;
 case 208: 
 var $1249=$5;
 var $1250=(($1249+1)|0);
 $5=$1250;
 var $1251=HEAP8[($1249)];
 var $1252=($1251&255);
 var $1254=$1252;label=209;break;
 case 209: 
 var $1254;
 var $1255=(($1254)&255);
 $mask=$1255;
 $mixmask=1;
 label=210;break;
 case 210: 
 var $1257=$mask;
 var $1258=($1257&255);
 var $1259=$mixmask;
 var $1260=($1259&255);
 var $1261=$1258&$1260;
 var $1262=($1261|0)!=0;
 if($1262){label=211;break;}else{label=212;break;}
 case 211: 
 var $1264=$x;
 var $1265=$prevline;
 var $1266=(($1265+$1264)|0);
 var $1267=HEAP8[($1266)];
 var $1268=($1267&255);
 var $1269=$mix;
 var $1270=($1269&255);
 var $1271=$1268^$1270;
 var $1272=(($1271)&255);
 var $1273=$x;
 var $1274=$line;
 var $1275=(($1274+$1273)|0);
 HEAP8[($1275)]=$1272;
 label=213;break;
 case 212: 
 var $1277=$x;
 var $1278=$prevline;
 var $1279=(($1278+$1277)|0);
 var $1280=HEAP8[($1279)];
 var $1281=$x;
 var $1282=$line;
 var $1283=(($1282+$1281)|0);
 HEAP8[($1283)]=$1280;
 label=213;break;
 case 213: 
 var $1285=$count;
 var $1286=((($1285)-(1))|0);
 $count=$1286;
 var $1287=$x;
 var $1288=((($1287)+(1))|0);
 $x=$1288;
 var $1289=$mixmask;
 var $1290=($1289&255);
 var $1291=$1290<<1;
 var $1292=(($1291)&255);
 $mixmask=$1292;
 var $1293=$mixmask;
 var $1294=($1293&255);
 var $1295=($1294|0)==0;
 if($1295){label=214;break;}else{label=218;break;}
 case 214: 
 var $1297=$fom_mask;
 var $1298=($1297|0)!=0;
 if($1298){label=215;break;}else{label=216;break;}
 case 215: 
 var $1300=$fom_mask;
 var $1307=$1300;label=217;break;
 case 216: 
 var $1302=$5;
 var $1303=(($1302+1)|0);
 $5=$1303;
 var $1304=HEAP8[($1302)];
 var $1305=($1304&255);
 var $1307=$1305;label=217;break;
 case 217: 
 var $1307;
 var $1308=(($1307)&255);
 $mask=$1308;
 $mixmask=1;
 label=218;break;
 case 218: 
 var $1310=$mask;
 var $1311=($1310&255);
 var $1312=$mixmask;
 var $1313=($1312&255);
 var $1314=$1311&$1313;
 var $1315=($1314|0)!=0;
 if($1315){label=219;break;}else{label=220;break;}
 case 219: 
 var $1317=$x;
 var $1318=$prevline;
 var $1319=(($1318+$1317)|0);
 var $1320=HEAP8[($1319)];
 var $1321=($1320&255);
 var $1322=$mix;
 var $1323=($1322&255);
 var $1324=$1321^$1323;
 var $1325=(($1324)&255);
 var $1326=$x;
 var $1327=$line;
 var $1328=(($1327+$1326)|0);
 HEAP8[($1328)]=$1325;
 label=221;break;
 case 220: 
 var $1330=$x;
 var $1331=$prevline;
 var $1332=(($1331+$1330)|0);
 var $1333=HEAP8[($1332)];
 var $1334=$x;
 var $1335=$line;
 var $1336=(($1335+$1334)|0);
 HEAP8[($1336)]=$1333;
 label=221;break;
 case 221: 
 var $1338=$count;
 var $1339=((($1338)-(1))|0);
 $count=$1339;
 var $1340=$x;
 var $1341=((($1340)+(1))|0);
 $x=$1341;
 var $1342=$mixmask;
 var $1343=($1342&255);
 var $1344=$1343<<1;
 var $1345=(($1344)&255);
 $mixmask=$1345;
 var $1346=$mixmask;
 var $1347=($1346&255);
 var $1348=($1347|0)==0;
 if($1348){label=222;break;}else{label=226;break;}
 case 222: 
 var $1350=$fom_mask;
 var $1351=($1350|0)!=0;
 if($1351){label=223;break;}else{label=224;break;}
 case 223: 
 var $1353=$fom_mask;
 var $1360=$1353;label=225;break;
 case 224: 
 var $1355=$5;
 var $1356=(($1355+1)|0);
 $5=$1356;
 var $1357=HEAP8[($1355)];
 var $1358=($1357&255);
 var $1360=$1358;label=225;break;
 case 225: 
 var $1360;
 var $1361=(($1360)&255);
 $mask=$1361;
 $mixmask=1;
 label=226;break;
 case 226: 
 var $1363=$mask;
 var $1364=($1363&255);
 var $1365=$mixmask;
 var $1366=($1365&255);
 var $1367=$1364&$1366;
 var $1368=($1367|0)!=0;
 if($1368){label=227;break;}else{label=228;break;}
 case 227: 
 var $1370=$x;
 var $1371=$prevline;
 var $1372=(($1371+$1370)|0);
 var $1373=HEAP8[($1372)];
 var $1374=($1373&255);
 var $1375=$mix;
 var $1376=($1375&255);
 var $1377=$1374^$1376;
 var $1378=(($1377)&255);
 var $1379=$x;
 var $1380=$line;
 var $1381=(($1380+$1379)|0);
 HEAP8[($1381)]=$1378;
 label=229;break;
 case 228: 
 var $1383=$x;
 var $1384=$prevline;
 var $1385=(($1384+$1383)|0);
 var $1386=HEAP8[($1385)];
 var $1387=$x;
 var $1388=$line;
 var $1389=(($1388+$1387)|0);
 HEAP8[($1389)]=$1386;
 label=229;break;
 case 229: 
 var $1391=$count;
 var $1392=((($1391)-(1))|0);
 $count=$1392;
 var $1393=$x;
 var $1394=((($1393)+(1))|0);
 $x=$1394;
 var $1395=$mixmask;
 var $1396=($1395&255);
 var $1397=$1396<<1;
 var $1398=(($1397)&255);
 $mixmask=$1398;
 var $1399=$mixmask;
 var $1400=($1399&255);
 var $1401=($1400|0)==0;
 if($1401){label=230;break;}else{label=234;break;}
 case 230: 
 var $1403=$fom_mask;
 var $1404=($1403|0)!=0;
 if($1404){label=231;break;}else{label=232;break;}
 case 231: 
 var $1406=$fom_mask;
 var $1413=$1406;label=233;break;
 case 232: 
 var $1408=$5;
 var $1409=(($1408+1)|0);
 $5=$1409;
 var $1410=HEAP8[($1408)];
 var $1411=($1410&255);
 var $1413=$1411;label=233;break;
 case 233: 
 var $1413;
 var $1414=(($1413)&255);
 $mask=$1414;
 $mixmask=1;
 label=234;break;
 case 234: 
 var $1416=$mask;
 var $1417=($1416&255);
 var $1418=$mixmask;
 var $1419=($1418&255);
 var $1420=$1417&$1419;
 var $1421=($1420|0)!=0;
 if($1421){label=235;break;}else{label=236;break;}
 case 235: 
 var $1423=$x;
 var $1424=$prevline;
 var $1425=(($1424+$1423)|0);
 var $1426=HEAP8[($1425)];
 var $1427=($1426&255);
 var $1428=$mix;
 var $1429=($1428&255);
 var $1430=$1427^$1429;
 var $1431=(($1430)&255);
 var $1432=$x;
 var $1433=$line;
 var $1434=(($1433+$1432)|0);
 HEAP8[($1434)]=$1431;
 label=237;break;
 case 236: 
 var $1436=$x;
 var $1437=$prevline;
 var $1438=(($1437+$1436)|0);
 var $1439=HEAP8[($1438)];
 var $1440=$x;
 var $1441=$line;
 var $1442=(($1441+$1440)|0);
 HEAP8[($1442)]=$1439;
 label=237;break;
 case 237: 
 var $1444=$count;
 var $1445=((($1444)-(1))|0);
 $count=$1445;
 var $1446=$x;
 var $1447=((($1446)+(1))|0);
 $x=$1447;
 var $1448=$mixmask;
 var $1449=($1448&255);
 var $1450=$1449<<1;
 var $1451=(($1450)&255);
 $mixmask=$1451;
 var $1452=$mixmask;
 var $1453=($1452&255);
 var $1454=($1453|0)==0;
 if($1454){label=238;break;}else{label=242;break;}
 case 238: 
 var $1456=$fom_mask;
 var $1457=($1456|0)!=0;
 if($1457){label=239;break;}else{label=240;break;}
 case 239: 
 var $1459=$fom_mask;
 var $1466=$1459;label=241;break;
 case 240: 
 var $1461=$5;
 var $1462=(($1461+1)|0);
 $5=$1462;
 var $1463=HEAP8[($1461)];
 var $1464=($1463&255);
 var $1466=$1464;label=241;break;
 case 241: 
 var $1466;
 var $1467=(($1466)&255);
 $mask=$1467;
 $mixmask=1;
 label=242;break;
 case 242: 
 var $1469=$mask;
 var $1470=($1469&255);
 var $1471=$mixmask;
 var $1472=($1471&255);
 var $1473=$1470&$1472;
 var $1474=($1473|0)!=0;
 if($1474){label=243;break;}else{label=244;break;}
 case 243: 
 var $1476=$x;
 var $1477=$prevline;
 var $1478=(($1477+$1476)|0);
 var $1479=HEAP8[($1478)];
 var $1480=($1479&255);
 var $1481=$mix;
 var $1482=($1481&255);
 var $1483=$1480^$1482;
 var $1484=(($1483)&255);
 var $1485=$x;
 var $1486=$line;
 var $1487=(($1486+$1485)|0);
 HEAP8[($1487)]=$1484;
 label=245;break;
 case 244: 
 var $1489=$x;
 var $1490=$prevline;
 var $1491=(($1490+$1489)|0);
 var $1492=HEAP8[($1491)];
 var $1493=$x;
 var $1494=$line;
 var $1495=(($1494+$1493)|0);
 HEAP8[($1495)]=$1492;
 label=245;break;
 case 245: 
 var $1497=$count;
 var $1498=((($1497)-(1))|0);
 $count=$1498;
 var $1499=$x;
 var $1500=((($1499)+(1))|0);
 $x=$1500;
 label=178;break;
 case 246: 
 label=247;break;
 case 247: 
 var $1503=$count;
 var $1504=($1503|0)>0;
 if($1504){label=248;break;}else{var $1510=0;label=249;break;}
 case 248: 
 var $1506=$x;
 var $1507=$3;
 var $1508=($1506|0)<($1507|0);
 var $1510=$1508;label=249;break;
 case 249: 
 var $1510;
 if($1510){label=250;break;}else{label=259;break;}
 case 250: 
 var $1512=$mixmask;
 var $1513=($1512&255);
 var $1514=$1513<<1;
 var $1515=(($1514)&255);
 $mixmask=$1515;
 var $1516=$mixmask;
 var $1517=($1516&255);
 var $1518=($1517|0)==0;
 if($1518){label=251;break;}else{label=255;break;}
 case 251: 
 var $1520=$fom_mask;
 var $1521=($1520|0)!=0;
 if($1521){label=252;break;}else{label=253;break;}
 case 252: 
 var $1523=$fom_mask;
 var $1530=$1523;label=254;break;
 case 253: 
 var $1525=$5;
 var $1526=(($1525+1)|0);
 $5=$1526;
 var $1527=HEAP8[($1525)];
 var $1528=($1527&255);
 var $1530=$1528;label=254;break;
 case 254: 
 var $1530;
 var $1531=(($1530)&255);
 $mask=$1531;
 $mixmask=1;
 label=255;break;
 case 255: 
 var $1533=$mask;
 var $1534=($1533&255);
 var $1535=$mixmask;
 var $1536=($1535&255);
 var $1537=$1534&$1536;
 var $1538=($1537|0)!=0;
 if($1538){label=256;break;}else{label=257;break;}
 case 256: 
 var $1540=$x;
 var $1541=$prevline;
 var $1542=(($1541+$1540)|0);
 var $1543=HEAP8[($1542)];
 var $1544=($1543&255);
 var $1545=$mix;
 var $1546=($1545&255);
 var $1547=$1544^$1546;
 var $1548=(($1547)&255);
 var $1549=$x;
 var $1550=$line;
 var $1551=(($1550+$1549)|0);
 HEAP8[($1551)]=$1548;
 label=258;break;
 case 257: 
 var $1553=$x;
 var $1554=$prevline;
 var $1555=(($1554+$1553)|0);
 var $1556=HEAP8[($1555)];
 var $1557=$x;
 var $1558=$line;
 var $1559=(($1558+$1557)|0);
 HEAP8[($1559)]=$1556;
 label=258;break;
 case 258: 
 var $1561=$count;
 var $1562=((($1561)-(1))|0);
 $count=$1562;
 var $1563=$x;
 var $1564=((($1563)+(1))|0);
 $x=$1564;
 label=247;break;
 case 259: 
 label=260;break;
 case 260: 
 label=344;break;
 case 261: 
 label=262;break;
 case 262: 
 var $1569=$count;
 var $1570=$1569&-8;
 var $1571=($1570|0)!=0;
 if($1571){label=263;break;}else{var $1578=0;label=264;break;}
 case 263: 
 var $1573=$x;
 var $1574=((($1573)+(8))|0);
 var $1575=$3;
 var $1576=($1574|0)<($1575|0);
 var $1578=$1576;label=264;break;
 case 264: 
 var $1578;
 if($1578){label=265;break;}else{label=266;break;}
 case 265: 
 var $1580=$colour2;
 var $1581=$x;
 var $1582=$line;
 var $1583=(($1582+$1581)|0);
 HEAP8[($1583)]=$1580;
 var $1584=$count;
 var $1585=((($1584)-(1))|0);
 $count=$1585;
 var $1586=$x;
 var $1587=((($1586)+(1))|0);
 $x=$1587;
 var $1588=$colour2;
 var $1589=$x;
 var $1590=$line;
 var $1591=(($1590+$1589)|0);
 HEAP8[($1591)]=$1588;
 var $1592=$count;
 var $1593=((($1592)-(1))|0);
 $count=$1593;
 var $1594=$x;
 var $1595=((($1594)+(1))|0);
 $x=$1595;
 var $1596=$colour2;
 var $1597=$x;
 var $1598=$line;
 var $1599=(($1598+$1597)|0);
 HEAP8[($1599)]=$1596;
 var $1600=$count;
 var $1601=((($1600)-(1))|0);
 $count=$1601;
 var $1602=$x;
 var $1603=((($1602)+(1))|0);
 $x=$1603;
 var $1604=$colour2;
 var $1605=$x;
 var $1606=$line;
 var $1607=(($1606+$1605)|0);
 HEAP8[($1607)]=$1604;
 var $1608=$count;
 var $1609=((($1608)-(1))|0);
 $count=$1609;
 var $1610=$x;
 var $1611=((($1610)+(1))|0);
 $x=$1611;
 var $1612=$colour2;
 var $1613=$x;
 var $1614=$line;
 var $1615=(($1614+$1613)|0);
 HEAP8[($1615)]=$1612;
 var $1616=$count;
 var $1617=((($1616)-(1))|0);
 $count=$1617;
 var $1618=$x;
 var $1619=((($1618)+(1))|0);
 $x=$1619;
 var $1620=$colour2;
 var $1621=$x;
 var $1622=$line;
 var $1623=(($1622+$1621)|0);
 HEAP8[($1623)]=$1620;
 var $1624=$count;
 var $1625=((($1624)-(1))|0);
 $count=$1625;
 var $1626=$x;
 var $1627=((($1626)+(1))|0);
 $x=$1627;
 var $1628=$colour2;
 var $1629=$x;
 var $1630=$line;
 var $1631=(($1630+$1629)|0);
 HEAP8[($1631)]=$1628;
 var $1632=$count;
 var $1633=((($1632)-(1))|0);
 $count=$1633;
 var $1634=$x;
 var $1635=((($1634)+(1))|0);
 $x=$1635;
 var $1636=$colour2;
 var $1637=$x;
 var $1638=$line;
 var $1639=(($1638+$1637)|0);
 HEAP8[($1639)]=$1636;
 var $1640=$count;
 var $1641=((($1640)-(1))|0);
 $count=$1641;
 var $1642=$x;
 var $1643=((($1642)+(1))|0);
 $x=$1643;
 label=262;break;
 case 266: 
 label=267;break;
 case 267: 
 var $1646=$count;
 var $1647=($1646|0)>0;
 if($1647){label=268;break;}else{var $1653=0;label=269;break;}
 case 268: 
 var $1649=$x;
 var $1650=$3;
 var $1651=($1649|0)<($1650|0);
 var $1653=$1651;label=269;break;
 case 269: 
 var $1653;
 if($1653){label=270;break;}else{label=271;break;}
 case 270: 
 var $1655=$colour2;
 var $1656=$x;
 var $1657=$line;
 var $1658=(($1657+$1656)|0);
 HEAP8[($1658)]=$1655;
 var $1659=$count;
 var $1660=((($1659)-(1))|0);
 $count=$1660;
 var $1661=$x;
 var $1662=((($1661)+(1))|0);
 $x=$1662;
 label=267;break;
 case 271: 
 label=344;break;
 case 272: 
 label=273;break;
 case 273: 
 var $1666=$count;
 var $1667=$1666&-8;
 var $1668=($1667|0)!=0;
 if($1668){label=274;break;}else{var $1675=0;label=275;break;}
 case 274: 
 var $1670=$x;
 var $1671=((($1670)+(8))|0);
 var $1672=$3;
 var $1673=($1671|0)<($1672|0);
 var $1675=$1673;label=275;break;
 case 275: 
 var $1675;
 if($1675){label=276;break;}else{label=277;break;}
 case 276: 
 var $1677=$5;
 var $1678=(($1677+1)|0);
 $5=$1678;
 var $1679=HEAP8[($1677)];
 var $1680=$x;
 var $1681=$line;
 var $1682=(($1681+$1680)|0);
 HEAP8[($1682)]=$1679;
 var $1683=$count;
 var $1684=((($1683)-(1))|0);
 $count=$1684;
 var $1685=$x;
 var $1686=((($1685)+(1))|0);
 $x=$1686;
 var $1687=$5;
 var $1688=(($1687+1)|0);
 $5=$1688;
 var $1689=HEAP8[($1687)];
 var $1690=$x;
 var $1691=$line;
 var $1692=(($1691+$1690)|0);
 HEAP8[($1692)]=$1689;
 var $1693=$count;
 var $1694=((($1693)-(1))|0);
 $count=$1694;
 var $1695=$x;
 var $1696=((($1695)+(1))|0);
 $x=$1696;
 var $1697=$5;
 var $1698=(($1697+1)|0);
 $5=$1698;
 var $1699=HEAP8[($1697)];
 var $1700=$x;
 var $1701=$line;
 var $1702=(($1701+$1700)|0);
 HEAP8[($1702)]=$1699;
 var $1703=$count;
 var $1704=((($1703)-(1))|0);
 $count=$1704;
 var $1705=$x;
 var $1706=((($1705)+(1))|0);
 $x=$1706;
 var $1707=$5;
 var $1708=(($1707+1)|0);
 $5=$1708;
 var $1709=HEAP8[($1707)];
 var $1710=$x;
 var $1711=$line;
 var $1712=(($1711+$1710)|0);
 HEAP8[($1712)]=$1709;
 var $1713=$count;
 var $1714=((($1713)-(1))|0);
 $count=$1714;
 var $1715=$x;
 var $1716=((($1715)+(1))|0);
 $x=$1716;
 var $1717=$5;
 var $1718=(($1717+1)|0);
 $5=$1718;
 var $1719=HEAP8[($1717)];
 var $1720=$x;
 var $1721=$line;
 var $1722=(($1721+$1720)|0);
 HEAP8[($1722)]=$1719;
 var $1723=$count;
 var $1724=((($1723)-(1))|0);
 $count=$1724;
 var $1725=$x;
 var $1726=((($1725)+(1))|0);
 $x=$1726;
 var $1727=$5;
 var $1728=(($1727+1)|0);
 $5=$1728;
 var $1729=HEAP8[($1727)];
 var $1730=$x;
 var $1731=$line;
 var $1732=(($1731+$1730)|0);
 HEAP8[($1732)]=$1729;
 var $1733=$count;
 var $1734=((($1733)-(1))|0);
 $count=$1734;
 var $1735=$x;
 var $1736=((($1735)+(1))|0);
 $x=$1736;
 var $1737=$5;
 var $1738=(($1737+1)|0);
 $5=$1738;
 var $1739=HEAP8[($1737)];
 var $1740=$x;
 var $1741=$line;
 var $1742=(($1741+$1740)|0);
 HEAP8[($1742)]=$1739;
 var $1743=$count;
 var $1744=((($1743)-(1))|0);
 $count=$1744;
 var $1745=$x;
 var $1746=((($1745)+(1))|0);
 $x=$1746;
 var $1747=$5;
 var $1748=(($1747+1)|0);
 $5=$1748;
 var $1749=HEAP8[($1747)];
 var $1750=$x;
 var $1751=$line;
 var $1752=(($1751+$1750)|0);
 HEAP8[($1752)]=$1749;
 var $1753=$count;
 var $1754=((($1753)-(1))|0);
 $count=$1754;
 var $1755=$x;
 var $1756=((($1755)+(1))|0);
 $x=$1756;
 label=273;break;
 case 277: 
 label=278;break;
 case 278: 
 var $1759=$count;
 var $1760=($1759|0)>0;
 if($1760){label=279;break;}else{var $1766=0;label=280;break;}
 case 279: 
 var $1762=$x;
 var $1763=$3;
 var $1764=($1762|0)<($1763|0);
 var $1766=$1764;label=280;break;
 case 280: 
 var $1766;
 if($1766){label=281;break;}else{label=282;break;}
 case 281: 
 var $1768=$5;
 var $1769=(($1768+1)|0);
 $5=$1769;
 var $1770=HEAP8[($1768)];
 var $1771=$x;
 var $1772=$line;
 var $1773=(($1772+$1771)|0);
 HEAP8[($1773)]=$1770;
 var $1774=$count;
 var $1775=((($1774)-(1))|0);
 $count=$1775;
 var $1776=$x;
 var $1777=((($1776)+(1))|0);
 $x=$1777;
 label=278;break;
 case 282: 
 label=344;break;
 case 283: 
 label=284;break;
 case 284: 
 var $1781=$count;
 var $1782=$1781&-8;
 var $1783=($1782|0)!=0;
 if($1783){label=285;break;}else{var $1790=0;label=286;break;}
 case 285: 
 var $1785=$x;
 var $1786=((($1785)+(8))|0);
 var $1787=$3;
 var $1788=($1786|0)<($1787|0);
 var $1790=$1788;label=286;break;
 case 286: 
 var $1790;
 if($1790){label=287;break;}else{label=312;break;}
 case 287: 
 var $1792=$bicolour;
 var $1793=($1792|0)!=0;
 if($1793){label=288;break;}else{label=289;break;}
 case 288: 
 var $1795=$colour2;
 var $1796=$x;
 var $1797=$line;
 var $1798=(($1797+$1796)|0);
 HEAP8[($1798)]=$1795;
 $bicolour=0;
 label=290;break;
 case 289: 
 var $1800=$colour1;
 var $1801=$x;
 var $1802=$line;
 var $1803=(($1802+$1801)|0);
 HEAP8[($1803)]=$1800;
 $bicolour=1;
 var $1804=$count;
 var $1805=((($1804)+(1))|0);
 $count=$1805;
 label=290;break;
 case 290: 
 var $1807=$count;
 var $1808=((($1807)-(1))|0);
 $count=$1808;
 var $1809=$x;
 var $1810=((($1809)+(1))|0);
 $x=$1810;
 var $1811=$bicolour;
 var $1812=($1811|0)!=0;
 if($1812){label=291;break;}else{label=292;break;}
 case 291: 
 var $1814=$colour2;
 var $1815=$x;
 var $1816=$line;
 var $1817=(($1816+$1815)|0);
 HEAP8[($1817)]=$1814;
 $bicolour=0;
 label=293;break;
 case 292: 
 var $1819=$colour1;
 var $1820=$x;
 var $1821=$line;
 var $1822=(($1821+$1820)|0);
 HEAP8[($1822)]=$1819;
 $bicolour=1;
 var $1823=$count;
 var $1824=((($1823)+(1))|0);
 $count=$1824;
 label=293;break;
 case 293: 
 var $1826=$count;
 var $1827=((($1826)-(1))|0);
 $count=$1827;
 var $1828=$x;
 var $1829=((($1828)+(1))|0);
 $x=$1829;
 var $1830=$bicolour;
 var $1831=($1830|0)!=0;
 if($1831){label=294;break;}else{label=295;break;}
 case 294: 
 var $1833=$colour2;
 var $1834=$x;
 var $1835=$line;
 var $1836=(($1835+$1834)|0);
 HEAP8[($1836)]=$1833;
 $bicolour=0;
 label=296;break;
 case 295: 
 var $1838=$colour1;
 var $1839=$x;
 var $1840=$line;
 var $1841=(($1840+$1839)|0);
 HEAP8[($1841)]=$1838;
 $bicolour=1;
 var $1842=$count;
 var $1843=((($1842)+(1))|0);
 $count=$1843;
 label=296;break;
 case 296: 
 var $1845=$count;
 var $1846=((($1845)-(1))|0);
 $count=$1846;
 var $1847=$x;
 var $1848=((($1847)+(1))|0);
 $x=$1848;
 var $1849=$bicolour;
 var $1850=($1849|0)!=0;
 if($1850){label=297;break;}else{label=298;break;}
 case 297: 
 var $1852=$colour2;
 var $1853=$x;
 var $1854=$line;
 var $1855=(($1854+$1853)|0);
 HEAP8[($1855)]=$1852;
 $bicolour=0;
 label=299;break;
 case 298: 
 var $1857=$colour1;
 var $1858=$x;
 var $1859=$line;
 var $1860=(($1859+$1858)|0);
 HEAP8[($1860)]=$1857;
 $bicolour=1;
 var $1861=$count;
 var $1862=((($1861)+(1))|0);
 $count=$1862;
 label=299;break;
 case 299: 
 var $1864=$count;
 var $1865=((($1864)-(1))|0);
 $count=$1865;
 var $1866=$x;
 var $1867=((($1866)+(1))|0);
 $x=$1867;
 var $1868=$bicolour;
 var $1869=($1868|0)!=0;
 if($1869){label=300;break;}else{label=301;break;}
 case 300: 
 var $1871=$colour2;
 var $1872=$x;
 var $1873=$line;
 var $1874=(($1873+$1872)|0);
 HEAP8[($1874)]=$1871;
 $bicolour=0;
 label=302;break;
 case 301: 
 var $1876=$colour1;
 var $1877=$x;
 var $1878=$line;
 var $1879=(($1878+$1877)|0);
 HEAP8[($1879)]=$1876;
 $bicolour=1;
 var $1880=$count;
 var $1881=((($1880)+(1))|0);
 $count=$1881;
 label=302;break;
 case 302: 
 var $1883=$count;
 var $1884=((($1883)-(1))|0);
 $count=$1884;
 var $1885=$x;
 var $1886=((($1885)+(1))|0);
 $x=$1886;
 var $1887=$bicolour;
 var $1888=($1887|0)!=0;
 if($1888){label=303;break;}else{label=304;break;}
 case 303: 
 var $1890=$colour2;
 var $1891=$x;
 var $1892=$line;
 var $1893=(($1892+$1891)|0);
 HEAP8[($1893)]=$1890;
 $bicolour=0;
 label=305;break;
 case 304: 
 var $1895=$colour1;
 var $1896=$x;
 var $1897=$line;
 var $1898=(($1897+$1896)|0);
 HEAP8[($1898)]=$1895;
 $bicolour=1;
 var $1899=$count;
 var $1900=((($1899)+(1))|0);
 $count=$1900;
 label=305;break;
 case 305: 
 var $1902=$count;
 var $1903=((($1902)-(1))|0);
 $count=$1903;
 var $1904=$x;
 var $1905=((($1904)+(1))|0);
 $x=$1905;
 var $1906=$bicolour;
 var $1907=($1906|0)!=0;
 if($1907){label=306;break;}else{label=307;break;}
 case 306: 
 var $1909=$colour2;
 var $1910=$x;
 var $1911=$line;
 var $1912=(($1911+$1910)|0);
 HEAP8[($1912)]=$1909;
 $bicolour=0;
 label=308;break;
 case 307: 
 var $1914=$colour1;
 var $1915=$x;
 var $1916=$line;
 var $1917=(($1916+$1915)|0);
 HEAP8[($1917)]=$1914;
 $bicolour=1;
 var $1918=$count;
 var $1919=((($1918)+(1))|0);
 $count=$1919;
 label=308;break;
 case 308: 
 var $1921=$count;
 var $1922=((($1921)-(1))|0);
 $count=$1922;
 var $1923=$x;
 var $1924=((($1923)+(1))|0);
 $x=$1924;
 var $1925=$bicolour;
 var $1926=($1925|0)!=0;
 if($1926){label=309;break;}else{label=310;break;}
 case 309: 
 var $1928=$colour2;
 var $1929=$x;
 var $1930=$line;
 var $1931=(($1930+$1929)|0);
 HEAP8[($1931)]=$1928;
 $bicolour=0;
 label=311;break;
 case 310: 
 var $1933=$colour1;
 var $1934=$x;
 var $1935=$line;
 var $1936=(($1935+$1934)|0);
 HEAP8[($1936)]=$1933;
 $bicolour=1;
 var $1937=$count;
 var $1938=((($1937)+(1))|0);
 $count=$1938;
 label=311;break;
 case 311: 
 var $1940=$count;
 var $1941=((($1940)-(1))|0);
 $count=$1941;
 var $1942=$x;
 var $1943=((($1942)+(1))|0);
 $x=$1943;
 label=284;break;
 case 312: 
 label=313;break;
 case 313: 
 var $1946=$count;
 var $1947=($1946|0)>0;
 if($1947){label=314;break;}else{var $1953=0;label=315;break;}
 case 314: 
 var $1949=$x;
 var $1950=$3;
 var $1951=($1949|0)<($1950|0);
 var $1953=$1951;label=315;break;
 case 315: 
 var $1953;
 if($1953){label=316;break;}else{label=320;break;}
 case 316: 
 var $1955=$bicolour;
 var $1956=($1955|0)!=0;
 if($1956){label=317;break;}else{label=318;break;}
 case 317: 
 var $1958=$colour2;
 var $1959=$x;
 var $1960=$line;
 var $1961=(($1960+$1959)|0);
 HEAP8[($1961)]=$1958;
 $bicolour=0;
 label=319;break;
 case 318: 
 var $1963=$colour1;
 var $1964=$x;
 var $1965=$line;
 var $1966=(($1965+$1964)|0);
 HEAP8[($1966)]=$1963;
 $bicolour=1;
 var $1967=$count;
 var $1968=((($1967)+(1))|0);
 $count=$1968;
 label=319;break;
 case 319: 
 var $1970=$count;
 var $1971=((($1970)-(1))|0);
 $count=$1971;
 var $1972=$x;
 var $1973=((($1972)+(1))|0);
 $x=$1973;
 label=313;break;
 case 320: 
 label=344;break;
 case 321: 
 label=322;break;
 case 322: 
 var $1977=$count;
 var $1978=$1977&-8;
 var $1979=($1978|0)!=0;
 if($1979){label=323;break;}else{var $1986=0;label=324;break;}
 case 323: 
 var $1981=$x;
 var $1982=((($1981)+(8))|0);
 var $1983=$3;
 var $1984=($1982|0)<($1983|0);
 var $1986=$1984;label=324;break;
 case 324: 
 var $1986;
 if($1986){label=325;break;}else{label=326;break;}
 case 325: 
 var $1988=$x;
 var $1989=$line;
 var $1990=(($1989+$1988)|0);
 HEAP8[($1990)]=-1;
 var $1991=$count;
 var $1992=((($1991)-(1))|0);
 $count=$1992;
 var $1993=$x;
 var $1994=((($1993)+(1))|0);
 $x=$1994;
 var $1995=$x;
 var $1996=$line;
 var $1997=(($1996+$1995)|0);
 HEAP8[($1997)]=-1;
 var $1998=$count;
 var $1999=((($1998)-(1))|0);
 $count=$1999;
 var $2000=$x;
 var $2001=((($2000)+(1))|0);
 $x=$2001;
 var $2002=$x;
 var $2003=$line;
 var $2004=(($2003+$2002)|0);
 HEAP8[($2004)]=-1;
 var $2005=$count;
 var $2006=((($2005)-(1))|0);
 $count=$2006;
 var $2007=$x;
 var $2008=((($2007)+(1))|0);
 $x=$2008;
 var $2009=$x;
 var $2010=$line;
 var $2011=(($2010+$2009)|0);
 HEAP8[($2011)]=-1;
 var $2012=$count;
 var $2013=((($2012)-(1))|0);
 $count=$2013;
 var $2014=$x;
 var $2015=((($2014)+(1))|0);
 $x=$2015;
 var $2016=$x;
 var $2017=$line;
 var $2018=(($2017+$2016)|0);
 HEAP8[($2018)]=-1;
 var $2019=$count;
 var $2020=((($2019)-(1))|0);
 $count=$2020;
 var $2021=$x;
 var $2022=((($2021)+(1))|0);
 $x=$2022;
 var $2023=$x;
 var $2024=$line;
 var $2025=(($2024+$2023)|0);
 HEAP8[($2025)]=-1;
 var $2026=$count;
 var $2027=((($2026)-(1))|0);
 $count=$2027;
 var $2028=$x;
 var $2029=((($2028)+(1))|0);
 $x=$2029;
 var $2030=$x;
 var $2031=$line;
 var $2032=(($2031+$2030)|0);
 HEAP8[($2032)]=-1;
 var $2033=$count;
 var $2034=((($2033)-(1))|0);
 $count=$2034;
 var $2035=$x;
 var $2036=((($2035)+(1))|0);
 $x=$2036;
 var $2037=$x;
 var $2038=$line;
 var $2039=(($2038+$2037)|0);
 HEAP8[($2039)]=-1;
 var $2040=$count;
 var $2041=((($2040)-(1))|0);
 $count=$2041;
 var $2042=$x;
 var $2043=((($2042)+(1))|0);
 $x=$2043;
 label=322;break;
 case 326: 
 label=327;break;
 case 327: 
 var $2046=$count;
 var $2047=($2046|0)>0;
 if($2047){label=328;break;}else{var $2053=0;label=329;break;}
 case 328: 
 var $2049=$x;
 var $2050=$3;
 var $2051=($2049|0)<($2050|0);
 var $2053=$2051;label=329;break;
 case 329: 
 var $2053;
 if($2053){label=330;break;}else{label=331;break;}
 case 330: 
 var $2055=$x;
 var $2056=$line;
 var $2057=(($2056+$2055)|0);
 HEAP8[($2057)]=-1;
 var $2058=$count;
 var $2059=((($2058)-(1))|0);
 $count=$2059;
 var $2060=$x;
 var $2061=((($2060)+(1))|0);
 $x=$2061;
 label=327;break;
 case 331: 
 label=344;break;
 case 332: 
 label=333;break;
 case 333: 
 var $2065=$count;
 var $2066=$2065&-8;
 var $2067=($2066|0)!=0;
 if($2067){label=334;break;}else{var $2074=0;label=335;break;}
 case 334: 
 var $2069=$x;
 var $2070=((($2069)+(8))|0);
 var $2071=$3;
 var $2072=($2070|0)<($2071|0);
 var $2074=$2072;label=335;break;
 case 335: 
 var $2074;
 if($2074){label=336;break;}else{label=337;break;}
 case 336: 
 var $2076=$x;
 var $2077=$line;
 var $2078=(($2077+$2076)|0);
 HEAP8[($2078)]=0;
 var $2079=$count;
 var $2080=((($2079)-(1))|0);
 $count=$2080;
 var $2081=$x;
 var $2082=((($2081)+(1))|0);
 $x=$2082;
 var $2083=$x;
 var $2084=$line;
 var $2085=(($2084+$2083)|0);
 HEAP8[($2085)]=0;
 var $2086=$count;
 var $2087=((($2086)-(1))|0);
 $count=$2087;
 var $2088=$x;
 var $2089=((($2088)+(1))|0);
 $x=$2089;
 var $2090=$x;
 var $2091=$line;
 var $2092=(($2091+$2090)|0);
 HEAP8[($2092)]=0;
 var $2093=$count;
 var $2094=((($2093)-(1))|0);
 $count=$2094;
 var $2095=$x;
 var $2096=((($2095)+(1))|0);
 $x=$2096;
 var $2097=$x;
 var $2098=$line;
 var $2099=(($2098+$2097)|0);
 HEAP8[($2099)]=0;
 var $2100=$count;
 var $2101=((($2100)-(1))|0);
 $count=$2101;
 var $2102=$x;
 var $2103=((($2102)+(1))|0);
 $x=$2103;
 var $2104=$x;
 var $2105=$line;
 var $2106=(($2105+$2104)|0);
 HEAP8[($2106)]=0;
 var $2107=$count;
 var $2108=((($2107)-(1))|0);
 $count=$2108;
 var $2109=$x;
 var $2110=((($2109)+(1))|0);
 $x=$2110;
 var $2111=$x;
 var $2112=$line;
 var $2113=(($2112+$2111)|0);
 HEAP8[($2113)]=0;
 var $2114=$count;
 var $2115=((($2114)-(1))|0);
 $count=$2115;
 var $2116=$x;
 var $2117=((($2116)+(1))|0);
 $x=$2117;
 var $2118=$x;
 var $2119=$line;
 var $2120=(($2119+$2118)|0);
 HEAP8[($2120)]=0;
 var $2121=$count;
 var $2122=((($2121)-(1))|0);
 $count=$2122;
 var $2123=$x;
 var $2124=((($2123)+(1))|0);
 $x=$2124;
 var $2125=$x;
 var $2126=$line;
 var $2127=(($2126+$2125)|0);
 HEAP8[($2127)]=0;
 var $2128=$count;
 var $2129=((($2128)-(1))|0);
 $count=$2129;
 var $2130=$x;
 var $2131=((($2130)+(1))|0);
 $x=$2131;
 label=333;break;
 case 337: 
 label=338;break;
 case 338: 
 var $2134=$count;
 var $2135=($2134|0)>0;
 if($2135){label=339;break;}else{var $2141=0;label=340;break;}
 case 339: 
 var $2137=$x;
 var $2138=$3;
 var $2139=($2137|0)<($2138|0);
 var $2141=$2139;label=340;break;
 case 340: 
 var $2141;
 if($2141){label=341;break;}else{label=342;break;}
 case 341: 
 var $2143=$x;
 var $2144=$line;
 var $2145=(($2144+$2143)|0);
 HEAP8[($2145)]=0;
 var $2146=$count;
 var $2147=((($2146)-(1))|0);
 $count=$2147;
 var $2148=$x;
 var $2149=((($2148)+(1))|0);
 $x=$2149;
 label=338;break;
 case 342: 
 label=344;break;
 case 343: 
 $1=0;
 label=347;break;
 case 344: 
 label=34;break;
 case 345: 
 label=2;break;
 case 346: 
 $1=1;
 label=347;break;
 case 347: 
 var $2156=$1;
 STACKTOP=sp;return $2156;
  default: assert(0, "bad label: " + label);
 }

}
Module["_bitmap_decompress1"] = _bitmap_decompress1;

function _bitmap_decompress2($output,$width,$height,$input,$size){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $end;
 var $prevline;
 var $line;
 var $opcode;
 var $count;
 var $offset;
 var $isfillormix;
 var $x;
 var $lastopcode;
 var $insertmix;
 var $bicolour;
 var $code;
 var $colour1;
 var $colour2;
 var $mixmask;
 var $mask;
 var $mix;
 var $fom_mask;
 $2=$output;
 $3=$width;
 $4=$height;
 $5=$input;
 $6=$size;
 var $7=$5;
 var $8=$6;
 var $9=(($7+$8)|0);
 $end=$9;
 $prevline=0;
 $line=0;
 var $10=$3;
 $x=$10;
 $lastopcode=-1;
 $insertmix=0;
 $bicolour=0;
 $colour1=0;
 $colour2=0;
 $mask=0;
 $mix=-1;
 $fom_mask=0;
 label=2;break;
 case 2: 
 var $12=$5;
 var $13=$end;
 var $14=($12>>>0)<($13>>>0);
 if($14){label=3;break;}else{label=346;break;}
 case 3: 
 $fom_mask=0;
 var $16=$5;
 var $17=(($16+1)|0);
 $5=$17;
 var $18=HEAP8[($16)];
 $code=$18;
 var $19=$code;
 var $20=($19&255);
 var $21=$20>>4;
 $opcode=$21;
 var $22=$opcode;
 if(($22|0)==12|($22|0)==13|($22|0)==14){ label=4;break;}else if(($22|0)==15){ label=5;break;}else{label=9;break;}
 case 4: 
 var $24=$opcode;
 var $25=((($24)-(6))|0);
 $opcode=$25;
 var $26=$code;
 var $27=($26&255);
 var $28=$27&15;
 $count=$28;
 $offset=16;
 label=10;break;
 case 5: 
 var $30=$code;
 var $31=($30&255);
 var $32=$31&15;
 $opcode=$32;
 var $33=$opcode;
 var $34=($33|0)<9;
 if($34){label=6;break;}else{label=7;break;}
 case 6: 
 var $36=$5;
 var $37=(($36+1)|0);
 $5=$37;
 var $38=HEAP8[($36)];
 var $39=($38&255);
 $count=$39;
 var $40=$5;
 var $41=(($40+1)|0);
 $5=$41;
 var $42=HEAP8[($40)];
 var $43=($42&255);
 var $44=$43<<8;
 var $45=$count;
 var $46=$45|$44;
 $count=$46;
 label=8;break;
 case 7: 
 var $48=$opcode;
 var $49=($48|0)<11;
 var $50=($49?8:1);
 $count=$50;
 label=8;break;
 case 8: 
 $offset=0;
 label=10;break;
 case 9: 
 var $53=$opcode;
 var $54=$53>>1;
 $opcode=$54;
 var $55=$code;
 var $56=($55&255);
 var $57=$56&31;
 $count=$57;
 $offset=32;
 label=10;break;
 case 10: 
 var $59=$offset;
 var $60=($59|0)!=0;
 if($60){label=11;break;}else{label=22;break;}
 case 11: 
 var $62=$opcode;
 var $63=($62|0)==2;
 if($63){var $68=1;label=13;break;}else{label=12;break;}
 case 12: 
 var $65=$opcode;
 var $66=($65|0)==7;
 var $68=$66;label=13;break;
 case 13: 
 var $68;
 var $69=($68&1);
 $isfillormix=$69;
 var $70=$count;
 var $71=($70|0)==0;
 if($71){label=14;break;}else{label=18;break;}
 case 14: 
 var $73=$isfillormix;
 var $74=($73|0)!=0;
 if($74){label=15;break;}else{label=16;break;}
 case 15: 
 var $76=$5;
 var $77=(($76+1)|0);
 $5=$77;
 var $78=HEAP8[($76)];
 var $79=($78&255);
 var $80=((($79)+(1))|0);
 $count=$80;
 label=17;break;
 case 16: 
 var $82=$5;
 var $83=(($82+1)|0);
 $5=$83;
 var $84=HEAP8[($82)];
 var $85=($84&255);
 var $86=$offset;
 var $87=((($85)+($86))|0);
 $count=$87;
 label=17;break;
 case 17: 
 label=21;break;
 case 18: 
 var $90=$isfillormix;
 var $91=($90|0)!=0;
 if($91){label=19;break;}else{label=20;break;}
 case 19: 
 var $93=$count;
 var $94=$93<<3;
 $count=$94;
 label=20;break;
 case 20: 
 label=21;break;
 case 21: 
 label=22;break;
 case 22: 
 var $98=$opcode;
 switch(($98|0)){case 0:{ label=23;break;}case 8:{ label=28;break;}case 3:{ label=29;break;}case 6:case 7:{ label=30;break;}case 9:{ label=31;break;}case 10:{ label=32;break;}default:{label=33;break;}}break;
 case 23: 
 var $100=$lastopcode;
 var $101=$opcode;
 var $102=($100|0)==($101|0);
 if($102){label=24;break;}else{label=27;break;}
 case 24: 
 var $104=$x;
 var $105=$3;
 var $106=($104|0)==($105|0);
 if($106){label=25;break;}else{label=26;break;}
 case 25: 
 var $108=$prevline;
 var $109=($108|0)==0;
 if($109){label=27;break;}else{label=26;break;}
 case 26: 
 $insertmix=1;
 label=27;break;
 case 27: 
 label=33;break;
 case 28: 
 var $113=$5;
 var $114=$113;
 var $115=HEAP16[(($114)>>1)];
 $colour1=$115;
 var $116=$5;
 var $117=(($116+2)|0);
 $5=$117;
 label=29;break;
 case 29: 
 var $119=$5;
 var $120=$119;
 var $121=HEAP16[(($120)>>1)];
 $colour2=$121;
 var $122=$5;
 var $123=(($122+2)|0);
 $5=$123;
 label=33;break;
 case 30: 
 var $125=$5;
 var $126=$125;
 var $127=HEAP16[(($126)>>1)];
 $mix=$127;
 var $128=$5;
 var $129=(($128+2)|0);
 $5=$129;
 var $130=$opcode;
 var $131=((($130)-(5))|0);
 $opcode=$131;
 label=33;break;
 case 31: 
 $mask=3;
 $opcode=2;
 $fom_mask=3;
 label=33;break;
 case 32: 
 $mask=5;
 $opcode=2;
 $fom_mask=5;
 label=33;break;
 case 33: 
 var $135=$opcode;
 $lastopcode=$135;
 $mixmask=0;
 label=34;break;
 case 34: 
 var $137=$count;
 var $138=($137|0)>0;
 if($138){label=35;break;}else{label=345;break;}
 case 35: 
 var $140=$x;
 var $141=$3;
 var $142=($140|0)>=($141|0);
 if($142){label=36;break;}else{label=39;break;}
 case 36: 
 var $144=$4;
 var $145=($144|0)<=0;
 if($145){label=37;break;}else{label=38;break;}
 case 37: 
 $1=0;
 label=347;break;
 case 38: 
 $x=0;
 var $148=$4;
 var $149=((($148)-(1))|0);
 $4=$149;
 var $150=$line;
 $prevline=$150;
 var $151=$2;
 var $152=$151;
 var $153=$4;
 var $154=$3;
 var $155=(Math_imul($153,$154)|0);
 var $156=(($152+($155<<1))|0);
 $line=$156;
 label=39;break;
 case 39: 
 var $158=$opcode;
 switch(($158|0)){case 3:{ label=261;break;}case 4:{ label=272;break;}case 8:{ label=283;break;}case 13:{ label=321;break;}case 14:{ label=332;break;}case 0:{ label=40;break;}case 1:{ label=69;break;}case 2:{ label=93;break;}default:{label=343;break;}}break;
 case 40: 
 var $160=$insertmix;
 var $161=($160|0)!=0;
 if($161){label=41;break;}else{label=45;break;}
 case 41: 
 var $163=$prevline;
 var $164=($163|0)==0;
 if($164){label=42;break;}else{label=43;break;}
 case 42: 
 var $166=$mix;
 var $167=$x;
 var $168=$line;
 var $169=(($168+($167<<1))|0);
 HEAP16[(($169)>>1)]=$166;
 label=44;break;
 case 43: 
 var $171=$x;
 var $172=$prevline;
 var $173=(($172+($171<<1))|0);
 var $174=HEAP16[(($173)>>1)];
 var $175=($174&65535);
 var $176=$mix;
 var $177=($176&65535);
 var $178=$175^$177;
 var $179=(($178)&65535);
 var $180=$x;
 var $181=$line;
 var $182=(($181+($180<<1))|0);
 HEAP16[(($182)>>1)]=$179;
 label=44;break;
 case 44: 
 $insertmix=0;
 var $184=$count;
 var $185=((($184)-(1))|0);
 $count=$185;
 var $186=$x;
 var $187=((($186)+(1))|0);
 $x=$187;
 label=45;break;
 case 45: 
 var $189=$prevline;
 var $190=($189|0)==0;
 if($190){label=46;break;}else{label=57;break;}
 case 46: 
 label=47;break;
 case 47: 
 var $193=$count;
 var $194=$193&-8;
 var $195=($194|0)!=0;
 if($195){label=48;break;}else{var $202=0;label=49;break;}
 case 48: 
 var $197=$x;
 var $198=((($197)+(8))|0);
 var $199=$3;
 var $200=($198|0)<($199|0);
 var $202=$200;label=49;break;
 case 49: 
 var $202;
 if($202){label=50;break;}else{label=51;break;}
 case 50: 
 var $204=$x;
 var $205=$line;
 var $206=(($205+($204<<1))|0);
 HEAP16[(($206)>>1)]=0;
 var $207=$count;
 var $208=((($207)-(1))|0);
 $count=$208;
 var $209=$x;
 var $210=((($209)+(1))|0);
 $x=$210;
 var $211=$x;
 var $212=$line;
 var $213=(($212+($211<<1))|0);
 HEAP16[(($213)>>1)]=0;
 var $214=$count;
 var $215=((($214)-(1))|0);
 $count=$215;
 var $216=$x;
 var $217=((($216)+(1))|0);
 $x=$217;
 var $218=$x;
 var $219=$line;
 var $220=(($219+($218<<1))|0);
 HEAP16[(($220)>>1)]=0;
 var $221=$count;
 var $222=((($221)-(1))|0);
 $count=$222;
 var $223=$x;
 var $224=((($223)+(1))|0);
 $x=$224;
 var $225=$x;
 var $226=$line;
 var $227=(($226+($225<<1))|0);
 HEAP16[(($227)>>1)]=0;
 var $228=$count;
 var $229=((($228)-(1))|0);
 $count=$229;
 var $230=$x;
 var $231=((($230)+(1))|0);
 $x=$231;
 var $232=$x;
 var $233=$line;
 var $234=(($233+($232<<1))|0);
 HEAP16[(($234)>>1)]=0;
 var $235=$count;
 var $236=((($235)-(1))|0);
 $count=$236;
 var $237=$x;
 var $238=((($237)+(1))|0);
 $x=$238;
 var $239=$x;
 var $240=$line;
 var $241=(($240+($239<<1))|0);
 HEAP16[(($241)>>1)]=0;
 var $242=$count;
 var $243=((($242)-(1))|0);
 $count=$243;
 var $244=$x;
 var $245=((($244)+(1))|0);
 $x=$245;
 var $246=$x;
 var $247=$line;
 var $248=(($247+($246<<1))|0);
 HEAP16[(($248)>>1)]=0;
 var $249=$count;
 var $250=((($249)-(1))|0);
 $count=$250;
 var $251=$x;
 var $252=((($251)+(1))|0);
 $x=$252;
 var $253=$x;
 var $254=$line;
 var $255=(($254+($253<<1))|0);
 HEAP16[(($255)>>1)]=0;
 var $256=$count;
 var $257=((($256)-(1))|0);
 $count=$257;
 var $258=$x;
 var $259=((($258)+(1))|0);
 $x=$259;
 label=47;break;
 case 51: 
 label=52;break;
 case 52: 
 var $262=$count;
 var $263=($262|0)>0;
 if($263){label=53;break;}else{var $269=0;label=54;break;}
 case 53: 
 var $265=$x;
 var $266=$3;
 var $267=($265|0)<($266|0);
 var $269=$267;label=54;break;
 case 54: 
 var $269;
 if($269){label=55;break;}else{label=56;break;}
 case 55: 
 var $271=$x;
 var $272=$line;
 var $273=(($272+($271<<1))|0);
 HEAP16[(($273)>>1)]=0;
 var $274=$count;
 var $275=((($274)-(1))|0);
 $count=$275;
 var $276=$x;
 var $277=((($276)+(1))|0);
 $x=$277;
 label=52;break;
 case 56: 
 label=68;break;
 case 57: 
 label=58;break;
 case 58: 
 var $281=$count;
 var $282=$281&-8;
 var $283=($282|0)!=0;
 if($283){label=59;break;}else{var $290=0;label=60;break;}
 case 59: 
 var $285=$x;
 var $286=((($285)+(8))|0);
 var $287=$3;
 var $288=($286|0)<($287|0);
 var $290=$288;label=60;break;
 case 60: 
 var $290;
 if($290){label=61;break;}else{label=62;break;}
 case 61: 
 var $292=$x;
 var $293=$prevline;
 var $294=(($293+($292<<1))|0);
 var $295=HEAP16[(($294)>>1)];
 var $296=$x;
 var $297=$line;
 var $298=(($297+($296<<1))|0);
 HEAP16[(($298)>>1)]=$295;
 var $299=$count;
 var $300=((($299)-(1))|0);
 $count=$300;
 var $301=$x;
 var $302=((($301)+(1))|0);
 $x=$302;
 var $303=$x;
 var $304=$prevline;
 var $305=(($304+($303<<1))|0);
 var $306=HEAP16[(($305)>>1)];
 var $307=$x;
 var $308=$line;
 var $309=(($308+($307<<1))|0);
 HEAP16[(($309)>>1)]=$306;
 var $310=$count;
 var $311=((($310)-(1))|0);
 $count=$311;
 var $312=$x;
 var $313=((($312)+(1))|0);
 $x=$313;
 var $314=$x;
 var $315=$prevline;
 var $316=(($315+($314<<1))|0);
 var $317=HEAP16[(($316)>>1)];
 var $318=$x;
 var $319=$line;
 var $320=(($319+($318<<1))|0);
 HEAP16[(($320)>>1)]=$317;
 var $321=$count;
 var $322=((($321)-(1))|0);
 $count=$322;
 var $323=$x;
 var $324=((($323)+(1))|0);
 $x=$324;
 var $325=$x;
 var $326=$prevline;
 var $327=(($326+($325<<1))|0);
 var $328=HEAP16[(($327)>>1)];
 var $329=$x;
 var $330=$line;
 var $331=(($330+($329<<1))|0);
 HEAP16[(($331)>>1)]=$328;
 var $332=$count;
 var $333=((($332)-(1))|0);
 $count=$333;
 var $334=$x;
 var $335=((($334)+(1))|0);
 $x=$335;
 var $336=$x;
 var $337=$prevline;
 var $338=(($337+($336<<1))|0);
 var $339=HEAP16[(($338)>>1)];
 var $340=$x;
 var $341=$line;
 var $342=(($341+($340<<1))|0);
 HEAP16[(($342)>>1)]=$339;
 var $343=$count;
 var $344=((($343)-(1))|0);
 $count=$344;
 var $345=$x;
 var $346=((($345)+(1))|0);
 $x=$346;
 var $347=$x;
 var $348=$prevline;
 var $349=(($348+($347<<1))|0);
 var $350=HEAP16[(($349)>>1)];
 var $351=$x;
 var $352=$line;
 var $353=(($352+($351<<1))|0);
 HEAP16[(($353)>>1)]=$350;
 var $354=$count;
 var $355=((($354)-(1))|0);
 $count=$355;
 var $356=$x;
 var $357=((($356)+(1))|0);
 $x=$357;
 var $358=$x;
 var $359=$prevline;
 var $360=(($359+($358<<1))|0);
 var $361=HEAP16[(($360)>>1)];
 var $362=$x;
 var $363=$line;
 var $364=(($363+($362<<1))|0);
 HEAP16[(($364)>>1)]=$361;
 var $365=$count;
 var $366=((($365)-(1))|0);
 $count=$366;
 var $367=$x;
 var $368=((($367)+(1))|0);
 $x=$368;
 var $369=$x;
 var $370=$prevline;
 var $371=(($370+($369<<1))|0);
 var $372=HEAP16[(($371)>>1)];
 var $373=$x;
 var $374=$line;
 var $375=(($374+($373<<1))|0);
 HEAP16[(($375)>>1)]=$372;
 var $376=$count;
 var $377=((($376)-(1))|0);
 $count=$377;
 var $378=$x;
 var $379=((($378)+(1))|0);
 $x=$379;
 label=58;break;
 case 62: 
 label=63;break;
 case 63: 
 var $382=$count;
 var $383=($382|0)>0;
 if($383){label=64;break;}else{var $389=0;label=65;break;}
 case 64: 
 var $385=$x;
 var $386=$3;
 var $387=($385|0)<($386|0);
 var $389=$387;label=65;break;
 case 65: 
 var $389;
 if($389){label=66;break;}else{label=67;break;}
 case 66: 
 var $391=$x;
 var $392=$prevline;
 var $393=(($392+($391<<1))|0);
 var $394=HEAP16[(($393)>>1)];
 var $395=$x;
 var $396=$line;
 var $397=(($396+($395<<1))|0);
 HEAP16[(($397)>>1)]=$394;
 var $398=$count;
 var $399=((($398)-(1))|0);
 $count=$399;
 var $400=$x;
 var $401=((($400)+(1))|0);
 $x=$401;
 label=63;break;
 case 67: 
 label=68;break;
 case 68: 
 label=344;break;
 case 69: 
 var $405=$prevline;
 var $406=($405|0)==0;
 if($406){label=70;break;}else{label=81;break;}
 case 70: 
 label=71;break;
 case 71: 
 var $409=$count;
 var $410=$409&-8;
 var $411=($410|0)!=0;
 if($411){label=72;break;}else{var $418=0;label=73;break;}
 case 72: 
 var $413=$x;
 var $414=((($413)+(8))|0);
 var $415=$3;
 var $416=($414|0)<($415|0);
 var $418=$416;label=73;break;
 case 73: 
 var $418;
 if($418){label=74;break;}else{label=75;break;}
 case 74: 
 var $420=$mix;
 var $421=$x;
 var $422=$line;
 var $423=(($422+($421<<1))|0);
 HEAP16[(($423)>>1)]=$420;
 var $424=$count;
 var $425=((($424)-(1))|0);
 $count=$425;
 var $426=$x;
 var $427=((($426)+(1))|0);
 $x=$427;
 var $428=$mix;
 var $429=$x;
 var $430=$line;
 var $431=(($430+($429<<1))|0);
 HEAP16[(($431)>>1)]=$428;
 var $432=$count;
 var $433=((($432)-(1))|0);
 $count=$433;
 var $434=$x;
 var $435=((($434)+(1))|0);
 $x=$435;
 var $436=$mix;
 var $437=$x;
 var $438=$line;
 var $439=(($438+($437<<1))|0);
 HEAP16[(($439)>>1)]=$436;
 var $440=$count;
 var $441=((($440)-(1))|0);
 $count=$441;
 var $442=$x;
 var $443=((($442)+(1))|0);
 $x=$443;
 var $444=$mix;
 var $445=$x;
 var $446=$line;
 var $447=(($446+($445<<1))|0);
 HEAP16[(($447)>>1)]=$444;
 var $448=$count;
 var $449=((($448)-(1))|0);
 $count=$449;
 var $450=$x;
 var $451=((($450)+(1))|0);
 $x=$451;
 var $452=$mix;
 var $453=$x;
 var $454=$line;
 var $455=(($454+($453<<1))|0);
 HEAP16[(($455)>>1)]=$452;
 var $456=$count;
 var $457=((($456)-(1))|0);
 $count=$457;
 var $458=$x;
 var $459=((($458)+(1))|0);
 $x=$459;
 var $460=$mix;
 var $461=$x;
 var $462=$line;
 var $463=(($462+($461<<1))|0);
 HEAP16[(($463)>>1)]=$460;
 var $464=$count;
 var $465=((($464)-(1))|0);
 $count=$465;
 var $466=$x;
 var $467=((($466)+(1))|0);
 $x=$467;
 var $468=$mix;
 var $469=$x;
 var $470=$line;
 var $471=(($470+($469<<1))|0);
 HEAP16[(($471)>>1)]=$468;
 var $472=$count;
 var $473=((($472)-(1))|0);
 $count=$473;
 var $474=$x;
 var $475=((($474)+(1))|0);
 $x=$475;
 var $476=$mix;
 var $477=$x;
 var $478=$line;
 var $479=(($478+($477<<1))|0);
 HEAP16[(($479)>>1)]=$476;
 var $480=$count;
 var $481=((($480)-(1))|0);
 $count=$481;
 var $482=$x;
 var $483=((($482)+(1))|0);
 $x=$483;
 label=71;break;
 case 75: 
 label=76;break;
 case 76: 
 var $486=$count;
 var $487=($486|0)>0;
 if($487){label=77;break;}else{var $493=0;label=78;break;}
 case 77: 
 var $489=$x;
 var $490=$3;
 var $491=($489|0)<($490|0);
 var $493=$491;label=78;break;
 case 78: 
 var $493;
 if($493){label=79;break;}else{label=80;break;}
 case 79: 
 var $495=$mix;
 var $496=$x;
 var $497=$line;
 var $498=(($497+($496<<1))|0);
 HEAP16[(($498)>>1)]=$495;
 var $499=$count;
 var $500=((($499)-(1))|0);
 $count=$500;
 var $501=$x;
 var $502=((($501)+(1))|0);
 $x=$502;
 label=76;break;
 case 80: 
 label=92;break;
 case 81: 
 label=82;break;
 case 82: 
 var $506=$count;
 var $507=$506&-8;
 var $508=($507|0)!=0;
 if($508){label=83;break;}else{var $515=0;label=84;break;}
 case 83: 
 var $510=$x;
 var $511=((($510)+(8))|0);
 var $512=$3;
 var $513=($511|0)<($512|0);
 var $515=$513;label=84;break;
 case 84: 
 var $515;
 if($515){label=85;break;}else{label=86;break;}
 case 85: 
 var $517=$x;
 var $518=$prevline;
 var $519=(($518+($517<<1))|0);
 var $520=HEAP16[(($519)>>1)];
 var $521=($520&65535);
 var $522=$mix;
 var $523=($522&65535);
 var $524=$521^$523;
 var $525=(($524)&65535);
 var $526=$x;
 var $527=$line;
 var $528=(($527+($526<<1))|0);
 HEAP16[(($528)>>1)]=$525;
 var $529=$count;
 var $530=((($529)-(1))|0);
 $count=$530;
 var $531=$x;
 var $532=((($531)+(1))|0);
 $x=$532;
 var $533=$x;
 var $534=$prevline;
 var $535=(($534+($533<<1))|0);
 var $536=HEAP16[(($535)>>1)];
 var $537=($536&65535);
 var $538=$mix;
 var $539=($538&65535);
 var $540=$537^$539;
 var $541=(($540)&65535);
 var $542=$x;
 var $543=$line;
 var $544=(($543+($542<<1))|0);
 HEAP16[(($544)>>1)]=$541;
 var $545=$count;
 var $546=((($545)-(1))|0);
 $count=$546;
 var $547=$x;
 var $548=((($547)+(1))|0);
 $x=$548;
 var $549=$x;
 var $550=$prevline;
 var $551=(($550+($549<<1))|0);
 var $552=HEAP16[(($551)>>1)];
 var $553=($552&65535);
 var $554=$mix;
 var $555=($554&65535);
 var $556=$553^$555;
 var $557=(($556)&65535);
 var $558=$x;
 var $559=$line;
 var $560=(($559+($558<<1))|0);
 HEAP16[(($560)>>1)]=$557;
 var $561=$count;
 var $562=((($561)-(1))|0);
 $count=$562;
 var $563=$x;
 var $564=((($563)+(1))|0);
 $x=$564;
 var $565=$x;
 var $566=$prevline;
 var $567=(($566+($565<<1))|0);
 var $568=HEAP16[(($567)>>1)];
 var $569=($568&65535);
 var $570=$mix;
 var $571=($570&65535);
 var $572=$569^$571;
 var $573=(($572)&65535);
 var $574=$x;
 var $575=$line;
 var $576=(($575+($574<<1))|0);
 HEAP16[(($576)>>1)]=$573;
 var $577=$count;
 var $578=((($577)-(1))|0);
 $count=$578;
 var $579=$x;
 var $580=((($579)+(1))|0);
 $x=$580;
 var $581=$x;
 var $582=$prevline;
 var $583=(($582+($581<<1))|0);
 var $584=HEAP16[(($583)>>1)];
 var $585=($584&65535);
 var $586=$mix;
 var $587=($586&65535);
 var $588=$585^$587;
 var $589=(($588)&65535);
 var $590=$x;
 var $591=$line;
 var $592=(($591+($590<<1))|0);
 HEAP16[(($592)>>1)]=$589;
 var $593=$count;
 var $594=((($593)-(1))|0);
 $count=$594;
 var $595=$x;
 var $596=((($595)+(1))|0);
 $x=$596;
 var $597=$x;
 var $598=$prevline;
 var $599=(($598+($597<<1))|0);
 var $600=HEAP16[(($599)>>1)];
 var $601=($600&65535);
 var $602=$mix;
 var $603=($602&65535);
 var $604=$601^$603;
 var $605=(($604)&65535);
 var $606=$x;
 var $607=$line;
 var $608=(($607+($606<<1))|0);
 HEAP16[(($608)>>1)]=$605;
 var $609=$count;
 var $610=((($609)-(1))|0);
 $count=$610;
 var $611=$x;
 var $612=((($611)+(1))|0);
 $x=$612;
 var $613=$x;
 var $614=$prevline;
 var $615=(($614+($613<<1))|0);
 var $616=HEAP16[(($615)>>1)];
 var $617=($616&65535);
 var $618=$mix;
 var $619=($618&65535);
 var $620=$617^$619;
 var $621=(($620)&65535);
 var $622=$x;
 var $623=$line;
 var $624=(($623+($622<<1))|0);
 HEAP16[(($624)>>1)]=$621;
 var $625=$count;
 var $626=((($625)-(1))|0);
 $count=$626;
 var $627=$x;
 var $628=((($627)+(1))|0);
 $x=$628;
 var $629=$x;
 var $630=$prevline;
 var $631=(($630+($629<<1))|0);
 var $632=HEAP16[(($631)>>1)];
 var $633=($632&65535);
 var $634=$mix;
 var $635=($634&65535);
 var $636=$633^$635;
 var $637=(($636)&65535);
 var $638=$x;
 var $639=$line;
 var $640=(($639+($638<<1))|0);
 HEAP16[(($640)>>1)]=$637;
 var $641=$count;
 var $642=((($641)-(1))|0);
 $count=$642;
 var $643=$x;
 var $644=((($643)+(1))|0);
 $x=$644;
 label=82;break;
 case 86: 
 label=87;break;
 case 87: 
 var $647=$count;
 var $648=($647|0)>0;
 if($648){label=88;break;}else{var $654=0;label=89;break;}
 case 88: 
 var $650=$x;
 var $651=$3;
 var $652=($650|0)<($651|0);
 var $654=$652;label=89;break;
 case 89: 
 var $654;
 if($654){label=90;break;}else{label=91;break;}
 case 90: 
 var $656=$x;
 var $657=$prevline;
 var $658=(($657+($656<<1))|0);
 var $659=HEAP16[(($658)>>1)];
 var $660=($659&65535);
 var $661=$mix;
 var $662=($661&65535);
 var $663=$660^$662;
 var $664=(($663)&65535);
 var $665=$x;
 var $666=$line;
 var $667=(($666+($665<<1))|0);
 HEAP16[(($667)>>1)]=$664;
 var $668=$count;
 var $669=((($668)-(1))|0);
 $count=$669;
 var $670=$x;
 var $671=((($670)+(1))|0);
 $x=$671;
 label=87;break;
 case 91: 
 label=92;break;
 case 92: 
 label=344;break;
 case 93: 
 var $675=$prevline;
 var $676=($675|0)==0;
 if($676){label=94;break;}else{label=177;break;}
 case 94: 
 label=95;break;
 case 95: 
 var $679=$count;
 var $680=$679&-8;
 var $681=($680|0)!=0;
 if($681){label=96;break;}else{var $688=0;label=97;break;}
 case 96: 
 var $683=$x;
 var $684=((($683)+(8))|0);
 var $685=$3;
 var $686=($684|0)<($685|0);
 var $688=$686;label=97;break;
 case 97: 
 var $688;
 if($688){label=98;break;}else{label=163;break;}
 case 98: 
 var $690=$mixmask;
 var $691=($690&255);
 var $692=$691<<1;
 var $693=(($692)&255);
 $mixmask=$693;
 var $694=$mixmask;
 var $695=($694&255);
 var $696=($695|0)==0;
 if($696){label=99;break;}else{label=103;break;}
 case 99: 
 var $698=$fom_mask;
 var $699=($698|0)!=0;
 if($699){label=100;break;}else{label=101;break;}
 case 100: 
 var $701=$fom_mask;
 var $708=$701;label=102;break;
 case 101: 
 var $703=$5;
 var $704=(($703+1)|0);
 $5=$704;
 var $705=HEAP8[($703)];
 var $706=($705&255);
 var $708=$706;label=102;break;
 case 102: 
 var $708;
 var $709=(($708)&255);
 $mask=$709;
 $mixmask=1;
 label=103;break;
 case 103: 
 var $711=$mask;
 var $712=($711&255);
 var $713=$mixmask;
 var $714=($713&255);
 var $715=$712&$714;
 var $716=($715|0)!=0;
 if($716){label=104;break;}else{label=105;break;}
 case 104: 
 var $718=$mix;
 var $719=$x;
 var $720=$line;
 var $721=(($720+($719<<1))|0);
 HEAP16[(($721)>>1)]=$718;
 label=106;break;
 case 105: 
 var $723=$x;
 var $724=$line;
 var $725=(($724+($723<<1))|0);
 HEAP16[(($725)>>1)]=0;
 label=106;break;
 case 106: 
 var $727=$count;
 var $728=((($727)-(1))|0);
 $count=$728;
 var $729=$x;
 var $730=((($729)+(1))|0);
 $x=$730;
 var $731=$mixmask;
 var $732=($731&255);
 var $733=$732<<1;
 var $734=(($733)&255);
 $mixmask=$734;
 var $735=$mixmask;
 var $736=($735&255);
 var $737=($736|0)==0;
 if($737){label=107;break;}else{label=111;break;}
 case 107: 
 var $739=$fom_mask;
 var $740=($739|0)!=0;
 if($740){label=108;break;}else{label=109;break;}
 case 108: 
 var $742=$fom_mask;
 var $749=$742;label=110;break;
 case 109: 
 var $744=$5;
 var $745=(($744+1)|0);
 $5=$745;
 var $746=HEAP8[($744)];
 var $747=($746&255);
 var $749=$747;label=110;break;
 case 110: 
 var $749;
 var $750=(($749)&255);
 $mask=$750;
 $mixmask=1;
 label=111;break;
 case 111: 
 var $752=$mask;
 var $753=($752&255);
 var $754=$mixmask;
 var $755=($754&255);
 var $756=$753&$755;
 var $757=($756|0)!=0;
 if($757){label=112;break;}else{label=113;break;}
 case 112: 
 var $759=$mix;
 var $760=$x;
 var $761=$line;
 var $762=(($761+($760<<1))|0);
 HEAP16[(($762)>>1)]=$759;
 label=114;break;
 case 113: 
 var $764=$x;
 var $765=$line;
 var $766=(($765+($764<<1))|0);
 HEAP16[(($766)>>1)]=0;
 label=114;break;
 case 114: 
 var $768=$count;
 var $769=((($768)-(1))|0);
 $count=$769;
 var $770=$x;
 var $771=((($770)+(1))|0);
 $x=$771;
 var $772=$mixmask;
 var $773=($772&255);
 var $774=$773<<1;
 var $775=(($774)&255);
 $mixmask=$775;
 var $776=$mixmask;
 var $777=($776&255);
 var $778=($777|0)==0;
 if($778){label=115;break;}else{label=119;break;}
 case 115: 
 var $780=$fom_mask;
 var $781=($780|0)!=0;
 if($781){label=116;break;}else{label=117;break;}
 case 116: 
 var $783=$fom_mask;
 var $790=$783;label=118;break;
 case 117: 
 var $785=$5;
 var $786=(($785+1)|0);
 $5=$786;
 var $787=HEAP8[($785)];
 var $788=($787&255);
 var $790=$788;label=118;break;
 case 118: 
 var $790;
 var $791=(($790)&255);
 $mask=$791;
 $mixmask=1;
 label=119;break;
 case 119: 
 var $793=$mask;
 var $794=($793&255);
 var $795=$mixmask;
 var $796=($795&255);
 var $797=$794&$796;
 var $798=($797|0)!=0;
 if($798){label=120;break;}else{label=121;break;}
 case 120: 
 var $800=$mix;
 var $801=$x;
 var $802=$line;
 var $803=(($802+($801<<1))|0);
 HEAP16[(($803)>>1)]=$800;
 label=122;break;
 case 121: 
 var $805=$x;
 var $806=$line;
 var $807=(($806+($805<<1))|0);
 HEAP16[(($807)>>1)]=0;
 label=122;break;
 case 122: 
 var $809=$count;
 var $810=((($809)-(1))|0);
 $count=$810;
 var $811=$x;
 var $812=((($811)+(1))|0);
 $x=$812;
 var $813=$mixmask;
 var $814=($813&255);
 var $815=$814<<1;
 var $816=(($815)&255);
 $mixmask=$816;
 var $817=$mixmask;
 var $818=($817&255);
 var $819=($818|0)==0;
 if($819){label=123;break;}else{label=127;break;}
 case 123: 
 var $821=$fom_mask;
 var $822=($821|0)!=0;
 if($822){label=124;break;}else{label=125;break;}
 case 124: 
 var $824=$fom_mask;
 var $831=$824;label=126;break;
 case 125: 
 var $826=$5;
 var $827=(($826+1)|0);
 $5=$827;
 var $828=HEAP8[($826)];
 var $829=($828&255);
 var $831=$829;label=126;break;
 case 126: 
 var $831;
 var $832=(($831)&255);
 $mask=$832;
 $mixmask=1;
 label=127;break;
 case 127: 
 var $834=$mask;
 var $835=($834&255);
 var $836=$mixmask;
 var $837=($836&255);
 var $838=$835&$837;
 var $839=($838|0)!=0;
 if($839){label=128;break;}else{label=129;break;}
 case 128: 
 var $841=$mix;
 var $842=$x;
 var $843=$line;
 var $844=(($843+($842<<1))|0);
 HEAP16[(($844)>>1)]=$841;
 label=130;break;
 case 129: 
 var $846=$x;
 var $847=$line;
 var $848=(($847+($846<<1))|0);
 HEAP16[(($848)>>1)]=0;
 label=130;break;
 case 130: 
 var $850=$count;
 var $851=((($850)-(1))|0);
 $count=$851;
 var $852=$x;
 var $853=((($852)+(1))|0);
 $x=$853;
 var $854=$mixmask;
 var $855=($854&255);
 var $856=$855<<1;
 var $857=(($856)&255);
 $mixmask=$857;
 var $858=$mixmask;
 var $859=($858&255);
 var $860=($859|0)==0;
 if($860){label=131;break;}else{label=135;break;}
 case 131: 
 var $862=$fom_mask;
 var $863=($862|0)!=0;
 if($863){label=132;break;}else{label=133;break;}
 case 132: 
 var $865=$fom_mask;
 var $872=$865;label=134;break;
 case 133: 
 var $867=$5;
 var $868=(($867+1)|0);
 $5=$868;
 var $869=HEAP8[($867)];
 var $870=($869&255);
 var $872=$870;label=134;break;
 case 134: 
 var $872;
 var $873=(($872)&255);
 $mask=$873;
 $mixmask=1;
 label=135;break;
 case 135: 
 var $875=$mask;
 var $876=($875&255);
 var $877=$mixmask;
 var $878=($877&255);
 var $879=$876&$878;
 var $880=($879|0)!=0;
 if($880){label=136;break;}else{label=137;break;}
 case 136: 
 var $882=$mix;
 var $883=$x;
 var $884=$line;
 var $885=(($884+($883<<1))|0);
 HEAP16[(($885)>>1)]=$882;
 label=138;break;
 case 137: 
 var $887=$x;
 var $888=$line;
 var $889=(($888+($887<<1))|0);
 HEAP16[(($889)>>1)]=0;
 label=138;break;
 case 138: 
 var $891=$count;
 var $892=((($891)-(1))|0);
 $count=$892;
 var $893=$x;
 var $894=((($893)+(1))|0);
 $x=$894;
 var $895=$mixmask;
 var $896=($895&255);
 var $897=$896<<1;
 var $898=(($897)&255);
 $mixmask=$898;
 var $899=$mixmask;
 var $900=($899&255);
 var $901=($900|0)==0;
 if($901){label=139;break;}else{label=143;break;}
 case 139: 
 var $903=$fom_mask;
 var $904=($903|0)!=0;
 if($904){label=140;break;}else{label=141;break;}
 case 140: 
 var $906=$fom_mask;
 var $913=$906;label=142;break;
 case 141: 
 var $908=$5;
 var $909=(($908+1)|0);
 $5=$909;
 var $910=HEAP8[($908)];
 var $911=($910&255);
 var $913=$911;label=142;break;
 case 142: 
 var $913;
 var $914=(($913)&255);
 $mask=$914;
 $mixmask=1;
 label=143;break;
 case 143: 
 var $916=$mask;
 var $917=($916&255);
 var $918=$mixmask;
 var $919=($918&255);
 var $920=$917&$919;
 var $921=($920|0)!=0;
 if($921){label=144;break;}else{label=145;break;}
 case 144: 
 var $923=$mix;
 var $924=$x;
 var $925=$line;
 var $926=(($925+($924<<1))|0);
 HEAP16[(($926)>>1)]=$923;
 label=146;break;
 case 145: 
 var $928=$x;
 var $929=$line;
 var $930=(($929+($928<<1))|0);
 HEAP16[(($930)>>1)]=0;
 label=146;break;
 case 146: 
 var $932=$count;
 var $933=((($932)-(1))|0);
 $count=$933;
 var $934=$x;
 var $935=((($934)+(1))|0);
 $x=$935;
 var $936=$mixmask;
 var $937=($936&255);
 var $938=$937<<1;
 var $939=(($938)&255);
 $mixmask=$939;
 var $940=$mixmask;
 var $941=($940&255);
 var $942=($941|0)==0;
 if($942){label=147;break;}else{label=151;break;}
 case 147: 
 var $944=$fom_mask;
 var $945=($944|0)!=0;
 if($945){label=148;break;}else{label=149;break;}
 case 148: 
 var $947=$fom_mask;
 var $954=$947;label=150;break;
 case 149: 
 var $949=$5;
 var $950=(($949+1)|0);
 $5=$950;
 var $951=HEAP8[($949)];
 var $952=($951&255);
 var $954=$952;label=150;break;
 case 150: 
 var $954;
 var $955=(($954)&255);
 $mask=$955;
 $mixmask=1;
 label=151;break;
 case 151: 
 var $957=$mask;
 var $958=($957&255);
 var $959=$mixmask;
 var $960=($959&255);
 var $961=$958&$960;
 var $962=($961|0)!=0;
 if($962){label=152;break;}else{label=153;break;}
 case 152: 
 var $964=$mix;
 var $965=$x;
 var $966=$line;
 var $967=(($966+($965<<1))|0);
 HEAP16[(($967)>>1)]=$964;
 label=154;break;
 case 153: 
 var $969=$x;
 var $970=$line;
 var $971=(($970+($969<<1))|0);
 HEAP16[(($971)>>1)]=0;
 label=154;break;
 case 154: 
 var $973=$count;
 var $974=((($973)-(1))|0);
 $count=$974;
 var $975=$x;
 var $976=((($975)+(1))|0);
 $x=$976;
 var $977=$mixmask;
 var $978=($977&255);
 var $979=$978<<1;
 var $980=(($979)&255);
 $mixmask=$980;
 var $981=$mixmask;
 var $982=($981&255);
 var $983=($982|0)==0;
 if($983){label=155;break;}else{label=159;break;}
 case 155: 
 var $985=$fom_mask;
 var $986=($985|0)!=0;
 if($986){label=156;break;}else{label=157;break;}
 case 156: 
 var $988=$fom_mask;
 var $995=$988;label=158;break;
 case 157: 
 var $990=$5;
 var $991=(($990+1)|0);
 $5=$991;
 var $992=HEAP8[($990)];
 var $993=($992&255);
 var $995=$993;label=158;break;
 case 158: 
 var $995;
 var $996=(($995)&255);
 $mask=$996;
 $mixmask=1;
 label=159;break;
 case 159: 
 var $998=$mask;
 var $999=($998&255);
 var $1000=$mixmask;
 var $1001=($1000&255);
 var $1002=$999&$1001;
 var $1003=($1002|0)!=0;
 if($1003){label=160;break;}else{label=161;break;}
 case 160: 
 var $1005=$mix;
 var $1006=$x;
 var $1007=$line;
 var $1008=(($1007+($1006<<1))|0);
 HEAP16[(($1008)>>1)]=$1005;
 label=162;break;
 case 161: 
 var $1010=$x;
 var $1011=$line;
 var $1012=(($1011+($1010<<1))|0);
 HEAP16[(($1012)>>1)]=0;
 label=162;break;
 case 162: 
 var $1014=$count;
 var $1015=((($1014)-(1))|0);
 $count=$1015;
 var $1016=$x;
 var $1017=((($1016)+(1))|0);
 $x=$1017;
 label=95;break;
 case 163: 
 label=164;break;
 case 164: 
 var $1020=$count;
 var $1021=($1020|0)>0;
 if($1021){label=165;break;}else{var $1027=0;label=166;break;}
 case 165: 
 var $1023=$x;
 var $1024=$3;
 var $1025=($1023|0)<($1024|0);
 var $1027=$1025;label=166;break;
 case 166: 
 var $1027;
 if($1027){label=167;break;}else{label=176;break;}
 case 167: 
 var $1029=$mixmask;
 var $1030=($1029&255);
 var $1031=$1030<<1;
 var $1032=(($1031)&255);
 $mixmask=$1032;
 var $1033=$mixmask;
 var $1034=($1033&255);
 var $1035=($1034|0)==0;
 if($1035){label=168;break;}else{label=172;break;}
 case 168: 
 var $1037=$fom_mask;
 var $1038=($1037|0)!=0;
 if($1038){label=169;break;}else{label=170;break;}
 case 169: 
 var $1040=$fom_mask;
 var $1047=$1040;label=171;break;
 case 170: 
 var $1042=$5;
 var $1043=(($1042+1)|0);
 $5=$1043;
 var $1044=HEAP8[($1042)];
 var $1045=($1044&255);
 var $1047=$1045;label=171;break;
 case 171: 
 var $1047;
 var $1048=(($1047)&255);
 $mask=$1048;
 $mixmask=1;
 label=172;break;
 case 172: 
 var $1050=$mask;
 var $1051=($1050&255);
 var $1052=$mixmask;
 var $1053=($1052&255);
 var $1054=$1051&$1053;
 var $1055=($1054|0)!=0;
 if($1055){label=173;break;}else{label=174;break;}
 case 173: 
 var $1057=$mix;
 var $1058=$x;
 var $1059=$line;
 var $1060=(($1059+($1058<<1))|0);
 HEAP16[(($1060)>>1)]=$1057;
 label=175;break;
 case 174: 
 var $1062=$x;
 var $1063=$line;
 var $1064=(($1063+($1062<<1))|0);
 HEAP16[(($1064)>>1)]=0;
 label=175;break;
 case 175: 
 var $1066=$count;
 var $1067=((($1066)-(1))|0);
 $count=$1067;
 var $1068=$x;
 var $1069=((($1068)+(1))|0);
 $x=$1069;
 label=164;break;
 case 176: 
 label=260;break;
 case 177: 
 label=178;break;
 case 178: 
 var $1073=$count;
 var $1074=$1073&-8;
 var $1075=($1074|0)!=0;
 if($1075){label=179;break;}else{var $1082=0;label=180;break;}
 case 179: 
 var $1077=$x;
 var $1078=((($1077)+(8))|0);
 var $1079=$3;
 var $1080=($1078|0)<($1079|0);
 var $1082=$1080;label=180;break;
 case 180: 
 var $1082;
 if($1082){label=181;break;}else{label=246;break;}
 case 181: 
 var $1084=$mixmask;
 var $1085=($1084&255);
 var $1086=$1085<<1;
 var $1087=(($1086)&255);
 $mixmask=$1087;
 var $1088=$mixmask;
 var $1089=($1088&255);
 var $1090=($1089|0)==0;
 if($1090){label=182;break;}else{label=186;break;}
 case 182: 
 var $1092=$fom_mask;
 var $1093=($1092|0)!=0;
 if($1093){label=183;break;}else{label=184;break;}
 case 183: 
 var $1095=$fom_mask;
 var $1102=$1095;label=185;break;
 case 184: 
 var $1097=$5;
 var $1098=(($1097+1)|0);
 $5=$1098;
 var $1099=HEAP8[($1097)];
 var $1100=($1099&255);
 var $1102=$1100;label=185;break;
 case 185: 
 var $1102;
 var $1103=(($1102)&255);
 $mask=$1103;
 $mixmask=1;
 label=186;break;
 case 186: 
 var $1105=$mask;
 var $1106=($1105&255);
 var $1107=$mixmask;
 var $1108=($1107&255);
 var $1109=$1106&$1108;
 var $1110=($1109|0)!=0;
 if($1110){label=187;break;}else{label=188;break;}
 case 187: 
 var $1112=$x;
 var $1113=$prevline;
 var $1114=(($1113+($1112<<1))|0);
 var $1115=HEAP16[(($1114)>>1)];
 var $1116=($1115&65535);
 var $1117=$mix;
 var $1118=($1117&65535);
 var $1119=$1116^$1118;
 var $1120=(($1119)&65535);
 var $1121=$x;
 var $1122=$line;
 var $1123=(($1122+($1121<<1))|0);
 HEAP16[(($1123)>>1)]=$1120;
 label=189;break;
 case 188: 
 var $1125=$x;
 var $1126=$prevline;
 var $1127=(($1126+($1125<<1))|0);
 var $1128=HEAP16[(($1127)>>1)];
 var $1129=$x;
 var $1130=$line;
 var $1131=(($1130+($1129<<1))|0);
 HEAP16[(($1131)>>1)]=$1128;
 label=189;break;
 case 189: 
 var $1133=$count;
 var $1134=((($1133)-(1))|0);
 $count=$1134;
 var $1135=$x;
 var $1136=((($1135)+(1))|0);
 $x=$1136;
 var $1137=$mixmask;
 var $1138=($1137&255);
 var $1139=$1138<<1;
 var $1140=(($1139)&255);
 $mixmask=$1140;
 var $1141=$mixmask;
 var $1142=($1141&255);
 var $1143=($1142|0)==0;
 if($1143){label=190;break;}else{label=194;break;}
 case 190: 
 var $1145=$fom_mask;
 var $1146=($1145|0)!=0;
 if($1146){label=191;break;}else{label=192;break;}
 case 191: 
 var $1148=$fom_mask;
 var $1155=$1148;label=193;break;
 case 192: 
 var $1150=$5;
 var $1151=(($1150+1)|0);
 $5=$1151;
 var $1152=HEAP8[($1150)];
 var $1153=($1152&255);
 var $1155=$1153;label=193;break;
 case 193: 
 var $1155;
 var $1156=(($1155)&255);
 $mask=$1156;
 $mixmask=1;
 label=194;break;
 case 194: 
 var $1158=$mask;
 var $1159=($1158&255);
 var $1160=$mixmask;
 var $1161=($1160&255);
 var $1162=$1159&$1161;
 var $1163=($1162|0)!=0;
 if($1163){label=195;break;}else{label=196;break;}
 case 195: 
 var $1165=$x;
 var $1166=$prevline;
 var $1167=(($1166+($1165<<1))|0);
 var $1168=HEAP16[(($1167)>>1)];
 var $1169=($1168&65535);
 var $1170=$mix;
 var $1171=($1170&65535);
 var $1172=$1169^$1171;
 var $1173=(($1172)&65535);
 var $1174=$x;
 var $1175=$line;
 var $1176=(($1175+($1174<<1))|0);
 HEAP16[(($1176)>>1)]=$1173;
 label=197;break;
 case 196: 
 var $1178=$x;
 var $1179=$prevline;
 var $1180=(($1179+($1178<<1))|0);
 var $1181=HEAP16[(($1180)>>1)];
 var $1182=$x;
 var $1183=$line;
 var $1184=(($1183+($1182<<1))|0);
 HEAP16[(($1184)>>1)]=$1181;
 label=197;break;
 case 197: 
 var $1186=$count;
 var $1187=((($1186)-(1))|0);
 $count=$1187;
 var $1188=$x;
 var $1189=((($1188)+(1))|0);
 $x=$1189;
 var $1190=$mixmask;
 var $1191=($1190&255);
 var $1192=$1191<<1;
 var $1193=(($1192)&255);
 $mixmask=$1193;
 var $1194=$mixmask;
 var $1195=($1194&255);
 var $1196=($1195|0)==0;
 if($1196){label=198;break;}else{label=202;break;}
 case 198: 
 var $1198=$fom_mask;
 var $1199=($1198|0)!=0;
 if($1199){label=199;break;}else{label=200;break;}
 case 199: 
 var $1201=$fom_mask;
 var $1208=$1201;label=201;break;
 case 200: 
 var $1203=$5;
 var $1204=(($1203+1)|0);
 $5=$1204;
 var $1205=HEAP8[($1203)];
 var $1206=($1205&255);
 var $1208=$1206;label=201;break;
 case 201: 
 var $1208;
 var $1209=(($1208)&255);
 $mask=$1209;
 $mixmask=1;
 label=202;break;
 case 202: 
 var $1211=$mask;
 var $1212=($1211&255);
 var $1213=$mixmask;
 var $1214=($1213&255);
 var $1215=$1212&$1214;
 var $1216=($1215|0)!=0;
 if($1216){label=203;break;}else{label=204;break;}
 case 203: 
 var $1218=$x;
 var $1219=$prevline;
 var $1220=(($1219+($1218<<1))|0);
 var $1221=HEAP16[(($1220)>>1)];
 var $1222=($1221&65535);
 var $1223=$mix;
 var $1224=($1223&65535);
 var $1225=$1222^$1224;
 var $1226=(($1225)&65535);
 var $1227=$x;
 var $1228=$line;
 var $1229=(($1228+($1227<<1))|0);
 HEAP16[(($1229)>>1)]=$1226;
 label=205;break;
 case 204: 
 var $1231=$x;
 var $1232=$prevline;
 var $1233=(($1232+($1231<<1))|0);
 var $1234=HEAP16[(($1233)>>1)];
 var $1235=$x;
 var $1236=$line;
 var $1237=(($1236+($1235<<1))|0);
 HEAP16[(($1237)>>1)]=$1234;
 label=205;break;
 case 205: 
 var $1239=$count;
 var $1240=((($1239)-(1))|0);
 $count=$1240;
 var $1241=$x;
 var $1242=((($1241)+(1))|0);
 $x=$1242;
 var $1243=$mixmask;
 var $1244=($1243&255);
 var $1245=$1244<<1;
 var $1246=(($1245)&255);
 $mixmask=$1246;
 var $1247=$mixmask;
 var $1248=($1247&255);
 var $1249=($1248|0)==0;
 if($1249){label=206;break;}else{label=210;break;}
 case 206: 
 var $1251=$fom_mask;
 var $1252=($1251|0)!=0;
 if($1252){label=207;break;}else{label=208;break;}
 case 207: 
 var $1254=$fom_mask;
 var $1261=$1254;label=209;break;
 case 208: 
 var $1256=$5;
 var $1257=(($1256+1)|0);
 $5=$1257;
 var $1258=HEAP8[($1256)];
 var $1259=($1258&255);
 var $1261=$1259;label=209;break;
 case 209: 
 var $1261;
 var $1262=(($1261)&255);
 $mask=$1262;
 $mixmask=1;
 label=210;break;
 case 210: 
 var $1264=$mask;
 var $1265=($1264&255);
 var $1266=$mixmask;
 var $1267=($1266&255);
 var $1268=$1265&$1267;
 var $1269=($1268|0)!=0;
 if($1269){label=211;break;}else{label=212;break;}
 case 211: 
 var $1271=$x;
 var $1272=$prevline;
 var $1273=(($1272+($1271<<1))|0);
 var $1274=HEAP16[(($1273)>>1)];
 var $1275=($1274&65535);
 var $1276=$mix;
 var $1277=($1276&65535);
 var $1278=$1275^$1277;
 var $1279=(($1278)&65535);
 var $1280=$x;
 var $1281=$line;
 var $1282=(($1281+($1280<<1))|0);
 HEAP16[(($1282)>>1)]=$1279;
 label=213;break;
 case 212: 
 var $1284=$x;
 var $1285=$prevline;
 var $1286=(($1285+($1284<<1))|0);
 var $1287=HEAP16[(($1286)>>1)];
 var $1288=$x;
 var $1289=$line;
 var $1290=(($1289+($1288<<1))|0);
 HEAP16[(($1290)>>1)]=$1287;
 label=213;break;
 case 213: 
 var $1292=$count;
 var $1293=((($1292)-(1))|0);
 $count=$1293;
 var $1294=$x;
 var $1295=((($1294)+(1))|0);
 $x=$1295;
 var $1296=$mixmask;
 var $1297=($1296&255);
 var $1298=$1297<<1;
 var $1299=(($1298)&255);
 $mixmask=$1299;
 var $1300=$mixmask;
 var $1301=($1300&255);
 var $1302=($1301|0)==0;
 if($1302){label=214;break;}else{label=218;break;}
 case 214: 
 var $1304=$fom_mask;
 var $1305=($1304|0)!=0;
 if($1305){label=215;break;}else{label=216;break;}
 case 215: 
 var $1307=$fom_mask;
 var $1314=$1307;label=217;break;
 case 216: 
 var $1309=$5;
 var $1310=(($1309+1)|0);
 $5=$1310;
 var $1311=HEAP8[($1309)];
 var $1312=($1311&255);
 var $1314=$1312;label=217;break;
 case 217: 
 var $1314;
 var $1315=(($1314)&255);
 $mask=$1315;
 $mixmask=1;
 label=218;break;
 case 218: 
 var $1317=$mask;
 var $1318=($1317&255);
 var $1319=$mixmask;
 var $1320=($1319&255);
 var $1321=$1318&$1320;
 var $1322=($1321|0)!=0;
 if($1322){label=219;break;}else{label=220;break;}
 case 219: 
 var $1324=$x;
 var $1325=$prevline;
 var $1326=(($1325+($1324<<1))|0);
 var $1327=HEAP16[(($1326)>>1)];
 var $1328=($1327&65535);
 var $1329=$mix;
 var $1330=($1329&65535);
 var $1331=$1328^$1330;
 var $1332=(($1331)&65535);
 var $1333=$x;
 var $1334=$line;
 var $1335=(($1334+($1333<<1))|0);
 HEAP16[(($1335)>>1)]=$1332;
 label=221;break;
 case 220: 
 var $1337=$x;
 var $1338=$prevline;
 var $1339=(($1338+($1337<<1))|0);
 var $1340=HEAP16[(($1339)>>1)];
 var $1341=$x;
 var $1342=$line;
 var $1343=(($1342+($1341<<1))|0);
 HEAP16[(($1343)>>1)]=$1340;
 label=221;break;
 case 221: 
 var $1345=$count;
 var $1346=((($1345)-(1))|0);
 $count=$1346;
 var $1347=$x;
 var $1348=((($1347)+(1))|0);
 $x=$1348;
 var $1349=$mixmask;
 var $1350=($1349&255);
 var $1351=$1350<<1;
 var $1352=(($1351)&255);
 $mixmask=$1352;
 var $1353=$mixmask;
 var $1354=($1353&255);
 var $1355=($1354|0)==0;
 if($1355){label=222;break;}else{label=226;break;}
 case 222: 
 var $1357=$fom_mask;
 var $1358=($1357|0)!=0;
 if($1358){label=223;break;}else{label=224;break;}
 case 223: 
 var $1360=$fom_mask;
 var $1367=$1360;label=225;break;
 case 224: 
 var $1362=$5;
 var $1363=(($1362+1)|0);
 $5=$1363;
 var $1364=HEAP8[($1362)];
 var $1365=($1364&255);
 var $1367=$1365;label=225;break;
 case 225: 
 var $1367;
 var $1368=(($1367)&255);
 $mask=$1368;
 $mixmask=1;
 label=226;break;
 case 226: 
 var $1370=$mask;
 var $1371=($1370&255);
 var $1372=$mixmask;
 var $1373=($1372&255);
 var $1374=$1371&$1373;
 var $1375=($1374|0)!=0;
 if($1375){label=227;break;}else{label=228;break;}
 case 227: 
 var $1377=$x;
 var $1378=$prevline;
 var $1379=(($1378+($1377<<1))|0);
 var $1380=HEAP16[(($1379)>>1)];
 var $1381=($1380&65535);
 var $1382=$mix;
 var $1383=($1382&65535);
 var $1384=$1381^$1383;
 var $1385=(($1384)&65535);
 var $1386=$x;
 var $1387=$line;
 var $1388=(($1387+($1386<<1))|0);
 HEAP16[(($1388)>>1)]=$1385;
 label=229;break;
 case 228: 
 var $1390=$x;
 var $1391=$prevline;
 var $1392=(($1391+($1390<<1))|0);
 var $1393=HEAP16[(($1392)>>1)];
 var $1394=$x;
 var $1395=$line;
 var $1396=(($1395+($1394<<1))|0);
 HEAP16[(($1396)>>1)]=$1393;
 label=229;break;
 case 229: 
 var $1398=$count;
 var $1399=((($1398)-(1))|0);
 $count=$1399;
 var $1400=$x;
 var $1401=((($1400)+(1))|0);
 $x=$1401;
 var $1402=$mixmask;
 var $1403=($1402&255);
 var $1404=$1403<<1;
 var $1405=(($1404)&255);
 $mixmask=$1405;
 var $1406=$mixmask;
 var $1407=($1406&255);
 var $1408=($1407|0)==0;
 if($1408){label=230;break;}else{label=234;break;}
 case 230: 
 var $1410=$fom_mask;
 var $1411=($1410|0)!=0;
 if($1411){label=231;break;}else{label=232;break;}
 case 231: 
 var $1413=$fom_mask;
 var $1420=$1413;label=233;break;
 case 232: 
 var $1415=$5;
 var $1416=(($1415+1)|0);
 $5=$1416;
 var $1417=HEAP8[($1415)];
 var $1418=($1417&255);
 var $1420=$1418;label=233;break;
 case 233: 
 var $1420;
 var $1421=(($1420)&255);
 $mask=$1421;
 $mixmask=1;
 label=234;break;
 case 234: 
 var $1423=$mask;
 var $1424=($1423&255);
 var $1425=$mixmask;
 var $1426=($1425&255);
 var $1427=$1424&$1426;
 var $1428=($1427|0)!=0;
 if($1428){label=235;break;}else{label=236;break;}
 case 235: 
 var $1430=$x;
 var $1431=$prevline;
 var $1432=(($1431+($1430<<1))|0);
 var $1433=HEAP16[(($1432)>>1)];
 var $1434=($1433&65535);
 var $1435=$mix;
 var $1436=($1435&65535);
 var $1437=$1434^$1436;
 var $1438=(($1437)&65535);
 var $1439=$x;
 var $1440=$line;
 var $1441=(($1440+($1439<<1))|0);
 HEAP16[(($1441)>>1)]=$1438;
 label=237;break;
 case 236: 
 var $1443=$x;
 var $1444=$prevline;
 var $1445=(($1444+($1443<<1))|0);
 var $1446=HEAP16[(($1445)>>1)];
 var $1447=$x;
 var $1448=$line;
 var $1449=(($1448+($1447<<1))|0);
 HEAP16[(($1449)>>1)]=$1446;
 label=237;break;
 case 237: 
 var $1451=$count;
 var $1452=((($1451)-(1))|0);
 $count=$1452;
 var $1453=$x;
 var $1454=((($1453)+(1))|0);
 $x=$1454;
 var $1455=$mixmask;
 var $1456=($1455&255);
 var $1457=$1456<<1;
 var $1458=(($1457)&255);
 $mixmask=$1458;
 var $1459=$mixmask;
 var $1460=($1459&255);
 var $1461=($1460|0)==0;
 if($1461){label=238;break;}else{label=242;break;}
 case 238: 
 var $1463=$fom_mask;
 var $1464=($1463|0)!=0;
 if($1464){label=239;break;}else{label=240;break;}
 case 239: 
 var $1466=$fom_mask;
 var $1473=$1466;label=241;break;
 case 240: 
 var $1468=$5;
 var $1469=(($1468+1)|0);
 $5=$1469;
 var $1470=HEAP8[($1468)];
 var $1471=($1470&255);
 var $1473=$1471;label=241;break;
 case 241: 
 var $1473;
 var $1474=(($1473)&255);
 $mask=$1474;
 $mixmask=1;
 label=242;break;
 case 242: 
 var $1476=$mask;
 var $1477=($1476&255);
 var $1478=$mixmask;
 var $1479=($1478&255);
 var $1480=$1477&$1479;
 var $1481=($1480|0)!=0;
 if($1481){label=243;break;}else{label=244;break;}
 case 243: 
 var $1483=$x;
 var $1484=$prevline;
 var $1485=(($1484+($1483<<1))|0);
 var $1486=HEAP16[(($1485)>>1)];
 var $1487=($1486&65535);
 var $1488=$mix;
 var $1489=($1488&65535);
 var $1490=$1487^$1489;
 var $1491=(($1490)&65535);
 var $1492=$x;
 var $1493=$line;
 var $1494=(($1493+($1492<<1))|0);
 HEAP16[(($1494)>>1)]=$1491;
 label=245;break;
 case 244: 
 var $1496=$x;
 var $1497=$prevline;
 var $1498=(($1497+($1496<<1))|0);
 var $1499=HEAP16[(($1498)>>1)];
 var $1500=$x;
 var $1501=$line;
 var $1502=(($1501+($1500<<1))|0);
 HEAP16[(($1502)>>1)]=$1499;
 label=245;break;
 case 245: 
 var $1504=$count;
 var $1505=((($1504)-(1))|0);
 $count=$1505;
 var $1506=$x;
 var $1507=((($1506)+(1))|0);
 $x=$1507;
 label=178;break;
 case 246: 
 label=247;break;
 case 247: 
 var $1510=$count;
 var $1511=($1510|0)>0;
 if($1511){label=248;break;}else{var $1517=0;label=249;break;}
 case 248: 
 var $1513=$x;
 var $1514=$3;
 var $1515=($1513|0)<($1514|0);
 var $1517=$1515;label=249;break;
 case 249: 
 var $1517;
 if($1517){label=250;break;}else{label=259;break;}
 case 250: 
 var $1519=$mixmask;
 var $1520=($1519&255);
 var $1521=$1520<<1;
 var $1522=(($1521)&255);
 $mixmask=$1522;
 var $1523=$mixmask;
 var $1524=($1523&255);
 var $1525=($1524|0)==0;
 if($1525){label=251;break;}else{label=255;break;}
 case 251: 
 var $1527=$fom_mask;
 var $1528=($1527|0)!=0;
 if($1528){label=252;break;}else{label=253;break;}
 case 252: 
 var $1530=$fom_mask;
 var $1537=$1530;label=254;break;
 case 253: 
 var $1532=$5;
 var $1533=(($1532+1)|0);
 $5=$1533;
 var $1534=HEAP8[($1532)];
 var $1535=($1534&255);
 var $1537=$1535;label=254;break;
 case 254: 
 var $1537;
 var $1538=(($1537)&255);
 $mask=$1538;
 $mixmask=1;
 label=255;break;
 case 255: 
 var $1540=$mask;
 var $1541=($1540&255);
 var $1542=$mixmask;
 var $1543=($1542&255);
 var $1544=$1541&$1543;
 var $1545=($1544|0)!=0;
 if($1545){label=256;break;}else{label=257;break;}
 case 256: 
 var $1547=$x;
 var $1548=$prevline;
 var $1549=(($1548+($1547<<1))|0);
 var $1550=HEAP16[(($1549)>>1)];
 var $1551=($1550&65535);
 var $1552=$mix;
 var $1553=($1552&65535);
 var $1554=$1551^$1553;
 var $1555=(($1554)&65535);
 var $1556=$x;
 var $1557=$line;
 var $1558=(($1557+($1556<<1))|0);
 HEAP16[(($1558)>>1)]=$1555;
 label=258;break;
 case 257: 
 var $1560=$x;
 var $1561=$prevline;
 var $1562=(($1561+($1560<<1))|0);
 var $1563=HEAP16[(($1562)>>1)];
 var $1564=$x;
 var $1565=$line;
 var $1566=(($1565+($1564<<1))|0);
 HEAP16[(($1566)>>1)]=$1563;
 label=258;break;
 case 258: 
 var $1568=$count;
 var $1569=((($1568)-(1))|0);
 $count=$1569;
 var $1570=$x;
 var $1571=((($1570)+(1))|0);
 $x=$1571;
 label=247;break;
 case 259: 
 label=260;break;
 case 260: 
 label=344;break;
 case 261: 
 label=262;break;
 case 262: 
 var $1576=$count;
 var $1577=$1576&-8;
 var $1578=($1577|0)!=0;
 if($1578){label=263;break;}else{var $1585=0;label=264;break;}
 case 263: 
 var $1580=$x;
 var $1581=((($1580)+(8))|0);
 var $1582=$3;
 var $1583=($1581|0)<($1582|0);
 var $1585=$1583;label=264;break;
 case 264: 
 var $1585;
 if($1585){label=265;break;}else{label=266;break;}
 case 265: 
 var $1587=$colour2;
 var $1588=$x;
 var $1589=$line;
 var $1590=(($1589+($1588<<1))|0);
 HEAP16[(($1590)>>1)]=$1587;
 var $1591=$count;
 var $1592=((($1591)-(1))|0);
 $count=$1592;
 var $1593=$x;
 var $1594=((($1593)+(1))|0);
 $x=$1594;
 var $1595=$colour2;
 var $1596=$x;
 var $1597=$line;
 var $1598=(($1597+($1596<<1))|0);
 HEAP16[(($1598)>>1)]=$1595;
 var $1599=$count;
 var $1600=((($1599)-(1))|0);
 $count=$1600;
 var $1601=$x;
 var $1602=((($1601)+(1))|0);
 $x=$1602;
 var $1603=$colour2;
 var $1604=$x;
 var $1605=$line;
 var $1606=(($1605+($1604<<1))|0);
 HEAP16[(($1606)>>1)]=$1603;
 var $1607=$count;
 var $1608=((($1607)-(1))|0);
 $count=$1608;
 var $1609=$x;
 var $1610=((($1609)+(1))|0);
 $x=$1610;
 var $1611=$colour2;
 var $1612=$x;
 var $1613=$line;
 var $1614=(($1613+($1612<<1))|0);
 HEAP16[(($1614)>>1)]=$1611;
 var $1615=$count;
 var $1616=((($1615)-(1))|0);
 $count=$1616;
 var $1617=$x;
 var $1618=((($1617)+(1))|0);
 $x=$1618;
 var $1619=$colour2;
 var $1620=$x;
 var $1621=$line;
 var $1622=(($1621+($1620<<1))|0);
 HEAP16[(($1622)>>1)]=$1619;
 var $1623=$count;
 var $1624=((($1623)-(1))|0);
 $count=$1624;
 var $1625=$x;
 var $1626=((($1625)+(1))|0);
 $x=$1626;
 var $1627=$colour2;
 var $1628=$x;
 var $1629=$line;
 var $1630=(($1629+($1628<<1))|0);
 HEAP16[(($1630)>>1)]=$1627;
 var $1631=$count;
 var $1632=((($1631)-(1))|0);
 $count=$1632;
 var $1633=$x;
 var $1634=((($1633)+(1))|0);
 $x=$1634;
 var $1635=$colour2;
 var $1636=$x;
 var $1637=$line;
 var $1638=(($1637+($1636<<1))|0);
 HEAP16[(($1638)>>1)]=$1635;
 var $1639=$count;
 var $1640=((($1639)-(1))|0);
 $count=$1640;
 var $1641=$x;
 var $1642=((($1641)+(1))|0);
 $x=$1642;
 var $1643=$colour2;
 var $1644=$x;
 var $1645=$line;
 var $1646=(($1645+($1644<<1))|0);
 HEAP16[(($1646)>>1)]=$1643;
 var $1647=$count;
 var $1648=((($1647)-(1))|0);
 $count=$1648;
 var $1649=$x;
 var $1650=((($1649)+(1))|0);
 $x=$1650;
 label=262;break;
 case 266: 
 label=267;break;
 case 267: 
 var $1653=$count;
 var $1654=($1653|0)>0;
 if($1654){label=268;break;}else{var $1660=0;label=269;break;}
 case 268: 
 var $1656=$x;
 var $1657=$3;
 var $1658=($1656|0)<($1657|0);
 var $1660=$1658;label=269;break;
 case 269: 
 var $1660;
 if($1660){label=270;break;}else{label=271;break;}
 case 270: 
 var $1662=$colour2;
 var $1663=$x;
 var $1664=$line;
 var $1665=(($1664+($1663<<1))|0);
 HEAP16[(($1665)>>1)]=$1662;
 var $1666=$count;
 var $1667=((($1666)-(1))|0);
 $count=$1667;
 var $1668=$x;
 var $1669=((($1668)+(1))|0);
 $x=$1669;
 label=267;break;
 case 271: 
 label=344;break;
 case 272: 
 label=273;break;
 case 273: 
 var $1673=$count;
 var $1674=$1673&-8;
 var $1675=($1674|0)!=0;
 if($1675){label=274;break;}else{var $1682=0;label=275;break;}
 case 274: 
 var $1677=$x;
 var $1678=((($1677)+(8))|0);
 var $1679=$3;
 var $1680=($1678|0)<($1679|0);
 var $1682=$1680;label=275;break;
 case 275: 
 var $1682;
 if($1682){label=276;break;}else{label=277;break;}
 case 276: 
 var $1684=$5;
 var $1685=$1684;
 var $1686=HEAP16[(($1685)>>1)];
 var $1687=$x;
 var $1688=$line;
 var $1689=(($1688+($1687<<1))|0);
 HEAP16[(($1689)>>1)]=$1686;
 var $1690=$5;
 var $1691=(($1690+2)|0);
 $5=$1691;
 var $1692=$count;
 var $1693=((($1692)-(1))|0);
 $count=$1693;
 var $1694=$x;
 var $1695=((($1694)+(1))|0);
 $x=$1695;
 var $1696=$5;
 var $1697=$1696;
 var $1698=HEAP16[(($1697)>>1)];
 var $1699=$x;
 var $1700=$line;
 var $1701=(($1700+($1699<<1))|0);
 HEAP16[(($1701)>>1)]=$1698;
 var $1702=$5;
 var $1703=(($1702+2)|0);
 $5=$1703;
 var $1704=$count;
 var $1705=((($1704)-(1))|0);
 $count=$1705;
 var $1706=$x;
 var $1707=((($1706)+(1))|0);
 $x=$1707;
 var $1708=$5;
 var $1709=$1708;
 var $1710=HEAP16[(($1709)>>1)];
 var $1711=$x;
 var $1712=$line;
 var $1713=(($1712+($1711<<1))|0);
 HEAP16[(($1713)>>1)]=$1710;
 var $1714=$5;
 var $1715=(($1714+2)|0);
 $5=$1715;
 var $1716=$count;
 var $1717=((($1716)-(1))|0);
 $count=$1717;
 var $1718=$x;
 var $1719=((($1718)+(1))|0);
 $x=$1719;
 var $1720=$5;
 var $1721=$1720;
 var $1722=HEAP16[(($1721)>>1)];
 var $1723=$x;
 var $1724=$line;
 var $1725=(($1724+($1723<<1))|0);
 HEAP16[(($1725)>>1)]=$1722;
 var $1726=$5;
 var $1727=(($1726+2)|0);
 $5=$1727;
 var $1728=$count;
 var $1729=((($1728)-(1))|0);
 $count=$1729;
 var $1730=$x;
 var $1731=((($1730)+(1))|0);
 $x=$1731;
 var $1732=$5;
 var $1733=$1732;
 var $1734=HEAP16[(($1733)>>1)];
 var $1735=$x;
 var $1736=$line;
 var $1737=(($1736+($1735<<1))|0);
 HEAP16[(($1737)>>1)]=$1734;
 var $1738=$5;
 var $1739=(($1738+2)|0);
 $5=$1739;
 var $1740=$count;
 var $1741=((($1740)-(1))|0);
 $count=$1741;
 var $1742=$x;
 var $1743=((($1742)+(1))|0);
 $x=$1743;
 var $1744=$5;
 var $1745=$1744;
 var $1746=HEAP16[(($1745)>>1)];
 var $1747=$x;
 var $1748=$line;
 var $1749=(($1748+($1747<<1))|0);
 HEAP16[(($1749)>>1)]=$1746;
 var $1750=$5;
 var $1751=(($1750+2)|0);
 $5=$1751;
 var $1752=$count;
 var $1753=((($1752)-(1))|0);
 $count=$1753;
 var $1754=$x;
 var $1755=((($1754)+(1))|0);
 $x=$1755;
 var $1756=$5;
 var $1757=$1756;
 var $1758=HEAP16[(($1757)>>1)];
 var $1759=$x;
 var $1760=$line;
 var $1761=(($1760+($1759<<1))|0);
 HEAP16[(($1761)>>1)]=$1758;
 var $1762=$5;
 var $1763=(($1762+2)|0);
 $5=$1763;
 var $1764=$count;
 var $1765=((($1764)-(1))|0);
 $count=$1765;
 var $1766=$x;
 var $1767=((($1766)+(1))|0);
 $x=$1767;
 var $1768=$5;
 var $1769=$1768;
 var $1770=HEAP16[(($1769)>>1)];
 var $1771=$x;
 var $1772=$line;
 var $1773=(($1772+($1771<<1))|0);
 HEAP16[(($1773)>>1)]=$1770;
 var $1774=$5;
 var $1775=(($1774+2)|0);
 $5=$1775;
 var $1776=$count;
 var $1777=((($1776)-(1))|0);
 $count=$1777;
 var $1778=$x;
 var $1779=((($1778)+(1))|0);
 $x=$1779;
 label=273;break;
 case 277: 
 label=278;break;
 case 278: 
 var $1782=$count;
 var $1783=($1782|0)>0;
 if($1783){label=279;break;}else{var $1789=0;label=280;break;}
 case 279: 
 var $1785=$x;
 var $1786=$3;
 var $1787=($1785|0)<($1786|0);
 var $1789=$1787;label=280;break;
 case 280: 
 var $1789;
 if($1789){label=281;break;}else{label=282;break;}
 case 281: 
 var $1791=$5;
 var $1792=$1791;
 var $1793=HEAP16[(($1792)>>1)];
 var $1794=$x;
 var $1795=$line;
 var $1796=(($1795+($1794<<1))|0);
 HEAP16[(($1796)>>1)]=$1793;
 var $1797=$5;
 var $1798=(($1797+2)|0);
 $5=$1798;
 var $1799=$count;
 var $1800=((($1799)-(1))|0);
 $count=$1800;
 var $1801=$x;
 var $1802=((($1801)+(1))|0);
 $x=$1802;
 label=278;break;
 case 282: 
 label=344;break;
 case 283: 
 label=284;break;
 case 284: 
 var $1806=$count;
 var $1807=$1806&-8;
 var $1808=($1807|0)!=0;
 if($1808){label=285;break;}else{var $1815=0;label=286;break;}
 case 285: 
 var $1810=$x;
 var $1811=((($1810)+(8))|0);
 var $1812=$3;
 var $1813=($1811|0)<($1812|0);
 var $1815=$1813;label=286;break;
 case 286: 
 var $1815;
 if($1815){label=287;break;}else{label=312;break;}
 case 287: 
 var $1817=$bicolour;
 var $1818=($1817|0)!=0;
 if($1818){label=288;break;}else{label=289;break;}
 case 288: 
 var $1820=$colour2;
 var $1821=$x;
 var $1822=$line;
 var $1823=(($1822+($1821<<1))|0);
 HEAP16[(($1823)>>1)]=$1820;
 $bicolour=0;
 label=290;break;
 case 289: 
 var $1825=$colour1;
 var $1826=$x;
 var $1827=$line;
 var $1828=(($1827+($1826<<1))|0);
 HEAP16[(($1828)>>1)]=$1825;
 $bicolour=1;
 var $1829=$count;
 var $1830=((($1829)+(1))|0);
 $count=$1830;
 label=290;break;
 case 290: 
 var $1832=$count;
 var $1833=((($1832)-(1))|0);
 $count=$1833;
 var $1834=$x;
 var $1835=((($1834)+(1))|0);
 $x=$1835;
 var $1836=$bicolour;
 var $1837=($1836|0)!=0;
 if($1837){label=291;break;}else{label=292;break;}
 case 291: 
 var $1839=$colour2;
 var $1840=$x;
 var $1841=$line;
 var $1842=(($1841+($1840<<1))|0);
 HEAP16[(($1842)>>1)]=$1839;
 $bicolour=0;
 label=293;break;
 case 292: 
 var $1844=$colour1;
 var $1845=$x;
 var $1846=$line;
 var $1847=(($1846+($1845<<1))|0);
 HEAP16[(($1847)>>1)]=$1844;
 $bicolour=1;
 var $1848=$count;
 var $1849=((($1848)+(1))|0);
 $count=$1849;
 label=293;break;
 case 293: 
 var $1851=$count;
 var $1852=((($1851)-(1))|0);
 $count=$1852;
 var $1853=$x;
 var $1854=((($1853)+(1))|0);
 $x=$1854;
 var $1855=$bicolour;
 var $1856=($1855|0)!=0;
 if($1856){label=294;break;}else{label=295;break;}
 case 294: 
 var $1858=$colour2;
 var $1859=$x;
 var $1860=$line;
 var $1861=(($1860+($1859<<1))|0);
 HEAP16[(($1861)>>1)]=$1858;
 $bicolour=0;
 label=296;break;
 case 295: 
 var $1863=$colour1;
 var $1864=$x;
 var $1865=$line;
 var $1866=(($1865+($1864<<1))|0);
 HEAP16[(($1866)>>1)]=$1863;
 $bicolour=1;
 var $1867=$count;
 var $1868=((($1867)+(1))|0);
 $count=$1868;
 label=296;break;
 case 296: 
 var $1870=$count;
 var $1871=((($1870)-(1))|0);
 $count=$1871;
 var $1872=$x;
 var $1873=((($1872)+(1))|0);
 $x=$1873;
 var $1874=$bicolour;
 var $1875=($1874|0)!=0;
 if($1875){label=297;break;}else{label=298;break;}
 case 297: 
 var $1877=$colour2;
 var $1878=$x;
 var $1879=$line;
 var $1880=(($1879+($1878<<1))|0);
 HEAP16[(($1880)>>1)]=$1877;
 $bicolour=0;
 label=299;break;
 case 298: 
 var $1882=$colour1;
 var $1883=$x;
 var $1884=$line;
 var $1885=(($1884+($1883<<1))|0);
 HEAP16[(($1885)>>1)]=$1882;
 $bicolour=1;
 var $1886=$count;
 var $1887=((($1886)+(1))|0);
 $count=$1887;
 label=299;break;
 case 299: 
 var $1889=$count;
 var $1890=((($1889)-(1))|0);
 $count=$1890;
 var $1891=$x;
 var $1892=((($1891)+(1))|0);
 $x=$1892;
 var $1893=$bicolour;
 var $1894=($1893|0)!=0;
 if($1894){label=300;break;}else{label=301;break;}
 case 300: 
 var $1896=$colour2;
 var $1897=$x;
 var $1898=$line;
 var $1899=(($1898+($1897<<1))|0);
 HEAP16[(($1899)>>1)]=$1896;
 $bicolour=0;
 label=302;break;
 case 301: 
 var $1901=$colour1;
 var $1902=$x;
 var $1903=$line;
 var $1904=(($1903+($1902<<1))|0);
 HEAP16[(($1904)>>1)]=$1901;
 $bicolour=1;
 var $1905=$count;
 var $1906=((($1905)+(1))|0);
 $count=$1906;
 label=302;break;
 case 302: 
 var $1908=$count;
 var $1909=((($1908)-(1))|0);
 $count=$1909;
 var $1910=$x;
 var $1911=((($1910)+(1))|0);
 $x=$1911;
 var $1912=$bicolour;
 var $1913=($1912|0)!=0;
 if($1913){label=303;break;}else{label=304;break;}
 case 303: 
 var $1915=$colour2;
 var $1916=$x;
 var $1917=$line;
 var $1918=(($1917+($1916<<1))|0);
 HEAP16[(($1918)>>1)]=$1915;
 $bicolour=0;
 label=305;break;
 case 304: 
 var $1920=$colour1;
 var $1921=$x;
 var $1922=$line;
 var $1923=(($1922+($1921<<1))|0);
 HEAP16[(($1923)>>1)]=$1920;
 $bicolour=1;
 var $1924=$count;
 var $1925=((($1924)+(1))|0);
 $count=$1925;
 label=305;break;
 case 305: 
 var $1927=$count;
 var $1928=((($1927)-(1))|0);
 $count=$1928;
 var $1929=$x;
 var $1930=((($1929)+(1))|0);
 $x=$1930;
 var $1931=$bicolour;
 var $1932=($1931|0)!=0;
 if($1932){label=306;break;}else{label=307;break;}
 case 306: 
 var $1934=$colour2;
 var $1935=$x;
 var $1936=$line;
 var $1937=(($1936+($1935<<1))|0);
 HEAP16[(($1937)>>1)]=$1934;
 $bicolour=0;
 label=308;break;
 case 307: 
 var $1939=$colour1;
 var $1940=$x;
 var $1941=$line;
 var $1942=(($1941+($1940<<1))|0);
 HEAP16[(($1942)>>1)]=$1939;
 $bicolour=1;
 var $1943=$count;
 var $1944=((($1943)+(1))|0);
 $count=$1944;
 label=308;break;
 case 308: 
 var $1946=$count;
 var $1947=((($1946)-(1))|0);
 $count=$1947;
 var $1948=$x;
 var $1949=((($1948)+(1))|0);
 $x=$1949;
 var $1950=$bicolour;
 var $1951=($1950|0)!=0;
 if($1951){label=309;break;}else{label=310;break;}
 case 309: 
 var $1953=$colour2;
 var $1954=$x;
 var $1955=$line;
 var $1956=(($1955+($1954<<1))|0);
 HEAP16[(($1956)>>1)]=$1953;
 $bicolour=0;
 label=311;break;
 case 310: 
 var $1958=$colour1;
 var $1959=$x;
 var $1960=$line;
 var $1961=(($1960+($1959<<1))|0);
 HEAP16[(($1961)>>1)]=$1958;
 $bicolour=1;
 var $1962=$count;
 var $1963=((($1962)+(1))|0);
 $count=$1963;
 label=311;break;
 case 311: 
 var $1965=$count;
 var $1966=((($1965)-(1))|0);
 $count=$1966;
 var $1967=$x;
 var $1968=((($1967)+(1))|0);
 $x=$1968;
 label=284;break;
 case 312: 
 label=313;break;
 case 313: 
 var $1971=$count;
 var $1972=($1971|0)>0;
 if($1972){label=314;break;}else{var $1978=0;label=315;break;}
 case 314: 
 var $1974=$x;
 var $1975=$3;
 var $1976=($1974|0)<($1975|0);
 var $1978=$1976;label=315;break;
 case 315: 
 var $1978;
 if($1978){label=316;break;}else{label=320;break;}
 case 316: 
 var $1980=$bicolour;
 var $1981=($1980|0)!=0;
 if($1981){label=317;break;}else{label=318;break;}
 case 317: 
 var $1983=$colour2;
 var $1984=$x;
 var $1985=$line;
 var $1986=(($1985+($1984<<1))|0);
 HEAP16[(($1986)>>1)]=$1983;
 $bicolour=0;
 label=319;break;
 case 318: 
 var $1988=$colour1;
 var $1989=$x;
 var $1990=$line;
 var $1991=(($1990+($1989<<1))|0);
 HEAP16[(($1991)>>1)]=$1988;
 $bicolour=1;
 var $1992=$count;
 var $1993=((($1992)+(1))|0);
 $count=$1993;
 label=319;break;
 case 319: 
 var $1995=$count;
 var $1996=((($1995)-(1))|0);
 $count=$1996;
 var $1997=$x;
 var $1998=((($1997)+(1))|0);
 $x=$1998;
 label=313;break;
 case 320: 
 label=344;break;
 case 321: 
 label=322;break;
 case 322: 
 var $2002=$count;
 var $2003=$2002&-8;
 var $2004=($2003|0)!=0;
 if($2004){label=323;break;}else{var $2011=0;label=324;break;}
 case 323: 
 var $2006=$x;
 var $2007=((($2006)+(8))|0);
 var $2008=$3;
 var $2009=($2007|0)<($2008|0);
 var $2011=$2009;label=324;break;
 case 324: 
 var $2011;
 if($2011){label=325;break;}else{label=326;break;}
 case 325: 
 var $2013=$x;
 var $2014=$line;
 var $2015=(($2014+($2013<<1))|0);
 HEAP16[(($2015)>>1)]=-1;
 var $2016=$count;
 var $2017=((($2016)-(1))|0);
 $count=$2017;
 var $2018=$x;
 var $2019=((($2018)+(1))|0);
 $x=$2019;
 var $2020=$x;
 var $2021=$line;
 var $2022=(($2021+($2020<<1))|0);
 HEAP16[(($2022)>>1)]=-1;
 var $2023=$count;
 var $2024=((($2023)-(1))|0);
 $count=$2024;
 var $2025=$x;
 var $2026=((($2025)+(1))|0);
 $x=$2026;
 var $2027=$x;
 var $2028=$line;
 var $2029=(($2028+($2027<<1))|0);
 HEAP16[(($2029)>>1)]=-1;
 var $2030=$count;
 var $2031=((($2030)-(1))|0);
 $count=$2031;
 var $2032=$x;
 var $2033=((($2032)+(1))|0);
 $x=$2033;
 var $2034=$x;
 var $2035=$line;
 var $2036=(($2035+($2034<<1))|0);
 HEAP16[(($2036)>>1)]=-1;
 var $2037=$count;
 var $2038=((($2037)-(1))|0);
 $count=$2038;
 var $2039=$x;
 var $2040=((($2039)+(1))|0);
 $x=$2040;
 var $2041=$x;
 var $2042=$line;
 var $2043=(($2042+($2041<<1))|0);
 HEAP16[(($2043)>>1)]=-1;
 var $2044=$count;
 var $2045=((($2044)-(1))|0);
 $count=$2045;
 var $2046=$x;
 var $2047=((($2046)+(1))|0);
 $x=$2047;
 var $2048=$x;
 var $2049=$line;
 var $2050=(($2049+($2048<<1))|0);
 HEAP16[(($2050)>>1)]=-1;
 var $2051=$count;
 var $2052=((($2051)-(1))|0);
 $count=$2052;
 var $2053=$x;
 var $2054=((($2053)+(1))|0);
 $x=$2054;
 var $2055=$x;
 var $2056=$line;
 var $2057=(($2056+($2055<<1))|0);
 HEAP16[(($2057)>>1)]=-1;
 var $2058=$count;
 var $2059=((($2058)-(1))|0);
 $count=$2059;
 var $2060=$x;
 var $2061=((($2060)+(1))|0);
 $x=$2061;
 var $2062=$x;
 var $2063=$line;
 var $2064=(($2063+($2062<<1))|0);
 HEAP16[(($2064)>>1)]=-1;
 var $2065=$count;
 var $2066=((($2065)-(1))|0);
 $count=$2066;
 var $2067=$x;
 var $2068=((($2067)+(1))|0);
 $x=$2068;
 label=322;break;
 case 326: 
 label=327;break;
 case 327: 
 var $2071=$count;
 var $2072=($2071|0)>0;
 if($2072){label=328;break;}else{var $2078=0;label=329;break;}
 case 328: 
 var $2074=$x;
 var $2075=$3;
 var $2076=($2074|0)<($2075|0);
 var $2078=$2076;label=329;break;
 case 329: 
 var $2078;
 if($2078){label=330;break;}else{label=331;break;}
 case 330: 
 var $2080=$x;
 var $2081=$line;
 var $2082=(($2081+($2080<<1))|0);
 HEAP16[(($2082)>>1)]=-1;
 var $2083=$count;
 var $2084=((($2083)-(1))|0);
 $count=$2084;
 var $2085=$x;
 var $2086=((($2085)+(1))|0);
 $x=$2086;
 label=327;break;
 case 331: 
 label=344;break;
 case 332: 
 label=333;break;
 case 333: 
 var $2090=$count;
 var $2091=$2090&-8;
 var $2092=($2091|0)!=0;
 if($2092){label=334;break;}else{var $2099=0;label=335;break;}
 case 334: 
 var $2094=$x;
 var $2095=((($2094)+(8))|0);
 var $2096=$3;
 var $2097=($2095|0)<($2096|0);
 var $2099=$2097;label=335;break;
 case 335: 
 var $2099;
 if($2099){label=336;break;}else{label=337;break;}
 case 336: 
 var $2101=$x;
 var $2102=$line;
 var $2103=(($2102+($2101<<1))|0);
 HEAP16[(($2103)>>1)]=0;
 var $2104=$count;
 var $2105=((($2104)-(1))|0);
 $count=$2105;
 var $2106=$x;
 var $2107=((($2106)+(1))|0);
 $x=$2107;
 var $2108=$x;
 var $2109=$line;
 var $2110=(($2109+($2108<<1))|0);
 HEAP16[(($2110)>>1)]=0;
 var $2111=$count;
 var $2112=((($2111)-(1))|0);
 $count=$2112;
 var $2113=$x;
 var $2114=((($2113)+(1))|0);
 $x=$2114;
 var $2115=$x;
 var $2116=$line;
 var $2117=(($2116+($2115<<1))|0);
 HEAP16[(($2117)>>1)]=0;
 var $2118=$count;
 var $2119=((($2118)-(1))|0);
 $count=$2119;
 var $2120=$x;
 var $2121=((($2120)+(1))|0);
 $x=$2121;
 var $2122=$x;
 var $2123=$line;
 var $2124=(($2123+($2122<<1))|0);
 HEAP16[(($2124)>>1)]=0;
 var $2125=$count;
 var $2126=((($2125)-(1))|0);
 $count=$2126;
 var $2127=$x;
 var $2128=((($2127)+(1))|0);
 $x=$2128;
 var $2129=$x;
 var $2130=$line;
 var $2131=(($2130+($2129<<1))|0);
 HEAP16[(($2131)>>1)]=0;
 var $2132=$count;
 var $2133=((($2132)-(1))|0);
 $count=$2133;
 var $2134=$x;
 var $2135=((($2134)+(1))|0);
 $x=$2135;
 var $2136=$x;
 var $2137=$line;
 var $2138=(($2137+($2136<<1))|0);
 HEAP16[(($2138)>>1)]=0;
 var $2139=$count;
 var $2140=((($2139)-(1))|0);
 $count=$2140;
 var $2141=$x;
 var $2142=((($2141)+(1))|0);
 $x=$2142;
 var $2143=$x;
 var $2144=$line;
 var $2145=(($2144+($2143<<1))|0);
 HEAP16[(($2145)>>1)]=0;
 var $2146=$count;
 var $2147=((($2146)-(1))|0);
 $count=$2147;
 var $2148=$x;
 var $2149=((($2148)+(1))|0);
 $x=$2149;
 var $2150=$x;
 var $2151=$line;
 var $2152=(($2151+($2150<<1))|0);
 HEAP16[(($2152)>>1)]=0;
 var $2153=$count;
 var $2154=((($2153)-(1))|0);
 $count=$2154;
 var $2155=$x;
 var $2156=((($2155)+(1))|0);
 $x=$2156;
 label=333;break;
 case 337: 
 label=338;break;
 case 338: 
 var $2159=$count;
 var $2160=($2159|0)>0;
 if($2160){label=339;break;}else{var $2166=0;label=340;break;}
 case 339: 
 var $2162=$x;
 var $2163=$3;
 var $2164=($2162|0)<($2163|0);
 var $2166=$2164;label=340;break;
 case 340: 
 var $2166;
 if($2166){label=341;break;}else{label=342;break;}
 case 341: 
 var $2168=$x;
 var $2169=$line;
 var $2170=(($2169+($2168<<1))|0);
 HEAP16[(($2170)>>1)]=0;
 var $2171=$count;
 var $2172=((($2171)-(1))|0);
 $count=$2172;
 var $2173=$x;
 var $2174=((($2173)+(1))|0);
 $x=$2174;
 label=338;break;
 case 342: 
 label=344;break;
 case 343: 
 $1=0;
 label=347;break;
 case 344: 
 label=34;break;
 case 345: 
 label=2;break;
 case 346: 
 $1=1;
 label=347;break;
 case 347: 
 var $2181=$1;
 STACKTOP=sp;return $2181;
  default: assert(0, "bad label: " + label);
 }

}
Module["_bitmap_decompress2"] = _bitmap_decompress2;

function _bitmap_decompress3($output,$width,$height,$input,$size){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $end;
 var $prevline;
 var $line;
 var $opcode;
 var $count;
 var $offset;
 var $isfillormix;
 var $x;
 var $lastopcode;
 var $insertmix;
 var $bicolour;
 var $code;
 var $colour1=sp;
 var $colour2=(sp)+(8);
 var $mixmask;
 var $mask;
 var $mix=(sp)+(16);
 var $fom_mask;
 $2=$output;
 $3=$width;
 $4=$height;
 $5=$input;
 $6=$size;
 var $7=$5;
 var $8=$6;
 var $9=(($7+$8)|0);
 $end=$9;
 $prevline=0;
 $line=0;
 var $10=$3;
 $x=$10;
 $lastopcode=-1;
 $insertmix=0;
 $bicolour=0;
 var $11=$colour1;
 HEAP8[($11)]=0; HEAP8[((($11)+(1))|0)]=0; HEAP8[((($11)+(2))|0)]=0;
 var $12=$colour2;
 HEAP8[($12)]=0; HEAP8[((($12)+(1))|0)]=0; HEAP8[((($12)+(2))|0)]=0;
 $mask=0;
 var $13=$mix;
 assert(3 % 1 === 0);HEAP8[($13)]=HEAP8[(8)];HEAP8[((($13)+(1))|0)]=HEAP8[(9)];HEAP8[((($13)+(2))|0)]=HEAP8[(10)];
 $fom_mask=0;
 label=2;break;
 case 2: 
 var $15=$5;
 var $16=$end;
 var $17=($15>>>0)<($16>>>0);
 if($17){label=3;break;}else{label=346;break;}
 case 3: 
 $fom_mask=0;
 var $19=$5;
 var $20=(($19+1)|0);
 $5=$20;
 var $21=HEAP8[($19)];
 $code=$21;
 var $22=$code;
 var $23=($22&255);
 var $24=$23>>4;
 $opcode=$24;
 var $25=$opcode;
 if(($25|0)==12|($25|0)==13|($25|0)==14){ label=4;break;}else if(($25|0)==15){ label=5;break;}else{label=9;break;}
 case 4: 
 var $27=$opcode;
 var $28=((($27)-(6))|0);
 $opcode=$28;
 var $29=$code;
 var $30=($29&255);
 var $31=$30&15;
 $count=$31;
 $offset=16;
 label=10;break;
 case 5: 
 var $33=$code;
 var $34=($33&255);
 var $35=$34&15;
 $opcode=$35;
 var $36=$opcode;
 var $37=($36|0)<9;
 if($37){label=6;break;}else{label=7;break;}
 case 6: 
 var $39=$5;
 var $40=(($39+1)|0);
 $5=$40;
 var $41=HEAP8[($39)];
 var $42=($41&255);
 $count=$42;
 var $43=$5;
 var $44=(($43+1)|0);
 $5=$44;
 var $45=HEAP8[($43)];
 var $46=($45&255);
 var $47=$46<<8;
 var $48=$count;
 var $49=$48|$47;
 $count=$49;
 label=8;break;
 case 7: 
 var $51=$opcode;
 var $52=($51|0)<11;
 var $53=($52?8:1);
 $count=$53;
 label=8;break;
 case 8: 
 $offset=0;
 label=10;break;
 case 9: 
 var $56=$opcode;
 var $57=$56>>1;
 $opcode=$57;
 var $58=$code;
 var $59=($58&255);
 var $60=$59&31;
 $count=$60;
 $offset=32;
 label=10;break;
 case 10: 
 var $62=$offset;
 var $63=($62|0)!=0;
 if($63){label=11;break;}else{label=22;break;}
 case 11: 
 var $65=$opcode;
 var $66=($65|0)==2;
 if($66){var $71=1;label=13;break;}else{label=12;break;}
 case 12: 
 var $68=$opcode;
 var $69=($68|0)==7;
 var $71=$69;label=13;break;
 case 13: 
 var $71;
 var $72=($71&1);
 $isfillormix=$72;
 var $73=$count;
 var $74=($73|0)==0;
 if($74){label=14;break;}else{label=18;break;}
 case 14: 
 var $76=$isfillormix;
 var $77=($76|0)!=0;
 if($77){label=15;break;}else{label=16;break;}
 case 15: 
 var $79=$5;
 var $80=(($79+1)|0);
 $5=$80;
 var $81=HEAP8[($79)];
 var $82=($81&255);
 var $83=((($82)+(1))|0);
 $count=$83;
 label=17;break;
 case 16: 
 var $85=$5;
 var $86=(($85+1)|0);
 $5=$86;
 var $87=HEAP8[($85)];
 var $88=($87&255);
 var $89=$offset;
 var $90=((($88)+($89))|0);
 $count=$90;
 label=17;break;
 case 17: 
 label=21;break;
 case 18: 
 var $93=$isfillormix;
 var $94=($93|0)!=0;
 if($94){label=19;break;}else{label=20;break;}
 case 19: 
 var $96=$count;
 var $97=$96<<3;
 $count=$97;
 label=20;break;
 case 20: 
 label=21;break;
 case 21: 
 label=22;break;
 case 22: 
 var $101=$opcode;
 switch(($101|0)){case 0:{ label=23;break;}case 8:{ label=28;break;}case 3:{ label=29;break;}case 6:case 7:{ label=30;break;}case 9:{ label=31;break;}case 10:{ label=32;break;}default:{label=33;break;}}break;
 case 23: 
 var $103=$lastopcode;
 var $104=$opcode;
 var $105=($103|0)==($104|0);
 if($105){label=24;break;}else{label=27;break;}
 case 24: 
 var $107=$x;
 var $108=$3;
 var $109=($107|0)==($108|0);
 if($109){label=25;break;}else{label=26;break;}
 case 25: 
 var $111=$prevline;
 var $112=($111|0)==0;
 if($112){label=27;break;}else{label=26;break;}
 case 26: 
 $insertmix=1;
 label=27;break;
 case 27: 
 label=33;break;
 case 28: 
 var $116=$5;
 var $117=(($116+1)|0);
 $5=$117;
 var $118=HEAP8[($116)];
 var $119=(($colour1)|0);
 HEAP8[($119)]=$118;
 var $120=$5;
 var $121=(($120+1)|0);
 $5=$121;
 var $122=HEAP8[($120)];
 var $123=(($colour1+1)|0);
 HEAP8[($123)]=$122;
 var $124=$5;
 var $125=(($124+1)|0);
 $5=$125;
 var $126=HEAP8[($124)];
 var $127=(($colour1+2)|0);
 HEAP8[($127)]=$126;
 label=29;break;
 case 29: 
 var $129=$5;
 var $130=(($129+1)|0);
 $5=$130;
 var $131=HEAP8[($129)];
 var $132=(($colour2)|0);
 HEAP8[($132)]=$131;
 var $133=$5;
 var $134=(($133+1)|0);
 $5=$134;
 var $135=HEAP8[($133)];
 var $136=(($colour2+1)|0);
 HEAP8[($136)]=$135;
 var $137=$5;
 var $138=(($137+1)|0);
 $5=$138;
 var $139=HEAP8[($137)];
 var $140=(($colour2+2)|0);
 HEAP8[($140)]=$139;
 label=33;break;
 case 30: 
 var $142=$5;
 var $143=(($142+1)|0);
 $5=$143;
 var $144=HEAP8[($142)];
 var $145=(($mix)|0);
 HEAP8[($145)]=$144;
 var $146=$5;
 var $147=(($146+1)|0);
 $5=$147;
 var $148=HEAP8[($146)];
 var $149=(($mix+1)|0);
 HEAP8[($149)]=$148;
 var $150=$5;
 var $151=(($150+1)|0);
 $5=$151;
 var $152=HEAP8[($150)];
 var $153=(($mix+2)|0);
 HEAP8[($153)]=$152;
 var $154=$opcode;
 var $155=((($154)-(5))|0);
 $opcode=$155;
 label=33;break;
 case 31: 
 $mask=3;
 $opcode=2;
 $fom_mask=3;
 label=33;break;
 case 32: 
 $mask=5;
 $opcode=2;
 $fom_mask=5;
 label=33;break;
 case 33: 
 var $159=$opcode;
 $lastopcode=$159;
 $mixmask=0;
 label=34;break;
 case 34: 
 var $161=$count;
 var $162=($161|0)>0;
 if($162){label=35;break;}else{label=345;break;}
 case 35: 
 var $164=$x;
 var $165=$3;
 var $166=($164|0)>=($165|0);
 if($166){label=36;break;}else{label=39;break;}
 case 36: 
 var $168=$4;
 var $169=($168|0)<=0;
 if($169){label=37;break;}else{label=38;break;}
 case 37: 
 $1=0;
 label=347;break;
 case 38: 
 $x=0;
 var $172=$4;
 var $173=((($172)-(1))|0);
 $4=$173;
 var $174=$line;
 $prevline=$174;
 var $175=$2;
 var $176=$4;
 var $177=$3;
 var $178=((($177)*(3))&-1);
 var $179=(Math_imul($176,$178)|0);
 var $180=(($175+$179)|0);
 $line=$180;
 label=39;break;
 case 39: 
 var $182=$opcode;
 switch(($182|0)){case 3:{ label=261;break;}case 4:{ label=272;break;}case 8:{ label=283;break;}case 13:{ label=321;break;}case 14:{ label=332;break;}case 0:{ label=40;break;}case 1:{ label=69;break;}case 2:{ label=93;break;}default:{label=343;break;}}break;
 case 40: 
 var $184=$insertmix;
 var $185=($184|0)!=0;
 if($185){label=41;break;}else{label=45;break;}
 case 41: 
 var $187=$prevline;
 var $188=($187|0)==0;
 if($188){label=42;break;}else{label=43;break;}
 case 42: 
 var $190=(($mix)|0);
 var $191=HEAP8[($190)];
 var $192=$x;
 var $193=((($192)*(3))&-1);
 var $194=$line;
 var $195=(($194+$193)|0);
 HEAP8[($195)]=$191;
 var $196=(($mix+1)|0);
 var $197=HEAP8[($196)];
 var $198=$x;
 var $199=((($198)*(3))&-1);
 var $200=((($199)+(1))|0);
 var $201=$line;
 var $202=(($201+$200)|0);
 HEAP8[($202)]=$197;
 var $203=(($mix+2)|0);
 var $204=HEAP8[($203)];
 var $205=$x;
 var $206=((($205)*(3))&-1);
 var $207=((($206)+(2))|0);
 var $208=$line;
 var $209=(($208+$207)|0);
 HEAP8[($209)]=$204;
 label=44;break;
 case 43: 
 var $211=$x;
 var $212=((($211)*(3))&-1);
 var $213=$prevline;
 var $214=(($213+$212)|0);
 var $215=HEAP8[($214)];
 var $216=($215&255);
 var $217=(($mix)|0);
 var $218=HEAP8[($217)];
 var $219=($218&255);
 var $220=$216^$219;
 var $221=(($220)&255);
 var $222=$x;
 var $223=((($222)*(3))&-1);
 var $224=$line;
 var $225=(($224+$223)|0);
 HEAP8[($225)]=$221;
 var $226=$x;
 var $227=((($226)*(3))&-1);
 var $228=((($227)+(1))|0);
 var $229=$prevline;
 var $230=(($229+$228)|0);
 var $231=HEAP8[($230)];
 var $232=($231&255);
 var $233=(($mix+1)|0);
 var $234=HEAP8[($233)];
 var $235=($234&255);
 var $236=$232^$235;
 var $237=(($236)&255);
 var $238=$x;
 var $239=((($238)*(3))&-1);
 var $240=((($239)+(1))|0);
 var $241=$line;
 var $242=(($241+$240)|0);
 HEAP8[($242)]=$237;
 var $243=$x;
 var $244=((($243)*(3))&-1);
 var $245=((($244)+(2))|0);
 var $246=$prevline;
 var $247=(($246+$245)|0);
 var $248=HEAP8[($247)];
 var $249=($248&255);
 var $250=(($mix+2)|0);
 var $251=HEAP8[($250)];
 var $252=($251&255);
 var $253=$249^$252;
 var $254=(($253)&255);
 var $255=$x;
 var $256=((($255)*(3))&-1);
 var $257=((($256)+(2))|0);
 var $258=$line;
 var $259=(($258+$257)|0);
 HEAP8[($259)]=$254;
 label=44;break;
 case 44: 
 $insertmix=0;
 var $261=$count;
 var $262=((($261)-(1))|0);
 $count=$262;
 var $263=$x;
 var $264=((($263)+(1))|0);
 $x=$264;
 label=45;break;
 case 45: 
 var $266=$prevline;
 var $267=($266|0)==0;
 if($267){label=46;break;}else{label=57;break;}
 case 46: 
 label=47;break;
 case 47: 
 var $270=$count;
 var $271=$270&-8;
 var $272=($271|0)!=0;
 if($272){label=48;break;}else{var $279=0;label=49;break;}
 case 48: 
 var $274=$x;
 var $275=((($274)+(8))|0);
 var $276=$3;
 var $277=($275|0)<($276|0);
 var $279=$277;label=49;break;
 case 49: 
 var $279;
 if($279){label=50;break;}else{label=51;break;}
 case 50: 
 var $281=$x;
 var $282=((($281)*(3))&-1);
 var $283=$line;
 var $284=(($283+$282)|0);
 HEAP8[($284)]=0;
 var $285=$x;
 var $286=((($285)*(3))&-1);
 var $287=((($286)+(1))|0);
 var $288=$line;
 var $289=(($288+$287)|0);
 HEAP8[($289)]=0;
 var $290=$x;
 var $291=((($290)*(3))&-1);
 var $292=((($291)+(2))|0);
 var $293=$line;
 var $294=(($293+$292)|0);
 HEAP8[($294)]=0;
 var $295=$count;
 var $296=((($295)-(1))|0);
 $count=$296;
 var $297=$x;
 var $298=((($297)+(1))|0);
 $x=$298;
 var $299=$x;
 var $300=((($299)*(3))&-1);
 var $301=$line;
 var $302=(($301+$300)|0);
 HEAP8[($302)]=0;
 var $303=$x;
 var $304=((($303)*(3))&-1);
 var $305=((($304)+(1))|0);
 var $306=$line;
 var $307=(($306+$305)|0);
 HEAP8[($307)]=0;
 var $308=$x;
 var $309=((($308)*(3))&-1);
 var $310=((($309)+(2))|0);
 var $311=$line;
 var $312=(($311+$310)|0);
 HEAP8[($312)]=0;
 var $313=$count;
 var $314=((($313)-(1))|0);
 $count=$314;
 var $315=$x;
 var $316=((($315)+(1))|0);
 $x=$316;
 var $317=$x;
 var $318=((($317)*(3))&-1);
 var $319=$line;
 var $320=(($319+$318)|0);
 HEAP8[($320)]=0;
 var $321=$x;
 var $322=((($321)*(3))&-1);
 var $323=((($322)+(1))|0);
 var $324=$line;
 var $325=(($324+$323)|0);
 HEAP8[($325)]=0;
 var $326=$x;
 var $327=((($326)*(3))&-1);
 var $328=((($327)+(2))|0);
 var $329=$line;
 var $330=(($329+$328)|0);
 HEAP8[($330)]=0;
 var $331=$count;
 var $332=((($331)-(1))|0);
 $count=$332;
 var $333=$x;
 var $334=((($333)+(1))|0);
 $x=$334;
 var $335=$x;
 var $336=((($335)*(3))&-1);
 var $337=$line;
 var $338=(($337+$336)|0);
 HEAP8[($338)]=0;
 var $339=$x;
 var $340=((($339)*(3))&-1);
 var $341=((($340)+(1))|0);
 var $342=$line;
 var $343=(($342+$341)|0);
 HEAP8[($343)]=0;
 var $344=$x;
 var $345=((($344)*(3))&-1);
 var $346=((($345)+(2))|0);
 var $347=$line;
 var $348=(($347+$346)|0);
 HEAP8[($348)]=0;
 var $349=$count;
 var $350=((($349)-(1))|0);
 $count=$350;
 var $351=$x;
 var $352=((($351)+(1))|0);
 $x=$352;
 var $353=$x;
 var $354=((($353)*(3))&-1);
 var $355=$line;
 var $356=(($355+$354)|0);
 HEAP8[($356)]=0;
 var $357=$x;
 var $358=((($357)*(3))&-1);
 var $359=((($358)+(1))|0);
 var $360=$line;
 var $361=(($360+$359)|0);
 HEAP8[($361)]=0;
 var $362=$x;
 var $363=((($362)*(3))&-1);
 var $364=((($363)+(2))|0);
 var $365=$line;
 var $366=(($365+$364)|0);
 HEAP8[($366)]=0;
 var $367=$count;
 var $368=((($367)-(1))|0);
 $count=$368;
 var $369=$x;
 var $370=((($369)+(1))|0);
 $x=$370;
 var $371=$x;
 var $372=((($371)*(3))&-1);
 var $373=$line;
 var $374=(($373+$372)|0);
 HEAP8[($374)]=0;
 var $375=$x;
 var $376=((($375)*(3))&-1);
 var $377=((($376)+(1))|0);
 var $378=$line;
 var $379=(($378+$377)|0);
 HEAP8[($379)]=0;
 var $380=$x;
 var $381=((($380)*(3))&-1);
 var $382=((($381)+(2))|0);
 var $383=$line;
 var $384=(($383+$382)|0);
 HEAP8[($384)]=0;
 var $385=$count;
 var $386=((($385)-(1))|0);
 $count=$386;
 var $387=$x;
 var $388=((($387)+(1))|0);
 $x=$388;
 var $389=$x;
 var $390=((($389)*(3))&-1);
 var $391=$line;
 var $392=(($391+$390)|0);
 HEAP8[($392)]=0;
 var $393=$x;
 var $394=((($393)*(3))&-1);
 var $395=((($394)+(1))|0);
 var $396=$line;
 var $397=(($396+$395)|0);
 HEAP8[($397)]=0;
 var $398=$x;
 var $399=((($398)*(3))&-1);
 var $400=((($399)+(2))|0);
 var $401=$line;
 var $402=(($401+$400)|0);
 HEAP8[($402)]=0;
 var $403=$count;
 var $404=((($403)-(1))|0);
 $count=$404;
 var $405=$x;
 var $406=((($405)+(1))|0);
 $x=$406;
 var $407=$x;
 var $408=((($407)*(3))&-1);
 var $409=$line;
 var $410=(($409+$408)|0);
 HEAP8[($410)]=0;
 var $411=$x;
 var $412=((($411)*(3))&-1);
 var $413=((($412)+(1))|0);
 var $414=$line;
 var $415=(($414+$413)|0);
 HEAP8[($415)]=0;
 var $416=$x;
 var $417=((($416)*(3))&-1);
 var $418=((($417)+(2))|0);
 var $419=$line;
 var $420=(($419+$418)|0);
 HEAP8[($420)]=0;
 var $421=$count;
 var $422=((($421)-(1))|0);
 $count=$422;
 var $423=$x;
 var $424=((($423)+(1))|0);
 $x=$424;
 label=47;break;
 case 51: 
 label=52;break;
 case 52: 
 var $427=$count;
 var $428=($427|0)>0;
 if($428){label=53;break;}else{var $434=0;label=54;break;}
 case 53: 
 var $430=$x;
 var $431=$3;
 var $432=($430|0)<($431|0);
 var $434=$432;label=54;break;
 case 54: 
 var $434;
 if($434){label=55;break;}else{label=56;break;}
 case 55: 
 var $436=$x;
 var $437=((($436)*(3))&-1);
 var $438=$line;
 var $439=(($438+$437)|0);
 HEAP8[($439)]=0;
 var $440=$x;
 var $441=((($440)*(3))&-1);
 var $442=((($441)+(1))|0);
 var $443=$line;
 var $444=(($443+$442)|0);
 HEAP8[($444)]=0;
 var $445=$x;
 var $446=((($445)*(3))&-1);
 var $447=((($446)+(2))|0);
 var $448=$line;
 var $449=(($448+$447)|0);
 HEAP8[($449)]=0;
 var $450=$count;
 var $451=((($450)-(1))|0);
 $count=$451;
 var $452=$x;
 var $453=((($452)+(1))|0);
 $x=$453;
 label=52;break;
 case 56: 
 label=68;break;
 case 57: 
 label=58;break;
 case 58: 
 var $457=$count;
 var $458=$457&-8;
 var $459=($458|0)!=0;
 if($459){label=59;break;}else{var $466=0;label=60;break;}
 case 59: 
 var $461=$x;
 var $462=((($461)+(8))|0);
 var $463=$3;
 var $464=($462|0)<($463|0);
 var $466=$464;label=60;break;
 case 60: 
 var $466;
 if($466){label=61;break;}else{label=62;break;}
 case 61: 
 var $468=$x;
 var $469=((($468)*(3))&-1);
 var $470=$prevline;
 var $471=(($470+$469)|0);
 var $472=HEAP8[($471)];
 var $473=$x;
 var $474=((($473)*(3))&-1);
 var $475=$line;
 var $476=(($475+$474)|0);
 HEAP8[($476)]=$472;
 var $477=$x;
 var $478=((($477)*(3))&-1);
 var $479=((($478)+(1))|0);
 var $480=$prevline;
 var $481=(($480+$479)|0);
 var $482=HEAP8[($481)];
 var $483=$x;
 var $484=((($483)*(3))&-1);
 var $485=((($484)+(1))|0);
 var $486=$line;
 var $487=(($486+$485)|0);
 HEAP8[($487)]=$482;
 var $488=$x;
 var $489=((($488)*(3))&-1);
 var $490=((($489)+(2))|0);
 var $491=$prevline;
 var $492=(($491+$490)|0);
 var $493=HEAP8[($492)];
 var $494=$x;
 var $495=((($494)*(3))&-1);
 var $496=((($495)+(2))|0);
 var $497=$line;
 var $498=(($497+$496)|0);
 HEAP8[($498)]=$493;
 var $499=$count;
 var $500=((($499)-(1))|0);
 $count=$500;
 var $501=$x;
 var $502=((($501)+(1))|0);
 $x=$502;
 var $503=$x;
 var $504=((($503)*(3))&-1);
 var $505=$prevline;
 var $506=(($505+$504)|0);
 var $507=HEAP8[($506)];
 var $508=$x;
 var $509=((($508)*(3))&-1);
 var $510=$line;
 var $511=(($510+$509)|0);
 HEAP8[($511)]=$507;
 var $512=$x;
 var $513=((($512)*(3))&-1);
 var $514=((($513)+(1))|0);
 var $515=$prevline;
 var $516=(($515+$514)|0);
 var $517=HEAP8[($516)];
 var $518=$x;
 var $519=((($518)*(3))&-1);
 var $520=((($519)+(1))|0);
 var $521=$line;
 var $522=(($521+$520)|0);
 HEAP8[($522)]=$517;
 var $523=$x;
 var $524=((($523)*(3))&-1);
 var $525=((($524)+(2))|0);
 var $526=$prevline;
 var $527=(($526+$525)|0);
 var $528=HEAP8[($527)];
 var $529=$x;
 var $530=((($529)*(3))&-1);
 var $531=((($530)+(2))|0);
 var $532=$line;
 var $533=(($532+$531)|0);
 HEAP8[($533)]=$528;
 var $534=$count;
 var $535=((($534)-(1))|0);
 $count=$535;
 var $536=$x;
 var $537=((($536)+(1))|0);
 $x=$537;
 var $538=$x;
 var $539=((($538)*(3))&-1);
 var $540=$prevline;
 var $541=(($540+$539)|0);
 var $542=HEAP8[($541)];
 var $543=$x;
 var $544=((($543)*(3))&-1);
 var $545=$line;
 var $546=(($545+$544)|0);
 HEAP8[($546)]=$542;
 var $547=$x;
 var $548=((($547)*(3))&-1);
 var $549=((($548)+(1))|0);
 var $550=$prevline;
 var $551=(($550+$549)|0);
 var $552=HEAP8[($551)];
 var $553=$x;
 var $554=((($553)*(3))&-1);
 var $555=((($554)+(1))|0);
 var $556=$line;
 var $557=(($556+$555)|0);
 HEAP8[($557)]=$552;
 var $558=$x;
 var $559=((($558)*(3))&-1);
 var $560=((($559)+(2))|0);
 var $561=$prevline;
 var $562=(($561+$560)|0);
 var $563=HEAP8[($562)];
 var $564=$x;
 var $565=((($564)*(3))&-1);
 var $566=((($565)+(2))|0);
 var $567=$line;
 var $568=(($567+$566)|0);
 HEAP8[($568)]=$563;
 var $569=$count;
 var $570=((($569)-(1))|0);
 $count=$570;
 var $571=$x;
 var $572=((($571)+(1))|0);
 $x=$572;
 var $573=$x;
 var $574=((($573)*(3))&-1);
 var $575=$prevline;
 var $576=(($575+$574)|0);
 var $577=HEAP8[($576)];
 var $578=$x;
 var $579=((($578)*(3))&-1);
 var $580=$line;
 var $581=(($580+$579)|0);
 HEAP8[($581)]=$577;
 var $582=$x;
 var $583=((($582)*(3))&-1);
 var $584=((($583)+(1))|0);
 var $585=$prevline;
 var $586=(($585+$584)|0);
 var $587=HEAP8[($586)];
 var $588=$x;
 var $589=((($588)*(3))&-1);
 var $590=((($589)+(1))|0);
 var $591=$line;
 var $592=(($591+$590)|0);
 HEAP8[($592)]=$587;
 var $593=$x;
 var $594=((($593)*(3))&-1);
 var $595=((($594)+(2))|0);
 var $596=$prevline;
 var $597=(($596+$595)|0);
 var $598=HEAP8[($597)];
 var $599=$x;
 var $600=((($599)*(3))&-1);
 var $601=((($600)+(2))|0);
 var $602=$line;
 var $603=(($602+$601)|0);
 HEAP8[($603)]=$598;
 var $604=$count;
 var $605=((($604)-(1))|0);
 $count=$605;
 var $606=$x;
 var $607=((($606)+(1))|0);
 $x=$607;
 var $608=$x;
 var $609=((($608)*(3))&-1);
 var $610=$prevline;
 var $611=(($610+$609)|0);
 var $612=HEAP8[($611)];
 var $613=$x;
 var $614=((($613)*(3))&-1);
 var $615=$line;
 var $616=(($615+$614)|0);
 HEAP8[($616)]=$612;
 var $617=$x;
 var $618=((($617)*(3))&-1);
 var $619=((($618)+(1))|0);
 var $620=$prevline;
 var $621=(($620+$619)|0);
 var $622=HEAP8[($621)];
 var $623=$x;
 var $624=((($623)*(3))&-1);
 var $625=((($624)+(1))|0);
 var $626=$line;
 var $627=(($626+$625)|0);
 HEAP8[($627)]=$622;
 var $628=$x;
 var $629=((($628)*(3))&-1);
 var $630=((($629)+(2))|0);
 var $631=$prevline;
 var $632=(($631+$630)|0);
 var $633=HEAP8[($632)];
 var $634=$x;
 var $635=((($634)*(3))&-1);
 var $636=((($635)+(2))|0);
 var $637=$line;
 var $638=(($637+$636)|0);
 HEAP8[($638)]=$633;
 var $639=$count;
 var $640=((($639)-(1))|0);
 $count=$640;
 var $641=$x;
 var $642=((($641)+(1))|0);
 $x=$642;
 var $643=$x;
 var $644=((($643)*(3))&-1);
 var $645=$prevline;
 var $646=(($645+$644)|0);
 var $647=HEAP8[($646)];
 var $648=$x;
 var $649=((($648)*(3))&-1);
 var $650=$line;
 var $651=(($650+$649)|0);
 HEAP8[($651)]=$647;
 var $652=$x;
 var $653=((($652)*(3))&-1);
 var $654=((($653)+(1))|0);
 var $655=$prevline;
 var $656=(($655+$654)|0);
 var $657=HEAP8[($656)];
 var $658=$x;
 var $659=((($658)*(3))&-1);
 var $660=((($659)+(1))|0);
 var $661=$line;
 var $662=(($661+$660)|0);
 HEAP8[($662)]=$657;
 var $663=$x;
 var $664=((($663)*(3))&-1);
 var $665=((($664)+(2))|0);
 var $666=$prevline;
 var $667=(($666+$665)|0);
 var $668=HEAP8[($667)];
 var $669=$x;
 var $670=((($669)*(3))&-1);
 var $671=((($670)+(2))|0);
 var $672=$line;
 var $673=(($672+$671)|0);
 HEAP8[($673)]=$668;
 var $674=$count;
 var $675=((($674)-(1))|0);
 $count=$675;
 var $676=$x;
 var $677=((($676)+(1))|0);
 $x=$677;
 var $678=$x;
 var $679=((($678)*(3))&-1);
 var $680=$prevline;
 var $681=(($680+$679)|0);
 var $682=HEAP8[($681)];
 var $683=$x;
 var $684=((($683)*(3))&-1);
 var $685=$line;
 var $686=(($685+$684)|0);
 HEAP8[($686)]=$682;
 var $687=$x;
 var $688=((($687)*(3))&-1);
 var $689=((($688)+(1))|0);
 var $690=$prevline;
 var $691=(($690+$689)|0);
 var $692=HEAP8[($691)];
 var $693=$x;
 var $694=((($693)*(3))&-1);
 var $695=((($694)+(1))|0);
 var $696=$line;
 var $697=(($696+$695)|0);
 HEAP8[($697)]=$692;
 var $698=$x;
 var $699=((($698)*(3))&-1);
 var $700=((($699)+(2))|0);
 var $701=$prevline;
 var $702=(($701+$700)|0);
 var $703=HEAP8[($702)];
 var $704=$x;
 var $705=((($704)*(3))&-1);
 var $706=((($705)+(2))|0);
 var $707=$line;
 var $708=(($707+$706)|0);
 HEAP8[($708)]=$703;
 var $709=$count;
 var $710=((($709)-(1))|0);
 $count=$710;
 var $711=$x;
 var $712=((($711)+(1))|0);
 $x=$712;
 var $713=$x;
 var $714=((($713)*(3))&-1);
 var $715=$prevline;
 var $716=(($715+$714)|0);
 var $717=HEAP8[($716)];
 var $718=$x;
 var $719=((($718)*(3))&-1);
 var $720=$line;
 var $721=(($720+$719)|0);
 HEAP8[($721)]=$717;
 var $722=$x;
 var $723=((($722)*(3))&-1);
 var $724=((($723)+(1))|0);
 var $725=$prevline;
 var $726=(($725+$724)|0);
 var $727=HEAP8[($726)];
 var $728=$x;
 var $729=((($728)*(3))&-1);
 var $730=((($729)+(1))|0);
 var $731=$line;
 var $732=(($731+$730)|0);
 HEAP8[($732)]=$727;
 var $733=$x;
 var $734=((($733)*(3))&-1);
 var $735=((($734)+(2))|0);
 var $736=$prevline;
 var $737=(($736+$735)|0);
 var $738=HEAP8[($737)];
 var $739=$x;
 var $740=((($739)*(3))&-1);
 var $741=((($740)+(2))|0);
 var $742=$line;
 var $743=(($742+$741)|0);
 HEAP8[($743)]=$738;
 var $744=$count;
 var $745=((($744)-(1))|0);
 $count=$745;
 var $746=$x;
 var $747=((($746)+(1))|0);
 $x=$747;
 label=58;break;
 case 62: 
 label=63;break;
 case 63: 
 var $750=$count;
 var $751=($750|0)>0;
 if($751){label=64;break;}else{var $757=0;label=65;break;}
 case 64: 
 var $753=$x;
 var $754=$3;
 var $755=($753|0)<($754|0);
 var $757=$755;label=65;break;
 case 65: 
 var $757;
 if($757){label=66;break;}else{label=67;break;}
 case 66: 
 var $759=$x;
 var $760=((($759)*(3))&-1);
 var $761=$prevline;
 var $762=(($761+$760)|0);
 var $763=HEAP8[($762)];
 var $764=$x;
 var $765=((($764)*(3))&-1);
 var $766=$line;
 var $767=(($766+$765)|0);
 HEAP8[($767)]=$763;
 var $768=$x;
 var $769=((($768)*(3))&-1);
 var $770=((($769)+(1))|0);
 var $771=$prevline;
 var $772=(($771+$770)|0);
 var $773=HEAP8[($772)];
 var $774=$x;
 var $775=((($774)*(3))&-1);
 var $776=((($775)+(1))|0);
 var $777=$line;
 var $778=(($777+$776)|0);
 HEAP8[($778)]=$773;
 var $779=$x;
 var $780=((($779)*(3))&-1);
 var $781=((($780)+(2))|0);
 var $782=$prevline;
 var $783=(($782+$781)|0);
 var $784=HEAP8[($783)];
 var $785=$x;
 var $786=((($785)*(3))&-1);
 var $787=((($786)+(2))|0);
 var $788=$line;
 var $789=(($788+$787)|0);
 HEAP8[($789)]=$784;
 var $790=$count;
 var $791=((($790)-(1))|0);
 $count=$791;
 var $792=$x;
 var $793=((($792)+(1))|0);
 $x=$793;
 label=63;break;
 case 67: 
 label=68;break;
 case 68: 
 label=344;break;
 case 69: 
 var $797=$prevline;
 var $798=($797|0)==0;
 if($798){label=70;break;}else{label=81;break;}
 case 70: 
 label=71;break;
 case 71: 
 var $801=$count;
 var $802=$801&-8;
 var $803=($802|0)!=0;
 if($803){label=72;break;}else{var $810=0;label=73;break;}
 case 72: 
 var $805=$x;
 var $806=((($805)+(8))|0);
 var $807=$3;
 var $808=($806|0)<($807|0);
 var $810=$808;label=73;break;
 case 73: 
 var $810;
 if($810){label=74;break;}else{label=75;break;}
 case 74: 
 var $812=(($mix)|0);
 var $813=HEAP8[($812)];
 var $814=$x;
 var $815=((($814)*(3))&-1);
 var $816=$line;
 var $817=(($816+$815)|0);
 HEAP8[($817)]=$813;
 var $818=(($mix+1)|0);
 var $819=HEAP8[($818)];
 var $820=$x;
 var $821=((($820)*(3))&-1);
 var $822=((($821)+(1))|0);
 var $823=$line;
 var $824=(($823+$822)|0);
 HEAP8[($824)]=$819;
 var $825=(($mix+2)|0);
 var $826=HEAP8[($825)];
 var $827=$x;
 var $828=((($827)*(3))&-1);
 var $829=((($828)+(2))|0);
 var $830=$line;
 var $831=(($830+$829)|0);
 HEAP8[($831)]=$826;
 var $832=$count;
 var $833=((($832)-(1))|0);
 $count=$833;
 var $834=$x;
 var $835=((($834)+(1))|0);
 $x=$835;
 var $836=(($mix)|0);
 var $837=HEAP8[($836)];
 var $838=$x;
 var $839=((($838)*(3))&-1);
 var $840=$line;
 var $841=(($840+$839)|0);
 HEAP8[($841)]=$837;
 var $842=(($mix+1)|0);
 var $843=HEAP8[($842)];
 var $844=$x;
 var $845=((($844)*(3))&-1);
 var $846=((($845)+(1))|0);
 var $847=$line;
 var $848=(($847+$846)|0);
 HEAP8[($848)]=$843;
 var $849=(($mix+2)|0);
 var $850=HEAP8[($849)];
 var $851=$x;
 var $852=((($851)*(3))&-1);
 var $853=((($852)+(2))|0);
 var $854=$line;
 var $855=(($854+$853)|0);
 HEAP8[($855)]=$850;
 var $856=$count;
 var $857=((($856)-(1))|0);
 $count=$857;
 var $858=$x;
 var $859=((($858)+(1))|0);
 $x=$859;
 var $860=(($mix)|0);
 var $861=HEAP8[($860)];
 var $862=$x;
 var $863=((($862)*(3))&-1);
 var $864=$line;
 var $865=(($864+$863)|0);
 HEAP8[($865)]=$861;
 var $866=(($mix+1)|0);
 var $867=HEAP8[($866)];
 var $868=$x;
 var $869=((($868)*(3))&-1);
 var $870=((($869)+(1))|0);
 var $871=$line;
 var $872=(($871+$870)|0);
 HEAP8[($872)]=$867;
 var $873=(($mix+2)|0);
 var $874=HEAP8[($873)];
 var $875=$x;
 var $876=((($875)*(3))&-1);
 var $877=((($876)+(2))|0);
 var $878=$line;
 var $879=(($878+$877)|0);
 HEAP8[($879)]=$874;
 var $880=$count;
 var $881=((($880)-(1))|0);
 $count=$881;
 var $882=$x;
 var $883=((($882)+(1))|0);
 $x=$883;
 var $884=(($mix)|0);
 var $885=HEAP8[($884)];
 var $886=$x;
 var $887=((($886)*(3))&-1);
 var $888=$line;
 var $889=(($888+$887)|0);
 HEAP8[($889)]=$885;
 var $890=(($mix+1)|0);
 var $891=HEAP8[($890)];
 var $892=$x;
 var $893=((($892)*(3))&-1);
 var $894=((($893)+(1))|0);
 var $895=$line;
 var $896=(($895+$894)|0);
 HEAP8[($896)]=$891;
 var $897=(($mix+2)|0);
 var $898=HEAP8[($897)];
 var $899=$x;
 var $900=((($899)*(3))&-1);
 var $901=((($900)+(2))|0);
 var $902=$line;
 var $903=(($902+$901)|0);
 HEAP8[($903)]=$898;
 var $904=$count;
 var $905=((($904)-(1))|0);
 $count=$905;
 var $906=$x;
 var $907=((($906)+(1))|0);
 $x=$907;
 var $908=(($mix)|0);
 var $909=HEAP8[($908)];
 var $910=$x;
 var $911=((($910)*(3))&-1);
 var $912=$line;
 var $913=(($912+$911)|0);
 HEAP8[($913)]=$909;
 var $914=(($mix+1)|0);
 var $915=HEAP8[($914)];
 var $916=$x;
 var $917=((($916)*(3))&-1);
 var $918=((($917)+(1))|0);
 var $919=$line;
 var $920=(($919+$918)|0);
 HEAP8[($920)]=$915;
 var $921=(($mix+2)|0);
 var $922=HEAP8[($921)];
 var $923=$x;
 var $924=((($923)*(3))&-1);
 var $925=((($924)+(2))|0);
 var $926=$line;
 var $927=(($926+$925)|0);
 HEAP8[($927)]=$922;
 var $928=$count;
 var $929=((($928)-(1))|0);
 $count=$929;
 var $930=$x;
 var $931=((($930)+(1))|0);
 $x=$931;
 var $932=(($mix)|0);
 var $933=HEAP8[($932)];
 var $934=$x;
 var $935=((($934)*(3))&-1);
 var $936=$line;
 var $937=(($936+$935)|0);
 HEAP8[($937)]=$933;
 var $938=(($mix+1)|0);
 var $939=HEAP8[($938)];
 var $940=$x;
 var $941=((($940)*(3))&-1);
 var $942=((($941)+(1))|0);
 var $943=$line;
 var $944=(($943+$942)|0);
 HEAP8[($944)]=$939;
 var $945=(($mix+2)|0);
 var $946=HEAP8[($945)];
 var $947=$x;
 var $948=((($947)*(3))&-1);
 var $949=((($948)+(2))|0);
 var $950=$line;
 var $951=(($950+$949)|0);
 HEAP8[($951)]=$946;
 var $952=$count;
 var $953=((($952)-(1))|0);
 $count=$953;
 var $954=$x;
 var $955=((($954)+(1))|0);
 $x=$955;
 var $956=(($mix)|0);
 var $957=HEAP8[($956)];
 var $958=$x;
 var $959=((($958)*(3))&-1);
 var $960=$line;
 var $961=(($960+$959)|0);
 HEAP8[($961)]=$957;
 var $962=(($mix+1)|0);
 var $963=HEAP8[($962)];
 var $964=$x;
 var $965=((($964)*(3))&-1);
 var $966=((($965)+(1))|0);
 var $967=$line;
 var $968=(($967+$966)|0);
 HEAP8[($968)]=$963;
 var $969=(($mix+2)|0);
 var $970=HEAP8[($969)];
 var $971=$x;
 var $972=((($971)*(3))&-1);
 var $973=((($972)+(2))|0);
 var $974=$line;
 var $975=(($974+$973)|0);
 HEAP8[($975)]=$970;
 var $976=$count;
 var $977=((($976)-(1))|0);
 $count=$977;
 var $978=$x;
 var $979=((($978)+(1))|0);
 $x=$979;
 var $980=(($mix)|0);
 var $981=HEAP8[($980)];
 var $982=$x;
 var $983=((($982)*(3))&-1);
 var $984=$line;
 var $985=(($984+$983)|0);
 HEAP8[($985)]=$981;
 var $986=(($mix+1)|0);
 var $987=HEAP8[($986)];
 var $988=$x;
 var $989=((($988)*(3))&-1);
 var $990=((($989)+(1))|0);
 var $991=$line;
 var $992=(($991+$990)|0);
 HEAP8[($992)]=$987;
 var $993=(($mix+2)|0);
 var $994=HEAP8[($993)];
 var $995=$x;
 var $996=((($995)*(3))&-1);
 var $997=((($996)+(2))|0);
 var $998=$line;
 var $999=(($998+$997)|0);
 HEAP8[($999)]=$994;
 var $1000=$count;
 var $1001=((($1000)-(1))|0);
 $count=$1001;
 var $1002=$x;
 var $1003=((($1002)+(1))|0);
 $x=$1003;
 label=71;break;
 case 75: 
 label=76;break;
 case 76: 
 var $1006=$count;
 var $1007=($1006|0)>0;
 if($1007){label=77;break;}else{var $1013=0;label=78;break;}
 case 77: 
 var $1009=$x;
 var $1010=$3;
 var $1011=($1009|0)<($1010|0);
 var $1013=$1011;label=78;break;
 case 78: 
 var $1013;
 if($1013){label=79;break;}else{label=80;break;}
 case 79: 
 var $1015=(($mix)|0);
 var $1016=HEAP8[($1015)];
 var $1017=$x;
 var $1018=((($1017)*(3))&-1);
 var $1019=$line;
 var $1020=(($1019+$1018)|0);
 HEAP8[($1020)]=$1016;
 var $1021=(($mix+1)|0);
 var $1022=HEAP8[($1021)];
 var $1023=$x;
 var $1024=((($1023)*(3))&-1);
 var $1025=((($1024)+(1))|0);
 var $1026=$line;
 var $1027=(($1026+$1025)|0);
 HEAP8[($1027)]=$1022;
 var $1028=(($mix+2)|0);
 var $1029=HEAP8[($1028)];
 var $1030=$x;
 var $1031=((($1030)*(3))&-1);
 var $1032=((($1031)+(2))|0);
 var $1033=$line;
 var $1034=(($1033+$1032)|0);
 HEAP8[($1034)]=$1029;
 var $1035=$count;
 var $1036=((($1035)-(1))|0);
 $count=$1036;
 var $1037=$x;
 var $1038=((($1037)+(1))|0);
 $x=$1038;
 label=76;break;
 case 80: 
 label=92;break;
 case 81: 
 label=82;break;
 case 82: 
 var $1042=$count;
 var $1043=$1042&-8;
 var $1044=($1043|0)!=0;
 if($1044){label=83;break;}else{var $1051=0;label=84;break;}
 case 83: 
 var $1046=$x;
 var $1047=((($1046)+(8))|0);
 var $1048=$3;
 var $1049=($1047|0)<($1048|0);
 var $1051=$1049;label=84;break;
 case 84: 
 var $1051;
 if($1051){label=85;break;}else{label=86;break;}
 case 85: 
 var $1053=$x;
 var $1054=((($1053)*(3))&-1);
 var $1055=$prevline;
 var $1056=(($1055+$1054)|0);
 var $1057=HEAP8[($1056)];
 var $1058=($1057&255);
 var $1059=(($mix)|0);
 var $1060=HEAP8[($1059)];
 var $1061=($1060&255);
 var $1062=$1058^$1061;
 var $1063=(($1062)&255);
 var $1064=$x;
 var $1065=((($1064)*(3))&-1);
 var $1066=$line;
 var $1067=(($1066+$1065)|0);
 HEAP8[($1067)]=$1063;
 var $1068=$x;
 var $1069=((($1068)*(3))&-1);
 var $1070=((($1069)+(1))|0);
 var $1071=$prevline;
 var $1072=(($1071+$1070)|0);
 var $1073=HEAP8[($1072)];
 var $1074=($1073&255);
 var $1075=(($mix+1)|0);
 var $1076=HEAP8[($1075)];
 var $1077=($1076&255);
 var $1078=$1074^$1077;
 var $1079=(($1078)&255);
 var $1080=$x;
 var $1081=((($1080)*(3))&-1);
 var $1082=((($1081)+(1))|0);
 var $1083=$line;
 var $1084=(($1083+$1082)|0);
 HEAP8[($1084)]=$1079;
 var $1085=$x;
 var $1086=((($1085)*(3))&-1);
 var $1087=((($1086)+(2))|0);
 var $1088=$prevline;
 var $1089=(($1088+$1087)|0);
 var $1090=HEAP8[($1089)];
 var $1091=($1090&255);
 var $1092=(($mix+2)|0);
 var $1093=HEAP8[($1092)];
 var $1094=($1093&255);
 var $1095=$1091^$1094;
 var $1096=(($1095)&255);
 var $1097=$x;
 var $1098=((($1097)*(3))&-1);
 var $1099=((($1098)+(2))|0);
 var $1100=$line;
 var $1101=(($1100+$1099)|0);
 HEAP8[($1101)]=$1096;
 var $1102=$count;
 var $1103=((($1102)-(1))|0);
 $count=$1103;
 var $1104=$x;
 var $1105=((($1104)+(1))|0);
 $x=$1105;
 var $1106=$x;
 var $1107=((($1106)*(3))&-1);
 var $1108=$prevline;
 var $1109=(($1108+$1107)|0);
 var $1110=HEAP8[($1109)];
 var $1111=($1110&255);
 var $1112=(($mix)|0);
 var $1113=HEAP8[($1112)];
 var $1114=($1113&255);
 var $1115=$1111^$1114;
 var $1116=(($1115)&255);
 var $1117=$x;
 var $1118=((($1117)*(3))&-1);
 var $1119=$line;
 var $1120=(($1119+$1118)|0);
 HEAP8[($1120)]=$1116;
 var $1121=$x;
 var $1122=((($1121)*(3))&-1);
 var $1123=((($1122)+(1))|0);
 var $1124=$prevline;
 var $1125=(($1124+$1123)|0);
 var $1126=HEAP8[($1125)];
 var $1127=($1126&255);
 var $1128=(($mix+1)|0);
 var $1129=HEAP8[($1128)];
 var $1130=($1129&255);
 var $1131=$1127^$1130;
 var $1132=(($1131)&255);
 var $1133=$x;
 var $1134=((($1133)*(3))&-1);
 var $1135=((($1134)+(1))|0);
 var $1136=$line;
 var $1137=(($1136+$1135)|0);
 HEAP8[($1137)]=$1132;
 var $1138=$x;
 var $1139=((($1138)*(3))&-1);
 var $1140=((($1139)+(2))|0);
 var $1141=$prevline;
 var $1142=(($1141+$1140)|0);
 var $1143=HEAP8[($1142)];
 var $1144=($1143&255);
 var $1145=(($mix+2)|0);
 var $1146=HEAP8[($1145)];
 var $1147=($1146&255);
 var $1148=$1144^$1147;
 var $1149=(($1148)&255);
 var $1150=$x;
 var $1151=((($1150)*(3))&-1);
 var $1152=((($1151)+(2))|0);
 var $1153=$line;
 var $1154=(($1153+$1152)|0);
 HEAP8[($1154)]=$1149;
 var $1155=$count;
 var $1156=((($1155)-(1))|0);
 $count=$1156;
 var $1157=$x;
 var $1158=((($1157)+(1))|0);
 $x=$1158;
 var $1159=$x;
 var $1160=((($1159)*(3))&-1);
 var $1161=$prevline;
 var $1162=(($1161+$1160)|0);
 var $1163=HEAP8[($1162)];
 var $1164=($1163&255);
 var $1165=(($mix)|0);
 var $1166=HEAP8[($1165)];
 var $1167=($1166&255);
 var $1168=$1164^$1167;
 var $1169=(($1168)&255);
 var $1170=$x;
 var $1171=((($1170)*(3))&-1);
 var $1172=$line;
 var $1173=(($1172+$1171)|0);
 HEAP8[($1173)]=$1169;
 var $1174=$x;
 var $1175=((($1174)*(3))&-1);
 var $1176=((($1175)+(1))|0);
 var $1177=$prevline;
 var $1178=(($1177+$1176)|0);
 var $1179=HEAP8[($1178)];
 var $1180=($1179&255);
 var $1181=(($mix+1)|0);
 var $1182=HEAP8[($1181)];
 var $1183=($1182&255);
 var $1184=$1180^$1183;
 var $1185=(($1184)&255);
 var $1186=$x;
 var $1187=((($1186)*(3))&-1);
 var $1188=((($1187)+(1))|0);
 var $1189=$line;
 var $1190=(($1189+$1188)|0);
 HEAP8[($1190)]=$1185;
 var $1191=$x;
 var $1192=((($1191)*(3))&-1);
 var $1193=((($1192)+(2))|0);
 var $1194=$prevline;
 var $1195=(($1194+$1193)|0);
 var $1196=HEAP8[($1195)];
 var $1197=($1196&255);
 var $1198=(($mix+2)|0);
 var $1199=HEAP8[($1198)];
 var $1200=($1199&255);
 var $1201=$1197^$1200;
 var $1202=(($1201)&255);
 var $1203=$x;
 var $1204=((($1203)*(3))&-1);
 var $1205=((($1204)+(2))|0);
 var $1206=$line;
 var $1207=(($1206+$1205)|0);
 HEAP8[($1207)]=$1202;
 var $1208=$count;
 var $1209=((($1208)-(1))|0);
 $count=$1209;
 var $1210=$x;
 var $1211=((($1210)+(1))|0);
 $x=$1211;
 var $1212=$x;
 var $1213=((($1212)*(3))&-1);
 var $1214=$prevline;
 var $1215=(($1214+$1213)|0);
 var $1216=HEAP8[($1215)];
 var $1217=($1216&255);
 var $1218=(($mix)|0);
 var $1219=HEAP8[($1218)];
 var $1220=($1219&255);
 var $1221=$1217^$1220;
 var $1222=(($1221)&255);
 var $1223=$x;
 var $1224=((($1223)*(3))&-1);
 var $1225=$line;
 var $1226=(($1225+$1224)|0);
 HEAP8[($1226)]=$1222;
 var $1227=$x;
 var $1228=((($1227)*(3))&-1);
 var $1229=((($1228)+(1))|0);
 var $1230=$prevline;
 var $1231=(($1230+$1229)|0);
 var $1232=HEAP8[($1231)];
 var $1233=($1232&255);
 var $1234=(($mix+1)|0);
 var $1235=HEAP8[($1234)];
 var $1236=($1235&255);
 var $1237=$1233^$1236;
 var $1238=(($1237)&255);
 var $1239=$x;
 var $1240=((($1239)*(3))&-1);
 var $1241=((($1240)+(1))|0);
 var $1242=$line;
 var $1243=(($1242+$1241)|0);
 HEAP8[($1243)]=$1238;
 var $1244=$x;
 var $1245=((($1244)*(3))&-1);
 var $1246=((($1245)+(2))|0);
 var $1247=$prevline;
 var $1248=(($1247+$1246)|0);
 var $1249=HEAP8[($1248)];
 var $1250=($1249&255);
 var $1251=(($mix+2)|0);
 var $1252=HEAP8[($1251)];
 var $1253=($1252&255);
 var $1254=$1250^$1253;
 var $1255=(($1254)&255);
 var $1256=$x;
 var $1257=((($1256)*(3))&-1);
 var $1258=((($1257)+(2))|0);
 var $1259=$line;
 var $1260=(($1259+$1258)|0);
 HEAP8[($1260)]=$1255;
 var $1261=$count;
 var $1262=((($1261)-(1))|0);
 $count=$1262;
 var $1263=$x;
 var $1264=((($1263)+(1))|0);
 $x=$1264;
 var $1265=$x;
 var $1266=((($1265)*(3))&-1);
 var $1267=$prevline;
 var $1268=(($1267+$1266)|0);
 var $1269=HEAP8[($1268)];
 var $1270=($1269&255);
 var $1271=(($mix)|0);
 var $1272=HEAP8[($1271)];
 var $1273=($1272&255);
 var $1274=$1270^$1273;
 var $1275=(($1274)&255);
 var $1276=$x;
 var $1277=((($1276)*(3))&-1);
 var $1278=$line;
 var $1279=(($1278+$1277)|0);
 HEAP8[($1279)]=$1275;
 var $1280=$x;
 var $1281=((($1280)*(3))&-1);
 var $1282=((($1281)+(1))|0);
 var $1283=$prevline;
 var $1284=(($1283+$1282)|0);
 var $1285=HEAP8[($1284)];
 var $1286=($1285&255);
 var $1287=(($mix+1)|0);
 var $1288=HEAP8[($1287)];
 var $1289=($1288&255);
 var $1290=$1286^$1289;
 var $1291=(($1290)&255);
 var $1292=$x;
 var $1293=((($1292)*(3))&-1);
 var $1294=((($1293)+(1))|0);
 var $1295=$line;
 var $1296=(($1295+$1294)|0);
 HEAP8[($1296)]=$1291;
 var $1297=$x;
 var $1298=((($1297)*(3))&-1);
 var $1299=((($1298)+(2))|0);
 var $1300=$prevline;
 var $1301=(($1300+$1299)|0);
 var $1302=HEAP8[($1301)];
 var $1303=($1302&255);
 var $1304=(($mix+2)|0);
 var $1305=HEAP8[($1304)];
 var $1306=($1305&255);
 var $1307=$1303^$1306;
 var $1308=(($1307)&255);
 var $1309=$x;
 var $1310=((($1309)*(3))&-1);
 var $1311=((($1310)+(2))|0);
 var $1312=$line;
 var $1313=(($1312+$1311)|0);
 HEAP8[($1313)]=$1308;
 var $1314=$count;
 var $1315=((($1314)-(1))|0);
 $count=$1315;
 var $1316=$x;
 var $1317=((($1316)+(1))|0);
 $x=$1317;
 var $1318=$x;
 var $1319=((($1318)*(3))&-1);
 var $1320=$prevline;
 var $1321=(($1320+$1319)|0);
 var $1322=HEAP8[($1321)];
 var $1323=($1322&255);
 var $1324=(($mix)|0);
 var $1325=HEAP8[($1324)];
 var $1326=($1325&255);
 var $1327=$1323^$1326;
 var $1328=(($1327)&255);
 var $1329=$x;
 var $1330=((($1329)*(3))&-1);
 var $1331=$line;
 var $1332=(($1331+$1330)|0);
 HEAP8[($1332)]=$1328;
 var $1333=$x;
 var $1334=((($1333)*(3))&-1);
 var $1335=((($1334)+(1))|0);
 var $1336=$prevline;
 var $1337=(($1336+$1335)|0);
 var $1338=HEAP8[($1337)];
 var $1339=($1338&255);
 var $1340=(($mix+1)|0);
 var $1341=HEAP8[($1340)];
 var $1342=($1341&255);
 var $1343=$1339^$1342;
 var $1344=(($1343)&255);
 var $1345=$x;
 var $1346=((($1345)*(3))&-1);
 var $1347=((($1346)+(1))|0);
 var $1348=$line;
 var $1349=(($1348+$1347)|0);
 HEAP8[($1349)]=$1344;
 var $1350=$x;
 var $1351=((($1350)*(3))&-1);
 var $1352=((($1351)+(2))|0);
 var $1353=$prevline;
 var $1354=(($1353+$1352)|0);
 var $1355=HEAP8[($1354)];
 var $1356=($1355&255);
 var $1357=(($mix+2)|0);
 var $1358=HEAP8[($1357)];
 var $1359=($1358&255);
 var $1360=$1356^$1359;
 var $1361=(($1360)&255);
 var $1362=$x;
 var $1363=((($1362)*(3))&-1);
 var $1364=((($1363)+(2))|0);
 var $1365=$line;
 var $1366=(($1365+$1364)|0);
 HEAP8[($1366)]=$1361;
 var $1367=$count;
 var $1368=((($1367)-(1))|0);
 $count=$1368;
 var $1369=$x;
 var $1370=((($1369)+(1))|0);
 $x=$1370;
 var $1371=$x;
 var $1372=((($1371)*(3))&-1);
 var $1373=$prevline;
 var $1374=(($1373+$1372)|0);
 var $1375=HEAP8[($1374)];
 var $1376=($1375&255);
 var $1377=(($mix)|0);
 var $1378=HEAP8[($1377)];
 var $1379=($1378&255);
 var $1380=$1376^$1379;
 var $1381=(($1380)&255);
 var $1382=$x;
 var $1383=((($1382)*(3))&-1);
 var $1384=$line;
 var $1385=(($1384+$1383)|0);
 HEAP8[($1385)]=$1381;
 var $1386=$x;
 var $1387=((($1386)*(3))&-1);
 var $1388=((($1387)+(1))|0);
 var $1389=$prevline;
 var $1390=(($1389+$1388)|0);
 var $1391=HEAP8[($1390)];
 var $1392=($1391&255);
 var $1393=(($mix+1)|0);
 var $1394=HEAP8[($1393)];
 var $1395=($1394&255);
 var $1396=$1392^$1395;
 var $1397=(($1396)&255);
 var $1398=$x;
 var $1399=((($1398)*(3))&-1);
 var $1400=((($1399)+(1))|0);
 var $1401=$line;
 var $1402=(($1401+$1400)|0);
 HEAP8[($1402)]=$1397;
 var $1403=$x;
 var $1404=((($1403)*(3))&-1);
 var $1405=((($1404)+(2))|0);
 var $1406=$prevline;
 var $1407=(($1406+$1405)|0);
 var $1408=HEAP8[($1407)];
 var $1409=($1408&255);
 var $1410=(($mix+2)|0);
 var $1411=HEAP8[($1410)];
 var $1412=($1411&255);
 var $1413=$1409^$1412;
 var $1414=(($1413)&255);
 var $1415=$x;
 var $1416=((($1415)*(3))&-1);
 var $1417=((($1416)+(2))|0);
 var $1418=$line;
 var $1419=(($1418+$1417)|0);
 HEAP8[($1419)]=$1414;
 var $1420=$count;
 var $1421=((($1420)-(1))|0);
 $count=$1421;
 var $1422=$x;
 var $1423=((($1422)+(1))|0);
 $x=$1423;
 var $1424=$x;
 var $1425=((($1424)*(3))&-1);
 var $1426=$prevline;
 var $1427=(($1426+$1425)|0);
 var $1428=HEAP8[($1427)];
 var $1429=($1428&255);
 var $1430=(($mix)|0);
 var $1431=HEAP8[($1430)];
 var $1432=($1431&255);
 var $1433=$1429^$1432;
 var $1434=(($1433)&255);
 var $1435=$x;
 var $1436=((($1435)*(3))&-1);
 var $1437=$line;
 var $1438=(($1437+$1436)|0);
 HEAP8[($1438)]=$1434;
 var $1439=$x;
 var $1440=((($1439)*(3))&-1);
 var $1441=((($1440)+(1))|0);
 var $1442=$prevline;
 var $1443=(($1442+$1441)|0);
 var $1444=HEAP8[($1443)];
 var $1445=($1444&255);
 var $1446=(($mix+1)|0);
 var $1447=HEAP8[($1446)];
 var $1448=($1447&255);
 var $1449=$1445^$1448;
 var $1450=(($1449)&255);
 var $1451=$x;
 var $1452=((($1451)*(3))&-1);
 var $1453=((($1452)+(1))|0);
 var $1454=$line;
 var $1455=(($1454+$1453)|0);
 HEAP8[($1455)]=$1450;
 var $1456=$x;
 var $1457=((($1456)*(3))&-1);
 var $1458=((($1457)+(2))|0);
 var $1459=$prevline;
 var $1460=(($1459+$1458)|0);
 var $1461=HEAP8[($1460)];
 var $1462=($1461&255);
 var $1463=(($mix+2)|0);
 var $1464=HEAP8[($1463)];
 var $1465=($1464&255);
 var $1466=$1462^$1465;
 var $1467=(($1466)&255);
 var $1468=$x;
 var $1469=((($1468)*(3))&-1);
 var $1470=((($1469)+(2))|0);
 var $1471=$line;
 var $1472=(($1471+$1470)|0);
 HEAP8[($1472)]=$1467;
 var $1473=$count;
 var $1474=((($1473)-(1))|0);
 $count=$1474;
 var $1475=$x;
 var $1476=((($1475)+(1))|0);
 $x=$1476;
 label=82;break;
 case 86: 
 label=87;break;
 case 87: 
 var $1479=$count;
 var $1480=($1479|0)>0;
 if($1480){label=88;break;}else{var $1486=0;label=89;break;}
 case 88: 
 var $1482=$x;
 var $1483=$3;
 var $1484=($1482|0)<($1483|0);
 var $1486=$1484;label=89;break;
 case 89: 
 var $1486;
 if($1486){label=90;break;}else{label=91;break;}
 case 90: 
 var $1488=$x;
 var $1489=((($1488)*(3))&-1);
 var $1490=$prevline;
 var $1491=(($1490+$1489)|0);
 var $1492=HEAP8[($1491)];
 var $1493=($1492&255);
 var $1494=(($mix)|0);
 var $1495=HEAP8[($1494)];
 var $1496=($1495&255);
 var $1497=$1493^$1496;
 var $1498=(($1497)&255);
 var $1499=$x;
 var $1500=((($1499)*(3))&-1);
 var $1501=$line;
 var $1502=(($1501+$1500)|0);
 HEAP8[($1502)]=$1498;
 var $1503=$x;
 var $1504=((($1503)*(3))&-1);
 var $1505=((($1504)+(1))|0);
 var $1506=$prevline;
 var $1507=(($1506+$1505)|0);
 var $1508=HEAP8[($1507)];
 var $1509=($1508&255);
 var $1510=(($mix+1)|0);
 var $1511=HEAP8[($1510)];
 var $1512=($1511&255);
 var $1513=$1509^$1512;
 var $1514=(($1513)&255);
 var $1515=$x;
 var $1516=((($1515)*(3))&-1);
 var $1517=((($1516)+(1))|0);
 var $1518=$line;
 var $1519=(($1518+$1517)|0);
 HEAP8[($1519)]=$1514;
 var $1520=$x;
 var $1521=((($1520)*(3))&-1);
 var $1522=((($1521)+(2))|0);
 var $1523=$prevline;
 var $1524=(($1523+$1522)|0);
 var $1525=HEAP8[($1524)];
 var $1526=($1525&255);
 var $1527=(($mix+2)|0);
 var $1528=HEAP8[($1527)];
 var $1529=($1528&255);
 var $1530=$1526^$1529;
 var $1531=(($1530)&255);
 var $1532=$x;
 var $1533=((($1532)*(3))&-1);
 var $1534=((($1533)+(2))|0);
 var $1535=$line;
 var $1536=(($1535+$1534)|0);
 HEAP8[($1536)]=$1531;
 var $1537=$count;
 var $1538=((($1537)-(1))|0);
 $count=$1538;
 var $1539=$x;
 var $1540=((($1539)+(1))|0);
 $x=$1540;
 label=87;break;
 case 91: 
 label=92;break;
 case 92: 
 label=344;break;
 case 93: 
 var $1544=$prevline;
 var $1545=($1544|0)==0;
 if($1545){label=94;break;}else{label=177;break;}
 case 94: 
 label=95;break;
 case 95: 
 var $1548=$count;
 var $1549=$1548&-8;
 var $1550=($1549|0)!=0;
 if($1550){label=96;break;}else{var $1557=0;label=97;break;}
 case 96: 
 var $1552=$x;
 var $1553=((($1552)+(8))|0);
 var $1554=$3;
 var $1555=($1553|0)<($1554|0);
 var $1557=$1555;label=97;break;
 case 97: 
 var $1557;
 if($1557){label=98;break;}else{label=163;break;}
 case 98: 
 var $1559=$mixmask;
 var $1560=($1559&255);
 var $1561=$1560<<1;
 var $1562=(($1561)&255);
 $mixmask=$1562;
 var $1563=$mixmask;
 var $1564=($1563&255);
 var $1565=($1564|0)==0;
 if($1565){label=99;break;}else{label=103;break;}
 case 99: 
 var $1567=$fom_mask;
 var $1568=($1567|0)!=0;
 if($1568){label=100;break;}else{label=101;break;}
 case 100: 
 var $1570=$fom_mask;
 var $1577=$1570;label=102;break;
 case 101: 
 var $1572=$5;
 var $1573=(($1572+1)|0);
 $5=$1573;
 var $1574=HEAP8[($1572)];
 var $1575=($1574&255);
 var $1577=$1575;label=102;break;
 case 102: 
 var $1577;
 var $1578=(($1577)&255);
 $mask=$1578;
 $mixmask=1;
 label=103;break;
 case 103: 
 var $1580=$mask;
 var $1581=($1580&255);
 var $1582=$mixmask;
 var $1583=($1582&255);
 var $1584=$1581&$1583;
 var $1585=($1584|0)!=0;
 if($1585){label=104;break;}else{label=105;break;}
 case 104: 
 var $1587=(($mix)|0);
 var $1588=HEAP8[($1587)];
 var $1589=$x;
 var $1590=((($1589)*(3))&-1);
 var $1591=$line;
 var $1592=(($1591+$1590)|0);
 HEAP8[($1592)]=$1588;
 var $1593=(($mix+1)|0);
 var $1594=HEAP8[($1593)];
 var $1595=$x;
 var $1596=((($1595)*(3))&-1);
 var $1597=((($1596)+(1))|0);
 var $1598=$line;
 var $1599=(($1598+$1597)|0);
 HEAP8[($1599)]=$1594;
 var $1600=(($mix+2)|0);
 var $1601=HEAP8[($1600)];
 var $1602=$x;
 var $1603=((($1602)*(3))&-1);
 var $1604=((($1603)+(2))|0);
 var $1605=$line;
 var $1606=(($1605+$1604)|0);
 HEAP8[($1606)]=$1601;
 label=106;break;
 case 105: 
 var $1608=$x;
 var $1609=((($1608)*(3))&-1);
 var $1610=$line;
 var $1611=(($1610+$1609)|0);
 HEAP8[($1611)]=0;
 var $1612=$x;
 var $1613=((($1612)*(3))&-1);
 var $1614=((($1613)+(1))|0);
 var $1615=$line;
 var $1616=(($1615+$1614)|0);
 HEAP8[($1616)]=0;
 var $1617=$x;
 var $1618=((($1617)*(3))&-1);
 var $1619=((($1618)+(2))|0);
 var $1620=$line;
 var $1621=(($1620+$1619)|0);
 HEAP8[($1621)]=0;
 label=106;break;
 case 106: 
 var $1623=$count;
 var $1624=((($1623)-(1))|0);
 $count=$1624;
 var $1625=$x;
 var $1626=((($1625)+(1))|0);
 $x=$1626;
 var $1627=$mixmask;
 var $1628=($1627&255);
 var $1629=$1628<<1;
 var $1630=(($1629)&255);
 $mixmask=$1630;
 var $1631=$mixmask;
 var $1632=($1631&255);
 var $1633=($1632|0)==0;
 if($1633){label=107;break;}else{label=111;break;}
 case 107: 
 var $1635=$fom_mask;
 var $1636=($1635|0)!=0;
 if($1636){label=108;break;}else{label=109;break;}
 case 108: 
 var $1638=$fom_mask;
 var $1645=$1638;label=110;break;
 case 109: 
 var $1640=$5;
 var $1641=(($1640+1)|0);
 $5=$1641;
 var $1642=HEAP8[($1640)];
 var $1643=($1642&255);
 var $1645=$1643;label=110;break;
 case 110: 
 var $1645;
 var $1646=(($1645)&255);
 $mask=$1646;
 $mixmask=1;
 label=111;break;
 case 111: 
 var $1648=$mask;
 var $1649=($1648&255);
 var $1650=$mixmask;
 var $1651=($1650&255);
 var $1652=$1649&$1651;
 var $1653=($1652|0)!=0;
 if($1653){label=112;break;}else{label=113;break;}
 case 112: 
 var $1655=(($mix)|0);
 var $1656=HEAP8[($1655)];
 var $1657=$x;
 var $1658=((($1657)*(3))&-1);
 var $1659=$line;
 var $1660=(($1659+$1658)|0);
 HEAP8[($1660)]=$1656;
 var $1661=(($mix+1)|0);
 var $1662=HEAP8[($1661)];
 var $1663=$x;
 var $1664=((($1663)*(3))&-1);
 var $1665=((($1664)+(1))|0);
 var $1666=$line;
 var $1667=(($1666+$1665)|0);
 HEAP8[($1667)]=$1662;
 var $1668=(($mix+2)|0);
 var $1669=HEAP8[($1668)];
 var $1670=$x;
 var $1671=((($1670)*(3))&-1);
 var $1672=((($1671)+(2))|0);
 var $1673=$line;
 var $1674=(($1673+$1672)|0);
 HEAP8[($1674)]=$1669;
 label=114;break;
 case 113: 
 var $1676=$x;
 var $1677=((($1676)*(3))&-1);
 var $1678=$line;
 var $1679=(($1678+$1677)|0);
 HEAP8[($1679)]=0;
 var $1680=$x;
 var $1681=((($1680)*(3))&-1);
 var $1682=((($1681)+(1))|0);
 var $1683=$line;
 var $1684=(($1683+$1682)|0);
 HEAP8[($1684)]=0;
 var $1685=$x;
 var $1686=((($1685)*(3))&-1);
 var $1687=((($1686)+(2))|0);
 var $1688=$line;
 var $1689=(($1688+$1687)|0);
 HEAP8[($1689)]=0;
 label=114;break;
 case 114: 
 var $1691=$count;
 var $1692=((($1691)-(1))|0);
 $count=$1692;
 var $1693=$x;
 var $1694=((($1693)+(1))|0);
 $x=$1694;
 var $1695=$mixmask;
 var $1696=($1695&255);
 var $1697=$1696<<1;
 var $1698=(($1697)&255);
 $mixmask=$1698;
 var $1699=$mixmask;
 var $1700=($1699&255);
 var $1701=($1700|0)==0;
 if($1701){label=115;break;}else{label=119;break;}
 case 115: 
 var $1703=$fom_mask;
 var $1704=($1703|0)!=0;
 if($1704){label=116;break;}else{label=117;break;}
 case 116: 
 var $1706=$fom_mask;
 var $1713=$1706;label=118;break;
 case 117: 
 var $1708=$5;
 var $1709=(($1708+1)|0);
 $5=$1709;
 var $1710=HEAP8[($1708)];
 var $1711=($1710&255);
 var $1713=$1711;label=118;break;
 case 118: 
 var $1713;
 var $1714=(($1713)&255);
 $mask=$1714;
 $mixmask=1;
 label=119;break;
 case 119: 
 var $1716=$mask;
 var $1717=($1716&255);
 var $1718=$mixmask;
 var $1719=($1718&255);
 var $1720=$1717&$1719;
 var $1721=($1720|0)!=0;
 if($1721){label=120;break;}else{label=121;break;}
 case 120: 
 var $1723=(($mix)|0);
 var $1724=HEAP8[($1723)];
 var $1725=$x;
 var $1726=((($1725)*(3))&-1);
 var $1727=$line;
 var $1728=(($1727+$1726)|0);
 HEAP8[($1728)]=$1724;
 var $1729=(($mix+1)|0);
 var $1730=HEAP8[($1729)];
 var $1731=$x;
 var $1732=((($1731)*(3))&-1);
 var $1733=((($1732)+(1))|0);
 var $1734=$line;
 var $1735=(($1734+$1733)|0);
 HEAP8[($1735)]=$1730;
 var $1736=(($mix+2)|0);
 var $1737=HEAP8[($1736)];
 var $1738=$x;
 var $1739=((($1738)*(3))&-1);
 var $1740=((($1739)+(2))|0);
 var $1741=$line;
 var $1742=(($1741+$1740)|0);
 HEAP8[($1742)]=$1737;
 label=122;break;
 case 121: 
 var $1744=$x;
 var $1745=((($1744)*(3))&-1);
 var $1746=$line;
 var $1747=(($1746+$1745)|0);
 HEAP8[($1747)]=0;
 var $1748=$x;
 var $1749=((($1748)*(3))&-1);
 var $1750=((($1749)+(1))|0);
 var $1751=$line;
 var $1752=(($1751+$1750)|0);
 HEAP8[($1752)]=0;
 var $1753=$x;
 var $1754=((($1753)*(3))&-1);
 var $1755=((($1754)+(2))|0);
 var $1756=$line;
 var $1757=(($1756+$1755)|0);
 HEAP8[($1757)]=0;
 label=122;break;
 case 122: 
 var $1759=$count;
 var $1760=((($1759)-(1))|0);
 $count=$1760;
 var $1761=$x;
 var $1762=((($1761)+(1))|0);
 $x=$1762;
 var $1763=$mixmask;
 var $1764=($1763&255);
 var $1765=$1764<<1;
 var $1766=(($1765)&255);
 $mixmask=$1766;
 var $1767=$mixmask;
 var $1768=($1767&255);
 var $1769=($1768|0)==0;
 if($1769){label=123;break;}else{label=127;break;}
 case 123: 
 var $1771=$fom_mask;
 var $1772=($1771|0)!=0;
 if($1772){label=124;break;}else{label=125;break;}
 case 124: 
 var $1774=$fom_mask;
 var $1781=$1774;label=126;break;
 case 125: 
 var $1776=$5;
 var $1777=(($1776+1)|0);
 $5=$1777;
 var $1778=HEAP8[($1776)];
 var $1779=($1778&255);
 var $1781=$1779;label=126;break;
 case 126: 
 var $1781;
 var $1782=(($1781)&255);
 $mask=$1782;
 $mixmask=1;
 label=127;break;
 case 127: 
 var $1784=$mask;
 var $1785=($1784&255);
 var $1786=$mixmask;
 var $1787=($1786&255);
 var $1788=$1785&$1787;
 var $1789=($1788|0)!=0;
 if($1789){label=128;break;}else{label=129;break;}
 case 128: 
 var $1791=(($mix)|0);
 var $1792=HEAP8[($1791)];
 var $1793=$x;
 var $1794=((($1793)*(3))&-1);
 var $1795=$line;
 var $1796=(($1795+$1794)|0);
 HEAP8[($1796)]=$1792;
 var $1797=(($mix+1)|0);
 var $1798=HEAP8[($1797)];
 var $1799=$x;
 var $1800=((($1799)*(3))&-1);
 var $1801=((($1800)+(1))|0);
 var $1802=$line;
 var $1803=(($1802+$1801)|0);
 HEAP8[($1803)]=$1798;
 var $1804=(($mix+2)|0);
 var $1805=HEAP8[($1804)];
 var $1806=$x;
 var $1807=((($1806)*(3))&-1);
 var $1808=((($1807)+(2))|0);
 var $1809=$line;
 var $1810=(($1809+$1808)|0);
 HEAP8[($1810)]=$1805;
 label=130;break;
 case 129: 
 var $1812=$x;
 var $1813=((($1812)*(3))&-1);
 var $1814=$line;
 var $1815=(($1814+$1813)|0);
 HEAP8[($1815)]=0;
 var $1816=$x;
 var $1817=((($1816)*(3))&-1);
 var $1818=((($1817)+(1))|0);
 var $1819=$line;
 var $1820=(($1819+$1818)|0);
 HEAP8[($1820)]=0;
 var $1821=$x;
 var $1822=((($1821)*(3))&-1);
 var $1823=((($1822)+(2))|0);
 var $1824=$line;
 var $1825=(($1824+$1823)|0);
 HEAP8[($1825)]=0;
 label=130;break;
 case 130: 
 var $1827=$count;
 var $1828=((($1827)-(1))|0);
 $count=$1828;
 var $1829=$x;
 var $1830=((($1829)+(1))|0);
 $x=$1830;
 var $1831=$mixmask;
 var $1832=($1831&255);
 var $1833=$1832<<1;
 var $1834=(($1833)&255);
 $mixmask=$1834;
 var $1835=$mixmask;
 var $1836=($1835&255);
 var $1837=($1836|0)==0;
 if($1837){label=131;break;}else{label=135;break;}
 case 131: 
 var $1839=$fom_mask;
 var $1840=($1839|0)!=0;
 if($1840){label=132;break;}else{label=133;break;}
 case 132: 
 var $1842=$fom_mask;
 var $1849=$1842;label=134;break;
 case 133: 
 var $1844=$5;
 var $1845=(($1844+1)|0);
 $5=$1845;
 var $1846=HEAP8[($1844)];
 var $1847=($1846&255);
 var $1849=$1847;label=134;break;
 case 134: 
 var $1849;
 var $1850=(($1849)&255);
 $mask=$1850;
 $mixmask=1;
 label=135;break;
 case 135: 
 var $1852=$mask;
 var $1853=($1852&255);
 var $1854=$mixmask;
 var $1855=($1854&255);
 var $1856=$1853&$1855;
 var $1857=($1856|0)!=0;
 if($1857){label=136;break;}else{label=137;break;}
 case 136: 
 var $1859=(($mix)|0);
 var $1860=HEAP8[($1859)];
 var $1861=$x;
 var $1862=((($1861)*(3))&-1);
 var $1863=$line;
 var $1864=(($1863+$1862)|0);
 HEAP8[($1864)]=$1860;
 var $1865=(($mix+1)|0);
 var $1866=HEAP8[($1865)];
 var $1867=$x;
 var $1868=((($1867)*(3))&-1);
 var $1869=((($1868)+(1))|0);
 var $1870=$line;
 var $1871=(($1870+$1869)|0);
 HEAP8[($1871)]=$1866;
 var $1872=(($mix+2)|0);
 var $1873=HEAP8[($1872)];
 var $1874=$x;
 var $1875=((($1874)*(3))&-1);
 var $1876=((($1875)+(2))|0);
 var $1877=$line;
 var $1878=(($1877+$1876)|0);
 HEAP8[($1878)]=$1873;
 label=138;break;
 case 137: 
 var $1880=$x;
 var $1881=((($1880)*(3))&-1);
 var $1882=$line;
 var $1883=(($1882+$1881)|0);
 HEAP8[($1883)]=0;
 var $1884=$x;
 var $1885=((($1884)*(3))&-1);
 var $1886=((($1885)+(1))|0);
 var $1887=$line;
 var $1888=(($1887+$1886)|0);
 HEAP8[($1888)]=0;
 var $1889=$x;
 var $1890=((($1889)*(3))&-1);
 var $1891=((($1890)+(2))|0);
 var $1892=$line;
 var $1893=(($1892+$1891)|0);
 HEAP8[($1893)]=0;
 label=138;break;
 case 138: 
 var $1895=$count;
 var $1896=((($1895)-(1))|0);
 $count=$1896;
 var $1897=$x;
 var $1898=((($1897)+(1))|0);
 $x=$1898;
 var $1899=$mixmask;
 var $1900=($1899&255);
 var $1901=$1900<<1;
 var $1902=(($1901)&255);
 $mixmask=$1902;
 var $1903=$mixmask;
 var $1904=($1903&255);
 var $1905=($1904|0)==0;
 if($1905){label=139;break;}else{label=143;break;}
 case 139: 
 var $1907=$fom_mask;
 var $1908=($1907|0)!=0;
 if($1908){label=140;break;}else{label=141;break;}
 case 140: 
 var $1910=$fom_mask;
 var $1917=$1910;label=142;break;
 case 141: 
 var $1912=$5;
 var $1913=(($1912+1)|0);
 $5=$1913;
 var $1914=HEAP8[($1912)];
 var $1915=($1914&255);
 var $1917=$1915;label=142;break;
 case 142: 
 var $1917;
 var $1918=(($1917)&255);
 $mask=$1918;
 $mixmask=1;
 label=143;break;
 case 143: 
 var $1920=$mask;
 var $1921=($1920&255);
 var $1922=$mixmask;
 var $1923=($1922&255);
 var $1924=$1921&$1923;
 var $1925=($1924|0)!=0;
 if($1925){label=144;break;}else{label=145;break;}
 case 144: 
 var $1927=(($mix)|0);
 var $1928=HEAP8[($1927)];
 var $1929=$x;
 var $1930=((($1929)*(3))&-1);
 var $1931=$line;
 var $1932=(($1931+$1930)|0);
 HEAP8[($1932)]=$1928;
 var $1933=(($mix+1)|0);
 var $1934=HEAP8[($1933)];
 var $1935=$x;
 var $1936=((($1935)*(3))&-1);
 var $1937=((($1936)+(1))|0);
 var $1938=$line;
 var $1939=(($1938+$1937)|0);
 HEAP8[($1939)]=$1934;
 var $1940=(($mix+2)|0);
 var $1941=HEAP8[($1940)];
 var $1942=$x;
 var $1943=((($1942)*(3))&-1);
 var $1944=((($1943)+(2))|0);
 var $1945=$line;
 var $1946=(($1945+$1944)|0);
 HEAP8[($1946)]=$1941;
 label=146;break;
 case 145: 
 var $1948=$x;
 var $1949=((($1948)*(3))&-1);
 var $1950=$line;
 var $1951=(($1950+$1949)|0);
 HEAP8[($1951)]=0;
 var $1952=$x;
 var $1953=((($1952)*(3))&-1);
 var $1954=((($1953)+(1))|0);
 var $1955=$line;
 var $1956=(($1955+$1954)|0);
 HEAP8[($1956)]=0;
 var $1957=$x;
 var $1958=((($1957)*(3))&-1);
 var $1959=((($1958)+(2))|0);
 var $1960=$line;
 var $1961=(($1960+$1959)|0);
 HEAP8[($1961)]=0;
 label=146;break;
 case 146: 
 var $1963=$count;
 var $1964=((($1963)-(1))|0);
 $count=$1964;
 var $1965=$x;
 var $1966=((($1965)+(1))|0);
 $x=$1966;
 var $1967=$mixmask;
 var $1968=($1967&255);
 var $1969=$1968<<1;
 var $1970=(($1969)&255);
 $mixmask=$1970;
 var $1971=$mixmask;
 var $1972=($1971&255);
 var $1973=($1972|0)==0;
 if($1973){label=147;break;}else{label=151;break;}
 case 147: 
 var $1975=$fom_mask;
 var $1976=($1975|0)!=0;
 if($1976){label=148;break;}else{label=149;break;}
 case 148: 
 var $1978=$fom_mask;
 var $1985=$1978;label=150;break;
 case 149: 
 var $1980=$5;
 var $1981=(($1980+1)|0);
 $5=$1981;
 var $1982=HEAP8[($1980)];
 var $1983=($1982&255);
 var $1985=$1983;label=150;break;
 case 150: 
 var $1985;
 var $1986=(($1985)&255);
 $mask=$1986;
 $mixmask=1;
 label=151;break;
 case 151: 
 var $1988=$mask;
 var $1989=($1988&255);
 var $1990=$mixmask;
 var $1991=($1990&255);
 var $1992=$1989&$1991;
 var $1993=($1992|0)!=0;
 if($1993){label=152;break;}else{label=153;break;}
 case 152: 
 var $1995=(($mix)|0);
 var $1996=HEAP8[($1995)];
 var $1997=$x;
 var $1998=((($1997)*(3))&-1);
 var $1999=$line;
 var $2000=(($1999+$1998)|0);
 HEAP8[($2000)]=$1996;
 var $2001=(($mix+1)|0);
 var $2002=HEAP8[($2001)];
 var $2003=$x;
 var $2004=((($2003)*(3))&-1);
 var $2005=((($2004)+(1))|0);
 var $2006=$line;
 var $2007=(($2006+$2005)|0);
 HEAP8[($2007)]=$2002;
 var $2008=(($mix+2)|0);
 var $2009=HEAP8[($2008)];
 var $2010=$x;
 var $2011=((($2010)*(3))&-1);
 var $2012=((($2011)+(2))|0);
 var $2013=$line;
 var $2014=(($2013+$2012)|0);
 HEAP8[($2014)]=$2009;
 label=154;break;
 case 153: 
 var $2016=$x;
 var $2017=((($2016)*(3))&-1);
 var $2018=$line;
 var $2019=(($2018+$2017)|0);
 HEAP8[($2019)]=0;
 var $2020=$x;
 var $2021=((($2020)*(3))&-1);
 var $2022=((($2021)+(1))|0);
 var $2023=$line;
 var $2024=(($2023+$2022)|0);
 HEAP8[($2024)]=0;
 var $2025=$x;
 var $2026=((($2025)*(3))&-1);
 var $2027=((($2026)+(2))|0);
 var $2028=$line;
 var $2029=(($2028+$2027)|0);
 HEAP8[($2029)]=0;
 label=154;break;
 case 154: 
 var $2031=$count;
 var $2032=((($2031)-(1))|0);
 $count=$2032;
 var $2033=$x;
 var $2034=((($2033)+(1))|0);
 $x=$2034;
 var $2035=$mixmask;
 var $2036=($2035&255);
 var $2037=$2036<<1;
 var $2038=(($2037)&255);
 $mixmask=$2038;
 var $2039=$mixmask;
 var $2040=($2039&255);
 var $2041=($2040|0)==0;
 if($2041){label=155;break;}else{label=159;break;}
 case 155: 
 var $2043=$fom_mask;
 var $2044=($2043|0)!=0;
 if($2044){label=156;break;}else{label=157;break;}
 case 156: 
 var $2046=$fom_mask;
 var $2053=$2046;label=158;break;
 case 157: 
 var $2048=$5;
 var $2049=(($2048+1)|0);
 $5=$2049;
 var $2050=HEAP8[($2048)];
 var $2051=($2050&255);
 var $2053=$2051;label=158;break;
 case 158: 
 var $2053;
 var $2054=(($2053)&255);
 $mask=$2054;
 $mixmask=1;
 label=159;break;
 case 159: 
 var $2056=$mask;
 var $2057=($2056&255);
 var $2058=$mixmask;
 var $2059=($2058&255);
 var $2060=$2057&$2059;
 var $2061=($2060|0)!=0;
 if($2061){label=160;break;}else{label=161;break;}
 case 160: 
 var $2063=(($mix)|0);
 var $2064=HEAP8[($2063)];
 var $2065=$x;
 var $2066=((($2065)*(3))&-1);
 var $2067=$line;
 var $2068=(($2067+$2066)|0);
 HEAP8[($2068)]=$2064;
 var $2069=(($mix+1)|0);
 var $2070=HEAP8[($2069)];
 var $2071=$x;
 var $2072=((($2071)*(3))&-1);
 var $2073=((($2072)+(1))|0);
 var $2074=$line;
 var $2075=(($2074+$2073)|0);
 HEAP8[($2075)]=$2070;
 var $2076=(($mix+2)|0);
 var $2077=HEAP8[($2076)];
 var $2078=$x;
 var $2079=((($2078)*(3))&-1);
 var $2080=((($2079)+(2))|0);
 var $2081=$line;
 var $2082=(($2081+$2080)|0);
 HEAP8[($2082)]=$2077;
 label=162;break;
 case 161: 
 var $2084=$x;
 var $2085=((($2084)*(3))&-1);
 var $2086=$line;
 var $2087=(($2086+$2085)|0);
 HEAP8[($2087)]=0;
 var $2088=$x;
 var $2089=((($2088)*(3))&-1);
 var $2090=((($2089)+(1))|0);
 var $2091=$line;
 var $2092=(($2091+$2090)|0);
 HEAP8[($2092)]=0;
 var $2093=$x;
 var $2094=((($2093)*(3))&-1);
 var $2095=((($2094)+(2))|0);
 var $2096=$line;
 var $2097=(($2096+$2095)|0);
 HEAP8[($2097)]=0;
 label=162;break;
 case 162: 
 var $2099=$count;
 var $2100=((($2099)-(1))|0);
 $count=$2100;
 var $2101=$x;
 var $2102=((($2101)+(1))|0);
 $x=$2102;
 label=95;break;
 case 163: 
 label=164;break;
 case 164: 
 var $2105=$count;
 var $2106=($2105|0)>0;
 if($2106){label=165;break;}else{var $2112=0;label=166;break;}
 case 165: 
 var $2108=$x;
 var $2109=$3;
 var $2110=($2108|0)<($2109|0);
 var $2112=$2110;label=166;break;
 case 166: 
 var $2112;
 if($2112){label=167;break;}else{label=176;break;}
 case 167: 
 var $2114=$mixmask;
 var $2115=($2114&255);
 var $2116=$2115<<1;
 var $2117=(($2116)&255);
 $mixmask=$2117;
 var $2118=$mixmask;
 var $2119=($2118&255);
 var $2120=($2119|0)==0;
 if($2120){label=168;break;}else{label=172;break;}
 case 168: 
 var $2122=$fom_mask;
 var $2123=($2122|0)!=0;
 if($2123){label=169;break;}else{label=170;break;}
 case 169: 
 var $2125=$fom_mask;
 var $2132=$2125;label=171;break;
 case 170: 
 var $2127=$5;
 var $2128=(($2127+1)|0);
 $5=$2128;
 var $2129=HEAP8[($2127)];
 var $2130=($2129&255);
 var $2132=$2130;label=171;break;
 case 171: 
 var $2132;
 var $2133=(($2132)&255);
 $mask=$2133;
 $mixmask=1;
 label=172;break;
 case 172: 
 var $2135=$mask;
 var $2136=($2135&255);
 var $2137=$mixmask;
 var $2138=($2137&255);
 var $2139=$2136&$2138;
 var $2140=($2139|0)!=0;
 if($2140){label=173;break;}else{label=174;break;}
 case 173: 
 var $2142=(($mix)|0);
 var $2143=HEAP8[($2142)];
 var $2144=$x;
 var $2145=((($2144)*(3))&-1);
 var $2146=$line;
 var $2147=(($2146+$2145)|0);
 HEAP8[($2147)]=$2143;
 var $2148=(($mix+1)|0);
 var $2149=HEAP8[($2148)];
 var $2150=$x;
 var $2151=((($2150)*(3))&-1);
 var $2152=((($2151)+(1))|0);
 var $2153=$line;
 var $2154=(($2153+$2152)|0);
 HEAP8[($2154)]=$2149;
 var $2155=(($mix+2)|0);
 var $2156=HEAP8[($2155)];
 var $2157=$x;
 var $2158=((($2157)*(3))&-1);
 var $2159=((($2158)+(2))|0);
 var $2160=$line;
 var $2161=(($2160+$2159)|0);
 HEAP8[($2161)]=$2156;
 label=175;break;
 case 174: 
 var $2163=$x;
 var $2164=((($2163)*(3))&-1);
 var $2165=$line;
 var $2166=(($2165+$2164)|0);
 HEAP8[($2166)]=0;
 var $2167=$x;
 var $2168=((($2167)*(3))&-1);
 var $2169=((($2168)+(1))|0);
 var $2170=$line;
 var $2171=(($2170+$2169)|0);
 HEAP8[($2171)]=0;
 var $2172=$x;
 var $2173=((($2172)*(3))&-1);
 var $2174=((($2173)+(2))|0);
 var $2175=$line;
 var $2176=(($2175+$2174)|0);
 HEAP8[($2176)]=0;
 label=175;break;
 case 175: 
 var $2178=$count;
 var $2179=((($2178)-(1))|0);
 $count=$2179;
 var $2180=$x;
 var $2181=((($2180)+(1))|0);
 $x=$2181;
 label=164;break;
 case 176: 
 label=260;break;
 case 177: 
 label=178;break;
 case 178: 
 var $2185=$count;
 var $2186=$2185&-8;
 var $2187=($2186|0)!=0;
 if($2187){label=179;break;}else{var $2194=0;label=180;break;}
 case 179: 
 var $2189=$x;
 var $2190=((($2189)+(8))|0);
 var $2191=$3;
 var $2192=($2190|0)<($2191|0);
 var $2194=$2192;label=180;break;
 case 180: 
 var $2194;
 if($2194){label=181;break;}else{label=246;break;}
 case 181: 
 var $2196=$mixmask;
 var $2197=($2196&255);
 var $2198=$2197<<1;
 var $2199=(($2198)&255);
 $mixmask=$2199;
 var $2200=$mixmask;
 var $2201=($2200&255);
 var $2202=($2201|0)==0;
 if($2202){label=182;break;}else{label=186;break;}
 case 182: 
 var $2204=$fom_mask;
 var $2205=($2204|0)!=0;
 if($2205){label=183;break;}else{label=184;break;}
 case 183: 
 var $2207=$fom_mask;
 var $2214=$2207;label=185;break;
 case 184: 
 var $2209=$5;
 var $2210=(($2209+1)|0);
 $5=$2210;
 var $2211=HEAP8[($2209)];
 var $2212=($2211&255);
 var $2214=$2212;label=185;break;
 case 185: 
 var $2214;
 var $2215=(($2214)&255);
 $mask=$2215;
 $mixmask=1;
 label=186;break;
 case 186: 
 var $2217=$mask;
 var $2218=($2217&255);
 var $2219=$mixmask;
 var $2220=($2219&255);
 var $2221=$2218&$2220;
 var $2222=($2221|0)!=0;
 if($2222){label=187;break;}else{label=188;break;}
 case 187: 
 var $2224=$x;
 var $2225=((($2224)*(3))&-1);
 var $2226=$prevline;
 var $2227=(($2226+$2225)|0);
 var $2228=HEAP8[($2227)];
 var $2229=($2228&255);
 var $2230=(($mix)|0);
 var $2231=HEAP8[($2230)];
 var $2232=($2231&255);
 var $2233=$2229^$2232;
 var $2234=(($2233)&255);
 var $2235=$x;
 var $2236=((($2235)*(3))&-1);
 var $2237=$line;
 var $2238=(($2237+$2236)|0);
 HEAP8[($2238)]=$2234;
 var $2239=$x;
 var $2240=((($2239)*(3))&-1);
 var $2241=((($2240)+(1))|0);
 var $2242=$prevline;
 var $2243=(($2242+$2241)|0);
 var $2244=HEAP8[($2243)];
 var $2245=($2244&255);
 var $2246=(($mix+1)|0);
 var $2247=HEAP8[($2246)];
 var $2248=($2247&255);
 var $2249=$2245^$2248;
 var $2250=(($2249)&255);
 var $2251=$x;
 var $2252=((($2251)*(3))&-1);
 var $2253=((($2252)+(1))|0);
 var $2254=$line;
 var $2255=(($2254+$2253)|0);
 HEAP8[($2255)]=$2250;
 var $2256=$x;
 var $2257=((($2256)*(3))&-1);
 var $2258=((($2257)+(2))|0);
 var $2259=$prevline;
 var $2260=(($2259+$2258)|0);
 var $2261=HEAP8[($2260)];
 var $2262=($2261&255);
 var $2263=(($mix+2)|0);
 var $2264=HEAP8[($2263)];
 var $2265=($2264&255);
 var $2266=$2262^$2265;
 var $2267=(($2266)&255);
 var $2268=$x;
 var $2269=((($2268)*(3))&-1);
 var $2270=((($2269)+(2))|0);
 var $2271=$line;
 var $2272=(($2271+$2270)|0);
 HEAP8[($2272)]=$2267;
 label=189;break;
 case 188: 
 var $2274=$x;
 var $2275=((($2274)*(3))&-1);
 var $2276=$prevline;
 var $2277=(($2276+$2275)|0);
 var $2278=HEAP8[($2277)];
 var $2279=$x;
 var $2280=((($2279)*(3))&-1);
 var $2281=$line;
 var $2282=(($2281+$2280)|0);
 HEAP8[($2282)]=$2278;
 var $2283=$x;
 var $2284=((($2283)*(3))&-1);
 var $2285=((($2284)+(1))|0);
 var $2286=$prevline;
 var $2287=(($2286+$2285)|0);
 var $2288=HEAP8[($2287)];
 var $2289=$x;
 var $2290=((($2289)*(3))&-1);
 var $2291=((($2290)+(1))|0);
 var $2292=$line;
 var $2293=(($2292+$2291)|0);
 HEAP8[($2293)]=$2288;
 var $2294=$x;
 var $2295=((($2294)*(3))&-1);
 var $2296=((($2295)+(2))|0);
 var $2297=$prevline;
 var $2298=(($2297+$2296)|0);
 var $2299=HEAP8[($2298)];
 var $2300=$x;
 var $2301=((($2300)*(3))&-1);
 var $2302=((($2301)+(2))|0);
 var $2303=$line;
 var $2304=(($2303+$2302)|0);
 HEAP8[($2304)]=$2299;
 label=189;break;
 case 189: 
 var $2306=$count;
 var $2307=((($2306)-(1))|0);
 $count=$2307;
 var $2308=$x;
 var $2309=((($2308)+(1))|0);
 $x=$2309;
 var $2310=$mixmask;
 var $2311=($2310&255);
 var $2312=$2311<<1;
 var $2313=(($2312)&255);
 $mixmask=$2313;
 var $2314=$mixmask;
 var $2315=($2314&255);
 var $2316=($2315|0)==0;
 if($2316){label=190;break;}else{label=194;break;}
 case 190: 
 var $2318=$fom_mask;
 var $2319=($2318|0)!=0;
 if($2319){label=191;break;}else{label=192;break;}
 case 191: 
 var $2321=$fom_mask;
 var $2328=$2321;label=193;break;
 case 192: 
 var $2323=$5;
 var $2324=(($2323+1)|0);
 $5=$2324;
 var $2325=HEAP8[($2323)];
 var $2326=($2325&255);
 var $2328=$2326;label=193;break;
 case 193: 
 var $2328;
 var $2329=(($2328)&255);
 $mask=$2329;
 $mixmask=1;
 label=194;break;
 case 194: 
 var $2331=$mask;
 var $2332=($2331&255);
 var $2333=$mixmask;
 var $2334=($2333&255);
 var $2335=$2332&$2334;
 var $2336=($2335|0)!=0;
 if($2336){label=195;break;}else{label=196;break;}
 case 195: 
 var $2338=$x;
 var $2339=((($2338)*(3))&-1);
 var $2340=$prevline;
 var $2341=(($2340+$2339)|0);
 var $2342=HEAP8[($2341)];
 var $2343=($2342&255);
 var $2344=(($mix)|0);
 var $2345=HEAP8[($2344)];
 var $2346=($2345&255);
 var $2347=$2343^$2346;
 var $2348=(($2347)&255);
 var $2349=$x;
 var $2350=((($2349)*(3))&-1);
 var $2351=$line;
 var $2352=(($2351+$2350)|0);
 HEAP8[($2352)]=$2348;
 var $2353=$x;
 var $2354=((($2353)*(3))&-1);
 var $2355=((($2354)+(1))|0);
 var $2356=$prevline;
 var $2357=(($2356+$2355)|0);
 var $2358=HEAP8[($2357)];
 var $2359=($2358&255);
 var $2360=(($mix+1)|0);
 var $2361=HEAP8[($2360)];
 var $2362=($2361&255);
 var $2363=$2359^$2362;
 var $2364=(($2363)&255);
 var $2365=$x;
 var $2366=((($2365)*(3))&-1);
 var $2367=((($2366)+(1))|0);
 var $2368=$line;
 var $2369=(($2368+$2367)|0);
 HEAP8[($2369)]=$2364;
 var $2370=$x;
 var $2371=((($2370)*(3))&-1);
 var $2372=((($2371)+(2))|0);
 var $2373=$prevline;
 var $2374=(($2373+$2372)|0);
 var $2375=HEAP8[($2374)];
 var $2376=($2375&255);
 var $2377=(($mix+2)|0);
 var $2378=HEAP8[($2377)];
 var $2379=($2378&255);
 var $2380=$2376^$2379;
 var $2381=(($2380)&255);
 var $2382=$x;
 var $2383=((($2382)*(3))&-1);
 var $2384=((($2383)+(2))|0);
 var $2385=$line;
 var $2386=(($2385+$2384)|0);
 HEAP8[($2386)]=$2381;
 label=197;break;
 case 196: 
 var $2388=$x;
 var $2389=((($2388)*(3))&-1);
 var $2390=$prevline;
 var $2391=(($2390+$2389)|0);
 var $2392=HEAP8[($2391)];
 var $2393=$x;
 var $2394=((($2393)*(3))&-1);
 var $2395=$line;
 var $2396=(($2395+$2394)|0);
 HEAP8[($2396)]=$2392;
 var $2397=$x;
 var $2398=((($2397)*(3))&-1);
 var $2399=((($2398)+(1))|0);
 var $2400=$prevline;
 var $2401=(($2400+$2399)|0);
 var $2402=HEAP8[($2401)];
 var $2403=$x;
 var $2404=((($2403)*(3))&-1);
 var $2405=((($2404)+(1))|0);
 var $2406=$line;
 var $2407=(($2406+$2405)|0);
 HEAP8[($2407)]=$2402;
 var $2408=$x;
 var $2409=((($2408)*(3))&-1);
 var $2410=((($2409)+(2))|0);
 var $2411=$prevline;
 var $2412=(($2411+$2410)|0);
 var $2413=HEAP8[($2412)];
 var $2414=$x;
 var $2415=((($2414)*(3))&-1);
 var $2416=((($2415)+(2))|0);
 var $2417=$line;
 var $2418=(($2417+$2416)|0);
 HEAP8[($2418)]=$2413;
 label=197;break;
 case 197: 
 var $2420=$count;
 var $2421=((($2420)-(1))|0);
 $count=$2421;
 var $2422=$x;
 var $2423=((($2422)+(1))|0);
 $x=$2423;
 var $2424=$mixmask;
 var $2425=($2424&255);
 var $2426=$2425<<1;
 var $2427=(($2426)&255);
 $mixmask=$2427;
 var $2428=$mixmask;
 var $2429=($2428&255);
 var $2430=($2429|0)==0;
 if($2430){label=198;break;}else{label=202;break;}
 case 198: 
 var $2432=$fom_mask;
 var $2433=($2432|0)!=0;
 if($2433){label=199;break;}else{label=200;break;}
 case 199: 
 var $2435=$fom_mask;
 var $2442=$2435;label=201;break;
 case 200: 
 var $2437=$5;
 var $2438=(($2437+1)|0);
 $5=$2438;
 var $2439=HEAP8[($2437)];
 var $2440=($2439&255);
 var $2442=$2440;label=201;break;
 case 201: 
 var $2442;
 var $2443=(($2442)&255);
 $mask=$2443;
 $mixmask=1;
 label=202;break;
 case 202: 
 var $2445=$mask;
 var $2446=($2445&255);
 var $2447=$mixmask;
 var $2448=($2447&255);
 var $2449=$2446&$2448;
 var $2450=($2449|0)!=0;
 if($2450){label=203;break;}else{label=204;break;}
 case 203: 
 var $2452=$x;
 var $2453=((($2452)*(3))&-1);
 var $2454=$prevline;
 var $2455=(($2454+$2453)|0);
 var $2456=HEAP8[($2455)];
 var $2457=($2456&255);
 var $2458=(($mix)|0);
 var $2459=HEAP8[($2458)];
 var $2460=($2459&255);
 var $2461=$2457^$2460;
 var $2462=(($2461)&255);
 var $2463=$x;
 var $2464=((($2463)*(3))&-1);
 var $2465=$line;
 var $2466=(($2465+$2464)|0);
 HEAP8[($2466)]=$2462;
 var $2467=$x;
 var $2468=((($2467)*(3))&-1);
 var $2469=((($2468)+(1))|0);
 var $2470=$prevline;
 var $2471=(($2470+$2469)|0);
 var $2472=HEAP8[($2471)];
 var $2473=($2472&255);
 var $2474=(($mix+1)|0);
 var $2475=HEAP8[($2474)];
 var $2476=($2475&255);
 var $2477=$2473^$2476;
 var $2478=(($2477)&255);
 var $2479=$x;
 var $2480=((($2479)*(3))&-1);
 var $2481=((($2480)+(1))|0);
 var $2482=$line;
 var $2483=(($2482+$2481)|0);
 HEAP8[($2483)]=$2478;
 var $2484=$x;
 var $2485=((($2484)*(3))&-1);
 var $2486=((($2485)+(2))|0);
 var $2487=$prevline;
 var $2488=(($2487+$2486)|0);
 var $2489=HEAP8[($2488)];
 var $2490=($2489&255);
 var $2491=(($mix+2)|0);
 var $2492=HEAP8[($2491)];
 var $2493=($2492&255);
 var $2494=$2490^$2493;
 var $2495=(($2494)&255);
 var $2496=$x;
 var $2497=((($2496)*(3))&-1);
 var $2498=((($2497)+(2))|0);
 var $2499=$line;
 var $2500=(($2499+$2498)|0);
 HEAP8[($2500)]=$2495;
 label=205;break;
 case 204: 
 var $2502=$x;
 var $2503=((($2502)*(3))&-1);
 var $2504=$prevline;
 var $2505=(($2504+$2503)|0);
 var $2506=HEAP8[($2505)];
 var $2507=$x;
 var $2508=((($2507)*(3))&-1);
 var $2509=$line;
 var $2510=(($2509+$2508)|0);
 HEAP8[($2510)]=$2506;
 var $2511=$x;
 var $2512=((($2511)*(3))&-1);
 var $2513=((($2512)+(1))|0);
 var $2514=$prevline;
 var $2515=(($2514+$2513)|0);
 var $2516=HEAP8[($2515)];
 var $2517=$x;
 var $2518=((($2517)*(3))&-1);
 var $2519=((($2518)+(1))|0);
 var $2520=$line;
 var $2521=(($2520+$2519)|0);
 HEAP8[($2521)]=$2516;
 var $2522=$x;
 var $2523=((($2522)*(3))&-1);
 var $2524=((($2523)+(2))|0);
 var $2525=$prevline;
 var $2526=(($2525+$2524)|0);
 var $2527=HEAP8[($2526)];
 var $2528=$x;
 var $2529=((($2528)*(3))&-1);
 var $2530=((($2529)+(2))|0);
 var $2531=$line;
 var $2532=(($2531+$2530)|0);
 HEAP8[($2532)]=$2527;
 label=205;break;
 case 205: 
 var $2534=$count;
 var $2535=((($2534)-(1))|0);
 $count=$2535;
 var $2536=$x;
 var $2537=((($2536)+(1))|0);
 $x=$2537;
 var $2538=$mixmask;
 var $2539=($2538&255);
 var $2540=$2539<<1;
 var $2541=(($2540)&255);
 $mixmask=$2541;
 var $2542=$mixmask;
 var $2543=($2542&255);
 var $2544=($2543|0)==0;
 if($2544){label=206;break;}else{label=210;break;}
 case 206: 
 var $2546=$fom_mask;
 var $2547=($2546|0)!=0;
 if($2547){label=207;break;}else{label=208;break;}
 case 207: 
 var $2549=$fom_mask;
 var $2556=$2549;label=209;break;
 case 208: 
 var $2551=$5;
 var $2552=(($2551+1)|0);
 $5=$2552;
 var $2553=HEAP8[($2551)];
 var $2554=($2553&255);
 var $2556=$2554;label=209;break;
 case 209: 
 var $2556;
 var $2557=(($2556)&255);
 $mask=$2557;
 $mixmask=1;
 label=210;break;
 case 210: 
 var $2559=$mask;
 var $2560=($2559&255);
 var $2561=$mixmask;
 var $2562=($2561&255);
 var $2563=$2560&$2562;
 var $2564=($2563|0)!=0;
 if($2564){label=211;break;}else{label=212;break;}
 case 211: 
 var $2566=$x;
 var $2567=((($2566)*(3))&-1);
 var $2568=$prevline;
 var $2569=(($2568+$2567)|0);
 var $2570=HEAP8[($2569)];
 var $2571=($2570&255);
 var $2572=(($mix)|0);
 var $2573=HEAP8[($2572)];
 var $2574=($2573&255);
 var $2575=$2571^$2574;
 var $2576=(($2575)&255);
 var $2577=$x;
 var $2578=((($2577)*(3))&-1);
 var $2579=$line;
 var $2580=(($2579+$2578)|0);
 HEAP8[($2580)]=$2576;
 var $2581=$x;
 var $2582=((($2581)*(3))&-1);
 var $2583=((($2582)+(1))|0);
 var $2584=$prevline;
 var $2585=(($2584+$2583)|0);
 var $2586=HEAP8[($2585)];
 var $2587=($2586&255);
 var $2588=(($mix+1)|0);
 var $2589=HEAP8[($2588)];
 var $2590=($2589&255);
 var $2591=$2587^$2590;
 var $2592=(($2591)&255);
 var $2593=$x;
 var $2594=((($2593)*(3))&-1);
 var $2595=((($2594)+(1))|0);
 var $2596=$line;
 var $2597=(($2596+$2595)|0);
 HEAP8[($2597)]=$2592;
 var $2598=$x;
 var $2599=((($2598)*(3))&-1);
 var $2600=((($2599)+(2))|0);
 var $2601=$prevline;
 var $2602=(($2601+$2600)|0);
 var $2603=HEAP8[($2602)];
 var $2604=($2603&255);
 var $2605=(($mix+2)|0);
 var $2606=HEAP8[($2605)];
 var $2607=($2606&255);
 var $2608=$2604^$2607;
 var $2609=(($2608)&255);
 var $2610=$x;
 var $2611=((($2610)*(3))&-1);
 var $2612=((($2611)+(2))|0);
 var $2613=$line;
 var $2614=(($2613+$2612)|0);
 HEAP8[($2614)]=$2609;
 label=213;break;
 case 212: 
 var $2616=$x;
 var $2617=((($2616)*(3))&-1);
 var $2618=$prevline;
 var $2619=(($2618+$2617)|0);
 var $2620=HEAP8[($2619)];
 var $2621=$x;
 var $2622=((($2621)*(3))&-1);
 var $2623=$line;
 var $2624=(($2623+$2622)|0);
 HEAP8[($2624)]=$2620;
 var $2625=$x;
 var $2626=((($2625)*(3))&-1);
 var $2627=((($2626)+(1))|0);
 var $2628=$prevline;
 var $2629=(($2628+$2627)|0);
 var $2630=HEAP8[($2629)];
 var $2631=$x;
 var $2632=((($2631)*(3))&-1);
 var $2633=((($2632)+(1))|0);
 var $2634=$line;
 var $2635=(($2634+$2633)|0);
 HEAP8[($2635)]=$2630;
 var $2636=$x;
 var $2637=((($2636)*(3))&-1);
 var $2638=((($2637)+(2))|0);
 var $2639=$prevline;
 var $2640=(($2639+$2638)|0);
 var $2641=HEAP8[($2640)];
 var $2642=$x;
 var $2643=((($2642)*(3))&-1);
 var $2644=((($2643)+(2))|0);
 var $2645=$line;
 var $2646=(($2645+$2644)|0);
 HEAP8[($2646)]=$2641;
 label=213;break;
 case 213: 
 var $2648=$count;
 var $2649=((($2648)-(1))|0);
 $count=$2649;
 var $2650=$x;
 var $2651=((($2650)+(1))|0);
 $x=$2651;
 var $2652=$mixmask;
 var $2653=($2652&255);
 var $2654=$2653<<1;
 var $2655=(($2654)&255);
 $mixmask=$2655;
 var $2656=$mixmask;
 var $2657=($2656&255);
 var $2658=($2657|0)==0;
 if($2658){label=214;break;}else{label=218;break;}
 case 214: 
 var $2660=$fom_mask;
 var $2661=($2660|0)!=0;
 if($2661){label=215;break;}else{label=216;break;}
 case 215: 
 var $2663=$fom_mask;
 var $2670=$2663;label=217;break;
 case 216: 
 var $2665=$5;
 var $2666=(($2665+1)|0);
 $5=$2666;
 var $2667=HEAP8[($2665)];
 var $2668=($2667&255);
 var $2670=$2668;label=217;break;
 case 217: 
 var $2670;
 var $2671=(($2670)&255);
 $mask=$2671;
 $mixmask=1;
 label=218;break;
 case 218: 
 var $2673=$mask;
 var $2674=($2673&255);
 var $2675=$mixmask;
 var $2676=($2675&255);
 var $2677=$2674&$2676;
 var $2678=($2677|0)!=0;
 if($2678){label=219;break;}else{label=220;break;}
 case 219: 
 var $2680=$x;
 var $2681=((($2680)*(3))&-1);
 var $2682=$prevline;
 var $2683=(($2682+$2681)|0);
 var $2684=HEAP8[($2683)];
 var $2685=($2684&255);
 var $2686=(($mix)|0);
 var $2687=HEAP8[($2686)];
 var $2688=($2687&255);
 var $2689=$2685^$2688;
 var $2690=(($2689)&255);
 var $2691=$x;
 var $2692=((($2691)*(3))&-1);
 var $2693=$line;
 var $2694=(($2693+$2692)|0);
 HEAP8[($2694)]=$2690;
 var $2695=$x;
 var $2696=((($2695)*(3))&-1);
 var $2697=((($2696)+(1))|0);
 var $2698=$prevline;
 var $2699=(($2698+$2697)|0);
 var $2700=HEAP8[($2699)];
 var $2701=($2700&255);
 var $2702=(($mix+1)|0);
 var $2703=HEAP8[($2702)];
 var $2704=($2703&255);
 var $2705=$2701^$2704;
 var $2706=(($2705)&255);
 var $2707=$x;
 var $2708=((($2707)*(3))&-1);
 var $2709=((($2708)+(1))|0);
 var $2710=$line;
 var $2711=(($2710+$2709)|0);
 HEAP8[($2711)]=$2706;
 var $2712=$x;
 var $2713=((($2712)*(3))&-1);
 var $2714=((($2713)+(2))|0);
 var $2715=$prevline;
 var $2716=(($2715+$2714)|0);
 var $2717=HEAP8[($2716)];
 var $2718=($2717&255);
 var $2719=(($mix+2)|0);
 var $2720=HEAP8[($2719)];
 var $2721=($2720&255);
 var $2722=$2718^$2721;
 var $2723=(($2722)&255);
 var $2724=$x;
 var $2725=((($2724)*(3))&-1);
 var $2726=((($2725)+(2))|0);
 var $2727=$line;
 var $2728=(($2727+$2726)|0);
 HEAP8[($2728)]=$2723;
 label=221;break;
 case 220: 
 var $2730=$x;
 var $2731=((($2730)*(3))&-1);
 var $2732=$prevline;
 var $2733=(($2732+$2731)|0);
 var $2734=HEAP8[($2733)];
 var $2735=$x;
 var $2736=((($2735)*(3))&-1);
 var $2737=$line;
 var $2738=(($2737+$2736)|0);
 HEAP8[($2738)]=$2734;
 var $2739=$x;
 var $2740=((($2739)*(3))&-1);
 var $2741=((($2740)+(1))|0);
 var $2742=$prevline;
 var $2743=(($2742+$2741)|0);
 var $2744=HEAP8[($2743)];
 var $2745=$x;
 var $2746=((($2745)*(3))&-1);
 var $2747=((($2746)+(1))|0);
 var $2748=$line;
 var $2749=(($2748+$2747)|0);
 HEAP8[($2749)]=$2744;
 var $2750=$x;
 var $2751=((($2750)*(3))&-1);
 var $2752=((($2751)+(2))|0);
 var $2753=$prevline;
 var $2754=(($2753+$2752)|0);
 var $2755=HEAP8[($2754)];
 var $2756=$x;
 var $2757=((($2756)*(3))&-1);
 var $2758=((($2757)+(2))|0);
 var $2759=$line;
 var $2760=(($2759+$2758)|0);
 HEAP8[($2760)]=$2755;
 label=221;break;
 case 221: 
 var $2762=$count;
 var $2763=((($2762)-(1))|0);
 $count=$2763;
 var $2764=$x;
 var $2765=((($2764)+(1))|0);
 $x=$2765;
 var $2766=$mixmask;
 var $2767=($2766&255);
 var $2768=$2767<<1;
 var $2769=(($2768)&255);
 $mixmask=$2769;
 var $2770=$mixmask;
 var $2771=($2770&255);
 var $2772=($2771|0)==0;
 if($2772){label=222;break;}else{label=226;break;}
 case 222: 
 var $2774=$fom_mask;
 var $2775=($2774|0)!=0;
 if($2775){label=223;break;}else{label=224;break;}
 case 223: 
 var $2777=$fom_mask;
 var $2784=$2777;label=225;break;
 case 224: 
 var $2779=$5;
 var $2780=(($2779+1)|0);
 $5=$2780;
 var $2781=HEAP8[($2779)];
 var $2782=($2781&255);
 var $2784=$2782;label=225;break;
 case 225: 
 var $2784;
 var $2785=(($2784)&255);
 $mask=$2785;
 $mixmask=1;
 label=226;break;
 case 226: 
 var $2787=$mask;
 var $2788=($2787&255);
 var $2789=$mixmask;
 var $2790=($2789&255);
 var $2791=$2788&$2790;
 var $2792=($2791|0)!=0;
 if($2792){label=227;break;}else{label=228;break;}
 case 227: 
 var $2794=$x;
 var $2795=((($2794)*(3))&-1);
 var $2796=$prevline;
 var $2797=(($2796+$2795)|0);
 var $2798=HEAP8[($2797)];
 var $2799=($2798&255);
 var $2800=(($mix)|0);
 var $2801=HEAP8[($2800)];
 var $2802=($2801&255);
 var $2803=$2799^$2802;
 var $2804=(($2803)&255);
 var $2805=$x;
 var $2806=((($2805)*(3))&-1);
 var $2807=$line;
 var $2808=(($2807+$2806)|0);
 HEAP8[($2808)]=$2804;
 var $2809=$x;
 var $2810=((($2809)*(3))&-1);
 var $2811=((($2810)+(1))|0);
 var $2812=$prevline;
 var $2813=(($2812+$2811)|0);
 var $2814=HEAP8[($2813)];
 var $2815=($2814&255);
 var $2816=(($mix+1)|0);
 var $2817=HEAP8[($2816)];
 var $2818=($2817&255);
 var $2819=$2815^$2818;
 var $2820=(($2819)&255);
 var $2821=$x;
 var $2822=((($2821)*(3))&-1);
 var $2823=((($2822)+(1))|0);
 var $2824=$line;
 var $2825=(($2824+$2823)|0);
 HEAP8[($2825)]=$2820;
 var $2826=$x;
 var $2827=((($2826)*(3))&-1);
 var $2828=((($2827)+(2))|0);
 var $2829=$prevline;
 var $2830=(($2829+$2828)|0);
 var $2831=HEAP8[($2830)];
 var $2832=($2831&255);
 var $2833=(($mix+2)|0);
 var $2834=HEAP8[($2833)];
 var $2835=($2834&255);
 var $2836=$2832^$2835;
 var $2837=(($2836)&255);
 var $2838=$x;
 var $2839=((($2838)*(3))&-1);
 var $2840=((($2839)+(2))|0);
 var $2841=$line;
 var $2842=(($2841+$2840)|0);
 HEAP8[($2842)]=$2837;
 label=229;break;
 case 228: 
 var $2844=$x;
 var $2845=((($2844)*(3))&-1);
 var $2846=$prevline;
 var $2847=(($2846+$2845)|0);
 var $2848=HEAP8[($2847)];
 var $2849=$x;
 var $2850=((($2849)*(3))&-1);
 var $2851=$line;
 var $2852=(($2851+$2850)|0);
 HEAP8[($2852)]=$2848;
 var $2853=$x;
 var $2854=((($2853)*(3))&-1);
 var $2855=((($2854)+(1))|0);
 var $2856=$prevline;
 var $2857=(($2856+$2855)|0);
 var $2858=HEAP8[($2857)];
 var $2859=$x;
 var $2860=((($2859)*(3))&-1);
 var $2861=((($2860)+(1))|0);
 var $2862=$line;
 var $2863=(($2862+$2861)|0);
 HEAP8[($2863)]=$2858;
 var $2864=$x;
 var $2865=((($2864)*(3))&-1);
 var $2866=((($2865)+(2))|0);
 var $2867=$prevline;
 var $2868=(($2867+$2866)|0);
 var $2869=HEAP8[($2868)];
 var $2870=$x;
 var $2871=((($2870)*(3))&-1);
 var $2872=((($2871)+(2))|0);
 var $2873=$line;
 var $2874=(($2873+$2872)|0);
 HEAP8[($2874)]=$2869;
 label=229;break;
 case 229: 
 var $2876=$count;
 var $2877=((($2876)-(1))|0);
 $count=$2877;
 var $2878=$x;
 var $2879=((($2878)+(1))|0);
 $x=$2879;
 var $2880=$mixmask;
 var $2881=($2880&255);
 var $2882=$2881<<1;
 var $2883=(($2882)&255);
 $mixmask=$2883;
 var $2884=$mixmask;
 var $2885=($2884&255);
 var $2886=($2885|0)==0;
 if($2886){label=230;break;}else{label=234;break;}
 case 230: 
 var $2888=$fom_mask;
 var $2889=($2888|0)!=0;
 if($2889){label=231;break;}else{label=232;break;}
 case 231: 
 var $2891=$fom_mask;
 var $2898=$2891;label=233;break;
 case 232: 
 var $2893=$5;
 var $2894=(($2893+1)|0);
 $5=$2894;
 var $2895=HEAP8[($2893)];
 var $2896=($2895&255);
 var $2898=$2896;label=233;break;
 case 233: 
 var $2898;
 var $2899=(($2898)&255);
 $mask=$2899;
 $mixmask=1;
 label=234;break;
 case 234: 
 var $2901=$mask;
 var $2902=($2901&255);
 var $2903=$mixmask;
 var $2904=($2903&255);
 var $2905=$2902&$2904;
 var $2906=($2905|0)!=0;
 if($2906){label=235;break;}else{label=236;break;}
 case 235: 
 var $2908=$x;
 var $2909=((($2908)*(3))&-1);
 var $2910=$prevline;
 var $2911=(($2910+$2909)|0);
 var $2912=HEAP8[($2911)];
 var $2913=($2912&255);
 var $2914=(($mix)|0);
 var $2915=HEAP8[($2914)];
 var $2916=($2915&255);
 var $2917=$2913^$2916;
 var $2918=(($2917)&255);
 var $2919=$x;
 var $2920=((($2919)*(3))&-1);
 var $2921=$line;
 var $2922=(($2921+$2920)|0);
 HEAP8[($2922)]=$2918;
 var $2923=$x;
 var $2924=((($2923)*(3))&-1);
 var $2925=((($2924)+(1))|0);
 var $2926=$prevline;
 var $2927=(($2926+$2925)|0);
 var $2928=HEAP8[($2927)];
 var $2929=($2928&255);
 var $2930=(($mix+1)|0);
 var $2931=HEAP8[($2930)];
 var $2932=($2931&255);
 var $2933=$2929^$2932;
 var $2934=(($2933)&255);
 var $2935=$x;
 var $2936=((($2935)*(3))&-1);
 var $2937=((($2936)+(1))|0);
 var $2938=$line;
 var $2939=(($2938+$2937)|0);
 HEAP8[($2939)]=$2934;
 var $2940=$x;
 var $2941=((($2940)*(3))&-1);
 var $2942=((($2941)+(2))|0);
 var $2943=$prevline;
 var $2944=(($2943+$2942)|0);
 var $2945=HEAP8[($2944)];
 var $2946=($2945&255);
 var $2947=(($mix+2)|0);
 var $2948=HEAP8[($2947)];
 var $2949=($2948&255);
 var $2950=$2946^$2949;
 var $2951=(($2950)&255);
 var $2952=$x;
 var $2953=((($2952)*(3))&-1);
 var $2954=((($2953)+(2))|0);
 var $2955=$line;
 var $2956=(($2955+$2954)|0);
 HEAP8[($2956)]=$2951;
 label=237;break;
 case 236: 
 var $2958=$x;
 var $2959=((($2958)*(3))&-1);
 var $2960=$prevline;
 var $2961=(($2960+$2959)|0);
 var $2962=HEAP8[($2961)];
 var $2963=$x;
 var $2964=((($2963)*(3))&-1);
 var $2965=$line;
 var $2966=(($2965+$2964)|0);
 HEAP8[($2966)]=$2962;
 var $2967=$x;
 var $2968=((($2967)*(3))&-1);
 var $2969=((($2968)+(1))|0);
 var $2970=$prevline;
 var $2971=(($2970+$2969)|0);
 var $2972=HEAP8[($2971)];
 var $2973=$x;
 var $2974=((($2973)*(3))&-1);
 var $2975=((($2974)+(1))|0);
 var $2976=$line;
 var $2977=(($2976+$2975)|0);
 HEAP8[($2977)]=$2972;
 var $2978=$x;
 var $2979=((($2978)*(3))&-1);
 var $2980=((($2979)+(2))|0);
 var $2981=$prevline;
 var $2982=(($2981+$2980)|0);
 var $2983=HEAP8[($2982)];
 var $2984=$x;
 var $2985=((($2984)*(3))&-1);
 var $2986=((($2985)+(2))|0);
 var $2987=$line;
 var $2988=(($2987+$2986)|0);
 HEAP8[($2988)]=$2983;
 label=237;break;
 case 237: 
 var $2990=$count;
 var $2991=((($2990)-(1))|0);
 $count=$2991;
 var $2992=$x;
 var $2993=((($2992)+(1))|0);
 $x=$2993;
 var $2994=$mixmask;
 var $2995=($2994&255);
 var $2996=$2995<<1;
 var $2997=(($2996)&255);
 $mixmask=$2997;
 var $2998=$mixmask;
 var $2999=($2998&255);
 var $3000=($2999|0)==0;
 if($3000){label=238;break;}else{label=242;break;}
 case 238: 
 var $3002=$fom_mask;
 var $3003=($3002|0)!=0;
 if($3003){label=239;break;}else{label=240;break;}
 case 239: 
 var $3005=$fom_mask;
 var $3012=$3005;label=241;break;
 case 240: 
 var $3007=$5;
 var $3008=(($3007+1)|0);
 $5=$3008;
 var $3009=HEAP8[($3007)];
 var $3010=($3009&255);
 var $3012=$3010;label=241;break;
 case 241: 
 var $3012;
 var $3013=(($3012)&255);
 $mask=$3013;
 $mixmask=1;
 label=242;break;
 case 242: 
 var $3015=$mask;
 var $3016=($3015&255);
 var $3017=$mixmask;
 var $3018=($3017&255);
 var $3019=$3016&$3018;
 var $3020=($3019|0)!=0;
 if($3020){label=243;break;}else{label=244;break;}
 case 243: 
 var $3022=$x;
 var $3023=((($3022)*(3))&-1);
 var $3024=$prevline;
 var $3025=(($3024+$3023)|0);
 var $3026=HEAP8[($3025)];
 var $3027=($3026&255);
 var $3028=(($mix)|0);
 var $3029=HEAP8[($3028)];
 var $3030=($3029&255);
 var $3031=$3027^$3030;
 var $3032=(($3031)&255);
 var $3033=$x;
 var $3034=((($3033)*(3))&-1);
 var $3035=$line;
 var $3036=(($3035+$3034)|0);
 HEAP8[($3036)]=$3032;
 var $3037=$x;
 var $3038=((($3037)*(3))&-1);
 var $3039=((($3038)+(1))|0);
 var $3040=$prevline;
 var $3041=(($3040+$3039)|0);
 var $3042=HEAP8[($3041)];
 var $3043=($3042&255);
 var $3044=(($mix+1)|0);
 var $3045=HEAP8[($3044)];
 var $3046=($3045&255);
 var $3047=$3043^$3046;
 var $3048=(($3047)&255);
 var $3049=$x;
 var $3050=((($3049)*(3))&-1);
 var $3051=((($3050)+(1))|0);
 var $3052=$line;
 var $3053=(($3052+$3051)|0);
 HEAP8[($3053)]=$3048;
 var $3054=$x;
 var $3055=((($3054)*(3))&-1);
 var $3056=((($3055)+(2))|0);
 var $3057=$prevline;
 var $3058=(($3057+$3056)|0);
 var $3059=HEAP8[($3058)];
 var $3060=($3059&255);
 var $3061=(($mix+2)|0);
 var $3062=HEAP8[($3061)];
 var $3063=($3062&255);
 var $3064=$3060^$3063;
 var $3065=(($3064)&255);
 var $3066=$x;
 var $3067=((($3066)*(3))&-1);
 var $3068=((($3067)+(2))|0);
 var $3069=$line;
 var $3070=(($3069+$3068)|0);
 HEAP8[($3070)]=$3065;
 label=245;break;
 case 244: 
 var $3072=$x;
 var $3073=((($3072)*(3))&-1);
 var $3074=$prevline;
 var $3075=(($3074+$3073)|0);
 var $3076=HEAP8[($3075)];
 var $3077=$x;
 var $3078=((($3077)*(3))&-1);
 var $3079=$line;
 var $3080=(($3079+$3078)|0);
 HEAP8[($3080)]=$3076;
 var $3081=$x;
 var $3082=((($3081)*(3))&-1);
 var $3083=((($3082)+(1))|0);
 var $3084=$prevline;
 var $3085=(($3084+$3083)|0);
 var $3086=HEAP8[($3085)];
 var $3087=$x;
 var $3088=((($3087)*(3))&-1);
 var $3089=((($3088)+(1))|0);
 var $3090=$line;
 var $3091=(($3090+$3089)|0);
 HEAP8[($3091)]=$3086;
 var $3092=$x;
 var $3093=((($3092)*(3))&-1);
 var $3094=((($3093)+(2))|0);
 var $3095=$prevline;
 var $3096=(($3095+$3094)|0);
 var $3097=HEAP8[($3096)];
 var $3098=$x;
 var $3099=((($3098)*(3))&-1);
 var $3100=((($3099)+(2))|0);
 var $3101=$line;
 var $3102=(($3101+$3100)|0);
 HEAP8[($3102)]=$3097;
 label=245;break;
 case 245: 
 var $3104=$count;
 var $3105=((($3104)-(1))|0);
 $count=$3105;
 var $3106=$x;
 var $3107=((($3106)+(1))|0);
 $x=$3107;
 label=178;break;
 case 246: 
 label=247;break;
 case 247: 
 var $3110=$count;
 var $3111=($3110|0)>0;
 if($3111){label=248;break;}else{var $3117=0;label=249;break;}
 case 248: 
 var $3113=$x;
 var $3114=$3;
 var $3115=($3113|0)<($3114|0);
 var $3117=$3115;label=249;break;
 case 249: 
 var $3117;
 if($3117){label=250;break;}else{label=259;break;}
 case 250: 
 var $3119=$mixmask;
 var $3120=($3119&255);
 var $3121=$3120<<1;
 var $3122=(($3121)&255);
 $mixmask=$3122;
 var $3123=$mixmask;
 var $3124=($3123&255);
 var $3125=($3124|0)==0;
 if($3125){label=251;break;}else{label=255;break;}
 case 251: 
 var $3127=$fom_mask;
 var $3128=($3127|0)!=0;
 if($3128){label=252;break;}else{label=253;break;}
 case 252: 
 var $3130=$fom_mask;
 var $3137=$3130;label=254;break;
 case 253: 
 var $3132=$5;
 var $3133=(($3132+1)|0);
 $5=$3133;
 var $3134=HEAP8[($3132)];
 var $3135=($3134&255);
 var $3137=$3135;label=254;break;
 case 254: 
 var $3137;
 var $3138=(($3137)&255);
 $mask=$3138;
 $mixmask=1;
 label=255;break;
 case 255: 
 var $3140=$mask;
 var $3141=($3140&255);
 var $3142=$mixmask;
 var $3143=($3142&255);
 var $3144=$3141&$3143;
 var $3145=($3144|0)!=0;
 if($3145){label=256;break;}else{label=257;break;}
 case 256: 
 var $3147=$x;
 var $3148=((($3147)*(3))&-1);
 var $3149=$prevline;
 var $3150=(($3149+$3148)|0);
 var $3151=HEAP8[($3150)];
 var $3152=($3151&255);
 var $3153=(($mix)|0);
 var $3154=HEAP8[($3153)];
 var $3155=($3154&255);
 var $3156=$3152^$3155;
 var $3157=(($3156)&255);
 var $3158=$x;
 var $3159=((($3158)*(3))&-1);
 var $3160=$line;
 var $3161=(($3160+$3159)|0);
 HEAP8[($3161)]=$3157;
 var $3162=$x;
 var $3163=((($3162)*(3))&-1);
 var $3164=((($3163)+(1))|0);
 var $3165=$prevline;
 var $3166=(($3165+$3164)|0);
 var $3167=HEAP8[($3166)];
 var $3168=($3167&255);
 var $3169=(($mix+1)|0);
 var $3170=HEAP8[($3169)];
 var $3171=($3170&255);
 var $3172=$3168^$3171;
 var $3173=(($3172)&255);
 var $3174=$x;
 var $3175=((($3174)*(3))&-1);
 var $3176=((($3175)+(1))|0);
 var $3177=$line;
 var $3178=(($3177+$3176)|0);
 HEAP8[($3178)]=$3173;
 var $3179=$x;
 var $3180=((($3179)*(3))&-1);
 var $3181=((($3180)+(2))|0);
 var $3182=$prevline;
 var $3183=(($3182+$3181)|0);
 var $3184=HEAP8[($3183)];
 var $3185=($3184&255);
 var $3186=(($mix+2)|0);
 var $3187=HEAP8[($3186)];
 var $3188=($3187&255);
 var $3189=$3185^$3188;
 var $3190=(($3189)&255);
 var $3191=$x;
 var $3192=((($3191)*(3))&-1);
 var $3193=((($3192)+(2))|0);
 var $3194=$line;
 var $3195=(($3194+$3193)|0);
 HEAP8[($3195)]=$3190;
 label=258;break;
 case 257: 
 var $3197=$x;
 var $3198=((($3197)*(3))&-1);
 var $3199=$prevline;
 var $3200=(($3199+$3198)|0);
 var $3201=HEAP8[($3200)];
 var $3202=$x;
 var $3203=((($3202)*(3))&-1);
 var $3204=$line;
 var $3205=(($3204+$3203)|0);
 HEAP8[($3205)]=$3201;
 var $3206=$x;
 var $3207=((($3206)*(3))&-1);
 var $3208=((($3207)+(1))|0);
 var $3209=$prevline;
 var $3210=(($3209+$3208)|0);
 var $3211=HEAP8[($3210)];
 var $3212=$x;
 var $3213=((($3212)*(3))&-1);
 var $3214=((($3213)+(1))|0);
 var $3215=$line;
 var $3216=(($3215+$3214)|0);
 HEAP8[($3216)]=$3211;
 var $3217=$x;
 var $3218=((($3217)*(3))&-1);
 var $3219=((($3218)+(2))|0);
 var $3220=$prevline;
 var $3221=(($3220+$3219)|0);
 var $3222=HEAP8[($3221)];
 var $3223=$x;
 var $3224=((($3223)*(3))&-1);
 var $3225=((($3224)+(2))|0);
 var $3226=$line;
 var $3227=(($3226+$3225)|0);
 HEAP8[($3227)]=$3222;
 label=258;break;
 case 258: 
 var $3229=$count;
 var $3230=((($3229)-(1))|0);
 $count=$3230;
 var $3231=$x;
 var $3232=((($3231)+(1))|0);
 $x=$3232;
 label=247;break;
 case 259: 
 label=260;break;
 case 260: 
 label=344;break;
 case 261: 
 label=262;break;
 case 262: 
 var $3237=$count;
 var $3238=$3237&-8;
 var $3239=($3238|0)!=0;
 if($3239){label=263;break;}else{var $3246=0;label=264;break;}
 case 263: 
 var $3241=$x;
 var $3242=((($3241)+(8))|0);
 var $3243=$3;
 var $3244=($3242|0)<($3243|0);
 var $3246=$3244;label=264;break;
 case 264: 
 var $3246;
 if($3246){label=265;break;}else{label=266;break;}
 case 265: 
 var $3248=(($colour2)|0);
 var $3249=HEAP8[($3248)];
 var $3250=$x;
 var $3251=((($3250)*(3))&-1);
 var $3252=$line;
 var $3253=(($3252+$3251)|0);
 HEAP8[($3253)]=$3249;
 var $3254=(($colour2+1)|0);
 var $3255=HEAP8[($3254)];
 var $3256=$x;
 var $3257=((($3256)*(3))&-1);
 var $3258=((($3257)+(1))|0);
 var $3259=$line;
 var $3260=(($3259+$3258)|0);
 HEAP8[($3260)]=$3255;
 var $3261=(($colour2+2)|0);
 var $3262=HEAP8[($3261)];
 var $3263=$x;
 var $3264=((($3263)*(3))&-1);
 var $3265=((($3264)+(2))|0);
 var $3266=$line;
 var $3267=(($3266+$3265)|0);
 HEAP8[($3267)]=$3262;
 var $3268=$count;
 var $3269=((($3268)-(1))|0);
 $count=$3269;
 var $3270=$x;
 var $3271=((($3270)+(1))|0);
 $x=$3271;
 var $3272=(($colour2)|0);
 var $3273=HEAP8[($3272)];
 var $3274=$x;
 var $3275=((($3274)*(3))&-1);
 var $3276=$line;
 var $3277=(($3276+$3275)|0);
 HEAP8[($3277)]=$3273;
 var $3278=(($colour2+1)|0);
 var $3279=HEAP8[($3278)];
 var $3280=$x;
 var $3281=((($3280)*(3))&-1);
 var $3282=((($3281)+(1))|0);
 var $3283=$line;
 var $3284=(($3283+$3282)|0);
 HEAP8[($3284)]=$3279;
 var $3285=(($colour2+2)|0);
 var $3286=HEAP8[($3285)];
 var $3287=$x;
 var $3288=((($3287)*(3))&-1);
 var $3289=((($3288)+(2))|0);
 var $3290=$line;
 var $3291=(($3290+$3289)|0);
 HEAP8[($3291)]=$3286;
 var $3292=$count;
 var $3293=((($3292)-(1))|0);
 $count=$3293;
 var $3294=$x;
 var $3295=((($3294)+(1))|0);
 $x=$3295;
 var $3296=(($colour2)|0);
 var $3297=HEAP8[($3296)];
 var $3298=$x;
 var $3299=((($3298)*(3))&-1);
 var $3300=$line;
 var $3301=(($3300+$3299)|0);
 HEAP8[($3301)]=$3297;
 var $3302=(($colour2+1)|0);
 var $3303=HEAP8[($3302)];
 var $3304=$x;
 var $3305=((($3304)*(3))&-1);
 var $3306=((($3305)+(1))|0);
 var $3307=$line;
 var $3308=(($3307+$3306)|0);
 HEAP8[($3308)]=$3303;
 var $3309=(($colour2+2)|0);
 var $3310=HEAP8[($3309)];
 var $3311=$x;
 var $3312=((($3311)*(3))&-1);
 var $3313=((($3312)+(2))|0);
 var $3314=$line;
 var $3315=(($3314+$3313)|0);
 HEAP8[($3315)]=$3310;
 var $3316=$count;
 var $3317=((($3316)-(1))|0);
 $count=$3317;
 var $3318=$x;
 var $3319=((($3318)+(1))|0);
 $x=$3319;
 var $3320=(($colour2)|0);
 var $3321=HEAP8[($3320)];
 var $3322=$x;
 var $3323=((($3322)*(3))&-1);
 var $3324=$line;
 var $3325=(($3324+$3323)|0);
 HEAP8[($3325)]=$3321;
 var $3326=(($colour2+1)|0);
 var $3327=HEAP8[($3326)];
 var $3328=$x;
 var $3329=((($3328)*(3))&-1);
 var $3330=((($3329)+(1))|0);
 var $3331=$line;
 var $3332=(($3331+$3330)|0);
 HEAP8[($3332)]=$3327;
 var $3333=(($colour2+2)|0);
 var $3334=HEAP8[($3333)];
 var $3335=$x;
 var $3336=((($3335)*(3))&-1);
 var $3337=((($3336)+(2))|0);
 var $3338=$line;
 var $3339=(($3338+$3337)|0);
 HEAP8[($3339)]=$3334;
 var $3340=$count;
 var $3341=((($3340)-(1))|0);
 $count=$3341;
 var $3342=$x;
 var $3343=((($3342)+(1))|0);
 $x=$3343;
 var $3344=(($colour2)|0);
 var $3345=HEAP8[($3344)];
 var $3346=$x;
 var $3347=((($3346)*(3))&-1);
 var $3348=$line;
 var $3349=(($3348+$3347)|0);
 HEAP8[($3349)]=$3345;
 var $3350=(($colour2+1)|0);
 var $3351=HEAP8[($3350)];
 var $3352=$x;
 var $3353=((($3352)*(3))&-1);
 var $3354=((($3353)+(1))|0);
 var $3355=$line;
 var $3356=(($3355+$3354)|0);
 HEAP8[($3356)]=$3351;
 var $3357=(($colour2+2)|0);
 var $3358=HEAP8[($3357)];
 var $3359=$x;
 var $3360=((($3359)*(3))&-1);
 var $3361=((($3360)+(2))|0);
 var $3362=$line;
 var $3363=(($3362+$3361)|0);
 HEAP8[($3363)]=$3358;
 var $3364=$count;
 var $3365=((($3364)-(1))|0);
 $count=$3365;
 var $3366=$x;
 var $3367=((($3366)+(1))|0);
 $x=$3367;
 var $3368=(($colour2)|0);
 var $3369=HEAP8[($3368)];
 var $3370=$x;
 var $3371=((($3370)*(3))&-1);
 var $3372=$line;
 var $3373=(($3372+$3371)|0);
 HEAP8[($3373)]=$3369;
 var $3374=(($colour2+1)|0);
 var $3375=HEAP8[($3374)];
 var $3376=$x;
 var $3377=((($3376)*(3))&-1);
 var $3378=((($3377)+(1))|0);
 var $3379=$line;
 var $3380=(($3379+$3378)|0);
 HEAP8[($3380)]=$3375;
 var $3381=(($colour2+2)|0);
 var $3382=HEAP8[($3381)];
 var $3383=$x;
 var $3384=((($3383)*(3))&-1);
 var $3385=((($3384)+(2))|0);
 var $3386=$line;
 var $3387=(($3386+$3385)|0);
 HEAP8[($3387)]=$3382;
 var $3388=$count;
 var $3389=((($3388)-(1))|0);
 $count=$3389;
 var $3390=$x;
 var $3391=((($3390)+(1))|0);
 $x=$3391;
 var $3392=(($colour2)|0);
 var $3393=HEAP8[($3392)];
 var $3394=$x;
 var $3395=((($3394)*(3))&-1);
 var $3396=$line;
 var $3397=(($3396+$3395)|0);
 HEAP8[($3397)]=$3393;
 var $3398=(($colour2+1)|0);
 var $3399=HEAP8[($3398)];
 var $3400=$x;
 var $3401=((($3400)*(3))&-1);
 var $3402=((($3401)+(1))|0);
 var $3403=$line;
 var $3404=(($3403+$3402)|0);
 HEAP8[($3404)]=$3399;
 var $3405=(($colour2+2)|0);
 var $3406=HEAP8[($3405)];
 var $3407=$x;
 var $3408=((($3407)*(3))&-1);
 var $3409=((($3408)+(2))|0);
 var $3410=$line;
 var $3411=(($3410+$3409)|0);
 HEAP8[($3411)]=$3406;
 var $3412=$count;
 var $3413=((($3412)-(1))|0);
 $count=$3413;
 var $3414=$x;
 var $3415=((($3414)+(1))|0);
 $x=$3415;
 var $3416=(($colour2)|0);
 var $3417=HEAP8[($3416)];
 var $3418=$x;
 var $3419=((($3418)*(3))&-1);
 var $3420=$line;
 var $3421=(($3420+$3419)|0);
 HEAP8[($3421)]=$3417;
 var $3422=(($colour2+1)|0);
 var $3423=HEAP8[($3422)];
 var $3424=$x;
 var $3425=((($3424)*(3))&-1);
 var $3426=((($3425)+(1))|0);
 var $3427=$line;
 var $3428=(($3427+$3426)|0);
 HEAP8[($3428)]=$3423;
 var $3429=(($colour2+2)|0);
 var $3430=HEAP8[($3429)];
 var $3431=$x;
 var $3432=((($3431)*(3))&-1);
 var $3433=((($3432)+(2))|0);
 var $3434=$line;
 var $3435=(($3434+$3433)|0);
 HEAP8[($3435)]=$3430;
 var $3436=$count;
 var $3437=((($3436)-(1))|0);
 $count=$3437;
 var $3438=$x;
 var $3439=((($3438)+(1))|0);
 $x=$3439;
 label=262;break;
 case 266: 
 label=267;break;
 case 267: 
 var $3442=$count;
 var $3443=($3442|0)>0;
 if($3443){label=268;break;}else{var $3449=0;label=269;break;}
 case 268: 
 var $3445=$x;
 var $3446=$3;
 var $3447=($3445|0)<($3446|0);
 var $3449=$3447;label=269;break;
 case 269: 
 var $3449;
 if($3449){label=270;break;}else{label=271;break;}
 case 270: 
 var $3451=(($colour2)|0);
 var $3452=HEAP8[($3451)];
 var $3453=$x;
 var $3454=((($3453)*(3))&-1);
 var $3455=$line;
 var $3456=(($3455+$3454)|0);
 HEAP8[($3456)]=$3452;
 var $3457=(($colour2+1)|0);
 var $3458=HEAP8[($3457)];
 var $3459=$x;
 var $3460=((($3459)*(3))&-1);
 var $3461=((($3460)+(1))|0);
 var $3462=$line;
 var $3463=(($3462+$3461)|0);
 HEAP8[($3463)]=$3458;
 var $3464=(($colour2+2)|0);
 var $3465=HEAP8[($3464)];
 var $3466=$x;
 var $3467=((($3466)*(3))&-1);
 var $3468=((($3467)+(2))|0);
 var $3469=$line;
 var $3470=(($3469+$3468)|0);
 HEAP8[($3470)]=$3465;
 var $3471=$count;
 var $3472=((($3471)-(1))|0);
 $count=$3472;
 var $3473=$x;
 var $3474=((($3473)+(1))|0);
 $x=$3474;
 label=267;break;
 case 271: 
 label=344;break;
 case 272: 
 label=273;break;
 case 273: 
 var $3478=$count;
 var $3479=$3478&-8;
 var $3480=($3479|0)!=0;
 if($3480){label=274;break;}else{var $3487=0;label=275;break;}
 case 274: 
 var $3482=$x;
 var $3483=((($3482)+(8))|0);
 var $3484=$3;
 var $3485=($3483|0)<($3484|0);
 var $3487=$3485;label=275;break;
 case 275: 
 var $3487;
 if($3487){label=276;break;}else{label=277;break;}
 case 276: 
 var $3489=$5;
 var $3490=(($3489+1)|0);
 $5=$3490;
 var $3491=HEAP8[($3489)];
 var $3492=$x;
 var $3493=((($3492)*(3))&-1);
 var $3494=$line;
 var $3495=(($3494+$3493)|0);
 HEAP8[($3495)]=$3491;
 var $3496=$5;
 var $3497=(($3496+1)|0);
 $5=$3497;
 var $3498=HEAP8[($3496)];
 var $3499=$x;
 var $3500=((($3499)*(3))&-1);
 var $3501=((($3500)+(1))|0);
 var $3502=$line;
 var $3503=(($3502+$3501)|0);
 HEAP8[($3503)]=$3498;
 var $3504=$5;
 var $3505=(($3504+1)|0);
 $5=$3505;
 var $3506=HEAP8[($3504)];
 var $3507=$x;
 var $3508=((($3507)*(3))&-1);
 var $3509=((($3508)+(2))|0);
 var $3510=$line;
 var $3511=(($3510+$3509)|0);
 HEAP8[($3511)]=$3506;
 var $3512=$count;
 var $3513=((($3512)-(1))|0);
 $count=$3513;
 var $3514=$x;
 var $3515=((($3514)+(1))|0);
 $x=$3515;
 var $3516=$5;
 var $3517=(($3516+1)|0);
 $5=$3517;
 var $3518=HEAP8[($3516)];
 var $3519=$x;
 var $3520=((($3519)*(3))&-1);
 var $3521=$line;
 var $3522=(($3521+$3520)|0);
 HEAP8[($3522)]=$3518;
 var $3523=$5;
 var $3524=(($3523+1)|0);
 $5=$3524;
 var $3525=HEAP8[($3523)];
 var $3526=$x;
 var $3527=((($3526)*(3))&-1);
 var $3528=((($3527)+(1))|0);
 var $3529=$line;
 var $3530=(($3529+$3528)|0);
 HEAP8[($3530)]=$3525;
 var $3531=$5;
 var $3532=(($3531+1)|0);
 $5=$3532;
 var $3533=HEAP8[($3531)];
 var $3534=$x;
 var $3535=((($3534)*(3))&-1);
 var $3536=((($3535)+(2))|0);
 var $3537=$line;
 var $3538=(($3537+$3536)|0);
 HEAP8[($3538)]=$3533;
 var $3539=$count;
 var $3540=((($3539)-(1))|0);
 $count=$3540;
 var $3541=$x;
 var $3542=((($3541)+(1))|0);
 $x=$3542;
 var $3543=$5;
 var $3544=(($3543+1)|0);
 $5=$3544;
 var $3545=HEAP8[($3543)];
 var $3546=$x;
 var $3547=((($3546)*(3))&-1);
 var $3548=$line;
 var $3549=(($3548+$3547)|0);
 HEAP8[($3549)]=$3545;
 var $3550=$5;
 var $3551=(($3550+1)|0);
 $5=$3551;
 var $3552=HEAP8[($3550)];
 var $3553=$x;
 var $3554=((($3553)*(3))&-1);
 var $3555=((($3554)+(1))|0);
 var $3556=$line;
 var $3557=(($3556+$3555)|0);
 HEAP8[($3557)]=$3552;
 var $3558=$5;
 var $3559=(($3558+1)|0);
 $5=$3559;
 var $3560=HEAP8[($3558)];
 var $3561=$x;
 var $3562=((($3561)*(3))&-1);
 var $3563=((($3562)+(2))|0);
 var $3564=$line;
 var $3565=(($3564+$3563)|0);
 HEAP8[($3565)]=$3560;
 var $3566=$count;
 var $3567=((($3566)-(1))|0);
 $count=$3567;
 var $3568=$x;
 var $3569=((($3568)+(1))|0);
 $x=$3569;
 var $3570=$5;
 var $3571=(($3570+1)|0);
 $5=$3571;
 var $3572=HEAP8[($3570)];
 var $3573=$x;
 var $3574=((($3573)*(3))&-1);
 var $3575=$line;
 var $3576=(($3575+$3574)|0);
 HEAP8[($3576)]=$3572;
 var $3577=$5;
 var $3578=(($3577+1)|0);
 $5=$3578;
 var $3579=HEAP8[($3577)];
 var $3580=$x;
 var $3581=((($3580)*(3))&-1);
 var $3582=((($3581)+(1))|0);
 var $3583=$line;
 var $3584=(($3583+$3582)|0);
 HEAP8[($3584)]=$3579;
 var $3585=$5;
 var $3586=(($3585+1)|0);
 $5=$3586;
 var $3587=HEAP8[($3585)];
 var $3588=$x;
 var $3589=((($3588)*(3))&-1);
 var $3590=((($3589)+(2))|0);
 var $3591=$line;
 var $3592=(($3591+$3590)|0);
 HEAP8[($3592)]=$3587;
 var $3593=$count;
 var $3594=((($3593)-(1))|0);
 $count=$3594;
 var $3595=$x;
 var $3596=((($3595)+(1))|0);
 $x=$3596;
 var $3597=$5;
 var $3598=(($3597+1)|0);
 $5=$3598;
 var $3599=HEAP8[($3597)];
 var $3600=$x;
 var $3601=((($3600)*(3))&-1);
 var $3602=$line;
 var $3603=(($3602+$3601)|0);
 HEAP8[($3603)]=$3599;
 var $3604=$5;
 var $3605=(($3604+1)|0);
 $5=$3605;
 var $3606=HEAP8[($3604)];
 var $3607=$x;
 var $3608=((($3607)*(3))&-1);
 var $3609=((($3608)+(1))|0);
 var $3610=$line;
 var $3611=(($3610+$3609)|0);
 HEAP8[($3611)]=$3606;
 var $3612=$5;
 var $3613=(($3612+1)|0);
 $5=$3613;
 var $3614=HEAP8[($3612)];
 var $3615=$x;
 var $3616=((($3615)*(3))&-1);
 var $3617=((($3616)+(2))|0);
 var $3618=$line;
 var $3619=(($3618+$3617)|0);
 HEAP8[($3619)]=$3614;
 var $3620=$count;
 var $3621=((($3620)-(1))|0);
 $count=$3621;
 var $3622=$x;
 var $3623=((($3622)+(1))|0);
 $x=$3623;
 var $3624=$5;
 var $3625=(($3624+1)|0);
 $5=$3625;
 var $3626=HEAP8[($3624)];
 var $3627=$x;
 var $3628=((($3627)*(3))&-1);
 var $3629=$line;
 var $3630=(($3629+$3628)|0);
 HEAP8[($3630)]=$3626;
 var $3631=$5;
 var $3632=(($3631+1)|0);
 $5=$3632;
 var $3633=HEAP8[($3631)];
 var $3634=$x;
 var $3635=((($3634)*(3))&-1);
 var $3636=((($3635)+(1))|0);
 var $3637=$line;
 var $3638=(($3637+$3636)|0);
 HEAP8[($3638)]=$3633;
 var $3639=$5;
 var $3640=(($3639+1)|0);
 $5=$3640;
 var $3641=HEAP8[($3639)];
 var $3642=$x;
 var $3643=((($3642)*(3))&-1);
 var $3644=((($3643)+(2))|0);
 var $3645=$line;
 var $3646=(($3645+$3644)|0);
 HEAP8[($3646)]=$3641;
 var $3647=$count;
 var $3648=((($3647)-(1))|0);
 $count=$3648;
 var $3649=$x;
 var $3650=((($3649)+(1))|0);
 $x=$3650;
 var $3651=$5;
 var $3652=(($3651+1)|0);
 $5=$3652;
 var $3653=HEAP8[($3651)];
 var $3654=$x;
 var $3655=((($3654)*(3))&-1);
 var $3656=$line;
 var $3657=(($3656+$3655)|0);
 HEAP8[($3657)]=$3653;
 var $3658=$5;
 var $3659=(($3658+1)|0);
 $5=$3659;
 var $3660=HEAP8[($3658)];
 var $3661=$x;
 var $3662=((($3661)*(3))&-1);
 var $3663=((($3662)+(1))|0);
 var $3664=$line;
 var $3665=(($3664+$3663)|0);
 HEAP8[($3665)]=$3660;
 var $3666=$5;
 var $3667=(($3666+1)|0);
 $5=$3667;
 var $3668=HEAP8[($3666)];
 var $3669=$x;
 var $3670=((($3669)*(3))&-1);
 var $3671=((($3670)+(2))|0);
 var $3672=$line;
 var $3673=(($3672+$3671)|0);
 HEAP8[($3673)]=$3668;
 var $3674=$count;
 var $3675=((($3674)-(1))|0);
 $count=$3675;
 var $3676=$x;
 var $3677=((($3676)+(1))|0);
 $x=$3677;
 var $3678=$5;
 var $3679=(($3678+1)|0);
 $5=$3679;
 var $3680=HEAP8[($3678)];
 var $3681=$x;
 var $3682=((($3681)*(3))&-1);
 var $3683=$line;
 var $3684=(($3683+$3682)|0);
 HEAP8[($3684)]=$3680;
 var $3685=$5;
 var $3686=(($3685+1)|0);
 $5=$3686;
 var $3687=HEAP8[($3685)];
 var $3688=$x;
 var $3689=((($3688)*(3))&-1);
 var $3690=((($3689)+(1))|0);
 var $3691=$line;
 var $3692=(($3691+$3690)|0);
 HEAP8[($3692)]=$3687;
 var $3693=$5;
 var $3694=(($3693+1)|0);
 $5=$3694;
 var $3695=HEAP8[($3693)];
 var $3696=$x;
 var $3697=((($3696)*(3))&-1);
 var $3698=((($3697)+(2))|0);
 var $3699=$line;
 var $3700=(($3699+$3698)|0);
 HEAP8[($3700)]=$3695;
 var $3701=$count;
 var $3702=((($3701)-(1))|0);
 $count=$3702;
 var $3703=$x;
 var $3704=((($3703)+(1))|0);
 $x=$3704;
 label=273;break;
 case 277: 
 label=278;break;
 case 278: 
 var $3707=$count;
 var $3708=($3707|0)>0;
 if($3708){label=279;break;}else{var $3714=0;label=280;break;}
 case 279: 
 var $3710=$x;
 var $3711=$3;
 var $3712=($3710|0)<($3711|0);
 var $3714=$3712;label=280;break;
 case 280: 
 var $3714;
 if($3714){label=281;break;}else{label=282;break;}
 case 281: 
 var $3716=$5;
 var $3717=(($3716+1)|0);
 $5=$3717;
 var $3718=HEAP8[($3716)];
 var $3719=$x;
 var $3720=((($3719)*(3))&-1);
 var $3721=$line;
 var $3722=(($3721+$3720)|0);
 HEAP8[($3722)]=$3718;
 var $3723=$5;
 var $3724=(($3723+1)|0);
 $5=$3724;
 var $3725=HEAP8[($3723)];
 var $3726=$x;
 var $3727=((($3726)*(3))&-1);
 var $3728=((($3727)+(1))|0);
 var $3729=$line;
 var $3730=(($3729+$3728)|0);
 HEAP8[($3730)]=$3725;
 var $3731=$5;
 var $3732=(($3731+1)|0);
 $5=$3732;
 var $3733=HEAP8[($3731)];
 var $3734=$x;
 var $3735=((($3734)*(3))&-1);
 var $3736=((($3735)+(2))|0);
 var $3737=$line;
 var $3738=(($3737+$3736)|0);
 HEAP8[($3738)]=$3733;
 var $3739=$count;
 var $3740=((($3739)-(1))|0);
 $count=$3740;
 var $3741=$x;
 var $3742=((($3741)+(1))|0);
 $x=$3742;
 label=278;break;
 case 282: 
 label=344;break;
 case 283: 
 label=284;break;
 case 284: 
 var $3746=$count;
 var $3747=$3746&-8;
 var $3748=($3747|0)!=0;
 if($3748){label=285;break;}else{var $3755=0;label=286;break;}
 case 285: 
 var $3750=$x;
 var $3751=((($3750)+(8))|0);
 var $3752=$3;
 var $3753=($3751|0)<($3752|0);
 var $3755=$3753;label=286;break;
 case 286: 
 var $3755;
 if($3755){label=287;break;}else{label=312;break;}
 case 287: 
 var $3757=$bicolour;
 var $3758=($3757|0)!=0;
 if($3758){label=288;break;}else{label=289;break;}
 case 288: 
 var $3760=(($colour2)|0);
 var $3761=HEAP8[($3760)];
 var $3762=$x;
 var $3763=((($3762)*(3))&-1);
 var $3764=$line;
 var $3765=(($3764+$3763)|0);
 HEAP8[($3765)]=$3761;
 var $3766=(($colour2+1)|0);
 var $3767=HEAP8[($3766)];
 var $3768=$x;
 var $3769=((($3768)*(3))&-1);
 var $3770=((($3769)+(1))|0);
 var $3771=$line;
 var $3772=(($3771+$3770)|0);
 HEAP8[($3772)]=$3767;
 var $3773=(($colour2+2)|0);
 var $3774=HEAP8[($3773)];
 var $3775=$x;
 var $3776=((($3775)*(3))&-1);
 var $3777=((($3776)+(2))|0);
 var $3778=$line;
 var $3779=(($3778+$3777)|0);
 HEAP8[($3779)]=$3774;
 $bicolour=0;
 label=290;break;
 case 289: 
 var $3781=(($colour1)|0);
 var $3782=HEAP8[($3781)];
 var $3783=$x;
 var $3784=((($3783)*(3))&-1);
 var $3785=$line;
 var $3786=(($3785+$3784)|0);
 HEAP8[($3786)]=$3782;
 var $3787=(($colour1+1)|0);
 var $3788=HEAP8[($3787)];
 var $3789=$x;
 var $3790=((($3789)*(3))&-1);
 var $3791=((($3790)+(1))|0);
 var $3792=$line;
 var $3793=(($3792+$3791)|0);
 HEAP8[($3793)]=$3788;
 var $3794=(($colour1+2)|0);
 var $3795=HEAP8[($3794)];
 var $3796=$x;
 var $3797=((($3796)*(3))&-1);
 var $3798=((($3797)+(2))|0);
 var $3799=$line;
 var $3800=(($3799+$3798)|0);
 HEAP8[($3800)]=$3795;
 $bicolour=1;
 var $3801=$count;
 var $3802=((($3801)+(1))|0);
 $count=$3802;
 label=290;break;
 case 290: 
 var $3804=$count;
 var $3805=((($3804)-(1))|0);
 $count=$3805;
 var $3806=$x;
 var $3807=((($3806)+(1))|0);
 $x=$3807;
 var $3808=$bicolour;
 var $3809=($3808|0)!=0;
 if($3809){label=291;break;}else{label=292;break;}
 case 291: 
 var $3811=(($colour2)|0);
 var $3812=HEAP8[($3811)];
 var $3813=$x;
 var $3814=((($3813)*(3))&-1);
 var $3815=$line;
 var $3816=(($3815+$3814)|0);
 HEAP8[($3816)]=$3812;
 var $3817=(($colour2+1)|0);
 var $3818=HEAP8[($3817)];
 var $3819=$x;
 var $3820=((($3819)*(3))&-1);
 var $3821=((($3820)+(1))|0);
 var $3822=$line;
 var $3823=(($3822+$3821)|0);
 HEAP8[($3823)]=$3818;
 var $3824=(($colour2+2)|0);
 var $3825=HEAP8[($3824)];
 var $3826=$x;
 var $3827=((($3826)*(3))&-1);
 var $3828=((($3827)+(2))|0);
 var $3829=$line;
 var $3830=(($3829+$3828)|0);
 HEAP8[($3830)]=$3825;
 $bicolour=0;
 label=293;break;
 case 292: 
 var $3832=(($colour1)|0);
 var $3833=HEAP8[($3832)];
 var $3834=$x;
 var $3835=((($3834)*(3))&-1);
 var $3836=$line;
 var $3837=(($3836+$3835)|0);
 HEAP8[($3837)]=$3833;
 var $3838=(($colour1+1)|0);
 var $3839=HEAP8[($3838)];
 var $3840=$x;
 var $3841=((($3840)*(3))&-1);
 var $3842=((($3841)+(1))|0);
 var $3843=$line;
 var $3844=(($3843+$3842)|0);
 HEAP8[($3844)]=$3839;
 var $3845=(($colour1+2)|0);
 var $3846=HEAP8[($3845)];
 var $3847=$x;
 var $3848=((($3847)*(3))&-1);
 var $3849=((($3848)+(2))|0);
 var $3850=$line;
 var $3851=(($3850+$3849)|0);
 HEAP8[($3851)]=$3846;
 $bicolour=1;
 var $3852=$count;
 var $3853=((($3852)+(1))|0);
 $count=$3853;
 label=293;break;
 case 293: 
 var $3855=$count;
 var $3856=((($3855)-(1))|0);
 $count=$3856;
 var $3857=$x;
 var $3858=((($3857)+(1))|0);
 $x=$3858;
 var $3859=$bicolour;
 var $3860=($3859|0)!=0;
 if($3860){label=294;break;}else{label=295;break;}
 case 294: 
 var $3862=(($colour2)|0);
 var $3863=HEAP8[($3862)];
 var $3864=$x;
 var $3865=((($3864)*(3))&-1);
 var $3866=$line;
 var $3867=(($3866+$3865)|0);
 HEAP8[($3867)]=$3863;
 var $3868=(($colour2+1)|0);
 var $3869=HEAP8[($3868)];
 var $3870=$x;
 var $3871=((($3870)*(3))&-1);
 var $3872=((($3871)+(1))|0);
 var $3873=$line;
 var $3874=(($3873+$3872)|0);
 HEAP8[($3874)]=$3869;
 var $3875=(($colour2+2)|0);
 var $3876=HEAP8[($3875)];
 var $3877=$x;
 var $3878=((($3877)*(3))&-1);
 var $3879=((($3878)+(2))|0);
 var $3880=$line;
 var $3881=(($3880+$3879)|0);
 HEAP8[($3881)]=$3876;
 $bicolour=0;
 label=296;break;
 case 295: 
 var $3883=(($colour1)|0);
 var $3884=HEAP8[($3883)];
 var $3885=$x;
 var $3886=((($3885)*(3))&-1);
 var $3887=$line;
 var $3888=(($3887+$3886)|0);
 HEAP8[($3888)]=$3884;
 var $3889=(($colour1+1)|0);
 var $3890=HEAP8[($3889)];
 var $3891=$x;
 var $3892=((($3891)*(3))&-1);
 var $3893=((($3892)+(1))|0);
 var $3894=$line;
 var $3895=(($3894+$3893)|0);
 HEAP8[($3895)]=$3890;
 var $3896=(($colour1+2)|0);
 var $3897=HEAP8[($3896)];
 var $3898=$x;
 var $3899=((($3898)*(3))&-1);
 var $3900=((($3899)+(2))|0);
 var $3901=$line;
 var $3902=(($3901+$3900)|0);
 HEAP8[($3902)]=$3897;
 $bicolour=1;
 var $3903=$count;
 var $3904=((($3903)+(1))|0);
 $count=$3904;
 label=296;break;
 case 296: 
 var $3906=$count;
 var $3907=((($3906)-(1))|0);
 $count=$3907;
 var $3908=$x;
 var $3909=((($3908)+(1))|0);
 $x=$3909;
 var $3910=$bicolour;
 var $3911=($3910|0)!=0;
 if($3911){label=297;break;}else{label=298;break;}
 case 297: 
 var $3913=(($colour2)|0);
 var $3914=HEAP8[($3913)];
 var $3915=$x;
 var $3916=((($3915)*(3))&-1);
 var $3917=$line;
 var $3918=(($3917+$3916)|0);
 HEAP8[($3918)]=$3914;
 var $3919=(($colour2+1)|0);
 var $3920=HEAP8[($3919)];
 var $3921=$x;
 var $3922=((($3921)*(3))&-1);
 var $3923=((($3922)+(1))|0);
 var $3924=$line;
 var $3925=(($3924+$3923)|0);
 HEAP8[($3925)]=$3920;
 var $3926=(($colour2+2)|0);
 var $3927=HEAP8[($3926)];
 var $3928=$x;
 var $3929=((($3928)*(3))&-1);
 var $3930=((($3929)+(2))|0);
 var $3931=$line;
 var $3932=(($3931+$3930)|0);
 HEAP8[($3932)]=$3927;
 $bicolour=0;
 label=299;break;
 case 298: 
 var $3934=(($colour1)|0);
 var $3935=HEAP8[($3934)];
 var $3936=$x;
 var $3937=((($3936)*(3))&-1);
 var $3938=$line;
 var $3939=(($3938+$3937)|0);
 HEAP8[($3939)]=$3935;
 var $3940=(($colour1+1)|0);
 var $3941=HEAP8[($3940)];
 var $3942=$x;
 var $3943=((($3942)*(3))&-1);
 var $3944=((($3943)+(1))|0);
 var $3945=$line;
 var $3946=(($3945+$3944)|0);
 HEAP8[($3946)]=$3941;
 var $3947=(($colour1+2)|0);
 var $3948=HEAP8[($3947)];
 var $3949=$x;
 var $3950=((($3949)*(3))&-1);
 var $3951=((($3950)+(2))|0);
 var $3952=$line;
 var $3953=(($3952+$3951)|0);
 HEAP8[($3953)]=$3948;
 $bicolour=1;
 var $3954=$count;
 var $3955=((($3954)+(1))|0);
 $count=$3955;
 label=299;break;
 case 299: 
 var $3957=$count;
 var $3958=((($3957)-(1))|0);
 $count=$3958;
 var $3959=$x;
 var $3960=((($3959)+(1))|0);
 $x=$3960;
 var $3961=$bicolour;
 var $3962=($3961|0)!=0;
 if($3962){label=300;break;}else{label=301;break;}
 case 300: 
 var $3964=(($colour2)|0);
 var $3965=HEAP8[($3964)];
 var $3966=$x;
 var $3967=((($3966)*(3))&-1);
 var $3968=$line;
 var $3969=(($3968+$3967)|0);
 HEAP8[($3969)]=$3965;
 var $3970=(($colour2+1)|0);
 var $3971=HEAP8[($3970)];
 var $3972=$x;
 var $3973=((($3972)*(3))&-1);
 var $3974=((($3973)+(1))|0);
 var $3975=$line;
 var $3976=(($3975+$3974)|0);
 HEAP8[($3976)]=$3971;
 var $3977=(($colour2+2)|0);
 var $3978=HEAP8[($3977)];
 var $3979=$x;
 var $3980=((($3979)*(3))&-1);
 var $3981=((($3980)+(2))|0);
 var $3982=$line;
 var $3983=(($3982+$3981)|0);
 HEAP8[($3983)]=$3978;
 $bicolour=0;
 label=302;break;
 case 301: 
 var $3985=(($colour1)|0);
 var $3986=HEAP8[($3985)];
 var $3987=$x;
 var $3988=((($3987)*(3))&-1);
 var $3989=$line;
 var $3990=(($3989+$3988)|0);
 HEAP8[($3990)]=$3986;
 var $3991=(($colour1+1)|0);
 var $3992=HEAP8[($3991)];
 var $3993=$x;
 var $3994=((($3993)*(3))&-1);
 var $3995=((($3994)+(1))|0);
 var $3996=$line;
 var $3997=(($3996+$3995)|0);
 HEAP8[($3997)]=$3992;
 var $3998=(($colour1+2)|0);
 var $3999=HEAP8[($3998)];
 var $4000=$x;
 var $4001=((($4000)*(3))&-1);
 var $4002=((($4001)+(2))|0);
 var $4003=$line;
 var $4004=(($4003+$4002)|0);
 HEAP8[($4004)]=$3999;
 $bicolour=1;
 var $4005=$count;
 var $4006=((($4005)+(1))|0);
 $count=$4006;
 label=302;break;
 case 302: 
 var $4008=$count;
 var $4009=((($4008)-(1))|0);
 $count=$4009;
 var $4010=$x;
 var $4011=((($4010)+(1))|0);
 $x=$4011;
 var $4012=$bicolour;
 var $4013=($4012|0)!=0;
 if($4013){label=303;break;}else{label=304;break;}
 case 303: 
 var $4015=(($colour2)|0);
 var $4016=HEAP8[($4015)];
 var $4017=$x;
 var $4018=((($4017)*(3))&-1);
 var $4019=$line;
 var $4020=(($4019+$4018)|0);
 HEAP8[($4020)]=$4016;
 var $4021=(($colour2+1)|0);
 var $4022=HEAP8[($4021)];
 var $4023=$x;
 var $4024=((($4023)*(3))&-1);
 var $4025=((($4024)+(1))|0);
 var $4026=$line;
 var $4027=(($4026+$4025)|0);
 HEAP8[($4027)]=$4022;
 var $4028=(($colour2+2)|0);
 var $4029=HEAP8[($4028)];
 var $4030=$x;
 var $4031=((($4030)*(3))&-1);
 var $4032=((($4031)+(2))|0);
 var $4033=$line;
 var $4034=(($4033+$4032)|0);
 HEAP8[($4034)]=$4029;
 $bicolour=0;
 label=305;break;
 case 304: 
 var $4036=(($colour1)|0);
 var $4037=HEAP8[($4036)];
 var $4038=$x;
 var $4039=((($4038)*(3))&-1);
 var $4040=$line;
 var $4041=(($4040+$4039)|0);
 HEAP8[($4041)]=$4037;
 var $4042=(($colour1+1)|0);
 var $4043=HEAP8[($4042)];
 var $4044=$x;
 var $4045=((($4044)*(3))&-1);
 var $4046=((($4045)+(1))|0);
 var $4047=$line;
 var $4048=(($4047+$4046)|0);
 HEAP8[($4048)]=$4043;
 var $4049=(($colour1+2)|0);
 var $4050=HEAP8[($4049)];
 var $4051=$x;
 var $4052=((($4051)*(3))&-1);
 var $4053=((($4052)+(2))|0);
 var $4054=$line;
 var $4055=(($4054+$4053)|0);
 HEAP8[($4055)]=$4050;
 $bicolour=1;
 var $4056=$count;
 var $4057=((($4056)+(1))|0);
 $count=$4057;
 label=305;break;
 case 305: 
 var $4059=$count;
 var $4060=((($4059)-(1))|0);
 $count=$4060;
 var $4061=$x;
 var $4062=((($4061)+(1))|0);
 $x=$4062;
 var $4063=$bicolour;
 var $4064=($4063|0)!=0;
 if($4064){label=306;break;}else{label=307;break;}
 case 306: 
 var $4066=(($colour2)|0);
 var $4067=HEAP8[($4066)];
 var $4068=$x;
 var $4069=((($4068)*(3))&-1);
 var $4070=$line;
 var $4071=(($4070+$4069)|0);
 HEAP8[($4071)]=$4067;
 var $4072=(($colour2+1)|0);
 var $4073=HEAP8[($4072)];
 var $4074=$x;
 var $4075=((($4074)*(3))&-1);
 var $4076=((($4075)+(1))|0);
 var $4077=$line;
 var $4078=(($4077+$4076)|0);
 HEAP8[($4078)]=$4073;
 var $4079=(($colour2+2)|0);
 var $4080=HEAP8[($4079)];
 var $4081=$x;
 var $4082=((($4081)*(3))&-1);
 var $4083=((($4082)+(2))|0);
 var $4084=$line;
 var $4085=(($4084+$4083)|0);
 HEAP8[($4085)]=$4080;
 $bicolour=0;
 label=308;break;
 case 307: 
 var $4087=(($colour1)|0);
 var $4088=HEAP8[($4087)];
 var $4089=$x;
 var $4090=((($4089)*(3))&-1);
 var $4091=$line;
 var $4092=(($4091+$4090)|0);
 HEAP8[($4092)]=$4088;
 var $4093=(($colour1+1)|0);
 var $4094=HEAP8[($4093)];
 var $4095=$x;
 var $4096=((($4095)*(3))&-1);
 var $4097=((($4096)+(1))|0);
 var $4098=$line;
 var $4099=(($4098+$4097)|0);
 HEAP8[($4099)]=$4094;
 var $4100=(($colour1+2)|0);
 var $4101=HEAP8[($4100)];
 var $4102=$x;
 var $4103=((($4102)*(3))&-1);
 var $4104=((($4103)+(2))|0);
 var $4105=$line;
 var $4106=(($4105+$4104)|0);
 HEAP8[($4106)]=$4101;
 $bicolour=1;
 var $4107=$count;
 var $4108=((($4107)+(1))|0);
 $count=$4108;
 label=308;break;
 case 308: 
 var $4110=$count;
 var $4111=((($4110)-(1))|0);
 $count=$4111;
 var $4112=$x;
 var $4113=((($4112)+(1))|0);
 $x=$4113;
 var $4114=$bicolour;
 var $4115=($4114|0)!=0;
 if($4115){label=309;break;}else{label=310;break;}
 case 309: 
 var $4117=(($colour2)|0);
 var $4118=HEAP8[($4117)];
 var $4119=$x;
 var $4120=((($4119)*(3))&-1);
 var $4121=$line;
 var $4122=(($4121+$4120)|0);
 HEAP8[($4122)]=$4118;
 var $4123=(($colour2+1)|0);
 var $4124=HEAP8[($4123)];
 var $4125=$x;
 var $4126=((($4125)*(3))&-1);
 var $4127=((($4126)+(1))|0);
 var $4128=$line;
 var $4129=(($4128+$4127)|0);
 HEAP8[($4129)]=$4124;
 var $4130=(($colour2+2)|0);
 var $4131=HEAP8[($4130)];
 var $4132=$x;
 var $4133=((($4132)*(3))&-1);
 var $4134=((($4133)+(2))|0);
 var $4135=$line;
 var $4136=(($4135+$4134)|0);
 HEAP8[($4136)]=$4131;
 $bicolour=0;
 label=311;break;
 case 310: 
 var $4138=(($colour1)|0);
 var $4139=HEAP8[($4138)];
 var $4140=$x;
 var $4141=((($4140)*(3))&-1);
 var $4142=$line;
 var $4143=(($4142+$4141)|0);
 HEAP8[($4143)]=$4139;
 var $4144=(($colour1+1)|0);
 var $4145=HEAP8[($4144)];
 var $4146=$x;
 var $4147=((($4146)*(3))&-1);
 var $4148=((($4147)+(1))|0);
 var $4149=$line;
 var $4150=(($4149+$4148)|0);
 HEAP8[($4150)]=$4145;
 var $4151=(($colour1+2)|0);
 var $4152=HEAP8[($4151)];
 var $4153=$x;
 var $4154=((($4153)*(3))&-1);
 var $4155=((($4154)+(2))|0);
 var $4156=$line;
 var $4157=(($4156+$4155)|0);
 HEAP8[($4157)]=$4152;
 $bicolour=1;
 var $4158=$count;
 var $4159=((($4158)+(1))|0);
 $count=$4159;
 label=311;break;
 case 311: 
 var $4161=$count;
 var $4162=((($4161)-(1))|0);
 $count=$4162;
 var $4163=$x;
 var $4164=((($4163)+(1))|0);
 $x=$4164;
 label=284;break;
 case 312: 
 label=313;break;
 case 313: 
 var $4167=$count;
 var $4168=($4167|0)>0;
 if($4168){label=314;break;}else{var $4174=0;label=315;break;}
 case 314: 
 var $4170=$x;
 var $4171=$3;
 var $4172=($4170|0)<($4171|0);
 var $4174=$4172;label=315;break;
 case 315: 
 var $4174;
 if($4174){label=316;break;}else{label=320;break;}
 case 316: 
 var $4176=$bicolour;
 var $4177=($4176|0)!=0;
 if($4177){label=317;break;}else{label=318;break;}
 case 317: 
 var $4179=(($colour2)|0);
 var $4180=HEAP8[($4179)];
 var $4181=$x;
 var $4182=((($4181)*(3))&-1);
 var $4183=$line;
 var $4184=(($4183+$4182)|0);
 HEAP8[($4184)]=$4180;
 var $4185=(($colour2+1)|0);
 var $4186=HEAP8[($4185)];
 var $4187=$x;
 var $4188=((($4187)*(3))&-1);
 var $4189=((($4188)+(1))|0);
 var $4190=$line;
 var $4191=(($4190+$4189)|0);
 HEAP8[($4191)]=$4186;
 var $4192=(($colour2+2)|0);
 var $4193=HEAP8[($4192)];
 var $4194=$x;
 var $4195=((($4194)*(3))&-1);
 var $4196=((($4195)+(2))|0);
 var $4197=$line;
 var $4198=(($4197+$4196)|0);
 HEAP8[($4198)]=$4193;
 $bicolour=0;
 label=319;break;
 case 318: 
 var $4200=(($colour1)|0);
 var $4201=HEAP8[($4200)];
 var $4202=$x;
 var $4203=((($4202)*(3))&-1);
 var $4204=$line;
 var $4205=(($4204+$4203)|0);
 HEAP8[($4205)]=$4201;
 var $4206=(($colour1+1)|0);
 var $4207=HEAP8[($4206)];
 var $4208=$x;
 var $4209=((($4208)*(3))&-1);
 var $4210=((($4209)+(1))|0);
 var $4211=$line;
 var $4212=(($4211+$4210)|0);
 HEAP8[($4212)]=$4207;
 var $4213=(($colour1+2)|0);
 var $4214=HEAP8[($4213)];
 var $4215=$x;
 var $4216=((($4215)*(3))&-1);
 var $4217=((($4216)+(2))|0);
 var $4218=$line;
 var $4219=(($4218+$4217)|0);
 HEAP8[($4219)]=$4214;
 $bicolour=1;
 var $4220=$count;
 var $4221=((($4220)+(1))|0);
 $count=$4221;
 label=319;break;
 case 319: 
 var $4223=$count;
 var $4224=((($4223)-(1))|0);
 $count=$4224;
 var $4225=$x;
 var $4226=((($4225)+(1))|0);
 $x=$4226;
 label=313;break;
 case 320: 
 label=344;break;
 case 321: 
 label=322;break;
 case 322: 
 var $4230=$count;
 var $4231=$4230&-8;
 var $4232=($4231|0)!=0;
 if($4232){label=323;break;}else{var $4239=0;label=324;break;}
 case 323: 
 var $4234=$x;
 var $4235=((($4234)+(8))|0);
 var $4236=$3;
 var $4237=($4235|0)<($4236|0);
 var $4239=$4237;label=324;break;
 case 324: 
 var $4239;
 if($4239){label=325;break;}else{label=326;break;}
 case 325: 
 var $4241=$x;
 var $4242=((($4241)*(3))&-1);
 var $4243=$line;
 var $4244=(($4243+$4242)|0);
 HEAP8[($4244)]=-1;
 var $4245=$x;
 var $4246=((($4245)*(3))&-1);
 var $4247=((($4246)+(1))|0);
 var $4248=$line;
 var $4249=(($4248+$4247)|0);
 HEAP8[($4249)]=-1;
 var $4250=$x;
 var $4251=((($4250)*(3))&-1);
 var $4252=((($4251)+(2))|0);
 var $4253=$line;
 var $4254=(($4253+$4252)|0);
 HEAP8[($4254)]=-1;
 var $4255=$count;
 var $4256=((($4255)-(1))|0);
 $count=$4256;
 var $4257=$x;
 var $4258=((($4257)+(1))|0);
 $x=$4258;
 var $4259=$x;
 var $4260=((($4259)*(3))&-1);
 var $4261=$line;
 var $4262=(($4261+$4260)|0);
 HEAP8[($4262)]=-1;
 var $4263=$x;
 var $4264=((($4263)*(3))&-1);
 var $4265=((($4264)+(1))|0);
 var $4266=$line;
 var $4267=(($4266+$4265)|0);
 HEAP8[($4267)]=-1;
 var $4268=$x;
 var $4269=((($4268)*(3))&-1);
 var $4270=((($4269)+(2))|0);
 var $4271=$line;
 var $4272=(($4271+$4270)|0);
 HEAP8[($4272)]=-1;
 var $4273=$count;
 var $4274=((($4273)-(1))|0);
 $count=$4274;
 var $4275=$x;
 var $4276=((($4275)+(1))|0);
 $x=$4276;
 var $4277=$x;
 var $4278=((($4277)*(3))&-1);
 var $4279=$line;
 var $4280=(($4279+$4278)|0);
 HEAP8[($4280)]=-1;
 var $4281=$x;
 var $4282=((($4281)*(3))&-1);
 var $4283=((($4282)+(1))|0);
 var $4284=$line;
 var $4285=(($4284+$4283)|0);
 HEAP8[($4285)]=-1;
 var $4286=$x;
 var $4287=((($4286)*(3))&-1);
 var $4288=((($4287)+(2))|0);
 var $4289=$line;
 var $4290=(($4289+$4288)|0);
 HEAP8[($4290)]=-1;
 var $4291=$count;
 var $4292=((($4291)-(1))|0);
 $count=$4292;
 var $4293=$x;
 var $4294=((($4293)+(1))|0);
 $x=$4294;
 var $4295=$x;
 var $4296=((($4295)*(3))&-1);
 var $4297=$line;
 var $4298=(($4297+$4296)|0);
 HEAP8[($4298)]=-1;
 var $4299=$x;
 var $4300=((($4299)*(3))&-1);
 var $4301=((($4300)+(1))|0);
 var $4302=$line;
 var $4303=(($4302+$4301)|0);
 HEAP8[($4303)]=-1;
 var $4304=$x;
 var $4305=((($4304)*(3))&-1);
 var $4306=((($4305)+(2))|0);
 var $4307=$line;
 var $4308=(($4307+$4306)|0);
 HEAP8[($4308)]=-1;
 var $4309=$count;
 var $4310=((($4309)-(1))|0);
 $count=$4310;
 var $4311=$x;
 var $4312=((($4311)+(1))|0);
 $x=$4312;
 var $4313=$x;
 var $4314=((($4313)*(3))&-1);
 var $4315=$line;
 var $4316=(($4315+$4314)|0);
 HEAP8[($4316)]=-1;
 var $4317=$x;
 var $4318=((($4317)*(3))&-1);
 var $4319=((($4318)+(1))|0);
 var $4320=$line;
 var $4321=(($4320+$4319)|0);
 HEAP8[($4321)]=-1;
 var $4322=$x;
 var $4323=((($4322)*(3))&-1);
 var $4324=((($4323)+(2))|0);
 var $4325=$line;
 var $4326=(($4325+$4324)|0);
 HEAP8[($4326)]=-1;
 var $4327=$count;
 var $4328=((($4327)-(1))|0);
 $count=$4328;
 var $4329=$x;
 var $4330=((($4329)+(1))|0);
 $x=$4330;
 var $4331=$x;
 var $4332=((($4331)*(3))&-1);
 var $4333=$line;
 var $4334=(($4333+$4332)|0);
 HEAP8[($4334)]=-1;
 var $4335=$x;
 var $4336=((($4335)*(3))&-1);
 var $4337=((($4336)+(1))|0);
 var $4338=$line;
 var $4339=(($4338+$4337)|0);
 HEAP8[($4339)]=-1;
 var $4340=$x;
 var $4341=((($4340)*(3))&-1);
 var $4342=((($4341)+(2))|0);
 var $4343=$line;
 var $4344=(($4343+$4342)|0);
 HEAP8[($4344)]=-1;
 var $4345=$count;
 var $4346=((($4345)-(1))|0);
 $count=$4346;
 var $4347=$x;
 var $4348=((($4347)+(1))|0);
 $x=$4348;
 var $4349=$x;
 var $4350=((($4349)*(3))&-1);
 var $4351=$line;
 var $4352=(($4351+$4350)|0);
 HEAP8[($4352)]=-1;
 var $4353=$x;
 var $4354=((($4353)*(3))&-1);
 var $4355=((($4354)+(1))|0);
 var $4356=$line;
 var $4357=(($4356+$4355)|0);
 HEAP8[($4357)]=-1;
 var $4358=$x;
 var $4359=((($4358)*(3))&-1);
 var $4360=((($4359)+(2))|0);
 var $4361=$line;
 var $4362=(($4361+$4360)|0);
 HEAP8[($4362)]=-1;
 var $4363=$count;
 var $4364=((($4363)-(1))|0);
 $count=$4364;
 var $4365=$x;
 var $4366=((($4365)+(1))|0);
 $x=$4366;
 var $4367=$x;
 var $4368=((($4367)*(3))&-1);
 var $4369=$line;
 var $4370=(($4369+$4368)|0);
 HEAP8[($4370)]=-1;
 var $4371=$x;
 var $4372=((($4371)*(3))&-1);
 var $4373=((($4372)+(1))|0);
 var $4374=$line;
 var $4375=(($4374+$4373)|0);
 HEAP8[($4375)]=-1;
 var $4376=$x;
 var $4377=((($4376)*(3))&-1);
 var $4378=((($4377)+(2))|0);
 var $4379=$line;
 var $4380=(($4379+$4378)|0);
 HEAP8[($4380)]=-1;
 var $4381=$count;
 var $4382=((($4381)-(1))|0);
 $count=$4382;
 var $4383=$x;
 var $4384=((($4383)+(1))|0);
 $x=$4384;
 label=322;break;
 case 326: 
 label=327;break;
 case 327: 
 var $4387=$count;
 var $4388=($4387|0)>0;
 if($4388){label=328;break;}else{var $4394=0;label=329;break;}
 case 328: 
 var $4390=$x;
 var $4391=$3;
 var $4392=($4390|0)<($4391|0);
 var $4394=$4392;label=329;break;
 case 329: 
 var $4394;
 if($4394){label=330;break;}else{label=331;break;}
 case 330: 
 var $4396=$x;
 var $4397=((($4396)*(3))&-1);
 var $4398=$line;
 var $4399=(($4398+$4397)|0);
 HEAP8[($4399)]=-1;
 var $4400=$x;
 var $4401=((($4400)*(3))&-1);
 var $4402=((($4401)+(1))|0);
 var $4403=$line;
 var $4404=(($4403+$4402)|0);
 HEAP8[($4404)]=-1;
 var $4405=$x;
 var $4406=((($4405)*(3))&-1);
 var $4407=((($4406)+(2))|0);
 var $4408=$line;
 var $4409=(($4408+$4407)|0);
 HEAP8[($4409)]=-1;
 var $4410=$count;
 var $4411=((($4410)-(1))|0);
 $count=$4411;
 var $4412=$x;
 var $4413=((($4412)+(1))|0);
 $x=$4413;
 label=327;break;
 case 331: 
 label=344;break;
 case 332: 
 label=333;break;
 case 333: 
 var $4417=$count;
 var $4418=$4417&-8;
 var $4419=($4418|0)!=0;
 if($4419){label=334;break;}else{var $4426=0;label=335;break;}
 case 334: 
 var $4421=$x;
 var $4422=((($4421)+(8))|0);
 var $4423=$3;
 var $4424=($4422|0)<($4423|0);
 var $4426=$4424;label=335;break;
 case 335: 
 var $4426;
 if($4426){label=336;break;}else{label=337;break;}
 case 336: 
 var $4428=$x;
 var $4429=((($4428)*(3))&-1);
 var $4430=$line;
 var $4431=(($4430+$4429)|0);
 HEAP8[($4431)]=0;
 var $4432=$x;
 var $4433=((($4432)*(3))&-1);
 var $4434=((($4433)+(1))|0);
 var $4435=$line;
 var $4436=(($4435+$4434)|0);
 HEAP8[($4436)]=0;
 var $4437=$x;
 var $4438=((($4437)*(3))&-1);
 var $4439=((($4438)+(2))|0);
 var $4440=$line;
 var $4441=(($4440+$4439)|0);
 HEAP8[($4441)]=0;
 var $4442=$count;
 var $4443=((($4442)-(1))|0);
 $count=$4443;
 var $4444=$x;
 var $4445=((($4444)+(1))|0);
 $x=$4445;
 var $4446=$x;
 var $4447=((($4446)*(3))&-1);
 var $4448=$line;
 var $4449=(($4448+$4447)|0);
 HEAP8[($4449)]=0;
 var $4450=$x;
 var $4451=((($4450)*(3))&-1);
 var $4452=((($4451)+(1))|0);
 var $4453=$line;
 var $4454=(($4453+$4452)|0);
 HEAP8[($4454)]=0;
 var $4455=$x;
 var $4456=((($4455)*(3))&-1);
 var $4457=((($4456)+(2))|0);
 var $4458=$line;
 var $4459=(($4458+$4457)|0);
 HEAP8[($4459)]=0;
 var $4460=$count;
 var $4461=((($4460)-(1))|0);
 $count=$4461;
 var $4462=$x;
 var $4463=((($4462)+(1))|0);
 $x=$4463;
 var $4464=$x;
 var $4465=((($4464)*(3))&-1);
 var $4466=$line;
 var $4467=(($4466+$4465)|0);
 HEAP8[($4467)]=0;
 var $4468=$x;
 var $4469=((($4468)*(3))&-1);
 var $4470=((($4469)+(1))|0);
 var $4471=$line;
 var $4472=(($4471+$4470)|0);
 HEAP8[($4472)]=0;
 var $4473=$x;
 var $4474=((($4473)*(3))&-1);
 var $4475=((($4474)+(2))|0);
 var $4476=$line;
 var $4477=(($4476+$4475)|0);
 HEAP8[($4477)]=0;
 var $4478=$count;
 var $4479=((($4478)-(1))|0);
 $count=$4479;
 var $4480=$x;
 var $4481=((($4480)+(1))|0);
 $x=$4481;
 var $4482=$x;
 var $4483=((($4482)*(3))&-1);
 var $4484=$line;
 var $4485=(($4484+$4483)|0);
 HEAP8[($4485)]=0;
 var $4486=$x;
 var $4487=((($4486)*(3))&-1);
 var $4488=((($4487)+(1))|0);
 var $4489=$line;
 var $4490=(($4489+$4488)|0);
 HEAP8[($4490)]=0;
 var $4491=$x;
 var $4492=((($4491)*(3))&-1);
 var $4493=((($4492)+(2))|0);
 var $4494=$line;
 var $4495=(($4494+$4493)|0);
 HEAP8[($4495)]=0;
 var $4496=$count;
 var $4497=((($4496)-(1))|0);
 $count=$4497;
 var $4498=$x;
 var $4499=((($4498)+(1))|0);
 $x=$4499;
 var $4500=$x;
 var $4501=((($4500)*(3))&-1);
 var $4502=$line;
 var $4503=(($4502+$4501)|0);
 HEAP8[($4503)]=0;
 var $4504=$x;
 var $4505=((($4504)*(3))&-1);
 var $4506=((($4505)+(1))|0);
 var $4507=$line;
 var $4508=(($4507+$4506)|0);
 HEAP8[($4508)]=0;
 var $4509=$x;
 var $4510=((($4509)*(3))&-1);
 var $4511=((($4510)+(2))|0);
 var $4512=$line;
 var $4513=(($4512+$4511)|0);
 HEAP8[($4513)]=0;
 var $4514=$count;
 var $4515=((($4514)-(1))|0);
 $count=$4515;
 var $4516=$x;
 var $4517=((($4516)+(1))|0);
 $x=$4517;
 var $4518=$x;
 var $4519=((($4518)*(3))&-1);
 var $4520=$line;
 var $4521=(($4520+$4519)|0);
 HEAP8[($4521)]=0;
 var $4522=$x;
 var $4523=((($4522)*(3))&-1);
 var $4524=((($4523)+(1))|0);
 var $4525=$line;
 var $4526=(($4525+$4524)|0);
 HEAP8[($4526)]=0;
 var $4527=$x;
 var $4528=((($4527)*(3))&-1);
 var $4529=((($4528)+(2))|0);
 var $4530=$line;
 var $4531=(($4530+$4529)|0);
 HEAP8[($4531)]=0;
 var $4532=$count;
 var $4533=((($4532)-(1))|0);
 $count=$4533;
 var $4534=$x;
 var $4535=((($4534)+(1))|0);
 $x=$4535;
 var $4536=$x;
 var $4537=((($4536)*(3))&-1);
 var $4538=$line;
 var $4539=(($4538+$4537)|0);
 HEAP8[($4539)]=0;
 var $4540=$x;
 var $4541=((($4540)*(3))&-1);
 var $4542=((($4541)+(1))|0);
 var $4543=$line;
 var $4544=(($4543+$4542)|0);
 HEAP8[($4544)]=0;
 var $4545=$x;
 var $4546=((($4545)*(3))&-1);
 var $4547=((($4546)+(2))|0);
 var $4548=$line;
 var $4549=(($4548+$4547)|0);
 HEAP8[($4549)]=0;
 var $4550=$count;
 var $4551=((($4550)-(1))|0);
 $count=$4551;
 var $4552=$x;
 var $4553=((($4552)+(1))|0);
 $x=$4553;
 var $4554=$x;
 var $4555=((($4554)*(3))&-1);
 var $4556=$line;
 var $4557=(($4556+$4555)|0);
 HEAP8[($4557)]=0;
 var $4558=$x;
 var $4559=((($4558)*(3))&-1);
 var $4560=((($4559)+(1))|0);
 var $4561=$line;
 var $4562=(($4561+$4560)|0);
 HEAP8[($4562)]=0;
 var $4563=$x;
 var $4564=((($4563)*(3))&-1);
 var $4565=((($4564)+(2))|0);
 var $4566=$line;
 var $4567=(($4566+$4565)|0);
 HEAP8[($4567)]=0;
 var $4568=$count;
 var $4569=((($4568)-(1))|0);
 $count=$4569;
 var $4570=$x;
 var $4571=((($4570)+(1))|0);
 $x=$4571;
 label=333;break;
 case 337: 
 label=338;break;
 case 338: 
 var $4574=$count;
 var $4575=($4574|0)>0;
 if($4575){label=339;break;}else{var $4581=0;label=340;break;}
 case 339: 
 var $4577=$x;
 var $4578=$3;
 var $4579=($4577|0)<($4578|0);
 var $4581=$4579;label=340;break;
 case 340: 
 var $4581;
 if($4581){label=341;break;}else{label=342;break;}
 case 341: 
 var $4583=$x;
 var $4584=((($4583)*(3))&-1);
 var $4585=$line;
 var $4586=(($4585+$4584)|0);
 HEAP8[($4586)]=0;
 var $4587=$x;
 var $4588=((($4587)*(3))&-1);
 var $4589=((($4588)+(1))|0);
 var $4590=$line;
 var $4591=(($4590+$4589)|0);
 HEAP8[($4591)]=0;
 var $4592=$x;
 var $4593=((($4592)*(3))&-1);
 var $4594=((($4593)+(2))|0);
 var $4595=$line;
 var $4596=(($4595+$4594)|0);
 HEAP8[($4596)]=0;
 var $4597=$count;
 var $4598=((($4597)-(1))|0);
 $count=$4598;
 var $4599=$x;
 var $4600=((($4599)+(1))|0);
 $x=$4600;
 label=338;break;
 case 342: 
 label=344;break;
 case 343: 
 $1=0;
 label=347;break;
 case 344: 
 label=34;break;
 case 345: 
 label=2;break;
 case 346: 
 $1=1;
 label=347;break;
 case 347: 
 var $4607=$1;
 STACKTOP=sp;return $4607;
  default: assert(0, "bad label: " + label);
 }

}
Module["_bitmap_decompress3"] = _bitmap_decompress3;

function _bitmap_decompress4($output,$width,$height,$input,$size){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $code;
 var $bytes_pro;
 var $total_pro;
 $2=$output;
 $3=$width;
 $4=$height;
 $5=$input;
 $6=$size;
 var $7=$5;
 var $8=(($7+1)|0);
 $5=$8;
 var $9=HEAP8[($7)];
 var $10=($9&255);
 $code=$10;
 var $11=$code;
 var $12=($11|0)!=16;
 if($12){label=2;break;}else{label=3;break;}
 case 2: 
 $1=0;
 label=4;break;
 case 3: 
 $total_pro=1;
 var $15=$5;
 var $16=$3;
 var $17=$4;
 var $18=$2;
 var $19=(($18+3)|0);
 var $20=$6;
 var $21=$total_pro;
 var $22=((($20)-($21))|0);
 var $23=_process_plane($15,$16,$17,$19,$22);
 $bytes_pro=$23;
 var $24=$bytes_pro;
 var $25=$total_pro;
 var $26=((($25)+($24))|0);
 $total_pro=$26;
 var $27=$bytes_pro;
 var $28=$5;
 var $29=(($28+$27)|0);
 $5=$29;
 var $30=$5;
 var $31=$3;
 var $32=$4;
 var $33=$2;
 var $34=(($33+2)|0);
 var $35=$6;
 var $36=$total_pro;
 var $37=((($35)-($36))|0);
 var $38=_process_plane($30,$31,$32,$34,$37);
 $bytes_pro=$38;
 var $39=$bytes_pro;
 var $40=$total_pro;
 var $41=((($40)+($39))|0);
 $total_pro=$41;
 var $42=$bytes_pro;
 var $43=$5;
 var $44=(($43+$42)|0);
 $5=$44;
 var $45=$5;
 var $46=$3;
 var $47=$4;
 var $48=$2;
 var $49=(($48+1)|0);
 var $50=$6;
 var $51=$total_pro;
 var $52=((($50)-($51))|0);
 var $53=_process_plane($45,$46,$47,$49,$52);
 $bytes_pro=$53;
 var $54=$bytes_pro;
 var $55=$total_pro;
 var $56=((($55)+($54))|0);
 $total_pro=$56;
 var $57=$bytes_pro;
 var $58=$5;
 var $59=(($58+$57)|0);
 $5=$59;
 var $60=$5;
 var $61=$3;
 var $62=$4;
 var $63=$2;
 var $64=(($63)|0);
 var $65=$6;
 var $66=$total_pro;
 var $67=((($65)-($66))|0);
 var $68=_process_plane($60,$61,$62,$64,$67);
 $bytes_pro=$68;
 var $69=$bytes_pro;
 var $70=$total_pro;
 var $71=((($70)+($69))|0);
 $total_pro=$71;
 var $72=$6;
 var $73=$total_pro;
 var $74=($72|0)==($73|0);
 var $75=($74&1);
 $1=$75;
 label=4;break;
 case 4: 
 var $77=$1;
 STACKTOP=sp;return $77;
  default: assert(0, "bad label: " + label);
 }

}
Module["_bitmap_decompress4"] = _bitmap_decompress4;

function _process_plane($in,$width,$height,$out,$size){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $indexw;
 var $indexh;
 var $code;
 var $collen;
 var $replen;
 var $color;
 var $x;
 var $revcode;
 var $last_line;
 var $this_line;
 var $org_in;
 var $org_out;
 $1=$in;
 $2=$width;
 $3=$height;
 $4=$out;
 $5=$size;
 var $6=$1;
 $org_in=$6;
 var $7=$4;
 $org_out=$7;
 $last_line=0;
 $indexh=0;
 label=2;break;
 case 2: 
 var $9=$indexh;
 var $10=$3;
 var $11=($9|0)<($10|0);
 if($11){label=3;break;}else{label=34;break;}
 case 3: 
 var $13=$org_out;
 var $14=$2;
 var $15=$3;
 var $16=(Math_imul($14,$15)|0);
 var $17=($16<<2);
 var $18=(($13+$17)|0);
 var $19=$indexh;
 var $20=((($19)+(1))|0);
 var $21=$2;
 var $22=(Math_imul($20,$21)|0);
 var $23=($22<<2);
 var $24=(((-$23))|0);
 var $25=(($18+$24)|0);
 $4=$25;
 $color=0;
 var $26=$4;
 $this_line=$26;
 $indexw=0;
 var $27=$last_line;
 var $28=($27|0)==0;
 if($28){label=4;break;}else{label=17;break;}
 case 4: 
 label=5;break;
 case 5: 
 var $31=$indexw;
 var $32=$2;
 var $33=($31|0)<($32|0);
 if($33){label=6;break;}else{label=16;break;}
 case 6: 
 var $35=$1;
 var $36=(($35+1)|0);
 $1=$36;
 var $37=HEAP8[($35)];
 var $38=($37&255);
 $code=$38;
 var $39=$code;
 var $40=$39&15;
 $replen=$40;
 var $41=$code;
 var $42=$41>>4;
 var $43=$42&15;
 $collen=$43;
 var $44=$replen;
 var $45=$44<<4;
 var $46=$collen;
 var $47=$45|$46;
 $revcode=$47;
 var $48=$revcode;
 var $49=($48|0)<=47;
 if($49){label=7;break;}else{label=9;break;}
 case 7: 
 var $51=$revcode;
 var $52=($51|0)>=16;
 if($52){label=8;break;}else{label=9;break;}
 case 8: 
 var $54=$revcode;
 $replen=$54;
 $collen=0;
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 var $57=$collen;
 var $58=($57|0)>0;
 if($58){label=11;break;}else{label=12;break;}
 case 11: 
 var $60=$1;
 var $61=(($60+1)|0);
 $1=$61;
 var $62=HEAP8[($60)];
 var $63=($62&255);
 $color=$63;
 var $64=$color;
 var $65=(($64)&255);
 var $66=$4;
 HEAP8[($66)]=$65;
 var $67=$4;
 var $68=(($67+4)|0);
 $4=$68;
 var $69=$indexw;
 var $70=((($69)+(1))|0);
 $indexw=$70;
 var $71=$collen;
 var $72=((($71)-(1))|0);
 $collen=$72;
 label=10;break;
 case 12: 
 label=13;break;
 case 13: 
 var $75=$replen;
 var $76=($75|0)>0;
 if($76){label=14;break;}else{label=15;break;}
 case 14: 
 var $78=$color;
 var $79=(($78)&255);
 var $80=$4;
 HEAP8[($80)]=$79;
 var $81=$4;
 var $82=(($81+4)|0);
 $4=$82;
 var $83=$indexw;
 var $84=((($83)+(1))|0);
 $indexw=$84;
 var $85=$replen;
 var $86=((($85)-(1))|0);
 $replen=$86;
 label=13;break;
 case 15: 
 label=5;break;
 case 16: 
 label=33;break;
 case 17: 
 label=18;break;
 case 18: 
 var $91=$indexw;
 var $92=$2;
 var $93=($91|0)<($92|0);
 if($93){label=19;break;}else{label=32;break;}
 case 19: 
 var $95=$1;
 var $96=(($95+1)|0);
 $1=$96;
 var $97=HEAP8[($95)];
 var $98=($97&255);
 $code=$98;
 var $99=$code;
 var $100=$99&15;
 $replen=$100;
 var $101=$code;
 var $102=$101>>4;
 var $103=$102&15;
 $collen=$103;
 var $104=$replen;
 var $105=$104<<4;
 var $106=$collen;
 var $107=$105|$106;
 $revcode=$107;
 var $108=$revcode;
 var $109=($108|0)<=47;
 if($109){label=20;break;}else{label=22;break;}
 case 20: 
 var $111=$revcode;
 var $112=($111|0)>=16;
 if($112){label=21;break;}else{label=22;break;}
 case 21: 
 var $114=$revcode;
 $replen=$114;
 $collen=0;
 label=22;break;
 case 22: 
 label=23;break;
 case 23: 
 var $117=$collen;
 var $118=($117|0)>0;
 if($118){label=24;break;}else{label=28;break;}
 case 24: 
 var $120=$1;
 var $121=(($120+1)|0);
 $1=$121;
 var $122=HEAP8[($120)];
 var $123=($122&255);
 $x=$123;
 var $124=$x;
 var $125=$124&1;
 var $126=($125|0)!=0;
 if($126){label=25;break;}else{label=26;break;}
 case 25: 
 var $128=$x;
 var $129=$128>>1;
 $x=$129;
 var $130=$x;
 var $131=((($130)+(1))|0);
 $x=$131;
 var $132=$x;
 var $133=(((-$132))|0);
 $color=$133;
 label=27;break;
 case 26: 
 var $135=$x;
 var $136=$135>>1;
 $x=$136;
 var $137=$x;
 $color=$137;
 label=27;break;
 case 27: 
 var $139=$indexw;
 var $140=($139<<2);
 var $141=$last_line;
 var $142=(($141+$140)|0);
 var $143=HEAP8[($142)];
 var $144=($143&255);
 var $145=$color;
 var $146=((($144)+($145))|0);
 $x=$146;
 var $147=$x;
 var $148=(($147)&255);
 var $149=$4;
 HEAP8[($149)]=$148;
 var $150=$4;
 var $151=(($150+4)|0);
 $4=$151;
 var $152=$indexw;
 var $153=((($152)+(1))|0);
 $indexw=$153;
 var $154=$collen;
 var $155=((($154)-(1))|0);
 $collen=$155;
 label=23;break;
 case 28: 
 label=29;break;
 case 29: 
 var $158=$replen;
 var $159=($158|0)>0;
 if($159){label=30;break;}else{label=31;break;}
 case 30: 
 var $161=$indexw;
 var $162=($161<<2);
 var $163=$last_line;
 var $164=(($163+$162)|0);
 var $165=HEAP8[($164)];
 var $166=($165&255);
 var $167=$color;
 var $168=((($166)+($167))|0);
 $x=$168;
 var $169=$x;
 var $170=(($169)&255);
 var $171=$4;
 HEAP8[($171)]=$170;
 var $172=$4;
 var $173=(($172+4)|0);
 $4=$173;
 var $174=$indexw;
 var $175=((($174)+(1))|0);
 $indexw=$175;
 var $176=$replen;
 var $177=((($176)-(1))|0);
 $replen=$177;
 label=29;break;
 case 31: 
 label=18;break;
 case 32: 
 label=33;break;
 case 33: 
 var $181=$indexh;
 var $182=((($181)+(1))|0);
 $indexh=$182;
 var $183=$this_line;
 $last_line=$183;
 label=2;break;
 case 34: 
 var $185=$1;
 var $186=$org_in;
 var $187=$185;
 var $188=$186;
 var $189=((($187)-($188))|0);
 STACKTOP=sp;return $189;
  default: assert(0, "bad label: " + label);
 }

}
Module["_process_plane"] = _process_plane;


// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}