import { hash as dt } from "@stablelib/sha256";
import * as A from "uint8arrays";
import { randomBytes as wt } from "@stablelib/random";
import { generateKeyPair as gt, sharedKey as Ur, scalarMultBase as mt } from "@stablelib/x25519";
import { convertPublicKeyToX25519 as xt, convertSecretKeyToX25519 as br } from "@stablelib/ed25519";
import { NONCE_LENGTH as Bt, TAG_LENGTH as Et, XChaCha20Poly1305 as Tr } from "@stablelib/xchacha20poly1305";
import { Keypair as j, PublicKey as Er } from "@solana/web3.js";
import { randomBytes as It } from "crypto-browserify";
import { buildEddsa as Ft, buildPoseidonOpt as Sr, newMemEmptyTrie as At } from "circomlibjs";
import _r from "axios";
import { groth16 as Cr } from "snarkjs";
import { EdDSASigner as Rr } from "did-jwt";
import { createVerifiableCredentialJwt as Ut, createVerifiablePresentationJwt as bt, verifyCredential as Tt } from "did-jwt-vc";
import { Resolver as St } from "did-resolver";
import * as _t from "key-did-resolver";
import * as Ct from "web-did-resolver";
import { PROGRAM_ID as Ir, Metadata as Rt } from "@metaplex-foundation/mpl-token-metadata";
function er(o, c) {
  if (o.length > c)
    throw new Error("BigInt byte size is larger than length");
  return new Uint8Array(new Array(c - o.length).concat(...o));
}
function Pt(o) {
  let c = 0n;
  return o.forEach((s) => {
    c = c << 8n, c += BigInt(s);
  }), c;
}
function Pr(o, c) {
  let s = BigInt(o).toString(16);
  s.length % 2 && (s = `0${s}`);
  const h = s.match(/.{2}/g) ?? [], l = new Uint8Array(h.map((p) => Number.parseInt(p, 16)));
  return er(l, c);
}
function Mr(o, c) {
  let s = "";
  return o.forEach((h) => {
    let l = h.toString(16);
    l = l.length === 1 ? `0${l}` : l, s += l;
  }), c ? `0x${s}` : s;
}
function Mt(o) {
  const c = o.startsWith("0x") ? o.slice(2) : o, s = new Uint8Array(c.length / 2);
  return s.map(
    (h, l) => s[l] = Number.parseInt(c.substring(l * 2, l * 2 + 2), 16)
  ), s;
}
function Nt(o, c) {
  const s = [];
  for (let h = 0; h < o.length; h += c)
    s.push(o.slice(h, h + c));
  return s;
}
function Lt(o) {
  return o.reduce((c, s) => new Uint8Array([...c, ...s]));
}
function $t(o, c, s) {
  const h = c - o.length;
  return s === "left" ? new Uint8Array([...new Uint8Array(h), ...o]) : new Uint8Array([...o, ...new Uint8Array(h)]);
}
function Kt(o) {
  return new TextDecoder().decode(o);
}
function Ot(o) {
  return new TextEncoder().encode(o);
}
function rr(o, c = new Uint8Array(4)) {
  const s = A.fromString(o.toString(), "base10");
  return c.set(s, 4 - s.length), c;
}
function Q(o) {
  return A.concat([rr(o.length), o]);
}
function nr(o, c, s) {
  if (c !== 256)
    throw new Error(`Unsupported key length: ${c}`);
  const h = A.concat([
    Q(A.fromString(s)),
    Q(new Uint8Array(0)),
    // apu
    Q(new Uint8Array(0)),
    // apv
    rr(c)
  ]), l = 1;
  return dt(A.concat([rr(l), o, h]));
}
function Nr(o) {
  return A.fromString(o, "base64pad");
}
function Lr(o) {
  return A.toString(o, "base64pad");
}
function Dt(o) {
  return A.toString(o, "base64url");
}
function ir(o) {
  return A.fromString(o);
}
function $r(o) {
  return A.toString(o);
}
function Kr(o) {
  return A.fromString(o, "base58btc");
}
function kt(o) {
  return A.toString(o, "base58btc");
}
const jt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayToBigInt: Pt,
  arrayToByteLength: er,
  arrayToHexString: Mr,
  base58ToBytes: Kr,
  base64ToBytes: Nr,
  bigIntToArray: Pr,
  bytesToBase58: kt,
  bytesToBase64: Lr,
  bytesToBase64url: Dt,
  bytesToString: $r,
  chunk: Nt,
  combine: Lt,
  concatKDF: nr,
  fromUTF8String: Ot,
  hexStringToArray: Mt,
  padToLength: $t,
  stringToBytes: ir,
  toUTF8String: Kt
}, Symbol.toStringTag, { value: "Module" }));
var G = {}, W = {};
W.byteLength = Xt;
W.toByteArray = Vt;
W.fromByteArray = Jt;
var C = [], S = [], Gt = typeof Uint8Array < "u" ? Uint8Array : Array, v = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var $ = 0, zt = v.length; $ < zt; ++$)
  C[$] = v[$], S[v.charCodeAt($)] = $;
