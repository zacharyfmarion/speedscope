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
})({"../node_modules/preact/dist/preact.module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = H;
exports.hydrate = I;
exports.h = exports.createElement = h;
exports.Fragment = d;
exports.createRef = y;
exports.Component = m;
exports.cloneElement = L;
exports.createContext = M;
exports.toChildArray = x;
exports._unmount = D;
exports.options = exports.isValidElement = void 0;
var n,
    l,
    u,
    i,
    t,
    r,
    o,
    f,
    e = {},
    c = [],
    s = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
exports.isValidElement = l;
exports.options = n;

function a(n, l) {
  for (var u in l) n[u] = l[u];

  return n;
}

function v(n) {
  var l = n.parentNode;
  l && l.removeChild(n);
}

function h(n, l, u) {
  var i,
      t = arguments,
      r = {};

  for (i in l) "key" !== i && "ref" !== i && (r[i] = l[i]);

  if (arguments.length > 3) for (u = [u], i = 3; i < arguments.length; i++) u.push(t[i]);
  if (null != u && (r.children = u), "function" == typeof n && null != n.defaultProps) for (i in n.defaultProps) void 0 === r[i] && (r[i] = n.defaultProps[i]);
  return p(n, r, l && l.key, l && l.ref, null);
}

function p(l, u, i, t, r) {
  var o = {
    type: l,
    props: u,
    key: i,
    ref: t,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    constructor: void 0,
    __v: r
  };
  return null == r && (o.__v = o), n.vnode && n.vnode(o), o;
}

function y() {
  return {};
}

function d(n) {
  return n.children;
}

function m(n, l) {
  this.props = n, this.context = l;
}

function w(n, l) {
  if (null == l) return n.__ ? w(n.__, n.__.__k.indexOf(n) + 1) : null;

  for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;

  return "function" == typeof n.type ? w(n) : null;
}

function k(n) {
  var l, u;

  if (null != (n = n.__) && null != n.__c) {
    for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
      n.__e = n.__c.base = u.__e;
      break;
    }

    return k(n);
  }
}

function g(l) {
  (!l.__d && (l.__d = !0) && u.push(l) && !i++ || r !== n.debounceRendering) && ((r = n.debounceRendering) || t)(_);
}

function _() {
  for (var n; i = u.length;) n = u.sort(function (n, l) {
    return n.__v.__b - l.__v.__b;
  }), u = [], n.some(function (n) {
    var l, u, i, t, r, o, f;
    n.__d && (o = (r = (l = n).__v).__e, (f = l.__P) && (u = [], (i = a({}, r)).__v = i, t = A(f, r, i, l.__n, void 0 !== f.ownerSVGElement, null, u, null == o ? w(r) : o), T(u, r), t != o && k(r)));
  });
}

function b(n, l, u, i, t, r, o, f, s) {
  var a,
      h,
      p,
      y,
      d,
      m,
      k,
      g = u && u.__k || c,
      _ = g.length;
  if (f == e && (f = null != r ? r[0] : _ ? w(u, 0) : null), a = 0, l.__k = x(l.__k, function (u) {
    if (null != u) {
      if (u.__ = l, u.__b = l.__b + 1, null === (p = g[a]) || p && u.key == p.key && u.type === p.type) g[a] = void 0;else for (h = 0; h < _; h++) {
        if ((p = g[h]) && u.key == p.key && u.type === p.type) {
          g[h] = void 0;
          break;
        }

        p = null;
      }

      if (y = A(n, u, p = p || e, i, t, r, o, f, s), (h = u.ref) && p.ref != h && (k || (k = []), p.ref && k.push(p.ref, null, u), k.push(h, u.__c || y, u)), null != y) {
        var c;
        if (null == m && (m = y), void 0 !== u.__d) c = u.__d, u.__d = void 0;else if (r == p || y != f || null == y.parentNode) {
          n: if (null == f || f.parentNode !== n) n.appendChild(y), c = null;else {
            for (d = f, h = 0; (d = d.nextSibling) && h < _; h += 2) if (d == y) break n;

            n.insertBefore(y, f), c = f;
          }

          "option" == l.type && (n.value = "");
        }
        f = void 0 !== c ? c : y.nextSibling, "function" == typeof l.type && (l.__d = f);
      } else f && p.__e == f && f.parentNode != n && (f = w(p));
    }

    return a++, u;
  }), l.__e = m, null != r && "function" != typeof l.type) for (a = r.length; a--;) null != r[a] && v(r[a]);

  for (a = _; a--;) null != g[a] && D(g[a], g[a]);

  if (k) for (a = 0; a < k.length; a++) j(k[a], k[++a], k[++a]);
}

function x(n, l, u) {
  if (null == u && (u = []), null == n || "boolean" == typeof n) l && u.push(l(null));else if (Array.isArray(n)) for (var i = 0; i < n.length; i++) x(n[i], l, u);else u.push(l ? l("string" == typeof n || "number" == typeof n ? p(null, n, null, null, n) : null != n.__e || null != n.__c ? p(n.type, n.props, n.key, null, n.__v) : n) : n);
  return u;
}

function P(n, l, u, i, t) {
  var r;

  for (r in u) "children" === r || "key" === r || r in l || N(n, r, null, u[r], i);

  for (r in l) t && "function" != typeof l[r] || "children" === r || "key" === r || "value" === r || "checked" === r || u[r] === l[r] || N(n, r, l[r], u[r], i);
}

function C(n, l, u) {
  "-" === l[0] ? n.setProperty(l, u) : n[l] = "number" == typeof u && !1 === s.test(l) ? u + "px" : null == u ? "" : u;
}

function N(n, l, u, i, t) {
  var r, o, f, e, c;
  if (t ? "className" === l && (l = "class") : "class" === l && (l = "className"), "style" === l) {
    if (r = n.style, "string" == typeof u) r.cssText = u;else {
      if ("string" == typeof i && (r.cssText = "", i = null), i) for (e in i) u && e in u || C(r, e, "");
      if (u) for (c in u) i && u[c] === i[c] || C(r, c, u[c]);
    }
  } else "o" === l[0] && "n" === l[1] ? (o = l !== (l = l.replace(/Capture$/, "")), f = l.toLowerCase(), l = (f in n ? f : l).slice(2), u ? (i || n.addEventListener(l, z, o), (n.l || (n.l = {}))[l] = u) : n.removeEventListener(l, z, o)) : "list" !== l && "tagName" !== l && "form" !== l && "type" !== l && "size" !== l && !t && l in n ? n[l] = null == u ? "" : u : "function" != typeof u && "dangerouslySetInnerHTML" !== l && (l !== (l = l.replace(/^xlink:?/, "")) ? null == u || !1 === u ? n.removeAttributeNS("http://www.w3.org/1999/xlink", l.toLowerCase()) : n.setAttributeNS("http://www.w3.org/1999/xlink", l.toLowerCase(), u) : null == u || !1 === u && !/^ar/.test(l) ? n.removeAttribute(l) : n.setAttribute(l, u));
}

function z(l) {
  this.l[l.type](n.event ? n.event(l) : l);
}

function A(l, u, i, t, r, o, f, e, c) {
  var s,
      v,
      h,
      p,
      y,
      w,
      k,
      g,
      _,
      x,
      P = u.type;

  if (void 0 !== u.constructor) return null;
  (s = n.__b) && s(u);

  try {
    n: if ("function" == typeof P) {
      if (g = u.props, _ = (s = P.contextType) && t[s.__c], x = s ? _ ? _.props.value : s.__ : t, i.__c ? k = (v = u.__c = i.__c).__ = v.__E : ("prototype" in P && P.prototype.render ? u.__c = v = new P(g, x) : (u.__c = v = new m(g, x), v.constructor = P, v.render = E), _ && _.sub(v), v.props = g, v.state || (v.state = {}), v.context = x, v.__n = t, h = v.__d = !0, v.__h = []), null == v.__s && (v.__s = v.state), null != P.getDerivedStateFromProps && (v.__s == v.state && (v.__s = a({}, v.__s)), a(v.__s, P.getDerivedStateFromProps(g, v.__s))), p = v.props, y = v.state, h) null == P.getDerivedStateFromProps && null != v.componentWillMount && v.componentWillMount(), null != v.componentDidMount && v.__h.push(v.componentDidMount);else {
        if (null == P.getDerivedStateFromProps && g !== p && null != v.componentWillReceiveProps && v.componentWillReceiveProps(g, x), !v.__e && null != v.shouldComponentUpdate && !1 === v.shouldComponentUpdate(g, v.__s, x) || u.__v === i.__v && !v.__) {
          for (v.props = g, v.state = v.__s, u.__v !== i.__v && (v.__d = !1), v.__v = u, u.__e = i.__e, u.__k = i.__k, v.__h.length && f.push(v), s = 0; s < u.__k.length; s++) u.__k[s] && (u.__k[s].__ = u);

          break n;
        }

        null != v.componentWillUpdate && v.componentWillUpdate(g, v.__s, x), null != v.componentDidUpdate && v.__h.push(function () {
          v.componentDidUpdate(p, y, w);
        });
      }
      v.context = x, v.props = g, v.state = v.__s, (s = n.__r) && s(u), v.__d = !1, v.__v = u, v.__P = l, s = v.render(v.props, v.state, v.context), u.__k = null != s && s.type == d && null == s.key ? s.props.children : Array.isArray(s) ? s : [s], null != v.getChildContext && (t = a(a({}, t), v.getChildContext())), h || null == v.getSnapshotBeforeUpdate || (w = v.getSnapshotBeforeUpdate(p, y)), b(l, u, i, t, r, o, f, e, c), v.base = u.__e, v.__h.length && f.push(v), k && (v.__E = v.__ = null), v.__e = !1;
    } else null == o && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = $(i.__e, u, i, t, r, o, f, c);

    (s = n.diffed) && s(u);
  } catch (l) {
    u.__v = null, n.__e(l, u, i);
  }

  return u.__e;
}

function T(l, u) {
  n.__c && n.__c(u, l), l.some(function (u) {
    try {
      l = u.__h, u.__h = [], l.some(function (n) {
        n.call(u);
      });
    } catch (l) {
      n.__e(l, u.__v);
    }
  });
}

function $(n, l, u, i, t, r, o, f) {
  var s,
      a,
      v,
      h,
      p,
      y = u.props,
      d = l.props;
  if (t = "svg" === l.type || t, null != r) for (s = 0; s < r.length; s++) if (null != (a = r[s]) && ((null === l.type ? 3 === a.nodeType : a.localName === l.type) || n == a)) {
    n = a, r[s] = null;
    break;
  }

  if (null == n) {
    if (null === l.type) return document.createTextNode(d);
    n = t ? document.createElementNS("http://www.w3.org/2000/svg", l.type) : document.createElement(l.type, d.is && {
      is: d.is
    }), r = null, f = !1;
  }

  if (null === l.type) y !== d && n.data != d && (n.data = d);else {
    if (null != r && (r = c.slice.call(n.childNodes)), v = (y = u.props || e).dangerouslySetInnerHTML, h = d.dangerouslySetInnerHTML, !f) {
      if (y === e) for (y = {}, p = 0; p < n.attributes.length; p++) y[n.attributes[p].name] = n.attributes[p].value;
      (h || v) && (h && v && h.__html == v.__html || (n.innerHTML = h && h.__html || ""));
    }

    P(n, d, y, t, f), h ? l.__k = [] : (l.__k = l.props.children, b(n, l, u, i, "foreignObject" !== l.type && t, r, o, e, f)), f || ("value" in d && void 0 !== (s = d.value) && s !== n.value && N(n, "value", s, y.value, !1), "checked" in d && void 0 !== (s = d.checked) && s !== n.checked && N(n, "checked", s, y.checked, !1));
  }
  return n;
}

function j(l, u, i) {
  try {
    "function" == typeof l ? l(u) : l.current = u;
  } catch (l) {
    n.__e(l, i);
  }
}

function D(l, u, i) {
  var t, r, o;

  if (n.unmount && n.unmount(l), (t = l.ref) && (t.current && t.current !== l.__e || j(t, null, u)), i || "function" == typeof l.type || (i = null != (r = l.__e)), l.__e = l.__d = void 0, null != (t = l.__c)) {
    if (t.componentWillUnmount) try {
      t.componentWillUnmount();
    } catch (l) {
      n.__e(l, u);
    }
    t.base = t.__P = null;
  }

  if (t = l.__k) for (o = 0; o < t.length; o++) t[o] && D(t[o], u, i);
  null != r && v(r);
}

function E(n, l, u) {
  return this.constructor(n, u);
}

function H(l, u, i) {
  var t, r, f;
  n.__ && n.__(l, u), r = (t = i === o) ? null : i && i.__k || u.__k, l = h(d, null, [l]), f = [], A(u, (t ? u : i || u).__k = l, r || e, e, void 0 !== u.ownerSVGElement, i && !t ? [i] : r ? null : c.slice.call(u.childNodes), f, i || e, t), T(f, l);
}

function I(n, l) {
  H(n, l, o);
}

function L(n, l) {
  var u, i;

  for (i in l = a(a({}, n.props), l), arguments.length > 2 && (l.children = c.slice.call(arguments, 2)), u = {}, l) "key" !== i && "ref" !== i && (u[i] = l[i]);

  return p(n.type, u, l.key || n.key, l.ref || n.ref, null);
}

function M(n) {
  var l = {},
      u = {
    __c: "__cC" + f++,
    __: n,
    Consumer: function (n, l) {
      return n.children(l);
    },
    Provider: function (n) {
      var i,
          t = this;
      return this.getChildContext || (i = [], this.getChildContext = function () {
        return l[u.__c] = t, l;
      }, this.shouldComponentUpdate = function (n) {
        t.props.value !== n.value && i.some(function (l) {
          l.context = n.value, g(l);
        });
      }, this.sub = function (n) {
        i.push(n);
        var l = n.componentWillUnmount;

        n.componentWillUnmount = function () {
          i.splice(i.indexOf(n), 1), l && l.call(n);
        };
      }), n.children;
    }
  };
  return u.Consumer.contextType = u, u.Provider.__ = u, u;
}

exports.options = n = {
  __e: function (n, l) {
    for (var u, i; l = l.__;) if ((u = l.__c) && !u.__) try {
      if (u.constructor && null != u.constructor.getDerivedStateFromError && (i = !0, u.setState(u.constructor.getDerivedStateFromError(n))), null != u.componentDidCatch && (i = !0, u.componentDidCatch(n)), i) return g(u.__E = u);
    } catch (l) {
      n = l;
    }

    throw n;
  }
}, exports.isValidElement = l = function (n) {
  return null != n && void 0 === n.constructor;
}, m.prototype.setState = function (n, l) {
  var u;
  u = this.__s !== this.state ? this.__s : this.__s = a({}, this.state), "function" == typeof n && (n = n(u, this.props)), n && a(u, n), null != n && this.__v && (l && this.__h.push(l), g(this));
}, m.prototype.forceUpdate = function (n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), g(this));
}, m.prototype.render = d, u = [], i = 0, t = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, o = e, f = 0;
},{}],"../src/lib/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastOf = lastOf;
exports.sortBy = sortBy;
exports.getOrInsert = getOrInsert;
exports.getOrElse = getOrElse;
exports.getOrThrow = getOrThrow;
exports.itMap = itMap;
exports.itForEach = itForEach;
exports.itReduce = itReduce;
exports.zeroPad = zeroPad;
exports.formatPercent = formatPercent;
exports.formatFullPercent = formatFullPercent;
exports.fract = fract;
exports.triangle = triangle;
exports.findValueBisect = findValueBisect;
exports.findIndexBisect = findIndexBisect;
exports.noop = noop;
exports.objectsHaveShallowEquality = objectsHaveShallowEquality;
exports.memoizeByShallowEquality = memoizeByShallowEquality;
exports.memoizeByReference = memoizeByReference;
exports.lazyStatic = lazyStatic;
exports.decodeBase64 = decodeBase64;
exports.KeyedSet = void 0;

function lastOf(ts) {
  return ts[ts.length - 1] || null;
}

function sortBy(ts, key) {
  function comparator(a, b) {
    const keyA = key(a);
    const keyB = key(b);
    return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
  }

  ts.sort(comparator);
}

function getOrInsert(map, k, fallback) {
  if (!map.has(k)) map.set(k, fallback(k));
  return map.get(k);
}

function getOrElse(map, k, fallback) {
  if (!map.has(k)) return fallback(k);
  return map.get(k);
}

function getOrThrow(map, k) {
  if (!map.has(k)) {
    throw new Error(`Expected key ${k}`);
  }

  return map.get(k);
}

class KeyedSet {
  constructor() {
    this.map = new Map();
  }

  getOrInsert(t) {
    const key = t.key;
    const existing = this.map.get(key);
    if (existing) return existing;
    this.map.set(key, t);
    return t;
  }

  forEach(fn) {
    this.map.forEach(fn);
  }

  [Symbol.iterator]() {
    return this.map.values();
  }

}

exports.KeyedSet = KeyedSet;

function* itMap(it, f) {
  for (let t of it) {
    yield f(t);
  }
}

function itForEach(it, f) {
  for (let t of it) {
    f(t);
  }
}

function itReduce(it, f, init) {
  let accum = init;

  for (let t of it) {
    accum = f(accum, t);
  }

  return accum;
}

function zeroPad(s, width) {
  return new Array(Math.max(width - s.length, 0) + 1).join('0') + s;
}

function formatPercent(percent) {
  let formattedPercent = `${percent.toFixed(0)}%`;
  if (percent === 100) formattedPercent = '100%';else if (percent > 99) formattedPercent = '>99%';else if (percent < 0.01) formattedPercent = '<0.01%';else if (percent < 1) formattedPercent = `${percent.toFixed(2)}%`;else if (percent < 10) formattedPercent = `${percent.toFixed(1)}%`;
  return formattedPercent;
}

function formatFullPercent(percent) {
  return `${percent.toFixed(0)}%`;
}
/**
 * Calculates the fractional part of a given number. For example fract(3.7) returns 0.7
 */


function fract(x) {
  return x - Math.floor(x);
}
/**
 * Generates a triangle wave that oscillates linearly between -1 and 0 over the
 * input range with a period of 1
 */


function triangle(x) {
  return 2.0 * Math.abs(fract(x) - 0.5) - 1.0;
}

function findValueBisect(lo, hi, f, target, targetRangeSize = 1) {
  console.assert(!isNaN(targetRangeSize) && !isNaN(target));

  while (true) {
    if (hi - lo <= targetRangeSize) return [lo, hi];
    const mid = (hi + lo) / 2;
    const val = f(mid);
    if (val < target) lo = mid;else hi = mid;
  }
} // Similar to Array.prototype.findIndex, except uses a binary search.
//
// This assumes that the condition transitions exactly once from false to true
// in the list, e.g. the following is a valid input:
//
//  ls        = [a, b, c, d]
//  ls.map(f) = [false, false, true, true]
//
// The following is an invalid input:
//
//  ls        = [a, b, c, d]
//  ls.map(f) = [false, true, false, true]


function findIndexBisect(ls, f) {
  if (ls.length === 0) return -1;
  let lo = 0;
  let hi = ls.length - 1;

  while (hi !== lo) {
    const mid = Math.floor((lo + hi) / 2);

    if (f(ls[mid])) {
      // The desired index is <= mid
      hi = mid;
    } else {
      // The desired index is > mid
      lo = mid + 1;
    }
  }

  return f(ls[hi]) ? hi : -1;
}

function noop(...args) {}

function objectsHaveShallowEquality(a, b) {
  for (let key in a) {
    if (a[key] !== b[key]) return false;
  }

  for (let key in b) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
/**
 * Creates a memoized version of a function that caches the result based on
 * shallow equality of its object argument.
 */


function memoizeByShallowEquality(cb) {
  let last = null;
  return args => {
    let result;

    if (last == null) {
      result = cb(args);
      last = {
        args,
        result
      };
      return result;
    } else if (objectsHaveShallowEquality(last.args, args)) {
      return last.result;
    } else {
      last.args = args;
      last.result = cb(args);
      return last.result;
    }
  };
}
/**
 * Creates a memoized version of a function that caches the result based on
 * the reference equality of its argument.
 */


function memoizeByReference(cb) {
  let last = null;
  return args => {
    let result;

    if (last == null) {
      result = cb(args);
      last = {
        args,
        result
      };
      return result;
    } else if (last.args === args) {
      return last.result;
    } else {
      last.args = args;
      last.result = cb(args);
      return last.result;
    }
  };
}

function lazyStatic(cb) {
  let last = null;
  return () => {
    if (last == null) {
      last = {
        result: cb()
      };
    }

    return last.result;
  };
}

const base64lookupTable = lazyStatic(() => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const ret = new Map();

  for (let i = 0; i < alphabet.length; i++) {
    ret.set(alphabet.charAt(i), i);
  }

  ret.set('=', -1);
  return ret;
}); // NOTE: There are probably simpler solutions to this problem, but I have this written already, so
// until we run into problems with this, let's just use this.
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem#The_Unicode_Problem

function decodeBase64(encoded) {
  // Reference: https://www.rfc-editor.org/rfc/rfc4648.txt
  const lookupTable = base64lookupTable(); // 3 byte groups are represented as sequneces of 4 characters.
  //
  // "The encoding process represents 24-bit groups of input bits as output
  //  strings of 4 encoded characters."
  //
  // "Special processing is performed if fewer than 24 bits are available
  //  at the end of the data being encoded.  A full encoding quantum is
  //  always completed at the end of a quantity.  When fewer than 24 input
  //  bits are available in an input group bits with value zero are added
  //  (on the right) to form an integral number of 6-bit groups."

  if (encoded.length % 4 !== 0) {
    throw new Error(`Invalid length for base64 encoded string. Expected length % 4 = 0, got length = ${encoded.length}`);
  }

  const quartetCount = encoded.length / 4;
  let byteCount; // Special processing is performed if fewer than 24 bits are available
  // at the end of the data being encoded.  A full encoding quantum is
  // always completed at the end of a quantity.  When fewer than 24 input
  // bits are available in an input group, bits with value zero are added
  // (on the right) to form an integral number of 6-bit groups.  Padding
  // at the end of the data is performed using the '=' character.  Since
  // all base 64 input is an integral number of octets, only the following
  // cases can arise:
  //
  // (1) The final quantum of encoding input is an integral multiple of 24
  //     bits; here, the final unit of encoded output will be an integral
  //     multiple of 4 characters with no "=" padding.
  //
  // (2) The final quantum of encoding input is exactly 8 bits; here, the
  //     final unit of encoded output will be two characters followed by
  //     two "=" padding characters.
  //
  // (3) The final quantum of encoding input is exactly 16 bits; here, the
  //     final unit of encoded output will be three characters followed by
  //     one "=" padding character.

  if (encoded.length >= 4) {
    if (encoded.charAt(encoded.length - 1) === '=') {
      if (encoded.charAt(encoded.length - 2) === '=') {
        // Case (2)
        byteCount = quartetCount * 3 - 2;
      } else {
        // Case (3)
        byteCount = quartetCount * 3 - 1;
      }
    } else {
      // Case (1)
      byteCount = quartetCount * 3;
    }
  } else {
    // Case (1)
    byteCount = quartetCount * 3;
  }

  const bytes = new Uint8Array(byteCount);
  let offset = 0;

  for (let i = 0; i < quartetCount; i++) {
    const enc1 = encoded.charAt(i * 4 + 0);
    const enc2 = encoded.charAt(i * 4 + 1);
    const enc3 = encoded.charAt(i * 4 + 2);
    const enc4 = encoded.charAt(i * 4 + 3);
    const sextet1 = lookupTable.get(enc1);
    const sextet2 = lookupTable.get(enc2);
    const sextet3 = lookupTable.get(enc3);
    const sextet4 = lookupTable.get(enc4);

    if (sextet1 == null || sextet2 == null || sextet3 == null || sextet4 == null) {
      throw new Error(`Invalid quartet at indices ${i * 4} .. ${i * 4 + 3}: ${encoded.substring(i * 4, i * 4 + 3)}`);
    }

    bytes[offset++] = sextet1 << 2 | sextet2 >> 4;

    if (enc3 !== '=') {
      bytes[offset++] = (sextet2 & 15) << 4 | sextet3 >> 2;
    }

    if (enc4 !== '=') {
      bytes[offset++] = (sextet3 & 7) << 6 | sextet4;
    }
  }

  if (offset !== byteCount) {
    throw new Error(`Expected to decode ${byteCount} bytes, but only decoded ${offset})`);
  }

  return bytes;
}
},{}],"../src/lib/lru-cache.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LRUCache = exports.List = void 0;

class ListNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }

}

class List {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  getHead() {
    return this.head;
  }

  getTail() {
    return this.tail;
  }

  getSize() {
    return this.size;
  }

  append(node) {
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }

    this.size++;
  }

  prepend(node) {
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }

    this.size++;
    return node;
  }

  pop() {
    if (!this.tail) {
      return null;
    } else {
      const ret = this.tail;

      if (ret.prev) {
        this.tail = ret.prev;
        this.tail.next = null;
      } else {
        this.head = this.tail = null;
      }

      this.size--;
      ret.prev = null;
      return ret;
    }
  }

  dequeue() {
    if (!this.head) {
      return null;
    } else {
      const ret = this.head;

      if (ret.next) {
        this.head = ret.next;
        this.head.prev = null;
      } else {
        this.head = this.tail = null;
      }

      this.size--;
      ret.next = null;
      return ret;
    }
  }

  remove(node) {
    if (node.prev == null) {
      this.dequeue();
    } else if (node.next == null) {
      this.pop();
    } else {
      // Neither first nor last, should be safe to just link
      // neighbours.
      node.next.prev = node.prev;
      node.prev.next = node.next;
      node.next = null;
      node.prev = null;
      this.size--;
    }
  }

}

exports.List = List;

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.list = new List();
    this.map = new Map();
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    const node = this.map.get(key);

    if (!node) {
      return null;
    } // Bring node to the front of the list


    this.list.remove(node.listNode);
    this.list.prepend(node.listNode);
    return node ? node.value : null;
  }

  getSize() {
    return this.list.getSize();
  }

  getCapacity() {
    return this.capacity;
  }

  insert(key, value) {
    const node = this.map.get(key);

    if (node) {
      this.list.remove(node.listNode);
    } // Evict old entries when out of capacity


    while (this.list.getSize() >= this.capacity) {
      this.map.delete(this.list.pop().data);
    }

    const listNode = this.list.prepend(new ListNode(key));
    this.map.set(key, {
      value,
      listNode
    });
  }

  getOrInsert(key, f) {
    let value = this.get(key);

    if (value == null) {
      value = f(key);
      this.insert(key, value);
    }

    return value;
  }

  removeLRU() {
    const oldest = this.list.pop();
    if (!oldest) return null;
    const key = oldest.data;
    const value = this.map.get(key).value;
    this.map.delete(key);
    return [key, value];
  }

  clear() {
    this.list = new List();
    this.map = new Map();
  }

}

exports.LRUCache = LRUCache;
},{}],"../src/lib/math.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = clamp;
exports.Rect = exports.AffineTransform = exports.Vec2 = void 0;

function clamp(x, minVal, maxVal) {
  if (x < minVal) return minVal;
  if (x > maxVal) return maxVal;
  return x;
}

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  withX(x) {
    return new Vec2(x, this.y);
  }

  withY(y) {
    return new Vec2(this.x, y);
  }

  plus(other) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  minus(other) {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  times(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  timesPointwise(other) {
    return new Vec2(this.x * other.x, this.y * other.y);
  }

  dividedByPointwise(other) {
    return new Vec2(this.x / other.x, this.y / other.y);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  approxEquals(other, epsilon = 1e-9) {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  length2() {
    return this.dot(this);
  }

  length() {
    return Math.sqrt(this.length2());
  }

  abs() {
    return new Vec2(Math.abs(this.x), Math.abs(this.y));
  }

  static min(a, b) {
    return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
  }

  static max(a, b) {
    return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
  }

  static clamp(v, min, max) {
    return new Vec2(clamp(v.x, min.x, max.x), clamp(v.y, min.y, max.y));
  }

  flatten() {
    return [this.x, this.y];
  }

}

exports.Vec2 = Vec2;
Vec2.zero = new Vec2(0, 0);
Vec2.unit = new Vec2(1, 1);

class AffineTransform {
  constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
  }

  withScale(s) {
    let {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    m00 = s.x;
    m11 = s.y;
    return new AffineTransform(m00, m01, m02, m10, m11, m12);
  }

  static withScale(s) {
    return new AffineTransform().withScale(s);
  }

  scaledBy(s) {
    return AffineTransform.withScale(s).times(this);
  }

  getScale() {
    return new Vec2(this.m00, this.m11);
  }

  withTranslation(t) {
    let {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    m02 = t.x;
    m12 = t.y;
    return new AffineTransform(m00, m01, m02, m10, m11, m12);
  }

  static withTranslation(t) {
    return new AffineTransform().withTranslation(t);
  }

  getTranslation() {
    return new Vec2(this.m02, this.m12);
  }

  translatedBy(t) {
    return AffineTransform.withTranslation(t).times(this);
  }

  static betweenRects(from, to) {
    return AffineTransform.withTranslation(from.origin.times(-1)).scaledBy(new Vec2(to.size.x / from.size.x, to.size.y / from.size.y)).translatedBy(to.origin);
  }

  times(other) {
    const m00 = this.m00 * other.m00 + this.m01 * other.m10;
    const m01 = this.m00 * other.m01 + this.m01 * other.m11;
    const m02 = this.m00 * other.m02 + this.m01 * other.m12 + this.m02;
    const m10 = this.m10 * other.m00 + this.m11 * other.m10;
    const m11 = this.m10 * other.m01 + this.m11 * other.m11;
    const m12 = this.m10 * other.m02 + this.m11 * other.m12 + this.m12;
    return new AffineTransform(m00, m01, m02, m10, m11, m12);
  }

  equals(other) {
    return this.m00 == other.m00 && this.m01 == other.m01 && this.m02 == other.m02 && this.m10 == other.m10 && this.m11 == other.m11 && this.m12 == other.m12;
  }

  approxEquals(other, epsilon = 1e-9) {
    return Math.abs(this.m00 - other.m00) < epsilon && Math.abs(this.m01 - other.m01) < epsilon && Math.abs(this.m02 - other.m02) < epsilon && Math.abs(this.m10 - other.m10) < epsilon && Math.abs(this.m11 - other.m11) < epsilon && Math.abs(this.m12 - other.m12) < epsilon;
  }

  timesScalar(s) {
    const {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    return new AffineTransform(s * m00, s * m01, s * m02, s * m10, s * m11, s * m12);
  }

  det() {
    const {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    const m20 = 0;
    const m21 = 0;
    const m22 = 1;
    return m00 * (m11 * m22 - m12 * m21) - m01 * (m10 * m22 - m12 * m20) + m02 * (m10 * m21 - m11 * m20);
  }

  adj() {
    const {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    const m20 = 0;
    const m21 = 0;
    const m22 = 1; // Adjugate matrix (a) is the transpose of the
    // cofactor matrix (c).
    //
    // 00 01 02
    // 10 11 12
    // 20 21 22

    const a00 =
    /* c00 = */
    +(m11 * m22 - m12 * m21);
    const a01 =
    /* c10 = */
    -(m01 * m22 - m02 * m21);
    const a02 =
    /* c20 = */
    +(m01 * m12 - m02 * m11);
    const a10 =
    /* c01 = */
    -(m10 * m22 - m12 * m20);
    const a11 =
    /* c11 = */
    +(m00 * m22 - m02 * m20);
    const a12 =
    /* c21 = */
    -(m00 * m12 - m02 * m10);
    return new AffineTransform(a00, a01, a02, a10, a11, a12);
  }

  inverted() {
    const det = this.det();
    if (det === 0) return null;
    const adj = this.adj();
    return adj.timesScalar(1 / det);
  }

  transformVector(v) {
    return new Vec2(v.x * this.m00 + v.y * this.m01, v.x * this.m10 + v.y * this.m11);
  }

  inverseTransformVector(v) {
    const inv = this.inverted();
    if (!inv) return null;
    return inv.transformVector(v);
  }

  transformPosition(v) {
    return new Vec2(v.x * this.m00 + v.y * this.m01 + this.m02, v.x * this.m10 + v.y * this.m11 + this.m12);
  }

  inverseTransformPosition(v) {
    const inv = this.inverted();
    if (!inv) return null;
    return inv.transformPosition(v);
  }

  transformRect(r) {
    const size = this.transformVector(r.size);
    const origin = this.transformPosition(r.origin);

    if (size.x < 0 && size.y < 0) {
      return new Rect(origin.plus(size), size.abs());
    } else if (size.x < 0) {
      return new Rect(origin.withX(origin.x + size.x), size.abs());
    } else if (size.y < 0) {
      return new Rect(origin.withY(origin.y + size.y), size.abs());
    }

    return new Rect(origin, size);
  }

  inverseTransformRect(r) {
    const inv = this.inverted();
    if (!inv) return null;
    return inv.transformRect(r);
  }

  flatten() {
    // Flatten into GLSL format
    // prettier-ignore
    return [this.m00, this.m10, 0, this.m01, this.m11, 0, this.m02, this.m12, 1];
  }

}

exports.AffineTransform = AffineTransform;

class Rect {
  constructor(origin, size) {
    this.origin = origin;
    this.size = size;
  }

  isEmpty() {
    return this.width() == 0 || this.height() == 0;
  }

  width() {
    return this.size.x;
  }

  height() {
    return this.size.y;
  }

  left() {
    return this.origin.x;
  }

  right() {
    return this.left() + this.width();
  }

  top() {
    return this.origin.y;
  }

  bottom() {
    return this.top() + this.height();
  }

  topLeft() {
    return this.origin;
  }

  topRight() {
    return this.origin.plus(new Vec2(this.width(), 0));
  }

  bottomRight() {
    return this.origin.plus(this.size);
  }

  bottomLeft() {
    return this.origin.plus(new Vec2(0, this.height()));
  }

  withOrigin(origin) {
    return new Rect(origin, this.size);
  }

  withSize(size) {
    return new Rect(this.origin, size);
  }

  closestPointTo(p) {
    return new Vec2(clamp(p.x, this.left(), this.right()), clamp(p.y, this.top(), this.bottom()));
  }

  distanceFrom(p) {
    return p.minus(this.closestPointTo(p)).length();
  }

  contains(p) {
    return this.distanceFrom(p) === 0;
  }

  hasIntersectionWith(other) {
    const top = Math.max(this.top(), other.top());
    const bottom = Math.max(top, Math.min(this.bottom(), other.bottom()));
    if (bottom - top === 0) return false;
    const left = Math.max(this.left(), other.left());
    const right = Math.max(left, Math.min(this.right(), other.right()));
    if (right - left === 0) return false;
    return true;
  }

  intersectWith(other) {
    const topLeft = Vec2.max(this.topLeft(), other.topLeft());
    const bottomRight = Vec2.max(topLeft, Vec2.min(this.bottomRight(), other.bottomRight()));
    return new Rect(topLeft, bottomRight.minus(topLeft));
  }

  equals(other) {
    return this.origin.equals(other.origin) && this.size.equals(other.size);
  }

  approxEquals(other) {
    return this.origin.approxEquals(other.origin) && this.size.approxEquals(other.size);
  }

  area() {
    return this.size.x * this.size.y;
  }

}

exports.Rect = Rect;
Rect.empty = new Rect(Vec2.zero, Vec2.zero);
Rect.unit = new Rect(Vec2.zero, Vec2.unit);
Rect.NDC = new Rect(new Vec2(-1, -1), new Vec2(2, 2));
},{}],"../node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../src/gl/graphics.ts":[function(require,module,exports) {
var process = require("process");
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebGL = exports.Graphics = void 0;
// This is a port of the GPU APIs from https://github.com/evanw/sky from Skew to
// TypeScript.
//
// The MIT License (MIT)
// Original work Copyright (c) 2016 Evan Wallace
// Modified work Copyright (c) 2018 Jamie Wong
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// NOTE: This file intentionally has no dependencies.
// Dependencies & polyfills for import from skew
const RELEASE = typeof process !== 'undefined' && process.env && "development" === 'production';

function assert(condition) {
  if (!RELEASE) {
    if (!condition) throw new Error('Assertion failed.');
  }
}

function appendOne(ts, t) {
  if (ts.indexOf(t) === -1) ts.push(t);
}

function removeOne(ts, t) {
  const index = ts.indexOf(t);
  if (index !== -1) ts.splice(index, 1);
}

function TEXTURE_N(gl, index) {
  assert(index >= 0 && index <= 31);
  return gl.TEXTURE0 + index;
}

var Graphics;
exports.Graphics = Graphics;

(function (Graphics) {
  class Rect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    set(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    equals(other) {
      return this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
    }

  }

  Graphics.Rect = Rect;

  class Color {
    constructor(redF, greenF, blueF, alphaF) {
      this.redF = redF;
      this.greenF = greenF;
      this.blueF = blueF;
      this.alphaF = alphaF;
    }

    equals(other) {
      return this.redF === other.redF && this.greenF === other.greenF && this.blueF === other.blueF && this.alphaF === other.alphaF;
    }

  }

  Color.TRANSPARENT = new Color(0, 0, 0, 0);
  Graphics.Color = Color; // Converted from https://github.com/evanw/sky/blob/c72de77/src/graphics/context.sk

  let BlendOperation;

  (function (BlendOperation) {
    BlendOperation[BlendOperation["ZERO"] = 0] = "ZERO";
    BlendOperation[BlendOperation["ONE"] = 1] = "ONE";
    BlendOperation[BlendOperation["SOURCE_COLOR"] = 2] = "SOURCE_COLOR";
    BlendOperation[BlendOperation["TARGET_COLOR"] = 3] = "TARGET_COLOR";
    BlendOperation[BlendOperation["INVERSE_SOURCE_COLOR"] = 4] = "INVERSE_SOURCE_COLOR";
    BlendOperation[BlendOperation["INVERSE_TARGET_COLOR"] = 5] = "INVERSE_TARGET_COLOR";
    BlendOperation[BlendOperation["SOURCE_ALPHA"] = 6] = "SOURCE_ALPHA";
    BlendOperation[BlendOperation["TARGET_ALPHA"] = 7] = "TARGET_ALPHA";
    BlendOperation[BlendOperation["INVERSE_SOURCE_ALPHA"] = 8] = "INVERSE_SOURCE_ALPHA";
    BlendOperation[BlendOperation["INVERSE_TARGET_ALPHA"] = 9] = "INVERSE_TARGET_ALPHA";
    BlendOperation[BlendOperation["CONSTANT"] = 10] = "CONSTANT";
    BlendOperation[BlendOperation["INVERSE_CONSTANT"] = 11] = "INVERSE_CONSTANT";
  })(BlendOperation = Graphics.BlendOperation || (Graphics.BlendOperation = {}));

  let Primitive;

  (function (Primitive) {
    Primitive[Primitive["TRIANGLES"] = 0] = "TRIANGLES";
    Primitive[Primitive["TRIANGLE_STRIP"] = 1] = "TRIANGLE_STRIP";
  })(Primitive = Graphics.Primitive || (Graphics.Primitive = {}));

  class Context {
    constructor() {
      this.resizeEventHandlers = new Set();
    }

    setCopyBlendState() {
      this.setBlendState(BlendOperation.ONE, BlendOperation.ZERO);
    }

    setAddBlendState() {
      this.setBlendState(BlendOperation.ONE, BlendOperation.ONE);
    }

    setPremultipliedBlendState() {
      this.setBlendState(BlendOperation.ONE, BlendOperation.INVERSE_SOURCE_ALPHA);
    }

    setUnpremultipliedBlendState() {
      this.setBlendState(BlendOperation.SOURCE_ALPHA, BlendOperation.INVERSE_SOURCE_ALPHA);
    }

    addAfterResizeEventHandler(callback) {
      this.resizeEventHandlers.add(callback);
    }

    removeAfterResizeEventHandler(callback) {
      this.resizeEventHandlers.delete(callback);
    }

  }

  Graphics.Context = Context;
  let AttributeType;

  (function (AttributeType) {
    AttributeType[AttributeType["FLOAT"] = 0] = "FLOAT";
    AttributeType[AttributeType["BYTE"] = 1] = "BYTE";
  })(AttributeType = Graphics.AttributeType || (Graphics.AttributeType = {}));

  function attributeByteLength(type) {
    return type == AttributeType.FLOAT ? 4 : 1;
  }

  Graphics.attributeByteLength = attributeByteLength;

  class Attribute {
    constructor(name, type, count, byteOffset) {
      this.name = name;
      this.type = type;
      this.count = count;
      this.byteOffset = byteOffset;
    }

  }

  Graphics.Attribute = Attribute;

  class VertexFormat {
    constructor() {
      this._attributes = [];
      this._stride = 0;
    }

    get attributes() {
      return this._attributes;
    }

    get stride() {
      return this._stride;
    }

    add(name, type, count) {
      this.attributes.push(new Attribute(name, type, count, this.stride));
      this._stride += count * attributeByteLength(type);
      return this;
    }

  }

  Graphics.VertexFormat = VertexFormat;

  class VertexBuffer {
    uploadFloat32Array(floats) {
      this.upload(new Uint8Array(floats.buffer), 0);
    }

    uploadFloats(floats) {
      this.uploadFloat32Array(new Float32Array(floats));
    }

  }

  Graphics.VertexBuffer = VertexBuffer;
  let PixelFilter;

  (function (PixelFilter) {
    PixelFilter[PixelFilter["NEAREST"] = 0] = "NEAREST";
    PixelFilter[PixelFilter["LINEAR"] = 1] = "LINEAR";
  })(PixelFilter = Graphics.PixelFilter || (Graphics.PixelFilter = {}));

  let PixelWrap;

  (function (PixelWrap) {
    PixelWrap[PixelWrap["REPEAT"] = 0] = "REPEAT";
    PixelWrap[PixelWrap["CLAMP"] = 1] = "CLAMP";
  })(PixelWrap = Graphics.PixelWrap || (Graphics.PixelWrap = {}));

  class TextureFormat {
    constructor(minFilter, magFilter, wrap) {
      this.minFilter = minFilter;
      this.magFilter = magFilter;
      this.wrap = wrap;
    }

  }

  TextureFormat.LINEAR_CLAMP = new TextureFormat(PixelFilter.LINEAR, PixelFilter.LINEAR, PixelWrap.CLAMP);
  TextureFormat.LINEAR_MIN_NEAREST_MAG_CLAMP = new TextureFormat(PixelFilter.LINEAR, PixelFilter.NEAREST, PixelWrap.CLAMP);
  TextureFormat.NEAREST_CLAMP = new TextureFormat(PixelFilter.NEAREST, PixelFilter.NEAREST, PixelWrap.CLAMP);
  Graphics.TextureFormat = TextureFormat;
})(Graphics || (exports.Graphics = Graphics = {})); // Converted from https://github.com/evanw/sky/blob/c72de77/src/browser/context.sk


var WebGL;
exports.WebGL = WebGL;

(function (WebGL) {
  class Context extends Graphics.Context {
    get widthInPixels() {
      return this._width;
    }

    get heightInPixels() {
      return this._height;
    }

    constructor(canvas = document.createElement('canvas')) {
      super();
      this._attributeCount = 0;
      this._blendOperations = 0;
      this._contextResetHandlers = [];
      this._currentClearColor = Graphics.Color.TRANSPARENT;
      this._currentRenderTarget = null;
      this._defaultViewport = new Graphics.Rect();
      this._forceStateUpdate = true;
      this._generation = 1;
      this._height = 0;
      this._oldBlendOperations = 0;
      this._oldRenderTarget = null;
      this._oldViewport = new Graphics.Rect();
      this._width = 0;

      this.handleWebglContextRestored = () => {
        this._attributeCount = 0;
        this._currentClearColor = Graphics.Color.TRANSPARENT;
        this._forceStateUpdate = true;
        this._generation++;

        for (let handler of this._contextResetHandlers) {
          handler();
        }
      };

      this.ANGLE_instanced_arrays = null;
      this.ANGLE_instanced_arrays_generation = -1;
      let gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        preserveDrawingBuffer: false,
        stencil: false
      });

      if (gl == null) {
        throw new Error('Setup failure');
      }

      this._gl = gl;
      let style = canvas.style;
      canvas.width = 0;
      canvas.height = 0;
      style.width = style.height = '0';
      canvas.addEventListener('webglcontextlost', e => {
        e.preventDefault();
      });
      canvas.addEventListener('webglcontextrestored', this.handleWebglContextRestored); // Using maps makes these compact in release

      this._blendOperationMap = {
        [Graphics.BlendOperation.ZERO]: this._gl.ZERO,
        [Graphics.BlendOperation.ONE]: this._gl.ONE,
        [Graphics.BlendOperation.SOURCE_COLOR]: this._gl.SRC_COLOR,
        [Graphics.BlendOperation.TARGET_COLOR]: this._gl.DST_COLOR,
        [Graphics.BlendOperation.INVERSE_SOURCE_COLOR]: this._gl.ONE_MINUS_SRC_COLOR,
        [Graphics.BlendOperation.INVERSE_TARGET_COLOR]: this._gl.ONE_MINUS_DST_COLOR,
        [Graphics.BlendOperation.SOURCE_ALPHA]: this._gl.SRC_ALPHA,
        [Graphics.BlendOperation.TARGET_ALPHA]: this._gl.DST_ALPHA,
        [Graphics.BlendOperation.INVERSE_SOURCE_ALPHA]: this._gl.ONE_MINUS_SRC_ALPHA,
        [Graphics.BlendOperation.INVERSE_TARGET_ALPHA]: this._gl.ONE_MINUS_DST_ALPHA,
        [Graphics.BlendOperation.CONSTANT]: this._gl.CONSTANT_COLOR,
        [Graphics.BlendOperation.INVERSE_CONSTANT]: this._gl.ONE_MINUS_CONSTANT_COLOR
      };
    }

    testContextLoss() {
      this.handleWebglContextRestored();
    }

    get gl() {
      return this._gl;
    }

    get generation() {
      return this._generation;
    }

    addContextResetHandler(callback) {
      appendOne(this._contextResetHandlers, callback);
    }

    removeContextResetHandler(callback) {
      removeOne(this._contextResetHandlers, callback);
    }

    get currentRenderTarget() {
      return this._currentRenderTarget;
    }

    beginFrame() {
      this.setRenderTarget(null);
    }

    endFrame() {}

    setBlendState(source, target) {
      this._blendOperations = Context._packBlendModes(source, target);
    }

    setViewport(x, y, width, height) {
      ;
      (this._currentRenderTarget != null ? this._currentRenderTarget.viewport : this._defaultViewport).set(x, y, width, height);
    }

    get viewport() {
      return this._currentRenderTarget != null ? this._currentRenderTarget.viewport : this._defaultViewport;
    }

    get renderTargetWidthInPixels() {
      return this._currentRenderTarget != null ? this._currentRenderTarget.viewport.width : this._width;
    }

    get renderTargetHeightInPixels() {
      return this._currentRenderTarget != null ? this._currentRenderTarget.viewport.height : this._height;
    }

    draw(primitive, material, vertices) {
      // Update the texture set before preparing the material so uniform samplers can check for that they use different textures
      this._updateRenderTargetAndViewport();

      Material.from(material).prepare(); // Update the vertex buffer before updating the format so attributes can bind correctly

      VertexBuffer.from(vertices).prepare();

      this._updateFormat(material.format); // Draw now that everything is ready


      this._updateBlendState();

      this._gl.drawArrays(primitive == Graphics.Primitive.TRIANGLES ? this._gl.TRIANGLES : this._gl.TRIANGLE_STRIP, 0, Math.floor(vertices.byteCount / material.format.stride)); // Forced state updates are done once after a context loss


      this._forceStateUpdate = false;
    }

    resize(widthInPixels, heightInPixels, widthInAppUnits, heightInAppUnits) {
      let canvas = this._gl.canvas;
      const bounds = canvas.getBoundingClientRect();

      if (this._width === widthInPixels && this._height === heightInPixels && bounds.width === widthInAppUnits && bounds.height === heightInAppUnits) {
        // Nothing to do here!
        return;
      }

      let style = canvas.style;
      canvas.width = widthInPixels;
      canvas.height = heightInPixels;
      style.width = `${widthInAppUnits}px`;
      style.height = `${heightInAppUnits}px`;
      this.setViewport(0, 0, widthInPixels, heightInPixels);
      this._width = widthInPixels;
      this._height = heightInPixels;
      this.resizeEventHandlers.forEach(cb => cb());
    }

    clear(color) {
      this._updateRenderTargetAndViewport();

      this._updateBlendState();

      if (!color.equals(this._currentClearColor)) {
        this._gl.clearColor(color.redF, color.greenF, color.blueF, color.alphaF);

        this._currentClearColor = color;
      }

      this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    }

    setRenderTarget(renderTarget) {
      this._currentRenderTarget = RenderTarget.from(renderTarget);
    }

    createMaterial(format, vertexSource, fragmentSource) {
      let material = new Material(this, format, vertexSource, fragmentSource); // Compiling shaders is really expensive so we want to get that started
      // as early as possible. In Chrome and possibly other browsers, shader
      // compilation can happen asynchronously as long as you don't call
      // useProgram().
      //
      //   https://plus.google.com/+BrandonJonesToji/posts/4ERHkicC5Ny
      //

      material.program;
      return material;
    }

    createVertexBuffer(byteCount) {
      assert(byteCount > 0 && byteCount % 4 == 0);
      return new VertexBuffer(this, byteCount);
    }

    createTexture(format, width, height, pixels) {
      return new Texture(this, format, width, height, pixels);
    }

    createRenderTarget(texture) {
      return new RenderTarget(this, Texture.from(texture));
    }

    getANGLE_instanced_arrays() {
      if (this.ANGLE_instanced_arrays_generation !== this._generation) {
        this.ANGLE_instanced_arrays = null;
      }

      if (!this.ANGLE_instanced_arrays) {
        this.ANGLE_instanced_arrays = this.gl.getExtension('ANGLE_instanced_arrays');

        if (!this.ANGLE_instanced_arrays) {
          throw new Error('Failed to get extension ANGLE_instanced_arrays');
        }
      }

      return this.ANGLE_instanced_arrays;
    }

    _updateRenderTargetAndViewport() {
      let renderTarget = this._currentRenderTarget;
      let viewport = renderTarget != null ? renderTarget.viewport : this._defaultViewport;
      let gl = this._gl;

      if (this._forceStateUpdate || this._oldRenderTarget != renderTarget) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget ? renderTarget.framebuffer : null);
        this._oldRenderTarget = renderTarget;
      }

      if (this._forceStateUpdate || !this._oldViewport.equals(viewport)) {
        gl.viewport(viewport.x, this.renderTargetHeightInPixels - viewport.y - viewport.height, viewport.width, viewport.height);

        this._oldViewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
      }
    }

    _updateBlendState() {
      if (this._forceStateUpdate || this._oldBlendOperations != this._blendOperations) {
        let gl = this._gl;
        let operations = this._blendOperations;
        let oldOperations = this._oldBlendOperations;
        let source = operations & 0xf;
        let target = operations >> 4;
        assert(source in this._blendOperationMap);
        assert(target in this._blendOperationMap); // Special-case the blend mode that just writes over the target buffer

        if (operations == Context.COPY_BLEND_OPERATIONS) {
          gl.disable(gl.BLEND);
        } else {
          if (this._forceStateUpdate || oldOperations == Context.COPY_BLEND_OPERATIONS) {
            gl.enable(gl.BLEND);
          } // Otherwise, use actual blending


          gl.blendFunc(this._blendOperationMap[source], this._blendOperationMap[target]);
        }

        this._oldBlendOperations = operations;
      }
    }

    _updateFormat(format) {
      // Update the attributes
      let gl = this._gl;
      let attributes = format.attributes;
      let count = attributes.length;

      for (let i = 0; i < count; i++) {
        let attribute = attributes[i];
        let isByte = attribute.type == Graphics.AttributeType.BYTE;
        gl.vertexAttribPointer(i, attribute.count, isByte ? gl.UNSIGNED_BYTE : gl.FLOAT, isByte, format.stride, attribute.byteOffset);
      } // Update the attribute count


      while (this._attributeCount < count) {
        gl.enableVertexAttribArray(this._attributeCount);
        this._attributeCount++;
      }

      while (this._attributeCount > count) {
        this._attributeCount--;
        gl.disableVertexAttribArray(this._attributeCount);
      }

      this._attributeCount = count;
    }

    getWebGLInfo() {
      const ext = this.gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext ? this.gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null;
      const vendor = ext ? this.gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null;
      const version = this.gl.getParameter(this.gl.VERSION);
      return {
        renderer,
        vendor,
        version
      };
    }

    static from(context) {
      assert(context == null || context instanceof Context);
      return context;
    }

    static _packBlendModes(source, target) {
      return source | target << 4;
    }

  }

  Context.COPY_BLEND_OPERATIONS = Context._packBlendModes(Graphics.BlendOperation.ONE, Graphics.BlendOperation.ZERO);
  WebGL.Context = Context;

  class Uniform {
    constructor(_material, _name, _generation = 0, _location = null, _isDirty = true) {
      this._material = _material;
      this._name = _name;
      this._generation = _generation;
      this._location = _location;
      this._isDirty = _isDirty;
    }

    get location() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation) {
        this._location = context.gl.getUniformLocation(this._material.program, this._name);
        this._generation = context.generation; // Validate the shader against this uniform

        if (!RELEASE) {
          let program = this._material.program;
          let gl = context.gl;

          for (let i = 0, ii = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < ii; i++) {
            let info = gl.getActiveUniform(program, i);

            if (info && info.name == this._name) {
              assert(info.size == 1);

              switch (info.type) {
                case gl.FLOAT:
                  {
                    assert(this instanceof UniformFloat);
                    break;
                  }

                case gl.FLOAT_MAT3:
                  {
                    assert(this instanceof UniformMat3);
                    break;
                  }

                case gl.FLOAT_VEC2:
                  {
                    assert(this instanceof UniformVec2);
                    break;
                  }

                case gl.FLOAT_VEC3:
                  {
                    assert(this instanceof UniformVec3);
                    break;
                  }

                case gl.FLOAT_VEC4:
                  {
                    assert(this instanceof UniformVec4);
                    break;
                  }

                case gl.INT:
                  {
                    assert(this instanceof UniformInt);
                    break;
                  }

                case gl.SAMPLER_2D:
                  {
                    assert(this instanceof UniformSampler);
                    break;
                  }

                default:
                  assert(false);
              }
            }
          }
        }
      }

      if (!this._location) {
        throw new Error('Failed to get uniform location');
      }

      return this._location;
    }

  }

  class UniformFloat extends Uniform {
    constructor() {
      super(...arguments);
      this._x = 0.0;
    }

    set(x) {
      if (x != this._x) {
        this._x = x;
        this._isDirty = true;
      }
    }

    prepare() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation || this._isDirty) {
        context.gl.uniform1f(this.location, this._x);
        this._isDirty = false;
      }
    }

  }

  class UniformInt extends Uniform {
    constructor() {
      super(...arguments);
      this._x = 0;
    }

    set(x) {
      if (x != this._x) {
        this._x = x;
        this._isDirty = true;
      }
    }

    prepare() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation || this._isDirty) {
        context.gl.uniform1i(this.location, this._x);
        this._isDirty = false;
      }
    }

  }

  class UniformVec2 extends Uniform {
    constructor() {
      super(...arguments);
      this._x = 0.0;
      this._y = 0.0;
    }

    set(x, y) {
      if (x != this._x || y != this._y) {
        this._x = x;
        this._y = y;
        this._isDirty = true;
      }
    }

    prepare() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation || this._isDirty) {
        context.gl.uniform2f(this.location, this._x, this._y);
        this._isDirty = false;
      }
    }

  }

  class UniformVec3 extends Uniform {
    constructor() {
      super(...arguments);
      this._x = 0.0;
      this._y = 0.0;
      this._z = 0.0;
    }

    set(x, y, z) {
      if (x != this._x || y != this._y || z != this._z) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._isDirty = true;
      }
    }

    prepare() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation || this._isDirty) {
        context.gl.uniform3f(this.location, this._x, this._y, this._z);
        this._isDirty = false;
      }
    }

  }

  class UniformVec4 extends Uniform {
    constructor() {
      super(...arguments);
      this._x = 0.0;
      this._y = 0.0;
      this._z = 0.0;
      this._w = 0.0;
    }

    set(x, y, z, w) {
      if (x != this._x || y != this._y || z != this._z || w != this._w) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this._isDirty = true;
      }
    }

    prepare() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation || this._isDirty) {
        context.gl.uniform4f(this.location, this._x, this._y, this._z, this._w);
        this._isDirty = false;
      }
    }

  }

  class UniformMat3 extends Uniform {
    constructor() {
      super(...arguments);
      this._values = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
    }

    set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
      // These values are deliberately transposed because WebGL requires the "transpose" argument of uniformMatrix() to be false
      UniformMat3._cachedValues[0] = m00;
      UniformMat3._cachedValues[1] = m10;
      UniformMat3._cachedValues[2] = m20;
      UniformMat3._cachedValues[3] = m01;
      UniformMat3._cachedValues[4] = m11;
      UniformMat3._cachedValues[5] = m21;
      UniformMat3._cachedValues[6] = m02;
      UniformMat3._cachedValues[7] = m12;
      UniformMat3._cachedValues[8] = m22;

      for (let i = 0; i < 9; i++) {
        if (UniformMat3._cachedValues[i] != this._values[i]) {
          let swap = this._values;
          this._values = UniformMat3._cachedValues;
          UniformMat3._cachedValues = swap;
          this._isDirty = true;
          break;
        }
      }
    }

    prepare() {
      let context = Context.from(this._material.context);

      if (this._generation != context.generation || this._isDirty) {
        context.gl.uniformMatrix3fv(this.location, false, this._values);
        this._isDirty = false;
      }
    }

  } // Statically allocate this to avoid allocations


  UniformMat3._cachedValues = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];

  class UniformSampler extends Uniform {
    constructor() {
      super(...arguments);
      this._texture = null;
      this._index = -1;
    }

    set(texture, index) {
      if (this._texture != texture || this._index != index) {
        this._texture = Texture.from(texture);
        this._index = index;
        this._isDirty = true;
      }
    }

    prepare() {
      let context = Context.from(this._material.context);
      let gl = context.gl;
      assert(this._texture == null || context.currentRenderTarget == null || this._texture != context.currentRenderTarget.texture);

      if (this._generation != context.generation || this._isDirty) {
        gl.uniform1i(this.location, this._index);
        this._isDirty = false;
      }

      gl.activeTexture(TEXTURE_N(gl, this._index));
      gl.bindTexture(gl.TEXTURE_2D, this._texture != null && this._texture.width > 0 && this._texture.height > 0 ? this._texture.texture : null);
    }

  }

  class Material {
    constructor(_context, _format, _vertexSource, _fragmentSource, _uniformsMap = {}, _uniformsList = [], _generation = 0, _program = null) {
      this._context = _context;
      this._format = _format;
      this._vertexSource = _vertexSource;
      this._fragmentSource = _fragmentSource;
      this._uniformsMap = _uniformsMap;
      this._uniformsList = _uniformsList;
      this._generation = _generation;
      this._program = _program;
    }

    get context() {
      return this._context;
    }

    get format() {
      return this._format;
    }

    get vertexSource() {
      return this._vertexSource;
    }

    get fragmentSource() {
      return this._fragmentSource;
    }

    setUniformFloat(name, x) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformFloat(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformFloat);
      uniform.set(x);
    }

    setUniformInt(name, x) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformInt(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformInt);
      uniform.set(x);
    }

    setUniformVec2(name, x, y) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformVec2(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformVec2);
      uniform.set(x, y);
    }

    setUniformVec3(name, x, y, z) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformVec3(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformVec3);
      uniform.set(x, y, z);
    }

    setUniformVec4(name, x, y, z, w) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformVec4(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformVec4);
      uniform.set(x, y, z, w);
    }

    setUniformMat3(name, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformMat3(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformMat3);
      uniform.set(m00, m01, m02, m10, m11, m12, m20, m21, m22);
    }

    setUniformSampler(name, texture, index) {
      let uniform = this._uniformsMap[name] || null;

      if (uniform == null) {
        uniform = new UniformSampler(this, name);
        this._uniformsMap[name] = uniform;

        this._uniformsList.push(uniform);
      }

      assert(uniform instanceof UniformSampler);
      uniform.set(texture, index);
    }

    get program() {
      let gl = this._context.gl;

      if (this._generation != this._context.generation) {
        this._program = gl.createProgram();

        this._compileShader(gl, gl.VERTEX_SHADER, this.vertexSource);

        this._compileShader(gl, gl.FRAGMENT_SHADER, this.fragmentSource);

        let attributes = this.format.attributes;

        for (let i = 0; i < attributes.length; i++) {
          gl.bindAttribLocation(this._program, i, attributes[i].name);
        }

        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
          throw new Error(`${gl.getProgramInfoLog(this._program)}`);
        }

        this._generation = this._context.generation; // Validate this shader against the format

        if (!RELEASE) {
          for (let attribute of attributes) {
            for (let i = 0, ii = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES); i < ii; i++) {
              let info = gl.getActiveAttrib(this.program, i);

              if (info && info.name == attribute.name) {
                assert(info.size == 1);

                switch (attribute.count) {
                  case 1:
                    {
                      assert(info.type == gl.FLOAT);
                      break;
                    }

                  case 2:
                    {
                      assert(info.type == gl.FLOAT_VEC2);
                      break;
                    }

                  case 3:
                    {
                      assert(info.type == gl.FLOAT_VEC3);
                      break;
                    }

                  case 4:
                    {
                      assert(info.type == gl.FLOAT_VEC4);
                      break;
                    }

                  default:
                    {
                      assert(false);
                    }
                }
              }
            }
          }
        }
      }

      return this._program;
    }

    prepare() {
      this._context.gl.useProgram(this.program);

      for (let uniform of this._uniformsList) {
        uniform.prepare();
      }
    }

    _compileShader(gl, type, source) {
      let shader = gl.createShader(type);

      if (!shader) {
        throw new Error('Failed to create shader');
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`${gl.getShaderInfoLog(shader)}`);
      }

      if (!this._program) {
        throw new Error('Tried to attach shader before program was created');
      }

      gl.attachShader(this._program, shader);
    }

    static from(material) {
      assert(material == null || material instanceof Material);
      return material;
    }

  }

  class VertexBuffer extends Graphics.VertexBuffer {
    constructor(context, byteCount) {
      super();
      this._generation = 0;
      this._buffer = null;
      this._bytes = null;
      this._isDirty = true;
      this._dirtyMin = VertexBuffer.INT_MAX;
      this._dirtyMax = 0;
      this._totalMin = VertexBuffer.INT_MAX;
      this._totalMax = 0;
      this._byteCount = 0;
      this._context = context;
      this._byteCount = byteCount;
      this._bytes = new Uint8Array(byteCount);
    }

    get context() {
      return this._context;
    }

    get byteCount() {
      return this._byteCount;
    }

    move(sourceByteOffset, targetByteOffset, byteCount) {
      assert(byteCount >= 0);
      assert(0 <= sourceByteOffset && sourceByteOffset + byteCount <= this._byteCount);
      assert(0 <= targetByteOffset && targetByteOffset + byteCount <= this._byteCount);

      if (this._bytes && sourceByteOffset != targetByteOffset && byteCount != 0) {
        this._bytes.set(this._bytes.subarray(sourceByteOffset, this._byteCount), targetByteOffset);

        this._growDirtyRegion(Math.min(sourceByteOffset, targetByteOffset), Math.max(sourceByteOffset, targetByteOffset) + byteCount);
      }
    }

    upload(bytes, byteOffset = 0) {
      assert(0 <= byteOffset && byteOffset + bytes.length <= this._byteCount);
      assert(this._bytes != null);

      this._bytes.set(bytes, byteOffset);

      this._growDirtyRegion(byteOffset, byteOffset + bytes.length);
    }

    free() {
      if (this._buffer) {
        this._context.gl.deleteBuffer(this._buffer);
      } // Reset the generation to force this to be re-uploaded if it's used again
      // in the future.


      this._generation = 0;
    }

    prepare() {
      let gl = this._context.gl;

      if (this._generation !== this._context.generation) {
        this._buffer = gl.createBuffer();
        this._generation = this._context.generation;
        this._isDirty = true;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

      if (this._isDirty) {
        gl.bufferData(gl.ARRAY_BUFFER, this._byteCount, gl.DYNAMIC_DRAW);
        this._dirtyMin = this._totalMin;
        this._dirtyMax = this._totalMax;
        this._isDirty = false;
      }

      if (this._dirtyMin < this._dirtyMax) {
        gl.bufferSubData(gl.ARRAY_BUFFER, this._dirtyMin, this._bytes.subarray(this._dirtyMin, this._dirtyMax));
        this._dirtyMin = VertexBuffer.INT_MAX;
        this._dirtyMax = 0;
      }
    }

    _growDirtyRegion(min, max) {
      this._dirtyMin = Math.min(this._dirtyMin, min);
      this._dirtyMax = Math.max(this._dirtyMax, max);
      this._totalMin = Math.min(this._totalMin, min);
      this._totalMax = Math.max(this._totalMax, max);
    }

    static from(buffer) {
      assert(buffer == null || buffer instanceof VertexBuffer);
      return buffer;
    }

  }

  VertexBuffer.INT_MAX = 0x7fffffff;

  class Texture {
    constructor(_context, _format, _width, _height, _pixels = null, _texture = null, _generation = 0, _isFormatDirty = true, _isContentDirty = true) {
      this._context = _context;
      this._format = _format;
      this._width = _width;
      this._height = _height;
      this._pixels = _pixels;
      this._texture = _texture;
      this._generation = _generation;
      this._isFormatDirty = _isFormatDirty;
      this._isContentDirty = _isContentDirty;
    }

    get context() {
      return this._context;
    }

    get format() {
      return this._format;
    }

    get width() {
      return this._width;
    }

    get height() {
      return this._height;
    }

    resize(width, height, pixels = null) {
      this._width = width;
      this._height = height;
      this._pixels = pixels;
      this._isContentDirty = true;
    }

    setFormat(format) {
      if (this._format != format) {
        this._format = format;
        this._isFormatDirty = true;
      }
    }

    get texture() {
      let gl = this._context.gl; // Create

      if (this._generation != this._context.generation) {
        this._texture = gl.createTexture();
        this._generation = this._context.generation;
        this._isFormatDirty = true;
        this._isContentDirty = true;
      } // Format


      if (this._isFormatDirty) {
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.format.magFilter == Graphics.PixelFilter.NEAREST ? gl.NEAREST : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.format.minFilter == Graphics.PixelFilter.NEAREST ? gl.NEAREST : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.format.wrap == Graphics.PixelWrap.REPEAT ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.format.wrap == Graphics.PixelWrap.REPEAT ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        this._isFormatDirty = false;
      }

      if (this._isContentDirty) {
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this._pixels);
        this._isContentDirty = false;
      }

      return this._texture;
    }

    free() {
      if (this.texture) {
        this._context.gl.deleteTexture(this.texture);

        this._generation = 0;
      }
    }

    static from(texture) {
      assert(texture == null || texture instanceof Texture);
      return texture;
    }

  }

  class RenderTarget {
    constructor(_context, _texture, _framebuffer = null, _generation = 0, _isDirty = true, _viewport = new Graphics.Rect()) {
      this._context = _context;
      this._texture = _texture;
      this._framebuffer = _framebuffer;
      this._generation = _generation;
      this._isDirty = _isDirty;
      this._viewport = _viewport;
    }

    get context() {
      return this._context;
    }

    get texture() {
      return this._texture;
    }

    get viewport() {
      return this._viewport;
    }

    setColor(texture) {
      if (this._texture != texture) {
        this._texture = Texture.from(texture);
        this._isDirty = true;
      }
    }

    get framebuffer() {
      let gl = this._context.gl;
      let texture = this._texture.texture; // Create

      if (this._generation != this._context.generation) {
        this._framebuffer = gl.createFramebuffer();
        this._generation = this._context.generation;
        this._isDirty = true;
      } // Update


      if (this._isDirty) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        assert(gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);
        this._isDirty = false;
      }

      return this._framebuffer;
    }

    free() {
      if (this._framebuffer) {
        this._context.gl.deleteFramebuffer(this._framebuffer);

        this._generation = 0;
      }
    }

    static from(renderTarget) {
      assert(renderTarget == null || renderTarget instanceof RenderTarget);
      return renderTarget;
    }

  }
})(WebGL || (exports.WebGL = WebGL = {}));
},{"process":"../node_modules/process/browser.js"}],"../src/gl/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUniformAffineTransform = setUniformAffineTransform;
exports.setUniformVec2 = setUniformVec2;
exports.renderInto = renderInto;

function setUniformAffineTransform(material, name, transform) {
  let {
    m00,
    m01,
    m02,
    m10,
    m11,
    m12
  } = transform;
  material.setUniformMat3(name, m00, m01, m02, m10, m11, m12, 0, 0, 1);
}

function setUniformVec2(material, name, vec) {
  material.setUniformVec2(name, vec.x, vec.y);
}

function renderInto(gl, target, cb) {
  gl.setRenderTarget(target);
  gl.setViewport(0, 0, target.texture.width, target.texture.height);
  cb();
  gl.setRenderTarget(null);
}
},{}],"../src/gl/rectangle-batch-renderer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RectangleBatchRenderer = exports.RectangleBatch = void 0;

var _math = require("../lib/math");

var _graphics = require("./graphics");

var _utils = require("./utils");

const vertexFormat = new _graphics.Graphics.VertexFormat();
vertexFormat.add('configSpacePos', _graphics.Graphics.AttributeType.FLOAT, 2);
vertexFormat.add('color', _graphics.Graphics.AttributeType.FLOAT, 3);
const vert = `
  uniform mat3 configSpaceToNDC;

  attribute vec2 configSpacePos;
  attribute vec3 color;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec2 position = (configSpaceToNDC * vec3(configSpacePos, 1)).xy;
    gl_Position = vec4(position, 1, 1);
  }
`;
const frag = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor.rgb, 1);
  }
`;

class RectangleBatch {
  constructor(gl) {
    this.gl = gl;
    this.rects = [];
    this.colors = [];
    this.buffer = null;
  }

  getRectCount() {
    return this.rects.length;
  }

  getBuffer() {
    if (this.buffer) {
      return this.buffer;
    }

    const corners = [[0, 0], [1, 0], [0, 1], [1, 0], [0, 1], [1, 1]];
    const bytes = new Uint8Array(vertexFormat.stride * corners.length * this.rects.length);
    const floats = new Float32Array(bytes.buffer);
    let idx = 0;

    for (let i = 0; i < this.rects.length; i++) {
      const rect = this.rects[i];
      const color = this.colors[i]; // TODO(jlfwong): In the conversion from regl to graphics.ts, I lost the
      // ability to do instanced drawing. This is a pretty significant hit to
      // the performance here since I need 6x the memory to allocate these
      // things. Adding instanced drawing to graphics.ts is non-trivial, so I'm
      // just going to try this for now.

      for (let corner of corners) {
        floats[idx++] = rect.origin.x + corner[0] * rect.size.x;
        floats[idx++] = rect.origin.y + corner[1] * rect.size.y;
        floats[idx++] = color.r;
        floats[idx++] = color.g;
        floats[idx++] = color.b;
      }
    }

    if (idx !== floats.length) {
      throw new Error("Buffer expected to be full but wasn't");
    }

    this.buffer = this.gl.createVertexBuffer(bytes.length);
    this.buffer.upload(bytes);
    return this.buffer;
  }

  addRect(rect, color) {
    this.rects.push(rect);
    this.colors.push(color);

    if (this.buffer) {
      this.buffer.free();
      this.buffer = null;
    }
  }

  free() {
    if (this.buffer) {
      this.buffer.free();
      this.buffer = null;
    }
  }

}

exports.RectangleBatch = RectangleBatch;

class RectangleBatchRenderer {
  constructor(gl) {
    this.gl = gl;
    this.material = gl.createMaterial(vertexFormat, vert, frag);
  }

  render(props) {
    (0, _utils.setUniformAffineTransform)(this.material, 'configSpaceToNDC', (() => {
      const configToPhysical = _math.AffineTransform.betweenRects(props.configSpaceSrcRect, props.physicalSpaceDstRect);

      const viewportSize = new _math.Vec2(this.gl.viewport.width, this.gl.viewport.height);

      const physicalToNDC = _math.AffineTransform.withTranslation(new _math.Vec2(-1, 1)).times(_math.AffineTransform.withScale(new _math.Vec2(2, -2).dividedByPointwise(viewportSize)));

      return physicalToNDC.times(configToPhysical);
    })());
    this.gl.setUnpremultipliedBlendState();
    this.gl.draw(_graphics.Graphics.Primitive.TRIANGLES, this.material, props.batch.getBuffer());
  }

}

exports.RectangleBatchRenderer = RectangleBatchRenderer;
},{"../lib/math":"../src/lib/math.ts","./graphics":"../src/gl/graphics.ts","./utils":"../src/gl/utils.ts"}],"../src/lib/color.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Color = void 0;

var _math = require("./math");

class Color {
  constructor(r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static fromLumaChromaHue(L, C, H) {
    // 0 <= L <= 1
    // 0 <= C <= 1
    // 0 <= H <= 360
    // https://en.wikipedia.org/wiki/HSL_and_HSV#From_luma/chroma/hue
    const hPrime = H / 60;
    const X = C * (1 - Math.abs(hPrime % 2 - 1));
    const [R1, G1, B1] = hPrime < 1 ? [C, X, 0] : hPrime < 2 ? [X, C, 0] : hPrime < 3 ? [0, C, X] : hPrime < 4 ? [0, X, C] : hPrime < 5 ? [X, 0, C] : [C, 0, X];
    const m = L - (0.3 * R1 + 0.59 * G1 + 0.11 * B1);
    return new Color((0, _math.clamp)(R1 + m, 0, 1), (0, _math.clamp)(G1 + m, 0, 1), (0, _math.clamp)(B1 + m, 0, 1), 1.0);
  }

  static fromCSSHex(hex) {
    if (hex.length !== 7 || hex[0] !== '#') {
      throw new Error(`Invalid color input ${hex}`);
    }

    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;

    if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
      throw new Error(`Invalid color input ${hex}`);
    }

    return new Color(r, g, b);
  }

  withAlpha(a) {
    return new Color(this.r, this.g, this.b, a);
  }

  toCSS() {
    return `rgba(${(255 * this.r).toFixed()}, ${(255 * this.g).toFixed()}, ${(255 * this.b).toFixed()}, ${this.a.toFixed(2)})`;
  }

}

exports.Color = Color;
},{"./math":"../src/lib/math.ts"}],"../src/gl/row-atlas.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RowAtlas = void 0;

var _lruCache = require("../lib/lru-cache");

var _rectangleBatchRenderer = require("./rectangle-batch-renderer");

var _math = require("../lib/math");

var _color = require("../lib/color");

var _graphics = require("./graphics");

var _utils = require("./utils");

class RowAtlas {
  constructor(gl, rectangleBatchRenderer, textureRenderer) {
    this.gl = gl;
    this.rectangleBatchRenderer = rectangleBatchRenderer;
    this.textureRenderer = textureRenderer;
    this.texture = gl.createTexture(_graphics.Graphics.TextureFormat.NEAREST_CLAMP, 4096, 4096);
    this.renderTarget = gl.createRenderTarget(this.texture);
    this.rowCache = new _lruCache.LRUCache(this.texture.height);
    this.clearLineBatch = new _rectangleBatchRenderer.RectangleBatch(gl);
    this.clearLineBatch.addRect(_math.Rect.unit, new _color.Color(0, 0, 0, 0)); // All of the cached data is stored GPU-side, and we don't retain a copy of
    // it client-side. This means when we get a context loss event, the data is
    // totally gone. So let's clear our CPU-side cache to reflect that fact.

    gl.addContextResetHandler(() => {
      this.rowCache.clear();
    });
  }

  has(key) {
    return this.rowCache.has(key);
  }

  getResolution() {
    return this.texture.width;
  }

  getCapacity() {
    return this.texture.height;
  }

  allocateLine(key) {
    if (this.rowCache.getSize() < this.rowCache.getCapacity()) {
      // Not in cache, but cache isn't full
      const row = this.rowCache.getSize();
      this.rowCache.insert(key, row);
      return row;
    } else {
      // Not in cache, and cache is full. Evict something.
      const [, row] = this.rowCache.removeLRU();
      this.rowCache.insert(key, row);
      return row;
    }
  }

  writeToAtlasIfNeeded(keys, render) {
    (0, _utils.renderInto)(this.gl, this.renderTarget, () => {
      for (let key of keys) {
        let row = this.rowCache.get(key);

        if (row != null) {
          // Already cached!
          continue;
        } // Not cached -- we'll have to actually render


        row = this.allocateLine(key);
        const textureRect = new _math.Rect(new _math.Vec2(0, row), new _math.Vec2(this.texture.width, 1));
        this.rectangleBatchRenderer.render({
          batch: this.clearLineBatch,
          configSpaceSrcRect: _math.Rect.unit,
          physicalSpaceDstRect: textureRect
        });
        render(textureRect, key);
      }
    });
  }

  renderViaAtlas(key, dstRect) {
    let row = this.rowCache.get(key);

    if (row == null) {
      return false;
    }

    const textureRect = new _math.Rect(new _math.Vec2(0, row), new _math.Vec2(this.texture.width, 1)); // At this point, we have the row in cache, and we can
    // paint directly from it into the framebuffer.

    this.textureRenderer.render({
      texture: this.texture,
      srcRect: textureRect,
      dstRect: dstRect
    });
    return true;
  }

}

exports.RowAtlas = RowAtlas;
},{"../lib/lru-cache":"../src/lib/lru-cache.ts","./rectangle-batch-renderer":"../src/gl/rectangle-batch-renderer.ts","../lib/math":"../src/lib/math.ts","../lib/color":"../src/lib/color.ts","./graphics":"../src/gl/graphics.ts","./utils":"../src/gl/utils.ts"}],"../src/gl/texture-renderer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextureRenderer = void 0;

var _math = require("../lib/math");

var _graphics = require("./graphics");

var _utils = require("./utils");

const vert = `
  uniform mat3 uvTransform;
  uniform mat3 positionTransform;

  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = (uvTransform * vec3(uv, 1)).xy;
    gl_Position = vec4((positionTransform * vec3(position, 1)).xy, 0, 1);
  }
`;
const frag = `
  precision mediump float;

  varying vec2 vUv;
  uniform sampler2D texture;

  void main() {
   gl_FragColor = texture2D(texture, vUv);
  }
`;

class TextureRenderer {
  constructor(gl) {
    this.gl = gl;
    const vertexFormat = new _graphics.Graphics.VertexFormat();
    vertexFormat.add('position', _graphics.Graphics.AttributeType.FLOAT, 2);
    vertexFormat.add('uv', _graphics.Graphics.AttributeType.FLOAT, 2);
    const vertices = [{
      pos: [-1, 1],
      uv: [0, 1]
    }, {
      pos: [1, 1],
      uv: [1, 1]
    }, {
      pos: [-1, -1],
      uv: [0, 0]
    }, {
      pos: [1, -1],
      uv: [1, 0]
    }];
    const floats = [];

    for (let v of vertices) {
      floats.push(v.pos[0]);
      floats.push(v.pos[1]);
      floats.push(v.uv[0]);
      floats.push(v.uv[1]);
    }

    this.buffer = gl.createVertexBuffer(vertexFormat.stride * vertices.length);
    this.buffer.upload(new Uint8Array(new Float32Array(floats).buffer));
    this.material = gl.createMaterial(vertexFormat, vert, frag);
  }

  render(props) {
    this.material.setUniformSampler('texture', props.texture, 0);
    (0, _utils.setUniformAffineTransform)(this.material, 'uvTransform', (() => {
      const {
        srcRect,
        texture
      } = props;

      const physicalToUV = _math.AffineTransform.withTranslation(new _math.Vec2(0, 1)).times(_math.AffineTransform.withScale(new _math.Vec2(1, -1))).times(_math.AffineTransform.betweenRects(new _math.Rect(_math.Vec2.zero, new _math.Vec2(texture.width, texture.height)), _math.Rect.unit));

      const uvRect = physicalToUV.transformRect(srcRect);
      return _math.AffineTransform.betweenRects(_math.Rect.unit, uvRect);
    })());
    (0, _utils.setUniformAffineTransform)(this.material, 'positionTransform', (() => {
      const {
        dstRect
      } = props;
      const {
        viewport
      } = this.gl;
      const viewportSize = new _math.Vec2(viewport.width, viewport.height);

      const physicalToNDC = _math.AffineTransform.withScale(new _math.Vec2(1, -1)).times(_math.AffineTransform.betweenRects(new _math.Rect(_math.Vec2.zero, viewportSize), _math.Rect.NDC));

      const ndcRect = physicalToNDC.transformRect(dstRect);
      return _math.AffineTransform.betweenRects(_math.Rect.NDC, ndcRect);
    })());
    this.gl.setUnpremultipliedBlendState();
    this.gl.draw(_graphics.Graphics.Primitive.TRIANGLE_STRIP, this.material, this.buffer);
  }

}

exports.TextureRenderer = TextureRenderer;
},{"../lib/math":"../src/lib/math.ts","./graphics":"../src/gl/graphics.ts","./utils":"../src/gl/utils.ts"}],"../src/gl/overlay-rectangle-renderer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewportRectangleRenderer = void 0;

var _color = require("../lib/color");

var _graphics = require("./graphics");

var _utils = require("./utils");

const vertexFormat = new _graphics.Graphics.VertexFormat();
vertexFormat.add('position', _graphics.Graphics.AttributeType.FLOAT, 2);
const vert = `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0, 1);
  }
`;

const frag = theme => {
  const {
    r,
    g,
    b
  } = _color.Color.fromCSSHex(theme.fgSecondaryColor);

  const rgb = `${r.toFixed(1)}, ${g.toFixed(1)}, ${b.toFixed(1)}`;
  return `
    precision mediump float;

    uniform mat3 configSpaceToPhysicalViewSpace;
    uniform vec2 physicalSize;
    uniform vec2 physicalOrigin;
    uniform vec2 configSpaceViewportOrigin;
    uniform vec2 configSpaceViewportSize;
    uniform float framebufferHeight;

    void main() {
      vec2 origin = (configSpaceToPhysicalViewSpace * vec3(configSpaceViewportOrigin, 1.0)).xy;
      vec2 size = (configSpaceToPhysicalViewSpace * vec3(configSpaceViewportSize, 0.0)).xy;

      vec2 halfSize = physicalSize / 2.0;

      float borderWidth = 2.0;

      origin = floor(origin * halfSize) / halfSize + borderWidth * vec2(1.0, 1.0);
      size = floor(size * halfSize) / halfSize - 2.0 * borderWidth * vec2(1.0, 1.0);

      vec2 coord = gl_FragCoord.xy;
      coord.x = coord.x - physicalOrigin.x;
      coord.y = framebufferHeight - coord.y - physicalOrigin.y;
      vec2 clamped = clamp(coord, origin, origin + size);
      vec2 gap = clamped - coord;
      float maxdist = max(abs(gap.x), abs(gap.y));

      // TOOD(jlfwong): Could probably optimize this to use mix somehow.
      if (maxdist == 0.0) {
        // Inside viewport rectangle
        gl_FragColor = vec4(0, 0, 0, 0);
      } else if (maxdist < borderWidth) {
        // Inside viewport rectangle at border
        gl_FragColor = vec4(${rgb}, 0.8);
      } else {
        // Outside viewport rectangle
        gl_FragColor = vec4(${rgb}, 0.5);
      }
    }
  `;
};

class ViewportRectangleRenderer {
  constructor(gl, theme) {
    this.gl = gl;
    const vertices = [[-1, 1], [1, 1], [-1, -1], [1, -1]];
    const floats = [];

    for (let v of vertices) {
      floats.push(v[0]);
      floats.push(v[1]);
    }

    this.buffer = gl.createVertexBuffer(vertexFormat.stride * vertices.length);
    this.buffer.upload(new Uint8Array(new Float32Array(floats).buffer));
    this.material = gl.createMaterial(vertexFormat, vert, frag(theme));
  }

  render(props) {
    (0, _utils.setUniformAffineTransform)(this.material, 'configSpaceToPhysicalViewSpace', props.configSpaceToPhysicalViewSpace); // TODO(jlfwong): Pack these into a Vec4 instead

    (0, _utils.setUniformVec2)(this.material, 'configSpaceViewportOrigin', props.configSpaceViewportRect.origin);
    (0, _utils.setUniformVec2)(this.material, 'configSpaceViewportSize', props.configSpaceViewportRect.size); // TODO(jlfwong): Pack these into a Vec4 instead

    const viewport = this.gl.viewport;
    this.material.setUniformVec2('physicalOrigin', viewport.x, viewport.y);
    this.material.setUniformVec2('physicalSize', viewport.width, viewport.height);
    this.material.setUniformFloat('framebufferHeight', this.gl.renderTargetHeightInPixels);
    this.gl.setBlendState(_graphics.Graphics.BlendOperation.SOURCE_ALPHA, _graphics.Graphics.BlendOperation.INVERSE_SOURCE_ALPHA);
    this.gl.draw(_graphics.Graphics.Primitive.TRIANGLE_STRIP, this.material, this.buffer);
  }

}

exports.ViewportRectangleRenderer = ViewportRectangleRenderer;
},{"../lib/color":"../src/lib/color.ts","./graphics":"../src/gl/graphics.ts","./utils":"../src/gl/utils.ts"}],"../src/gl/flamechart-color-pass-renderer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartColorPassRenderer = void 0;

var _math = require("../lib/math");

var _graphics = require("./graphics");

var _utils = require("./utils");

const vertexFormat = new _graphics.Graphics.VertexFormat();
vertexFormat.add('position', _graphics.Graphics.AttributeType.FLOAT, 2);
vertexFormat.add('uv', _graphics.Graphics.AttributeType.FLOAT, 2);
const vert = `
  uniform mat3 uvTransform;
  uniform mat3 positionTransform;

  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = (uvTransform * vec3(uv, 1)).xy;
    gl_Position = vec4((positionTransform * vec3(position, 1)).xy, 0, 1);
  }
`;

const frag = colorForBucket => `
  precision mediump float;

  uniform vec2 uvSpacePixelSize;
  uniform float renderOutlines;

  varying vec2 vUv;
  uniform sampler2D colorTexture;

  // https://en.wikipedia.org/wiki/HSL_and_HSV#From_luma/chroma/hue
  vec3 hcl2rgb(float H, float C, float L) {
    float hPrime = H / 60.0;
    float X = C * (1.0 - abs(mod(hPrime, 2.0) - 1.0));
    vec3 RGB =
      hPrime < 1.0 ? vec3(C, X, 0) :
      hPrime < 2.0 ? vec3(X, C, 0) :
      hPrime < 3.0 ? vec3(0, C, X) :
      hPrime < 4.0 ? vec3(0, X, C) :
      hPrime < 5.0 ? vec3(X, 0, C) :
      vec3(C, 0, X);

    float m = L - dot(RGB, vec3(0.30, 0.59, 0.11));
    return RGB + vec3(m, m, m);
  }

  float triangle(float x) {
    return 2.0 * abs(fract(x) - 0.5) - 1.0;
  }

  ${colorForBucket}

  void main() {
    vec4 here = texture2D(colorTexture, vUv);

    if (here.z == 0.0) {
      // Background color
      gl_FragColor = vec4(0, 0, 0, 0);
      return;
    }

    // Sample the 4 surrounding pixels in the depth texture to determine
    // if we should draw a boundary here or not.
    vec4 N = texture2D(colorTexture, vUv + vec2(0, uvSpacePixelSize.y));
    vec4 E = texture2D(colorTexture, vUv + vec2(uvSpacePixelSize.x, 0));
    vec4 S = texture2D(colorTexture, vUv + vec2(0, -uvSpacePixelSize.y));
    vec4 W = texture2D(colorTexture, vUv + vec2(-uvSpacePixelSize.x, 0));

    // NOTE: For outline checks, we intentionally check both the right
    // and the left to determine if we're an edge. If a rectangle is a single
    // pixel wide, we don't want to render it as an outline, so this method
    // of checking ensures that we don't outline single physical-space
    // pixel width rectangles.
    if (
      renderOutlines > 0.0 &&
      (
        here.y == N.y && here.y != S.y || // Top edge
        here.y == S.y && here.y != N.y || // Bottom edge
        here.x == E.x && here.x != W.x || // Left edge
        here.x == W.x && here.x != E.x
      )
    ) {
      // We're on an edge! Draw transparent.
      gl_FragColor = vec4(0, 0, 0, 0);
    } else {
      // Not on an edge. Draw the appropriate color.
      gl_FragColor = vec4(colorForBucket(here.z), here.a);
    }
  }
`;

class FlamechartColorPassRenderer {
  constructor(gl, theme) {
    this.gl = gl;
    const vertices = [{
      pos: [-1, 1],
      uv: [0, 1]
    }, {
      pos: [1, 1],
      uv: [1, 1]
    }, {
      pos: [-1, -1],
      uv: [0, 0]
    }, {
      pos: [1, -1],
      uv: [1, 0]
    }];
    const floats = [];

    for (let v of vertices) {
      floats.push(v.pos[0]);
      floats.push(v.pos[1]);
      floats.push(v.uv[0]);
      floats.push(v.uv[1]);
    }

    this.buffer = gl.createVertexBuffer(vertexFormat.stride * vertices.length);
    this.buffer.uploadFloats(floats);
    this.material = gl.createMaterial(vertexFormat, vert, frag(theme.colorForBucketGLSL));
  }

  render(props) {
    const {
      srcRect,
      rectInfoTexture
    } = props;

    const physicalToUV = _math.AffineTransform.withTranslation(new _math.Vec2(0, 1)).times(_math.AffineTransform.withScale(new _math.Vec2(1, -1))).times(_math.AffineTransform.betweenRects(new _math.Rect(_math.Vec2.zero, new _math.Vec2(rectInfoTexture.width, rectInfoTexture.height)), _math.Rect.unit));

    const uvRect = physicalToUV.transformRect(srcRect);

    const uvTransform = _math.AffineTransform.betweenRects(_math.Rect.unit, uvRect);

    const {
      dstRect
    } = props;
    const viewportSize = new _math.Vec2(this.gl.viewport.width, this.gl.viewport.height);

    const physicalToNDC = _math.AffineTransform.withScale(new _math.Vec2(1, -1)).times(_math.AffineTransform.betweenRects(new _math.Rect(_math.Vec2.zero, viewportSize), _math.Rect.NDC));

    const ndcRect = physicalToNDC.transformRect(dstRect);

    const positionTransform = _math.AffineTransform.betweenRects(_math.Rect.NDC, ndcRect);

    const uvSpacePixelSize = _math.Vec2.unit.dividedByPointwise(new _math.Vec2(props.rectInfoTexture.width, props.rectInfoTexture.height));

    this.material.setUniformSampler('colorTexture', props.rectInfoTexture, 0);
    (0, _utils.setUniformAffineTransform)(this.material, 'uvTransform', uvTransform);
    this.material.setUniformFloat('renderOutlines', props.renderOutlines ? 1.0 : 0.0);
    this.material.setUniformVec2('uvSpacePixelSize', uvSpacePixelSize.x, uvSpacePixelSize.y);
    (0, _utils.setUniformAffineTransform)(this.material, 'positionTransform', positionTransform);
    this.gl.setUnpremultipliedBlendState();
    this.gl.draw(_graphics.Graphics.Primitive.TRIANGLE_STRIP, this.material, this.buffer);
  }

}

exports.FlamechartColorPassRenderer = FlamechartColorPassRenderer;
},{"../lib/math":"../src/lib/math.ts","./graphics":"../src/gl/graphics.ts","./utils":"../src/gl/utils.ts"}],"../src/gl/canvas-context.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CanvasContext = void 0;

var _graphics = require("./graphics");

var _rectangleBatchRenderer = require("./rectangle-batch-renderer");

var _textureRenderer = require("./texture-renderer");

var _math = require("../lib/math");

var _overlayRectangleRenderer = require("./overlay-rectangle-renderer");

var _flamechartColorPassRenderer = require("./flamechart-color-pass-renderer");

var _color = require("../lib/color");

class CanvasContext {
  constructor(canvas, theme) {
    this.animationFrameRequest = null;
    this.beforeFrameHandlers = new Set();

    this.onBeforeFrame = () => {
      this.animationFrameRequest = null;
      this.gl.setViewport(0, 0, this.gl.renderTargetWidthInPixels, this.gl.renderTargetHeightInPixels);

      const color = _color.Color.fromCSSHex(this.theme.bgPrimaryColor);

      this.gl.clear(new _graphics.Graphics.Color(color.r, color.g, color.b, color.a));

      for (const handler of this.beforeFrameHandlers) {
        handler();
      }
    };

    this.gl = new _graphics.WebGL.Context(canvas);
    this.rectangleBatchRenderer = new _rectangleBatchRenderer.RectangleBatchRenderer(this.gl);
    this.textureRenderer = new _textureRenderer.TextureRenderer(this.gl);
    this.viewportRectangleRenderer = new _overlayRectangleRenderer.ViewportRectangleRenderer(this.gl, theme);
    this.flamechartColorPassRenderer = new _flamechartColorPassRenderer.FlamechartColorPassRenderer(this.gl, theme);
    this.theme = theme; // Whenever the canvas is resized, draw immediately. This prevents
    // flickering during resizing.

    this.gl.addAfterResizeEventHandler(this.onBeforeFrame);
    const webGLInfo = this.gl.getWebGLInfo();

    if (webGLInfo) {
      console.log(`WebGL initialized. renderer: ${webGLInfo.renderer}, vendor: ${webGLInfo.vendor}, version: ${webGLInfo.version}`);
    }

    ;

    window['testContextLoss'] = () => {
      this.gl.testContextLoss();
    };
  }

  addBeforeFrameHandler(callback) {
    this.beforeFrameHandlers.add(callback);
  }

  removeBeforeFrameHandler(callback) {
    this.beforeFrameHandlers.delete(callback);
  }

  requestFrame() {
    if (!this.animationFrameRequest) {
      this.animationFrameRequest = requestAnimationFrame(this.onBeforeFrame);
    }
  }

  setViewport(physicalBounds, cb) {
    const {
      origin,
      size
    } = physicalBounds;
    let viewportBefore = this.gl.viewport;
    this.gl.setViewport(origin.x, origin.y, size.x, size.y);
    cb();
    let {
      x,
      y,
      width,
      height
    } = viewportBefore;
    this.gl.setViewport(x, y, width, height);
  }

  renderBehind(el, cb) {
    const bounds = el.getBoundingClientRect();
    const physicalBounds = new _math.Rect(new _math.Vec2(bounds.left * window.devicePixelRatio, bounds.top * window.devicePixelRatio), new _math.Vec2(bounds.width * window.devicePixelRatio, bounds.height * window.devicePixelRatio));
    this.setViewport(physicalBounds, cb);
  }

}

exports.CanvasContext = CanvasContext;
},{"./graphics":"../src/gl/graphics.ts","./rectangle-batch-renderer":"../src/gl/rectangle-batch-renderer.ts","./texture-renderer":"../src/gl/texture-renderer.ts","../lib/math":"../src/lib/math.ts","./overlay-rectangle-renderer":"../src/gl/overlay-rectangle-renderer.ts","./flamechart-color-pass-renderer":"../src/gl/flamechart-color-pass-renderer.ts","../lib/color":"../src/lib/color.ts"}],"../src/app-state/getters.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFrameToColorBucket = exports.getProfileToView = exports.getRowAtlas = exports.getCanvasContext = exports.createGetCSSColorForFrame = exports.createGetColorBucketForFrame = void 0;

var _utils = require("../lib/utils");

var _rowAtlas = require("../gl/row-atlas");

var _canvasContext = require("../gl/canvas-context");

const createGetColorBucketForFrame = (0, _utils.memoizeByReference)(frameToColorBucket => {
  return frame => {
    return frameToColorBucket.get(frame.key) || 0;
  };
});
exports.createGetColorBucketForFrame = createGetColorBucketForFrame;
const createGetCSSColorForFrame = (0, _utils.memoizeByShallowEquality)(({
  theme,
  frameToColorBucket
}) => {
  const getColorBucketForFrame = createGetColorBucketForFrame(frameToColorBucket);
  return frame => {
    const t = getColorBucketForFrame(frame) / 255;
    return theme.colorForBucket(t).toCSS();
  };
});
exports.createGetCSSColorForFrame = createGetCSSColorForFrame;
const getCanvasContext = (0, _utils.memoizeByShallowEquality)(({
  theme,
  canvas
}) => {
  return new _canvasContext.CanvasContext(canvas, theme);
});
exports.getCanvasContext = getCanvasContext;
const getRowAtlas = (0, _utils.memoizeByReference)(canvasContext => {
  return new _rowAtlas.RowAtlas(canvasContext.gl, canvasContext.rectangleBatchRenderer, canvasContext.textureRenderer);
});
exports.getRowAtlas = getRowAtlas;
const getProfileToView = (0, _utils.memoizeByShallowEquality)(({
  profile,
  flattenRecursion
}) => {
  return flattenRecursion ? profile.getProfileWithRecursionFlattened() : profile;
});
exports.getProfileToView = getProfileToView;
const getFrameToColorBucket = (0, _utils.memoizeByReference)(profile => {
  const frames = [];
  profile.forEachFrame(f => frames.push(f));

  function key(f) {
    return (f.file || '') + f.name;
  }

  function compare(a, b) {
    return key(a) > key(b) ? 1 : -1;
  }

  frames.sort(compare);
  const frameToColorBucket = new Map();

  for (let i = 0; i < frames.length; i++) {
    frameToColorBucket.set(frames[i].key, Math.floor(255 * i / frames.length));
  }

  return frameToColorBucket;
});
exports.getFrameToColorBucket = getFrameToColorBucket;
},{"../lib/utils":"../src/lib/utils.ts","../gl/row-atlas":"../src/gl/row-atlas.ts","../gl/canvas-context":"../src/gl/canvas-context.ts"}],"../node_modules/preact/hooks/dist/hooks.module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useState = m;
exports.useReducer = p;
exports.useEffect = l;
exports.useLayoutEffect = y;
exports.useRef = d;
exports.useImperativeHandle = s;
exports.useMemo = h;
exports.useCallback = T;
exports.useContext = w;
exports.useDebugValue = A;
exports.useErrorBoundary = F;

var _preact = require("preact");

var t,
    u,
    r,
    i = 0,
    o = [],
    c = _preact.options.__r,
    f = _preact.options.diffed,
    e = _preact.options.__c,
    a = _preact.options.unmount;

function v(t, r) {
  _preact.options.__h && _preact.options.__h(u, t, i || r), i = 0;
  var o = u.__H || (u.__H = {
    __: [],
    __h: []
  });
  return t >= o.__.length && o.__.push({}), o.__[t];
}

function m(n) {
  return i = 1, p(E, n);
}

function p(n, r, i) {
  var o = v(t++, 2);
  return o.__c || (o.__c = u, o.__ = [i ? i(r) : E(void 0, r), function (t) {
    var u = n(o.__[0], t);
    o.__[0] !== u && (o.__[0] = u, o.__c.setState({}));
  }]), o.__;
}

function l(r, i) {
  var o = v(t++, 3);
  !_preact.options.__s && x(o.__H, i) && (o.__ = r, o.__H = i, u.__H.__h.push(o));
}

function y(r, i) {
  var o = v(t++, 4);
  !_preact.options.__s && x(o.__H, i) && (o.__ = r, o.__H = i, u.__h.push(o));
}

function d(n) {
  return i = 5, h(function () {
    return {
      current: n
    };
  }, []);
}

function s(n, t, u) {
  i = 6, y(function () {
    "function" == typeof n ? n(t()) : n && (n.current = t());
  }, null == u ? u : u.concat(n));
}

function h(n, u) {
  var r = v(t++, 7);
  return x(r.__H, u) ? (r.__H = u, r.__h = n, r.__ = n()) : r.__;
}

function T(n, t) {
  return i = 8, h(function () {
    return n;
  }, t);
}

function w(n) {
  var r = u.context[n.__c],
      i = v(t++, 9);
  return i.__c = n, r ? (null == i.__ && (i.__ = !0, r.sub(u)), r.props.value) : n.__;
}

function A(t, u) {
  _preact.options.useDebugValue && _preact.options.useDebugValue(u ? u(t) : t);
}

function F(n) {
  var r = v(t++, 10),
      i = m();
  return r.__ = n, u.componentDidCatch || (u.componentDidCatch = function (n) {
    r.__ && r.__(n), i[1](n);
  }), [i[0], function () {
    i[1](void 0);
  }];
}

function _() {
  o.some(function (t) {
    if (t.__P) try {
      t.__H.__h.forEach(g), t.__H.__h.forEach(q), t.__H.__h = [];
    } catch (u) {
      return t.__H.__h = [], _preact.options.__e(u, t.__v), !0;
    }
  }), o = [];
}

function g(n) {
  n.t && n.t();
}

function q(n) {
  var t = n.__();

  "function" == typeof t && (n.t = t);
}

function x(n, t) {
  return !n || t.some(function (t, u) {
    return t !== n[u];
  });
}

function E(n, t) {
  return "function" == typeof t ? t(n) : t;
}

_preact.options.__r = function (n) {
  c && c(n), t = 0, (u = n.__c).__H && (u.__H.__h.forEach(g), u.__H.__h.forEach(q), u.__H.__h = []);
}, _preact.options.diffed = function (t) {
  f && f(t);
  var u = t.__c;

  if (u) {
    var i = u.__H;
    i && i.__h.length && (1 !== o.push(u) && r === _preact.options.requestAnimationFrame || ((r = _preact.options.requestAnimationFrame) || function (n) {
      var t,
          u = function () {
        clearTimeout(r), cancelAnimationFrame(t), setTimeout(n);
      },
          r = setTimeout(u, 100);

      "undefined" != typeof window && (t = requestAnimationFrame(u));
    })(_));
  }
}, _preact.options.__c = function (t, u) {
  u.some(function (t) {
    try {
      t.__h.forEach(g), t.__h = t.__h.filter(function (n) {
        return !n.__ || q(n);
      });
    } catch (r) {
      u.some(function (n) {
        n.__h && (n.__h = []);
      }), u = [], _preact.options.__e(r, t.__v);
    }
  }), e && e(t, u);
}, _preact.options.unmount = function (t) {
  a && a(t);
  var u = t.__c;

  if (u) {
    var r = u.__H;
    if (r) try {
      r.__.forEach(function (n) {
        return n.t && n.t();
      });
    } catch (t) {
      _preact.options.__e(t, u.__v);
    }
  }
};
},{"preact":"../node_modules/preact/dist/preact.module.js"}],"../node_modules/preact/compat/dist/compat.module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  version: true,
  Children: true,
  render: true,
  hydrate: true,
  unmountComponentAtNode: true,
  createPortal: true,
  createFactory: true,
  cloneElement: true,
  isValidElement: true,
  findDOMNode: true,
  PureComponent: true,
  memo: true,
  forwardRef: true,
  unstable_batchedUpdates: true,
  Suspense: true,
  SuspenseList: true,
  lazy: true,
  createElement: true,
  createContext: true,
  createRef: true,
  Fragment: true,
  Component: true
};
exports.render = T;
exports.hydrate = V;
exports.unmountComponentAtNode = Q;
exports.createPortal = z;
exports.createFactory = G;
exports.cloneElement = K;
exports.isValidElement = J;
exports.findDOMNode = X;
exports.memo = _;
exports.forwardRef = S;
exports.Suspense = U;
exports.SuspenseList = O;
exports.lazy = L;
Object.defineProperty(exports, "createElement", {
  enumerable: true,
  get: function () {
    return _preact.createElement;
  }
});
Object.defineProperty(exports, "createContext", {
  enumerable: true,
  get: function () {
    return _preact.createContext;
  }
});
Object.defineProperty(exports, "createRef", {
  enumerable: true,
  get: function () {
    return _preact.createRef;
  }
});
Object.defineProperty(exports, "Fragment", {
  enumerable: true,
  get: function () {
    return _preact.Fragment;
  }
});
Object.defineProperty(exports, "Component", {
  enumerable: true,
  get: function () {
    return _preact.Component;
  }
});
exports.unstable_batchedUpdates = exports.PureComponent = exports.Children = exports.version = exports.default = void 0;

var _hooks = require("preact/hooks");

Object.keys(_hooks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hooks[key];
    }
  });
});

var _preact = require("preact");

function E(n, t) {
  for (var e in t) n[e] = t[e];

  return n;
}

function w(n, t) {
  for (var e in n) if ("__source" !== e && !(e in t)) return !0;

  for (var r in t) if ("__source" !== r && n[r] !== t[r]) return !0;

  return !1;
}

var C = function (n) {
  var t, e;

  function r(t) {
    var e;
    return (e = n.call(this, t) || this).isPureReactComponent = !0, e;
  }

  return e = n, (t = r).prototype = Object.create(e.prototype), t.prototype.constructor = t, t.__proto__ = e, r.prototype.shouldComponentUpdate = function (n, t) {
    return w(this.props, n) || w(this.state, t);
  }, r;
}(_preact.Component);

exports.PureComponent = C;

function _(n, t) {
  function e(n) {
    var e = this.props.ref,
        r = e == n.ref;
    return !r && e && (e.call ? e(null) : e.current = null), t ? !t(this.props, n) || !r : w(this.props, n);
  }

  function r(t) {
    return this.shouldComponentUpdate = e, (0, _preact.createElement)(n, E({}, t));
  }

  return r.prototype.isReactComponent = !0, r.displayName = "Memo(" + (n.displayName || n.name) + ")", r.t = !0, r;
}

var A = _preact.options.__b;

function S(n) {
  function t(t) {
    var e = E({}, t);
    return delete e.ref, n(e, t.ref);
  }

  return t.prototype.isReactComponent = t.t = !0, t.displayName = "ForwardRef(" + (n.displayName || n.name) + ")", t;
}

_preact.options.__b = function (n) {
  n.type && n.type.t && n.ref && (n.props.ref = n.ref, n.ref = null), A && A(n);
};

var k = function (n, t) {
  return n ? (0, _preact.toChildArray)(n).reduce(function (n, e, r) {
    return n.concat(t(e, r));
  }, []) : null;
},
    R = {
  map: k,
  forEach: k,
  count: function (n) {
    return n ? (0, _preact.toChildArray)(n).length : 0;
  },
  only: function (n) {
    if (1 !== (n = (0, _preact.toChildArray)(n)).length) throw new Error("Children.only() expects only one child.");
    return n[0];
  },
  toArray: _preact.toChildArray
},
    F = _preact.options.__e;

exports.Children = R;

function N(n) {
  return n && ((n = E({}, n)).__c = null, n.__k = n.__k && n.__k.map(N)), n;
}

function U() {
  this.__u = 0, this.o = null, this.__b = null;
}

function M(n) {
  var t = n.__.__c;
  return t && t.u && t.u(n);
}

function L(n) {
  var t, e, r;

  function o(o) {
    if (t || (t = n()).then(function (n) {
      e = n.default || n;
    }, function (n) {
      r = n;
    }), r) throw r;
    if (!e) throw t;
    return (0, _preact.createElement)(e, o);
  }

  return o.displayName = "Lazy", o.t = !0, o;
}

function O() {
  this.i = null, this.l = null;
}

_preact.options.__e = function (n, t, e) {
  if (n.then) for (var r, o = t; o = o.__;) if ((r = o.__c) && r.__c) return r.__c(n, t.__c);
  F(n, t, e);
}, (U.prototype = new _preact.Component()).__c = function (n, t) {
  var e = this;
  null == e.o && (e.o = []), e.o.push(t);

  var r = M(e.__v),
      o = !1,
      u = function () {
    o || (o = !0, r ? r(i) : i());
  };

  t.__c = t.componentWillUnmount, t.componentWillUnmount = function () {
    u(), t.__c && t.__c();
  };

  var i = function () {
    var n;
    if (! --e.__u) for (e.__v.__k[0] = e.state.u, e.setState({
      u: e.__b = null
    }); n = e.o.pop();) n.forceUpdate();
  };

  e.__u++ || e.setState({
    u: e.__b = e.__v.__k[0]
  }), n.then(u, u);
}, U.prototype.render = function (n, t) {
  return this.__b && (this.__v.__k[0] = N(this.__b), this.__b = null), [(0, _preact.createElement)(_preact.Component, null, t.u ? null : n.children), t.u && n.fallback];
};

var P = function (n, t, e) {
  if (++e[1] === e[0] && n.l.delete(t), n.props.revealOrder && ("t" !== n.props.revealOrder[0] || !n.l.size)) for (e = n.i; e;) {
    for (; e.length > 3;) e.pop()();

    if (e[1] < e[0]) break;
    n.i = e = e[2];
  }
};

(O.prototype = new _preact.Component()).u = function (n) {
  var t = this,
      e = M(t.__v),
      r = t.l.get(n);
  return r[0]++, function (o) {
    var u = function () {
      t.props.revealOrder ? (r.push(o), P(t, n, r)) : o();
    };

    e ? e(u) : u();
  };
}, O.prototype.render = function (n) {
  this.i = null, this.l = new Map();
  var t = (0, _preact.toChildArray)(n.children);
  n.revealOrder && "b" === n.revealOrder[0] && t.reverse();

  for (var e = t.length; e--;) this.l.set(t[e], this.i = [1, 0, this.i]);

  return n.children;
}, O.prototype.componentDidUpdate = O.prototype.componentDidMount = function () {
  var n = this;
  n.l.forEach(function (t, e) {
    P(n, e, t);
  });
};

var W = function () {
  function n() {}

  var t = n.prototype;
  return t.getChildContext = function () {
    return this.props.context;
  }, t.render = function (n) {
    return n.children;
  }, n;
}();

function j(n) {
  var t = this,
      e = n.container,
      r = (0, _preact.createElement)(W, {
    context: t.context
  }, n.vnode);
  return t.s && t.s !== e && (t.v.parentNode && t.s.removeChild(t.v), (0, _preact._unmount)(t.h), t.p = !1), n.vnode ? t.p ? (e.__k = t.__k, (0, _preact.render)(r, e), t.__k = e.__k) : (t.v = document.createTextNode(""), (0, _preact.hydrate)("", e), e.appendChild(t.v), t.p = !0, t.s = e, (0, _preact.render)(r, e, t.v), t.__k = t.v.__k) : t.p && (t.v.parentNode && t.s.removeChild(t.v), (0, _preact._unmount)(t.h)), t.h = r, t.componentWillUnmount = function () {
    t.v.parentNode && t.s.removeChild(t.v), (0, _preact._unmount)(t.h);
  }, null;
}

function z(n, t) {
  return (0, _preact.createElement)(j, {
    vnode: n,
    container: t
  });
}

var D = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
_preact.Component.prototype.isReactComponent = {};
var H = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;

function T(n, t, e) {
  if (null == t.__k) for (; t.firstChild;) t.removeChild(t.firstChild);
  return (0, _preact.render)(n, t), "function" == typeof e && e(), n ? n.__c : null;
}

function V(n, t, e) {
  return (0, _preact.hydrate)(n, t), "function" == typeof e && e(), n ? n.__c : null;
}

var Z = _preact.options.event;

function I(n, t) {
  n["UNSAFE_" + t] && !n[t] && Object.defineProperty(n, t, {
    configurable: !1,
    get: function () {
      return this["UNSAFE_" + t];
    },
    set: function (n) {
      this["UNSAFE_" + t] = n;
    }
  });
}

_preact.options.event = function (n) {
  Z && (n = Z(n)), n.persist = function () {};
  var t = !1,
      e = !1,
      r = n.stopPropagation;

  n.stopPropagation = function () {
    r.call(n), t = !0;
  };

  var o = n.preventDefault;
  return n.preventDefault = function () {
    o.call(n), e = !0;
  }, n.isPropagationStopped = function () {
    return t;
  }, n.isDefaultPrevented = function () {
    return e;
  }, n.nativeEvent = n;
};

var $ = {
  configurable: !0,
  get: function () {
    return this.class;
  }
},
    q = _preact.options.vnode;

_preact.options.vnode = function (n) {
  n.$$typeof = H;
  var t = n.type,
      e = n.props;

  if (t) {
    if (e.class != e.className && ($.enumerable = "className" in e, null != e.className && (e.class = e.className), Object.defineProperty(e, "className", $)), "function" != typeof t) {
      var r, o, u;

      for (u in e.defaultValue && void 0 !== e.value && (e.value || 0 === e.value || (e.value = e.defaultValue), delete e.defaultValue), Array.isArray(e.value) && e.multiple && "select" === t && ((0, _preact.toChildArray)(e.children).forEach(function (n) {
        -1 != e.value.indexOf(n.props.value) && (n.props.selected = !0);
      }), delete e.value), e) if (r = D.test(u)) break;

      if (r) for (u in o = n.props = {}, e) o[D.test(u) ? u.replace(/[A-Z0-9]/, "-$&").toLowerCase() : u] = e[u];
    }

    !function (t) {
      var e = n.type,
          r = n.props;

      if (r && "string" == typeof e) {
        var o = {};

        for (var u in r) /^on(Ani|Tra|Tou)/.test(u) && (r[u.toLowerCase()] = r[u], delete r[u]), o[u.toLowerCase()] = u;

        if (o.ondoubleclick && (r.ondblclick = r[o.ondoubleclick], delete r[o.ondoubleclick]), o.onbeforeinput && (r.onbeforeinput = r[o.onbeforeinput], delete r[o.onbeforeinput]), o.onchange && ("textarea" === e || "input" === e.toLowerCase() && !/^fil|che|ra/i.test(r.type))) {
          var i = o.oninput || "oninput";
          r[i] || (r[i] = r[o.onchange], delete r[o.onchange]);
        }
      }
    }(), "function" == typeof t && !t.m && t.prototype && (I(t.prototype, "componentWillMount"), I(t.prototype, "componentWillReceiveProps"), I(t.prototype, "componentWillUpdate"), t.m = !0);
  }

  q && q(n);
};

var B = "16.8.0";
exports.version = B;

function G(n) {
  return _preact.createElement.bind(null, n);
}

function J(n) {
  return !!n && n.$$typeof === H;
}

function K(n) {
  return J(n) ? _preact.cloneElement.apply(null, arguments) : n;
}

function Q(n) {
  return !!n.__k && ((0, _preact.render)(null, n), !0);
}

function X(n) {
  return n && (n.base || 1 === n.nodeType && n) || null;
}

var Y = function (n, t) {
  return n(t);
};

exports.unstable_batchedUpdates = Y;
var _default = {
  useState: _hooks.useState,
  useReducer: _hooks.useReducer,
  useEffect: _hooks.useEffect,
  useLayoutEffect: _hooks.useLayoutEffect,
  useRef: _hooks.useRef,
  useImperativeHandle: _hooks.useImperativeHandle,
  useMemo: _hooks.useMemo,
  useCallback: _hooks.useCallback,
  useContext: _hooks.useContext,
  useDebugValue: _hooks.useDebugValue,
  version: "16.8.0",
  Children: R,
  render: T,
  hydrate: T,
  unmountComponentAtNode: Q,
  createPortal: z,
  createElement: _preact.createElement,
  createContext: _preact.createContext,
  createFactory: G,
  cloneElement: K,
  createRef: _preact.createRef,
  Fragment: _preact.Fragment,
  isValidElement: J,
  findDOMNode: X,
  Component: _preact.Component,
  PureComponent: C,
  memo: _,
  forwardRef: S,
  unstable_batchedUpdates: Y,
  Suspense: U,
  SuspenseList: O,
  lazy: L
};
exports.default = _default;
},{"preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","preact":"../node_modules/preact/dist/preact.module.js"}],"../src/lib/atom.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAtom = useAtom;
exports.Atom = void 0;

var _hooks = require("preact/hooks");

// This is a very small application state management library.
//
// All it provides is a way of specifying state "atoms" (basically a value with
// a setter and a way to be notified when the value updates), and a single
// preact hook to manage the subscribe/unsubscribe process for you.
//
// At the moment, atoms are intended to be globally defined, but the system
// could easily be adapted to pass down the atoms via context rather than being
// globally available.
//
// To support complex data-types, you can either have simple functions that call
// the public setter, or subclass Atom. So, for example, here are a few
// different ways of making a list atom with convenient helpers:
//
// # Simple functions being passed atom
//
//     const myListAtom = new Atom<number[]>([], "myList")
//     function push<T>(atom: Atom<T[]>, t: T) {
//       const next = [...atom.get(), t]
//       atom.set(next)
//     }
//     function removeLast<T>(atom: Atom<T[]>, t: T) {
//       const next = [...atom.get()]
//       next.pop()
//       atom.set(next)
//     }
//
//
// # Simple functions operating on global atoms
//
//     const myListAtom = new Atom<number[]>([], "myLisT")
//     function push(t: number) {
//       myListAtom.set([...myListAtom.get(), t])
//     }
//     function removeLast() {
//       const next = [...myListAtom.get()]
//       myListAtom.set(next)
//     }
//
//
// # Subclassing
//
//     class ListAtom<T> extends Atom<T[]> {
//        push(t: T) {
//          const next = [...this.state, t]
//          this.set(next)
//        }
//        removeLast() {
//          const next = [...this.state]
//          next.pop()
//          this.set(next)
//        }
//     }
//     const myListAtom = new ListAtom<number>([], "myList")
//
// This library is inspired by https://recoiljs.org/
let AtomDev = null;
let hotReloadStash = null;

if ("development" === 'development') {
  ;
  window['Atom'] = AtomDev = {};
  module.hot.dispose(() => {
    if (AtomDev) {
      hotReloadStash = new Map();

      for (let key in AtomDev) {
        hotReloadStash.set(key, AtomDev[key].get());
      }
    }

    ;
    window['Atom_hotReloadStash'] = hotReloadStash;
  });
  hotReloadStash = window['Atom_hotReloadStash'] || null;
}

class Atom {
  constructor(state, debugKey) {
    this.state = state;
    this.observers = [];

    if ("development" === 'development') {
      if (hotReloadStash === null || hotReloadStash === void 0 ? void 0 : hotReloadStash.has(debugKey)) {
        // If we have a stored value from a previous hot reload, use that
        // instead of whatever was passed to the constructor.
        this.state = hotReloadStash.get(debugKey);
      }

      if (AtomDev) {
        if (debugKey in AtomDev) {
          console.warn(`[Atom] Multiple atoms tried to register with the key ${debugKey}`);
        }

        AtomDev[debugKey] = this;
      }
    } // We do the bind here rather than in the definition to facilitate
    // inheritance (we want the value defined on both the prototype and the
    // instance).


    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
  }

  set(t) {
    if (this.state === t) {
      // No-op if the value didn't actually change
      return;
    }

    this.state = t;
    this.observers.forEach(fn => fn());
  }

  get() {
    return this.state;
  }

  subscribe(listener) {
    this.observers.push(listener);
  }

  unsubscribe(listener) {
    const index = this.observers.indexOf(listener);

    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

}

exports.Atom = Atom;

function useAtom(atom) {
  const [value, setValue] = (0, _hooks.useState)(atom.get());
  (0, _hooks.useLayoutEffect)(() => {
    // We need to setValue here because it's possible something has changed the
    // value in the store between the atom.get() call above and layout. In most
    // cases this should no-op.
    setValue(atom.get());

    function listener() {
      setValue(atom.get());
    }

    atom.subscribe(listener);
    return () => {
      atom.unsubscribe(listener);
    };
  }, [atom]);
  return value;
}
},{"preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js"}],"../src/lib/view-mode.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewMode = void 0;
var ViewMode;
exports.ViewMode = ViewMode;

(function (ViewMode) {
  ViewMode[ViewMode["CHRONO_FLAME_CHART"] = 0] = "CHRONO_FLAME_CHART";
  ViewMode[ViewMode["LEFT_HEAVY_FLAME_GRAPH"] = 1] = "LEFT_HEAVY_FLAME_GRAPH";
  ViewMode[ViewMode["SANDWICH_VIEW"] = 2] = "SANDWICH_VIEW";
  ViewMode[ViewMode["COMPARE_VIEW"] = 3] = "COMPARE_VIEW";
})(ViewMode || (exports.ViewMode = ViewMode = {}));
},{}],"../src/lib/hash-params.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHashParams = getHashParams;

var _viewMode = require("../lib/view-mode");

function getViewMode(value) {
  switch (value) {
    case 'time-ordered':
      return _viewMode.ViewMode.CHRONO_FLAME_CHART;

    case 'left-heavy':
      return _viewMode.ViewMode.LEFT_HEAVY_FLAME_GRAPH;

    case 'sandwich':
      return _viewMode.ViewMode.SANDWICH_VIEW;

    default:
      return null;
  }
}

function getHashParams(hashContents = window.location.hash) {
  try {
    if (!hashContents.startsWith('#')) {
      return {};
    }

    const components = hashContents.substr(1).split('&');
    const result = {};

    for (const component of components) {
      let [key, value] = component.split('=');
      value = decodeURIComponent(value);

      if (key === 'profileURL') {
        result.profileURL = value;
      } else if (key === 'title') {
        result.title = value;
      } else if (key === 'localProfilePath') {
        result.localProfilePath = value;
      } else if (key === 'view') {
        const mode = getViewMode(value);

        if (mode !== null) {
          result.viewMode = mode;
        } else {
          console.error(`Ignoring invalid view specifier: ${value}`);
        }
      }
    }

    return result;
  } catch (e) {
    console.error(`Error when loading hash fragment.`);
    console.error(e);
    return {};
  }
}
},{"../lib/view-mode":"../src/lib/view-mode.ts"}],"../src/app-state/profile-group.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProfileGroupAtom = exports.FlamechartID = void 0;

var _atom = require("../lib/atom");

var _math = require("../lib/math");

var _utils = require("../lib/utils");

var FlamechartID;
exports.FlamechartID = FlamechartID;

(function (FlamechartID) {
  FlamechartID["LEFT_HEAVY"] = "LEFT_HEAVY";
  FlamechartID["CHRONO"] = "CHRONO";
  FlamechartID["SANDWICH_INVERTED_CALLERS"] = "SANDWICH_INVERTED_CALLERS";
  FlamechartID["SANDWICH_CALLEES"] = "SANDWICH_CALLEES";
})(FlamechartID || (exports.FlamechartID = FlamechartID = {}));

let initialFlameChartViewState = {
  hover: null,
  selectedNode: null,
  configSpaceViewportRect: _math.Rect.empty,
  logicalSpaceViewportSize: _math.Vec2.zero
};

class ProfileGroupAtom extends _atom.Atom {
  constructor() {
    super(...arguments);

    this.setProfileGroup = group => {
      this.set({
        name: group.name,
        indexToView: group.indexToView,
        profiles: group.profiles.map(p => ({
          profile: p,
          chronoViewState: initialFlameChartViewState,
          leftHeavyViewState: initialFlameChartViewState,
          sandwichViewState: {
            callerCallee: null
          }
        }))
      });
    };

    this.setProfileIndexToView = indexToView => {
      if (this.state == null) return;
      indexToView = (0, _math.clamp)(indexToView, 0, this.state.profiles.length - 1);
      this.set(Object.assign(Object.assign({}, this.state), {
        indexToView
      }));
    };

    this.setSelectedFrame = frame => {
      if (this.state == null) return;
      const profile = this.getActiveProfile();

      if (profile == null) {
        return;
      }

      this.updateActiveSandwichViewState(sandwichViewState => {
        if (frame == null) {
          return {
            callerCallee: null
          };
        }

        return {
          callerCallee: {
            invertedCallerFlamegraph: initialFlameChartViewState,
            calleeFlamegraph: initialFlameChartViewState,
            selectedFrame: frame
          }
        };
      });
    };
  }

  set(newState) {
    const oldState = this.state;

    if (oldState != null && newState != null && (0, _utils.objectsHaveShallowEquality)(oldState, newState)) {
      return;
    }

    super.set(newState);
  }

  getActiveProfile() {
    var _a;

    if (this.state == null) return null;
    return this.state.profiles[(_a = this.state) === null || _a === void 0 ? void 0 : _a.indexToView] || null;
  }

  updateActiveProfileState(fn) {
    if (this.state == null) return;
    const {
      indexToView,
      profiles
    } = this.state;
    this.set(Object.assign(Object.assign({}, this.state), {
      profiles: profiles.map((p, i) => {
        if (i != indexToView) return p;
        return fn(p);
      })
    }));
  }

  updateActiveSandwichViewState(fn) {
    this.updateActiveProfileState(p => Object.assign(Object.assign({}, p), {
      sandwichViewState: fn(p.sandwichViewState)
    }));
  }

  updateFlamechartState(id, fn) {
    switch (id) {
      case FlamechartID.CHRONO:
        {
          this.updateActiveProfileState(p => Object.assign(Object.assign({}, p), {
            chronoViewState: fn(p.chronoViewState)
          }));
          break;
        }

      case FlamechartID.LEFT_HEAVY:
        {
          this.updateActiveProfileState(p => Object.assign(Object.assign({}, p), {
            leftHeavyViewState: fn(p.leftHeavyViewState)
          }));
          break;
        }

      case FlamechartID.SANDWICH_CALLEES:
        {
          this.updateActiveSandwichViewState(s => Object.assign(Object.assign({}, s), {
            callerCallee: s.callerCallee == null ? null : Object.assign(Object.assign({}, s.callerCallee), {
              calleeFlamegraph: fn(s.callerCallee.calleeFlamegraph)
            })
          }));
          break;
        }

      case FlamechartID.SANDWICH_INVERTED_CALLERS:
        {
          this.updateActiveSandwichViewState(s => Object.assign(Object.assign({}, s), {
            callerCallee: s.callerCallee == null ? null : Object.assign(Object.assign({}, s.callerCallee), {
              invertedCallerFlamegraph: fn(s.callerCallee.invertedCallerFlamegraph)
            })
          }));
          break;
        }
    }
  }

  setFlamechartHoveredNode(id, hover) {
    this.updateFlamechartState(id, f => Object.assign(Object.assign({}, f), {
      hover
    }));
  }

  setSelectedNode(id, selectedNode) {
    this.updateFlamechartState(id, f => Object.assign(Object.assign({}, f), {
      selectedNode
    }));
  }

  setConfigSpaceViewportRect(id, configSpaceViewportRect) {
    this.updateFlamechartState(id, f => Object.assign(Object.assign({}, f), {
      configSpaceViewportRect
    }));
  }

  setLogicalSpaceViewportSize(id, logicalSpaceViewportSize) {
    this.updateFlamechartState(id, f => Object.assign(Object.assign({}, f), {
      logicalSpaceViewportSize
    }));
  }

  clearHoverNode() {
    // TODO(jlfwong): This causes 4 separate observer events. This is probably
    // fine, since I hope that Preact/React are smart about batching re-renders?
    this.setFlamechartHoveredNode(FlamechartID.CHRONO, null);
    this.setFlamechartHoveredNode(FlamechartID.LEFT_HEAVY, null);
    this.setFlamechartHoveredNode(FlamechartID.SANDWICH_CALLEES, null);
    this.setFlamechartHoveredNode(FlamechartID.SANDWICH_INVERTED_CALLERS, null);
  }

}

exports.ProfileGroupAtom = ProfileGroupAtom;
},{"../lib/atom":"../src/lib/atom.ts","../lib/math":"../src/lib/math.ts","../lib/utils":"../src/lib/utils.ts"}],"../src/app-state/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tableSortMethodAtom = exports.SortDirection = exports.CompareSortField = exports.SortField = exports.errorAtom = exports.loadingAtom = exports.canUseXHR = exports.dragActiveAtom = exports.glCanvasAtom = exports.hashParamsAtom = exports.compareProfileGroupAtom = exports.profileGroupAtom = exports.viewModeAtom = exports.searchQueryAtom = exports.searchIsActiveAtom = exports.flattenRecursionAtom = void 0;

var _atom = require("../lib/atom");

var _viewMode = require("../lib/view-mode");

var _hashParams = require("../lib/hash-params");

var _profileGroup = require("./profile-group");

// True if recursion should be flattened when viewing flamegraphs
const flattenRecursionAtom = new _atom.Atom(false, 'flattenRecursion'); // The query used in top-level views
//
// An empty string indicates that the search is open by no filter is applied.
// searchIsActive is stored separately, because we may choose to persist the
// query even when the search input is closed.

exports.flattenRecursionAtom = flattenRecursionAtom;
const searchIsActiveAtom = new _atom.Atom(false, 'searchIsActive');
exports.searchIsActiveAtom = searchIsActiveAtom;
const searchQueryAtom = new _atom.Atom('', 'searchQueryAtom'); // Which top-level view should be displayed

exports.searchQueryAtom = searchQueryAtom;
const viewModeAtom = new _atom.Atom(_viewMode.ViewMode.CHRONO_FLAME_CHART, 'viewMode'); // The top-level profile group from which most other data will be derived

exports.viewModeAtom = viewModeAtom;
const profileGroupAtom = new _profileGroup.ProfileGroupAtom(null, 'profileGroup'); // The top-level profile group from which most other data will be derived

exports.profileGroupAtom = profileGroupAtom;
const compareProfileGroupAtom = new _profileGroup.ProfileGroupAtom(null, 'compareProfileGroup');
exports.compareProfileGroupAtom = compareProfileGroupAtom;
viewModeAtom.subscribe(() => {
  // If we switch views, the hover information is no longer relevant
  profileGroupAtom.clearHoverNode();
}); // Parameters defined by the URL encoded k=v pairs after the # in the URL

const hashParams = (0, _hashParams.getHashParams)();
const hashParamsAtom = new _atom.Atom(hashParams, 'hashParams'); // The <canvas> element used for WebGL

exports.hashParamsAtom = hashParamsAtom;
const glCanvasAtom = new _atom.Atom(null, 'glCanvas'); // True when a file drag is currently active. Used to indicate that the
// application is a valid drop target.

exports.glCanvasAtom = glCanvasAtom;
const dragActiveAtom = new _atom.Atom(false, 'dragActive'); // True when the application is currently in a loading state. Used to
// display a loading progress bar.
// Speedscope is usable both from a local HTML file being served
// from a file:// URL, and via websites. In the case of file:// URLs,
// however, XHR will be unavailable to fetching files in adjacent directories.

exports.dragActiveAtom = dragActiveAtom;
const protocol = window.location.protocol;
const canUseXHR = protocol === 'http:' || protocol === 'https:';
exports.canUseXHR = canUseXHR;
const isImmediatelyLoading = canUseXHR && hashParams.profileURL != null;
const loadingAtom = new _atom.Atom(isImmediatelyLoading, 'loading'); // True when the application is an error state, e.g. because the profile
// imported was invalid.

exports.loadingAtom = loadingAtom;
const errorAtom = new _atom.Atom(false, 'error');
exports.errorAtom = errorAtom;
var SortField;
exports.SortField = SortField;

(function (SortField) {
  SortField[SortField["SYMBOL_NAME"] = 0] = "SYMBOL_NAME";
  SortField[SortField["SELF"] = 1] = "SELF";
  SortField[SortField["TOTAL"] = 2] = "TOTAL";
})(SortField || (exports.SortField = SortField = {}));

var CompareSortField;
exports.CompareSortField = CompareSortField;

(function (CompareSortField) {
  CompareSortField[CompareSortField["SYMBOL_NAME"] = 0] = "SYMBOL_NAME";
  CompareSortField[CompareSortField["SELF_CHANGE"] = 1] = "SELF_CHANGE";
  CompareSortField[CompareSortField["TOTAL_CHANGE"] = 2] = "TOTAL_CHANGE";
})(CompareSortField || (exports.CompareSortField = CompareSortField = {}));

var SortDirection;
exports.SortDirection = SortDirection;

(function (SortDirection) {
  SortDirection[SortDirection["ASCENDING"] = 0] = "ASCENDING";
  SortDirection[SortDirection["DESCENDING"] = 1] = "DESCENDING";
})(SortDirection || (exports.SortDirection = SortDirection = {})); // The table sorting method using for the sandwich view, specifying the column
// to sort by, and the direction to sort that clumn.


const tableSortMethodAtom = new _atom.Atom({
  field: SortField.SELF,
  direction: SortDirection.DESCENDING
}, 'tableSortMethod');
exports.tableSortMethodAtom = tableSortMethodAtom;
},{"../lib/atom":"../src/lib/atom.ts","../lib/view-mode":"../src/lib/view-mode.ts","../lib/hash-params":"../src/lib/hash-params.ts","./profile-group":"../src/app-state/profile-group.ts"}],"../src/app-state/active-profile-state.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useActiveProfileState = useActiveProfileState;
exports.useActiveCompareProfileState = useActiveCompareProfileState;

var _getters = require("./getters");

var _ = require(".");

var _atom = require("../lib/atom");

function useActiveProfileState() {
  const flattenRecursion = (0, _atom.useAtom)(_.flattenRecursionAtom);
  const profileGroupState = (0, _atom.useAtom)(_.profileGroupAtom);
  if (!profileGroupState) return null;
  if (profileGroupState.indexToView >= profileGroupState.profiles.length) return null;
  const index = profileGroupState.indexToView;
  const profileState = profileGroupState.profiles[index];
  return Object.assign(Object.assign({}, profileGroupState.profiles[profileGroupState.indexToView]), {
    profile: (0, _getters.getProfileToView)({
      profile: profileState.profile,
      flattenRecursion
    }),
    index: profileGroupState.indexToView
  });
}

function useActiveCompareProfileState() {
  const flattenRecursion = (0, _atom.useAtom)(_.flattenRecursionAtom);
  const profileGroupState = (0, _atom.useAtom)(_.compareProfileGroupAtom);
  if (!profileGroupState) return null;
  if (profileGroupState.indexToView >= profileGroupState.profiles.length) return null;
  const index = profileGroupState.indexToView;
  const profileState = profileGroupState.profiles[index];
  return Object.assign(Object.assign({}, profileGroupState.profiles[profileGroupState.indexToView]), {
    profile: (0, _getters.getProfileToView)({
      profile: profileState.profile,
      flattenRecursion
    }),
    index: profileGroupState.indexToView
  });
}
},{"./getters":"../src/app-state/getters.ts",".":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts"}],"../src/app-state/color-scheme.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.colorSchemeAtom = exports.ColorScheme = void 0;

var _atom = require("../lib/atom");

var ColorScheme;
exports.ColorScheme = ColorScheme;

(function (ColorScheme) {
  // Default: respect prefers-color-schema
  ColorScheme[ColorScheme["SYSTEM"] = 0] = "SYSTEM"; // Use dark theme

  ColorScheme[ColorScheme["DARK"] = 1] = "DARK"; // use light theme

  ColorScheme[ColorScheme["LIGHT"] = 2] = "LIGHT";
})(ColorScheme || (exports.ColorScheme = ColorScheme = {}));

const localStorageKey = 'speedscope-color-scheme';

function getStoredPreference() {
  const storedPreference = window.localStorage && window.localStorage[localStorageKey];

  if (storedPreference === 'DARK') {
    return ColorScheme.DARK;
  } else if (storedPreference === 'LIGHT') {
    return ColorScheme.LIGHT;
  } else {
    return ColorScheme.SYSTEM;
  }
}

function matchMediaDarkColorScheme() {
  return matchMedia('(prefers-color-scheme: dark)');
}

function nextColorScheme(scheme) {
  const systemPrefersDarkMode = matchMediaDarkColorScheme().matches; // We'll use a different cycling order for changing the color scheme depending
  // on what the *current* system preference is. This should guarantee that when
  // a user interacts with the color scheme toggle for the first time, it always
  // changes the color scheme.

  if (systemPrefersDarkMode) {
    switch (scheme) {
      case ColorScheme.SYSTEM:
        {
          return ColorScheme.LIGHT;
        }

      case ColorScheme.LIGHT:
        {
          return ColorScheme.DARK;
        }

      case ColorScheme.DARK:
        {
          return ColorScheme.SYSTEM;
        }
    }
  } else {
    switch (scheme) {
      case ColorScheme.SYSTEM:
        {
          return ColorScheme.DARK;
        }

      case ColorScheme.DARK:
        {
          return ColorScheme.LIGHT;
        }

      case ColorScheme.LIGHT:
        {
          return ColorScheme.SYSTEM;
        }
    }
  }
}

class ColorSchemeAtom extends _atom.Atom {
  constructor() {
    super(...arguments);

    this.cycleToNextColorScheme = () => {
      this.set(nextColorScheme(this.get()));
    };
  }

}

const colorSchemeAtom = new ColorSchemeAtom(getStoredPreference(), 'colorScheme');
exports.colorSchemeAtom = colorSchemeAtom;
colorSchemeAtom.subscribe(() => {
  const value = colorSchemeAtom.get();

  switch (value) {
    case ColorScheme.DARK:
      {
        window.localStorage[localStorageKey] = 'DARK';
        break;
      }

    case ColorScheme.LIGHT:
      {
        window.localStorage[localStorageKey] = 'LIGHT';
        break;
      }

    case ColorScheme.SYSTEM:
      {
        delete window.localStorage[localStorageKey];
        break;
      }

    default:
      {
        const _exhaustiveCheck = value;
        return _exhaustiveCheck;
      }
  }

  return value;
});
},{"../lib/atom":"../src/lib/atom.ts"}],"../src/views/themes/dark-theme.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.darkTheme = void 0;

var _color = require("../../lib/color");

var _utils = require("../../lib/utils");

// These colors are intentionally not exported from this file, because these
// colors are theme specific, and we want all color values to come from the
// active theme.
var Colors;

(function (Colors) {
  Colors["LIGHTER_GRAY"] = "#D0D0D0";
  Colors["LIGHT_GRAY"] = "#BDBDBD";
  Colors["GRAY"] = "#666666";
  Colors["DARK_GRAY"] = "#222222";
  Colors["DARKER_GRAY"] = "#0C0C0C";
  Colors["OFF_BLACK"] = "#060606";
  Colors["BLACK"] = "#000000";
  Colors["BLUE"] = "#00769B";
  Colors["PALE_BLUE"] = "#004E75";
  Colors["GREEN"] = "#0F8A42";
  Colors["RED"] = "#C03737";
  Colors["LIGHT_BROWN"] = "#D6AE24";
  Colors["BROWN"] = "#A66F1C";
})(Colors || (Colors = {}));

const C_0 = 0.2;
const C_d = 0.1;
const L_0 = 0.2;
const L_d = 0.1;

const colorForBucket = t => {
  const x = (0, _utils.triangle)(30.0 * t);
  const H = 360.0 * (0.9 * t);
  const C = C_0 + C_d * x;
  const L = L_0 - L_d * x;
  return _color.Color.fromLumaChromaHue(L, C, H);
};

const colorForBucketGLSL = `
  vec3 colorForBucket(float t) {
    float x = triangle(30.0 * t);
    float H = 360.0 * (0.9 * t);
    float C = ${C_0.toFixed(1)} + ${C_d.toFixed(1)} * x;
    float L = ${L_0.toFixed(1)} - ${L_d.toFixed(1)} * x;
    return hcl2rgb(H, C, L);
  }
`;
const darkTheme = {
  fgPrimaryColor: Colors.LIGHTER_GRAY,
  fgSecondaryColor: Colors.GRAY,
  bgPrimaryColor: Colors.OFF_BLACK,
  bgSecondaryColor: Colors.DARKER_GRAY,
  altFgPrimaryColor: Colors.LIGHTER_GRAY,
  altFgSecondaryColor: Colors.GRAY,
  altBgPrimaryColor: Colors.BLACK,
  altBgSecondaryColor: Colors.DARKER_GRAY,
  selectionPrimaryColor: Colors.BLUE,
  selectionSecondaryColor: Colors.PALE_BLUE,
  weightColor: Colors.GREEN,
  searchMatchTextColor: Colors.DARKER_GRAY,
  searchMatchPrimaryColor: Colors.BROWN,
  searchMatchSecondaryColor: Colors.LIGHT_BROWN,
  positive: Colors.GREEN,
  negative: Colors.RED,
  colorForBucket,
  colorForBucketGLSL
};
exports.darkTheme = darkTheme;
},{"../../lib/color":"../src/lib/color.ts","../../lib/utils":"../src/lib/utils.ts"}],"../src/views/themes/light-theme.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lightTheme = void 0;

var _color = require("../../lib/color");

var _utils = require("../../lib/utils");

// These colors are intentionally not exported from this file, because these
// colors are theme specific, and we want all color values to come from the
// active theme.
var Colors;

(function (Colors) {
  Colors["WHITE"] = "#FFFFFF";
  Colors["OFF_WHITE"] = "#F6F6F6";
  Colors["LIGHT_GRAY"] = "#BDBDBD";
  Colors["GRAY"] = "#666666";
  Colors["DARK_GRAY"] = "#222222";
  Colors["OFF_BLACK"] = "#111111";
  Colors["BLACK"] = "#000000";
  Colors["DARK_BLUE"] = "#2F80ED";
  Colors["PALE_DARK_BLUE"] = "#8EB7ED";
  Colors["GREEN"] = "#6FCF97";
  Colors["RED"] = "#E66B6B";
  Colors["YELLOW"] = "#FEDC62";
  Colors["ORANGE"] = "#FFAC02";
})(Colors || (Colors = {}));

const C_0 = 0.25;
const C_d = 0.2;
const L_0 = 0.8;
const L_d = 0.15;

const colorForBucket = t => {
  const x = (0, _utils.triangle)(30.0 * t);
  const H = 360.0 * (0.9 * t);
  const C = C_0 + C_d * x;
  const L = L_0 - L_d * x;
  return _color.Color.fromLumaChromaHue(L, C, H);
};

const colorForBucketGLSL = `
  vec3 colorForBucket(float t) {
    float x = triangle(30.0 * t);
    float H = 360.0 * (0.9 * t);
    float C = ${C_0.toFixed(1)} + ${C_d.toFixed(1)} * x;
    float L = ${L_0.toFixed(1)} - ${L_d.toFixed(1)} * x;
    return hcl2rgb(H, C, L);
  }
`;
const lightTheme = {
  fgPrimaryColor: Colors.BLACK,
  fgSecondaryColor: Colors.LIGHT_GRAY,
  bgPrimaryColor: Colors.WHITE,
  bgSecondaryColor: Colors.OFF_WHITE,
  altFgPrimaryColor: Colors.WHITE,
  altFgSecondaryColor: Colors.LIGHT_GRAY,
  altBgPrimaryColor: Colors.BLACK,
  altBgSecondaryColor: Colors.DARK_GRAY,
  selectionPrimaryColor: Colors.DARK_BLUE,
  selectionSecondaryColor: Colors.PALE_DARK_BLUE,
  weightColor: Colors.GREEN,
  searchMatchTextColor: Colors.BLACK,
  searchMatchPrimaryColor: Colors.ORANGE,
  searchMatchSecondaryColor: Colors.YELLOW,
  positive: Colors.GREEN,
  negative: Colors.RED,
  colorForBucket,
  colorForBucketGLSL
};
exports.lightTheme = lightTheme;
},{"../../lib/color":"../src/lib/color.ts","../../lib/utils":"../src/lib/utils.ts"}],"../src/views/themes/theme.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTheme = useTheme;
exports.withTheme = withTheme;
exports.colorSchemeToString = colorSchemeToString;
exports.ThemeProvider = ThemeProvider;
exports.ThemeContext = void 0;

var _preact = require("preact");

var _hooks = require("preact/hooks");

var _colorScheme = require("../../app-state/color-scheme");

var _atom = require("../../lib/atom");

var _utils = require("../../lib/utils");

var _darkTheme = require("./dark-theme");

var _lightTheme = require("./light-theme");

const ThemeContext = (0, _preact.createContext)(_lightTheme.lightTheme);
exports.ThemeContext = ThemeContext;

function useTheme() {
  return (0, _hooks.useContext)(ThemeContext);
}

function withTheme(cb) {
  return (0, _utils.memoizeByReference)(cb);
}

function matchMediaDarkColorScheme() {
  return matchMedia('(prefers-color-scheme: dark)');
}

function colorSchemeToString(scheme) {
  switch (scheme) {
    case _colorScheme.ColorScheme.SYSTEM:
      {
        return 'System';
      }

    case _colorScheme.ColorScheme.DARK:
      {
        return 'Dark';
      }

    case _colorScheme.ColorScheme.LIGHT:
      {
        return 'Light';
      }
  }
}

function getTheme(colorScheme, systemPrefersDarkMode) {
  switch (colorScheme) {
    case _colorScheme.ColorScheme.SYSTEM:
      {
        return systemPrefersDarkMode ? _darkTheme.darkTheme : _lightTheme.lightTheme;
      }

    case _colorScheme.ColorScheme.DARK:
      {
        return _darkTheme.darkTheme;
      }

    case _colorScheme.ColorScheme.LIGHT:
      {
        return _lightTheme.lightTheme;
      }
  }
}

function ThemeProvider(props) {
  const [systemPrefersDarkMode, setSystemPrefersDarkMode] = (0, _hooks.useState)(() => matchMediaDarkColorScheme().matches);
  const matchMediaListener = (0, _hooks.useCallback)(event => {
    setSystemPrefersDarkMode(event.matches);
  }, [setSystemPrefersDarkMode]);
  (0, _hooks.useEffect)(() => {
    const media = matchMediaDarkColorScheme();
    media.addEventListener('change', matchMediaListener);
    return () => {
      media.removeEventListener('change', matchMediaListener);
    };
  }, [matchMediaListener]);
  const colorScheme = (0, _atom.useAtom)(_colorScheme.colorSchemeAtom);
  const theme = getTheme(colorScheme, systemPrefersDarkMode);
  return (0, _preact.h)(ThemeContext.Provider, {
    value: theme,
    children: props.children
  });
}
},{"preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","../../app-state/color-scheme":"../src/app-state/color-scheme.ts","../../lib/atom":"../src/lib/atom.ts","../../lib/utils":"../src/lib/utils.ts","./dark-theme":"../src/views/themes/dark-theme.ts","./light-theme":"../src/views/themes/light-theme.ts"}],"../node_modules/css-in-js-utils/lib/isPrefixedValue.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isPrefixedValue;
var regex = /-webkit-|-moz-|-ms-/;

function isPrefixedValue(value) {
  return typeof value === 'string' && regex.test(value);
}
module.exports = exports['default'];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/calc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = calc;

var _isPrefixedValue = require("css-in-js-utils/lib/isPrefixedValue");

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prefixes = ["-webkit-", "-moz-", ""];
function calc(property, value) {
  if (typeof value === "string" && !(0, _isPrefixedValue2.default)(value) && value.indexOf("calc(") > -1) {
    return prefixes.map(function (prefix) {
      return value.replace(/calc\(/g, prefix + "calc(");
    });
  }
}
module.exports = exports["default"];
},{"css-in-js-utils/lib/isPrefixedValue":"../node_modules/css-in-js-utils/lib/isPrefixedValue.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/crossFade.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = crossFade;

var _isPrefixedValue = require("css-in-js-utils/lib/isPrefixedValue");

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// http://caniuse.com/#search=cross-fade
var prefixes = ["-webkit-", ""];
function crossFade(property, value) {
  if (typeof value === "string" && !(0, _isPrefixedValue2.default)(value) && value.indexOf("cross-fade(") > -1) {
    return prefixes.map(function (prefix) {
      return value.replace(/cross-fade\(/g, prefix + "cross-fade(");
    });
  }
}
module.exports = exports["default"];
},{"css-in-js-utils/lib/isPrefixedValue":"../node_modules/css-in-js-utils/lib/isPrefixedValue.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/cursor.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cursor;
var prefixes = ["-webkit-", "-moz-", ""];

var values = {
  "zoom-in": true,
  "zoom-out": true,
  grab: true,
  grabbing: true
};

function cursor(property, value) {
  if (property === "cursor" && values.hasOwnProperty(value)) {
    return prefixes.map(function (prefix) {
      return prefix + value;
    });
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/filter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = filter;

var _isPrefixedValue = require("css-in-js-utils/lib/isPrefixedValue");

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// http://caniuse.com/#feat=css-filter-function
var prefixes = ["-webkit-", ""];
function filter(property, value) {
  if (typeof value === "string" && !(0, _isPrefixedValue2.default)(value) && value.indexOf("filter(") > -1) {
    return prefixes.map(function (prefix) {
      return value.replace(/filter\(/g, prefix + "filter(");
    });
  }
}
module.exports = exports["default"];
},{"css-in-js-utils/lib/isPrefixedValue":"../node_modules/css-in-js-utils/lib/isPrefixedValue.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/flex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flex;
var values = {
  flex: ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex", "flex"],
  "inline-flex": ["-webkit-inline-box", "-moz-inline-box", "-ms-inline-flexbox", "-webkit-inline-flex", "inline-flex"]
};

function flex(property, value) {
  if (property === "display" && values.hasOwnProperty(value)) {
    return values[value];
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/flexboxIE.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flexboxIE;
var alternativeValues = {
  "space-around": "distribute",
  "space-between": "justify",
  "flex-start": "start",
  "flex-end": "end"
};
var alternativeProps = {
  alignContent: "msFlexLinePack",
  alignSelf: "msFlexItemAlign",
  alignItems: "msFlexAlign",
  justifyContent: "msFlexPack",
  order: "msFlexOrder",
  flexGrow: "msFlexPositive",
  flexShrink: "msFlexNegative",
  flexBasis: "msFlexPreferredSize"
};

function flexboxIE(property, value, style) {
  if (alternativeProps.hasOwnProperty(property)) {
    style[alternativeProps[property]] = alternativeValues[value] || value;
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/flexboxOld.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flexboxOld;
var alternativeValues = {
  "space-around": "justify",
  "space-between": "justify",
  "flex-start": "start",
  "flex-end": "end",
  "wrap-reverse": "multiple",
  wrap: "multiple"
};

var alternativeProps = {
  alignItems: "WebkitBoxAlign",
  justifyContent: "WebkitBoxPack",
  flexWrap: "WebkitBoxLines"
};

function flexboxOld(property, value, style) {
  if (property === "flexDirection" && typeof value === "string") {
    if (value.indexOf("column") > -1) {
      style.WebkitBoxOrient = "vertical";
    } else {
      style.WebkitBoxOrient = "horizontal";
    }
    if (value.indexOf("reverse") > -1) {
      style.WebkitBoxDirection = "reverse";
    } else {
      style.WebkitBoxDirection = "normal";
    }
  }
  if (alternativeProps.hasOwnProperty(property)) {
    style[alternativeProps[property]] = alternativeValues[value] || value;
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/gradient.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = gradient;

var _isPrefixedValue = require("css-in-js-utils/lib/isPrefixedValue");

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prefixes = ["-webkit-", "-moz-", ""];

var values = /linear-gradient|radial-gradient|repeating-linear-gradient|repeating-radial-gradient/;

function gradient(property, value) {
  if (typeof value === "string" && !(0, _isPrefixedValue2.default)(value) && values.test(value)) {
    return prefixes.map(function (prefix) {
      return prefix + value;
    });
  }
}
module.exports = exports["default"];
},{"css-in-js-utils/lib/isPrefixedValue":"../node_modules/css-in-js-utils/lib/isPrefixedValue.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/imageSet.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = imageSet;

var _isPrefixedValue = require("css-in-js-utils/lib/isPrefixedValue");

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// http://caniuse.com/#feat=css-image-set
var prefixes = ["-webkit-", ""];
function imageSet(property, value) {
  if (typeof value === "string" && !(0, _isPrefixedValue2.default)(value) && value.indexOf("image-set(") > -1) {
    return prefixes.map(function (prefix) {
      return value.replace(/image-set\(/g, prefix + "image-set(");
    });
  }
}
module.exports = exports["default"];
},{"css-in-js-utils/lib/isPrefixedValue":"../node_modules/css-in-js-utils/lib/isPrefixedValue.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/position.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = position;
function position(property, value) {
  if (property === "position" && value === "sticky") {
    return ["-webkit-sticky", "sticky"];
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/sizing.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sizing;
var prefixes = ["-webkit-", "-moz-", ""];

var properties = {
  maxHeight: true,
  maxWidth: true,
  width: true,
  height: true,
  columnWidth: true,
  minWidth: true,
  minHeight: true
};
var values = {
  "min-content": true,
  "max-content": true,
  "fill-available": true,
  "fit-content": true,
  "contain-floats": true
};

function sizing(property, value) {
  if (properties.hasOwnProperty(property) && values.hasOwnProperty(value)) {
    return prefixes.map(function (prefix) {
      return prefix + value;
    });
  }
}
module.exports = exports["default"];
},{}],"../node_modules/hyphenate-style-name/index.js":[function(require,module,exports) {
'use strict';

var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var cache = {};

function hyphenateStyleName(string) {
    return string in cache
    ? cache[string]
    : cache[string] = string
      .replace(uppercasePattern, '-$&')
      .toLowerCase()
      .replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;

},{}],"../node_modules/css-in-js-utils/lib/hyphenateProperty.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hyphenateProperty;

var _hyphenateStyleName = require('hyphenate-style-name');

var _hyphenateStyleName2 = _interopRequireDefault(_hyphenateStyleName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hyphenateProperty(property) {
  return (0, _hyphenateStyleName2.default)(property);
}
module.exports = exports['default'];
},{"hyphenate-style-name":"../node_modules/hyphenate-style-name/index.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/capitalizeString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = capitalizeString;
function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/transition.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transition;

var _hyphenateProperty = require("css-in-js-utils/lib/hyphenateProperty");

var _hyphenateProperty2 = _interopRequireDefault(_hyphenateProperty);

var _isPrefixedValue = require("css-in-js-utils/lib/isPrefixedValue");

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

var _capitalizeString = require("../../utils/capitalizeString");

var _capitalizeString2 = _interopRequireDefault(_capitalizeString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var properties = {
  transition: true,
  transitionProperty: true,
  WebkitTransition: true,
  WebkitTransitionProperty: true,
  MozTransition: true,
  MozTransitionProperty: true
};


var prefixMapping = {
  Webkit: "-webkit-",
  Moz: "-moz-",
  ms: "-ms-"
};

function prefixValue(value, propertyPrefixMap) {
  if ((0, _isPrefixedValue2.default)(value)) {
    return value;
  }

  // only split multi values, not cubic beziers
  var multipleValues = value.split(/,(?![^()]*(?:\([^()]*\))?\))/g);

  for (var i = 0, len = multipleValues.length; i < len; ++i) {
    var singleValue = multipleValues[i];
    var values = [singleValue];
    for (var property in propertyPrefixMap) {
      var dashCaseProperty = (0, _hyphenateProperty2.default)(property);

      if (singleValue.indexOf(dashCaseProperty) > -1 && dashCaseProperty !== "order") {
        var prefixes = propertyPrefixMap[property];
        for (var j = 0, pLen = prefixes.length; j < pLen; ++j) {
          // join all prefixes and create a new value
          values.unshift(singleValue.replace(dashCaseProperty, prefixMapping[prefixes[j]] + dashCaseProperty));
        }
      }
    }

    multipleValues[i] = values.join(",");
  }

  return multipleValues.join(",");
}

function transition(property, value, style, propertyPrefixMap) {
  // also check for already prefixed transitions
  if (typeof value === "string" && properties.hasOwnProperty(property)) {
    var outputValue = prefixValue(value, propertyPrefixMap);
    // if the property is already prefixed
    var webkitOutput = outputValue.split(/,(?![^()]*(?:\([^()]*\))?\))/g).filter(function (val) {
      return !/-moz-|-ms-/.test(val);
    }).join(",");

    if (property.indexOf("Webkit") > -1) {
      return webkitOutput;
    }

    var mozOutput = outputValue.split(/,(?![^()]*(?:\([^()]*\))?\))/g).filter(function (val) {
      return !/-webkit-|-ms-/.test(val);
    }).join(",");

    if (property.indexOf("Moz") > -1) {
      return mozOutput;
    }

    style["Webkit" + (0, _capitalizeString2.default)(property)] = webkitOutput;
    style["Moz" + (0, _capitalizeString2.default)(property)] = mozOutput;
    return outputValue;
  }
}
module.exports = exports["default"];
},{"css-in-js-utils/lib/hyphenateProperty":"../node_modules/css-in-js-utils/lib/hyphenateProperty.js","css-in-js-utils/lib/isPrefixedValue":"../node_modules/css-in-js-utils/lib/isPrefixedValue.js","../../utils/capitalizeString":"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/capitalizeString.js"}],"../node_modules/string-hash/index.js":[function(require,module,exports) {
"use strict";

function hash(str) {
  var hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

module.exports = hash;

},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/prefixProperty.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prefixProperty;

var _capitalizeString = require("./capitalizeString");

var _capitalizeString2 = _interopRequireDefault(_capitalizeString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prefixProperty(prefixProperties, property, style) {
  if (prefixProperties.hasOwnProperty(property)) {
    var newStyle = {};
    var requiredPrefixes = prefixProperties[property];
    var capitalizedProperty = (0, _capitalizeString2.default)(property);
    var keys = Object.keys(style);
    for (var i = 0; i < keys.length; i++) {
      var styleProperty = keys[i];
      if (styleProperty === property) {
        for (var j = 0; j < requiredPrefixes.length; j++) {
          newStyle[requiredPrefixes[j] + capitalizedProperty] = style[property];
        }
      }
      newStyle[styleProperty] = style[styleProperty];
    }
    return newStyle;
  }
  return style;
}
module.exports = exports["default"];
},{"./capitalizeString":"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/capitalizeString.js"}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/prefixValue.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prefixValue;
function prefixValue(plugins, property, value, style, metaData) {
  for (var i = 0, len = plugins.length; i < len; ++i) {
    var processedValue = plugins[i](property, value, style, metaData);

    // we can stop processing if a value is returned
    // as all plugin criteria are unique
    if (processedValue) {
      return processedValue;
    }
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/addNewValuesOnly.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addNewValuesOnly;
function addIfNew(list, value) {
  if (list.indexOf(value) === -1) {
    list.push(value);
  }
}

function addNewValuesOnly(list, values) {
  if (Array.isArray(values)) {
    for (var i = 0, len = values.length; i < len; ++i) {
      addIfNew(list, values[i]);
    }
  } else {
    addIfNew(list, values);
  }
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/isObject.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isObject;
function isObject(value) {
  return value instanceof Object && !Array.isArray(value);
}
module.exports = exports["default"];
},{}],"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/createPrefixer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createPrefixer;

var _prefixProperty = require("../utils/prefixProperty");

var _prefixProperty2 = _interopRequireDefault(_prefixProperty);

var _prefixValue = require("../utils/prefixValue");

var _prefixValue2 = _interopRequireDefault(_prefixValue);

var _addNewValuesOnly = require("../utils/addNewValuesOnly");

var _addNewValuesOnly2 = _interopRequireDefault(_addNewValuesOnly);

var _isObject = require("../utils/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPrefixer(_ref) {
  var prefixMap = _ref.prefixMap,
      plugins = _ref.plugins;

  function prefixAll(style) {
    for (var property in style) {
      var value = style[property];

      // handle nested objects
      if ((0, _isObject2.default)(value)) {
        style[property] = prefixAll(value);
        // handle array values
      } else if (Array.isArray(value)) {
        var combinedValue = [];

        for (var i = 0, len = value.length; i < len; ++i) {
          var processedValue = (0, _prefixValue2.default)(plugins, property, value[i], style, prefixMap);
          (0, _addNewValuesOnly2.default)(combinedValue, processedValue || value[i]);
        }

        // only modify the value if it was touched
        // by any plugin to prevent unnecessary mutations
        if (combinedValue.length > 0) {
          style[property] = combinedValue;
        }
      } else {
        var _processedValue = (0, _prefixValue2.default)(plugins, property, value, style, prefixMap);

        // only modify the value if it was touched
        // by any plugin to prevent unnecessary mutations
        if (_processedValue) {
          style[property] = _processedValue;
        }

        style = (0, _prefixProperty2.default)(prefixMap, property, style);
      }
    }

    return style;
  }

  return prefixAll;
}
module.exports = exports["default"];
},{"../utils/prefixProperty":"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/prefixProperty.js","../utils/prefixValue":"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/prefixValue.js","../utils/addNewValuesOnly":"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/addNewValuesOnly.js","../utils/isObject":"../node_modules/aphrodite/node_modules/inline-style-prefixer/utils/isObject.js"}],"../node_modules/asap/browser-raw.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

},{}],"../node_modules/asap/browser-asap.js":[function(require,module,exports) {
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":"../node_modules/asap/browser-raw.js"}],"../node_modules/aphrodite/es/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flushToStyleTag = exports.minify = exports.css = exports.StyleSheetTestUtils = exports.StyleSheetServer = exports.StyleSheet = void 0;

var _calc = _interopRequireDefault(require("inline-style-prefixer/static/plugins/calc"));

var _crossFade = _interopRequireDefault(require("inline-style-prefixer/static/plugins/crossFade"));

var _cursor = _interopRequireDefault(require("inline-style-prefixer/static/plugins/cursor"));

var _filter = _interopRequireDefault(require("inline-style-prefixer/static/plugins/filter"));

var _flex = _interopRequireDefault(require("inline-style-prefixer/static/plugins/flex"));

var _flexboxIE = _interopRequireDefault(require("inline-style-prefixer/static/plugins/flexboxIE"));

var _flexboxOld = _interopRequireDefault(require("inline-style-prefixer/static/plugins/flexboxOld"));

var _gradient = _interopRequireDefault(require("inline-style-prefixer/static/plugins/gradient"));

var _imageSet = _interopRequireDefault(require("inline-style-prefixer/static/plugins/imageSet"));

var _position = _interopRequireDefault(require("inline-style-prefixer/static/plugins/position"));

var _sizing = _interopRequireDefault(require("inline-style-prefixer/static/plugins/sizing"));

var _transition = _interopRequireDefault(require("inline-style-prefixer/static/plugins/transition"));

var _stringHash = _interopRequireDefault(require("string-hash"));

var _createPrefixer = _interopRequireDefault(require("inline-style-prefixer/static/createPrefixer"));

var _asap = _interopRequireDefault(require("asap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var w = ["Webkit"];
var m = ["Moz"];
var ms = ["ms"];
var wm = ["Webkit", "Moz"];
var wms = ["Webkit", "ms"];
var wmms = ["Webkit", "Moz", "ms"];
var staticPrefixData = {
  plugins: [_calc.default, _crossFade.default, _cursor.default, _filter.default, _flex.default, _flexboxIE.default, _flexboxOld.default, _gradient.default, _imageSet.default, _position.default, _sizing.default, _transition.default],
  prefixMap: {
    "transform": wms,
    "transformOrigin": wms,
    "transformOriginX": wms,
    "transformOriginY": wms,
    "backfaceVisibility": w,
    "perspective": w,
    "perspectiveOrigin": w,
    "transformStyle": w,
    "transformOriginZ": w,
    "animation": w,
    "animationDelay": w,
    "animationDirection": w,
    "animationFillMode": w,
    "animationDuration": w,
    "animationIterationCount": w,
    "animationName": w,
    "animationPlayState": w,
    "animationTimingFunction": w,
    "appearance": wm,
    "userSelect": wmms,
    "fontKerning": w,
    "textEmphasisPosition": w,
    "textEmphasis": w,
    "textEmphasisStyle": w,
    "textEmphasisColor": w,
    "boxDecorationBreak": w,
    "clipPath": w,
    "maskImage": w,
    "maskMode": w,
    "maskRepeat": w,
    "maskPosition": w,
    "maskClip": w,
    "maskOrigin": w,
    "maskSize": w,
    "maskComposite": w,
    "mask": w,
    "maskBorderSource": w,
    "maskBorderMode": w,
    "maskBorderSlice": w,
    "maskBorderWidth": w,
    "maskBorderOutset": w,
    "maskBorderRepeat": w,
    "maskBorder": w,
    "maskType": w,
    "textDecorationStyle": wm,
    "textDecorationSkip": wm,
    "textDecorationLine": wm,
    "textDecorationColor": wm,
    "filter": w,
    "fontFeatureSettings": wm,
    "breakAfter": wmms,
    "breakBefore": wmms,
    "breakInside": wmms,
    "columnCount": wm,
    "columnFill": wm,
    "columnGap": wm,
    "columnRule": wm,
    "columnRuleColor": wm,
    "columnRuleStyle": wm,
    "columnRuleWidth": wm,
    "columns": wm,
    "columnSpan": wm,
    "columnWidth": wm,
    "writingMode": wms,
    "flex": wms,
    "flexBasis": w,
    "flexDirection": wms,
    "flexGrow": w,
    "flexFlow": wms,
    "flexShrink": w,
    "flexWrap": wms,
    "alignContent": w,
    "alignItems": w,
    "alignSelf": w,
    "justifyContent": w,
    "order": w,
    "transitionDelay": w,
    "transitionDuration": w,
    "transitionProperty": w,
    "transitionTimingFunction": w,
    "backdropFilter": w,
    "scrollSnapType": wms,
    "scrollSnapPointsX": wms,
    "scrollSnapPointsY": wms,
    "scrollSnapDestination": wms,
    "scrollSnapCoordinate": wms,
    "shapeImageThreshold": w,
    "shapeImageMargin": w,
    "shapeImageOutside": w,
    "hyphens": wmms,
    "flowInto": wms,
    "flowFrom": wms,
    "regionFragment": wms,
    "boxSizing": m,
    "textAlignLast": m,
    "tabSize": m,
    "wrapFlow": ms,
    "wrapThrough": ms,
    "wrapMargin": ms,
    "touchAction": ms,
    "gridTemplateColumns": ms,
    "gridTemplateRows": ms,
    "gridTemplateAreas": ms,
    "gridTemplate": ms,
    "gridAutoColumns": ms,
    "gridAutoRows": ms,
    "gridAutoFlow": ms,
    "grid": ms,
    "gridRowStart": ms,
    "gridColumnStart": ms,
    "gridRowEnd": ms,
    "gridRow": ms,
    "gridColumn": ms,
    "gridColumnEnd": ms,
    "gridColumnGap": ms,
    "gridRowGap": ms,
    "gridArea": ms,
    "gridGap": ms,
    "textSizeAdjust": wms,
    "borderImage": w,
    "borderImageOutset": w,
    "borderImageRepeat": w,
    "borderImageSlice": w,
    "borderImageSource": w,
    "borderImageWidth": w
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var MAP_EXISTS = typeof Map !== 'undefined';

var OrderedElements = function () {
  /* ::
  elements: {[string]: any};
  keyOrder: string[];
  */
  function OrderedElements() {
    _classCallCheck(this, OrderedElements);

    this.elements = {};
    this.keyOrder = [];
  }

  _createClass(OrderedElements, [{
    key: 'forEach',
    value: function () {
      function forEach(callback
      /* : (string, any) => void */
      ) {
        for (var i = 0; i < this.keyOrder.length; i++) {
          // (value, key) to match Map's API
          callback(this.elements[this.keyOrder[i]], this.keyOrder[i]);
        }
      }

      return forEach;
    }()
  }, {
    key: 'set',
    value: function () {
      function set(key
      /* : string */
      , value
      /* : any */
      , shouldReorder
      /* : ?boolean */
      ) {
        if (!this.elements.hasOwnProperty(key)) {
          this.keyOrder.push(key);
        } else if (shouldReorder) {
          var index = this.keyOrder.indexOf(key);
          this.keyOrder.splice(index, 1);
          this.keyOrder.push(key);
        }

        if (value == null) {
          this.elements[key] = value;
          return;
        }

        if (MAP_EXISTS && value instanceof Map || value instanceof OrderedElements) {
          // We have found a nested Map, so we need to recurse so that all
          // of the nested objects and Maps are merged properly.
          var nested = this.elements.hasOwnProperty(key) ? this.elements[key] : new OrderedElements();
          value.forEach(function (value, key) {
            nested.set(key, value, shouldReorder);
          });
          this.elements[key] = nested;
          return;
        }

        if (!Array.isArray(value) && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
          // We have found a nested object, so we need to recurse so that all
          // of the nested objects and Maps are merged properly.
          var _nested = this.elements.hasOwnProperty(key) ? this.elements[key] : new OrderedElements();

          var keys = Object.keys(value);

          for (var i = 0; i < keys.length; i += 1) {
            _nested.set(keys[i], value[keys[i]], shouldReorder);
          }

          this.elements[key] = _nested;
          return;
        }

        this.elements[key] = value;
      }

      return set;
    }()
  }, {
    key: 'get',
    value: function () {
      function get(key
      /* : string */
      )
      /* : any */
      {
        return this.elements[key];
      }

      return get;
    }()
  }, {
    key: 'has',
    value: function () {
      function has(key
      /* : string */
      )
      /* : boolean */
      {
        return this.elements.hasOwnProperty(key);
      }

      return has;
    }()
  }, {
    key: 'addStyleType',
    value: function () {
      function addStyleType(styleType
      /* : any */
      )
      /* : void */
      {
        var _this = this;

        if (MAP_EXISTS && styleType instanceof Map || styleType instanceof OrderedElements) {
          styleType.forEach(function (value, key) {
            _this.set(key, value, true);
          });
        } else {
          var keys = Object.keys(styleType);

          for (var i = 0; i < keys.length; i++) {
            this.set(keys[i], styleType[keys[i]], true);
          }
        }
      }

      return addStyleType;
    }()
  }]);

  return OrderedElements;
}();
/* ::
type ObjectMap = { [id:string]: any };
*/


var UPPERCASE_RE = /([A-Z])/g;

var UPPERCASE_RE_TO_KEBAB = function UPPERCASE_RE_TO_KEBAB(match
/* : string */
) {
  return (
    /* : string */
    '-' + String(match.toLowerCase())
  );
};

var kebabifyStyleName = function kebabifyStyleName(string
/* : string */
)
/* : string */
{
  var result = string.replace(UPPERCASE_RE, UPPERCASE_RE_TO_KEBAB);

  if (result[0] === 'm' && result[1] === 's' && result[2] === '-') {
    return '-' + String(result);
  }

  return result;
};
/**
 * CSS properties which accept numbers but are not in units of "px".
 * Taken from React's CSSProperty.js
 */


var isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridColumn: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};
/**
 * Taken from React's CSSProperty.js
 *
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */

function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}
/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 * Taken from React's CSSProperty.js
 */


var prefixes = ['Webkit', 'ms', 'Moz', 'O']; // Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
// Taken from React's CSSProperty.js

Object.keys(isUnitlessNumber).forEach(function (prop) {
  prefixes.forEach(function (prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

var stringifyValue = function stringifyValue(key
/* : string */
, prop
/* : any */
)
/* : string */
{
  if (typeof prop === "number") {
    if (isUnitlessNumber[key]) {
      return "" + prop;
    } else {
      return prop + "px";
    }
  } else {
    return '' + prop;
  }
};

var stringifyAndImportantifyValue = function stringifyAndImportantifyValue(key
/* : string */
, prop
/* : any */
) {
  return (
    /* : string */
    importantify(stringifyValue(key, prop))
  );
}; // Turn a string into a hash string of base-36 values (using letters and numbers)
// eslint-disable-next-line no-unused-vars


var hashString = function hashString(string
/* : string */
, key
/* : ?string */
) {
  return (
    /* string */
    (0, _stringHash.default)(string).toString(36)
  );
}; // Hash a javascript object using JSON.stringify. This is very fast, about 3
// microseconds on my computer for a sample object:
// http://jsperf.com/test-hashfnv32a-hash/5
//
// Note that this uses JSON.stringify to stringify the objects so in order for
// this to produce consistent hashes browsers need to have a consistent
// ordering of objects. Ben Alpert says that Facebook depends on this, so we
// can probably depend on this too.


var hashObject = function hashObject(object
/* : ObjectMap */
) {
  return (
    /* : string */
    hashString(JSON.stringify(object))
  );
}; // Given a single style value string like the "b" from "a: b;", adds !important
// to generate "b !important".


var importantify = function importantify(string
/* : string */
) {
  return (
    /* : string */
    // Bracket string character access is very fast, and in the default case we
    // normally don't expect there to be "!important" at the end of the string
    // so we can use this simple check to take an optimized path. If there
    // happens to be a "!" in this position, we follow up with a more thorough
    // check.
    string[string.length - 10] === '!' && string.slice(-11) === ' !important' ? string : String(string) + ' !important'
  );
};

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return Array.from(arr);
  }
}

var prefixAll = (0, _createPrefixer.default)(staticPrefixData);
/* ::
import type { SheetDefinition } from './index.js';
type StringHandlers = { [id:string]: Function };
type SelectorCallback = (selector: string) => string[];
export type SelectorHandler = (
    selector: string,
    baseSelector: string,
    callback: SelectorCallback
) => string[] | string | null;
*/

/**
 * `selectorHandlers` are functions which handle special selectors which act
 * differently than normal style definitions. These functions look at the
 * current selector and can generate CSS for the styles in their subtree by
 * calling the callback with a new selector.
 *
 * For example, when generating styles with a base selector of '.foo' and the
 * following styles object:
 *
 *   {
 *     ':nth-child(2n)': {
 *       ':hover': {
 *         color: 'red'
 *       }
 *     }
 *   }
 *
 * when we reach the ':hover' style, we would call our selector handlers like
 *
 *   handler(':hover', '.foo:nth-child(2n)', callback)
 *
 * Since our `pseudoSelectors` handles ':hover' styles, that handler would call
 * the callback like
 *
 *   callback('.foo:nth-child(2n):hover')
 *
 * to generate its subtree `{ color: 'red' }` styles with a
 * '.foo:nth-child(2n):hover' selector. The callback would return an array of CSS
 * rules like
 *
 *   ['.foo:nth-child(2n):hover{color:red !important;}']
 *
 * and the handler would then return that resulting CSS.
 *
 * `defaultSelectorHandlers` is the list of default handlers used in a call to
 * `generateCSS`.
 *
 * @name SelectorHandler
 * @function
 * @param {string} selector: The currently inspected selector. ':hover' in the
 *     example above.
 * @param {string} baseSelector: The selector of the parent styles.
 *     '.foo:nth-child(2n)' in the example above.
 * @param {function} generateSubtreeStyles: A function which can be called to
 *     generate CSS for the subtree of styles corresponding to the selector.
 *     Accepts a new baseSelector to use for generating those styles.
 * @returns {string[] | string | null} The generated CSS for this selector, or
 *     null if we don't handle this selector.
 */

var defaultSelectorHandlers
/* : SelectorHandler[] */
= [// Handle pseudo-selectors, like :hover and :nth-child(3n)
function () {
  function pseudoSelectors(selector, baseSelector, generateSubtreeStyles) {
    if (selector[0] !== ":") {
      return null;
    }

    return generateSubtreeStyles(baseSelector + selector);
  }

  return pseudoSelectors;
}(), // Handle media queries (or font-faces)
function () {
  function mediaQueries(selector, baseSelector, generateSubtreeStyles) {
    if (selector[0] !== "@") {
      return null;
    } // Generate the styles normally, and then wrap them in the media query.


    var generated = generateSubtreeStyles(baseSelector);
    return [String(selector) + '{' + String(generated.join('')) + '}'];
  }

  return mediaQueries;
}()];
/**
 * Generate CSS for a selector and some styles.
 *
 * This function handles the media queries and pseudo selectors that can be used
 * in aphrodite styles.
 *
 * @param {string} selector: A base CSS selector for the styles to be generated
 *     with.
 * @param {Object} styleTypes: A list of properties of the return type of
 *     StyleSheet.create, e.g. [styles.red, styles.blue].
 * @param {Array.<SelectorHandler>} selectorHandlers: A list of selector
 *     handlers to use for handling special selectors. See
 *     `defaultSelectorHandlers`.
 * @param stringHandlers: See `generateCSSRuleset`
 * @param useImportant: See `generateCSSRuleset`
 *
 * To actually generate the CSS special-construct-less styles are passed to
 * `generateCSSRuleset`.
 *
 * For instance, a call to
 *
 *     generateCSS(".foo", [{
 *       color: "red",
 *       "@media screen": {
 *         height: 20,
 *         ":hover": {
 *           backgroundColor: "black"
 *         }
 *       },
 *       ":active": {
 *         fontWeight: "bold"
 *       }
 *     }], defaultSelectorHandlers);
 *
 * with the default `selectorHandlers` will make 5 calls to
 * `generateCSSRuleset`:
 *
 *     generateCSSRuleset(".foo", { color: "red" }, ...)
 *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
 *     // These 2 will be wrapped in @media screen {}
 *     generateCSSRuleset(".foo", { height: 20 }, ...)
 *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
 */

var generateCSS = function generateCSS(selector
/* : string */
, styleTypes
/* : SheetDefinition[] */
, selectorHandlers
/* : SelectorHandler[] */
, stringHandlers
/* : StringHandlers */
, useImportant
/* : boolean */
)
/* : string[] */
{
  var merged = new OrderedElements();

  for (var i = 0; i < styleTypes.length; i++) {
    merged.addStyleType(styleTypes[i]);
  }

  var plainDeclarations = new OrderedElements();
  var generatedStyles = []; // TODO(emily): benchmark this to see if a plain for loop would be faster.

  merged.forEach(function (val, key) {
    // For each key, see if one of the selector handlers will handle these
    // styles.
    var foundHandler = selectorHandlers.some(function (handler) {
      var result = handler(key, selector, function (newSelector) {
        return generateCSS(newSelector, [val], selectorHandlers, stringHandlers, useImportant);
      });

      if (result != null) {
        // If the handler returned something, add it to the generated
        // CSS and stop looking for another handler.
        if (Array.isArray(result)) {
          generatedStyles.push.apply(generatedStyles, _toConsumableArray(result));
        } else {
          // eslint-disable-next-line
          console.warn('WARNING: Selector handlers should return an array of rules.' + 'Returning a string containing multiple rules is deprecated.', handler);
          generatedStyles.push('@media all {' + String(result) + '}');
        }

        return true;
      }
    }); // If none of the handlers handled it, add it to the list of plain
    // style declarations.

    if (!foundHandler) {
      plainDeclarations.set(key, val, true);
    }
  });
  var generatedRuleset = generateCSSRuleset(selector, plainDeclarations, stringHandlers, useImportant, selectorHandlers);

  if (generatedRuleset) {
    generatedStyles.unshift(generatedRuleset);
  }

  return generatedStyles;
};
/**
 * Helper method of generateCSSRuleset to facilitate custom handling of certain
 * CSS properties. Used for e.g. font families.
 *
 * See generateCSSRuleset for usage and documentation of paramater types.
 */


var runStringHandlers = function runStringHandlers(declarations
/* : OrderedElements */
, stringHandlers
/* : StringHandlers */
, selectorHandlers
/* : SelectorHandler[] */
)
/* : void */
{
  if (!stringHandlers) {
    return;
  }

  var stringHandlerKeys = Object.keys(stringHandlers);

  for (var i = 0; i < stringHandlerKeys.length; i++) {
    var key = stringHandlerKeys[i];

    if (declarations.has(key)) {
      // A declaration exists for this particular string handler, so we
      // need to let the string handler interpret the declaration first
      // before proceeding.
      //
      // TODO(emily): Pass in a callback which generates CSS, similar to
      // how our selector handlers work, instead of passing in
      // `selectorHandlers` and have them make calls to `generateCSS`
      // themselves. Right now, this is impractical because our string
      // handlers are very specialized and do complex things.
      declarations.set(key, stringHandlers[key](declarations.get(key), selectorHandlers), // Preserve order here, since we are really replacing an
      // unprocessed style with a processed style, not overriding an
      // earlier style
      false);
    }
  }
};

var transformRule = function transformRule(key
/* : string */
, value
/* : string */
, transformValue
/* : function */
) {
  return (
    /* : string */
    String(kebabifyStyleName(key)) + ':' + String(transformValue(key, value)) + ';'
  );
};

var arrayToObjectKeysReducer = function arrayToObjectKeysReducer(acc, val) {
  acc[val] = true;
  return acc;
};
/**
 * Generate a CSS ruleset with the selector and containing the declarations.
 *
 * This function assumes that the given declarations don't contain any special
 * children (such as media queries, pseudo-selectors, or descendant styles).
 *
 * Note that this method does not deal with nesting used for e.g.
 * psuedo-selectors or media queries. That responsibility is left to  the
 * `generateCSS` function.
 *
 * @param {string} selector: the selector associated with the ruleset
 * @param {Object} declarations: a map from camelCased CSS property name to CSS
 *     property value.
 * @param {Object.<string, function>} stringHandlers: a map from camelCased CSS
 *     property name to a function which will map the given value to the value
 *     that is output.
 * @param {bool} useImportant: A boolean saying whether to append "!important"
 *     to each of the CSS declarations.
 * @returns {string} A string of raw CSS.
 *
 * Examples:
 *
 *    generateCSSRuleset(".blah", { color: "red" })
 *    -> ".blah{color: red !important;}"
 *    generateCSSRuleset(".blah", { color: "red" }, {}, false)
 *    -> ".blah{color: red}"
 *    generateCSSRuleset(".blah", { color: "red" }, {color: c => c.toUpperCase})
 *    -> ".blah{color: RED}"
 *    generateCSSRuleset(".blah:hover", { color: "red" })
 *    -> ".blah:hover{color: red}"
 */


var generateCSSRuleset = function generateCSSRuleset(selector
/* : string */
, declarations
/* : OrderedElements */
, stringHandlers
/* : StringHandlers */
, useImportant
/* : boolean */
, selectorHandlers
/* : SelectorHandler[] */
)
/* : string */
{
  // Mutates declarations
  runStringHandlers(declarations, stringHandlers, selectorHandlers);
  var originalElements = Object.keys(declarations.elements).reduce(arrayToObjectKeysReducer, Object.create(null)); // NOTE(emily): This mutates handledDeclarations.elements.

  var prefixedElements = prefixAll(declarations.elements);
  var elementNames = Object.keys(prefixedElements);

  if (elementNames.length !== declarations.keyOrder.length) {
    // There are some prefixed values, so we need to figure out how to sort
    // them.
    //
    // Loop through prefixedElements, looking for anything that is not in
    // sortOrder, which means it was added by prefixAll. This means that we
    // need to figure out where it should appear in the sortOrder.
    for (var i = 0; i < elementNames.length; i++) {
      if (!originalElements[elementNames[i]]) {
        // This element is not in the sortOrder, which means it is a prefixed
        // value that was added by prefixAll. Let's try to figure out where it
        // goes.
        var originalStyle = void 0;

        if (elementNames[i][0] === 'W') {
          // This is a Webkit-prefixed style, like "WebkitTransition". Let's
          // find its original style's sort order.
          originalStyle = elementNames[i][6].toLowerCase() + elementNames[i].slice(7);
        } else if (elementNames[i][1] === 'o') {
          // This is a Moz-prefixed style, like "MozTransition". We check
          // the second character to avoid colliding with Ms-prefixed
          // styles. Let's find its original style's sort order.
          originalStyle = elementNames[i][3].toLowerCase() + elementNames[i].slice(4);
        } else {
          // if (elementNames[i][1] === 's') {
          // This is a Ms-prefixed style, like "MsTransition".
          originalStyle = elementNames[i][2].toLowerCase() + elementNames[i].slice(3);
        }

        if (originalStyle && originalElements[originalStyle]) {
          var originalIndex = declarations.keyOrder.indexOf(originalStyle);
          declarations.keyOrder.splice(originalIndex, 0, elementNames[i]);
        } else {
          // We don't know what the original style was, so sort it to
          // top. This can happen for styles that are added that don't
          // have the same base name as the original style.
          declarations.keyOrder.unshift(elementNames[i]);
        }
      }
    }
  }

  var transformValue = useImportant === false ? stringifyValue : stringifyAndImportantifyValue;
  var rules = [];

  for (var _i = 0; _i < declarations.keyOrder.length; _i++) {
    var key = declarations.keyOrder[_i];
    var value = prefixedElements[key];

    if (Array.isArray(value)) {
      // inline-style-prefixer returns an array when there should be
      // multiple rules for the same key. Here we flatten to multiple
      // pairs with the same key.
      for (var j = 0; j < value.length; j++) {
        rules.push(transformRule(key, value[j], transformValue));
      }
    } else {
      rules.push(transformRule(key, value, transformValue));
    }
  }

  if (rules.length) {
    return String(selector) + '{' + String(rules.join("")) + '}';
  } else {
    return "";
  }
};

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function _toConsumableArray$1(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return Array.from(arr);
  }
}
/* ::
import type { SheetDefinition, SheetDefinitions } from './index.js';
import type { MaybeSheetDefinition } from './exports.js';
import type { SelectorHandler } from './generate.js';
*/
// The current <style> tag we are inserting into, or null if we haven't
// inserted anything yet. We could find this each time using
// `document.querySelector("style[data-aphrodite"])`, but holding onto it is
// faster.


var styleTag
/* : ?HTMLStyleElement */
= null; // Inject a set of rules into a <style> tag in the head of the document. This
// will automatically create a style tag and then continue to use it for
// multiple injections. It will also use a style tag with the `data-aphrodite`
// tag on it if that exists in the DOM. This could be used for e.g. reusing the
// same style tag that server-side rendering inserts.

var injectStyleTag = function injectStyleTag(cssRules
/* : string[] */
) {
  if (styleTag == null) {
    // Try to find a style tag with the `data-aphrodite` attribute first.
    styleTag = document.querySelector("style[data-aphrodite]")
    /* : any */
    ; // If that doesn't work, generate a new style tag.

    if (styleTag == null) {
      // Taken from
      // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
      var head = document.head || document.getElementsByTagName('head')[0];
      styleTag = document.createElement('style');
      styleTag.type = 'text/css';
      styleTag.setAttribute("data-aphrodite", "");
      head.appendChild(styleTag);
    }
  }

  var sheet = styleTag.styleSheet || styleTag.sheet
  /* : any */
  ;

  if (sheet.insertRule) {
    var numRules = sheet.cssRules.length;
    cssRules.forEach(function (rule) {
      try {
        sheet.insertRule(rule, numRules);
        numRules += 1;
      } catch (e) {// The selector for this rule wasn't compatible with the browser
      }
    });
  } else {
    styleTag.innerText = (styleTag.innerText || '') + cssRules.join('');
  }
}; // Custom handlers for stringifying CSS values that have side effects
// (such as fontFamily, which can cause @font-face rules to be injected)


var stringHandlers = {
  // With fontFamily we look for objects that are passed in and interpret
  // them as @font-face rules that we need to inject. The value of fontFamily
  // can either be a string (as normal), an object (a single font face), or
  // an array of objects and strings.
  fontFamily: function () {
    function fontFamily(val) {
      if (Array.isArray(val)) {
        return val.map(fontFamily).join(",");
      } else if ((typeof val === 'undefined' ? 'undefined' : _typeof$1(val)) === "object") {
        injectStyleOnce(val.src, "@font-face", [val], false);
        return '"' + String(val.fontFamily) + '"';
      } else {
        return val;
      }
    }

    return fontFamily;
  }(),
  // With animationName we look for an object that contains keyframes and
  // inject them as an `@keyframes` block, returning a uniquely generated
  // name. The keyframes object should look like
  //  animationName: {
  //    from: {
  //      left: 0,
  //      top: 0,
  //    },
  //    '50%': {
  //      left: 15,
  //      top: 5,
  //    },
  //    to: {
  //      left: 20,
  //      top: 20,
  //    }
  //  }
  // TODO(emily): `stringHandlers` doesn't let us rename the key, so I have
  // to use `animationName` here. Improve that so we can call this
  // `animation` instead of `animationName`.
  animationName: function () {
    function animationName(val, selectorHandlers) {
      if (Array.isArray(val)) {
        return val.map(function (v) {
          return animationName(v, selectorHandlers);
        }).join(",");
      } else if ((typeof val === 'undefined' ? 'undefined' : _typeof$1(val)) === "object") {
        // Generate a unique name based on the hash of the object. We can't
        // just use the hash because the name can't start with a number.
        // TODO(emily): this probably makes debugging hard, allow a custom
        // name?
        var name = 'keyframe_' + String(hashObject(val)); // Since keyframes need 3 layers of nesting, we use `generateCSS` to
        // build the inner layers and wrap it in `@keyframes` ourselves.

        var finalVal = '@keyframes ' + name + '{'; // TODO see if we can find a way where checking for OrderedElements
        // here is not necessary. Alternatively, perhaps we should have a
        // utility method that can iterate over either a plain object, an
        // instance of OrderedElements, or a Map, and then use that here and
        // elsewhere.

        if (val instanceof OrderedElements) {
          val.forEach(function (valVal, valKey) {
            finalVal += generateCSS(valKey, [valVal], selectorHandlers, stringHandlers, false).join('');
          });
        } else {
          Object.keys(val).forEach(function (key) {
            finalVal += generateCSS(key, [val[key]], selectorHandlers, stringHandlers, false).join('');
          });
        }

        finalVal += '}';
        injectGeneratedCSSOnce(name, [finalVal]);
        return name;
      } else {
        return val;
      }
    }

    return animationName;
  }()
}; // This is a map from Aphrodite's generated class names to `true` (acting as a
// set of class names)

var alreadyInjected = {}; // This is the buffer of styles which have not yet been flushed.

var injectionBuffer
/* : string[] */
= []; // A flag to tell if we are already buffering styles. This could happen either
// because we scheduled a flush call already, so newly added styles will
// already be flushed, or because we are statically buffering on the server.

var isBuffering = false;

var injectGeneratedCSSOnce = function injectGeneratedCSSOnce(key, generatedCSS) {
  var _injectionBuffer;

  if (alreadyInjected[key]) {
    return;
  }

  if (!isBuffering) {
    // We should never be automatically buffering on the server (or any
    // place without a document), so guard against that.
    if (typeof document === "undefined") {
      throw new Error("Cannot automatically buffer without a document");
    } // If we're not already buffering, schedule a call to flush the
    // current styles.


    isBuffering = true;
    (0, _asap.default)(flushToStyleTag);
  }

  (_injectionBuffer = injectionBuffer).push.apply(_injectionBuffer, _toConsumableArray$1(generatedCSS));

  alreadyInjected[key] = true;
};

var injectStyleOnce = function injectStyleOnce(key
/* : string */
, selector
/* : string */
, definitions
/* : SheetDefinition[] */
, useImportant
/* : boolean */
) {
  var selectorHandlers
  /* : SelectorHandler[] */
  = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

  if (alreadyInjected[key]) {
    return;
  }

  var generated = generateCSS(selector, definitions, selectorHandlers, stringHandlers, useImportant);
  injectGeneratedCSSOnce(key, generated);
};

var reset = function reset() {
  injectionBuffer = [];
  alreadyInjected = {};
  isBuffering = false;
  styleTag = null;
};

var getBufferedStyles = function getBufferedStyles() {
  return injectionBuffer;
};

var startBuffering = function startBuffering() {
  if (isBuffering) {
    throw new Error("Cannot buffer while already buffering");
  }

  isBuffering = true;
};

var flushToArray = function flushToArray() {
  isBuffering = false;
  var ret = injectionBuffer;
  injectionBuffer = [];
  return ret;
};

var flushToString = function flushToString() {
  return flushToArray().join('');
};

var flushToStyleTag = function flushToStyleTag() {
  var cssRules = flushToArray();

  if (cssRules.length > 0) {
    injectStyleTag(cssRules);
  }
};

exports.flushToStyleTag = flushToStyleTag;

var getRenderedClassNames = function getRenderedClassNames() {
  return Object.keys(alreadyInjected);
};

var addRenderedClassNames = function addRenderedClassNames(classNames
/* : string[] */
) {
  classNames.forEach(function (className) {
    alreadyInjected[className] = true;
  });
};

var processStyleDefinitions = function processStyleDefinitions(styleDefinitions
/* : any[] */
, classNameBits
/* : string[] */
, definitionBits
/* : Object[] */
, length
/* : number */
)
/* : number */
{
  for (var i = 0; i < styleDefinitions.length; i += 1) {
    // Filter out falsy values from the input, to allow for
    // `css(a, test && c)`
    if (styleDefinitions[i]) {
      if (Array.isArray(styleDefinitions[i])) {
        // We've encountered an array, so let's recurse
        length += processStyleDefinitions(styleDefinitions[i], classNameBits, definitionBits, length);
      } else {
        classNameBits.push(styleDefinitions[i]._name);
        definitionBits.push(styleDefinitions[i]._definition);
        length += styleDefinitions[i]._len;
      }
    }
  }

  return length;
};
/**
 * Inject styles associated with the passed style definition objects, and return
 * an associated CSS class name.
 *
 * @param {boolean} useImportant If true, will append !important to generated
 *     CSS output. e.g. {color: red} -> "color: red !important".
 * @param {(Object|Object[])[]} styleDefinitions style definition objects, or
 *     arbitrarily nested arrays of them, as returned as properties of the
 *     return value of StyleSheet.create().
 */


var injectAndGetClassName = function injectAndGetClassName(useImportant
/* : boolean */
, styleDefinitions
/* : MaybeSheetDefinition[] */
, selectorHandlers
/* : SelectorHandler[] */
)
/* : string */
{
  var classNameBits = [];
  var definitionBits = []; // Mutates classNameBits and definitionBits and returns a length which we
  // will append to the hash to decrease the chance of hash collisions.

  var length = processStyleDefinitions(styleDefinitions, classNameBits, definitionBits, 0); // Break if there aren't any valid styles.

  if (classNameBits.length === 0) {
    return "";
  }

  var className = void 0;

  if ("development" === 'production') {
    className = classNameBits.length === 1 ? '_' + String(classNameBits[0]) : '_' + String(hashString(classNameBits.join())) + String((length % 36).toString(36));
  } else {
    className = classNameBits.join("-o_O-");
  }

  injectStyleOnce(className, '.' + String(className), definitionBits, useImportant, selectorHandlers);
  return className;
};
/* ::
import type { SelectorHandler } from './generate.js';
export type SheetDefinition = { [id:string]: any };
export type SheetDefinitions = SheetDefinition | SheetDefinition[];
type RenderFunction = () => string;
type Extension = {
    selectorHandler: SelectorHandler
};
export type MaybeSheetDefinition = SheetDefinition | false | null | void
*/


var unminifiedHashFn = function unminifiedHashFn(str
/* : string */
, key
/* : string */
) {
  return String(key) + '_' + String(hashString(str));
}; // StyleSheet.create is in a hot path so we want to keep as much logic out of it
// as possible. So, we figure out which hash function to use once, and only
// switch it out via minify() as necessary.
//
// This is in an exported function to make it easier to test.


var initialHashFn = function initialHashFn() {
  return "development" === 'production' ? hashString : unminifiedHashFn;
};

var hashFn = initialHashFn();
var StyleSheet = {
  create: function () {
    function create(sheetDefinition
    /* : SheetDefinition */
    )
    /* : Object */
    {
      var mappedSheetDefinition = {};
      var keys = Object.keys(sheetDefinition);

      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        var val = sheetDefinition[key];
        var stringVal = JSON.stringify(val);
        mappedSheetDefinition[key] = {
          _len: stringVal.length,
          _name: hashFn(stringVal, key),
          _definition: val
        };
      }

      return mappedSheetDefinition;
    }

    return create;
  }(),
  rehydrate: function () {
    function rehydrate() {
      var renderedClassNames
      /* : string[] */
      = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      addRenderedClassNames(renderedClassNames);
    }

    return rehydrate;
  }()
};
/**
 * Utilities for using Aphrodite server-side.
 *
 * This can be minified out in client-only bundles by replacing `typeof window`
 * with `"object"`, e.g. via Webpack's DefinePlugin:
 *
 *   new webpack.DefinePlugin({
 *     "typeof window": JSON.stringify("object")
 *   })
 */

var StyleSheetServer = typeof window !== 'undefined' ? null : {
  renderStatic: function () {
    function renderStatic(renderFunc
    /* : RenderFunction */
    ) {
      reset();
      startBuffering();
      var html = renderFunc();
      var cssContent = flushToString();
      return {
        html: html,
        css: {
          content: cssContent,
          renderedClassNames: getRenderedClassNames()
        }
      };
    }

    return renderStatic;
  }()
};
/**
 * Utilities for using Aphrodite in tests.
 *
 * Not meant to be used in production.
 */

var StyleSheetTestUtils = "development" === 'production' ? null : {
  /**
  * Prevent styles from being injected into the DOM.
  *
  * This is useful in situations where you'd like to test rendering UI
  * components which use Aphrodite without any of the side-effects of
  * Aphrodite happening. Particularly useful for testing the output of
  * components when you have no DOM, e.g. testing in Node without a fake DOM.
  *
  * Should be paired with a subsequent call to
  * clearBufferAndResumeStyleInjection.
  */
  suppressStyleInjection: function () {
    function suppressStyleInjection() {
      reset();
      startBuffering();
    }

    return suppressStyleInjection;
  }(),

  /**
  * Opposite method of preventStyleInject.
  */
  clearBufferAndResumeStyleInjection: function () {
    function clearBufferAndResumeStyleInjection() {
      reset();
    }

    return clearBufferAndResumeStyleInjection;
  }(),

  /**
  * Returns a string of buffered styles which have not been flushed
  *
  * @returns {string}  Buffer of styles which have not yet been flushed.
  */
  getBufferedStyles: function () {
    function getBufferedStyles$$1() {
      return getBufferedStyles();
    }

    return getBufferedStyles$$1;
  }()
};
/**
 * Generate the Aphrodite API exports, with given `selectorHandlers` and
 * `useImportant` state.
 */

function makeExports(useImportant
/* : boolean */
, selectorHandlers
/* : SelectorHandler[] */
) {
  return {
    StyleSheet: Object.assign({}, StyleSheet, {
      /**
       * Returns a version of the exports of Aphrodite (i.e. an object
       * with `css` and `StyleSheet` properties) which have some
       * extensions included.
       *
       * @param {Array.<Object>} extensions: An array of extensions to
       *     add to this instance of Aphrodite. Each object should have a
       *     single property on it, defining which kind of extension to
       *     add.
       * @param {SelectorHandler} [extensions[].selectorHandler]: A
       *     selector handler extension. See `defaultSelectorHandlers` in
       *     generate.js.
       *
       * @returns {Object} An object containing the exports of the new
       *     instance of Aphrodite.
       */
      extend: function () {
        function extend(extensions
        /* : Extension[] */
        ) {
          var extensionSelectorHandlers = extensions // Pull out extensions with a selectorHandler property
          .map(function (extension) {
            return extension.selectorHandler;
          }) // Remove nulls (i.e. extensions without a selectorHandler
          // property).
          .filter(function (handler) {
            return handler;
          });
          return makeExports(useImportant, selectorHandlers.concat(extensionSelectorHandlers));
        }

        return extend;
      }()
    }),
    StyleSheetServer: StyleSheetServer,
    StyleSheetTestUtils: StyleSheetTestUtils,
    minify: function () {
      function minify(shouldMinify
      /* : boolean */
      ) {
        hashFn = shouldMinify ? hashString : unminifiedHashFn;
      }

      return minify;
    }(),
    css: function () {
      function css()
      /* : MaybeSheetDefinition[] */
      {
        for (var _len = arguments.length, styleDefinitions = Array(_len), _key = 0; _key < _len; _key++) {
          styleDefinitions[_key] = arguments[_key];
        }

        return injectAndGetClassName(useImportant, styleDefinitions, selectorHandlers);
      }

      return css;
    }()
  };
}

var useImportant = true; // Add !important to all style definitions

var Aphrodite = makeExports(useImportant, defaultSelectorHandlers);
var StyleSheet$1 = Aphrodite.StyleSheet,
    StyleSheetServer$1 = Aphrodite.StyleSheetServer,
    StyleSheetTestUtils$1 = Aphrodite.StyleSheetTestUtils,
    css = Aphrodite.css,
    minify = Aphrodite.minify;
exports.minify = minify;
exports.css = css;
exports.StyleSheetTestUtils = StyleSheetTestUtils$1;
exports.StyleSheetServer = StyleSheetServer$1;
exports.StyleSheet = StyleSheet$1;
},{"inline-style-prefixer/static/plugins/calc":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/calc.js","inline-style-prefixer/static/plugins/crossFade":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/crossFade.js","inline-style-prefixer/static/plugins/cursor":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/cursor.js","inline-style-prefixer/static/plugins/filter":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/filter.js","inline-style-prefixer/static/plugins/flex":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/flex.js","inline-style-prefixer/static/plugins/flexboxIE":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/flexboxIE.js","inline-style-prefixer/static/plugins/flexboxOld":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/flexboxOld.js","inline-style-prefixer/static/plugins/gradient":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/gradient.js","inline-style-prefixer/static/plugins/imageSet":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/imageSet.js","inline-style-prefixer/static/plugins/position":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/position.js","inline-style-prefixer/static/plugins/sizing":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/sizing.js","inline-style-prefixer/static/plugins/transition":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/plugins/transition.js","string-hash":"../node_modules/string-hash/index.js","inline-style-prefixer/static/createPrefixer":"../node_modules/aphrodite/node_modules/inline-style-prefixer/static/createPrefixer.js","asap":"../node_modules/asap/browser-asap.js"}],"../src/views/style.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commonStyle = exports.ZIndex = exports.Duration = exports.Sizes = exports.FontSize = exports.FontFamily = void 0;

var _aphrodite = require("aphrodite");

var FontFamily;
exports.FontFamily = FontFamily;

(function (FontFamily) {
  FontFamily["MONOSPACE"] = "\"Source Code Pro\", Courier, monospace";
})(FontFamily || (exports.FontFamily = FontFamily = {}));

var FontSize;
exports.FontSize = FontSize;

(function (FontSize) {
  FontSize[FontSize["LABEL"] = 10] = "LABEL";
  FontSize[FontSize["TITLE"] = 12] = "TITLE";
  FontSize[FontSize["BIG_BUTTON"] = 36] = "BIG_BUTTON";
})(FontSize || (exports.FontSize = FontSize = {}));

var Sizes;
exports.Sizes = Sizes;

(function (Sizes) {
  Sizes[Sizes["MINIMAP_HEIGHT"] = 100] = "MINIMAP_HEIGHT";
  Sizes[Sizes["DETAIL_VIEW_HEIGHT"] = 150] = "DETAIL_VIEW_HEIGHT";
  Sizes[Sizes["TOOLTIP_WIDTH_MAX"] = 900] = "TOOLTIP_WIDTH_MAX";
  Sizes[Sizes["TOOLTIP_HEIGHT_MAX"] = 80] = "TOOLTIP_HEIGHT_MAX";
  Sizes[Sizes["SEPARATOR_HEIGHT"] = 2] = "SEPARATOR_HEIGHT";
  Sizes[Sizes["FRAME_HEIGHT"] = 20] = "FRAME_HEIGHT";
  Sizes[Sizes["TOOLBAR_HEIGHT"] = 20] = "TOOLBAR_HEIGHT";
  Sizes[Sizes["TOOLBAR_TAB_HEIGHT"] = 18] = "TOOLBAR_TAB_HEIGHT";
})(Sizes || (exports.Sizes = Sizes = {}));

var Duration;
exports.Duration = Duration;

(function (Duration) {
  Duration["HOVER_CHANGE"] = "0.07s";
})(Duration || (exports.Duration = Duration = {}));

var ZIndex;
exports.ZIndex = ZIndex;

(function (ZIndex) {
  ZIndex[ZIndex["PROFILE_SELECT"] = 1] = "PROFILE_SELECT";
  ZIndex[ZIndex["HOVERTIP"] = 2] = "HOVERTIP";
})(ZIndex || (exports.ZIndex = ZIndex = {}));

const commonStyle = _aphrodite.StyleSheet.create({
  fillY: {
    height: '100%'
  },
  fillX: {
    width: '100%'
  },
  hbox: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden'
  },
  vbox: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  },
  hide: {
    display: 'none'
  }
});

exports.commonStyle = commonStyle;
},{"aphrodite":"../node_modules/aphrodite/es/index.js"}],"../src/lib/profile-search.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exactMatchStrings = exactMatchStrings;
exports.FlamechartSearchResults = exports.ProfileSearchResults = exports.FlamechartType = void 0;

var _math = require("./math");

var FlamechartType;
exports.FlamechartType = FlamechartType;

(function (FlamechartType) {
  FlamechartType[FlamechartType["CHRONO_FLAME_CHART"] = 0] = "CHRONO_FLAME_CHART";
  FlamechartType[FlamechartType["LEFT_HEAVY_FLAME_GRAPH"] = 1] = "LEFT_HEAVY_FLAME_GRAPH";
})(FlamechartType || (exports.FlamechartType = FlamechartType = {})); // In previous versions of speedscope, searching for strings within the profile
// was done using fuzzy finding. As it turns out, this was surprising behavior
// to most people, so we've switched to a more traditional substring search that
// more closely mimics browser behavior.
//
// This is case insensitive for both the needle & the haystack. This means
// searching for "hello" will match "Hello" and "HELLO", and searching for
// "HELLO" will match both "hello" and "Hello". This matches Chrome's behavior
// as far as I can tell.
//
// See https://github.com/jlfwong/speedscope/issues/352
//
// Return ranges for all matches in order to highlight them.


function exactMatchStrings(text, pattern) {
  const lowerText = text.toLocaleLowerCase();
  const lowerPattern = pattern.toLocaleLowerCase();
  let lastIndex = 0;
  const matchedRanges = [];

  while (true) {
    let index = lowerText.indexOf(lowerPattern, lastIndex);

    if (index === -1) {
      return matchedRanges;
    }

    matchedRanges.push([index, index + pattern.length]);
    lastIndex = index + pattern.length;
  }
} // A utility class for storing cached search results to avoid recomputation when
// the search results & profile did not change.


class ProfileSearchResults {
  constructor(profile, searchQuery) {
    this.profile = profile;
    this.searchQuery = searchQuery;
    this.matches = null;
  }

  getMatchForFrame(frame) {
    if (!this.matches) {
      this.matches = new Map();
      this.profile.forEachFrame(frame => {
        const match = exactMatchStrings(frame.name, this.searchQuery);
        this.matches.set(frame, match.length === 0 ? null : match);
      });
    }

    return this.matches.get(frame) || null;
  }

}

exports.ProfileSearchResults = ProfileSearchResults;

class FlamechartSearchResults {
  constructor(flamechart, profileResults) {
    this.flamechart = flamechart;
    this.profileResults = profileResults;
    this.matches = null;
  }

  getResults() {
    if (this.matches == null) {
      const matches = [];
      const indexForNode = new Map();

      const visit = (frame, depth) => {
        const {
          node
        } = frame;

        if (this.profileResults.getMatchForFrame(node.frame)) {
          const configSpaceBounds = new _math.Rect(new _math.Vec2(frame.start, depth), new _math.Vec2(frame.end - frame.start, 1));
          indexForNode.set(node, matches.length);
          matches.push({
            configSpaceBounds,
            node
          });
        }

        frame.children.forEach(child => {
          visit(child, depth + 1);
        });
      };

      const layers = this.flamechart.getLayers();

      if (layers.length > 0) {
        layers[0].forEach(frame => visit(frame, 0));
      }

      this.matches = {
        matches,
        indexForNode
      };
    }

    return this.matches;
  }

  count() {
    return this.getResults().matches.length;
  }

  indexOf(node) {
    const result = this.getResults().indexForNode.get(node);
    return result === undefined ? null : result;
  }

  at(index) {
    const matches = this.getResults().matches;

    if (index < 0 || index >= matches.length) {
      throw new Error(`Index ${index} out of bounds in list of ${matches.length} matches.`);
    }

    return matches[index];
  }

}

exports.FlamechartSearchResults = FlamechartSearchResults;
},{"./math":"../src/lib/math.ts"}],"../src/views/search-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchView = exports.ProfileSearchContextProvider = exports.ProfileSearchContext = void 0;

var _aphrodite = require("aphrodite");

var _preact = require("preact");

var _hooks = require("preact/hooks");

var _compat = require("preact/compat");

var _style = require("./style");

var _profileSearch = require("../lib/profile-search");

var _activeProfileState = require("../app-state/active-profile-state");

var _theme = require("./themes/theme");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

function stopPropagation(ev) {
  ev.stopPropagation();
}

const ProfileSearchContext = (0, _preact.createContext)(null);
exports.ProfileSearchContext = ProfileSearchContext;

const ProfileSearchContextProvider = ({
  children
}) => {
  const activeProfileState = (0, _activeProfileState.useActiveProfileState)();
  const profile = activeProfileState ? activeProfileState.profile : null;
  const searchIsActive = (0, _atom.useAtom)(_appState.searchIsActiveAtom);
  const searchQuery = (0, _atom.useAtom)(_appState.searchQueryAtom);
  const searchResults = (0, _hooks.useMemo)(() => {
    if (!profile || !searchIsActive || searchQuery.length === 0) {
      return null;
    }

    return new _profileSearch.ProfileSearchResults(profile, searchQuery);
  }, [searchIsActive, searchQuery, profile]);
  return (0, _preact.h)(ProfileSearchContext.Provider, {
    value: searchResults
  }, children);
};

exports.ProfileSearchContextProvider = ProfileSearchContextProvider;
const SearchView = (0, _compat.memo)(({
  numResults,
  resultIndex,
  selectNext,
  selectPrev
}) => {
  const theme = (0, _theme.useTheme)();
  const style = getStyle(theme);
  const searchIsActive = (0, _atom.useAtom)(_appState.searchIsActiveAtom);
  const searchQuery = (0, _atom.useAtom)(_appState.searchQueryAtom);
  const setSearchQuery = _appState.searchQueryAtom.set;
  const setSearchIsActive = _appState.searchIsActiveAtom.set;
  const onInput = (0, _hooks.useCallback)(ev => {
    const value = ev.target.value;
    setSearchQuery(value);
  }, [setSearchQuery]);
  const inputRef = (0, _hooks.useRef)(null);
  const close = (0, _hooks.useCallback)(() => setSearchIsActive(false), [setSearchIsActive]);
  const selectPrevOrNextResult = (0, _hooks.useCallback)(ev => {
    if (ev.shiftKey) {
      selectPrev();
    } else {
      selectNext();
    }
  }, [selectPrev, selectNext]);
  const onKeyDown = (0, _hooks.useCallback)(ev => {
    ev.stopPropagation(); // Hitting Esc should close the search box

    if (ev.key === 'Escape') {
      setSearchIsActive(false);
    }

    if (ev.key === 'Enter') {
      selectPrevOrNextResult(ev);
    }

    if (ev.key == 'f' && (ev.metaKey || ev.ctrlKey)) {
      if (inputRef.current) {
        // If the input is already focused, select all
        inputRef.current.select();
      } // It seems like when an input is focused, the browser find menu pops
      // up without this line. It seems like it's not sufficient to only
      // preventDefault in the window keydown handler.


      ev.preventDefault();
    }
  }, [setSearchIsActive, selectPrevOrNextResult]);
  (0, _hooks.useEffect)(() => {
    const onWindowKeyDown = ev => {
      // Cmd+F or Ctrl+F open the search box
      if (ev.key == 'f' && (ev.metaKey || ev.ctrlKey)) {
        // Prevent the browser's search menu from appearing
        ev.preventDefault();

        if (inputRef.current) {
          // If the search box is already open, then re-select it immediately.
          inputRef.current.select();
        } else {
          // Otherwise, focus the search, then focus the input on the next
          // frame, when the search box should have mounted.
          setSearchIsActive(true);
          requestAnimationFrame(() => {
            if (inputRef.current) {
              inputRef.current.select();
            }
          });
        }
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [setSearchIsActive]);
  if (!searchIsActive) return null;
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.searchView)
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.icon)
  }, "\uD83D\uDD0D"), (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.inputContainer)
  }, (0, _preact.h)("input", {
    className: (0, _aphrodite.css)(style.input),
    value: searchQuery,
    onInput: onInput,
    onKeyDown: onKeyDown,
    onKeyUp: stopPropagation,
    onKeyPress: stopPropagation,
    ref: inputRef
  })), numResults != null && (0, _preact.h)(_preact.Fragment, null, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.resultCount)
  }, resultIndex == null ? '?' : resultIndex + 1, "/", numResults), (0, _preact.h)("button", {
    className: (0, _aphrodite.css)(style.icon, style.button),
    onClick: selectPrev
  }, "\u2B05\uFE0F"), (0, _preact.h)("button", {
    className: (0, _aphrodite.css)(style.icon, style.button),
    onClick: selectNext
  }, "\u27A1\uFE0F")), (0, _preact.h)("svg", {
    className: (0, _aphrodite.css)(style.icon),
    onClick: close,
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, (0, _preact.h)("path", {
    d: "M4.99999 4.16217L11.6427 10.8048M11.6427 4.16217L4.99999 10.8048",
    stroke: theme.altFgSecondaryColor
  })));
});
exports.SearchView = SearchView;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  searchView: {
    position: 'absolute',
    top: 0,
    right: 10,
    height: _style.Sizes.TOOLBAR_HEIGHT,
    width: 16 * 13,
    borderWidth: 2,
    borderColor: theme.altFgPrimaryColor,
    borderStyle: 'solid',
    fontSize: _style.FontSize.LABEL,
    boxSizing: 'border-box',
    background: theme.altBgSecondaryColor,
    color: theme.altFgPrimaryColor,
    display: 'flex',
    alignItems: 'center'
  },
  inputContainer: {
    flexShrink: 1,
    flexGrow: 1,
    display: 'flex'
  },
  input: {
    width: '100%',
    border: 'none',
    background: 'none',
    fontSize: _style.FontSize.LABEL,
    lineHeight: `${_style.Sizes.TOOLBAR_HEIGHT}px`,
    color: theme.altFgPrimaryColor,
    ':focus': {
      border: 'none',
      outline: 'none'
    },
    '::selection': {
      color: theme.altFgPrimaryColor,
      background: theme.selectionPrimaryColor
    }
  },
  resultCount: {
    verticalAlign: 'middle'
  },
  icon: {
    flexShrink: 0,
    verticalAlign: 'middle',
    height: '100%',
    margin: '0px 2px 0px 2px',
    fontSize: _style.FontSize.LABEL
  },
  button: {
    display: 'inline',
    background: 'none',
    border: 'none',
    padding: 0,
    ':focus': {
      outline: 'none'
    }
  }
}));
},{"aphrodite":"../node_modules/aphrodite/es/index.js","preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","./style":"../src/views/style.ts","../lib/profile-search":"../src/lib/profile-search.ts","../app-state/active-profile-state":"../src/app-state/active-profile-state.ts","./themes/theme":"../src/views/themes/theme.tsx","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts"}],"../src/lib/emscripten.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importEmscriptenSymbolMap = importEmscriptenSymbolMap;

// Returns `input` with hex escapes expanded (e.g. `\20` becomes ` `.)
//
// NOTE: This will fail to ignore escaped backslahes (e.g. `\\20`).
function unescapeHex(input) {
  return input.replace(/\\([a-fA-F0-9]{2})/g, (_match, group) => {
    const scalar = parseInt(group, 16);
    return String.fromCharCode(scalar);
  });
} // This imports symbol maps generated by emscripten using the "--emit-symbol-map" flag.
// It allows you to visualize a profile captured in a release build as long as you also
// have the associated symbol map. To do this, first drop the profile into speedscope
// and then drop the symbol map. After the second drop, the symbols will be remapped to
// their original names.


function importEmscriptenSymbolMap(contents) {
  const lines = contents.split('\n');
  if (!lines.length) return null; // Remove a trailing blank line if there is one

  if (lines[lines.length - 1] === '') lines.pop();
  if (!lines.length) return null;
  const map = new Map();
  const intRegex = /^(\d+):(.+)$/;
  const idRegex = /^([\$\w]+):([\$\w-]+)$/;

  for (const line of lines) {
    // Match lines like "103:__ZN8tinyxml210XMLCommentD0Ev"
    const intMatch = intRegex.exec(line);

    if (intMatch) {
      map.set(`wasm-function[${intMatch[1]}]`, unescapeHex(intMatch[2]));
      continue;
    } // Match lines like "u6:__ZN8tinyxml210XMLCommentD0Ev"


    const idMatch = idRegex.exec(line);

    if (idMatch) {
      map.set(idMatch[1], unescapeHex(idMatch[2]));
      continue;
    }

    return null;
  }

  return frame => {
    if (!map.has(frame.name)) {
      return null;
    }

    return {
      name: map.get(frame.name)
    };
  };
}
},{}],"../src/views/color-chit.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColorChit = ColorChit;

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _style = require("./style");

var _theme = require("./themes/theme");

function ColorChit(props) {
  const style = getStyle((0, _theme.useTheme)());
  return (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.stackChit),
    style: {
      backgroundColor: props.color
    }
  });
}

const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  stackChit: {
    position: 'relative',
    top: -1,
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '0.5em',
    border: `1px solid ${theme.fgSecondaryColor}`,
    width: _style.FontSize.LABEL - 2,
    height: _style.FontSize.LABEL - 2
  }
}));
},{"preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","./style":"../src/views/style.ts","./themes/theme":"../src/views/themes/theme.tsx"}],"../src/views/scrollable-list-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrollableListView = void 0;

var _preact = require("preact");

var _hooks = require("preact/hooks");

// A simple implementation of an efficient scrolling list view which
// renders only items within the viewport + a couple extra items.
const ScrollableListView = ({
  items,
  axis,
  renderItems,
  className,
  initialIndexInView
}) => {
  const [viewportSize, setViewportSize] = (0, _hooks.useState)(null);
  const [viewportScrollOffset, setViewportScrollOffset] = (0, _hooks.useState)(0);
  const viewportRef = (0, _hooks.useRef)(null);
  const widthOrHeight = axis === 'x' ? 'width' : 'height';
  const leftOrTop = axis === 'x' ? 'left' : 'top';
  const scrollLeftOrScrollTop = axis === 'x' ? 'scrollLeft' : 'scrollTop'; // This is kind of a weird hack, but I'm not sure what the better of doing something like this is.

  const offset = initialIndexInView ? items.reduce((a, b, i) => i < initialIndexInView ? a + b.size : a, 0) : 0;
  const initialScroll = (0, _hooks.useRef)(offset);
  const viewportCallback = (0, _hooks.useCallback)(viewport => {
    if (viewport) {
      requestAnimationFrame(() => {
        setViewportSize(viewport.getBoundingClientRect()[widthOrHeight]);

        if (initialScroll.current != null) {
          viewport.scrollTo({
            [leftOrTop]: initialScroll.current
          });
          initialScroll.current = null;
        }
      });
    } else {
      setViewportSize(null);
    }

    viewportRef.current = viewport;
  }, [setViewportSize, widthOrHeight, leftOrTop]);
  const rangeResult = (0, _hooks.useMemo)(() => {
    if (viewportRef.current == null || viewportSize == null || viewportScrollOffset == null) {
      return null;
    } // We render items up to a quarter viewport height outside of the
    // viewport both above and below to prevent flickering.


    const minY = viewportScrollOffset - viewportSize / 4;
    const maxY = viewportScrollOffset + viewportSize + viewportSize / 4;
    let total = 0;
    let invisiblePrefixSize = 0;
    let i = 0;

    for (; i < items.length; i++) {
      const item = items[i];
      invisiblePrefixSize = total;
      total += item.size;

      if (total >= minY) {
        break;
      }
    }

    const firstVisibleIndex = i;

    for (; i < items.length; i++) {
      const item = items[i];
      total += item.size;

      if (total >= maxY) {
        break;
      }
    }

    const lastVisibleIndex = Math.min(i, items.length - 1);
    return {
      firstVisibleIndex,
      lastVisibleIndex,
      invisiblePrefixSize
    };
  }, [viewportSize, viewportScrollOffset, items]);
  const totalSize = (0, _hooks.useMemo)(() => items.reduce((a, b) => a + b.size, 0), [items]);
  const onViewportScroll = (0, _hooks.useCallback)(() => {
    if (viewportRef.current != null) {
      setViewportScrollOffset(viewportRef.current[scrollLeftOrScrollTop]);
    }
  }, [scrollLeftOrScrollTop]);
  (0, _hooks.useEffect)(() => {
    const resizeListener = () => {
      if (viewportRef.current != null) {
        setViewportSize(viewportRef.current.getBoundingClientRect()[widthOrHeight]);
      }
    };

    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, [widthOrHeight]);
  const visibleItems = (0, _hooks.useMemo)(() => {
    return rangeResult ? renderItems(rangeResult.firstVisibleIndex, rangeResult.lastVisibleIndex) : null;
  }, [renderItems, rangeResult]);
  const content = (0, _hooks.useMemo)(() => {
    return (0, _preact.h)("div", {
      style: {
        height: totalSize
      }
    }, (0, _preact.h)("div", {
      style: {
        transform: `translateY(${(rangeResult === null || rangeResult === void 0 ? void 0 : rangeResult.invisiblePrefixSize) || 0}px)`
      }
    }, visibleItems));
  }, [rangeResult, visibleItems, totalSize]);
  return (0, _preact.h)("div", {
    className: className,
    ref: viewportCallback,
    onScroll: onViewportScroll
  }, content);
};

exports.ScrollableListView = ScrollableListView;
},{"preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js"}],"../src/views/profile-table-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProfileTableViewContainer = exports.ProfileTableView = void 0;

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _utils = require("../lib/utils");

var _style = require("./style");

var _colorChit = require("./color-chit");

var _scrollableListView = require("./scrollable-list-view");

var _getters = require("../app-state/getters");

var _compat = require("preact/compat");

var _hooks = require("preact/hooks");

var _sandwichView = require("./sandwich-view");

var _color = require("../lib/color");

var _theme = require("./themes/theme");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

function HBarDisplay(props) {
  const style = getStyle((0, _theme.useTheme)());
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.hBarDisplay)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.hBarDisplayFilled),
    style: {
      width: `${props.perc}%`
    }
  }));
}

function SortIcon(props) {
  const theme = (0, _theme.useTheme)();
  const style = getStyle(theme);
  const {
    activeDirection
  } = props;
  const upFill = activeDirection === _appState.SortDirection.ASCENDING ? theme.fgPrimaryColor : theme.fgSecondaryColor;
  const downFill = activeDirection === _appState.SortDirection.DESCENDING ? theme.fgPrimaryColor : theme.fgSecondaryColor;
  return (0, _preact.h)("svg", {
    width: "8",
    height: "10",
    viewBox: "0 0 8 10",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: (0, _aphrodite.css)(style.sortIcon)
  }, (0, _preact.h)("path", {
    d: "M0 4L4 0L8 4H0Z",
    fill: upFill
  }), (0, _preact.h)("path", {
    d: "M0 4L4 0L8 4H0Z",
    transform: "translate(0 10) scale(1 -1)",
    fill: downFill
  }));
}

function highlightRanges(text, ranges, highlightedClassName) {
  const spans = [];
  let last = 0;

  for (let range of ranges) {
    spans.push(text.slice(last, range[0]));
    spans.push((0, _preact.h)("span", {
      className: highlightedClassName
    }, text.slice(range[0], range[1])));
    last = range[1];
  }

  spans.push(text.slice(last));
  return (0, _preact.h)("span", null, spans);
}

const ProfileTableRowView = ({
  frame,
  matchedRanges,
  profile,
  index,
  selectedFrame,
  setSelectedFrame,
  getCSSColorForFrame
}) => {
  const style = getStyle((0, _theme.useTheme)());
  const totalWeight = frame.getTotalWeight();
  const selfWeight = frame.getSelfWeight();
  const totalPerc = 100.0 * totalWeight / profile.getTotalNonIdleWeight();
  const selfPerc = 100.0 * selfWeight / profile.getTotalNonIdleWeight();
  const selected = frame === selectedFrame; // We intentionally use index rather than frame.key here as the tr key
  // in order to re-use rows when sorting rather than creating all new elements.

  return (0, _preact.h)("tr", {
    key: `${index}`,
    onClick: setSelectedFrame.bind(null, frame),
    className: (0, _aphrodite.css)(style.tableRow, index % 2 == 0 && style.tableRowEven, selected && style.tableRowSelected)
  }, (0, _preact.h)("td", {
    className: (0, _aphrodite.css)(style.numericCell)
  }, profile.formatValue(totalWeight), " (", (0, _utils.formatPercent)(totalPerc), ")", (0, _preact.h)(HBarDisplay, {
    perc: totalPerc
  })), (0, _preact.h)("td", {
    className: (0, _aphrodite.css)(style.numericCell)
  }, profile.formatValue(selfWeight), " (", (0, _utils.formatPercent)(selfPerc), ")", (0, _preact.h)(HBarDisplay, {
    perc: selfPerc
  })), (0, _preact.h)("td", {
    title: frame.file,
    className: (0, _aphrodite.css)(style.textCell)
  }, (0, _preact.h)(_colorChit.ColorChit, {
    color: getCSSColorForFrame(frame)
  }), matchedRanges ? highlightRanges(frame.name, matchedRanges, (0, _aphrodite.css)(style.matched, selected && style.matchedSelected)) : frame.name));
};

const ProfileTableView = (0, _compat.memo)(({
  profile,
  sortMethod,
  setSortMethod,
  selectedFrame,
  setSelectedFrame,
  getCSSColorForFrame,
  searchQuery,
  searchIsActive
}) => {
  const style = getStyle((0, _theme.useTheme)());
  const onSortClick = (0, _hooks.useCallback)((field, ev) => {
    ev.preventDefault();

    if (sortMethod.field == field) {
      // Toggle
      setSortMethod({
        field,
        direction: sortMethod.direction === _appState.SortDirection.ASCENDING ? _appState.SortDirection.DESCENDING : _appState.SortDirection.ASCENDING
      });
    } else {
      // Set a sane default
      switch (field) {
        case _appState.SortField.SYMBOL_NAME:
          {
            setSortMethod({
              field,
              direction: _appState.SortDirection.ASCENDING
            });
            break;
          }

        case _appState.SortField.SELF:
          {
            setSortMethod({
              field,
              direction: _appState.SortDirection.DESCENDING
            });
            break;
          }

        case _appState.SortField.TOTAL:
          {
            setSortMethod({
              field,
              direction: _appState.SortDirection.DESCENDING
            });
            break;
          }
      }
    }
  }, [sortMethod, setSortMethod]);
  const sandwichContext = (0, _hooks.useContext)(_sandwichView.SandwichViewContext);
  const renderItems = (0, _hooks.useCallback)((firstIndex, lastIndex) => {
    if (!sandwichContext) return null;
    const rows = [];

    for (let i = firstIndex; i <= lastIndex; i++) {
      const frame = sandwichContext.rowList[i];
      const match = sandwichContext.getSearchMatchForFrame(frame);
      rows.push(ProfileTableRowView({
        frame,
        matchedRanges: match == null ? null : match,
        index: i,
        profile: profile,
        selectedFrame: selectedFrame,
        setSelectedFrame: setSelectedFrame,
        getCSSColorForFrame: getCSSColorForFrame
      }));
    }

    if (rows.length === 0) {
      if (searchIsActive) {
        rows.push((0, _preact.h)("tr", null, (0, _preact.h)("td", {
          className: (0, _aphrodite.css)(style.emptyState)
        }, "No symbol names match query \"", searchQuery, "\".")));
      } else {
        rows.push((0, _preact.h)("tr", null, (0, _preact.h)("td", {
          className: (0, _aphrodite.css)(style.emptyState)
        }, "No symbols found.")));
      }
    }

    return (0, _preact.h)("table", {
      className: (0, _aphrodite.css)(style.tableView)
    }, rows);
  }, [sandwichContext, profile, selectedFrame, setSelectedFrame, getCSSColorForFrame, searchIsActive, searchQuery, style.emptyState, style.tableView]);
  const listItems = (0, _hooks.useMemo)(() => sandwichContext == null ? [] : sandwichContext.rowList.map(f => ({
    size: _style.Sizes.FRAME_HEIGHT
  })), [sandwichContext]);
  const onTotalClick = (0, _hooks.useCallback)(ev => onSortClick(_appState.SortField.TOTAL, ev), [onSortClick]);
  const onSelfClick = (0, _hooks.useCallback)(ev => onSortClick(_appState.SortField.SELF, ev), [onSortClick]);
  const onSymbolNameClick = (0, _hooks.useCallback)(ev => onSortClick(_appState.SortField.SYMBOL_NAME, ev), [onSortClick]);
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(_style.commonStyle.vbox, style.profileTableView)
  }, (0, _preact.h)("table", {
    className: (0, _aphrodite.css)(style.tableView)
  }, (0, _preact.h)("thead", {
    className: (0, _aphrodite.css)(style.tableHeader)
  }, (0, _preact.h)("tr", null, (0, _preact.h)("th", {
    className: (0, _aphrodite.css)(style.numericCell),
    onClick: onTotalClick
  }, (0, _preact.h)(SortIcon, {
    activeDirection: sortMethod.field === _appState.SortField.TOTAL ? sortMethod.direction : null
  }), "Total"), (0, _preact.h)("th", {
    className: (0, _aphrodite.css)(style.numericCell),
    onClick: onSelfClick
  }, (0, _preact.h)(SortIcon, {
    activeDirection: sortMethod.field === _appState.SortField.SELF ? sortMethod.direction : null
  }), "Self"), (0, _preact.h)("th", {
    className: (0, _aphrodite.css)(style.textCell),
    onClick: onSymbolNameClick
  }, (0, _preact.h)(SortIcon, {
    activeDirection: sortMethod.field === _appState.SortField.SYMBOL_NAME ? sortMethod.direction : null
  }), "Symbol Name")))), (0, _preact.h)(_scrollableListView.ScrollableListView, {
    axis: 'y',
    items: listItems,
    className: (0, _aphrodite.css)(style.scrollView),
    renderItems: renderItems,
    initialIndexInView: selectedFrame == null ? null : sandwichContext === null || sandwichContext === void 0 ? void 0 : sandwichContext.getIndexForFrame(selectedFrame)
  }));
});
exports.ProfileTableView = ProfileTableView;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  profileTableView: {
    background: theme.bgPrimaryColor,
    height: '100%'
  },
  scrollView: {
    overflowY: 'auto',
    overflowX: 'hidden',
    flexGrow: 1,
    '::-webkit-scrollbar': {
      background: theme.bgPrimaryColor
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.fgSecondaryColor,
      borderRadius: 20,
      border: `3px solid ${theme.bgPrimaryColor}`,
      ':hover': {
        background: theme.fgPrimaryColor
      }
    }
  },
  tableView: {
    width: '100%',
    fontSize: _style.FontSize.LABEL,
    background: theme.bgPrimaryColor
  },
  tableHeader: {
    borderBottom: `2px solid ${theme.bgSecondaryColor}`,
    textAlign: 'left',
    color: theme.fgPrimaryColor,
    userSelect: 'none'
  },
  sortIcon: {
    position: 'relative',
    top: 1,
    marginRight: _style.Sizes.FRAME_HEIGHT / 4
  },
  tableRow: {
    background: theme.bgPrimaryColor,
    height: _style.Sizes.FRAME_HEIGHT
  },
  tableRowEven: {
    background: theme.bgSecondaryColor
  },
  tableRowSelected: {
    background: theme.selectionPrimaryColor,
    color: theme.altFgPrimaryColor
  },
  numericCell: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    position: 'relative',
    textAlign: 'right',
    paddingRight: _style.Sizes.FRAME_HEIGHT,
    width: 6 * _style.Sizes.FRAME_HEIGHT,
    minWidth: 6 * _style.Sizes.FRAME_HEIGHT
  },
  textCell: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: '100%',
    maxWidth: 0
  },
  hBarDisplay: {
    position: 'absolute',
    background: _color.Color.fromCSSHex(theme.weightColor).withAlpha(0.2).toCSS(),
    bottom: 2,
    height: 2,
    width: `calc(100% - ${2 * _style.Sizes.FRAME_HEIGHT}px)`,
    right: _style.Sizes.FRAME_HEIGHT
  },
  hBarDisplayFilled: {
    height: '100%',
    position: 'absolute',
    background: theme.weightColor,
    right: 0
  },
  matched: {
    borderBottom: `2px solid ${theme.fgPrimaryColor}`
  },
  matchedSelected: {
    borderColor: theme.altFgPrimaryColor
  },
  emptyState: {
    textAlign: 'center',
    fontWeight: 'bold'
  }
}));
const ProfileTableViewContainer = (0, _compat.memo)(ownProps => {
  const {
    activeProfileState
  } = ownProps;
  const {
    profile,
    sandwichViewState
  } = activeProfileState;
  if (!profile) throw new Error('profile missing');
  const tableSortMethod = (0, _atom.useAtom)(_appState.tableSortMethodAtom);
  const theme = (0, _theme.useTheme)();
  const {
    callerCallee
  } = sandwichViewState;
  const selectedFrame = callerCallee ? callerCallee.selectedFrame : null;
  const frameToColorBucket = (0, _getters.getFrameToColorBucket)(profile);
  const getCSSColorForFrame = (0, _getters.createGetCSSColorForFrame)({
    theme,
    frameToColorBucket
  });
  const setSelectedFrame = (0, _hooks.useCallback)(selectedFrame => {
    _appState.profileGroupAtom.setSelectedFrame(selectedFrame);
  }, []);
  const searchIsActive = (0, _atom.useAtom)(_appState.searchIsActiveAtom);
  const searchQuery = (0, _atom.useAtom)(_appState.searchQueryAtom);
  return (0, _preact.h)(ProfileTableView, {
    profile: profile,
    selectedFrame: selectedFrame,
    getCSSColorForFrame: getCSSColorForFrame,
    sortMethod: tableSortMethod,
    setSelectedFrame: setSelectedFrame,
    setSortMethod: _appState.tableSortMethodAtom.set,
    searchIsActive: searchIsActive,
    searchQuery: searchQuery
  });
});
exports.ProfileTableViewContainer = ProfileTableViewContainer;
},{"preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","../lib/utils":"../src/lib/utils.ts","./style":"../src/views/style.ts","./color-chit":"../src/views/color-chit.tsx","./scrollable-list-view":"../src/views/scrollable-list-view.tsx","../app-state/getters":"../src/app-state/getters.ts","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./sandwich-view":"../src/views/sandwich-view.tsx","../lib/color":"../src/lib/color.ts","./themes/theme":"../src/views/themes/theme.tsx","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts"}],"../src/lib/flamechart.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Flamechart = void 0;

var _utils = require("./utils");

var _math = require("./math");

class Flamechart {
  getTotalWeight() {
    return this.totalWeight;
  }

  getLayers() {
    return this.layers;
  }

  getColorBucketForFrame(frame) {
    return this.source.getColorBucketForFrame(frame);
  }

  getMinFrameWidth() {
    return this.minFrameWidth;
  }

  formatValue(v) {
    return this.source.formatValue(v);
  }

  getClampedViewportWidth(viewportWidth) {
    const maxWidth = this.getTotalWeight(); // In order to avoid floating point error, we cap the maximum zoom. In
    // particular, it's important that at the maximum zoom level, the total
    // trace size + a viewport width is not equal to the trace size due to
    // floating point rounding.
    //
    // For instance, if the profile's total weight is 2^60, and the viewport
    // size is 1, trying to move one viewport width right will result in no
    // change because 2^60 + 1 = 2^60 in floating point arithmetic. JavaScript
    // numbers are 64 bit floats, and therefore have 53 mantissa bits. You can
    // see this for yourself in the console. Try:
    //
    //   > Math.pow(2, 60) + 1 === Math.pow(2, 60)
    //   true
    //   > Math.pow(2, 53) + 1 === Math.pow(2, 53)
    //   true
    //   > Math.pow(2, 52) + 1 === Math.pow(2, 52)
    //   false
    //
    // We use 2^40 as a cap instead, since we want to be able to make small
    // adjustments within a viewport width.
    //
    // For reference, this will still allow you to zoom until 1 nanosecond fills
    // the screen in a profile with a duration of over 18 minutes.
    //
    //   > Math.pow(2, 40) / (60 * Math.pow(10, 9))
    //   18.325193796266667
    //

    const maxZoom = Math.pow(2, 40); // In addition to capping zoom to avoid floating point error, we further cap
    // zoom to avoid letting you zoom in so that the smallest element more than
    // fills the screen, since that probably isn't useful. The final zoom cap is
    // determined by the minimum zoom of either 2^40x zoom or the necessary zoom
    // for the smallest frame to fill the screen three times.

    const minWidth = (0, _math.clamp)(3 * this.getMinFrameWidth(), maxWidth / maxZoom, maxWidth);
    return (0, _math.clamp)(viewportWidth, minWidth, maxWidth);
  } // Given a desired config-space viewport rectangle, clamp the rectangle so
  // that it fits within the given flamechart. This prevents the viewport from
  // extending past the bounds of the flamechart or zooming in too far.


  getClampedConfigSpaceViewportRect({
    configSpaceViewportRect,
    renderInverted
  }) {
    const configSpaceSize = new _math.Vec2(this.getTotalWeight(), this.getLayers().length);
    const width = this.getClampedViewportWidth(configSpaceViewportRect.size.x);
    const size = configSpaceViewportRect.size.withX(width);

    const origin = _math.Vec2.clamp(configSpaceViewportRect.origin, new _math.Vec2(0, renderInverted ? 0 : -1), _math.Vec2.max(_math.Vec2.zero, configSpaceSize.minus(size).plus(new _math.Vec2(0, 1))));

    return new _math.Rect(origin, configSpaceViewportRect.size.withX(width));
  }

  constructor(source) {
    this.source = source; // Bottom to top

    this.layers = [];
    this.totalWeight = 0;
    this.minFrameWidth = 1;
    const stack = [];

    const openFrame = (node, value) => {
      const parent = (0, _utils.lastOf)(stack);
      const frame = {
        node,
        parent,
        children: [],
        start: value,
        end: value
      };

      if (parent) {
        parent.children.push(frame);
      }

      stack.push(frame);
    };

    this.minFrameWidth = Infinity;

    const closeFrame = (node, value) => {
      console.assert(stack.length > 0);
      const stackTop = stack.pop();
      stackTop.end = value;
      if (stackTop.end - stackTop.start === 0) return;
      const layerIndex = stack.length;

      while (this.layers.length <= layerIndex) this.layers.push([]);

      this.layers[layerIndex].push(stackTop);
      this.minFrameWidth = Math.min(this.minFrameWidth, stackTop.end - stackTop.start);
    };

    this.totalWeight = source.getTotalWeight();
    source.forEachCall(openFrame, closeFrame);
    if (!isFinite(this.minFrameWidth)) this.minFrameWidth = 1;
  }

}

exports.Flamechart = Flamechart;
},{"./utils":"../src/lib/utils.ts","./math":"../src/lib/math.ts"}],"../src/gl/flamechart-renderer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartRenderer = exports.FlamechartRowAtlasKey = void 0;

var _rectangleBatchRenderer = require("./rectangle-batch-renderer");

var _math = require("../lib/math");

var _color = require("../lib/color");

var _utils = require("../lib/utils");

var _graphics = require("./graphics");

var _utils2 = require("./utils");

const MAX_BATCH_SIZE = 10000;

class RangeTreeLeafNode {
  constructor(batch, bounds, numPrecedingRectanglesInRow) {
    this.batch = batch;
    this.bounds = bounds;
    this.numPrecedingRectanglesInRow = numPrecedingRectanglesInRow;
    this.children = [];
  }

  getBatch() {
    return this.batch;
  }

  getBounds() {
    return this.bounds;
  }

  getRectCount() {
    return this.batch.getRectCount();
  }

  getChildren() {
    return this.children;
  }

  getParity() {
    return this.numPrecedingRectanglesInRow % 2;
  }

  forEachLeafNodeWithinBounds(configSpaceBounds, cb) {
    if (!this.bounds.hasIntersectionWith(configSpaceBounds)) return;
    cb(this);
  }

}

class RangeTreeInteriorNode {
  constructor(children) {
    this.children = children;
    this.rectCount = 0;

    if (children.length === 0) {
      throw new Error('Empty interior node');
    }

    let minLeft = Infinity;
    let maxRight = -Infinity;
    let minTop = Infinity;
    let maxBottom = -Infinity;

    for (let child of children) {
      this.rectCount += child.getRectCount();
      const bounds = child.getBounds();
      minLeft = Math.min(minLeft, bounds.left());
      maxRight = Math.max(maxRight, bounds.right());
      minTop = Math.min(minTop, bounds.top());
      maxBottom = Math.max(maxBottom, bounds.bottom());
    }

    this.bounds = new _math.Rect(new _math.Vec2(minLeft, minTop), new _math.Vec2(maxRight - minLeft, maxBottom - minTop));
  }

  getBounds() {
    return this.bounds;
  }

  getRectCount() {
    return this.rectCount;
  }

  getChildren() {
    return this.children;
  }

  forEachLeafNodeWithinBounds(configSpaceBounds, cb) {
    if (!this.bounds.hasIntersectionWith(configSpaceBounds)) return;

    for (let child of this.children) {
      child.forEachLeafNodeWithinBounds(configSpaceBounds, cb);
    }
  }

}

class FlamechartRowAtlasKey {
  get key() {
    return `${this.stackDepth}_${this.index}_${this.zoomLevel}`;
  }

  constructor(options) {
    this.stackDepth = options.stackDepth;
    this.zoomLevel = options.zoomLevel;
    this.index = options.index;
  }

  static getOrInsert(set, info) {
    return set.getOrInsert(new FlamechartRowAtlasKey(info));
  }

}

exports.FlamechartRowAtlasKey = FlamechartRowAtlasKey;

class FlamechartRenderer {
  constructor(gl, rowAtlas, flamechart, rectangleBatchRenderer, colorPassRenderer, options = {
    inverted: false
  }) {
    this.gl = gl;
    this.rowAtlas = rowAtlas;
    this.flamechart = flamechart;
    this.rectangleBatchRenderer = rectangleBatchRenderer;
    this.colorPassRenderer = colorPassRenderer;
    this.options = options;
    this.layers = [];
    this.rectInfoTexture = null;
    this.rectInfoRenderTarget = null;
    this.atlasKeys = new _utils.KeyedSet();
    const nLayers = flamechart.getLayers().length;

    for (let stackDepth = 0; stackDepth < nLayers; stackDepth++) {
      const leafNodes = [];
      const y = options.inverted ? nLayers - 1 - stackDepth : stackDepth;
      let minLeft = Infinity;
      let maxRight = -Infinity;
      let batch = new _rectangleBatchRenderer.RectangleBatch(this.gl);
      let rectCount = 0;
      const layer = flamechart.getLayers()[stackDepth];

      for (let i = 0; i < layer.length; i++) {
        const frame = layer[i];

        if (batch.getRectCount() >= MAX_BATCH_SIZE) {
          leafNodes.push(new RangeTreeLeafNode(batch, new _math.Rect(new _math.Vec2(minLeft, y), new _math.Vec2(maxRight - minLeft, 1)), rectCount));
          minLeft = Infinity;
          maxRight = -Infinity;
          batch = new _rectangleBatchRenderer.RectangleBatch(this.gl);
        }

        const configSpaceBounds = new _math.Rect(new _math.Vec2(frame.start, y), new _math.Vec2(frame.end - frame.start, 1));
        minLeft = Math.min(minLeft, configSpaceBounds.left());
        maxRight = Math.max(maxRight, configSpaceBounds.right()); // We'll use the red channel to indicate the index to allow
        // us to separate adjacent rectangles within a row from one another,
        // the green channel to indicate the row,
        // and the blue channel to indicate the color bucket to render.
        // We add one to each so we have zero reserved for the background color.

        const color = new _color.Color((1 + i % 255) / 256, (1 + stackDepth % 255) / 256, (1 + this.flamechart.getColorBucketForFrame(frame.node.frame)) / 256);
        batch.addRect(configSpaceBounds, color);
        rectCount++;
      }

      if (batch.getRectCount() > 0) {
        leafNodes.push(new RangeTreeLeafNode(batch, new _math.Rect(new _math.Vec2(minLeft, y), new _math.Vec2(maxRight - minLeft, 1)), rectCount));
      } // TODO(jlfwong): Making this into a binary tree
      // range than a tree of always-height-two might make this run faster


      this.layers.push(new RangeTreeInteriorNode(leafNodes));
    }
  }

  getRectInfoTexture(width, height) {
    if (this.rectInfoTexture) {
      const texture = this.rectInfoTexture;

      if (texture.width != width || texture.height != height) {
        texture.resize(width, height);
      }
    } else {
      this.rectInfoTexture = this.gl.createTexture(_graphics.Graphics.TextureFormat.NEAREST_CLAMP, width, height);
    }

    return this.rectInfoTexture;
  }

  getRectInfoRenderTarget(width, height) {
    const texture = this.getRectInfoTexture(width, height);

    if (this.rectInfoRenderTarget) {
      if (this.rectInfoRenderTarget.texture != texture) {
        this.rectInfoRenderTarget.texture.free();
        this.rectInfoRenderTarget.setColor(texture);
      }
    }

    if (!this.rectInfoRenderTarget) {
      this.rectInfoRenderTarget = this.gl.createRenderTarget(texture);
    }

    return this.rectInfoRenderTarget;
  }

  free() {
    if (this.rectInfoRenderTarget) {
      this.rectInfoRenderTarget.free();
    }

    if (this.rectInfoTexture) {
      this.rectInfoTexture.free();
    }
  }

  configSpaceBoundsForKey(key) {
    const {
      stackDepth,
      zoomLevel,
      index
    } = key;
    const configSpaceContentWidth = this.flamechart.getTotalWeight();
    const width = configSpaceContentWidth / Math.pow(2, zoomLevel);
    const nLayers = this.flamechart.getLayers().length;
    const y = this.options.inverted ? nLayers - 1 - stackDepth : stackDepth;
    return new _math.Rect(new _math.Vec2(width * index, y), new _math.Vec2(width, 1));
  }

  render(props) {
    const {
      configSpaceSrcRect,
      physicalSpaceDstRect
    } = props;
    const atlasKeysToRender = []; // We want to render the lowest resolution we can while still guaranteeing that the
    // atlas line is higher resolution than its corresponding destination rectangle on
    // the screen.

    const configToPhysical = _math.AffineTransform.betweenRects(configSpaceSrcRect, physicalSpaceDstRect);

    if (configSpaceSrcRect.isEmpty()) {
      // Prevent an infinite loop
      return;
    }

    let zoomLevel = 0;

    while (true) {
      const key = FlamechartRowAtlasKey.getOrInsert(this.atlasKeys, {
        stackDepth: 0,
        zoomLevel,
        index: 0
      });
      const configSpaceBounds = this.configSpaceBoundsForKey(key);
      const physicalBounds = configToPhysical.transformRect(configSpaceBounds);

      if (physicalBounds.width() < this.rowAtlas.getResolution()) {
        break;
      }

      zoomLevel++;
    }

    const top = Math.max(0, Math.floor(configSpaceSrcRect.top()));
    const bottom = Math.min(this.layers.length, Math.ceil(configSpaceSrcRect.bottom()));
    const configSpaceContentWidth = this.flamechart.getTotalWeight();
    const numAtlasEntriesPerLayer = Math.pow(2, zoomLevel);
    const left = Math.floor(numAtlasEntriesPerLayer * configSpaceSrcRect.left() / configSpaceContentWidth);
    const right = Math.ceil(numAtlasEntriesPerLayer * configSpaceSrcRect.right() / configSpaceContentWidth);
    const nLayers = this.flamechart.getLayers().length;

    for (let y = top; y < bottom; y++) {
      for (let index = left; index <= right; index++) {
        const stackDepth = this.options.inverted ? nLayers - 1 - y : y;
        const key = FlamechartRowAtlasKey.getOrInsert(this.atlasKeys, {
          stackDepth,
          zoomLevel,
          index
        });
        const configSpaceBounds = this.configSpaceBoundsForKey(key);
        if (!configSpaceBounds.hasIntersectionWith(configSpaceSrcRect)) continue;
        atlasKeysToRender.push(key);
      }
    } // TODO(jlfwong): When I switched the GL backend from regl to the port from
    // evanw/sky, rendering uncached even for massive documents seemed fast
    // enough. It's possible that the row cache is now unnecessary, but I'll
    // leave it around for now since it's not causing issues.


    const cacheCapacity = this.rowAtlas.getCapacity();
    const keysToRenderCached = atlasKeysToRender.slice(0, cacheCapacity);
    const keysToRenderUncached = atlasKeysToRender.slice(cacheCapacity); // Fill the cache

    this.rowAtlas.writeToAtlasIfNeeded(keysToRenderCached, (textureDstRect, key) => {
      const configSpaceBounds = this.configSpaceBoundsForKey(key);
      this.layers[key.stackDepth].forEachLeafNodeWithinBounds(configSpaceBounds, leaf => {
        this.rectangleBatchRenderer.render({
          batch: leaf.getBatch(),
          configSpaceSrcRect: configSpaceBounds,
          physicalSpaceDstRect: textureDstRect
        });
      });
    });
    const renderTarget = this.getRectInfoRenderTarget(physicalSpaceDstRect.width(), physicalSpaceDstRect.height());
    (0, _utils2.renderInto)(this.gl, renderTarget, () => {
      this.gl.clear(new _graphics.Graphics.Color(0, 0, 0, 0));
      const viewportRect = new _math.Rect(_math.Vec2.zero, new _math.Vec2(this.gl.viewport.width, this.gl.viewport.height));

      const configToViewport = _math.AffineTransform.betweenRects(configSpaceSrcRect, viewportRect); // Render from the cache


      for (let key of keysToRenderCached) {
        const configSpaceSrcRect = this.configSpaceBoundsForKey(key);
        this.rowAtlas.renderViaAtlas(key, configToViewport.transformRect(configSpaceSrcRect));
      } // Render entries that didn't make it into the cache


      for (let key of keysToRenderUncached) {
        const configSpaceBounds = this.configSpaceBoundsForKey(key);
        const physicalBounds = configToViewport.transformRect(configSpaceBounds);
        this.layers[key.stackDepth].forEachLeafNodeWithinBounds(configSpaceBounds, leaf => {
          this.rectangleBatchRenderer.render({
            batch: leaf.getBatch(),
            configSpaceSrcRect: configSpaceBounds,
            physicalSpaceDstRect: physicalBounds
          });
        });
      }
    });
    const rectInfoTexture = this.getRectInfoTexture(physicalSpaceDstRect.width(), physicalSpaceDstRect.height());
    this.colorPassRenderer.render({
      rectInfoTexture,
      srcRect: new _math.Rect(_math.Vec2.zero, new _math.Vec2(rectInfoTexture.width, rectInfoTexture.height)),
      dstRect: physicalSpaceDstRect,
      renderOutlines: props.renderOutlines
    });
  }

}

exports.FlamechartRenderer = FlamechartRenderer;
},{"./rectangle-batch-renderer":"../src/gl/rectangle-batch-renderer.ts","../lib/math":"../src/lib/math.ts","../lib/color":"../src/lib/color.ts","../lib/utils":"../src/lib/utils.ts","./graphics":"../src/gl/graphics.ts","./utils":"../src/gl/utils.ts"}],"../src/views/flamechart-style.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFlamechartStyle = void 0;

var _aphrodite = require("aphrodite");

var _style = require("./style");

var _theme = require("./themes/theme");

const getFlamechartStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  hoverCount: {
    color: theme.weightColor
  },
  fill: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0
  },
  minimap: {
    height: _style.Sizes.MINIMAP_HEIGHT,
    borderBottom: `${_style.Sizes.SEPARATOR_HEIGHT}px solid ${theme.fgSecondaryColor}`
  },
  panZoomView: {
    flex: 1
  },
  detailView: {
    display: 'grid',
    height: _style.Sizes.DETAIL_VIEW_HEIGHT,
    overflow: 'hidden',
    gridTemplateColumns: '120px 120px 1fr',
    gridTemplateRows: 'repeat(4, 1fr)',
    borderTop: `${_style.Sizes.SEPARATOR_HEIGHT}px solid ${theme.fgSecondaryColor}`,
    fontSize: _style.FontSize.LABEL,
    position: 'absolute',
    background: theme.bgPrimaryColor,
    width: '100vw',
    bottom: 0
  },
  stackTraceViewPadding: {
    padding: 5
  },
  stackTraceView: {
    height: _style.Sizes.DETAIL_VIEW_HEIGHT,
    lineHeight: `${_style.FontSize.LABEL + 2}px`,
    overflow: 'auto',
    '::-webkit-scrollbar': {
      background: theme.bgPrimaryColor
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.fgSecondaryColor,
      borderRadius: 20,
      border: `3px solid ${theme.bgPrimaryColor}`,
      ':hover': {
        background: theme.fgPrimaryColor
      }
    }
  },
  stackLine: {
    whiteSpace: 'nowrap'
  },
  stackFileLine: {
    color: theme.fgSecondaryColor
  },
  statsTable: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: `repeat(3, ${_style.FontSize.LABEL + 10}px)`,
    gridGap: '1px 1px',
    textAlign: 'center',
    paddingRight: 1
  },
  statsTableHeader: {
    gridColumn: '1 / 3'
  },
  statsTableCell: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  thisInstanceCell: {
    background: theme.selectionPrimaryColor,
    color: theme.altFgPrimaryColor
  },
  allInstancesCell: {
    background: theme.selectionSecondaryColor,
    color: theme.altFgPrimaryColor
  },
  barDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.2)',
    width: '100%'
  }
}));
exports.getFlamechartStyle = getFlamechartStyle;
},{"aphrodite":"../node_modules/aphrodite/es/index.js","./style":"../src/views/style.ts","./themes/theme":"../src/views/themes/theme.tsx"}],"../src/lib/text-utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cachedMeasureTextWidth = cachedMeasureTextWidth;
exports.buildTrimmedText = buildTrimmedText;
exports.trimTextMid = trimTextMid;
exports.remapRangesToTrimmedText = remapRangesToTrimmedText;
exports.ELLIPSIS = void 0;

var _utils = require("./utils");

const ELLIPSIS = '\u2026'; // NOTE: This blindly assumes the same result across contexts.

exports.ELLIPSIS = ELLIPSIS;
const measureTextCache = new Map();
let lastDevicePixelRatio = -1;

function cachedMeasureTextWidth(ctx, text) {
  if (window.devicePixelRatio !== lastDevicePixelRatio) {
    // This cache is no longer valid!
    measureTextCache.clear();
    lastDevicePixelRatio = window.devicePixelRatio;
  }

  if (!measureTextCache.has(text)) {
    measureTextCache.set(text, ctx.measureText(text).width);
  }

  return measureTextCache.get(text);
} // Trim text, placing an ellipsis in the middle, with a slight bias towards
// keeping text from the beginning rather than the end


function buildTrimmedText(text, length) {
  if (text.length <= length) {
    return {
      trimmedString: text,
      trimmedLength: text.length,
      prefixLength: text.length,
      suffixLength: 0,
      originalString: text,
      originalLength: text.length
    };
  }

  let prefixLength = Math.floor(length / 2);
  const suffixLength = length - prefixLength - 1;
  const prefix = text.substring(0, prefixLength);
  const suffix = text.substring(text.length - suffixLength, text.length);
  const trimmedString = prefix + ELLIPSIS + suffix;
  return {
    trimmedString,
    trimmedLength: trimmedString.length,
    prefixLength: prefix.length,
    suffixLength: suffix.length,
    originalString: text,
    originalLength: text.length
  };
} // Trim text to fit within the given number of pixels on the canvas


function trimTextMid(ctx, text, maxWidth) {
  if (cachedMeasureTextWidth(ctx, text) <= maxWidth) {
    return buildTrimmedText(text, text.length);
  }

  const [lo] = (0, _utils.findValueBisect)(0, text.length, n => {
    return cachedMeasureTextWidth(ctx, buildTrimmedText(text, Math.floor(n)).trimmedString);
  }, maxWidth);
  return buildTrimmedText(text, Math.floor(lo));
}

var IndexTypeInTrimmed;

(function (IndexTypeInTrimmed) {
  IndexTypeInTrimmed[IndexTypeInTrimmed["IN_PREFIX"] = 0] = "IN_PREFIX";
  IndexTypeInTrimmed[IndexTypeInTrimmed["IN_SUFFIX"] = 1] = "IN_SUFFIX";
  IndexTypeInTrimmed[IndexTypeInTrimmed["ELIDED"] = 2] = "ELIDED";
})(IndexTypeInTrimmed || (IndexTypeInTrimmed = {}));

function getIndexTypeInTrimmed(result, index) {
  if (index < result.prefixLength) {
    return IndexTypeInTrimmed.IN_PREFIX;
  } else if (index < result.originalLength - result.suffixLength) {
    return IndexTypeInTrimmed.ELIDED;
  } else {
    return IndexTypeInTrimmed.IN_SUFFIX;
  }
}

function remapRangesToTrimmedText(trimmedText, ranges) {
  // We intentionally don't just re-run fuzzy matching on the trimmed
  // text, beacuse if the search query is "helloWorld", the frame name
  // is "application::helloWorld", and that gets trimmed down to
  // "appl...oWorld", we still want "oWorld" to be highlighted, even
  // though the string "appl...oWorld" is not matched by the query
  // "helloWorld".
  //
  // There's a weird case to consider here: what if the trimmedText is
  // also matched by the query, but results in a different match than
  // the original query? Consider, e.g. the search string of "ab". The
  // string "hello ab shabby" will be matched at the first "ab", but
  // may be trimmed to "hello...shabby". In this case, should we
  // highlight the "ab" hidden by the ellipsis, or the "ab" in
  // "shabby"? The code below highlights the ellipsis so that the
  // matched characters don't change as you zoom in and out.
  const rangesToHighlightInTrimmedText = [];
  const lengthLoss = trimmedText.originalLength - trimmedText.trimmedLength;
  let highlightedEllipsis = false;

  for (let [origStart, origEnd] of ranges) {
    let startPosType = getIndexTypeInTrimmed(trimmedText, origStart);
    let endPosType = getIndexTypeInTrimmed(trimmedText, origEnd - 1);

    switch (startPosType) {
      case IndexTypeInTrimmed.IN_PREFIX:
        {
          switch (endPosType) {
            case IndexTypeInTrimmed.IN_PREFIX:
              {
                // The entire range fits in the prefix. Add it unmodified.
                rangesToHighlightInTrimmedText.push([origStart, origEnd]);
                break;
              }

            case IndexTypeInTrimmed.ELIDED:
              {
                // The range starts in the prefix, but ends in the elided
                // section. Add just the prefix + one char for the ellipsis.
                rangesToHighlightInTrimmedText.push([origStart, trimmedText.prefixLength + 1]);
                highlightedEllipsis = true;
                break;
              }

            case IndexTypeInTrimmed.IN_SUFFIX:
              {
                // The range crosses from the prefix to the suffix.
                // Highlight everything including the ellipsis.
                rangesToHighlightInTrimmedText.push([origStart, origEnd - lengthLoss]);
                break;
              }
          }

          break;
        }

      case IndexTypeInTrimmed.ELIDED:
        {
          switch (endPosType) {
            case IndexTypeInTrimmed.IN_PREFIX:
              {
                // This should be impossible
                throw new Error('Unexpected highlight range starts in elided and ends in prefix');
              }

            case IndexTypeInTrimmed.ELIDED:
              {
                // The match starts & ends within the elided section.
                if (!highlightedEllipsis) {
                  rangesToHighlightInTrimmedText.push([trimmedText.prefixLength, trimmedText.prefixLength + 1]);
                  highlightedEllipsis = true;
                }

                break;
              }

            case IndexTypeInTrimmed.IN_SUFFIX:
              {
                // The match starts in elided, but ends in suffix.
                if (highlightedEllipsis) {
                  rangesToHighlightInTrimmedText.push([trimmedText.trimmedLength - trimmedText.suffixLength, origEnd - lengthLoss]);
                } else {
                  rangesToHighlightInTrimmedText.push([trimmedText.prefixLength, origEnd - lengthLoss]);
                  highlightedEllipsis = true;
                }

                break;
              }
          }

          break;
        }

      case IndexTypeInTrimmed.IN_SUFFIX:
        {
          switch (endPosType) {
            case IndexTypeInTrimmed.IN_PREFIX:
              {
                // This should be impossible
                throw new Error('Unexpected highlight range starts in suffix and ends in prefix');
              }

            case IndexTypeInTrimmed.ELIDED:
              {
                // This should be impossible
                throw new Error('Unexpected highlight range starts in suffix and ends in elided');
                break;
              }

            case IndexTypeInTrimmed.IN_SUFFIX:
              {
                // Match starts & ends in suffix
                rangesToHighlightInTrimmedText.push([origStart - lengthLoss, origEnd - lengthLoss]);
                break;
              }
          }

          break;
        }
    }
  }

  return rangesToHighlightInTrimmedText;
}
},{"./utils":"../src/lib/utils.ts"}],"../src/views/flamechart-minimap-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartMinimapView = void 0;

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _math = require("../lib/math");

var _flamechartStyle = require("./flamechart-style");

var _style = require("./style");

var _textUtils = require("../lib/text-utils");

var _color = require("../lib/color");

var DraggingMode;

(function (DraggingMode) {
  DraggingMode[DraggingMode["DRAW_NEW_VIEWPORT"] = 0] = "DRAW_NEW_VIEWPORT";
  DraggingMode[DraggingMode["TRANSLATE_VIEWPORT"] = 1] = "TRANSLATE_VIEWPORT";
})(DraggingMode || (DraggingMode = {}));

class FlamechartMinimapView extends _preact.Component {
  constructor() {
    super(...arguments);
    this.container = null;

    this.containerRef = element => {
      this.container = element || null;
    };

    this.overlayCanvas = null;
    this.overlayCtx = null;

    this.onWindowResize = () => {
      this.onBeforeFrame();
    };

    this.onBeforeFrame = () => {
      this.maybeClearInteractionLock();
      this.resizeOverlayCanvasIfNeeded();
      this.renderRects();
      this.renderOverlays();
    };

    this.renderCanvas = () => {
      this.props.canvasContext.requestFrame();
    }; // Inertial scrolling introduces tricky interaction problems.
    // Namely, if you start panning, and hit the edge of the scrollable
    // area, the browser continues to receive WheelEvents from inertial
    // scrolling. If we start zooming by holding Cmd + scrolling, then
    // release the Cmd key, this can cause us to interpret the incoming
    // inertial scrolling events as panning. To prevent this, we introduce
    // a concept of an "Interaction Lock". Once a certain interaction has
    // begun, we don't allow the other type of interaction to begin until
    // we've received two frames with no inertial wheel events. This
    // prevents us from accidentally switching between panning & zooming.


    this.frameHadWheelEvent = false;
    this.framesWithoutWheelEvents = 0;
    this.interactionLock = null;

    this.maybeClearInteractionLock = () => {
      if (this.interactionLock) {
        if (!this.frameHadWheelEvent) {
          this.framesWithoutWheelEvents++;

          if (this.framesWithoutWheelEvents >= 2) {
            this.interactionLock = null;
            this.framesWithoutWheelEvents = 0;
          }
        }

        this.props.canvasContext.requestFrame();
      }

      this.frameHadWheelEvent = false;
    };

    this.onWheel = ev => {
      ev.preventDefault();
      this.frameHadWheelEvent = true;
      const isZoom = ev.metaKey || ev.ctrlKey;

      if (isZoom && this.interactionLock !== 'pan') {
        let multiplier = 1 + ev.deltaY / 100; // On Chrome & Firefox, pinch-to-zoom maps to
        // WheelEvent + Ctrl Key. We'll accelerate it in
        // this case, since it feels a bit sluggish otherwise.

        if (ev.ctrlKey) {
          multiplier = 1 + ev.deltaY / 40;
        }

        multiplier = (0, _math.clamp)(multiplier, 0.1, 10.0);
        this.zoom(multiplier);
      } else if (this.interactionLock !== 'zoom') {
        this.pan(new _math.Vec2(ev.deltaX, ev.deltaY));
      }

      this.renderCanvas();
    };

    this.dragStartConfigSpaceMouse = null;
    this.dragConfigSpaceViewportOffset = null;
    this.draggingMode = null;

    this.onMouseDown = ev => {
      const configSpaceMouse = this.configSpaceMouse(ev);

      if (configSpaceMouse) {
        if (this.props.configSpaceViewportRect.contains(configSpaceMouse)) {
          // If dragging starting inside the viewport rectangle,
          // we'll move the existing viewport
          this.draggingMode = DraggingMode.TRANSLATE_VIEWPORT;
          this.dragConfigSpaceViewportOffset = configSpaceMouse.minus(this.props.configSpaceViewportRect.origin);
        } else {
          // If dragging starts outside the the viewport rectangle,
          // we'll start drawing a new viewport
          this.draggingMode = DraggingMode.DRAW_NEW_VIEWPORT;
        }

        this.dragStartConfigSpaceMouse = configSpaceMouse;
        window.addEventListener('mousemove', this.onWindowMouseMove);
        window.addEventListener('mouseup', this.onWindowMouseUp);
        this.updateCursor(configSpaceMouse);
      }
    };

    this.onWindowMouseMove = ev => {
      if (!this.dragStartConfigSpaceMouse) return;
      let configSpaceMouse = this.configSpaceMouse(ev);
      if (!configSpaceMouse) return;
      this.updateCursor(configSpaceMouse); // Clamp the mouse position to avoid weird behavior when outside the canvas bounds

      configSpaceMouse = new _math.Rect(new _math.Vec2(0, 0), this.configSpaceSize()).closestPointTo(configSpaceMouse);

      if (this.draggingMode === DraggingMode.DRAW_NEW_VIEWPORT) {
        const configStart = this.dragStartConfigSpaceMouse;
        let configEnd = configSpaceMouse;
        if (!configStart || !configEnd) return;
        const left = Math.min(configStart.x, configEnd.x);
        const right = Math.max(configStart.x, configEnd.x);
        const width = right - left;
        const height = this.props.configSpaceViewportRect.height();
        this.props.setConfigSpaceViewportRect(new _math.Rect(new _math.Vec2(left, configEnd.y - height / 2), new _math.Vec2(width, height)));
      } else if (this.draggingMode === DraggingMode.TRANSLATE_VIEWPORT) {
        if (!this.dragConfigSpaceViewportOffset) return;
        const newOrigin = configSpaceMouse.minus(this.dragConfigSpaceViewportOffset);
        this.props.setConfigSpaceViewportRect(this.props.configSpaceViewportRect.withOrigin(newOrigin));
      }
    };

    this.updateCursor = configSpaceMouse => {
      if (this.draggingMode === DraggingMode.TRANSLATE_VIEWPORT) {
        document.body.style.cursor = 'grabbing';
        document.body.style.cursor = '-webkit-grabbing';
      } else if (this.draggingMode === DraggingMode.DRAW_NEW_VIEWPORT) {
        document.body.style.cursor = 'col-resize';
      } else if (this.props.configSpaceViewportRect.contains(configSpaceMouse)) {
        document.body.style.cursor = 'grab';
        document.body.style.cursor = '-webkit-grab';
      } else {
        document.body.style.cursor = 'col-resize';
      }
    };

    this.onMouseLeave = () => {
      if (this.draggingMode == null) {
        document.body.style.cursor = 'default';
      }
    };

    this.onMouseMove = ev => {
      const configSpaceMouse = this.configSpaceMouse(ev);
      if (!configSpaceMouse) return;
      this.updateCursor(configSpaceMouse);
    };

    this.onWindowMouseUp = ev => {
      this.draggingMode = null;
      window.removeEventListener('mousemove', this.onWindowMouseMove);
      window.removeEventListener('mouseup', this.onWindowMouseUp);
      const configSpaceMouse = this.configSpaceMouse(ev);
      if (!configSpaceMouse) return;
      this.updateCursor(configSpaceMouse);
    };

    this.overlayCanvasRef = element => {
      if (element) {
        this.overlayCanvas = element;
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        this.renderCanvas();
      } else {
        this.overlayCanvas = null;
        this.overlayCtx = null;
      }
    };
  }

  physicalViewSize() {
    return new _math.Vec2(this.overlayCanvas ? this.overlayCanvas.width : 0, this.overlayCanvas ? this.overlayCanvas.height : 0);
  }

  getStyle() {
    return (0, _flamechartStyle.getFlamechartStyle)(this.props.theme);
  }

  minimapOrigin() {
    return new _math.Vec2(0, _style.Sizes.FRAME_HEIGHT * window.devicePixelRatio);
  }

  configSpaceSize() {
    return new _math.Vec2(this.props.flamechart.getTotalWeight(), this.props.flamechart.getLayers().length);
  }

  configSpaceToPhysicalViewSpace() {
    const minimapOrigin = this.minimapOrigin();
    return _math.AffineTransform.betweenRects(new _math.Rect(new _math.Vec2(0, 0), this.configSpaceSize()), new _math.Rect(minimapOrigin, this.physicalViewSize().minus(minimapOrigin)));
  }

  logicalToPhysicalViewSpace() {
    return _math.AffineTransform.withScale(new _math.Vec2(window.devicePixelRatio, window.devicePixelRatio));
  }

  windowToLogicalViewSpace() {
    if (!this.container) return new _math.AffineTransform();
    const bounds = this.container.getBoundingClientRect();
    return _math.AffineTransform.withTranslation(new _math.Vec2(-bounds.left, -bounds.top));
  }

  renderRects() {
    if (!this.container) return; // Hasn't resized yet -- no point in rendering yet

    if (this.physicalViewSize().x < 2) return;
    this.props.canvasContext.renderBehind(this.container, () => {
      this.props.flamechartRenderer.render({
        configSpaceSrcRect: new _math.Rect(new _math.Vec2(0, 0), this.configSpaceSize()),
        physicalSpaceDstRect: new _math.Rect(this.minimapOrigin(), this.physicalViewSize().minus(this.minimapOrigin())),
        renderOutlines: false
      });
      this.props.canvasContext.viewportRectangleRenderer.render({
        configSpaceViewportRect: this.props.configSpaceViewportRect,
        configSpaceToPhysicalViewSpace: this.configSpaceToPhysicalViewSpace()
      });
    });
  }

  renderOverlays() {
    const ctx = this.overlayCtx;
    if (!ctx) return;
    const physicalViewSize = this.physicalViewSize();
    ctx.clearRect(0, 0, physicalViewSize.x, physicalViewSize.y);
    const configToPhysical = this.configSpaceToPhysicalViewSpace();
    const left = 0;
    const right = this.configSpaceSize().x; // TODO(jlfwong): There's a huge amount of code duplication here between
    // this and the FlamechartView.renderOverlays(). Consolidate.
    // We want about 10 gridlines to be visible, and want the unit to be
    // 1eN, 2eN, or 5eN for some N
    // Ideally, we want an interval every 100 logical screen pixels

    const logicalToConfig = (this.configSpaceToPhysicalViewSpace().inverted() || new _math.AffineTransform()).times(this.logicalToPhysicalViewSpace());
    const targetInterval = logicalToConfig.transformVector(new _math.Vec2(200, 1)).x;
    const physicalViewSpaceFrameHeight = _style.Sizes.FRAME_HEIGHT * window.devicePixelRatio;
    const physicalViewSpaceFontSize = _style.FontSize.LABEL * window.devicePixelRatio;
    const labelPaddingPx = (physicalViewSpaceFrameHeight - physicalViewSpaceFontSize) / 2;
    ctx.font = `${physicalViewSpaceFontSize}px/${physicalViewSpaceFrameHeight}px ${_style.FontFamily.MONOSPACE}`;
    ctx.textBaseline = 'top';
    const minInterval = Math.pow(10, Math.floor(Math.log10(targetInterval)));
    let interval = minInterval;

    if (targetInterval / interval > 5) {
      interval *= 5;
    } else if (targetInterval / interval > 2) {
      interval *= 2;
    }

    const theme = this.props.theme;
    {
      ctx.fillStyle = _color.Color.fromCSSHex(theme.bgPrimaryColor).withAlpha(0.8).toCSS();
      ctx.fillRect(0, 0, physicalViewSize.x, physicalViewSpaceFrameHeight);
      ctx.textBaseline = 'top';

      for (let x = Math.ceil(left / interval) * interval; x < right; x += interval) {
        // TODO(jlfwong): Ensure that labels do not overlap
        const pos = Math.round(configToPhysical.transformPosition(new _math.Vec2(x, 0)).x);
        const labelText = this.props.flamechart.formatValue(x);
        const textWidth = Math.ceil((0, _textUtils.cachedMeasureTextWidth)(ctx, labelText));
        ctx.fillStyle = theme.fgPrimaryColor;
        ctx.fillText(labelText, pos - textWidth - labelPaddingPx, labelPaddingPx);
        ctx.fillStyle = theme.fgSecondaryColor;
        ctx.fillRect(pos, 0, 1, physicalViewSize.y);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.flamechart !== nextProps.flamechart) {
      this.renderCanvas();
    } else if (this.props.configSpaceViewportRect != nextProps.configSpaceViewportRect) {
      this.renderCanvas();
    } else if (this.props.canvasContext !== nextProps.canvasContext) {
      if (this.props.canvasContext) {
        this.props.canvasContext.removeBeforeFrameHandler(this.onBeforeFrame);
      }

      if (nextProps.canvasContext) {
        nextProps.canvasContext.addBeforeFrameHandler(this.onBeforeFrame);
        nextProps.canvasContext.requestFrame();
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
    this.props.canvasContext.addBeforeFrameHandler(this.onBeforeFrame);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    this.props.canvasContext.removeBeforeFrameHandler(this.onBeforeFrame);
  }

  resizeOverlayCanvasIfNeeded() {
    if (!this.overlayCanvas) return;
    let {
      width,
      height
    } = this.overlayCanvas.getBoundingClientRect();
    {
      /*
      We render text at a higher resolution then scale down to
      ensure we're rendering at 1:1 device pixel ratio.
      This ensures our text is rendered crisply.
      */
    }
    width = Math.floor(width);
    height = Math.floor(height); // Still initializing: don't resize yet

    if (width === 0 || height === 0) return;
    const scaledWidth = width * window.devicePixelRatio;
    const scaledHeight = height * window.devicePixelRatio;
    if (scaledWidth === this.overlayCanvas.width && scaledHeight === this.overlayCanvas.height) return;
    this.overlayCanvas.width = scaledWidth;
    this.overlayCanvas.height = scaledHeight;
  }

  pan(logicalViewSpaceDelta) {
    this.interactionLock = 'pan';
    const physicalDelta = this.logicalToPhysicalViewSpace().transformVector(logicalViewSpaceDelta);
    const configDelta = this.configSpaceToPhysicalViewSpace().inverseTransformVector(physicalDelta);
    if (!configDelta) return;
    this.props.transformViewport(_math.AffineTransform.withTranslation(configDelta));
  }

  zoom(multiplier) {
    this.interactionLock = 'zoom';
    const configSpaceViewport = this.props.configSpaceViewportRect;
    const configSpaceCenter = configSpaceViewport.origin.plus(configSpaceViewport.size.times(1 / 2));
    if (!configSpaceCenter) return;

    const zoomTransform = _math.AffineTransform.withTranslation(configSpaceCenter.times(-1)).scaledBy(new _math.Vec2(multiplier, 1)).translatedBy(configSpaceCenter);

    this.props.transformViewport(zoomTransform);
  }

  configSpaceMouse(ev) {
    const logicalSpaceMouse = this.windowToLogicalViewSpace().transformPosition(new _math.Vec2(ev.clientX, ev.clientY));
    const physicalSpaceMouse = this.logicalToPhysicalViewSpace().transformPosition(logicalSpaceMouse);
    return this.configSpaceToPhysicalViewSpace().inverseTransformPosition(physicalSpaceMouse);
  }

  render() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      ref: this.containerRef,
      onWheel: this.onWheel,
      onMouseDown: this.onMouseDown,
      onMouseMove: this.onMouseMove,
      onMouseLeave: this.onMouseLeave,
      className: (0, _aphrodite.css)(style.minimap, _style.commonStyle.vbox)
    }, (0, _preact.h)("canvas", {
      width: 1,
      height: 1,
      ref: this.overlayCanvasRef,
      className: (0, _aphrodite.css)(style.fill)
    }));
  }

}

exports.FlamechartMinimapView = FlamechartMinimapView;
},{"preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","../lib/math":"../src/lib/math.ts","./flamechart-style":"../src/views/flamechart-style.ts","./style":"../src/views/style.ts","../lib/text-utils":"../src/lib/text-utils.ts","../lib/color":"../src/lib/color.ts"}],"../src/views/flamechart-detail-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartDetailView = FlamechartDetailView;

var _aphrodite = require("aphrodite");

var _preact = require("preact");

var _flamechartStyle = require("./flamechart-style");

var _utils = require("../lib/utils");

var _colorChit = require("./color-chit");

var _theme = require("./themes/theme");

function StatisticsTable(props) {
  const style = (0, _flamechartStyle.getFlamechartStyle)((0, _theme.useTheme)());
  const total = props.formatter(props.selectedTotal);
  const self = props.formatter(props.selectedSelf);
  const totalPerc = 100.0 * props.selectedTotal / props.grandTotal;
  const selfPerc = 100.0 * props.selectedSelf / props.grandTotal;
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.statsTable)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell, style.statsTableHeader)
  }, props.title), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell)
  }, "Total"), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell)
  }, "Self"), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell)
  }, total), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell)
  }, self), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell)
  }, (0, _utils.formatPercent)(totalPerc), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.barDisplay),
    style: {
      height: `${totalPerc}%`
    }
  })), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(props.cellStyle, style.statsTableCell)
  }, (0, _utils.formatPercent)(selfPerc), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.barDisplay),
    style: {
      height: `${selfPerc}%`
    }
  })));
}

function StackTraceView(props) {
  const style = (0, _flamechartStyle.getFlamechartStyle)((0, _theme.useTheme)());
  const rows = [];
  let node = props.node;

  for (; node && !node.isRoot(); node = node.parent) {
    const row = [];
    const {
      frame
    } = node;
    row.push((0, _preact.h)(_colorChit.ColorChit, {
      color: props.getFrameColor(frame)
    }));

    if (rows.length) {
      row.push((0, _preact.h)("span", {
        className: (0, _aphrodite.css)(style.stackFileLine)
      }, "> "));
    }

    row.push(frame.name);

    if (frame.file) {
      let pos = frame.file;

      if (frame.line != null) {
        pos += `:${frame.line}`;

        if (frame.col != null) {
          pos += `:${frame.col}`;
        }
      }

      row.push((0, _preact.h)("span", {
        className: (0, _aphrodite.css)(style.stackFileLine)
      }, " (", pos, ")"));
    }

    rows.push((0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.stackLine)
    }, row));
  }

  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.stackTraceView)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.stackTraceViewPadding)
  }, rows));
}

function FlamechartDetailView(props) {
  const style = (0, _flamechartStyle.getFlamechartStyle)((0, _theme.useTheme)());
  const {
    flamechart,
    selectedNode
  } = props;
  const {
    frame
  } = selectedNode;
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.detailView)
  }, (0, _preact.h)(StatisticsTable, {
    title: 'This Instance',
    cellStyle: style.thisInstanceCell,
    grandTotal: flamechart.getTotalWeight(),
    selectedTotal: selectedNode.getTotalWeight(),
    selectedSelf: selectedNode.getSelfWeight(),
    formatter: flamechart.formatValue.bind(flamechart)
  }), (0, _preact.h)(StatisticsTable, {
    title: 'All Instances',
    cellStyle: style.allInstancesCell,
    grandTotal: flamechart.getTotalWeight(),
    selectedTotal: frame.getTotalWeight(),
    selectedSelf: frame.getSelfWeight(),
    formatter: flamechart.formatValue.bind(flamechart)
  }), (0, _preact.h)(StackTraceView, {
    node: selectedNode,
    getFrameColor: props.getCSSColorForFrame
  }));
}
},{"aphrodite":"../node_modules/aphrodite/es/index.js","preact":"../node_modules/preact/dist/preact.module.js","./flamechart-style":"../src/views/flamechart-style.ts","../lib/utils":"../src/lib/utils.ts","./color-chit":"../src/views/color-chit.tsx","./themes/theme":"../src/views/themes/theme.tsx"}],"../src/lib/canvas-2d-batch-renderers.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BatchCanvasRectRenderer = exports.BatchCanvasTextRenderer = void 0;

// This file contains a collection of classes which make it easier to perform
// batch rendering of Canvas2D primitives. The advantage of this over just doing
// ctx.beginPath() ... ctx.rect(...) ... ctx.endPath() is that you can construct
// several different batch renderers are the same time, then decide on their
// paint order at the end.
//
// See FlamechartPanZoomView.renderOverlays for an example of how this is used.
class BatchCanvasTextRenderer {
  constructor() {
    this.argsBatch = [];
  }

  text(args) {
    this.argsBatch.push(args);
  }

  fill(ctx, color) {
    if (this.argsBatch.length === 0) return;
    ctx.fillStyle = color;

    for (let args of this.argsBatch) {
      ctx.fillText(args.text, args.x, args.y);
    }

    this.argsBatch = [];
  }

}

exports.BatchCanvasTextRenderer = BatchCanvasTextRenderer;

class BatchCanvasRectRenderer {
  constructor() {
    this.argsBatch = [];
  }

  rect(args) {
    this.argsBatch.push(args);
  }

  drawPath(ctx) {
    ctx.beginPath();

    for (let args of this.argsBatch) {
      ctx.rect(args.x, args.y, args.w, args.h);
    }

    ctx.closePath();
    this.argsBatch = [];
  }

  fill(ctx, color) {
    if (this.argsBatch.length === 0) return;
    ctx.fillStyle = color;
    this.drawPath(ctx);
    ctx.fill();
  }

  stroke(ctx, color, lineWidth) {
    if (this.argsBatch.length === 0) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    this.drawPath(ctx);
    ctx.stroke();
  }

}

exports.BatchCanvasRectRenderer = BatchCanvasRectRenderer;
},{}],"../src/views/flamechart-pan-zoom-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartPanZoomView = void 0;

var _math = require("../lib/math");

var _style = require("./style");

var _textUtils = require("../lib/text-utils");

var _flamechartStyle = require("./flamechart-style");

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _canvas2dBatchRenderers = require("../lib/canvas-2d-batch-renderers");

var _color = require("../lib/color");

class FlamechartPanZoomView extends _preact.Component {
  constructor() {
    super(...arguments);
    this.container = null;

    this.containerRef = element => {
      this.container = element || null;
    };

    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.hoveredLabel = null;

    this.overlayCanvasRef = element => {
      if (element) {
        this.overlayCanvas = element;
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        this.renderCanvas();
      } else {
        this.overlayCanvas = null;
        this.overlayCtx = null;
      }
    };

    this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT = _style.Sizes.FRAME_HEIGHT;

    this.onWindowResize = () => {
      this.updateConfigSpaceViewport();
      this.onBeforeFrame();
    }; // Inertial scrolling introduces tricky interaction problems.
    // Namely, if you start panning, and hit the edge of the scrollable
    // area, the browser continues to receive WheelEvents from inertial
    // scrolling. If we start zooming by holding Cmd + scrolling, then
    // release the Cmd key, this can cause us to interpret the incoming
    // inertial scrolling events as panning. To prevent this, we introduce
    // a concept of an "Interaction Lock". Once a certain interaction has
    // begun, we don't allow the other type of interaction to begin until
    // we've received two frames with no inertial wheel events. This
    // prevents us from accidentally switching between panning & zooming.


    this.frameHadWheelEvent = false;
    this.framesWithoutWheelEvents = 0;
    this.interactionLock = null;

    this.maybeClearInteractionLock = () => {
      if (this.interactionLock) {
        if (!this.frameHadWheelEvent) {
          this.framesWithoutWheelEvents++;

          if (this.framesWithoutWheelEvents >= 2) {
            this.interactionLock = null;
            this.framesWithoutWheelEvents = 0;
          }
        }

        this.props.canvasContext.requestFrame();
      }

      this.frameHadWheelEvent = false;
    };

    this.onBeforeFrame = () => {
      this.resizeOverlayCanvasIfNeeded();
      this.renderRects();
      this.renderOverlays();
      this.maybeClearInteractionLock();
    };

    this.renderCanvas = () => {
      this.props.canvasContext.requestFrame();
    };

    this.lastDragPos = null;
    this.mouseDownPos = null;

    this.onMouseDown = ev => {
      this.mouseDownPos = this.lastDragPos = new _math.Vec2(ev.offsetX, ev.offsetY);
      this.updateCursor();
      window.addEventListener('mouseup', this.onWindowMouseUp);
    };

    this.onMouseDrag = ev => {
      if (!this.lastDragPos) return;
      const logicalMousePos = new _math.Vec2(ev.offsetX, ev.offsetY);
      this.pan(this.lastDragPos.minus(logicalMousePos));
      this.lastDragPos = logicalMousePos; // When panning by scrolling, the element under
      // the cursor will change, so clear the hovered label.

      if (this.hoveredLabel) {
        this.props.onNodeHover(null);
      }
    };

    this.onDblClick = ev => {
      if (this.hoveredLabel) {
        const hoveredBounds = this.hoveredLabel.configSpaceBounds;
        const viewportRect = new _math.Rect(hoveredBounds.origin.minus(new _math.Vec2(0, 1)), hoveredBounds.size.withY(this.props.configSpaceViewportRect.height()));
        this.props.setConfigSpaceViewportRect(viewportRect);
      }
    };

    this.onClick = ev => {
      const logicalMousePos = new _math.Vec2(ev.offsetX, ev.offsetY);
      const mouseDownPos = this.mouseDownPos;
      this.mouseDownPos = null;

      if (mouseDownPos && logicalMousePos.minus(mouseDownPos).length() > 5) {
        // If the cursor is more than 5 logical space pixels away from the mouse
        // down location, then don't interpret this event as a click.
        return;
      }

      if (this.hoveredLabel) {
        this.props.onNodeSelect(this.hoveredLabel.node);
        this.renderCanvas();
      } else {
        this.props.onNodeSelect(null);
      }
    };

    this.onWindowMouseUp = ev => {
      this.lastDragPos = null;
      this.updateCursor();
      window.removeEventListener('mouseup', this.onWindowMouseUp);
    };

    this.onMouseMove = ev => {
      this.updateCursor();

      if (this.lastDragPos) {
        ev.preventDefault();
        this.onMouseDrag(ev);
        return;
      }

      this.hoveredLabel = null;
      const logicalViewSpaceMouse = new _math.Vec2(ev.offsetX, ev.offsetY);
      const physicalViewSpaceMouse = this.logicalToPhysicalViewSpace().transformPosition(logicalViewSpaceMouse);
      const configSpaceMouse = this.configSpaceToPhysicalViewSpace().inverseTransformPosition(physicalViewSpaceMouse);
      if (!configSpaceMouse) return;

      const setHoveredLabel = (frame, depth = 0) => {
        const width = frame.end - frame.start;
        const y = this.props.renderInverted ? this.configSpaceSize().y - 1 - depth : depth;
        const configSpaceBounds = new _math.Rect(new _math.Vec2(frame.start, y), new _math.Vec2(width, 1));
        if (configSpaceMouse.x < configSpaceBounds.left()) return null;
        if (configSpaceMouse.x > configSpaceBounds.right()) return null;

        if (configSpaceBounds.contains(configSpaceMouse)) {
          this.hoveredLabel = {
            configSpaceBounds,
            node: frame.node
          };
        }

        for (let child of frame.children) {
          setHoveredLabel(child, depth + 1);
        }
      };

      for (let frame of this.props.flamechart.getLayers()[0] || []) {
        setHoveredLabel(frame);
      }

      if (this.hoveredLabel) {
        this.props.onNodeHover({
          node: this.hoveredLabel.node,
          event: ev
        });
      } else {
        this.props.onNodeHover(null);
      }

      this.renderCanvas();
    };

    this.onMouseLeave = ev => {
      this.hoveredLabel = null;
      this.props.onNodeHover(null);
      this.renderCanvas();
    };

    this.onWheel = ev => {
      ev.preventDefault();
      this.frameHadWheelEvent = true;
      const isZoom = ev.metaKey || ev.ctrlKey;
      let deltaY = ev.deltaY;
      let deltaX = ev.deltaX;

      if (ev.deltaMode === ev.DOM_DELTA_LINE) {
        deltaY *= this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT;
        deltaX *= this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT;
      }

      if (isZoom && this.interactionLock !== 'pan') {
        let multiplier = 1 + deltaY / 100; // On Chrome & Firefox, pinch-to-zoom maps to
        // WheelEvent + Ctrl Key. We'll accelerate it in
        // this case, since it feels a bit sluggish otherwise.

        if (ev.ctrlKey) {
          multiplier = 1 + deltaY / 40;
        }

        multiplier = (0, _math.clamp)(multiplier, 0.1, 10.0);
        this.zoom(new _math.Vec2(ev.offsetX, ev.offsetY), multiplier);
      } else if (this.interactionLock !== 'zoom') {
        this.pan(new _math.Vec2(deltaX, deltaY));
      }

      this.renderCanvas();
    };

    this.onWindowKeyPress = ev => {
      if (!this.container) return;
      const {
        width,
        height
      } = this.container.getBoundingClientRect();

      if (ev.key === '=' || ev.key === '+') {
        this.zoom(new _math.Vec2(width / 2, height / 2), 0.5);
        ev.preventDefault();
      } else if (ev.key === '-' || ev.key === '_') {
        this.zoom(new _math.Vec2(width / 2, height / 2), 2);
        ev.preventDefault();
      }

      if (ev.ctrlKey || ev.shiftKey || ev.metaKey) return; // NOTE: We intentionally use ev.code rather than ev.key for
      // WASD in order to have the keys retain the same layout even
      // if the keyboard layout is not QWERTY.
      //
      // See: https://github.com/jlfwong/speedscope/pull/184

      if (ev.key === '0') {
        this.zoom(new _math.Vec2(width / 2, height / 2), 1e9);
      } else if (ev.key === 'ArrowRight' || ev.code === 'KeyD') {
        this.pan(new _math.Vec2(100, 0));
      } else if (ev.key === 'ArrowLeft' || ev.code === 'KeyA') {
        this.pan(new _math.Vec2(-100, 0));
      } else if (ev.key === 'ArrowUp' || ev.code === 'KeyW') {
        this.pan(new _math.Vec2(0, -100));
      } else if (ev.key === 'ArrowDown' || ev.code === 'KeyS') {
        this.pan(new _math.Vec2(0, 100));
      } else if (ev.key === 'Escape') {
        this.props.onNodeSelect(null);
        this.renderCanvas();
      }
    };
  }

  getStyle() {
    return (0, _flamechartStyle.getFlamechartStyle)(this.props.theme);
  }

  setConfigSpaceViewportRect(r) {
    this.props.setConfigSpaceViewportRect(r);
  }

  configSpaceSize() {
    return new _math.Vec2(this.props.flamechart.getTotalWeight(), this.props.flamechart.getLayers().length);
  }

  physicalViewSize() {
    return new _math.Vec2(this.overlayCanvas ? this.overlayCanvas.width : 0, this.overlayCanvas ? this.overlayCanvas.height : 0);
  }

  physicalBounds() {
    if (this.props.renderInverted) {
      // If we're rendering inverted and the flamegraph won't fill the viewport,
      // we want to stick the flamegraph to the bottom of the viewport, not the top.
      const physicalViewportHeight = this.physicalViewSize().y;
      const physicalFlamegraphHeight = (this.configSpaceSize().y + 1) * this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT * window.devicePixelRatio;

      if (physicalFlamegraphHeight < physicalViewportHeight) {
        return new _math.Rect(new _math.Vec2(0, physicalViewportHeight - physicalFlamegraphHeight), this.physicalViewSize());
      }
    }

    return new _math.Rect(new _math.Vec2(0, 0), this.physicalViewSize());
  }

  configSpaceToPhysicalViewSpace() {
    return _math.AffineTransform.betweenRects(this.props.configSpaceViewportRect, this.physicalBounds());
  }

  logicalToPhysicalViewSpace() {
    return _math.AffineTransform.withScale(new _math.Vec2(window.devicePixelRatio, window.devicePixelRatio));
  }

  resizeOverlayCanvasIfNeeded() {
    if (!this.overlayCanvas) return;
    let {
      width,
      height
    } = this.overlayCanvas.getBoundingClientRect();
    {
      /*
      We render text at a higher resolution then scale down to
      ensure we're rendering at 1:1 device pixel ratio.
      This ensures our text is rendered crisply.
      */
    }
    width = Math.floor(width);
    height = Math.floor(height); // Still initializing: don't resize yet

    if (width === 0 || height === 0) return;
    const scaledWidth = width * window.devicePixelRatio;
    const scaledHeight = height * window.devicePixelRatio;
    if (scaledWidth === this.overlayCanvas.width && scaledHeight === this.overlayCanvas.height) return;
    this.overlayCanvas.width = scaledWidth;
    this.overlayCanvas.height = scaledHeight;
  }

  renderOverlays() {
    const ctx = this.overlayCtx;
    if (!ctx) return;
    if (this.props.configSpaceViewportRect.isEmpty()) return;
    const configToPhysical = this.configSpaceToPhysicalViewSpace();
    const physicalViewSpaceFontSize = _style.FontSize.LABEL * window.devicePixelRatio;
    const physicalViewSpaceFrameHeight = this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT * window.devicePixelRatio;
    const physicalViewSize = this.physicalViewSize();
    ctx.clearRect(0, 0, physicalViewSize.x, physicalViewSize.y);
    ctx.font = `${physicalViewSpaceFontSize}px/${physicalViewSpaceFrameHeight}px ${_style.FontFamily.MONOSPACE}`;
    ctx.textBaseline = 'alphabetic';
    const minWidthToRender = (0, _textUtils.cachedMeasureTextWidth)(ctx, 'M' + _textUtils.ELLIPSIS + 'M');
    const minConfigSpaceWidthToRender = (configToPhysical.inverseTransformVector(new _math.Vec2(minWidthToRender, 0)) || new _math.Vec2(0, 0)).x;
    const LABEL_PADDING_PX = 5 * window.devicePixelRatio;
    const labelBatch = new _canvas2dBatchRenderers.BatchCanvasTextRenderer();
    const fadedLabelBatch = new _canvas2dBatchRenderers.BatchCanvasTextRenderer();
    const matchedTextHighlightBatch = new _canvas2dBatchRenderers.BatchCanvasRectRenderer();
    const directlySelectedOutlineBatch = new _canvas2dBatchRenderers.BatchCanvasRectRenderer();
    const indirectlySelectedOutlineBatch = new _canvas2dBatchRenderers.BatchCanvasRectRenderer();
    const matchedFrameBatch = new _canvas2dBatchRenderers.BatchCanvasRectRenderer();

    const renderFrameLabelAndChildren = (frame, depth = 0) => {
      var _a;

      const width = frame.end - frame.start;
      const y = this.props.renderInverted ? this.configSpaceSize().y - 1 - depth : depth;
      const configSpaceBounds = new _math.Rect(new _math.Vec2(frame.start, y), new _math.Vec2(width, 1));
      if (width < minConfigSpaceWidthToRender) return;
      if (configSpaceBounds.left() > this.props.configSpaceViewportRect.right()) return;
      if (configSpaceBounds.right() < this.props.configSpaceViewportRect.left()) return;

      if (this.props.renderInverted) {
        if (configSpaceBounds.bottom() < this.props.configSpaceViewportRect.top()) return;
      } else {
        if (configSpaceBounds.top() > this.props.configSpaceViewportRect.bottom()) return;
      }

      if (configSpaceBounds.hasIntersectionWith(this.props.configSpaceViewportRect)) {
        let physicalLabelBounds = configToPhysical.transformRect(configSpaceBounds);

        if (physicalLabelBounds.left() < 0) {
          physicalLabelBounds = physicalLabelBounds.withOrigin(physicalLabelBounds.origin.withX(0)).withSize(physicalLabelBounds.size.withX(physicalLabelBounds.size.x + physicalLabelBounds.left()));
        }

        if (physicalLabelBounds.right() > physicalViewSize.x) {
          physicalLabelBounds = physicalLabelBounds.withSize(physicalLabelBounds.size.withX(physicalViewSize.x - physicalLabelBounds.left()));
        }

        if (physicalLabelBounds.width() > minWidthToRender) {
          const match = (_a = this.props.searchResults) === null || _a === void 0 ? void 0 : _a.getMatchForFrame(frame.node.frame);
          const trimmedText = (0, _textUtils.trimTextMid)(ctx, frame.node.frame.name, physicalLabelBounds.width() - 2 * LABEL_PADDING_PX);

          if (match) {
            const rangesToHighlightInTrimmedText = (0, _textUtils.remapRangesToTrimmedText)(trimmedText, match); // Once we have the character ranges to highlight, we need to
            // actually do the highlighting.

            let lastEndIndex = 0;
            let left = physicalLabelBounds.left() + LABEL_PADDING_PX;
            const padding = (physicalViewSpaceFrameHeight - physicalViewSpaceFontSize) / 2 - 2;

            for (let [startIndex, endIndex] of rangesToHighlightInTrimmedText) {
              left += (0, _textUtils.cachedMeasureTextWidth)(ctx, trimmedText.trimmedString.substring(lastEndIndex, startIndex));
              const highlightWidth = (0, _textUtils.cachedMeasureTextWidth)(ctx, trimmedText.trimmedString.substring(startIndex, endIndex));
              matchedTextHighlightBatch.rect({
                x: left,
                y: physicalLabelBounds.top() + padding,
                w: highlightWidth,
                h: physicalViewSpaceFrameHeight - 2 * padding
              });
              left += highlightWidth;
              lastEndIndex = endIndex;
            }
          }

          const batch = this.props.searchResults != null && !match ? fadedLabelBatch : labelBatch;
          batch.text({
            text: trimmedText.trimmedString,
            // This is specifying the position of the starting text baseline.
            x: physicalLabelBounds.left() + LABEL_PADDING_PX,
            y: Math.round(physicalLabelBounds.bottom() - (physicalViewSpaceFrameHeight - physicalViewSpaceFontSize) / 2)
          });
        }
      }

      for (let child of frame.children) {
        renderFrameLabelAndChildren(child, depth + 1);
      }
    };

    const frameOutlineWidth = 2 * window.devicePixelRatio;
    ctx.strokeStyle = this.props.theme.selectionSecondaryColor;
    const minConfigSpaceWidthToRenderOutline = (configToPhysical.inverseTransformVector(new _math.Vec2(1, 0)) || new _math.Vec2(0, 0)).x;

    const renderSpecialFrameOutlines = (frame, depth = 0) => {
      var _a;

      if (!this.props.selectedNode && this.props.searchResults == null) return;
      const width = frame.end - frame.start;
      const y = this.props.renderInverted ? this.configSpaceSize().y - 1 - depth : depth;
      const configSpaceBounds = new _math.Rect(new _math.Vec2(frame.start, y), new _math.Vec2(width, 1));
      if (width < minConfigSpaceWidthToRenderOutline) return;
      if (configSpaceBounds.left() > this.props.configSpaceViewportRect.right()) return;
      if (configSpaceBounds.right() < this.props.configSpaceViewportRect.left()) return;
      if (configSpaceBounds.top() > this.props.configSpaceViewportRect.bottom()) return;

      if (configSpaceBounds.hasIntersectionWith(this.props.configSpaceViewportRect)) {
        if ((_a = this.props.searchResults) === null || _a === void 0 ? void 0 : _a.getMatchForFrame(frame.node.frame)) {
          const physicalRectBounds = configToPhysical.transformRect(configSpaceBounds);
          matchedFrameBatch.rect({
            x: Math.round(physicalRectBounds.left() + frameOutlineWidth / 2),
            y: Math.round(physicalRectBounds.top() + frameOutlineWidth / 2),
            w: Math.round(Math.max(0, physicalRectBounds.width() - frameOutlineWidth)),
            h: Math.round(Math.max(0, physicalRectBounds.height() - frameOutlineWidth))
          });
        }

        if (this.props.selectedNode != null && frame.node.frame === this.props.selectedNode.frame) {
          let batch = frame.node === this.props.selectedNode ? directlySelectedOutlineBatch : indirectlySelectedOutlineBatch;
          const physicalRectBounds = configToPhysical.transformRect(configSpaceBounds);
          batch.rect({
            x: Math.round(physicalRectBounds.left() + 1 + frameOutlineWidth / 2),
            y: Math.round(physicalRectBounds.top() + 1 + frameOutlineWidth / 2),
            w: Math.round(Math.max(0, physicalRectBounds.width() - 2 - frameOutlineWidth)),
            h: Math.round(Math.max(0, physicalRectBounds.height() - 2 - frameOutlineWidth))
          });
        }
      }

      for (let child of frame.children) {
        renderSpecialFrameOutlines(child, depth + 1);
      }
    };

    for (let frame of this.props.flamechart.getLayers()[0] || []) {
      renderSpecialFrameOutlines(frame);
    }

    for (let frame of this.props.flamechart.getLayers()[0] || []) {
      renderFrameLabelAndChildren(frame);
    }

    const theme = this.props.theme;
    matchedFrameBatch.fill(ctx, theme.searchMatchPrimaryColor);
    matchedTextHighlightBatch.fill(ctx, theme.searchMatchSecondaryColor);
    fadedLabelBatch.fill(ctx, theme.fgSecondaryColor);
    labelBatch.fill(ctx, this.props.searchResults != null ? theme.searchMatchTextColor : theme.fgPrimaryColor);
    indirectlySelectedOutlineBatch.stroke(ctx, theme.selectionSecondaryColor, frameOutlineWidth);
    directlySelectedOutlineBatch.stroke(ctx, theme.selectionPrimaryColor, frameOutlineWidth);

    if (this.hoveredLabel) {
      let color = theme.fgPrimaryColor;

      if (this.props.selectedNode === this.hoveredLabel.node) {
        color = theme.selectionPrimaryColor;
      }

      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.strokeStyle = color;
      const physicalViewBounds = configToPhysical.transformRect(this.hoveredLabel.configSpaceBounds);
      ctx.strokeRect(Math.round(physicalViewBounds.left()), Math.round(physicalViewBounds.top()), Math.round(Math.max(0, physicalViewBounds.width())), Math.round(Math.max(0, physicalViewBounds.height())));
    }

    this.renderTimeIndicators();
  }

  renderTimeIndicators() {
    const ctx = this.overlayCtx;
    if (!ctx) return;
    const physicalViewSpaceFrameHeight = this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT * window.devicePixelRatio;
    const physicalViewSize = this.physicalViewSize();
    const configToPhysical = this.configSpaceToPhysicalViewSpace();
    const physicalViewSpaceFontSize = _style.FontSize.LABEL * window.devicePixelRatio;
    const labelPaddingPx = (physicalViewSpaceFrameHeight - physicalViewSpaceFontSize) / 2;
    const left = this.props.configSpaceViewportRect.left();
    const right = this.props.configSpaceViewportRect.right(); // We want about 10 gridlines to be visible, and want the unit to be
    // 1eN, 2eN, or 5eN for some N
    // Ideally, we want an interval every 100 logical screen pixels

    const logicalToConfig = (this.configSpaceToPhysicalViewSpace().inverted() || new _math.AffineTransform()).times(this.logicalToPhysicalViewSpace());
    const targetInterval = logicalToConfig.transformVector(new _math.Vec2(200, 1)).x;
    const minInterval = Math.pow(10, Math.floor(Math.log10(targetInterval)));
    let interval = minInterval;

    if (targetInterval / interval > 5) {
      interval *= 5;
    } else if (targetInterval / interval > 2) {
      interval *= 2;
    }

    const theme = this.props.theme;
    {
      const y = this.props.renderInverted ? physicalViewSize.y - physicalViewSpaceFrameHeight : 0;
      ctx.fillStyle = _color.Color.fromCSSHex(theme.bgPrimaryColor).withAlpha(0.8).toCSS();
      ctx.fillRect(0, y, physicalViewSize.x, physicalViewSpaceFrameHeight);
      ctx.textBaseline = 'top';

      for (let x = Math.ceil(left / interval) * interval; x < right; x += interval) {
        // TODO(jlfwong): Ensure that labels do not overlap
        const pos = Math.round(configToPhysical.transformPosition(new _math.Vec2(x, 0)).x);
        const labelText = this.props.flamechart.formatValue(x);
        const textWidth = (0, _textUtils.cachedMeasureTextWidth)(ctx, labelText);
        ctx.fillStyle = theme.fgPrimaryColor;
        ctx.fillText(labelText, pos - textWidth - labelPaddingPx, y + labelPaddingPx);
        ctx.fillStyle = theme.fgSecondaryColor;
        ctx.fillRect(pos, 0, 1, physicalViewSize.y);
      }
    }
  }

  updateConfigSpaceViewport() {
    if (!this.container) return;
    const {
      logicalSpaceViewportSize
    } = this.props;
    const bounds = this.container.getBoundingClientRect();
    const {
      width,
      height
    } = bounds; // Still initializing: don't resize yet

    if (width < 2 || height < 2) return;

    if (this.props.configSpaceViewportRect.isEmpty()) {
      const configSpaceViewportHeight = height / this.LOGICAL_VIEW_SPACE_FRAME_HEIGHT;

      if (this.props.renderInverted) {
        this.setConfigSpaceViewportRect(new _math.Rect(new _math.Vec2(0, this.configSpaceSize().y - configSpaceViewportHeight + 1), new _math.Vec2(this.configSpaceSize().x, configSpaceViewportHeight)));
      } else {
        this.setConfigSpaceViewportRect(new _math.Rect(new _math.Vec2(0, -1), new _math.Vec2(this.configSpaceSize().x, configSpaceViewportHeight)));
      }
    } else if (!logicalSpaceViewportSize.equals(_math.Vec2.zero) && (logicalSpaceViewportSize.x !== width || logicalSpaceViewportSize.y !== height)) {
      // Resize the viewport rectangle to match the window size aspect
      // ratio.
      this.setConfigSpaceViewportRect(this.props.configSpaceViewportRect.withSize(this.props.configSpaceViewportRect.size.timesPointwise(new _math.Vec2(width / logicalSpaceViewportSize.x, height / logicalSpaceViewportSize.y))));
    }

    const newSize = new _math.Vec2(width, height);

    if (!newSize.equals(logicalSpaceViewportSize)) {
      this.props.setLogicalSpaceViewportSize(newSize);
    }
  }

  renderRects() {
    if (!this.container) return;
    this.updateConfigSpaceViewport();
    if (this.props.configSpaceViewportRect.isEmpty()) return;
    this.props.canvasContext.renderBehind(this.container, () => {
      this.props.flamechartRenderer.render({
        physicalSpaceDstRect: this.physicalBounds(),
        configSpaceSrcRect: this.props.configSpaceViewportRect,
        renderOutlines: true
      });
    });
  }

  pan(logicalViewSpaceDelta) {
    this.interactionLock = 'pan';
    const physicalDelta = this.logicalToPhysicalViewSpace().transformVector(logicalViewSpaceDelta);
    const configDelta = this.configSpaceToPhysicalViewSpace().inverseTransformVector(physicalDelta);

    if (this.hoveredLabel) {
      this.props.onNodeHover(null);
    }

    if (!configDelta) return;
    this.props.transformViewport(_math.AffineTransform.withTranslation(configDelta));
  }

  zoom(logicalViewSpaceCenter, multiplier) {
    this.interactionLock = 'zoom';
    const physicalCenter = this.logicalToPhysicalViewSpace().transformPosition(logicalViewSpaceCenter);
    const configSpaceCenter = this.configSpaceToPhysicalViewSpace().inverseTransformPosition(physicalCenter);
    if (!configSpaceCenter) return;

    const zoomTransform = _math.AffineTransform.withTranslation(configSpaceCenter.times(-1)).scaledBy(new _math.Vec2(multiplier, 1)).translatedBy(configSpaceCenter);

    this.props.transformViewport(zoomTransform);
  }

  updateCursor() {
    if (this.lastDragPos) {
      document.body.style.cursor = 'grabbing';
      document.body.style.cursor = '-webkit-grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.flamechart !== nextProps.flamechart) {
      this.hoveredLabel = null;
      this.renderCanvas();
    } else if (this.props.searchResults !== nextProps.searchResults) {
      this.renderCanvas();
    } else if (this.props.selectedNode !== nextProps.selectedNode) {
      this.renderCanvas();
    } else if (this.props.configSpaceViewportRect !== nextProps.configSpaceViewportRect) {
      this.renderCanvas();
    } else if (this.props.canvasContext !== nextProps.canvasContext) {
      if (this.props.canvasContext) {
        this.props.canvasContext.removeBeforeFrameHandler(this.onBeforeFrame);
      }

      if (nextProps.canvasContext) {
        nextProps.canvasContext.addBeforeFrameHandler(this.onBeforeFrame);
        nextProps.canvasContext.requestFrame();
      }
    }
  }

  componentDidMount() {
    this.props.canvasContext.addBeforeFrameHandler(this.onBeforeFrame);
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onWindowKeyPress);
  }

  componentWillUnmount() {
    this.props.canvasContext.removeBeforeFrameHandler(this.onBeforeFrame);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onWindowKeyPress);
  }

  render() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.panZoomView, _style.commonStyle.vbox),
      onMouseDown: this.onMouseDown,
      onMouseMove: this.onMouseMove,
      onMouseLeave: this.onMouseLeave,
      onClick: this.onClick,
      onDblClick: this.onDblClick,
      onWheel: this.onWheel,
      ref: this.containerRef
    }, (0, _preact.h)("canvas", {
      width: 1,
      height: 1,
      ref: this.overlayCanvasRef,
      className: (0, _aphrodite.css)(style.fill)
    }));
  }

}

exports.FlamechartPanZoomView = FlamechartPanZoomView;
},{"../lib/math":"../src/lib/math.ts","./style":"../src/views/style.ts","../lib/text-utils":"../src/lib/text-utils.ts","./flamechart-style":"../src/views/flamechart-style.ts","preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","../lib/canvas-2d-batch-renderers":"../src/lib/canvas-2d-batch-renderers.ts","../lib/color":"../src/lib/color.ts"}],"../src/views/hovertip.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Hovertip = Hovertip;

var _style = require("./style");

var _aphrodite = require("aphrodite");

var _preact = require("preact");

var _theme = require("./themes/theme");

var _hooks = require("preact/hooks");

function Hovertip(props) {
  const style = getStyle((0, _theme.useTheme)());
  const {
    containerSize,
    offset
  } = props;
  const containerWidth = containerSize.x;
  const containerHeight = containerSize.y;
  const OFFSET_FROM_MOUSE = 7;
  const updateLocation = (0, _hooks.useCallback)(el => {
    if (!el) return;
    const clientRect = el.getBoundingClientRect(); // Place the hovertip to the right of the cursor.

    let leftEdgeX = offset.x + OFFSET_FROM_MOUSE; // If this would cause it to overflow the container, align the right
    // edge of the hovertip with the right edge of the container.

    if (leftEdgeX + clientRect.width > containerWidth - 1) {
      leftEdgeX = containerWidth - clientRect.width - 1; // If aligning the right edge overflows the container, align the left edge
      // of the hovertip with the left edge of the container.

      if (leftEdgeX < 1) {
        leftEdgeX = 1;
      }
    }

    el.style.left = `${leftEdgeX}px`; // Place the tooltip below the cursor

    let topEdgeY = offset.y + OFFSET_FROM_MOUSE; // If this would cause it to overflow the container, place the hovertip
    // above the cursor instead. This intentionally differs from the horizontal
    // axis logic to avoid the cursor being in the middle of a hovertip when
    // possible.

    if (topEdgeY + clientRect.height > containerHeight - 1) {
      topEdgeY = offset.y - clientRect.height - 1; // If placing the hovertip above the cursor overflows the container, align
      // the top edge of the hovertip with the top edge of the container.

      if (topEdgeY < 1) {
        topEdgeY = 1;
      }
    }

    el.style.top = `${topEdgeY}px`;
  }, [containerWidth, containerHeight, offset.x, offset.y]);
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.hoverTip),
    ref: updateLocation
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.hoverTipRow)
  }, props.children));
}

const HOVERTIP_PADDING = 2;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  hoverTip: {
    position: 'absolute',
    background: theme.bgPrimaryColor,
    border: '1px solid black',
    maxWidth: _style.Sizes.TOOLTIP_WIDTH_MAX,
    paddingTop: HOVERTIP_PADDING,
    paddingBottom: HOVERTIP_PADDING,
    pointerEvents: 'none',
    userSelect: 'none',
    fontSize: _style.FontSize.LABEL,
    fontFamily: _style.FontFamily.MONOSPACE,
    zIndex: _style.ZIndex.HOVERTIP
  },
  hoverTipRow: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    paddingLeft: HOVERTIP_PADDING,
    paddingRight: HOVERTIP_PADDING,
    maxWidth: _style.Sizes.TOOLTIP_WIDTH_MAX
  }
}));
},{"./style":"../src/views/style.ts","aphrodite":"../node_modules/aphrodite/es/index.js","preact":"../node_modules/preact/dist/preact.module.js","./themes/theme":"../src/views/themes/theme.tsx","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js"}],"../src/views/flamechart-search-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartSearchView = exports.FlamechartSearchContextProvider = exports.FlamechartSearchContext = void 0;

var _compat = require("preact/compat");

var _hooks = require("preact/hooks");

var _searchView = require("./search-view");

var _profileSearch = require("../lib/profile-search");

var _math = require("../lib/math");

var _preact = require("preact");

const FlamechartSearchContext = (0, _preact.createContext)(null);
exports.FlamechartSearchContext = FlamechartSearchContext;

const FlamechartSearchContextProvider = ({
  flamechart,
  selectedNode,
  setSelectedNode,
  configSpaceViewportRect,
  setConfigSpaceViewportRect,
  children
}) => {
  const profileSearchResults = (0, _hooks.useContext)(_searchView.ProfileSearchContext);
  const flamechartSearchResults = (0, _hooks.useMemo)(() => {
    if (profileSearchResults == null) {
      return null;
    }

    return new _profileSearch.FlamechartSearchResults(flamechart, profileSearchResults);
  }, [flamechart, profileSearchResults]);
  return (0, _preact.h)(FlamechartSearchContext.Provider, {
    value: {
      results: flamechartSearchResults,
      flamechart,
      selectedNode,
      setSelectedNode,
      configSpaceViewportRect,
      setConfigSpaceViewportRect
    }
  }, children);
};

exports.FlamechartSearchContextProvider = FlamechartSearchContextProvider;
const FlamechartSearchView = (0, _compat.memo)(() => {
  const flamechartData = (0, _hooks.useContext)(FlamechartSearchContext); // TODO(jlfwong): This pattern is pretty gross, but I really don't want values
  // that can be undefined or null.

  const searchResults = flamechartData == null ? null : flamechartData.results;
  const selectedNode = flamechartData == null ? null : flamechartData.selectedNode;
  const setSelectedNode = flamechartData == null ? null : flamechartData.setSelectedNode;
  const configSpaceViewportRect = flamechartData == null ? null : flamechartData.configSpaceViewportRect;
  const setConfigSpaceViewportRect = flamechartData == null ? null : flamechartData.setConfigSpaceViewportRect;
  const flamechart = flamechartData == null ? null : flamechartData.flamechart;
  const numResults = searchResults == null ? null : searchResults.count();
  const resultIndex = (0, _hooks.useMemo)(() => {
    if (searchResults == null) return null;
    if (selectedNode == null) return null;
    return searchResults.indexOf(selectedNode);
  }, [searchResults, selectedNode]);
  const selectAndZoomToMatch = (0, _hooks.useCallback)(match => {
    if (!setSelectedNode) return;
    if (!flamechart) return;
    if (!configSpaceViewportRect) return;
    if (!setConfigSpaceViewportRect) return; // After the node is selected, we want to set the viewport so that the new
    // node can be seen clearly.
    //
    // TODO(jlfwong): The lack of animation here can be kind of jarring. It
    // would be nice to have some easier way for people to orient themselves
    // after the viewport shifted.

    const configSpaceResultBounds = match.configSpaceBounds;
    const viewportRect = new _math.Rect(configSpaceResultBounds.origin.minus(new _math.Vec2(0, 1)), configSpaceResultBounds.size.withY(configSpaceViewportRect.height()));
    setSelectedNode(match.node);
    setConfigSpaceViewportRect(flamechart.getClampedConfigSpaceViewportRect({
      configSpaceViewportRect: viewportRect
    }));
  }, [configSpaceViewportRect, setConfigSpaceViewportRect, setSelectedNode, flamechart]);
  const {
    selectPrev,
    selectNext
  } = (0, _hooks.useMemo)(() => {
    if (numResults == null || numResults === 0 || searchResults == null) {
      return {
        selectPrev: () => {},
        selectNext: () => {}
      };
    }

    return {
      selectPrev: () => {
        if (!(searchResults === null || searchResults === void 0 ? void 0 : searchResults.at)) return;
        if (numResults == null || numResults === 0) return;
        let index = resultIndex == null ? numResults - 1 : resultIndex - 1;
        if (index < 0) index = numResults - 1;
        const result = searchResults.at(index);
        selectAndZoomToMatch(result);
      },
      selectNext: () => {
        if (!(searchResults === null || searchResults === void 0 ? void 0 : searchResults.at)) return;
        if (numResults == null || numResults === 0) return;
        let index = resultIndex == null ? 0 : resultIndex + 1;
        if (index >= numResults) index = 0;
        const result = searchResults.at(index);
        selectAndZoomToMatch(result);
      }
    };
  }, [numResults, resultIndex, searchResults, selectAndZoomToMatch]);
  return (0, _preact.h)(_searchView.SearchView, {
    resultIndex: resultIndex,
    numResults: numResults,
    selectPrev: selectPrev,
    selectNext: selectNext
  });
});
exports.FlamechartSearchView = FlamechartSearchView;
},{"preact/compat":"../node_modules/preact/compat/dist/compat.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./search-view":"../src/views/search-view.tsx","../lib/profile-search":"../src/lib/profile-search.ts","../lib/math":"../src/lib/math.ts","preact":"../node_modules/preact/dist/preact.module.js"}],"../src/lib/preact-helpers.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatelessComponent = void 0;

var _preact = require("preact");

class StatelessComponent extends _preact.Component {}

exports.StatelessComponent = StatelessComponent;
},{"preact":"../node_modules/preact/dist/preact.module.js"}],"../src/views/flamechart-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlamechartView = void 0;

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _math = require("../lib/math");

var _utils = require("../lib/utils");

var _flamechartMinimapView = require("./flamechart-minimap-view");

var _style = require("./style");

var _flamechartDetailView = require("./flamechart-detail-view");

var _flamechartPanZoomView = require("./flamechart-pan-zoom-view");

var _hovertip = require("./hovertip");

var _searchView = require("./search-view");

var _flamechartSearchView = require("./flamechart-search-view");

var _flamechartStyle = require("./flamechart-style");

var _preactHelpers = require("../lib/preact-helpers");

class FlamechartView extends _preactHelpers.StatelessComponent {
  constructor() {
    super(...arguments);

    this.setConfigSpaceViewportRect = viewportRect => {
      const configSpaceDetailViewHeight = _style.Sizes.DETAIL_VIEW_HEIGHT / _style.Sizes.FRAME_HEIGHT;
      const configSpaceSize = this.configSpaceSize();
      const width = this.props.flamechart.getClampedViewportWidth(viewportRect.size.x);
      const size = viewportRect.size.withX(width);

      const origin = _math.Vec2.clamp(viewportRect.origin, new _math.Vec2(0, -1), _math.Vec2.max(_math.Vec2.zero, configSpaceSize.minus(size).plus(new _math.Vec2(0, configSpaceDetailViewHeight + 1))));

      this.props.setConfigSpaceViewportRect(new _math.Rect(origin, viewportRect.size.withX(width)));
    };

    this.setLogicalSpaceViewportSize = logicalSpaceViewportSize => {
      this.props.setLogicalSpaceViewportSize(logicalSpaceViewportSize);
    };

    this.transformViewport = transform => {
      const viewportRect = transform.transformRect(this.props.configSpaceViewportRect);
      this.setConfigSpaceViewportRect(viewportRect);
    };

    this.onNodeHover = hover => {
      this.props.setNodeHover(hover);
    };

    this.onNodeClick = node => {
      this.props.setSelectedNode(node);
    };

    this.container = null;

    this.containerRef = container => {
      this.container = container || null;
    };
  }

  getStyle() {
    return (0, _flamechartStyle.getFlamechartStyle)(this.props.theme);
  }

  configSpaceSize() {
    return new _math.Vec2(this.props.flamechart.getTotalWeight(), this.props.flamechart.getLayers().length);
  }

  formatValue(weight) {
    const totalWeight = this.props.flamechart.getTotalWeight();
    const percent = 100 * weight / totalWeight;
    const formattedPercent = (0, _utils.formatPercent)(percent);
    return `${this.props.flamechart.formatValue(weight)} (${formattedPercent})`;
  }

  renderTooltip() {
    if (!this.container) return null;
    const {
      hover
    } = this.props;
    if (!hover) return null;
    const {
      width,
      height,
      left,
      top
    } = this.container.getBoundingClientRect();
    const offset = new _math.Vec2(hover.event.clientX - left, hover.event.clientY - top);
    const frame = hover.node.frame;
    const style = this.getStyle();
    return (0, _preact.h)(_hovertip.Hovertip, {
      containerSize: new _math.Vec2(width, height),
      offset: offset
    }, (0, _preact.h)("span", {
      className: (0, _aphrodite.css)(style.hoverCount)
    }, this.formatValue(hover.node.getTotalWeight())), ' ', frame.name, frame.file ? (0, _preact.h)("div", null, frame.file, ":", frame.line) : undefined);
  }

  render() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.fill, _style.commonStyle.vbox),
      ref: this.containerRef
    }, (0, _preact.h)(_flamechartMinimapView.FlamechartMinimapView, {
      theme: this.props.theme,
      configSpaceViewportRect: this.props.configSpaceViewportRect,
      transformViewport: this.transformViewport,
      flamechart: this.props.flamechart,
      flamechartRenderer: this.props.flamechartRenderer,
      canvasContext: this.props.canvasContext,
      setConfigSpaceViewportRect: this.setConfigSpaceViewportRect
    }), (0, _preact.h)(_searchView.ProfileSearchContext.Consumer, null, searchResults => (0, _preact.h)(_preact.Fragment, null, (0, _preact.h)(_flamechartPanZoomView.FlamechartPanZoomView, {
      theme: this.props.theme,
      canvasContext: this.props.canvasContext,
      flamechart: this.props.flamechart,
      flamechartRenderer: this.props.flamechartRenderer,
      renderInverted: false,
      onNodeHover: this.onNodeHover,
      onNodeSelect: this.onNodeClick,
      selectedNode: this.props.selectedNode,
      transformViewport: this.transformViewport,
      configSpaceViewportRect: this.props.configSpaceViewportRect,
      setConfigSpaceViewportRect: this.setConfigSpaceViewportRect,
      logicalSpaceViewportSize: this.props.logicalSpaceViewportSize,
      setLogicalSpaceViewportSize: this.setLogicalSpaceViewportSize,
      searchResults: searchResults
    }), (0, _preact.h)(_flamechartSearchView.FlamechartSearchView, null))), this.renderTooltip(), this.props.selectedNode && (0, _preact.h)(_flamechartDetailView.FlamechartDetailView, {
      flamechart: this.props.flamechart,
      getCSSColorForFrame: this.props.getCSSColorForFrame,
      selectedNode: this.props.selectedNode
    }));
  }

}

exports.FlamechartView = FlamechartView;
},{"preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","../lib/math":"../src/lib/math.ts","../lib/utils":"../src/lib/utils.ts","./flamechart-minimap-view":"../src/views/flamechart-minimap-view.tsx","./style":"../src/views/style.ts","./flamechart-detail-view":"../src/views/flamechart-detail-view.tsx","./flamechart-pan-zoom-view":"../src/views/flamechart-pan-zoom-view.tsx","./hovertip":"../src/views/hovertip.tsx","./search-view":"../src/views/search-view.tsx","./flamechart-search-view":"../src/views/flamechart-search-view.tsx","./flamechart-style":"../src/views/flamechart-style.ts","../lib/preact-helpers":"../src/lib/preact-helpers.tsx"}],"../src/views/flamechart-view-container.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFlamechartSetters = useFlamechartSetters;
exports.LeftHeavyFlamechartView = exports.getLeftHeavyFlamechart = exports.ChronoFlamechartView = exports.createMemoizedFlamechartRenderer = exports.getChronoViewFlamechart = void 0;

var _preact = require("preact");

var _flamechart = require("../lib/flamechart");

var _flamechartRenderer = require("../gl/flamechart-renderer");

var _utils = require("../lib/utils");

var _flamechartView = require("./flamechart-view");

var _getters = require("../app-state/getters");

var _compat = require("preact/compat");

var _flamechartSearchView = require("./flamechart-search-view");

var _theme = require("./themes/theme");

var _profileGroup = require("../app-state/profile-group");

var _appState = require("../app-state");

function useFlamechartSetters(id, atom = _appState.profileGroupAtom) {
  return {
    setNodeHover: (0, _compat.useCallback)(hover => {
      atom.setFlamechartHoveredNode(id, hover);
    }, [atom, id]),
    setLogicalSpaceViewportSize: (0, _compat.useCallback)(logicalSpaceViewportSize => {
      atom.setLogicalSpaceViewportSize(id, logicalSpaceViewportSize);
    }, [atom, id]),
    setConfigSpaceViewportRect: (0, _compat.useCallback)(configSpaceViewportRect => {
      atom.setConfigSpaceViewportRect(id, configSpaceViewportRect);
    }, [atom, id]),
    setSelectedNode: (0, _compat.useCallback)(selectedNode => {
      atom.setSelectedNode(id, selectedNode);
    }, [atom, id])
  };
}

const getChronoViewFlamechart = (0, _utils.memoizeByShallowEquality)(({
  profile,
  getColorBucketForFrame
}) => {
  return new _flamechart.Flamechart({
    getTotalWeight: profile.getTotalWeight.bind(profile),
    forEachCall: profile.forEachCall.bind(profile),
    formatValue: profile.formatValue.bind(profile),
    getColorBucketForFrame
  });
});
exports.getChronoViewFlamechart = getChronoViewFlamechart;

const createMemoizedFlamechartRenderer = options => (0, _utils.memoizeByShallowEquality)(({
  canvasContext,
  flamechart
}) => {
  return new _flamechartRenderer.FlamechartRenderer(canvasContext.gl, (0, _getters.getRowAtlas)(canvasContext), flamechart, canvasContext.rectangleBatchRenderer, canvasContext.flamechartColorPassRenderer, options);
});

exports.createMemoizedFlamechartRenderer = createMemoizedFlamechartRenderer;
const getChronoViewFlamechartRenderer = createMemoizedFlamechartRenderer();
const ChronoFlamechartView = (0, _compat.memo)(props => {
  const {
    activeProfileState,
    glCanvas
  } = props;
  const {
    profile,
    chronoViewState
  } = activeProfileState;
  const theme = (0, _theme.useTheme)();
  const canvasContext = (0, _getters.getCanvasContext)({
    theme,
    canvas: glCanvas
  });
  const frameToColorBucket = (0, _getters.getFrameToColorBucket)(profile);
  const getColorBucketForFrame = (0, _getters.createGetColorBucketForFrame)(frameToColorBucket);
  const getCSSColorForFrame = (0, _getters.createGetCSSColorForFrame)({
    theme,
    frameToColorBucket
  });
  const flamechart = getChronoViewFlamechart({
    profile,
    getColorBucketForFrame
  });
  const flamechartRenderer = getChronoViewFlamechartRenderer({
    canvasContext,
    flamechart
  });
  const setters = useFlamechartSetters(_profileGroup.FlamechartID.CHRONO);
  return (0, _preact.h)(_flamechartSearchView.FlamechartSearchContextProvider, {
    flamechart: flamechart,
    selectedNode: chronoViewState.selectedNode,
    setSelectedNode: setters.setSelectedNode,
    configSpaceViewportRect: chronoViewState.configSpaceViewportRect,
    setConfigSpaceViewportRect: setters.setConfigSpaceViewportRect
  }, (0, _preact.h)(_flamechartView.FlamechartView, Object.assign({
    theme: theme,
    renderInverted: false,
    flamechart: flamechart,
    flamechartRenderer: flamechartRenderer,
    canvasContext: canvasContext,
    getCSSColorForFrame: getCSSColorForFrame
  }, chronoViewState, setters)));
});
exports.ChronoFlamechartView = ChronoFlamechartView;
const getLeftHeavyFlamechart = (0, _utils.memoizeByShallowEquality)(({
  profile,
  getColorBucketForFrame
}) => {
  return new _flamechart.Flamechart({
    getTotalWeight: profile.getTotalNonIdleWeight.bind(profile),
    forEachCall: profile.forEachCallGrouped.bind(profile),
    formatValue: profile.formatValue.bind(profile),
    getColorBucketForFrame
  });
});
exports.getLeftHeavyFlamechart = getLeftHeavyFlamechart;
const getLeftHeavyFlamechartRenderer = createMemoizedFlamechartRenderer();
const LeftHeavyFlamechartView = (0, _compat.memo)(ownProps => {
  const {
    activeProfileState,
    glCanvas
  } = ownProps;
  const {
    profile,
    leftHeavyViewState
  } = activeProfileState;
  const theme = (0, _theme.useTheme)();
  const canvasContext = (0, _getters.getCanvasContext)({
    theme,
    canvas: glCanvas
  });
  const frameToColorBucket = (0, _getters.getFrameToColorBucket)(profile);
  const getColorBucketForFrame = (0, _getters.createGetColorBucketForFrame)(frameToColorBucket);
  const getCSSColorForFrame = (0, _getters.createGetCSSColorForFrame)({
    theme,
    frameToColorBucket
  });
  const flamechart = getLeftHeavyFlamechart({
    profile,
    getColorBucketForFrame
  });
  const flamechartRenderer = getLeftHeavyFlamechartRenderer({
    canvasContext,
    flamechart
  });
  const setters = useFlamechartSetters(_profileGroup.FlamechartID.LEFT_HEAVY);
  return (0, _preact.h)(_flamechartSearchView.FlamechartSearchContextProvider, {
    flamechart: flamechart,
    selectedNode: leftHeavyViewState.selectedNode,
    setSelectedNode: setters.setSelectedNode,
    configSpaceViewportRect: leftHeavyViewState.configSpaceViewportRect,
    setConfigSpaceViewportRect: setters.setConfigSpaceViewportRect
  }, (0, _preact.h)(_flamechartView.FlamechartView, Object.assign({
    theme: theme,
    renderInverted: false,
    flamechart: flamechart,
    flamechartRenderer: flamechartRenderer,
    canvasContext: canvasContext,
    getCSSColorForFrame: getCSSColorForFrame
  }, leftHeavyViewState, setters)));
});
exports.LeftHeavyFlamechartView = LeftHeavyFlamechartView;
},{"preact":"../node_modules/preact/dist/preact.module.js","../lib/flamechart":"../src/lib/flamechart.ts","../gl/flamechart-renderer":"../src/gl/flamechart-renderer.ts","../lib/utils":"../src/lib/utils.ts","./flamechart-view":"../src/views/flamechart-view.tsx","../app-state/getters":"../src/app-state/getters.ts","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","./flamechart-search-view":"../src/views/flamechart-search-view.tsx","./themes/theme":"../src/views/themes/theme.tsx","../app-state/profile-group":"../src/app-state/profile-group.ts","../app-state":"../src/app-state/index.ts"}],"../src/views/flamechart-wrapper.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStyle = exports.FlamechartWrapper = void 0;

var _aphrodite = require("aphrodite");

var _preact = require("preact");

var _style = require("./style");

var _math = require("../lib/math");

var _flamechartPanZoomView = require("./flamechart-pan-zoom-view");

var _utils = require("../lib/utils");

var _hovertip = require("./hovertip");

var _theme = require("./themes/theme");

var _preactHelpers = require("../lib/preact-helpers");

class FlamechartWrapper extends _preactHelpers.StatelessComponent {
  constructor() {
    super(...arguments);

    this.setConfigSpaceViewportRect = configSpaceViewportRect => {
      this.props.setConfigSpaceViewportRect(this.clampViewportToFlamegraph(configSpaceViewportRect));
    };

    this.setLogicalSpaceViewportSize = logicalSpaceViewportSize => {
      this.props.setLogicalSpaceViewportSize(logicalSpaceViewportSize);
    };

    this.transformViewport = transform => {
      this.setConfigSpaceViewportRect(transform.transformRect(this.props.configSpaceViewportRect));
    };

    this.container = null;

    this.containerRef = container => {
      this.container = container || null;
    };

    this.setNodeHover = hover => {
      this.props.setNodeHover(hover);
    };
  }

  clampViewportToFlamegraph(viewportRect) {
    const {
      flamechart,
      renderInverted
    } = this.props;
    return flamechart.getClampedConfigSpaceViewportRect({
      configSpaceViewportRect: viewportRect,
      renderInverted
    });
  }

  formatValue(weight) {
    const totalWeight = this.props.flamechart.getTotalWeight();
    const percent = 100 * weight / totalWeight;
    const formattedPercent = (0, _utils.formatPercent)(percent);
    return `${this.props.flamechart.formatValue(weight)} (${formattedPercent})`;
  }

  renderTooltip() {
    if (!this.container) return null;
    const {
      hover
    } = this.props;
    if (!hover) return null;
    const {
      width,
      height,
      left,
      top
    } = this.container.getBoundingClientRect();
    const offset = new _math.Vec2(hover.event.clientX - left, hover.event.clientY - top);
    const style = getStyle(this.props.theme);
    const frame = hover.node.frame;
    return (0, _preact.h)(_hovertip.Hovertip, {
      containerSize: new _math.Vec2(width, height),
      offset: offset
    }, (0, _preact.h)("span", {
      className: (0, _aphrodite.css)(style.hoverCount)
    }, this.formatValue(hover.node.getTotalWeight())), ' ', frame.name, frame.file ? (0, _preact.h)("div", null, frame.file, ":", frame.line) : undefined);
  }

  render() {
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(_style.commonStyle.fillY, _style.commonStyle.fillX, _style.commonStyle.vbox),
      ref: this.containerRef
    }, (0, _preact.h)(_flamechartPanZoomView.FlamechartPanZoomView, {
      theme: this.props.theme,
      selectedNode: null,
      onNodeHover: this.setNodeHover,
      onNodeSelect: _utils.noop,
      configSpaceViewportRect: this.props.configSpaceViewportRect,
      setConfigSpaceViewportRect: this.setConfigSpaceViewportRect,
      transformViewport: this.transformViewport,
      flamechart: this.props.flamechart,
      flamechartRenderer: this.props.flamechartRenderer,
      canvasContext: this.props.canvasContext,
      renderInverted: this.props.renderInverted,
      logicalSpaceViewportSize: this.props.logicalSpaceViewportSize,
      setLogicalSpaceViewportSize: this.setLogicalSpaceViewportSize,
      searchResults: null
    }), this.renderTooltip());
  }

}

exports.FlamechartWrapper = FlamechartWrapper;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  hoverCount: {
    color: theme.weightColor
  }
}));
exports.getStyle = getStyle;
},{"aphrodite":"../node_modules/aphrodite/es/index.js","preact":"../node_modules/preact/dist/preact.module.js","./style":"../src/views/style.ts","../lib/math":"../src/lib/math.ts","./flamechart-pan-zoom-view":"../src/views/flamechart-pan-zoom-view.tsx","../lib/utils":"../src/lib/utils.ts","./hovertip":"../src/views/hovertip.tsx","./themes/theme":"../src/views/themes/theme.tsx","../lib/preact-helpers":"../src/lib/preact-helpers.tsx"}],"../src/views/inverted-caller-flamegraph-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvertedCallerFlamegraphView = void 0;

var _utils = require("../lib/utils");

var _flamechart = require("../lib/flamechart");

var _flamechartViewContainer = require("./flamechart-view-container");

var _getters = require("../app-state/getters");

var _flamechartWrapper = require("./flamechart-wrapper");

var _preact = require("preact");

var _compat = require("preact/compat");

var _theme = require("./themes/theme");

var _profileGroup = require("../app-state/profile-group");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

const getInvertedCallerProfile = (0, _utils.memoizeByShallowEquality)(({
  profile,
  frame,
  flattenRecursion
}) => {
  let p = profile.getInvertedProfileForCallersOf(frame);
  return flattenRecursion ? p.getProfileWithRecursionFlattened() : p;
});
const getInvertedCallerFlamegraph = (0, _utils.memoizeByShallowEquality)(({
  invertedCallerProfile,
  getColorBucketForFrame
}) => {
  return new _flamechart.Flamechart({
    getTotalWeight: invertedCallerProfile.getTotalNonIdleWeight.bind(invertedCallerProfile),
    forEachCall: invertedCallerProfile.forEachCallGrouped.bind(invertedCallerProfile),
    formatValue: invertedCallerProfile.formatValue.bind(invertedCallerProfile),
    getColorBucketForFrame
  });
});
const getInvertedCallerFlamegraphRenderer = (0, _flamechartViewContainer.createMemoizedFlamechartRenderer)({
  inverted: true
});
const InvertedCallerFlamegraphView = (0, _compat.memo)(ownProps => {
  const {
    activeProfileState
  } = ownProps;
  let {
    profile,
    sandwichViewState
  } = activeProfileState;
  const flattenRecursion = (0, _atom.useAtom)(_appState.flattenRecursionAtom);
  const glCanvas = (0, _atom.useAtom)(_appState.glCanvasAtom);
  const theme = (0, _theme.useTheme)();
  if (!profile) throw new Error('profile missing');
  if (!glCanvas) throw new Error('glCanvas missing');
  const {
    callerCallee
  } = sandwichViewState;
  if (!callerCallee) throw new Error('callerCallee missing');
  const {
    selectedFrame
  } = callerCallee;
  const frameToColorBucket = (0, _getters.getFrameToColorBucket)(profile);
  const getColorBucketForFrame = (0, _getters.createGetColorBucketForFrame)(frameToColorBucket);
  const getCSSColorForFrame = (0, _getters.createGetCSSColorForFrame)({
    theme,
    frameToColorBucket
  });
  const canvasContext = (0, _getters.getCanvasContext)({
    theme,
    canvas: glCanvas
  });
  const flamechart = getInvertedCallerFlamegraph({
    invertedCallerProfile: getInvertedCallerProfile({
      profile,
      frame: selectedFrame,
      flattenRecursion
    }),
    getColorBucketForFrame
  });
  const flamechartRenderer = getInvertedCallerFlamegraphRenderer({
    canvasContext,
    flamechart
  });
  return (0, _preact.h)(_flamechartWrapper.FlamechartWrapper, Object.assign({
    theme: theme,
    renderInverted: true,
    flamechart: flamechart,
    flamechartRenderer: flamechartRenderer,
    canvasContext: canvasContext,
    getCSSColorForFrame: getCSSColorForFrame
  }, (0, _flamechartViewContainer.useFlamechartSetters)(_profileGroup.FlamechartID.SANDWICH_INVERTED_CALLERS), callerCallee.invertedCallerFlamegraph, {
    // This overrides the setSelectedNode specified in useFlamechartSettesr
    setSelectedNode: _utils.noop
  }));
});
exports.InvertedCallerFlamegraphView = InvertedCallerFlamegraphView;
},{"../lib/utils":"../src/lib/utils.ts","../lib/flamechart":"../src/lib/flamechart.ts","./flamechart-view-container":"../src/views/flamechart-view-container.tsx","../app-state/getters":"../src/app-state/getters.ts","./flamechart-wrapper":"../src/views/flamechart-wrapper.tsx","preact":"../node_modules/preact/dist/preact.module.js","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","./themes/theme":"../src/views/themes/theme.tsx","../app-state/profile-group":"../src/app-state/profile-group.ts","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts"}],"../src/views/callee-flamegraph-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CalleeFlamegraphView = exports.getCalleeProfile = void 0;

var _utils = require("../lib/utils");

var _flamechart = require("../lib/flamechart");

var _flamechartViewContainer = require("./flamechart-view-container");

var _getters = require("../app-state/getters");

var _flamechartWrapper = require("./flamechart-wrapper");

var _preact = require("preact");

var _compat = require("preact/compat");

var _theme = require("./themes/theme");

var _profileGroup = require("../app-state/profile-group");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

// TODO: move this import
const getCalleeProfile = (0, _utils.memoizeByShallowEquality)(({
  profile,
  frame,
  flattenRecursion
}) => {
  let p = profile.getProfileForCalleesOf(frame);
  return flattenRecursion ? p.getProfileWithRecursionFlattened() : p;
});
exports.getCalleeProfile = getCalleeProfile;
const getCalleeFlamegraph = (0, _utils.memoizeByShallowEquality)(({
  calleeProfile,
  getTotalWeight,
  getColorBucketForFrame
}) => {
  return new _flamechart.Flamechart({
    getTotalWeight,
    forEachCall: calleeProfile.forEachCallGrouped.bind(calleeProfile),
    formatValue: calleeProfile.formatValue.bind(calleeProfile),
    getColorBucketForFrame
  });
});
const getCalleeFlamegraphRenderer = (0, _flamechartViewContainer.createMemoizedFlamechartRenderer)();
const CalleeFlamegraphView = (0, _compat.memo)(({
  profile,
  callerCallee,
  getTotalWeight,
  profileGroupAtom
}) => {
  const flattenRecursion = (0, _atom.useAtom)(_appState.flattenRecursionAtom);
  const glCanvas = (0, _atom.useAtom)(_appState.glCanvasAtom);
  const theme = (0, _theme.useTheme)();
  if (!profile) throw new Error('profile missing');
  if (!glCanvas) throw new Error('glCanvas missing');
  if (!callerCallee) throw new Error('callerCallee missing');
  const {
    selectedFrame
  } = callerCallee;
  const frameToColorBucket = (0, _getters.getFrameToColorBucket)(profile);
  const getColorBucketForFrame = (0, _getters.createGetColorBucketForFrame)(frameToColorBucket);
  const getCSSColorForFrame = (0, _getters.createGetCSSColorForFrame)({
    theme,
    frameToColorBucket
  });
  const canvasContext = (0, _getters.getCanvasContext)({
    theme,
    canvas: glCanvas
  });
  const calleeProfile = getCalleeProfile({
    profile,
    frame: selectedFrame,
    flattenRecursion
  });
  const getCalleeTotalWeight = (0, _compat.useMemo)(() => {
    if (getTotalWeight) return getTotalWeight;
    return calleeProfile.getTotalNonIdleWeight.bind(calleeProfile);
  }, [getTotalWeight, calleeProfile]);
  const flamechart = getCalleeFlamegraph({
    calleeProfile,
    getTotalWeight: getCalleeTotalWeight,
    getColorBucketForFrame
  });
  const flamechartRenderer = getCalleeFlamegraphRenderer({
    canvasContext,
    flamechart
  });
  return (0, _preact.h)(_flamechartWrapper.FlamechartWrapper, Object.assign({
    theme: theme,
    renderInverted: false,
    flamechart: flamechart,
    flamechartRenderer: flamechartRenderer,
    canvasContext: canvasContext,
    getCSSColorForFrame: getCSSColorForFrame
  }, (0, _flamechartViewContainer.useFlamechartSetters)(_profileGroup.FlamechartID.SANDWICH_CALLEES, profileGroupAtom), callerCallee.calleeFlamegraph, {
    // This overrides the setSelectedNode specified in useFlamechartSettesr
    setSelectedNode: _utils.noop
  }));
});
exports.CalleeFlamegraphView = CalleeFlamegraphView;
},{"../lib/utils":"../src/lib/utils.ts","../lib/flamechart":"../src/lib/flamechart.ts","./flamechart-view-container":"../src/views/flamechart-view-container.tsx","../app-state/getters":"../src/app-state/getters.ts","./flamechart-wrapper":"../src/views/flamechart-wrapper.tsx","preact":"../node_modules/preact/dist/preact.module.js","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","./themes/theme":"../src/views/themes/theme.tsx","../app-state/profile-group":"../src/app-state/profile-group.ts","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts"}],"../src/views/sandwich-search-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SandwichSearchView = void 0;

var _compat = require("preact/compat");

var _hooks = require("preact/hooks");

var _searchView = require("./search-view");

var _preact = require("preact");

var _sandwichView = require("./sandwich-view");

const SandwichSearchView = (0, _compat.memo)(() => {
  const sandwichViewContext = (0, _hooks.useContext)(_sandwichView.SandwichViewContext);
  const rowList = sandwichViewContext != null ? sandwichViewContext.rowList : null;
  const resultIndex = (sandwichViewContext === null || sandwichViewContext === void 0 ? void 0 : sandwichViewContext.selectedFrame) != null ? sandwichViewContext.getIndexForFrame(sandwichViewContext.selectedFrame) : null;
  const numResults = rowList != null ? rowList.length : null;
  const {
    selectPrev,
    selectNext
  } = (0, _hooks.useMemo)(() => {
    if (rowList == null || numResults == null || numResults === 0 || sandwichViewContext == null) {
      return {
        selectPrev: () => {},
        selectNext: () => {}
      };
    }

    return {
      selectPrev: () => {
        let index = resultIndex == null ? numResults - 1 : resultIndex - 1;
        if (index < 0) index = numResults - 1;
        sandwichViewContext.setSelectedFrame(rowList[index]);
      },
      selectNext: () => {
        let index = resultIndex == null ? 0 : resultIndex + 1;
        if (index >= numResults) index = 0;
        sandwichViewContext.setSelectedFrame(rowList[index]);
      }
    };
  }, [resultIndex, rowList, numResults, sandwichViewContext]);
  return (0, _preact.h)(_searchView.SearchView, {
    resultIndex: resultIndex,
    numResults: numResults,
    selectPrev: selectPrev,
    selectNext: selectNext
  });
});
exports.SandwichSearchView = SandwichSearchView;
},{"preact/compat":"../node_modules/preact/compat/dist/compat.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./search-view":"../src/views/search-view.tsx","preact":"../node_modules/preact/dist/preact.module.js","./sandwich-view":"../src/views/sandwich-view.tsx"}],"../src/views/sandwich-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SandwichViewContainer = exports.SandwichViewContext = void 0;

var _aphrodite = require("aphrodite");

var _profileTableView = require("./profile-table-view");

var _preact = require("preact");

var _compat = require("preact/compat");

var _hooks = require("preact/hooks");

var _style = require("./style");

var _invertedCallerFlamegraphView = require("./inverted-caller-flamegraph-view");

var _calleeFlamegraphView = require("./callee-flamegraph-view");

var _sandwichSearchView = require("./sandwich-search-view");

var _utils = require("../lib/utils");

var _searchView = require("./search-view");

var _theme = require("./themes/theme");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

var _preactHelpers = require("../lib/preact-helpers");

class SandwichView extends _preactHelpers.StatelessComponent {
  constructor() {
    super(...arguments);

    this.setSelectedFrame = selectedFrame => {
      this.props.setSelectedFrame(selectedFrame);
    };

    this.onWindowKeyPress = ev => {
      if (ev.key === 'Escape') {
        this.setSelectedFrame(null);
      }
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyPress);
  }

  render() {
    const style = getStyle(this.props.theme);
    const {
      selectedFrame,
      activeProfileState
    } = this.props;
    let flamegraphViews = null;
    const {
      profile,
      sandwichViewState
    } = activeProfileState;
    const {
      callerCallee
    } = sandwichViewState;

    if (selectedFrame) {
      flamegraphViews = (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(_style.commonStyle.fillY, style.callersAndCallees, _style.commonStyle.vbox)
      }, (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(_style.commonStyle.hbox, style.panZoomViewWraper)
      }, (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(style.flamechartLabelParent)
      }, (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(style.flamechartLabel)
      }, "Callers")), (0, _preact.h)(_invertedCallerFlamegraphView.InvertedCallerFlamegraphView, {
        glCanvas: this.props.glCanvas,
        activeProfileState: this.props.activeProfileState
      })), (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(style.divider)
      }), (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(_style.commonStyle.hbox, style.panZoomViewWraper)
      }, (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(style.flamechartLabelParent, style.flamechartLabelParentBottom)
      }, (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(style.flamechartLabel, style.flamechartLabelBottom)
      }, "Callees")), (0, _preact.h)(_calleeFlamegraphView.CalleeFlamegraphView, {
        profile: profile,
        callerCallee: callerCallee,
        profileGroupAtom: _appState.profileGroupAtom
      })));
    }

    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(_style.commonStyle.hbox, _style.commonStyle.fillY)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.tableView)
    }, (0, _preact.h)(_profileTableView.ProfileTableViewContainer, {
      activeProfileState: this.props.activeProfileState
    }), (0, _preact.h)(_sandwichSearchView.SandwichSearchView, null)), flamegraphViews);
  }

}

const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  tableView: {
    position: 'relative',
    flex: 1
  },
  panZoomViewWraper: {
    flex: 1
  },
  flamechartLabelParent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    fontSize: _style.FontSize.TITLE,
    width: _style.FontSize.TITLE * 1.2,
    borderRight: `1px solid ${theme.fgSecondaryColor}`
  },
  flamechartLabelParentBottom: {
    justifyContent: 'flex-start'
  },
  flamechartLabel: {
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50% 0',
    width: _style.FontSize.TITLE * 1.2,
    flexShrink: 1
  },
  flamechartLabelBottom: {
    transform: 'rotate(-90deg)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  callersAndCallees: {
    flex: 1,
    borderLeft: `${_style.Sizes.SEPARATOR_HEIGHT}px solid ${theme.fgSecondaryColor}`
  },
  divider: {
    height: 2,
    background: theme.fgSecondaryColor
  }
}));
const SandwichViewContext = (0, _preact.createContext)(null);
exports.SandwichViewContext = SandwichViewContext;
const SandwichViewContainer = (0, _compat.memo)(ownProps => {
  const {
    activeProfileState,
    glCanvas
  } = ownProps;
  const {
    sandwichViewState,
    index
  } = activeProfileState;
  const {
    callerCallee
  } = sandwichViewState;
  const theme = (0, _theme.useTheme)();
  const setSelectedFrame = (0, _hooks.useCallback)(selectedFrame => {
    _appState.profileGroupAtom.setSelectedFrame(selectedFrame);
  }, []);
  const profile = activeProfileState.profile;
  const tableSortMethod = (0, _atom.useAtom)(_appState.tableSortMethodAtom);
  const profileSearchResults = (0, _hooks.useContext)(_searchView.ProfileSearchContext);
  const selectedFrame = callerCallee ? callerCallee.selectedFrame : null;
  const rowList = (0, _hooks.useMemo)(() => {
    const rowList = [];
    profile.forEachFrame(frame => {
      if (profileSearchResults && !profileSearchResults.getMatchForFrame(frame)) {
        return;
      }

      rowList.push(frame);
    });

    switch (tableSortMethod.field) {
      case _appState.SortField.SYMBOL_NAME:
        {
          (0, _utils.sortBy)(rowList, f => f.name.toLowerCase());
          break;
        }

      case _appState.SortField.SELF:
        {
          (0, _utils.sortBy)(rowList, f => f.getSelfWeight());
          break;
        }

      case _appState.SortField.TOTAL:
        {
          (0, _utils.sortBy)(rowList, f => f.getTotalWeight());
          break;
        }
    }

    if (tableSortMethod.direction === _appState.SortDirection.DESCENDING) {
      rowList.reverse();
    }

    return rowList;
  }, [profile, profileSearchResults, tableSortMethod]);
  const getIndexForFrame = (0, _hooks.useMemo)(() => {
    const indexByFrame = new Map();

    for (let i = 0; i < rowList.length; i++) {
      indexByFrame.set(rowList[i], i);
    }

    return frame => {
      const index = indexByFrame.get(frame);
      return index == null ? null : index;
    };
  }, [rowList]);
  const getSearchMatchForFrame = (0, _hooks.useMemo)(() => {
    return frame => {
      if (profileSearchResults == null) return null;
      return profileSearchResults.getMatchForFrame(frame);
    };
  }, [profileSearchResults]);
  const contextData = {
    rowList,
    selectedFrame,
    setSelectedFrame,
    getIndexForFrame,
    getSearchMatchForFrame
  };
  return (0, _preact.h)(SandwichViewContext.Provider, {
    value: contextData
  }, (0, _preact.h)(SandwichView, {
    theme: theme,
    activeProfileState: activeProfileState,
    glCanvas: glCanvas,
    setSelectedFrame: setSelectedFrame,
    selectedFrame: selectedFrame,
    profileIndex: index
  }));
});
exports.SandwichViewContainer = SandwichViewContainer;
},{"aphrodite":"../node_modules/aphrodite/es/index.js","./profile-table-view":"../src/views/profile-table-view.tsx","preact":"../node_modules/preact/dist/preact.module.js","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./style":"../src/views/style.ts","./inverted-caller-flamegraph-view":"../src/views/inverted-caller-flamegraph-view.tsx","./callee-flamegraph-view":"../src/views/callee-flamegraph-view.tsx","./sandwich-search-view":"../src/views/sandwich-search-view.tsx","../lib/utils":"../src/lib/utils.ts","./search-view":"../src/views/search-view.tsx","./themes/theme":"../src/views/themes/theme.tsx","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts","../lib/preact-helpers":"../src/lib/preact-helpers.tsx"}],"../src/lib/value-formatters.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ByteFormatter = exports.TimeFormatter = exports.RawValueFormatter = void 0;

var _utils = require("./utils");

class RawValueFormatter {
  constructor() {
    this.unit = 'none';
  }

  format(v) {
    return v.toLocaleString();
  }

}

exports.RawValueFormatter = RawValueFormatter;

class TimeFormatter {
  constructor(unit) {
    this.unit = unit;
    if (unit === 'nanoseconds') this.multiplier = 1e-9;else if (unit === 'microseconds') this.multiplier = 1e-6;else if (unit === 'milliseconds') this.multiplier = 1e-3;else this.multiplier = 1;
  }

  formatUnsigned(v) {
    const s = v * this.multiplier;

    if (s / 60 >= 1) {
      const minutes = Math.floor(s / 60);
      const seconds = Math.floor(s - minutes * 60).toString();
      return `${minutes}:${(0, _utils.zeroPad)(seconds, 2)}`;
    }

    if (s / 1 >= 1) return `${s.toFixed(2)}s`;
    if (s / 1e-3 >= 1) return `${(s / 1e-3).toFixed(2)}ms`;
    if (s / 1e-6 >= 1) return `${(s / 1e-6).toFixed(2)}µs`;else return `${(s / 1e-9).toFixed(2)}ns`;
  }

  format(v) {
    return `${v < 0 ? '-' : ''}${this.formatUnsigned(Math.abs(v))}`;
  }

}

exports.TimeFormatter = TimeFormatter;

class ByteFormatter {
  constructor() {
    this.unit = 'bytes';
  }

  format(v) {
    if (v < 1024) return `${v.toFixed(0)} B`;
    v /= 1024;
    if (v < 1024) return `${v.toFixed(2)} KB`;
    v /= 1024;
    if (v < 1024) return `${v.toFixed(2)} MB`;
    v /= 1024;
    return `${v.toFixed(2)} GB`;
  }

}

exports.ByteFormatter = ByteFormatter;
},{"./utils":"../src/lib/utils.ts"}],"../node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"../node_modules/parcel-bundler/src/builtins/bundle-loader.js":[function(require,module,exports) {
var getBundleURL = require('./bundle-url').getBundleURL;

function loadBundlesLazy(bundles) {
  if (!Array.isArray(bundles)) {
    bundles = [bundles];
  }

  var id = bundles[bundles.length - 1];

  try {
    return Promise.resolve(require(id));
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return new LazyPromise(function (resolve, reject) {
        loadBundles(bundles.slice(0, -1)).then(function () {
          return require(id);
        }).then(resolve, reject);
      });
    }

    throw err;
  }
}

function loadBundles(bundles) {
  return Promise.all(bundles.map(loadBundle));
}

var bundleLoaders = {};

function registerBundleLoader(type, loader) {
  bundleLoaders[type] = loader;
}

module.exports = exports = loadBundlesLazy;
exports.load = loadBundles;
exports.register = registerBundleLoader;
var bundles = {};

function loadBundle(bundle) {
  var id;

  if (Array.isArray(bundle)) {
    id = bundle[1];
    bundle = bundle[0];
  }

  if (bundles[bundle]) {
    return bundles[bundle];
  }

  var type = (bundle.substring(bundle.lastIndexOf('.') + 1, bundle.length) || bundle).toLowerCase();
  var bundleLoader = bundleLoaders[type];

  if (bundleLoader) {
    return bundles[bundle] = bundleLoader(getBundleURL() + bundle).then(function (resolved) {
      if (resolved) {
        module.bundle.register(id, resolved);
      }

      return resolved;
    }).catch(function (e) {
      delete bundles[bundle];
      throw e;
    });
  }
}

function LazyPromise(executor) {
  this.executor = executor;
  this.promise = null;
}

LazyPromise.prototype.then = function (onSuccess, onError) {
  if (this.promise === null) this.promise = new Promise(this.executor);
  return this.promise.then(onSuccess, onError);
};

LazyPromise.prototype.catch = function (onError) {
  if (this.promise === null) this.promise = new Promise(this.executor);
  return this.promise.catch(onError);
};
},{"./bundle-url":"../node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"../src/lib/profile.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallTreeProfileBuilder = exports.StackListProfileBuilder = exports.Profile = exports.CallTreeNode = exports.Frame = exports.HasWeights = void 0;

var _utils = require("./utils");

var _valueFormatters = require("./value-formatters");

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

const demangleCppModule = require("_bundle_loader")(require.resolve('./demangle-cpp'));

class HasWeights {
  constructor() {
    this.selfWeight = 0;
    this.totalWeight = 0;
  }

  getSelfWeight() {
    return this.selfWeight;
  }

  getTotalWeight() {
    return this.totalWeight;
  }

  addToTotalWeight(delta) {
    this.totalWeight += delta;
  }

  addToSelfWeight(delta) {
    this.selfWeight += delta;
  }

  overwriteWeightWith(other) {
    this.selfWeight = other.selfWeight;
    this.totalWeight = other.totalWeight;
  }

}

exports.HasWeights = HasWeights;

class Frame extends HasWeights {
  constructor(info) {
    super();
    this.key = info.key;
    this.name = info.name;
    this.file = info.file;
    this.line = info.line;
    this.col = info.col;
  }

  static getOrInsert(set, info) {
    return set.getOrInsert(new Frame(info));
  }

}

exports.Frame = Frame;
Frame.root = new Frame({
  key: '(speedscope root)',
  name: '(speedscope root)'
});

class CallTreeNode extends HasWeights {
  isRoot() {
    return this.frame === Frame.root;
  }

  key() {
    return this.frame.key;
  }

  weight() {
    return this.frame.getSelfWeight();
  }

  isFrozen() {
    return this.frozen;
  }

  freeze() {
    this.frozen = true;
  }

  constructor(frame, parent) {
    super();
    this.frame = frame;
    this.parent = parent;
    this.children = []; // If a node is "frozen", it means it should no longer be mutated.

    this.frozen = false;
  }

}

exports.CallTreeNode = CallTreeNode;

class Profile {
  getAppendOrderCalltreeRoot() {
    return this.appendOrderCalltreeRoot;
  }

  getGroupedCalltreeRoot() {
    return this.groupedCalltreeRoot;
  }

  constructor(totalWeight = 0) {
    this.name = '';
    this.frames = new _utils.KeyedSet(); // Profiles store two call-trees.
    //
    // The "append order" call tree is the one in which nodes are ordered in
    // whatever order they were appended to their parent.
    //
    // The "grouped" call tree is one in which each node has at most one child per
    // frame. Nodes are ordered in decreasing order of weight

    this.appendOrderCalltreeRoot = new CallTreeNode(Frame.root, null);
    this.groupedCalltreeRoot = new CallTreeNode(Frame.root, null); // List of references to CallTreeNodes at the top of the
    // stack at the time of the sample.

    this.samples = [];
    this.weights = [];
    this.valueFormatter = new _valueFormatters.RawValueFormatter();
    this.totalNonIdleWeight = null;
    this.totalWeight = totalWeight;
  }

  shallowClone() {
    const profile = new Profile(this.totalWeight);
    Object.assign(profile, this);
    return profile;
  }

  formatValue(v) {
    return this.valueFormatter.format(v);
  }

  setValueFormatter(f) {
    this.valueFormatter = f;
  }

  getWeightUnit() {
    return this.valueFormatter.unit;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getTotalWeight() {
    return this.totalWeight;
  }

  getTotalNonIdleWeight() {
    if (this.totalNonIdleWeight === null) {
      this.totalNonIdleWeight = this.groupedCalltreeRoot.children.reduce((n, c) => n + c.getTotalWeight(), 0);
    }

    return this.totalNonIdleWeight;
  } // This is private because it should only be called in the ProfileBuilder
  // classes. Once a Profile instance has been constructed, it should be treated
  // as immutable.


  sortGroupedCallTree() {
    function visit(node) {
      node.children.sort((a, b) => -(a.getTotalWeight() - b.getTotalWeight()));
      node.children.forEach(visit);
    }

    visit(this.groupedCalltreeRoot);
  }

  forEachCallGrouped(openFrame, closeFrame) {
    function visit(node, start) {
      if (node.frame !== Frame.root) {
        openFrame(node, start);
      }

      let childTime = 0;
      node.children.forEach(function (child) {
        visit(child, start + childTime);
        childTime += child.getTotalWeight();
      });

      if (node.frame !== Frame.root) {
        closeFrame(node, start + node.getTotalWeight());
      }
    }

    visit(this.groupedCalltreeRoot, 0);
  }

  forEachCall(openFrame, closeFrame) {
    let prevStack = [];
    let value = 0;
    let sampleIndex = 0;

    for (let stackTop of this.samples) {
      // Find lowest common ancestor of the current stack and the previous one
      let lca = null; // This is O(n^2), but n should be relatively small here (stack height),
      // so hopefully this isn't much of a problem

      for (lca = stackTop; lca && lca.frame != Frame.root && prevStack.indexOf(lca) === -1; lca = lca.parent) {} // Close frames that are no longer open


      while (prevStack.length > 0 && (0, _utils.lastOf)(prevStack) != lca) {
        const node = prevStack.pop();
        closeFrame(node, value);
      } // Open frames that are now becoming open


      const toOpen = [];

      for (let node = stackTop; node && node.frame != Frame.root && node != lca; node = node.parent) {
        toOpen.push(node);
      }

      toOpen.reverse();

      for (let node of toOpen) {
        openFrame(node, value);
      }

      prevStack = prevStack.concat(toOpen);
      value += this.weights[sampleIndex++];
    } // Close frames that are open at the end of the trace


    for (let i = prevStack.length - 1; i >= 0; i--) {
      closeFrame(prevStack[i], value);
    }
  }

  forEachFrame(fn) {
    this.frames.forEach(fn);
  }

  getKeyToFrameMap() {
    if (!this.keyToFrameMap) {
      const map = new Map();
      this.forEachFrame(f => {
        map.set(f.key, f);
      });
      this.keyToFrameMap = map;
    }

    return this.keyToFrameMap;
  }

  getNameToFrameMap() {
    if (!this.nameToFrameMap) {
      const map = new Map();
      this.forEachFrame(f => {
        const frames = map.get(f.name) || [];
        frames.push(f);
        map.set(f.name, frames);
      });
      this.nameToFrameMap = map;
    }

    return this.nameToFrameMap;
  }

  getProfileWithRecursionFlattened() {
    const builder = new CallTreeProfileBuilder();
    const stack = [];
    const framesInStack = new Set();

    function openFrame(node, value) {
      if (framesInStack.has(node.frame)) {
        stack.push(null);
      } else {
        framesInStack.add(node.frame);
        stack.push(node);
        builder.enterFrame(node.frame, value);
      }
    }

    function closeFrame(node, value) {
      const stackTop = stack.pop();

      if (stackTop) {
        framesInStack.delete(stackTop.frame);
        builder.leaveFrame(stackTop.frame, value);
      }
    }

    this.forEachCall(openFrame, closeFrame);
    const flattenedProfile = builder.build();
    flattenedProfile.name = this.name;
    flattenedProfile.valueFormatter = this.valueFormatter; // When constructing a profile with recursion flattened,
    // counter-intuitive things can happen to "self time" measurements
    // for functions.
    // For example, given the following list of stacks w/ weights:
    //
    // a 1
    // a;b;a 1
    // a;b;a;b;a 1
    // a;b;a 1
    //
    // The resulting profile with recursion flattened out will look like this:
    //
    // a 1
    // a;b 3
    //
    // Which is useful to view, but it's counter-intuitive to move self-time
    // for frames around, since analyzing the self-time of functions is an important
    // thing to be able to do accurately, and we don't want this to change when recursion
    // is flattened. To work around that, we'll just copy the weights directly from the
    // un-flattened profile.

    this.forEachFrame(f => {
      flattenedProfile.frames.getOrInsert(f).overwriteWeightWith(f);
    });
    return flattenedProfile;
  }

  getInvertedProfileForCallersOf(focalFrameInfo) {
    const focalFrame = Frame.getOrInsert(this.frames, focalFrameInfo);
    const builder = new StackListProfileBuilder(); // TODO(jlfwong): Could construct this at profile
    // construction time rather than on demand.

    const nodes = [];

    function visit(node) {
      if (node.frame === focalFrame) {
        nodes.push(node);
      } else {
        for (let child of node.children) {
          visit(child);
        }
      }
    }

    visit(this.appendOrderCalltreeRoot);

    for (let node of nodes) {
      const stack = [];

      for (let n = node; n != null && n.frame !== Frame.root; n = n.parent) {
        stack.push(n.frame);
      }

      builder.appendSampleWithWeight(stack, node.getTotalWeight());
    }

    const ret = builder.build();
    ret.name = this.name;
    ret.valueFormatter = this.valueFormatter;
    return ret;
  }

  getProfileForCalleesOf(focalFrameInfo) {
    const focalFrame = Frame.getOrInsert(this.frames, focalFrameInfo);
    const builder = new StackListProfileBuilder();

    function recordSubtree(focalFrameNode) {
      const stack = [];

      function visit(node) {
        stack.push(node.frame);
        builder.appendSampleWithWeight(stack, node.getSelfWeight());

        for (let child of node.children) {
          visit(child);
        }

        stack.pop();
      }

      visit(focalFrameNode);
    }

    function findCalls(node) {
      if (node.frame === focalFrame) {
        recordSubtree(node);
      } else {
        for (let child of node.children) {
          findCalls(child);
        }
      }
    }

    findCalls(this.appendOrderCalltreeRoot);
    const ret = builder.build();
    ret.name = this.name;
    ret.valueFormatter = this.valueFormatter;
    return ret;
  } // Demangle symbols for readability


  demangle() {
    return __awaiter(this, void 0, void 0, function* () {
      let demangleCpp = null;

      for (let frame of this.frames) {
        // This function converts a mangled C++ name such as "__ZNK7Support6ColorFeqERKS0_"
        // into a human-readable symbol (in this case "Support::ColorF::==(Support::ColorF&)")
        if (frame.name.startsWith('__Z')) {
          if (!demangleCpp) {
            demangleCpp = (yield demangleCppModule).demangleCpp;
          }

          frame.name = demangleCpp(frame.name);
        }
      }
    });
  }

  remapSymbols(callback) {
    for (let frame of this.frames) {
      const remapped = callback(frame);

      if (remapped == null) {
        continue;
      }

      const {
        name,
        file,
        line,
        col
      } = remapped;

      if (name != null) {
        frame.name = name;
      }

      if (file != null) {
        frame.file = file;
      }

      if (line != null) {
        frame.line = line;
      }

      if (col != null) {
        frame.col = col;
      }
    }
  }

}

exports.Profile = Profile;

class StackListProfileBuilder extends Profile {
  constructor() {
    super(...arguments);
    this.pendingSample = null;
  }

  _appendSample(stack, weight, useAppendOrder) {
    if (isNaN(weight)) throw new Error('invalid weight');
    let node = useAppendOrder ? this.appendOrderCalltreeRoot : this.groupedCalltreeRoot;
    let framesInStack = new Set();

    for (let frame of stack) {
      const last = useAppendOrder ? (0, _utils.lastOf)(node.children) : node.children.find(c => c.frame === frame);

      if (last && !last.isFrozen() && last.frame == frame) {
        node = last;
      } else {
        const parent = node;
        node = new CallTreeNode(frame, node);
        parent.children.push(node);
      }

      node.addToTotalWeight(weight); // It's possible for the same frame to occur multiple
      // times in the same call stack due to either direct
      // or indirect recursion. We want to avoid counting that
      // frame multiple times for a single sample, we so just
      // track all of the unique frames that participated in
      // this call stack, then add to their weight at the end.

      framesInStack.add(node.frame);
    }

    node.addToSelfWeight(weight);

    if (useAppendOrder) {
      for (let child of node.children) {
        child.freeze();
      }
    }

    if (useAppendOrder) {
      node.frame.addToSelfWeight(weight);

      for (let frame of framesInStack) {
        frame.addToTotalWeight(weight);
      }

      if (node === (0, _utils.lastOf)(this.samples)) {
        this.weights[this.weights.length - 1] += weight;
      } else {
        this.samples.push(node);
        this.weights.push(weight);
      }
    }
  }

  appendSampleWithWeight(stack, weight) {
    if (weight === 0) {
      // Samples with zero weight have no effect, so let's ignore them
      return;
    }

    if (weight < 0) {
      throw new Error('Samples must have positive weights');
    }

    const frames = stack.map(fr => Frame.getOrInsert(this.frames, fr));

    this._appendSample(frames, weight, true);

    this._appendSample(frames, weight, false);
  }

  appendSampleWithTimestamp(stack, timestamp) {
    if (this.pendingSample) {
      if (timestamp < this.pendingSample.centralTimestamp) {
        throw new Error('Timestamps received out of order');
      }

      const endTimestamp = (timestamp + this.pendingSample.centralTimestamp) / 2;
      this.appendSampleWithWeight(this.pendingSample.stack, endTimestamp - this.pendingSample.startTimestamp);
      this.pendingSample = {
        stack,
        startTimestamp: endTimestamp,
        centralTimestamp: timestamp
      };
    } else {
      this.pendingSample = {
        stack,
        startTimestamp: timestamp,
        centralTimestamp: timestamp
      };
    }
  }

  build() {
    if (this.pendingSample) {
      if (this.samples.length > 0) {
        this.appendSampleWithWeight(this.pendingSample.stack, this.pendingSample.centralTimestamp - this.pendingSample.startTimestamp);
      } else {
        // There is only a single sample. In this case, units will be meaningless,
        // so we'll append with a weight of 1 and also clear any value formatter
        this.appendSampleWithWeight(this.pendingSample.stack, 1);
        this.setValueFormatter(new _valueFormatters.RawValueFormatter());
      }
    }

    this.totalWeight = Math.max(this.totalWeight, this.weights.reduce((a, b) => a + b, 0));
    this.sortGroupedCallTree();
    return this;
  }

} // As an alternative API for importing profiles more efficiently, provide a
// way to open & close frames directly without needing to construct tons of
// arrays as intermediaries.


exports.StackListProfileBuilder = StackListProfileBuilder;

class CallTreeProfileBuilder extends Profile {
  constructor() {
    super(...arguments);
    this.appendOrderStack = [this.appendOrderCalltreeRoot];
    this.groupedOrderStack = [this.groupedCalltreeRoot];
    this.framesInStack = new Map();
    this.stack = [];
    this.lastValue = 0;
  }

  addWeightsToFrames(value) {
    const delta = value - this.lastValue;

    for (let frame of this.framesInStack.keys()) {
      frame.addToTotalWeight(delta);
    }

    const stackTop = (0, _utils.lastOf)(this.stack);

    if (stackTop) {
      stackTop.addToSelfWeight(delta);
    }
  }

  addWeightsToNodes(value, stack) {
    const delta = value - this.lastValue;

    for (let node of stack) {
      node.addToTotalWeight(delta);
    }

    const stackTop = (0, _utils.lastOf)(stack);

    if (stackTop) {
      stackTop.addToSelfWeight(delta);
    }
  }

  _enterFrame(frame, value, useAppendOrder) {
    let stack = useAppendOrder ? this.appendOrderStack : this.groupedOrderStack;
    this.addWeightsToNodes(value, stack);
    let prevTop = (0, _utils.lastOf)(stack);

    if (prevTop) {
      if (useAppendOrder) {
        const delta = value - this.lastValue;

        if (delta > 0) {
          this.samples.push(prevTop);
          this.weights.push(value - this.lastValue);
        } else if (delta < 0) {
          throw new Error(`Samples must be provided in increasing order of cumulative value. Last sample was ${this.lastValue}, this sample was ${value}`);
        }
      }

      const last = useAppendOrder ? (0, _utils.lastOf)(prevTop.children) : prevTop.children.find(c => c.frame === frame);
      let node;

      if (last && !last.isFrozen() && last.frame == frame) {
        node = last;
      } else {
        node = new CallTreeNode(frame, prevTop);
        prevTop.children.push(node);
      }

      stack.push(node);
    }
  }

  enterFrame(frameInfo, value) {
    const frame = Frame.getOrInsert(this.frames, frameInfo);
    this.addWeightsToFrames(value);

    this._enterFrame(frame, value, true);

    this._enterFrame(frame, value, false);

    this.stack.push(frame);
    const frameCount = this.framesInStack.get(frame) || 0;
    this.framesInStack.set(frame, frameCount + 1);
    this.lastValue = value;
    this.totalWeight = Math.max(this.totalWeight, this.lastValue);
  }

  _leaveFrame(frame, value, useAppendOrder) {
    let stack = useAppendOrder ? this.appendOrderStack : this.groupedOrderStack;
    this.addWeightsToNodes(value, stack);

    if (useAppendOrder) {
      const leavingStackTop = this.appendOrderStack.pop();

      if (leavingStackTop == null) {
        throw new Error(`Trying to leave ${frame.key} when stack is empty`);
      }

      if (this.lastValue == null) {
        throw new Error(`Trying to leave a ${frame.key} before any have been entered`);
      }

      leavingStackTop.freeze();

      if (leavingStackTop.frame.key !== frame.key) {
        throw new Error(`Tried to leave frame "${frame.name}" while frame "${leavingStackTop.frame.name}" was at the top at ${value}`);
      }

      const delta = value - this.lastValue;

      if (delta > 0) {
        this.samples.push(leavingStackTop);
        this.weights.push(value - this.lastValue);
      } else if (delta < 0) {
        throw new Error(`Samples must be provided in increasing order of cumulative value. Last sample was ${this.lastValue}, this sample was ${value}`);
      }
    } else {
      this.groupedOrderStack.pop();
    }
  }

  leaveFrame(frameInfo, value) {
    const frame = Frame.getOrInsert(this.frames, frameInfo);
    this.addWeightsToFrames(value);

    this._leaveFrame(frame, value, true);

    this._leaveFrame(frame, value, false);

    this.stack.pop();
    const frameCount = this.framesInStack.get(frame);
    if (frameCount == null) return;

    if (frameCount === 1) {
      this.framesInStack.delete(frame);
    } else {
      this.framesInStack.set(frame, frameCount - 1);
    }

    this.lastValue = value;
    this.totalWeight = Math.max(this.totalWeight, this.lastValue);
  }

  build() {
    // Each stack is expected to contain a single node which we initialize to be
    // the root node.
    if (this.appendOrderStack.length > 1 || this.groupedOrderStack.length > 1) {
      throw new Error('Tried to complete profile construction with a non-empty stack');
    }

    this.sortGroupedCallTree();
    return this;
  }

}

exports.CallTreeProfileBuilder = CallTreeProfileBuilder;
},{"./utils":"../src/lib/utils.ts","./value-formatters":"../src/lib/value-formatters.ts","_bundle_loader":"../node_modules/parcel-bundler/src/builtins/bundle-loader.js","./demangle-cpp":[["demangle-cpp.bde90258.js","../src/lib/demangle-cpp.ts"],"demangle-cpp.bde90258.js.map","../src/lib/demangle-cpp.ts"]}],"../src/lib/file-format-spec.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileFormat = void 0;
// This file contains types which specify the speedscope file format.
var FileFormat;
exports.FileFormat = FileFormat;

(function (FileFormat) {
  let ProfileType;

  (function (ProfileType) {
    ProfileType["EVENTED"] = "evented";
    ProfileType["SAMPLED"] = "sampled";
  })(ProfileType = FileFormat.ProfileType || (FileFormat.ProfileType = {}));

  let EventType;

  (function (EventType) {
    EventType["OPEN_FRAME"] = "O";
    EventType["CLOSE_FRAME"] = "C";
  })(EventType = FileFormat.EventType || (FileFormat.EventType = {}));
})(FileFormat || (exports.FileFormat = FileFormat = {}));
},{}],"../package.json":[function(require,module,exports) {
module.exports = {
  "name": "speedscope",
  "version": "1.19.0",
  "description": "",
  "repository": "jlfwong/speedscope",
  "main": "index.js",
  "bin": {
    "speedscope": "./bin/cli.js"
  },
  "scripts": {
    "deploy": "./scripts/deploy.sh",
    "prepack": "./scripts/build-release.sh",
    "prettier": "prettier --write 'src/**/*.ts' 'src/**/*.tsx'",
    "lint": "eslint 'src/**/*.ts' 'src/**/*.tsx'",
    "jest": "./scripts/test-setup.sh && jest --runInBand",
    "coverage": "npm run jest -- --coverage",
    "typecheck": "tsc --noEmit",
    "test": "./scripts/ci.sh",
    "serve": "parcel assets/index.html --open --no-autoinstall"
  },
  "files": ["bin/cli.js", "dist/release/**", "!*.map"],
  "browserslist": ["last 2 Chrome versions", "last 2 Firefox versions"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/jest": "22.2.3",
    "@types/jszip": "3.1.4",
    "@types/node": "14.0.1",
    "@types/pako": "1.0.0",
    "@typescript-eslint/eslint-plugin": "6.16.0",
    "@typescript-eslint/parser": "6.16.0",
    "acorn": "7.2.0",
    "aphrodite": "2.1.0",
    "eslint": "8.0.0",
    "eslint-plugin-prettier": "5.1.2",
    "eslint-plugin-react-hooks": "4.6.0",
    "jest": "24.3.0",
    "jsverify": "0.8.3",
    "jszip": "3.1.5",
    "pako": "1.0.6",
    "parcel-bundler": "1.12.4",
    "preact": "10.4.1",
    "prettier": "3.1.1",
    "protobufjs": "6.8.8",
    "source-map": "0.6.1",
    "ts-jest": "24.3.0",
    "typescript": "5.3.3",
    "typescript-json-schema": "0.42.0",
    "uglify-es": "3.2.2",
    "uint8array-json-parser": "0.0.2"
  },
  "jest": {
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "setupFilesAfterEnv": ["./src/jest-setup.js"],
    "testRegex": "\\.test\\.tsx?$",
    "collectCoverageFrom": ["**/*.{ts,tsx}", "!**/*.d.{ts,tsx}"],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json"]
  },
  "dependencies": {
    "open": "7.2.0"
  }
};
},{}],"../src/lib/file-format.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportProfileGroup = exportProfileGroup;
exports.importSpeedscopeProfiles = importSpeedscopeProfiles;
exports.saveToFile = saveToFile;

var _profile = require("./profile");

var _valueFormatters = require("./value-formatters");

var _fileFormatSpec = require("./file-format-spec");

function exportProfileGroup(profileGroup) {
  const frames = [];
  const indexForFrame = new Map();

  function getIndexForFrame(frame) {
    let index = indexForFrame.get(frame);

    if (index == null) {
      const serializedFrame = {
        name: frame.name
      };
      if (frame.file != null) serializedFrame.file = frame.file;
      if (frame.line != null) serializedFrame.line = frame.line;
      if (frame.col != null) serializedFrame.col = frame.col;
      index = frames.length;
      indexForFrame.set(frame, index);
      frames.push(serializedFrame);
    }

    return index;
  }

  const file = {
    exporter: `speedscope@${require('../../package.json').version}`,
    name: profileGroup.name,
    activeProfileIndex: profileGroup.indexToView,
    $schema: 'https://www.speedscope.app/file-format-schema.json',
    shared: {
      frames
    },
    profiles: []
  };

  for (let profile of profileGroup.profiles) {
    file.profiles.push(exportProfile(profile, getIndexForFrame));
  }

  return file;
}

function exportProfile(profile, getIndexForFrame) {
  const eventedProfile = {
    type: _fileFormatSpec.FileFormat.ProfileType.EVENTED,
    name: profile.getName(),
    unit: profile.getWeightUnit(),
    startValue: 0,
    endValue: profile.getTotalWeight(),
    events: []
  };

  const openFrame = (node, value) => {
    eventedProfile.events.push({
      type: _fileFormatSpec.FileFormat.EventType.OPEN_FRAME,
      frame: getIndexForFrame(node.frame),
      at: value
    });
  };

  const closeFrame = (node, value) => {
    eventedProfile.events.push({
      type: _fileFormatSpec.FileFormat.EventType.CLOSE_FRAME,
      frame: getIndexForFrame(node.frame),
      at: value
    });
  };

  profile.forEachCall(openFrame, closeFrame);
  return eventedProfile;
}

function importSpeedscopeProfile(serialized, frames) {
  function setCommonProperties(p) {
    const {
      name,
      unit
    } = serialized;

    switch (unit) {
      case 'nanoseconds':
      case 'microseconds':
      case 'milliseconds':
      case 'seconds':
        p.setValueFormatter(new _valueFormatters.TimeFormatter(unit));
        break;

      case 'bytes':
        p.setValueFormatter(new _valueFormatters.ByteFormatter());
        break;

      case 'none':
        p.setValueFormatter(new _valueFormatters.RawValueFormatter());
        break;
    }

    p.setName(name);
  }

  function importEventedProfile(evented) {
    const {
      startValue,
      endValue,
      events
    } = evented;
    const profile = new _profile.CallTreeProfileBuilder(endValue - startValue);
    setCommonProperties(profile);
    const frameInfos = frames.map((frame, i) => Object.assign({
      key: i
    }, frame));

    for (let ev of events) {
      switch (ev.type) {
        case _fileFormatSpec.FileFormat.EventType.OPEN_FRAME:
          {
            profile.enterFrame(frameInfos[ev.frame], ev.at - startValue);
            break;
          }

        case _fileFormatSpec.FileFormat.EventType.CLOSE_FRAME:
          {
            profile.leaveFrame(frameInfos[ev.frame], ev.at - startValue);
            break;
          }
      }
    }

    return profile.build();
  }

  function importSampledProfile(sampled) {
    const {
      startValue,
      endValue,
      samples,
      weights
    } = sampled;
    const profile = new _profile.StackListProfileBuilder(endValue - startValue);
    setCommonProperties(profile);
    const frameInfos = frames.map((frame, i) => Object.assign({
      key: i
    }, frame));

    if (samples.length !== weights.length) {
      throw new Error(`Expected samples.length (${samples.length}) to equal weights.length (${weights.length})`);
    }

    for (let i = 0; i < samples.length; i++) {
      const stack = samples[i];
      const weight = weights[i];
      profile.appendSampleWithWeight(stack.map(n => frameInfos[n]), weight);
    }

    return profile.build();
  }

  switch (serialized.type) {
    case _fileFormatSpec.FileFormat.ProfileType.EVENTED:
      return importEventedProfile(serialized);

    case _fileFormatSpec.FileFormat.ProfileType.SAMPLED:
      return importSampledProfile(serialized);
  }
}

function importSpeedscopeProfiles(serialized) {
  return {
    name: serialized.name || serialized.profiles[0].name || 'profile',
    indexToView: serialized.activeProfileIndex || 0,
    profiles: serialized.profiles.map(p => importSpeedscopeProfile(p, serialized.shared.frames))
  };
}

function saveToFile(profileGroup) {
  const file = exportProfileGroup(profileGroup);
  const blob = new Blob([JSON.stringify(file)], {
    type: 'text/json'
  });
  const nameWithoutExt = file.name ? file.name.split('.')[0] : 'profile';
  const filename = `${nameWithoutExt.replace(/\W+/g, '_')}.speedscope.json`;
  console.log('Saving', filename);
  const a = document.createElement('a');
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':'); // For this to work in Firefox, the <a> must be in the DOM

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
},{"./profile":"../src/lib/profile.ts","./value-formatters":"../src/lib/value-formatters.ts","./file-format-spec":"../src/lib/file-format-spec.ts","../../package.json":"../package.json"}],"../src/lib/fuzzy-find.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fuzzyMatchStrings = fuzzyMatchStrings;

/**
 * This file contains an implementation of fuzzy string matching.
 */
function fuzzyMatchStrings(text, pattern) {
  return fzfFuzzyMatchV1(text, pattern);
} // The implementation here is based on FuzzyMatchV1, as described here:
// https://github.com/junegunn/fzf/blob/f81feb1e69e5cb75797d50817752ddfe4933cd68/src/algo/algo.go#L8-L15
//
// This is a hand-port to better understand what the code is doing and for added
// clarity.
//
// Capitalized letters only match capitalized letters, but lower-case letters
// match both.
//
// Note: fzf includes a normalization table for homoglyphs. I'm going to ignore that too
// https://github.com/junegunn/fzf/blob/master/src/algo/normalize.go


const charCodeLowerA = 'a'.charCodeAt(0);
const charCodeLowerZ = 'z'.charCodeAt(0);
const charCodeUpperA = 'A'.charCodeAt(0);
const charCodeUpperZ = 'Z'.charCodeAt(0);
const charCodeDigit0 = '0'.charCodeAt(0);
const charCodeDigit9 = '9'.charCodeAt(0);
var fzfCharClass;

(function (fzfCharClass) {
  fzfCharClass[fzfCharClass["charNonWord"] = 0] = "charNonWord";
  fzfCharClass[fzfCharClass["charLower"] = 1] = "charLower";
  fzfCharClass[fzfCharClass["charUpper"] = 2] = "charUpper";
  fzfCharClass[fzfCharClass["charNumber"] = 3] = "charNumber";
})(fzfCharClass || (fzfCharClass = {}));

function fzfCharClassOf(char) {
  const code = char.charCodeAt(0);

  if (charCodeLowerA <= code && code <= charCodeLowerZ) {
    return fzfCharClass.charLower;
  } else if (charCodeUpperA <= code && code <= charCodeUpperZ) {
    return fzfCharClass.charUpper;
  } else if (charCodeDigit0 <= code && code <= charCodeDigit9) {
    return fzfCharClass.charNumber;
  }

  return fzfCharClass.charNonWord;
}

function charsMatch(textChar, patternChar) {
  if (textChar === patternChar) return true;
  const patternCharCode = patternChar.charCodeAt(0);

  if (charCodeLowerA <= patternCharCode && patternCharCode <= charCodeLowerZ) {
    return textChar.charCodeAt(0) === patternCharCode - charCodeLowerA + charCodeUpperA;
  }

  return false;
}

function fzfFuzzyMatchV1(text, pattern) {
  if (pattern.length == 0) {
    return {
      matchedRanges: [],
      score: 0
    };
  } // I removed the fzfAsciiFuzzyIndex code because it's not actually clear to
  // me that it's a very helpful optimization.


  let pidx = 0;
  let sidx = -1;
  let eidx = -1;
  let lenRunes = text.length;
  let lenPattern = pattern.length; // Forward pass: scan over the text pattern, identifying the earliest start
  // and the latest end to consider.

  for (let index = 0; index < lenRunes; index++) {
    let char = text[index];
    let pchar = pattern[pidx];

    if (charsMatch(char, pchar)) {
      if (sidx < 0) {
        sidx = index;
      }

      pidx++;

      if (pidx == lenPattern) {
        // We found the last character in the pattern! eidx is exclusive, so
        // we'll set it to the current index + 1.
        eidx = index + 1;
        break;
      }
    }
  }

  if (eidx == -1) {
    // We couldn't find all the characters in the pattern. No match.
    return null;
  } // Assuming we found all the characters in the pattern, perform the backwards
  // pass.


  pidx--;

  for (let index = eidx - 1; index >= sidx; index--) {
    const char = text[index];
    const pchar = pattern[pidx];

    if (charsMatch(char, pchar)) {
      pidx--;

      if (pidx < 0) {
        // We found the first character of the pattern, scanning
        // backwards. This *may* have narrowed the match further.
        // For example, for the following inputs:
        //
        //    text = "xxx a b c abc xxx"
        // pattern = "abc"
        //
        // For the forward pass, you get:
        //
        //    "xxx a b c abc xxx"
        //    start^        ^end
        //
        // But after the backward pass, we can narrow this to:
        //
        //    "xxx a b c abc xxx"
        //          start^  ^end
        sidx = index;
        return fzfCalculateScore(text, pattern, sidx, eidx);
      }
    }
  } // This should be unreachable.


  throw new Error('Implementation error. This must be a bug in fzfFuzzyMatchV1');
}

const fzfScoreMatch = 16;
const fzfScoreGapStart = -3;
const fzfScoreGapExtension = -1;
const fzfBonusBoundary = fzfScoreMatch / 2;
const fzfBonusNonWord = fzfScoreMatch / 2;
const fzfBonusCamel123 = fzfBonusBoundary + fzfScoreGapExtension;
const fzfBonusConsecutive = -(fzfScoreGapStart + fzfScoreGapExtension);
const fzfBonusFirstCharMultiplier = 2;

function bonusFor(prevClass, curClass) {
  if (prevClass === fzfCharClass.charNonWord && curClass !== fzfCharClass.charNonWord) {
    // Prefer matching at word boundaries
    //
    // This should prefer "a c" over "abc" for a pattern of "ac".
    return fzfBonusBoundary;
  }

  if (prevClass === fzfCharClass.charLower && curClass == fzfCharClass.charUpper || prevClass !== fzfCharClass.charNumber && curClass == fzfCharClass.charNumber) {
    // Prefer matching at the transition point between lower & upper for camelCase,
    // and from transition from letter to number for identifiers like letter123.
    //
    // This should prefer "OutNode" over "phone" for a pattern of "n",
    // and "abc123" over "x211" for a pattern of "1".
    return fzfBonusCamel123;
  }

  if (curClass === fzfCharClass.charNonWord) {
    return fzfBonusNonWord;
  }

  return 0;
}

function fzfCalculateScore(text, pattern, sidx, eidx) {
  let pidx = 0;
  let score = 0;
  let inGap = false;
  let consecutive = 0;
  let firstBonus = 0;
  let pos = new Array(pattern.length);
  let prevClass = fzfCharClass.charNonWord;

  if (sidx > 0) {
    prevClass = fzfCharClassOf(text[sidx - 1]);
  }

  for (let idx = sidx; idx < eidx; idx++) {
    let char = text[idx];
    let curClass = fzfCharClassOf(char);

    if (charsMatch(char, pattern[pidx])) {
      pos[pidx] = idx;
      score += fzfScoreMatch;
      let bonus = bonusFor(prevClass, curClass);

      if (consecutive == 0) {
        firstBonus = bonus;
      } else {
        // Break consecutive chunk
        if (bonus === fzfBonusBoundary) {
          firstBonus = bonus;
        }

        bonus = Math.max(bonus, firstBonus, fzfBonusConsecutive);
      }

      if (pidx === 0) {
        score += bonus * fzfBonusFirstCharMultiplier;
      } else {
        score += bonus;
      }

      inGap = false;
      consecutive++;
      pidx++;
    } else {
      if (inGap) {
        // Penalize gaps (this bonus is negative)
        score += fzfScoreGapExtension;
      } else {
        // Penalize the beginning of gaps more harshly
        score += fzfScoreGapStart;
      }

      inGap = true;
      consecutive = 0;
      firstBonus = 0;
    }

    prevClass = curClass;
  }

  if (pidx !== pattern.length) {
    throw new Error('fzfCalculateScore should only be called when pattern is found between sidx and eidx');
  }

  let matchedRanges = [[pos[0], pos[0] + 1]];

  for (let i = 1; i < pos.length; i++) {
    const curPos = pos[i];
    const curRange = matchedRanges[matchedRanges.length - 1];

    if (curRange[1] === curPos) {
      curRange[1] = curPos + 1;
    } else {
      matchedRanges.push([curPos, curPos + 1]);
    }
  }

  return {
    score,
    matchedRanges
  };
}
},{}],"../src/views/profile-select.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProfileSelectRow = ProfileSelectRow;
exports.ProfileSelect = ProfileSelect;

var _preact = require("preact");

var _hooks = require("preact/hooks");

var _aphrodite = require("aphrodite");

var _style = require("./style");

var _fuzzyFind = require("../lib/fuzzy-find");

var _utils = require("../lib/utils");

var _theme = require("./themes/theme");

function highlightRanges(text, ranges, highlightedClassName) {
  const spans = [];
  let last = 0;

  for (let range of ranges) {
    spans.push(text.slice(last, range[0]));
    spans.push((0, _preact.h)("span", {
      className: highlightedClassName
    }, text.slice(range[0], range[1])));
    last = range[1];
  }

  spans.push(text.slice(last));
  return (0, _preact.h)("span", null, spans);
}

function ProfileSelectRow({
  setProfileIndexToView,
  setHoveredProfileIndex,
  profile,
  selected,
  hovered,
  profileCount,
  nodeRef,
  closeProfileSelect,
  indexInProfileGroup,
  matchedRanges,
  indexInFilteredListView
}) {
  const style = getStyle((0, _theme.useTheme)());
  const onMouseUp = (0, _hooks.useCallback)(() => {
    closeProfileSelect();
    setProfileIndexToView(indexInProfileGroup);
  }, [closeProfileSelect, setProfileIndexToView, indexInProfileGroup]);
  const onMouseEnter = (0, _hooks.useCallback)(ev => {
    setHoveredProfileIndex(indexInProfileGroup);
  }, [setHoveredProfileIndex, indexInProfileGroup]);
  const name = profile.getName();
  const maxDigits = 1 + Math.floor(Math.log10(profileCount));
  const highlightedClassName = (0, _aphrodite.css)(style.highlighted);
  const highlighted = (0, _hooks.useMemo)(() => {
    const result = highlightRanges(name, matchedRanges, highlightedClassName);
    return result;
  }, [name, matchedRanges, highlightedClassName]); // TODO(jlfwong): There's a really gnarly edge-case here where the highlighted
  // ranges are part of the text truncated by ellipsis. I'm just going to punt
  // on solving for that.

  return (0, _preact.h)("div", {
    ref: nodeRef,
    onMouseUp: onMouseUp,
    onMouseEnter: onMouseEnter,
    title: name,
    className: (0, _aphrodite.css)(style.profileRow, indexInFilteredListView % 2 === 0 && style.profileRowEven, selected && style.profileRowSelected, hovered && style.profileRowHovered)
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.profileIndex, selected && style.profileIndexSelected),
    style: {
      width: maxDigits + 'em'
    }
  }, indexInProfileGroup + 1, ":"), ' ', highlighted);
}

function stopPropagation(ev) {
  ev.stopPropagation();
}

function getSortedFilteredProfiles(profiles, filterText) {
  const filtered = [];

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const match = (0, _fuzzyFind.fuzzyMatchStrings)(profile.getName(), filterText);
    if (!match) continue;
    filtered.push(Object.assign({
      indexInProfileGroup: i,
      profile
    }, match));
  }

  (0, _utils.sortBy)(filtered, p => -p.score);
  return filtered;
}

function ProfileSelect({
  profiles,
  closeProfileSelect,
  indexToView,
  visible,
  setProfileIndexToView
}) {
  const style = getStyle((0, _theme.useTheme)());
  const [filterText, setFilterText] = (0, _hooks.useState)('');
  const onFilterTextChange = (0, _hooks.useCallback)(ev => {
    const value = ev.target.value;
    setFilterText(value);
  }, [setFilterText]);
  const focusFilterInput = (0, _hooks.useCallback)(node => {
    if (node) {
      if (visible) {
        node.select();
      } else {
        node.blur();
      }
    }
  }, [visible]);
  const filteredProfiles = (0, _hooks.useMemo)(() => {
    return getSortedFilteredProfiles(profiles, filterText);
  }, [profiles, filterText]);
  const [hoveredProfileIndex, setHoveredProfileIndex] = (0, _hooks.useState)(0);
  const selectedNodeRef = (0, _hooks.useRef)(null);
  (0, _hooks.useEffect)(() => {
    if (visible) {
      // Whenever the profile select becomes visible...
      // Clear any hovered element
      setHoveredProfileIndex(null); // And scroll the selected profile into view, if possible

      if (selectedNodeRef.current !== null) {
        selectedNodeRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [visible]); // TODO(jlfwong): Hi-jacking the behavior of enter and the arrow keys won't
  // work well for some composition methods (e.g. a Chinese character
  // composition keyboard input method).

  const onFilterKeyUp = (0, _hooks.useCallback)(ev => {
    // Prevent the key-press from propagating to other keyboard shortcut
    // handlers in other components.
    ev.stopPropagation();
    let newHoveredIndexInFilteredList = null;

    switch (ev.key) {
      case 'Enter':
        {
          if (hoveredProfileIndex != null) {
            closeProfileSelect();
            setProfileIndexToView(hoveredProfileIndex);
          }

          break;
        }

      case 'Escape':
        {
          closeProfileSelect();
          break;
        }

      case 'ArrowDown':
        {
          ev.preventDefault();
          newHoveredIndexInFilteredList = 0;

          if (hoveredProfileIndex != null) {
            const indexInFilteredList = filteredProfiles.findIndex(p => p.indexInProfileGroup === hoveredProfileIndex);

            if (indexInFilteredList !== -1) {
              newHoveredIndexInFilteredList = indexInFilteredList + 1;
            }
          }

          break;
        }

      case 'ArrowUp':
        {
          ev.preventDefault();
          newHoveredIndexInFilteredList = filteredProfiles.length - 1;

          if (hoveredProfileIndex != null) {
            const indexInFilteredList = filteredProfiles.findIndex(p => p.indexInProfileGroup === hoveredProfileIndex);

            if (indexInFilteredList !== -1) {
              newHoveredIndexInFilteredList = indexInFilteredList - 1;
            }
          }

          break;
        }
    }

    if (newHoveredIndexInFilteredList != null && newHoveredIndexInFilteredList >= 0 && newHoveredIndexInFilteredList < filteredProfiles.length) {
      const indexInProfileGroup = filteredProfiles[newHoveredIndexInFilteredList].indexInProfileGroup;
      setHoveredProfileIndex(indexInProfileGroup);
      setPendingForcedScroll(true);
    }
  }, [closeProfileSelect, setProfileIndexToView, hoveredProfileIndex, filteredProfiles]);
  const [pendingForcedScroll, setPendingForcedScroll] = (0, _hooks.useState)(false);
  (0, _hooks.useEffect)(() => {
    // Whenever the list of filtered profiles changes, set the first element hovered.
    if (filteredProfiles.length > 0) {
      setHoveredProfileIndex(filteredProfiles[0].indexInProfileGroup);
      setPendingForcedScroll(true);
    }
  }, [setHoveredProfileIndex, filteredProfiles]);
  const hoveredNodeRef = (0, _hooks.useCallback)(hoveredNode => {
    if (pendingForcedScroll && hoveredNode) {
      hoveredNode.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest'
      });
      setPendingForcedScroll(false);
    }
  }, [pendingForcedScroll, setPendingForcedScroll]);
  const selectedHoveredRef = (0, _hooks.useCallback)(node => {
    selectedNodeRef.current = node;
    hoveredNodeRef(node);
  }, [selectedNodeRef, hoveredNodeRef]); // We allow ProfileSelect to be aware of its own visibility in order to retain
  // its scroll offset state between times when it's hidden & shown, and also to
  // scroll the selected node into view once it becomes shown again after the
  // selected profile has changed.

  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.profileSelectOuter)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.caret)
  }), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.profileSelectBox)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.filterInputContainer)
  }, (0, _preact.h)("input", {
    type: "text",
    className: (0, _aphrodite.css)(style.filterInput),
    ref: focusFilterInput,
    placeholder: 'Filter...',
    value: filterText,
    onInput: onFilterTextChange,
    onKeyDown: onFilterKeyUp,
    onKeyUp: stopPropagation,
    onKeyPress: stopPropagation
  })), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.profileSelectScrolling)
  }, filteredProfiles.map(({
    profile,
    matchedRanges,
    indexInProfileGroup
  }, indexInList) => {
    let ref = undefined;
    const selected = indexInProfileGroup === indexToView;
    const hovered = indexInProfileGroup === hoveredProfileIndex;

    if (selected && hovered) {
      ref = selectedHoveredRef;
    } else if (selected) {
      ref = selectedNodeRef;
    } else if (hovered) {
      ref = hoveredNodeRef;
    }

    return (0, _preact.h)(ProfileSelectRow, {
      setHoveredProfileIndex: setHoveredProfileIndex,
      indexInProfileGroup: indexInProfileGroup,
      indexInFilteredListView: indexInList,
      hovered: indexInProfileGroup == hoveredProfileIndex,
      selected: indexInProfileGroup === indexToView,
      profile: profile,
      profileCount: profiles.length,
      nodeRef: ref,
      matchedRanges: matchedRanges,
      setProfileIndexToView: setProfileIndexToView,
      closeProfileSelect: closeProfileSelect
    });
  }), filteredProfiles.length === 0 ? (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.profileRow)
  }, "No results match filter \"", filterText, "\"") : null)));
}

const paddingHeight = 10;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  filterInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 5,
    alignItems: 'stretch'
  },
  filterInput: {
    color: theme.altFgPrimaryColor,
    background: theme.altBgSecondaryColor,
    borderRadius: 5,
    padding: 5,
    ':focus': {
      border: 'none',
      outline: 'none'
    },
    '::selection': {
      color: theme.altFgPrimaryColor,
      background: theme.selectionPrimaryColor
    }
  },
  caret: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderBottom: '5px solid black'
  },
  highlighted: {
    background: theme.selectionSecondaryColor
  },
  padding: {
    height: paddingHeight,
    background: theme.altBgPrimaryColor
  },
  profileRow: {
    height: _style.Sizes.FRAME_HEIGHT - 2,
    border: '1px solid transparent',
    textAlign: 'left',
    paddingLeft: 10,
    paddingRight: 10,
    background: theme.altBgPrimaryColor,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    cursor: 'pointer'
  },
  profileRowHovered: {
    border: `1px solid ${theme.selectionPrimaryColor}`
  },
  profileRowSelected: {
    background: theme.selectionPrimaryColor
  },
  profileRowEven: {
    background: theme.altBgSecondaryColor
  },
  profileSelectScrolling: {
    maxHeight: `min(calc(100vh - ${_style.Sizes.TOOLBAR_HEIGHT - 2 * paddingHeight}px), ${20 * _style.Sizes.FRAME_HEIGHT}px)`,
    overflow: 'auto',
    '::-webkit-scrollbar': {
      background: theme.altBgPrimaryColor
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.altFgSecondaryColor,
      borderRadius: 20,
      border: `3px solid ${theme.altBgPrimaryColor}`,
      ':hover': {
        background: theme.altBgPrimaryColor
      }
    }
  },
  profileSelectBox: {
    width: '100%',
    paddingBottom: 10,
    background: theme.altBgPrimaryColor,
    color: theme.altFgPrimaryColor
  },
  profileSelectOuter: {
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
    zIndex: _style.ZIndex.PROFILE_SELECT,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  profileIndex: {
    textAlign: 'right',
    display: 'inline-block',
    color: theme.altFgSecondaryColor
  },
  profileIndexSelected: {
    color: theme.altFgPrimaryColor
  }
}));
},{"preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","./style":"../src/views/style.ts","../lib/fuzzy-find":"../src/lib/fuzzy-find.ts","../lib/utils":"../src/lib/utils.ts","./themes/theme":"../src/views/themes/theme.tsx"}],"../src/views/toolbar.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Toolbar = Toolbar;

var _preact = require("preact");

var _hooks = require("preact/hooks");

var _aphrodite = require("aphrodite");

var _style = require("./style");

var _profileSelect = require("./profile-select");

var _utils = require("../lib/utils");

var _theme = require("./themes/theme");

var _viewMode = require("../lib/view-mode");

var _appState = require("../app-state");

var _colorScheme = require("../app-state/color-scheme");

var _atom = require("../lib/atom");

function useSetViewMode(setViewMode, viewMode) {
  return (0, _hooks.useCallback)(() => setViewMode(viewMode), [setViewMode, viewMode]);
}

function ToolbarLeftContent(props) {
  const style = getStyle((0, _theme.useTheme)());
  const setChronoFlameChart = useSetViewMode(_appState.viewModeAtom.set, _viewMode.ViewMode.CHRONO_FLAME_CHART);
  const setLeftHeavyFlameGraph = useSetViewMode(_appState.viewModeAtom.set, _viewMode.ViewMode.LEFT_HEAVY_FLAME_GRAPH);
  const setSandwichView = useSetViewMode(_appState.viewModeAtom.set, _viewMode.ViewMode.SANDWICH_VIEW);
  const setCompareView = useSetViewMode(_appState.viewModeAtom.set, _viewMode.ViewMode.COMPARE_VIEW);
  if (!props.activeProfileState) return null;
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarLeft)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab, props.viewMode === _viewMode.ViewMode.CHRONO_FLAME_CHART && style.toolbarTabActive),
    onClick: setChronoFlameChart
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\uD83D\uDD70"), "Time Order"), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab, props.viewMode === _viewMode.ViewMode.LEFT_HEAVY_FLAME_GRAPH && style.toolbarTabActive),
    onClick: setLeftHeavyFlameGraph
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\u2B05\uFE0F"), "Left Heavy"), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab, props.viewMode === _viewMode.ViewMode.SANDWICH_VIEW && style.toolbarTabActive),
    onClick: setSandwichView
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\uD83E\uDD6A"), "Sandwich"), (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab, props.viewMode === _viewMode.ViewMode.COMPARE_VIEW && style.toolbarTabActive),
    onClick: setCompareView
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emojiBalance)
  }, "\u2696\uFE0F"), "Compare"));
}

const getCachedProfileList = (() => {
  // TODO(jlfwong): It would be nice to just implement this as useMemo, but if
  // we do that using profileGroup or profileGroup.profiles as the cache key,
  // then it will invalidate whenever *anything* changes, because
  // profileGroup.profiles is ProfileState[], which contains component state
  // information for each tab for each profile. So whenever any property in any
  // persisted view state changes for *any* view in *any* profile, the profiles
  // list will get re-generated.
  let cachedProfileList = null;
  return profileGroup => {
    let nextProfileList = (profileGroup === null || profileGroup === void 0 ? void 0 : profileGroup.profiles.map(p => p.profile)) || null;

    if (cachedProfileList === null || nextProfileList != null && !(0, _utils.objectsHaveShallowEquality)(cachedProfileList, nextProfileList)) {
      cachedProfileList = nextProfileList;
    }

    return cachedProfileList;
  };
})();

function ToolbarCenterContent(props) {
  const style = getStyle((0, _theme.useTheme)());
  const {
    activeProfileState,
    profileGroup
  } = props;
  const profiles = getCachedProfileList(profileGroup);
  const [profileSelectShown, setProfileSelectShown] = (0, _hooks.useState)(false);
  const openProfileSelect = (0, _hooks.useCallback)(() => {
    setProfileSelectShown(true);
  }, [setProfileSelectShown]);
  const closeProfileSelect = (0, _hooks.useCallback)(() => {
    setProfileSelectShown(false);
  }, [setProfileSelectShown]);
  (0, _hooks.useEffect)(() => {
    const onWindowKeyPress = ev => {
      if (ev.key === 't') {
        ev.preventDefault();
        setProfileSelectShown(true);
      }
    };

    window.addEventListener('keypress', onWindowKeyPress);
    return () => {
      window.removeEventListener('keypress', onWindowKeyPress);
    };
  }, [setProfileSelectShown]);
  (0, _hooks.useEffect)(() => {
    const onWindowKeyPress = ev => {
      if (ev.key === 't') {
        ev.preventDefault();
        setProfileSelectShown(true);
      }
    };

    window.addEventListener('keypress', onWindowKeyPress);
    return () => {
      window.removeEventListener('keypress', onWindowKeyPress);
    };
  }, [setProfileSelectShown]);

  if (activeProfileState && profileGroup && profiles) {
    if (profileGroup.profiles.length === 1) {
      return (0, _preact.h)(_preact.Fragment, null, activeProfileState.profile.getName());
    } else {
      return (0, _preact.h)("div", {
        className: (0, _aphrodite.css)(style.toolbarCenter),
        onMouseLeave: closeProfileSelect
      }, (0, _preact.h)("span", {
        onMouseOver: openProfileSelect
      }, activeProfileState.profile.getName(), ' ', (0, _preact.h)("span", {
        className: (0, _aphrodite.css)(style.toolbarProfileIndex)
      }, "(", activeProfileState.index + 1, "/", profileGroup.profiles.length, ")")), (0, _preact.h)("div", {
        style: {
          display: profileSelectShown ? 'block' : 'none'
        }
      }, (0, _preact.h)(_profileSelect.ProfileSelect, {
        setProfileIndexToView: props.setProfileIndexToView,
        indexToView: profileGroup.indexToView,
        profiles: profiles,
        closeProfileSelect: closeProfileSelect,
        visible: profileSelectShown
      })));
    }
  }

  return (0, _preact.h)(_preact.Fragment, null, '🔬speedscope');
}

function ToolbarRightContent(props) {
  const style = getStyle((0, _theme.useTheme)());
  const colorScheme = (0, _atom.useAtom)(_colorScheme.colorSchemeAtom);
  const exportFile = (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab),
    onClick: props.saveFile
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\u2934\uFE0F"), "Export");
  const importFile = (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab),
    onClick: props.browseForFile
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\u2935\uFE0F"), "Import");
  const colorSchemeToggle = (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab),
    onClick: _colorScheme.colorSchemeAtom.cycleToNextColorScheme
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\uD83C\uDFA8"), (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.toolbarTabColorSchemeToggle)
  }, (0, _theme.colorSchemeToString)(colorScheme)));
  const help = (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarTab)
  }, (0, _preact.h)("a", {
    href: "https://github.com/jlfwong/speedscope#usage",
    className: (0, _aphrodite.css)(style.noLinkStyle),
    target: "_blank"
  }, (0, _preact.h)("span", {
    className: (0, _aphrodite.css)(style.emoji)
  }, "\u2753"), "Help"));
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbarRight)
  }, props.activeProfileState && exportFile, importFile, colorSchemeToggle, help);
}

function Toolbar(props) {
  const style = getStyle((0, _theme.useTheme)());
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.toolbar)
  }, (0, _preact.h)(ToolbarLeftContent, Object.assign({}, props)), (0, _preact.h)(ToolbarCenterContent, Object.assign({}, props)), (0, _preact.h)(ToolbarRightContent, Object.assign({}, props)));
}

const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  toolbar: {
    height: _style.Sizes.TOOLBAR_HEIGHT,
    flexShrink: 0,
    background: theme.altBgPrimaryColor,
    color: theme.altFgPrimaryColor,
    textAlign: 'center',
    fontFamily: _style.FontFamily.MONOSPACE,
    fontSize: _style.FontSize.TITLE,
    lineHeight: `${_style.Sizes.TOOLBAR_TAB_HEIGHT}px`,
    userSelect: 'none'
  },
  toolbarLeft: {
    position: 'absolute',
    height: _style.Sizes.TOOLBAR_HEIGHT,
    overflow: 'hidden',
    top: 0,
    left: 0,
    marginRight: 2,
    textAlign: 'left'
  },
  toolbarCenter: {
    paddingTop: 1,
    height: _style.Sizes.TOOLBAR_HEIGHT
  },
  toolbarRight: {
    height: _style.Sizes.TOOLBAR_HEIGHT,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 2,
    textAlign: 'right'
  },
  toolbarProfileIndex: {
    color: theme.altFgSecondaryColor
  },
  toolbarTab: {
    background: theme.altBgSecondaryColor,
    marginTop: _style.Sizes.SEPARATOR_HEIGHT,
    height: _style.Sizes.TOOLBAR_TAB_HEIGHT,
    lineHeight: `${_style.Sizes.TOOLBAR_TAB_HEIGHT}px`,
    paddingLeft: 2,
    paddingRight: 8,
    display: 'inline-block',
    marginLeft: 2,
    transition: `all ${_style.Duration.HOVER_CHANGE} ease-in`,
    ':hover': {
      background: theme.selectionSecondaryColor
    }
  },
  toolbarTabActive: {
    background: theme.selectionPrimaryColor,
    ':hover': {
      background: theme.selectionPrimaryColor
    }
  },
  toolbarTabColorSchemeToggle: {
    display: 'inline-block',
    textAlign: 'center',
    minWidth: '50px'
  },
  emoji: {
    display: 'inline-block',
    verticalAlign: 'middle',
    paddingTop: '0px',
    marginRight: '0.3em'
  },
  emojiBalance: {
    display: 'inline-block',
    verticalAlign: 'middle',
    paddingTop: '0px',
    marginRight: '0.3em',
    // TODO: This is jank
    marginTop: '-6px',
    fontSize: '19px'
  },
  noLinkStyle: {
    textDecoration: 'none',
    color: 'inherit'
  }
}));
},{"preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","./style":"../src/views/style.ts","./profile-select":"../src/views/profile-select.tsx","../lib/utils":"../src/lib/utils.ts","./themes/theme":"../src/views/themes/theme.tsx","../lib/view-mode":"../src/lib/view-mode.ts","../app-state":"../src/app-state/index.ts","../app-state/color-scheme":"../src/app-state/color-scheme.ts","../lib/atom":"../src/lib/atom.ts"}],"../src/lib/js-source-map.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importJavaScriptSourceMapSymbolRemapper = importJavaScriptSourceMapSymbolRemapper;

var _utils = require("./utils");

// This file contains code to allow profiles to be remapped by JavaScript source maps.
//
// As of writing, this is using an out-of-date version of source-map, because the
// source-map library migrated to using web-assembly. This requires loading the
// web-assembly ball. The easiest way to do this is to load it from a third-party
// URL, but I want speedscope to work standalone offline. This means that the remaining
// options require some way of having a local URL that corresponds the .wasm file.
//
// Also as of writing, speedscope is bundled with Parcel v1. Trying to import
// a .wasm file in Parcel v1 tries to load the wasm module itself, which is not
// what I'm trying to do -- I want SourceMapConsumer.initialize to be the thing
// booting the WebAssembly, not Parcel itself.
//
// One way of getting around this problem is to modify the build system to
// copy the .wasm file from node_modules/source-map/lib/mappings.wasm. I could do
// this, but it's a bit of a pain.
//
// Another would be to use something like
// import("url:../node_modules/source-map/lib/mappings.wasm"), and then pass the
// resulting URL to SourceMapConsumer.initialize. This is also kind of a pain,
// because I can only do that if I upgrade to Parcel v2. Ultimately, I'd like to
// use esbuild rather than parcel at all, so for now I'm just punting on this by
// using an old-version of source-map which doesn't depend on wasm.
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

const sourceMapModule = require("_bundle_loader")(require.resolve('source-map'));

const DEBUG = false;

function importJavaScriptSourceMapSymbolRemapper(contentsString, sourceMapFileName) {
  return __awaiter(this, void 0, void 0, function* () {
    const sourceMap = yield sourceMapModule;
    let consumer = null;
    let contents = null;

    try {
      contents = JSON.parse(contentsString);
      consumer = new sourceMap.SourceMapConsumer(contents);
    } catch (e) {
      return null;
    }

    const mappingItems = [];
    consumer.eachMapping(function (m) {
      // The sourcemap library uses 1-based line numbers, and 0-based column
      // numbers. speedscope uses 1-based line-numbers, and 1-based column
      // numbers for its in-memory representation, so we'll normalize that
      // here too.
      mappingItems.push(Object.assign(Object.assign({}, m), {
        generatedColumn: m.generatedColumn + 1,
        originalColumn: m.originalColumn + 1
      }));
    }, {}, // We're going to binary search through these later, so make sure they're
    // sorted by their order in the generated file.
    sourceMap.SourceMapConsumer.GENERATED_ORDER);
    const sourceMapFileNameWithoutExt = sourceMapFileName.replace(/\.[^/]*$/, '');
    return frame => {
      var _a;

      let fileMatches = false;

      if ((contents === null || contents === void 0 ? void 0 : contents.file) && (contents === null || contents === void 0 ? void 0 : contents.file) === frame.file) {
        fileMatches = true;
      } else if (('/' + ((_a = frame.file) === null || _a === void 0 ? void 0 : _a.replace(/\.[^/]*$/, ''))).endsWith('/' + sourceMapFileNameWithoutExt)) {
        fileMatches = true;
      }

      if (!fileMatches) {
        // The source-map doesn't apply to the file this frame is defined in.
        return null;
      }

      if (frame.line == null || frame.col == null) {
        // If we don't have a line & column number for the frame, we can't
        // remap it.
        return null;
      } // If we got here, then we hopefully have an remapping.
      //
      // Ideally, we'd look up a symbol whose generatedLine & generatedColumn
      // match what we have in our profile, but unfortunately browsers don't do
      // this.
      //
      // Browsers set the column number for a function to the index of the
      // opening paren for the argument list, rather than the beginning of the
      // index of the name.
      //
      // function alpha() { ... }
      //               ^
      //
      // const beta = function() { ... }
      //                      ^
      //
      // const gamma = () => { ... }
      //               ^
      //
      // Since we don't have the source code being profiled, we unfortunately
      // can't normalize this to set the column to the first character of the
      // actual name.
      //
      // To work around this limitation, we'll search backwards from the first
      // mapping whose generatedLine & generatedColumn are beyond the location
      // in the profile.


      let mappingIndex = (0, _utils.findIndexBisect)(mappingItems, m => {
        if (m.generatedLine > frame.line) return true;
        if (m.generatedLine < frame.line) return false;
        if (m.generatedColumn >= frame.col) return true;
        return false;
      });

      if (mappingIndex === -1) {
        // There are no symbols following the given profile frame symbol, so try
        // to apply the very last mapping.
        mappingIndex = mappingItems.length - 1;
      } else if (mappingIndex === 0) {
        // If the very first index in mappingItems is beyond the location in the
        // profile, it means the name we're looking for doesn't have a
        // corresponding entry in the source-map (this can happen if the
        // source-map isn't the right source-map)
        return null;
      } else {
        mappingIndex--;
      }

      const sourceMapItem = mappingItems[mappingIndex];
      const remappedFrameInfo = {};

      if (sourceMapItem.name != null) {
        remappedFrameInfo.name = sourceMapItem.name;
      } else if (sourceMapItem.source != null) {
        // HACK: If the item name isn't specified, but the source is present, then
        // we're going to try to guess what the name is by using the originalLine
        // and originalColumn.
        // The second argument here is "returnNullOnMissing". Without this, it
        // throws instead of returning null.
        const content = consumer === null || consumer === void 0 ? void 0 : consumer.sourceContentFor(sourceMapItem.source, true);

        if (content) {
          const lines = content.split('\n');
          const line = lines[sourceMapItem.originalLine - 1];

          if (line) {
            // It's possible this source map entry will contain stuff other than
            // the name, so let's only consider word-ish characters that are part
            // of the prefix.
            const identifierMatch = /\w+/.exec(line.substr(sourceMapItem.originalColumn - 1));

            if (identifierMatch) {
              remappedFrameInfo.name = identifierMatch[0];
            }
          }
        }
      }

      switch (remappedFrameInfo.name) {
        case 'constructor':
          {
            // If the name was remapped to "constructor", then let's use the
            // original name, since "constructor" isn't very helpful.
            //
            // TODO(jlfwong): Search backwards for the class keyword and see if we
            // can guess the right name.
            remappedFrameInfo.name = frame.name + ' constructor';
            break;
          }

        case 'function':
          {
            // If the name is just "function", it probably means we either messed up
            // the remapping, or that we matched an anonymous function. In either
            // case, this isn't helpful, so put this back.
            remappedFrameInfo.name = frame.name;
            break;
          }

        case 'const':
        case 'export':
          {
            // If we got this, we probably just did a bad job leveraging the hack
            // looking through the source code. Let's fall-back to whatever the
            // original name was.
            remappedFrameInfo.name = frame.name;
            break;
          }
      }

      if (remappedFrameInfo.name && frame.name.includes(remappedFrameInfo.name)) {
        // If the remapped name is a substring of the original name, the original
        // name probably contains more useful information. In that case, just use
        // the original name instead.
        //
        // This can happen, for example, when remapping method names. If a
        // call stack says the symbol name is "n.zap" and we remapped it to a
        // function just called "zap", we might as well use the original name
        // instead.
        remappedFrameInfo.name = frame.name;
      }

      if (sourceMapItem.source != null) {
        remappedFrameInfo.file = sourceMapItem.source;
        remappedFrameInfo.line = sourceMapItem.originalLine;
        remappedFrameInfo.col = sourceMapItem.originalColumn;
      }

      if (DEBUG) {
        console.groupCollapsed(`Remapping "${frame.name}" -> "${remappedFrameInfo.name}"`);
        console.log('before', Object.assign({}, frame));
        console.log('item @ index', sourceMapItem);
        console.log('item @ index + 1', mappingItems[mappingIndex + 1]);
        console.log('after', remappedFrameInfo);
        console.groupEnd();
      }

      return remappedFrameInfo;
    };
  });
}
},{"_bundle_loader":"../node_modules/parcel-bundler/src/builtins/bundle-loader.js","source-map":[["source-map.8cb43e17.js","../node_modules/source-map/source-map.js"],"source-map.8cb43e17.js.map","../node_modules/source-map/source-map.js"],"./utils":"../src/lib/utils.ts"}],"../src/lib/frameDiffs.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFrameFromFrameDiff = getFrameFromFrameDiff;
exports.getFrameDiffs = getFrameDiffs;

function getFrameDifference(beforeFrame, afterFrame) {
  // Don't show difference in root time
  if ((beforeFrame === null || beforeFrame === void 0 ? void 0 : beforeFrame.name) === '[root]') {
    return {
      selfWeightDiff: 0,
      totalWeightDiff: 0,
      selfWeightPercentIncrease: 0,
      totalWeightPercentIncrease: 0
    };
  }

  const beforeTotalWeight = (beforeFrame === null || beforeFrame === void 0 ? void 0 : beforeFrame.getTotalWeight()) || 0;
  const beforeSelfWeight = (beforeFrame === null || beforeFrame === void 0 ? void 0 : beforeFrame.getSelfWeight()) || 0;
  const afterTotalWeight = (afterFrame === null || afterFrame === void 0 ? void 0 : afterFrame.getTotalWeight()) || 0;
  const afterSelfWeight = (afterFrame === null || afterFrame === void 0 ? void 0 : afterFrame.getSelfWeight()) || 0;
  const selfWeightDiff = afterSelfWeight - beforeSelfWeight;
  const totalWeightDiff = afterTotalWeight - beforeTotalWeight; // Calculate percentage increases, handling division by zero

  const selfWeightPercentIncrease = beforeSelfWeight !== 0 ? selfWeightDiff / beforeSelfWeight : 0;
  const totalWeightPercentIncrease = beforeTotalWeight !== 0 ? totalWeightDiff / beforeTotalWeight : 0;
  return {
    selfWeightDiff,
    totalWeightDiff,
    selfWeightPercentIncrease,
    totalWeightPercentIncrease
  };
}

function getFrameFromFrameDiff({
  beforeFrame,
  afterFrame
}) {
  const frame = beforeFrame !== null && beforeFrame !== void 0 ? beforeFrame : afterFrame;

  if (!frame) {
    throw new Error('before or after frame must be present');
  }

  return frame;
} // TODO: Memoize


function getFrameDiffs(beforeProfile, afterProfile) {
  const afterKeyMap = afterProfile.getKeyToFrameMap();
  const afterNameMap = afterProfile.getNameToFrameMap();
  const frameDiffs = [];
  /**
   * Find the frame in the after profile we think most likely matches the frame
   * in the before profile, first by key, and then by name if we don't have a key
   * match. For now we just ignore functions where we don't have a name
   */

  function getMatchingFrame(frame) {
    const afterFrame = afterKeyMap.get(frame.key);
    if (afterFrame) return afterFrame; // If we don't have a key match and it is an anonymous function, we just
    // return for now, since we don't have a good way of matching the frames.
    // In the future we could use the string similarities between keys or some
    // heuristic like that

    if (['anonymous', '(unnamed)'].includes(frame.name)) {
      return;
    }

    const framesByName = afterNameMap.get(frame.name) || [];
    return framesByName[0];
  }

  const visitedAfterFrameKeys = new Set();
  beforeProfile.forEachFrame(beforeFrame => {
    // Attempt to find the frame that matches in the after profile
    const afterFrame = getMatchingFrame(beforeFrame);

    if (afterFrame) {
      visitedAfterFrameKeys.add(afterFrame.key);
    }

    const {
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease
    } = getFrameDifference(beforeFrame, afterFrame);
    frameDiffs.push({
      beforeFrame,
      afterFrame,
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease
    });
  }); // Also include the afterProfile frames that were not present in the beforeProfile
  // TODO: Can probably clean this logic up a bit

  afterProfile.forEachFrame(afterFrame => {
    if (visitedAfterFrameKeys.has(afterFrame.key)) return;
    console.log(afterFrame);
    const {
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease
    } = getFrameDifference(undefined, afterFrame);
    frameDiffs.push({
      beforeFrame: undefined,
      afterFrame,
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease
    });
  });
  return frameDiffs;
}
},{}],"../src/views/compare-table-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompareTableViewContainer = exports.CompareTableView = void 0;

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _utils = require("../lib/utils");

var _style = require("./style");

var _colorChit = require("./color-chit");

var _scrollableListView = require("./scrollable-list-view");

var _getters = require("../app-state/getters");

var _compat = require("preact/compat");

var _hooks = require("preact/hooks");

var _sandwichView = require("./sandwich-view");

var _color = require("../lib/color");

var _theme = require("./themes/theme");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

var _searchView = require("./search-view");

var _frameDiffs = require("../lib/frameDiffs");

function HBarDisplay({
  percent
}) {
  const style = getStyle((0, _theme.useTheme)());
  const absolutePercent = Math.min(100, Math.abs(percent));
  const hBarStyle = percent < 0 ? style.hBarStylePositive : style.hBarStyleNegative;
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.hBarDisplay)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.hBarDisplayFilled, hBarStyle),
    style: {
      width: `${absolutePercent}%`
    }
  }));
}

function SortIcon(props) {
  const theme = (0, _theme.useTheme)();
  const style = getStyle(theme);
  const {
    activeDirection
  } = props;
  const upFill = activeDirection === _appState.SortDirection.ASCENDING ? theme.fgPrimaryColor : theme.fgSecondaryColor;
  const downFill = activeDirection === _appState.SortDirection.DESCENDING ? theme.fgPrimaryColor : theme.fgSecondaryColor;
  return (0, _preact.h)("svg", {
    width: "8",
    height: "10",
    viewBox: "0 0 8 10",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: (0, _aphrodite.css)(style.sortIcon)
  }, (0, _preact.h)("path", {
    d: "M0 4L4 0L8 4H0Z",
    fill: upFill
  }), (0, _preact.h)("path", {
    d: "M0 4L4 0L8 4H0Z",
    transform: "translate(0 10) scale(1 -1)",
    fill: downFill
  }));
}

function highlightRanges(text, ranges, highlightedClassName) {
  const spans = [];
  let last = 0;

  for (let range of ranges) {
    spans.push(text.slice(last, range[0]));
    spans.push((0, _preact.h)("span", {
      className: highlightedClassName
    }, text.slice(range[0], range[1])));
    last = range[1];
  }

  spans.push(text.slice(last));
  return (0, _preact.h)("span", null, spans);
}

function getCSSColorForDiff(diff, theme) {
  if (diff > 0) return theme.negative;
  if (diff < 0) return theme.positive;
  return 'gray';
}

const CompareTableRowView = ({
  frameDiff,
  matchedRanges,
  profile,
  index,
  selectedFrame,
  setSelectedDiff,
  selfPercent,
  totalPercent
}) => {
  const theme = (0, _theme.useTheme)();
  const style = getStyle(theme);
  const {
    totalWeightDiff,
    totalWeightPercentIncrease,
    selfWeightDiff,
    selfWeightPercentIncrease
  } = frameDiff;
  const frame = (0, _hooks.useMemo)(() => {
    return (0, _frameDiffs.getFrameFromFrameDiff)(frameDiff);
  }, [frameDiff]);
  const selected = frame === selectedFrame;
  return (0, _preact.h)("tr", {
    key: `${frame.key}`,
    onClick: setSelectedDiff.bind(null, frameDiff),
    className: (0, _aphrodite.css)(style.tableRow, index % 2 == 0 && style.tableRowEven, selected && style.tableRowSelected)
  }, (0, _preact.h)("td", {
    className: (0, _aphrodite.css)(style.numericCell)
  }, profile.formatValue(totalWeightDiff), " (", (0, _utils.formatPercent)(Math.abs(totalWeightPercentIncrease * 100)), ")", (0, _preact.h)(HBarDisplay, {
    percent: totalPercent
  })), (0, _preact.h)("td", {
    className: (0, _aphrodite.css)(style.numericCell)
  }, profile.formatValue(selfWeightDiff), " (", (0, _utils.formatPercent)(Math.abs(selfWeightPercentIncrease * 100)), ")", (0, _preact.h)(HBarDisplay, {
    percent: selfPercent
  })), (0, _preact.h)("td", {
    title: frame.file,
    className: (0, _aphrodite.css)(style.textCell)
  }, (0, _preact.h)(_colorChit.ColorChit, {
    color: getCSSColorForDiff(totalWeightDiff, theme)
  }), matchedRanges ? highlightRanges(frame.name, matchedRanges, (0, _aphrodite.css)(style.matched, selected && style.matchedSelected)) : frame.name));
};

const CompareTableView = (0, _compat.memo)(({
  profile,
  sortMethod,
  setSortMethod,
  selectedFrame,
  setSelectedDiff,
  getCSSColorForFrame,
  searchQuery,
  searchIsActive,
  frameDiffs
}) => {
  const style = getStyle((0, _theme.useTheme)());
  const largestTotalDiff = (0, _hooks.useMemo)(() => {
    return frameDiffs.reduce((acc, diff) => Math.max(Math.abs(diff.totalWeightDiff), acc), 0);
  }, [frameDiffs]);
  const largestSelfDiff = (0, _hooks.useMemo)(() => {
    return frameDiffs.reduce((acc, diff) => Math.max(Math.abs(diff.selfWeightDiff), acc), 0);
  }, [frameDiffs]);
  const onSortClick = (0, _hooks.useCallback)((field, ev) => {
    ev.preventDefault();

    if (sortMethod.field == field) {
      // Toggle
      setSortMethod({
        field,
        direction: sortMethod.direction === _appState.SortDirection.ASCENDING ? _appState.SortDirection.DESCENDING : _appState.SortDirection.ASCENDING
      });
    } else {
      // Set a sane default
      switch (field) {
        case _appState.CompareSortField.SYMBOL_NAME:
          {
            setSortMethod({
              field,
              direction: _appState.SortDirection.ASCENDING
            });
            break;
          }

        case _appState.CompareSortField.SELF_CHANGE:
        case _appState.CompareSortField.TOTAL_CHANGE:
          {
            setSortMethod({
              field,
              direction: _appState.SortDirection.DESCENDING
            });
            break;
          }
      }
    }
  }, [sortMethod, setSortMethod]);
  const sandwichContext = (0, _hooks.useContext)(_sandwichView.SandwichViewContext);
  const renderItems = (0, _hooks.useCallback)((firstIndex, lastIndex) => {
    if (!sandwichContext) return null;
    const rows = [];

    for (let i = firstIndex; i <= lastIndex; i++) {
      const frameDiff = frameDiffs[i];
      const frame = (0, _frameDiffs.getFrameFromFrameDiff)(frameDiff);
      const match = sandwichContext.getSearchMatchForFrame(frame);
      rows.push(CompareTableRowView({
        frameDiff,
        matchedRanges: match == null ? null : match,
        index: i,
        profile: profile,
        selectedFrame: selectedFrame,
        setSelectedDiff,
        getCSSColorForFrame: getCSSColorForFrame,
        totalPercent: frameDiff.totalWeightDiff / largestTotalDiff * 100,
        selfPercent: frameDiff.selfWeightDiff / largestSelfDiff * 100
      }));
    }

    if (rows.length === 0) {
      if (searchIsActive) {
        rows.push((0, _preact.h)("tr", null, (0, _preact.h)("td", {
          className: (0, _aphrodite.css)(style.emptyState)
        }, "No symbol names match query \"", searchQuery, "\".")));
      } else {
        rows.push((0, _preact.h)("tr", null, (0, _preact.h)("td", {
          className: (0, _aphrodite.css)(style.emptyState)
        }, "No symbols found.")));
      }
    }

    return (0, _preact.h)("table", {
      className: (0, _aphrodite.css)(style.tableView)
    }, rows);
  }, [frameDiffs, sandwichContext, profile, selectedFrame, setSelectedDiff, getCSSColorForFrame, searchIsActive, searchQuery, style.emptyState, style.tableView, largestSelfDiff, largestTotalDiff]);
  const listItems = (0, _hooks.useMemo)(() => frameDiffs.map(() => ({
    size: _style.Sizes.FRAME_HEIGHT
  })), [frameDiffs]);
  const onTotalClick = (0, _hooks.useCallback)(ev => onSortClick(_appState.CompareSortField.TOTAL_CHANGE, ev), [onSortClick]);
  const onSelfClick = (0, _hooks.useCallback)(ev => onSortClick(_appState.CompareSortField.SELF_CHANGE, ev), [onSortClick]);
  const onSymbolNameClick = (0, _hooks.useCallback)(ev => onSortClick(_appState.CompareSortField.SYMBOL_NAME, ev), [onSortClick]);
  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(_style.commonStyle.vbox, style.profileTableView)
  }, (0, _preact.h)("table", {
    className: (0, _aphrodite.css)(style.tableView)
  }, (0, _preact.h)("thead", {
    className: (0, _aphrodite.css)(style.tableHeader)
  }, (0, _preact.h)("tr", null, (0, _preact.h)("th", {
    className: (0, _aphrodite.css)(style.numericCell),
    onClick: onTotalClick
  }, (0, _preact.h)(SortIcon, {
    activeDirection: sortMethod.field === _appState.CompareSortField.TOTAL_CHANGE ? sortMethod.direction : null
  }), "Total Change"), (0, _preact.h)("th", {
    className: (0, _aphrodite.css)(style.numericCell),
    onClick: onSelfClick
  }, (0, _preact.h)(SortIcon, {
    activeDirection: sortMethod.field === _appState.CompareSortField.SELF_CHANGE ? sortMethod.direction : null
  }), "Self Change"), (0, _preact.h)("th", {
    className: (0, _aphrodite.css)(style.textCell),
    onClick: onSymbolNameClick
  }, (0, _preact.h)(SortIcon, {
    activeDirection: sortMethod.field === _appState.CompareSortField.SYMBOL_NAME ? sortMethod.direction : null
  }), "Symbol Name")))), (0, _preact.h)(_scrollableListView.ScrollableListView, {
    axis: 'y',
    items: listItems,
    className: (0, _aphrodite.css)(style.scrollView),
    renderItems: renderItems,
    initialIndexInView: selectedFrame == null ? null : sandwichContext === null || sandwichContext === void 0 ? void 0 : sandwichContext.getIndexForFrame(selectedFrame)
  }));
});
exports.CompareTableView = CompareTableView;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  profileTableView: {
    background: theme.bgPrimaryColor,
    height: '100%'
  },
  scrollView: {
    overflowY: 'auto',
    overflowX: 'hidden',
    flexGrow: 1,
    '::-webkit-scrollbar': {
      background: theme.bgPrimaryColor
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.fgSecondaryColor,
      borderRadius: 20,
      border: `3px solid ${theme.bgPrimaryColor}`,
      ':hover': {
        background: theme.fgPrimaryColor
      }
    }
  },
  tableView: {
    width: '100%',
    fontSize: _style.FontSize.LABEL,
    background: theme.bgPrimaryColor
  },
  tableHeader: {
    borderBottom: `2px solid ${theme.bgSecondaryColor}`,
    textAlign: 'left',
    color: theme.fgPrimaryColor,
    userSelect: 'none'
  },
  sortIcon: {
    position: 'relative',
    top: 1,
    marginRight: _style.Sizes.FRAME_HEIGHT / 4
  },
  tableRow: {
    background: theme.bgPrimaryColor,
    height: _style.Sizes.FRAME_HEIGHT
  },
  tableRowEven: {
    background: theme.bgSecondaryColor
  },
  tableRowSelected: {
    background: theme.selectionPrimaryColor,
    color: theme.altFgPrimaryColor
  },
  numericCell: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    position: 'relative',
    textAlign: 'right',
    paddingRight: _style.Sizes.FRAME_HEIGHT,
    width: 6 * _style.Sizes.FRAME_HEIGHT,
    minWidth: 6 * _style.Sizes.FRAME_HEIGHT
  },
  textCell: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: '100%',
    maxWidth: 0
  },
  hBarDisplay: {
    position: 'absolute',
    background: _color.Color.fromCSSHex(theme.weightColor).withAlpha(0.2).toCSS(),
    bottom: 2,
    height: 2,
    width: `calc(100% - ${2 * _style.Sizes.FRAME_HEIGHT}px)`,
    right: _style.Sizes.FRAME_HEIGHT
  },
  hBarDisplayFilled: {
    height: '100%',
    position: 'absolute',
    right: 0
  },
  hBarStylePositive: {
    background: theme.positive
  },
  hBarStyleNegative: {
    background: theme.negative
  },
  matched: {
    borderBottom: `2px solid ${theme.fgPrimaryColor}`
  },
  matchedSelected: {
    borderColor: theme.altFgPrimaryColor
  },
  emptyState: {
    textAlign: 'center',
    fontWeight: 'bold'
  }
})); // TODO: Deduplicate logic here

const CompareTableViewContainer = (0, _compat.memo)(ownProps => {
  const {
    activeProfileState,
    frameDiffs
  } = ownProps;
  const {
    profile,
    sandwichViewState
  } = activeProfileState;
  const profileSearchResults = (0, _hooks.useContext)(_searchView.ProfileSearchContext);
  const [sortMethod, setSortMethod] = (0, _hooks.useState)({
    field: _appState.CompareSortField.TOTAL_CHANGE,
    direction: _appState.SortDirection.DESCENDING
  });
  if (!profile) throw new Error('profile missing');
  const rowList = (0, _hooks.useMemo)(() => {
    const rowList = frameDiffs.filter(frameDiff => {
      const frame = (0, _frameDiffs.getFrameFromFrameDiff)(frameDiff);
      return !profileSearchResults || profileSearchResults.getMatchForFrame(frame);
    });

    switch (sortMethod.field) {
      case _appState.CompareSortField.SYMBOL_NAME:
        {
          (0, _utils.sortBy)(rowList, frameDiff => {
            const frame = (0, _frameDiffs.getFrameFromFrameDiff)(frameDiff);
            return frame.name.toLowerCase();
          });
          break;
        }

      case _appState.CompareSortField.TOTAL_CHANGE:
        {
          (0, _utils.sortBy)(rowList, diff => Math.abs(diff.totalWeightDiff));
          break;
        }

      case _appState.CompareSortField.SELF_CHANGE:
        {
          (0, _utils.sortBy)(rowList, diff => Math.abs(diff.selfWeightDiff));
          break;
        }
    }

    if (sortMethod.direction === _appState.SortDirection.DESCENDING) {
      rowList.reverse();
    }

    return rowList;
  }, [frameDiffs, sortMethod, profileSearchResults]);
  const theme = (0, _theme.useTheme)();
  const {
    callerCallee
  } = sandwichViewState;
  const selectedFrame = callerCallee ? callerCallee.selectedFrame : null;
  const frameToColorBucket = (0, _getters.getFrameToColorBucket)(profile);
  const getCSSColorForFrame = (0, _getters.createGetCSSColorForFrame)({
    theme,
    frameToColorBucket
  });
  const setSelectedDiff = (0, _hooks.useCallback)(frameDiff => {
    if (frameDiff === null || frameDiff === void 0 ? void 0 : frameDiff.beforeFrame) {
      _appState.profileGroupAtom.setSelectedFrame(frameDiff.beforeFrame);
    }

    if (frameDiff === null || frameDiff === void 0 ? void 0 : frameDiff.afterFrame) {
      _appState.compareProfileGroupAtom.setSelectedFrame(frameDiff.afterFrame);
    }
  }, []);
  const searchIsActive = (0, _atom.useAtom)(_appState.searchIsActiveAtom);
  const searchQuery = (0, _atom.useAtom)(_appState.searchQueryAtom);
  return (0, _preact.h)(CompareTableView, {
    profile: profile,
    frameDiffs: rowList,
    selectedFrame: selectedFrame,
    getCSSColorForFrame: getCSSColorForFrame,
    sortMethod: sortMethod,
    setSelectedDiff: setSelectedDiff,
    setSortMethod: setSortMethod,
    searchIsActive: searchIsActive,
    searchQuery: searchQuery
  });
});
exports.CompareTableViewContainer = CompareTableViewContainer;
},{"preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","../lib/utils":"../src/lib/utils.ts","./style":"../src/views/style.ts","./color-chit":"../src/views/color-chit.tsx","./scrollable-list-view":"../src/views/scrollable-list-view.tsx","../app-state/getters":"../src/app-state/getters.ts","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./sandwich-view":"../src/views/sandwich-view.tsx","../lib/color":"../src/lib/color.ts","./themes/theme":"../src/views/themes/theme.tsx","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts","./search-view":"../src/views/search-view.tsx","../lib/frameDiffs":"../src/lib/frameDiffs.ts"}],"../src/views/compare-view.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompareViewContainer = void 0;

var _preact = require("preact");

var _compat = require("preact/compat");

var _atom = require("../lib/atom");

var _appState = require("../app-state");

var _theme = require("./themes/theme");

var _style = require("./style");

var _aphrodite = require("aphrodite");

var _sandwichSearchView = require("./sandwich-search-view");

var _compareTableView = require("./compare-table-view");

var _sandwichView = require("./sandwich-view");

var _searchView = require("./search-view");

var _utils = require("../lib/utils");

var _calleeFlamegraphView = require("./callee-flamegraph-view");

var _frameDiffs = require("../lib/frameDiffs");

const CompareView = (0, _compat.memo)(function CompareView({
  activeProfileState,
  compareActiveProfileState,
  selectedFrame,
  theme
}) {
  // TODO: Abstract this into a hook
  (0, _compat.useEffect)(() => {
    function handleEscapeKeyPres(ev) {
      if (ev.key === 'Escape') {
        _appState.profileGroupAtom.setSelectedFrame(null);

        _appState.compareProfileGroupAtom.setSelectedFrame(null);
      }
    }

    window.addEventListener('keydown', handleEscapeKeyPres);
    return () => window.removeEventListener('keydown', handleEscapeKeyPres);
  }, []);
  const style = getStyle(theme);
  const {
    beforeProfile,
    afterProfile
  } = (0, _compat.useMemo)(() => {
    return {
      beforeProfile: activeProfileState.profile,
      afterProfile: compareActiveProfileState.profile
    };
  }, [activeProfileState, compareActiveProfileState]); // TODO: Globally memoize?

  const frameDiffs = (0, _compat.useMemo)(() => {
    return (0, _frameDiffs.getFrameDiffs)(beforeProfile, afterProfile);
  }, [beforeProfile, afterProfile]);
  let flamegraphViews = null;
  const beforeCallerCallee = activeProfileState.sandwichViewState.callerCallee;
  const afterCallerCallee = compareActiveProfileState.sandwichViewState.callerCallee;
  const flattenRecursion = (0, _atom.useAtom)(_appState.flattenRecursionAtom);
  /**
   * Set the total weight to be the maximum of the total weights of the two callee
   * profiles so the two flamegraphs share the same timescale
   */

  const getTotalWeight = (0, _compat.useCallback)(() => {
    let totalWeight = 0;

    if (beforeCallerCallee) {
      const beforeCalleeProfile = (0, _calleeFlamegraphView.getCalleeProfile)({
        profile: beforeProfile,
        frame: beforeCallerCallee.selectedFrame,
        flattenRecursion
      });
      totalWeight = beforeCalleeProfile.getTotalNonIdleWeight();
    }

    if (afterCallerCallee) {
      const afterCalleeProfile = (0, _calleeFlamegraphView.getCalleeProfile)({
        profile: afterProfile,
        frame: afterCallerCallee === null || afterCallerCallee === void 0 ? void 0 : afterCallerCallee.selectedFrame,
        flattenRecursion
      });
      const afterCalleeTotalWeight = afterCalleeProfile.getTotalNonIdleWeight();
      return Math.max(totalWeight, afterCalleeTotalWeight);
    }

    return totalWeight;
  }, [beforeProfile, afterProfile, beforeCallerCallee, afterCallerCallee, flattenRecursion]);

  if (selectedFrame) {
    flamegraphViews = (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(_style.commonStyle.fillY, style.callersAndCallees, _style.commonStyle.vbox)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(_style.commonStyle.hbox, style.panZoomViewWraper)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.flamechartLabelParent)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.flamechartLabel)
    }, "Before")), beforeCallerCallee && (0, _preact.h)(_calleeFlamegraphView.CalleeFlamegraphView, {
      profile: beforeProfile,
      callerCallee: beforeCallerCallee,
      getTotalWeight: getTotalWeight,
      profileGroupAtom: _appState.profileGroupAtom
    })), (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.divider)
    }), (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(_style.commonStyle.hbox, style.panZoomViewWraper)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.flamechartLabelParent, style.flamechartLabelParentBottom)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.flamechartLabel, style.flamechartLabelBottom)
    }, "After")), afterCallerCallee && (0, _preact.h)(_calleeFlamegraphView.CalleeFlamegraphView, {
      profile: afterProfile,
      callerCallee: afterCallerCallee,
      getTotalWeight: getTotalWeight,
      profileGroupAtom: _appState.compareProfileGroupAtom
    })));
  }

  return (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(_style.commonStyle.hbox, _style.commonStyle.fillY)
  }, (0, _preact.h)("div", {
    className: (0, _aphrodite.css)(style.tableView)
  }, (0, _preact.h)(_compareTableView.CompareTableViewContainer, {
    activeProfileState: activeProfileState,
    frameDiffs: frameDiffs
  }), (0, _preact.h)(_sandwichSearchView.SandwichSearchView, null)), flamegraphViews);
});
const CompareViewContainer = (0, _compat.memo)(({
  activeProfileState,
  compareActiveProfileState,
  onFileSelect
}) => {
  const style = getStyle((0, _theme.useTheme)());
  const {
    sandwichViewState,
    index
  } = activeProfileState;
  const {
    callerCallee
  } = sandwichViewState;
  const theme = (0, _theme.useTheme)(); // TODO: Does this even get used?

  const setSelectedFrame = (0, _compat.useCallback)(selectedFrame => {
    _appState.profileGroupAtom.setSelectedFrame(selectedFrame);
  }, []);
  const profile = activeProfileState.profile;
  const tableSortMethod = (0, _atom.useAtom)(_appState.tableSortMethodAtom);
  const profileSearchResults = (0, _compat.useContext)(_searchView.ProfileSearchContext);
  const selectedFrame = callerCallee ? callerCallee.selectedFrame : null;
  const rowList = (0, _compat.useMemo)(() => {
    const rowList = [];
    profile.forEachFrame(frame => {
      if (profileSearchResults && !profileSearchResults.getMatchForFrame(frame)) {
        return;
      }

      rowList.push(frame);
    });

    switch (tableSortMethod.field) {
      case _appState.SortField.SYMBOL_NAME:
        {
          (0, _utils.sortBy)(rowList, f => f.name.toLowerCase());
          break;
        }

      case _appState.SortField.SELF:
        {
          (0, _utils.sortBy)(rowList, f => f.getSelfWeight());
          break;
        }

      case _appState.SortField.TOTAL:
        {
          (0, _utils.sortBy)(rowList, f => f.getTotalWeight());
          break;
        }
    }

    if (tableSortMethod.direction === _appState.SortDirection.DESCENDING) {
      rowList.reverse();
    }

    return rowList;
  }, [profile, profileSearchResults, tableSortMethod]);
  const getIndexForFrame = (0, _compat.useMemo)(() => {
    const indexByFrame = new Map();

    for (let i = 0; i < rowList.length; i++) {
      indexByFrame.set(rowList[i], i);
    }

    return frame => {
      const index = indexByFrame.get(frame);
      return index == null ? null : index;
    };
  }, [rowList]);
  const getSearchMatchForFrame = (0, _compat.useMemo)(() => {
    return frame => {
      if (profileSearchResults == null) return null;
      return profileSearchResults.getMatchForFrame(frame);
    };
  }, [profileSearchResults]);
  const contextData = {
    rowList,
    selectedFrame,
    setSelectedFrame,
    getIndexForFrame,
    getSearchMatchForFrame
  }; // TODO: Deal with importing loading UI

  if (!compareActiveProfileState) {
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(_style.commonStyle.hbox, _style.commonStyle.fillY, style.landingContainer)
    }, (0, _preact.h)("p", {
      className: (0, _aphrodite.css)(style.landingP)
    }, "Upload a second profile to compare"), (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.browseButtonContainer)
    }, (0, _preact.h)("input", {
      type: "file",
      name: "file",
      id: "file",
      onChange: onFileSelect,
      className: (0, _aphrodite.css)(_style.commonStyle.hide)
    }), (0, _preact.h)("label", {
      for: "file",
      className: (0, _aphrodite.css)(style.browseButton),
      tabIndex: 0
    }, "Browse")));
  }

  return (0, _preact.h)(_sandwichView.SandwichViewContext.Provider, {
    value: contextData
  }, (0, _preact.h)(CompareView, {
    theme: theme,
    activeProfileState: activeProfileState,
    compareActiveProfileState: compareActiveProfileState,
    setSelectedFrame: setSelectedFrame,
    selectedFrame: selectedFrame,
    profileIndex: index
  }));
});
exports.CompareViewContainer = CompareViewContainer;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  // Table styles:
  tableView: {
    position: 'relative',
    flex: 1
  },
  panZoomViewWraper: {
    flex: 1
  },
  flamechartLabelParent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    fontSize: _style.FontSize.TITLE,
    width: _style.FontSize.TITLE * 1.2,
    borderRight: `1px solid ${theme.fgSecondaryColor}`
  },
  flamechartLabelParentBottom: {
    justifyContent: 'flex-start'
  },
  flamechartLabel: {
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50% 0',
    width: _style.FontSize.TITLE * 1.2,
    flexShrink: 1
  },
  flamechartLabelBottom: {
    transform: 'rotate(-90deg)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  callersAndCallees: {
    flex: 1,
    borderLeft: `${_style.Sizes.SEPARATOR_HEIGHT}px solid ${theme.fgSecondaryColor}`
  },
  divider: {
    height: 2,
    background: theme.fgSecondaryColor
  },
  // Landing styles
  landingContainer: {
    background: theme.bgPrimaryColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1
  },
  landingP: {
    marginBottom: 16
  },
  // TODO: Make a browse button component
  browseButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  browseButton: {
    marginBottom: 16,
    height: 72,
    flex: 1,
    maxWidth: 256,
    textAlign: 'center',
    fontSize: _style.FontSize.BIG_BUTTON,
    lineHeight: '72px',
    background: theme.selectionPrimaryColor,
    color: theme.altFgPrimaryColor,
    transition: `all ${_style.Duration.HOVER_CHANGE} ease-in`,
    padding: `0 60px`,
    ':hover': {
      background: theme.selectionSecondaryColor
    }
  }
}));
},{"preact":"../node_modules/preact/dist/preact.module.js","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","../lib/atom":"../src/lib/atom.ts","../app-state":"../src/app-state/index.ts","./themes/theme":"../src/views/themes/theme.tsx","./style":"../src/views/style.ts","aphrodite":"../node_modules/aphrodite/es/index.js","./sandwich-search-view":"../src/views/sandwich-search-view.tsx","./compare-table-view":"../src/views/compare-table-view.tsx","./sandwich-view":"../src/views/sandwich-view.tsx","./search-view":"../src/views/search-view.tsx","../lib/utils":"../src/lib/utils.ts","./callee-flamegraph-view":"../src/views/callee-flamegraph-view.tsx","../lib/frameDiffs":"../src/lib/frameDiffs.ts"}],"../sample/profiles/stackcollapse/perf-vertx-stacks-01-collapsed-all.txt":[function(require,module,exports) {
module.exports = "/perf-vertx-stacks-01-collapsed-all.17ebb379.txt";
},{}],"../src/views/application.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Application = exports.GLCanvas = void 0;

var _preact = require("preact");

var _aphrodite = require("aphrodite");

var _style = require("./style");

var _emscripten = require("../lib/emscripten");

var _sandwichView = require("./sandwich-view");

var _fileFormat = require("../lib/file-format");

var _flamechartViewContainer = require("./flamechart-view-container");

var _toolbar = require("./toolbar");

var _jsSourceMap = require("../lib/js-source-map");

var _theme = require("./themes/theme");

var _viewMode = require("../lib/view-mode");

var _appState = require("../app-state");

var _preactHelpers = require("../lib/preact-helpers");

var _compareView = require("./compare-view");

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

const importModule = require("_bundle_loader")(require.resolve('../import')); // Force eager loading of a few code-split modules.
//
// We put them all in one place so we can directly control the relative priority
// of these.


importModule.then(() => {});

require("_bundle_loader")(require.resolve('../lib/demangle-cpp')).then(() => {});

require("_bundle_loader")(require.resolve('source-map')).then(() => {});

function importProfilesFromText(fileName, contents) {
  return __awaiter(this, void 0, void 0, function* () {
    return (yield importModule).importProfileGroupFromText(fileName, contents);
  });
}

function importProfilesFromBase64(fileName, contents) {
  return __awaiter(this, void 0, void 0, function* () {
    return (yield importModule).importProfileGroupFromBase64(fileName, contents);
  });
}

function importProfilesFromArrayBuffer(fileName, contents) {
  return __awaiter(this, void 0, void 0, function* () {
    return (yield importModule).importProfilesFromArrayBuffer(fileName, contents);
  });
}

function importProfilesFromFile(file) {
  return __awaiter(this, void 0, void 0, function* () {
    return (yield importModule).importProfilesFromFile(file);
  });
}

function importFromFileSystemDirectoryEntry(entry) {
  return __awaiter(this, void 0, void 0, function* () {
    return (yield importModule).importFromFileSystemDirectoryEntry(entry);
  });
}

const exampleProfileURL = require('../../sample/profiles/stackcollapse/perf-vertx-stacks-01-collapsed-all.txt');

function isFileSystemDirectoryEntry(entry) {
  return entry != null && entry.isDirectory;
}

class GLCanvas extends _preactHelpers.StatelessComponent {
  constructor() {
    super(...arguments);
    this.canvas = null;

    this.ref = canvas => {
      if (canvas instanceof HTMLCanvasElement) {
        this.canvas = canvas;
      } else {
        this.canvas = null;
      }

      this.props.setGLCanvas(this.canvas);
    };

    this.container = null;

    this.containerRef = container => {
      if (container instanceof HTMLElement) {
        this.container = container;
      } else {
        this.container = null;
      }
    };

    this.maybeResize = () => {
      if (!this.container) return;
      if (!this.props.canvasContext) return;
      let {
        width,
        height
      } = this.container.getBoundingClientRect();
      const widthInAppUnits = width;
      const heightInAppUnits = height;
      const widthInPixels = width * window.devicePixelRatio;
      const heightInPixels = height * window.devicePixelRatio;
      this.props.canvasContext.gl.resize(widthInPixels, heightInPixels, widthInAppUnits, heightInAppUnits);
    };

    this.onWindowResize = () => {
      if (this.props.canvasContext) {
        this.props.canvasContext.requestFrame();
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.canvasContext !== nextProps.canvasContext) {
      if (this.props.canvasContext) {
        this.props.canvasContext.removeBeforeFrameHandler(this.maybeResize);
      }

      if (nextProps.canvasContext) {
        nextProps.canvasContext.addBeforeFrameHandler(this.maybeResize);
        nextProps.canvasContext.requestFrame();
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    if (this.props.canvasContext) {
      this.props.canvasContext.removeBeforeFrameHandler(this.maybeResize);
    }

    window.removeEventListener('resize', this.onWindowResize);
  }

  render() {
    const style = getStyle(this.props.theme);
    return (0, _preact.h)("div", {
      ref: this.containerRef,
      className: (0, _aphrodite.css)(style.glCanvasView)
    }, (0, _preact.h)("canvas", {
      ref: this.ref,
      width: 1,
      height: 1
    }));
  }

}

exports.GLCanvas = GLCanvas;

class Application extends _preactHelpers.StatelessComponent {
  constructor() {
    super(...arguments);

    this.loadExample = () => {
      this.loadProfile(() => __awaiter(this, void 0, void 0, function* () {
        const filename = 'perf-vertx-stacks-01-collapsed-all.txt';
        const data = yield fetch(exampleProfileURL).then(resp => resp.text());
        return yield importProfilesFromText(filename, data);
      }));
    };

    this.onDrop = ev => {
      this.props.setDragActive(false);
      ev.preventDefault();
      if (!ev.dataTransfer) return;
      const firstItem = ev.dataTransfer.items[0];

      if ('webkitGetAsEntry' in firstItem) {
        const webkitEntry = firstItem.webkitGetAsEntry(); // Instrument.app file format is actually a directory.

        if (webkitEntry && isFileSystemDirectoryEntry(webkitEntry) && webkitEntry.name.endsWith('.trace')) {
          console.log('Importing as Instruments.app .trace file');
          const webkitDirectoryEntry = webkitEntry;
          this.loadProfile(() => __awaiter(this, void 0, void 0, function* () {
            return yield importFromFileSystemDirectoryEntry(webkitDirectoryEntry);
          }));
          return;
        }
      }

      let file = ev.dataTransfer.files.item(0);

      if (file) {
        this.loadFromFile(file);
      }
    };

    this.onDragOver = ev => {
      this.props.setDragActive(true);
      ev.preventDefault();
    };

    this.onDragLeave = ev => {
      this.props.setDragActive(false);
      ev.preventDefault();
    };

    this.onWindowKeyPress = ev => __awaiter(this, void 0, void 0, function* () {
      if (ev.key === '1') {
        this.props.setViewMode(_viewMode.ViewMode.CHRONO_FLAME_CHART);
      } else if (ev.key === '2') {
        this.props.setViewMode(_viewMode.ViewMode.LEFT_HEAVY_FLAME_GRAPH);
      } else if (ev.key === '3') {
        this.props.setViewMode(_viewMode.ViewMode.SANDWICH_VIEW);
      } else if (ev.key === '4') {
        this.props.setViewMode(_viewMode.ViewMode.COMPARE_VIEW);
      } else if (ev.key === 'r') {
        const {
          flattenRecursion
        } = this.props;
        this.props.setFlattenRecursion(!flattenRecursion);
      } else if (ev.key === 'n') {
        const {
          activeProfileState
        } = this.props;

        if (activeProfileState) {
          this.props.setProfileIndexToView(activeProfileState.index + 1);
        }
      } else if (ev.key === 'p') {
        const {
          activeProfileState
        } = this.props;

        if (activeProfileState) {
          this.props.setProfileIndexToView(activeProfileState.index - 1);
        }
      }
    });

    this.saveFile = () => {
      if (this.props.profileGroup) {
        const {
          name,
          indexToView,
          profiles
        } = this.props.profileGroup;
        const profileGroup = {
          name,
          indexToView,
          profiles: profiles.map(p => p.profile)
        };
        (0, _fileFormat.saveToFile)(profileGroup);
      }
    };

    this.browseForFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.addEventListener('change', this.onFileSelect);
      input.click();
    };

    this.onWindowKeyDown = ev => __awaiter(this, void 0, void 0, function* () {
      // This has to be handled on key down in order to prevent the default
      // page save action.
      if (ev.key === 's' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault();
        this.saveFile();
      } else if (ev.key === 'o' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault();
        this.browseForFile();
      }
    });

    this.onDocumentPaste = ev => {
      if (document.activeElement != null && document.activeElement.nodeName === 'INPUT') return;
      ev.preventDefault();
      ev.stopPropagation();
      const clipboardData = ev.clipboardData;
      if (!clipboardData) return;
      const pasted = clipboardData.getData('text');
      this.loadProfile(() => __awaiter(this, void 0, void 0, function* () {
        return yield importProfilesFromText('From Clipboard', pasted);
      }));
    };

    this.onFileSelect = ev => {
      const file = ev.target.files.item(0);

      if (file) {
        this.loadFromFile(file);
      }
    };
  }

  loadProfile(loader) {
    return __awaiter(this, void 0, void 0, function* () {
      this.props.setLoading(true);
      yield new Promise(resolve => setTimeout(resolve, 0));
      if (!this.props.glCanvas) return;
      console.time('import');
      let profileGroup = null;

      try {
        profileGroup = yield loader();
      } catch (e) {
        console.log('Failed to load format', e);
        this.props.setError(true);
        return;
      } // TODO(jlfwong): Make these into nicer overlays


      if (profileGroup == null) {
        alert('Unrecognized format! See documentation about supported formats.');
        this.props.setLoading(false);
        return;
      } else if (profileGroup.profiles.length === 0) {
        alert("Successfully imported profile, but it's empty!");
        this.props.setLoading(false);
        return;
      }

      if (this.props.hashParams.title) {
        profileGroup = Object.assign(Object.assign({}, profileGroup), {
          name: this.props.hashParams.title
        });
      }

      document.title = `${profileGroup.name} - speedscope`;

      if (this.props.hashParams.viewMode) {
        this.props.setViewMode(this.props.hashParams.viewMode);
      }

      for (let profile of profileGroup.profiles) {
        yield profile.demangle();
      }

      for (let profile of profileGroup.profiles) {
        const title = this.props.hashParams.title || profile.getName();
        profile.setName(title);
      }

      console.timeEnd('import');

      if (this.props.viewMode === _viewMode.ViewMode.COMPARE_VIEW) {
        this.props.setCompareProfileGroup(profileGroup);
      } else {
        this.props.setProfileGroup(profileGroup);
      }

      this.props.setLoading(false);
    });
  }

  getStyle() {
    return getStyle(this.props.theme);
  }

  loadFromFile(file) {
    this.loadProfile(() => __awaiter(this, void 0, void 0, function* () {
      const profiles = yield importProfilesFromFile(file);

      if (profiles) {
        for (let profile of profiles.profiles) {
          if (!profile.getName()) {
            profile.setName(file.name);
          }
        }

        return profiles;
      }

      if (this.props.profileGroup && this.props.activeProfileState) {
        // If a profile is already loaded, it's possible the file being imported is
        // a symbol map. If that's the case, we want to parse it, and apply the symbol
        // mapping to the already loaded profile. This can be use to take an opaque
        // profile and make it readable.
        const reader = new FileReader();
        const fileContentsPromise = new Promise(resolve => {
          reader.addEventListener('loadend', () => {
            if (typeof reader.result !== 'string') {
              throw new Error('Expected reader.result to be a string');
            }

            resolve(reader.result);
          });
        });
        reader.readAsText(file);
        const fileContents = yield fileContentsPromise;
        let symbolRemapper = null;
        const emscriptenSymbolRemapper = (0, _emscripten.importEmscriptenSymbolMap)(fileContents);

        if (emscriptenSymbolRemapper) {
          console.log('Importing as emscripten symbol map');
          symbolRemapper = emscriptenSymbolRemapper;
        }

        const jsSourceMapRemapper = yield (0, _jsSourceMap.importJavaScriptSourceMapSymbolRemapper)(fileContents, file.name);

        if (!symbolRemapper && jsSourceMapRemapper) {
          console.log('Importing as JavaScript source map');
          symbolRemapper = jsSourceMapRemapper;
        }

        if (symbolRemapper != null) {
          return {
            name: this.props.profileGroup.name || 'profile',
            indexToView: this.props.profileGroup.indexToView,
            profiles: this.props.profileGroup.profiles.map(profileState => {
              // We do a shallow clone here to invalidate certain caches keyed
              // on a reference to the profile group under the assumption that
              // profiles are immutable. Symbol remapping is (at time of
              // writing) the only exception to that immutability.
              const p = profileState.profile.shallowClone();
              p.remapSymbols(symbolRemapper);
              return p;
            })
          };
        }
      }

      return null;
    }));
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('keypress', this.onWindowKeyPress);
    document.addEventListener('paste', this.onDocumentPaste);
    this.maybeLoadHashParamProfile();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyDown);
    window.removeEventListener('keypress', this.onWindowKeyPress);
    document.removeEventListener('paste', this.onDocumentPaste);
  }

  maybeLoadHashParamProfile() {
    return __awaiter(this, void 0, void 0, function* () {
      const {
        profileURL
      } = this.props.hashParams;

      if (profileURL) {
        if (!_appState.canUseXHR) {
          alert(`Cannot load a profile URL when loading from "${window.location.protocol}" URL protocol`);
          return;
        }

        this.loadProfile(() => __awaiter(this, void 0, void 0, function* () {
          const response = yield fetch(profileURL);
          let filename = new URL(profileURL, window.location.href).pathname;

          if (filename.includes('/')) {
            filename = filename.slice(filename.lastIndexOf('/') + 1);
          }

          return yield importProfilesFromArrayBuffer(filename, (yield response.arrayBuffer()));
        }));
      } else if (this.props.hashParams.localProfilePath) {
        // There isn't good cross-browser support for XHR of local files, even from
        // other local files. To work around this restriction, we load the local profile
        // as a JavaScript file which will invoke a global function.
        ;
        window['speedscope'] = {
          loadFileFromBase64: (filename, base64source) => {
            this.loadProfile(() => importProfilesFromBase64(filename, base64source));
          }
        };
        const script = document.createElement('script');
        script.src = `file:///${this.props.hashParams.localProfilePath}`;
        document.head.appendChild(script);
      }
    });
  }

  renderLanding() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.landingContainer)
    }, (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.landingMessage)
    }, (0, _preact.h)("p", {
      className: (0, _aphrodite.css)(style.landingP)
    }, "\uD83D\uDC4B Hi there! Welcome to \uD83D\uDD2Cspeedscope, an interactive", ' ', (0, _preact.h)("a", {
      className: (0, _aphrodite.css)(style.link),
      href: "http://www.brendangregg.com/FlameGraphs/cpuflamegraphs.html"
    }, "flamegraph"), ' ', "visualizer. Use it to help you make your software faster."), _appState.canUseXHR ? (0, _preact.h)("p", {
      className: (0, _aphrodite.css)(style.landingP)
    }, "Drag and drop a profile file onto this window to get started, click the big blue button below to browse for a profile to explore, or", ' ', (0, _preact.h)("a", {
      tabIndex: 0,
      className: (0, _aphrodite.css)(style.link),
      onClick: this.loadExample
    }, "click here"), ' ', "to load an example profile.") : (0, _preact.h)("p", {
      className: (0, _aphrodite.css)(style.landingP)
    }, "Drag and drop a profile file onto this window to get started, or click the big blue button below to browse for a profile to explore."), (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.browseButtonContainer)
    }, (0, _preact.h)("input", {
      type: "file",
      name: "file",
      id: "file",
      onChange: this.onFileSelect,
      className: (0, _aphrodite.css)(_style.commonStyle.hide)
    }), (0, _preact.h)("label", {
      for: "file",
      className: (0, _aphrodite.css)(style.browseButton),
      tabIndex: 0
    }, "Browse")), (0, _preact.h)("p", {
      className: (0, _aphrodite.css)(style.landingP)
    }, "See the", ' ', (0, _preact.h)("a", {
      className: (0, _aphrodite.css)(style.link),
      href: "https://github.com/jlfwong/speedscope#usage",
      target: "_blank"
    }, "documentation"), ' ', "for information about supported file formats, keyboard shortcuts, and how to navigate around the profile."), (0, _preact.h)("p", {
      className: (0, _aphrodite.css)(style.landingP)
    }, "speedscope is open source. Please", ' ', (0, _preact.h)("a", {
      className: (0, _aphrodite.css)(style.link),
      target: "_blank",
      href: "https://github.com/jlfwong/speedscope/issues"
    }, "report any issues on GitHub"), ".")));
  }

  renderError() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.error)
    }, (0, _preact.h)("div", null, "\uD83D\uDE3F Something went wrong."), (0, _preact.h)("div", null, "Check the JS console for more details."));
  }

  renderLoadingBar() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.loading)
    });
  }

  renderContent() {
    const {
      viewMode,
      activeProfileState,
      compareActiveProfileState,
      error,
      loading,
      glCanvas
    } = this.props;

    if (error) {
      return this.renderError();
    }

    if (loading) {
      return this.renderLoadingBar();
    }

    if (!activeProfileState || !glCanvas) {
      return this.renderLanding();
    }

    switch (viewMode) {
      case _viewMode.ViewMode.CHRONO_FLAME_CHART:
        {
          return (0, _preact.h)(_flamechartViewContainer.ChronoFlamechartView, {
            activeProfileState: activeProfileState,
            glCanvas: glCanvas
          });
        }

      case _viewMode.ViewMode.LEFT_HEAVY_FLAME_GRAPH:
        {
          return (0, _preact.h)(_flamechartViewContainer.LeftHeavyFlamechartView, {
            activeProfileState: activeProfileState,
            glCanvas: glCanvas
          });
        }

      case _viewMode.ViewMode.SANDWICH_VIEW:
        {
          return (0, _preact.h)(_sandwichView.SandwichViewContainer, {
            activeProfileState: activeProfileState,
            glCanvas: glCanvas
          });
        }

      case _viewMode.ViewMode.COMPARE_VIEW:
        {
          return (0, _preact.h)(_compareView.CompareViewContainer, {
            activeProfileState: activeProfileState,
            compareActiveProfileState: compareActiveProfileState,
            glCanvas: glCanvas,
            onFileSelect: this.onFileSelect
          });
        }
    }
  }

  render() {
    const style = this.getStyle();
    return (0, _preact.h)("div", {
      onDrop: this.onDrop,
      onDragOver: this.onDragOver,
      onDragLeave: this.onDragLeave,
      className: (0, _aphrodite.css)(style.root, this.props.dragActive && style.dragTargetRoot)
    }, (0, _preact.h)(GLCanvas, {
      setGLCanvas: this.props.setGLCanvas,
      canvasContext: this.props.canvasContext,
      theme: this.props.theme
    }), (0, _preact.h)(_toolbar.Toolbar, Object.assign({
      saveFile: this.saveFile,
      browseForFile: this.browseForFile
    }, this.props)), (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.contentContainer)
    }, this.renderContent()), this.props.dragActive && (0, _preact.h)("div", {
      className: (0, _aphrodite.css)(style.dragTarget)
    }));
  }

}

exports.Application = Application;
const getStyle = (0, _theme.withTheme)(theme => _aphrodite.StyleSheet.create({
  glCanvasView: {
    position: 'absolute',
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    pointerEvents: 'none'
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  loading: {
    height: 3,
    marginBottom: -3,
    background: theme.selectionPrimaryColor,
    transformOrigin: '0% 50%',
    animationName: [{
      from: {
        transform: `scaleX(0)`
      },
      to: {
        transform: `scaleX(1)`
      }
    }],
    animationTimingFunction: 'cubic-bezier(0, 1, 0, 1)',
    animationDuration: '30s'
  },
  root: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: _style.FontFamily.MONOSPACE,
    lineHeight: '20px',
    color: theme.fgPrimaryColor
  },
  dragTargetRoot: {
    cursor: 'copy'
  },
  dragTarget: {
    boxSizing: 'border-box',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: `5px dashed ${theme.selectionPrimaryColor}`,
    pointerEvents: 'none'
  },
  contentContainer: {
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    flex: 1
  },
  landingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  landingMessage: {
    maxWidth: 600
  },
  landingP: {
    marginBottom: 16
  },
  browseButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  browseButton: {
    marginBottom: 16,
    height: 72,
    flex: 1,
    maxWidth: 256,
    textAlign: 'center',
    fontSize: _style.FontSize.BIG_BUTTON,
    lineHeight: '72px',
    background: theme.selectionPrimaryColor,
    color: theme.altFgPrimaryColor,
    transition: `all ${_style.Duration.HOVER_CHANGE} ease-in`,
    ':hover': {
      background: theme.selectionSecondaryColor
    }
  },
  link: {
    color: theme.selectionPrimaryColor,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: `all ${_style.Duration.HOVER_CHANGE} ease-in`,
    ':hover': {
      color: theme.selectionSecondaryColor
    }
  }
}));
},{"preact":"../node_modules/preact/dist/preact.module.js","aphrodite":"../node_modules/aphrodite/es/index.js","./style":"../src/views/style.ts","../lib/emscripten":"../src/lib/emscripten.ts","./sandwich-view":"../src/views/sandwich-view.tsx","../lib/file-format":"../src/lib/file-format.ts","./flamechart-view-container":"../src/views/flamechart-view-container.tsx","./toolbar":"../src/views/toolbar.tsx","../lib/js-source-map":"../src/lib/js-source-map.ts","./themes/theme":"../src/views/themes/theme.tsx","../lib/view-mode":"../src/lib/view-mode.ts","../app-state":"../src/app-state/index.ts","../lib/preact-helpers":"../src/lib/preact-helpers.tsx","./compare-view":"../src/views/compare-view.tsx","_bundle_loader":"../node_modules/parcel-bundler/src/builtins/bundle-loader.js","../import":[["import.e89516e7.js","../src/import/index.ts"],"import.e89516e7.js.map","../src/import/index.ts"],"../lib/demangle-cpp":[["demangle-cpp.bde90258.js","../src/lib/demangle-cpp.ts"],"demangle-cpp.bde90258.js.map","../src/lib/demangle-cpp.ts"],"source-map":[["source-map.8cb43e17.js","../node_modules/source-map/source-map.js"],"source-map.8cb43e17.js.map","../node_modules/source-map/source-map.js"],"../../sample/profiles/stackcollapse/perf-vertx-stacks-01-collapsed-all.txt":"../sample/profiles/stackcollapse/perf-vertx-stacks-01-collapsed-all.txt"}],"../src/views/application-container.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApplicationContainer = void 0;

var _preact = require("preact");

var _getters = require("../app-state/getters");

var _compat = require("preact/compat");

var _activeProfileState = require("../app-state/active-profile-state");

var _theme = require("./themes/theme");

var _appState = require("../app-state");

var _atom = require("../lib/atom");

var _searchView = require("./search-view");

var _application = require("./application");

const ApplicationContainer = (0, _compat.memo)(() => {
  const canvas = (0, _atom.useAtom)(_appState.glCanvasAtom);
  const theme = (0, _theme.useTheme)();
  const canvasContext = (0, _compat.useMemo)(() => canvas ? (0, _getters.getCanvasContext)({
    theme,
    canvas
  }) : null, [theme, canvas]);
  return (0, _preact.h)(_searchView.ProfileSearchContextProvider, null, (0, _preact.h)(_application.Application, {
    activeProfileState: (0, _activeProfileState.useActiveProfileState)(),
    compareActiveProfileState: (0, _activeProfileState.useActiveCompareProfileState)(),
    canvasContext: canvasContext,
    setGLCanvas: _appState.glCanvasAtom.set,
    setLoading: _appState.loadingAtom.set,
    setError: _appState.errorAtom.set,
    setProfileGroup: _appState.profileGroupAtom.setProfileGroup,
    setCompareProfileGroup: _appState.compareProfileGroupAtom.setProfileGroup,
    setDragActive: _appState.dragActiveAtom.set,
    setViewMode: _appState.viewModeAtom.set,
    setFlattenRecursion: _appState.flattenRecursionAtom.set,
    setProfileIndexToView: _appState.profileGroupAtom.setProfileIndexToView,
    profileGroup: (0, _atom.useAtom)(_appState.profileGroupAtom),
    theme: theme,
    flattenRecursion: (0, _atom.useAtom)(_appState.flattenRecursionAtom),
    viewMode: (0, _atom.useAtom)(_appState.viewModeAtom),
    hashParams: (0, _atom.useAtom)(_appState.hashParamsAtom),
    glCanvas: canvas,
    dragActive: (0, _atom.useAtom)(_appState.dragActiveAtom),
    loading: (0, _atom.useAtom)(_appState.loadingAtom),
    error: (0, _atom.useAtom)(_appState.errorAtom)
  }));
});
exports.ApplicationContainer = ApplicationContainer;
},{"preact":"../node_modules/preact/dist/preact.module.js","../app-state/getters":"../src/app-state/getters.ts","preact/compat":"../node_modules/preact/compat/dist/compat.module.js","../app-state/active-profile-state":"../src/app-state/active-profile-state.ts","./themes/theme":"../src/views/themes/theme.tsx","../app-state":"../src/app-state/index.ts","../lib/atom":"../src/lib/atom.ts","./search-view":"../src/views/search-view.tsx","./application":"../src/views/application.tsx"}],"../src/speedscope.tsx":[function(require,module,exports) {
"use strict";

var _preact = require("preact");

var _applicationContainer = require("./views/application-container");

var _theme = require("./views/themes/theme");

console.log(`speedscope v${require('../package.json').version}`);

if (module.hot) {
  module.hot.dispose(() => {
    // Force the old component go through teardown steps
    (0, _preact.render)((0, _preact.h)("div", null), document.body, document.body.lastElementChild || undefined);
  });
  module.hot.accept();
}

(0, _preact.render)((0, _preact.h)(_theme.ThemeProvider, null, (0, _preact.h)(_applicationContainer.ApplicationContainer, null)), document.body, document.body.lastElementChild || undefined);
},{"preact":"../node_modules/preact/dist/preact.module.js","./views/application-container":"../src/views/application-container.tsx","./views/themes/theme":"../src/views/themes/theme.tsx","../package.json":"../package.json"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}],"../node_modules/parcel-bundler/src/builtins/loaders/browser/js-loader.js":[function(require,module,exports) {
module.exports = function loadJSBundle(bundle) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = bundle;

    script.onerror = function (e) {
      script.onerror = script.onload = null;
      reject(e);
    };

    script.onload = function () {
      script.onerror = script.onload = null;
      resolve();
    };

    document.getElementsByTagName('head')[0].appendChild(script);
  });
};
},{}],0:[function(require,module,exports) {
var b=require("../node_modules/parcel-bundler/src/builtins/bundle-loader.js");b.register("js",require("../node_modules/parcel-bundler/src/builtins/loaders/browser/js-loader.js"));
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js",0,"../src/speedscope.tsx"], null)
//# sourceMappingURL=/speedscope.ea40b203.js.map