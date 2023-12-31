// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../src/import/v8cpuFormatter.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chromeTreeToNodes = chromeTreeToNodes;

function treeToArray(root) {
  const nodes = [];

  function visit(node) {
    nodes.push({
      id: node.id,
      callFrame: {
        columnNumber: 0,
        functionName: node.functionName,
        lineNumber: node.lineNumber,
        scriptId: node.scriptId,
        url: node.url
      },
      hitCount: node.hitCount,
      children: node.children.map(child => child.id)
    });
    node.children.forEach(visit);
  }

  visit(root);
  return nodes;
}

function timestampsToDeltas(timestamps, startTime) {
  return timestamps.map((timestamp, index) => {
    const lastTimestamp = index === 0 ? startTime * 1000000 : timestamps[index - 1];
    return timestamp - lastTimestamp;
  });
}
/**
 * Convert the old tree-based format to the new flat-array based format
 */


function chromeTreeToNodes(content) {
  // Note that both startTime and endTime are now in microseconds
  return {
    samples: content.samples,
    startTime: content.startTime * 1000000,
    endTime: content.endTime * 1000000,
    nodes: treeToArray(content.head),
    timeDeltas: timestampsToDeltas(content.timestamps, content.startTime)
  };
}
},{}],"../src/import/chrome.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isChromeTimeline = isChromeTimeline;
exports.isChromeTimelineObject = isChromeTimelineObject;
exports.importFromChromeTimeline = importFromChromeTimeline;
exports.importFromChromeCPUProfile = importFromChromeCPUProfile;
exports.importFromOldV8CPUProfile = importFromOldV8CPUProfile;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

var _v8cpuFormatter = require("./v8cpuFormatter");

function isChromeTimeline(rawProfile) {
  if (!Array.isArray(rawProfile)) return false;
  if (rawProfile.length < 1) return false;
  const first = rawProfile[0];
  if (!('pid' in first && 'tid' in first && 'ph' in first && 'cat' in first)) return false;
  if (!rawProfile.find(e => e.name === 'CpuProfile' || e.name === 'Profile' || e.name === 'ProfileChunk')) return false;
  return true;
}

function isChromeTimelineObject(rawProfile) {
  // Starting with Chrome 114, the timeline format output by devtools is an object
  if (!('traceEvents' in rawProfile)) return false;
  return isChromeTimeline(rawProfile.traceEvents);
}

function importFromChromeTimeline(events, fileName) {
  // It seems like sometimes Chrome timeline files contain multiple CpuProfiles?
  // For now, choose the first one in the list.
  const cpuProfileByID = new Map(); // Maps profile IDs (like "0x3") to pid/tid pairs formatted as `${pid}:${tid}`

  const pidTidById = new Map(); // Maps pid/tid pairs to thread names

  const threadNameByPidTid = new Map(); // The events aren't necessarily recorded in chronological order. Sort them so
  // that they are.

  (0, _utils.sortBy)(events, e => e.ts);

  for (let event of events) {
    if (event.name === 'CpuProfile') {
      const pidTid = `${event.pid}:${event.tid}`;
      const id = event.id || pidTid;
      cpuProfileByID.set(id, event.args.data.cpuProfile);
      pidTidById.set(id, pidTid);
    }

    if (event.name === 'Profile') {
      const pidTid = `${event.pid}:${event.tid}`;
      cpuProfileByID.set(event.id || pidTid, Object.assign({
        startTime: 0,
        endTime: 0,
        nodes: [],
        samples: [],
        timeDeltas: []
      }, event.args.data));

      if (event.id) {
        pidTidById.set(event.id, `${event.pid}:${event.tid}`);
      }
    }

    if (event.name === 'thread_name') {
      threadNameByPidTid.set(`${event.pid}:${event.tid}`, event.args.name);
    }

    if (event.name === 'ProfileChunk') {
      const pidTid = `${event.pid}:${event.tid}`;
      const cpuProfile = cpuProfileByID.get(event.id || pidTid);

      if (cpuProfile) {
        const chunk = event.args.data;

        if (chunk.cpuProfile) {
          if (chunk.cpuProfile.nodes) {
            cpuProfile.nodes = cpuProfile.nodes.concat(chunk.cpuProfile.nodes);
          }

          if (chunk.cpuProfile.samples) {
            cpuProfile.samples = cpuProfile.samples.concat(chunk.cpuProfile.samples);
          }
        }

        if (chunk.timeDeltas) {
          cpuProfile.timeDeltas = cpuProfile.timeDeltas.concat(chunk.timeDeltas);
        }

        if (chunk.startTime != null) {
          cpuProfile.startTime = chunk.startTime;
        }

        if (chunk.endTime != null) {
          cpuProfile.endTime = chunk.endTime;
        }
      } else {
        console.warn(`Ignoring ProfileChunk for undeclared Profile with id ${event.id || pidTid}`);
      }
    }
  }

  if (cpuProfileByID.size > 0) {
    const profiles = [];
    let indexToView = 0;
    (0, _utils.itForEach)(cpuProfileByID.keys(), profileId => {
      let threadName = null;
      let pidTid = pidTidById.get(profileId);

      if (pidTid) {
        threadName = threadNameByPidTid.get(pidTid) || null;

        if (threadName) {}
      }

      const profile = importFromChromeCPUProfile(cpuProfileByID.get(profileId));

      if (threadName && cpuProfileByID.size > 1) {
        profile.setName(`${fileName} - ${threadName}`);

        if (threadName === 'CrRendererMain') {
          indexToView = profiles.length;
        }
      } else {
        profile.setName(`${fileName}`);
      }

      profiles.push(profile);
    });
    return {
      name: fileName,
      indexToView,
      profiles
    };
  } else {
    throw new Error('Could not find CPU profile in Timeline');
  }
}

const callFrameToFrameInfo = new Map();

function frameInfoForCallFrame(callFrame) {
  return (0, _utils.getOrInsert)(callFrameToFrameInfo, callFrame, callFrame => {
    const file = callFrame.url; // In Chrome profiles, line numbers & column numbers are both 0-indexed.
    //
    // We're going to normalize these to be 1-based to avoid needing to normalize
    // these at the presentation layer.

    let line = callFrame.lineNumber;
    if (line != null) line++;
    let col = callFrame.columnNumber;
    if (col != null) col++;
    const name = callFrame.functionName || (file ? `(anonymous ${file.split('/').pop()}:${line})` : '(anonymous)');
    return {
      key: `${name}:${file}:${line}:${col}`,
      name,
      file,
      line,
      col
    };
  });
}

function shouldIgnoreFunction(callFrame) {
  const {
    functionName,
    url
  } = callFrame;

  if (url === 'native dummy.js') {
    // I'm not really sure what this is about, but this seems to be used
    // as a way of avoiding edge cases in V8's implementation.
    // See: https://github.com/v8/v8/blob/b8626ca4/tools/js2c.py#L419-L424
    return true;
  }

  return functionName === '(root)' || functionName === '(idle)';
}

function shouldPlaceOnTopOfPreviousStack(functionName) {
  return functionName === '(garbage collector)' || functionName === '(program)';
}

function importFromChromeCPUProfile(chromeProfile) {
  const profile = new _profile.CallTreeProfileBuilder(chromeProfile.endTime - chromeProfile.startTime);
  const nodeById = new Map();

  for (let node of chromeProfile.nodes) {
    nodeById.set(node.id, node);
  }

  for (let node of chromeProfile.nodes) {
    if (typeof node.parent === 'number') {
      node.parent = nodeById.get(node.parent);
    }

    if (!node.children) continue;

    for (let childId of node.children) {
      const child = nodeById.get(childId);
      if (!child) continue;
      child.parent = node;
    }
  }

  const samples = [];
  const sampleTimes = []; // The first delta is relative to the profile startTime.
  // Ref: https://github.com/v8/v8/blob/44bd8fd7/src/inspector/js_protocol.json#L1485

  let elapsed = chromeProfile.timeDeltas[0]; // Prevents negative time deltas from causing bad data. See
  // https://github.com/jlfwong/speedscope/pull/305 for details.

  let lastValidElapsed = elapsed;
  let lastNodeId = NaN; // The chrome CPU profile format doesn't collapse identical samples. We'll do that
  // here to save a ton of work later doing mergers.

  for (let i = 0; i < chromeProfile.samples.length; i++) {
    const nodeId = chromeProfile.samples[i];

    if (nodeId != lastNodeId) {
      samples.push(nodeId);

      if (elapsed < lastValidElapsed) {
        sampleTimes.push(lastValidElapsed);
      } else {
        sampleTimes.push(elapsed);
        lastValidElapsed = elapsed;
      }
    }

    if (i === chromeProfile.samples.length - 1) {
      if (!isNaN(lastNodeId)) {
        samples.push(lastNodeId);

        if (elapsed < lastValidElapsed) {
          sampleTimes.push(lastValidElapsed);
        } else {
          sampleTimes.push(elapsed);
          lastValidElapsed = elapsed;
        }
      }
    } else {
      const timeDelta = chromeProfile.timeDeltas[i + 1];
      elapsed += timeDelta;
      lastNodeId = nodeId;
    }
  }

  let prevStack = [];

  for (let i = 0; i < samples.length; i++) {
    const value = sampleTimes[i];
    const nodeId = samples[i];
    let stackTop = nodeById.get(nodeId);
    if (!stackTop) continue; // Find lowest common ancestor of the current stack and the previous one

    let lca = null; // This is O(n^2), but n should be relatively small here (stack height),
    // so hopefully this isn't much of a problem

    for (lca = stackTop; lca && prevStack.indexOf(lca) === -1; lca = shouldPlaceOnTopOfPreviousStack(lca.callFrame.functionName) ? (0, _utils.lastOf)(prevStack) : lca.parent || null) {} // Close frames that are no longer open


    while (prevStack.length > 0 && (0, _utils.lastOf)(prevStack) != lca) {
      const closingNode = prevStack.pop();
      const frame = frameInfoForCallFrame(closingNode.callFrame);
      profile.leaveFrame(frame, value);
    } // Open frames that are now becoming open


    const toOpen = [];

    for (let node = stackTop; node && node != lca && !shouldIgnoreFunction(node.callFrame); // Place Chrome internal functions on top of the previous call stack
    node = shouldPlaceOnTopOfPreviousStack(node.callFrame.functionName) ? (0, _utils.lastOf)(prevStack) : node.parent || null) {
      toOpen.push(node);
    }

    toOpen.reverse();

    for (let node of toOpen) {
      profile.enterFrame(frameInfoForCallFrame(node.callFrame), value);
    }

    prevStack = prevStack.concat(toOpen);
  } // Close frames that are open at the end of the trace


  for (let i = prevStack.length - 1; i >= 0; i--) {
    profile.leaveFrame(frameInfoForCallFrame(prevStack[i].callFrame), (0, _utils.lastOf)(sampleTimes));
  }

  profile.setValueFormatter(new _valueFormatters.TimeFormatter('microseconds'));
  return profile.build();
}

function importFromOldV8CPUProfile(content) {
  return importFromChromeCPUProfile((0, _v8cpuFormatter.chromeTreeToNodes)(content));
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts","./v8cpuFormatter":"../src/import/v8cpuFormatter.ts"}],"../src/import/stackprof.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromStackprof = importFromStackprof;

var _profile = require("../lib/profile");

var _valueFormatters = require("../lib/value-formatters");

// https://github.com/tmm1/stackprof
function importFromStackprof(stackprofProfile) {
  const {
    frames,
    mode,
    raw,
    raw_timestamp_deltas,
    interval
  } = stackprofProfile;
  const profile = new _profile.StackListProfileBuilder();
  profile.setValueFormatter(new _valueFormatters.TimeFormatter('microseconds')); // default to time format unless we're in object mode

  let sampleIndex = 0;
  let prevStack = [];

  for (let i = 0; i < raw.length;) {
    const stackHeight = raw[i++];
    let stack = [];

    for (let j = 0; j < stackHeight; j++) {
      const id = raw[i++];
      let frameName = frames[id].name;

      if (frameName == null) {
        frameName = '(unknown)';
      }

      const frame = Object.assign(Object.assign({
        key: id
      }, frames[id]), {
        name: frameName
      });
      stack.push(frame);
    }

    if (stack.length === 1 && stack[0].name === '(garbage collection)') {
      stack = prevStack.concat(stack);
    }

    const nSamples = raw[i++];

    switch (mode) {
      case 'object':
        profile.appendSampleWithWeight(stack, nSamples);
        profile.setValueFormatter(new _valueFormatters.RawValueFormatter());
        break;

      case 'cpu':
        profile.appendSampleWithWeight(stack, nSamples * interval);
        break;

      default:
        let sampleDuration = 0;

        for (let j = 0; j < nSamples; j++) {
          sampleDuration += raw_timestamp_deltas[sampleIndex++];
        }

        profile.appendSampleWithWeight(stack, sampleDuration);
    }

    prevStack = stack;
  }

  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../node_modules/pako/lib/utils/common.js":[function(require,module,exports) {
'use strict';


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);

},{}],"../node_modules/pako/lib/zlib/trees.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = require('../utils/common');

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


var static_l_desc;
var static_d_desc;
var static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;

},{"../utils/common":"../node_modules/pako/lib/utils/common.js"}],"../node_modules/pako/lib/zlib/adler32.js":[function(require,module,exports) {
'use strict';

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;

},{}],"../node_modules/pako/lib/zlib/crc32.js":[function(require,module,exports) {
'use strict';

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;

},{}],"../node_modules/pako/lib/zlib/messages.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

},{}],"../node_modules/pako/lib/zlib/deflate.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils   = require('../utils/common');
var trees   = require('./trees');
var adler32 = require('./adler32');
var crc32   = require('./crc32');
var msg     = require('./messages');

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only(s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new utils.Buf8(s.w_size);
    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}


exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/

},{"../utils/common":"../node_modules/pako/lib/utils/common.js","./trees":"../node_modules/pako/lib/zlib/trees.js","./adler32":"../node_modules/pako/lib/zlib/adler32.js","./crc32":"../node_modules/pako/lib/zlib/crc32.js","./messages":"../node_modules/pako/lib/zlib/messages.js"}],"../node_modules/pako/lib/utils/strings.js":[function(require,module,exports) {
// String encode/decode helpers
'use strict';


var utils = require('./common');


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for (var i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
exports.buf2binstring = function (buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
exports.binstring2buf = function (str) {
  var buf = new utils.Buf8(str.length);
  for (var i = 0, len = buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function (buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

},{"./common":"../node_modules/pako/lib/utils/common.js"}],"../node_modules/pako/lib/zlib/zstream.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;

},{}],"../node_modules/pako/lib/deflate.js":[function(require,module,exports) {
'use strict';


var zlib_deflate = require('./zlib/deflate');
var utils        = require('./utils/common');
var strings      = require('./utils/strings');
var msg          = require('./zlib/messages');
var ZStream      = require('./zlib/zstream');

var toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH      = 0;
var Z_FINISH        = 4;

var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_SYNC_FLUSH    = 2;

var Z_DEFAULT_COMPRESSION = -1;

var Z_DEFAULT_STRATEGY    = 0;

var Z_DEFLATED  = 8;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you
 * push a chunk with explicit flush (call [[Deflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate(options) {
  if (!(this instanceof Deflate)) return new Deflate(options);

  this.options = utils.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new ZStream();
  this.strm.avail_out = 0;

  var status = zlib_deflate.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK) {
    throw new Error(msg[status]);
  }

  if (opt.header) {
    zlib_deflate.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    var dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = zlib_deflate.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK) {
      throw new Error(msg[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the compression context.
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) { return false; }

  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */

    if (status !== Z_STREAM_END && status !== Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH) {
    status = zlib_deflate.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === Z_SYNC_FLUSH) {
    this.onEnd(Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || msg[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate(input, options);
}


exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;

},{"./zlib/deflate":"../node_modules/pako/lib/zlib/deflate.js","./utils/common":"../node_modules/pako/lib/utils/common.js","./utils/strings":"../node_modules/pako/lib/utils/strings.js","./zlib/messages":"../node_modules/pako/lib/zlib/messages.js","./zlib/zstream":"../node_modules/pako/lib/zlib/zstream.js"}],"../node_modules/pako/lib/zlib/inffast.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

},{}],"../node_modules/pako/lib/zlib/inftrees.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = require('../utils/common');

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

},{"../utils/common":"../node_modules/pako/lib/utils/common.js"}],"../node_modules/pako/lib/zlib/inflate.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils         = require('../utils/common');
var adler32       = require('./adler32');
var crc32         = require('./crc32');
var inflate_fast  = require('./inffast');
var inflate_table = require('./inftrees');

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              utils.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          utils.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inflate_fast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/

},{"../utils/common":"../node_modules/pako/lib/utils/common.js","./adler32":"../node_modules/pako/lib/zlib/adler32.js","./crc32":"../node_modules/pako/lib/zlib/crc32.js","./inffast":"../node_modules/pako/lib/zlib/inffast.js","./inftrees":"../node_modules/pako/lib/zlib/inftrees.js"}],"../node_modules/pako/lib/zlib/constants.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

},{}],"../node_modules/pako/lib/zlib/gzheader.js":[function(require,module,exports) {
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

module.exports = GZheader;

},{}],"../node_modules/pako/lib/inflate.js":[function(require,module,exports) {
'use strict';


var zlib_inflate = require('./zlib/inflate');
var utils        = require('./utils/common');
var strings      = require('./utils/strings');
var c            = require('./zlib/constants');
var msg          = require('./zlib/messages');
var ZStream      = require('./zlib/zstream');
var GZheader     = require('./zlib/gzheader');

var toString = Object.prototype.toString;

/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
 * push a chunk with explicit flush (call [[Inflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate(options) {
  if (!(this instanceof Inflate)) return new Inflate(options);

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new ZStream();
  this.strm.avail_out = 0;

  var status  = zlib_inflate.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new GZheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);
}

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the decompression context.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var dictionary = this.options.dictionary;
  var status, _mode;
  var next_out_utf8, tail, utf8str;
  var dict;

  // Flag to properly process Z_BUF_ERROR on testing inflate call
  // when we check that all output data was flushed.
  var allowBufError = false;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

    if (status === c.Z_NEED_DICT && dictionary) {
      // Convert data if needed
      if (typeof dictionary === 'string') {
        dict = strings.string2buf(dictionary);
      } else if (toString.call(dictionary) === '[object ArrayBuffer]') {
        dict = new Uint8Array(dictionary);
      } else {
        dict = dictionary;
      }

      status = zlib_inflate.inflateSetDictionary(this.strm, dict);

    }

    if (status === c.Z_BUF_ERROR && allowBufError === true) {
      status = c.Z_OK;
      allowBufError = false;
    }

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }

    // When no more input data, we should check that internal inflate buffers
    // are flushed. The only way to do it when avail_out = 0 - run one more
    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
    // Here we set flag to process this error properly.
    //
    // NOTE. Deflate does not return error in this case and does not needs such
    // logic.
    if (strm.avail_in === 0 && strm.avail_out === 0) {
      allowBufError = true;
    }

  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }

  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === c.Z_SYNC_FLUSH) {
    this.onEnd(c.Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 aligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg || msg[inflator.err]; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;

},{"./zlib/inflate":"../node_modules/pako/lib/zlib/inflate.js","./utils/common":"../node_modules/pako/lib/utils/common.js","./utils/strings":"../node_modules/pako/lib/utils/strings.js","./zlib/constants":"../node_modules/pako/lib/zlib/constants.js","./zlib/messages":"../node_modules/pako/lib/zlib/messages.js","./zlib/zstream":"../node_modules/pako/lib/zlib/zstream.js","./zlib/gzheader":"../node_modules/pako/lib/zlib/gzheader.js"}],"../node_modules/pako/index.js":[function(require,module,exports) {
// Top level file is just a mixin of submodules & constants
'use strict';

var assign    = require('./lib/utils/common').assign;

var deflate   = require('./lib/deflate');
var inflate   = require('./lib/inflate');
var constants = require('./lib/zlib/constants');

var pako = {};

assign(pako, deflate, inflate, constants);

module.exports = pako;

},{"./lib/utils/common":"../node_modules/pako/lib/utils/common.js","./lib/deflate":"../node_modules/pako/lib/deflate.js","./lib/inflate":"../node_modules/pako/lib/inflate.js","./lib/zlib/constants":"../node_modules/pako/lib/zlib/constants.js"}],"../node_modules/uint8array-json-parser/uint8array-json-parser.js":[function(require,module,exports) {
!function (exports) {
    var fromCharCode = String.fromCharCode;
    function throwSyntaxError(bytes, index, message) {
        var c = bytes[index];
        var line = 1;
        var column = 0;
        for (var i = 0; i < index; i++) {
            if (bytes[i] === 10 /* Newline */) {
                line++;
                column = 0;
            }
            else {
                column++;
            }
        }
        throw new SyntaxError(message ? message :
            index === bytes.length ? 'Unexpected end of input while parsing JSON' :
                c >= 0x20 && c <= 0x7E ? "Unexpected character " + fromCharCode(c) + " in JSON at position " + index + " (line " + line + ", column " + column + ")" :
                    "Unexpected byte 0x" + c.toString(16) + " in JSON at position " + index + " (line " + line + ", column " + column + ")");
    }
    exports.JSON_parse = function (bytes) {
        if (!(bytes instanceof Uint8Array)) {
            throw new Error("JSON input must be a Uint8Array");
        }
        var propertyStack = [];
        var objectStack = [];
        var stateStack = [];
        var length = bytes.length;
        var property = null;
        var state = 0 /* TopLevel */;
        var object;
        var i = 0;
        while (i < length) {
            var c = bytes[i++];
            // Skip whitespace
            if (c <= 32 /* Space */) {
                continue;
            }
            var value = void 0;
            // Validate state inside objects
            if (state === 2 /* Object */ && property === null && c !== 34 /* Quote */ && c !== 125 /* CloseBrace */) {
                throwSyntaxError(bytes, --i);
            }
            switch (c) {
                // True
                case 116 /* LowerT */: {
                    if (bytes[i++] !== 114 /* LowerR */ || bytes[i++] !== 117 /* LowerU */ || bytes[i++] !== 101 /* LowerE */) {
                        throwSyntaxError(bytes, --i);
                    }
                    value = true;
                    break;
                }
                // False
                case 102 /* LowerF */: {
                    if (bytes[i++] !== 97 /* LowerA */ || bytes[i++] !== 108 /* LowerL */ || bytes[i++] !== 115 /* LowerS */ || bytes[i++] !== 101 /* LowerE */) {
                        throwSyntaxError(bytes, --i);
                    }
                    value = false;
                    break;
                }
                // Null
                case 110 /* LowerN */: {
                    if (bytes[i++] !== 117 /* LowerU */ || bytes[i++] !== 108 /* LowerL */ || bytes[i++] !== 108 /* LowerL */) {
                        throwSyntaxError(bytes, --i);
                    }
                    value = null;
                    break;
                }
                // Number begin
                case 45 /* Minus */:
                case 46 /* Dot */:
                case 48 /* Digit0 */:
                case 49 /* Digit1 */:
                case 50 /* Digit2 */:
                case 51 /* Digit3 */:
                case 52 /* Digit4 */:
                case 53 /* Digit5 */:
                case 54 /* Digit6 */:
                case 55 /* Digit7 */:
                case 56 /* Digit8 */:
                case 57 /* Digit9 */: {
                    var index = i;
                    value = fromCharCode(c);
                    c = bytes[i];
                    // Scan over the rest of the number
                    while (true) {
                        switch (c) {
                            case 43 /* Plus */:
                            case 45 /* Minus */:
                            case 46 /* Dot */:
                            case 48 /* Digit0 */:
                            case 49 /* Digit1 */:
                            case 50 /* Digit2 */:
                            case 51 /* Digit3 */:
                            case 52 /* Digit4 */:
                            case 53 /* Digit5 */:
                            case 54 /* Digit6 */:
                            case 55 /* Digit7 */:
                            case 56 /* Digit8 */:
                            case 57 /* Digit9 */:
                            case 101 /* LowerE */:
                            case 69 /* UpperE */: {
                                value += fromCharCode(c);
                                c = bytes[++i];
                                continue;
                            }
                        }
                        // Number end
                        break;
                    }
                    // Convert the string to a number
                    value = +value;
                    // Validate the number
                    if (isNaN(value)) {
                        throwSyntaxError(bytes, --index, 'Invalid number');
                    }
                    break;
                }
                // String begin
                case 34 /* Quote */: {
                    value = '';
                    while (true) {
                        if (i >= length) {
                            throwSyntaxError(bytes, length);
                        }
                        c = bytes[i++];
                        // String end
                        if (c === 34 /* Quote */) {
                            break;
                        }
                        else if (c === 92 /* Backslash */) {
                            switch (bytes[i++]) {
                                // Normal escape sequence
                                case 34 /* Quote */:
                                    value += '\"';
                                    break;
                                case 47 /* Slash */:
                                    value += '\/';
                                    break;
                                case 92 /* Backslash */:
                                    value += '\\';
                                    break;
                                case 98 /* LowerB */:
                                    value += '\b';
                                    break;
                                case 102 /* LowerF */:
                                    value += '\f';
                                    break;
                                case 110 /* LowerN */:
                                    value += '\n';
                                    break;
                                case 114 /* LowerR */:
                                    value += '\r';
                                    break;
                                case 116 /* LowerT */:
                                    value += '\t';
                                    break;
                                // Unicode escape sequence
                                case 117 /* LowerU */: {
                                    var code = 0;
                                    for (var j = 0; j < 4; j++) {
                                        c = bytes[i++];
                                        code <<= 4;
                                        if (c >= 48 /* Digit0 */ && c <= 57 /* Digit9 */)
                                            code |= c - 48 /* Digit0 */;
                                        else if (c >= 97 /* LowerA */ && c <= 102 /* LowerF */)
                                            code |= c + (10 - 97 /* LowerA */);
                                        else if (c >= 65 /* UpperA */ && c <= 70 /* UpperF */)
                                            code |= c + (10 - 65 /* UpperA */);
                                        else
                                            throwSyntaxError(bytes, --i);
                                    }
                                    value += fromCharCode(code);
                                    break;
                                }
                                // Invalid escape sequence
                                default:
                                    throwSyntaxError(bytes, --i);
                                    break;
                            }
                        }
                        else if (c <= 0x7F) {
                            value += fromCharCode(c);
                        }
                        else if ((c & 0xE0) === 0xC0) {
                            value += fromCharCode(((c & 0x1F) << 6) | (bytes[i++] & 0x3F));
                        }
                        else if ((c & 0xF0) === 0xE0) {
                            value += fromCharCode(((c & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F));
                        }
                        else if ((c & 0xF8) == 0xF0) {
                            var codePoint = ((c & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F);
                            if (codePoint > 0xFFFF) {
                                codePoint -= 0x10000;
                                value += fromCharCode(((codePoint >> 10) & 0x3FF) | 0xD800);
                                codePoint = 0xDC00 | (codePoint & 0x3FF);
                            }
                            value += fromCharCode(codePoint);
                        }
                    }
                    // Force V8's rope representation to be flattened to compact the string and avoid running out of memory
                    value[0];
                    break;
                }
                // Array begin
                case 91 /* OpenBracket */: {
                    value = [];
                    // Push the stack
                    propertyStack.push(property);
                    objectStack.push(object);
                    stateStack.push(state);
                    // Enter the array
                    property = null;
                    object = value;
                    state = 1 /* Array */;
                    continue;
                }
                // Object begin
                case 123 /* OpenBrace */: {
                    value = {};
                    // Push the stack
                    propertyStack.push(property);
                    objectStack.push(object);
                    stateStack.push(state);
                    // Enter the object
                    property = null;
                    object = value;
                    state = 2 /* Object */;
                    continue;
                }
                // Array end
                case 93 /* CloseBracket */: {
                    if (state !== 1 /* Array */) {
                        throwSyntaxError(bytes, --i);
                    }
                    // Leave the array
                    value = object;
                    // Pop the stack
                    property = propertyStack.pop();
                    object = objectStack.pop();
                    state = stateStack.pop();
                    break;
                }
                // Object end
                case 125 /* CloseBrace */: {
                    if (state !== 2 /* Object */) {
                        throwSyntaxError(bytes, --i);
                    }
                    // Leave the object
                    value = object;
                    // Pop the stack
                    property = propertyStack.pop();
                    object = objectStack.pop();
                    state = stateStack.pop();
                    break;
                }
                default: {
                    throwSyntaxError(bytes, --i);
                }
            }
            c = bytes[i];
            // Skip whitespace
            while (c <= 32 /* Space */) {
                c = bytes[++i];
            }
            switch (state) {
                case 0 /* TopLevel */: {
                    // Expect the end of the input
                    if (i === length) {
                        return value;
                    }
                    break;
                }
                case 1 /* Array */: {
                    object.push(value);
                    // Check for more values
                    if (c === 44 /* Comma */) {
                        i++;
                        continue;
                    }
                    // Expect the end of the array
                    if (c === 93 /* CloseBracket */) {
                        continue;
                    }
                    break;
                }
                case 2 /* Object */: {
                    // Property
                    if (property === null) {
                        property = value;
                        // Expect a colon
                        if (c === 58 /* Colon */) {
                            i++;
                            continue;
                        }
                    }
                    else {
                        object[property] = value;
                        property = null;
                        // Check for more values
                        if (c === 44 /* Comma */) {
                            i++;
                            continue;
                        }
                        // Expect the end of the object
                        if (c === 125 /* CloseBrace */) {
                            continue;
                        }
                    }
                    break;
                }
            }
            // It's an error if we get here
            break;
        }
        throwSyntaxError(bytes, i);
    };
}(typeof exports !== 'undefined' ? exports : this);

},{}],"../src/import/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withMockedFileChunkSizeForTests = withMockedFileChunkSizeForTests;
exports.MaybeCompressedDataReader = exports.TextProfileDataSource = exports.StringBackedTextFileContent = exports.BufferBackedTextFileContent = void 0;

var pako = _interopRequireWildcard(require("pako"));

var _uint8arrayJsonParser = require("uint8array-json-parser");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

// V8 has a maximum string size. To support files whose contents exceeds that
// size, we provide an alternate string interface for text backed by a
// Uint8Array instead.
//
// We provide a simple splitLines() which returns simple strings under the
// assumption that most extremely large text profiles will be broken into many
// lines. This isn't true in the general case, but will be true for most common
// large files.
//
// See: https://github.com/v8/v8/blob/8b663818fc311217c2cdaaab935f020578bfb7a8/src/objects/string.h#L479-L483
//
// At time of writing (2021/03/27), the maximum string length in V8 is
//  32 bit systems: 2^28 - 16 = ~268M chars
//  64 bit systems: 2^29 - 24 = ~537M chars
//
// https://source.chromium.org/chromium/chromium/src/+/main:v8/include/v8-primitive.h;drc=cb88fe94d9044d860cc75c89e1bc270ab4062702;l=125
//
// We'll be conservative and feed in 2^27 bytes at a time (~134M chars
// assuming utf-8 encoding)
let TEXT_FILE_CHUNK_SIZE = 1 << 27;

function withMockedFileChunkSizeForTests(chunkSize, cb) {
  return __awaiter(this, void 0, void 0, function* () {
    const original = TEXT_FILE_CHUNK_SIZE;
    TEXT_FILE_CHUNK_SIZE = chunkSize;

    try {
      yield cb();
    } finally {
      TEXT_FILE_CHUNK_SIZE = original;
    }
  });
}

function permissivelyParseJSONString(content) {
  // This code is similar to the code from here:
  // https://github.com/catapult-project/catapult/blob/27e047e0494df162022be6aa8a8862742a270232/tracing/tracing/extras/importer/trace_event_importer.html#L197-L208
  //
  //   If the event data begins with a [, then we know it should end with a ]. The
  //   reason we check for this is because some tracing implementations cannot
  //   guarantee that a ']' gets written to the trace file. So, we are forgiving
  //   and if this is obviously the case, we fix it up before throwing the string
  //   at JSON.parse.
  content = content.trim();

  if (content[0] === '[') {
    content = content.replace(/,\s*$/, '');

    if (content[content.length - 1] !== ']') {
      content += ']';
    }
  }

  return JSON.parse(content);
}

function permissivelyParseJSONUint8Array(byteArray) {
  let indexOfFirstNonWhitespaceChar = 0;

  for (let i = 0; i < byteArray.length; i++) {
    if (!/\s/.exec(String.fromCharCode(byteArray[i]))) {
      indexOfFirstNonWhitespaceChar = i;
      break;
    }
  }

  if (byteArray[indexOfFirstNonWhitespaceChar] === '['.charCodeAt(0) && byteArray[byteArray.length - 1] !== ']'.charCodeAt(0)) {
    // Strip trailing whitespace from the end of the array
    let trimmedLength = byteArray.length;

    while (trimmedLength > 0 && /\s/.exec(String.fromCharCode(byteArray[trimmedLength - 1]))) {
      trimmedLength--;
    } // Ignore trailing comma


    if (String.fromCharCode(byteArray[trimmedLength - 1]) === ',') {
      trimmedLength--;
    }

    if (String.fromCharCode(byteArray[trimmedLength - 1]) !== ']') {
      // Clone the array, ignoring any whitespace & trailing comma, then append a ']'
      //
      // Note: We could save a tiny bit of space here by avoiding copying the
      // leading whitespace, but it's a trivial perf boost and it complicates
      // the code.
      const newByteArray = new Uint8Array(trimmedLength + 1);
      newByteArray.set(byteArray.subarray(0, trimmedLength));
      newByteArray[trimmedLength] = ']'.charCodeAt(0);
      byteArray = newByteArray;
    }
  }

  return (0, _uint8arrayJsonParser.JSON_parse)(byteArray);
}

class BufferBackedTextFileContent {
  constructor(buffer) {
    this.chunks = [];
    const byteArray = this.byteArray = new Uint8Array(buffer);
    let encoding = 'utf-8';

    if (byteArray.length > 2) {
      if (byteArray[0] === 0xff && byteArray[1] === 0xfe) {
        // UTF-16, Little Endian encoding
        encoding = 'utf-16le';
      } else if (byteArray[0] === 0xfe && byteArray[1] === 0xff) {
        // UTF-16, Big Endian encoding
        encoding = 'utf-16be';
      }
    }

    if (typeof TextDecoder !== 'undefined') {
      // If TextDecoder is available, we'll try to use it to decode the string.
      const decoder = new TextDecoder(encoding);

      for (let chunkNum = 0; chunkNum < buffer.byteLength / TEXT_FILE_CHUNK_SIZE; chunkNum++) {
        const offset = chunkNum * TEXT_FILE_CHUNK_SIZE;
        const view = new Uint8Array(buffer, offset, Math.min(buffer.byteLength - offset, TEXT_FILE_CHUNK_SIZE));
        const chunk = decoder.decode(view, {
          stream: true
        });
        this.chunks.push(chunk);
      }
    } else {
      // JavaScript strings are UTF-16 encoded, but we're reading data from disk
      // that we're going to blindly assume it's ASCII encoded. This codepath
      // only exists for older browser support.
      console.warn('This browser does not support TextDecoder. Decoding text as ASCII.');
      this.chunks.push('');

      for (let i = 0; i < byteArray.length; i++) {
        this.chunks[this.chunks.length - 1] += String.fromCharCode(byteArray[i]);
        this.chunks[this.chunks.length - 1] | 0; // This forces the string to be flattened

        if (this.chunks[this.chunks.length - 1].length >= TEXT_FILE_CHUNK_SIZE) {
          this.chunks.push('');
        }
      }
    }
  }

  splitLines() {
    const iterator = function* () {
      let lineBuffer = '';

      for (let chunk of this.chunks) {
        const fragments = chunk.split('\n');

        for (let i = 0; i < fragments.length; i++) {
          if (i === 0) lineBuffer += fragments[i];else {
            yield lineBuffer;
            lineBuffer = fragments[i];
          }
        }
      }

      yield lineBuffer;
    };

    return {
      [Symbol.iterator]: iterator.bind(this)
    };
  }

  firstChunk() {
    return this.chunks[0] || '';
  }

  parseAsJSON() {
    // We only use the Uint8Array version of JSON.parse when necessary, because
    // it's around 4x slower than native.
    if (this.chunks.length === 1) {
      return permissivelyParseJSONString(this.chunks[0]);
    }

    return permissivelyParseJSONUint8Array(this.byteArray);
  }

}

exports.BufferBackedTextFileContent = BufferBackedTextFileContent;

class StringBackedTextFileContent {
  constructor(s) {
    this.s = s;
  }

  splitLines() {
    return this.s.split('\n');
  }

  firstChunk() {
    return this.s;
  }

  parseAsJSON() {
    return permissivelyParseJSONString(this.s);
  }

}

exports.StringBackedTextFileContent = StringBackedTextFileContent;

class TextProfileDataSource {
  constructor(fileName, contents) {
    this.fileName = fileName;
    this.contents = contents;
  }

  name() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.fileName;
    });
  }

  readAsArrayBuffer() {
    return __awaiter(this, void 0, void 0, function* () {
      return new ArrayBuffer(0);
    });
  }

  readAsText() {
    return __awaiter(this, void 0, void 0, function* () {
      return new StringBackedTextFileContent(this.contents);
    });
  }

}

exports.TextProfileDataSource = TextProfileDataSource;

class MaybeCompressedDataReader {
  constructor(namePromise, maybeCompressedDataPromise) {
    this.namePromise = namePromise;
    this.uncompressedData = maybeCompressedDataPromise.then(fileData => __awaiter(this, void 0, void 0, function* () {
      try {
        const result = pako.inflate(new Uint8Array(fileData)).buffer;
        return result;
      } catch (e) {
        return fileData;
      }
    }));
  }

  name() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.namePromise;
    });
  }

  readAsArrayBuffer() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.uncompressedData;
    });
  }

  readAsText() {
    return __awaiter(this, void 0, void 0, function* () {
      const buffer = yield this.readAsArrayBuffer();
      return new BufferBackedTextFileContent(buffer);
    });
  }

  static fromFile(file) {
    const maybeCompressedDataPromise = new Promise(resolve => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        if (!(reader.result instanceof ArrayBuffer)) {
          throw new Error('Expected reader.result to be an instance of ArrayBuffer');
        }

        resolve(reader.result);
      });
      reader.readAsArrayBuffer(file);
    });
    return new MaybeCompressedDataReader(Promise.resolve(file.name), maybeCompressedDataPromise);
  }

  static fromArrayBuffer(name, buffer) {
    return new MaybeCompressedDataReader(Promise.resolve(name), Promise.resolve(buffer));
  }

}

