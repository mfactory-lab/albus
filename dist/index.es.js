var it = Object.defineProperty;
var nt = (u, n, s) => n in u ? it(u, n, { enumerable: !0, configurable: !0, writable: !0, value: s }) : u[n] = s;
var P = (u, n, s) => (nt(u, typeof n != "symbol" ? n + "" : n, s), s);
import { AnchorProvider as ot, BorshCoder as st, EventManager as ct } from "@coral-xyz/anchor";
import * as I from "@solana/web3.js";
import { PublicKey as v, Transaction as K } from "@solana/web3.js";
import * as we from "@albus/core";
import * as y from "@metaplex-foundation/beet";
import * as O from "@metaplex-foundation/beet-solana";
var ee = {}, re = {};
re.byteLength = ft;
re.toByteArray = dt;
re.fromByteArray = yt;
var q = [], U = [], at = typeof Uint8Array < "u" ? Uint8Array : Array, le = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var j = 0, ut = le.length; j < ut; ++j)
  q[j] = le[j], U[le.charCodeAt(j)] = j;
U["-".charCodeAt(0)] = 62;
U["_".charCodeAt(0)] = 63;
function Ce(u) {
  var n = u.length;
  if (n % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var s = u.indexOf("=");
  s === -1 && (s = n);
  var p = s === n ? 0 : 4 - s % 4;
  return [s, p];
}
function ft(u) {
  var n = Ce(u), s = n[0], p = n[1];
  return (s + p) * 3 / 4 - p;
}
function pt(u, n, s) {
  return (n + s) * 3 / 4 - s;
}
function dt(u) {
  var n, s = Ce(u), p = s[0], d = s[1], l = new at(pt(u, p, d)), h = 0, c = d > 0 ? p - 4 : p, w;
  for (w = 0; w < c; w += 4)
    n = U[u.charCodeAt(w)] << 18 | U[u.charCodeAt(w + 1)] << 12 | U[u.charCodeAt(w + 2)] << 6 | U[u.charCodeAt(w + 3)], l[h++] = n >> 16 & 255, l[h++] = n >> 8 & 255, l[h++] = n & 255;
  return d === 2 && (n = U[u.charCodeAt(w)] << 2 | U[u.charCodeAt(w + 1)] >> 4, l[h++] = n & 255), d === 1 && (n = U[u.charCodeAt(w)] << 10 | U[u.charCodeAt(w + 1)] << 4 | U[u.charCodeAt(w + 2)] >> 2, l[h++] = n >> 8 & 255, l[h++] = n & 255), l;
}
function ht(u) {
  return q[u >> 18 & 63] + q[u >> 12 & 63] + q[u >> 6 & 63] + q[u & 63];
}
function lt(u, n, s) {
  for (var p, d = [], l = n; l < s; l += 3)
    p = (u[l] << 16 & 16711680) + (u[l + 1] << 8 & 65280) + (u[l + 2] & 255), d.push(ht(p));
  return d.join("");
}
function yt(u) {
  for (var n, s = u.length, p = s % 3, d = [], l = 16383, h = 0, c = s - p; h < c; h += l)
    d.push(lt(u, h, h + l > c ? c : h + l));
  return p === 1 ? (n = u[s - 1], d.push(
    q[n >> 2] + q[n << 4 & 63] + "=="
  )) : p === 2 && (n = (u[s - 2] << 8) + u[s - 1], d.push(
    q[n >> 10] + q[n >> 4 & 63] + q[n << 2 & 63] + "="
  )), d.join("");
}
var ge = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
ge.read = function(u, n, s, p, d) {
  var l, h, c = d * 8 - p - 1, w = (1 << c) - 1, F = w >> 1, x = -7, S = s ? d - 1 : 0, M = s ? -1 : 1, R = u[n + S];
  for (S += M, l = R & (1 << -x) - 1, R >>= -x, x += c; x > 0; l = l * 256 + u[n + S], S += M, x -= 8)
    ;
  for (h = l & (1 << -x) - 1, l >>= -x, x += p; x > 0; h = h * 256 + u[n + S], S += M, x -= 8)
    ;
  if (l === 0)
    l = 1 - F;
  else {
    if (l === w)
      return h ? NaN : (R ? -1 : 1) * (1 / 0);
    h = h + Math.pow(2, p), l = l - F;
  }
  return (R ? -1 : 1) * h * Math.pow(2, l - p);
};
ge.write = function(u, n, s, p, d, l) {
  var h, c, w, F = l * 8 - d - 1, x = (1 << F) - 1, S = x >> 1, M = d === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, R = p ? 0 : l - 1, V = p ? 1 : -1, G = n < 0 || n === 0 && 1 / n < 0 ? 1 : 0;
  for (n = Math.abs(n), isNaN(n) || n === 1 / 0 ? (c = isNaN(n) ? 1 : 0, h = x) : (h = Math.floor(Math.log(n) / Math.LN2), n * (w = Math.pow(2, -h)) < 1 && (h--, w *= 2), h + S >= 1 ? n += M / w : n += M * Math.pow(2, 1 - S), n * w >= 2 && (h++, w /= 2), h + S >= x ? (c = 0, h = x) : h + S >= 1 ? (c = (n * w - 1) * Math.pow(2, d), h = h + S) : (c = n * Math.pow(2, S - 1) * Math.pow(2, d), h = 0)); d >= 8; u[s + R] = c & 255, R += V, c /= 256, d -= 8)
    ;
  for (h = h << d | c, F += d; F > 0; u[s + R] = h & 255, R += V, h /= 256, F -= 8)
    ;
  u[s + R - V] |= G * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(u) {
  const n = re, s = ge, p = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  u.Buffer = c, u.SlowBuffer = Le, u.INSPECT_MAX_BYTES = 50;
  const d = 2147483647;
  u.kMaxLength = d, c.TYPED_ARRAY_SUPPORT = l(), !c.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function l() {
    try {
      const r = new Uint8Array(1), e = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(c.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (c.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(c.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (c.isBuffer(this))
        return this.byteOffset;
    }
  });
  function h(r) {
    if (r > d)
      throw new RangeError('The value "' + r + '" is invalid for option "size"');
    const e = new Uint8Array(r);
    return Object.setPrototypeOf(e, c.prototype), e;
  }
  function c(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return S(r);
    }
    return w(r, e, t);
  }
  c.poolSize = 8192;
  function w(r, e, t) {
    if (typeof r == "string")
      return M(r, e);
    if (ArrayBuffer.isView(r))
      return V(r);
    if (r == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r
      );
    if (T(r, ArrayBuffer) || r && T(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (T(r, SharedArrayBuffer) || r && T(r.buffer, SharedArrayBuffer)))
      return G(r, e, t);
    if (typeof r == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    const i = r.valueOf && r.valueOf();
    if (i != null && i !== r)
      return c.from(i, e, t);
    const o = Me(r);
    if (o)
      return o;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function")
      return c.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r
    );
  }
  c.from = function(r, e, t) {
    return w(r, e, t);
  }, Object.setPrototypeOf(c.prototype, Uint8Array.prototype), Object.setPrototypeOf(c, Uint8Array);
  function F(r) {
    if (typeof r != "number")
      throw new TypeError('"size" argument must be of type number');
    if (r < 0)
      throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  function x(r, e, t) {
    return F(r), r <= 0 ? h(r) : e !== void 0 ? typeof t == "string" ? h(r).fill(e, t) : h(r).fill(e) : h(r);
  }
  c.alloc = function(r, e, t) {
    return x(r, e, t);
  };
  function S(r) {
    return F(r), h(r < 0 ? 0 : fe(r) | 0);
  }
  c.allocUnsafe = function(r) {
    return S(r);
  }, c.allocUnsafeSlow = function(r) {
    return S(r);
  };
  function M(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !c.isEncoding(e))
      throw new TypeError("Unknown encoding: " + e);
    const t = xe(r, e) | 0;
    let i = h(t);
    const o = i.write(r, e);
    return o !== t && (i = i.slice(0, o)), i;
  }
  function R(r) {
    const e = r.length < 0 ? 0 : fe(r.length) | 0, t = h(e);
    for (let i = 0; i < e; i += 1)
      t[i] = r[i] & 255;
    return t;
  }
  function V(r) {
    if (T(r, Uint8Array)) {
      const e = new Uint8Array(r);
      return G(e.buffer, e.byteOffset, e.byteLength);
    }
    return R(r);
  }
  function G(r, e, t) {
    if (e < 0 || r.byteLength < e)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let i;
    return e === void 0 && t === void 0 ? i = new Uint8Array(r) : t === void 0 ? i = new Uint8Array(r, e) : i = new Uint8Array(r, e, t), Object.setPrototypeOf(i, c.prototype), i;
  }
  function Me(r) {
    if (c.isBuffer(r)) {
      const e = fe(r.length) | 0, t = h(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== void 0)
      return typeof r.length != "number" || he(r.length) ? h(0) : R(r);
    if (r.type === "Buffer" && Array.isArray(r.data))
      return R(r.data);
  }
  function fe(r) {
    if (r >= d)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + d.toString(16) + " bytes");
    return r | 0;
  }
  function Le(r) {
    return +r != r && (r = 0), c.alloc(+r);
  }
  c.isBuffer = function(e) {
    return e != null && e._isBuffer === !0 && e !== c.prototype;
  }, c.compare = function(e, t) {
    if (T(e, Uint8Array) && (e = c.from(e, e.offset, e.byteLength)), T(t, Uint8Array) && (t = c.from(t, t.offset, t.byteLength)), !c.isBuffer(e) || !c.isBuffer(t))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (e === t)
      return 0;
    let i = e.length, o = t.length;
    for (let a = 0, f = Math.min(i, o); a < f; ++a)
      if (e[a] !== t[a]) {
        i = e[a], o = t[a];
        break;
      }
    return i < o ? -1 : o < i ? 1 : 0;
  }, c.isEncoding = function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, c.concat = function(e, t) {
    if (!Array.isArray(e))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (e.length === 0)
      return c.alloc(0);
    let i;
    if (t === void 0)
      for (t = 0, i = 0; i < e.length; ++i)
        t += e[i].length;
    const o = c.allocUnsafe(t);
    let a = 0;
    for (i = 0; i < e.length; ++i) {
      let f = e[i];
      if (T(f, Uint8Array))
        a + f.length > o.length ? (c.isBuffer(f) || (f = c.from(f)), f.copy(o, a)) : Uint8Array.prototype.set.call(
          o,
          f,
          a
        );
      else if (c.isBuffer(f))
        f.copy(o, a);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      a += f.length;
    }
    return o;
  };
  function xe(r, e) {
    if (c.isBuffer(r))
      return r.length;
    if (ArrayBuffer.isView(r) || T(r, ArrayBuffer))
      return r.byteLength;
    if (typeof r != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r
      );
    const t = r.length, i = arguments.length > 2 && arguments[2] === !0;
    if (!i && t === 0)
      return 0;
    let o = !1;
    for (; ; )
      switch (e) {
        case "ascii":
        case "latin1":
        case "binary":
          return t;
        case "utf8":
        case "utf-8":
          return de(r).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return t * 2;
        case "hex":
          return t >>> 1;
        case "base64":
          return Ue(r).length;
        default:
          if (o)
            return i ? -1 : de(r).length;
          e = ("" + e).toLowerCase(), o = !0;
      }
  }
  c.byteLength = xe;
  function Ne(r, e, t) {
    let i = !1;
    if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e))
      return "";
    for (r || (r = "utf8"); ; )
      switch (r) {
        case "hex":
          return Ge(this, e, t);
        case "utf8":
        case "utf-8":
          return Ee(this, e, t);
        case "ascii":
          return Oe(this, e, t);
        case "latin1":
        case "binary":
          return Ve(this, e, t);
        case "base64":
          return Qe(this, e, t);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Je(this, e, t);
        default:
          if (i)
            throw new TypeError("Unknown encoding: " + r);
          r = (r + "").toLowerCase(), i = !0;
      }
  }
  c.prototype._isBuffer = !0;
  function z(r, e, t) {
    const i = r[e];
    r[e] = r[t], r[t] = i;
  }
  c.prototype.swap16 = function() {
    const e = this.length;
    if (e % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < e; t += 2)
      z(this, t, t + 1);
    return this;
  }, c.prototype.swap32 = function() {
    const e = this.length;
    if (e % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < e; t += 4)
      z(this, t, t + 3), z(this, t + 1, t + 2);
    return this;
  }, c.prototype.swap64 = function() {
    const e = this.length;
    if (e % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let t = 0; t < e; t += 8)
      z(this, t, t + 7), z(this, t + 1, t + 6), z(this, t + 2, t + 5), z(this, t + 3, t + 4);
    return this;
  }, c.prototype.toString = function() {
    const e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? Ee(this, 0, e) : Ne.apply(this, arguments);
  }, c.prototype.toLocaleString = c.prototype.toString, c.prototype.equals = function(e) {
    if (!c.isBuffer(e))
      throw new TypeError("Argument must be a Buffer");
    return this === e ? !0 : c.compare(this, e) === 0;
  }, c.prototype.inspect = function() {
    let e = "";
    const t = u.INSPECT_MAX_BYTES;
    return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, p && (c.prototype[p] = c.prototype.inspect), c.prototype.compare = function(e, t, i, o, a) {
    if (T(e, Uint8Array) && (e = c.from(e, e.offset, e.byteLength)), !c.isBuffer(e))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e
      );
    if (t === void 0 && (t = 0), i === void 0 && (i = e ? e.length : 0), o === void 0 && (o = 0), a === void 0 && (a = this.length), t < 0 || i > e.length || o < 0 || a > this.length)
      throw new RangeError("out of range index");
    if (o >= a && t >= i)
      return 0;
    if (o >= a)
      return -1;
    if (t >= i)
      return 1;
    if (t >>>= 0, i >>>= 0, o >>>= 0, a >>>= 0, this === e)
      return 0;
    let f = a - o, m = i - t;
    const B = Math.min(f, m), A = this.slice(o, a), E = e.slice(t, i);
    for (let g = 0; g < B; ++g)
      if (A[g] !== E[g]) {
        f = A[g], m = E[g];
        break;
      }
    return f < m ? -1 : m < f ? 1 : 0;
  };
  function Ae(r, e, t, i, o) {
    if (r.length === 0)
      return -1;
    if (typeof t == "string" ? (i = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, he(t) && (t = o ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (o)
        return -1;
      t = r.length - 1;
    } else if (t < 0)
      if (o)
        t = 0;
      else
        return -1;
    if (typeof e == "string" && (e = c.from(e, i)), c.isBuffer(e))
      return e.length === 0 ? -1 : Be(r, e, t, i, o);
    if (typeof e == "number")
      return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? o ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : Be(r, [e], t, i, o);
    throw new TypeError("val must be string, number or Buffer");
  }
  function Be(r, e, t, i, o) {
    let a = 1, f = r.length, m = e.length;
    if (i !== void 0 && (i = String(i).toLowerCase(), i === "ucs2" || i === "ucs-2" || i === "utf16le" || i === "utf-16le")) {
      if (r.length < 2 || e.length < 2)
        return -1;
      a = 2, f /= 2, m /= 2, t /= 2;
    }
    function B(E, g) {
      return a === 1 ? E[g] : E.readUInt16BE(g * a);
    }
    let A;
    if (o) {
      let E = -1;
      for (A = t; A < f; A++)
        if (B(r, A) === B(e, E === -1 ? 0 : A - E)) {
          if (E === -1 && (E = A), A - E + 1 === m)
            return E * a;
        } else
          E !== -1 && (A -= A - E), E = -1;
    } else
      for (t + m > f && (t = f - m), A = t; A >= 0; A--) {
        let E = !0;
        for (let g = 0; g < m; g++)
          if (B(r, A + g) !== B(e, g)) {
            E = !1;
            break;
          }
        if (E)
          return A;
      }
    return -1;
  }
  c.prototype.includes = function(e, t, i) {
    return this.indexOf(e, t, i) !== -1;
  }, c.prototype.indexOf = function(e, t, i) {
    return Ae(this, e, t, i, !0);
  }, c.prototype.lastIndexOf = function(e, t, i) {
    return Ae(this, e, t, i, !1);
  };
  function _e(r, e, t, i) {
    t = Number(t) || 0;
    const o = r.length - t;
    i ? (i = Number(i), i > o && (i = o)) : i = o;
    const a = e.length;
    i > a / 2 && (i = a / 2);
    let f;
    for (f = 0; f < i; ++f) {
      const m = parseInt(e.substr(f * 2, 2), 16);
      if (he(m))
        return f;
      r[t + f] = m;
    }
    return f;
  }
  function ze(r, e, t, i) {
    return Y(de(e, r.length - t), r, t, i);
  }
  function Ke(r, e, t, i) {
    return Y(Xe(e), r, t, i);
  }
  function We(r, e, t, i) {
    return Y(Ue(e), r, t, i);
  }
  function $e(r, e, t, i) {
    return Y(et(e, r.length - t), r, t, i);
  }
  c.prototype.write = function(e, t, i, o) {
    if (t === void 0)
      o = "utf8", i = this.length, t = 0;
    else if (i === void 0 && typeof t == "string")
      o = t, i = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(i) ? (i = i >>> 0, o === void 0 && (o = "utf8")) : (o = i, i = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    const a = this.length - t;
    if ((i === void 0 || i > a) && (i = a), e.length > 0 && (i < 0 || t < 0) || t > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    o || (o = "utf8");
    let f = !1;
    for (; ; )
      switch (o) {
        case "hex":
          return _e(this, e, t, i);
        case "utf8":
        case "utf-8":
          return ze(this, e, t, i);
        case "ascii":
        case "latin1":
        case "binary":
          return Ke(this, e, t, i);
        case "base64":
          return We(this, e, t, i);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return $e(this, e, t, i);
        default:
          if (f)
            throw new TypeError("Unknown encoding: " + o);
          o = ("" + o).toLowerCase(), f = !0;
      }
  }, c.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function Qe(r, e, t) {
    return e === 0 && t === r.length ? n.fromByteArray(r) : n.fromByteArray(r.slice(e, t));
  }
  function Ee(r, e, t) {
    t = Math.min(r.length, t);
    const i = [];
    let o = e;
    for (; o < t; ) {
      const a = r[o];
      let f = null, m = a > 239 ? 4 : a > 223 ? 3 : a > 191 ? 2 : 1;
      if (o + m <= t) {
        let B, A, E, g;
        switch (m) {
          case 1:
            a < 128 && (f = a);
            break;
          case 2:
            B = r[o + 1], (B & 192) === 128 && (g = (a & 31) << 6 | B & 63, g > 127 && (f = g));
            break;
          case 3:
            B = r[o + 1], A = r[o + 2], (B & 192) === 128 && (A & 192) === 128 && (g = (a & 15) << 12 | (B & 63) << 6 | A & 63, g > 2047 && (g < 55296 || g > 57343) && (f = g));
            break;
          case 4:
            B = r[o + 1], A = r[o + 2], E = r[o + 3], (B & 192) === 128 && (A & 192) === 128 && (E & 192) === 128 && (g = (a & 15) << 18 | (B & 63) << 12 | (A & 63) << 6 | E & 63, g > 65535 && g < 1114112 && (f = g));
        }
      }
      f === null ? (f = 65533, m = 1) : f > 65535 && (f -= 65536, i.push(f >>> 10 & 1023 | 55296), f = 56320 | f & 1023), i.push(f), o += m;
    }
    return je(i);
  }
  const ve = 4096;
  function je(r) {
    const e = r.length;
    if (e <= ve)
      return String.fromCharCode.apply(String, r);
    let t = "", i = 0;
    for (; i < e; )
      t += String.fromCharCode.apply(
        String,
        r.slice(i, i += ve)
      );
    return t;
  }
  function Oe(r, e, t) {
    let i = "";
    t = Math.min(r.length, t);
    for (let o = e; o < t; ++o)
      i += String.fromCharCode(r[o] & 127);
    return i;
  }
  function Ve(r, e, t) {
    let i = "";
    t = Math.min(r.length, t);
    for (let o = e; o < t; ++o)
      i += String.fromCharCode(r[o]);
    return i;
  }
  function Ge(r, e, t) {
    const i = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > i) && (t = i);
    let o = "";
    for (let a = e; a < t; ++a)
      o += tt[r[a]];
    return o;
  }
  function Je(r, e, t) {
    const i = r.slice(e, t);
    let o = "";
    for (let a = 0; a < i.length - 1; a += 2)
      o += String.fromCharCode(i[a] + i[a + 1] * 256);
    return o;
  }
  c.prototype.slice = function(e, t) {
    const i = this.length;
    e = ~~e, t = t === void 0 ? i : ~~t, e < 0 ? (e += i, e < 0 && (e = 0)) : e > i && (e = i), t < 0 ? (t += i, t < 0 && (t = 0)) : t > i && (t = i), t < e && (t = e);
    const o = this.subarray(e, t);
    return Object.setPrototypeOf(o, c.prototype), o;
  };
  function b(r, e, t) {
    if (r % 1 !== 0 || r < 0)
      throw new RangeError("offset is not uint");
    if (r + e > t)
      throw new RangeError("Trying to access beyond buffer length");
  }
  c.prototype.readUintLE = c.prototype.readUIntLE = function(e, t, i) {
    e = e >>> 0, t = t >>> 0, i || b(e, t, this.length);
    let o = this[e], a = 1, f = 0;
    for (; ++f < t && (a *= 256); )
      o += this[e + f] * a;
    return o;
  }, c.prototype.readUintBE = c.prototype.readUIntBE = function(e, t, i) {
    e = e >>> 0, t = t >>> 0, i || b(e, t, this.length);
    let o = this[e + --t], a = 1;
    for (; t > 0 && (a *= 256); )
      o += this[e + --t] * a;
    return o;
  }, c.prototype.readUint8 = c.prototype.readUInt8 = function(e, t) {
    return e = e >>> 0, t || b(e, 1, this.length), this[e];
  }, c.prototype.readUint16LE = c.prototype.readUInt16LE = function(e, t) {
    return e = e >>> 0, t || b(e, 2, this.length), this[e] | this[e + 1] << 8;
  }, c.prototype.readUint16BE = c.prototype.readUInt16BE = function(e, t) {
    return e = e >>> 0, t || b(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, c.prototype.readUint32LE = c.prototype.readUInt32LE = function(e, t) {
    return e = e >>> 0, t || b(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, c.prototype.readUint32BE = c.prototype.readUInt32BE = function(e, t) {
    return e = e >>> 0, t || b(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, c.prototype.readBigUInt64LE = L(function(e) {
    e = e >>> 0, Q(e, "offset");
    const t = this[e], i = this[e + 7];
    (t === void 0 || i === void 0) && J(e, this.length - 8);
    const o = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, a = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + i * 2 ** 24;
    return BigInt(o) + (BigInt(a) << BigInt(32));
  }), c.prototype.readBigUInt64BE = L(function(e) {
    e = e >>> 0, Q(e, "offset");
    const t = this[e], i = this[e + 7];
    (t === void 0 || i === void 0) && J(e, this.length - 8);
    const o = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], a = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + i;
    return (BigInt(o) << BigInt(32)) + BigInt(a);
  }), c.prototype.readIntLE = function(e, t, i) {
    e = e >>> 0, t = t >>> 0, i || b(e, t, this.length);
    let o = this[e], a = 1, f = 0;
    for (; ++f < t && (a *= 256); )
      o += this[e + f] * a;
    return a *= 128, o >= a && (o -= Math.pow(2, 8 * t)), o;
  }, c.prototype.readIntBE = function(e, t, i) {
    e = e >>> 0, t = t >>> 0, i || b(e, t, this.length);
    let o = t, a = 1, f = this[e + --o];
    for (; o > 0 && (a *= 256); )
      f += this[e + --o] * a;
    return a *= 128, f >= a && (f -= Math.pow(2, 8 * t)), f;
  }, c.prototype.readInt8 = function(e, t) {
    return e = e >>> 0, t || b(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, c.prototype.readInt16LE = function(e, t) {
    e = e >>> 0, t || b(e, 2, this.length);
    const i = this[e] | this[e + 1] << 8;
    return i & 32768 ? i | 4294901760 : i;
  }, c.prototype.readInt16BE = function(e, t) {
    e = e >>> 0, t || b(e, 2, this.length);
    const i = this[e + 1] | this[e] << 8;
    return i & 32768 ? i | 4294901760 : i;
  }, c.prototype.readInt32LE = function(e, t) {
    return e = e >>> 0, t || b(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, c.prototype.readInt32BE = function(e, t) {
    return e = e >>> 0, t || b(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, c.prototype.readBigInt64LE = L(function(e) {
    e = e >>> 0, Q(e, "offset");
    const t = this[e], i = this[e + 7];
    (t === void 0 || i === void 0) && J(e, this.length - 8);
    const o = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (i << 24);
    return (BigInt(o) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }), c.prototype.readBigInt64BE = L(function(e) {
    e = e >>> 0, Q(e, "offset");
    const t = this[e], i = this[e + 7];
    (t === void 0 || i === void 0) && J(e, this.length - 8);
    const o = (t << 24) + // Overflow
    this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(o) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + i);
  }), c.prototype.readFloatLE = function(e, t) {
    return e = e >>> 0, t || b(e, 4, this.length), s.read(this, e, !0, 23, 4);
  }, c.prototype.readFloatBE = function(e, t) {
    return e = e >>> 0, t || b(e, 4, this.length), s.read(this, e, !1, 23, 4);
  }, c.prototype.readDoubleLE = function(e, t) {
    return e = e >>> 0, t || b(e, 8, this.length), s.read(this, e, !0, 52, 8);
  }, c.prototype.readDoubleBE = function(e, t) {
    return e = e >>> 0, t || b(e, 8, this.length), s.read(this, e, !1, 52, 8);
  };
  function D(r, e, t, i, o, a) {
    if (!c.isBuffer(r))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > o || e < a)
      throw new RangeError('"value" argument is out of bounds');
    if (t + i > r.length)
      throw new RangeError("Index out of range");
  }
  c.prototype.writeUintLE = c.prototype.writeUIntLE = function(e, t, i, o) {
    if (e = +e, t = t >>> 0, i = i >>> 0, !o) {
      const m = Math.pow(2, 8 * i) - 1;
      D(this, e, t, i, m, 0);
    }
    let a = 1, f = 0;
    for (this[t] = e & 255; ++f < i && (a *= 256); )
      this[t + f] = e / a & 255;
    return t + i;
  }, c.prototype.writeUintBE = c.prototype.writeUIntBE = function(e, t, i, o) {
    if (e = +e, t = t >>> 0, i = i >>> 0, !o) {
      const m = Math.pow(2, 8 * i) - 1;
      D(this, e, t, i, m, 0);
    }
    let a = i - 1, f = 1;
    for (this[t + a] = e & 255; --a >= 0 && (f *= 256); )
      this[t + a] = e / f & 255;
    return t + i;
  }, c.prototype.writeUint8 = c.prototype.writeUInt8 = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, c.prototype.writeUint16LE = c.prototype.writeUInt16LE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, c.prototype.writeUint16BE = c.prototype.writeUInt16BE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, c.prototype.writeUint32LE = c.prototype.writeUInt32LE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, c.prototype.writeUint32BE = c.prototype.writeUInt32BE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  };
  function Ie(r, e, t, i, o) {
    De(e, i, o, r, t, 7);
    let a = Number(e & BigInt(4294967295));
    r[t++] = a, a = a >> 8, r[t++] = a, a = a >> 8, r[t++] = a, a = a >> 8, r[t++] = a;
    let f = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = f, f = f >> 8, r[t++] = f, f = f >> 8, r[t++] = f, f = f >> 8, r[t++] = f, t;
  }
  function Se(r, e, t, i, o) {
    De(e, i, o, r, t, 7);
    let a = Number(e & BigInt(4294967295));
    r[t + 7] = a, a = a >> 8, r[t + 6] = a, a = a >> 8, r[t + 5] = a, a = a >> 8, r[t + 4] = a;
    let f = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = f, f = f >> 8, r[t + 2] = f, f = f >> 8, r[t + 1] = f, f = f >> 8, r[t] = f, t + 8;
  }
  c.prototype.writeBigUInt64LE = L(function(e, t = 0) {
    return Ie(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }), c.prototype.writeBigUInt64BE = L(function(e, t = 0) {
    return Se(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }), c.prototype.writeIntLE = function(e, t, i, o) {
    if (e = +e, t = t >>> 0, !o) {
      const B = Math.pow(2, 8 * i - 1);
      D(this, e, t, i, B - 1, -B);
    }
    let a = 0, f = 1, m = 0;
    for (this[t] = e & 255; ++a < i && (f *= 256); )
      e < 0 && m === 0 && this[t + a - 1] !== 0 && (m = 1), this[t + a] = (e / f >> 0) - m & 255;
    return t + i;
  }, c.prototype.writeIntBE = function(e, t, i, o) {
    if (e = +e, t = t >>> 0, !o) {
      const B = Math.pow(2, 8 * i - 1);
      D(this, e, t, i, B - 1, -B);
    }
    let a = i - 1, f = 1, m = 0;
    for (this[t + a] = e & 255; --a >= 0 && (f *= 256); )
      e < 0 && m === 0 && this[t + a + 1] !== 0 && (m = 1), this[t + a] = (e / f >> 0) - m & 255;
    return t + i;
  }, c.prototype.writeInt8 = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, c.prototype.writeInt16LE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, c.prototype.writeInt16BE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, c.prototype.writeInt32LE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, c.prototype.writeInt32BE = function(e, t, i) {
    return e = +e, t = t >>> 0, i || D(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, c.prototype.writeBigInt64LE = L(function(e, t = 0) {
    return Ie(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }), c.prototype.writeBigInt64BE = L(function(e, t = 0) {
    return Se(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function be(r, e, t, i, o, a) {
    if (t + i > r.length)
      throw new RangeError("Index out of range");
    if (t < 0)
      throw new RangeError("Index out of range");
  }
  function Pe(r, e, t, i, o) {
    return e = +e, t = t >>> 0, o || be(r, e, t, 4), s.write(r, e, t, i, 23, 4), t + 4;
  }
  c.prototype.writeFloatLE = function(e, t, i) {
    return Pe(this, e, t, !0, i);
  }, c.prototype.writeFloatBE = function(e, t, i) {
    return Pe(this, e, t, !1, i);
  };
  function Fe(r, e, t, i, o) {
    return e = +e, t = t >>> 0, o || be(r, e, t, 8), s.write(r, e, t, i, 52, 8), t + 8;
  }
  c.prototype.writeDoubleLE = function(e, t, i) {
    return Fe(this, e, t, !0, i);
  }, c.prototype.writeDoubleBE = function(e, t, i) {
    return Fe(this, e, t, !1, i);
  }, c.prototype.copy = function(e, t, i, o) {
    if (!c.isBuffer(e))
      throw new TypeError("argument should be a Buffer");
    if (i || (i = 0), !o && o !== 0 && (o = this.length), t >= e.length && (t = e.length), t || (t = 0), o > 0 && o < i && (o = i), o === i || e.length === 0 || this.length === 0)
      return 0;
    if (t < 0)
      throw new RangeError("targetStart out of bounds");
    if (i < 0 || i >= this.length)
      throw new RangeError("Index out of range");
    if (o < 0)
      throw new RangeError("sourceEnd out of bounds");
    o > this.length && (o = this.length), e.length - t < o - i && (o = e.length - t + i);
    const a = o - i;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, i, o) : Uint8Array.prototype.set.call(
      e,
      this.subarray(i, o),
      t
    ), a;
  }, c.prototype.fill = function(e, t, i, o) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (o = t, t = 0, i = this.length) : typeof i == "string" && (o = i, i = this.length), o !== void 0 && typeof o != "string")
        throw new TypeError("encoding must be a string");
      if (typeof o == "string" && !c.isEncoding(o))
        throw new TypeError("Unknown encoding: " + o);
      if (e.length === 1) {
        const f = e.charCodeAt(0);
        (o === "utf8" && f < 128 || o === "latin1") && (e = f);
      }
    } else
      typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < i)
      throw new RangeError("Out of range index");
    if (i <= t)
      return this;
    t = t >>> 0, i = i === void 0 ? this.length : i >>> 0, e || (e = 0);
    let a;
    if (typeof e == "number")
      for (a = t; a < i; ++a)
        this[a] = e;
    else {
      const f = c.isBuffer(e) ? e : c.from(e, o), m = f.length;
      if (m === 0)
        throw new TypeError('The value "' + e + '" is invalid for argument "value"');
      for (a = 0; a < i - t; ++a)
        this[a + t] = f[a % m];
    }
    return this;
  };
  const $ = {};
  function pe(r, e, t) {
    $[r] = class extends t {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: e.apply(this, arguments),
          writable: !0,
          configurable: !0
        }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(o) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: o,
          writable: !0
        });
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    };
  }
  pe(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(r) {
      return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  ), pe(
    "ERR_INVALID_ARG_TYPE",
    function(r, e) {
      return `The "${r}" argument must be of type number. Received type ${typeof e}`;
    },
    TypeError
  ), pe(
    "ERR_OUT_OF_RANGE",
    function(r, e, t) {
      let i = `The value of "${r}" is out of range.`, o = t;
      return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? o = Re(String(t)) : typeof t == "bigint" && (o = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (o = Re(o)), o += "n"), i += ` It must be ${e}. Received ${o}`, i;
    },
    RangeError
  );
  function Re(r) {
    let e = "", t = r.length;
    const i = r[0] === "-" ? 1 : 0;
    for (; t >= i + 4; t -= 3)
      e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(0, t)}${e}`;
  }
  function Ze(r, e, t) {
    Q(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && J(e, r.length - (t + 1));
  }
  function De(r, e, t, i, o, a) {
    if (r > t || r < e) {
      const f = typeof e == "bigint" ? "n" : "";
      let m;
      throw a > 3 ? e === 0 || e === BigInt(0) ? m = `>= 0${f} and < 2${f} ** ${(a + 1) * 8}${f}` : m = `>= -(2${f} ** ${(a + 1) * 8 - 1}${f}) and < 2 ** ${(a + 1) * 8 - 1}${f}` : m = `>= ${e}${f} and <= ${t}${f}`, new $.ERR_OUT_OF_RANGE("value", m, r);
    }
    Ze(i, o, a);
  }
  function Q(r, e) {
    if (typeof r != "number")
      throw new $.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  function J(r, e, t) {
    throw Math.floor(r) !== r ? (Q(r, t), new $.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new $.ERR_BUFFER_OUT_OF_BOUNDS() : new $.ERR_OUT_OF_RANGE(
      t || "offset",
      `>= ${t ? 1 : 0} and <= ${e}`,
      r
    );
  }
  const Ye = /[^+/0-9A-Za-z-_]/g;
  function He(r) {
    if (r = r.split("=")[0], r = r.trim().replace(Ye, ""), r.length < 2)
      return "";
    for (; r.length % 4 !== 0; )
      r = r + "=";
    return r;
  }
  function de(r, e) {
    e = e || 1 / 0;
    let t;
    const i = r.length;
    let o = null;
    const a = [];
    for (let f = 0; f < i; ++f) {
      if (t = r.charCodeAt(f), t > 55295 && t < 57344) {
        if (!o) {
          if (t > 56319) {
            (e -= 3) > -1 && a.push(239, 191, 189);
            continue;
          } else if (f + 1 === i) {
            (e -= 3) > -1 && a.push(239, 191, 189);
            continue;
          }
          o = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && a.push(239, 191, 189), o = t;
          continue;
        }
        t = (o - 55296 << 10 | t - 56320) + 65536;
      } else
        o && (e -= 3) > -1 && a.push(239, 191, 189);
      if (o = null, t < 128) {
        if ((e -= 1) < 0)
          break;
        a.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0)
          break;
        a.push(
          t >> 6 | 192,
          t & 63 | 128
        );
      } else if (t < 65536) {
        if ((e -= 3) < 0)
          break;
        a.push(
          t >> 12 | 224,
          t >> 6 & 63 | 128,
          t & 63 | 128
        );
      } else if (t < 1114112) {
        if ((e -= 4) < 0)
          break;
        a.push(
          t >> 18 | 240,
          t >> 12 & 63 | 128,
          t >> 6 & 63 | 128,
          t & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return a;
  }
  function Xe(r) {
    const e = [];
    for (let t = 0; t < r.length; ++t)
      e.push(r.charCodeAt(t) & 255);
    return e;
  }
  function et(r, e) {
    let t, i, o;
    const a = [];
    for (let f = 0; f < r.length && !((e -= 2) < 0); ++f)
      t = r.charCodeAt(f), i = t >> 8, o = t % 256, a.push(o), a.push(i);
    return a;
  }
  function Ue(r) {
    return n.toByteArray(He(r));
  }
  function Y(r, e, t, i) {
    let o;
    for (o = 0; o < i && !(o + t >= e.length || o >= r.length); ++o)
      e[o + t] = r[o];
    return o;
  }
  function T(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  function he(r) {
    return r !== r;
  }
  const tt = function() {
    const r = "0123456789abcdef", e = new Array(256);
    for (let t = 0; t < 16; ++t) {
      const i = t * 16;
      for (let o = 0; o < 16; ++o)
        e[i + o] = r[t] + r[o];
    }
    return e;
  }();
  function L(r) {
    return typeof BigInt > "u" ? rt : r;
  }
  function rt() {
    throw new Error("BigInt not supported");
  }
})(ee);
const mt = "0.0.5", wt = "albus", gt = [
  {
    name: "addServiceProvider",
    accounts: [
      {
        name: "serviceProvider",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "authority",
        isMut: !0,
        isSigner: !0
      },
      {
        name: "systemProgram",
        isMut: !1,
        isSigner: !1
      }
    ],
    args: [
      {
        name: "data",
        type: {
          defined: "AddServiceProviderData"
        }
      }
    ]
  },
  {
    name: "deleteServiceProvider",
    accounts: [
      {
        name: "serviceProvider",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "authority",
        isMut: !0,
        isSigner: !0
      },
      {
        name: "systemProgram",
        isMut: !1,
        isSigner: !1
      }
    ],
    args: []
  },
  {
    name: "createProofRequest",
    accounts: [
      {
        name: "serviceProvider",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "proofRequest",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "circuitMint",
        isMut: !1,
        isSigner: !1
      },
      {
        name: "circuitMetadata",
        isMut: !1,
        isSigner: !1
      },
      {
        name: "authority",
        isMut: !0,
        isSigner: !0
      },
      {
        name: "systemProgram",
        isMut: !1,
        isSigner: !1
      }
    ],
    args: [
      {
        name: "data",
        type: {
          defined: "CreateProofRequestData"
        }
      }
    ]
  },
  {
    name: "deleteProofRequest",
    accounts: [
      {
        name: "proofRequest",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "authority",
        isMut: !0,
        isSigner: !0
      },
      {
        name: "systemProgram",
        isMut: !1,
        isSigner: !1
      }
    ],
    args: []
  },
  {
    name: "prove",
    accounts: [
      {
        name: "proofRequest",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "authority",
        isMut: !0,
        isSigner: !0
      },
      {
        name: "systemProgram",
        isMut: !1,
        isSigner: !1
      }
    ],
    args: [
      {
        name: "data",
        type: {
          defined: "ProveData"
        }
      }
    ]
  },
  {
    name: "verify",
    accounts: [
      {
        name: "proofRequest",
        isMut: !0,
        isSigner: !1
      },
      {
        name: "authority",
        isMut: !0,
        isSigner: !0
      },
      {
        name: "systemProgram",
        isMut: !1,
        isSigner: !1
      }
    ],
    args: [
      {
        name: "data",
        type: {
          defined: "VerifyData"
        }
      }
    ]
  }
], xt = [
  {
    name: "ServiceProvider",
    type: {
      kind: "struct",
      fields: [
        {
          name: "authority",
          docs: [
            "Authority that manages the service"
          ],
          type: "publicKey"
        },
        {
          name: "code",
          docs: [
            "Unique code identifying the service"
          ],
          type: "string"
        },
        {
          name: "name",
          docs: [
            "Name of the service"
          ],
          type: "string"
        },
        {
          name: "proofRequestCount",
          docs: [
            "Total number of proof requests"
          ],
          type: "u64"
        },
        {
          name: "createdAt",
          docs: [
            "Timestamp for when the service was created"
          ],
          type: "i64"
        },
        {
          name: "bump",
          docs: [
            "Bump seed used to derive program-derived account seeds"
          ],
          type: "u8"
        }
      ]
    }
  },
  {
    name: "ProofRequest",
    type: {
      kind: "struct",
      fields: [
        {
          name: "serviceProvider",
          docs: [
            "Address of the [ServiceProvider] associated with this request"
          ],
          type: "publicKey"
        },
        {
          name: "circuit",
          docs: [
            "Address of the circuit associated with this request"
          ],
          type: "publicKey"
        },
        {
          name: "owner",
          docs: [
            "Address of the request initiator"
          ],
          type: "publicKey"
        },
        {
          name: "createdAt",
          docs: [
            "Timestamp for when the request was created"
          ],
          type: "i64"
        },
        {
          name: "expiredAt",
          docs: [
            "Timestamp for when the request will expire"
          ],
          type: "i64"
        },
        {
          name: "verifiedAt",
          docs: [
            "Timestamp for when the proof was verified"
          ],
          type: "i64"
        },
        {
          name: "provedAt",
          docs: [
            "Timestamp for when the user was added to the proof"
          ],
          type: "i64"
        },
        {
          name: "status",
          docs: [
            "Status of the request"
          ],
          type: {
            defined: "ProofRequestStatus"
          }
        },
        {
          name: "bump",
          docs: [
            "Bump seed used to derive program-derived account seeds"
          ],
          type: "u8"
        },
        {
          name: "proof",
          docs: [
            "Proof itself"
          ],
          type: {
            option: {
              defined: "Proof"
            }
          }
        }
      ]
    }
  }
], At = [
  {
    name: "AddServiceProviderData",
    docs: [
      "Data required to add a new service provider"
    ],
    type: {
      kind: "struct",
      fields: [
        {
          name: "code",
          docs: [
            "The unique code representing the service"
          ],
          type: "string"
        },
        {
          name: "name",
          docs: [
            "The name of the service"
          ],
          type: "string"
        }
      ]
    }
  },
  {
    name: "CreateProofRequestData",
    docs: [
      "Data required to create a new proof request"
    ],
    type: {
      kind: "struct",
      fields: [
        {
          name: "expiresIn",
          docs: [
            "Time in seconds until the request expires"
          ],
          type: "u32"
        }
      ]
    }
  },
  {
    name: "ProveData",
    type: {
      kind: "struct",
      fields: [
        {
          name: "proof",
          type: {
            defined: "Proof"
          }
        }
      ]
    }
  },
  {
    name: "VerifyData",
    type: {
      kind: "struct",
      fields: [
        {
          name: "status",
          type: {
            defined: "ProofRequestStatus"
          }
        }
      ]
    }
  },
  {
    name: "Proof",
    type: {
      kind: "struct",
      fields: [
        {
          name: "protocol",
          type: "string"
        },
        {
          name: "curve",
          type: "string"
        },
        {
          name: "piA",
          type: {
            vec: "string"
          }
        },
        {
          name: "piB",
          type: {
            vec: {
              vec: "string"
            }
          }
        },
        {
          name: "piC",
          type: {
            vec: "string"
          }
        },
        {
          name: "publicInputs",
          type: {
            vec: "string"
          }
        }
      ]
    }
  },
  {
    name: "ProofRequestStatus",
    type: {
      kind: "enum",
      variants: [
        {
          name: "Pending"
        },
        {
          name: "Proved"
        },
        {
          name: "Verified"
        },
        {
          name: "Rejected"
        }
      ]
    }
  }
], Bt = [
  {
    name: "CreateProofRequestEvent",
    fields: [
      {
        name: "serviceProvider",
        type: "publicKey",
        index: !0
      },
      {
        name: "circuit",
        type: "publicKey",
        index: !1
      },
      {
        name: "owner",
        type: "publicKey",
        index: !1
      },
      {
        name: "timestamp",
        type: "i64",
        index: !1
      }
    ]
  },
  {
    name: "DeleteProofRequestEvent",
    fields: [
      {
        name: "proofRequest",
        type: "publicKey",
        index: !0
      },
      {
        name: "owner",
        type: "publicKey",
        index: !1
      },
      {
        name: "timestamp",
        type: "i64",
        index: !1
      }
    ]
  },
  {
    name: "ProveEvent",
    fields: [
      {
        name: "proofRequest",
        type: "publicKey",
        index: !0
      },
      {
        name: "serviceProvider",
        type: "publicKey",
        index: !0
      },
      {
        name: "circuit",
        type: "publicKey",
        index: !1
      },
      {
        name: "proof",
        type: {
          defined: "Proof"
        },
        index: !1
      },
      {
        name: "owner",
        type: "publicKey",
        index: !1
      },
      {
        name: "timestamp",
        type: "i64",
        index: !1
      }
    ]
  },
  {
    name: "VerifyEvent",
    fields: [
      {
        name: "proofRequest",
        type: "publicKey",
        index: !0
      },
      {
        name: "serviceProvider",
        type: "publicKey",
        index: !0
      },
      {
        name: "circuit",
        type: "publicKey",
        index: !1
      },
      {
        name: "owner",
        type: "publicKey",
        index: !1
      },
      {
        name: "timestamp",
        type: "i64",
        index: !1
      }
    ]
  },
  {
    name: "RejectEvent",
    fields: [
      {
        name: "proofRequest",
        type: "publicKey",
        index: !0
      },
      {
        name: "serviceProvider",
        type: "publicKey",
        index: !0
      },
      {
        name: "circuit",
        type: "publicKey",
        index: !1
      },
      {
        name: "owner",
        type: "publicKey",
        index: !1
      },
      {
        name: "timestamp",
        type: "i64",
        index: !1
      }
    ]
  }
], Et = [
  {
    code: 6e3,
    name: "Unauthorized",
    msg: "Unauthorized action"
  },
  {
    code: 6001,
    name: "Unverified",
    msg: "Unverified"
  },
  {
    code: 6002,
    name: "Unproved",
    msg: "Unproved"
  },
  {
    code: 6003,
    name: "Expired",
    msg: "Expired"
  },
  {
    code: 6004,
    name: "WrongData",
    msg: "Wrong data"
  },
  {
    code: 6005,
    name: "IncorrectOwner",
    msg: "Incorrect owner"
  },
  {
    code: 6006,
    name: "InvalidMetadata",
    msg: "Invalid metadata"
  }
], vt = {
  address: "ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz",
  origin: "anchor",
  binaryVersion: "0.28.0",
  libVersion: "0.28.0"
}, It = {
  version: mt,
  name: wt,
  instructions: gt,
  accounts: xt,
  types: At,
  events: Bt,
  errors: Et,
  metadata: vt
}, St = "5tWk9EZcMpdKzxVGr4ZakZDHdWiqVJkLQ1b3v2vraDeH", bt = "ALBUS", Pt = "did:web:albus.finance", ye = [14, 72, 40, 52, 66, 51, 252, 108];
class k {
  constructor(n, s, p, d, l, h) {
    this.authority = n, this.code = s, this.name = p, this.proofRequestCount = d, this.createdAt = l, this.bump = h;
  }
  /**
   * Creates a {@link ServiceProvider} instance from the provided args.
   */
  static fromArgs(n) {
    return new k(
      n.authority,
      n.code,
      n.name,
      n.proofRequestCount,
      n.createdAt,
      n.bump
    );
  }
  /**
   * Deserializes the {@link ServiceProvider} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(n, s = 0) {
    return k.deserialize(n.data, s);
  }
  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link ServiceProvider} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(n, s, p) {
    const d = await n.getAccountInfo(
      s,
      p
    );
    if (d == null)
      throw new Error(`Unable to find ServiceProvider account at ${s}`);
    return k.fromAccountInfo(d, 0)[0];
  }
  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(n = new I.PublicKey(
    "ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz"
  )) {
    return O.GpaBuilder.fromStruct(n, H);
  }
  /**
   * Deserializes the {@link ServiceProvider} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(n, s = 0) {
    return H.deserialize(n, s);
  }
  /**
   * Serializes the {@link ServiceProvider} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize() {
    return H.serialize({
      accountDiscriminator: ye,
      ...this
    });
  }
  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link ServiceProvider} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(n) {
    const s = k.fromArgs(n);
    return H.toFixedFromValue({
      accountDiscriminator: ye,
      ...s
    }).byteSize;
  }
  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link ServiceProvider} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(n, s, p) {
    return s.getMinimumBalanceForRentExemption(
      k.byteSize(n),
      p
    );
  }
  /**
   * Returns a readable version of {@link ServiceProvider} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      authority: this.authority.toBase58(),
      code: this.code,
      name: this.name,
      proofRequestCount: (() => {
        const n = this.proofRequestCount;
        if (typeof n.toNumber == "function")
          try {
            return n.toNumber();
          } catch {
            return n;
          }
        return n;
      })(),
      createdAt: (() => {
        const n = this.createdAt;
        if (typeof n.toNumber == "function")
          try {
            return n.toNumber();
          } catch {
            return n;
          }
        return n;
      })(),
      bump: this.bump
    };
  }
}
const H = new y.FixableBeetStruct(
  [
    ["accountDiscriminator", y.uniformFixedSizeArray(y.u8, 8)],
    ["authority", O.publicKey],
    ["code", y.utf8String],
    ["name", y.utf8String],
    ["proofRequestCount", y.u64],
    ["createdAt", y.i64],
    ["bump", y.u8]
  ],
  k.fromArgs,
  "ServiceProvider"
);
var Z = /* @__PURE__ */ ((u) => (u[u.Pending = 0] = "Pending", u[u.Proved = 1] = "Proved", u[u.Verified = 2] = "Verified", u[u.Rejected = 3] = "Rejected", u))(Z || {});
const Te = y.fixedScalarEnum(
  Z
), qe = new y.FixableBeetArgsStruct(
  [
    ["protocol", y.utf8String],
    ["curve", y.utf8String],
    ["piA", y.array(y.utf8String)],
    ["piB", y.array(y.array(y.utf8String))],
    ["piC", y.array(y.utf8String)],
    ["publicInputs", y.array(y.utf8String)]
  ],
  "Proof"
), me = [78, 10, 176, 254, 231, 33, 111, 224];
class C {
  constructor(n, s, p, d, l, h, c, w, F, x) {
    this.serviceProvider = n, this.circuit = s, this.owner = p, this.createdAt = d, this.expiredAt = l, this.verifiedAt = h, this.provedAt = c, this.status = w, this.bump = F, this.proof = x;
  }
  /**
   * Creates a {@link ProofRequest} instance from the provided args.
   */
  static fromArgs(n) {
    return new C(
      n.serviceProvider,
      n.circuit,
      n.owner,
      n.createdAt,
      n.expiredAt,
      n.verifiedAt,
      n.provedAt,
      n.status,
      n.bump,
      n.proof
    );
  }
  /**
   * Deserializes the {@link ProofRequest} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(n, s = 0) {
    return C.deserialize(n.data, s);
  }
  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link ProofRequest} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(n, s, p) {
    const d = await n.getAccountInfo(
      s,
      p
    );
    if (d == null)
      throw new Error(`Unable to find ProofRequest account at ${s}`);
    return C.fromAccountInfo(d, 0)[0];
  }
  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(n = new I.PublicKey(
    "ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz"
  )) {
    return O.GpaBuilder.fromStruct(n, X);
  }
  /**
   * Deserializes the {@link ProofRequest} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(n, s = 0) {
    return X.deserialize(n, s);
  }
  /**
   * Serializes the {@link ProofRequest} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize() {
    return X.serialize({
      accountDiscriminator: me,
      ...this
    });
  }
  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link ProofRequest} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(n) {
    const s = C.fromArgs(n);
    return X.toFixedFromValue({
      accountDiscriminator: me,
      ...s
    }).byteSize;
  }
  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link ProofRequest} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(n, s, p) {
    return s.getMinimumBalanceForRentExemption(
      C.byteSize(n),
      p
    );
  }
  /**
   * Returns a readable version of {@link ProofRequest} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      serviceProvider: this.serviceProvider.toBase58(),
      circuit: this.circuit.toBase58(),
      owner: this.owner.toBase58(),
      createdAt: (() => {
        const n = this.createdAt;
        if (typeof n.toNumber == "function")
          try {
            return n.toNumber();
          } catch {
            return n;
          }
        return n;
      })(),
      expiredAt: (() => {
        const n = this.expiredAt;
        if (typeof n.toNumber == "function")
          try {
            return n.toNumber();
          } catch {
            return n;
          }
        return n;
      })(),
      verifiedAt: (() => {
        const n = this.verifiedAt;
        if (typeof n.toNumber == "function")
          try {
            return n.toNumber();
          } catch {
            return n;
          }
        return n;
      })(),
      provedAt: (() => {
        const n = this.provedAt;
        if (typeof n.toNumber == "function")
          try {
            return n.toNumber();
          } catch {
            return n;
          }
        return n;
      })(),
      status: `ProofRequestStatus.${Z[this.status]}`,
      bump: this.bump,
      proof: this.proof
    };
  }
}
const X = new y.FixableBeetStruct(
  [
    ["accountDiscriminator", y.uniformFixedSizeArray(y.u8, 8)],
    ["serviceProvider", O.publicKey],
    ["circuit", O.publicKey],
    ["owner", O.publicKey],
    ["createdAt", y.i64],
    ["expiredAt", y.i64],
    ["verifiedAt", y.i64],
    ["provedAt", y.i64],
    ["status", Te],
    ["bump", y.u8],
    ["proof", y.coption(qe)]
  ],
  C.fromArgs,
  "ProofRequest"
), dr = { ServiceProvider: k, ProofRequest: C }, N = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
class ie extends Error {
  constructor() {
    super("Unauthorized action");
    P(this, "code", 6e3);
    P(this, "name", "Unauthorized");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, ie);
  }
}
N.set(6e3, () => new ie());
_.set("Unauthorized", () => new ie());
class ne extends Error {
  constructor() {
    super("Unverified");
    P(this, "code", 6001);
    P(this, "name", "Unverified");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, ne);
  }
}
N.set(6001, () => new ne());
_.set("Unverified", () => new ne());
class oe extends Error {
  constructor() {
    super("Unproved");
    P(this, "code", 6002);
    P(this, "name", "Unproved");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, oe);
  }
}
N.set(6002, () => new oe());
_.set("Unproved", () => new oe());
class se extends Error {
  constructor() {
    super("Expired");
    P(this, "code", 6003);
    P(this, "name", "Expired");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, se);
  }
}
N.set(6003, () => new se());
_.set("Expired", () => new se());
class ce extends Error {
  constructor() {
    super("Wrong data");
    P(this, "code", 6004);
    P(this, "name", "WrongData");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, ce);
  }
}
N.set(6004, () => new ce());
_.set("WrongData", () => new ce());
class ae extends Error {
  constructor() {
    super("Incorrect owner");
    P(this, "code", 6005);
    P(this, "name", "IncorrectOwner");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, ae);
  }
}
N.set(6005, () => new ae());
_.set("IncorrectOwner", () => new ae());
class ue extends Error {
  constructor() {
    super("Invalid metadata");
    P(this, "code", 6006);
    P(this, "name", "InvalidMetadata");
    typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, ue);
  }
}
N.set(6006, () => new ue());
_.set(
  "InvalidMetadata",
  () => new ue()
);
function W(u) {
  const n = N.get(u);
  return n != null ? n() : null;
}
function hr(u) {
  const n = _.get(u);
  return n != null ? n() : null;
}
const Ft = new y.FixableBeetArgsStruct(
  [
    ["code", y.utf8String],
    ["name", y.utf8String]
  ],
  "AddServiceProviderData"
), Rt = new y.FixableBeetArgsStruct(
  [
    ["instructionDiscriminator", y.uniformFixedSizeArray(y.u8, 8)],
    ["data", Ft]
  ],
  "AddServiceProviderInstructionArgs"
), Dt = [
  122,
  238,
  46,
  138,
  102,
  109,
  197,
  177
];
function Ut(u, n, s = new I.PublicKey("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz")) {
  const [p] = Rt.serialize({
    instructionDiscriminator: Dt,
    ...n
  }), d = [
    {
      pubkey: u.serviceProvider,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.authority,
      isWritable: !0,
      isSigner: !0
    },
    {
      pubkey: u.systemProgram ?? I.SystemProgram.programId,
      isWritable: !1,
      isSigner: !1
    }
  ];
  if (u.anchorRemainingAccounts != null)
    for (const h of u.anchorRemainingAccounts)
      d.push(h);
  return new I.TransactionInstruction({
    programId: s,
    keys: d,
    data: p
  });
}
const kt = new y.BeetArgsStruct(
  [["expiresIn", y.u32]],
  "CreateProofRequestData"
), Ct = new y.BeetArgsStruct(
  [
    ["instructionDiscriminator", y.uniformFixedSizeArray(y.u8, 8)],
    ["data", kt]
  ],
  "CreateProofRequestInstructionArgs"
), Tt = [
  18,
  176,
  14,
  175,
  218,
  24,
  32,
  130
];
function qt(u, n, s = new I.PublicKey("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz")) {
  const [p] = Ct.serialize({
    instructionDiscriminator: Tt,
    ...n
  }), d = [
    {
      pubkey: u.serviceProvider,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.proofRequest,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.circuitMint,
      isWritable: !1,
      isSigner: !1
    },
    {
      pubkey: u.circuitMetadata,
      isWritable: !1,
      isSigner: !1
    },
    {
      pubkey: u.authority,
      isWritable: !0,
      isSigner: !0
    },
    {
      pubkey: u.systemProgram ?? I.SystemProgram.programId,
      isWritable: !1,
      isSigner: !1
    }
  ];
  if (u.anchorRemainingAccounts != null)
    for (const h of u.anchorRemainingAccounts)
      d.push(h);
  return new I.TransactionInstruction({
    programId: s,
    keys: d,
    data: p
  });
}
const Mt = new y.BeetArgsStruct(
  [["instructionDiscriminator", y.uniformFixedSizeArray(y.u8, 8)]],
  "DeleteProofRequestInstructionArgs"
), Lt = [
  34,
  9,
  125,
  78,
  113,
  197,
  126,
  34
];
function Nt(u, n = new I.PublicKey("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz")) {
  const [s] = Mt.serialize({
    instructionDiscriminator: Lt
  }), p = [
    {
      pubkey: u.proofRequest,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.authority,
      isWritable: !0,
      isSigner: !0
    },
    {
      pubkey: u.systemProgram ?? I.SystemProgram.programId,
      isWritable: !1,
      isSigner: !1
    }
  ];
  if (u.anchorRemainingAccounts != null)
    for (const l of u.anchorRemainingAccounts)
      p.push(l);
  return new I.TransactionInstruction({
    programId: n,
    keys: p,
    data: s
  });
}
const _t = new y.BeetArgsStruct(
  [["instructionDiscriminator", y.uniformFixedSizeArray(y.u8, 8)]],
  "DeleteServiceProviderInstructionArgs"
), zt = [
  186,
  177,
  156,
  65,
  168,
  2,
  56,
  128
];
function Kt(u, n = new I.PublicKey("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz")) {
  const [s] = _t.serialize({
    instructionDiscriminator: zt
  }), p = [
    {
      pubkey: u.serviceProvider,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.authority,
      isWritable: !0,
      isSigner: !0
    },
    {
      pubkey: u.systemProgram ?? I.SystemProgram.programId,
      isWritable: !1,
      isSigner: !1
    }
  ];
  if (u.anchorRemainingAccounts != null)
    for (const l of u.anchorRemainingAccounts)
      p.push(l);
  return new I.TransactionInstruction({
    programId: n,
    keys: p,
    data: s
  });
}
const Wt = new y.FixableBeetArgsStruct(
  [["proof", qe]],
  "ProveData"
), $t = new y.FixableBeetArgsStruct(
  [
    ["instructionDiscriminator", y.uniformFixedSizeArray(y.u8, 8)],
    ["data", Wt]
  ],
  "ProveInstructionArgs"
), Qt = [
  52,
  246,
  26,
  161,
  211,
  170,
  86,
  215
];
function jt(u, n, s = new I.PublicKey("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz")) {
  const [p] = $t.serialize({
    instructionDiscriminator: Qt,
    ...n
  }), d = [
    {
      pubkey: u.proofRequest,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.authority,
      isWritable: !0,
      isSigner: !0
    },
    {
      pubkey: u.systemProgram ?? I.SystemProgram.programId,
      isWritable: !1,
      isSigner: !1
    }
  ];
  if (u.anchorRemainingAccounts != null)
    for (const h of u.anchorRemainingAccounts)
      d.push(h);
  return new I.TransactionInstruction({
    programId: s,
    keys: d,
    data: p
  });
}
const Ot = new y.BeetArgsStruct(
  [["status", Te]],
  "VerifyData"
), Vt = new y.BeetArgsStruct(
  [
    ["instructionDiscriminator", y.uniformFixedSizeArray(y.u8, 8)],
    ["data", Ot]
  ],
  "VerifyInstructionArgs"
), Gt = [
  133,
  161,
  141,
  48,
  120,
  198,
  88,
  150
];
function ke(u, n, s = new I.PublicKey("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz")) {
  const [p] = Vt.serialize({
    instructionDiscriminator: Gt,
    ...n
  }), d = [
    {
      pubkey: u.proofRequest,
      isWritable: !0,
      isSigner: !1
    },
    {
      pubkey: u.authority,
      isWritable: !0,
      isSigner: !0
    },
    {
      pubkey: u.systemProgram ?? I.SystemProgram.programId,
      isWritable: !1,
      isSigner: !1
    }
  ];
  if (u.anchorRemainingAccounts != null)
    for (const h of u.anchorRemainingAccounts)
      d.push(h);
  return new I.TransactionInstruction({
    programId: s,
    keys: d,
    data: p
  });
}
const Jt = "ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz", Zt = new v(Jt);
var te = /* @__PURE__ */ ((u) => (u.Circuit = "C", u.Proof = "P", u.Identity = "ID", u.VerifiableCredential = "VC", u.VerifiablePresentation = "VP", u))(te || {});
function Yt(u, n = {}) {
  if (u.updateAuthority.toString() !== St)
    throw new Error("Unauthorized NFT.");
  if (n.code) {
    const s = `${bt}-${n.code}`;
    if (u.data.symbol !== s)
      throw new Error(`Invalid NFT Symbol. Expected: ${s}`);
  }
  if (n.creators && !n.creators.every((s) => (u.data.creators ?? []).includes(s)))
    throw new Error("Invalid NFT creator");
}
const Ht = "currentDate";
function Xt({ claims: u, requiredFields: n, definitions: s }) {
  const p = {};
  for (const d of n) {
    if (d === Ht) {
      const l = /* @__PURE__ */ new Date();
      p[d] = [l.getUTCFullYear(), l.getUTCMonth() + 1, l.getUTCDate()];
      continue;
    }
    if (s && s[d]) {
      p[d] = s[d];
      continue;
    }
    p[d] = er(d, u[d]);
  }
  return p;
}
function er(u, n) {
  if (u.endsWith("Date")) {
    const s = String(n).split("-", 3);
    if (s.length < 3)
      throw new Error(`The \`${u}\` attribute is not a valid date`);
    return s;
  }
  return n;
}
const { generateProof: tr, verifyProof: rr } = we.zkp, { verifyCredential: ir } = we.vc, { getMetadataByMint: nr, getMetadataPDA: or } = we.utils;
class lr {
  constructor(n) {
    P(this, "programId", Zt);
    this.provider = n;
  }
  static factory(n, s, p = {}) {
    return s = s ?? { publicKey: v.default }, new this(new ot(n, s, p));
  }
  get connection() {
    return this.provider.connection;
  }
  get manager() {
    return new cr(this);
  }
  get eventManager() {
    return new sr(this);
  }
  /**
   * Verify that the selected user, specified by {@link props.user},
   * is compliant with respect to the {@link props.circuit}
   * and the service provider.
   * If the {@link props.full} property is set to true,
   * the full verification process will be performed.
   *
   * @param {CheckCompliance} props
   */
  async verifyCompliance(n) {
    const s = n.user ?? this.provider.publicKey, [p] = this.getServiceProviderPDA(n.serviceCode), [d] = this.getProofRequestPDA(p, n.circuit, s), l = await this.loadProofRequest(d);
    return await this.validateProofRequest(l), n.full ? this.verifyProofRequest(l) : !0;
  }
  /**
   * Verify proof request for the specified service code and circuit.
   * If {@link user} is undefined, provider.pubkey will be used.
   *
   * @param {string} serviceCode
   * @param {PublicKeyInitData} circuit
   * @param {PublicKeyInitData|undefined} user
   * @returns {Promise<boolean>}
   */
  async verifySpecific(n, s, p) {
    const [d] = this.getServiceProviderPDA(n), [l] = this.getProofRequestPDA(d, s, p ?? this.provider.publicKey);
    return this.verifyProofRequest(l);
  }
  /**
   * Verify proof request by specified address
   *
   * @param {PublicKeyInitData} addr
   * @returns {Promise<boolean>}
   */
  async verifyProofRequest(n) {
    const s = await this.loadProofRequest(n);
    return this.verifyProofRequestInternal(s);
  }
  /**
   * Verify proof request
   *
   * @param {ProofRequest} proofRequest
   * @returns {Promise<boolean>}
   */
  async verifyProofRequestInternal(n) {
    if (!n.proof)
      throw new Error("Proof request is not proved yet");
    const s = await this.loadCircuit(n.circuit), { protocol: p, curve: d, piA: l, piB: h, piC: c } = n.proof;
    return rr({
      vk: s.vk,
      publicInput: n.proof.publicInputs,
      proof: { pi_a: l, pi_b: h, pi_c: c, protocol: p, curve: d }
    });
  }
  /**
   * Validates a Zero Knowledge Proof (ZKP) request.
   *
   * @param {ProofRequest} req The proof request object to validate.
   * @throws An error with a message indicating why the request is invalid.
   */
  async validateProofRequest(n) {
    const s = await this.connection.getSlot(), p = await this.connection.getBlockTime(s);
    if (!p)
      throw new Error("Failed to get solana block time");
    if (Number(n.expiredAt) > 0 && Number(n.expiredAt) < p)
      throw new Error("Proof request is expired");
    if (!n.proof)
      throw new Error("Proof request is not proved yet");
    if (Number(n.verifiedAt) <= 0)
      throw new Error("Proof request is not verified");
  }
  /**
   * Load and validate Circuit NFT
   */
  async loadCircuit(n) {
    var p, d, l, h;
    const s = await this.loadNft(n, { code: te.Circuit });
    if (!((p = s.json) != null && p.code))
      throw new Error("Invalid circuit! Metadata does not contain `code`.");
    if (!((d = s.json) != null && d.zkey_url))
      throw new Error("Invalid circuit! Metadata does not contain `zkey_url`.");
    if (!((l = s.json) != null && l.wasm_url))
      throw new Error("Invalid circuit! Metadata does not contain `wasm_url`.");
    if (!((h = s.json) != null && h.vk))
      throw new Error("Invalid circuit! Metadata does not contain verification key.");
    return {
      address: new v(n),
      code: String(s.json.code),
      input: s.json.input ?? [],
      wasmUrl: String(s.json.wasm_url),
      zkeyUrl: String(s.json.zkey_url),
      vk: s.json.vk
      //  as VK,
    };
  }
  /**
   * Load and validate Verifiable Credential
   */
  async loadCredential(n, s = {}) {
    var l;
    const p = await this.loadNft(n, { code: te.VerifiableCredential });
    if (!((l = p.json) != null && l.vc))
      throw new Error("Invalid credential! Metadata does not contain `vc` attribute.");
    const d = await ir(p.json.vc, {
      audience: Pt,
      decryptionKey: s.decryptionKey
    });
    return {
      address: new v(n),
      credentialSubject: d.verifiableCredential.credentialSubject,
      credentialRoot: p.json.credentialRoot,
      verified: d.verified
    };
  }
  /**
   * Load and validate Verifiable Presentation
   */
  async loadPresentation(n, s = {}) {
    var d;
    if (!((d = (await this.loadNft(n, { code: te.VerifiablePresentation })).json) != null && d.vp))
      throw new Error("Invalid presentation! Metadata does not contain `vp` attribute.");
    return {
      address: new v(n)
    };
  }
  /**
   * Prove the request
   */
  async prove(n) {
    const s = await this.loadProofRequest(n.proofRequest);
    if (s.proof && !n.force)
      throw new Error("Proof request already proved");
    const p = await this.loadCircuit(s.circuit), d = await this.loadCredential(n.vc, { decryptionKey: n.decryptionKey }), l = Xt({
      requiredFields: p.input,
      claims: d.credentialSubject,
      // TODO: get from service provider rules
      definitions: { minAge: 18, maxAge: 100 }
    });
    try {
      const { proof: h, publicSignals: c } = await tr({
        wasmFile: p.wasmUrl,
        zkeyFile: p.zkeyUrl,
        input: l
      }), { signature: w } = await this.proveOnChain({
        proofRequest: n.proofRequest,
        proof: {
          protocol: h.protocol,
          curve: h.curve,
          piA: h.pi_a.map(String),
          piB: h.pi_b.map((F) => F.map(String)),
          piC: h.pi_c.map(String),
          publicInputs: c.map(String)
        }
      });
      return { signature: w, proof: h, publicSignals: c };
    } catch (h) {
      throw new Error(`Circuit constraint violation (${h.message})`);
    }
  }
  /**
   * Save proof for provided proof request
   */
  async proveOnChain(n, s) {
    const p = this.provider.publicKey, d = jt(
      {
        proofRequest: new v(n.proofRequest),
        authority: p
      },
      {
        data: {
          proof: n.proof
        }
      }
    );
    try {
      const l = new K().add(d);
      return { signature: await this.provider.sendAndConfirm(l, [], s) };
    } catch (l) {
      throw W(l.code) ?? l;
    }
  }
  /**
   * Create new {@link ProofRequest}
   */
  async createProofRequest(n, s) {
    const p = this.provider.publicKey, [d] = this.getServiceProviderPDA(n.serviceCode), [l] = this.getProofRequestPDA(d, n.circuit, p), h = new v(n.circuit), c = or(h);
    if (await this.connection.getAccountInfo(l) != null)
      throw new Error(`Proof request for service:${n.serviceCode} and circuit:${h} already exists...`);
    const F = qt(
      {
        serviceProvider: d,
        proofRequest: l,
        circuitMint: h,
        circuitMetadata: c,
        authority: p
      },
      {
        data: {
          expiresIn: n.expiresIn ?? 0
        }
      }
    );
    try {
      const x = new K().add(F), S = await this.provider.sendAndConfirm(x, [], s);
      return { address: l, signature: S };
    } catch (x) {
      throw W(x.code) ?? x;
    }
  }
  /**
   * Delete {@link ProofRequest}
   */
  async deleteProofRequest(n, s) {
    const p = this.provider.publicKey, d = Nt({
      proofRequest: new v(n.proofRequest),
      authority: p
    });
    try {
      const l = new K().add(d);
      return { signature: await this.provider.sendAndConfirm(l, [], s) };
    } catch (l) {
      throw W(l.code) ?? l;
    }
  }
  /**
   * Find available service providers
   */
  async findServiceProviders(n = {}) {
    const s = k.gpaBuilder().addFilter("accountDiscriminator", ye);
    return n.authority && s.addFilter("authority", new v(n.authority)), (await s.run(this.provider.connection)).map((p) => ({
      pubkey: p.pubkey,
      data: k.fromAccountInfo(p.account)[0]
    }));
  }
  /**
   * Load service provider by {@link addr}
   */
  async loadServiceProvider(n, s) {
    return k.fromAccountAddress(this.provider.connection, new v(n), s);
  }
  /**
   * Find available proof requests
   */
  async findProofRequests(n = {}) {
    const s = C.gpaBuilder().addFilter("accountDiscriminator", me).addFilter("owner", new v(n.user ?? this.provider.publicKey));
    return n.serviceProvider && s.addFilter("serviceProvider", new v(n.serviceProvider)), n.circuit && s.addFilter("circuit", new v(n.circuit)), n.status && s.addFilter("status", n.status), (await s.run(this.provider.connection)).map((p) => ({
      pubkey: p.pubkey,
      data: C.fromAccountInfo(p.account)[0]
    }));
  }
  /**
   * Load proof request by {@link addr}
   */
  async loadProofRequest(n, s) {
    return C.fromAccountAddress(this.provider.connection, new v(n), s);
  }
  /**
   * Get channel device PDA
   */
  getProofRequestPDA(n, s, p) {
    return v.findProgramAddressSync([
      ee.Buffer.from("proof-request"),
      new v(n).toBuffer(),
      new v(s).toBuffer(),
      new v(p).toBuffer()
    ], this.programId);
  }
  /**
   * Get service provider PDA
   */
  getServiceProviderPDA(n) {
    return v.findProgramAddressSync([
      ee.Buffer.from("service-provider"),
      ee.Buffer.from(n)
    ], this.programId);
  }
  /**
   * Load and validate NFT Metadata
   * @private
   */
  async loadNft(n, s) {
    const p = await nr(this.connection, n, !0);
    if (!p)
      throw new Error(`Unable to find Metadata account at ${n}`);
    return Yt(p, s), p;
  }
}
class sr {
  constructor(n) {
    P(this, "_coder");
    P(this, "_events");
    this.client = n, this._coder = new st(It), this._events = new ct(n.programId, n.provider, this._coder);
  }
  /**
   * Invokes the given callback every time the given event is emitted.
   *
   * @param eventName The PascalCase name of the event, provided by the IDL.
   * @param callback  The function to invoke whenever the event is emitted from
   *                  program logs.
   */
  addEventListener(n, s) {
    return this._events.addEventListener(n, (p, d, l) => {
      l !== "1111111111111111111111111111111111111111111111111111111111111111" && s(p, d, l);
    });
  }
  /**
   * Unsubscribes from the given listener.
   */
  async removeEventListener(n) {
    return await this._events.removeEventListener(n);
  }
}
class cr {
  constructor(n) {
    this.client = n;
  }
  get provider() {
    return this.client.provider;
  }
  /**
   * Verify the {@link ProofRequest}
   * Required admin authority
   */
  async verifyProofRequest(n, s) {
    const p = ke(
      {
        proofRequest: new v(n.proofRequest),
        authority: this.provider.publicKey
      },
      {
        data: {
          status: Z.Verified
        }
      }
    );
    try {
      const d = new K().add(p);
      return { signature: await this.provider.sendAndConfirm(d, [], s) };
    } catch (d) {
      throw W(d.code) ?? d;
    }
  }
  /**
   * Reject existing {@link ProofRequest}
   * Required admin authority
   */
  async rejectProofRequest(n, s) {
    const p = ke(
      {
        proofRequest: new v(n.proofRequest),
        authority: this.provider.publicKey
      },
      {
        data: {
          status: Z.Rejected
        }
      }
    );
    try {
      const d = new K().add(p);
      return { signature: await this.provider.sendAndConfirm(d, [], s) };
    } catch (d) {
      throw W(d.code) ?? d;
    }
  }
  /**
   * Add new {@link ServiceProvider}
   * Required admin authority
   */
  async addServiceProvider(n, s) {
    const p = this.provider.publicKey, [d] = this.client.getServiceProviderPDA(n.code), l = Ut({
      serviceProvider: d,
      authority: p
    }, {
      data: {
        code: n.code,
        name: n.name
      }
    });
    try {
      const h = new K().add(l), c = await this.provider.sendAndConfirm(h, [], s);
      return { address: d, signature: c };
    } catch (h) {
      throw W(h.code) ?? h;
    }
  }
  /**
   * Delete a {@link ServiceProvider}
   * Required admin authority
   */
  async deleteServiceProvider(n, s) {
    const p = this.provider.publicKey, [d] = this.client.getServiceProviderPDA(n.code), l = Kt({
      serviceProvider: d,
      authority: p
    });
    try {
      const h = new K().add(l);
      return { signature: await this.provider.sendAndConfirm(h, [], s) };
    } catch (h) {
      throw W(h.code) ?? h;
    }
  }
}
export {
  lr as AlbusClient,
  se as ExpiredError,
  ae as IncorrectOwnerError,
  ue as InvalidMetadataError,
  Jt as PROGRAM_ADDRESS,
  Zt as PROGRAM_ID,
  C as ProofRequest,
  Z as ProofRequestStatus,
  k as ServiceProvider,
  ie as UnauthorizedError,
  oe as UnprovedError,
  ne as UnverifiedError,
  ce as WrongDataError,
  dr as accountProviders,
  Ft as addServiceProviderDataBeet,
  Dt as addServiceProviderInstructionDiscriminator,
  Rt as addServiceProviderStruct,
  Ut as createAddServiceProviderInstruction,
  qt as createCreateProofRequestInstruction,
  Nt as createDeleteProofRequestInstruction,
  Kt as createDeleteServiceProviderInstruction,
  kt as createProofRequestDataBeet,
  Tt as createProofRequestInstructionDiscriminator,
  Ct as createProofRequestStruct,
  jt as createProveInstruction,
  ke as createVerifyInstruction,
  Lt as deleteProofRequestInstructionDiscriminator,
  Mt as deleteProofRequestStruct,
  zt as deleteServiceProviderInstructionDiscriminator,
  _t as deleteServiceProviderStruct,
  W as errorFromCode,
  hr as errorFromName,
  qe as proofBeet,
  X as proofRequestBeet,
  me as proofRequestDiscriminator,
  Te as proofRequestStatusBeet,
  Wt as proveDataBeet,
  Qt as proveInstructionDiscriminator,
  $t as proveStruct,
  H as serviceProviderBeet,
  ye as serviceProviderDiscriminator,
  Ot as verifyDataBeet,
  Gt as verifyInstructionDiscriminator,
  Vt as verifyStruct
};
//# sourceMappingURL=index.es.js.map