S["-".charCodeAt(0)] = 62;
S["_".charCodeAt(0)] = 63;
function Or(o) {
  var c = o.length;
  if (c % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var s = o.indexOf("=");
  s === -1 && (s = c);
  var h = s === c ? 0 : 4 - s % 4;
  return [s, h];
}
function Xt(o) {
  var c = Or(o), s = c[0], h = c[1];
  return (s + h) * 3 / 4 - h;
}
function Ht(o, c, s) {
  return (c + s) * 3 / 4 - s;
}
function Vt(o) {
  var c, s = Or(o), h = s[0], l = s[1], p = new Gt(Ht(o, h, l)), y = 0, u = l > 0 ? h - 4 : h, w;
  for (w = 0; w < u; w += 4)
    c = S[o.charCodeAt(w)] << 18 | S[o.charCodeAt(w + 1)] << 12 | S[o.charCodeAt(w + 2)] << 6 | S[o.charCodeAt(w + 3)], p[y++] = c >> 16 & 255, p[y++] = c >> 8 & 255, p[y++] = c & 255;
  return l === 2 && (c = S[o.charCodeAt(w)] << 2 | S[o.charCodeAt(w + 1)] >> 4, p[y++] = c & 255), l === 1 && (c = S[o.charCodeAt(w)] << 10 | S[o.charCodeAt(w + 1)] << 4 | S[o.charCodeAt(w + 2)] >> 2, p[y++] = c >> 8 & 255, p[y++] = c & 255), p;
}
function Wt(o) {
  return C[o >> 18 & 63] + C[o >> 12 & 63] + C[o >> 6 & 63] + C[o & 63];
}
function Yt(o, c, s) {
  for (var h, l = [], p = c; p < s; p += 3)
    h = (o[p] << 16 & 16711680) + (o[p + 1] << 8 & 65280) + (o[p + 2] & 255), l.push(Wt(h));
  return l.join("");
}
function Jt(o) {
  for (var c, s = o.length, h = s % 3, l = [], p = 16383, y = 0, u = s - h; y < u; y += p)
    l.push(Yt(o, y, y + p > u ? u : y + p));
  return h === 1 ? (c = o[s - 1], l.push(
    C[c >> 2] + C[c << 4 & 63] + "=="
  )) : h === 2 && (c = (o[s - 2] << 8) + o[s - 1], l.push(
    C[c >> 10] + C[c >> 4 & 63] + C[c << 2 & 63] + "="
  )), l.join("");
}
var or = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
or.read = function(o, c, s, h, l) {
  var p, y, u = l * 8 - h - 1, w = (1 << u) - 1, T = w >> 1, I = -7, E = s ? l - 1 : 0, R = s ? -1 : 1, U = o[c + E];
  for (E += R, p = U & (1 << -I) - 1, U >>= -I, I += u; I > 0; p = p * 256 + o[c + E], E += R, I -= 8)
    ;
  for (y = p & (1 << -I) - 1, p >>= -I, I += h; I > 0; y = y * 256 + o[c + E], E += R, I -= 8)
    ;
  if (p === 0)
    p = 1 - T;
  else {
    if (p === w)
      return y ? NaN : (U ? -1 : 1) * (1 / 0);
    y = y + Math.pow(2, h), p = p - T;
  }
  return (U ? -1 : 1) * y * Math.pow(2, p - h);
};
or.write = function(o, c, s, h, l, p) {
  var y, u, w, T = p * 8 - l - 1, I = (1 << T) - 1, E = I >> 1, R = l === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, U = h ? 0 : p - 1, O = h ? 1 : -1, D = c < 0 || c === 0 && 1 / c < 0 ? 1 : 0;
  for (c = Math.abs(c), isNaN(c) || c === 1 / 0 ? (u = isNaN(c) ? 1 : 0, y = I) : (y = Math.floor(Math.log(c) / Math.LN2), c * (w = Math.pow(2, -y)) < 1 && (y--, w *= 2), y + E >= 1 ? c += R / w : c += R * Math.pow(2, 1 - E), c * w >= 2 && (y++, w /= 2), y + E >= I ? (u = 0, y = I) : y + E >= 1 ? (u = (c * w - 1) * Math.pow(2, l), y = y + E) : (u = c * Math.pow(2, E - 1) * Math.pow(2, l), y = 0)); l >= 8; o[s + U] = u & 255, U += O, u /= 256, l -= 8)
    ;
  for (y = y << l | u, T += l; T > 0; o[s + U] = y & 255, U += O, y /= 256, T -= 8)
    ;
  o[s + U - O] |= D * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(o) {
  const c = W, s = or, h = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  o.Buffer = u, o.SlowBuffer = Jr, o.INSPECT_MAX_BYTES = 50;
  const l = 2147483647;
  o.kMaxLength = l, u.TYPED_ARRAY_SUPPORT = p(), !u.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function p() {
    try {
      const e = new Uint8Array(1), r = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(r, Uint8Array.prototype), Object.setPrototypeOf(e, r), e.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(u.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (u.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(u.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (u.isBuffer(this))
        return this.byteOffset;
    }
  });
  function y(e) {
    if (e > l)
      throw new RangeError('The value "' + e + '" is invalid for option "size"');
    const r = new Uint8Array(e);
    return Object.setPrototypeOf(r, u.prototype), r;
  }
  function u(e, r, t) {
    if (typeof e == "number") {
      if (typeof r == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return E(e);
    }
    return w(e, r, t);
  }
  u.poolSize = 8192;
  function w(e, r, t) {
    if (typeof e == "string")
      return R(e, r);
    if (ArrayBuffer.isView(e))
      return O(e);
    if (e == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e
      );
    if (_(e, ArrayBuffer) || e && _(e.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (_(e, SharedArrayBuffer) || e && _(e.buffer, SharedArrayBuffer)))
      return D(e, r, t);
    if (typeof e == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    const n = e.valueOf && e.valueOf();
    if (n != null && n !== e)
      return u.from(n, r, t);
    const i = Yr(e);
    if (i)
      return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof e[Symbol.toPrimitive] == "function")
      return u.from(e[Symbol.toPrimitive]("string"), r, t);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e
    );
  }
  u.from = function(e, r, t) {
    return w(e, r, t);
  }, Object.setPrototypeOf(u.prototype, Uint8Array.prototype), Object.setPrototypeOf(u, Uint8Array);
  function T(e) {
    if (typeof e != "number")
      throw new TypeError('"size" argument must be of type number');
    if (e < 0)
      throw new RangeError('The value "' + e + '" is invalid for option "size"');
  }
  function I(e, r, t) {
    return T(e), e <= 0 ? y(e) : r !== void 0 ? typeof t == "string" ? y(e).fill(r, t) : y(e).fill(r) : y(e);
  }
  u.alloc = function(e, r, t) {
    return I(e, r, t);
  };
  function E(e) {
    return T(e), y(e < 0 ? 0 : Y(e) | 0);
  }
  u.allocUnsafe = function(e) {
    return E(e);
  }, u.allocUnsafeSlow = function(e) {
    return E(e);
  };
  function R(e, r) {
    if ((typeof r != "string" || r === "") && (r = "utf8"), !u.isEncoding(r))
      throw new TypeError("Unknown encoding: " + r);
    const t = fr(e, r) | 0;
    let n = y(t);
    const i = n.write(e, r);
    return i !== t && (n = n.slice(0, i)), n;
  }
  function U(e) {
    const r = e.length < 0 ? 0 : Y(e.length) | 0, t = y(r);
    for (let n = 0; n < r; n += 1)
      t[n] = e[n] & 255;
    return t;
  }
  function O(e) {
    if (_(e, Uint8Array)) {
      const r = new Uint8Array(e);
      return D(r.buffer, r.byteOffset, r.byteLength);
    }
    return U(e);
  }
  function D(e, r, t) {
    if (r < 0 || e.byteLength < r)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (e.byteLength < r + (t || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return r === void 0 && t === void 0 ? n = new Uint8Array(e) : t === void 0 ? n = new Uint8Array(e, r) : n = new Uint8Array(e, r, t), Object.setPrototypeOf(n, u.prototype), n;
  }
  function Yr(e) {
    if (u.isBuffer(e)) {
      const r = Y(e.length) | 0, t = y(r);
      return t.length === 0 || e.copy(t, 0, 0, r), t;
    }
    if (e.length !== void 0)
      return typeof e.length != "number" || Z(e.length) ? y(0) : U(e);
    if (e.type === "Buffer" && Array.isArray(e.data))
      return U(e.data);
  }
  function Y(e) {
    if (e >= l)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + l.toString(16) + " bytes");
    return e | 0;
  }
  function Jr(e) {
    return +e != e && (e = 0), u.alloc(+e);
  }
  u.isBuffer = function(r) {
    return r != null && r._isBuffer === !0 && r !== u.prototype;
  }, u.compare = function(r, t) {
    if (_(r, Uint8Array) && (r = u.from(r, r.offset, r.byteLength)), _(t, Uint8Array) && (t = u.from(t, t.offset, t.byteLength)), !u.isBuffer(r) || !u.isBuffer(t))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (r === t)
      return 0;
    let n = r.length, i = t.length;
    for (let f = 0, a = Math.min(n, i); f < a; ++f)
      if (r[f] !== t[f]) {
        n = r[f], i = t[f];
        break;
      }
    return n < i ? -1 : i < n ? 1 : 0;
  }, u.isEncoding = function(r) {
    switch (String(r).toLowerCase()) {
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
  }, u.concat = function(r, t) {
    if (!Array.isArray(r))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (r.length === 0)
      return u.alloc(0);
    let n;
    if (t === void 0)
      for (t = 0, n = 0; n < r.length; ++n)
        t += r[n].length;
    const i = u.allocUnsafe(t);
    let f = 0;
    for (n = 0; n < r.length; ++n) {
      let a = r[n];
      if (_(a, Uint8Array))
        f + a.length > i.length ? (u.isBuffer(a) || (a = u.from(a)), a.copy(i, f)) : Uint8Array.prototype.set.call(
          i,
          a,
          f
        );
      else if (u.isBuffer(a))
        a.copy(i, f);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      f += a.length;
    }
    return i;
  };
  function fr(e, r) {
    if (u.isBuffer(e))
      return e.length;
    if (ArrayBuffer.isView(e) || _(e, ArrayBuffer))
      return e.byteLength;
    if (typeof e != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e
      );
    const t = e.length, n = arguments.length > 2 && arguments[2] === !0;
    if (!n && t === 0)
      return 0;
    let i = !1;
    for (; ; )
      switch (r) {
        case "ascii":
        case "latin1":
        case "binary":
          return t;
        case "utf8":
        case "utf-8":
          return q(e).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return t * 2;
        case "hex":
          return t >>> 1;
        case "base64":
          return Br(e).length;
        default:
          if (i)
            return n ? -1 : q(e).length;
          r = ("" + r).toLowerCase(), i = !0;
      }
  }
  u.byteLength = fr;
  function qr(e, r, t) {
    let n = !1;
    if ((r === void 0 || r < 0) && (r = 0), r > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, r >>>= 0, t <= r))
      return "";
    for (e || (e = "utf8"); ; )
      switch (e) {
        case "hex":
          return ut(this, r, t);
        case "utf8":
        case "utf-8":
          return hr(this, r, t);
        case "ascii":
          return it(this, r, t);
        case "latin1":
        case "binary":
          return ot(this, r, t);
        case "base64":
          return et(this, r, t);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ct(this, r, t);
        default:
          if (n)
            throw new TypeError("Unknown encoding: " + e);
          e = (e + "").toLowerCase(), n = !0;
      }
  }
  u.prototype._isBuffer = !0;
  function M(e, r, t) {
    const n = e[r];
    e[r] = e[t], e[t] = n;
  }
  u.prototype.swap16 = function() {
    const r = this.length;
    if (r % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < r; t += 2)
      M(this, t, t + 1);
    return this;
  }, u.prototype.swap32 = function() {
    const r = this.length;
    if (r % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < r; t += 4)
      M(this, t, t + 3), M(this, t + 1, t + 2);
    return this;
  }, u.prototype.swap64 = function() {
    const r = this.length;
    if (r % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let t = 0; t < r; t += 8)
      M(this, t, t + 7), M(this, t + 1, t + 6), M(this, t + 2, t + 5), M(this, t + 3, t + 4);
    return this;
  }, u.prototype.toString = function() {
    const r = this.length;
    return r === 0 ? "" : arguments.length === 0 ? hr(this, 0, r) : qr.apply(this, arguments);
  }, u.prototype.toLocaleString = u.prototype.toString, u.prototype.equals = function(r) {
    if (!u.isBuffer(r))
      throw new TypeError("Argument must be a Buffer");
    return this === r ? !0 : u.compare(this, r) === 0;
  }, u.prototype.inspect = function() {
    let r = "";
    const t = o.INSPECT_MAX_BYTES;
    return r = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (r += " ... "), "<Buffer " + r + ">";
  }, h && (u.prototype[h] = u.prototype.inspect), u.prototype.compare = function(r, t, n, i, f) {
    if (_(r, Uint8Array) && (r = u.from(r, r.offset, r.byteLength)), !u.isBuffer(r))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r
      );
    if (t === void 0 && (t = 0), n === void 0 && (n = r ? r.length : 0), i === void 0 && (i = 0), f === void 0 && (f = this.length), t < 0 || n > r.length || i < 0 || f > this.length)
      throw new RangeError("out of range index");
    if (i >= f && t >= n)
      return 0;
    if (i >= f)
      return -1;
    if (t >= n)
      return 1;
    if (t >>>= 0, n >>>= 0, i >>>= 0, f >>>= 0, this === r)
      return 0;
    let a = f - i, d = n - t;
    const x = Math.min(a, d), m = this.slice(i, f), B = r.slice(t, n);
    for (let g = 0; g < x; ++g)
      if (m[g] !== B[g]) {
        a = m[g], d = B[g];
        break;
      }
    return a < d ? -1 : d < a ? 1 : 0;
  };
  function ar(e, r, t, n, i) {
    if (e.length === 0)
      return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, Z(t) && (t = i ? 0 : e.length - 1), t < 0 && (t = e.length + t), t >= e.length) {
      if (i)
        return -1;
      t = e.length - 1;
    } else if (t < 0)
      if (i)
        t = 0;
      else
        return -1;
    if (typeof r == "string" && (r = u.from(r, n)), u.isBuffer(r))
      return r.length === 0 ? -1 : sr(e, r, t, n, i);
    if (typeof r == "number")
      return r = r & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(e, r, t) : Uint8Array.prototype.lastIndexOf.call(e, r, t) : sr(e, [r], t, n, i);
    throw new TypeError("val must be string, number or Buffer");
  }
  function sr(e, r, t, n, i) {
    let f = 1, a = e.length, d = r.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (e.length < 2 || r.length < 2)
        return -1;
      f = 2, a /= 2, d /= 2, t /= 2;
    }
    function x(B, g) {
      return f === 1 ? B[g] : B.readUInt16BE(g * f);
    }
    let m;
    if (i) {
      let B = -1;
      for (m = t; m < a; m++)
        if (x(e, m) === x(r, B === -1 ? 0 : m - B)) {
          if (B === -1 && (B = m), m - B + 1 === d)
            return B * f;
        } else
          B !== -1 && (m -= m - B), B = -1;
    } else
      for (t + d > a && (t = a - d), m = t; m >= 0; m--) {
        let B = !0;
        for (let g = 0; g < d; g++)
          if (x(e, m + g) !== x(r, g)) {
            B = !1;
            break;
          }
        if (B)
          return m;
      }
    return -1;
  }
  u.prototype.includes = function(r, t, n) {
    return this.indexOf(r, t, n) !== -1;
  }, u.prototype.indexOf = function(r, t, n) {
    return ar(this, r, t, n, !0);
  }, u.prototype.lastIndexOf = function(r, t, n) {
    return ar(this, r, t, n, !1);
  };
  function Zr(e, r, t, n) {
    t = Number(t) || 0;
    const i = e.length - t;
    n ? (n = Number(n), n > i && (n = i)) : n = i;
    const f = r.length;
    n > f / 2 && (n = f / 2);
    let a;
    for (a = 0; a < n; ++a) {
      const d = parseInt(r.substr(a * 2, 2), 16);
      if (Z(d))
        return a;
      e[t + a] = d;
    }
    return a;
  }
  function Qr(e, r, t, n) {
    return X(q(r, e.length - t), e, t, n);
  }
  function vr(e, r, t, n) {
    return X(ht(r), e, t, n);
  }
  function rt(e, r, t, n) {
    return X(Br(r), e, t, n);
  }
  function tt(e, r, t, n) {
    return X(lt(r, e.length - t), e, t, n);
  }
  u.prototype.write = function(r, t, n, i) {
    if (t === void 0)
      i = "utf8", n = this.length, t = 0;
    else if (n === void 0 && typeof t == "string")
      i = t, n = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    const f = this.length - t;
    if ((n === void 0 || n > f) && (n = f), r.length > 0 && (n < 0 || t < 0) || t > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    i || (i = "utf8");
    let a = !1;
    for (; ; )
      switch (i) {
        case "hex":
          return Zr(this, r, t, n);
        case "utf8":
        case "utf-8":
          return Qr(this, r, t, n);
        case "ascii":
        case "latin1":
        case "binary":
          return vr(this, r, t, n);
        case "base64":
          return rt(this, r, t, n);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return tt(this, r, t, n);
        default:
          if (a)
            throw new TypeError("Unknown encoding: " + i);
          i = ("" + i).toLowerCase(), a = !0;
      }
  }, u.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function et(e, r, t) {
    return r === 0 && t === e.length ? c.fromByteArray(e) : c.fromByteArray(e.slice(r, t));
  }
  function hr(e, r, t) {
    t = Math.min(e.length, t);
    const n = [];
    let i = r;
    for (; i < t; ) {
      const f = e[i];
      let a = null, d = f > 239 ? 4 : f > 223 ? 3 : f > 191 ? 2 : 1;
      if (i + d <= t) {
        let x, m, B, g;
        switch (d) {
          case 1:
            f < 128 && (a = f);
            break;
          case 2:
            x = e[i + 1], (x & 192) === 128 && (g = (f & 31) << 6 | x & 63, g > 127 && (a = g));
            break;
          case 3:
            x = e[i + 1], m = e[i + 2], (x & 192) === 128 && (m & 192) === 128 && (g = (f & 15) << 12 | (x & 63) << 6 | m & 63, g > 2047 && (g < 55296 || g > 57343) && (a = g));
            break;
          case 4:
            x = e[i + 1], m = e[i + 2], B = e[i + 3], (x & 192) === 128 && (m & 192) === 128 && (B & 192) === 128 && (g = (f & 15) << 18 | (x & 63) << 12 | (m & 63) << 6 | B & 63, g > 65535 && g < 1114112 && (a = g));
        }
      }
      a === null ? (a = 65533, d = 1) : a > 65535 && (a -= 65536, n.push(a >>> 10 & 1023 | 55296), a = 56320 | a & 1023), n.push(a), i += d;
    }
    return nt(n);
  }
  const lr = 4096;
  function nt(e) {
    const r = e.length;
    if (r <= lr)
      return String.fromCharCode.apply(String, e);
    let t = "", n = 0;
    for (; n < r; )
      t += String.fromCharCode.apply(
        String,
        e.slice(n, n += lr)
      );
    return t;
  }
  function it(e, r, t) {
    let n = "";
    t = Math.min(e.length, t);
    for (let i = r; i < t; ++i)
      n += String.fromCharCode(e[i] & 127);
    return n;
  }
  function ot(e, r, t) {
    let n = "";
    t = Math.min(e.length, t);
    for (let i = r; i < t; ++i)
      n += String.fromCharCode(e[i]);
    return n;
  }
  function ut(e, r, t) {
    const n = e.length;
    (!r || r < 0) && (r = 0), (!t || t < 0 || t > n) && (t = n);
    let i = "";
    for (let f = r; f < t; ++f)
      i += pt[e[f]];
    return i;
  }
  function ct(e, r, t) {
    const n = e.slice(r, t);
    let i = "";
    for (let f = 0; f < n.length - 1; f += 2)
      i += String.fromCharCode(n[f] + n[f + 1] * 256);
    return i;
  }
  u.prototype.slice = function(r, t) {
    const n = this.length;
    r = ~~r, t = t === void 0 ? n : ~~t, r < 0 ? (r += n, r < 0 && (r = 0)) : r > n && (r = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < r && (t = r);
    const i = this.subarray(r, t);
    return Object.setPrototypeOf(i, u.prototype), i;
  };
  function F(e, r, t) {
    if (e % 1 !== 0 || e < 0)
      throw new RangeError("offset is not uint");
    if (e + r > t)
      throw new RangeError("Trying to access beyond buffer length");
  }
  u.prototype.readUintLE = u.prototype.readUIntLE = function(r, t, n) {
    r = r >>> 0, t = t >>> 0, n || F(r, t, this.length);
    let i = this[r], f = 1, a = 0;
    for (; ++a < t && (f *= 256); )
      i += this[r + a] * f;
    return i;
  }, u.prototype.readUintBE = u.prototype.readUIntBE = function(r, t, n) {
    r = r >>> 0, t = t >>> 0, n || F(r, t, this.length);
    let i = this[r + --t], f = 1;
    for (; t > 0 && (f *= 256); )
      i += this[r + --t] * f;
    return i;
  }, u.prototype.readUint8 = u.prototype.readUInt8 = function(r, t) {
    return r = r >>> 0, t || F(r, 1, this.length), this[r];
  }, u.prototype.readUint16LE = u.prototype.readUInt16LE = function(r, t) {
    return r = r >>> 0, t || F(r, 2, this.length), this[r] | this[r + 1] << 8;
  }, u.prototype.readUint16BE = u.prototype.readUInt16BE = function(r, t) {
    return r = r >>> 0, t || F(r, 2, this.length), this[r] << 8 | this[r + 1];
  }, u.prototype.readUint32LE = u.prototype.readUInt32LE = function(r, t) {
    return r = r >>> 0, t || F(r, 4, this.length), (this[r] | this[r + 1] << 8 | this[r + 2] << 16) + this[r + 3] * 16777216;
  }, u.prototype.readUint32BE = u.prototype.readUInt32BE = function(r, t) {
    return r = r >>> 0, t || F(r, 4, this.length), this[r] * 16777216 + (this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3]);
  }, u.prototype.readBigUInt64LE = P(function(r) {
    r = r >>> 0, L(r, "offset");
    const t = this[r], n = this[r + 7];
    (t === void 0 || n === void 0) && k(r, this.length - 8);
    const i = t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24, f = this[++r] + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i) + (BigInt(f) << BigInt(32));
  }), u.prototype.readBigUInt64BE = P(function(r) {
    r = r >>> 0, L(r, "offset");
    const t = this[r], n = this[r + 7];
    (t === void 0 || n === void 0) && k(r, this.length - 8);
    const i = t * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r], f = this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + n;
    return (BigInt(i) << BigInt(32)) + BigInt(f);
  }), u.prototype.readIntLE = function(r, t, n) {
    r = r >>> 0, t = t >>> 0, n || F(r, t, this.length);
    let i = this[r], f = 1, a = 0;
    for (; ++a < t && (f *= 256); )
      i += this[r + a] * f;
    return f *= 128, i >= f && (i -= Math.pow(2, 8 * t)), i;
  }, u.prototype.readIntBE = function(r, t, n) {
    r = r >>> 0, t = t >>> 0, n || F(r, t, this.length);
    let i = t, f = 1, a = this[r + --i];
    for (; i > 0 && (f *= 256); )
      a += this[r + --i] * f;
    return f *= 128, a >= f && (a -= Math.pow(2, 8 * t)), a;
  }, u.prototype.readInt8 = function(r, t) {
    return r = r >>> 0, t || F(r, 1, this.length), this[r] & 128 ? (255 - this[r] + 1) * -1 : this[r];
  }, u.prototype.readInt16LE = function(r, t) {
    r = r >>> 0, t || F(r, 2, this.length);
    const n = this[r] | this[r + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, u.prototype.readInt16BE = function(r, t) {
    r = r >>> 0, t || F(r, 2, this.length);
    const n = this[r + 1] | this[r] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, u.prototype.readInt32LE = function(r, t) {
    return r = r >>> 0, t || F(r, 4, this.length), this[r] | this[r + 1] << 8 | this[r + 2] << 16 | this[r + 3] << 24;
  }, u.prototype.readInt32BE = function(r, t) {
    return r = r >>> 0, t || F(r, 4, this.length), this[r] << 24 | this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3];
  }, u.prototype.readBigInt64LE = P(function(r) {
    r = r >>> 0, L(r, "offset");
    const t = this[r], n = this[r + 7];
    (t === void 0 || n === void 0) && k(r, this.length - 8);
    const i = this[r + 4] + this[r + 5] * 2 ** 8 + this[r + 6] * 2 ** 16 + (n << 24);
    return (BigInt(i) << BigInt(32)) + BigInt(t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24);
  }), u.prototype.readBigInt64BE = P(function(r) {
    r = r >>> 0, L(r, "offset");
    const t = this[r], n = this[r + 7];
    (t === void 0 || n === void 0) && k(r, this.length - 8);
    const i = (t << 24) + // Overflow
    this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r];
    return (BigInt(i) << BigInt(32)) + BigInt(this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + n);
  }), u.prototype.readFloatLE = function(r, t) {
    return r = r >>> 0, t || F(r, 4, this.length), s.read(this, r, !0, 23, 4);
  }, u.prototype.readFloatBE = function(r, t) {
    return r = r >>> 0, t || F(r, 4, this.length), s.read(this, r, !1, 23, 4);
  }, u.prototype.readDoubleLE = function(r, t) {
    return r = r >>> 0, t || F(r, 8, this.length), s.read(this, r, !0, 52, 8);
  }, u.prototype.readDoubleBE = function(r, t) {
    return r = r >>> 0, t || F(r, 8, this.length), s.read(this, r, !1, 52, 8);
  };
  function b(e, r, t, n, i, f) {
    if (!u.isBuffer(e))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (r > i || r < f)
      throw new RangeError('"value" argument is out of bounds');
    if (t + n > e.length)
      throw new RangeError("Index out of range");
  }
  u.prototype.writeUintLE = u.prototype.writeUIntLE = function(r, t, n, i) {
    if (r = +r, t = t >>> 0, n = n >>> 0, !i) {
      const d = Math.pow(2, 8 * n) - 1;
      b(this, r, t, n, d, 0);
    }
    let f = 1, a = 0;
    for (this[t] = r & 255; ++a < n && (f *= 256); )
      this[t + a] = r / f & 255;
    return t + n;
  }, u.prototype.writeUintBE = u.prototype.writeUIntBE = function(r, t, n, i) {
    if (r = +r, t = t >>> 0, n = n >>> 0, !i) {
      const d = Math.pow(2, 8 * n) - 1;
      b(this, r, t, n, d, 0);
    }
    let f = n - 1, a = 1;
    for (this[t + f] = r & 255; --f >= 0 && (a *= 256); )
      this[t + f] = r / a & 255;
    return t + n;
  }, u.prototype.writeUint8 = u.prototype.writeUInt8 = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 1, 255, 0), this[t] = r & 255, t + 1;
  }, u.prototype.writeUint16LE = u.prototype.writeUInt16LE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 2, 65535, 0), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
  }, u.prototype.writeUint16BE = u.prototype.writeUInt16BE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 2, 65535, 0), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
  }, u.prototype.writeUint32LE = u.prototype.writeUInt32LE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 4, 4294967295, 0), this[t + 3] = r >>> 24, this[t + 2] = r >>> 16, this[t + 1] = r >>> 8, this[t] = r & 255, t + 4;
  }, u.prototype.writeUint32BE = u.prototype.writeUInt32BE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 4, 4294967295, 0), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
  };
  function pr(e, r, t, n, i) {
    xr(r, n, i, e, t, 7);
    let f = Number(r & BigInt(4294967295));
    e[t++] = f, f = f >> 8, e[t++] = f, f = f >> 8, e[t++] = f, f = f >> 8, e[t++] = f;
    let a = Number(r >> BigInt(32) & BigInt(4294967295));
    return e[t++] = a, a = a >> 8, e[t++] = a, a = a >> 8, e[t++] = a, a = a >> 8, e[t++] = a, t;
  }
  function yr(e, r, t, n, i) {
    xr(r, n, i, e, t, 7);
    let f = Number(r & BigInt(4294967295));
    e[t + 7] = f, f = f >> 8, e[t + 6] = f, f = f >> 8, e[t + 5] = f, f = f >> 8, e[t + 4] = f;
    let a = Number(r >> BigInt(32) & BigInt(4294967295));
    return e[t + 3] = a, a = a >> 8, e[t + 2] = a, a = a >> 8, e[t + 1] = a, a = a >> 8, e[t] = a, t + 8;
  }
  u.prototype.writeBigUInt64LE = P(function(r, t = 0) {
    return pr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }), u.prototype.writeBigUInt64BE = P(function(r, t = 0) {
    return yr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }), u.prototype.writeIntLE = function(r, t, n, i) {
    if (r = +r, t = t >>> 0, !i) {
      const x = Math.pow(2, 8 * n - 1);
      b(this, r, t, n, x - 1, -x);
    }
    let f = 0, a = 1, d = 0;
    for (this[t] = r & 255; ++f < n && (a *= 256); )
      r < 0 && d === 0 && this[t + f - 1] !== 0 && (d = 1), this[t + f] = (r / a >> 0) - d & 255;
    return t + n;
  }, u.prototype.writeIntBE = function(r, t, n, i) {
    if (r = +r, t = t >>> 0, !i) {
      const x = Math.pow(2, 8 * n - 1);
      b(this, r, t, n, x - 1, -x);
    }
    let f = n - 1, a = 1, d = 0;
    for (this[t + f] = r & 255; --f >= 0 && (a *= 256); )
      r < 0 && d === 0 && this[t + f + 1] !== 0 && (d = 1), this[t + f] = (r / a >> 0) - d & 255;
    return t + n;
  }, u.prototype.writeInt8 = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 1, 127, -128), r < 0 && (r = 255 + r + 1), this[t] = r & 255, t + 1;
  }, u.prototype.writeInt16LE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 2, 32767, -32768), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
  }, u.prototype.writeInt16BE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 2, 32767, -32768), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
  }, u.prototype.writeInt32LE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 4, 2147483647, -2147483648), this[t] = r & 255, this[t + 1] = r >>> 8, this[t + 2] = r >>> 16, this[t + 3] = r >>> 24, t + 4;
  }, u.prototype.writeInt32BE = function(r, t, n) {
    return r = +r, t = t >>> 0, n || b(this, r, t, 4, 2147483647, -2147483648), r < 0 && (r = 4294967295 + r + 1), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
  }, u.prototype.writeBigInt64LE = P(function(r, t = 0) {
    return pr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }), u.prototype.writeBigInt64BE = P(function(r, t = 0) {
    return yr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function dr(e, r, t, n, i, f) {
    if (t + n > e.length)
      throw new RangeError("Index out of range");
    if (t < 0)
      throw new RangeError("Index out of range");
  }
  function wr(e, r, t, n, i) {
    return r = +r, t = t >>> 0, i || dr(e, r, t, 4), s.write(e, r, t, n, 23, 4), t + 4;
  }
  u.prototype.writeFloatLE = function(r, t, n) {
    return wr(this, r, t, !0, n);
  }, u.prototype.writeFloatBE = function(r, t, n) {
    return wr(this, r, t, !1, n);
  };
  function gr(e, r, t, n, i) {
    return r = +r, t = t >>> 0, i || dr(e, r, t, 8), s.write(e, r, t, n, 52, 8), t + 8;
  }
  u.prototype.writeDoubleLE = function(r, t, n) {
    return gr(this, r, t, !0, n);
  }, u.prototype.writeDoubleBE = function(r, t, n) {
    return gr(this, r, t, !1, n);
  }, u.prototype.copy = function(r, t, n, i) {
    if (!u.isBuffer(r))
      throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= r.length && (t = r.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || r.length === 0 || this.length === 0)
      return 0;
    if (t < 0)
      throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length)
      throw new RangeError("Index out of range");
    if (i < 0)
      throw new RangeError("sourceEnd out of bounds");
    i > this.length && (i = this.length), r.length - t < i - n && (i = r.length - t + n);
    const f = i - n;
    return this === r && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(
      r,
      this.subarray(n, i),
      t
    ), f;
  }, u.prototype.fill = function(r, t, n, i) {
    if (typeof r == "string") {
      if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string")
        throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !u.isEncoding(i))
        throw new TypeError("Unknown encoding: " + i);
      if (r.length === 1) {
        const a = r.charCodeAt(0);
        (i === "utf8" && a < 128 || i === "latin1") && (r = a);
      }
    } else
      typeof r == "number" ? r = r & 255 : typeof r == "boolean" && (r = Number(r));
    if (t < 0 || this.length < t || this.length < n)
      throw new RangeError("Out of range index");
    if (n <= t)
      return this;
    t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, r || (r = 0);
    let f;
    if (typeof r == "number")
      for (f = t; f < n; ++f)
        this[f] = r;
    else {
      const a = u.isBuffer(r) ? r : u.from(r, i), d = a.length;
      if (d === 0)
        throw new TypeError('The value "' + r + '" is invalid for argument "value"');
      for (f = 0; f < n - t; ++f)
        this[f + t] = a[f % d];
    }
    return this;
  };
  const N = {};
  function J(e, r, t) {
    N[e] = class extends t {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: r.apply(this, arguments),
          writable: !0,
          configurable: !0
        }), this.name = `${this.name} [${e}]`, this.stack, delete this.name;
      }
      get code() {
        return e;
      }
      set code(i) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: i,
          writable: !0
        });
      }
      toString() {
        return `${this.name} [${e}]: ${this.message}`;
      }
    };
  }
  J(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(e) {
      return e ? `${e} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  ), J(
    "ERR_INVALID_ARG_TYPE",
    function(e, r) {
      return `The "${e}" argument must be of type number. Received type ${typeof r}`;
    },
    TypeError
  ), J(
    "ERR_OUT_OF_RANGE",
    function(e, r, t) {
      let n = `The value of "${e}" is out of range.`, i = t;
      return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = mr(String(t)) : typeof t == "bigint" && (i = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = mr(i)), i += "n"), n += ` It must be ${r}. Received ${i}`, n;
    },
    RangeError
  );
  function mr(e) {
    let r = "", t = e.length;
    const n = e[0] === "-" ? 1 : 0;
    for (; t >= n + 4; t -= 3)
      r = `_${e.slice(t - 3, t)}${r}`;
    return `${e.slice(0, t)}${r}`;
  }
  function ft(e, r, t) {
    L(r, "offset"), (e[r] === void 0 || e[r + t] === void 0) && k(r, e.length - (t + 1));
  }
  function xr(e, r, t, n, i, f) {
    if (e > t || e < r) {
      const a = typeof r == "bigint" ? "n" : "";
      let d;
      throw f > 3 ? r === 0 || r === BigInt(0) ? d = `>= 0${a} and < 2${a} ** ${(f + 1) * 8}${a}` : d = `>= -(2${a} ** ${(f + 1) * 8 - 1}${a}) and < 2 ** ${(f + 1) * 8 - 1}${a}` : d = `>= ${r}${a} and <= ${t}${a}`, new N.ERR_OUT_OF_RANGE("value", d, e);
    }
    ft(n, i, f);
  }
  function L(e, r) {
    if (typeof e != "number")
      throw new N.ERR_INVALID_ARG_TYPE(r, "number", e);
  }
  function k(e, r, t) {
    throw Math.floor(e) !== e ? (L(e, t), new N.ERR_OUT_OF_RANGE(t || "offset", "an integer", e)) : r < 0 ? new N.ERR_BUFFER_OUT_OF_BOUNDS() : new N.ERR_OUT_OF_RANGE(
      t || "offset",
      `>= ${t ? 1 : 0} and <= ${r}`,
      e
    );
  }
  const at = /[^+/0-9A-Za-z-_]/g;
  function st(e) {
    if (e = e.split("=")[0], e = e.trim().replace(at, ""), e.length < 2)
      return "";
    for (; e.length % 4 !== 0; )
      e = e + "=";
    return e;
  }
  function q(e, r) {
    r = r || 1 / 0;
    let t;
    const n = e.length;
    let i = null;
    const f = [];
    for (let a = 0; a < n; ++a) {
      if (t = e.charCodeAt(a), t > 55295 && t < 57344) {
        if (!i) {
          if (t > 56319) {
            (r -= 3) > -1 && f.push(239, 191, 189);
            continue;
          } else if (a + 1 === n) {
            (r -= 3) > -1 && f.push(239, 191, 189);
            continue;
          }
          i = t;
          continue;
        }
        if (t < 56320) {
          (r -= 3) > -1 && f.push(239, 191, 189), i = t;
          continue;
        }
        t = (i - 55296 << 10 | t - 56320) + 65536;
      } else
        i && (r -= 3) > -1 && f.push(239, 191, 189);
      if (i = null, t < 128) {
        if ((r -= 1) < 0)
          break;
        f.push(t);
      } else if (t < 2048) {
        if ((r -= 2) < 0)
          break;
        f.push(
          t >> 6 | 192,
          t & 63 | 128
        );
      } else if (t < 65536) {
        if ((r -= 3) < 0)
          break;
        f.push(
          t >> 12 | 224,
          t >> 6 & 63 | 128,
          t & 63 | 128
        );
      } else if (t < 1114112) {
        if ((r -= 4) < 0)
          break;
        f.push(
          t >> 18 | 240,
          t >> 12 & 63 | 128,
          t >> 6 & 63 | 128,
          t & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return f;
  }
  function ht(e) {
    const r = [];
    for (let t = 0; t < e.length; ++t)
      r.push(e.charCodeAt(t) & 255);
    return r;
  }
  function lt(e, r) {
    let t, n, i;
    const f = [];
    for (let a = 0; a < e.length && !((r -= 2) < 0); ++a)
      t = e.charCodeAt(a), n = t >> 8, i = t % 256, f.push(i), f.push(n);
    return f;
  }
  function Br(e) {
    return c.toByteArray(st(e));
  }
  function X(e, r, t, n) {
    let i;
    for (i = 0; i < n && !(i + t >= r.length || i >= e.length); ++i)
      r[i + t] = e[i];
    return i;
  }
  function _(e, r) {
    return e instanceof r || e != null && e.constructor != null && e.constructor.name != null && e.constructor.name === r.name;
  }
  function Z(e) {
    return e !== e;
  }
  const pt = function() {
    const e = "0123456789abcdef", r = new Array(256);
    for (let t = 0; t < 16; ++t) {
      const n = t * 16;
      for (let i = 0; i < 16; ++i)
        r[n + i] = e[t] + e[i];
    }
    return r;
  }();
  function P(e) {
    return typeof BigInt > "u" ? yt : e;
  }
  function yt() {
    throw new Error("BigInt not supported");
  }
})(G);
const K = Bt, z = Et, tr = 32;
function ur(o) {
  return Array.isArray(o) ? j.fromSecretKey(G.Buffer.from(o)) : typeof o == "string" ? j.fromSecretKey(Kr(o)) : j.fromSecretKey(o);
}
const Dr = "ECDH-ES+XC20PKW", kr = 256;
function qt(o) {
  const c = new Tr(o);
  return (s, h) => {
    const l = wt(K), p = c.seal(l, s, h);
    return {
      ciphertext: p.subarray(0, p.length - z),
      tag: p.subarray(p.length - z),
      iv: l
    };
  };
}
function Zt(o) {
  const c = new Tr(o);
  return (s, h, l, p) => c.open(l, A.concat([s, h]), p);
}
function Qt(o) {
  const c = br(ur(o).secretKey), s = mt(c);
  return { secretKey: c, publicKey: s };
}
async function jr(o, c, s) {
  const h = s ? Qt(s) : gt(), l = Ur(h.secretKey, xt(c.toBytes())), p = nr(
    l,
    kr,
    Dr
  ), y = qt(p)(ir(o));
  return Lr(
    A.concat([
      y.iv,
      y.tag,
      y.ciphertext,
      h.publicKey
    ])
  );
}
async function Gr(o, c) {
  const s = Nr(o), h = s.subarray(0, K), l = s.subarray(K, K + z), p = s.subarray(K + z, -tr), y = s.subarray(-tr), u = ur(c).secretKey, w = br(u), T = Ur(w, y), I = nr(
    T,
    kr,
    Dr
  ), E = await Zt(I)(p, l, h);
  if (E === null)
    throw new Error("There was an error decoding the message!");
  return $r(E);
}
const vt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  XC20P_EPK_LENGTH: tr,
  XC20P_IV_LENGTH: K,
  XC20P_TAG_LENGTH: z,
  decrypt: Gr,
  encrypt: jr,
  makeKeypair: ur
}, Symbol.toStringTag, { value: "Module" })), Fr = Ft(), re = Sr(), zr = {
  poseidon: async (o) => {
    const c = await re, s = c.F.fromMontgomery(
      c(
        o.map((h) => c.F.toMontgomery(new Uint8Array(h).reverse()))
      )
    );
    return er(s, 32).reverse();
  }
}, te = {
  /**
   * Convert eddsa-babyjubjub private key to public key
   *
   * @param privateKey - babyjubjub private key
   * @returns public key
   */
  async privateKeyToPublicKey(o) {
    const c = await Fr;
    return c.prv2pub(o).map((h) => c.F.fromMontgomery(h).reverse());
  },
  /**
   * Generates a random babyJubJub point
   *
   * @returns random point
   */
  genRandomPoint() {
    return zr.poseidon([It(32)]);
  },
  /**
   * Creates eddsa-babyjubjub signature with poseidon hash
   *
   * @param key - private key
   * @param msg - message to sign
   * @returns signature
   */
  async signPoseidon(o, c) {
    const s = await Fr, h = s.F.toMontgomery(Uint8Array.from(c).reverse()), l = s.signPoseidon(o, h), p = l.R8.map((y) => s.F.fromMontgomery(y).reverse());
    return {
      s: Pr(l.S, 32),
      r8: p
    };
  }
}, be = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  edBabyJubJub: te,
  hash: zr,
  utils: jt,
  xc20p: vt
}, Symbol.toStringTag, { value: "Module" }));
async function ee(o) {
  const c = G.Buffer.isBuffer(o.wasmFile) ? Uint8Array.from(o.wasmFile) : await Ar(o.wasmFile), s = G.Buffer.isBuffer(o.zkeyFile) ? Uint8Array.from(o.zkeyFile) : await Ar(o.zkeyFile);
  return Cr.fullProve(
    o.input ?? {},
    { type: "mem", data: c },
    { type: "mem", data: s },
    o.logger
  );
}
async function ne(o) {
  return Cr.verify(o.vk, o.publicInput ?? [], o.proof, o.logger);
}
async function Ar(o) {
  const { data: c } = await _r({ method: "get", url: o, responseType: "arraybuffer" });
  return new Uint8Array(c);
}
const Te = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  generateProof: ee,
  verifyProof: ne
}, Symbol.toStringTag, { value: "Module" }));
function V(o) {
  const c = new Uint8Array(o.length + 2);
  return c[0] = 237, c[1] = 1, c.set(o, 2), `did:key:z${A.toString(c, "base58btc")}`;
}
const ie = "metadata";
function Xr(o) {
  return Er.findProgramAddressSync(
    [G.Buffer.from(ie), Ir.toBuffer(), new Er(o).toBuffer()],
    Ir
  )[0];
}
async function oe(o, c, s = !1) {
  const h = await o.getAccountInfo(Xr(c));
  if (h) {
    const l = ue(Rt.fromAccountInfo(h)[0]);
    if (s)
      try {
        l.json = (await _r.get(l.data.uri)).data;
      } catch {
        console.log("Error: Failed to load NFT metadata"), l.json = {};
      }
    return l;
  }
}
const H = (o) => o.replace(/\0/g, "");
function ue(o) {
  var c, s, h;
  return {
    ...o,
    data: {
      ...o == null ? void 0 : o.data,
      name: H((c = o == null ? void 0 : o.data) == null ? void 0 : c.name),
      symbol: H((s = o == null ? void 0 : o.data) == null ? void 0 : s.symbol),
      uri: H((h = o == null ? void 0 : o.data) == null ? void 0 : h.uri)
    }
  };
}
const Se = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  encodeDidKey: V,
  getMetadataByMint: oe,
  getMetadataPDA: Xr,
  sanitizeString: H
}, Symbol.toStringTag, { value: "Module" })), cr = "https://www.w3.org/2018/credentials/v1", Hr = "VerifiableCredential", Vr = "VerifiablePresentation";
async function ce(o, c) {
  let s = {};
  c != null && c.encrypt ? s.encrypted = await jr(JSON.stringify(o), c.holder, c.encryptionKey) : s = { ...o };
  const h = j.fromSecretKey(Uint8Array.from(c.signerSecretKey)), l = Rr(h.secretKey), p = {
    // did: 'did:web:albus.finance',
    did: V(h.publicKey.toBytes()),
    signer: l,
    alg: "EdDSA"
  }, y = {
    sub: V(c.holder.toBytes()),
    aud: c == null ? void 0 : c.aud,
    vc: {
      "@context": [cr],
      type: [Hr],
      credentialSubject: s
    }
  };
  c != null && c.exp && (y.exp = c.exp), c != null && c.nbf && (y.nbf = c.nbf);
  const u = await Wr(o);
  return {
    payload: await Ut(y, p),
    credentialRoot: Mr(u.root)
  };
}
async function fe(o, c) {
  const s = j.generate(), h = Rr(s.secretKey), l = {
    did: V(s.publicKey.toBytes()),
    signer: h,
    alg: "EdDSA"
  };
  return bt({
    vp: {
      "@context": [cr],
      type: [Vr],
      verifiableCredential: o
    }
  }, l, c);
}
async function ae(o, c) {
  const s = new St({
    ...Ct.getResolver(),
    ..._t.getResolver()
  }), h = await Tt(o, s, c);
  let l = h.verifiableCredential.credentialSubject;
  if (l.encrypted && c.decryptionKey)
    try {
      l = JSON.parse(await Gr(l.encrypted, c.decryptionKey));
    } catch {
    }
  return h.verifiableCredential = {
    ...h.verifiableCredential,
    credentialSubject: l
  }, h;
}
const se = Sr();
async function Wr(o) {
  const c = await At(), s = await se, h = (l) => s([ir(l)]);
  for (const [l, p] of Object.entries(o))
    await c.insert(h(l), h(p));
  return {
    root: c.root,
    find: (l) => c.find(h(l)),
    insert: (l, p) => c.insert(h(l), h(p)),
    update: (l, p) => c.update(h(l), h(p)),
    delete: (l) => c.delete(h(l))
  };
}
const _e = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_CONTEXT: cr,
  DEFAULT_VC_TYPE: Hr,
  DEFAULT_VP_TYPE: Vr,
  claimsTree: Wr,
  createVerifiableCredential: ce,
  createVerifiablePresentation: fe,
  verifyCredential: ae
}, Symbol.toStringTag, { value: "Module" }));
export {
  be as crypto,
  Se as utils,
  _e as vc,
  Te as zkp
};
//# sourceMappingURL=index.es.js.map