exports.MaybeCompressedDataReader = MaybeCompressedDataReader;
},{"pako":"../node_modules/pako/index.js","uint8array-json-parser":"../node_modules/uint8array-json-parser/uint8array-json-parser.js"}],"../src/import/instruments.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromInstrumentsDeepCopy = importFromInstrumentsDeepCopy;
exports.importFromInstrumentsTrace = importFromInstrumentsTrace;
exports.importRunFromInstrumentsTrace = importRunFromInstrumentsTrace;
exports.importThreadFromInstrumentsTrace = importThreadFromInstrumentsTrace;
exports.readInstrumentsKeyedArchive = readInstrumentsKeyedArchive;
exports.decodeUTF8 = decodeUTF8;
exports.UID = void 0;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

var _utils2 = require("./utils");

// This file contains methods to import data from OS X Instruments.app
// https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/index.html
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

function parseTSV(contents) {
  const lines = [...contents.splitLines()].map(l => l.split('\t'));
  const headerLine = lines.shift();
  if (!headerLine) return [];
  const indexToField = new Map();

  for (let i = 0; i < headerLine.length; i++) {
    indexToField.set(i, headerLine[i]);
  }

  const ret = [];

  for (let line of lines) {
    const row = {};

    for (let i = 0; i < line.length; i++) {
      ;
      row[indexToField.get(i)] = line[i];
    }

    ret.push(row);
  }

  return ret;
}

function getWeight(deepCopyRow) {
  if ('Bytes Used' in deepCopyRow) {
    const bytesUsedString = deepCopyRow['Bytes Used'];
    const parts = /\s*(\d+(?:[.]\d+)?) (\w+)\s+(?:\d+(?:[.]\d+))%/.exec(bytesUsedString);
    if (!parts) return 0;
    const value = parseInt(parts[1], 10);
    const units = parts[2];

    switch (units) {
      case 'Bytes':
        return value;

      case 'KB':
        return 1024 * value;

      case 'MB':
        return 1024 * 1024 * value;

      case 'GB':
        return 1024 * 1024 * 1024 * value;
    }

    throw new Error(`Unrecognized units ${units}`);
  }

  if ('Weight' in deepCopyRow || 'Running Time' in deepCopyRow) {
    const weightString = deepCopyRow['Weight'] || deepCopyRow['Running Time'];
    const parts = /\s*(\d+(?:[.]\d+)?) ?(\w+)\s+(?:\d+(?:[.]\d+))%/.exec(weightString);
    if (!parts) return 0;
    const value = parseInt(parts[1], 10);
    const units = parts[2];

    switch (units) {
      case 'ms':
        return value;

      case 's':
        return 1000 * value;

      case 'min':
        return 60 * 1000 * value;

      case 'cycles':
        return value;

      case 'Kc':
        return 1000 * value;

      case 'Mc':
        return 1000 * 1000 * value;

      case 'Gc':
        return 1000 * 1000 * 1000 * value;
    }

    throw new Error(`Unrecognized units ${units}`);
  }

  return -1;
} // Import from a deep copy made of a profile


function importFromInstrumentsDeepCopy(contents) {
  const profile = new _profile.CallTreeProfileBuilder();
  const rows = parseTSV(contents);
  const stack = [];
  let cumulativeValue = 0;

  for (let row of rows) {
    const symbolName = row['Symbol Name'];
    if (!symbolName) continue;
    const trimmedSymbolName = symbolName.trim();
    let stackDepth = symbolName.length - trimmedSymbolName.length;

    if (stack.length - stackDepth < 0) {
      throw new Error('Invalid format');
    }

    let framesToLeave = [];

    while (stackDepth < stack.length) {
      const stackTop = stack.pop();
      framesToLeave.push(stackTop);
    }

    for (let frameToLeave of framesToLeave) {
      cumulativeValue = Math.max(cumulativeValue, frameToLeave.endValue);
      profile.leaveFrame(frameToLeave, cumulativeValue);
    }

    const newFrameInfo = {
      key: `${row['Source Path'] || ''}:${trimmedSymbolName}`,
      name: trimmedSymbolName,
      file: row['Source Path'],
      endValue: cumulativeValue + getWeight(row)
    };
    profile.enterFrame(newFrameInfo, cumulativeValue);
    stack.push(newFrameInfo);
  }

  while (stack.length > 0) {
    const frameToLeave = stack.pop();
    cumulativeValue = Math.max(cumulativeValue, frameToLeave.endValue);
    profile.leaveFrame(frameToLeave, cumulativeValue);
  }

  if ('Bytes Used' in rows[0]) {
    profile.setValueFormatter(new _valueFormatters.ByteFormatter());
  } else if ('Weight' in rows[0] || 'Running Time' in rows[0]) {
    profile.setValueFormatter(new _valueFormatters.TimeFormatter('milliseconds'));
  }

  return profile.build();
}

function extractDirectoryTree(entry) {
  return __awaiter(this, void 0, void 0, function* () {
    const node = {
      name: entry.name,
      files: new Map(),
      subdirectories: new Map()
    };
    const children = yield new Promise((resolve, reject) => {
      entry.createReader().readEntries(entries => {
        resolve(entries);
      }, reject);
    });

    for (let child of children) {
      if (child.isDirectory) {
        const subtree = yield extractDirectoryTree(child);
        node.subdirectories.set(subtree.name, subtree);
      } else {
        const file = yield new Promise((resolve, reject) => {
          ;
          child.file(resolve, reject);
        });
        node.files.set(file.name, file);
      }
    }

    return node;
  });
}

function readAsArrayBuffer(file) {
  return _utils2.MaybeCompressedDataReader.fromFile(file).readAsArrayBuffer();
}

function readAsText(file) {
  return _utils2.MaybeCompressedDataReader.fromFile(file).readAsText();
}

function getCoreDirForRun(tree, selectedRun) {
  const corespace = (0, _utils.getOrThrow)(tree.subdirectories, 'corespace');
  const corespaceRunDir = (0, _utils.getOrThrow)(corespace.subdirectories, `run${selectedRun}`);
  return (0, _utils.getOrThrow)(corespaceRunDir.subdirectories, 'core');
}

class BinReader {
  constructor(buffer) {
    this.bytePos = 0;
    this.view = new DataView(buffer);
  }

  seek(pos) {
    this.bytePos = pos;
  }

  skip(byteCount) {
    this.bytePos += byteCount;
  }

  hasMore() {
    return this.bytePos < this.view.byteLength;
  }

  bytesLeft() {
    return this.view.byteLength - this.bytePos;
  }

  readUint8() {
    this.bytePos++;
    if (this.bytePos > this.view.byteLength) return 0;
    return this.view.getUint8(this.bytePos - 1);
  } // Note: we intentionally use Math.pow here rather than bit shifts
  // because JavaScript doesn't have true 64 bit integers.


  readUint32() {
    this.bytePos += 4;
    if (this.bytePos > this.view.byteLength) return 0;
    return this.view.getUint32(this.bytePos - 4, true);
  }

  readUint48() {
    this.bytePos += 6;
    if (this.bytePos > this.view.byteLength) return 0;
    return this.view.getUint32(this.bytePos - 6, true) + this.view.getUint16(this.bytePos - 2, true) * Math.pow(2, 32);
  }

  readUint64() {
    this.bytePos += 8;
    if (this.bytePos > this.view.byteLength) return 0;
    return this.view.getUint32(this.bytePos - 8, true) + this.view.getUint32(this.bytePos - 4, true) * Math.pow(2, 32);
  }

}

function getRawSampleList(core) {
  return __awaiter(this, void 0, void 0, function* () {
    const stores = (0, _utils.getOrThrow)(core.subdirectories, 'stores');

    for (let storedir of stores.subdirectories.values()) {
      const schemaFile = storedir.files.get('schema.xml');
      if (!schemaFile) continue;
      const schema = yield readAsText(schemaFile);

      if (!/name="time-profile"/.exec(schema.firstChunk())) {
        continue;
      }

      const bulkstore = new BinReader((yield readAsArrayBuffer((0, _utils.getOrThrow)(storedir.files, 'bulkstore')))); // Ignore the first 3 words

      bulkstore.readUint32();
      bulkstore.readUint32();
      bulkstore.readUint32();
      const headerSize = bulkstore.readUint32();
      const bytesPerEntry = bulkstore.readUint32();
      bulkstore.seek(headerSize);
      const samples = [];

      while (true) {
        // Schema as of Instruments 8.3.3 is a 6 byte timestamp, followed by a bunch
        // of stuff we don't care about, followed by a 4 byte backtrace ID
        const timestamp = bulkstore.readUint48();
        if (timestamp === 0) break;
        const threadID = bulkstore.readUint32();
        bulkstore.skip(bytesPerEntry - 6 - 4 - 4);
        const backtraceID = bulkstore.readUint32();
        samples.push({
          timestamp,
          threadID,
          backtraceID
        });
      }

      return samples;
    }

    throw new Error('Could not find sample list');
  });
}

function getIntegerArrays(samples, core) {
  return __awaiter(this, void 0, void 0, function* () {
    const uniquing = (0, _utils.getOrThrow)(core.subdirectories, 'uniquing');
    const arrayUniquer = (0, _utils.getOrThrow)(uniquing.subdirectories, 'arrayUniquer');
    const integeruniquerindex = (0, _utils.getOrThrow)(arrayUniquer.files, 'integeruniquer.index');
    const integeruniquerdata = (0, _utils.getOrThrow)(arrayUniquer.files, 'integeruniquer.data'); // integeruniquer.index is a binary file containing an array of [byte offset, MB offset] pairs
    // that indicate where array data starts in the .data file
    // integeruniquer.data is a binary file containing an array of arrays of 64 bit integer.
    // The schema is a 32 byte header followed by a stream of arrays.
    // Each array consists of a 4 byte size N followed by N 8 byte little endian integers
    // This table contains the memory addresses of stack frames

    const indexreader = new BinReader((yield readAsArrayBuffer(integeruniquerindex)));
    const datareader = new BinReader((yield readAsArrayBuffer(integeruniquerdata))); // Header we don't care about

    indexreader.seek(32);
    let arrays = [];

    while (indexreader.hasMore()) {
      const byteOffset = indexreader.readUint32() + indexreader.readUint32() * (1024 * 1024);

      if (byteOffset === 0) {
        // The first entry in the index table seems to just indicate the offset of
        // the header into the data file
        continue;
      }

      datareader.seek(byteOffset);
      let length = datareader.readUint32();
      let array = [];

      while (length--) {
        array.push(datareader.readUint64());
      }

      arrays.push(array);
    }

    return arrays;
  });
}

function readFormTemplate(tree) {
  return __awaiter(this, void 0, void 0, function* () {
    const formTemplate = (0, _utils.getOrThrow)(tree.files, 'form.template');
    const archive = readInstrumentsKeyedArchive((yield readAsArrayBuffer(formTemplate)));
    const version = archive['com.apple.xray.owner.template.version'];
    let selectedRunNumber = 1;

    if ('com.apple.xray.owner.template' in archive) {
      selectedRunNumber = archive['com.apple.xray.owner.template'].get('_selectedRunNumber');
    }

    let instrument = archive['$1'];

    if ('stubInfoByUUID' in archive) {
      instrument = Array.from(archive['stubInfoByUUID'].keys())[0];
    }

    const allRunData = archive['com.apple.xray.run.data'];
    const runs = [];

    for (let runNumber of allRunData.runNumbers) {
      const runData = (0, _utils.getOrThrow)(allRunData.runData, runNumber);
      const symbolsByPid = (0, _utils.getOrThrow)(runData, 'symbolsByPid');
      const addressToFrameMap = new Map(); // TODO(jlfwong): Deal with profiles with conflicting addresses?

      for (let symbols of symbolsByPid.values()) {
        for (let symbol of symbols.symbols) {
          if (!symbol) continue;
          const {
            sourcePath,
            symbolName,
            addressToLine
          } = symbol;

          for (let address of addressToLine.keys()) {
            (0, _utils.getOrInsert)(addressToFrameMap, address, () => {
              const name = symbolName || `0x${(0, _utils.zeroPad)(address.toString(16), 16)}`;
              const frame = {
                key: `${sourcePath}:${name}`,
                name: name
              };

              if (sourcePath) {
                frame.file = sourcePath;
              }

              return frame;
            });
          }
        }

        runs.push({
          number: runNumber,
          addressToFrameMap
        });
      }
    }

    return {
      version,
      instrument,
      selectedRunNumber,
      runs
    };
  });
} // Import from a .trace file saved from Mac Instruments.app


function importFromInstrumentsTrace(entry) {
  return __awaiter(this, void 0, void 0, function* () {
    const tree = yield extractDirectoryTree(entry);
    const {
      version,
      runs,
      instrument,
      selectedRunNumber
    } = yield readFormTemplate(tree);

    if (instrument !== 'com.apple.xray.instrument-type.coresampler2') {
      throw new Error(`The only supported instrument from .trace import is "com.apple.xray.instrument-type.coresampler2". Got ${instrument}`);
    }

    console.log('version: ', version);
    console.log(`Importing time profile`);
    const profiles = [];
    let indexToView = 0;

    for (let run of runs) {
      const {
        addressToFrameMap,
        number
      } = run;
      const group = yield importRunFromInstrumentsTrace({
        fileName: entry.name,
        tree,
        addressToFrameMap,
        runNumber: number
      });

      if (run.number === selectedRunNumber) {
        indexToView = profiles.length + group.indexToView;
      }

      profiles.push(...group.profiles);
    }

    return {
      name: entry.name,
      indexToView,
      profiles
    };
  });
}

function importRunFromInstrumentsTrace(args) {
  return __awaiter(this, void 0, void 0, function* () {
    const {
      fileName,
      tree,
      addressToFrameMap,
      runNumber
    } = args;
    const core = getCoreDirForRun(tree, runNumber);
    let samples = yield getRawSampleList(core);
    const arrays = yield getIntegerArrays(samples, core); // We'll try to guess which thread is the main thread by assuming
    // it's the one with the most samples.

    const sampleCountByThreadID = new Map();

    for (let sample of samples) {
      sampleCountByThreadID.set(sample.threadID, (0, _utils.getOrElse)(sampleCountByThreadID, sample.threadID, () => 0) + 1);
    }

    const counts = Array.from(sampleCountByThreadID.entries());
    (0, _utils.sortBy)(counts, c => -c[1]);
    const threadIDs = counts.map(c => c[0]);
    return {
      name: fileName,
      indexToView: 0,
      profiles: threadIDs.map(threadID => importThreadFromInstrumentsTrace({
        threadID,
        fileName,
        arrays,
        addressToFrameMap,
        samples
      }))
    };
  });
}

function importThreadFromInstrumentsTrace(args) {
  let {
    fileName,
    addressToFrameMap,
    arrays,
    threadID,
    samples
  } = args;
  const backtraceIDtoStack = new Map();
  samples = samples.filter(s => s.threadID === threadID);
  const profile = new _profile.StackListProfileBuilder((0, _utils.lastOf)(samples).timestamp);
  profile.setName(`${fileName} - thread ${threadID}`);

  function appendRecursive(k, stack) {
    const frame = addressToFrameMap.get(k);

    if (frame) {
      stack.push(frame);
    } else if (k in arrays) {
      for (let addr of arrays[k]) {
        appendRecursive(addr, stack);
      }
    } else {
      const rawAddressFrame = {
        key: k,
        name: `0x${(0, _utils.zeroPad)(k.toString(16), 16)}`
      };
      addressToFrameMap.set(k, rawAddressFrame);
      stack.push(rawAddressFrame);
    }
  }

  let lastTimestamp = null;

  for (let sample of samples) {
    const stackForSample = (0, _utils.getOrInsert)(backtraceIDtoStack, sample.backtraceID, id => {
      const stack = [];
      appendRecursive(id, stack);
      stack.reverse();
      return stack;
    });

    if (lastTimestamp === null) {
      // The first sample is sometimes fairly late in the profile for some reason.
      // We'll just say nothing was known to be on the stack in that time.
      profile.appendSampleWithWeight([], sample.timestamp);
      lastTimestamp = sample.timestamp;
    }

    if (sample.timestamp < lastTimestamp) {
      throw new Error('Timestamps out of order!');
    }

    profile.appendSampleWithWeight(stackForSample, sample.timestamp - lastTimestamp);
    lastTimestamp = sample.timestamp;
  }

  profile.setValueFormatter(new _valueFormatters.TimeFormatter('nanoseconds'));
  return profile.build();
}

function readInstrumentsKeyedArchive(buffer) {
  const byteArray = new Uint8Array(buffer);
  const parsedPlist = parseBinaryPlist(byteArray);
  const data = expandKeyedArchive(parsedPlist, ($classname, object) => {
    switch ($classname) {
      case 'NSTextStorage':
      case 'NSParagraphStyle':
      case 'NSFont':
        // Stuff that's irrelevant for constructing a flamegraph
        return null;

      case 'PFTSymbolData':
        {
          const ret = Object.create(null);
          ret.symbolName = object.$0;
          ret.sourcePath = object.$1;
          ret.addressToLine = new Map();

          for (let i = 3;; i += 2) {
            const address = object['$' + i];
            const line = object['$' + (i + 1)];

            if (address == null || line == null) {
              break;
            }

            ret.addressToLine.set(address, line);
          }

          return ret;
        }

      case 'PFTOwnerData':
        {
          const ret = Object.create(null);
          ret.ownerName = object.$0;
          ret.ownerPath = object.$1;
          return ret;
        }

      case 'PFTPersistentSymbols':
        {
          const ret = Object.create(null);
          const symbolCount = object.$4;
          ret.threadNames = object.$3;
          ret.symbols = [];

          for (let i = 1; i < symbolCount; i++) {
            ret.symbols.push(object['$' + (4 + i)]);
          }

          return ret;
        }

      case 'XRRunListData':
        {
          const ret = Object.create(null);
          ret.runNumbers = object.$0;
          ret.runData = object.$1;
          return ret;
        }

      case 'XRIntKeyedDictionary':
        {
          const ret = new Map();
          const size = object.$0;

          for (let i = 0; i < size; i++) {
            const key = object['$' + (1 + 2 * i)];
            const value = object['$' + (1 + (2 * i + 1))];
            ret.set(key, value);
          }

          return ret;
        }

      case 'XRCore':
        {
          const ret = Object.create(null);
          ret.number = object.$0;
          ret.name = object.$1;
          return ret;
        }
    }

    return object;
  });
  return data;
} ////////////////////////////////////////////////////////////////////////////////


function decodeUTF8(bytes) {
  let text = String.fromCharCode.apply(String, Array.from(bytes));
  if (text.slice(-1) === '\0') text = text.slice(0, -1); // Remove a single trailing null character if present

  return decodeURIComponent(escape(text));
}

function isArray(value) {
  return value instanceof Array;
}

function isDictionary(value) {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === null;
}

function followUID(objects, value) {
  return value instanceof UID ? objects[value.index] : value;
}

function expandKeyedArchive(root, interpretClass = x => x) {
  // Sanity checks
  if (root.$version !== 100000 || root.$archiver !== 'NSKeyedArchiver' || !isDictionary(root.$top) || !isArray(root.$objects)) {
    throw new Error('Invalid keyed archive');
  } // Substitute NSNull


  if (root.$objects[0] === '$null') {
    root.$objects[0] = null;
  } // Pattern-match Objective-C constructs


  for (let i = 0; i < root.$objects.length; i++) {
    root.$objects[i] = paternMatchObjectiveC(root.$objects, root.$objects[i], interpretClass);
  } // Reconstruct the DAG from the parse tree


  let visit = object => {
    if (object instanceof UID) {
      return root.$objects[object.index];
    } else if (isArray(object)) {
      for (let i = 0; i < object.length; i++) {
        object[i] = visit(object[i]);
      }
    } else if (isDictionary(object)) {
      for (let key in object) {
        object[key] = visit(object[key]);
      }
    } else if (object instanceof Map) {
      const clone = new Map(object);
      object.clear();

      for (let [k, v] of clone.entries()) {
        object.set(visit(k), visit(v));
      }
    }

    return object;
  };

  for (let i = 0; i < root.$objects.length; i++) {
    visit(root.$objects[i]);
  }

  return visit(root.$top);
}

function paternMatchObjectiveC(objects, value, interpretClass = x => x) {
  if (isDictionary(value) && value.$class) {
    let name = followUID(objects, value.$class).$classname;

    switch (name) {
      case 'NSDecimalNumberPlaceholder':
        {
          let length = value['NS.length'];
          let exponent = value['NS.exponent'];
          let byteOrder = value['NS.mantissa.bo'];
          let negative = value['NS.negative'];
          let mantissa = new Uint16Array(new Uint8Array(value['NS.mantissa']).buffer);
          let decimal = 0;

          for (let i = 0; i < length; i++) {
            let digit = mantissa[i];

            if (byteOrder !== 1) {
              // I assume this is how this works but I am unable to test it
              digit = (digit & 0xff00) >> 8 | (digit & 0x00ff) << 8;
            }

            decimal += digit * Math.pow(65536, i);
          }

          decimal *= Math.pow(10, exponent);
          return negative ? -decimal : decimal;
        }
      // Replace NSData with a Uint8Array

      case 'NSData':
      case 'NSMutableData':
        return value['NS.bytes'] || value['NS.data'];
      // Replace NSString with a string

      case 'NSString':
      case 'NSMutableString':
        if (value['NS.string']) return value['NS.string'];
        if (value['NS.bytes']) return decodeUTF8(value['NS.bytes']);
        console.warn(`Unexpected ${name} format: `, value);
        return null;
      // Replace NSArray with an Array

      case 'NSArray':
      case 'NSMutableArray':
        if ('NS.objects' in value) {
          return value['NS.objects'];
        }

        let array = [];

        while (true) {
          let object = 'NS.object.' + array.length;

          if (!(object in value)) {
            break;
          }

          array.push(value[object]);
        }

        return array;

      case '_NSKeyedCoderOldStyleArray':
        {
          const count = value['NS.count']; // const size = value['NS.size']
          // Types are encoded as single printable characters.
          // See: https://github.com/apple/swift-corelibs-foundation/blob/76995e8d3d8c10f3f3ec344dace43426ab941d0e/Foundation/NSObjCRuntime.swift#L19
          // const type = String.fromCharCode(value['NS.type'])

          let array = [];

          for (let i = 0; i < count; i++) {
            const element = value['$' + i];
            array.push(element);
          }

          return array;
        }

      case 'NSDictionary':
      case 'NSMutableDictionary':
        let map = new Map();

        if ('NS.keys' in value && 'NS.objects' in value) {
          for (let i = 0; i < value['NS.keys'].length; i++) {
            map.set(value['NS.keys'][i], value['NS.objects'][i]);
          }
        } else {
          while (true) {
            let key = 'NS.key.' + map.size;
            let object = 'NS.object.' + map.size;

            if (!(key in value) || !(object in value)) {
              break;
            }

            map.set(value[key], value[object]);
          }
        }

        return map;

      default:
        const converted = interpretClass(name, value);
        if (converted !== value) return converted;
    }
  }

  return value;
} ////////////////////////////////////////////////////////////////////////////////


class UID {
  constructor(index) {
    this.index = index;
  }

}

exports.UID = UID;

function parseBinaryPlist(bytes) {
  let text = 'bplist00';

  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== text.charCodeAt(i)) {
      throw new Error('File is not a binary plist');
    }
  }

  return new BinaryPlistParser(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)).parseRoot();
} // See http://opensource.apple.com/source/CF/CF-550/CFBinaryPList.c for details


class BinaryPlistParser {
  constructor(view) {
    this.view = view;
    this.referenceSize = 0;
    this.objects = [];
    this.offsetTable = [];
  }

  parseRoot() {
    let trailer = this.view.byteLength - 32;
    let offsetSize = this.view.getUint8(trailer + 6);
    this.referenceSize = this.view.getUint8(trailer + 7); // Just use the last 32-bits of these 64-bit big-endian values

    let objectCount = this.view.getUint32(trailer + 12, false);
    let rootIndex = this.view.getUint32(trailer + 20, false);
    let tableOffset = this.view.getUint32(trailer + 28, false); // Parse all offsets before starting to parse objects

    for (let i = 0; i < objectCount; i++) {
      this.offsetTable.push(this.parseInteger(tableOffset, offsetSize));
      tableOffset += offsetSize;
    } // Parse the root object assuming the graph is a tree


    return this.parseObject(this.offsetTable[rootIndex]);
  }

  parseLengthAndOffset(offset, extra) {
    if (extra !== 0x0f) return {
      length: extra,
      offset: 0
    };
    let marker = this.view.getUint8(offset++);
    if ((marker & 0xf0) !== 0x10) throw new Error('Unexpected non-integer length at offset ' + offset);
    let size = 1 << (marker & 0x0f);
    return {
      length: this.parseInteger(offset, size),
      offset: size + 1
    };
  }

  parseSingleton(offset, extra) {
    if (extra === 0) return null;
    if (extra === 8) return false;
    if (extra === 9) return true;
    throw new Error('Unexpected extra value ' + extra + ' at offset ' + offset);
  }

  parseInteger(offset, size) {
    if (size === 1) return this.view.getUint8(offset);
    if (size === 2) return this.view.getUint16(offset, false);
    if (size === 4) return this.view.getUint32(offset, false);

    if (size === 8) {
      return Math.pow(2, 32 * 1) * this.view.getUint32(offset + 0, false) + Math.pow(2, 32 * 0) * this.view.getUint32(offset + 4, false);
    }

    if (size === 16) {
      return Math.pow(2, 32 * 3) * this.view.getUint32(offset + 0, false) + Math.pow(2, 32 * 2) * this.view.getUint32(offset + 4, false) + Math.pow(2, 32 * 1) * this.view.getUint32(offset + 8, false) + Math.pow(2, 32 * 0) * this.view.getUint32(offset + 12, false);
    }

    throw new Error('Unexpected integer of size ' + size + ' at offset ' + offset);
  }

  parseFloat(offset, size) {
    if (size === 4) return this.view.getFloat32(offset, false);
    if (size === 8) return this.view.getFloat64(offset, false);
    throw new Error('Unexpected float of size ' + size + ' at offset ' + offset);
  }

  parseDate(offset, size) {
    if (size !== 8) throw new Error('Unexpected date of size ' + size + ' at offset ' + offset);
    let seconds = this.view.getFloat64(offset, false);
    return new Date(978307200000 + seconds * 1000); // Starts from January 1st, 2001
  }

  parseData(offset, extra) {
    let both = this.parseLengthAndOffset(offset, extra);
    return new Uint8Array(this.view.buffer, offset + both.offset, both.length);
  }

  parseStringASCII(offset, extra) {
    let both = this.parseLengthAndOffset(offset, extra);
    let text = '';
    offset += both.offset;

    for (let i = 0; i < both.length; i++) {
      text += String.fromCharCode(this.view.getUint8(offset++));
    }

    return text;
  }

  parseStringUTF16(offset, extra) {
    let both = this.parseLengthAndOffset(offset, extra);
    let text = '';
    offset += both.offset;

    for (let i = 0; i < both.length; i++) {
      text += String.fromCharCode(this.view.getUint16(offset, false));
      offset += 2;
    }

    return text;
  }

  parseUID(offset, size) {
    return new UID(this.parseInteger(offset, size));
  }

  parseArray(offset, extra) {
    let both = this.parseLengthAndOffset(offset, extra);
    let array = [];
    let size = this.referenceSize;
    offset += both.offset;

    for (let i = 0; i < both.length; i++) {
      array.push(this.parseObject(this.offsetTable[this.parseInteger(offset, size)]));
      offset += size;
    }

    return array;
  }

  parseDictionary(offset, extra) {
    let both = this.parseLengthAndOffset(offset, extra);
    let dictionary = Object.create(null);
    let size = this.referenceSize;
    let nextKey = offset + both.offset;
    let nextValue = nextKey + both.length * size;

    for (let i = 0; i < both.length; i++) {
      let key = this.parseObject(this.offsetTable[this.parseInteger(nextKey, size)]);
      let value = this.parseObject(this.offsetTable[this.parseInteger(nextValue, size)]);
      if (typeof key !== 'string') throw new Error('Unexpected non-string key at offset ' + nextKey);
      dictionary[key] = value;
      nextKey += size;
      nextValue += size;
    }

    return dictionary;
  }

  parseObject(offset) {
    let marker = this.view.getUint8(offset++);
    let extra = marker & 0x0f;

    switch (marker >> 4) {
      case 0x0:
        return this.parseSingleton(offset, extra);

      case 0x1:
        return this.parseInteger(offset, 1 << extra);

      case 0x2:
        return this.parseFloat(offset, 1 << extra);

      case 0x3:
        return this.parseDate(offset, 1 << extra);

      case 0x4:
        return this.parseData(offset, extra);

      case 0x5:
        return this.parseStringASCII(offset, extra);

      case 0x6:
        return this.parseStringUTF16(offset, extra);

      case 0x8:
        return this.parseUID(offset, extra + 1);

      case 0xa:
        return this.parseArray(offset, extra);

      case 0xd:
        return this.parseDictionary(offset, extra);
    }

    throw new Error('Unexpected marker ' + marker + ' at offset ' + --offset);
  }

}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts","./utils":"../src/import/utils.ts"}],"../src/import/bg-flamegraph.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromBGFlameGraph = importFromBGFlameGraph;

var _profile = require("../lib/profile");

// https://github.com/brendangregg/FlameGraph#2-fold-stacks
function parseBGFoldedStacks(contents) {
  const samples = [];

  for (const line of contents.splitLines()) {
    const match = /^(.*) (\d+)$/gm.exec(line);
    if (!match) continue;
    const stack = match[1];
    const n = match[2];
    samples.push({
      stack: stack.split(';').map(name => ({
        key: name,
        name: name
      })),
      duration: parseInt(n, 10)
    });
  }

  return samples;
}

function importFromBGFlameGraph(contents) {
  const parsed = parseBGFoldedStacks(contents);
  const duration = parsed.reduce((prev, cur) => prev + cur.duration, 0);
  const profile = new _profile.StackListProfileBuilder(duration);

  if (parsed.length === 0) {
    return null;
  }

  for (let sample of parsed) {
    profile.appendSampleWithWeight(sample.stack, sample.duration);
  }

  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts"}],"../src/import/firefox.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromFirefox = importFromFirefox;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

function importFromFirefox(firefoxProfile) {
  const cpuProfile = firefoxProfile.profile;
  const thread = cpuProfile.threads.length === 1 ? cpuProfile.threads[0] : cpuProfile.threads.filter(t => t.name === 'GeckoMain')[0];
  const frameKeyToFrameInfo = new Map();

  function extractStack(sample) {
    let stackFrameId = sample[0];
    const ret = [];

    while (stackFrameId != null) {
      const nextStackFrame = thread.stackTable.data[stackFrameId];
      const [nextStackId, frameId] = nextStackFrame;
      ret.push(frameId);
      stackFrameId = nextStackId;
    }

    ret.reverse();
    return ret.map(f => {
      const frameData = thread.frameTable.data[f];
      const location = thread.stringTable[frameData[0]];
      const match = /(.*)\s+\((.*?)(?::(\d+))?(?::(\d+))?\)$/.exec(location);
      if (!match) return null;

      if (match[2].startsWith('resource:') || match[2] === 'self-hosted' || match[2].startsWith('self-hosted:')) {
        // Ignore Firefox-internals stuff
        return null;
      }

      return (0, _utils.getOrInsert)(frameKeyToFrameInfo, location, () => ({
        key: location,
        name: match[1],
        file: match[2],
        // In Firefox profiles, line numbers are 1-based, but columns are
        // 0-based. Let's normalize both to be 1-based.
        line: match[3] ? parseInt(match[3]) : undefined,
        col: match[4] ? parseInt(match[4]) + 1 : undefined
      }));
    }).filter(f => f != null);
  }

  const profile = new _profile.CallTreeProfileBuilder(firefoxProfile.duration);
  let prevStack = [];

  for (let sample of thread.samples.data) {
    const stack = extractStack(sample);
    const value = sample[1]; // Find lowest common ancestor of the current stack and the previous one

    let lcaIndex = -1;

    for (let i = 0; i < Math.min(stack.length, prevStack.length); i++) {
      if (prevStack[i] !== stack[i]) {
        break;
      }

      lcaIndex = i;
    } // Close frames that are no longer open


    for (let i = prevStack.length - 1; i > lcaIndex; i--) {
      profile.leaveFrame(prevStack[i], value);
    }

    for (let i = lcaIndex + 1; i < stack.length; i++) {
      profile.enterFrame(stack[i], value);
    }

    prevStack = stack;
  }

  profile.setValueFormatter(new _valueFormatters.TimeFormatter('milliseconds'));
  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/v8proflog.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromV8ProfLog = importFromV8ProfLog;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

function codeToFrameInfo(code, v8log) {
  if (!code || !code.type) {
    return {
      key: '(unknown type)',
      name: '(unknown type)'
    };
  }

  let name = code.name;

  switch (code.type) {
    case 'CPP':
      {
        const matches = name.match(/[tT] ([^(<]*)/);
        if (matches) name = `(c++) ${matches[1]}`;
        break;
      }

    case 'SHARED_LIB':
      name = '(LIB) ' + name;
      break;

    case 'JS':
      {
        const matches = name.match(/([a-zA-Z0-9\._\-$]*) ([a-zA-Z0-9\.\-_\/$]*):(\d+):(\d+)/);

        if (matches) {
          const file = matches[2];
          const line = parseInt(matches[3], 10);
          const col = parseInt(matches[4], 10);
          const functionName = matches[1].length > 0 ? matches[1] : file ? `(anonymous ${file.split('/').pop()}:${line})` : '(anonymous)';
          return {
            key: name,
            name: functionName,
            file: file.length > 0 ? file : '(unknown file)',
            line,
            col
          };
        }

        break;
      }

    case 'CODE':
      {
        switch (code.kind) {
          case 'LoadIC':
          case 'StoreIC':
          case 'KeyedStoreIC':
          case 'KeyedLoadIC':
          case 'LoadGlobalIC':
          case 'Handler':
            name = '(IC) ' + name;
            break;

          case 'BytecodeHandler':
            name = '(bytecode) ~' + name;
            break;

          case 'Stub':
            name = '(stub) ' + name;
            break;

          case 'Builtin':
            name = '(builtin) ' + name;
            break;

          case 'RegExp':
            name = '(regexp) ' + name;
            break;
        }

        break;
      }

    default:
      {
        name = `(${code.type}) ${name}`;
        break;
      }
  }

  return {
    key: name,
    name
  };
}

function importFromV8ProfLog(v8log) {
  const profile = new _profile.StackListProfileBuilder();
  const sToFrameInfo = new Map();

  function getFrameInfo(t) {
    return (0, _utils.getOrInsert)(sToFrameInfo, t, t => {
      const code = v8log.code[t];
      return codeToFrameInfo(code, v8log);
    });
  }

  let lastTm = 0;
  (0, _utils.sortBy)(v8log.ticks, tick => tick.tm);

  for (let tick of v8log.ticks) {
    const stack = []; // tick.s holds the call stack at the time the sample was taken. The
    // structure is a little strange -- it seems to be capturing both the
    // JavaScript stack & the parallel C++ stack by interleaving the two.
    // Because the stacks might not be the same length, it looks like the
    // shorter stack is padded with indices of -1, so we'll just ignore those
    // stacks.
    //
    // If you change the start index to `let i = tick.s.length - 1` instead,
    // you'll see the C++ stack instead.
    //
    // Mostly the numbers in the stack seem to be indices into the `v8log.code`
    // array, but some of the numbers in the C++ stack seem to be raw memory
    // addresses.

    for (let i = tick.s.length - 2; i >= 0; i -= 2) {
      const id = tick.s[i];
      if (id === -1) continue;

      if (id > v8log.code.length) {
        // Treat this like a memory address
        stack.push({
          key: id,
          name: `0x${id.toString(16)}`
        });
        continue;
      }

      stack.push(getFrameInfo(id));
    }

    profile.appendSampleWithWeight(stack, tick.tm - lastTm);
    lastTm = tick.tm;
  } // Despite the code in the v8 processing library indicating that the
  // timestamps come from a variable called "time_ns", from making empirical
  // recordings, it really seems like these profiles are recording timestamps in
  // microseconds, not nanoseconds.
  // https://github.com/nodejs/node/blob/c39caa997c751473d0c8f50af8c6b14bcd389fa0/deps/v8/tools/profile.js#L1076


  profile.setValueFormatter(new _valueFormatters.TimeFormatter('microseconds'));
  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/linux-tools-perf.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromLinuxPerf = importFromLinuxPerf;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

function* parseEvents(contents) {
  let buffer = [];

  for (let line of contents.splitLines()) {
    if (line === '') {
      yield parseEvent(buffer);
      buffer = [];
    } else buffer.push(line);
  }

  if (buffer.length > 0) yield parseEvent(buffer);
} // rawEvent is splitted into lines


function parseEvent(rawEvent) {
  const lines = rawEvent.filter(l => !/^\s*#/.exec(l));
  const event = {
    command: null,
    processID: null,
    threadID: null,
    time: null,
    eventType: '',
    stack: []
  };
  const firstLine = lines.shift();
  if (!firstLine) return null; // Note: command name may contain spaces, e.g.
  //
  //  V8 WorkerThread 25607 4794564.109216: cycles:

  const eventStartMatch = /^(\S.+?)\s+(\d+)(?:\/?(\d+))?\s+/.exec(firstLine);
  if (!eventStartMatch) return null;
  event.command = eventStartMatch[1]; // default "perf script" output has TID but not PID

  if (eventStartMatch[3]) {
    event.processID = parseInt(eventStartMatch[2], 10);
    event.threadID = parseInt(eventStartMatch[3], 10);
  } else {
    event.threadID = parseInt(eventStartMatch[2], 10);
  }

  const timeMatch = /\s+(\d+\.\d+):\s+/.exec(firstLine);

  if (timeMatch) {
    event.time = parseFloat(timeMatch[1]);
  }

  const evName = /(\S+):\s*$/.exec(firstLine);

  if (evName) {
    event.eventType = evName[1];
  }

  for (let line of lines) {
    const lineMatch = /^\s*(\w+)\s*(.+) \((\S*)\)/.exec(line);
    if (!lineMatch) continue;
    let [, address, symbolName, file] = lineMatch; // Linux 4.8 included symbol offsets in perf script output by default, eg:
    // 7fffb84c9afc cpu_startup_entry+0x800047c022ec ([kernel.kallsyms])
    // strip these off:

    symbolName = symbolName.replace(/\+0x[\da-f]+$/, '');
    event.stack.push({
      address: `0x${address}`,
      symbolName,
      file
    });
  }

  event.stack.reverse();
  return event;
}

function importFromLinuxPerf(contents) {
  const profiles = new Map();
  let eventType = null;

  for (let event of parseEvents(contents)) {
    if (event == null) continue;
    if (eventType != null && eventType != event.eventType) continue;
    if (event.time == null) continue;
    eventType = event.eventType;
    let profileNameParts = [];
    if (event.command) profileNameParts.push(event.command);
    if (event.processID) profileNameParts.push(`pid: ${event.processID}`);
    if (event.threadID) profileNameParts.push(`tid: ${event.threadID}`);
    const profileName = profileNameParts.join(' ');
    const builderState = (0, _utils.getOrInsert)(profiles, profileName, () => {
      const builder = new _profile.StackListProfileBuilder();
      builder.setName(profileName);
      builder.setValueFormatter(new _valueFormatters.TimeFormatter('seconds'));
      return builder;
    });
    const builder = builderState;
    builder.appendSampleWithTimestamp(event.stack.map(({
      symbolName,
      file
    }) => {
      return {
        key: `${symbolName} (${file})`,
        name: symbolName === '[unknown]' ? `??? (${file})` : symbolName,
        file: file
      };
    }), event.time);
  }

  if (profiles.size === 0) {
    return null;
  }

  return {
    name: profiles.size === 1 ? Array.from(profiles.keys())[0] : '',
    indexToView: 0,
    profiles: Array.from((0, _utils.itMap)(profiles.values(), builder => builder.build()))
  };
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/haskell.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromHaskell = importFromHaskell;

var _profile = require("../lib/profile");

var _valueFormatters = require("../lib/value-formatters");

// The profiler already collapses recursion before output so using the JS stack here should be fine
function addToProfile(tree, startVal, profile, infos, attribute) {
  // If the expression never did anything we don't care about it
  if (tree.ticks === 0 && tree.entries === 0 && tree.alloc === 0 && tree.children.length === 0) return startVal;
  let curVal = startVal;
  let frameInfo = infos.get(tree.id);
  profile.enterFrame(frameInfo, curVal);

  for (let child of tree.children) {
    curVal = addToProfile(child, curVal, profile, infos, attribute);
  }

  curVal += attribute(tree);
  profile.leaveFrame(frameInfo, curVal);
  return curVal;
}

function importFromHaskell(haskellProfile) {
  const idToFrameInfo = new Map();

  for (let centre of haskellProfile.cost_centres) {
    const frameInfo = {
      key: centre.id,
      name: `${centre.module}.${centre.label}`
    }; // Ignore things like <entire-module> and <no location info>

    if (!centre.src_loc.startsWith('<')) {
      // This also contains line and column information, but sometimes it contains ranges,
      // and in varying formats, so it's a better experience just to leave it as is
      frameInfo.file = centre.src_loc;
    }

    idToFrameInfo.set(centre.id, frameInfo);
  }

  const timeProfile = new _profile.CallTreeProfileBuilder(haskellProfile.total_ticks);
  addToProfile(haskellProfile.profile, 0, timeProfile, idToFrameInfo, tree => tree.ticks);
  timeProfile.setValueFormatter(new _valueFormatters.TimeFormatter('milliseconds'));
  timeProfile.setName(`${haskellProfile.program} time`);
  const allocProfile = new _profile.CallTreeProfileBuilder(haskellProfile.total_ticks);
  addToProfile(haskellProfile.profile, 0, allocProfile, idToFrameInfo, tree => tree.alloc);
  allocProfile.setValueFormatter(new _valueFormatters.ByteFormatter());
  allocProfile.setName(`${haskellProfile.program} allocation`);
  return {
    name: haskellProfile.program,
    indexToView: 0,
    profiles: [timeProfile.build(), allocProfile.build()]
  };
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/safari.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromSafari = importFromSafari;

var _profile = require("../lib/profile");

var _valueFormatters = require("../lib/value-formatters");

function makeStack(frames) {
  return frames.map(({
    name,
    url,
    line,
    column
  }) => ({
    key: `${name}:${url}:${line}:${column}`,
    file: url,
    line,
    col: column,
    name: name || (url ? `(anonymous ${url.split('/').pop()}:${line})` : '(anonymous)')
  })).reverse();
}

function importFromSafari(contents) {
  if (contents.version !== 1) {
    console.warn(`Unknown Safari profile version ${contents.version}... Might be incompatible.`);
  }

  const {
    recording
  } = contents;
  const {
    sampleStackTraces,
    sampleDurations
  } = recording;
  const count = sampleStackTraces.length;

  if (count < 1) {
    console.warn('Empty profile');
    return null;
  }

  const profileDuration = sampleStackTraces[count - 1].timestamp - sampleStackTraces[0].timestamp + sampleDurations[0];
  const profile = new _profile.StackListProfileBuilder(profileDuration);
  let previousEndTime = Number.MAX_VALUE;
  sampleStackTraces.forEach((sample, i) => {
    const endTime = sample.timestamp;
    const duration = sampleDurations[i];
    const startTime = endTime - duration;
    const idleDurationBefore = startTime - previousEndTime; // FIXME: 2ms is a lot, but Safari's timestamps and durations don't line up very well and will create
    // phantom idle time

    if (idleDurationBefore > 0.002) {
      profile.appendSampleWithWeight([], idleDurationBefore);
    }

    profile.appendSampleWithWeight(makeStack(sample.stackFrames), duration);
    previousEndTime = endTime;
  });
  profile.setValueFormatter(new _valueFormatters.TimeFormatter('seconds'));
  profile.setName(recording.displayName);
  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../node_modules/@protobufjs/aspromise/index.js":[function(require,module,exports) {
"use strict";
module.exports = asPromise;

/**
 * Callback as used by {@link util.asPromise}.
 * @typedef asPromiseCallback
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {...*} params Additional arguments
 * @returns {undefined}
 */

/**
 * Returns a promise from a node-style callback function.
 * @memberof util
 * @param {asPromiseCallback} fn Function to call
 * @param {*} ctx Function context
 * @param {...*} params Function arguments
 * @returns {Promise<*>} Promisified function
 */
function asPromise(fn, ctx/*, varargs */) {
    var params  = new Array(arguments.length - 1),
        offset  = 0,
        index   = 2,
        pending = true;
    while (index < arguments.length)
        params[offset++] = arguments[index++];
    return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err/*, varargs */) {
            if (pending) {
                pending = false;
                if (err)
                    reject(err);
                else {
                    var params = new Array(arguments.length - 1),
                        offset = 0;
                    while (offset < params.length)
                        params[offset++] = arguments[offset];
                    resolve.apply(null, params);
                }
            }
        };
        try {
            fn.apply(ctx || null, params);
        } catch (err) {
            if (pending) {
                pending = false;
                reject(err);
            }
        }
    });
}

},{}],"../node_modules/@protobufjs/base64/index.js":[function(require,module,exports) {
"use strict";

/**
 * A minimal base64 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var base64 = exports;

/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
base64.length = function length(string) {
    var p = string.length;
    if (!p)
        return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
    return Math.ceil(string.length * 3) / 4 - n;
};

// Base64 encoding table
var b64 = new Array(64);

// Base64 decoding table
var s64 = new Array(123);

// 65..90, 97..122, 48..57, 43, 47
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
base64.encode = function encode(buffer, start, end) {
    var parts = null,
        chunk = [];
    var i = 0, // output index
        j = 0, // goto index
        t;     // temporary
    while (start < end) {
        var b = buffer[start++];
        switch (j) {
            case 0:
                chunk[i++] = b64[b >> 2];
                t = (b & 3) << 4;
                j = 1;
                break;
            case 1:
                chunk[i++] = b64[t | b >> 4];
                t = (b & 15) << 2;
                j = 2;
                break;
            case 2:
                chunk[i++] = b64[t | b >> 6];
                chunk[i++] = b64[b & 63];
                j = 0;
                break;
        }
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (j) {
        chunk[i++] = b64[t];
        chunk[i++] = 61;
        if (j === 1)
            chunk[i++] = 61;
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

var invalidEncoding = "invalid encoding";

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
base64.decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0, // goto index
        t;     // temporary
    for (var i = 0; i < string.length;) {
        var c = string.charCodeAt(i++);
        if (c === 61 && j > 1)
            break;
        if ((c = s64[c]) === undefined)
            throw Error(invalidEncoding);
        switch (j) {
            case 0:
                t = c;
                j = 1;
                break;
            case 1:
                buffer[offset++] = t << 2 | (c & 48) >> 4;
                t = c;
                j = 2;
                break;
            case 2:
                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                t = c;
                j = 3;
                break;
            case 3:
                buffer[offset++] = (t & 3) << 6 | c;
                j = 0;
                break;
        }
    }
    if (j === 1)
        throw Error(invalidEncoding);
    return offset - start;
};

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
base64.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
};

},{}],"../node_modules/@protobufjs/eventemitter/index.js":[function(require,module,exports) {
"use strict";
module.exports = EventEmitter;

/**
 * Constructs a new event emitter instance.
 * @classdesc A minimal event emitter.
 * @memberof util
 * @constructor
 */
function EventEmitter() {

    /**
     * Registered listeners.
     * @type {Object.<string,*>}
     * @private
     */
    this._listeners = {};
}

/**
 * Registers an event listener.
 * @param {string} evt Event name
 * @param {function} fn Listener
 * @param {*} [ctx] Listener context
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.on = function on(evt, fn, ctx) {
    (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn  : fn,
        ctx : ctx || this
    });
    return this;
};

/**
 * Removes an event listener or any matching listeners if arguments are omitted.
 * @param {string} [evt] Event name. Removes all listeners if omitted.
 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.off = function off(evt, fn) {
    if (evt === undefined)
        this._listeners = {};
    else {
        if (fn === undefined)
            this._listeners[evt] = [];
        else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length;)
                if (listeners[i].fn === fn)
                    listeners.splice(i, 1);
                else
                    ++i;
        }
    }
    return this;
};

/**
 * Emits an event by calling its listeners with the specified arguments.
 * @param {string} evt Event name
 * @param {...*} args Arguments
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.emit = function emit(evt) {
    var listeners = this._listeners[evt];
    if (listeners) {
        var args = [],
            i = 1;
        for (; i < arguments.length;)
            args.push(arguments[i++]);
        for (i = 0; i < listeners.length;)
            listeners[i].fn.apply(listeners[i++].ctx, args);
    }
    return this;
};

},{}],"../node_modules/@protobufjs/float/index.js":[function(require,module,exports) {
"use strict";

module.exports = factory(factory);

/**
 * Reads / writes floats / doubles from / to buffers.
 * @name util.float
 * @namespace
 */

/**
 * Writes a 32 bit float to a buffer using little endian byte order.
 * @name util.float.writeFloatLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 32 bit float to a buffer using big endian byte order.
 * @name util.float.writeFloatBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 32 bit float from a buffer using little endian byte order.
 * @name util.float.readFloatLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 32 bit float from a buffer using big endian byte order.
 * @name util.float.readFloatBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Writes a 64 bit double to a buffer using little endian byte order.
 * @name util.float.writeDoubleLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 64 bit double to a buffer using big endian byte order.
 * @name util.float.writeDoubleBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 64 bit double from a buffer using little endian byte order.
 * @name util.float.readDoubleLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 64 bit double from a buffer using big endian byte order.
 * @name util.float.readDoubleBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

// Factory function for the purpose of node-based testing in modified global environments
function factory(exports) {

    // float: typed array
    if (typeof Float32Array !== "undefined") (function() {

        var f32 = new Float32Array([ -0 ]),
            f8b = new Uint8Array(f32.buffer),
            le  = f8b[3] === 128;

        function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
        }

        function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        /* istanbul ignore next */
        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

        function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
        }

        function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos    ];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
        }

        /* istanbul ignore next */
        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        /* istanbul ignore next */
        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

    // float: ieee754
    })(); else (function() {

        function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0)
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
            else if (isNaN(val))
                writeUint(2143289344, buf, pos);
            else if (val > 3.4028234663852886e+38) // +-Infinity
                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 1.1754943508222875e-38) // denormal
                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
            else {
                var exponent = Math.floor(Math.log(val) / Math.LN2),
                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
        }

        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

        function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos),
                sign = (uint >> 31) * 2 + 1,
                exponent = uint >>> 23 & 255,
                mantissa = uint & 8388607;
            return exponent === 255
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 1.401298464324817e-45 * mantissa
                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }

        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

    })();

    // double: typed array
    if (typeof Float64Array !== "undefined") (function() {

        var f64 = new Float64Array([-0]),
            f8b = new Uint8Array(f64.buffer),
            le  = f8b[7] === 128;

        function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
        }

        function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        /* istanbul ignore next */
        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

        function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
        }

        function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos    ];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
        }

        /* istanbul ignore next */
        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        /* istanbul ignore next */
        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

    // double: ieee754
    })(); else (function() {

        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0) {
                writeUint(0, buf, pos + off0);
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
            } else if (isNaN(val)) {
                writeUint(0, buf, pos + off0);
                writeUint(2146959360, buf, pos + off1);
            } else if (val > 1.7976931348623157e+308) { // +-Infinity
                writeUint(0, buf, pos + off0);
                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
                var mantissa;
                if (val < 2.2250738585072014e-308) { // denormal
                    mantissa = val / 5e-324;
                    writeUint(mantissa >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
                } else {
                    var exponent = Math.floor(Math.log(val) / Math.LN2);
                    if (exponent === 1024)
                        exponent = 1023;
                    mantissa = val * Math.pow(2, -exponent);
                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
                }
            }
        }

        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0),
                hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1,
                exponent = hi >>> 20 & 2047,
                mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 5e-324 * mantissa
                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }

        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

    })();

    return exports;
}

// uint helpers

function writeUintLE(val, buf, pos) {
    buf[pos    ] =  val        & 255;
    buf[pos + 1] =  val >>> 8  & 255;
    buf[pos + 2] =  val >>> 16 & 255;
    buf[pos + 3] =  val >>> 24;
}

function writeUintBE(val, buf, pos) {
    buf[pos    ] =  val >>> 24;
    buf[pos + 1] =  val >>> 16 & 255;
    buf[pos + 2] =  val >>> 8  & 255;
    buf[pos + 3] =  val        & 255;
}

function readUintLE(buf, pos) {
    return (buf[pos    ]
          | buf[pos + 1] << 8
          | buf[pos + 2] << 16
          | buf[pos + 3] << 24) >>> 0;
}

function readUintBE(buf, pos) {
    return (buf[pos    ] << 24
          | buf[pos + 1] << 16
          | buf[pos + 2] << 8
          | buf[pos + 3]) >>> 0;
}

},{}],"../node_modules/@protobufjs/inquire/index.js":[function(require,module,exports) {
"use strict";
module.exports = inquire;

/**
 * Requires a module only if available.
 * @memberof util
 * @param {string} moduleName Module to require
 * @returns {?Object} Required module if available and not empty, otherwise `null`
 */
function inquire(moduleName) {
    try {
        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}

},{}],"../node_modules/@protobufjs/utf8/index.js":[function(require,module,exports) {
"use strict";

/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = exports;

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
utf8.length = function utf8_length(string) {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
utf8.read = function utf8_read(buffer, start, end) {
    var len = end - start;
    if (len < 1)
        return "";
    var parts = null,
        chunk = [],
        i = 0, // char offset
        t;     // temporary
    while (start < end) {
        t = buffer[start++];
        if (t < 128)
            chunk[i++] = t;
        else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
            chunk[i++] = 0xD800 + (t >> 10);
            chunk[i++] = 0xDC00 + (t & 1023);
        } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
utf8.write = function utf8_write(string, buffer, offset) {
    var start = offset,
        c1, // character 1
        c2; // character 2
    for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6       | 192;
            buffer[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buffer[offset++] = c1 >> 18      | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12      | 224;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        }
    }
    return offset - start;
};

},{}],"../node_modules/@protobufjs/pool/index.js":[function(require,module,exports) {
"use strict";
module.exports = pool;

/**
 * An allocator as used by {@link util.pool}.
 * @typedef PoolAllocator
 * @type {function}
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */

/**
 * A slicer as used by {@link util.pool}.
 * @typedef PoolSlicer
 * @type {function}
 * @param {number} start Start offset
 * @param {number} end End offset
 * @returns {Uint8Array} Buffer slice
 * @this {Uint8Array}
 */

/**
 * A general purpose buffer pool.
 * @memberof util
 * @function
 * @param {PoolAllocator} alloc Allocator
 * @param {PoolSlicer} slice Slicer
 * @param {number} [size=8192] Slab size
 * @returns {PoolAllocator} Pooled allocator
 */
function pool(alloc, slice, size) {
    var SIZE   = size || 8192;
    var MAX    = SIZE >>> 1;
    var slab   = null;
    var offset = SIZE;
    return function pool_alloc(size) {
        if (size < 1 || size > MAX)
            return alloc(size);
        if (offset + size > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size);
        if (offset & 7) // align to 32 bit
            offset = (offset | 7) + 1;
        return buf;
    };
}

},{}],"../node_modules/protobufjs/src/util/longbits.js":[function(require,module,exports) {
"use strict";
module.exports = LongBits;

var util = require("../util/minimal");

/**
 * Constructs new long bits.
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @constructor
 * @param {number} lo Low 32 bits, unsigned
 * @param {number} hi High 32 bits, unsigned
 */
function LongBits(lo, hi) {

    // note that the casts below are theoretically unnecessary as of today, but older statically
    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    /**
     * Low bits.
     * @type {number}
     */
    this.lo = lo >>> 0;

    /**
     * High bits.
     * @type {number}
     */
    this.hi = hi >>> 0;
}

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
var zero = LongBits.zero = new LongBits(0, 0);

zero.toNumber = function() { return 0; };
zero.zzEncode = zero.zzDecode = function() { return this; };
zero.length = function() { return 1; };

/**
 * Zero hash.
 * @memberof util.LongBits
 * @type {string}
 */
var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

/**
 * Constructs new long bits from the specified number.
 * @param {number} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.fromNumber = function fromNumber(value) {
    if (value === 0)
        return zero;
    var sign = value < 0;
    if (sign)
        value = -value;
    var lo = value >>> 0,
        hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
                hi = 0;
        }
    }
    return new LongBits(lo, hi);
};

/**
 * Constructs new long bits from a number, long or string.
 * @param {Long|number|string} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.from = function from(value) {
    if (typeof value === "number")
        return LongBits.fromNumber(value);
    if (util.isString(value)) {
        /* istanbul ignore else */
        if (util.Long)
            value = util.Long.fromString(value);
        else
            return LongBits.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
};

/**
 * Converts this long bits to a possibly unsafe JavaScript number.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {number} Possibly unsafe number
 */
LongBits.prototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0,
            hi = ~this.hi     >>> 0;
        if (!lo)
            hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
};

/**
 * Converts this long bits to a long.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long} Long
 */
LongBits.prototype.toLong = function toLong(unsigned) {
    return util.Long
        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
        /* istanbul ignore next */
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
};

var charCodeAt = String.prototype.charCodeAt;

/**
 * Constructs new long bits from the specified 8 characters long hash.
 * @param {string} hash Hash
 * @returns {util.LongBits} Bits
 */
LongBits.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
        return zero;
    return new LongBits(
        ( charCodeAt.call(hash, 0)
        | charCodeAt.call(hash, 1) << 8
        | charCodeAt.call(hash, 2) << 16
        | charCodeAt.call(hash, 3) << 24) >>> 0
    ,
        ( charCodeAt.call(hash, 4)
        | charCodeAt.call(hash, 5) << 8
        | charCodeAt.call(hash, 6) << 16
        | charCodeAt.call(hash, 7) << 24) >>> 0
    );
};

/**
 * Converts this long bits to a 8 characters long hash.
 * @returns {string} Hash
 */
LongBits.prototype.toHash = function toHash() {
    return String.fromCharCode(
        this.lo        & 255,
        this.lo >>> 8  & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24      ,
        this.hi        & 255,
        this.hi >>> 8  & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
    );
};

/**
 * Zig-zag encodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzEncode = function zzEncode() {
    var mask =   this.hi >> 31;
    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    return this;
};

/**
 * Zig-zag decodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzDecode = function zzDecode() {
    var mask = -(this.lo & 1);
    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    return this;
};

/**
 * Calculates the length of this longbits when encoded as a varint.
 * @returns {number} Length
 */
LongBits.prototype.length = function length() {
    var part0 =  this.lo,
        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
        part2 =  this.hi >>> 24;
    return part2 === 0
         ? part1 === 0
           ? part0 < 16384
             ? part0 < 128 ? 1 : 2
             : part0 < 2097152 ? 3 : 4
           : part1 < 16384
             ? part1 < 128 ? 5 : 6
             : part1 < 2097152 ? 7 : 8
         : part2 < 128 ? 9 : 10;
};

},{"../util/minimal":"../node_modules/protobufjs/src/util/minimal.js"}],"../node_modules/base64-js/index.js":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"../node_modules/ieee754/index.js":[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"../node_modules/isarray/index.js":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"../node_modules/buffer/index.js":[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"../node_modules/base64-js/index.js","ieee754":"../node_modules/ieee754/index.js","isarray":"../node_modules/isarray/index.js","buffer":"../node_modules/buffer/index.js"}],"../node_modules/protobufjs/src/util/minimal.js":[function(require,module,exports) {
var global = arguments[3];
var Buffer = require("buffer").Buffer;
"use strict";
var util = exports;

// used to return a Promise where callback is omitted
util.asPromise = require("@protobufjs/aspromise");

// converts to / from base64 encoded strings
util.base64 = require("@protobufjs/base64");

// base class of rpc.Service
util.EventEmitter = require("@protobufjs/eventemitter");

// float handling accross browsers
util.float = require("@protobufjs/float");

// requires modules optionally and hides the call from bundlers
util.inquire = require("@protobufjs/inquire");

// converts to / from utf8 encoded strings
util.utf8 = require("@protobufjs/utf8");

// provides a node-like buffer pool in the browser
util.pool = require("@protobufjs/pool");

// utility to work with the low and high bits of a 64 bit value
util.LongBits = require("./longbits");

// global object reference
util.global = typeof window !== "undefined" && window
           || typeof global !== "undefined" && global
           || typeof self   !== "undefined" && self
           || this; // eslint-disable-line no-invalid-this

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

/**
 * Whether running within node or not.
 * @memberof util
 * @type {boolean}
 * @const
 */
util.isNode = Boolean(util.global.process && util.global.process.versions && util.global.process.versions.node);

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};

/**
 * Tests if the specified value is a string.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a string
 */
util.isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
};

/**
 * Tests if the specified value is a non-null object.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a non-null object
 */
util.isObject = function isObject(value) {
    return value && typeof value === "object";
};

/**
 * Checks if a property on a message is considered to be present.
 * This is an alias of {@link util.isSet}.
 * @function
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isset =

/**
 * Checks if a property on a message is considered to be present.
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isSet = function isSet(obj, prop) {
    var value = obj[prop];
    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
    return false;
};

/**
 * Any compatible Buffer instance.
 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
 * @interface Buffer
 * @extends Uint8Array
 */

/**
 * Node's Buffer class if available.
 * @type {Constructor<Buffer>}
 */
util.Buffer = (function() {
    try {
        var Buffer = util.inquire("buffer").Buffer;
        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
    } catch (e) {
        /* istanbul ignore next */
        return null;
    }
})();

// Internal alias of or polyfull for Buffer.from.
util._Buffer_from = null;

// Internal alias of or polyfill for Buffer.allocUnsafe.
util._Buffer_allocUnsafe = null;

/**
 * Creates a new buffer of whatever type supported by the environment.
 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
 * @returns {Uint8Array|Buffer} Buffer
 */
util.newBuffer = function newBuffer(sizeOrArray) {
    /* istanbul ignore next */
    return typeof sizeOrArray === "number"
        ? util.Buffer
            ? util._Buffer_allocUnsafe(sizeOrArray)
            : new util.Array(sizeOrArray)
        : util.Buffer
            ? util._Buffer_from(sizeOrArray)
            : typeof Uint8Array === "undefined"
                ? sizeOrArray
                : new Uint8Array(sizeOrArray);
};

/**
 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
 * @type {Constructor<Uint8Array>}
 */
util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

/**
 * Any compatible Long instance.
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 * @interface Long
 * @property {number} low Low bits
 * @property {number} high High bits
 * @property {boolean} unsigned Whether unsigned or not
 */

/**
 * Long.js's Long class if available.
 * @type {Constructor<Long>}
 */
util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
         || /* istanbul ignore next */ util.global.Long
         || util.inquire("long");

/**
 * Regular expression used to verify 2 bit (`bool`) map keys.
 * @type {RegExp}
 * @const
 */
util.key2Re = /^true|false|0|1$/;

/**
 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

/**
 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

/**
 * Converts a number or long to an 8 characters long hash string.
 * @param {Long|number} value Value to convert
 * @returns {string} Hash
 */
util.longToHash = function longToHash(value) {
    return value
        ? util.LongBits.from(value).toHash()
        : util.LongBits.zeroHash;
};

/**
 * Converts an 8 characters long hash string to a long or number.
 * @param {string} hash Hash
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long|number} Original value
 */
util.longFromHash = function longFromHash(hash, unsigned) {
    var bits = util.LongBits.fromHash(hash);
    if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    return bits.toNumber(Boolean(unsigned));
};

/**
 * Merges the properties of the source object into the destination object.
 * @memberof util
 * @param {Object.<string,*>} dst Destination object
 * @param {Object.<string,*>} src Source object
 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
 * @returns {Object.<string,*>} Destination object
 */
function merge(dst, src, ifNotSet) { // used by converters
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === undefined || !ifNotSet)
            dst[keys[i]] = src[keys[i]];
    return dst;
}

util.merge = merge;

/**
 * Converts the first character of a string to lower case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.lcFirst = function lcFirst(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
};

/**
 * Creates a custom error constructor.
 * @memberof util
 * @param {string} name Error name
 * @returns {Constructor<Error>} Custom error constructor
 */
function newError(name) {

    function CustomError(message, properties) {

        if (!(this instanceof CustomError))
            return new CustomError(message, properties);

        // Error.call(this, message);
        // ^ just returns a new error instance because the ctor can be called as a function

        Object.defineProperty(this, "message", { get: function() { return message; } });

        /* istanbul ignore next */
        if (Error.captureStackTrace) // node
            Error.captureStackTrace(this, CustomError);
        else
            Object.defineProperty(this, "stack", { value: (new Error()).stack || "" });

        if (properties)
            merge(this, properties);
    }

    (CustomError.prototype = Object.create(Error.prototype)).constructor = CustomError;

    Object.defineProperty(CustomError.prototype, "name", { get: function() { return name; } });

    CustomError.prototype.toString = function toString() {
        return this.name + ": " + this.message;
    };

    return CustomError;
}

util.newError = newError;

/**
 * Constructs a new protocol error.
 * @classdesc Error subclass indicating a protocol specifc error.
 * @memberof util
 * @extends Error
 * @template T extends Message<T>
 * @constructor
 * @param {string} message Error message
 * @param {Object.<string,*>} [properties] Additional properties
 * @example
 * try {
 *     MyMessage.decode(someBuffer); // throws if required fields are missing
 * } catch (e) {
 *     if (e instanceof ProtocolError && e.instance)
 *         console.log("decoded so far: " + JSON.stringify(e.instance));
 * }
 */
util.ProtocolError = newError("ProtocolError");

/**
 * So far decoded message instance.
 * @name util.ProtocolError#instance
 * @type {Message<T>}
 */

/**
 * A OneOf getter as returned by {@link util.oneOfGetter}.
 * @typedef OneOfGetter
 * @type {function}
 * @returns {string|undefined} Set field name, if any
 */

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
util.oneOfGetter = function getOneOf(fieldNames) {
    var fieldMap = {};
    for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;

    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function() { // eslint-disable-line consistent-return
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
                return keys[i];
    };
};

/**
 * A OneOf setter as returned by {@link util.oneOfSetter}.
 * @typedef OneOfSetter
 * @type {function}
 * @param {string|undefined} value Field name
 * @returns {undefined}
 */

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
util.oneOfSetter = function setOneOf(fieldNames) {

    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
    };
};

/**
 * Default conversion options used for {@link Message#toJSON} implementations.
 *
 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
 *
 * - Longs become strings
 * - Enums become string keys
 * - Bytes become base64 encoded strings
 * - (Sub-)Messages become plain objects
 * - Maps become plain objects with all string keys
 * - Repeated fields become arrays
 * - NaN and Infinity for float and double fields become strings
 *
 * @type {IConversionOptions}
 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
 */
util.toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String,
    json: true
};

// Sets up buffer utility according to the environment (called in index-minimal)
util._configure = function() {
    var Buffer = util.Buffer;
    /* istanbul ignore if */
    if (!Buffer) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
    }
    // because node 4.x buffers are incompatible & immutable
    // see: https://github.com/dcodeIO/protobuf.js/pull/665
    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
        /* istanbul ignore next */
        function Buffer_from(value, encoding) {
            return new Buffer(value, encoding);
        };
    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
        /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
            return new Buffer(size);
        };
};

},{"@protobufjs/aspromise":"../node_modules/@protobufjs/aspromise/index.js","@protobufjs/base64":"../node_modules/@protobufjs/base64/index.js","@protobufjs/eventemitter":"../node_modules/@protobufjs/eventemitter/index.js","@protobufjs/float":"../node_modules/@protobufjs/float/index.js","@protobufjs/inquire":"../node_modules/@protobufjs/inquire/index.js","@protobufjs/utf8":"../node_modules/@protobufjs/utf8/index.js","@protobufjs/pool":"../node_modules/@protobufjs/pool/index.js","./longbits":"../node_modules/protobufjs/src/util/longbits.js","buffer":"../node_modules/buffer/index.js"}],"../node_modules/protobufjs/src/writer.js":[function(require,module,exports) {
"use strict";
module.exports = Writer;

var util      = require("./util/minimal");

var BufferWriter; // cyclic

var LongBits  = util.LongBits,
    base64    = util.base64,
    utf8      = util.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer.create = util.Buffer
    ? function create_buffer_setup() {
        return (Writer.create = function create_buffer() {
            return new BufferWriter();
        })();
    }
    /* istanbul ignore next */
    : function create_array() {
        return new Writer();
    };

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer.alloc = function alloc(size) {
    return new util.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util.Array !== Array)
    Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.int64 = Writer.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sfixed32 = Writer.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sfixed64 = Writer.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.float = function write_float(value) {
    return this._push(util.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.double = function write_double(value) {
    return this._push(util.float.writeDoubleLE, 8, value);
};

var writeBytes = util.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.string = function write_string(value) {
    var len = utf8.length(value);
    return len
        ? this.uint32(len)._push(utf8.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer._configure = function(BufferWriter_) {
    BufferWriter = BufferWriter_;
};

},{"./util/minimal":"../node_modules/protobufjs/src/util/minimal.js"}],"../node_modules/protobufjs/src/writer_buffer.js":[function(require,module,exports) {

"use strict";
module.exports = BufferWriter;

// extends Writer
var Writer = require("./writer");
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util = require("./util/minimal");

var Buffer = util.Buffer;

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Buffer} Buffer
 */
BufferWriter.alloc = function alloc_buffer(size) {
    return (BufferWriter.alloc = util._Buffer_allocUnsafe)(size);
};

var writeBytesBuffer = Buffer && Buffer.prototype instanceof Uint8Array && Buffer.prototype.set.name === "set"
    ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
                           // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
        else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
    };

/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util.isString(value))
        value = util._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util.utf8.write(val, buf, pos);
    else
        buf.utf8Write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

},{"./writer":"../node_modules/protobufjs/src/writer.js","./util/minimal":"../node_modules/protobufjs/src/util/minimal.js"}],"../node_modules/protobufjs/src/reader.js":[function(require,module,exports) {
"use strict";
module.exports = Reader;

var util      = require("./util/minimal");

var BufferReader; // cyclic

var LongBits  = util.LongBits,
    utf8      = util.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    };

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader.create = util.Buffer
    ? function create_buffer_setup(buffer) {
        return (Reader.create = function create_buffer(buffer) {
            return util.Buffer.isBuffer(buffer)
                ? new BufferReader(buffer)
                /* istanbul ignore next */
                : create_array(buffer);
        })(buffer);
    }
    /* istanbul ignore next */
    : create_array;

Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */ util.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);
    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
        ? new this.buf.constructor(0)
        : this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader._configure = function(BufferReader_) {
    BufferReader = BufferReader_;

    var fn = util.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util.merge(Reader.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};

},{"./util/minimal":"../node_modules/protobufjs/src/util/minimal.js"}],"../node_modules/protobufjs/src/reader_buffer.js":[function(require,module,exports) {
"use strict";
module.exports = BufferReader;

// extends Reader
var Reader = require("./reader");
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util = require("./util/minimal");

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

/* istanbul ignore else */
if (util.Buffer)
    BufferReader.prototype._slice = util.Buffer.prototype.slice;

/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

},{"./reader":"../node_modules/protobufjs/src/reader.js","./util/minimal":"../node_modules/protobufjs/src/util/minimal.js"}],"../node_modules/protobufjs/src/rpc/service.js":[function(require,module,exports) {
"use strict";
module.exports = Service;

var util = require("../util/minimal");

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};

},{"../util/minimal":"../node_modules/protobufjs/src/util/minimal.js"}],"../node_modules/protobufjs/src/rpc.js":[function(require,module,exports) {
"use strict";

/**
 * Streaming RPC helpers.
 * @namespace
 */
var rpc = exports;

/**
 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
 * @typedef RPCImpl
 * @type {function}
 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
 * @param {Uint8Array} requestData Request data
 * @param {RPCImplCallback} callback Callback function
 * @returns {undefined}
 * @example
 * function rpcImpl(method, requestData, callback) {
 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
 *         throw Error("no such method");
 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
 *         callback(err, responseData);
 *     });
 * }
 */

/**
 * Node-style callback as used by {@link RPCImpl}.
 * @typedef RPCImplCallback
 * @type {function}
 * @param {Error|null} error Error, if any, otherwise `null`
 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
 * @returns {undefined}
 */

rpc.Service = require("./rpc/service");

},{"./rpc/service":"../node_modules/protobufjs/src/rpc/service.js"}],"../node_modules/protobufjs/src/roots.js":[function(require,module,exports) {
"use strict";
module.exports = {};

/**
 * Named roots.
 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
 * Can also be used manually to make roots available accross modules.
 * @name roots
 * @type {Object.<string,Root>}
 * @example
 * // pbjs -r myroot -o compiled.js ...
 *
 * // in another module:
 * require("./compiled.js");
 *
 * // in any subsequent module:
 * var root = protobuf.roots["myroot"];
 */

},{}],"../node_modules/protobufjs/src/index-minimal.js":[function(require,module,exports) {
"use strict";
var protobuf = exports;

/**
 * Build type, one of `"full"`, `"light"` or `"minimal"`.
 * @name build
 * @type {string}
 * @const
 */
protobuf.build = "minimal";

// Serialization
protobuf.Writer       = require("./writer");
protobuf.BufferWriter = require("./writer_buffer");
protobuf.Reader       = require("./reader");
protobuf.BufferReader = require("./reader_buffer");

// Utility
protobuf.util         = require("./util/minimal");
protobuf.rpc          = require("./rpc");
protobuf.roots        = require("./roots");
protobuf.configure    = configure;

/* istanbul ignore next */
/**
 * Reconfigures the library according to the environment.
 * @returns {undefined}
 */
function configure() {
    protobuf.Reader._configure(protobuf.BufferReader);
    protobuf.util._configure();
}

// Set up buffer utility according to the environment
protobuf.Writer._configure(protobuf.BufferWriter);
configure();

},{"./writer":"../node_modules/protobufjs/src/writer.js","./writer_buffer":"../node_modules/protobufjs/src/writer_buffer.js","./reader":"../node_modules/protobufjs/src/reader.js","./reader_buffer":"../node_modules/protobufjs/src/reader_buffer.js","./util/minimal":"../node_modules/protobufjs/src/util/minimal.js","./rpc":"../node_modules/protobufjs/src/rpc.js","./roots":"../node_modules/protobufjs/src/roots.js"}],"../node_modules/protobufjs/minimal.js":[function(require,module,exports) {
// minimal library entry point.

"use strict";
module.exports = require("./src/index-minimal");

},{"./src/index-minimal":"../node_modules/protobufjs/src/index-minimal.js"}],"../src/import/profile.proto.js":[function(require,module,exports) {
// THIS FILE WAS AUTOMATICALLY GENERATED. DO NOT MODIFY THIS FILE MANUALLY.
//
// To regenerate this file, run the following in the repository root:
//
//    node node_modules/protobufjs/cli/bin/pbjs -t static-module -w commonjs -o src/import/profile.proto.js src/import/profile.proto
//
// Then prepend this comment to the result.

/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
'use strict';

var $protobuf = require('protobufjs/minimal'); // Common aliases


var $Reader = $protobuf.Reader,
    $Writer = $protobuf.Writer,
    $util = $protobuf.util; // Exported root namespace

var $root = $protobuf.roots['default'] || ($protobuf.roots['default'] = {});

$root.perftools = function () {
  /**
   * Namespace perftools.
   * @exports perftools
   * @namespace
   */
  var perftools = {};

  perftools.profiles = function () {
    /**
     * Namespace profiles.
     * @memberof perftools
     * @namespace
     */
    var profiles = {};

    profiles.Profile = function () {
      /**
       * Properties of a Profile.
       * @memberof perftools.profiles
       * @interface IProfile
       * @property {Array.<perftools.profiles.IValueType>|null} [sampleType] Profile sampleType
       * @property {Array.<perftools.profiles.ISample>|null} [sample] Profile sample
       * @property {Array.<perftools.profiles.IMapping>|null} [mapping] Profile mapping
       * @property {Array.<perftools.profiles.ILocation>|null} [location] Profile location
       * @property {Array.<perftools.profiles.IFunction>|null} ["function"] Profile function
       * @property {Array.<string>|null} [stringTable] Profile stringTable
       * @property {number|Long|null} [dropFrames] Profile dropFrames
       * @property {number|Long|null} [keepFrames] Profile keepFrames
       * @property {number|Long|null} [timeNanos] Profile timeNanos
       * @property {number|Long|null} [durationNanos] Profile durationNanos
       * @property {perftools.profiles.IValueType|null} [periodType] Profile periodType
       * @property {number|Long|null} [period] Profile period
       * @property {Array.<number|Long>|null} [comment] Profile comment
       * @property {number|Long|null} [defaultSampleType] Profile defaultSampleType
       */

      /**
       * Constructs a new Profile.
       * @memberof perftools.profiles
       * @classdesc Represents a Profile.
       * @implements IProfile
       * @constructor
       * @param {perftools.profiles.IProfile=} [properties] Properties to set
       */
      function Profile(properties) {
        this.sampleType = [];
        this.sample = [];
        this.mapping = [];
        this.location = [];
        this['function'] = [];
        this.stringTable = [];
        this.comment = [];
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Profile sampleType.
       * @member {Array.<perftools.profiles.IValueType>} sampleType
       * @memberof perftools.profiles.Profile
       * @instance
       */


      Profile.prototype.sampleType = $util.emptyArray;
      /**
       * Profile sample.
       * @member {Array.<perftools.profiles.ISample>} sample
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.sample = $util.emptyArray;
      /**
       * Profile mapping.
       * @member {Array.<perftools.profiles.IMapping>} mapping
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.mapping = $util.emptyArray;
      /**
       * Profile location.
       * @member {Array.<perftools.profiles.ILocation>} location
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.location = $util.emptyArray;
      /**
       * Profile function.
       * @member {Array.<perftools.profiles.IFunction>} function
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype['function'] = $util.emptyArray;
      /**
       * Profile stringTable.
       * @member {Array.<string>} stringTable
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.stringTable = $util.emptyArray;
      /**
       * Profile dropFrames.
       * @member {number|Long} dropFrames
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.dropFrames = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Profile keepFrames.
       * @member {number|Long} keepFrames
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.keepFrames = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Profile timeNanos.
       * @member {number|Long} timeNanos
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.timeNanos = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Profile durationNanos.
       * @member {number|Long} durationNanos
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.durationNanos = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Profile periodType.
       * @member {perftools.profiles.IValueType|null|undefined} periodType
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.periodType = null;
      /**
       * Profile period.
       * @member {number|Long} period
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.period = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Profile comment.
       * @member {Array.<number|Long>} comment
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.comment = $util.emptyArray;
      /**
       * Profile defaultSampleType.
       * @member {number|Long} defaultSampleType
       * @memberof perftools.profiles.Profile
       * @instance
       */

      Profile.prototype.defaultSampleType = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Creates a new Profile instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Profile
       * @static
       * @param {perftools.profiles.IProfile=} [properties] Properties to set
       * @returns {perftools.profiles.Profile} Profile instance
       */

      Profile.create = function create(properties) {
        return new Profile(properties);
      };
      /**
       * Encodes the specified Profile message. Does not implicitly {@link perftools.profiles.Profile.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Profile
       * @static
       * @param {perftools.profiles.IProfile} message Profile message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Profile.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.sampleType != null && message.sampleType.length) for (var i = 0; i < message.sampleType.length; ++i) $root.perftools.profiles.ValueType.encode(message.sampleType[i], writer.uint32(
        /* id 1, wireType 2 =*/
        10).fork()).ldelim();
        if (message.sample != null && message.sample.length) for (var i = 0; i < message.sample.length; ++i) $root.perftools.profiles.Sample.encode(message.sample[i], writer.uint32(
        /* id 2, wireType 2 =*/
        18).fork()).ldelim();
        if (message.mapping != null && message.mapping.length) for (var i = 0; i < message.mapping.length; ++i) $root.perftools.profiles.Mapping.encode(message.mapping[i], writer.uint32(
        /* id 3, wireType 2 =*/
        26).fork()).ldelim();
        if (message.location != null && message.location.length) for (var i = 0; i < message.location.length; ++i) $root.perftools.profiles.Location.encode(message.location[i], writer.uint32(
        /* id 4, wireType 2 =*/
        34).fork()).ldelim();
        if (message['function'] != null && message['function'].length) for (var i = 0; i < message['function'].length; ++i) $root.perftools.profiles.Function.encode(message['function'][i], writer.uint32(
        /* id 5, wireType 2 =*/
        42).fork()).ldelim();
        if (message.stringTable != null && message.stringTable.length) for (var i = 0; i < message.stringTable.length; ++i) writer.uint32(
        /* id 6, wireType 2 =*/
        50).string(message.stringTable[i]);
        if (message.dropFrames != null && message.hasOwnProperty('dropFrames')) writer.uint32(
        /* id 7, wireType 0 =*/
        56).int64(message.dropFrames);
        if (message.keepFrames != null && message.hasOwnProperty('keepFrames')) writer.uint32(
        /* id 8, wireType 0 =*/
        64).int64(message.keepFrames);
        if (message.timeNanos != null && message.hasOwnProperty('timeNanos')) writer.uint32(
        /* id 9, wireType 0 =*/
        72).int64(message.timeNanos);
        if (message.durationNanos != null && message.hasOwnProperty('durationNanos')) writer.uint32(
        /* id 10, wireType 0 =*/
        80).int64(message.durationNanos);
        if (message.periodType != null && message.hasOwnProperty('periodType')) $root.perftools.profiles.ValueType.encode(message.periodType, writer.uint32(
        /* id 11, wireType 2 =*/
        90).fork()).ldelim();
        if (message.period != null && message.hasOwnProperty('period')) writer.uint32(
        /* id 12, wireType 0 =*/
        96).int64(message.period);

        if (message.comment != null && message.comment.length) {
          writer.uint32(
          /* id 13, wireType 2 =*/
          106).fork();

          for (var i = 0; i < message.comment.length; ++i) writer.int64(message.comment[i]);

          writer.ldelim();
        }

        if (message.defaultSampleType != null && message.hasOwnProperty('defaultSampleType')) writer.uint32(
        /* id 14, wireType 0 =*/
        112).int64(message.defaultSampleType);
        return writer;
      };
      /**
       * Encodes the specified Profile message, length delimited. Does not implicitly {@link perftools.profiles.Profile.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Profile
       * @static
       * @param {perftools.profiles.IProfile} message Profile message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Profile.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Profile message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Profile
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Profile} Profile
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Profile.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Profile();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              if (!(message.sampleType && message.sampleType.length)) message.sampleType = [];
              message.sampleType.push($root.perftools.profiles.ValueType.decode(reader, reader.uint32()));
              break;

            case 2:
              if (!(message.sample && message.sample.length)) message.sample = [];
              message.sample.push($root.perftools.profiles.Sample.decode(reader, reader.uint32()));
              break;

            case 3:
              if (!(message.mapping && message.mapping.length)) message.mapping = [];
              message.mapping.push($root.perftools.profiles.Mapping.decode(reader, reader.uint32()));
              break;

            case 4:
              if (!(message.location && message.location.length)) message.location = [];
              message.location.push($root.perftools.profiles.Location.decode(reader, reader.uint32()));
              break;

            case 5:
              if (!(message['function'] && message['function'].length)) message['function'] = [];
              message['function'].push($root.perftools.profiles.Function.decode(reader, reader.uint32()));
              break;

            case 6:
              if (!(message.stringTable && message.stringTable.length)) message.stringTable = [];
              message.stringTable.push(reader.string());
              break;

            case 7:
              message.dropFrames = reader.int64();
              break;

            case 8:
              message.keepFrames = reader.int64();
              break;

            case 9:
              message.timeNanos = reader.int64();
              break;

            case 10:
              message.durationNanos = reader.int64();
              break;

            case 11:
              message.periodType = $root.perftools.profiles.ValueType.decode(reader, reader.uint32());
              break;

            case 12:
              message.period = reader.int64();
              break;

            case 13:
              if (!(message.comment && message.comment.length)) message.comment = [];

              if ((tag & 7) === 2) {
                var end2 = reader.uint32() + reader.pos;

                while (reader.pos < end2) message.comment.push(reader.int64());
              } else message.comment.push(reader.int64());

              break;

            case 14:
              message.defaultSampleType = reader.int64();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Profile message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Profile
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Profile} Profile
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Profile.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Profile message.
       * @function verify
       * @memberof perftools.profiles.Profile
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Profile.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';

        if (message.sampleType != null && message.hasOwnProperty('sampleType')) {
          if (!Array.isArray(message.sampleType)) return 'sampleType: array expected';

          for (var i = 0; i < message.sampleType.length; ++i) {
            var error = $root.perftools.profiles.ValueType.verify(message.sampleType[i]);
            if (error) return 'sampleType.' + error;
          }
        }

        if (message.sample != null && message.hasOwnProperty('sample')) {
          if (!Array.isArray(message.sample)) return 'sample: array expected';

          for (var i = 0; i < message.sample.length; ++i) {
            var error = $root.perftools.profiles.Sample.verify(message.sample[i]);
            if (error) return 'sample.' + error;
          }
        }

        if (message.mapping != null && message.hasOwnProperty('mapping')) {
          if (!Array.isArray(message.mapping)) return 'mapping: array expected';

          for (var i = 0; i < message.mapping.length; ++i) {
            var error = $root.perftools.profiles.Mapping.verify(message.mapping[i]);
            if (error) return 'mapping.' + error;
          }
        }

        if (message.location != null && message.hasOwnProperty('location')) {
          if (!Array.isArray(message.location)) return 'location: array expected';

          for (var i = 0; i < message.location.length; ++i) {
            var error = $root.perftools.profiles.Location.verify(message.location[i]);
            if (error) return 'location.' + error;
          }
        }

        if (message['function'] != null && message.hasOwnProperty('function')) {
          if (!Array.isArray(message['function'])) return 'function: array expected';

          for (var i = 0; i < message['function'].length; ++i) {
            var error = $root.perftools.profiles.Function.verify(message['function'][i]);
            if (error) return 'function.' + error;
          }
        }

        if (message.stringTable != null && message.hasOwnProperty('stringTable')) {
          if (!Array.isArray(message.stringTable)) return 'stringTable: array expected';

          for (var i = 0; i < message.stringTable.length; ++i) if (!$util.isString(message.stringTable[i])) return 'stringTable: string[] expected';
        }

        if (message.dropFrames != null && message.hasOwnProperty('dropFrames')) if (!$util.isInteger(message.dropFrames) && !(message.dropFrames && $util.isInteger(message.dropFrames.low) && $util.isInteger(message.dropFrames.high))) return 'dropFrames: integer|Long expected';
        if (message.keepFrames != null && message.hasOwnProperty('keepFrames')) if (!$util.isInteger(message.keepFrames) && !(message.keepFrames && $util.isInteger(message.keepFrames.low) && $util.isInteger(message.keepFrames.high))) return 'keepFrames: integer|Long expected';
        if (message.timeNanos != null && message.hasOwnProperty('timeNanos')) if (!$util.isInteger(message.timeNanos) && !(message.timeNanos && $util.isInteger(message.timeNanos.low) && $util.isInteger(message.timeNanos.high))) return 'timeNanos: integer|Long expected';
        if (message.durationNanos != null && message.hasOwnProperty('durationNanos')) if (!$util.isInteger(message.durationNanos) && !(message.durationNanos && $util.isInteger(message.durationNanos.low) && $util.isInteger(message.durationNanos.high))) return 'durationNanos: integer|Long expected';

        if (message.periodType != null && message.hasOwnProperty('periodType')) {
          var error = $root.perftools.profiles.ValueType.verify(message.periodType);
          if (error) return 'periodType.' + error;
        }

        if (message.period != null && message.hasOwnProperty('period')) if (!$util.isInteger(message.period) && !(message.period && $util.isInteger(message.period.low) && $util.isInteger(message.period.high))) return 'period: integer|Long expected';

        if (message.comment != null && message.hasOwnProperty('comment')) {
          if (!Array.isArray(message.comment)) return 'comment: array expected';

          for (var i = 0; i < message.comment.length; ++i) if (!$util.isInteger(message.comment[i]) && !(message.comment[i] && $util.isInteger(message.comment[i].low) && $util.isInteger(message.comment[i].high))) return 'comment: integer|Long[] expected';
        }

        if (message.defaultSampleType != null && message.hasOwnProperty('defaultSampleType')) if (!$util.isInteger(message.defaultSampleType) && !(message.defaultSampleType && $util.isInteger(message.defaultSampleType.low) && $util.isInteger(message.defaultSampleType.high))) return 'defaultSampleType: integer|Long expected';
        return null;
      };
      /**
       * Creates a Profile message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Profile
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Profile} Profile
       */


      Profile.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Profile) return object;
        var message = new $root.perftools.profiles.Profile();

        if (object.sampleType) {
          if (!Array.isArray(object.sampleType)) throw TypeError('.perftools.profiles.Profile.sampleType: array expected');
          message.sampleType = [];

          for (var i = 0; i < object.sampleType.length; ++i) {
            if (typeof object.sampleType[i] !== 'object') throw TypeError('.perftools.profiles.Profile.sampleType: object expected');
            message.sampleType[i] = $root.perftools.profiles.ValueType.fromObject(object.sampleType[i]);
          }
        }

        if (object.sample) {
          if (!Array.isArray(object.sample)) throw TypeError('.perftools.profiles.Profile.sample: array expected');
          message.sample = [];

          for (var i = 0; i < object.sample.length; ++i) {
            if (typeof object.sample[i] !== 'object') throw TypeError('.perftools.profiles.Profile.sample: object expected');
            message.sample[i] = $root.perftools.profiles.Sample.fromObject(object.sample[i]);
          }
        }

        if (object.mapping) {
          if (!Array.isArray(object.mapping)) throw TypeError('.perftools.profiles.Profile.mapping: array expected');
          message.mapping = [];

          for (var i = 0; i < object.mapping.length; ++i) {
            if (typeof object.mapping[i] !== 'object') throw TypeError('.perftools.profiles.Profile.mapping: object expected');
            message.mapping[i] = $root.perftools.profiles.Mapping.fromObject(object.mapping[i]);
          }
        }

        if (object.location) {
          if (!Array.isArray(object.location)) throw TypeError('.perftools.profiles.Profile.location: array expected');
          message.location = [];

          for (var i = 0; i < object.location.length; ++i) {
            if (typeof object.location[i] !== 'object') throw TypeError('.perftools.profiles.Profile.location: object expected');
            message.location[i] = $root.perftools.profiles.Location.fromObject(object.location[i]);
          }
        }

        if (object['function']) {
          if (!Array.isArray(object['function'])) throw TypeError('.perftools.profiles.Profile.function: array expected');
          message['function'] = [];

          for (var i = 0; i < object['function'].length; ++i) {
            if (typeof object['function'][i] !== 'object') throw TypeError('.perftools.profiles.Profile.function: object expected');
            message['function'][i] = $root.perftools.profiles.Function.fromObject(object['function'][i]);
          }
        }

        if (object.stringTable) {
          if (!Array.isArray(object.stringTable)) throw TypeError('.perftools.profiles.Profile.stringTable: array expected');
          message.stringTable = [];

          for (var i = 0; i < object.stringTable.length; ++i) message.stringTable[i] = String(object.stringTable[i]);
        }

        if (object.dropFrames != null) if ($util.Long) (message.dropFrames = $util.Long.fromValue(object.dropFrames)).unsigned = false;else if (typeof object.dropFrames === 'string') message.dropFrames = parseInt(object.dropFrames, 10);else if (typeof object.dropFrames === 'number') message.dropFrames = object.dropFrames;else if (typeof object.dropFrames === 'object') message.dropFrames = new $util.LongBits(object.dropFrames.low >>> 0, object.dropFrames.high >>> 0).toNumber();
        if (object.keepFrames != null) if ($util.Long) (message.keepFrames = $util.Long.fromValue(object.keepFrames)).unsigned = false;else if (typeof object.keepFrames === 'string') message.keepFrames = parseInt(object.keepFrames, 10);else if (typeof object.keepFrames === 'number') message.keepFrames = object.keepFrames;else if (typeof object.keepFrames === 'object') message.keepFrames = new $util.LongBits(object.keepFrames.low >>> 0, object.keepFrames.high >>> 0).toNumber();
        if (object.timeNanos != null) if ($util.Long) (message.timeNanos = $util.Long.fromValue(object.timeNanos)).unsigned = false;else if (typeof object.timeNanos === 'string') message.timeNanos = parseInt(object.timeNanos, 10);else if (typeof object.timeNanos === 'number') message.timeNanos = object.timeNanos;else if (typeof object.timeNanos === 'object') message.timeNanos = new $util.LongBits(object.timeNanos.low >>> 0, object.timeNanos.high >>> 0).toNumber();
        if (object.durationNanos != null) if ($util.Long) (message.durationNanos = $util.Long.fromValue(object.durationNanos)).unsigned = false;else if (typeof object.durationNanos === 'string') message.durationNanos = parseInt(object.durationNanos, 10);else if (typeof object.durationNanos === 'number') message.durationNanos = object.durationNanos;else if (typeof object.durationNanos === 'object') message.durationNanos = new $util.LongBits(object.durationNanos.low >>> 0, object.durationNanos.high >>> 0).toNumber();

        if (object.periodType != null) {
          if (typeof object.periodType !== 'object') throw TypeError('.perftools.profiles.Profile.periodType: object expected');
          message.periodType = $root.perftools.profiles.ValueType.fromObject(object.periodType);
        }

        if (object.period != null) if ($util.Long) (message.period = $util.Long.fromValue(object.period)).unsigned = false;else if (typeof object.period === 'string') message.period = parseInt(object.period, 10);else if (typeof object.period === 'number') message.period = object.period;else if (typeof object.period === 'object') message.period = new $util.LongBits(object.period.low >>> 0, object.period.high >>> 0).toNumber();

        if (object.comment) {
          if (!Array.isArray(object.comment)) throw TypeError('.perftools.profiles.Profile.comment: array expected');
          message.comment = [];

          for (var i = 0; i < object.comment.length; ++i) if ($util.Long) (message.comment[i] = $util.Long.fromValue(object.comment[i])).unsigned = false;else if (typeof object.comment[i] === 'string') message.comment[i] = parseInt(object.comment[i], 10);else if (typeof object.comment[i] === 'number') message.comment[i] = object.comment[i];else if (typeof object.comment[i] === 'object') message.comment[i] = new $util.LongBits(object.comment[i].low >>> 0, object.comment[i].high >>> 0).toNumber();
        }

        if (object.defaultSampleType != null) if ($util.Long) (message.defaultSampleType = $util.Long.fromValue(object.defaultSampleType)).unsigned = false;else if (typeof object.defaultSampleType === 'string') message.defaultSampleType = parseInt(object.defaultSampleType, 10);else if (typeof object.defaultSampleType === 'number') message.defaultSampleType = object.defaultSampleType;else if (typeof object.defaultSampleType === 'object') message.defaultSampleType = new $util.LongBits(object.defaultSampleType.low >>> 0, object.defaultSampleType.high >>> 0).toNumber();
        return message;
      };
      /**
       * Creates a plain object from a Profile message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Profile
       * @static
       * @param {perftools.profiles.Profile} message Profile
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Profile.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.arrays || options.defaults) {
          object.sampleType = [];
          object.sample = [];
          object.mapping = [];
          object.location = [];
          object['function'] = [];
          object.stringTable = [];
          object.comment = [];
        }

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.dropFrames = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.dropFrames = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.keepFrames = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.keepFrames = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.timeNanos = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.timeNanos = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.durationNanos = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.durationNanos = options.longs === String ? '0' : 0;

          object.periodType = null;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.period = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.period = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.defaultSampleType = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.defaultSampleType = options.longs === String ? '0' : 0;
        }

        if (message.sampleType && message.sampleType.length) {
          object.sampleType = [];

          for (var j = 0; j < message.sampleType.length; ++j) object.sampleType[j] = $root.perftools.profiles.ValueType.toObject(message.sampleType[j], options);
        }

        if (message.sample && message.sample.length) {
          object.sample = [];

          for (var j = 0; j < message.sample.length; ++j) object.sample[j] = $root.perftools.profiles.Sample.toObject(message.sample[j], options);
        }

        if (message.mapping && message.mapping.length) {
          object.mapping = [];

          for (var j = 0; j < message.mapping.length; ++j) object.mapping[j] = $root.perftools.profiles.Mapping.toObject(message.mapping[j], options);
        }

        if (message.location && message.location.length) {
          object.location = [];

          for (var j = 0; j < message.location.length; ++j) object.location[j] = $root.perftools.profiles.Location.toObject(message.location[j], options);
        }

        if (message['function'] && message['function'].length) {
          object['function'] = [];

          for (var j = 0; j < message['function'].length; ++j) object['function'][j] = $root.perftools.profiles.Function.toObject(message['function'][j], options);
        }

        if (message.stringTable && message.stringTable.length) {
          object.stringTable = [];

          for (var j = 0; j < message.stringTable.length; ++j) object.stringTable[j] = message.stringTable[j];
        }

        if (message.dropFrames != null && message.hasOwnProperty('dropFrames')) if (typeof message.dropFrames === 'number') object.dropFrames = options.longs === String ? String(message.dropFrames) : message.dropFrames;else object.dropFrames = options.longs === String ? $util.Long.prototype.toString.call(message.dropFrames) : options.longs === Number ? new $util.LongBits(message.dropFrames.low >>> 0, message.dropFrames.high >>> 0).toNumber() : message.dropFrames;
        if (message.keepFrames != null && message.hasOwnProperty('keepFrames')) if (typeof message.keepFrames === 'number') object.keepFrames = options.longs === String ? String(message.keepFrames) : message.keepFrames;else object.keepFrames = options.longs === String ? $util.Long.prototype.toString.call(message.keepFrames) : options.longs === Number ? new $util.LongBits(message.keepFrames.low >>> 0, message.keepFrames.high >>> 0).toNumber() : message.keepFrames;
        if (message.timeNanos != null && message.hasOwnProperty('timeNanos')) if (typeof message.timeNanos === 'number') object.timeNanos = options.longs === String ? String(message.timeNanos) : message.timeNanos;else object.timeNanos = options.longs === String ? $util.Long.prototype.toString.call(message.timeNanos) : options.longs === Number ? new $util.LongBits(message.timeNanos.low >>> 0, message.timeNanos.high >>> 0).toNumber() : message.timeNanos;
        if (message.durationNanos != null && message.hasOwnProperty('durationNanos')) if (typeof message.durationNanos === 'number') object.durationNanos = options.longs === String ? String(message.durationNanos) : message.durationNanos;else object.durationNanos = options.longs === String ? $util.Long.prototype.toString.call(message.durationNanos) : options.longs === Number ? new $util.LongBits(message.durationNanos.low >>> 0, message.durationNanos.high >>> 0).toNumber() : message.durationNanos;
        if (message.periodType != null && message.hasOwnProperty('periodType')) object.periodType = $root.perftools.profiles.ValueType.toObject(message.periodType, options);
        if (message.period != null && message.hasOwnProperty('period')) if (typeof message.period === 'number') object.period = options.longs === String ? String(message.period) : message.period;else object.period = options.longs === String ? $util.Long.prototype.toString.call(message.period) : options.longs === Number ? new $util.LongBits(message.period.low >>> 0, message.period.high >>> 0).toNumber() : message.period;

        if (message.comment && message.comment.length) {
          object.comment = [];

          for (var j = 0; j < message.comment.length; ++j) if (typeof message.comment[j] === 'number') object.comment[j] = options.longs === String ? String(message.comment[j]) : message.comment[j];else object.comment[j] = options.longs === String ? $util.Long.prototype.toString.call(message.comment[j]) : options.longs === Number ? new $util.LongBits(message.comment[j].low >>> 0, message.comment[j].high >>> 0).toNumber() : message.comment[j];
        }

        if (message.defaultSampleType != null && message.hasOwnProperty('defaultSampleType')) if (typeof message.defaultSampleType === 'number') object.defaultSampleType = options.longs === String ? String(message.defaultSampleType) : message.defaultSampleType;else object.defaultSampleType = options.longs === String ? $util.Long.prototype.toString.call(message.defaultSampleType) : options.longs === Number ? new $util.LongBits(message.defaultSampleType.low >>> 0, message.defaultSampleType.high >>> 0).toNumber() : message.defaultSampleType;
        return object;
      };
      /**
       * Converts this Profile to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Profile
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Profile.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Profile;
    }();

    profiles.ValueType = function () {
      /**
       * Properties of a ValueType.
       * @memberof perftools.profiles
       * @interface IValueType
       * @property {number|Long|null} [type] ValueType type
       * @property {number|Long|null} [unit] ValueType unit
       */

      /**
       * Constructs a new ValueType.
       * @memberof perftools.profiles
       * @classdesc Represents a ValueType.
       * @implements IValueType
       * @constructor
       * @param {perftools.profiles.IValueType=} [properties] Properties to set
       */
      function ValueType(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * ValueType type.
       * @member {number|Long} type
       * @memberof perftools.profiles.ValueType
       * @instance
       */


      ValueType.prototype.type = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * ValueType unit.
       * @member {number|Long} unit
       * @memberof perftools.profiles.ValueType
       * @instance
       */

      ValueType.prototype.unit = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Creates a new ValueType instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {perftools.profiles.IValueType=} [properties] Properties to set
       * @returns {perftools.profiles.ValueType} ValueType instance
       */

      ValueType.create = function create(properties) {
        return new ValueType(properties);
      };
      /**
       * Encodes the specified ValueType message. Does not implicitly {@link perftools.profiles.ValueType.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {perftools.profiles.IValueType} message ValueType message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      ValueType.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty('type')) writer.uint32(
        /* id 1, wireType 0 =*/
        8).int64(message.type);
        if (message.unit != null && message.hasOwnProperty('unit')) writer.uint32(
        /* id 2, wireType 0 =*/
        16).int64(message.unit);
        return writer;
      };
      /**
       * Encodes the specified ValueType message, length delimited. Does not implicitly {@link perftools.profiles.ValueType.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {perftools.profiles.IValueType} message ValueType message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      ValueType.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a ValueType message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.ValueType} ValueType
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      ValueType.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.ValueType();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              message.type = reader.int64();
              break;

            case 2:
              message.unit = reader.int64();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a ValueType message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.ValueType} ValueType
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      ValueType.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a ValueType message.
       * @function verify
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      ValueType.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';
        if (message.type != null && message.hasOwnProperty('type')) if (!$util.isInteger(message.type) && !(message.type && $util.isInteger(message.type.low) && $util.isInteger(message.type.high))) return 'type: integer|Long expected';
        if (message.unit != null && message.hasOwnProperty('unit')) if (!$util.isInteger(message.unit) && !(message.unit && $util.isInteger(message.unit.low) && $util.isInteger(message.unit.high))) return 'unit: integer|Long expected';
        return null;
      };
      /**
       * Creates a ValueType message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.ValueType} ValueType
       */


      ValueType.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.ValueType) return object;
        var message = new $root.perftools.profiles.ValueType();
        if (object.type != null) if ($util.Long) (message.type = $util.Long.fromValue(object.type)).unsigned = false;else if (typeof object.type === 'string') message.type = parseInt(object.type, 10);else if (typeof object.type === 'number') message.type = object.type;else if (typeof object.type === 'object') message.type = new $util.LongBits(object.type.low >>> 0, object.type.high >>> 0).toNumber();
        if (object.unit != null) if ($util.Long) (message.unit = $util.Long.fromValue(object.unit)).unsigned = false;else if (typeof object.unit === 'string') message.unit = parseInt(object.unit, 10);else if (typeof object.unit === 'number') message.unit = object.unit;else if (typeof object.unit === 'object') message.unit = new $util.LongBits(object.unit.low >>> 0, object.unit.high >>> 0).toNumber();
        return message;
      };
      /**
       * Creates a plain object from a ValueType message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.ValueType
       * @static
       * @param {perftools.profiles.ValueType} message ValueType
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      ValueType.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.type = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.type = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.unit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.unit = options.longs === String ? '0' : 0;
        }

        if (message.type != null && message.hasOwnProperty('type')) if (typeof message.type === 'number') object.type = options.longs === String ? String(message.type) : message.type;else object.type = options.longs === String ? $util.Long.prototype.toString.call(message.type) : options.longs === Number ? new $util.LongBits(message.type.low >>> 0, message.type.high >>> 0).toNumber() : message.type;
        if (message.unit != null && message.hasOwnProperty('unit')) if (typeof message.unit === 'number') object.unit = options.longs === String ? String(message.unit) : message.unit;else object.unit = options.longs === String ? $util.Long.prototype.toString.call(message.unit) : options.longs === Number ? new $util.LongBits(message.unit.low >>> 0, message.unit.high >>> 0).toNumber() : message.unit;
        return object;
      };
      /**
       * Converts this ValueType to JSON.
       * @function toJSON
       * @memberof perftools.profiles.ValueType
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      ValueType.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return ValueType;
    }();

    profiles.Sample = function () {
      /**
       * Properties of a Sample.
       * @memberof perftools.profiles
       * @interface ISample
       * @property {Array.<number|Long>|null} [locationId] Sample locationId
       * @property {Array.<number|Long>|null} [value] Sample value
       * @property {Array.<perftools.profiles.ILabel>|null} [label] Sample label
       */

      /**
       * Constructs a new Sample.
       * @memberof perftools.profiles
       * @classdesc Represents a Sample.
       * @implements ISample
       * @constructor
       * @param {perftools.profiles.ISample=} [properties] Properties to set
       */
      function Sample(properties) {
        this.locationId = [];
        this.value = [];
        this.label = [];
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Sample locationId.
       * @member {Array.<number|Long>} locationId
       * @memberof perftools.profiles.Sample
       * @instance
       */


      Sample.prototype.locationId = $util.emptyArray;
      /**
       * Sample value.
       * @member {Array.<number|Long>} value
       * @memberof perftools.profiles.Sample
       * @instance
       */

      Sample.prototype.value = $util.emptyArray;
      /**
       * Sample label.
       * @member {Array.<perftools.profiles.ILabel>} label
       * @memberof perftools.profiles.Sample
       * @instance
       */

      Sample.prototype.label = $util.emptyArray;
      /**
       * Creates a new Sample instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Sample
       * @static
       * @param {perftools.profiles.ISample=} [properties] Properties to set
       * @returns {perftools.profiles.Sample} Sample instance
       */

      Sample.create = function create(properties) {
        return new Sample(properties);
      };
      /**
       * Encodes the specified Sample message. Does not implicitly {@link perftools.profiles.Sample.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Sample
       * @static
       * @param {perftools.profiles.ISample} message Sample message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Sample.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();

        if (message.locationId != null && message.locationId.length) {
          writer.uint32(
          /* id 1, wireType 2 =*/
          10).fork();

          for (var i = 0; i < message.locationId.length; ++i) writer.uint64(message.locationId[i]);

          writer.ldelim();
        }

        if (message.value != null && message.value.length) {
          writer.uint32(
          /* id 2, wireType 2 =*/
          18).fork();

          for (var i = 0; i < message.value.length; ++i) writer.int64(message.value[i]);

          writer.ldelim();
        }

        if (message.label != null && message.label.length) for (var i = 0; i < message.label.length; ++i) $root.perftools.profiles.Label.encode(message.label[i], writer.uint32(
        /* id 3, wireType 2 =*/
        26).fork()).ldelim();
        return writer;
      };
      /**
       * Encodes the specified Sample message, length delimited. Does not implicitly {@link perftools.profiles.Sample.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Sample
       * @static
       * @param {perftools.profiles.ISample} message Sample message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Sample.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Sample message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Sample
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Sample} Sample
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Sample.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Sample();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              if (!(message.locationId && message.locationId.length)) message.locationId = [];

              if ((tag & 7) === 2) {
                var end2 = reader.uint32() + reader.pos;

                while (reader.pos < end2) message.locationId.push(reader.uint64());
              } else message.locationId.push(reader.uint64());

              break;

            case 2:
              if (!(message.value && message.value.length)) message.value = [];

              if ((tag & 7) === 2) {
                var end2 = reader.uint32() + reader.pos;

                while (reader.pos < end2) message.value.push(reader.int64());
              } else message.value.push(reader.int64());

              break;

            case 3:
              if (!(message.label && message.label.length)) message.label = [];
              message.label.push($root.perftools.profiles.Label.decode(reader, reader.uint32()));
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Sample message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Sample
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Sample} Sample
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Sample.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Sample message.
       * @function verify
       * @memberof perftools.profiles.Sample
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Sample.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';

        if (message.locationId != null && message.hasOwnProperty('locationId')) {
          if (!Array.isArray(message.locationId)) return 'locationId: array expected';

          for (var i = 0; i < message.locationId.length; ++i) if (!$util.isInteger(message.locationId[i]) && !(message.locationId[i] && $util.isInteger(message.locationId[i].low) && $util.isInteger(message.locationId[i].high))) return 'locationId: integer|Long[] expected';
        }

        if (message.value != null && message.hasOwnProperty('value')) {
          if (!Array.isArray(message.value)) return 'value: array expected';

          for (var i = 0; i < message.value.length; ++i) if (!$util.isInteger(message.value[i]) && !(message.value[i] && $util.isInteger(message.value[i].low) && $util.isInteger(message.value[i].high))) return 'value: integer|Long[] expected';
        }

        if (message.label != null && message.hasOwnProperty('label')) {
          if (!Array.isArray(message.label)) return 'label: array expected';

          for (var i = 0; i < message.label.length; ++i) {
            var error = $root.perftools.profiles.Label.verify(message.label[i]);
            if (error) return 'label.' + error;
          }
        }

        return null;
      };
      /**
       * Creates a Sample message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Sample
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Sample} Sample
       */


      Sample.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Sample) return object;
        var message = new $root.perftools.profiles.Sample();

        if (object.locationId) {
          if (!Array.isArray(object.locationId)) throw TypeError('.perftools.profiles.Sample.locationId: array expected');
          message.locationId = [];

          for (var i = 0; i < object.locationId.length; ++i) if ($util.Long) (message.locationId[i] = $util.Long.fromValue(object.locationId[i])).unsigned = true;else if (typeof object.locationId[i] === 'string') message.locationId[i] = parseInt(object.locationId[i], 10);else if (typeof object.locationId[i] === 'number') message.locationId[i] = object.locationId[i];else if (typeof object.locationId[i] === 'object') message.locationId[i] = new $util.LongBits(object.locationId[i].low >>> 0, object.locationId[i].high >>> 0).toNumber(true);
        }

        if (object.value) {
          if (!Array.isArray(object.value)) throw TypeError('.perftools.profiles.Sample.value: array expected');
          message.value = [];

          for (var i = 0; i < object.value.length; ++i) if ($util.Long) (message.value[i] = $util.Long.fromValue(object.value[i])).unsigned = false;else if (typeof object.value[i] === 'string') message.value[i] = parseInt(object.value[i], 10);else if (typeof object.value[i] === 'number') message.value[i] = object.value[i];else if (typeof object.value[i] === 'object') message.value[i] = new $util.LongBits(object.value[i].low >>> 0, object.value[i].high >>> 0).toNumber();
        }

        if (object.label) {
          if (!Array.isArray(object.label)) throw TypeError('.perftools.profiles.Sample.label: array expected');
          message.label = [];

          for (var i = 0; i < object.label.length; ++i) {
            if (typeof object.label[i] !== 'object') throw TypeError('.perftools.profiles.Sample.label: object expected');
            message.label[i] = $root.perftools.profiles.Label.fromObject(object.label[i]);
          }
        }

        return message;
      };
      /**
       * Creates a plain object from a Sample message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Sample
       * @static
       * @param {perftools.profiles.Sample} message Sample
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Sample.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.arrays || options.defaults) {
          object.locationId = [];
          object.value = [];
          object.label = [];
        }

        if (message.locationId && message.locationId.length) {
          object.locationId = [];

          for (var j = 0; j < message.locationId.length; ++j) if (typeof message.locationId[j] === 'number') object.locationId[j] = options.longs === String ? String(message.locationId[j]) : message.locationId[j];else object.locationId[j] = options.longs === String ? $util.Long.prototype.toString.call(message.locationId[j]) : options.longs === Number ? new $util.LongBits(message.locationId[j].low >>> 0, message.locationId[j].high >>> 0).toNumber(true) : message.locationId[j];
        }

        if (message.value && message.value.length) {
          object.value = [];

          for (var j = 0; j < message.value.length; ++j) if (typeof message.value[j] === 'number') object.value[j] = options.longs === String ? String(message.value[j]) : message.value[j];else object.value[j] = options.longs === String ? $util.Long.prototype.toString.call(message.value[j]) : options.longs === Number ? new $util.LongBits(message.value[j].low >>> 0, message.value[j].high >>> 0).toNumber() : message.value[j];
        }

        if (message.label && message.label.length) {
          object.label = [];

          for (var j = 0; j < message.label.length; ++j) object.label[j] = $root.perftools.profiles.Label.toObject(message.label[j], options);
        }

        return object;
      };
      /**
       * Converts this Sample to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Sample
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Sample.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Sample;
    }();

    profiles.Label = function () {
      /**
       * Properties of a Label.
       * @memberof perftools.profiles
       * @interface ILabel
       * @property {number|Long|null} [key] Label key
       * @property {number|Long|null} [str] Label str
       * @property {number|Long|null} [num] Label num
       * @property {number|Long|null} [numUnit] Label numUnit
       */

      /**
       * Constructs a new Label.
       * @memberof perftools.profiles
       * @classdesc Represents a Label.
       * @implements ILabel
       * @constructor
       * @param {perftools.profiles.ILabel=} [properties] Properties to set
       */
      function Label(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Label key.
       * @member {number|Long} key
       * @memberof perftools.profiles.Label
       * @instance
       */


      Label.prototype.key = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Label str.
       * @member {number|Long} str
       * @memberof perftools.profiles.Label
       * @instance
       */

      Label.prototype.str = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Label num.
       * @member {number|Long} num
       * @memberof perftools.profiles.Label
       * @instance
       */

      Label.prototype.num = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Label numUnit.
       * @member {number|Long} numUnit
       * @memberof perftools.profiles.Label
       * @instance
       */

      Label.prototype.numUnit = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Creates a new Label instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Label
       * @static
       * @param {perftools.profiles.ILabel=} [properties] Properties to set
       * @returns {perftools.profiles.Label} Label instance
       */

      Label.create = function create(properties) {
        return new Label(properties);
      };
      /**
       * Encodes the specified Label message. Does not implicitly {@link perftools.profiles.Label.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Label
       * @static
       * @param {perftools.profiles.ILabel} message Label message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Label.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.key != null && message.hasOwnProperty('key')) writer.uint32(
        /* id 1, wireType 0 =*/
        8).int64(message.key);
        if (message.str != null && message.hasOwnProperty('str')) writer.uint32(
        /* id 2, wireType 0 =*/
        16).int64(message.str);
        if (message.num != null && message.hasOwnProperty('num')) writer.uint32(
        /* id 3, wireType 0 =*/
        24).int64(message.num);
        if (message.numUnit != null && message.hasOwnProperty('numUnit')) writer.uint32(
        /* id 4, wireType 0 =*/
        32).int64(message.numUnit);
        return writer;
      };
      /**
       * Encodes the specified Label message, length delimited. Does not implicitly {@link perftools.profiles.Label.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Label
       * @static
       * @param {perftools.profiles.ILabel} message Label message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Label.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Label message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Label
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Label} Label
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Label.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Label();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              message.key = reader.int64();
              break;

            case 2:
              message.str = reader.int64();
              break;

            case 3:
              message.num = reader.int64();
              break;

            case 4:
              message.numUnit = reader.int64();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Label message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Label
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Label} Label
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Label.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Label message.
       * @function verify
       * @memberof perftools.profiles.Label
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Label.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';
        if (message.key != null && message.hasOwnProperty('key')) if (!$util.isInteger(message.key) && !(message.key && $util.isInteger(message.key.low) && $util.isInteger(message.key.high))) return 'key: integer|Long expected';
        if (message.str != null && message.hasOwnProperty('str')) if (!$util.isInteger(message.str) && !(message.str && $util.isInteger(message.str.low) && $util.isInteger(message.str.high))) return 'str: integer|Long expected';
        if (message.num != null && message.hasOwnProperty('num')) if (!$util.isInteger(message.num) && !(message.num && $util.isInteger(message.num.low) && $util.isInteger(message.num.high))) return 'num: integer|Long expected';
        if (message.numUnit != null && message.hasOwnProperty('numUnit')) if (!$util.isInteger(message.numUnit) && !(message.numUnit && $util.isInteger(message.numUnit.low) && $util.isInteger(message.numUnit.high))) return 'numUnit: integer|Long expected';
        return null;
      };
      /**
       * Creates a Label message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Label
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Label} Label
       */


      Label.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Label) return object;
        var message = new $root.perftools.profiles.Label();
        if (object.key != null) if ($util.Long) (message.key = $util.Long.fromValue(object.key)).unsigned = false;else if (typeof object.key === 'string') message.key = parseInt(object.key, 10);else if (typeof object.key === 'number') message.key = object.key;else if (typeof object.key === 'object') message.key = new $util.LongBits(object.key.low >>> 0, object.key.high >>> 0).toNumber();
        if (object.str != null) if ($util.Long) (message.str = $util.Long.fromValue(object.str)).unsigned = false;else if (typeof object.str === 'string') message.str = parseInt(object.str, 10);else if (typeof object.str === 'number') message.str = object.str;else if (typeof object.str === 'object') message.str = new $util.LongBits(object.str.low >>> 0, object.str.high >>> 0).toNumber();
        if (object.num != null) if ($util.Long) (message.num = $util.Long.fromValue(object.num)).unsigned = false;else if (typeof object.num === 'string') message.num = parseInt(object.num, 10);else if (typeof object.num === 'number') message.num = object.num;else if (typeof object.num === 'object') message.num = new $util.LongBits(object.num.low >>> 0, object.num.high >>> 0).toNumber();
        if (object.numUnit != null) if ($util.Long) (message.numUnit = $util.Long.fromValue(object.numUnit)).unsigned = false;else if (typeof object.numUnit === 'string') message.numUnit = parseInt(object.numUnit, 10);else if (typeof object.numUnit === 'number') message.numUnit = object.numUnit;else if (typeof object.numUnit === 'object') message.numUnit = new $util.LongBits(object.numUnit.low >>> 0, object.numUnit.high >>> 0).toNumber();
        return message;
      };
      /**
       * Creates a plain object from a Label message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Label
       * @static
       * @param {perftools.profiles.Label} message Label
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Label.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.key = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.key = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.str = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.str = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.num = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.num = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.numUnit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.numUnit = options.longs === String ? '0' : 0;
        }

        if (message.key != null && message.hasOwnProperty('key')) if (typeof message.key === 'number') object.key = options.longs === String ? String(message.key) : message.key;else object.key = options.longs === String ? $util.Long.prototype.toString.call(message.key) : options.longs === Number ? new $util.LongBits(message.key.low >>> 0, message.key.high >>> 0).toNumber() : message.key;
        if (message.str != null && message.hasOwnProperty('str')) if (typeof message.str === 'number') object.str = options.longs === String ? String(message.str) : message.str;else object.str = options.longs === String ? $util.Long.prototype.toString.call(message.str) : options.longs === Number ? new $util.LongBits(message.str.low >>> 0, message.str.high >>> 0).toNumber() : message.str;
        if (message.num != null && message.hasOwnProperty('num')) if (typeof message.num === 'number') object.num = options.longs === String ? String(message.num) : message.num;else object.num = options.longs === String ? $util.Long.prototype.toString.call(message.num) : options.longs === Number ? new $util.LongBits(message.num.low >>> 0, message.num.high >>> 0).toNumber() : message.num;
        if (message.numUnit != null && message.hasOwnProperty('numUnit')) if (typeof message.numUnit === 'number') object.numUnit = options.longs === String ? String(message.numUnit) : message.numUnit;else object.numUnit = options.longs === String ? $util.Long.prototype.toString.call(message.numUnit) : options.longs === Number ? new $util.LongBits(message.numUnit.low >>> 0, message.numUnit.high >>> 0).toNumber() : message.numUnit;
        return object;
      };
      /**
       * Converts this Label to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Label
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Label.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Label;
    }();

    profiles.Mapping = function () {
      /**
       * Properties of a Mapping.
       * @memberof perftools.profiles
       * @interface IMapping
       * @property {number|Long|null} [id] Mapping id
       * @property {number|Long|null} [memoryStart] Mapping memoryStart
       * @property {number|Long|null} [memoryLimit] Mapping memoryLimit
       * @property {number|Long|null} [fileOffset] Mapping fileOffset
       * @property {number|Long|null} [filename] Mapping filename
       * @property {number|Long|null} [buildId] Mapping buildId
       * @property {boolean|null} [hasFunctions] Mapping hasFunctions
       * @property {boolean|null} [hasFilenames] Mapping hasFilenames
       * @property {boolean|null} [hasLineNumbers] Mapping hasLineNumbers
       * @property {boolean|null} [hasInlineFrames] Mapping hasInlineFrames
       */

      /**
       * Constructs a new Mapping.
       * @memberof perftools.profiles
       * @classdesc Represents a Mapping.
       * @implements IMapping
       * @constructor
       * @param {perftools.profiles.IMapping=} [properties] Properties to set
       */
      function Mapping(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Mapping id.
       * @member {number|Long} id
       * @memberof perftools.profiles.Mapping
       * @instance
       */


      Mapping.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Mapping memoryStart.
       * @member {number|Long} memoryStart
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.memoryStart = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Mapping memoryLimit.
       * @member {number|Long} memoryLimit
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.memoryLimit = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Mapping fileOffset.
       * @member {number|Long} fileOffset
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.fileOffset = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Mapping filename.
       * @member {number|Long} filename
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.filename = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Mapping buildId.
       * @member {number|Long} buildId
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.buildId = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Mapping hasFunctions.
       * @member {boolean} hasFunctions
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.hasFunctions = false;
      /**
       * Mapping hasFilenames.
       * @member {boolean} hasFilenames
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.hasFilenames = false;
      /**
       * Mapping hasLineNumbers.
       * @member {boolean} hasLineNumbers
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.hasLineNumbers = false;
      /**
       * Mapping hasInlineFrames.
       * @member {boolean} hasInlineFrames
       * @memberof perftools.profiles.Mapping
       * @instance
       */

      Mapping.prototype.hasInlineFrames = false;
      /**
       * Creates a new Mapping instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {perftools.profiles.IMapping=} [properties] Properties to set
       * @returns {perftools.profiles.Mapping} Mapping instance
       */

      Mapping.create = function create(properties) {
        return new Mapping(properties);
      };
      /**
       * Encodes the specified Mapping message. Does not implicitly {@link perftools.profiles.Mapping.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {perftools.profiles.IMapping} message Mapping message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Mapping.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.id != null && message.hasOwnProperty('id')) writer.uint32(
        /* id 1, wireType 0 =*/
        8).uint64(message.id);
        if (message.memoryStart != null && message.hasOwnProperty('memoryStart')) writer.uint32(
        /* id 2, wireType 0 =*/
        16).uint64(message.memoryStart);
        if (message.memoryLimit != null && message.hasOwnProperty('memoryLimit')) writer.uint32(
        /* id 3, wireType 0 =*/
        24).uint64(message.memoryLimit);
        if (message.fileOffset != null && message.hasOwnProperty('fileOffset')) writer.uint32(
        /* id 4, wireType 0 =*/
        32).uint64(message.fileOffset);
        if (message.filename != null && message.hasOwnProperty('filename')) writer.uint32(
        /* id 5, wireType 0 =*/
        40).int64(message.filename);
        if (message.buildId != null && message.hasOwnProperty('buildId')) writer.uint32(
        /* id 6, wireType 0 =*/
        48).int64(message.buildId);
        if (message.hasFunctions != null && message.hasOwnProperty('hasFunctions')) writer.uint32(
        /* id 7, wireType 0 =*/
        56).bool(message.hasFunctions);
        if (message.hasFilenames != null && message.hasOwnProperty('hasFilenames')) writer.uint32(
        /* id 8, wireType 0 =*/
        64).bool(message.hasFilenames);
        if (message.hasLineNumbers != null && message.hasOwnProperty('hasLineNumbers')) writer.uint32(
        /* id 9, wireType 0 =*/
        72).bool(message.hasLineNumbers);
        if (message.hasInlineFrames != null && message.hasOwnProperty('hasInlineFrames')) writer.uint32(
        /* id 10, wireType 0 =*/
        80).bool(message.hasInlineFrames);
        return writer;
      };
      /**
       * Encodes the specified Mapping message, length delimited. Does not implicitly {@link perftools.profiles.Mapping.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {perftools.profiles.IMapping} message Mapping message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Mapping.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Mapping message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Mapping} Mapping
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Mapping.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Mapping();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              message.id = reader.uint64();
              break;

            case 2:
              message.memoryStart = reader.uint64();
              break;

            case 3:
              message.memoryLimit = reader.uint64();
              break;

            case 4:
              message.fileOffset = reader.uint64();
              break;

            case 5:
              message.filename = reader.int64();
              break;

            case 6:
              message.buildId = reader.int64();
              break;

            case 7:
              message.hasFunctions = reader.bool();
              break;

            case 8:
              message.hasFilenames = reader.bool();
              break;

            case 9:
              message.hasLineNumbers = reader.bool();
              break;

            case 10:
              message.hasInlineFrames = reader.bool();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Mapping message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Mapping} Mapping
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Mapping.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Mapping message.
       * @function verify
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Mapping.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';
        if (message.id != null && message.hasOwnProperty('id')) if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high))) return 'id: integer|Long expected';
        if (message.memoryStart != null && message.hasOwnProperty('memoryStart')) if (!$util.isInteger(message.memoryStart) && !(message.memoryStart && $util.isInteger(message.memoryStart.low) && $util.isInteger(message.memoryStart.high))) return 'memoryStart: integer|Long expected';
        if (message.memoryLimit != null && message.hasOwnProperty('memoryLimit')) if (!$util.isInteger(message.memoryLimit) && !(message.memoryLimit && $util.isInteger(message.memoryLimit.low) && $util.isInteger(message.memoryLimit.high))) return 'memoryLimit: integer|Long expected';
        if (message.fileOffset != null && message.hasOwnProperty('fileOffset')) if (!$util.isInteger(message.fileOffset) && !(message.fileOffset && $util.isInteger(message.fileOffset.low) && $util.isInteger(message.fileOffset.high))) return 'fileOffset: integer|Long expected';
        if (message.filename != null && message.hasOwnProperty('filename')) if (!$util.isInteger(message.filename) && !(message.filename && $util.isInteger(message.filename.low) && $util.isInteger(message.filename.high))) return 'filename: integer|Long expected';
        if (message.buildId != null && message.hasOwnProperty('buildId')) if (!$util.isInteger(message.buildId) && !(message.buildId && $util.isInteger(message.buildId.low) && $util.isInteger(message.buildId.high))) return 'buildId: integer|Long expected';
        if (message.hasFunctions != null && message.hasOwnProperty('hasFunctions')) if (typeof message.hasFunctions !== 'boolean') return 'hasFunctions: boolean expected';
        if (message.hasFilenames != null && message.hasOwnProperty('hasFilenames')) if (typeof message.hasFilenames !== 'boolean') return 'hasFilenames: boolean expected';
        if (message.hasLineNumbers != null && message.hasOwnProperty('hasLineNumbers')) if (typeof message.hasLineNumbers !== 'boolean') return 'hasLineNumbers: boolean expected';
        if (message.hasInlineFrames != null && message.hasOwnProperty('hasInlineFrames')) if (typeof message.hasInlineFrames !== 'boolean') return 'hasInlineFrames: boolean expected';
        return null;
      };
      /**
       * Creates a Mapping message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Mapping} Mapping
       */


      Mapping.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Mapping) return object;
        var message = new $root.perftools.profiles.Mapping();
        if (object.id != null) if ($util.Long) (message.id = $util.Long.fromValue(object.id)).unsigned = true;else if (typeof object.id === 'string') message.id = parseInt(object.id, 10);else if (typeof object.id === 'number') message.id = object.id;else if (typeof object.id === 'object') message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
        if (object.memoryStart != null) if ($util.Long) (message.memoryStart = $util.Long.fromValue(object.memoryStart)).unsigned = true;else if (typeof object.memoryStart === 'string') message.memoryStart = parseInt(object.memoryStart, 10);else if (typeof object.memoryStart === 'number') message.memoryStart = object.memoryStart;else if (typeof object.memoryStart === 'object') message.memoryStart = new $util.LongBits(object.memoryStart.low >>> 0, object.memoryStart.high >>> 0).toNumber(true);
        if (object.memoryLimit != null) if ($util.Long) (message.memoryLimit = $util.Long.fromValue(object.memoryLimit)).unsigned = true;else if (typeof object.memoryLimit === 'string') message.memoryLimit = parseInt(object.memoryLimit, 10);else if (typeof object.memoryLimit === 'number') message.memoryLimit = object.memoryLimit;else if (typeof object.memoryLimit === 'object') message.memoryLimit = new $util.LongBits(object.memoryLimit.low >>> 0, object.memoryLimit.high >>> 0).toNumber(true);
        if (object.fileOffset != null) if ($util.Long) (message.fileOffset = $util.Long.fromValue(object.fileOffset)).unsigned = true;else if (typeof object.fileOffset === 'string') message.fileOffset = parseInt(object.fileOffset, 10);else if (typeof object.fileOffset === 'number') message.fileOffset = object.fileOffset;else if (typeof object.fileOffset === 'object') message.fileOffset = new $util.LongBits(object.fileOffset.low >>> 0, object.fileOffset.high >>> 0).toNumber(true);
        if (object.filename != null) if ($util.Long) (message.filename = $util.Long.fromValue(object.filename)).unsigned = false;else if (typeof object.filename === 'string') message.filename = parseInt(object.filename, 10);else if (typeof object.filename === 'number') message.filename = object.filename;else if (typeof object.filename === 'object') message.filename = new $util.LongBits(object.filename.low >>> 0, object.filename.high >>> 0).toNumber();
        if (object.buildId != null) if ($util.Long) (message.buildId = $util.Long.fromValue(object.buildId)).unsigned = false;else if (typeof object.buildId === 'string') message.buildId = parseInt(object.buildId, 10);else if (typeof object.buildId === 'number') message.buildId = object.buildId;else if (typeof object.buildId === 'object') message.buildId = new $util.LongBits(object.buildId.low >>> 0, object.buildId.high >>> 0).toNumber();
        if (object.hasFunctions != null) message.hasFunctions = Boolean(object.hasFunctions);
        if (object.hasFilenames != null) message.hasFilenames = Boolean(object.hasFilenames);
        if (object.hasLineNumbers != null) message.hasLineNumbers = Boolean(object.hasLineNumbers);
        if (object.hasInlineFrames != null) message.hasInlineFrames = Boolean(object.hasInlineFrames);
        return message;
      };
      /**
       * Creates a plain object from a Mapping message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Mapping
       * @static
       * @param {perftools.profiles.Mapping} message Mapping
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Mapping.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.id = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.memoryStart = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.memoryStart = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.memoryLimit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.memoryLimit = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.fileOffset = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.fileOffset = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.filename = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.filename = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.buildId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.buildId = options.longs === String ? '0' : 0;

          object.hasFunctions = false;
          object.hasFilenames = false;
          object.hasLineNumbers = false;
          object.hasInlineFrames = false;
        }

        if (message.id != null && message.hasOwnProperty('id')) if (typeof message.id === 'number') object.id = options.longs === String ? String(message.id) : message.id;else object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
        if (message.memoryStart != null && message.hasOwnProperty('memoryStart')) if (typeof message.memoryStart === 'number') object.memoryStart = options.longs === String ? String(message.memoryStart) : message.memoryStart;else object.memoryStart = options.longs === String ? $util.Long.prototype.toString.call(message.memoryStart) : options.longs === Number ? new $util.LongBits(message.memoryStart.low >>> 0, message.memoryStart.high >>> 0).toNumber(true) : message.memoryStart;
        if (message.memoryLimit != null && message.hasOwnProperty('memoryLimit')) if (typeof message.memoryLimit === 'number') object.memoryLimit = options.longs === String ? String(message.memoryLimit) : message.memoryLimit;else object.memoryLimit = options.longs === String ? $util.Long.prototype.toString.call(message.memoryLimit) : options.longs === Number ? new $util.LongBits(message.memoryLimit.low >>> 0, message.memoryLimit.high >>> 0).toNumber(true) : message.memoryLimit;
        if (message.fileOffset != null && message.hasOwnProperty('fileOffset')) if (typeof message.fileOffset === 'number') object.fileOffset = options.longs === String ? String(message.fileOffset) : message.fileOffset;else object.fileOffset = options.longs === String ? $util.Long.prototype.toString.call(message.fileOffset) : options.longs === Number ? new $util.LongBits(message.fileOffset.low >>> 0, message.fileOffset.high >>> 0).toNumber(true) : message.fileOffset;
        if (message.filename != null && message.hasOwnProperty('filename')) if (typeof message.filename === 'number') object.filename = options.longs === String ? String(message.filename) : message.filename;else object.filename = options.longs === String ? $util.Long.prototype.toString.call(message.filename) : options.longs === Number ? new $util.LongBits(message.filename.low >>> 0, message.filename.high >>> 0).toNumber() : message.filename;
        if (message.buildId != null && message.hasOwnProperty('buildId')) if (typeof message.buildId === 'number') object.buildId = options.longs === String ? String(message.buildId) : message.buildId;else object.buildId = options.longs === String ? $util.Long.prototype.toString.call(message.buildId) : options.longs === Number ? new $util.LongBits(message.buildId.low >>> 0, message.buildId.high >>> 0).toNumber() : message.buildId;
        if (message.hasFunctions != null && message.hasOwnProperty('hasFunctions')) object.hasFunctions = message.hasFunctions;
        if (message.hasFilenames != null && message.hasOwnProperty('hasFilenames')) object.hasFilenames = message.hasFilenames;
        if (message.hasLineNumbers != null && message.hasOwnProperty('hasLineNumbers')) object.hasLineNumbers = message.hasLineNumbers;
        if (message.hasInlineFrames != null && message.hasOwnProperty('hasInlineFrames')) object.hasInlineFrames = message.hasInlineFrames;
        return object;
      };
      /**
       * Converts this Mapping to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Mapping
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Mapping.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Mapping;
    }();

    profiles.Location = function () {
      /**
       * Properties of a Location.
       * @memberof perftools.profiles
       * @interface ILocation
       * @property {number|Long|null} [id] Location id
       * @property {number|Long|null} [mappingId] Location mappingId
       * @property {number|Long|null} [address] Location address
       * @property {Array.<perftools.profiles.ILine>|null} [line] Location line
       * @property {boolean|null} [isFolded] Location isFolded
       */

      /**
       * Constructs a new Location.
       * @memberof perftools.profiles
       * @classdesc Represents a Location.
       * @implements ILocation
       * @constructor
       * @param {perftools.profiles.ILocation=} [properties] Properties to set
       */
      function Location(properties) {
        this.line = [];
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Location id.
       * @member {number|Long} id
       * @memberof perftools.profiles.Location
       * @instance
       */


      Location.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Location mappingId.
       * @member {number|Long} mappingId
       * @memberof perftools.profiles.Location
       * @instance
       */

      Location.prototype.mappingId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Location address.
       * @member {number|Long} address
       * @memberof perftools.profiles.Location
       * @instance
       */

      Location.prototype.address = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Location line.
       * @member {Array.<perftools.profiles.ILine>} line
       * @memberof perftools.profiles.Location
       * @instance
       */

      Location.prototype.line = $util.emptyArray;
      /**
       * Location isFolded.
       * @member {boolean} isFolded
       * @memberof perftools.profiles.Location
       * @instance
       */

      Location.prototype.isFolded = false;
      /**
       * Creates a new Location instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Location
       * @static
       * @param {perftools.profiles.ILocation=} [properties] Properties to set
       * @returns {perftools.profiles.Location} Location instance
       */

      Location.create = function create(properties) {
        return new Location(properties);
      };
      /**
       * Encodes the specified Location message. Does not implicitly {@link perftools.profiles.Location.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Location
       * @static
       * @param {perftools.profiles.ILocation} message Location message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Location.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.id != null && message.hasOwnProperty('id')) writer.uint32(
        /* id 1, wireType 0 =*/
        8).uint64(message.id);
        if (message.mappingId != null && message.hasOwnProperty('mappingId')) writer.uint32(
        /* id 2, wireType 0 =*/
        16).uint64(message.mappingId);
        if (message.address != null && message.hasOwnProperty('address')) writer.uint32(
        /* id 3, wireType 0 =*/
        24).uint64(message.address);
        if (message.line != null && message.line.length) for (var i = 0; i < message.line.length; ++i) $root.perftools.profiles.Line.encode(message.line[i], writer.uint32(
        /* id 4, wireType 2 =*/
        34).fork()).ldelim();
        if (message.isFolded != null && message.hasOwnProperty('isFolded')) writer.uint32(
        /* id 5, wireType 0 =*/
        40).bool(message.isFolded);
        return writer;
      };
      /**
       * Encodes the specified Location message, length delimited. Does not implicitly {@link perftools.profiles.Location.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Location
       * @static
       * @param {perftools.profiles.ILocation} message Location message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Location.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Location message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Location
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Location} Location
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Location.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Location();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              message.id = reader.uint64();
              break;

            case 2:
              message.mappingId = reader.uint64();
              break;

            case 3:
              message.address = reader.uint64();
              break;

            case 4:
              if (!(message.line && message.line.length)) message.line = [];
              message.line.push($root.perftools.profiles.Line.decode(reader, reader.uint32()));
              break;

            case 5:
              message.isFolded = reader.bool();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Location message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Location
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Location} Location
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Location.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Location message.
       * @function verify
       * @memberof perftools.profiles.Location
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Location.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';
        if (message.id != null && message.hasOwnProperty('id')) if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high))) return 'id: integer|Long expected';
        if (message.mappingId != null && message.hasOwnProperty('mappingId')) if (!$util.isInteger(message.mappingId) && !(message.mappingId && $util.isInteger(message.mappingId.low) && $util.isInteger(message.mappingId.high))) return 'mappingId: integer|Long expected';
        if (message.address != null && message.hasOwnProperty('address')) if (!$util.isInteger(message.address) && !(message.address && $util.isInteger(message.address.low) && $util.isInteger(message.address.high))) return 'address: integer|Long expected';

        if (message.line != null && message.hasOwnProperty('line')) {
          if (!Array.isArray(message.line)) return 'line: array expected';

          for (var i = 0; i < message.line.length; ++i) {
            var error = $root.perftools.profiles.Line.verify(message.line[i]);
            if (error) return 'line.' + error;
          }
        }

        if (message.isFolded != null && message.hasOwnProperty('isFolded')) if (typeof message.isFolded !== 'boolean') return 'isFolded: boolean expected';
        return null;
      };
      /**
       * Creates a Location message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Location
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Location} Location
       */


      Location.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Location) return object;
        var message = new $root.perftools.profiles.Location();
        if (object.id != null) if ($util.Long) (message.id = $util.Long.fromValue(object.id)).unsigned = true;else if (typeof object.id === 'string') message.id = parseInt(object.id, 10);else if (typeof object.id === 'number') message.id = object.id;else if (typeof object.id === 'object') message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
        if (object.mappingId != null) if ($util.Long) (message.mappingId = $util.Long.fromValue(object.mappingId)).unsigned = true;else if (typeof object.mappingId === 'string') message.mappingId = parseInt(object.mappingId, 10);else if (typeof object.mappingId === 'number') message.mappingId = object.mappingId;else if (typeof object.mappingId === 'object') message.mappingId = new $util.LongBits(object.mappingId.low >>> 0, object.mappingId.high >>> 0).toNumber(true);
        if (object.address != null) if ($util.Long) (message.address = $util.Long.fromValue(object.address)).unsigned = true;else if (typeof object.address === 'string') message.address = parseInt(object.address, 10);else if (typeof object.address === 'number') message.address = object.address;else if (typeof object.address === 'object') message.address = new $util.LongBits(object.address.low >>> 0, object.address.high >>> 0).toNumber(true);

        if (object.line) {
          if (!Array.isArray(object.line)) throw TypeError('.perftools.profiles.Location.line: array expected');
          message.line = [];

          for (var i = 0; i < object.line.length; ++i) {
            if (typeof object.line[i] !== 'object') throw TypeError('.perftools.profiles.Location.line: object expected');
            message.line[i] = $root.perftools.profiles.Line.fromObject(object.line[i]);
          }
        }

        if (object.isFolded != null) message.isFolded = Boolean(object.isFolded);
        return message;
      };
      /**
       * Creates a plain object from a Location message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Location
       * @static
       * @param {perftools.profiles.Location} message Location
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Location.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};
        if (options.arrays || options.defaults) object.line = [];

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.id = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.mappingId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.mappingId = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.address = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.address = options.longs === String ? '0' : 0;

          object.isFolded = false;
        }

        if (message.id != null && message.hasOwnProperty('id')) if (typeof message.id === 'number') object.id = options.longs === String ? String(message.id) : message.id;else object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
        if (message.mappingId != null && message.hasOwnProperty('mappingId')) if (typeof message.mappingId === 'number') object.mappingId = options.longs === String ? String(message.mappingId) : message.mappingId;else object.mappingId = options.longs === String ? $util.Long.prototype.toString.call(message.mappingId) : options.longs === Number ? new $util.LongBits(message.mappingId.low >>> 0, message.mappingId.high >>> 0).toNumber(true) : message.mappingId;
        if (message.address != null && message.hasOwnProperty('address')) if (typeof message.address === 'number') object.address = options.longs === String ? String(message.address) : message.address;else object.address = options.longs === String ? $util.Long.prototype.toString.call(message.address) : options.longs === Number ? new $util.LongBits(message.address.low >>> 0, message.address.high >>> 0).toNumber(true) : message.address;

        if (message.line && message.line.length) {
          object.line = [];

          for (var j = 0; j < message.line.length; ++j) object.line[j] = $root.perftools.profiles.Line.toObject(message.line[j], options);
        }

        if (message.isFolded != null && message.hasOwnProperty('isFolded')) object.isFolded = message.isFolded;
        return object;
      };
      /**
       * Converts this Location to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Location
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Location.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Location;
    }();

    profiles.Line = function () {
      /**
       * Properties of a Line.
       * @memberof perftools.profiles
       * @interface ILine
       * @property {number|Long|null} [functionId] Line functionId
       * @property {number|Long|null} [line] Line line
       */

      /**
       * Constructs a new Line.
       * @memberof perftools.profiles
       * @classdesc Represents a Line.
       * @implements ILine
       * @constructor
       * @param {perftools.profiles.ILine=} [properties] Properties to set
       */
      function Line(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Line functionId.
       * @member {number|Long} functionId
       * @memberof perftools.profiles.Line
       * @instance
       */


      Line.prototype.functionId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Line line.
       * @member {number|Long} line
       * @memberof perftools.profiles.Line
       * @instance
       */

      Line.prototype.line = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Creates a new Line instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Line
       * @static
       * @param {perftools.profiles.ILine=} [properties] Properties to set
       * @returns {perftools.profiles.Line} Line instance
       */

      Line.create = function create(properties) {
        return new Line(properties);
      };
      /**
       * Encodes the specified Line message. Does not implicitly {@link perftools.profiles.Line.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Line
       * @static
       * @param {perftools.profiles.ILine} message Line message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Line.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.functionId != null && message.hasOwnProperty('functionId')) writer.uint32(
        /* id 1, wireType 0 =*/
        8).uint64(message.functionId);
        if (message.line != null && message.hasOwnProperty('line')) writer.uint32(
        /* id 2, wireType 0 =*/
        16).int64(message.line);
        return writer;
      };
      /**
       * Encodes the specified Line message, length delimited. Does not implicitly {@link perftools.profiles.Line.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Line
       * @static
       * @param {perftools.profiles.ILine} message Line message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Line.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Line message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Line
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Line} Line
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Line.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Line();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              message.functionId = reader.uint64();
              break;

            case 2:
              message.line = reader.int64();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Line message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Line
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Line} Line
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Line.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Line message.
       * @function verify
       * @memberof perftools.profiles.Line
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Line.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';
        if (message.functionId != null && message.hasOwnProperty('functionId')) if (!$util.isInteger(message.functionId) && !(message.functionId && $util.isInteger(message.functionId.low) && $util.isInteger(message.functionId.high))) return 'functionId: integer|Long expected';
        if (message.line != null && message.hasOwnProperty('line')) if (!$util.isInteger(message.line) && !(message.line && $util.isInteger(message.line.low) && $util.isInteger(message.line.high))) return 'line: integer|Long expected';
        return null;
      };
      /**
       * Creates a Line message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Line
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Line} Line
       */


      Line.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Line) return object;
        var message = new $root.perftools.profiles.Line();
        if (object.functionId != null) if ($util.Long) (message.functionId = $util.Long.fromValue(object.functionId)).unsigned = true;else if (typeof object.functionId === 'string') message.functionId = parseInt(object.functionId, 10);else if (typeof object.functionId === 'number') message.functionId = object.functionId;else if (typeof object.functionId === 'object') message.functionId = new $util.LongBits(object.functionId.low >>> 0, object.functionId.high >>> 0).toNumber(true);
        if (object.line != null) if ($util.Long) (message.line = $util.Long.fromValue(object.line)).unsigned = false;else if (typeof object.line === 'string') message.line = parseInt(object.line, 10);else if (typeof object.line === 'number') message.line = object.line;else if (typeof object.line === 'object') message.line = new $util.LongBits(object.line.low >>> 0, object.line.high >>> 0).toNumber();
        return message;
      };
      /**
       * Creates a plain object from a Line message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Line
       * @static
       * @param {perftools.profiles.Line} message Line
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Line.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.functionId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.functionId = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.line = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.line = options.longs === String ? '0' : 0;
        }

        if (message.functionId != null && message.hasOwnProperty('functionId')) if (typeof message.functionId === 'number') object.functionId = options.longs === String ? String(message.functionId) : message.functionId;else object.functionId = options.longs === String ? $util.Long.prototype.toString.call(message.functionId) : options.longs === Number ? new $util.LongBits(message.functionId.low >>> 0, message.functionId.high >>> 0).toNumber(true) : message.functionId;
        if (message.line != null && message.hasOwnProperty('line')) if (typeof message.line === 'number') object.line = options.longs === String ? String(message.line) : message.line;else object.line = options.longs === String ? $util.Long.prototype.toString.call(message.line) : options.longs === Number ? new $util.LongBits(message.line.low >>> 0, message.line.high >>> 0).toNumber() : message.line;
        return object;
      };
      /**
       * Converts this Line to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Line
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Line.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Line;
    }();

    profiles.Function = function () {
      /**
       * Properties of a Function.
       * @memberof perftools.profiles
       * @interface IFunction
       * @property {number|Long|null} [id] Function id
       * @property {number|Long|null} [name] Function name
       * @property {number|Long|null} [systemName] Function systemName
       * @property {number|Long|null} [filename] Function filename
       * @property {number|Long|null} [startLine] Function startLine
       */

      /**
       * Constructs a new Function.
       * @memberof perftools.profiles
       * @classdesc Represents a Function.
       * @implements IFunction
       * @constructor
       * @param {perftools.profiles.IFunction=} [properties] Properties to set
       */
      function Function(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
      }
      /**
       * Function id.
       * @member {number|Long} id
       * @memberof perftools.profiles.Function
       * @instance
       */


      Function.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      /**
       * Function name.
       * @member {number|Long} name
       * @memberof perftools.profiles.Function
       * @instance
       */

      Function.prototype.name = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Function systemName.
       * @member {number|Long} systemName
       * @memberof perftools.profiles.Function
       * @instance
       */

      Function.prototype.systemName = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Function filename.
       * @member {number|Long} filename
       * @memberof perftools.profiles.Function
       * @instance
       */

      Function.prototype.filename = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Function startLine.
       * @member {number|Long} startLine
       * @memberof perftools.profiles.Function
       * @instance
       */

      Function.prototype.startLine = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      /**
       * Creates a new Function instance using the specified properties.
       * @function create
       * @memberof perftools.profiles.Function
       * @static
       * @param {perftools.profiles.IFunction=} [properties] Properties to set
       * @returns {perftools.profiles.Function} Function instance
       */

      Function.create = function create(properties) {
        return new Function(properties);
      };
      /**
       * Encodes the specified Function message. Does not implicitly {@link perftools.profiles.Function.verify|verify} messages.
       * @function encode
       * @memberof perftools.profiles.Function
       * @static
       * @param {perftools.profiles.IFunction} message Function message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Function.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.id != null && message.hasOwnProperty('id')) writer.uint32(
        /* id 1, wireType 0 =*/
        8).uint64(message.id);
        if (message.name != null && message.hasOwnProperty('name')) writer.uint32(
        /* id 2, wireType 0 =*/
        16).int64(message.name);
        if (message.systemName != null && message.hasOwnProperty('systemName')) writer.uint32(
        /* id 3, wireType 0 =*/
        24).int64(message.systemName);
        if (message.filename != null && message.hasOwnProperty('filename')) writer.uint32(
        /* id 4, wireType 0 =*/
        32).int64(message.filename);
        if (message.startLine != null && message.hasOwnProperty('startLine')) writer.uint32(
        /* id 5, wireType 0 =*/
        40).int64(message.startLine);
        return writer;
      };
      /**
       * Encodes the specified Function message, length delimited. Does not implicitly {@link perftools.profiles.Function.verify|verify} messages.
       * @function encodeDelimited
       * @memberof perftools.profiles.Function
       * @static
       * @param {perftools.profiles.IFunction} message Function message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */


      Function.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };
      /**
       * Decodes a Function message from the specified reader or buffer.
       * @function decode
       * @memberof perftools.profiles.Function
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {perftools.profiles.Function} Function
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Function.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.perftools.profiles.Function();

        while (reader.pos < end) {
          var tag = reader.uint32();

          switch (tag >>> 3) {
            case 1:
              message.id = reader.uint64();
              break;

            case 2:
              message.name = reader.int64();
              break;

            case 3:
              message.systemName = reader.int64();
              break;

            case 4:
              message.filename = reader.int64();
              break;

            case 5:
              message.startLine = reader.int64();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }

        return message;
      };
      /**
       * Decodes a Function message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof perftools.profiles.Function
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {perftools.profiles.Function} Function
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */


      Function.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };
      /**
       * Verifies a Function message.
       * @function verify
       * @memberof perftools.profiles.Function
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */


      Function.verify = function verify(message) {
        if (typeof message !== 'object' || message === null) return 'object expected';
        if (message.id != null && message.hasOwnProperty('id')) if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high))) return 'id: integer|Long expected';
        if (message.name != null && message.hasOwnProperty('name')) if (!$util.isInteger(message.name) && !(message.name && $util.isInteger(message.name.low) && $util.isInteger(message.name.high))) return 'name: integer|Long expected';
        if (message.systemName != null && message.hasOwnProperty('systemName')) if (!$util.isInteger(message.systemName) && !(message.systemName && $util.isInteger(message.systemName.low) && $util.isInteger(message.systemName.high))) return 'systemName: integer|Long expected';
        if (message.filename != null && message.hasOwnProperty('filename')) if (!$util.isInteger(message.filename) && !(message.filename && $util.isInteger(message.filename.low) && $util.isInteger(message.filename.high))) return 'filename: integer|Long expected';
        if (message.startLine != null && message.hasOwnProperty('startLine')) if (!$util.isInteger(message.startLine) && !(message.startLine && $util.isInteger(message.startLine.low) && $util.isInteger(message.startLine.high))) return 'startLine: integer|Long expected';
        return null;
      };
      /**
       * Creates a Function message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof perftools.profiles.Function
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {perftools.profiles.Function} Function
       */


      Function.fromObject = function fromObject(object) {
        if (object instanceof $root.perftools.profiles.Function) return object;
        var message = new $root.perftools.profiles.Function();
        if (object.id != null) if ($util.Long) (message.id = $util.Long.fromValue(object.id)).unsigned = true;else if (typeof object.id === 'string') message.id = parseInt(object.id, 10);else if (typeof object.id === 'number') message.id = object.id;else if (typeof object.id === 'object') message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
        if (object.name != null) if ($util.Long) (message.name = $util.Long.fromValue(object.name)).unsigned = false;else if (typeof object.name === 'string') message.name = parseInt(object.name, 10);else if (typeof object.name === 'number') message.name = object.name;else if (typeof object.name === 'object') message.name = new $util.LongBits(object.name.low >>> 0, object.name.high >>> 0).toNumber();
        if (object.systemName != null) if ($util.Long) (message.systemName = $util.Long.fromValue(object.systemName)).unsigned = false;else if (typeof object.systemName === 'string') message.systemName = parseInt(object.systemName, 10);else if (typeof object.systemName === 'number') message.systemName = object.systemName;else if (typeof object.systemName === 'object') message.systemName = new $util.LongBits(object.systemName.low >>> 0, object.systemName.high >>> 0).toNumber();
        if (object.filename != null) if ($util.Long) (message.filename = $util.Long.fromValue(object.filename)).unsigned = false;else if (typeof object.filename === 'string') message.filename = parseInt(object.filename, 10);else if (typeof object.filename === 'number') message.filename = object.filename;else if (typeof object.filename === 'object') message.filename = new $util.LongBits(object.filename.low >>> 0, object.filename.high >>> 0).toNumber();
        if (object.startLine != null) if ($util.Long) (message.startLine = $util.Long.fromValue(object.startLine)).unsigned = false;else if (typeof object.startLine === 'string') message.startLine = parseInt(object.startLine, 10);else if (typeof object.startLine === 'number') message.startLine = object.startLine;else if (typeof object.startLine === 'object') message.startLine = new $util.LongBits(object.startLine.low >>> 0, object.startLine.high >>> 0).toNumber();
        return message;
      };
      /**
       * Creates a plain object from a Function message. Also converts values to other types if specified.
       * @function toObject
       * @memberof perftools.profiles.Function
       * @static
       * @param {perftools.profiles.Function} message Function
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */


      Function.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};

        if (options.defaults) {
          if ($util.Long) {
            var long = new $util.Long(0, 0, true);
            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.id = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.name = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.name = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.systemName = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.systemName = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.filename = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.filename = options.longs === String ? '0' : 0;

          if ($util.Long) {
            var long = new $util.Long(0, 0, false);
            object.startLine = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
          } else object.startLine = options.longs === String ? '0' : 0;
        }

        if (message.id != null && message.hasOwnProperty('id')) if (typeof message.id === 'number') object.id = options.longs === String ? String(message.id) : message.id;else object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
        if (message.name != null && message.hasOwnProperty('name')) if (typeof message.name === 'number') object.name = options.longs === String ? String(message.name) : message.name;else object.name = options.longs === String ? $util.Long.prototype.toString.call(message.name) : options.longs === Number ? new $util.LongBits(message.name.low >>> 0, message.name.high >>> 0).toNumber() : message.name;
        if (message.systemName != null && message.hasOwnProperty('systemName')) if (typeof message.systemName === 'number') object.systemName = options.longs === String ? String(message.systemName) : message.systemName;else object.systemName = options.longs === String ? $util.Long.prototype.toString.call(message.systemName) : options.longs === Number ? new $util.LongBits(message.systemName.low >>> 0, message.systemName.high >>> 0).toNumber() : message.systemName;
        if (message.filename != null && message.hasOwnProperty('filename')) if (typeof message.filename === 'number') object.filename = options.longs === String ? String(message.filename) : message.filename;else object.filename = options.longs === String ? $util.Long.prototype.toString.call(message.filename) : options.longs === Number ? new $util.LongBits(message.filename.low >>> 0, message.filename.high >>> 0).toNumber() : message.filename;
        if (message.startLine != null && message.hasOwnProperty('startLine')) if (typeof message.startLine === 'number') object.startLine = options.longs === String ? String(message.startLine) : message.startLine;else object.startLine = options.longs === String ? $util.Long.prototype.toString.call(message.startLine) : options.longs === Number ? new $util.LongBits(message.startLine.low >>> 0, message.startLine.high >>> 0).toNumber() : message.startLine;
        return object;
      };
      /**
       * Converts this Function to JSON.
       * @function toJSON
       * @memberof perftools.profiles.Function
       * @instance
       * @returns {Object.<string,*>} JSON object
       */


      Function.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Function;
    }();

    return profiles;
  }();

  return perftools;
}();

module.exports = $root;
},{"protobufjs/minimal":"../node_modules/protobufjs/minimal.js"}],"../node_modules/long/src/long.js":[function(require,module,exports) {
module.exports = Long;

/**
 * wasm optimizations, to do native i64 multiplication and divide
 */
var wasm = null;

try {
  wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11
  ])), {}).exports;
} catch (e) {
  // no wasm support :(
}

/**
 * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
 *  See the from* functions below for more convenient ways of constructing Longs.
 * @exports Long
 * @class A Long class for representing a 64 bit two's-complement integer value.
 * @param {number} low The low (signed) 32 bits of the long
 * @param {number} high The high (signed) 32 bits of the long
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @constructor
 */
function Long(low, high, unsigned) {

    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;

    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
    this.high = high | 0;

    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
    this.unsigned = !!unsigned;
}

// The internal representation of a long is the two given signed, 32-bit values.
// We use 32-bit pieces because these are the size of integers on which
// Javascript performs bit-operations.  For operations like addition and
// multiplication, we split each number into 16 bit pieces, which can easily be
// multiplied within Javascript's floating-point representation without overflow
// or change in sign.
//
// In the algorithms below, we frequently reduce the negative case to the
// positive case by negating the input(s) and then post-processing the result.
// Note that we must ALWAYS check specially whether those values are MIN_VALUE
// (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
// a positive number, it overflows back into a negative).  Not handling this
// case would often result in infinite recursion.
//
// Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
// methods on which they depend.

/**
 * An indicator used to reliably determine if an object is a Long or not.
 * @type {boolean}
 * @const
 * @private
 */
Long.prototype.__isLong__;

Object.defineProperty(Long.prototype, "__isLong__", { value: true });

/**
 * @function
 * @param {*} obj Object
 * @returns {boolean}
 * @inner
 */
function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
}

/**
 * Tests if the specified object is a Long.
 * @function
 * @param {*} obj Object
 * @returns {boolean}
 */
Long.isLong = isLong;

/**
 * A cache of the Long representations of small integer values.
 * @type {!Object}
 * @inner
 */
var INT_CACHE = {};

/**
 * A cache of the Long representations of small unsigned integer values.
 * @type {!Object}
 * @inner
 */
var UINT_CACHE = {};

/**
 * @param {number} value
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
    if (unsigned) {
        value >>>= 0;
        if (cache = (0 <= value && value < 256)) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
        if (cache)
            UINT_CACHE[value] = obj;
        return obj;
    } else {
        value |= 0;
        if (cache = (-128 <= value && value < 128)) {
            cachedObj = INT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, value < 0 ? -1 : 0, false);
        if (cache)
            INT_CACHE[value] = obj;
        return obj;
    }
}

/**
 * Returns a Long representing the given 32 bit integer value.
 * @function
 * @param {number} value The 32 bit integer in question
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long} The corresponding Long value
 */
Long.fromInt = fromInt;

/**
 * @param {number} value
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromNumber(value, unsigned) {
    if (isNaN(value))
        return unsigned ? UZERO : ZERO;
    if (unsigned) {
        if (value < 0)
            return UZERO;
        if (value >= TWO_PWR_64_DBL)
            return MAX_UNSIGNED_VALUE;
    } else {
        if (value <= -TWO_PWR_63_DBL)
            return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL)
            return MAX_VALUE;
    }
    if (value < 0)
        return fromNumber(-value, unsigned).neg();
    return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
}

/**
 * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
 * @function
 * @param {number} value The number in question
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long} The corresponding Long value
 */
Long.fromNumber = fromNumber;

/**
 * @param {number} lowBits
 * @param {number} highBits
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
}

/**
 * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
 *  assumed to use 32 bits.
 * @function
 * @param {number} lowBits The low 32 bits
 * @param {number} highBits The high 32 bits
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long} The corresponding Long value
 */
Long.fromBits = fromBits;

/**
 * @function
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 * @inner
 */
var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)

/**
 * @param {string} str
 * @param {(boolean|number)=} unsigned
 * @param {number=} radix
 * @returns {!Long}
 * @inner
 */
function fromString(str, unsigned, radix) {
    if (str.length === 0)
        throw Error('empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
        return ZERO;
    if (typeof unsigned === 'number') {
        // For goog.math.long compatibility
        radix = unsigned,
        unsigned = false;
    } else {
        unsigned = !! unsigned;
    }
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
        throw RangeError('radix');

    var p;
    if ((p = str.indexOf('-')) > 0)
        throw Error('interior hyphen');
    else if (p === 0) {
        return fromString(str.substring(1), unsigned, radix).neg();
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = fromNumber(pow_dbl(radix, 8));

    var result = ZERO;
    for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i),
            value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
            var power = fromNumber(pow_dbl(radix, size));
            result = result.mul(power).add(fromNumber(value));
        } else {
            result = result.mul(radixToPower);
            result = result.add(fromNumber(value));
        }
    }
    result.unsigned = unsigned;
    return result;
}

/**
 * Returns a Long representation of the given string, written using the specified radix.
 * @function
 * @param {string} str The textual representation of the Long
 * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
 * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
 * @returns {!Long} The corresponding Long value
 */
Long.fromString = fromString;

/**
 * @function
 * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
 * @param {boolean=} unsigned
 * @returns {!Long}
 * @inner
 */
function fromValue(val, unsigned) {
    if (typeof val === 'number')
        return fromNumber(val, unsigned);
    if (typeof val === 'string')
        return fromString(val, unsigned);
    // Throws for non-objects, converts non-instanceof Long:
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
}

/**
 * Converts the specified value to a Long using the appropriate from* function for its type.
 * @function
 * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {!Long}
 */
Long.fromValue = fromValue;

// NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
// no runtime penalty for these.

/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_16_DBL = 1 << 16;

/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_24_DBL = 1 << 24;

/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

/**
 * @type {number}
 * @const
 * @inner
 */
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

/**
 * @type {!Long}
 * @const
 * @inner
 */
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

/**
 * @type {!Long}
 * @inner
 */
var ZERO = fromInt(0);

/**
 * Signed zero.
 * @type {!Long}
 */
Long.ZERO = ZERO;

/**
 * @type {!Long}
 * @inner
 */
var UZERO = fromInt(0, true);

/**
 * Unsigned zero.
 * @type {!Long}
 */
Long.UZERO = UZERO;

/**
 * @type {!Long}
 * @inner
 */
var ONE = fromInt(1);

/**
 * Signed one.
 * @type {!Long}
 */
Long.ONE = ONE;

/**
 * @type {!Long}
 * @inner
 */
var UONE = fromInt(1, true);

/**
 * Unsigned one.
 * @type {!Long}
 */
Long.UONE = UONE;

/**
 * @type {!Long}
 * @inner
 */
var NEG_ONE = fromInt(-1);

/**
 * Signed negative one.
 * @type {!Long}
 */
Long.NEG_ONE = NEG_ONE;

/**
 * @type {!Long}
 * @inner
 */
var MAX_VALUE = fromBits(0xFFFFFFFF|0, 0x7FFFFFFF|0, false);

/**
 * Maximum signed value.
 * @type {!Long}
 */
Long.MAX_VALUE = MAX_VALUE;

/**
 * @type {!Long}
 * @inner
 */
var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF|0, 0xFFFFFFFF|0, true);

/**
 * Maximum unsigned value.
 * @type {!Long}
 */
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

/**
 * @type {!Long}
 * @inner
 */
var MIN_VALUE = fromBits(0, 0x80000000|0, false);

/**
 * Minimum signed value.
 * @type {!Long}
 */
Long.MIN_VALUE = MIN_VALUE;

/**
 * @alias Long.prototype
 * @inner
 */
var LongPrototype = Long.prototype;

/**
 * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
 * @returns {number}
 */
LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
};

/**
 * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
 * @returns {number}
 */
LongPrototype.toNumber = function toNumber() {
    if (this.unsigned)
        return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};

/**
 * Converts the Long to a string written in the specified radix.
 * @param {number=} radix Radix (2-36), defaults to 10
 * @returns {string}
 * @override
 * @throws {RangeError} If `radix` is out of range
 */
LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
        throw RangeError('radix');
    if (this.isZero())
        return '0';
    if (this.isNegative()) { // Unsigned Longs are never negative
        if (this.eq(MIN_VALUE)) {
            // We need to change the Long value before it can be negated, so we remove
            // the bottom-most digit in this base and then recurse to do the rest.
            var radixLong = fromNumber(radix),
                div = this.div(radixLong),
                rem1 = div.mul(radixLong).sub(this);
            return div.toString(radix) + rem1.toInt().toString(radix);
        } else
            return '-' + this.neg().toString(radix);
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
    var result = '';
    while (true) {
        var remDiv = rem.div(radixToPower),
            intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
            digits = intval.toString(radix);
        rem = remDiv;
        if (rem.isZero())
            return digits + result;
        else {
            while (digits.length < 6)
                digits = '0' + digits;
            result = '' + digits + result;
        }
    }
};

/**
 * Gets the high 32 bits as a signed integer.
 * @returns {number} Signed high bits
 */
LongPrototype.getHighBits = function getHighBits() {
    return this.high;
};

/**
 * Gets the high 32 bits as an unsigned integer.
 * @returns {number} Unsigned high bits
 */
LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
};

/**
 * Gets the low 32 bits as a signed integer.
 * @returns {number} Signed low bits
 */
LongPrototype.getLowBits = function getLowBits() {
    return this.low;
};

/**
 * Gets the low 32 bits as an unsigned integer.
 * @returns {number} Unsigned low bits
 */
LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
};

/**
 * Gets the number of bits needed to represent the absolute value of this Long.
 * @returns {number}
 */
LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
        return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
    for (var bit = 31; bit > 0; bit--)
        if ((val & (1 << bit)) != 0)
            break;
    return this.high != 0 ? bit + 33 : bit + 1;
};

/**
 * Tests if this Long's value equals zero.
 * @returns {boolean}
 */
LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
};

/**
 * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
 * @returns {boolean}
 */
LongPrototype.eqz = LongPrototype.isZero;

/**
 * Tests if this Long's value is negative.
 * @returns {boolean}
 */
LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
};

/**
 * Tests if this Long's value is positive.
 * @returns {boolean}
 */
LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
};

/**
 * Tests if this Long's value is odd.
 * @returns {boolean}
 */
LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
};

/**
 * Tests if this Long's value is even.
 * @returns {boolean}
 */
LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
};

/**
 * Tests if this Long's value equals the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.equals = function equals(other) {
    if (!isLong(other))
        other = fromValue(other);
    if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
        return false;
    return this.high === other.high && this.low === other.low;
};

/**
 * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.eq = LongPrototype.equals;

/**
 * Tests if this Long's value differs from the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(/* validates */ other);
};

/**
 * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.neq = LongPrototype.notEquals;

/**
 * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.ne = LongPrototype.notEquals;

/**
 * Tests if this Long's value is less than the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.lessThan = function lessThan(other) {
    return this.comp(/* validates */ other) < 0;
};

/**
 * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.lt = LongPrototype.lessThan;

/**
 * Tests if this Long's value is less than or equal the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(/* validates */ other) <= 0;
};

/**
 * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.lte = LongPrototype.lessThanOrEqual;

/**
 * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.le = LongPrototype.lessThanOrEqual;

/**
 * Tests if this Long's value is greater than the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(/* validates */ other) > 0;
};

/**
 * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.gt = LongPrototype.greaterThan;

/**
 * Tests if this Long's value is greater than or equal the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(/* validates */ other) >= 0;
};

/**
 * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.gte = LongPrototype.greaterThanOrEqual;

/**
 * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {boolean}
 */
LongPrototype.ge = LongPrototype.greaterThanOrEqual;

/**
 * Compares this Long's value with the specified's.
 * @param {!Long|number|string} other Other value
 * @returns {number} 0 if they are the same, 1 if the this is greater and -1
 *  if the given one is greater
 */
LongPrototype.compare = function compare(other) {
    if (!isLong(other))
        other = fromValue(other);
    if (this.eq(other))
        return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg)
        return -1;
    if (!thisNeg && otherNeg)
        return 1;
    // At this point the sign bits are the same
    if (!this.unsigned)
        return this.sub(other).isNegative() ? -1 : 1;
    // Both are positive if at least one is unsigned
    return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
};

/**
 * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
 * @function
 * @param {!Long|number|string} other Other value
 * @returns {number} 0 if they are the same, 1 if the this is greater and -1
 *  if the given one is greater
 */
LongPrototype.comp = LongPrototype.compare;

/**
 * Negates this Long's value.
 * @returns {!Long} Negated Long
 */
LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE))
        return MIN_VALUE;
    return this.not().add(ONE);
};

/**
 * Negates this Long's value. This is an alias of {@link Long#negate}.
 * @function
 * @returns {!Long} Negated Long
 */
LongPrototype.neg = LongPrototype.negate;

/**
 * Returns the sum of this and the specified Long.
 * @param {!Long|number|string} addend Addend
 * @returns {!Long} Sum
 */
LongPrototype.add = function add(addend) {
    if (!isLong(addend))
        addend = fromValue(addend);

    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;

    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
};

/**
 * Returns the difference of this and the specified Long.
 * @param {!Long|number|string} subtrahend Subtrahend
 * @returns {!Long} Difference
 */
LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend))
        subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
};

/**
 * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
 * @function
 * @param {!Long|number|string} subtrahend Subtrahend
 * @returns {!Long} Difference
 */
LongPrototype.sub = LongPrototype.subtract;

/**
 * Returns the product of this and the specified Long.
 * @param {!Long|number|string} multiplier Multiplier
 * @returns {!Long} Product
 */
LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero())
        return ZERO;
    if (!isLong(multiplier))
        multiplier = fromValue(multiplier);

    // use wasm support if present
    if (wasm) {
        var low = wasm.mul(this.low,
                           this.high,
                           multiplier.low,
                           multiplier.high);
        return fromBits(low, wasm.get_high(), this.unsigned);
    }

    if (multiplier.isZero())
        return ZERO;
    if (this.eq(MIN_VALUE))
        return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE))
        return this.isOdd() ? MIN_VALUE : ZERO;

    if (this.isNegative()) {
        if (multiplier.isNegative())
            return this.neg().mul(multiplier.neg());
        else
            return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative())
        return this.mul(multiplier.neg()).neg();

    // If both longs are small, use float multiplication
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
        return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;

    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
};

/**
 * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
 * @function
 * @param {!Long|number|string} multiplier Multiplier
 * @returns {!Long} Product
 */
LongPrototype.mul = LongPrototype.multiply;

/**
 * Returns this Long divided by the specified. The result is signed if this Long is signed or
 *  unsigned if this Long is unsigned.
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Quotient
 */
LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor))
        divisor = fromValue(divisor);
    if (divisor.isZero())
        throw Error('division by zero');

    // use wasm support if present
    if (wasm) {
        // guard against signed division overflow: the largest
        // negative number / -1 would be 1 larger than the largest
        // positive number, due to two's complement.
        if (!this.unsigned &&
            this.high === -0x80000000 &&
            divisor.low === -1 && divisor.high === -1) {
            // be consistent with non-wasm code path
            return this;
        }
        var low = (this.unsigned ? wasm.div_u : wasm.div_s)(
            this.low,
            this.high,
            divisor.low,
            divisor.high
        );
        return fromBits(low, wasm.get_high(), this.unsigned);
    }

    if (this.isZero())
        return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
    if (!this.unsigned) {
        // This section is only relevant for signed longs and is derived from the
        // closure library as a whole.
        if (this.eq(MIN_VALUE)) {
            if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                return MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
            else if (divisor.eq(MIN_VALUE))
                return ONE;
            else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                var halfThis = this.shr(1);
                approx = halfThis.div(divisor).shl(1);
                if (approx.eq(ZERO)) {
                    return divisor.isNegative() ? ONE : NEG_ONE;
                } else {
                    rem = this.sub(divisor.mul(approx));
                    res = approx.add(rem.div(divisor));
                    return res;
                }
            }
        } else if (divisor.eq(MIN_VALUE))
            return this.unsigned ? UZERO : ZERO;
        if (this.isNegative()) {
            if (divisor.isNegative())
                return this.neg().div(divisor.neg());
            return this.neg().div(divisor).neg();
        } else if (divisor.isNegative())
            return this.div(divisor.neg()).neg();
        res = ZERO;
    } else {
        // The algorithm below has not been made for unsigned longs. It's therefore
        // required to take special care of the MSB prior to running it.
        if (!divisor.unsigned)
            divisor = divisor.toUnsigned();
        if (divisor.gt(this))
            return UZERO;
        if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
            return UONE;
        res = UZERO;
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    rem = this;
    while (rem.gte(divisor)) {
        // Approximate the result of division. This may be a little greater or
        // smaller than the actual value.
        approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

        // We will tweak the approximate result by changing it in the 48-th digit or
        // the smallest non-fractional digit, whichever is larger.
        var log2 = Math.ceil(Math.log(approx) / Math.LN2),
            delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48),

        // Decrease the approximation until it is smaller than the remainder.  Note
        // that if it is too large, the product overflows and is negative.
            approxRes = fromNumber(approx),
            approxRem = approxRes.mul(divisor);
        while (approxRem.isNegative() || approxRem.gt(rem)) {
            approx -= delta;
            approxRes = fromNumber(approx, this.unsigned);
            approxRem = approxRes.mul(divisor);
        }

        // We know the answer can't be zero... and actually, zero would cause
        // infinite recursion since we would make no progress.
        if (approxRes.isZero())
            approxRes = ONE;

        res = res.add(approxRes);
        rem = rem.sub(approxRem);
    }
    return res;
};

/**
 * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
 * @function
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Quotient
 */
LongPrototype.div = LongPrototype.divide;

/**
 * Returns this Long modulo the specified.
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Remainder
 */
LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor))
        divisor = fromValue(divisor);

    // use wasm support if present
    if (wasm) {
        var low = (this.unsigned ? wasm.rem_u : wasm.rem_s)(
            this.low,
            this.high,
            divisor.low,
            divisor.high
        );
        return fromBits(low, wasm.get_high(), this.unsigned);
    }

    return this.sub(this.div(divisor).mul(divisor));
};

/**
 * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
 * @function
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Remainder
 */
LongPrototype.mod = LongPrototype.modulo;

/**
 * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
 * @function
 * @param {!Long|number|string} divisor Divisor
 * @returns {!Long} Remainder
 */
LongPrototype.rem = LongPrototype.modulo;

/**
 * Returns the bitwise NOT of this Long.
 * @returns {!Long}
 */
LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
};

/**
 * Returns the bitwise AND of this Long and the specified.
 * @param {!Long|number|string} other Other Long
 * @returns {!Long}
 */
LongPrototype.and = function and(other) {
    if (!isLong(other))
        other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
};

/**
 * Returns the bitwise OR of this Long and the specified.
 * @param {!Long|number|string} other Other Long
 * @returns {!Long}
 */
LongPrototype.or = function or(other) {
    if (!isLong(other))
        other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
};

/**
 * Returns the bitwise XOR of this Long and the given one.
 * @param {!Long|number|string} other Other Long
 * @returns {!Long}
 */
LongPrototype.xor = function xor(other) {
    if (!isLong(other))
        other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
};

/**
 * Returns this Long with bits shifted to the left by the given amount.
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits))
        numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
        return this;
    else if (numBits < 32)
        return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
    else
        return fromBits(0, this.low << (numBits - 32), this.unsigned);
};

/**
 * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
 * @function
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shl = LongPrototype.shiftLeft;

/**
 * Returns this Long with bits arithmetically shifted to the right by the given amount.
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits))
        numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
        return this;
    else if (numBits < 32)
        return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
    else
        return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
};

/**
 * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
 * @function
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shr = LongPrototype.shiftRight;

/**
 * Returns this Long with bits logically shifted to the right by the given amount.
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits))
        numBits = numBits.toInt();
    numBits &= 63;
    if (numBits === 0)
        return this;
    else {
        var high = this.high;
        if (numBits < 32) {
            var low = this.low;
            return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
        } else if (numBits === 32)
            return fromBits(high, 0, this.unsigned);
        else
            return fromBits(high >>> (numBits - 32), 0, this.unsigned);
    }
};

/**
 * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
 * @function
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shru = LongPrototype.shiftRightUnsigned;

/**
 * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
 * @function
 * @param {number|!Long} numBits Number of bits
 * @returns {!Long} Shifted Long
 */
LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;

/**
 * Converts this Long to signed.
 * @returns {!Long} Signed long
 */
LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned)
        return this;
    return fromBits(this.low, this.high, false);
};

/**
 * Converts this Long to unsigned.
 * @returns {!Long} Unsigned long
 */
LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned)
        return this;
    return fromBits(this.low, this.high, true);
};

/**
 * Converts this Long to its byte representation.
 * @param {boolean=} le Whether little or big endian, defaults to big endian
 * @returns {!Array.<number>} Byte representation
 */
LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
};

/**
 * Converts this Long to its little endian byte representation.
 * @returns {!Array.<number>} Little endian byte representation
 */
LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high,
        lo = this.low;
    return [
        lo        & 0xff,
        lo >>>  8 & 0xff,
        lo >>> 16 & 0xff,
        lo >>> 24       ,
        hi        & 0xff,
        hi >>>  8 & 0xff,
        hi >>> 16 & 0xff,
        hi >>> 24
    ];
};

/**
 * Converts this Long to its big endian byte representation.
 * @returns {!Array.<number>} Big endian byte representation
 */
LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high,
        lo = this.low;
    return [
        hi >>> 24       ,
        hi >>> 16 & 0xff,
        hi >>>  8 & 0xff,
        hi        & 0xff,
        lo >>> 24       ,
        lo >>> 16 & 0xff,
        lo >>>  8 & 0xff,
        lo        & 0xff
    ];
};

/**
 * Creates a Long from its byte representation.
 * @param {!Array.<number>} bytes Byte representation
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @param {boolean=} le Whether little or big endian, defaults to big endian
 * @returns {Long} The corresponding Long value
 */
Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
};

/**
 * Creates a Long from its little endian byte representation.
 * @param {!Array.<number>} bytes Little endian byte representation
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {Long} The corresponding Long value
 */
Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(
        bytes[0]       |
        bytes[1] <<  8 |
        bytes[2] << 16 |
        bytes[3] << 24,
        bytes[4]       |
        bytes[5] <<  8 |
        bytes[6] << 16 |
        bytes[7] << 24,
        unsigned
    );
};

/**
 * Creates a Long from its big endian byte representation.
 * @param {!Array.<number>} bytes Big endian byte representation
 * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
 * @returns {Long} The corresponding Long value
 */
Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(
        bytes[4] << 24 |
        bytes[5] << 16 |
        bytes[6] <<  8 |
        bytes[7],
        bytes[0] << 24 |
        bytes[1] << 16 |
        bytes[2] <<  8 |
        bytes[3],
        unsigned
    );
};

},{}],"../src/import/pprof.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importAsPprofProfile = importAsPprofProfile;

var _profileProto = require("./profile.proto.js");

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

var _long = _interopRequireDefault(require("long"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Find the index of the SampleType which should be used as our default
function getSampleTypeIndex(profile) {
  const dflt = profile.defaultSampleType;
  const sampleTypes = profile.sampleType;
  const fallback = sampleTypes.length - 1; // string_table[0] will always be empty-string, so we can assume dflt === 0 is just the proto
  // empty-value, and means no defaultSampleType was specified.

  if (!dflt || !+dflt) {
    return fallback;
  }

  const idx = sampleTypes.findIndex(e => e.type === dflt);

  if (idx === -1) {
    return fallback;
  }

  return idx;
}

function importAsPprofProfile(rawProfile) {
  if (rawProfile.byteLength === 0) return null;
  let protoProfile;

  try {
    protoProfile = _profileProto.perftools.profiles.Profile.decode(new Uint8Array(rawProfile));
  } catch (e) {
    return null;
  }

  function i32(n) {
    return typeof n === 'number' ? n : n.low;
  }

  function stringVal(key) {
    return protoProfile.stringTable[i32(key)] || null;
  }

  const frameInfoByFunctionID = new Map();

  function frameInfoForFunction(f) {
    const {
      name,
      filename,
      startLine
    } = f;
    const nameString = name != null && stringVal(name) || '(unknown)';
    const fileNameString = filename != null ? stringVal(filename) : null;
    const line = startLine != null ? +startLine : null;
    const key = `${nameString}:${fileNameString}:${line}`;
    const frameInfo = {
      key,
      name: nameString
    };

    if (fileNameString != null) {
      frameInfo.file = fileNameString;
    }

    if (line != null) {
      frameInfo.line = line;
    }

    return frameInfo;
  }

  for (let f of protoProfile.function) {
    if (f.id) {
      const frameInfo = frameInfoForFunction(f);

      if (frameInfo != null) {
        frameInfoByFunctionID.set(i32(f.id), frameInfo);
      }
    }
  }

  function frameInfoForLocation(location) {
    const {
      line
    } = location;
    if (line == null) return null; // From a comment on profile.proto:
    //
    //   Multiple line indicates this location has inlined functions,
    //   where the last entry represents the caller into which the
    //   preceding entries were inlined.
    //
    //   E.g., if memcpy() is inlined into printf:
    //      line[0].function_name == "memcpy"
    //      line[1].function_name == "printf"
    //
    // Let's just take the last line then

    const lastLine = (0, _utils.lastOf)(line);
    if (lastLine == null) return null;

    if (lastLine.functionId) {
      let funcFrame = frameInfoByFunctionID.get(i32(lastLine.functionId));
      const line = lastLine.line instanceof _long.default ? lastLine.line.toNumber() : lastLine.line;

      if (line && line > 0 && funcFrame != null) {
        funcFrame.line = line;
      }

      return funcFrame || null;
    } else {
      return null;
    }
  }

  const frameByLocationID = new Map();

  for (let l of protoProfile.location) {
    if (l.id != null) {
      const frameInfo = frameInfoForLocation(l);

      if (frameInfo) {
        frameByLocationID.set(i32(l.id), frameInfo);
      }
    }
  }

  const sampleTypes = protoProfile.sampleType.map(type => ({
    type: type.type && stringVal(type.type) || 'samples',
    unit: type.unit && stringVal(type.unit) || 'count'
  }));
  const sampleTypeIndex = getSampleTypeIndex(protoProfile);

  if (sampleTypeIndex < 0 || sampleTypeIndex >= sampleTypes.length) {
    return null;
  }

  const sampleType = sampleTypes[sampleTypeIndex];
  const profileBuilder = new _profile.StackListProfileBuilder();

  switch (sampleType.unit) {
    case 'nanoseconds':
    case 'microseconds':
    case 'milliseconds':
    case 'seconds':
      profileBuilder.setValueFormatter(new _valueFormatters.TimeFormatter(sampleType.unit));
      break;

    case 'bytes':
      profileBuilder.setValueFormatter(new _valueFormatters.ByteFormatter());
      break;
  }

  for (let s of protoProfile.sample) {
    const stack = s.locationId ? s.locationId.map(l => frameByLocationID.get(i32(l))) : [];
    stack.reverse();

    if (s.value == null || s.value.length <= sampleTypeIndex) {
      return null;
    }

    const value = s.value[sampleTypeIndex];
    profileBuilder.appendSampleWithWeight(stack.filter(f => f != null), +value);
  }

  return profileBuilder.build();
}
},{"./profile.proto.js":"../src/import/profile.proto.js","../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts","long":"../node_modules/long/src/long.js"}],"../src/import/v8heapalloc.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromChromeHeapProfile = importFromChromeHeapProfile;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

const callFrameToFrameInfo = new Map();

function frameInfoForCallFrame(callFrame) {
  return (0, _utils.getOrInsert)(callFrameToFrameInfo, callFrame, callFrame => {
    const file = callFrame.url;
    const line = callFrame.lineNumber;
    const col = callFrame.columnNumber;
    const name = callFrame.functionName || (file ? `(anonymous ${file.split('/').pop()}:${line})` : '(anonymous)');
    return {
      key: `${name}:${file}:${line}:${col}`,
      name,
      file,
      line,
      col
    };
  });
}

function importFromChromeHeapProfile(chromeProfile) {
  const nodeById = new Map();
  let currentId = 0;

  const computeId = (node, parent) => {
    node.id = currentId++;
    nodeById.set(node.id, node);

    if (parent) {
      node.parent = parent.id;
    }

    node.children.forEach(children => computeId(children, node));
  };

  computeId(chromeProfile.head); // Compute the total size

  const computeTotalSize = node => {
    if (node.children.length === 0) return node.selfSize || 0;
    const totalChild = node.children.reduce((total, children) => {
      total += computeTotalSize(children);
      return total;
    }, node.selfSize);
    node.totalSize = totalChild;
    return totalChild;
  };

  const total = computeTotalSize(chromeProfile.head); // Compute all stacks by taking each last node and going upward

  const stacks = [];

  for (let currentNode of nodeById.values()) {
    let stack = [];
    stack.push(currentNode); // While we found a parent

    while (true) {
      if (currentNode.parent === undefined) break;
      const parent = nodeById.get(currentNode.parent);
      if (parent === undefined) break; // Push the parent at the beginning of the stack

      stack.unshift(parent);
      currentNode = parent;
    }

    stacks.push(stack);
  }

  const profile = new _profile.StackListProfileBuilder(total);

  for (let stack of stacks) {
    const lastFrame = stack[stack.length - 1];
    profile.appendSampleWithWeight(stack.map(frame => frameInfoForCallFrame(frame.callFrame)), lastFrame.selfSize);
  }

  profile.setValueFormatter(new _valueFormatters.ByteFormatter());
  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/trace-event.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isTraceEventFormatted = isTraceEventFormatted;
exports.importTraceEvents = importTraceEvents;

var _utils = require("../lib/utils");

var _profile = require("../lib/profile");

var _valueFormatters = require("../lib/value-formatters");

var ExporterSource;

(function (ExporterSource) {
  ExporterSource["HERMES"] = "HERMES";
  ExporterSource["UNKNOWN"] = "UNKNOWN";
})(ExporterSource || (ExporterSource = {}));

const requiredHermesArguments = ['line', 'column', 'name', 'category', 'url', 'params', 'allocatedCategory', 'allocatedName'];

function pidTidKey(pid, tid) {
  // We zero-pad the PID and TID to make sorting them by pid/tid pair later easier.
  return `${(0, _utils.zeroPad)('' + pid, 10)}:${(0, _utils.zeroPad)('' + tid, 10)}`;
}

function partitionByPidTid(events) {
  const map = new Map();

  for (let ev of events) {
    const list = (0, _utils.getOrInsert)(map, pidTidKey(Number(ev.pid), Number(ev.tid)), () => []);
    list.push(ev);
  }

  return map;
}

function selectQueueToTakeFromNext(bEventQueue, eEventQueue) {
  if (bEventQueue.length === 0 && eEventQueue.length === 0) {
    throw new Error('This method should not be given both queues empty');
  }

  if (eEventQueue.length === 0) return 'B';
  if (bEventQueue.length === 0) return 'E';
  const bFront = bEventQueue[0];
  const eFront = eEventQueue[0];
  const bts = bFront.ts;
  const ets = eFront.ts;
  if (bts < ets) return 'B';
  if (ets < bts) return 'E'; // If we got here, the 'B' event queue and the 'E' event queue have events at
  // the front with equal timestamps.
  // If the front of the 'E' queue matches the front of the 'B' queue by key,
  // then it means we have a zero duration event. Process the 'B' queue first
  // to ensure it opens before we try to close it.
  //
  // Otherwise, process the 'E' queue first.

  return getEventId(bFront) === getEventId(eFront) ? 'B' : 'E';
}

function convertToEventQueues(events) {
  const beginEvents = [];
  const endEvents = []; // Rebase all of the timestamps on the lowest timestamp

  if (events.length > 0) {
    let firstTs = Number.MAX_SAFE_INTEGER;

    for (let ev of events) {
      firstTs = Math.min(firstTs, ev.ts);
    }

    for (let ev of events) {
      ev.ts -= firstTs;
    }
  } // Next, combine B, E, and X events into two timestamp ordered queues.


  const xEvents = [];

  for (let ev of events) {
    switch (ev.ph) {
      case 'B':
        {
          beginEvents.push(ev);
          break;
        }

      case 'E':
        {
          endEvents.push(ev);
          break;
        }

      case 'X':
        {
          xEvents.push(ev);
          break;
        }

      default:
        {
          const _exhaustiveCheck = ev;
          return _exhaustiveCheck;
        }
    }
  }

  function dur(x) {
    var _a, _b;

    return (_b = (_a = x.dur) !== null && _a !== void 0 ? _a : x.tdur) !== null && _b !== void 0 ? _b : 0;
  }

  xEvents.sort((a, b) => {
    if (a.ts < b.ts) return -1;
    if (a.ts > b.ts) return 1; // Super weird special case: if we have two 'X' events with the same 'ts'
    // but different 'dur' the only valid interpretation is to put the one with
    // the longer 'dur' first, because you can't nest longer things in shorter
    // things.

    const aDur = dur(a);
    const bDur = dur(b);
    if (aDur > bDur) return -1;
    if (aDur < bDur) return 1; // Otherwise, retain the original order by relying upon a stable sort here.

    return 0;
  });

  for (let x of xEvents) {
    const xDur = dur(x);
    beginEvents.push(Object.assign(Object.assign({}, x), {
      ph: 'B'
    }));
    endEvents.push(Object.assign(Object.assign({}, x), {
      ph: 'E',
      ts: x.ts + xDur
    }));
  }

  function compareTimestamps(a, b) {
    if (a.ts < b.ts) return -1;
    if (a.ts > b.ts) return 1; // Important: if the timestamps are the same, return zero. We're going to
    // rely upon a stable sort here.

    return 0;
  }

  beginEvents.sort(compareTimestamps);
  endEvents.sort(compareTimestamps);
  return [beginEvents, endEvents];
}

function filterIgnoredEventTypes(events) {
  const ret = [];

  for (let ev of events) {
    switch (ev.ph) {
      case 'B':
      case 'E':
      case 'X':
        ret.push(ev);
    }
  }

  return ret;
}

function getProcessNamesByPid(events) {
  const processNamesByPid = new Map();

  for (let ev of events) {
    if (ev.ph === 'M' && ev.name === 'process_name' && ev.args && ev.args.name) {
      processNamesByPid.set(ev.pid, ev.args.name);
    }
  }

  return processNamesByPid;
}

function getThreadNamesByPidTid(events) {
  const threadNameByPidTid = new Map();

  for (let ev of events) {
    if (ev.ph === 'M' && ev.name === 'thread_name' && ev.args && ev.args.name) {
      threadNameByPidTid.set(pidTidKey(ev.pid, ev.tid), ev.args.name);
    }
  }

  return threadNameByPidTid;
}

function getEventName(event) {
  return `${event.name || '(unnamed)'}`;
}
/**
 * Attempt to construct a unique identifier for an event. Note that this
 * is different from the frame key, as in some cases we don't want to include
 * some arguments to allow from frame grouping (e.g. parent in the case of
 * hermes profiles)
 */


function getEventId(event) {
  let key = getEventName(event);

  if (event.args) {
    key += ` ${JSON.stringify(event.args)}`;
  }

  return key;
}

function frameInfoForEvent(event, exporterSource = ExporterSource.UNKNOWN) {
  // In Hermes profiles we have additional guaranteed metadata we can use to
  // more accurately populate profiles with info such as line + col number
  if (exporterSource === ExporterSource.HERMES) {
    // For some reason line numbers in hermes move around a lot...might be a bug in
    // the engine itself. For now if we have a function name, then don't include the
    // line and column number in the frame key
    const hermesFrameKey = ['anonymous', '(unnamed)'].includes(event.name || '') ? `${event.name}:${event.args.url}:${event.args.line}:${event.args.column}` : `${event.name}:${event.args.url}`;
    return {
      name: getEventName(event),
      key: hermesFrameKey,
      file: event.args.url,
      line: event.args.line,
      col: event.args.column
    };
  }

  const key = getEventId(event);
  return {
    name: key,
    key: key
  };
}
/**
 * Constructs an array mapping pid-tid keys to profile builders. Both the traceEvent[]
 * format and the sample + stack frame based object format specify the process and thread
 * names based on metadata so we share this logic.
 *
 * See https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview#heading=h.xqopa5m0e28f
 */


function getProfileNameByPidTid(events, partitionedTraceEvents) {
  const processNamesByPid = getProcessNamesByPid(events);
  const threadNamesByPidTid = getThreadNamesByPidTid(events);
  const profileNamesByPidTid = new Map();
  partitionedTraceEvents.forEach(importableEvents => {
    if (importableEvents.length === 0) return;
    const {
      pid,
      tid
    } = importableEvents[0];
    const profileKey = pidTidKey(pid, tid);
    const processName = processNamesByPid.get(pid);
    const threadName = threadNamesByPidTid.get(profileKey);

    if (processName != null && threadName != null) {
      profileNamesByPidTid.set(profileKey, `${processName} (pid ${pid}), ${threadName} (tid ${tid})`);
    } else if (processName != null) {
      profileNamesByPidTid.set(profileKey, `${processName} (pid ${pid}, tid ${tid})`);
    } else if (threadName != null) {
      profileNamesByPidTid.set(profileKey, `${threadName} (pid ${pid}, tid ${tid})`);
    } else {
      profileNamesByPidTid.set(profileKey, `pid ${pid}, tid ${tid}`);
    }
  });
  return profileNamesByPidTid;
}

function eventListToProfile(importableEvents, name, exporterSource = ExporterSource.UNKNOWN) {
  // The trace event format is hard to deal with because it specifically
  // allows events to be recorded out of order, *but* event ordering is still
  // important for events with the same timestamp. Because of this, rather
  // than thinking about the entire event stream as a single queue of events,
  // we're going to first construct two time-ordered lists of events:
  //
  // 1. ts ordered queue of 'B' events
  // 2. ts ordered queue of 'E' events
  //
  // We deal with 'X' events by converting them to one entry in the 'B' event
  // queue and one entry in the 'E' event queue.
  //
  // The high level goal is to deal with 'B' events in 'ts' order, breaking
  // ties by the order the events occurred in the file, and deal with 'E'
  // events in 'ts' order, breaking ties in whatever order causes the 'E'
  // events to match whatever is on the top of the stack.
  const [bEventQueue, eEventQueue] = convertToEventQueues(importableEvents);
  const profileBuilder = new _profile.CallTreeProfileBuilder();
  profileBuilder.setValueFormatter(new _valueFormatters.TimeFormatter('microseconds'));
  profileBuilder.setName(name);
  const frameStack = [];

  const enterFrame = b => {
    frameStack.push(b);
    profileBuilder.enterFrame(frameInfoForEvent(b, exporterSource), b.ts);
  };

  const tryToLeaveFrame = e => {
    const b = (0, _utils.lastOf)(frameStack);

    if (b == null) {
      console.warn(`Tried to end frame "${frameInfoForEvent(e, exporterSource).key}", but the stack was empty. Doing nothing instead.`);
      return;
    }

    const eFrameInfo = frameInfoForEvent(e, exporterSource);
    const bFrameInfo = frameInfoForEvent(b, exporterSource);

    if (e.name !== b.name) {
      console.warn(`ts=${e.ts}: Tried to end "${eFrameInfo.key}" when "${bFrameInfo.key}" was on the top of the stack. Doing nothing instead.`);
      return;
    }

    if (eFrameInfo.key !== bFrameInfo.key) {
      console.warn(`ts=${e.ts}: Tried to end "${eFrameInfo.key}" when "${bFrameInfo.key}" was on the top of the stack. Ending ${bFrameInfo.key} instead.`);
    }

    frameStack.pop();
    profileBuilder.leaveFrame(bFrameInfo, e.ts);
  };

  while (bEventQueue.length > 0 || eEventQueue.length > 0) {
    const queueName = selectQueueToTakeFromNext(bEventQueue, eEventQueue);

    switch (queueName) {
      case 'B':
        {
          enterFrame(bEventQueue.shift());
          break;
        }

      case 'E':
        {
          // Before we take the first event in the 'E' queue, let's first see if
          // there are any e events that exactly match the top of the stack.
          // We'll prioritize first by key, then by name if we can't find a key
          // match.
          const stackTop = (0, _utils.lastOf)(frameStack);

          if (stackTop != null) {
            const bFrameInfo = frameInfoForEvent(stackTop, exporterSource);
            let swapped = false;

            for (let i = 1; i < eEventQueue.length; i++) {
              const eEvent = eEventQueue[i];

              if (eEvent.ts > eEventQueue[0].ts) {
                // Only consider 'E' events with the same ts as the front of the queue.
                break;
              }

              const eFrameInfo = frameInfoForEvent(eEvent, exporterSource);

              if (bFrameInfo.key === eFrameInfo.key) {
                // We have a match! Process this one first.
                const temp = eEventQueue[0];
                eEventQueue[0] = eEventQueue[i];
                eEventQueue[i] = temp;
                swapped = true;
                break;
              }
            }

            if (!swapped) {
              // There was no key match, let's see if we can find a name match
              for (let i = 1; i < eEventQueue.length; i++) {
                const eEvent = eEventQueue[i];

                if (eEvent.ts > eEventQueue[0].ts) {
                  // Only consider 'E' events with the same ts as the front of the queue.
                  break;
                }

                if (eEvent.name === stackTop.name) {
                  // We have a match! Process this one first.
                  const temp = eEventQueue[0];
                  eEventQueue[0] = eEventQueue[i];
                  eEventQueue[i] = temp;
                  swapped = true;
                  break;
                }
              }
            } // If swapped is still false at this point, it means we're about to
            // pop a stack frame that doesn't even match by name. Bummer.

          }

          const e = eEventQueue.shift();
          tryToLeaveFrame(e);
          break;
        }

      default:
        const _exhaustiveCheck = queueName;
        return _exhaustiveCheck;
    }
  }

  for (let i = frameStack.length - 1; i >= 0; i--) {
    const frame = frameInfoForEvent(frameStack[i], exporterSource);
    console.warn(`Frame "${frame.key}" was still open at end of profile. Closing automatically.`);
    profileBuilder.leaveFrame(frame, profileBuilder.getTotalWeight());
  }

  return profileBuilder.build();
}
/**
 * Returns an array containing the time difference in microseconds between the current
 * sample and the next sample
 */


function getTimeDeltasForSamples(samples) {
  const timeDeltas = [];
  let lastTimeStamp = Number(samples[0].ts);
  samples.forEach((sample, idx) => {
    if (idx === 0) return;
    const timeDiff = Number(sample.ts) - lastTimeStamp;
    lastTimeStamp = Number(sample.ts);
    timeDeltas.push(timeDiff);
  });
  timeDeltas.push(0);
  return timeDeltas;
}
/**
 * The chrome json trace event spec only specifies name and category
 * as required stack frame properties
 *
 * https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview#heading=h.b4y98p32171
 */


function frameInfoForSampleFrame({
  name,
  category
}) {
  return {
    key: `${name}:${category}`,
    name: name
  };
}

function getActiveFramesForSample(stackFrames, frameId) {
  const frames = [];
  let parent = frameId;

  while (parent) {
    const frame = stackFrames[parent];

    if (!frame) {
      throw new Error(`Could not find frame for id ${parent}`);
    }

    frames.push(frameInfoForSampleFrame(frame));
    parent = frame.parent;
  }

  return frames.reverse();
}

function sampleListToProfile(contents, samples, name) {
  const profileBuilder = new _profile.StackListProfileBuilder();
  profileBuilder.setValueFormatter(new _valueFormatters.TimeFormatter('microseconds'));
  profileBuilder.setName(name);
  const timeDeltas = getTimeDeltasForSamples(samples);
  samples.forEach((sample, index) => {
    const timeDelta = timeDeltas[index];
    const activeFrames = getActiveFramesForSample(contents.stackFrames, sample.sf);
    profileBuilder.appendSampleWithWeight(activeFrames, timeDelta);
  });
  return profileBuilder.build();
}

function eventListToProfileGroup(events, exporterSource = ExporterSource.UNKNOWN) {
  const importableEvents = filterIgnoredEventTypes(events);
  const partitionedTraceEvents = partitionByPidTid(importableEvents);
  const profileNamesByPidTid = getProfileNameByPidTid(events, partitionedTraceEvents);
  const profilePairs = [];
  profileNamesByPidTid.forEach((name, profileKey) => {
    const importableEventsForPidTid = partitionedTraceEvents.get(profileKey);

    if (!importableEventsForPidTid) {
      throw new Error(`Could not find events for key: ${importableEventsForPidTid}`);
    }

    profilePairs.push([profileKey, eventListToProfile(importableEventsForPidTid, name, exporterSource)]);
  }); // For now, we just sort processes by pid & tid.
  // TODO: The standard specifies that metadata events with the name
  // "process_sort_index" and "thread_sort_index" can be used to influence the
  // order, but for simplicity we'll ignore that until someone complains :)

  (0, _utils.sortBy)(profilePairs, p => p[0]);
  return {
    name: '',
    indexToView: 0,
    profiles: profilePairs.map(p => p[1])
  };
}

function sampleListToProfileGroup(contents) {
  const importableEvents = filterIgnoredEventTypes(contents.traceEvents);
  const partitionedTraceEvents = partitionByPidTid(importableEvents);
  const partitionedSamples = partitionByPidTid(contents.samples);
  const profileNamesByPidTid = getProfileNameByPidTid(contents.traceEvents, partitionedTraceEvents);
  const profilePairs = [];
  profileNamesByPidTid.forEach((name, profileKey) => {
    const samplesForPidTid = partitionedSamples.get(profileKey);

    if (!samplesForPidTid) {
      throw new Error(`Could not find samples for key: ${samplesForPidTid}`);
    }

    if (samplesForPidTid.length === 0) {
      return;
    }

    profilePairs.push([profileKey, sampleListToProfile(contents, samplesForPidTid, name)]);
  }); // For now, we just sort processes by pid & tid.
  // TODO: The standard specifies that metadata events with the name
  // "process_sort_index" and "thread_sort_index" can be used to influence the
  // order, but for simplicity we'll ignore that until someone complains :)

  (0, _utils.sortBy)(profilePairs, p => p[0]);
  return {
    name: '',
    indexToView: 0,
    profiles: profilePairs.map(p => p[1])
  };
}

function isTraceEventList(maybeEventList) {
  if (!Array.isArray(maybeEventList)) return false;
  if (maybeEventList.length === 0) return false; // Both ph and ts should be provided for every event. In theory, many other
  // fields are mandatory, but without these fields, we won't usefully be able
  // to import the data, so we'll rely upon these.

  for (let el of maybeEventList) {
    if (!('ph' in el)) {
      return false;
    }

    switch (el.ph) {
      case 'B':
      case 'E':
      case 'X':
        // All B, E, and X events must have a timestamp specified, otherwise we
        // won't be able to import correctly.
        if (!('ts' in el)) {
          return false;
        }

      case 'M':
        // It's explicitly okay for "M" (metadata) events not to specify a "ts"
        // field, since usually there is no logical timestamp for them to have
        break;
    }
  }

  return true;
}

function isHermesTraceEvent(traceEventArgs) {
  if (!traceEventArgs) {
    return false;
  }

  return requiredHermesArguments.every(prop => prop in traceEventArgs);
}

function isHermesTraceEventList(maybeEventList) {
  if (!isTraceEventList(maybeEventList)) return false; // We just check the first element to avoid iterating over all trace events,
  // and asumme that if the first one is formatted like a hermes profile then
  // all events will be

  return isHermesTraceEvent(maybeEventList[0].args);
}

function isTraceEventObject(maybeTraceEventObject) {
  if (!('traceEvents' in maybeTraceEventObject)) return false;
  return isTraceEventList(maybeTraceEventObject['traceEvents']);
}

function isTraceEventWithSamples(maybeTraceEventObject) {
  return 'traceEvents' in maybeTraceEventObject && 'stackFrames' in maybeTraceEventObject && 'samples' in maybeTraceEventObject && isTraceEventList(maybeTraceEventObject['traceEvents']);
}

function isTraceEventFormatted(rawProfile) {
  // We're only going to support the JSON formatted profiles for now.
  // The spec also discusses support for data embedded in ftrace supported data: https://lwn.net/Articles/365835/.
  return isTraceEventObject(rawProfile) || isTraceEventList(rawProfile);
}

function importTraceEvents(rawProfile) {
  if (isTraceEventWithSamples(rawProfile)) {
    return sampleListToProfileGroup(rawProfile);
  } else if (isTraceEventObject(rawProfile)) {
    return eventListToProfileGroup(rawProfile.traceEvents);
  } else if (isHermesTraceEventList(rawProfile)) {
    return eventListToProfileGroup(rawProfile, ExporterSource.HERMES);
  } else if (isTraceEventList(rawProfile)) {
    return eventListToProfileGroup(rawProfile);
  } else {
    const _exhaustiveCheck = rawProfile;
    return _exhaustiveCheck;
  }
}
},{"../lib/utils":"../src/lib/utils.ts","../lib/profile":"../src/lib/profile.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/callgrind.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromCallgrind = importFromCallgrind;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

// https://www.valgrind.org/docs/manual/cl-format.html
//
// Larger example files can be found by searching on github:
// https://github.com/search?q=cfn%3D&type=code
//
// Converting callgrind files into flamegraphs is challenging because callgrind
// formatted profiles contain call graphs with weighted nodes and edges, and
// such a weighted call graph does not uniquely define a flamegraph.
//
// Consider a program that looks like this:
//
//    // example.js
//    function backup(read) {
//      if (read) {
//        read()
//      } else {
//        write()
//      }
//    }
//
//    function start() {
//       backup(true)
//    }
//
//    function end() {
//       backup(false)
//    }
//
//    start()
//    end()
//
// Profiling this program might result in a profile that looks like the
// following flame graph defined in Brendan Gregg's plaintext format:
//
//    start;backup;read 4
//    end;backup;write 4
//
// When we convert this execution into a call-graph, we get the following:
//
//      +------------------+     +---------------+
//      | start (self: 0)  |     | end (self: 0) |
//      +------------------+     +---------------|
//                   \               /
//        (total: 4)  \             / (total: 4)
//                     v           v
//                 +------------------+
//                 | backup (self: 0) |
//                 +------------------+
//                    /            \
//       (total: 4)  /              \ (total: 4)
//                  v                v
//      +----------------+      +-----------------+
//      | read (self: 4) |      | write (self: 4) |
//      +----------------+      +-----------------+
//
// In the process of the conversion, we've lost information about the ratio of
// time spent in read v.s. write in the start call v.s. the end call. The
// following flame graph would yield the exact same call-graph, and therefore
// the exact sample call-grind formatted profile:
//
//    start;backup;read 3
//    start;backup;write 1
//    end;backup;read 1
//    end;backup;write 3
//
// This is unfortunate, since it means we can't produce a flamegraph that isn't
// potentially lying about the what the actual execution behavior was. To
// produce a flamegraph at all from the call graph representation, we have to
// decide how much weight each sub-call should have. Given that we know the
// total weight of each node, we'll make the incorrect assumption that every
// invocation of a function will have the average distribution of costs among
// the sub-function invocations. In the example given, this means we assume that
// every invocation of backup() is assumed to spend half its time in read() and
// half its time in write().
//
// So the flamegraph we'll produce from the given call-graph will actually be:
//
//    start;backup;read 2
//    start;backup;write 2
//    end;backup;read 2
//    end;backup;write 2
//
// A particularly bad consequence is that the resulting flamegraph will suggest
// that there was at some point a call stack that looked like
// strat;backup;write, even though that never happened in the real program
// execution.
class CallGraph {
  constructor(fileName, fieldName) {
    this.fileName = fileName;
    this.fieldName = fieldName;
    this.frameSet = new _utils.KeyedSet();
    this.totalWeights = new Map();
    this.childrenTotalWeights = new Map();
  }

  getOrInsertFrame(info) {
    return _profile.Frame.getOrInsert(this.frameSet, info);
  }

  addToTotalWeight(frame, weight) {
    if (!this.totalWeights.has(frame)) {
      this.totalWeights.set(frame, weight);
    } else {
      this.totalWeights.set(frame, this.totalWeights.get(frame) + weight);
    }
  }

  addSelfWeight(frameInfo, weight) {
    this.addToTotalWeight(this.getOrInsertFrame(frameInfo), weight);
  }

  addChildWithTotalWeight(parentInfo, childInfo, weight) {
    const parent = this.getOrInsertFrame(parentInfo);
    const child = this.getOrInsertFrame(childInfo);
    const childMap = (0, _utils.getOrInsert)(this.childrenTotalWeights, parent, k => new Map());

    if (!childMap.has(child)) {
      childMap.set(child, weight);
    } else {
      childMap.set(child, childMap.get(child) + weight);
    }

    this.addToTotalWeight(parent, weight);
  }

  toProfile() {
    const profile = new _profile.CallTreeProfileBuilder();
    let unitMultiplier = 1; // These are common field names used by Xdebug. Let's give them special
    // treatment to more helpfully display units.

    if (this.fieldName === 'Time_(10ns)') {
      profile.setName(`${this.fileName} -- Time`);
      unitMultiplier = 10;
      profile.setValueFormatter(new _valueFormatters.TimeFormatter('nanoseconds'));
    } else if (this.fieldName == 'Memory_(bytes)') {
      profile.setName(`${this.fileName} -- Memory`);
      profile.setValueFormatter(new _valueFormatters.ByteFormatter());
    } else {
      profile.setName(`${this.fileName} -- ${this.fieldName}`);
    }

    let totalCumulative = 0;
    const currentStack = new Set();
    let maxWeight = 0;

    for (let [_, totalWeight] of this.totalWeights) {
      maxWeight = Math.max(maxWeight, totalWeight);
    }

    const visit = (frame, subtreeTotalWeight) => {
      if (currentStack.has(frame)) {
        // Call-graphs are allowed to have cycles. Call-trees are not. In case
        // we run into a cycle, we'll just avoid recursing into the same subtree
        // more than once in a call stack. The result will be that the time
        // spent in the recursive call will instead be attributed as self time
        // in the parent.
        return;
      } // We need to calculate how much weight to give to a particular node in
      // the call-tree based on information from the call-graph. A given node
      // from the call-graph might correspond to several nodes in the call-tree,
      // so we need to decide how to distribute the weight of the call-graph
      // node to the various call-tree nodes.
      //
      // We assume that the weighting is evenly distributed. If a call-tree node
      // X occurs with weights x1 and x2, and we know from the call-graph that
      // child Y of X has a total weight y, then we assume the child Y of X has
      // weight y*x1/(x1 + x2) for the first occurrence, and y*x2(y1 + x2) for
      // the second occurrence.
      //
      // This assumption is incorrectly (sometimes wildly so), but we need to
      // make *some* assumption, and this seems to me the sanest option.
      //
      // See the comment at the top of the file for an example where this
      // assumption can yield especially misleading results.


      if (subtreeTotalWeight < 1e-4 * maxWeight) {
        // This assumption about even distribution can cause us to generate a
        // call tree with dramatically more nodes than the call graph.
        //
        // Consider a function which is called 1000 times, where the result is
        // cached. The first invocation has a complex call tree and may take
        // 100ms. Let's say that this complex call tree has 250 nodes.
        //
        // Subsequent calls use the cached result, so take only 1ms, and have no
        // children in their call trees. So we have, in total, (1 + 250) + 999
        // nodes in the call-tree for a total of 1250 nodes.
        //
        // The information specific to each invocation is, however, lost in the
        // call-graph representation.
        //
        // Because of the even distribution assumption we make, this means that
        // the call-trees of each invocation will have the same shape. Each 1ms
        // call-tree will look identical to the 100ms call-tree, just
        // horizontally compacted. So instead of 1251 nodes, we have
        // 1000*250=250,000 nodes in the resulting call graph.
        //
        // To mitigate this explosion of the # of nodes, we ignore subtrees
        // whose weights are less than 0.01% of the heaviest node in the call
        // graph.
        return;
      }

      const totalWeightForFrameInCallgraph = (0, _utils.getOrElse)(this.totalWeights, frame, () => 0);

      if (totalWeightForFrameInCallgraph === 0) {
        return;
      }

      let selfWeightForNodeInCallTree = subtreeTotalWeight;
      profile.enterFrame(frame, Math.round(totalCumulative * unitMultiplier));
      currentStack.add(frame);

      for (let [child, totalWeightAsChild] of this.childrenTotalWeights.get(frame) || []) {
        // To determine the weight of the child in the call tree, we look at the
        // weight of the child in the call graph relative to its parent.
        const childCallTreeWeight = subtreeTotalWeight * (totalWeightAsChild / totalWeightForFrameInCallgraph);
        let prevTotalCumulative = totalCumulative;
        visit(child, childCallTreeWeight); // Even though we tried to add a child with total weight equal to
        // childCallTreeWeight, we might have failed for a variety of data
        // consistency reasons, or due to cycles.
        //
        // We want to avoid losing weight in the call tree by subtracting from
        // the self weight on the assumption it was added to the subtree, so we
        // only subtree from the self weight the amount that was *actually* used
        // by the subtree, rather than the amount we *intended* for it to use.

        const actualChildCallTreeWeight = totalCumulative - prevTotalCumulative;
        selfWeightForNodeInCallTree -= actualChildCallTreeWeight;
      }

      currentStack.delete(frame);
      totalCumulative += selfWeightForNodeInCallTree;
      profile.leaveFrame(frame, Math.round(totalCumulative * unitMultiplier));
    }; // It's surprisingly hard to figure out which nodes in the call graph
    // constitute the root nodes of call trees.
    //
    // Here are a few intuitive options, and reasons why they're not always
    // correct or good.
    //
    // ## 1. Find nodes in the call graph that have no callers
    //
    // This is probably right 99% of the time in practice, but since the
    // callgrind is totally general, it's totally valid to have a file
    // representing a profile for the following code:
    //
    //    function a() {
    //      b()
    //    }
    //    function b() {
    //    }
    //    a()
    //    b()
    //
    // In this case, even though b has a caller, some of the real calltree for
    // an execution trace of the program will have b on the top of the stack.
    //
    // ## 2. Find nodes in the call graph that still have weight if you
    //       subtract all of the weight caused by callers.
    //
    // The callgraph format, in theory, provides inclusive times for every
    // function call. That means if you have a function `alpha` with a total
    // weight of 20, and its only in-edge in the call-graph has weight of 10,
    // that should indicate that `alpha` exists both as the root-node of a
    // calltree, and as a node in some other call-tree.
    //
    // In theory, you should be able to figure out the weight of it as a root
    // node by subtracting the weights of all the in-edges. In practice, real
    // callgrind files are inconsistent in how they do accounting for in-edges
    // where you end up in weird situations where the weight of in-edges
    // *exceeds* the weight of nodes (where the weight of a node is its
    // self-weight plus the weight of all its out-edges).
    //
    // ## 3. Find the heaviest node in the call graph, build its call-tree, and
    //       decrease the weights of other nodes in the call graph while you
    //       build the call tree. After you've done this, repeat with the new
    //       heaviest.
    //
    // I think this version is probably fully correct, but the performance is
    // awful. The naive-version is O(n^2) because you have to re-determine which
    // node is the heaviest after each time you finish building a call-tree. You
    // can't just sort, because the relative ordering also changes with the
    // construction of each call tree.
    //
    // There's probably a clever solution here which puts all of the nodes into
    // a min-heap and then deletes and re-inserts nodes as their weights change,
    // but reasoning about the performance of that is a big pain in the butt.
    //
    // Despite not always being correct, I'm opting for option (1).


    const rootNodes = new Set(this.frameSet);

    for (let [_, childMap] of this.childrenTotalWeights) {
      for (let [child, _] of childMap) {
        rootNodes.delete(child);
      }
    }

    for (let rootNode of rootNodes) {
      visit(rootNode, this.totalWeights.get(rootNode));
    }

    return profile.build();
  }

} // In writing this, I initially tried to use the formal grammar described in
// section 3.2 of https://www.valgrind.org/docs/manual/cl-format.html, but
// stopped because most of the information isn't relevant for visualization, and
// because there's inconsistency between the grammar and subsequence
// descriptions.
//
// For example, the grammar for headers specifies all the valid header names,
// but then the writing below that mentions there may be a "totals" or "summary"
// header, which should be disallowed by the formal grammar.
//
// So, instead, I'm not going to bother with a formal parse. Since there are no
// real recursive structures in this file format, that should be okay.


class CallgrindParser {
  constructor(contents, importedFileName) {
    this.importedFileName = importedFileName;
    this.callGraphs = null;
    this.eventsLine = null;
    this.filename = null;
    this.functionName = null;
    this.calleeFilename = null;
    this.calleeFunctionName = null;
    this.savedFileNames = {};
    this.savedFunctionNames = {};
    this.prevCostLineNumbers = [];
    this.lines = [...contents.splitLines()];
    this.lineNum = 0;
  }

  parse() {
    while (this.lineNum < this.lines.length) {
      const line = this.lines[this.lineNum++];

      if (/^\s*#/.exec(line)) {
        // Line is a comment. Ignore it.
        continue;
      }

      if (/^\s*$/.exec(line)) {
        // Line is empty. Ignore it.
        continue;
      }

      if (this.parseHeaderLine(line)) {
        continue;
      }

      if (this.parseAssignmentLine(line)) {
        continue;
      }

      if (this.parseCostLine(line, 'self')) {
        continue;
      }

      throw new Error(`Unrecognized line "${line}" on line ${this.lineNum}`);
    }

    if (!this.callGraphs) {
      return null;
    }

    return {
      name: this.importedFileName,
      indexToView: 0,
      profiles: this.callGraphs.map(cg => cg.toProfile())
    };
  }

  frameInfo() {
    const file = this.filename || '(unknown)';
    const name = this.functionName || '(unknown)';
    const key = `${file}:${name}`;
    return {
      key,
      name,
      file
    };
  }

  calleeFrameInfo() {
    const file = this.calleeFilename || this.filename || '(unknown)';
    const name = this.calleeFunctionName || '(unknown)';
    const key = `${file}:${name}`;
    return {
      key,
      name,
      file
    };
  }

  parseHeaderLine(line) {
    const headerMatch = /^\s*(\w+):\s*(.*)+$/.exec(line);
    if (!headerMatch) return false;

    if (headerMatch[1] !== 'events') {
      // We don't care about other headers. Ignore this line.
      return true;
    } // Line specifies the formatting of subsequent cost lines.


    const fields = headerMatch[2].split(' ');

    if (this.callGraphs != null) {
      throw new Error(`Duplicate "events: " lines specified. First was "${this.eventsLine}", now received "${line}" on ${this.lineNum}.`);
    }

    this.callGraphs = fields.map(fieldName => {
      return new CallGraph(this.importedFileName, fieldName);
    });
    return true;
  }

  parseAssignmentLine(line) {
    const assignmentMatch = /^(\w+)=\s*(.*)$/.exec(line);
    if (!assignmentMatch) return false;
    const key = assignmentMatch[1];
    const value = assignmentMatch[2];

    switch (key) {
      case 'fe':
      case 'fi':
        {
          // fe/fi are used to indicate the source-file of a function definition
          // changed mid-definition. This is for inlined code, but doesn't
          // indicate that we've actually switched to referring to a different
          // function, so we mostly ignore it.
          //
          // We still need to do the parseNameWithCompression call in case a name
          // is defined and then referenced later on for name compression.
          this.parseNameWithCompression(value, this.savedFileNames);
          break;
        }

      case 'fl':
        {
          this.filename = this.parseNameWithCompression(value, this.savedFileNames);
          break;
        }

      case 'fn':
        {
          this.functionName = this.parseNameWithCompression(value, this.savedFunctionNames);
          break;
        }

      case 'cfi':
      case 'cfl':
        {
          // NOTE: unlike the fe/fi distinction described above, cfi and cfl are
          // interchangeable.
          this.calleeFilename = this.parseNameWithCompression(value, this.savedFileNames);
          break;
        }

      case 'cfn':
        {
          this.calleeFunctionName = this.parseNameWithCompression(value, this.savedFunctionNames);
          break;
        }

      case 'calls':
        {
          // TODO(jlfwong): This is currently ignoring the number of calls being
          // made. Accounting for the number of calls might be unhelpful anyway,
          // since it'll just be copying the exact same frame over-and-over again,
          // but that might be better than ignoring it.
          this.parseCostLine(this.lines[this.lineNum++], 'child'); // This isn't specified anywhere in the spec, but empirically the and
          // "cfn" scope should only persist for a single "call".
          //
          // This seems to be what KCacheGrind does too:
          //
          // https://github.com/KDE/kcachegrind/blob/ea4314db2785cb8f279fe884ee7f82445642b692/libcore/cachegrindloader.cpp#L1259

          this.calleeFilename = null;
          this.calleeFunctionName = null;
          break;
        }

      case 'cob':
      case 'ob':
        {
          // We ignore these for now. They're valid lines, but we don't capture or
          // display information about them.
          break;
        }

      default:
        {
          console.log(`Ignoring assignment to unrecognized key "${line}" on line ${this.lineNum}`);
        }
    }

    return true;
  }

  parseNameWithCompression(name, saved) {
    {
      const nameDefinitionMatch = /^\((\d+)\)\s*(.+)$/.exec(name);

      if (nameDefinitionMatch) {
        const id = nameDefinitionMatch[1];
        const name = nameDefinitionMatch[2];

        if (id in saved) {
          throw new Error(`Redefinition of name with id: ${id}. Original value was "${saved[id]}". Tried to redefine as "${name}" on line ${this.lineNum}.`);
        }

        saved[id] = name;
        return name;
      }
    }
    {
      const nameUseMatch = /^\((\d+)\)$/.exec(name);

      if (nameUseMatch) {
        const id = nameUseMatch[1];

        if (!(id in saved)) {
          throw new Error(`Tried to use name with id ${id} on line ${this.lineNum} before it was defined.`);
        }

        return saved[id];
      }
    }
    return name;
  }

  parseCostLine(line, costType) {
    // TODO(jlfwong): Allow hexadecimal encoding
    const parts = line.split(/\s+/);
    const nums = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.length === 0) {
        return false;
      }

      if (part === '*' || part[0] === '-' || part[1] === '+') {
        // This handles "Subposition compression"
        // See: https://valgrind.org/docs/manual/cl-format.html#cl-format.overview.compression2
        if (this.prevCostLineNumbers.length <= i) {
          throw new Error(`Line ${this.lineNum} has a subposition on column ${i} but ` + `previous cost line has only ${this.prevCostLineNumbers.length} ` + `columns. Line contents: ${line}`);
        }

        const prevCostForSubposition = this.prevCostLineNumbers[i];

        if (part === '*') {
          nums.push(prevCostForSubposition);
        } else {
          // This handles both the '-' and '+' cases
          const offset = parseInt(part);

          if (isNaN(offset)) {
            throw new Error(`Line ${this.lineNum} has a subposition on column ${i} but ` + `the offset is not a number. Line contents: ${line}`);
          }

          nums.push(prevCostForSubposition + offset);
        }
      } else {
        const asNum = parseInt(part);

        if (isNaN(asNum)) {
          return false;
        }

        nums.push(asNum);
      }
    }

    if (nums.length == 0) {
      return false;
    } // TODO(jlfwong): Handle custom positions format w/ multiple parts


    const numPositionFields = 1; // NOTE: We intentionally do not include the line number here because
    // callgrind uses the line number of the function invocation, not the
    // line number of the function definition, which conflicts with how
    // speedscope uses line numbers.
    //
    // const lineNum = nums[0]

    if (!this.callGraphs) {
      throw new Error(`Encountered a cost line on line ${this.lineNum} before event specification was provided.`);
    }

    for (let i = 0; i < this.callGraphs.length; i++) {
      if (costType === 'self') {
        this.callGraphs[i].addSelfWeight(this.frameInfo(), nums[numPositionFields + i]);
      } else if (costType === 'child') {
        this.callGraphs[i].addChildWithTotalWeight(this.frameInfo(), this.calleeFrameInfo(), nums[numPositionFields + i] || 0);
      }
    }

    this.prevCostLineNumbers = nums;
    return true;
  }

}

function importFromCallgrind(contents, importedFileName) {
  return new CallgrindParser(contents, importedFileName).parse();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/papyrus.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromPapyrus = importFromPapyrus;

var _profile = require("../lib/profile");

var _utils = require("../lib/utils");

var _valueFormatters = require("../lib/value-formatters");

// This importer is for Papyrus, a proprietary DSL written by Bethesda for Skyrim and FO4. It is used both for the base
// games and for mods. You can find documentation (such as the language reference) here:
// https://ck.uesp.net/wiki/Category:Papyrus
//
// For mod authors: you can find documentation on how to start profiling from the console here:
// https://ck.uesp.net/wiki/StartPapyrusScriptProfile
// and you can also start from your script:
// https://ck.uesp.net/wiki/StartScriptProfiling_-_Debug
// If you want to profile an entire mod, it is often helpful to use `StartFormProfile` on your "main quest". This will
// then profile all scripts attached to that Form.
//
// Papyrus works with a queue system, because it is multithreaded, but only one thread can exist per script.
// (And we can only profile one script at a time.) We parse most "QUEUE_PUSH" events, specifically those that come
// directly before their corresponding "PUSH" event. Other "QUEUE_PUSH" (and all "QUEUE_POP") events come, as far as I
// can tell, from Events and are thus asynchronous. They are ignored.
//
// Stack profiling also puts a "START" operation at the top and a "STOP" operation at the bottom of the file. These are
// completely useless to us.
//
// Stack profiling also logs the Form a method is run on. For those that are not familiar with
// Papyrus terminology, a "Form" is an instance of a type defined by a script. E.g. a quest is a form that extends
// the "Quest" script, and thus it has certain methods, like "CompleteQuest()". This information would be useful
// for Debugging, but for profiling, it would hinder meaningful output in left heavy mode.
function importFromPapyrus(papyrusProfile) {
  const profile = new _profile.CallTreeProfileBuilder();
  profile.setValueFormatter(new _valueFormatters.TimeFormatter('milliseconds'));
  const papyrusProfileLines = [...papyrusProfile.splitLines()].filter(line => !/^$|^Log closed$|log opened/.exec(line));
  let startValue = -1;
  const firstLineParsed = parseLine(papyrusProfileLines[0]);
  if (firstLineParsed === null) throw Error;
  startValue = firstLineParsed.at;
  const lastLine = (0, _utils.lastOf)(papyrusProfileLines);
  if (lastLine === null) throw Error;
  const lastLineParsed = parseLine(lastLine);
  if (lastLineParsed === null) throw Error;
  const endValue = lastLineParsed.at;
  const nameSet = new _utils.KeyedSet();
  const frameStack = [];
  let lastEventAt = 0;
  let lastQueueFrameName;
  let lastQueueFrameAt = -1;

  function enterFrame(stackInt, at, frameName) {
    function enterFrameHelper(at, frameName) {
      frameStack.push(frameName);
      profile.enterFrame(_profile.Frame.getOrInsert(nameSet, {
        name: frameName,
        key: frameName
      }), at);
      lastEventAt = at;
    } // Check if the last event was "QUEUE_PUSH"


    if (lastQueueFrameAt > -1) {
      lastQueueFrameAt = -1; // If the queue from last event matches our current frame,

      if (lastQueueFrameName === frameName && lastQueueFrameAt >= lastEventAt) {
        // first enter the queue frame at its earlier time
        enterFrame(stackInt, lastQueueFrameAt, `QUEUE ${frameName}`);
      }
    }

    const stackFrameStr = `STACK ${stackInt}`; // If the uppermost STACK frame on the frameStack isn't stackFrameStr

    if ([...frameStack].reverse().find(frameName => frameName.startsWith('STACK ')) !== stackFrameStr) {
      // If we're at the bottom of the frameStack, STACK frames are kept open as long as functions only run in that
      // specific stack and closed with the function's end if the next function runs on a different stack.
      if (frameStack.length === 1) leaveFrame(lastEventAt);
      enterFrameHelper(at, stackFrameStr);
    }

    enterFrameHelper(at, frameName);
  }

  function leaveFrame(at) {
    const frame = frameStack.pop();
    if (frame === undefined) throw Error('Tried to leave frame when nothing was on stack.');
    profile.leaveFrame(_profile.Frame.getOrInsert(nameSet, {
      name: frame,
      key: frame
    }), at);
    let topOfStack = (0, _utils.lastOf)(frameStack); // Technically, the frame is popped from queue once it is pushed onto the stack (once we have "entered the frame")
    // but since we want to visualize meaningfully, we count from QUEUE_PUSH to POP and prefix with "QUEUE ".

    if (topOfStack !== null && topOfStack.startsWith('QUEUE ')) {
      leaveFrame(at);
      topOfStack = (0, _utils.lastOf)(frameStack);
    }

    if (frameStack.length > 1 && topOfStack !== null && topOfStack.startsWith('STACK ')) {
      leaveFrame(at);
    }

    lastEventAt = at;
  }

  function tryToLeaveFrame(stackInt, at, frameName) {
    if ((0, _utils.lastOf)(frameStack) === frameName) {
      leaveFrame(at);
    } else {
      if (lastEventAt === 0) {
        console.log(`Tried to leave frame "${frameName}" which was never entered. Assuming it has been running since the start.`);
        enterFrame(stackInt, 0, frameName);
        leaveFrame(at);
      } else {
        console.log(`Tried to leave frame "${frameName}" which was never entered. Other events have happened since the start, ignoring line.`);
      }
    }
  }

  function parseLine(lineStr) {
    if (lineStr === undefined) throw Error('Probably tried to import empty file.');
    const lineArr = lineStr.split(':');
    if (lineArr.length < 3) return null;

    if (startValue !== -1) {
      return {
        at: parseInt(lineArr[0]) - startValue,
        event: lineArr[1],
        stackInt: parseInt(lineArr[2]),
        name: lineArr[5]
      };
    } else {
      // When parsing the first line, we return an absolute `at` value to initialize `startValue`
      return {
        at: parseInt(lineArr[0]),
        event: lineArr[1],
        stackInt: parseInt(lineArr[2]),
        name: lineArr[5]
      };
    }
  }

  papyrusProfileLines.forEach((lineStr, i, papyrusProfileLines) => {
    const parsedLine = parseLine(lineStr);
    if (parsedLine === null) return; // continue

    if (parsedLine.event === 'PUSH') {
      enterFrame(parsedLine.stackInt, parsedLine.at, parsedLine.name);
      i += 1;
      let parsedNextLine = parseLine(papyrusProfileLines[i]); // Search all future events in the current event for one that leaves the current frame. If it exists, leave now.
      // This way, we avoid speedscope choking on the possibly wrong order of events. The changed order is still
      // functionally correct, as the function took less than a millisecond to execute, which is measured as 0 (ms).

      while (parsedNextLine !== null && parsedNextLine.at === parsedLine.at) {
        if (parsedNextLine.name === parsedLine.name && parsedNextLine.stackInt === parsedLine.stackInt && parsedNextLine.event === 'POP') {
          tryToLeaveFrame(parsedNextLine.stackInt, parsedNextLine.at, parsedNextLine.name); // Delete the line that we successfully parsed and imported such that it is not processed twice

          papyrusProfileLines.splice(i, 1);
          parsedNextLine = null;
        } else {
          i += 1;
          if (i < papyrusProfileLines.length) parsedNextLine = parseLine(papyrusProfileLines[i]);
        }
      }
    } else if (parsedLine.event === 'POP') {
      tryToLeaveFrame(parsedLine.stackInt, parsedLine.at, parsedLine.name);
    } else if (parsedLine.event === 'QUEUE_PUSH') {
      lastQueueFrameName = parsedLine.name.replace(/\?/g, '');
      lastQueueFrameAt = parsedLine.at;
      return;
    }
  }); // Close frames that are still open

  while (frameStack.length > 0) {
    leaveFrame(endValue);
  }

  return profile.build();
}
},{"../lib/profile":"../src/lib/profile.ts","../lib/utils":"../src/lib/utils.ts","../lib/value-formatters":"../src/lib/value-formatters.ts"}],"../src/import/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importProfileGroupFromText = importProfileGroupFromText;
exports.importProfileGroupFromBase64 = importProfileGroupFromBase64;
exports.importProfilesFromFile = importProfilesFromFile;
exports.importProfilesFromArrayBuffer = importProfilesFromArrayBuffer;
exports.importFromFileSystemDirectoryEntry = importFromFileSystemDirectoryEntry;

var _chrome = require("./chrome");

var _stackprof = require("./stackprof");

var _instruments = require("./instruments");

var _bgFlamegraph = require("./bg-flamegraph");

var _firefox = require("./firefox");

var _fileFormat = require("../lib/file-format");

var _v8proflog = require("./v8proflog");

var _linuxToolsPerf = require("./linux-tools-perf");

var _haskell = require("./haskell");

var _safari = require("./safari");

var _utils = require("./utils");

var _pprof = require("./pprof");

var _utils2 = require("../lib/utils");

var _v8heapalloc = require("./v8heapalloc");

var _traceEvent = require("./trace-event");

var _callgrind = require("./callgrind");

var _papyrus = require("./papyrus");

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

function importProfileGroupFromText(fileName, contents) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield importProfileGroup(new _utils.TextProfileDataSource(fileName, contents));
  });
}

function importProfileGroupFromBase64(fileName, b64contents) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield importProfileGroup(_utils.MaybeCompressedDataReader.fromArrayBuffer(fileName, (0, _utils2.decodeBase64)(b64contents).buffer));
  });
}

function importProfilesFromFile(file) {
  return __awaiter(this, void 0, void 0, function* () {
    return importProfileGroup(_utils.MaybeCompressedDataReader.fromFile(file));
  });
}

function importProfilesFromArrayBuffer(fileName, buffer) {
  return __awaiter(this, void 0, void 0, function* () {
    return importProfileGroup(_utils.MaybeCompressedDataReader.fromArrayBuffer(fileName, buffer));
  });
}

function importProfileGroup(dataSource) {
  return __awaiter(this, void 0, void 0, function* () {
    const fileName = yield dataSource.name();
    const profileGroup = yield _importProfileGroup(dataSource);

    if (profileGroup) {
      if (!profileGroup.name) {
        profileGroup.name = fileName;
      }

      for (let profile of profileGroup.profiles) {
        if (profile && !profile.getName()) {
          profile.setName(fileName);
        }
      }

      return profileGroup;
    }

    return null;
  });
}

function toGroup(profile) {
  if (!profile) return null;
  return {
    name: profile.getName(),
    indexToView: 0,
    profiles: [profile]
  };
}

function _importProfileGroup(dataSource) {
  return __awaiter(this, void 0, void 0, function* () {
    const fileName = yield dataSource.name();
    const buffer = yield dataSource.readAsArrayBuffer();
    {
      const profile = (0, _pprof.importAsPprofProfile)(buffer);

      if (profile) {
        console.log('Importing as protobuf encoded pprof file');
        return toGroup(profile);
      }
    }
    const contents = yield dataSource.readAsText(); // First pass: Check known file format names to infer the file type

    if (fileName.endsWith('.speedscope.json')) {
      console.log('Importing as speedscope json file');
      return (0, _fileFormat.importSpeedscopeProfiles)(contents.parseAsJSON());
    } else if (/Trace-\d{8}T\d{6}/.exec(fileName)) {
      console.log('Importing as Chrome Timeline Object');
      return (0, _chrome.importFromChromeTimeline)(contents.parseAsJSON().traceEvents, fileName);
    } else if (fileName.endsWith('.chrome.json') || /Profile-\d{8}T\d{6}/.exec(fileName)) {
      console.log('Importing as Chrome Timeline');
      return (0, _chrome.importFromChromeTimeline)(contents.parseAsJSON(), fileName);
    } else if (fileName.endsWith('.stackprof.json')) {
      console.log('Importing as stackprof profile');
      return toGroup((0, _stackprof.importFromStackprof)(contents.parseAsJSON()));
    } else if (fileName.endsWith('.instruments.txt')) {
      console.log('Importing as Instruments.app deep copy');
      return toGroup((0, _instruments.importFromInstrumentsDeepCopy)(contents));
    } else if (fileName.endsWith('.linux-perf.txt')) {
      console.log('Importing as output of linux perf script');
      return (0, _linuxToolsPerf.importFromLinuxPerf)(contents);
    } else if (fileName.endsWith('.collapsedstack.txt')) {
      console.log('Importing as collapsed stack format');
      return toGroup((0, _bgFlamegraph.importFromBGFlameGraph)(contents));
    } else if (fileName.endsWith('.v8log.json')) {
      console.log('Importing as --prof-process v8 log');
      return toGroup((0, _v8proflog.importFromV8ProfLog)(contents.parseAsJSON()));
    } else if (fileName.endsWith('.heapprofile')) {
      console.log('Importing as Chrome Heap Profile');
      return toGroup((0, _v8heapalloc.importFromChromeHeapProfile)(contents.parseAsJSON()));
    } else if (fileName.endsWith('-recording.json')) {
      console.log('Importing as Safari profile');
      return toGroup((0, _safari.importFromSafari)(contents.parseAsJSON()));
    } else if (fileName.startsWith('callgrind.')) {
      console.log('Importing as Callgrind profile');
      return (0, _callgrind.importFromCallgrind)(contents, fileName);
    } // Second pass: Try to guess what file format it is based on structure


    let parsed;

    try {
      parsed = contents.parseAsJSON();
    } catch (e) {}

    if (parsed) {
      if (parsed['$schema'] === 'https://www.speedscope.app/file-format-schema.json') {
        console.log('Importing as speedscope json file');
        return (0, _fileFormat.importSpeedscopeProfiles)(parsed);
      } else if (parsed['systemHost'] && parsed['systemHost']['name'] == 'Firefox') {
        console.log('Importing as Firefox profile');
        return toGroup((0, _firefox.importFromFirefox)(parsed));
      } else if ((0, _chrome.isChromeTimeline)(parsed)) {
        console.log('Importing as Chrome Timeline');
        return (0, _chrome.importFromChromeTimeline)(parsed, fileName);
      } else if ((0, _chrome.isChromeTimelineObject)(parsed)) {
        console.log('Importing as Chrome Timeline Object');
        return (0, _chrome.importFromChromeTimeline)(parsed.traceEvents, fileName);
      } else if ('nodes' in parsed && 'samples' in parsed && 'timeDeltas' in parsed) {
        console.log('Importing as Chrome CPU Profile');
        return toGroup((0, _chrome.importFromChromeCPUProfile)(parsed));
      } else if ((0, _traceEvent.isTraceEventFormatted)(parsed)) {
        console.log('Importing as Trace Event Format profile');
        return (0, _traceEvent.importTraceEvents)(parsed);
      } else if ('head' in parsed && 'samples' in parsed && 'timestamps' in parsed) {
        console.log('Importing as Chrome CPU Profile (old format)');
        return toGroup((0, _chrome.importFromOldV8CPUProfile)(parsed));
      } else if ('mode' in parsed && 'frames' in parsed && 'raw_timestamp_deltas' in parsed) {
        console.log('Importing as stackprof profile');
        return toGroup((0, _stackprof.importFromStackprof)(parsed));
      } else if ('code' in parsed && 'functions' in parsed && 'ticks' in parsed) {
        console.log('Importing as --prof-process v8 log');
        return toGroup((0, _v8proflog.importFromV8ProfLog)(parsed));
      } else if ('head' in parsed && 'selfSize' in parsed['head']) {
        console.log('Importing as Chrome Heap Profile');
        return toGroup((0, _v8heapalloc.importFromChromeHeapProfile)(parsed));
      } else if ('rts_arguments' in parsed && 'initial_capabilities' in parsed) {
        console.log('Importing as Haskell GHC JSON Profile');
        return (0, _haskell.importFromHaskell)(parsed);
      } else if ('recording' in parsed && 'sampleStackTraces' in parsed.recording) {
        console.log('Importing as Safari profile');
        return toGroup((0, _safari.importFromSafari)(parsed));
      }
    } else {
      // Format is not JSON
      // If the first line is "# callgrind format", it's probably in Callgrind
      // Profile Format.
      if (/^# callgrind format/.exec(contents.firstChunk()) || /^events:/m.exec(contents.firstChunk()) && /^fn=/m.exec(contents.firstChunk())) {
        console.log('Importing as Callgrind profile');
        return (0, _callgrind.importFromCallgrind)(contents, fileName);
      } // If the first line contains "Symbol Name", preceded by a tab, it's probably
      // a deep copy from OS X Instruments.app


      if (/^[\w \t\(\)]*\tSymbol Name/.exec(contents.firstChunk())) {
        console.log('Importing as Instruments.app deep copy');
        return toGroup((0, _instruments.importFromInstrumentsDeepCopy)(contents));
      }

      if (/^(Stack_|Script_|Obj_)\S+ log opened \(PC\)\n/.exec(contents.firstChunk())) {
        console.log('Importing as Papyrus profile');
        return toGroup((0, _papyrus.importFromPapyrus)(contents));
      }

      const fromLinuxPerf = (0, _linuxToolsPerf.importFromLinuxPerf)(contents);

      if (fromLinuxPerf) {
        console.log('Importing from linux perf script output');
        return fromLinuxPerf;
      }

      const fromBGFlameGraph = (0, _bgFlamegraph.importFromBGFlameGraph)(contents);

      if (fromBGFlameGraph) {
        console.log('Importing as collapsed stack format');
        return toGroup(fromBGFlameGraph);
      }
    } // Unrecognized format


    return null;
  });
}

function importFromFileSystemDirectoryEntry(entry) {
  return __awaiter(this, void 0, void 0, function* () {
    return (0, _instruments.importFromInstrumentsTrace)(entry);
  });
}
},{"./chrome":"../src/import/chrome.ts","./stackprof":"../src/import/stackprof.ts","./instruments":"../src/import/instruments.ts","./bg-flamegraph":"../src/import/bg-flamegraph.ts","./firefox":"../src/import/firefox.ts","../lib/file-format":"../src/lib/file-format.ts","./v8proflog":"../src/import/v8proflog.ts","./linux-tools-perf":"../src/import/linux-tools-perf.ts","./haskell":"../src/import/haskell.ts","./safari":"../src/import/safari.ts","./utils":"../src/import/utils.ts","./pprof":"../src/import/pprof.ts","../lib/utils":"../src/lib/utils.ts","./v8heapalloc":"../src/import/v8heapalloc.ts","./trace-event":"../src/import/trace-event.ts","./callgrind":"../src/import/callgrind.ts","./papyrus":"../src/import/papyrus.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57765" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js"], null)
//# sourceMappingURL=/import.e89516e7.js.map