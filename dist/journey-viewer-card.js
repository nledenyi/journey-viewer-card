/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const We = globalThis, Ii = We.ShadowRoot && (We.ShadyCSS === void 0 || We.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Zi = Symbol(), no = /* @__PURE__ */ new WeakMap();
let Lo = class {
  constructor(o, s, h) {
    if (this._$cssResult$ = !0, h !== Zi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = o, this.t = s;
  }
  get styleSheet() {
    let o = this.o;
    const s = this.t;
    if (Ii && o === void 0) {
      const h = s !== void 0 && s.length === 1;
      h && (o = no.get(s)), o === void 0 && ((this.o = o = new CSSStyleSheet()).replaceSync(this.cssText), h && no.set(s, o));
    }
    return o;
  }
  toString() {
    return this.cssText;
  }
};
const To = (u) => new Lo(typeof u == "string" ? u : u + "", void 0, Zi), Ao = (u, ...o) => {
  const s = u.length === 1 ? u[0] : o.reduce((h, l, f) => h + ((d) => {
    if (d._$cssResult$ === !0) return d.cssText;
    if (typeof d == "number") return d;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + d + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(l) + u[f + 1], u[0]);
  return new Lo(s, u, Zi);
}, ss = (u, o) => {
  if (Ii) u.adoptedStyleSheets = o.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of o) {
    const h = document.createElement("style"), l = We.litNonce;
    l !== void 0 && h.setAttribute("nonce", l), h.textContent = s.cssText, u.appendChild(h);
  }
}, oo = Ii ? (u) => u : (u) => u instanceof CSSStyleSheet ? ((o) => {
  let s = "";
  for (const h of o.cssRules) s += h.cssText;
  return To(s);
})(u) : u;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: as, defineProperty: ls, getOwnPropertyDescriptor: hs, getOwnPropertyNames: cs, getOwnPropertySymbols: us, getPrototypeOf: ds } = Object, Ge = globalThis, ro = Ge.trustedTypes, fs = ro ? ro.emptyScript : "", ps = Ge.reactiveElementPolyfillSupport, me = (u, o) => u, Ue = { toAttribute(u, o) {
  switch (o) {
    case Boolean:
      u = u ? fs : null;
      break;
    case Object:
    case Array:
      u = u == null ? u : JSON.stringify(u);
  }
  return u;
}, fromAttribute(u, o) {
  let s = u;
  switch (o) {
    case Boolean:
      s = u !== null;
      break;
    case Number:
      s = u === null ? null : Number(u);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(u);
      } catch {
        s = null;
      }
  }
  return s;
} }, Ri = (u, o) => !as(u, o), so = { attribute: !0, type: String, converter: Ue, reflect: !1, useDefault: !1, hasChanged: Ri };
Symbol.metadata ??= Symbol("metadata"), Ge.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Wt = class extends HTMLElement {
  static addInitializer(o) {
    this._$Ei(), (this.l ??= []).push(o);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(o, s = so) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(o) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(o, s), !s.noAccessor) {
      const h = Symbol(), l = this.getPropertyDescriptor(o, h, s);
      l !== void 0 && ls(this.prototype, o, l);
    }
  }
  static getPropertyDescriptor(o, s, h) {
    const { get: l, set: f } = hs(this.prototype, o) ?? { get() {
      return this[s];
    }, set(d) {
      this[s] = d;
    } };
    return { get: l, set(d) {
      const m = l?.call(this);
      f?.call(this, d), this.requestUpdate(o, m, h);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(o) {
    return this.elementProperties.get(o) ?? so;
  }
  static _$Ei() {
    if (this.hasOwnProperty(me("elementProperties"))) return;
    const o = ds(this);
    o.finalize(), o.l !== void 0 && (this.l = [...o.l]), this.elementProperties = new Map(o.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(me("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(me("properties"))) {
      const s = this.properties, h = [...cs(s), ...us(s)];
      for (const l of h) this.createProperty(l, s[l]);
    }
    const o = this[Symbol.metadata];
    if (o !== null) {
      const s = litPropertyMetadata.get(o);
      if (s !== void 0) for (const [h, l] of s) this.elementProperties.set(h, l);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, h] of this.elementProperties) {
      const l = this._$Eu(s, h);
      l !== void 0 && this._$Eh.set(l, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(o) {
    const s = [];
    if (Array.isArray(o)) {
      const h = new Set(o.flat(1 / 0).reverse());
      for (const l of h) s.unshift(oo(l));
    } else o !== void 0 && s.push(oo(o));
    return s;
  }
  static _$Eu(o, s) {
    const h = s.attribute;
    return h === !1 ? void 0 : typeof h == "string" ? h : typeof o == "string" ? o.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((o) => this.enableUpdating = o), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((o) => o(this));
  }
  addController(o) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(o), this.renderRoot !== void 0 && this.isConnected && o.hostConnected?.();
  }
  removeController(o) {
    this._$EO?.delete(o);
  }
  _$E_() {
    const o = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const h of s.keys()) this.hasOwnProperty(h) && (o.set(h, this[h]), delete this[h]);
    o.size > 0 && (this._$Ep = o);
  }
  createRenderRoot() {
    const o = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ss(o, this.constructor.elementStyles), o;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((o) => o.hostConnected?.());
  }
  enableUpdating(o) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((o) => o.hostDisconnected?.());
  }
  attributeChangedCallback(o, s, h) {
    this._$AK(o, h);
  }
  _$ET(o, s) {
    const h = this.constructor.elementProperties.get(o), l = this.constructor._$Eu(o, h);
    if (l !== void 0 && h.reflect === !0) {
      const f = (h.converter?.toAttribute !== void 0 ? h.converter : Ue).toAttribute(s, h.type);
      this._$Em = o, f == null ? this.removeAttribute(l) : this.setAttribute(l, f), this._$Em = null;
    }
  }
  _$AK(o, s) {
    const h = this.constructor, l = h._$Eh.get(o);
    if (l !== void 0 && this._$Em !== l) {
      const f = h.getPropertyOptions(l), d = typeof f.converter == "function" ? { fromAttribute: f.converter } : f.converter?.fromAttribute !== void 0 ? f.converter : Ue;
      this._$Em = l;
      const m = d.fromAttribute(s, f.type);
      this[l] = m ?? this._$Ej?.get(l) ?? m, this._$Em = null;
    }
  }
  requestUpdate(o, s, h, l = !1, f) {
    if (o !== void 0) {
      const d = this.constructor;
      if (l === !1 && (f = this[o]), h ??= d.getPropertyOptions(o), !((h.hasChanged ?? Ri)(f, s) || h.useDefault && h.reflect && f === this._$Ej?.get(o) && !this.hasAttribute(d._$Eu(o, h)))) return;
      this.C(o, s, h);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(o, s, { useDefault: h, reflect: l, wrapped: f }, d) {
    h && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(o) && (this._$Ej.set(o, d ?? s ?? this[o]), f !== !0 || d !== void 0) || (this._$AL.has(o) || (this.hasUpdated || h || (s = void 0), this._$AL.set(o, s)), l === !0 && this._$Em !== o && (this._$Eq ??= /* @__PURE__ */ new Set()).add(o));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const o = this.scheduleUpdate();
    return o != null && await o, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [l, f] of this._$Ep) this[l] = f;
        this._$Ep = void 0;
      }
      const h = this.constructor.elementProperties;
      if (h.size > 0) for (const [l, f] of h) {
        const { wrapped: d } = f, m = this[l];
        d !== !0 || this._$AL.has(l) || m === void 0 || this.C(l, void 0, f, m);
      }
    }
    let o = !1;
    const s = this._$AL;
    try {
      o = this.shouldUpdate(s), o ? (this.willUpdate(s), this._$EO?.forEach((h) => h.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (h) {
      throw o = !1, this._$EM(), h;
    }
    o && this._$AE(s);
  }
  willUpdate(o) {
  }
  _$AE(o) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(o)), this.updated(o);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(o) {
    return !0;
  }
  update(o) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(o) {
  }
  firstUpdated(o) {
  }
};
Wt.elementStyles = [], Wt.shadowRootOptions = { mode: "open" }, Wt[me("elementProperties")] = /* @__PURE__ */ new Map(), Wt[me("finalized")] = /* @__PURE__ */ new Map(), ps?.({ ReactiveElement: Wt }), (Ge.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bi = globalThis, ao = (u) => u, Ve = Bi.trustedTypes, lo = Ve ? Ve.createPolicy("lit-html", { createHTML: (u) => u }) : void 0, So = "$lit$", Pt = `lit$${Math.random().toFixed(9).slice(2)}$`, ko = "?" + Pt, _s = `<${ko}>`, zt = document, ge = () => zt.createComment(""), ve = (u) => u === null || typeof u != "object" && typeof u != "function", $i = Array.isArray, ms = (u) => $i(u) || typeof u?.[Symbol.iterator] == "function", Oi = `[ 	
\f\r]`, ue = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ho = /-->/g, co = />/g, Et = RegExp(`>|${Oi}(?:([^\\s"'>=/]+)(${Oi}*=${Oi}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), uo = /'/g, fo = /"/g, Co = /^(?:script|style|textarea|title)$/i, gs = (u) => (o, ...s) => ({ _$litType$: u, strings: o, values: s }), Z = gs(1), Lt = Symbol.for("lit-noChange"), O = Symbol.for("lit-nothing"), po = /* @__PURE__ */ new WeakMap(), Mt = zt.createTreeWalker(zt, 129);
function Eo(u, o) {
  if (!$i(u) || !u.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return lo !== void 0 ? lo.createHTML(o) : o;
}
const vs = (u, o) => {
  const s = u.length - 1, h = [];
  let l, f = o === 2 ? "<svg>" : o === 3 ? "<math>" : "", d = ue;
  for (let m = 0; m < s; m++) {
    const v = u[m];
    let M, z, x = -1, H = 0;
    for (; H < v.length && (d.lastIndex = H, z = d.exec(v), z !== null); ) H = d.lastIndex, d === ue ? z[1] === "!--" ? d = ho : z[1] !== void 0 ? d = co : z[2] !== void 0 ? (Co.test(z[2]) && (l = RegExp("</" + z[2], "g")), d = Et) : z[3] !== void 0 && (d = Et) : d === Et ? z[0] === ">" ? (d = l ?? ue, x = -1) : z[1] === void 0 ? x = -2 : (x = d.lastIndex - z[2].length, M = z[1], d = z[3] === void 0 ? Et : z[3] === '"' ? fo : uo) : d === fo || d === uo ? d = Et : d === ho || d === co ? d = ue : (d = Et, l = void 0);
    const Y = d === Et && u[m + 1].startsWith("/>") ? " " : "";
    f += d === ue ? v + _s : x >= 0 ? (h.push(M), v.slice(0, x) + So + v.slice(x) + Pt + Y) : v + Pt + (x === -2 ? m : Y);
  }
  return [Eo(u, f + (u[s] || "<?>") + (o === 2 ? "</svg>" : o === 3 ? "</math>" : "")), h];
};
class ye {
  constructor({ strings: o, _$litType$: s }, h) {
    let l;
    this.parts = [];
    let f = 0, d = 0;
    const m = o.length - 1, v = this.parts, [M, z] = vs(o, s);
    if (this.el = ye.createElement(M, h), Mt.currentNode = this.el.content, s === 2 || s === 3) {
      const x = this.el.content.firstChild;
      x.replaceWith(...x.childNodes);
    }
    for (; (l = Mt.nextNode()) !== null && v.length < m; ) {
      if (l.nodeType === 1) {
        if (l.hasAttributes()) for (const x of l.getAttributeNames()) if (x.endsWith(So)) {
          const H = z[d++], Y = l.getAttribute(x).split(Pt), K = /([.?@])?(.*)/.exec(H);
          v.push({ type: 1, index: f, name: K[2], strings: Y, ctor: K[1] === "." ? bs : K[1] === "?" ? xs : K[1] === "@" ? ws : Ye }), l.removeAttribute(x);
        } else x.startsWith(Pt) && (v.push({ type: 6, index: f }), l.removeAttribute(x));
        if (Co.test(l.tagName)) {
          const x = l.textContent.split(Pt), H = x.length - 1;
          if (H > 0) {
            l.textContent = Ve ? Ve.emptyScript : "";
            for (let Y = 0; Y < H; Y++) l.append(x[Y], ge()), Mt.nextNode(), v.push({ type: 2, index: ++f });
            l.append(x[H], ge());
          }
        }
      } else if (l.nodeType === 8) if (l.data === ko) v.push({ type: 2, index: f });
      else {
        let x = -1;
        for (; (x = l.data.indexOf(Pt, x + 1)) !== -1; ) v.push({ type: 7, index: f }), x += Pt.length - 1;
      }
      f++;
    }
  }
  static createElement(o, s) {
    const h = zt.createElement("template");
    return h.innerHTML = o, h;
  }
}
function qt(u, o, s = u, h) {
  if (o === Lt) return o;
  let l = h !== void 0 ? s._$Co?.[h] : s._$Cl;
  const f = ve(o) ? void 0 : o._$litDirective$;
  return l?.constructor !== f && (l?._$AO?.(!1), f === void 0 ? l = void 0 : (l = new f(u), l._$AT(u, s, h)), h !== void 0 ? (s._$Co ??= [])[h] = l : s._$Cl = l), l !== void 0 && (o = qt(u, l._$AS(u, o.values), l, h)), o;
}
class ys {
  constructor(o, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = o, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(o) {
    const { el: { content: s }, parts: h } = this._$AD, l = (o?.creationScope ?? zt).importNode(s, !0);
    Mt.currentNode = l;
    let f = Mt.nextNode(), d = 0, m = 0, v = h[0];
    for (; v !== void 0; ) {
      if (d === v.index) {
        let M;
        v.type === 2 ? M = new be(f, f.nextSibling, this, o) : v.type === 1 ? M = new v.ctor(f, v.name, v.strings, this, o) : v.type === 6 && (M = new Ps(f, this, o)), this._$AV.push(M), v = h[++m];
      }
      d !== v?.index && (f = Mt.nextNode(), d++);
    }
    return Mt.currentNode = zt, l;
  }
  p(o) {
    let s = 0;
    for (const h of this._$AV) h !== void 0 && (h.strings !== void 0 ? (h._$AI(o, h, s), s += h.strings.length - 2) : h._$AI(o[s])), s++;
  }
}
class be {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(o, s, h, l) {
    this.type = 2, this._$AH = O, this._$AN = void 0, this._$AA = o, this._$AB = s, this._$AM = h, this.options = l, this._$Cv = l?.isConnected ?? !0;
  }
  get parentNode() {
    let o = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && o?.nodeType === 11 && (o = s.parentNode), o;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(o, s = this) {
    o = qt(this, o, s), ve(o) ? o === O || o == null || o === "" ? (this._$AH !== O && this._$AR(), this._$AH = O) : o !== this._$AH && o !== Lt && this._(o) : o._$litType$ !== void 0 ? this.$(o) : o.nodeType !== void 0 ? this.T(o) : ms(o) ? this.k(o) : this._(o);
  }
  O(o) {
    return this._$AA.parentNode.insertBefore(o, this._$AB);
  }
  T(o) {
    this._$AH !== o && (this._$AR(), this._$AH = this.O(o));
  }
  _(o) {
    this._$AH !== O && ve(this._$AH) ? this._$AA.nextSibling.data = o : this.T(zt.createTextNode(o)), this._$AH = o;
  }
  $(o) {
    const { values: s, _$litType$: h } = o, l = typeof h == "number" ? this._$AC(o) : (h.el === void 0 && (h.el = ye.createElement(Eo(h.h, h.h[0]), this.options)), h);
    if (this._$AH?._$AD === l) this._$AH.p(s);
    else {
      const f = new ys(l, this), d = f.u(this.options);
      f.p(s), this.T(d), this._$AH = f;
    }
  }
  _$AC(o) {
    let s = po.get(o.strings);
    return s === void 0 && po.set(o.strings, s = new ye(o)), s;
  }
  k(o) {
    $i(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let h, l = 0;
    for (const f of o) l === s.length ? s.push(h = new be(this.O(ge()), this.O(ge()), this, this.options)) : h = s[l], h._$AI(f), l++;
    l < s.length && (this._$AR(h && h._$AB.nextSibling, l), s.length = l);
  }
  _$AR(o = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); o !== this._$AB; ) {
      const h = ao(o).nextSibling;
      ao(o).remove(), o = h;
    }
  }
  setConnected(o) {
    this._$AM === void 0 && (this._$Cv = o, this._$AP?.(o));
  }
}
class Ye {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(o, s, h, l, f) {
    this.type = 1, this._$AH = O, this._$AN = void 0, this.element = o, this.name = s, this._$AM = l, this.options = f, h.length > 2 || h[0] !== "" || h[1] !== "" ? (this._$AH = Array(h.length - 1).fill(new String()), this.strings = h) : this._$AH = O;
  }
  _$AI(o, s = this, h, l) {
    const f = this.strings;
    let d = !1;
    if (f === void 0) o = qt(this, o, s, 0), d = !ve(o) || o !== this._$AH && o !== Lt, d && (this._$AH = o);
    else {
      const m = o;
      let v, M;
      for (o = f[0], v = 0; v < f.length - 1; v++) M = qt(this, m[h + v], s, v), M === Lt && (M = this._$AH[v]), d ||= !ve(M) || M !== this._$AH[v], M === O ? o = O : o !== O && (o += (M ?? "") + f[v + 1]), this._$AH[v] = M;
    }
    d && !l && this.j(o);
  }
  j(o) {
    o === O ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, o ?? "");
  }
}
class bs extends Ye {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(o) {
    this.element[this.name] = o === O ? void 0 : o;
  }
}
let xs = class extends Ye {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(o) {
    this.element.toggleAttribute(this.name, !!o && o !== O);
  }
};
class ws extends Ye {
  constructor(o, s, h, l, f) {
    super(o, s, h, l, f), this.type = 5;
  }
  _$AI(o, s = this) {
    if ((o = qt(this, o, s, 0) ?? O) === Lt) return;
    const h = this._$AH, l = o === O && h !== O || o.capture !== h.capture || o.once !== h.once || o.passive !== h.passive, f = o !== O && (h === O || l);
    l && this.element.removeEventListener(this.name, this, h), f && this.element.addEventListener(this.name, this, o), this._$AH = o;
  }
  handleEvent(o) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, o) : this._$AH.handleEvent(o);
  }
}
class Ps {
  constructor(o, s, h) {
    this.element = o, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = h;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(o) {
    qt(this, o);
  }
}
const Ls = Bi.litHtmlPolyfillSupport;
Ls?.(ye, be), (Bi.litHtmlVersions ??= []).push("3.3.2");
const Ts = (u, o, s) => {
  const h = s?.renderBefore ?? o;
  let l = h._$litPart$;
  if (l === void 0) {
    const f = s?.renderBefore ?? null;
    h._$litPart$ = l = new be(o.insertBefore(ge(), f), f, void 0, s ?? {});
  }
  return l._$AI(u), l;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ni = globalThis;
let Ut = class extends Wt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const o = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= o.firstChild, o;
  }
  update(o) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(o), this._$Do = Ts(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Lt;
  }
};
Ut._$litElement$ = !0, Ut.finalized = !0, Ni.litElementHydrateSupport?.({ LitElement: Ut });
const As = Ni.litElementPolyfillSupport;
As?.({ LitElement: Ut });
(Ni.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ss = { attribute: !0, type: String, converter: Ue, reflect: !1, hasChanged: Ri }, ks = (u = Ss, o, s) => {
  const { kind: h, metadata: l } = s;
  let f = globalThis.litPropertyMetadata.get(l);
  if (f === void 0 && globalThis.litPropertyMetadata.set(l, f = /* @__PURE__ */ new Map()), h === "setter" && ((u = Object.create(u)).wrapped = !0), f.set(s.name, u), h === "accessor") {
    const { name: d } = s;
    return { set(m) {
      const v = o.get.call(this);
      o.set.call(this, m), this.requestUpdate(d, v, u, !0, m);
    }, init(m) {
      return m !== void 0 && this.C(d, void 0, u, m), m;
    } };
  }
  if (h === "setter") {
    const { name: d } = s;
    return function(m) {
      const v = this[d];
      o.call(this, m), this.requestUpdate(d, v, u, !0, m);
    };
  }
  throw Error("Unsupported decorator location: " + h);
};
function Di(u) {
  return (o, s) => typeof s == "object" ? ks(u, o, s) : ((h, l, f) => {
    const d = l.hasOwnProperty(f);
    return l.constructor.createProperty(f, h), d ? Object.getOwnPropertyDescriptor(l, f) : void 0;
  })(u, o, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ot(u) {
  return Di({ ...u, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Cs = (u, o, s) => (s.configurable = !0, s.enumerable = !0, Reflect.decorate && typeof o != "object" && Object.defineProperty(u, o, s), s);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Es(u, o) {
  return (s, h, l) => {
    const f = (d) => d.renderRoot?.querySelector(u) ?? null;
    return Cs(s, h, { get() {
      return f(this);
    } });
  };
}
var _o, mo;
(function(u) {
  u.language = "language", u.system = "system", u.comma_decimal = "comma_decimal", u.decimal_comma = "decimal_comma", u.space_comma = "space_comma", u.none = "none";
})(_o || (_o = {})), (function(u) {
  u.language = "language", u.system = "system", u.am_pm = "12", u.twenty_four = "24";
})(mo || (mo = {}));
function de(u) {
  return u !== void 0 && u.action !== "none";
}
const Ms = '.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::selection{background:transparent}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none!important;max-height:none!important}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none!important;max-height:none!important;width:auto;padding:0}.leaflet-container img.leaflet-tile{mix-blend-mode:plus-lighter}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity .2s linear;-moz-transition:opacity .2s linear;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}svg.leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-popup-pane,.leaflet-control{cursor:auto}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container{background:#ddd;outline-offset:1px}.leaflet-container a{color:#0078a8}.leaflet-zoom-box{border:2px dotted #38f;background:#ffffff80}.leaflet-container{font-family:Helvetica Neue,Arial,Helvetica,sans-serif;font-size:12px;font-size:.75rem;line-height:1.5}.leaflet-bar{box-shadow:0 1px 5px #000000a6;border-radius:4px}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:700 18px Lucida Console,Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-control-layers{box-shadow:0 1px 5px #0006;background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAQAAAADQ4RFAAACf0lEQVR4AY1UM3gkARTePdvdoTxXKc+qTl3aU5U6b2Kbkz3Gtq3Zw6ziLGNPzrYx7946Tr6/ee/XeCQ4D3ykPtL5tHno4n0d/h3+xfuWHGLX81cn7r0iTNzjr7LrlxCqPtkbTQEHeqOrTy4Yyt3VCi/IOB0v7rVC7q45Q3Gr5K6jt+3Gl5nCoDD4MtO+j96Wu8atmhGqcNGHObuf8OM/x3AMx38+4Z2sPqzCxRFK2aF2e5Jol56XTLyggAMTL56XOMoS1W4pOyjUcGGQdZxU6qRh7B9Zp+PfpOFlqt0zyDZckPi1ttmIp03jX8gyJ8a/PG2yutpS/Vol7peZIbZcKBAEEheEIAgFbDkz5H6Zrkm2hVWGiXKiF4Ycw0RWKdtC16Q7qe3X4iOMxruonzegJzWaXFrU9utOSsLUmrc0YjeWYjCW4PDMADElpJSSQ0vQvA1Tm6/JlKnqFs1EGyZiFCqnRZTEJJJiKRYzVYzJck2Rm6P4iH+cmSY0YzimYa8l0EtTODFWhcMIMVqdsI2uiTvKmTisIDHJ3od5GILVhBCarCfVRmo4uTjkhrhzkiBV7SsaqS+TzrzM1qpGGUFt28pIySQHR6h7F6KSwGWm97ay+Z+ZqMcEjEWebE7wxCSQwpkhJqoZA5ivCdZDjJepuJ9IQjGGUmuXJdBFUygxVqVsxFsLMbDe8ZbDYVCGKxs+W080max1hFCarCfV+C1KATwcnvE9gRRuMP2prdbWGowm1KB1y+zwMMENkM755cJ2yPDtqhTI6ED1M/82yIDtC/4j4BijjeObflpO9I9MwXTCsSX8jWAFeHr05WoLTJ5G8IQVS/7vwR6ohirYM7f6HzYpogfS3R2OAAAAAElFTkSuQmCC);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAQAAABvcdNgAAAEsklEQVR4AWL4TydIhpZK1kpWOlg0w3ZXP6D2soBtG42jeI6ZmQTHzAxiTbSJsYLjO9HhP+WOmcuhciVnmHVQcJnp7DFvScowZorad/+V/fVzMdMT2g9Cv9guXGv/7pYOrXh2U+RRR3dSd9JRx6bIFc/ekqHI29JC6pJ5ZEh1yWkhkbcFeSjxgx3L2m1cb1C7bceyxA+CNjT/Ifff+/kDk2u/w/33/IeCMOSaWZ4glosqT3DNnNZQ7Cs58/3Ce5HL78iZH/vKVIaYlqzfdLu8Vi7dnvUbEza5Idt36tquZFldl6N5Z/POLof0XLK61mZCmJSWjVF9tEjUluu74IUXvgttuVIHE7YxSkaYhJZam7yiM9Pv82JYfl9nptxZaxMJE4YSPty+vF0+Y2up9d3wwijfjZbabqm/3bZ9ecKHsiGmRflnn1MW4pjHf9oLufyn2z3y1D6n8g8TZhxyzipLNPnAUpsOiuWimg52psrTZYnOWYNDTMuWBWa0tJb4rgq1UvmutpaYEbZlwU3CLJm/ayYjHW5/h7xWLn9Hh1vepDkyf7dE7MtT5LR4e7yYpHrkhOUpEfssBLq2pPhAqoSWKUkk7EDqkmK6RrCEzqDjhNDWNE+XSMvkJRDWlZTmCW0l0PHQGRZY5t1L83kT0Y3l2SItk5JAWHl2dCOBm+fPu3fo5/3v61RMCO9Jx2EEYYhb0rmNQMX/vm7gqOEJLcXTGw3CAuRNeyaPWwjR8PRqKQ1PDA/dpv+on9Shox52WFnx0KY8onHayrJzm87i5h9xGw/tfkev0jGsQizqezUKjk12hBMKJ4kbCqGPVNXudyyrShovGw5CgxsRICxF6aRmSjlBnHRzg7Gx8fKqEubI2rahQYdR1YgDIRQO7JvQyD52hoIQx0mxa0ODtW2Iozn1le2iIRdzwWewedyZzewidueOGqlsn1MvcnQpuVwLGG3/IR1hIKxCjelIDZ8ldqWz25jWAsnldEnK0Zxro19TGVb2ffIZEsIO89EIEDvKMPrzmBOQcKQ+rroye6NgRRxqR4U8EAkz0CL6uSGOm6KQCdWjvjRiSP1BPalCRS5iQYiEIvxuBMJEWgzSoHADcVMuN7IuqqTeyUPq22qFimFtxDyBBJEwNyt6TM88blFHao/6tWWhuuOM4SAK4EI4QmFHA+SEyWlp4EQoJ13cYGzMu7yszEIBOm2rVmHUNqwAIQabISNMRstmdhNWcFLsSm+0tjJH1MdRxO5Nx0WDMhCtgD6OKgZeljJqJKc9po8juskR9XN0Y1lZ3mWjLR9JCO1jRDMd0fpYC2VnvjBSEFg7wBENc0R9HFlb0xvF1+TBEpF68d+DHR6IOWVv2BECtxo46hOFUBd/APU57WIoEwJhIi2CdpyZX0m93BZicktMj1AS9dClteUFAUNUIEygRZCtik5zSxI9MubTBH1GOiHsiLJ3OCoSZkILa9PxiN0EbvhsAo8tdAf9Seepd36lGWHmtNANTv5Jd0z4QYyeo/UEJqxKRpg5LZx6btLPsOaEmdMyxYdlc8LMaJnikDlhclqmPiQnTEpLUIZEwkRagjYkEibQErwhkTAKCLQEbUgkzJQWc/0PstHHcfEdQ+UAAAAASUVORK5CYII=);background-size:26px 26px}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative}.leaflet-control-layers-expanded{padding:6px 10px 6px 6px;color:#333;background:#fff}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px}.leaflet-control-layers label{display:block;font-size:13px;font-size:1.08333em}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px}.leaflet-default-icon-path{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=)}.leaflet-container .leaflet-control-attribution{background:#fff;background:#fffc;margin:0}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333;line-height:1.4}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline}.leaflet-attribution-flag{display:inline!important;vertical-align:baseline!important;width:1em;height:.6669em}.leaflet-left .leaflet-control-scale{margin-left:5px}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;white-space:nowrap;-moz-box-sizing:border-box;box-sizing:border-box;background:#fffc;text-shadow:1px 1px #fff}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{box-shadow:none}.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-content{margin:13px 24px 13px 20px;line-height:1.3;font-size:13px;font-size:1.08333em;min-height:1px}.leaflet-popup-content p{margin:1.3em 0}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-top:-1px;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;pointer-events:auto;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#fff;color:#333;box-shadow:0 3px 14px #0006}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;border:none;text-align:center;width:24px;height:24px;font:16px/24px Tahoma,Verdana,sans-serif;color:#757575;text-decoration:none;background:transparent}.leaflet-container a.leaflet-popup-close-button:hover,.leaflet-container a.leaflet-popup-close-button:focus{color:#585858}.leaflet-popup-scrolled{overflow:auto}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto;-ms-filter:"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)";filter:progid:DXImageTransform.Microsoft.Matrix(M11=.70710678,M12=.70710678,M21=-.70710678,M22=.70710678)}.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px #0006}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}@media print{.leaflet-control{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
function zs(u) {
  return u && u.__esModule && Object.prototype.hasOwnProperty.call(u, "default") ? u.default : u;
}
var pe = { exports: {} };
/* @preserve
 * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
var Os = pe.exports, go;
function Is() {
  return go || (go = 1, (function(u, o) {
    (function(s, h) {
      h(o);
    })(Os, (function(s) {
      var h = "1.9.4";
      function l(t) {
        var e, i, n, r;
        for (i = 1, n = arguments.length; i < n; i++) {
          r = arguments[i];
          for (e in r)
            t[e] = r[e];
        }
        return t;
      }
      var f = Object.create || /* @__PURE__ */ (function() {
        function t() {
        }
        return function(e) {
          return t.prototype = e, new t();
        };
      })();
      function d(t, e) {
        var i = Array.prototype.slice;
        if (t.bind)
          return t.bind.apply(t, i.call(arguments, 1));
        var n = i.call(arguments, 2);
        return function() {
          return t.apply(e, n.length ? n.concat(i.call(arguments)) : arguments);
        };
      }
      var m = 0;
      function v(t) {
        return "_leaflet_id" in t || (t._leaflet_id = ++m), t._leaflet_id;
      }
      function M(t, e, i) {
        var n, r, a, c;
        return c = function() {
          n = !1, r && (a.apply(i, r), r = !1);
        }, a = function() {
          n ? r = arguments : (t.apply(i, arguments), setTimeout(c, e), n = !0);
        }, a;
      }
      function z(t, e, i) {
        var n = e[1], r = e[0], a = n - r;
        return t === n && i ? t : ((t - r) % a + a) % a + r;
      }
      function x() {
        return !1;
      }
      function H(t, e) {
        if (e === !1)
          return t;
        var i = Math.pow(10, e === void 0 ? 6 : e);
        return Math.round(t * i) / i;
      }
      function Y(t) {
        return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
      }
      function K(t) {
        return Y(t).split(/\s+/);
      }
      function B(t, e) {
        Object.prototype.hasOwnProperty.call(t, "options") || (t.options = t.options ? f(t.options) : {});
        for (var i in e)
          t.options[i] = e[i];
        return t.options;
      }
      function Yt(t, e, i) {
        var n = [];
        for (var r in t)
          n.push(encodeURIComponent(i ? r.toUpperCase() : r) + "=" + encodeURIComponent(t[r]));
        return (!e || e.indexOf("?") === -1 ? "?" : "&") + n.join("&");
      }
      var Oo = /\{ *([\w_ -]+) *\}/g;
      function Hi(t, e) {
        return t.replace(Oo, function(i, n) {
          var r = e[n];
          if (r === void 0)
            throw new Error("No value provided for variable " + i);
          return typeof r == "function" && (r = r(e)), r;
        });
      }
      var st = Array.isArray || function(t) {
        return Object.prototype.toString.call(t) === "[object Array]";
      };
      function Ke(t, e) {
        for (var i = 0; i < t.length; i++)
          if (t[i] === e)
            return i;
        return -1;
      }
      var Pe = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
      function Je(t) {
        return window["webkit" + t] || window["moz" + t] || window["ms" + t];
      }
      var Fi = 0;
      function ji(t) {
        var e = +/* @__PURE__ */ new Date(), i = Math.max(0, 16 - (e - Fi));
        return Fi = e + i, window.setTimeout(t, i);
      }
      var Xe = window.requestAnimationFrame || Je("RequestAnimationFrame") || ji, Wi = window.cancelAnimationFrame || Je("CancelAnimationFrame") || Je("CancelRequestAnimationFrame") || function(t) {
        window.clearTimeout(t);
      };
      function J(t, e, i) {
        if (i && Xe === ji)
          t.call(e);
        else
          return Xe.call(window, d(t, e));
      }
      function it(t) {
        t && Wi.call(window, t);
      }
      var Io = {
        __proto__: null,
        extend: l,
        create: f,
        bind: d,
        get lastId() {
          return m;
        },
        stamp: v,
        throttle: M,
        wrapNum: z,
        falseFn: x,
        formatNum: H,
        trim: Y,
        splitWords: K,
        setOptions: B,
        getParamString: Yt,
        template: Hi,
        isArray: st,
        indexOf: Ke,
        emptyImageUrl: Pe,
        requestFn: Xe,
        cancelFn: Wi,
        requestAnimFrame: J,
        cancelAnimFrame: it
      };
      function ft() {
      }
      ft.extend = function(t) {
        var e = function() {
          B(this), this.initialize && this.initialize.apply(this, arguments), this.callInitHooks();
        }, i = e.__super__ = this.prototype, n = f(i);
        n.constructor = e, e.prototype = n;
        for (var r in this)
          Object.prototype.hasOwnProperty.call(this, r) && r !== "prototype" && r !== "__super__" && (e[r] = this[r]);
        return t.statics && l(e, t.statics), t.includes && (Zo(t.includes), l.apply(null, [n].concat(t.includes))), l(n, t), delete n.statics, delete n.includes, n.options && (n.options = i.options ? f(i.options) : {}, l(n.options, t.options)), n._initHooks = [], n.callInitHooks = function() {
          if (!this._initHooksCalled) {
            i.callInitHooks && i.callInitHooks.call(this), this._initHooksCalled = !0;
            for (var a = 0, c = n._initHooks.length; a < c; a++)
              n._initHooks[a].call(this);
          }
        }, e;
      }, ft.include = function(t) {
        var e = this.prototype.options;
        return l(this.prototype, t), t.options && (this.prototype.options = e, this.mergeOptions(t.options)), this;
      }, ft.mergeOptions = function(t) {
        return l(this.prototype.options, t), this;
      }, ft.addInitHook = function(t) {
        var e = Array.prototype.slice.call(arguments, 1), i = typeof t == "function" ? t : function() {
          this[t].apply(this, e);
        };
        return this.prototype._initHooks = this.prototype._initHooks || [], this.prototype._initHooks.push(i), this;
      };
      function Zo(t) {
        if (!(typeof L > "u" || !L || !L.Mixin)) {
          t = st(t) ? t : [t];
          for (var e = 0; e < t.length; e++)
            t[e] === L.Mixin.Events && console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.", new Error().stack);
        }
      }
      var et = {
        /* @method on(type: String, fn: Function, context?: Object): this
         * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
         *
         * @alternative
         * @method on(eventMap: Object): this
         * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
         */
        on: function(t, e, i) {
          if (typeof t == "object")
            for (var n in t)
              this._on(n, t[n], e);
          else {
            t = K(t);
            for (var r = 0, a = t.length; r < a; r++)
              this._on(t[r], e, i);
          }
          return this;
        },
        /* @method off(type: String, fn?: Function, context?: Object): this
         * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
         *
         * @alternative
         * @method off(eventMap: Object): this
         * Removes a set of type/listener pairs.
         *
         * @alternative
         * @method off: this
         * Removes all listeners to all events on the object. This includes implicitly attached events.
         */
        off: function(t, e, i) {
          if (!arguments.length)
            delete this._events;
          else if (typeof t == "object")
            for (var n in t)
              this._off(n, t[n], e);
          else {
            t = K(t);
            for (var r = arguments.length === 1, a = 0, c = t.length; a < c; a++)
              r ? this._off(t[a]) : this._off(t[a], e, i);
          }
          return this;
        },
        // attach listener (without syntactic sugar now)
        _on: function(t, e, i, n) {
          if (typeof e != "function") {
            console.warn("wrong listener type: " + typeof e);
            return;
          }
          if (this._listens(t, e, i) === !1) {
            i === this && (i = void 0);
            var r = { fn: e, ctx: i };
            n && (r.once = !0), this._events = this._events || {}, this._events[t] = this._events[t] || [], this._events[t].push(r);
          }
        },
        _off: function(t, e, i) {
          var n, r, a;
          if (this._events && (n = this._events[t], !!n)) {
            if (arguments.length === 1) {
              if (this._firingCount)
                for (r = 0, a = n.length; r < a; r++)
                  n[r].fn = x;
              delete this._events[t];
              return;
            }
            if (typeof e != "function") {
              console.warn("wrong listener type: " + typeof e);
              return;
            }
            var c = this._listens(t, e, i);
            if (c !== !1) {
              var p = n[c];
              this._firingCount && (p.fn = x, this._events[t] = n = n.slice()), n.splice(c, 1);
            }
          }
        },
        // @method fire(type: String, data?: Object, propagate?: Boolean): this
        // Fires an event of the specified type. You can optionally provide a data
        // object — the first argument of the listener function will contain its
        // properties. The event can optionally be propagated to event parents.
        fire: function(t, e, i) {
          if (!this.listens(t, i))
            return this;
          var n = l({}, e, {
            type: t,
            target: this,
            sourceTarget: e && e.sourceTarget || this
          });
          if (this._events) {
            var r = this._events[t];
            if (r) {
              this._firingCount = this._firingCount + 1 || 1;
              for (var a = 0, c = r.length; a < c; a++) {
                var p = r[a], _ = p.fn;
                p.once && this.off(t, _, p.ctx), _.call(p.ctx || this, n);
              }
              this._firingCount--;
            }
          }
          return i && this._propagateEvent(n), this;
        },
        // @method listens(type: String, propagate?: Boolean): Boolean
        // @method listens(type: String, fn: Function, context?: Object, propagate?: Boolean): Boolean
        // Returns `true` if a particular event type has any listeners attached to it.
        // The verification can optionally be propagated, it will return `true` if parents have the listener attached to it.
        listens: function(t, e, i, n) {
          typeof t != "string" && console.warn('"string" type argument expected');
          var r = e;
          typeof e != "function" && (n = !!e, r = void 0, i = void 0);
          var a = this._events && this._events[t];
          if (a && a.length && this._listens(t, r, i) !== !1)
            return !0;
          if (n) {
            for (var c in this._eventParents)
              if (this._eventParents[c].listens(t, e, i, n))
                return !0;
          }
          return !1;
        },
        // returns the index (number) or false
        _listens: function(t, e, i) {
          if (!this._events)
            return !1;
          var n = this._events[t] || [];
          if (!e)
            return !!n.length;
          i === this && (i = void 0);
          for (var r = 0, a = n.length; r < a; r++)
            if (n[r].fn === e && n[r].ctx === i)
              return r;
          return !1;
        },
        // @method once(…): this
        // Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
        once: function(t, e, i) {
          if (typeof t == "object")
            for (var n in t)
              this._on(n, t[n], e, !0);
          else {
            t = K(t);
            for (var r = 0, a = t.length; r < a; r++)
              this._on(t[r], e, i, !0);
          }
          return this;
        },
        // @method addEventParent(obj: Evented): this
        // Adds an event parent - an `Evented` that will receive propagated events
        addEventParent: function(t) {
          return this._eventParents = this._eventParents || {}, this._eventParents[v(t)] = t, this;
        },
        // @method removeEventParent(obj: Evented): this
        // Removes an event parent, so it will stop receiving propagated events
        removeEventParent: function(t) {
          return this._eventParents && delete this._eventParents[v(t)], this;
        },
        _propagateEvent: function(t) {
          for (var e in this._eventParents)
            this._eventParents[e].fire(t.type, l({
              layer: t.target,
              propagatedFrom: t.target
            }, t), !0);
        }
      };
      et.addEventListener = et.on, et.removeEventListener = et.clearAllEventListeners = et.off, et.addOneTimeEventListener = et.once, et.fireEvent = et.fire, et.hasEventListeners = et.listens;
      var Kt = ft.extend(et);
      function T(t, e, i) {
        this.x = i ? Math.round(t) : t, this.y = i ? Math.round(e) : e;
      }
      var Ui = Math.trunc || function(t) {
        return t > 0 ? Math.floor(t) : Math.ceil(t);
      };
      T.prototype = {
        // @method clone(): Point
        // Returns a copy of the current point.
        clone: function() {
          return new T(this.x, this.y);
        },
        // @method add(otherPoint: Point): Point
        // Returns the result of addition of the current and the given points.
        add: function(t) {
          return this.clone()._add(P(t));
        },
        _add: function(t) {
          return this.x += t.x, this.y += t.y, this;
        },
        // @method subtract(otherPoint: Point): Point
        // Returns the result of subtraction of the given point from the current.
        subtract: function(t) {
          return this.clone()._subtract(P(t));
        },
        _subtract: function(t) {
          return this.x -= t.x, this.y -= t.y, this;
        },
        // @method divideBy(num: Number): Point
        // Returns the result of division of the current point by the given number.
        divideBy: function(t) {
          return this.clone()._divideBy(t);
        },
        _divideBy: function(t) {
          return this.x /= t, this.y /= t, this;
        },
        // @method multiplyBy(num: Number): Point
        // Returns the result of multiplication of the current point by the given number.
        multiplyBy: function(t) {
          return this.clone()._multiplyBy(t);
        },
        _multiplyBy: function(t) {
          return this.x *= t, this.y *= t, this;
        },
        // @method scaleBy(scale: Point): Point
        // Multiply each coordinate of the current point by each coordinate of
        // `scale`. In linear algebra terms, multiply the point by the
        // [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
        // defined by `scale`.
        scaleBy: function(t) {
          return new T(this.x * t.x, this.y * t.y);
        },
        // @method unscaleBy(scale: Point): Point
        // Inverse of `scaleBy`. Divide each coordinate of the current point by
        // each coordinate of `scale`.
        unscaleBy: function(t) {
          return new T(this.x / t.x, this.y / t.y);
        },
        // @method round(): Point
        // Returns a copy of the current point with rounded coordinates.
        round: function() {
          return this.clone()._round();
        },
        _round: function() {
          return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
        },
        // @method floor(): Point
        // Returns a copy of the current point with floored coordinates (rounded down).
        floor: function() {
          return this.clone()._floor();
        },
        _floor: function() {
          return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
        },
        // @method ceil(): Point
        // Returns a copy of the current point with ceiled coordinates (rounded up).
        ceil: function() {
          return this.clone()._ceil();
        },
        _ceil: function() {
          return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
        },
        // @method trunc(): Point
        // Returns a copy of the current point with truncated coordinates (rounded towards zero).
        trunc: function() {
          return this.clone()._trunc();
        },
        _trunc: function() {
          return this.x = Ui(this.x), this.y = Ui(this.y), this;
        },
        // @method distanceTo(otherPoint: Point): Number
        // Returns the cartesian distance between the current and the given points.
        distanceTo: function(t) {
          t = P(t);
          var e = t.x - this.x, i = t.y - this.y;
          return Math.sqrt(e * e + i * i);
        },
        // @method equals(otherPoint: Point): Boolean
        // Returns `true` if the given point has the same coordinates.
        equals: function(t) {
          return t = P(t), t.x === this.x && t.y === this.y;
        },
        // @method contains(otherPoint: Point): Boolean
        // Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
        contains: function(t) {
          return t = P(t), Math.abs(t.x) <= Math.abs(this.x) && Math.abs(t.y) <= Math.abs(this.y);
        },
        // @method toString(): String
        // Returns a string representation of the point for debugging purposes.
        toString: function() {
          return "Point(" + H(this.x) + ", " + H(this.y) + ")";
        }
      };
      function P(t, e, i) {
        return t instanceof T ? t : st(t) ? new T(t[0], t[1]) : t == null ? t : typeof t == "object" && "x" in t && "y" in t ? new T(t.x, t.y) : new T(t, e, i);
      }
      function N(t, e) {
        if (t)
          for (var i = e ? [t, e] : t, n = 0, r = i.length; n < r; n++)
            this.extend(i[n]);
      }
      N.prototype = {
        // @method extend(point: Point): this
        // Extends the bounds to contain the given point.
        // @alternative
        // @method extend(otherBounds: Bounds): this
        // Extend the bounds to contain the given bounds
        extend: function(t) {
          var e, i;
          if (!t)
            return this;
          if (t instanceof T || typeof t[0] == "number" || "x" in t)
            e = i = P(t);
          else if (t = X(t), e = t.min, i = t.max, !e || !i)
            return this;
          return !this.min && !this.max ? (this.min = e.clone(), this.max = i.clone()) : (this.min.x = Math.min(e.x, this.min.x), this.max.x = Math.max(i.x, this.max.x), this.min.y = Math.min(e.y, this.min.y), this.max.y = Math.max(i.y, this.max.y)), this;
        },
        // @method getCenter(round?: Boolean): Point
        // Returns the center point of the bounds.
        getCenter: function(t) {
          return P(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            t
          );
        },
        // @method getBottomLeft(): Point
        // Returns the bottom-left point of the bounds.
        getBottomLeft: function() {
          return P(this.min.x, this.max.y);
        },
        // @method getTopRight(): Point
        // Returns the top-right point of the bounds.
        getTopRight: function() {
          return P(this.max.x, this.min.y);
        },
        // @method getTopLeft(): Point
        // Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
        getTopLeft: function() {
          return this.min;
        },
        // @method getBottomRight(): Point
        // Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
        getBottomRight: function() {
          return this.max;
        },
        // @method getSize(): Point
        // Returns the size of the given bounds
        getSize: function() {
          return this.max.subtract(this.min);
        },
        // @method contains(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle contains the given one.
        // @alternative
        // @method contains(point: Point): Boolean
        // Returns `true` if the rectangle contains the given point.
        contains: function(t) {
          var e, i;
          return typeof t[0] == "number" || t instanceof T ? t = P(t) : t = X(t), t instanceof N ? (e = t.min, i = t.max) : e = i = t, e.x >= this.min.x && i.x <= this.max.x && e.y >= this.min.y && i.y <= this.max.y;
        },
        // @method intersects(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle intersects the given bounds. Two bounds
        // intersect if they have at least one point in common.
        intersects: function(t) {
          t = X(t);
          var e = this.min, i = this.max, n = t.min, r = t.max, a = r.x >= e.x && n.x <= i.x, c = r.y >= e.y && n.y <= i.y;
          return a && c;
        },
        // @method overlaps(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle overlaps the given bounds. Two bounds
        // overlap if their intersection is an area.
        overlaps: function(t) {
          t = X(t);
          var e = this.min, i = this.max, n = t.min, r = t.max, a = r.x > e.x && n.x < i.x, c = r.y > e.y && n.y < i.y;
          return a && c;
        },
        // @method isValid(): Boolean
        // Returns `true` if the bounds are properly initialized.
        isValid: function() {
          return !!(this.min && this.max);
        },
        // @method pad(bufferRatio: Number): Bounds
        // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
        // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
        // Negative values will retract the bounds.
        pad: function(t) {
          var e = this.min, i = this.max, n = Math.abs(e.x - i.x) * t, r = Math.abs(e.y - i.y) * t;
          return X(
            P(e.x - n, e.y - r),
            P(i.x + n, i.y + r)
          );
        },
        // @method equals(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle is equivalent to the given bounds.
        equals: function(t) {
          return t ? (t = X(t), this.min.equals(t.getTopLeft()) && this.max.equals(t.getBottomRight())) : !1;
        }
      };
      function X(t, e) {
        return !t || t instanceof N ? t : new N(t, e);
      }
      function Q(t, e) {
        if (t)
          for (var i = e ? [t, e] : t, n = 0, r = i.length; n < r; n++)
            this.extend(i[n]);
      }
      Q.prototype = {
        // @method extend(latlng: LatLng): this
        // Extend the bounds to contain the given point
        // @alternative
        // @method extend(otherBounds: LatLngBounds): this
        // Extend the bounds to contain the given bounds
        extend: function(t) {
          var e = this._southWest, i = this._northEast, n, r;
          if (t instanceof R)
            n = t, r = t;
          else if (t instanceof Q) {
            if (n = t._southWest, r = t._northEast, !n || !r)
              return this;
          } else
            return t ? this.extend(C(t) || j(t)) : this;
          return !e && !i ? (this._southWest = new R(n.lat, n.lng), this._northEast = new R(r.lat, r.lng)) : (e.lat = Math.min(n.lat, e.lat), e.lng = Math.min(n.lng, e.lng), i.lat = Math.max(r.lat, i.lat), i.lng = Math.max(r.lng, i.lng)), this;
        },
        // @method pad(bufferRatio: Number): LatLngBounds
        // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
        // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
        // Negative values will retract the bounds.
        pad: function(t) {
          var e = this._southWest, i = this._northEast, n = Math.abs(e.lat - i.lat) * t, r = Math.abs(e.lng - i.lng) * t;
          return new Q(
            new R(e.lat - n, e.lng - r),
            new R(i.lat + n, i.lng + r)
          );
        },
        // @method getCenter(): LatLng
        // Returns the center point of the bounds.
        getCenter: function() {
          return new R(
            (this._southWest.lat + this._northEast.lat) / 2,
            (this._southWest.lng + this._northEast.lng) / 2
          );
        },
        // @method getSouthWest(): LatLng
        // Returns the south-west point of the bounds.
        getSouthWest: function() {
          return this._southWest;
        },
        // @method getNorthEast(): LatLng
        // Returns the north-east point of the bounds.
        getNorthEast: function() {
          return this._northEast;
        },
        // @method getNorthWest(): LatLng
        // Returns the north-west point of the bounds.
        getNorthWest: function() {
          return new R(this.getNorth(), this.getWest());
        },
        // @method getSouthEast(): LatLng
        // Returns the south-east point of the bounds.
        getSouthEast: function() {
          return new R(this.getSouth(), this.getEast());
        },
        // @method getWest(): Number
        // Returns the west longitude of the bounds
        getWest: function() {
          return this._southWest.lng;
        },
        // @method getSouth(): Number
        // Returns the south latitude of the bounds
        getSouth: function() {
          return this._southWest.lat;
        },
        // @method getEast(): Number
        // Returns the east longitude of the bounds
        getEast: function() {
          return this._northEast.lng;
        },
        // @method getNorth(): Number
        // Returns the north latitude of the bounds
        getNorth: function() {
          return this._northEast.lat;
        },
        // @method contains(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle contains the given one.
        // @alternative
        // @method contains (latlng: LatLng): Boolean
        // Returns `true` if the rectangle contains the given point.
        contains: function(t) {
          typeof t[0] == "number" || t instanceof R || "lat" in t ? t = C(t) : t = j(t);
          var e = this._southWest, i = this._northEast, n, r;
          return t instanceof Q ? (n = t.getSouthWest(), r = t.getNorthEast()) : n = r = t, n.lat >= e.lat && r.lat <= i.lat && n.lng >= e.lng && r.lng <= i.lng;
        },
        // @method intersects(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
        intersects: function(t) {
          t = j(t);
          var e = this._southWest, i = this._northEast, n = t.getSouthWest(), r = t.getNorthEast(), a = r.lat >= e.lat && n.lat <= i.lat, c = r.lng >= e.lng && n.lng <= i.lng;
          return a && c;
        },
        // @method overlaps(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
        overlaps: function(t) {
          t = j(t);
          var e = this._southWest, i = this._northEast, n = t.getSouthWest(), r = t.getNorthEast(), a = r.lat > e.lat && n.lat < i.lat, c = r.lng > e.lng && n.lng < i.lng;
          return a && c;
        },
        // @method toBBoxString(): String
        // Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
        toBBoxString: function() {
          return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(",");
        },
        // @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
        // Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
        equals: function(t, e) {
          return t ? (t = j(t), this._southWest.equals(t.getSouthWest(), e) && this._northEast.equals(t.getNorthEast(), e)) : !1;
        },
        // @method isValid(): Boolean
        // Returns `true` if the bounds are properly initialized.
        isValid: function() {
          return !!(this._southWest && this._northEast);
        }
      };
      function j(t, e) {
        return t instanceof Q ? t : new Q(t, e);
      }
      function R(t, e, i) {
        if (isNaN(t) || isNaN(e))
          throw new Error("Invalid LatLng object: (" + t + ", " + e + ")");
        this.lat = +t, this.lng = +e, i !== void 0 && (this.alt = +i);
      }
      R.prototype = {
        // @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
        // Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
        equals: function(t, e) {
          if (!t)
            return !1;
          t = C(t);
          var i = Math.max(
            Math.abs(this.lat - t.lat),
            Math.abs(this.lng - t.lng)
          );
          return i <= (e === void 0 ? 1e-9 : e);
        },
        // @method toString(): String
        // Returns a string representation of the point (for debugging purposes).
        toString: function(t) {
          return "LatLng(" + H(this.lat, t) + ", " + H(this.lng, t) + ")";
        },
        // @method distanceTo(otherLatLng: LatLng): Number
        // Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
        distanceTo: function(t) {
          return bt.distance(this, C(t));
        },
        // @method wrap(): LatLng
        // Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
        wrap: function() {
          return bt.wrapLatLng(this);
        },
        // @method toBounds(sizeInMeters: Number): LatLngBounds
        // Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
        toBounds: function(t) {
          var e = 180 * t / 40075017, i = e / Math.cos(Math.PI / 180 * this.lat);
          return j(
            [this.lat - e, this.lng - i],
            [this.lat + e, this.lng + i]
          );
        },
        clone: function() {
          return new R(this.lat, this.lng, this.alt);
        }
      };
      function C(t, e, i) {
        return t instanceof R ? t : st(t) && typeof t[0] != "object" ? t.length === 3 ? new R(t[0], t[1], t[2]) : t.length === 2 ? new R(t[0], t[1]) : null : t == null ? t : typeof t == "object" && "lat" in t ? new R(t.lat, "lng" in t ? t.lng : t.lon, t.alt) : e === void 0 ? null : new R(t, e, i);
      }
      var pt = {
        // @method latLngToPoint(latlng: LatLng, zoom: Number): Point
        // Projects geographical coordinates into pixel coordinates for a given zoom.
        latLngToPoint: function(t, e) {
          var i = this.projection.project(t), n = this.scale(e);
          return this.transformation._transform(i, n);
        },
        // @method pointToLatLng(point: Point, zoom: Number): LatLng
        // The inverse of `latLngToPoint`. Projects pixel coordinates on a given
        // zoom into geographical coordinates.
        pointToLatLng: function(t, e) {
          var i = this.scale(e), n = this.transformation.untransform(t, i);
          return this.projection.unproject(n);
        },
        // @method project(latlng: LatLng): Point
        // Projects geographical coordinates into coordinates in units accepted for
        // this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
        project: function(t) {
          return this.projection.project(t);
        },
        // @method unproject(point: Point): LatLng
        // Given a projected coordinate returns the corresponding LatLng.
        // The inverse of `project`.
        unproject: function(t) {
          return this.projection.unproject(t);
        },
        // @method scale(zoom: Number): Number
        // Returns the scale used when transforming projected coordinates into
        // pixel coordinates for a particular zoom. For example, it returns
        // `256 * 2^zoom` for Mercator-based CRS.
        scale: function(t) {
          return 256 * Math.pow(2, t);
        },
        // @method zoom(scale: Number): Number
        // Inverse of `scale()`, returns the zoom level corresponding to a scale
        // factor of `scale`.
        zoom: function(t) {
          return Math.log(t / 256) / Math.LN2;
        },
        // @method getProjectedBounds(zoom: Number): Bounds
        // Returns the projection's bounds scaled and transformed for the provided `zoom`.
        getProjectedBounds: function(t) {
          if (this.infinite)
            return null;
          var e = this.projection.bounds, i = this.scale(t), n = this.transformation.transform(e.min, i), r = this.transformation.transform(e.max, i);
          return new N(n, r);
        },
        // @method distance(latlng1: LatLng, latlng2: LatLng): Number
        // Returns the distance between two geographical coordinates.
        // @property code: String
        // Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
        //
        // @property wrapLng: Number[]
        // An array of two numbers defining whether the longitude (horizontal) coordinate
        // axis wraps around a given range and how. Defaults to `[-180, 180]` in most
        // geographical CRSs. If `undefined`, the longitude axis does not wrap around.
        //
        // @property wrapLat: Number[]
        // Like `wrapLng`, but for the latitude (vertical) axis.
        // wrapLng: [min, max],
        // wrapLat: [min, max],
        // @property infinite: Boolean
        // If true, the coordinate space will be unbounded (infinite in both axes)
        infinite: !1,
        // @method wrapLatLng(latlng: LatLng): LatLng
        // Returns a `LatLng` where lat and lng has been wrapped according to the
        // CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
        wrapLatLng: function(t) {
          var e = this.wrapLng ? z(t.lng, this.wrapLng, !0) : t.lng, i = this.wrapLat ? z(t.lat, this.wrapLat, !0) : t.lat, n = t.alt;
          return new R(i, e, n);
        },
        // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
        // Returns a `LatLngBounds` with the same size as the given one, ensuring
        // that its center is within the CRS's bounds.
        // Only accepts actual `L.LatLngBounds` instances, not arrays.
        wrapLatLngBounds: function(t) {
          var e = t.getCenter(), i = this.wrapLatLng(e), n = e.lat - i.lat, r = e.lng - i.lng;
          if (n === 0 && r === 0)
            return t;
          var a = t.getSouthWest(), c = t.getNorthEast(), p = new R(a.lat - n, a.lng - r), _ = new R(c.lat - n, c.lng - r);
          return new Q(p, _);
        }
      }, bt = l({}, pt, {
        wrapLng: [-180, 180],
        // Mean Earth Radius, as recommended for use by
        // the International Union of Geodesy and Geophysics,
        // see https://rosettacode.org/wiki/Haversine_formula
        R: 6371e3,
        // distance between two geographical points using spherical law of cosines approximation
        distance: function(t, e) {
          var i = Math.PI / 180, n = t.lat * i, r = e.lat * i, a = Math.sin((e.lat - t.lat) * i / 2), c = Math.sin((e.lng - t.lng) * i / 2), p = a * a + Math.cos(n) * Math.cos(r) * c * c, _ = 2 * Math.atan2(Math.sqrt(p), Math.sqrt(1 - p));
          return this.R * _;
        }
      }), Vi = 6378137, Qe = {
        R: Vi,
        MAX_LATITUDE: 85.0511287798,
        project: function(t) {
          var e = Math.PI / 180, i = this.MAX_LATITUDE, n = Math.max(Math.min(i, t.lat), -i), r = Math.sin(n * e);
          return new T(
            this.R * t.lng * e,
            this.R * Math.log((1 + r) / (1 - r)) / 2
          );
        },
        unproject: function(t) {
          var e = 180 / Math.PI;
          return new R(
            (2 * Math.atan(Math.exp(t.y / this.R)) - Math.PI / 2) * e,
            t.x * e / this.R
          );
        },
        bounds: (function() {
          var t = Vi * Math.PI;
          return new N([-t, -t], [t, t]);
        })()
      };
      function ti(t, e, i, n) {
        if (st(t)) {
          this._a = t[0], this._b = t[1], this._c = t[2], this._d = t[3];
          return;
        }
        this._a = t, this._b = e, this._c = i, this._d = n;
      }
      ti.prototype = {
        // @method transform(point: Point, scale?: Number): Point
        // Returns a transformed point, optionally multiplied by the given scale.
        // Only accepts actual `L.Point` instances, not arrays.
        transform: function(t, e) {
          return this._transform(t.clone(), e);
        },
        // destructive transform (faster)
        _transform: function(t, e) {
          return e = e || 1, t.x = e * (this._a * t.x + this._b), t.y = e * (this._c * t.y + this._d), t;
        },
        // @method untransform(point: Point, scale?: Number): Point
        // Returns the reverse transformation of the given point, optionally divided
        // by the given scale. Only accepts actual `L.Point` instances, not arrays.
        untransform: function(t, e) {
          return e = e || 1, new T(
            (t.x / e - this._b) / this._a,
            (t.y / e - this._d) / this._c
          );
        }
      };
      function Jt(t, e, i, n) {
        return new ti(t, e, i, n);
      }
      var ei = l({}, bt, {
        code: "EPSG:3857",
        projection: Qe,
        transformation: (function() {
          var t = 0.5 / (Math.PI * Qe.R);
          return Jt(t, 0.5, -t, 0.5);
        })()
      }), Ro = l({}, ei, {
        code: "EPSG:900913"
      });
      function qi(t) {
        return document.createElementNS("http://www.w3.org/2000/svg", t);
      }
      function Gi(t, e) {
        var i = "", n, r, a, c, p, _;
        for (n = 0, a = t.length; n < a; n++) {
          for (p = t[n], r = 0, c = p.length; r < c; r++)
            _ = p[r], i += (r ? "L" : "M") + _.x + " " + _.y;
          i += e ? b.svg ? "z" : "x" : "";
        }
        return i || "M0 0";
      }
      var ii = document.documentElement.style, Le = "ActiveXObject" in window, Bo = Le && !document.addEventListener, Yi = "msLaunchUri" in navigator && !("documentMode" in document), ni = ht("webkit"), Ki = ht("android"), Ji = ht("android 2") || ht("android 3"), $o = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10), No = Ki && ht("Google") && $o < 537 && !("AudioNode" in window), oi = !!window.opera, Xi = !Yi && ht("chrome"), Qi = ht("gecko") && !ni && !oi && !Le, Do = !Xi && ht("safari"), tn = ht("phantom"), en = "OTransition" in ii, Ho = navigator.platform.indexOf("Win") === 0, nn = Le && "transition" in ii, ri = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix() && !Ji, on = "MozPerspective" in ii, Fo = !window.L_DISABLE_3D && (nn || ri || on) && !en && !tn, Xt = typeof orientation < "u" || ht("mobile"), jo = Xt && ni, Wo = Xt && ri, rn = !window.PointerEvent && window.MSPointerEvent, sn = !!(window.PointerEvent || rn), an = "ontouchstart" in window || !!window.TouchEvent, Uo = !window.L_NO_TOUCH && (an || sn), Vo = Xt && oi, qo = Xt && Qi, Go = (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) > 1, Yo = (function() {
        var t = !1;
        try {
          var e = Object.defineProperty({}, "passive", {
            get: function() {
              t = !0;
            }
          });
          window.addEventListener("testPassiveEventSupport", x, e), window.removeEventListener("testPassiveEventSupport", x, e);
        } catch {
        }
        return t;
      })(), Ko = (function() {
        return !!document.createElement("canvas").getContext;
      })(), si = !!(document.createElementNS && qi("svg").createSVGRect), Jo = !!si && (function() {
        var t = document.createElement("div");
        return t.innerHTML = "<svg/>", (t.firstChild && t.firstChild.namespaceURI) === "http://www.w3.org/2000/svg";
      })(), Xo = !si && (function() {
        try {
          var t = document.createElement("div");
          t.innerHTML = '<v:shape adj="1"/>';
          var e = t.firstChild;
          return e.style.behavior = "url(#default#VML)", e && typeof e.adj == "object";
        } catch {
          return !1;
        }
      })(), Qo = navigator.platform.indexOf("Mac") === 0, tr = navigator.platform.indexOf("Linux") === 0;
      function ht(t) {
        return navigator.userAgent.toLowerCase().indexOf(t) >= 0;
      }
      var b = {
        ie: Le,
        ielt9: Bo,
        edge: Yi,
        webkit: ni,
        android: Ki,
        android23: Ji,
        androidStock: No,
        opera: oi,
        chrome: Xi,
        gecko: Qi,
        safari: Do,
        phantom: tn,
        opera12: en,
        win: Ho,
        ie3d: nn,
        webkit3d: ri,
        gecko3d: on,
        any3d: Fo,
        mobile: Xt,
        mobileWebkit: jo,
        mobileWebkit3d: Wo,
        msPointer: rn,
        pointer: sn,
        touch: Uo,
        touchNative: an,
        mobileOpera: Vo,
        mobileGecko: qo,
        retina: Go,
        passiveEvents: Yo,
        canvas: Ko,
        svg: si,
        vml: Xo,
        inlineSvg: Jo,
        mac: Qo,
        linux: tr
      }, ln = b.msPointer ? "MSPointerDown" : "pointerdown", hn = b.msPointer ? "MSPointerMove" : "pointermove", cn = b.msPointer ? "MSPointerUp" : "pointerup", un = b.msPointer ? "MSPointerCancel" : "pointercancel", ai = {
        touchstart: ln,
        touchmove: hn,
        touchend: cn,
        touchcancel: un
      }, dn = {
        touchstart: sr,
        touchmove: Te,
        touchend: Te,
        touchcancel: Te
      }, Zt = {}, fn = !1;
      function er(t, e, i) {
        return e === "touchstart" && rr(), dn[e] ? (i = dn[e].bind(this, i), t.addEventListener(ai[e], i, !1), i) : (console.warn("wrong event specified:", e), x);
      }
      function ir(t, e, i) {
        if (!ai[e]) {
          console.warn("wrong event specified:", e);
          return;
        }
        t.removeEventListener(ai[e], i, !1);
      }
      function nr(t) {
        Zt[t.pointerId] = t;
      }
      function or(t) {
        Zt[t.pointerId] && (Zt[t.pointerId] = t);
      }
      function pn(t) {
        delete Zt[t.pointerId];
      }
      function rr() {
        fn || (document.addEventListener(ln, nr, !0), document.addEventListener(hn, or, !0), document.addEventListener(cn, pn, !0), document.addEventListener(un, pn, !0), fn = !0);
      }
      function Te(t, e) {
        if (e.pointerType !== (e.MSPOINTER_TYPE_MOUSE || "mouse")) {
          e.touches = [];
          for (var i in Zt)
            e.touches.push(Zt[i]);
          e.changedTouches = [e], t(e);
        }
      }
      function sr(t, e) {
        e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH && q(e), Te(t, e);
      }
      function ar(t) {
        var e = {}, i, n;
        for (n in t)
          i = t[n], e[n] = i && i.bind ? i.bind(t) : i;
        return t = e, e.type = "dblclick", e.detail = 2, e.isTrusted = !1, e._simulated = !0, e;
      }
      var lr = 200;
      function hr(t, e) {
        t.addEventListener("dblclick", e);
        var i = 0, n;
        function r(a) {
          if (a.detail !== 1) {
            n = a.detail;
            return;
          }
          if (!(a.pointerType === "mouse" || a.sourceCapabilities && !a.sourceCapabilities.firesTouchEvents)) {
            var c = yn(a);
            if (!(c.some(function(_) {
              return _ instanceof HTMLLabelElement && _.attributes.for;
            }) && !c.some(function(_) {
              return _ instanceof HTMLInputElement || _ instanceof HTMLSelectElement;
            }))) {
              var p = Date.now();
              p - i <= lr ? (n++, n === 2 && e(ar(a))) : n = 1, i = p;
            }
          }
        }
        return t.addEventListener("click", r), {
          dblclick: e,
          simDblclick: r
        };
      }
      function cr(t, e) {
        t.removeEventListener("dblclick", e.dblclick), t.removeEventListener("click", e.simDblclick);
      }
      var li = ke(
        ["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]
      ), Qt = ke(
        ["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]
      ), _n = Qt === "webkitTransition" || Qt === "OTransition" ? Qt + "End" : "transitionend";
      function mn(t) {
        return typeof t == "string" ? document.getElementById(t) : t;
      }
      function te(t, e) {
        var i = t.style[e] || t.currentStyle && t.currentStyle[e];
        if ((!i || i === "auto") && document.defaultView) {
          var n = document.defaultView.getComputedStyle(t, null);
          i = n ? n[e] : null;
        }
        return i === "auto" ? null : i;
      }
      function I(t, e, i) {
        var n = document.createElement(t);
        return n.className = e || "", i && i.appendChild(n), n;
      }
      function D(t) {
        var e = t.parentNode;
        e && e.removeChild(t);
      }
      function Ae(t) {
        for (; t.firstChild; )
          t.removeChild(t.firstChild);
      }
      function Rt(t) {
        var e = t.parentNode;
        e && e.lastChild !== t && e.appendChild(t);
      }
      function Bt(t) {
        var e = t.parentNode;
        e && e.firstChild !== t && e.insertBefore(t, e.firstChild);
      }
      function hi(t, e) {
        if (t.classList !== void 0)
          return t.classList.contains(e);
        var i = Se(t);
        return i.length > 0 && new RegExp("(^|\\s)" + e + "(\\s|$)").test(i);
      }
      function S(t, e) {
        if (t.classList !== void 0)
          for (var i = K(e), n = 0, r = i.length; n < r; n++)
            t.classList.add(i[n]);
        else if (!hi(t, e)) {
          var a = Se(t);
          ci(t, (a ? a + " " : "") + e);
        }
      }
      function F(t, e) {
        t.classList !== void 0 ? t.classList.remove(e) : ci(t, Y((" " + Se(t) + " ").replace(" " + e + " ", " ")));
      }
      function ci(t, e) {
        t.className.baseVal === void 0 ? t.className = e : t.className.baseVal = e;
      }
      function Se(t) {
        return t.correspondingElement && (t = t.correspondingElement), t.className.baseVal === void 0 ? t.className : t.className.baseVal;
      }
      function nt(t, e) {
        "opacity" in t.style ? t.style.opacity = e : "filter" in t.style && ur(t, e);
      }
      function ur(t, e) {
        var i = !1, n = "DXImageTransform.Microsoft.Alpha";
        try {
          i = t.filters.item(n);
        } catch {
          if (e === 1)
            return;
        }
        e = Math.round(e * 100), i ? (i.Enabled = e !== 100, i.Opacity = e) : t.style.filter += " progid:" + n + "(opacity=" + e + ")";
      }
      function ke(t) {
        for (var e = document.documentElement.style, i = 0; i < t.length; i++)
          if (t[i] in e)
            return t[i];
        return !1;
      }
      function Tt(t, e, i) {
        var n = e || new T(0, 0);
        t.style[li] = (b.ie3d ? "translate(" + n.x + "px," + n.y + "px)" : "translate3d(" + n.x + "px," + n.y + "px,0)") + (i ? " scale(" + i + ")" : "");
      }
      function W(t, e) {
        t._leaflet_pos = e, b.any3d ? Tt(t, e) : (t.style.left = e.x + "px", t.style.top = e.y + "px");
      }
      function At(t) {
        return t._leaflet_pos || new T(0, 0);
      }
      var ee, ie, ui;
      if ("onselectstart" in document)
        ee = function() {
          A(window, "selectstart", q);
        }, ie = function() {
          $(window, "selectstart", q);
        };
      else {
        var ne = ke(
          ["userSelect", "WebkitUserSelect", "OUserSelect", "MozUserSelect", "msUserSelect"]
        );
        ee = function() {
          if (ne) {
            var t = document.documentElement.style;
            ui = t[ne], t[ne] = "none";
          }
        }, ie = function() {
          ne && (document.documentElement.style[ne] = ui, ui = void 0);
        };
      }
      function di() {
        A(window, "dragstart", q);
      }
      function fi() {
        $(window, "dragstart", q);
      }
      var Ce, pi;
      function _i(t) {
        for (; t.tabIndex === -1; )
          t = t.parentNode;
        t.style && (Ee(), Ce = t, pi = t.style.outlineStyle, t.style.outlineStyle = "none", A(window, "keydown", Ee));
      }
      function Ee() {
        Ce && (Ce.style.outlineStyle = pi, Ce = void 0, pi = void 0, $(window, "keydown", Ee));
      }
      function gn(t) {
        do
          t = t.parentNode;
        while ((!t.offsetWidth || !t.offsetHeight) && t !== document.body);
        return t;
      }
      function mi(t) {
        var e = t.getBoundingClientRect();
        return {
          x: e.width / t.offsetWidth || 1,
          y: e.height / t.offsetHeight || 1,
          boundingClientRect: e
        };
      }
      var dr = {
        __proto__: null,
        TRANSFORM: li,
        TRANSITION: Qt,
        TRANSITION_END: _n,
        get: mn,
        getStyle: te,
        create: I,
        remove: D,
        empty: Ae,
        toFront: Rt,
        toBack: Bt,
        hasClass: hi,
        addClass: S,
        removeClass: F,
        setClass: ci,
        getClass: Se,
        setOpacity: nt,
        testProp: ke,
        setTransform: Tt,
        setPosition: W,
        getPosition: At,
        get disableTextSelection() {
          return ee;
        },
        get enableTextSelection() {
          return ie;
        },
        disableImageDrag: di,
        enableImageDrag: fi,
        preventOutline: _i,
        restoreOutline: Ee,
        getSizedParentNode: gn,
        getScale: mi
      };
      function A(t, e, i, n) {
        if (e && typeof e == "object")
          for (var r in e)
            vi(t, r, e[r], i);
        else {
          e = K(e);
          for (var a = 0, c = e.length; a < c; a++)
            vi(t, e[a], i, n);
        }
        return this;
      }
      var ct = "_leaflet_events";
      function $(t, e, i, n) {
        if (arguments.length === 1)
          vn(t), delete t[ct];
        else if (e && typeof e == "object")
          for (var r in e)
            yi(t, r, e[r], i);
        else if (e = K(e), arguments.length === 2)
          vn(t, function(p) {
            return Ke(e, p) !== -1;
          });
        else
          for (var a = 0, c = e.length; a < c; a++)
            yi(t, e[a], i, n);
        return this;
      }
      function vn(t, e) {
        for (var i in t[ct]) {
          var n = i.split(/\d/)[0];
          (!e || e(n)) && yi(t, n, null, null, i);
        }
      }
      var gi = {
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        wheel: !("onwheel" in window) && "mousewheel"
      };
      function vi(t, e, i, n) {
        var r = e + v(i) + (n ? "_" + v(n) : "");
        if (t[ct] && t[ct][r])
          return this;
        var a = function(p) {
          return i.call(n || t, p || window.event);
        }, c = a;
        !b.touchNative && b.pointer && e.indexOf("touch") === 0 ? a = er(t, e, a) : b.touch && e === "dblclick" ? a = hr(t, a) : "addEventListener" in t ? e === "touchstart" || e === "touchmove" || e === "wheel" || e === "mousewheel" ? t.addEventListener(gi[e] || e, a, b.passiveEvents ? { passive: !1 } : !1) : e === "mouseenter" || e === "mouseleave" ? (a = function(p) {
          p = p || window.event, xi(t, p) && c(p);
        }, t.addEventListener(gi[e], a, !1)) : t.addEventListener(e, c, !1) : t.attachEvent("on" + e, a), t[ct] = t[ct] || {}, t[ct][r] = a;
      }
      function yi(t, e, i, n, r) {
        r = r || e + v(i) + (n ? "_" + v(n) : "");
        var a = t[ct] && t[ct][r];
        if (!a)
          return this;
        !b.touchNative && b.pointer && e.indexOf("touch") === 0 ? ir(t, e, a) : b.touch && e === "dblclick" ? cr(t, a) : "removeEventListener" in t ? t.removeEventListener(gi[e] || e, a, !1) : t.detachEvent("on" + e, a), t[ct][r] = null;
      }
      function St(t) {
        return t.stopPropagation ? t.stopPropagation() : t.originalEvent ? t.originalEvent._stopped = !0 : t.cancelBubble = !0, this;
      }
      function bi(t) {
        return vi(t, "wheel", St), this;
      }
      function oe(t) {
        return A(t, "mousedown touchstart dblclick contextmenu", St), t._leaflet_disable_click = !0, this;
      }
      function q(t) {
        return t.preventDefault ? t.preventDefault() : t.returnValue = !1, this;
      }
      function kt(t) {
        return q(t), St(t), this;
      }
      function yn(t) {
        if (t.composedPath)
          return t.composedPath();
        for (var e = [], i = t.target; i; )
          e.push(i), i = i.parentNode;
        return e;
      }
      function bn(t, e) {
        if (!e)
          return new T(t.clientX, t.clientY);
        var i = mi(e), n = i.boundingClientRect;
        return new T(
          // offset.left/top values are in page scale (like clientX/Y),
          // whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
          (t.clientX - n.left) / i.x - e.clientLeft,
          (t.clientY - n.top) / i.y - e.clientTop
        );
      }
      var fr = b.linux && b.chrome ? window.devicePixelRatio : b.mac ? window.devicePixelRatio * 3 : window.devicePixelRatio > 0 ? 2 * window.devicePixelRatio : 1;
      function xn(t) {
        return b.edge ? t.wheelDeltaY / 2 : (
          // Don't trust window-geometry-based delta
          t.deltaY && t.deltaMode === 0 ? -t.deltaY / fr : (
            // Pixels
            t.deltaY && t.deltaMode === 1 ? -t.deltaY * 20 : (
              // Lines
              t.deltaY && t.deltaMode === 2 ? -t.deltaY * 60 : (
                // Pages
                t.deltaX || t.deltaZ ? 0 : (
                  // Skip horizontal/depth wheel events
                  t.wheelDelta ? (t.wheelDeltaY || t.wheelDelta) / 2 : (
                    // Legacy IE pixels
                    t.detail && Math.abs(t.detail) < 32765 ? -t.detail * 20 : (
                      // Legacy Moz lines
                      t.detail ? t.detail / -32765 * 60 : (
                        // Legacy Moz pages
                        0
                      )
                    )
                  )
                )
              )
            )
          )
        );
      }
      function xi(t, e) {
        var i = e.relatedTarget;
        if (!i)
          return !0;
        try {
          for (; i && i !== t; )
            i = i.parentNode;
        } catch {
          return !1;
        }
        return i !== t;
      }
      var pr = {
        __proto__: null,
        on: A,
        off: $,
        stopPropagation: St,
        disableScrollPropagation: bi,
        disableClickPropagation: oe,
        preventDefault: q,
        stop: kt,
        getPropagationPath: yn,
        getMousePosition: bn,
        getWheelDelta: xn,
        isExternalTarget: xi,
        addListener: A,
        removeListener: $
      }, wn = Kt.extend({
        // @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
        // Run an animation of a given element to a new position, optionally setting
        // duration in seconds (`0.25` by default) and easing linearity factor (3rd
        // argument of the [cubic bezier curve](https://cubic-bezier.com/#0,0,.5,1),
        // `0.5` by default).
        run: function(t, e, i, n) {
          this.stop(), this._el = t, this._inProgress = !0, this._duration = i || 0.25, this._easeOutPower = 1 / Math.max(n || 0.5, 0.2), this._startPos = At(t), this._offset = e.subtract(this._startPos), this._startTime = +/* @__PURE__ */ new Date(), this.fire("start"), this._animate();
        },
        // @method stop()
        // Stops the animation (if currently running).
        stop: function() {
          this._inProgress && (this._step(!0), this._complete());
        },
        _animate: function() {
          this._animId = J(this._animate, this), this._step();
        },
        _step: function(t) {
          var e = +/* @__PURE__ */ new Date() - this._startTime, i = this._duration * 1e3;
          e < i ? this._runFrame(this._easeOut(e / i), t) : (this._runFrame(1), this._complete());
        },
        _runFrame: function(t, e) {
          var i = this._startPos.add(this._offset.multiplyBy(t));
          e && i._round(), W(this._el, i), this.fire("step");
        },
        _complete: function() {
          it(this._animId), this._inProgress = !1, this.fire("end");
        },
        _easeOut: function(t) {
          return 1 - Math.pow(1 - t, this._easeOutPower);
        }
      }), E = Kt.extend({
        options: {
          // @section Map State Options
          // @option crs: CRS = L.CRS.EPSG3857
          // The [Coordinate Reference System](#crs) to use. Don't change this if you're not
          // sure what it means.
          crs: ei,
          // @option center: LatLng = undefined
          // Initial geographic center of the map
          center: void 0,
          // @option zoom: Number = undefined
          // Initial map zoom level
          zoom: void 0,
          // @option minZoom: Number = *
          // Minimum zoom level of the map.
          // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
          // the lowest of their `minZoom` options will be used instead.
          minZoom: void 0,
          // @option maxZoom: Number = *
          // Maximum zoom level of the map.
          // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
          // the highest of their `maxZoom` options will be used instead.
          maxZoom: void 0,
          // @option layers: Layer[] = []
          // Array of layers that will be added to the map initially
          layers: [],
          // @option maxBounds: LatLngBounds = null
          // When this option is set, the map restricts the view to the given
          // geographical bounds, bouncing the user back if the user tries to pan
          // outside the view. To set the restriction dynamically, use
          // [`setMaxBounds`](#map-setmaxbounds) method.
          maxBounds: void 0,
          // @option renderer: Renderer = *
          // The default method for drawing vector layers on the map. `L.SVG`
          // or `L.Canvas` by default depending on browser support.
          renderer: void 0,
          // @section Animation Options
          // @option zoomAnimation: Boolean = true
          // Whether the map zoom animation is enabled. By default it's enabled
          // in all browsers that support CSS3 Transitions except Android.
          zoomAnimation: !0,
          // @option zoomAnimationThreshold: Number = 4
          // Won't animate zoom if the zoom difference exceeds this value.
          zoomAnimationThreshold: 4,
          // @option fadeAnimation: Boolean = true
          // Whether the tile fade animation is enabled. By default it's enabled
          // in all browsers that support CSS3 Transitions except Android.
          fadeAnimation: !0,
          // @option markerZoomAnimation: Boolean = true
          // Whether markers animate their zoom with the zoom animation, if disabled
          // they will disappear for the length of the animation. By default it's
          // enabled in all browsers that support CSS3 Transitions except Android.
          markerZoomAnimation: !0,
          // @option transform3DLimit: Number = 2^23
          // Defines the maximum size of a CSS translation transform. The default
          // value should not be changed unless a web browser positions layers in
          // the wrong place after doing a large `panBy`.
          transform3DLimit: 8388608,
          // Precision limit of a 32-bit float
          // @section Interaction Options
          // @option zoomSnap: Number = 1
          // Forces the map's zoom level to always be a multiple of this, particularly
          // right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
          // By default, the zoom level snaps to the nearest integer; lower values
          // (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
          // means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
          zoomSnap: 1,
          // @option zoomDelta: Number = 1
          // Controls how much the map's zoom level will change after a
          // [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
          // or `-` on the keyboard, or using the [zoom controls](#control-zoom).
          // Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
          zoomDelta: 1,
          // @option trackResize: Boolean = true
          // Whether the map automatically handles browser window resize to update itself.
          trackResize: !0
        },
        initialize: function(t, e) {
          e = B(this, e), this._handlers = [], this._layers = {}, this._zoomBoundLayers = {}, this._sizeChanged = !0, this._initContainer(t), this._initLayout(), this._onResize = d(this._onResize, this), this._initEvents(), e.maxBounds && this.setMaxBounds(e.maxBounds), e.zoom !== void 0 && (this._zoom = this._limitZoom(e.zoom)), e.center && e.zoom !== void 0 && this.setView(C(e.center), e.zoom, { reset: !0 }), this.callInitHooks(), this._zoomAnimated = Qt && b.any3d && !b.mobileOpera && this.options.zoomAnimation, this._zoomAnimated && (this._createAnimProxy(), A(this._proxy, _n, this._catchTransitionEnd, this)), this._addLayers(this.options.layers);
        },
        // @section Methods for modifying map state
        // @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
        // Sets the view of the map (geographical center and zoom) with the given
        // animation options.
        setView: function(t, e, i) {
          if (e = e === void 0 ? this._zoom : this._limitZoom(e), t = this._limitCenter(C(t), e, this.options.maxBounds), i = i || {}, this._stop(), this._loaded && !i.reset && i !== !0) {
            i.animate !== void 0 && (i.zoom = l({ animate: i.animate }, i.zoom), i.pan = l({ animate: i.animate, duration: i.duration }, i.pan));
            var n = this._zoom !== e ? this._tryAnimatedZoom && this._tryAnimatedZoom(t, e, i.zoom) : this._tryAnimatedPan(t, i.pan);
            if (n)
              return clearTimeout(this._sizeTimer), this;
          }
          return this._resetView(t, e, i.pan && i.pan.noMoveStart), this;
        },
        // @method setZoom(zoom: Number, options?: Zoom/pan options): this
        // Sets the zoom of the map.
        setZoom: function(t, e) {
          return this._loaded ? this.setView(this.getCenter(), t, { zoom: e }) : (this._zoom = t, this);
        },
        // @method zoomIn(delta?: Number, options?: Zoom options): this
        // Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
        zoomIn: function(t, e) {
          return t = t || (b.any3d ? this.options.zoomDelta : 1), this.setZoom(this._zoom + t, e);
        },
        // @method zoomOut(delta?: Number, options?: Zoom options): this
        // Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
        zoomOut: function(t, e) {
          return t = t || (b.any3d ? this.options.zoomDelta : 1), this.setZoom(this._zoom - t, e);
        },
        // @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
        // Zooms the map while keeping a specified geographical point on the map
        // stationary (e.g. used internally for scroll zoom and double-click zoom).
        // @alternative
        // @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
        // Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
        setZoomAround: function(t, e, i) {
          var n = this.getZoomScale(e), r = this.getSize().divideBy(2), a = t instanceof T ? t : this.latLngToContainerPoint(t), c = a.subtract(r).multiplyBy(1 - 1 / n), p = this.containerPointToLatLng(r.add(c));
          return this.setView(p, e, { zoom: i });
        },
        _getBoundsCenterZoom: function(t, e) {
          e = e || {}, t = t.getBounds ? t.getBounds() : j(t);
          var i = P(e.paddingTopLeft || e.padding || [0, 0]), n = P(e.paddingBottomRight || e.padding || [0, 0]), r = this.getBoundsZoom(t, !1, i.add(n));
          if (r = typeof e.maxZoom == "number" ? Math.min(e.maxZoom, r) : r, r === 1 / 0)
            return {
              center: t.getCenter(),
              zoom: r
            };
          var a = n.subtract(i).divideBy(2), c = this.project(t.getSouthWest(), r), p = this.project(t.getNorthEast(), r), _ = this.unproject(c.add(p).divideBy(2).add(a), r);
          return {
            center: _,
            zoom: r
          };
        },
        // @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets a map view that contains the given geographical bounds with the
        // maximum zoom level possible.
        fitBounds: function(t, e) {
          if (t = j(t), !t.isValid())
            throw new Error("Bounds are not valid.");
          var i = this._getBoundsCenterZoom(t, e);
          return this.setView(i.center, i.zoom, e);
        },
        // @method fitWorld(options?: fitBounds options): this
        // Sets a map view that mostly contains the whole world with the maximum
        // zoom level possible.
        fitWorld: function(t) {
          return this.fitBounds([[-90, -180], [90, 180]], t);
        },
        // @method panTo(latlng: LatLng, options?: Pan options): this
        // Pans the map to a given center.
        panTo: function(t, e) {
          return this.setView(t, this._zoom, { pan: e });
        },
        // @method panBy(offset: Point, options?: Pan options): this
        // Pans the map by a given number of pixels (animated).
        panBy: function(t, e) {
          if (t = P(t).round(), e = e || {}, !t.x && !t.y)
            return this.fire("moveend");
          if (e.animate !== !0 && !this.getSize().contains(t))
            return this._resetView(this.unproject(this.project(this.getCenter()).add(t)), this.getZoom()), this;
          if (this._panAnim || (this._panAnim = new wn(), this._panAnim.on({
            step: this._onPanTransitionStep,
            end: this._onPanTransitionEnd
          }, this)), e.noMoveStart || this.fire("movestart"), e.animate !== !1) {
            S(this._mapPane, "leaflet-pan-anim");
            var i = this._getMapPanePos().subtract(t).round();
            this._panAnim.run(this._mapPane, i, e.duration || 0.25, e.easeLinearity);
          } else
            this._rawPanBy(t), this.fire("move").fire("moveend");
          return this;
        },
        // @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
        // Sets the view of the map (geographical center and zoom) performing a smooth
        // pan-zoom animation.
        flyTo: function(t, e, i) {
          if (i = i || {}, i.animate === !1 || !b.any3d)
            return this.setView(t, e, i);
          this._stop();
          var n = this.project(this.getCenter()), r = this.project(t), a = this.getSize(), c = this._zoom;
          t = C(t), e = e === void 0 ? c : e;
          var p = Math.max(a.x, a.y), _ = p * this.getZoomScale(c, e), g = r.distanceTo(n) || 1, y = 1.42, w = y * y;
          function k(U) {
            var Fe = U ? -1 : 1, is = U ? _ : p, ns = _ * _ - p * p + Fe * w * w * g * g, os = 2 * is * w * g, zi = ns / os, io = Math.sqrt(zi * zi + 1) - zi, rs = io < 1e-9 ? -18 : Math.log(io);
            return rs;
          }
          function G(U) {
            return (Math.exp(U) - Math.exp(-U)) / 2;
          }
          function V(U) {
            return (Math.exp(U) + Math.exp(-U)) / 2;
          }
          function rt(U) {
            return G(U) / V(U);
          }
          var tt = k(0);
          function jt(U) {
            return p * (V(tt) / V(tt + y * U));
          }
          function Xr(U) {
            return p * (V(tt) * rt(tt + y * U) - G(tt)) / w;
          }
          function Qr(U) {
            return 1 - Math.pow(1 - U, 1.5);
          }
          var ts = Date.now(), to = (k(1) - tt) / y, es = i.duration ? 1e3 * i.duration : 1e3 * to * 0.8;
          function eo() {
            var U = (Date.now() - ts) / es, Fe = Qr(U) * to;
            U <= 1 ? (this._flyToFrame = J(eo, this), this._move(
              this.unproject(n.add(r.subtract(n).multiplyBy(Xr(Fe) / g)), c),
              this.getScaleZoom(p / jt(Fe), c),
              { flyTo: !0 }
            )) : this._move(t, e)._moveEnd(!0);
          }
          return this._moveStart(!0, i.noMoveStart), eo.call(this), this;
        },
        // @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
        // but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
        flyToBounds: function(t, e) {
          var i = this._getBoundsCenterZoom(t, e);
          return this.flyTo(i.center, i.zoom, e);
        },
        // @method setMaxBounds(bounds: LatLngBounds): this
        // Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
        setMaxBounds: function(t) {
          return t = j(t), this.listens("moveend", this._panInsideMaxBounds) && this.off("moveend", this._panInsideMaxBounds), t.isValid() ? (this.options.maxBounds = t, this._loaded && this._panInsideMaxBounds(), this.on("moveend", this._panInsideMaxBounds)) : (this.options.maxBounds = null, this);
        },
        // @method setMinZoom(zoom: Number): this
        // Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
        setMinZoom: function(t) {
          var e = this.options.minZoom;
          return this.options.minZoom = t, this._loaded && e !== t && (this.fire("zoomlevelschange"), this.getZoom() < this.options.minZoom) ? this.setZoom(t) : this;
        },
        // @method setMaxZoom(zoom: Number): this
        // Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
        setMaxZoom: function(t) {
          var e = this.options.maxZoom;
          return this.options.maxZoom = t, this._loaded && e !== t && (this.fire("zoomlevelschange"), this.getZoom() > this.options.maxZoom) ? this.setZoom(t) : this;
        },
        // @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
        // Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
        panInsideBounds: function(t, e) {
          this._enforcingBounds = !0;
          var i = this.getCenter(), n = this._limitCenter(i, this._zoom, j(t));
          return i.equals(n) || this.panTo(n, e), this._enforcingBounds = !1, this;
        },
        // @method panInside(latlng: LatLng, options?: padding options): this
        // Pans the map the minimum amount to make the `latlng` visible. Use
        // padding options to fit the display to more restricted bounds.
        // If `latlng` is already within the (optionally padded) display bounds,
        // the map will not be panned.
        panInside: function(t, e) {
          e = e || {};
          var i = P(e.paddingTopLeft || e.padding || [0, 0]), n = P(e.paddingBottomRight || e.padding || [0, 0]), r = this.project(this.getCenter()), a = this.project(t), c = this.getPixelBounds(), p = X([c.min.add(i), c.max.subtract(n)]), _ = p.getSize();
          if (!p.contains(a)) {
            this._enforcingBounds = !0;
            var g = a.subtract(p.getCenter()), y = p.extend(a).getSize().subtract(_);
            r.x += g.x < 0 ? -y.x : y.x, r.y += g.y < 0 ? -y.y : y.y, this.panTo(this.unproject(r), e), this._enforcingBounds = !1;
          }
          return this;
        },
        // @method invalidateSize(options: Zoom/pan options): this
        // Checks if the map container size changed and updates the map if so —
        // call it after you've changed the map size dynamically, also animating
        // pan by default. If `options.pan` is `false`, panning will not occur.
        // If `options.debounceMoveend` is `true`, it will delay `moveend` event so
        // that it doesn't happen often even if the method is called many
        // times in a row.
        // @alternative
        // @method invalidateSize(animate: Boolean): this
        // Checks if the map container size changed and updates the map if so —
        // call it after you've changed the map size dynamically, also animating
        // pan by default.
        invalidateSize: function(t) {
          if (!this._loaded)
            return this;
          t = l({
            animate: !1,
            pan: !0
          }, t === !0 ? { animate: !0 } : t);
          var e = this.getSize();
          this._sizeChanged = !0, this._lastCenter = null;
          var i = this.getSize(), n = e.divideBy(2).round(), r = i.divideBy(2).round(), a = n.subtract(r);
          return !a.x && !a.y ? this : (t.animate && t.pan ? this.panBy(a) : (t.pan && this._rawPanBy(a), this.fire("move"), t.debounceMoveend ? (clearTimeout(this._sizeTimer), this._sizeTimer = setTimeout(d(this.fire, this, "moveend"), 200)) : this.fire("moveend")), this.fire("resize", {
            oldSize: e,
            newSize: i
          }));
        },
        // @section Methods for modifying map state
        // @method stop(): this
        // Stops the currently running `panTo` or `flyTo` animation, if any.
        stop: function() {
          return this.setZoom(this._limitZoom(this._zoom)), this.options.zoomSnap || this.fire("viewreset"), this._stop();
        },
        // @section Geolocation methods
        // @method locate(options?: Locate options): this
        // Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
        // event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
        // and optionally sets the map view to the user's location with respect to
        // detection accuracy (or to the world view if geolocation failed).
        // Note that, if your page doesn't use HTTPS, this method will fail in
        // modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
        // See `Locate options` for more details.
        locate: function(t) {
          if (t = this._locateOptions = l({
            timeout: 1e4,
            watch: !1
            // setView: false
            // maxZoom: <Number>
            // maximumAge: 0
            // enableHighAccuracy: false
          }, t), !("geolocation" in navigator))
            return this._handleGeolocationError({
              code: 0,
              message: "Geolocation not supported."
            }), this;
          var e = d(this._handleGeolocationResponse, this), i = d(this._handleGeolocationError, this);
          return t.watch ? this._locationWatchId = navigator.geolocation.watchPosition(e, i, t) : navigator.geolocation.getCurrentPosition(e, i, t), this;
        },
        // @method stopLocate(): this
        // Stops watching location previously initiated by `map.locate({watch: true})`
        // and aborts resetting the map view if map.locate was called with
        // `{setView: true}`.
        stopLocate: function() {
          return navigator.geolocation && navigator.geolocation.clearWatch && navigator.geolocation.clearWatch(this._locationWatchId), this._locateOptions && (this._locateOptions.setView = !1), this;
        },
        _handleGeolocationError: function(t) {
          if (this._container._leaflet_id) {
            var e = t.code, i = t.message || (e === 1 ? "permission denied" : e === 2 ? "position unavailable" : "timeout");
            this._locateOptions.setView && !this._loaded && this.fitWorld(), this.fire("locationerror", {
              code: e,
              message: "Geolocation error: " + i + "."
            });
          }
        },
        _handleGeolocationResponse: function(t) {
          if (this._container._leaflet_id) {
            var e = t.coords.latitude, i = t.coords.longitude, n = new R(e, i), r = n.toBounds(t.coords.accuracy * 2), a = this._locateOptions;
            if (a.setView) {
              var c = this.getBoundsZoom(r);
              this.setView(n, a.maxZoom ? Math.min(c, a.maxZoom) : c);
            }
            var p = {
              latlng: n,
              bounds: r,
              timestamp: t.timestamp
            };
            for (var _ in t.coords)
              typeof t.coords[_] == "number" && (p[_] = t.coords[_]);
            this.fire("locationfound", p);
          }
        },
        // TODO Appropriate docs section?
        // @section Other Methods
        // @method addHandler(name: String, HandlerClass: Function): this
        // Adds a new `Handler` to the map, given its name and constructor function.
        addHandler: function(t, e) {
          if (!e)
            return this;
          var i = this[t] = new e(this);
          return this._handlers.push(i), this.options[t] && i.enable(), this;
        },
        // @method remove(): this
        // Destroys the map and clears all related event listeners.
        remove: function() {
          if (this._initEvents(!0), this.options.maxBounds && this.off("moveend", this._panInsideMaxBounds), this._containerId !== this._container._leaflet_id)
            throw new Error("Map container is being reused by another instance");
          try {
            delete this._container._leaflet_id, delete this._containerId;
          } catch {
            this._container._leaflet_id = void 0, this._containerId = void 0;
          }
          this._locationWatchId !== void 0 && this.stopLocate(), this._stop(), D(this._mapPane), this._clearControlPos && this._clearControlPos(), this._resizeRequest && (it(this._resizeRequest), this._resizeRequest = null), this._clearHandlers(), this._loaded && this.fire("unload");
          var t;
          for (t in this._layers)
            this._layers[t].remove();
          for (t in this._panes)
            D(this._panes[t]);
          return this._layers = [], this._panes = [], delete this._mapPane, delete this._renderer, this;
        },
        // @section Other Methods
        // @method createPane(name: String, container?: HTMLElement): HTMLElement
        // Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
        // then returns it. The pane is created as a child of `container`, or
        // as a child of the main map pane if not set.
        createPane: function(t, e) {
          var i = "leaflet-pane" + (t ? " leaflet-" + t.replace("Pane", "") + "-pane" : ""), n = I("div", i, e || this._mapPane);
          return t && (this._panes[t] = n), n;
        },
        // @section Methods for Getting Map State
        // @method getCenter(): LatLng
        // Returns the geographical center of the map view
        getCenter: function() {
          return this._checkIfLoaded(), this._lastCenter && !this._moved() ? this._lastCenter.clone() : this.layerPointToLatLng(this._getCenterLayerPoint());
        },
        // @method getZoom(): Number
        // Returns the current zoom level of the map view
        getZoom: function() {
          return this._zoom;
        },
        // @method getBounds(): LatLngBounds
        // Returns the geographical bounds visible in the current map view
        getBounds: function() {
          var t = this.getPixelBounds(), e = this.unproject(t.getBottomLeft()), i = this.unproject(t.getTopRight());
          return new Q(e, i);
        },
        // @method getMinZoom(): Number
        // Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
        getMinZoom: function() {
          return this.options.minZoom === void 0 ? this._layersMinZoom || 0 : this.options.minZoom;
        },
        // @method getMaxZoom(): Number
        // Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
        getMaxZoom: function() {
          return this.options.maxZoom === void 0 ? this._layersMaxZoom === void 0 ? 1 / 0 : this._layersMaxZoom : this.options.maxZoom;
        },
        // @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
        // Returns the maximum zoom level on which the given bounds fit to the map
        // view in its entirety. If `inside` (optional) is set to `true`, the method
        // instead returns the minimum zoom level on which the map view fits into
        // the given bounds in its entirety.
        getBoundsZoom: function(t, e, i) {
          t = j(t), i = P(i || [0, 0]);
          var n = this.getZoom() || 0, r = this.getMinZoom(), a = this.getMaxZoom(), c = t.getNorthWest(), p = t.getSouthEast(), _ = this.getSize().subtract(i), g = X(this.project(p, n), this.project(c, n)).getSize(), y = b.any3d ? this.options.zoomSnap : 1, w = _.x / g.x, k = _.y / g.y, G = e ? Math.max(w, k) : Math.min(w, k);
          return n = this.getScaleZoom(G, n), y && (n = Math.round(n / (y / 100)) * (y / 100), n = e ? Math.ceil(n / y) * y : Math.floor(n / y) * y), Math.max(r, Math.min(a, n));
        },
        // @method getSize(): Point
        // Returns the current size of the map container (in pixels).
        getSize: function() {
          return (!this._size || this._sizeChanged) && (this._size = new T(
            this._container.clientWidth || 0,
            this._container.clientHeight || 0
          ), this._sizeChanged = !1), this._size.clone();
        },
        // @method getPixelBounds(): Bounds
        // Returns the bounds of the current map view in projected pixel
        // coordinates (sometimes useful in layer and overlay implementations).
        getPixelBounds: function(t, e) {
          var i = this._getTopLeftPoint(t, e);
          return new N(i, i.add(this.getSize()));
        },
        // TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
        // the map pane? "left point of the map layer" can be confusing, specially
        // since there can be negative offsets.
        // @method getPixelOrigin(): Point
        // Returns the projected pixel coordinates of the top left point of
        // the map layer (useful in custom layer and overlay implementations).
        getPixelOrigin: function() {
          return this._checkIfLoaded(), this._pixelOrigin;
        },
        // @method getPixelWorldBounds(zoom?: Number): Bounds
        // Returns the world's bounds in pixel coordinates for zoom level `zoom`.
        // If `zoom` is omitted, the map's current zoom level is used.
        getPixelWorldBounds: function(t) {
          return this.options.crs.getProjectedBounds(t === void 0 ? this.getZoom() : t);
        },
        // @section Other Methods
        // @method getPane(pane: String|HTMLElement): HTMLElement
        // Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
        getPane: function(t) {
          return typeof t == "string" ? this._panes[t] : t;
        },
        // @method getPanes(): Object
        // Returns a plain object containing the names of all [panes](#map-pane) as keys and
        // the panes as values.
        getPanes: function() {
          return this._panes;
        },
        // @method getContainer: HTMLElement
        // Returns the HTML element that contains the map.
        getContainer: function() {
          return this._container;
        },
        // @section Conversion Methods
        // @method getZoomScale(toZoom: Number, fromZoom: Number): Number
        // Returns the scale factor to be applied to a map transition from zoom level
        // `fromZoom` to `toZoom`. Used internally to help with zoom animations.
        getZoomScale: function(t, e) {
          var i = this.options.crs;
          return e = e === void 0 ? this._zoom : e, i.scale(t) / i.scale(e);
        },
        // @method getScaleZoom(scale: Number, fromZoom: Number): Number
        // Returns the zoom level that the map would end up at, if it is at `fromZoom`
        // level and everything is scaled by a factor of `scale`. Inverse of
        // [`getZoomScale`](#map-getZoomScale).
        getScaleZoom: function(t, e) {
          var i = this.options.crs;
          e = e === void 0 ? this._zoom : e;
          var n = i.zoom(t * i.scale(e));
          return isNaN(n) ? 1 / 0 : n;
        },
        // @method project(latlng: LatLng, zoom: Number): Point
        // Projects a geographical coordinate `LatLng` according to the projection
        // of the map's CRS, then scales it according to `zoom` and the CRS's
        // `Transformation`. The result is pixel coordinate relative to
        // the CRS origin.
        project: function(t, e) {
          return e = e === void 0 ? this._zoom : e, this.options.crs.latLngToPoint(C(t), e);
        },
        // @method unproject(point: Point, zoom: Number): LatLng
        // Inverse of [`project`](#map-project).
        unproject: function(t, e) {
          return e = e === void 0 ? this._zoom : e, this.options.crs.pointToLatLng(P(t), e);
        },
        // @method layerPointToLatLng(point: Point): LatLng
        // Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
        // returns the corresponding geographical coordinate (for the current zoom level).
        layerPointToLatLng: function(t) {
          var e = P(t).add(this.getPixelOrigin());
          return this.unproject(e);
        },
        // @method latLngToLayerPoint(latlng: LatLng): Point
        // Given a geographical coordinate, returns the corresponding pixel coordinate
        // relative to the [origin pixel](#map-getpixelorigin).
        latLngToLayerPoint: function(t) {
          var e = this.project(C(t))._round();
          return e._subtract(this.getPixelOrigin());
        },
        // @method wrapLatLng(latlng: LatLng): LatLng
        // Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
        // map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
        // CRS's bounds.
        // By default this means longitude is wrapped around the dateline so its
        // value is between -180 and +180 degrees.
        wrapLatLng: function(t) {
          return this.options.crs.wrapLatLng(C(t));
        },
        // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
        // Returns a `LatLngBounds` with the same size as the given one, ensuring that
        // its center is within the CRS's bounds.
        // By default this means the center longitude is wrapped around the dateline so its
        // value is between -180 and +180 degrees, and the majority of the bounds
        // overlaps the CRS's bounds.
        wrapLatLngBounds: function(t) {
          return this.options.crs.wrapLatLngBounds(j(t));
        },
        // @method distance(latlng1: LatLng, latlng2: LatLng): Number
        // Returns the distance between two geographical coordinates according to
        // the map's CRS. By default this measures distance in meters.
        distance: function(t, e) {
          return this.options.crs.distance(C(t), C(e));
        },
        // @method containerPointToLayerPoint(point: Point): Point
        // Given a pixel coordinate relative to the map container, returns the corresponding
        // pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
        containerPointToLayerPoint: function(t) {
          return P(t).subtract(this._getMapPanePos());
        },
        // @method layerPointToContainerPoint(point: Point): Point
        // Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
        // returns the corresponding pixel coordinate relative to the map container.
        layerPointToContainerPoint: function(t) {
          return P(t).add(this._getMapPanePos());
        },
        // @method containerPointToLatLng(point: Point): LatLng
        // Given a pixel coordinate relative to the map container, returns
        // the corresponding geographical coordinate (for the current zoom level).
        containerPointToLatLng: function(t) {
          var e = this.containerPointToLayerPoint(P(t));
          return this.layerPointToLatLng(e);
        },
        // @method latLngToContainerPoint(latlng: LatLng): Point
        // Given a geographical coordinate, returns the corresponding pixel coordinate
        // relative to the map container.
        latLngToContainerPoint: function(t) {
          return this.layerPointToContainerPoint(this.latLngToLayerPoint(C(t)));
        },
        // @method mouseEventToContainerPoint(ev: MouseEvent): Point
        // Given a MouseEvent object, returns the pixel coordinate relative to the
        // map container where the event took place.
        mouseEventToContainerPoint: function(t) {
          return bn(t, this._container);
        },
        // @method mouseEventToLayerPoint(ev: MouseEvent): Point
        // Given a MouseEvent object, returns the pixel coordinate relative to
        // the [origin pixel](#map-getpixelorigin) where the event took place.
        mouseEventToLayerPoint: function(t) {
          return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t));
        },
        // @method mouseEventToLatLng(ev: MouseEvent): LatLng
        // Given a MouseEvent object, returns geographical coordinate where the
        // event took place.
        mouseEventToLatLng: function(t) {
          return this.layerPointToLatLng(this.mouseEventToLayerPoint(t));
        },
        // map initialization methods
        _initContainer: function(t) {
          var e = this._container = mn(t);
          if (e) {
            if (e._leaflet_id)
              throw new Error("Map container is already initialized.");
          } else throw new Error("Map container not found.");
          A(e, "scroll", this._onScroll, this), this._containerId = v(e);
        },
        _initLayout: function() {
          var t = this._container;
          this._fadeAnimated = this.options.fadeAnimation && b.any3d, S(t, "leaflet-container" + (b.touch ? " leaflet-touch" : "") + (b.retina ? " leaflet-retina" : "") + (b.ielt9 ? " leaflet-oldie" : "") + (b.safari ? " leaflet-safari" : "") + (this._fadeAnimated ? " leaflet-fade-anim" : ""));
          var e = te(t, "position");
          e !== "absolute" && e !== "relative" && e !== "fixed" && e !== "sticky" && (t.style.position = "relative"), this._initPanes(), this._initControlPos && this._initControlPos();
        },
        _initPanes: function() {
          var t = this._panes = {};
          this._paneRenderers = {}, this._mapPane = this.createPane("mapPane", this._container), W(this._mapPane, new T(0, 0)), this.createPane("tilePane"), this.createPane("overlayPane"), this.createPane("shadowPane"), this.createPane("markerPane"), this.createPane("tooltipPane"), this.createPane("popupPane"), this.options.markerZoomAnimation || (S(t.markerPane, "leaflet-zoom-hide"), S(t.shadowPane, "leaflet-zoom-hide"));
        },
        // private methods that modify map state
        // @section Map state change events
        _resetView: function(t, e, i) {
          W(this._mapPane, new T(0, 0));
          var n = !this._loaded;
          this._loaded = !0, e = this._limitZoom(e), this.fire("viewprereset");
          var r = this._zoom !== e;
          this._moveStart(r, i)._move(t, e)._moveEnd(r), this.fire("viewreset"), n && this.fire("load");
        },
        _moveStart: function(t, e) {
          return t && this.fire("zoomstart"), e || this.fire("movestart"), this;
        },
        _move: function(t, e, i, n) {
          e === void 0 && (e = this._zoom);
          var r = this._zoom !== e;
          return this._zoom = e, this._lastCenter = t, this._pixelOrigin = this._getNewPixelOrigin(t), n ? i && i.pinch && this.fire("zoom", i) : ((r || i && i.pinch) && this.fire("zoom", i), this.fire("move", i)), this;
        },
        _moveEnd: function(t) {
          return t && this.fire("zoomend"), this.fire("moveend");
        },
        _stop: function() {
          return it(this._flyToFrame), this._panAnim && this._panAnim.stop(), this;
        },
        _rawPanBy: function(t) {
          W(this._mapPane, this._getMapPanePos().subtract(t));
        },
        _getZoomSpan: function() {
          return this.getMaxZoom() - this.getMinZoom();
        },
        _panInsideMaxBounds: function() {
          this._enforcingBounds || this.panInsideBounds(this.options.maxBounds);
        },
        _checkIfLoaded: function() {
          if (!this._loaded)
            throw new Error("Set map center and zoom first.");
        },
        // DOM event handling
        // @section Interaction events
        _initEvents: function(t) {
          this._targets = {}, this._targets[v(this._container)] = this;
          var e = t ? $ : A;
          e(this._container, "click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup", this._handleDOMEvent, this), this.options.trackResize && e(window, "resize", this._onResize, this), b.any3d && this.options.transform3DLimit && (t ? this.off : this.on).call(this, "moveend", this._onMoveEnd);
        },
        _onResize: function() {
          it(this._resizeRequest), this._resizeRequest = J(
            function() {
              this.invalidateSize({ debounceMoveend: !0 });
            },
            this
          );
        },
        _onScroll: function() {
          this._container.scrollTop = 0, this._container.scrollLeft = 0;
        },
        _onMoveEnd: function() {
          var t = this._getMapPanePos();
          Math.max(Math.abs(t.x), Math.abs(t.y)) >= this.options.transform3DLimit && this._resetView(this.getCenter(), this.getZoom());
        },
        _findEventTargets: function(t, e) {
          for (var i = [], n, r = e === "mouseout" || e === "mouseover", a = t.target || t.srcElement, c = !1; a; ) {
            if (n = this._targets[v(a)], n && (e === "click" || e === "preclick") && this._draggableMoved(n)) {
              c = !0;
              break;
            }
            if (n && n.listens(e, !0) && (r && !xi(a, t) || (i.push(n), r)) || a === this._container)
              break;
            a = a.parentNode;
          }
          return !i.length && !c && !r && this.listens(e, !0) && (i = [this]), i;
        },
        _isClickDisabled: function(t) {
          for (; t && t !== this._container; ) {
            if (t._leaflet_disable_click)
              return !0;
            t = t.parentNode;
          }
        },
        _handleDOMEvent: function(t) {
          var e = t.target || t.srcElement;
          if (!(!this._loaded || e._leaflet_disable_events || t.type === "click" && this._isClickDisabled(e))) {
            var i = t.type;
            i === "mousedown" && _i(e), this._fireDOMEvent(t, i);
          }
        },
        _mouseEvents: ["click", "dblclick", "mouseover", "mouseout", "contextmenu"],
        _fireDOMEvent: function(t, e, i) {
          if (t.type === "click") {
            var n = l({}, t);
            n.type = "preclick", this._fireDOMEvent(n, n.type, i);
          }
          var r = this._findEventTargets(t, e);
          if (i) {
            for (var a = [], c = 0; c < i.length; c++)
              i[c].listens(e, !0) && a.push(i[c]);
            r = a.concat(r);
          }
          if (r.length) {
            e === "contextmenu" && q(t);
            var p = r[0], _ = {
              originalEvent: t
            };
            if (t.type !== "keypress" && t.type !== "keydown" && t.type !== "keyup") {
              var g = p.getLatLng && (!p._radius || p._radius <= 10);
              _.containerPoint = g ? this.latLngToContainerPoint(p.getLatLng()) : this.mouseEventToContainerPoint(t), _.layerPoint = this.containerPointToLayerPoint(_.containerPoint), _.latlng = g ? p.getLatLng() : this.layerPointToLatLng(_.layerPoint);
            }
            for (c = 0; c < r.length; c++)
              if (r[c].fire(e, _, !0), _.originalEvent._stopped || r[c].options.bubblingMouseEvents === !1 && Ke(this._mouseEvents, e) !== -1)
                return;
          }
        },
        _draggableMoved: function(t) {
          return t = t.dragging && t.dragging.enabled() ? t : this, t.dragging && t.dragging.moved() || this.boxZoom && this.boxZoom.moved();
        },
        _clearHandlers: function() {
          for (var t = 0, e = this._handlers.length; t < e; t++)
            this._handlers[t].disable();
        },
        // @section Other Methods
        // @method whenReady(fn: Function, context?: Object): this
        // Runs the given function `fn` when the map gets initialized with
        // a view (center and zoom) and at least one layer, or immediately
        // if it's already initialized, optionally passing a function context.
        whenReady: function(t, e) {
          return this._loaded ? t.call(e || this, { target: this }) : this.on("load", t, e), this;
        },
        // private methods for getting map state
        _getMapPanePos: function() {
          return At(this._mapPane) || new T(0, 0);
        },
        _moved: function() {
          var t = this._getMapPanePos();
          return t && !t.equals([0, 0]);
        },
        _getTopLeftPoint: function(t, e) {
          var i = t && e !== void 0 ? this._getNewPixelOrigin(t, e) : this.getPixelOrigin();
          return i.subtract(this._getMapPanePos());
        },
        _getNewPixelOrigin: function(t, e) {
          var i = this.getSize()._divideBy(2);
          return this.project(t, e)._subtract(i)._add(this._getMapPanePos())._round();
        },
        _latLngToNewLayerPoint: function(t, e, i) {
          var n = this._getNewPixelOrigin(i, e);
          return this.project(t, e)._subtract(n);
        },
        _latLngBoundsToNewLayerBounds: function(t, e, i) {
          var n = this._getNewPixelOrigin(i, e);
          return X([
            this.project(t.getSouthWest(), e)._subtract(n),
            this.project(t.getNorthWest(), e)._subtract(n),
            this.project(t.getSouthEast(), e)._subtract(n),
            this.project(t.getNorthEast(), e)._subtract(n)
          ]);
        },
        // layer point of the current center
        _getCenterLayerPoint: function() {
          return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
        },
        // offset of the specified place to the current center in pixels
        _getCenterOffset: function(t) {
          return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint());
        },
        // adjust center for view to get inside bounds
        _limitCenter: function(t, e, i) {
          if (!i)
            return t;
          var n = this.project(t, e), r = this.getSize().divideBy(2), a = new N(n.subtract(r), n.add(r)), c = this._getBoundsOffset(a, i, e);
          return Math.abs(c.x) <= 1 && Math.abs(c.y) <= 1 ? t : this.unproject(n.add(c), e);
        },
        // adjust offset for view to get inside bounds
        _limitOffset: function(t, e) {
          if (!e)
            return t;
          var i = this.getPixelBounds(), n = new N(i.min.add(t), i.max.add(t));
          return t.add(this._getBoundsOffset(n, e));
        },
        // returns offset needed for pxBounds to get inside maxBounds at a specified zoom
        _getBoundsOffset: function(t, e, i) {
          var n = X(
            this.project(e.getNorthEast(), i),
            this.project(e.getSouthWest(), i)
          ), r = n.min.subtract(t.min), a = n.max.subtract(t.max), c = this._rebound(r.x, -a.x), p = this._rebound(r.y, -a.y);
          return new T(c, p);
        },
        _rebound: function(t, e) {
          return t + e > 0 ? Math.round(t - e) / 2 : Math.max(0, Math.ceil(t)) - Math.max(0, Math.floor(e));
        },
        _limitZoom: function(t) {
          var e = this.getMinZoom(), i = this.getMaxZoom(), n = b.any3d ? this.options.zoomSnap : 1;
          return n && (t = Math.round(t / n) * n), Math.max(e, Math.min(i, t));
        },
        _onPanTransitionStep: function() {
          this.fire("move");
        },
        _onPanTransitionEnd: function() {
          F(this._mapPane, "leaflet-pan-anim"), this.fire("moveend");
        },
        _tryAnimatedPan: function(t, e) {
          var i = this._getCenterOffset(t)._trunc();
          return (e && e.animate) !== !0 && !this.getSize().contains(i) ? !1 : (this.panBy(i, e), !0);
        },
        _createAnimProxy: function() {
          var t = this._proxy = I("div", "leaflet-proxy leaflet-zoom-animated");
          this._panes.mapPane.appendChild(t), this.on("zoomanim", function(e) {
            var i = li, n = this._proxy.style[i];
            Tt(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1)), n === this._proxy.style[i] && this._animatingZoom && this._onZoomTransitionEnd();
          }, this), this.on("load moveend", this._animMoveEnd, this), this._on("unload", this._destroyAnimProxy, this);
        },
        _destroyAnimProxy: function() {
          D(this._proxy), this.off("load moveend", this._animMoveEnd, this), delete this._proxy;
        },
        _animMoveEnd: function() {
          var t = this.getCenter(), e = this.getZoom();
          Tt(this._proxy, this.project(t, e), this.getZoomScale(e, 1));
        },
        _catchTransitionEnd: function(t) {
          this._animatingZoom && t.propertyName.indexOf("transform") >= 0 && this._onZoomTransitionEnd();
        },
        _nothingToAnimate: function() {
          return !this._container.getElementsByClassName("leaflet-zoom-animated").length;
        },
        _tryAnimatedZoom: function(t, e, i) {
          if (this._animatingZoom)
            return !0;
          if (i = i || {}, !this._zoomAnimated || i.animate === !1 || this._nothingToAnimate() || Math.abs(e - this._zoom) > this.options.zoomAnimationThreshold)
            return !1;
          var n = this.getZoomScale(e), r = this._getCenterOffset(t)._divideBy(1 - 1 / n);
          return i.animate !== !0 && !this.getSize().contains(r) ? !1 : (J(function() {
            this._moveStart(!0, i.noMoveStart || !1)._animateZoom(t, e, !0);
          }, this), !0);
        },
        _animateZoom: function(t, e, i, n) {
          this._mapPane && (i && (this._animatingZoom = !0, this._animateToCenter = t, this._animateToZoom = e, S(this._mapPane, "leaflet-zoom-anim")), this.fire("zoomanim", {
            center: t,
            zoom: e,
            noUpdate: n
          }), this._tempFireZoomEvent || (this._tempFireZoomEvent = this._zoom !== this._animateToZoom), this._move(this._animateToCenter, this._animateToZoom, void 0, !0), setTimeout(d(this._onZoomTransitionEnd, this), 250));
        },
        _onZoomTransitionEnd: function() {
          this._animatingZoom && (this._mapPane && F(this._mapPane, "leaflet-zoom-anim"), this._animatingZoom = !1, this._move(this._animateToCenter, this._animateToZoom, void 0, !0), this._tempFireZoomEvent && this.fire("zoom"), delete this._tempFireZoomEvent, this.fire("move"), this._moveEnd(!0));
        }
      });
      function _r(t, e) {
        return new E(t, e);
      }
      var at = ft.extend({
        // @section
        // @aka Control Options
        options: {
          // @option position: String = 'topright'
          // The position of the control (one of the map corners). Possible values are `'topleft'`,
          // `'topright'`, `'bottomleft'` or `'bottomright'`
          position: "topright"
        },
        initialize: function(t) {
          B(this, t);
        },
        /* @section
         * Classes extending L.Control will inherit the following methods:
         *
         * @method getPosition: string
         * Returns the position of the control.
         */
        getPosition: function() {
          return this.options.position;
        },
        // @method setPosition(position: string): this
        // Sets the position of the control.
        setPosition: function(t) {
          var e = this._map;
          return e && e.removeControl(this), this.options.position = t, e && e.addControl(this), this;
        },
        // @method getContainer: HTMLElement
        // Returns the HTMLElement that contains the control.
        getContainer: function() {
          return this._container;
        },
        // @method addTo(map: Map): this
        // Adds the control to the given map.
        addTo: function(t) {
          this.remove(), this._map = t;
          var e = this._container = this.onAdd(t), i = this.getPosition(), n = t._controlCorners[i];
          return S(e, "leaflet-control"), i.indexOf("bottom") !== -1 ? n.insertBefore(e, n.firstChild) : n.appendChild(e), this._map.on("unload", this.remove, this), this;
        },
        // @method remove: this
        // Removes the control from the map it is currently active on.
        remove: function() {
          return this._map ? (D(this._container), this.onRemove && this.onRemove(this._map), this._map.off("unload", this.remove, this), this._map = null, this) : this;
        },
        _refocusOnMap: function(t) {
          this._map && t && t.screenX > 0 && t.screenY > 0 && this._map.getContainer().focus();
        }
      }), re = function(t) {
        return new at(t);
      };
      E.include({
        // @method addControl(control: Control): this
        // Adds the given control to the map
        addControl: function(t) {
          return t.addTo(this), this;
        },
        // @method removeControl(control: Control): this
        // Removes the given control from the map
        removeControl: function(t) {
          return t.remove(), this;
        },
        _initControlPos: function() {
          var t = this._controlCorners = {}, e = "leaflet-", i = this._controlContainer = I("div", e + "control-container", this._container);
          function n(r, a) {
            var c = e + r + " " + e + a;
            t[r + a] = I("div", c, i);
          }
          n("top", "left"), n("top", "right"), n("bottom", "left"), n("bottom", "right");
        },
        _clearControlPos: function() {
          for (var t in this._controlCorners)
            D(this._controlCorners[t]);
          D(this._controlContainer), delete this._controlCorners, delete this._controlContainer;
        }
      });
      var Pn = at.extend({
        // @section
        // @aka Control.Layers options
        options: {
          // @option collapsed: Boolean = true
          // If `true`, the control will be collapsed into an icon and expanded on mouse hover, touch, or keyboard activation.
          collapsed: !0,
          position: "topright",
          // @option autoZIndex: Boolean = true
          // If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
          autoZIndex: !0,
          // @option hideSingleBase: Boolean = false
          // If `true`, the base layers in the control will be hidden when there is only one.
          hideSingleBase: !1,
          // @option sortLayers: Boolean = false
          // Whether to sort the layers. When `false`, layers will keep the order
          // in which they were added to the control.
          sortLayers: !1,
          // @option sortFunction: Function = *
          // A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
          // that will be used for sorting the layers, when `sortLayers` is `true`.
          // The function receives both the `L.Layer` instances and their names, as in
          // `sortFunction(layerA, layerB, nameA, nameB)`.
          // By default, it sorts layers alphabetically by their name.
          sortFunction: function(t, e, i, n) {
            return i < n ? -1 : n < i ? 1 : 0;
          }
        },
        initialize: function(t, e, i) {
          B(this, i), this._layerControlInputs = [], this._layers = [], this._lastZIndex = 0, this._handlingClick = !1, this._preventClick = !1;
          for (var n in t)
            this._addLayer(t[n], n);
          for (n in e)
            this._addLayer(e[n], n, !0);
        },
        onAdd: function(t) {
          this._initLayout(), this._update(), this._map = t, t.on("zoomend", this._checkDisabledLayers, this);
          for (var e = 0; e < this._layers.length; e++)
            this._layers[e].layer.on("add remove", this._onLayerChange, this);
          return this._container;
        },
        addTo: function(t) {
          return at.prototype.addTo.call(this, t), this._expandIfNotCollapsed();
        },
        onRemove: function() {
          this._map.off("zoomend", this._checkDisabledLayers, this);
          for (var t = 0; t < this._layers.length; t++)
            this._layers[t].layer.off("add remove", this._onLayerChange, this);
        },
        // @method addBaseLayer(layer: Layer, name: String): this
        // Adds a base layer (radio button entry) with the given name to the control.
        addBaseLayer: function(t, e) {
          return this._addLayer(t, e), this._map ? this._update() : this;
        },
        // @method addOverlay(layer: Layer, name: String): this
        // Adds an overlay (checkbox entry) with the given name to the control.
        addOverlay: function(t, e) {
          return this._addLayer(t, e, !0), this._map ? this._update() : this;
        },
        // @method removeLayer(layer: Layer): this
        // Remove the given layer from the control.
        removeLayer: function(t) {
          t.off("add remove", this._onLayerChange, this);
          var e = this._getLayer(v(t));
          return e && this._layers.splice(this._layers.indexOf(e), 1), this._map ? this._update() : this;
        },
        // @method expand(): this
        // Expand the control container if collapsed.
        expand: function() {
          S(this._container, "leaflet-control-layers-expanded"), this._section.style.height = null;
          var t = this._map.getSize().y - (this._container.offsetTop + 50);
          return t < this._section.clientHeight ? (S(this._section, "leaflet-control-layers-scrollbar"), this._section.style.height = t + "px") : F(this._section, "leaflet-control-layers-scrollbar"), this._checkDisabledLayers(), this;
        },
        // @method collapse(): this
        // Collapse the control container if expanded.
        collapse: function() {
          return F(this._container, "leaflet-control-layers-expanded"), this;
        },
        _initLayout: function() {
          var t = "leaflet-control-layers", e = this._container = I("div", t), i = this.options.collapsed;
          e.setAttribute("aria-haspopup", !0), oe(e), bi(e);
          var n = this._section = I("section", t + "-list");
          i && (this._map.on("click", this.collapse, this), A(e, {
            mouseenter: this._expandSafely,
            mouseleave: this.collapse
          }, this));
          var r = this._layersLink = I("a", t + "-toggle", e);
          r.href = "#", r.title = "Layers", r.setAttribute("role", "button"), A(r, {
            keydown: function(a) {
              a.keyCode === 13 && this._expandSafely();
            },
            // Certain screen readers intercept the key event and instead send a click event
            click: function(a) {
              q(a), this._expandSafely();
            }
          }, this), i || this.expand(), this._baseLayersList = I("div", t + "-base", n), this._separator = I("div", t + "-separator", n), this._overlaysList = I("div", t + "-overlays", n), e.appendChild(n);
        },
        _getLayer: function(t) {
          for (var e = 0; e < this._layers.length; e++)
            if (this._layers[e] && v(this._layers[e].layer) === t)
              return this._layers[e];
        },
        _addLayer: function(t, e, i) {
          this._map && t.on("add remove", this._onLayerChange, this), this._layers.push({
            layer: t,
            name: e,
            overlay: i
          }), this.options.sortLayers && this._layers.sort(d(function(n, r) {
            return this.options.sortFunction(n.layer, r.layer, n.name, r.name);
          }, this)), this.options.autoZIndex && t.setZIndex && (this._lastZIndex++, t.setZIndex(this._lastZIndex)), this._expandIfNotCollapsed();
        },
        _update: function() {
          if (!this._container)
            return this;
          Ae(this._baseLayersList), Ae(this._overlaysList), this._layerControlInputs = [];
          var t, e, i, n, r = 0;
          for (i = 0; i < this._layers.length; i++)
            n = this._layers[i], this._addItem(n), e = e || n.overlay, t = t || !n.overlay, r += n.overlay ? 0 : 1;
          return this.options.hideSingleBase && (t = t && r > 1, this._baseLayersList.style.display = t ? "" : "none"), this._separator.style.display = e && t ? "" : "none", this;
        },
        _onLayerChange: function(t) {
          this._handlingClick || this._update();
          var e = this._getLayer(v(t.target)), i = e.overlay ? t.type === "add" ? "overlayadd" : "overlayremove" : t.type === "add" ? "baselayerchange" : null;
          i && this._map.fire(i, e);
        },
        // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see https://stackoverflow.com/a/119079)
        _createRadioElement: function(t, e) {
          var i = '<input type="radio" class="leaflet-control-layers-selector" name="' + t + '"' + (e ? ' checked="checked"' : "") + "/>", n = document.createElement("div");
          return n.innerHTML = i, n.firstChild;
        },
        _addItem: function(t) {
          var e = document.createElement("label"), i = this._map.hasLayer(t.layer), n;
          t.overlay ? (n = document.createElement("input"), n.type = "checkbox", n.className = "leaflet-control-layers-selector", n.defaultChecked = i) : n = this._createRadioElement("leaflet-base-layers_" + v(this), i), this._layerControlInputs.push(n), n.layerId = v(t.layer), A(n, "click", this._onInputClick, this);
          var r = document.createElement("span");
          r.innerHTML = " " + t.name;
          var a = document.createElement("span");
          e.appendChild(a), a.appendChild(n), a.appendChild(r);
          var c = t.overlay ? this._overlaysList : this._baseLayersList;
          return c.appendChild(e), this._checkDisabledLayers(), e;
        },
        _onInputClick: function() {
          if (!this._preventClick) {
            var t = this._layerControlInputs, e, i, n = [], r = [];
            this._handlingClick = !0;
            for (var a = t.length - 1; a >= 0; a--)
              e = t[a], i = this._getLayer(e.layerId).layer, e.checked ? n.push(i) : e.checked || r.push(i);
            for (a = 0; a < r.length; a++)
              this._map.hasLayer(r[a]) && this._map.removeLayer(r[a]);
            for (a = 0; a < n.length; a++)
              this._map.hasLayer(n[a]) || this._map.addLayer(n[a]);
            this._handlingClick = !1, this._refocusOnMap();
          }
        },
        _checkDisabledLayers: function() {
          for (var t = this._layerControlInputs, e, i, n = this._map.getZoom(), r = t.length - 1; r >= 0; r--)
            e = t[r], i = this._getLayer(e.layerId).layer, e.disabled = i.options.minZoom !== void 0 && n < i.options.minZoom || i.options.maxZoom !== void 0 && n > i.options.maxZoom;
        },
        _expandIfNotCollapsed: function() {
          return this._map && !this.options.collapsed && this.expand(), this;
        },
        _expandSafely: function() {
          var t = this._section;
          this._preventClick = !0, A(t, "click", q), this.expand();
          var e = this;
          setTimeout(function() {
            $(t, "click", q), e._preventClick = !1;
          });
        }
      }), mr = function(t, e, i) {
        return new Pn(t, e, i);
      }, wi = at.extend({
        // @section
        // @aka Control.Zoom options
        options: {
          position: "topleft",
          // @option zoomInText: String = '<span aria-hidden="true">+</span>'
          // The text set on the 'zoom in' button.
          zoomInText: '<span aria-hidden="true">+</span>',
          // @option zoomInTitle: String = 'Zoom in'
          // The title set on the 'zoom in' button.
          zoomInTitle: "Zoom in",
          // @option zoomOutText: String = '<span aria-hidden="true">&#x2212;</span>'
          // The text set on the 'zoom out' button.
          zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
          // @option zoomOutTitle: String = 'Zoom out'
          // The title set on the 'zoom out' button.
          zoomOutTitle: "Zoom out"
        },
        onAdd: function(t) {
          var e = "leaflet-control-zoom", i = I("div", e + " leaflet-bar"), n = this.options;
          return this._zoomInButton = this._createButton(
            n.zoomInText,
            n.zoomInTitle,
            e + "-in",
            i,
            this._zoomIn
          ), this._zoomOutButton = this._createButton(
            n.zoomOutText,
            n.zoomOutTitle,
            e + "-out",
            i,
            this._zoomOut
          ), this._updateDisabled(), t.on("zoomend zoomlevelschange", this._updateDisabled, this), i;
        },
        onRemove: function(t) {
          t.off("zoomend zoomlevelschange", this._updateDisabled, this);
        },
        disable: function() {
          return this._disabled = !0, this._updateDisabled(), this;
        },
        enable: function() {
          return this._disabled = !1, this._updateDisabled(), this;
        },
        _zoomIn: function(t) {
          !this._disabled && this._map._zoom < this._map.getMaxZoom() && this._map.zoomIn(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
        },
        _zoomOut: function(t) {
          !this._disabled && this._map._zoom > this._map.getMinZoom() && this._map.zoomOut(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
        },
        _createButton: function(t, e, i, n, r) {
          var a = I("a", i, n);
          return a.innerHTML = t, a.href = "#", a.title = e, a.setAttribute("role", "button"), a.setAttribute("aria-label", e), oe(a), A(a, "click", kt), A(a, "click", r, this), A(a, "click", this._refocusOnMap, this), a;
        },
        _updateDisabled: function() {
          var t = this._map, e = "leaflet-disabled";
          F(this._zoomInButton, e), F(this._zoomOutButton, e), this._zoomInButton.setAttribute("aria-disabled", "false"), this._zoomOutButton.setAttribute("aria-disabled", "false"), (this._disabled || t._zoom === t.getMinZoom()) && (S(this._zoomOutButton, e), this._zoomOutButton.setAttribute("aria-disabled", "true")), (this._disabled || t._zoom === t.getMaxZoom()) && (S(this._zoomInButton, e), this._zoomInButton.setAttribute("aria-disabled", "true"));
        }
      });
      E.mergeOptions({
        zoomControl: !0
      }), E.addInitHook(function() {
        this.options.zoomControl && (this.zoomControl = new wi(), this.addControl(this.zoomControl));
      });
      var gr = function(t) {
        return new wi(t);
      }, Ln = at.extend({
        // @section
        // @aka Control.Scale options
        options: {
          position: "bottomleft",
          // @option maxWidth: Number = 100
          // Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
          maxWidth: 100,
          // @option metric: Boolean = True
          // Whether to show the metric scale line (m/km).
          metric: !0,
          // @option imperial: Boolean = True
          // Whether to show the imperial scale line (mi/ft).
          imperial: !0
          // @option updateWhenIdle: Boolean = false
          // If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
        },
        onAdd: function(t) {
          var e = "leaflet-control-scale", i = I("div", e), n = this.options;
          return this._addScales(n, e + "-line", i), t.on(n.updateWhenIdle ? "moveend" : "move", this._update, this), t.whenReady(this._update, this), i;
        },
        onRemove: function(t) {
          t.off(this.options.updateWhenIdle ? "moveend" : "move", this._update, this);
        },
        _addScales: function(t, e, i) {
          t.metric && (this._mScale = I("div", e, i)), t.imperial && (this._iScale = I("div", e, i));
        },
        _update: function() {
          var t = this._map, e = t.getSize().y / 2, i = t.distance(
            t.containerPointToLatLng([0, e]),
            t.containerPointToLatLng([this.options.maxWidth, e])
          );
          this._updateScales(i);
        },
        _updateScales: function(t) {
          this.options.metric && t && this._updateMetric(t), this.options.imperial && t && this._updateImperial(t);
        },
        _updateMetric: function(t) {
          var e = this._getRoundNum(t), i = e < 1e3 ? e + " m" : e / 1e3 + " km";
          this._updateScale(this._mScale, i, e / t);
        },
        _updateImperial: function(t) {
          var e = t * 3.2808399, i, n, r;
          e > 5280 ? (i = e / 5280, n = this._getRoundNum(i), this._updateScale(this._iScale, n + " mi", n / i)) : (r = this._getRoundNum(e), this._updateScale(this._iScale, r + " ft", r / e));
        },
        _updateScale: function(t, e, i) {
          t.style.width = Math.round(this.options.maxWidth * i) + "px", t.innerHTML = e;
        },
        _getRoundNum: function(t) {
          var e = Math.pow(10, (Math.floor(t) + "").length - 1), i = t / e;
          return i = i >= 10 ? 10 : i >= 5 ? 5 : i >= 3 ? 3 : i >= 2 ? 2 : 1, e * i;
        }
      }), vr = function(t) {
        return new Ln(t);
      }, yr = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>', Pi = at.extend({
        // @section
        // @aka Control.Attribution options
        options: {
          position: "bottomright",
          // @option prefix: String|false = 'Leaflet'
          // The HTML text shown before the attributions. Pass `false` to disable.
          prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' + (b.inlineSvg ? yr + " " : "") + "Leaflet</a>"
        },
        initialize: function(t) {
          B(this, t), this._attributions = {};
        },
        onAdd: function(t) {
          t.attributionControl = this, this._container = I("div", "leaflet-control-attribution"), oe(this._container);
          for (var e in t._layers)
            t._layers[e].getAttribution && this.addAttribution(t._layers[e].getAttribution());
          return this._update(), t.on("layeradd", this._addAttribution, this), this._container;
        },
        onRemove: function(t) {
          t.off("layeradd", this._addAttribution, this);
        },
        _addAttribution: function(t) {
          t.layer.getAttribution && (this.addAttribution(t.layer.getAttribution()), t.layer.once("remove", function() {
            this.removeAttribution(t.layer.getAttribution());
          }, this));
        },
        // @method setPrefix(prefix: String|false): this
        // The HTML text shown before the attributions. Pass `false` to disable.
        setPrefix: function(t) {
          return this.options.prefix = t, this._update(), this;
        },
        // @method addAttribution(text: String): this
        // Adds an attribution text (e.g. `'&copy; OpenStreetMap contributors'`).
        addAttribution: function(t) {
          return t ? (this._attributions[t] || (this._attributions[t] = 0), this._attributions[t]++, this._update(), this) : this;
        },
        // @method removeAttribution(text: String): this
        // Removes an attribution text.
        removeAttribution: function(t) {
          return t ? (this._attributions[t] && (this._attributions[t]--, this._update()), this) : this;
        },
        _update: function() {
          if (this._map) {
            var t = [];
            for (var e in this._attributions)
              this._attributions[e] && t.push(e);
            var i = [];
            this.options.prefix && i.push(this.options.prefix), t.length && i.push(t.join(", ")), this._container.innerHTML = i.join(' <span aria-hidden="true">|</span> ');
          }
        }
      });
      E.mergeOptions({
        attributionControl: !0
      }), E.addInitHook(function() {
        this.options.attributionControl && new Pi().addTo(this);
      });
      var br = function(t) {
        return new Pi(t);
      };
      at.Layers = Pn, at.Zoom = wi, at.Scale = Ln, at.Attribution = Pi, re.layers = mr, re.zoom = gr, re.scale = vr, re.attribution = br;
      var ut = ft.extend({
        initialize: function(t) {
          this._map = t;
        },
        // @method enable(): this
        // Enables the handler
        enable: function() {
          return this._enabled ? this : (this._enabled = !0, this.addHooks(), this);
        },
        // @method disable(): this
        // Disables the handler
        disable: function() {
          return this._enabled ? (this._enabled = !1, this.removeHooks(), this) : this;
        },
        // @method enabled(): Boolean
        // Returns `true` if the handler is enabled
        enabled: function() {
          return !!this._enabled;
        }
        // @section Extension methods
        // Classes inheriting from `Handler` must implement the two following methods:
        // @method addHooks()
        // Called when the handler is enabled, should add event hooks.
        // @method removeHooks()
        // Called when the handler is disabled, should remove the event hooks added previously.
      });
      ut.addTo = function(t, e) {
        return t.addHandler(e, this), this;
      };
      var xr = { Events: et }, Tn = b.touch ? "touchstart mousedown" : "mousedown", xt = Kt.extend({
        options: {
          // @section
          // @aka Draggable options
          // @option clickTolerance: Number = 3
          // The max number of pixels a user can shift the mouse pointer during a click
          // for it to be considered a valid click (as opposed to a mouse drag).
          clickTolerance: 3
        },
        // @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
        // Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
        initialize: function(t, e, i, n) {
          B(this, n), this._element = t, this._dragStartTarget = e || t, this._preventOutline = i;
        },
        // @method enable()
        // Enables the dragging ability
        enable: function() {
          this._enabled || (A(this._dragStartTarget, Tn, this._onDown, this), this._enabled = !0);
        },
        // @method disable()
        // Disables the dragging ability
        disable: function() {
          this._enabled && (xt._dragging === this && this.finishDrag(!0), $(this._dragStartTarget, Tn, this._onDown, this), this._enabled = !1, this._moved = !1);
        },
        _onDown: function(t) {
          if (this._enabled && (this._moved = !1, !hi(this._element, "leaflet-zoom-anim"))) {
            if (t.touches && t.touches.length !== 1) {
              xt._dragging === this && this.finishDrag();
              return;
            }
            if (!(xt._dragging || t.shiftKey || t.which !== 1 && t.button !== 1 && !t.touches) && (xt._dragging = this, this._preventOutline && _i(this._element), di(), ee(), !this._moving)) {
              this.fire("down");
              var e = t.touches ? t.touches[0] : t, i = gn(this._element);
              this._startPoint = new T(e.clientX, e.clientY), this._startPos = At(this._element), this._parentScale = mi(i);
              var n = t.type === "mousedown";
              A(document, n ? "mousemove" : "touchmove", this._onMove, this), A(document, n ? "mouseup" : "touchend touchcancel", this._onUp, this);
            }
          }
        },
        _onMove: function(t) {
          if (this._enabled) {
            if (t.touches && t.touches.length > 1) {
              this._moved = !0;
              return;
            }
            var e = t.touches && t.touches.length === 1 ? t.touches[0] : t, i = new T(e.clientX, e.clientY)._subtract(this._startPoint);
            !i.x && !i.y || Math.abs(i.x) + Math.abs(i.y) < this.options.clickTolerance || (i.x /= this._parentScale.x, i.y /= this._parentScale.y, q(t), this._moved || (this.fire("dragstart"), this._moved = !0, S(document.body, "leaflet-dragging"), this._lastTarget = t.target || t.srcElement, window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance && (this._lastTarget = this._lastTarget.correspondingUseElement), S(this._lastTarget, "leaflet-drag-target")), this._newPos = this._startPos.add(i), this._moving = !0, this._lastEvent = t, this._updatePosition());
          }
        },
        _updatePosition: function() {
          var t = { originalEvent: this._lastEvent };
          this.fire("predrag", t), W(this._element, this._newPos), this.fire("drag", t);
        },
        _onUp: function() {
          this._enabled && this.finishDrag();
        },
        finishDrag: function(t) {
          F(document.body, "leaflet-dragging"), this._lastTarget && (F(this._lastTarget, "leaflet-drag-target"), this._lastTarget = null), $(document, "mousemove touchmove", this._onMove, this), $(document, "mouseup touchend touchcancel", this._onUp, this), fi(), ie();
          var e = this._moved && this._moving;
          this._moving = !1, xt._dragging = !1, e && this.fire("dragend", {
            noInertia: t,
            distance: this._newPos.distanceTo(this._startPos)
          });
        }
      });
      function An(t, e, i) {
        var n, r = [1, 4, 2, 8], a, c, p, _, g, y, w, k;
        for (a = 0, y = t.length; a < y; a++)
          t[a]._code = Ct(t[a], e);
        for (p = 0; p < 4; p++) {
          for (w = r[p], n = [], a = 0, y = t.length, c = y - 1; a < y; c = a++)
            _ = t[a], g = t[c], _._code & w ? g._code & w || (k = Me(g, _, w, e, i), k._code = Ct(k, e), n.push(k)) : (g._code & w && (k = Me(g, _, w, e, i), k._code = Ct(k, e), n.push(k)), n.push(_));
          t = n;
        }
        return t;
      }
      function Sn(t, e) {
        var i, n, r, a, c, p, _, g, y;
        if (!t || t.length === 0)
          throw new Error("latlngs not passed");
        ot(t) || (console.warn("latlngs are not flat! Only the first ring will be used"), t = t[0]);
        var w = C([0, 0]), k = j(t), G = k.getNorthWest().distanceTo(k.getSouthWest()) * k.getNorthEast().distanceTo(k.getNorthWest());
        G < 1700 && (w = Li(t));
        var V = t.length, rt = [];
        for (i = 0; i < V; i++) {
          var tt = C(t[i]);
          rt.push(e.project(C([tt.lat - w.lat, tt.lng - w.lng])));
        }
        for (p = _ = g = 0, i = 0, n = V - 1; i < V; n = i++)
          r = rt[i], a = rt[n], c = r.y * a.x - a.y * r.x, _ += (r.x + a.x) * c, g += (r.y + a.y) * c, p += c * 3;
        p === 0 ? y = rt[0] : y = [_ / p, g / p];
        var jt = e.unproject(P(y));
        return C([jt.lat + w.lat, jt.lng + w.lng]);
      }
      function Li(t) {
        for (var e = 0, i = 0, n = 0, r = 0; r < t.length; r++) {
          var a = C(t[r]);
          e += a.lat, i += a.lng, n++;
        }
        return C([e / n, i / n]);
      }
      var wr = {
        __proto__: null,
        clipPolygon: An,
        polygonCenter: Sn,
        centroid: Li
      };
      function kn(t, e) {
        if (!e || !t.length)
          return t.slice();
        var i = e * e;
        return t = Tr(t, i), t = Lr(t, i), t;
      }
      function Cn(t, e, i) {
        return Math.sqrt(se(t, e, i, !0));
      }
      function Pr(t, e, i) {
        return se(t, e, i);
      }
      function Lr(t, e) {
        var i = t.length, n = typeof Uint8Array < "u" ? Uint8Array : Array, r = new n(i);
        r[0] = r[i - 1] = 1, Ti(t, r, e, 0, i - 1);
        var a, c = [];
        for (a = 0; a < i; a++)
          r[a] && c.push(t[a]);
        return c;
      }
      function Ti(t, e, i, n, r) {
        var a = 0, c, p, _;
        for (p = n + 1; p <= r - 1; p++)
          _ = se(t[p], t[n], t[r], !0), _ > a && (c = p, a = _);
        a > i && (e[c] = 1, Ti(t, e, i, n, c), Ti(t, e, i, c, r));
      }
      function Tr(t, e) {
        for (var i = [t[0]], n = 1, r = 0, a = t.length; n < a; n++)
          Ar(t[n], t[r]) > e && (i.push(t[n]), r = n);
        return r < a - 1 && i.push(t[a - 1]), i;
      }
      var En;
      function Mn(t, e, i, n, r) {
        var a = n ? En : Ct(t, i), c = Ct(e, i), p, _, g;
        for (En = c; ; ) {
          if (!(a | c))
            return [t, e];
          if (a & c)
            return !1;
          p = a || c, _ = Me(t, e, p, i, r), g = Ct(_, i), p === a ? (t = _, a = g) : (e = _, c = g);
        }
      }
      function Me(t, e, i, n, r) {
        var a = e.x - t.x, c = e.y - t.y, p = n.min, _ = n.max, g, y;
        return i & 8 ? (g = t.x + a * (_.y - t.y) / c, y = _.y) : i & 4 ? (g = t.x + a * (p.y - t.y) / c, y = p.y) : i & 2 ? (g = _.x, y = t.y + c * (_.x - t.x) / a) : i & 1 && (g = p.x, y = t.y + c * (p.x - t.x) / a), new T(g, y, r);
      }
      function Ct(t, e) {
        var i = 0;
        return t.x < e.min.x ? i |= 1 : t.x > e.max.x && (i |= 2), t.y < e.min.y ? i |= 4 : t.y > e.max.y && (i |= 8), i;
      }
      function Ar(t, e) {
        var i = e.x - t.x, n = e.y - t.y;
        return i * i + n * n;
      }
      function se(t, e, i, n) {
        var r = e.x, a = e.y, c = i.x - r, p = i.y - a, _ = c * c + p * p, g;
        return _ > 0 && (g = ((t.x - r) * c + (t.y - a) * p) / _, g > 1 ? (r = i.x, a = i.y) : g > 0 && (r += c * g, a += p * g)), c = t.x - r, p = t.y - a, n ? c * c + p * p : new T(r, a);
      }
      function ot(t) {
        return !st(t[0]) || typeof t[0][0] != "object" && typeof t[0][0] < "u";
      }
      function zn(t) {
        return console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead."), ot(t);
      }
      function On(t, e) {
        var i, n, r, a, c, p, _, g;
        if (!t || t.length === 0)
          throw new Error("latlngs not passed");
        ot(t) || (console.warn("latlngs are not flat! Only the first ring will be used"), t = t[0]);
        var y = C([0, 0]), w = j(t), k = w.getNorthWest().distanceTo(w.getSouthWest()) * w.getNorthEast().distanceTo(w.getNorthWest());
        k < 1700 && (y = Li(t));
        var G = t.length, V = [];
        for (i = 0; i < G; i++) {
          var rt = C(t[i]);
          V.push(e.project(C([rt.lat - y.lat, rt.lng - y.lng])));
        }
        for (i = 0, n = 0; i < G - 1; i++)
          n += V[i].distanceTo(V[i + 1]) / 2;
        if (n === 0)
          g = V[0];
        else
          for (i = 0, a = 0; i < G - 1; i++)
            if (c = V[i], p = V[i + 1], r = c.distanceTo(p), a += r, a > n) {
              _ = (a - n) / r, g = [
                p.x - _ * (p.x - c.x),
                p.y - _ * (p.y - c.y)
              ];
              break;
            }
        var tt = e.unproject(P(g));
        return C([tt.lat + y.lat, tt.lng + y.lng]);
      }
      var Sr = {
        __proto__: null,
        simplify: kn,
        pointToSegmentDistance: Cn,
        closestPointOnSegment: Pr,
        clipSegment: Mn,
        _getEdgeIntersection: Me,
        _getBitCode: Ct,
        _sqClosestPointOnSegment: se,
        isFlat: ot,
        _flat: zn,
        polylineCenter: On
      }, Ai = {
        project: function(t) {
          return new T(t.lng, t.lat);
        },
        unproject: function(t) {
          return new R(t.y, t.x);
        },
        bounds: new N([-180, -90], [180, 90])
      }, Si = {
        R: 6378137,
        R_MINOR: 6356752314245179e-9,
        bounds: new N([-2003750834279e-5, -1549657073972e-5], [2003750834279e-5, 1876465623138e-5]),
        project: function(t) {
          var e = Math.PI / 180, i = this.R, n = t.lat * e, r = this.R_MINOR / i, a = Math.sqrt(1 - r * r), c = a * Math.sin(n), p = Math.tan(Math.PI / 4 - n / 2) / Math.pow((1 - c) / (1 + c), a / 2);
          return n = -i * Math.log(Math.max(p, 1e-10)), new T(t.lng * e * i, n);
        },
        unproject: function(t) {
          for (var e = 180 / Math.PI, i = this.R, n = this.R_MINOR / i, r = Math.sqrt(1 - n * n), a = Math.exp(-t.y / i), c = Math.PI / 2 - 2 * Math.atan(a), p = 0, _ = 0.1, g; p < 15 && Math.abs(_) > 1e-7; p++)
            g = r * Math.sin(c), g = Math.pow((1 - g) / (1 + g), r / 2), _ = Math.PI / 2 - 2 * Math.atan(a * g) - c, c += _;
          return new R(c * e, t.x * e / i);
        }
      }, kr = {
        __proto__: null,
        LonLat: Ai,
        Mercator: Si,
        SphericalMercator: Qe
      }, Cr = l({}, bt, {
        code: "EPSG:3395",
        projection: Si,
        transformation: (function() {
          var t = 0.5 / (Math.PI * Si.R);
          return Jt(t, 0.5, -t, 0.5);
        })()
      }), In = l({}, bt, {
        code: "EPSG:4326",
        projection: Ai,
        transformation: Jt(1 / 180, 1, -1 / 180, 0.5)
      }), Er = l({}, pt, {
        projection: Ai,
        transformation: Jt(1, 0, -1, 0),
        scale: function(t) {
          return Math.pow(2, t);
        },
        zoom: function(t) {
          return Math.log(t) / Math.LN2;
        },
        distance: function(t, e) {
          var i = e.lng - t.lng, n = e.lat - t.lat;
          return Math.sqrt(i * i + n * n);
        },
        infinite: !0
      });
      pt.Earth = bt, pt.EPSG3395 = Cr, pt.EPSG3857 = ei, pt.EPSG900913 = Ro, pt.EPSG4326 = In, pt.Simple = Er;
      var lt = Kt.extend({
        // Classes extending `L.Layer` will inherit the following options:
        options: {
          // @option pane: String = 'overlayPane'
          // By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
          pane: "overlayPane",
          // @option attribution: String = null
          // String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
          attribution: null,
          bubblingMouseEvents: !0
        },
        /* @section
         * Classes extending `L.Layer` will inherit the following methods:
         *
         * @method addTo(map: Map|LayerGroup): this
         * Adds the layer to the given map or layer group.
         */
        addTo: function(t) {
          return t.addLayer(this), this;
        },
        // @method remove: this
        // Removes the layer from the map it is currently active on.
        remove: function() {
          return this.removeFrom(this._map || this._mapToAdd);
        },
        // @method removeFrom(map: Map): this
        // Removes the layer from the given map
        //
        // @alternative
        // @method removeFrom(group: LayerGroup): this
        // Removes the layer from the given `LayerGroup`
        removeFrom: function(t) {
          return t && t.removeLayer(this), this;
        },
        // @method getPane(name? : String): HTMLElement
        // Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
        getPane: function(t) {
          return this._map.getPane(t ? this.options[t] || t : this.options.pane);
        },
        addInteractiveTarget: function(t) {
          return this._map._targets[v(t)] = this, this;
        },
        removeInteractiveTarget: function(t) {
          return delete this._map._targets[v(t)], this;
        },
        // @method getAttribution: String
        // Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
        getAttribution: function() {
          return this.options.attribution;
        },
        _layerAdd: function(t) {
          var e = t.target;
          if (e.hasLayer(this)) {
            if (this._map = e, this._zoomAnimated = e._zoomAnimated, this.getEvents) {
              var i = this.getEvents();
              e.on(i, this), this.once("remove", function() {
                e.off(i, this);
              }, this);
            }
            this.onAdd(e), this.fire("add"), e.fire("layeradd", { layer: this });
          }
        }
      });
      E.include({
        // @method addLayer(layer: Layer): this
        // Adds the given layer to the map
        addLayer: function(t) {
          if (!t._layerAdd)
            throw new Error("The provided object is not a Layer.");
          var e = v(t);
          return this._layers[e] ? this : (this._layers[e] = t, t._mapToAdd = this, t.beforeAdd && t.beforeAdd(this), this.whenReady(t._layerAdd, t), this);
        },
        // @method removeLayer(layer: Layer): this
        // Removes the given layer from the map.
        removeLayer: function(t) {
          var e = v(t);
          return this._layers[e] ? (this._loaded && t.onRemove(this), delete this._layers[e], this._loaded && (this.fire("layerremove", { layer: t }), t.fire("remove")), t._map = t._mapToAdd = null, this) : this;
        },
        // @method hasLayer(layer: Layer): Boolean
        // Returns `true` if the given layer is currently added to the map
        hasLayer: function(t) {
          return v(t) in this._layers;
        },
        /* @method eachLayer(fn: Function, context?: Object): this
         * Iterates over the layers of the map, optionally specifying context of the iterator function.
         * ```
         * map.eachLayer(function(layer){
         *     layer.bindPopup('Hello');
         * });
         * ```
         */
        eachLayer: function(t, e) {
          for (var i in this._layers)
            t.call(e, this._layers[i]);
          return this;
        },
        _addLayers: function(t) {
          t = t ? st(t) ? t : [t] : [];
          for (var e = 0, i = t.length; e < i; e++)
            this.addLayer(t[e]);
        },
        _addZoomLimit: function(t) {
          (!isNaN(t.options.maxZoom) || !isNaN(t.options.minZoom)) && (this._zoomBoundLayers[v(t)] = t, this._updateZoomLevels());
        },
        _removeZoomLimit: function(t) {
          var e = v(t);
          this._zoomBoundLayers[e] && (delete this._zoomBoundLayers[e], this._updateZoomLevels());
        },
        _updateZoomLevels: function() {
          var t = 1 / 0, e = -1 / 0, i = this._getZoomSpan();
          for (var n in this._zoomBoundLayers) {
            var r = this._zoomBoundLayers[n].options;
            t = r.minZoom === void 0 ? t : Math.min(t, r.minZoom), e = r.maxZoom === void 0 ? e : Math.max(e, r.maxZoom);
          }
          this._layersMaxZoom = e === -1 / 0 ? void 0 : e, this._layersMinZoom = t === 1 / 0 ? void 0 : t, i !== this._getZoomSpan() && this.fire("zoomlevelschange"), this.options.maxZoom === void 0 && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom && this.setZoom(this._layersMaxZoom), this.options.minZoom === void 0 && this._layersMinZoom && this.getZoom() < this._layersMinZoom && this.setZoom(this._layersMinZoom);
        }
      });
      var $t = lt.extend({
        initialize: function(t, e) {
          B(this, e), this._layers = {};
          var i, n;
          if (t)
            for (i = 0, n = t.length; i < n; i++)
              this.addLayer(t[i]);
        },
        // @method addLayer(layer: Layer): this
        // Adds the given layer to the group.
        addLayer: function(t) {
          var e = this.getLayerId(t);
          return this._layers[e] = t, this._map && this._map.addLayer(t), this;
        },
        // @method removeLayer(layer: Layer): this
        // Removes the given layer from the group.
        // @alternative
        // @method removeLayer(id: Number): this
        // Removes the layer with the given internal ID from the group.
        removeLayer: function(t) {
          var e = t in this._layers ? t : this.getLayerId(t);
          return this._map && this._layers[e] && this._map.removeLayer(this._layers[e]), delete this._layers[e], this;
        },
        // @method hasLayer(layer: Layer): Boolean
        // Returns `true` if the given layer is currently added to the group.
        // @alternative
        // @method hasLayer(id: Number): Boolean
        // Returns `true` if the given internal ID is currently added to the group.
        hasLayer: function(t) {
          var e = typeof t == "number" ? t : this.getLayerId(t);
          return e in this._layers;
        },
        // @method clearLayers(): this
        // Removes all the layers from the group.
        clearLayers: function() {
          return this.eachLayer(this.removeLayer, this);
        },
        // @method invoke(methodName: String, …): this
        // Calls `methodName` on every layer contained in this group, passing any
        // additional parameters. Has no effect if the layers contained do not
        // implement `methodName`.
        invoke: function(t) {
          var e = Array.prototype.slice.call(arguments, 1), i, n;
          for (i in this._layers)
            n = this._layers[i], n[t] && n[t].apply(n, e);
          return this;
        },
        onAdd: function(t) {
          this.eachLayer(t.addLayer, t);
        },
        onRemove: function(t) {
          this.eachLayer(t.removeLayer, t);
        },
        // @method eachLayer(fn: Function, context?: Object): this
        // Iterates over the layers of the group, optionally specifying context of the iterator function.
        // ```js
        // group.eachLayer(function (layer) {
        // 	layer.bindPopup('Hello');
        // });
        // ```
        eachLayer: function(t, e) {
          for (var i in this._layers)
            t.call(e, this._layers[i]);
          return this;
        },
        // @method getLayer(id: Number): Layer
        // Returns the layer with the given internal ID.
        getLayer: function(t) {
          return this._layers[t];
        },
        // @method getLayers(): Layer[]
        // Returns an array of all the layers added to the group.
        getLayers: function() {
          var t = [];
          return this.eachLayer(t.push, t), t;
        },
        // @method setZIndex(zIndex: Number): this
        // Calls `setZIndex` on every layer contained in this group, passing the z-index.
        setZIndex: function(t) {
          return this.invoke("setZIndex", t);
        },
        // @method getLayerId(layer: Layer): Number
        // Returns the internal ID for a layer
        getLayerId: function(t) {
          return v(t);
        }
      }), Mr = function(t, e) {
        return new $t(t, e);
      }, _t = $t.extend({
        addLayer: function(t) {
          return this.hasLayer(t) ? this : (t.addEventParent(this), $t.prototype.addLayer.call(this, t), this.fire("layeradd", { layer: t }));
        },
        removeLayer: function(t) {
          return this.hasLayer(t) ? (t in this._layers && (t = this._layers[t]), t.removeEventParent(this), $t.prototype.removeLayer.call(this, t), this.fire("layerremove", { layer: t })) : this;
        },
        // @method setStyle(style: Path options): this
        // Sets the given path options to each layer of the group that has a `setStyle` method.
        setStyle: function(t) {
          return this.invoke("setStyle", t);
        },
        // @method bringToFront(): this
        // Brings the layer group to the top of all other layers
        bringToFront: function() {
          return this.invoke("bringToFront");
        },
        // @method bringToBack(): this
        // Brings the layer group to the back of all other layers
        bringToBack: function() {
          return this.invoke("bringToBack");
        },
        // @method getBounds(): LatLngBounds
        // Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
        getBounds: function() {
          var t = new Q();
          for (var e in this._layers) {
            var i = this._layers[e];
            t.extend(i.getBounds ? i.getBounds() : i.getLatLng());
          }
          return t;
        }
      }), zr = function(t, e) {
        return new _t(t, e);
      }, Nt = ft.extend({
        /* @section
         * @aka Icon options
         *
         * @option iconUrl: String = null
         * **(required)** The URL to the icon image (absolute or relative to your script path).
         *
         * @option iconRetinaUrl: String = null
         * The URL to a retina sized version of the icon image (absolute or relative to your
         * script path). Used for Retina screen devices.
         *
         * @option iconSize: Point = null
         * Size of the icon image in pixels.
         *
         * @option iconAnchor: Point = null
         * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
         * will be aligned so that this point is at the marker's geographical location. Centered
         * by default if size is specified, also can be set in CSS with negative margins.
         *
         * @option popupAnchor: Point = [0, 0]
         * The coordinates of the point from which popups will "open", relative to the icon anchor.
         *
         * @option tooltipAnchor: Point = [0, 0]
         * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
         *
         * @option shadowUrl: String = null
         * The URL to the icon shadow image. If not specified, no shadow image will be created.
         *
         * @option shadowRetinaUrl: String = null
         *
         * @option shadowSize: Point = null
         * Size of the shadow image in pixels.
         *
         * @option shadowAnchor: Point = null
         * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
         * as iconAnchor if not specified).
         *
         * @option className: String = ''
         * A custom class name to assign to both icon and shadow images. Empty by default.
         */
        options: {
          popupAnchor: [0, 0],
          tooltipAnchor: [0, 0],
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the tiles.
          // If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: !1
        },
        initialize: function(t) {
          B(this, t);
        },
        // @method createIcon(oldIcon?: HTMLElement): HTMLElement
        // Called internally when the icon has to be shown, returns a `<img>` HTML element
        // styled according to the options.
        createIcon: function(t) {
          return this._createIcon("icon", t);
        },
        // @method createShadow(oldIcon?: HTMLElement): HTMLElement
        // As `createIcon`, but for the shadow beneath it.
        createShadow: function(t) {
          return this._createIcon("shadow", t);
        },
        _createIcon: function(t, e) {
          var i = this._getIconUrl(t);
          if (!i) {
            if (t === "icon")
              throw new Error("iconUrl not set in Icon options (see the docs).");
            return null;
          }
          var n = this._createImg(i, e && e.tagName === "IMG" ? e : null);
          return this._setIconStyles(n, t), (this.options.crossOrigin || this.options.crossOrigin === "") && (n.crossOrigin = this.options.crossOrigin === !0 ? "" : this.options.crossOrigin), n;
        },
        _setIconStyles: function(t, e) {
          var i = this.options, n = i[e + "Size"];
          typeof n == "number" && (n = [n, n]);
          var r = P(n), a = P(e === "shadow" && i.shadowAnchor || i.iconAnchor || r && r.divideBy(2, !0));
          t.className = "leaflet-marker-" + e + " " + (i.className || ""), a && (t.style.marginLeft = -a.x + "px", t.style.marginTop = -a.y + "px"), r && (t.style.width = r.x + "px", t.style.height = r.y + "px");
        },
        _createImg: function(t, e) {
          return e = e || document.createElement("img"), e.src = t, e;
        },
        _getIconUrl: function(t) {
          return b.retina && this.options[t + "RetinaUrl"] || this.options[t + "Url"];
        }
      });
      function Or(t) {
        return new Nt(t);
      }
      var ae = Nt.extend({
        options: {
          iconUrl: "marker-icon.png",
          iconRetinaUrl: "marker-icon-2x.png",
          shadowUrl: "marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        },
        _getIconUrl: function(t) {
          return typeof ae.imagePath != "string" && (ae.imagePath = this._detectIconPath()), (this.options.imagePath || ae.imagePath) + Nt.prototype._getIconUrl.call(this, t);
        },
        _stripUrl: function(t) {
          var e = function(i, n, r) {
            var a = n.exec(i);
            return a && a[r];
          };
          return t = e(t, /^url\((['"])?(.+)\1\)$/, 2), t && e(t, /^(.*)marker-icon\.png$/, 1);
        },
        _detectIconPath: function() {
          var t = I("div", "leaflet-default-icon-path", document.body), e = te(t, "background-image") || te(t, "backgroundImage");
          if (document.body.removeChild(t), e = this._stripUrl(e), e)
            return e;
          var i = document.querySelector('link[href$="leaflet.css"]');
          return i ? i.href.substring(0, i.href.length - 11 - 1) : "";
        }
      }), Zn = ut.extend({
        initialize: function(t) {
          this._marker = t;
        },
        addHooks: function() {
          var t = this._marker._icon;
          this._draggable || (this._draggable = new xt(t, t, !0)), this._draggable.on({
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd
          }, this).enable(), S(t, "leaflet-marker-draggable");
        },
        removeHooks: function() {
          this._draggable.off({
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd
          }, this).disable(), this._marker._icon && F(this._marker._icon, "leaflet-marker-draggable");
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        _adjustPan: function(t) {
          var e = this._marker, i = e._map, n = this._marker.options.autoPanSpeed, r = this._marker.options.autoPanPadding, a = At(e._icon), c = i.getPixelBounds(), p = i.getPixelOrigin(), _ = X(
            c.min._subtract(p).add(r),
            c.max._subtract(p).subtract(r)
          );
          if (!_.contains(a)) {
            var g = P(
              (Math.max(_.max.x, a.x) - _.max.x) / (c.max.x - _.max.x) - (Math.min(_.min.x, a.x) - _.min.x) / (c.min.x - _.min.x),
              (Math.max(_.max.y, a.y) - _.max.y) / (c.max.y - _.max.y) - (Math.min(_.min.y, a.y) - _.min.y) / (c.min.y - _.min.y)
            ).multiplyBy(n);
            i.panBy(g, { animate: !1 }), this._draggable._newPos._add(g), this._draggable._startPos._add(g), W(e._icon, this._draggable._newPos), this._onDrag(t), this._panRequest = J(this._adjustPan.bind(this, t));
          }
        },
        _onDragStart: function() {
          this._oldLatLng = this._marker.getLatLng(), this._marker.closePopup && this._marker.closePopup(), this._marker.fire("movestart").fire("dragstart");
        },
        _onPreDrag: function(t) {
          this._marker.options.autoPan && (it(this._panRequest), this._panRequest = J(this._adjustPan.bind(this, t)));
        },
        _onDrag: function(t) {
          var e = this._marker, i = e._shadow, n = At(e._icon), r = e._map.layerPointToLatLng(n);
          i && W(i, n), e._latlng = r, t.latlng = r, t.oldLatLng = this._oldLatLng, e.fire("move", t).fire("drag", t);
        },
        _onDragEnd: function(t) {
          it(this._panRequest), delete this._oldLatLng, this._marker.fire("moveend").fire("dragend", t);
        }
      }), ze = lt.extend({
        // @section
        // @aka Marker options
        options: {
          // @option icon: Icon = *
          // Icon instance to use for rendering the marker.
          // See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
          // If not specified, a common instance of `L.Icon.Default` is used.
          icon: new ae(),
          // Option inherited from "Interactive layer" abstract class
          interactive: !0,
          // @option keyboard: Boolean = true
          // Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
          keyboard: !0,
          // @option title: String = ''
          // Text for the browser tooltip that appear on marker hover (no tooltip by default).
          // [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
          title: "",
          // @option alt: String = 'Marker'
          // Text for the `alt` attribute of the icon image.
          // [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
          alt: "Marker",
          // @option zIndexOffset: Number = 0
          // By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
          zIndexOffset: 0,
          // @option opacity: Number = 1.0
          // The opacity of the marker.
          opacity: 1,
          // @option riseOnHover: Boolean = false
          // If `true`, the marker will get on top of others when you hover the mouse over it.
          riseOnHover: !1,
          // @option riseOffset: Number = 250
          // The z-index offset used for the `riseOnHover` feature.
          riseOffset: 250,
          // @option pane: String = 'markerPane'
          // `Map pane` where the markers icon will be added.
          pane: "markerPane",
          // @option shadowPane: String = 'shadowPane'
          // `Map pane` where the markers shadow will be added.
          shadowPane: "shadowPane",
          // @option bubblingMouseEvents: Boolean = false
          // When `true`, a mouse event on this marker will trigger the same event on the map
          // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
          bubblingMouseEvents: !1,
          // @option autoPanOnFocus: Boolean = true
          // When `true`, the map will pan whenever the marker is focused (via
          // e.g. pressing `tab` on the keyboard) to ensure the marker is
          // visible within the map's bounds
          autoPanOnFocus: !0,
          // @section Draggable marker options
          // @option draggable: Boolean = false
          // Whether the marker is draggable with mouse/touch or not.
          draggable: !1,
          // @option autoPan: Boolean = false
          // Whether to pan the map when dragging this marker near its edge or not.
          autoPan: !1,
          // @option autoPanPadding: Point = Point(50, 50)
          // Distance (in pixels to the left/right and to the top/bottom) of the
          // map edge to start panning the map.
          autoPanPadding: [50, 50],
          // @option autoPanSpeed: Number = 10
          // Number of pixels the map should pan by.
          autoPanSpeed: 10
        },
        /* @section
         *
         * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
         */
        initialize: function(t, e) {
          B(this, e), this._latlng = C(t);
        },
        onAdd: function(t) {
          this._zoomAnimated = this._zoomAnimated && t.options.markerZoomAnimation, this._zoomAnimated && t.on("zoomanim", this._animateZoom, this), this._initIcon(), this.update();
        },
        onRemove: function(t) {
          this.dragging && this.dragging.enabled() && (this.options.draggable = !0, this.dragging.removeHooks()), delete this.dragging, this._zoomAnimated && t.off("zoomanim", this._animateZoom, this), this._removeIcon(), this._removeShadow();
        },
        getEvents: function() {
          return {
            zoom: this.update,
            viewreset: this.update
          };
        },
        // @method getLatLng: LatLng
        // Returns the current geographical position of the marker.
        getLatLng: function() {
          return this._latlng;
        },
        // @method setLatLng(latlng: LatLng): this
        // Changes the marker position to the given point.
        setLatLng: function(t) {
          var e = this._latlng;
          return this._latlng = C(t), this.update(), this.fire("move", { oldLatLng: e, latlng: this._latlng });
        },
        // @method setZIndexOffset(offset: Number): this
        // Changes the [zIndex offset](#marker-zindexoffset) of the marker.
        setZIndexOffset: function(t) {
          return this.options.zIndexOffset = t, this.update();
        },
        // @method getIcon: Icon
        // Returns the current icon used by the marker
        getIcon: function() {
          return this.options.icon;
        },
        // @method setIcon(icon: Icon): this
        // Changes the marker icon.
        setIcon: function(t) {
          return this.options.icon = t, this._map && (this._initIcon(), this.update()), this._popup && this.bindPopup(this._popup, this._popup.options), this;
        },
        getElement: function() {
          return this._icon;
        },
        update: function() {
          if (this._icon && this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng).round();
            this._setPos(t);
          }
          return this;
        },
        _initIcon: function() {
          var t = this.options, e = "leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide"), i = t.icon.createIcon(this._icon), n = !1;
          i !== this._icon && (this._icon && this._removeIcon(), n = !0, t.title && (i.title = t.title), i.tagName === "IMG" && (i.alt = t.alt || "")), S(i, e), t.keyboard && (i.tabIndex = "0", i.setAttribute("role", "button")), this._icon = i, t.riseOnHover && this.on({
            mouseover: this._bringToFront,
            mouseout: this._resetZIndex
          }), this.options.autoPanOnFocus && A(i, "focus", this._panOnFocus, this);
          var r = t.icon.createShadow(this._shadow), a = !1;
          r !== this._shadow && (this._removeShadow(), a = !0), r && (S(r, e), r.alt = ""), this._shadow = r, t.opacity < 1 && this._updateOpacity(), n && this.getPane().appendChild(this._icon), this._initInteraction(), r && a && this.getPane(t.shadowPane).appendChild(this._shadow);
        },
        _removeIcon: function() {
          this.options.riseOnHover && this.off({
            mouseover: this._bringToFront,
            mouseout: this._resetZIndex
          }), this.options.autoPanOnFocus && $(this._icon, "focus", this._panOnFocus, this), D(this._icon), this.removeInteractiveTarget(this._icon), this._icon = null;
        },
        _removeShadow: function() {
          this._shadow && D(this._shadow), this._shadow = null;
        },
        _setPos: function(t) {
          this._icon && W(this._icon, t), this._shadow && W(this._shadow, t), this._zIndex = t.y + this.options.zIndexOffset, this._resetZIndex();
        },
        _updateZIndex: function(t) {
          this._icon && (this._icon.style.zIndex = this._zIndex + t);
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center).round();
          this._setPos(e);
        },
        _initInteraction: function() {
          if (this.options.interactive && (S(this._icon, "leaflet-interactive"), this.addInteractiveTarget(this._icon), Zn)) {
            var t = this.options.draggable;
            this.dragging && (t = this.dragging.enabled(), this.dragging.disable()), this.dragging = new Zn(this), t && this.dragging.enable();
          }
        },
        // @method setOpacity(opacity: Number): this
        // Changes the opacity of the marker.
        setOpacity: function(t) {
          return this.options.opacity = t, this._map && this._updateOpacity(), this;
        },
        _updateOpacity: function() {
          var t = this.options.opacity;
          this._icon && nt(this._icon, t), this._shadow && nt(this._shadow, t);
        },
        _bringToFront: function() {
          this._updateZIndex(this.options.riseOffset);
        },
        _resetZIndex: function() {
          this._updateZIndex(0);
        },
        _panOnFocus: function() {
          var t = this._map;
          if (t) {
            var e = this.options.icon.options, i = e.iconSize ? P(e.iconSize) : P(0, 0), n = e.iconAnchor ? P(e.iconAnchor) : P(0, 0);
            t.panInside(this._latlng, {
              paddingTopLeft: n,
              paddingBottomRight: i.subtract(n)
            });
          }
        },
        _getPopupAnchor: function() {
          return this.options.icon.options.popupAnchor;
        },
        _getTooltipAnchor: function() {
          return this.options.icon.options.tooltipAnchor;
        }
      });
      function Ir(t, e) {
        return new ze(t, e);
      }
      var wt = lt.extend({
        // @section
        // @aka Path options
        options: {
          // @option stroke: Boolean = true
          // Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
          stroke: !0,
          // @option color: String = '#3388ff'
          // Stroke color
          color: "#3388ff",
          // @option weight: Number = 3
          // Stroke width in pixels
          weight: 3,
          // @option opacity: Number = 1.0
          // Stroke opacity
          opacity: 1,
          // @option lineCap: String= 'round'
          // A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
          lineCap: "round",
          // @option lineJoin: String = 'round'
          // A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
          lineJoin: "round",
          // @option dashArray: String = null
          // A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
          dashArray: null,
          // @option dashOffset: String = null
          // A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
          dashOffset: null,
          // @option fill: Boolean = depends
          // Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
          fill: !1,
          // @option fillColor: String = *
          // Fill color. Defaults to the value of the [`color`](#path-color) option
          fillColor: null,
          // @option fillOpacity: Number = 0.2
          // Fill opacity.
          fillOpacity: 0.2,
          // @option fillRule: String = 'evenodd'
          // A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
          fillRule: "evenodd",
          // className: '',
          // Option inherited from "Interactive layer" abstract class
          interactive: !0,
          // @option bubblingMouseEvents: Boolean = true
          // When `true`, a mouse event on this path will trigger the same event on the map
          // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
          bubblingMouseEvents: !0
        },
        beforeAdd: function(t) {
          this._renderer = t.getRenderer(this);
        },
        onAdd: function() {
          this._renderer._initPath(this), this._reset(), this._renderer._addPath(this);
        },
        onRemove: function() {
          this._renderer._removePath(this);
        },
        // @method redraw(): this
        // Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
        redraw: function() {
          return this._map && this._renderer._updatePath(this), this;
        },
        // @method setStyle(style: Path options): this
        // Changes the appearance of a Path based on the options in the `Path options` object.
        setStyle: function(t) {
          return B(this, t), this._renderer && (this._renderer._updateStyle(this), this.options.stroke && t && Object.prototype.hasOwnProperty.call(t, "weight") && this._updateBounds()), this;
        },
        // @method bringToFront(): this
        // Brings the layer to the top of all path layers.
        bringToFront: function() {
          return this._renderer && this._renderer._bringToFront(this), this;
        },
        // @method bringToBack(): this
        // Brings the layer to the bottom of all path layers.
        bringToBack: function() {
          return this._renderer && this._renderer._bringToBack(this), this;
        },
        getElement: function() {
          return this._path;
        },
        _reset: function() {
          this._project(), this._update();
        },
        _clickTolerance: function() {
          return (this.options.stroke ? this.options.weight / 2 : 0) + (this._renderer.options.tolerance || 0);
        }
      }), Oe = wt.extend({
        // @section
        // @aka CircleMarker options
        options: {
          fill: !0,
          // @option radius: Number = 10
          // Radius of the circle marker, in pixels
          radius: 10
        },
        initialize: function(t, e) {
          B(this, e), this._latlng = C(t), this._radius = this.options.radius;
        },
        // @method setLatLng(latLng: LatLng): this
        // Sets the position of a circle marker to a new location.
        setLatLng: function(t) {
          var e = this._latlng;
          return this._latlng = C(t), this.redraw(), this.fire("move", { oldLatLng: e, latlng: this._latlng });
        },
        // @method getLatLng(): LatLng
        // Returns the current geographical position of the circle marker
        getLatLng: function() {
          return this._latlng;
        },
        // @method setRadius(radius: Number): this
        // Sets the radius of a circle marker. Units are in pixels.
        setRadius: function(t) {
          return this.options.radius = this._radius = t, this.redraw();
        },
        // @method getRadius(): Number
        // Returns the current radius of the circle
        getRadius: function() {
          return this._radius;
        },
        setStyle: function(t) {
          var e = t && t.radius || this._radius;
          return wt.prototype.setStyle.call(this, t), this.setRadius(e), this;
        },
        _project: function() {
          this._point = this._map.latLngToLayerPoint(this._latlng), this._updateBounds();
        },
        _updateBounds: function() {
          var t = this._radius, e = this._radiusY || t, i = this._clickTolerance(), n = [t + i, e + i];
          this._pxBounds = new N(this._point.subtract(n), this._point.add(n));
        },
        _update: function() {
          this._map && this._updatePath();
        },
        _updatePath: function() {
          this._renderer._updateCircle(this);
        },
        _empty: function() {
          return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(t) {
          return t.distanceTo(this._point) <= this._radius + this._clickTolerance();
        }
      });
      function Zr(t, e) {
        return new Oe(t, e);
      }
      var ki = Oe.extend({
        initialize: function(t, e, i) {
          if (typeof e == "number" && (e = l({}, i, { radius: e })), B(this, e), this._latlng = C(t), isNaN(this.options.radius))
            throw new Error("Circle radius cannot be NaN");
          this._mRadius = this.options.radius;
        },
        // @method setRadius(radius: Number): this
        // Sets the radius of a circle. Units are in meters.
        setRadius: function(t) {
          return this._mRadius = t, this.redraw();
        },
        // @method getRadius(): Number
        // Returns the current radius of a circle. Units are in meters.
        getRadius: function() {
          return this._mRadius;
        },
        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
          var t = [this._radius, this._radiusY || this._radius];
          return new Q(
            this._map.layerPointToLatLng(this._point.subtract(t)),
            this._map.layerPointToLatLng(this._point.add(t))
          );
        },
        setStyle: wt.prototype.setStyle,
        _project: function() {
          var t = this._latlng.lng, e = this._latlng.lat, i = this._map, n = i.options.crs;
          if (n.distance === bt.distance) {
            var r = Math.PI / 180, a = this._mRadius / bt.R / r, c = i.project([e + a, t]), p = i.project([e - a, t]), _ = c.add(p).divideBy(2), g = i.unproject(_).lat, y = Math.acos((Math.cos(a * r) - Math.sin(e * r) * Math.sin(g * r)) / (Math.cos(e * r) * Math.cos(g * r))) / r;
            (isNaN(y) || y === 0) && (y = a / Math.cos(Math.PI / 180 * e)), this._point = _.subtract(i.getPixelOrigin()), this._radius = isNaN(y) ? 0 : _.x - i.project([g, t - y]).x, this._radiusY = _.y - c.y;
          } else {
            var w = n.unproject(n.project(this._latlng).subtract([this._mRadius, 0]));
            this._point = i.latLngToLayerPoint(this._latlng), this._radius = this._point.x - i.latLngToLayerPoint(w).x;
          }
          this._updateBounds();
        }
      });
      function Rr(t, e, i) {
        return new ki(t, e, i);
      }
      var mt = wt.extend({
        // @section
        // @aka Polyline options
        options: {
          // @option smoothFactor: Number = 1.0
          // How much to simplify the polyline on each zoom level. More means
          // better performance and smoother look, and less means more accurate representation.
          smoothFactor: 1,
          // @option noClip: Boolean = false
          // Disable polyline clipping.
          noClip: !1
        },
        initialize: function(t, e) {
          B(this, e), this._setLatLngs(t);
        },
        // @method getLatLngs(): LatLng[]
        // Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
        getLatLngs: function() {
          return this._latlngs;
        },
        // @method setLatLngs(latlngs: LatLng[]): this
        // Replaces all the points in the polyline with the given array of geographical points.
        setLatLngs: function(t) {
          return this._setLatLngs(t), this.redraw();
        },
        // @method isEmpty(): Boolean
        // Returns `true` if the Polyline has no LatLngs.
        isEmpty: function() {
          return !this._latlngs.length;
        },
        // @method closestLayerPoint(p: Point): Point
        // Returns the point closest to `p` on the Polyline.
        closestLayerPoint: function(t) {
          for (var e = 1 / 0, i = null, n = se, r, a, c = 0, p = this._parts.length; c < p; c++)
            for (var _ = this._parts[c], g = 1, y = _.length; g < y; g++) {
              r = _[g - 1], a = _[g];
              var w = n(t, r, a, !0);
              w < e && (e = w, i = n(t, r, a));
            }
          return i && (i.distance = Math.sqrt(e)), i;
        },
        // @method getCenter(): LatLng
        // Returns the center ([centroid](https://en.wikipedia.org/wiki/Centroid)) of the polyline.
        getCenter: function() {
          if (!this._map)
            throw new Error("Must add layer to map before using getCenter()");
          return On(this._defaultShape(), this._map.options.crs);
        },
        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
          return this._bounds;
        },
        // @method addLatLng(latlng: LatLng, latlngs?: LatLng[]): this
        // Adds a given point to the polyline. By default, adds to the first ring of
        // the polyline in case of a multi-polyline, but can be overridden by passing
        // a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
        addLatLng: function(t, e) {
          return e = e || this._defaultShape(), t = C(t), e.push(t), this._bounds.extend(t), this.redraw();
        },
        _setLatLngs: function(t) {
          this._bounds = new Q(), this._latlngs = this._convertLatLngs(t);
        },
        _defaultShape: function() {
          return ot(this._latlngs) ? this._latlngs : this._latlngs[0];
        },
        // recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
        _convertLatLngs: function(t) {
          for (var e = [], i = ot(t), n = 0, r = t.length; n < r; n++)
            i ? (e[n] = C(t[n]), this._bounds.extend(e[n])) : e[n] = this._convertLatLngs(t[n]);
          return e;
        },
        _project: function() {
          var t = new N();
          this._rings = [], this._projectLatlngs(this._latlngs, this._rings, t), this._bounds.isValid() && t.isValid() && (this._rawPxBounds = t, this._updateBounds());
        },
        _updateBounds: function() {
          var t = this._clickTolerance(), e = new T(t, t);
          this._rawPxBounds && (this._pxBounds = new N([
            this._rawPxBounds.min.subtract(e),
            this._rawPxBounds.max.add(e)
          ]));
        },
        // recursively turns latlngs into a set of rings with projected coordinates
        _projectLatlngs: function(t, e, i) {
          var n = t[0] instanceof R, r = t.length, a, c;
          if (n) {
            for (c = [], a = 0; a < r; a++)
              c[a] = this._map.latLngToLayerPoint(t[a]), i.extend(c[a]);
            e.push(c);
          } else
            for (a = 0; a < r; a++)
              this._projectLatlngs(t[a], e, i);
        },
        // clip polyline by renderer bounds so that we have less to render for performance
        _clipPoints: function() {
          var t = this._renderer._bounds;
          if (this._parts = [], !(!this._pxBounds || !this._pxBounds.intersects(t))) {
            if (this.options.noClip) {
              this._parts = this._rings;
              return;
            }
            var e = this._parts, i, n, r, a, c, p, _;
            for (i = 0, r = 0, a = this._rings.length; i < a; i++)
              for (_ = this._rings[i], n = 0, c = _.length; n < c - 1; n++)
                p = Mn(_[n], _[n + 1], t, n, !0), p && (e[r] = e[r] || [], e[r].push(p[0]), (p[1] !== _[n + 1] || n === c - 2) && (e[r].push(p[1]), r++));
          }
        },
        // simplify each clipped part of the polyline for performance
        _simplifyPoints: function() {
          for (var t = this._parts, e = this.options.smoothFactor, i = 0, n = t.length; i < n; i++)
            t[i] = kn(t[i], e);
        },
        _update: function() {
          this._map && (this._clipPoints(), this._simplifyPoints(), this._updatePath());
        },
        _updatePath: function() {
          this._renderer._updatePoly(this);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(t, e) {
          var i, n, r, a, c, p, _ = this._clickTolerance();
          if (!this._pxBounds || !this._pxBounds.contains(t))
            return !1;
          for (i = 0, a = this._parts.length; i < a; i++)
            for (p = this._parts[i], n = 0, c = p.length, r = c - 1; n < c; r = n++)
              if (!(!e && n === 0) && Cn(t, p[r], p[n]) <= _)
                return !0;
          return !1;
        }
      });
      function Br(t, e) {
        return new mt(t, e);
      }
      mt._flat = zn;
      var Dt = mt.extend({
        options: {
          fill: !0
        },
        isEmpty: function() {
          return !this._latlngs.length || !this._latlngs[0].length;
        },
        // @method getCenter(): LatLng
        // Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the Polygon.
        getCenter: function() {
          if (!this._map)
            throw new Error("Must add layer to map before using getCenter()");
          return Sn(this._defaultShape(), this._map.options.crs);
        },
        _convertLatLngs: function(t) {
          var e = mt.prototype._convertLatLngs.call(this, t), i = e.length;
          return i >= 2 && e[0] instanceof R && e[0].equals(e[i - 1]) && e.pop(), e;
        },
        _setLatLngs: function(t) {
          mt.prototype._setLatLngs.call(this, t), ot(this._latlngs) && (this._latlngs = [this._latlngs]);
        },
        _defaultShape: function() {
          return ot(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
        },
        _clipPoints: function() {
          var t = this._renderer._bounds, e = this.options.weight, i = new T(e, e);
          if (t = new N(t.min.subtract(i), t.max.add(i)), this._parts = [], !(!this._pxBounds || !this._pxBounds.intersects(t))) {
            if (this.options.noClip) {
              this._parts = this._rings;
              return;
            }
            for (var n = 0, r = this._rings.length, a; n < r; n++)
              a = An(this._rings[n], t, !0), a.length && this._parts.push(a);
          }
        },
        _updatePath: function() {
          this._renderer._updatePoly(this, !0);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(t) {
          var e = !1, i, n, r, a, c, p, _, g;
          if (!this._pxBounds || !this._pxBounds.contains(t))
            return !1;
          for (a = 0, _ = this._parts.length; a < _; a++)
            for (i = this._parts[a], c = 0, g = i.length, p = g - 1; c < g; p = c++)
              n = i[c], r = i[p], n.y > t.y != r.y > t.y && t.x < (r.x - n.x) * (t.y - n.y) / (r.y - n.y) + n.x && (e = !e);
          return e || mt.prototype._containsPoint.call(this, t, !0);
        }
      });
      function $r(t, e) {
        return new Dt(t, e);
      }
      var gt = _t.extend({
        /* @section
         * @aka GeoJSON options
         *
         * @option pointToLayer: Function = *
         * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
         * called when data is added, passing the GeoJSON point feature and its `LatLng`.
         * The default is to spawn a default `Marker`:
         * ```js
         * function(geoJsonPoint, latlng) {
         * 	return L.marker(latlng);
         * }
         * ```
         *
         * @option style: Function = *
         * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
         * called internally when data is added.
         * The default value is to not override any defaults:
         * ```js
         * function (geoJsonFeature) {
         * 	return {}
         * }
         * ```
         *
         * @option onEachFeature: Function = *
         * A `Function` that will be called once for each created `Feature`, after it has
         * been created and styled. Useful for attaching events and popups to features.
         * The default is to do nothing with the newly created layers:
         * ```js
         * function (feature, layer) {}
         * ```
         *
         * @option filter: Function = *
         * A `Function` that will be used to decide whether to include a feature or not.
         * The default is to include all features:
         * ```js
         * function (geoJsonFeature) {
         * 	return true;
         * }
         * ```
         * Note: dynamically changing the `filter` option will have effect only on newly
         * added data. It will _not_ re-evaluate already included features.
         *
         * @option coordsToLatLng: Function = *
         * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
         * The default is the `coordsToLatLng` static method.
         *
         * @option markersInheritOptions: Boolean = false
         * Whether default Markers for "Point" type Features inherit from group options.
         */
        initialize: function(t, e) {
          B(this, e), this._layers = {}, t && this.addData(t);
        },
        // @method addData( <GeoJSON> data ): this
        // Adds a GeoJSON object to the layer.
        addData: function(t) {
          var e = st(t) ? t : t.features, i, n, r;
          if (e) {
            for (i = 0, n = e.length; i < n; i++)
              r = e[i], (r.geometries || r.geometry || r.features || r.coordinates) && this.addData(r);
            return this;
          }
          var a = this.options;
          if (a.filter && !a.filter(t))
            return this;
          var c = Ie(t, a);
          return c ? (c.feature = Be(t), c.defaultOptions = c.options, this.resetStyle(c), a.onEachFeature && a.onEachFeature(t, c), this.addLayer(c)) : this;
        },
        // @method resetStyle( <Path> layer? ): this
        // Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
        // If `layer` is omitted, the style of all features in the current layer is reset.
        resetStyle: function(t) {
          return t === void 0 ? this.eachLayer(this.resetStyle, this) : (t.options = l({}, t.defaultOptions), this._setLayerStyle(t, this.options.style), this);
        },
        // @method setStyle( <Function> style ): this
        // Changes styles of GeoJSON vector layers with the given style function.
        setStyle: function(t) {
          return this.eachLayer(function(e) {
            this._setLayerStyle(e, t);
          }, this);
        },
        _setLayerStyle: function(t, e) {
          t.setStyle && (typeof e == "function" && (e = e(t.feature)), t.setStyle(e));
        }
      });
      function Ie(t, e) {
        var i = t.type === "Feature" ? t.geometry : t, n = i ? i.coordinates : null, r = [], a = e && e.pointToLayer, c = e && e.coordsToLatLng || Ci, p, _, g, y;
        if (!n && !i)
          return null;
        switch (i.type) {
          case "Point":
            return p = c(n), Rn(a, t, p, e);
          case "MultiPoint":
            for (g = 0, y = n.length; g < y; g++)
              p = c(n[g]), r.push(Rn(a, t, p, e));
            return new _t(r);
          case "LineString":
          case "MultiLineString":
            return _ = Ze(n, i.type === "LineString" ? 0 : 1, c), new mt(_, e);
          case "Polygon":
          case "MultiPolygon":
            return _ = Ze(n, i.type === "Polygon" ? 1 : 2, c), new Dt(_, e);
          case "GeometryCollection":
            for (g = 0, y = i.geometries.length; g < y; g++) {
              var w = Ie({
                geometry: i.geometries[g],
                type: "Feature",
                properties: t.properties
              }, e);
              w && r.push(w);
            }
            return new _t(r);
          case "FeatureCollection":
            for (g = 0, y = i.features.length; g < y; g++) {
              var k = Ie(i.features[g], e);
              k && r.push(k);
            }
            return new _t(r);
          default:
            throw new Error("Invalid GeoJSON object.");
        }
      }
      function Rn(t, e, i, n) {
        return t ? t(e, i) : new ze(i, n && n.markersInheritOptions && n);
      }
      function Ci(t) {
        return new R(t[1], t[0], t[2]);
      }
      function Ze(t, e, i) {
        for (var n = [], r = 0, a = t.length, c; r < a; r++)
          c = e ? Ze(t[r], e - 1, i) : (i || Ci)(t[r]), n.push(c);
        return n;
      }
      function Ei(t, e) {
        return t = C(t), t.alt !== void 0 ? [H(t.lng, e), H(t.lat, e), H(t.alt, e)] : [H(t.lng, e), H(t.lat, e)];
      }
      function Re(t, e, i, n) {
        for (var r = [], a = 0, c = t.length; a < c; a++)
          r.push(e ? Re(t[a], ot(t[a]) ? 0 : e - 1, i, n) : Ei(t[a], n));
        return !e && i && r.length > 0 && r.push(r[0].slice()), r;
      }
      function Ht(t, e) {
        return t.feature ? l({}, t.feature, { geometry: e }) : Be(e);
      }
      function Be(t) {
        return t.type === "Feature" || t.type === "FeatureCollection" ? t : {
          type: "Feature",
          properties: {},
          geometry: t
        };
      }
      var Mi = {
        toGeoJSON: function(t) {
          return Ht(this, {
            type: "Point",
            coordinates: Ei(this.getLatLng(), t)
          });
        }
      };
      ze.include(Mi), ki.include(Mi), Oe.include(Mi), mt.include({
        toGeoJSON: function(t) {
          var e = !ot(this._latlngs), i = Re(this._latlngs, e ? 1 : 0, !1, t);
          return Ht(this, {
            type: (e ? "Multi" : "") + "LineString",
            coordinates: i
          });
        }
      }), Dt.include({
        toGeoJSON: function(t) {
          var e = !ot(this._latlngs), i = e && !ot(this._latlngs[0]), n = Re(this._latlngs, i ? 2 : e ? 1 : 0, !0, t);
          return e || (n = [n]), Ht(this, {
            type: (i ? "Multi" : "") + "Polygon",
            coordinates: n
          });
        }
      }), $t.include({
        toMultiPoint: function(t) {
          var e = [];
          return this.eachLayer(function(i) {
            e.push(i.toGeoJSON(t).geometry.coordinates);
          }), Ht(this, {
            type: "MultiPoint",
            coordinates: e
          });
        },
        // @method toGeoJSON(precision?: Number|false): Object
        // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
        // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
        toGeoJSON: function(t) {
          var e = this.feature && this.feature.geometry && this.feature.geometry.type;
          if (e === "MultiPoint")
            return this.toMultiPoint(t);
          var i = e === "GeometryCollection", n = [];
          return this.eachLayer(function(r) {
            if (r.toGeoJSON) {
              var a = r.toGeoJSON(t);
              if (i)
                n.push(a.geometry);
              else {
                var c = Be(a);
                c.type === "FeatureCollection" ? n.push.apply(n, c.features) : n.push(c);
              }
            }
          }), i ? Ht(this, {
            geometries: n,
            type: "GeometryCollection"
          }) : {
            type: "FeatureCollection",
            features: n
          };
        }
      });
      function Bn(t, e) {
        return new gt(t, e);
      }
      var Nr = Bn, $e = lt.extend({
        // @section
        // @aka ImageOverlay options
        options: {
          // @option opacity: Number = 1.0
          // The opacity of the image overlay.
          opacity: 1,
          // @option alt: String = ''
          // Text for the `alt` attribute of the image (useful for accessibility).
          alt: "",
          // @option interactive: Boolean = false
          // If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
          interactive: !1,
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the image.
          // If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: !1,
          // @option errorOverlayUrl: String = ''
          // URL to the overlay image to show in place of the overlay that failed to load.
          errorOverlayUrl: "",
          // @option zIndex: Number = 1
          // The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
          zIndex: 1,
          // @option className: String = ''
          // A custom class name to assign to the image. Empty by default.
          className: ""
        },
        initialize: function(t, e, i) {
          this._url = t, this._bounds = j(e), B(this, i);
        },
        onAdd: function() {
          this._image || (this._initImage(), this.options.opacity < 1 && this._updateOpacity()), this.options.interactive && (S(this._image, "leaflet-interactive"), this.addInteractiveTarget(this._image)), this.getPane().appendChild(this._image), this._reset();
        },
        onRemove: function() {
          D(this._image), this.options.interactive && this.removeInteractiveTarget(this._image);
        },
        // @method setOpacity(opacity: Number): this
        // Sets the opacity of the overlay.
        setOpacity: function(t) {
          return this.options.opacity = t, this._image && this._updateOpacity(), this;
        },
        setStyle: function(t) {
          return t.opacity && this.setOpacity(t.opacity), this;
        },
        // @method bringToFront(): this
        // Brings the layer to the top of all overlays.
        bringToFront: function() {
          return this._map && Rt(this._image), this;
        },
        // @method bringToBack(): this
        // Brings the layer to the bottom of all overlays.
        bringToBack: function() {
          return this._map && Bt(this._image), this;
        },
        // @method setUrl(url: String): this
        // Changes the URL of the image.
        setUrl: function(t) {
          return this._url = t, this._image && (this._image.src = t), this;
        },
        // @method setBounds(bounds: LatLngBounds): this
        // Update the bounds that this ImageOverlay covers
        setBounds: function(t) {
          return this._bounds = j(t), this._map && this._reset(), this;
        },
        getEvents: function() {
          var t = {
            zoom: this._reset,
            viewreset: this._reset
          };
          return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        // @method setZIndex(value: Number): this
        // Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
        setZIndex: function(t) {
          return this.options.zIndex = t, this._updateZIndex(), this;
        },
        // @method getBounds(): LatLngBounds
        // Get the bounds that this ImageOverlay covers
        getBounds: function() {
          return this._bounds;
        },
        // @method getElement(): HTMLElement
        // Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
        // used by this overlay.
        getElement: function() {
          return this._image;
        },
        _initImage: function() {
          var t = this._url.tagName === "IMG", e = this._image = t ? this._url : I("img");
          if (S(e, "leaflet-image-layer"), this._zoomAnimated && S(e, "leaflet-zoom-animated"), this.options.className && S(e, this.options.className), e.onselectstart = x, e.onmousemove = x, e.onload = d(this.fire, this, "load"), e.onerror = d(this._overlayOnError, this, "error"), (this.options.crossOrigin || this.options.crossOrigin === "") && (e.crossOrigin = this.options.crossOrigin === !0 ? "" : this.options.crossOrigin), this.options.zIndex && this._updateZIndex(), t) {
            this._url = e.src;
            return;
          }
          e.src = this._url, e.alt = this.options.alt;
        },
        _animateZoom: function(t) {
          var e = this._map.getZoomScale(t.zoom), i = this._map._latLngBoundsToNewLayerBounds(this._bounds, t.zoom, t.center).min;
          Tt(this._image, i, e);
        },
        _reset: function() {
          var t = this._image, e = new N(
            this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
            this._map.latLngToLayerPoint(this._bounds.getSouthEast())
          ), i = e.getSize();
          W(t, e.min), t.style.width = i.x + "px", t.style.height = i.y + "px";
        },
        _updateOpacity: function() {
          nt(this._image, this.options.opacity);
        },
        _updateZIndex: function() {
          this._image && this.options.zIndex !== void 0 && this.options.zIndex !== null && (this._image.style.zIndex = this.options.zIndex);
        },
        _overlayOnError: function() {
          this.fire("error");
          var t = this.options.errorOverlayUrl;
          t && this._url !== t && (this._url = t, this._image.src = t);
        },
        // @method getCenter(): LatLng
        // Returns the center of the ImageOverlay.
        getCenter: function() {
          return this._bounds.getCenter();
        }
      }), Dr = function(t, e, i) {
        return new $e(t, e, i);
      }, $n = $e.extend({
        // @section
        // @aka VideoOverlay options
        options: {
          // @option autoplay: Boolean = true
          // Whether the video starts playing automatically when loaded.
          // On some browsers autoplay will only work with `muted: true`
          autoplay: !0,
          // @option loop: Boolean = true
          // Whether the video will loop back to the beginning when played.
          loop: !0,
          // @option keepAspectRatio: Boolean = true
          // Whether the video will save aspect ratio after the projection.
          // Relevant for supported browsers. See [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
          keepAspectRatio: !0,
          // @option muted: Boolean = false
          // Whether the video starts on mute when loaded.
          muted: !1,
          // @option playsInline: Boolean = true
          // Mobile browsers will play the video right where it is instead of open it up in fullscreen mode.
          playsInline: !0
        },
        _initImage: function() {
          var t = this._url.tagName === "VIDEO", e = this._image = t ? this._url : I("video");
          if (S(e, "leaflet-image-layer"), this._zoomAnimated && S(e, "leaflet-zoom-animated"), this.options.className && S(e, this.options.className), e.onselectstart = x, e.onmousemove = x, e.onloadeddata = d(this.fire, this, "load"), t) {
            for (var i = e.getElementsByTagName("source"), n = [], r = 0; r < i.length; r++)
              n.push(i[r].src);
            this._url = i.length > 0 ? n : [e.src];
            return;
          }
          st(this._url) || (this._url = [this._url]), !this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(e.style, "objectFit") && (e.style.objectFit = "fill"), e.autoplay = !!this.options.autoplay, e.loop = !!this.options.loop, e.muted = !!this.options.muted, e.playsInline = !!this.options.playsInline;
          for (var a = 0; a < this._url.length; a++) {
            var c = I("source");
            c.src = this._url[a], e.appendChild(c);
          }
        }
        // @method getElement(): HTMLVideoElement
        // Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
        // used by this overlay.
      });
      function Hr(t, e, i) {
        return new $n(t, e, i);
      }
      var Nn = $e.extend({
        _initImage: function() {
          var t = this._image = this._url;
          S(t, "leaflet-image-layer"), this._zoomAnimated && S(t, "leaflet-zoom-animated"), this.options.className && S(t, this.options.className), t.onselectstart = x, t.onmousemove = x;
        }
        // @method getElement(): SVGElement
        // Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
        // used by this overlay.
      });
      function Fr(t, e, i) {
        return new Nn(t, e, i);
      }
      var dt = lt.extend({
        // @section
        // @aka DivOverlay options
        options: {
          // @option interactive: Boolean = false
          // If true, the popup/tooltip will listen to the mouse events.
          interactive: !1,
          // @option offset: Point = Point(0, 0)
          // The offset of the overlay position.
          offset: [0, 0],
          // @option className: String = ''
          // A custom CSS class name to assign to the overlay.
          className: "",
          // @option pane: String = undefined
          // `Map pane` where the overlay will be added.
          pane: void 0,
          // @option content: String|HTMLElement|Function = ''
          // Sets the HTML content of the overlay while initializing. If a function is passed the source layer will be
          // passed to the function. The function should return a `String` or `HTMLElement` to be used in the overlay.
          content: ""
        },
        initialize: function(t, e) {
          t && (t instanceof R || st(t)) ? (this._latlng = C(t), B(this, e)) : (B(this, t), this._source = e), this.options.content && (this._content = this.options.content);
        },
        // @method openOn(map: Map): this
        // Adds the overlay to the map.
        // Alternative to `map.openPopup(popup)`/`.openTooltip(tooltip)`.
        openOn: function(t) {
          return t = arguments.length ? t : this._source._map, t.hasLayer(this) || t.addLayer(this), this;
        },
        // @method close(): this
        // Closes the overlay.
        // Alternative to `map.closePopup(popup)`/`.closeTooltip(tooltip)`
        // and `layer.closePopup()`/`.closeTooltip()`.
        close: function() {
          return this._map && this._map.removeLayer(this), this;
        },
        // @method toggle(layer?: Layer): this
        // Opens or closes the overlay bound to layer depending on its current state.
        // Argument may be omitted only for overlay bound to layer.
        // Alternative to `layer.togglePopup()`/`.toggleTooltip()`.
        toggle: function(t) {
          return this._map ? this.close() : (arguments.length ? this._source = t : t = this._source, this._prepareOpen(), this.openOn(t._map)), this;
        },
        onAdd: function(t) {
          this._zoomAnimated = t._zoomAnimated, this._container || this._initLayout(), t._fadeAnimated && nt(this._container, 0), clearTimeout(this._removeTimeout), this.getPane().appendChild(this._container), this.update(), t._fadeAnimated && nt(this._container, 1), this.bringToFront(), this.options.interactive && (S(this._container, "leaflet-interactive"), this.addInteractiveTarget(this._container));
        },
        onRemove: function(t) {
          t._fadeAnimated ? (nt(this._container, 0), this._removeTimeout = setTimeout(d(D, void 0, this._container), 200)) : D(this._container), this.options.interactive && (F(this._container, "leaflet-interactive"), this.removeInteractiveTarget(this._container));
        },
        // @namespace DivOverlay
        // @method getLatLng: LatLng
        // Returns the geographical point of the overlay.
        getLatLng: function() {
          return this._latlng;
        },
        // @method setLatLng(latlng: LatLng): this
        // Sets the geographical point where the overlay will open.
        setLatLng: function(t) {
          return this._latlng = C(t), this._map && (this._updatePosition(), this._adjustPan()), this;
        },
        // @method getContent: String|HTMLElement
        // Returns the content of the overlay.
        getContent: function() {
          return this._content;
        },
        // @method setContent(htmlContent: String|HTMLElement|Function): this
        // Sets the HTML content of the overlay. If a function is passed the source layer will be passed to the function.
        // The function should return a `String` or `HTMLElement` to be used in the overlay.
        setContent: function(t) {
          return this._content = t, this.update(), this;
        },
        // @method getElement: String|HTMLElement
        // Returns the HTML container of the overlay.
        getElement: function() {
          return this._container;
        },
        // @method update: null
        // Updates the overlay content, layout and position. Useful for updating the overlay after something inside changed, e.g. image loaded.
        update: function() {
          this._map && (this._container.style.visibility = "hidden", this._updateContent(), this._updateLayout(), this._updatePosition(), this._container.style.visibility = "", this._adjustPan());
        },
        getEvents: function() {
          var t = {
            zoom: this._updatePosition,
            viewreset: this._updatePosition
          };
          return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        // @method isOpen: Boolean
        // Returns `true` when the overlay is visible on the map.
        isOpen: function() {
          return !!this._map && this._map.hasLayer(this);
        },
        // @method bringToFront: this
        // Brings this overlay in front of other overlays (in the same map pane).
        bringToFront: function() {
          return this._map && Rt(this._container), this;
        },
        // @method bringToBack: this
        // Brings this overlay to the back of other overlays (in the same map pane).
        bringToBack: function() {
          return this._map && Bt(this._container), this;
        },
        // prepare bound overlay to open: update latlng pos / content source (for FeatureGroup)
        _prepareOpen: function(t) {
          var e = this._source;
          if (!e._map)
            return !1;
          if (e instanceof _t) {
            e = null;
            var i = this._source._layers;
            for (var n in i)
              if (i[n]._map) {
                e = i[n];
                break;
              }
            if (!e)
              return !1;
            this._source = e;
          }
          if (!t)
            if (e.getCenter)
              t = e.getCenter();
            else if (e.getLatLng)
              t = e.getLatLng();
            else if (e.getBounds)
              t = e.getBounds().getCenter();
            else
              throw new Error("Unable to get source layer LatLng.");
          return this.setLatLng(t), this._map && this.update(), !0;
        },
        _updateContent: function() {
          if (this._content) {
            var t = this._contentNode, e = typeof this._content == "function" ? this._content(this._source || this) : this._content;
            if (typeof e == "string")
              t.innerHTML = e;
            else {
              for (; t.hasChildNodes(); )
                t.removeChild(t.firstChild);
              t.appendChild(e);
            }
            this.fire("contentupdate");
          }
        },
        _updatePosition: function() {
          if (this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng), e = P(this.options.offset), i = this._getAnchor();
            this._zoomAnimated ? W(this._container, t.add(i)) : e = e.add(t).add(i);
            var n = this._containerBottom = -e.y, r = this._containerLeft = -Math.round(this._containerWidth / 2) + e.x;
            this._container.style.bottom = n + "px", this._container.style.left = r + "px";
          }
        },
        _getAnchor: function() {
          return [0, 0];
        }
      });
      E.include({
        _initOverlay: function(t, e, i, n) {
          var r = e;
          return r instanceof t || (r = new t(n).setContent(e)), i && r.setLatLng(i), r;
        }
      }), lt.include({
        _initOverlay: function(t, e, i, n) {
          var r = i;
          return r instanceof t ? (B(r, n), r._source = this) : (r = e && !n ? e : new t(n, this), r.setContent(i)), r;
        }
      });
      var Ne = dt.extend({
        // @section
        // @aka Popup options
        options: {
          // @option pane: String = 'popupPane'
          // `Map pane` where the popup will be added.
          pane: "popupPane",
          // @option offset: Point = Point(0, 7)
          // The offset of the popup position.
          offset: [0, 7],
          // @option maxWidth: Number = 300
          // Max width of the popup, in pixels.
          maxWidth: 300,
          // @option minWidth: Number = 50
          // Min width of the popup, in pixels.
          minWidth: 50,
          // @option maxHeight: Number = null
          // If set, creates a scrollable container of the given height
          // inside a popup if its content exceeds it.
          // The scrollable container can be styled using the
          // `leaflet-popup-scrolled` CSS class selector.
          maxHeight: null,
          // @option autoPan: Boolean = true
          // Set it to `false` if you don't want the map to do panning animation
          // to fit the opened popup.
          autoPan: !0,
          // @option autoPanPaddingTopLeft: Point = null
          // The margin between the popup and the top left corner of the map
          // view after autopanning was performed.
          autoPanPaddingTopLeft: null,
          // @option autoPanPaddingBottomRight: Point = null
          // The margin between the popup and the bottom right corner of the map
          // view after autopanning was performed.
          autoPanPaddingBottomRight: null,
          // @option autoPanPadding: Point = Point(5, 5)
          // Equivalent of setting both top left and bottom right autopan padding to the same value.
          autoPanPadding: [5, 5],
          // @option keepInView: Boolean = false
          // Set it to `true` if you want to prevent users from panning the popup
          // off of the screen while it is open.
          keepInView: !1,
          // @option closeButton: Boolean = true
          // Controls the presence of a close button in the popup.
          closeButton: !0,
          // @option autoClose: Boolean = true
          // Set it to `false` if you want to override the default behavior of
          // the popup closing when another popup is opened.
          autoClose: !0,
          // @option closeOnEscapeKey: Boolean = true
          // Set it to `false` if you want to override the default behavior of
          // the ESC key for closing of the popup.
          closeOnEscapeKey: !0,
          // @option closeOnClick: Boolean = *
          // Set it if you want to override the default behavior of the popup closing when user clicks
          // on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.
          // @option className: String = ''
          // A custom CSS class name to assign to the popup.
          className: ""
        },
        // @namespace Popup
        // @method openOn(map: Map): this
        // Alternative to `map.openPopup(popup)`.
        // Adds the popup to the map and closes the previous one.
        openOn: function(t) {
          return t = arguments.length ? t : this._source._map, !t.hasLayer(this) && t._popup && t._popup.options.autoClose && t.removeLayer(t._popup), t._popup = this, dt.prototype.openOn.call(this, t);
        },
        onAdd: function(t) {
          dt.prototype.onAdd.call(this, t), t.fire("popupopen", { popup: this }), this._source && (this._source.fire("popupopen", { popup: this }, !0), this._source instanceof wt || this._source.on("preclick", St));
        },
        onRemove: function(t) {
          dt.prototype.onRemove.call(this, t), t.fire("popupclose", { popup: this }), this._source && (this._source.fire("popupclose", { popup: this }, !0), this._source instanceof wt || this._source.off("preclick", St));
        },
        getEvents: function() {
          var t = dt.prototype.getEvents.call(this);
          return (this.options.closeOnClick !== void 0 ? this.options.closeOnClick : this._map.options.closePopupOnClick) && (t.preclick = this.close), this.options.keepInView && (t.moveend = this._adjustPan), t;
        },
        _initLayout: function() {
          var t = "leaflet-popup", e = this._container = I(
            "div",
            t + " " + (this.options.className || "") + " leaflet-zoom-animated"
          ), i = this._wrapper = I("div", t + "-content-wrapper", e);
          if (this._contentNode = I("div", t + "-content", i), oe(e), bi(this._contentNode), A(e, "contextmenu", St), this._tipContainer = I("div", t + "-tip-container", e), this._tip = I("div", t + "-tip", this._tipContainer), this.options.closeButton) {
            var n = this._closeButton = I("a", t + "-close-button", e);
            n.setAttribute("role", "button"), n.setAttribute("aria-label", "Close popup"), n.href = "#close", n.innerHTML = '<span aria-hidden="true">&#215;</span>', A(n, "click", function(r) {
              q(r), this.close();
            }, this);
          }
        },
        _updateLayout: function() {
          var t = this._contentNode, e = t.style;
          e.width = "", e.whiteSpace = "nowrap";
          var i = t.offsetWidth;
          i = Math.min(i, this.options.maxWidth), i = Math.max(i, this.options.minWidth), e.width = i + 1 + "px", e.whiteSpace = "", e.height = "";
          var n = t.offsetHeight, r = this.options.maxHeight, a = "leaflet-popup-scrolled";
          r && n > r ? (e.height = r + "px", S(t, a)) : F(t, a), this._containerWidth = this._container.offsetWidth;
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center), i = this._getAnchor();
          W(this._container, e.add(i));
        },
        _adjustPan: function() {
          if (this.options.autoPan) {
            if (this._map._panAnim && this._map._panAnim.stop(), this._autopanning) {
              this._autopanning = !1;
              return;
            }
            var t = this._map, e = parseInt(te(this._container, "marginBottom"), 10) || 0, i = this._container.offsetHeight + e, n = this._containerWidth, r = new T(this._containerLeft, -i - this._containerBottom);
            r._add(At(this._container));
            var a = t.layerPointToContainerPoint(r), c = P(this.options.autoPanPadding), p = P(this.options.autoPanPaddingTopLeft || c), _ = P(this.options.autoPanPaddingBottomRight || c), g = t.getSize(), y = 0, w = 0;
            a.x + n + _.x > g.x && (y = a.x + n - g.x + _.x), a.x - y - p.x < 0 && (y = a.x - p.x), a.y + i + _.y > g.y && (w = a.y + i - g.y + _.y), a.y - w - p.y < 0 && (w = a.y - p.y), (y || w) && (this.options.keepInView && (this._autopanning = !0), t.fire("autopanstart").panBy([y, w]));
          }
        },
        _getAnchor: function() {
          return P(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
        }
      }), jr = function(t, e) {
        return new Ne(t, e);
      };
      E.mergeOptions({
        closePopupOnClick: !0
      }), E.include({
        // @method openPopup(popup: Popup): this
        // Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
        // @alternative
        // @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
        // Creates a popup with the specified content and options and opens it in the given point on a map.
        openPopup: function(t, e, i) {
          return this._initOverlay(Ne, t, e, i).openOn(this), this;
        },
        // @method closePopup(popup?: Popup): this
        // Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
        closePopup: function(t) {
          return t = arguments.length ? t : this._popup, t && t.close(), this;
        }
      }), lt.include({
        // @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
        // Binds a popup to the layer with the passed `content` and sets up the
        // necessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindPopup: function(t, e) {
          return this._popup = this._initOverlay(Ne, this._popup, t, e), this._popupHandlersAdded || (this.on({
            click: this._openPopup,
            keypress: this._onKeyPress,
            remove: this.closePopup,
            move: this._movePopup
          }), this._popupHandlersAdded = !0), this;
        },
        // @method unbindPopup(): this
        // Removes the popup previously bound with `bindPopup`.
        unbindPopup: function() {
          return this._popup && (this.off({
            click: this._openPopup,
            keypress: this._onKeyPress,
            remove: this.closePopup,
            move: this._movePopup
          }), this._popupHandlersAdded = !1, this._popup = null), this;
        },
        // @method openPopup(latlng?: LatLng): this
        // Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
        openPopup: function(t) {
          return this._popup && (this instanceof _t || (this._popup._source = this), this._popup._prepareOpen(t || this._latlng) && this._popup.openOn(this._map)), this;
        },
        // @method closePopup(): this
        // Closes the popup bound to this layer if it is open.
        closePopup: function() {
          return this._popup && this._popup.close(), this;
        },
        // @method togglePopup(): this
        // Opens or closes the popup bound to this layer depending on its current state.
        togglePopup: function() {
          return this._popup && this._popup.toggle(this), this;
        },
        // @method isPopupOpen(): boolean
        // Returns `true` if the popup bound to this layer is currently open.
        isPopupOpen: function() {
          return this._popup ? this._popup.isOpen() : !1;
        },
        // @method setPopupContent(content: String|HTMLElement|Popup): this
        // Sets the content of the popup bound to this layer.
        setPopupContent: function(t) {
          return this._popup && this._popup.setContent(t), this;
        },
        // @method getPopup(): Popup
        // Returns the popup bound to this layer.
        getPopup: function() {
          return this._popup;
        },
        _openPopup: function(t) {
          if (!(!this._popup || !this._map)) {
            kt(t);
            var e = t.layer || t.target;
            if (this._popup._source === e && !(e instanceof wt)) {
              this._map.hasLayer(this._popup) ? this.closePopup() : this.openPopup(t.latlng);
              return;
            }
            this._popup._source = e, this.openPopup(t.latlng);
          }
        },
        _movePopup: function(t) {
          this._popup.setLatLng(t.latlng);
        },
        _onKeyPress: function(t) {
          t.originalEvent.keyCode === 13 && this._openPopup(t);
        }
      });
      var De = dt.extend({
        // @section
        // @aka Tooltip options
        options: {
          // @option pane: String = 'tooltipPane'
          // `Map pane` where the tooltip will be added.
          pane: "tooltipPane",
          // @option offset: Point = Point(0, 0)
          // Optional offset of the tooltip position.
          offset: [0, 0],
          // @option direction: String = 'auto'
          // Direction where to open the tooltip. Possible values are: `right`, `left`,
          // `top`, `bottom`, `center`, `auto`.
          // `auto` will dynamically switch between `right` and `left` according to the tooltip
          // position on the map.
          direction: "auto",
          // @option permanent: Boolean = false
          // Whether to open the tooltip permanently or only on mouseover.
          permanent: !1,
          // @option sticky: Boolean = false
          // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
          sticky: !1,
          // @option opacity: Number = 0.9
          // Tooltip container opacity.
          opacity: 0.9
        },
        onAdd: function(t) {
          dt.prototype.onAdd.call(this, t), this.setOpacity(this.options.opacity), t.fire("tooltipopen", { tooltip: this }), this._source && (this.addEventParent(this._source), this._source.fire("tooltipopen", { tooltip: this }, !0));
        },
        onRemove: function(t) {
          dt.prototype.onRemove.call(this, t), t.fire("tooltipclose", { tooltip: this }), this._source && (this.removeEventParent(this._source), this._source.fire("tooltipclose", { tooltip: this }, !0));
        },
        getEvents: function() {
          var t = dt.prototype.getEvents.call(this);
          return this.options.permanent || (t.preclick = this.close), t;
        },
        _initLayout: function() {
          var t = "leaflet-tooltip", e = t + " " + (this.options.className || "") + " leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide");
          this._contentNode = this._container = I("div", e), this._container.setAttribute("role", "tooltip"), this._container.setAttribute("id", "leaflet-tooltip-" + v(this));
        },
        _updateLayout: function() {
        },
        _adjustPan: function() {
        },
        _setPosition: function(t) {
          var e, i, n = this._map, r = this._container, a = n.latLngToContainerPoint(n.getCenter()), c = n.layerPointToContainerPoint(t), p = this.options.direction, _ = r.offsetWidth, g = r.offsetHeight, y = P(this.options.offset), w = this._getAnchor();
          p === "top" ? (e = _ / 2, i = g) : p === "bottom" ? (e = _ / 2, i = 0) : p === "center" ? (e = _ / 2, i = g / 2) : p === "right" ? (e = 0, i = g / 2) : p === "left" ? (e = _, i = g / 2) : c.x < a.x ? (p = "right", e = 0, i = g / 2) : (p = "left", e = _ + (y.x + w.x) * 2, i = g / 2), t = t.subtract(P(e, i, !0)).add(y).add(w), F(r, "leaflet-tooltip-right"), F(r, "leaflet-tooltip-left"), F(r, "leaflet-tooltip-top"), F(r, "leaflet-tooltip-bottom"), S(r, "leaflet-tooltip-" + p), W(r, t);
        },
        _updatePosition: function() {
          var t = this._map.latLngToLayerPoint(this._latlng);
          this._setPosition(t);
        },
        setOpacity: function(t) {
          this.options.opacity = t, this._container && nt(this._container, t);
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
          this._setPosition(e);
        },
        _getAnchor: function() {
          return P(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
        }
      }), Wr = function(t, e) {
        return new De(t, e);
      };
      E.include({
        // @method openTooltip(tooltip: Tooltip): this
        // Opens the specified tooltip.
        // @alternative
        // @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
        // Creates a tooltip with the specified content and options and open it.
        openTooltip: function(t, e, i) {
          return this._initOverlay(De, t, e, i).openOn(this), this;
        },
        // @method closeTooltip(tooltip: Tooltip): this
        // Closes the tooltip given as parameter.
        closeTooltip: function(t) {
          return t.close(), this;
        }
      }), lt.include({
        // @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
        // Binds a tooltip to the layer with the passed `content` and sets up the
        // necessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindTooltip: function(t, e) {
          return this._tooltip && this.isTooltipOpen() && this.unbindTooltip(), this._tooltip = this._initOverlay(De, this._tooltip, t, e), this._initTooltipInteractions(), this._tooltip.options.permanent && this._map && this._map.hasLayer(this) && this.openTooltip(), this;
        },
        // @method unbindTooltip(): this
        // Removes the tooltip previously bound with `bindTooltip`.
        unbindTooltip: function() {
          return this._tooltip && (this._initTooltipInteractions(!0), this.closeTooltip(), this._tooltip = null), this;
        },
        _initTooltipInteractions: function(t) {
          if (!(!t && this._tooltipHandlersAdded)) {
            var e = t ? "off" : "on", i = {
              remove: this.closeTooltip,
              move: this._moveTooltip
            };
            this._tooltip.options.permanent ? i.add = this._openTooltip : (i.mouseover = this._openTooltip, i.mouseout = this.closeTooltip, i.click = this._openTooltip, this._map ? this._addFocusListeners() : i.add = this._addFocusListeners), this._tooltip.options.sticky && (i.mousemove = this._moveTooltip), this[e](i), this._tooltipHandlersAdded = !t;
          }
        },
        // @method openTooltip(latlng?: LatLng): this
        // Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
        openTooltip: function(t) {
          return this._tooltip && (this instanceof _t || (this._tooltip._source = this), this._tooltip._prepareOpen(t) && (this._tooltip.openOn(this._map), this.getElement ? this._setAriaDescribedByOnLayer(this) : this.eachLayer && this.eachLayer(this._setAriaDescribedByOnLayer, this))), this;
        },
        // @method closeTooltip(): this
        // Closes the tooltip bound to this layer if it is open.
        closeTooltip: function() {
          if (this._tooltip)
            return this._tooltip.close();
        },
        // @method toggleTooltip(): this
        // Opens or closes the tooltip bound to this layer depending on its current state.
        toggleTooltip: function() {
          return this._tooltip && this._tooltip.toggle(this), this;
        },
        // @method isTooltipOpen(): boolean
        // Returns `true` if the tooltip bound to this layer is currently open.
        isTooltipOpen: function() {
          return this._tooltip.isOpen();
        },
        // @method setTooltipContent(content: String|HTMLElement|Tooltip): this
        // Sets the content of the tooltip bound to this layer.
        setTooltipContent: function(t) {
          return this._tooltip && this._tooltip.setContent(t), this;
        },
        // @method getTooltip(): Tooltip
        // Returns the tooltip bound to this layer.
        getTooltip: function() {
          return this._tooltip;
        },
        _addFocusListeners: function() {
          this.getElement ? this._addFocusListenersOnLayer(this) : this.eachLayer && this.eachLayer(this._addFocusListenersOnLayer, this);
        },
        _addFocusListenersOnLayer: function(t) {
          var e = typeof t.getElement == "function" && t.getElement();
          e && (A(e, "focus", function() {
            this._tooltip._source = t, this.openTooltip();
          }, this), A(e, "blur", this.closeTooltip, this));
        },
        _setAriaDescribedByOnLayer: function(t) {
          var e = typeof t.getElement == "function" && t.getElement();
          e && e.setAttribute("aria-describedby", this._tooltip._container.id);
        },
        _openTooltip: function(t) {
          if (!(!this._tooltip || !this._map)) {
            if (this._map.dragging && this._map.dragging.moving() && !this._openOnceFlag) {
              this._openOnceFlag = !0;
              var e = this;
              this._map.once("moveend", function() {
                e._openOnceFlag = !1, e._openTooltip(t);
              });
              return;
            }
            this._tooltip._source = t.layer || t.target, this.openTooltip(this._tooltip.options.sticky ? t.latlng : void 0);
          }
        },
        _moveTooltip: function(t) {
          var e = t.latlng, i, n;
          this._tooltip.options.sticky && t.originalEvent && (i = this._map.mouseEventToContainerPoint(t.originalEvent), n = this._map.containerPointToLayerPoint(i), e = this._map.layerPointToLatLng(n)), this._tooltip.setLatLng(e);
        }
      });
      var Dn = Nt.extend({
        options: {
          // @section
          // @aka DivIcon options
          iconSize: [12, 12],
          // also can be set through CSS
          // iconAnchor: (Point),
          // popupAnchor: (Point),
          // @option html: String|HTMLElement = ''
          // Custom HTML code to put inside the div element, empty by default. Alternatively,
          // an instance of `HTMLElement`.
          html: !1,
          // @option bgPos: Point = [0, 0]
          // Optional relative position of the background, in pixels
          bgPos: null,
          className: "leaflet-div-icon"
        },
        createIcon: function(t) {
          var e = t && t.tagName === "DIV" ? t : document.createElement("div"), i = this.options;
          if (i.html instanceof Element ? (Ae(e), e.appendChild(i.html)) : e.innerHTML = i.html !== !1 ? i.html : "", i.bgPos) {
            var n = P(i.bgPos);
            e.style.backgroundPosition = -n.x + "px " + -n.y + "px";
          }
          return this._setIconStyles(e, "icon"), e;
        },
        createShadow: function() {
          return null;
        }
      });
      function Ur(t) {
        return new Dn(t);
      }
      Nt.Default = ae;
      var le = lt.extend({
        // @section
        // @aka GridLayer options
        options: {
          // @option tileSize: Number|Point = 256
          // Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
          tileSize: 256,
          // @option opacity: Number = 1.0
          // Opacity of the tiles. Can be used in the `createTile()` function.
          opacity: 1,
          // @option updateWhenIdle: Boolean = (depends)
          // Load new tiles only when panning ends.
          // `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
          // `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
          // [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
          updateWhenIdle: b.mobile,
          // @option updateWhenZooming: Boolean = true
          // By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
          updateWhenZooming: !0,
          // @option updateInterval: Number = 200
          // Tiles will not update more than once every `updateInterval` milliseconds when panning.
          updateInterval: 200,
          // @option zIndex: Number = 1
          // The explicit zIndex of the tile layer.
          zIndex: 1,
          // @option bounds: LatLngBounds = undefined
          // If set, tiles will only be loaded inside the set `LatLngBounds`.
          bounds: null,
          // @option minZoom: Number = 0
          // The minimum zoom level down to which this layer will be displayed (inclusive).
          minZoom: 0,
          // @option maxZoom: Number = undefined
          // The maximum zoom level up to which this layer will be displayed (inclusive).
          maxZoom: void 0,
          // @option maxNativeZoom: Number = undefined
          // Maximum zoom number the tile source has available. If it is specified,
          // the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
          // from `maxNativeZoom` level and auto-scaled.
          maxNativeZoom: void 0,
          // @option minNativeZoom: Number = undefined
          // Minimum zoom number the tile source has available. If it is specified,
          // the tiles on all zoom levels lower than `minNativeZoom` will be loaded
          // from `minNativeZoom` level and auto-scaled.
          minNativeZoom: void 0,
          // @option noWrap: Boolean = false
          // Whether the layer is wrapped around the antimeridian. If `true`, the
          // GridLayer will only be displayed once at low zoom levels. Has no
          // effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
          // in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
          // tiles outside the CRS limits.
          noWrap: !1,
          // @option pane: String = 'tilePane'
          // `Map pane` where the grid layer will be added.
          pane: "tilePane",
          // @option className: String = ''
          // A custom class name to assign to the tile layer. Empty by default.
          className: "",
          // @option keepBuffer: Number = 2
          // When panning the map, keep this many rows and columns of tiles before unloading them.
          keepBuffer: 2
        },
        initialize: function(t) {
          B(this, t);
        },
        onAdd: function() {
          this._initContainer(), this._levels = {}, this._tiles = {}, this._resetView();
        },
        beforeAdd: function(t) {
          t._addZoomLimit(this);
        },
        onRemove: function(t) {
          this._removeAllTiles(), D(this._container), t._removeZoomLimit(this), this._container = null, this._tileZoom = void 0;
        },
        // @method bringToFront: this
        // Brings the tile layer to the top of all tile layers.
        bringToFront: function() {
          return this._map && (Rt(this._container), this._setAutoZIndex(Math.max)), this;
        },
        // @method bringToBack: this
        // Brings the tile layer to the bottom of all tile layers.
        bringToBack: function() {
          return this._map && (Bt(this._container), this._setAutoZIndex(Math.min)), this;
        },
        // @method getContainer: HTMLElement
        // Returns the HTML element that contains the tiles for this layer.
        getContainer: function() {
          return this._container;
        },
        // @method setOpacity(opacity: Number): this
        // Changes the [opacity](#gridlayer-opacity) of the grid layer.
        setOpacity: function(t) {
          return this.options.opacity = t, this._updateOpacity(), this;
        },
        // @method setZIndex(zIndex: Number): this
        // Changes the [zIndex](#gridlayer-zindex) of the grid layer.
        setZIndex: function(t) {
          return this.options.zIndex = t, this._updateZIndex(), this;
        },
        // @method isLoading: Boolean
        // Returns `true` if any tile in the grid layer has not finished loading.
        isLoading: function() {
          return this._loading;
        },
        // @method redraw: this
        // Causes the layer to clear all the tiles and request them again.
        redraw: function() {
          if (this._map) {
            this._removeAllTiles();
            var t = this._clampZoom(this._map.getZoom());
            t !== this._tileZoom && (this._tileZoom = t, this._updateLevels()), this._update();
          }
          return this;
        },
        getEvents: function() {
          var t = {
            viewprereset: this._invalidateAll,
            viewreset: this._resetView,
            zoom: this._resetView,
            moveend: this._onMoveEnd
          };
          return this.options.updateWhenIdle || (this._onMove || (this._onMove = M(this._onMoveEnd, this.options.updateInterval, this)), t.move = this._onMove), this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        // @section Extension methods
        // Layers extending `GridLayer` shall reimplement the following method.
        // @method createTile(coords: Object, done?: Function): HTMLElement
        // Called only internally, must be overridden by classes extending `GridLayer`.
        // Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
        // is specified, it must be called when the tile has finished loading and drawing.
        createTile: function() {
          return document.createElement("div");
        },
        // @section
        // @method getTileSize: Point
        // Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
        getTileSize: function() {
          var t = this.options.tileSize;
          return t instanceof T ? t : new T(t, t);
        },
        _updateZIndex: function() {
          this._container && this.options.zIndex !== void 0 && this.options.zIndex !== null && (this._container.style.zIndex = this.options.zIndex);
        },
        _setAutoZIndex: function(t) {
          for (var e = this.getPane().children, i = -t(-1 / 0, 1 / 0), n = 0, r = e.length, a; n < r; n++)
            a = e[n].style.zIndex, e[n] !== this._container && a && (i = t(i, +a));
          isFinite(i) && (this.options.zIndex = i + t(-1, 1), this._updateZIndex());
        },
        _updateOpacity: function() {
          if (this._map && !b.ielt9) {
            nt(this._container, this.options.opacity);
            var t = +/* @__PURE__ */ new Date(), e = !1, i = !1;
            for (var n in this._tiles) {
              var r = this._tiles[n];
              if (!(!r.current || !r.loaded)) {
                var a = Math.min(1, (t - r.loaded) / 200);
                nt(r.el, a), a < 1 ? e = !0 : (r.active ? i = !0 : this._onOpaqueTile(r), r.active = !0);
              }
            }
            i && !this._noPrune && this._pruneTiles(), e && (it(this._fadeFrame), this._fadeFrame = J(this._updateOpacity, this));
          }
        },
        _onOpaqueTile: x,
        _initContainer: function() {
          this._container || (this._container = I("div", "leaflet-layer " + (this.options.className || "")), this._updateZIndex(), this.options.opacity < 1 && this._updateOpacity(), this.getPane().appendChild(this._container));
        },
        _updateLevels: function() {
          var t = this._tileZoom, e = this.options.maxZoom;
          if (t !== void 0) {
            for (var i in this._levels)
              i = Number(i), this._levels[i].el.children.length || i === t ? (this._levels[i].el.style.zIndex = e - Math.abs(t - i), this._onUpdateLevel(i)) : (D(this._levels[i].el), this._removeTilesAtZoom(i), this._onRemoveLevel(i), delete this._levels[i]);
            var n = this._levels[t], r = this._map;
            return n || (n = this._levels[t] = {}, n.el = I("div", "leaflet-tile-container leaflet-zoom-animated", this._container), n.el.style.zIndex = e, n.origin = r.project(r.unproject(r.getPixelOrigin()), t).round(), n.zoom = t, this._setZoomTransform(n, r.getCenter(), r.getZoom()), x(n.el.offsetWidth), this._onCreateLevel(n)), this._level = n, n;
          }
        },
        _onUpdateLevel: x,
        _onRemoveLevel: x,
        _onCreateLevel: x,
        _pruneTiles: function() {
          if (this._map) {
            var t, e, i = this._map.getZoom();
            if (i > this.options.maxZoom || i < this.options.minZoom) {
              this._removeAllTiles();
              return;
            }
            for (t in this._tiles)
              e = this._tiles[t], e.retain = e.current;
            for (t in this._tiles)
              if (e = this._tiles[t], e.current && !e.active) {
                var n = e.coords;
                this._retainParent(n.x, n.y, n.z, n.z - 5) || this._retainChildren(n.x, n.y, n.z, n.z + 2);
              }
            for (t in this._tiles)
              this._tiles[t].retain || this._removeTile(t);
          }
        },
        _removeTilesAtZoom: function(t) {
          for (var e in this._tiles)
            this._tiles[e].coords.z === t && this._removeTile(e);
        },
        _removeAllTiles: function() {
          for (var t in this._tiles)
            this._removeTile(t);
        },
        _invalidateAll: function() {
          for (var t in this._levels)
            D(this._levels[t].el), this._onRemoveLevel(Number(t)), delete this._levels[t];
          this._removeAllTiles(), this._tileZoom = void 0;
        },
        _retainParent: function(t, e, i, n) {
          var r = Math.floor(t / 2), a = Math.floor(e / 2), c = i - 1, p = new T(+r, +a);
          p.z = +c;
          var _ = this._tileCoordsToKey(p), g = this._tiles[_];
          return g && g.active ? (g.retain = !0, !0) : (g && g.loaded && (g.retain = !0), c > n ? this._retainParent(r, a, c, n) : !1);
        },
        _retainChildren: function(t, e, i, n) {
          for (var r = 2 * t; r < 2 * t + 2; r++)
            for (var a = 2 * e; a < 2 * e + 2; a++) {
              var c = new T(r, a);
              c.z = i + 1;
              var p = this._tileCoordsToKey(c), _ = this._tiles[p];
              if (_ && _.active) {
                _.retain = !0;
                continue;
              } else _ && _.loaded && (_.retain = !0);
              i + 1 < n && this._retainChildren(r, a, i + 1, n);
            }
        },
        _resetView: function(t) {
          var e = t && (t.pinch || t.flyTo);
          this._setView(this._map.getCenter(), this._map.getZoom(), e, e);
        },
        _animateZoom: function(t) {
          this._setView(t.center, t.zoom, !0, t.noUpdate);
        },
        _clampZoom: function(t) {
          var e = this.options;
          return e.minNativeZoom !== void 0 && t < e.minNativeZoom ? e.minNativeZoom : e.maxNativeZoom !== void 0 && e.maxNativeZoom < t ? e.maxNativeZoom : t;
        },
        _setView: function(t, e, i, n) {
          var r = Math.round(e);
          this.options.maxZoom !== void 0 && r > this.options.maxZoom || this.options.minZoom !== void 0 && r < this.options.minZoom ? r = void 0 : r = this._clampZoom(r);
          var a = this.options.updateWhenZooming && r !== this._tileZoom;
          (!n || a) && (this._tileZoom = r, this._abortLoading && this._abortLoading(), this._updateLevels(), this._resetGrid(), r !== void 0 && this._update(t), i || this._pruneTiles(), this._noPrune = !!i), this._setZoomTransforms(t, e);
        },
        _setZoomTransforms: function(t, e) {
          for (var i in this._levels)
            this._setZoomTransform(this._levels[i], t, e);
        },
        _setZoomTransform: function(t, e, i) {
          var n = this._map.getZoomScale(i, t.zoom), r = t.origin.multiplyBy(n).subtract(this._map._getNewPixelOrigin(e, i)).round();
          b.any3d ? Tt(t.el, r, n) : W(t.el, r);
        },
        _resetGrid: function() {
          var t = this._map, e = t.options.crs, i = this._tileSize = this.getTileSize(), n = this._tileZoom, r = this._map.getPixelWorldBounds(this._tileZoom);
          r && (this._globalTileRange = this._pxBoundsToTileRange(r)), this._wrapX = e.wrapLng && !this.options.noWrap && [
            Math.floor(t.project([0, e.wrapLng[0]], n).x / i.x),
            Math.ceil(t.project([0, e.wrapLng[1]], n).x / i.y)
          ], this._wrapY = e.wrapLat && !this.options.noWrap && [
            Math.floor(t.project([e.wrapLat[0], 0], n).y / i.x),
            Math.ceil(t.project([e.wrapLat[1], 0], n).y / i.y)
          ];
        },
        _onMoveEnd: function() {
          !this._map || this._map._animatingZoom || this._update();
        },
        _getTiledPixelBounds: function(t) {
          var e = this._map, i = e._animatingZoom ? Math.max(e._animateToZoom, e.getZoom()) : e.getZoom(), n = e.getZoomScale(i, this._tileZoom), r = e.project(t, this._tileZoom).floor(), a = e.getSize().divideBy(n * 2);
          return new N(r.subtract(a), r.add(a));
        },
        // Private method to load tiles in the grid's active zoom level according to map bounds
        _update: function(t) {
          var e = this._map;
          if (e) {
            var i = this._clampZoom(e.getZoom());
            if (t === void 0 && (t = e.getCenter()), this._tileZoom !== void 0) {
              var n = this._getTiledPixelBounds(t), r = this._pxBoundsToTileRange(n), a = r.getCenter(), c = [], p = this.options.keepBuffer, _ = new N(
                r.getBottomLeft().subtract([p, -p]),
                r.getTopRight().add([p, -p])
              );
              if (!(isFinite(r.min.x) && isFinite(r.min.y) && isFinite(r.max.x) && isFinite(r.max.y)))
                throw new Error("Attempted to load an infinite number of tiles");
              for (var g in this._tiles) {
                var y = this._tiles[g].coords;
                (y.z !== this._tileZoom || !_.contains(new T(y.x, y.y))) && (this._tiles[g].current = !1);
              }
              if (Math.abs(i - this._tileZoom) > 1) {
                this._setView(t, i);
                return;
              }
              for (var w = r.min.y; w <= r.max.y; w++)
                for (var k = r.min.x; k <= r.max.x; k++) {
                  var G = new T(k, w);
                  if (G.z = this._tileZoom, !!this._isValidTile(G)) {
                    var V = this._tiles[this._tileCoordsToKey(G)];
                    V ? V.current = !0 : c.push(G);
                  }
                }
              if (c.sort(function(tt, jt) {
                return tt.distanceTo(a) - jt.distanceTo(a);
              }), c.length !== 0) {
                this._loading || (this._loading = !0, this.fire("loading"));
                var rt = document.createDocumentFragment();
                for (k = 0; k < c.length; k++)
                  this._addTile(c[k], rt);
                this._level.el.appendChild(rt);
              }
            }
          }
        },
        _isValidTile: function(t) {
          var e = this._map.options.crs;
          if (!e.infinite) {
            var i = this._globalTileRange;
            if (!e.wrapLng && (t.x < i.min.x || t.x > i.max.x) || !e.wrapLat && (t.y < i.min.y || t.y > i.max.y))
              return !1;
          }
          if (!this.options.bounds)
            return !0;
          var n = this._tileCoordsToBounds(t);
          return j(this.options.bounds).overlaps(n);
        },
        _keyToBounds: function(t) {
          return this._tileCoordsToBounds(this._keyToTileCoords(t));
        },
        _tileCoordsToNwSe: function(t) {
          var e = this._map, i = this.getTileSize(), n = t.scaleBy(i), r = n.add(i), a = e.unproject(n, t.z), c = e.unproject(r, t.z);
          return [a, c];
        },
        // converts tile coordinates to its geographical bounds
        _tileCoordsToBounds: function(t) {
          var e = this._tileCoordsToNwSe(t), i = new Q(e[0], e[1]);
          return this.options.noWrap || (i = this._map.wrapLatLngBounds(i)), i;
        },
        // converts tile coordinates to key for the tile cache
        _tileCoordsToKey: function(t) {
          return t.x + ":" + t.y + ":" + t.z;
        },
        // converts tile cache key to coordinates
        _keyToTileCoords: function(t) {
          var e = t.split(":"), i = new T(+e[0], +e[1]);
          return i.z = +e[2], i;
        },
        _removeTile: function(t) {
          var e = this._tiles[t];
          e && (D(e.el), delete this._tiles[t], this.fire("tileunload", {
            tile: e.el,
            coords: this._keyToTileCoords(t)
          }));
        },
        _initTile: function(t) {
          S(t, "leaflet-tile");
          var e = this.getTileSize();
          t.style.width = e.x + "px", t.style.height = e.y + "px", t.onselectstart = x, t.onmousemove = x, b.ielt9 && this.options.opacity < 1 && nt(t, this.options.opacity);
        },
        _addTile: function(t, e) {
          var i = this._getTilePos(t), n = this._tileCoordsToKey(t), r = this.createTile(this._wrapCoords(t), d(this._tileReady, this, t));
          this._initTile(r), this.createTile.length < 2 && J(d(this._tileReady, this, t, null, r)), W(r, i), this._tiles[n] = {
            el: r,
            coords: t,
            current: !0
          }, e.appendChild(r), this.fire("tileloadstart", {
            tile: r,
            coords: t
          });
        },
        _tileReady: function(t, e, i) {
          e && this.fire("tileerror", {
            error: e,
            tile: i,
            coords: t
          });
          var n = this._tileCoordsToKey(t);
          i = this._tiles[n], i && (i.loaded = +/* @__PURE__ */ new Date(), this._map._fadeAnimated ? (nt(i.el, 0), it(this._fadeFrame), this._fadeFrame = J(this._updateOpacity, this)) : (i.active = !0, this._pruneTiles()), e || (S(i.el, "leaflet-tile-loaded"), this.fire("tileload", {
            tile: i.el,
            coords: t
          })), this._noTilesToLoad() && (this._loading = !1, this.fire("load"), b.ielt9 || !this._map._fadeAnimated ? J(this._pruneTiles, this) : setTimeout(d(this._pruneTiles, this), 250)));
        },
        _getTilePos: function(t) {
          return t.scaleBy(this.getTileSize()).subtract(this._level.origin);
        },
        _wrapCoords: function(t) {
          var e = new T(
            this._wrapX ? z(t.x, this._wrapX) : t.x,
            this._wrapY ? z(t.y, this._wrapY) : t.y
          );
          return e.z = t.z, e;
        },
        _pxBoundsToTileRange: function(t) {
          var e = this.getTileSize();
          return new N(
            t.min.unscaleBy(e).floor(),
            t.max.unscaleBy(e).ceil().subtract([1, 1])
          );
        },
        _noTilesToLoad: function() {
          for (var t in this._tiles)
            if (!this._tiles[t].loaded)
              return !1;
          return !0;
        }
      });
      function Vr(t) {
        return new le(t);
      }
      var Ft = le.extend({
        // @section
        // @aka TileLayer options
        options: {
          // @option minZoom: Number = 0
          // The minimum zoom level down to which this layer will be displayed (inclusive).
          minZoom: 0,
          // @option maxZoom: Number = 18
          // The maximum zoom level up to which this layer will be displayed (inclusive).
          maxZoom: 18,
          // @option subdomains: String|String[] = 'abc'
          // Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
          subdomains: "abc",
          // @option errorTileUrl: String = ''
          // URL to the tile image to show in place of the tile that failed to load.
          errorTileUrl: "",
          // @option zoomOffset: Number = 0
          // The zoom number used in tile URLs will be offset with this value.
          zoomOffset: 0,
          // @option tms: Boolean = false
          // If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
          tms: !1,
          // @option zoomReverse: Boolean = false
          // If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
          zoomReverse: !1,
          // @option detectRetina: Boolean = false
          // If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
          detectRetina: !1,
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the tiles.
          // If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: !1,
          // @option referrerPolicy: Boolean|String = false
          // Whether the referrerPolicy attribute will be added to the tiles.
          // If a String is provided, all tiles will have their referrerPolicy attribute set to the String provided.
          // This may be needed if your map's rendering context has a strict default but your tile provider expects a valid referrer
          // (e.g. to validate an API token).
          // Refer to [HTMLImageElement.referrerPolicy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/referrerPolicy) for valid String values.
          referrerPolicy: !1
        },
        initialize: function(t, e) {
          this._url = t, e = B(this, e), e.detectRetina && b.retina && e.maxZoom > 0 ? (e.tileSize = Math.floor(e.tileSize / 2), e.zoomReverse ? (e.zoomOffset--, e.minZoom = Math.min(e.maxZoom, e.minZoom + 1)) : (e.zoomOffset++, e.maxZoom = Math.max(e.minZoom, e.maxZoom - 1)), e.minZoom = Math.max(0, e.minZoom)) : e.zoomReverse ? e.minZoom = Math.min(e.maxZoom, e.minZoom) : e.maxZoom = Math.max(e.minZoom, e.maxZoom), typeof e.subdomains == "string" && (e.subdomains = e.subdomains.split("")), this.on("tileunload", this._onTileRemove);
        },
        // @method setUrl(url: String, noRedraw?: Boolean): this
        // Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
        // If the URL does not change, the layer will not be redrawn unless
        // the noRedraw parameter is set to false.
        setUrl: function(t, e) {
          return this._url === t && e === void 0 && (e = !0), this._url = t, e || this.redraw(), this;
        },
        // @method createTile(coords: Object, done?: Function): HTMLElement
        // Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
        // to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
        // callback is called when the tile has been loaded.
        createTile: function(t, e) {
          var i = document.createElement("img");
          return A(i, "load", d(this._tileOnLoad, this, e, i)), A(i, "error", d(this._tileOnError, this, e, i)), (this.options.crossOrigin || this.options.crossOrigin === "") && (i.crossOrigin = this.options.crossOrigin === !0 ? "" : this.options.crossOrigin), typeof this.options.referrerPolicy == "string" && (i.referrerPolicy = this.options.referrerPolicy), i.alt = "", i.src = this.getTileUrl(t), i;
        },
        // @section Extension methods
        // @uninheritable
        // Layers extending `TileLayer` might reimplement the following method.
        // @method getTileUrl(coords: Object): String
        // Called only internally, returns the URL for a tile given its coordinates.
        // Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
        getTileUrl: function(t) {
          var e = {
            r: b.retina ? "@2x" : "",
            s: this._getSubdomain(t),
            x: t.x,
            y: t.y,
            z: this._getZoomForUrl()
          };
          if (this._map && !this._map.options.crs.infinite) {
            var i = this._globalTileRange.max.y - t.y;
            this.options.tms && (e.y = i), e["-y"] = i;
          }
          return Hi(this._url, l(e, this.options));
        },
        _tileOnLoad: function(t, e) {
          b.ielt9 ? setTimeout(d(t, this, null, e), 0) : t(null, e);
        },
        _tileOnError: function(t, e, i) {
          var n = this.options.errorTileUrl;
          n && e.getAttribute("src") !== n && (e.src = n), t(i, e);
        },
        _onTileRemove: function(t) {
          t.tile.onload = null;
        },
        _getZoomForUrl: function() {
          var t = this._tileZoom, e = this.options.maxZoom, i = this.options.zoomReverse, n = this.options.zoomOffset;
          return i && (t = e - t), t + n;
        },
        _getSubdomain: function(t) {
          var e = Math.abs(t.x + t.y) % this.options.subdomains.length;
          return this.options.subdomains[e];
        },
        // stops loading all tiles in the background layer
        _abortLoading: function() {
          var t, e;
          for (t in this._tiles)
            if (this._tiles[t].coords.z !== this._tileZoom && (e = this._tiles[t].el, e.onload = x, e.onerror = x, !e.complete)) {
              e.src = Pe;
              var i = this._tiles[t].coords;
              D(e), delete this._tiles[t], this.fire("tileabort", {
                tile: e,
                coords: i
              });
            }
        },
        _removeTile: function(t) {
          var e = this._tiles[t];
          if (e)
            return e.el.setAttribute("src", Pe), le.prototype._removeTile.call(this, t);
        },
        _tileReady: function(t, e, i) {
          if (!(!this._map || i && i.getAttribute("src") === Pe))
            return le.prototype._tileReady.call(this, t, e, i);
        }
      });
      function Hn(t, e) {
        return new Ft(t, e);
      }
      var Fn = Ft.extend({
        // @section
        // @aka TileLayer.WMS options
        // If any custom options not documented here are used, they will be sent to the
        // WMS server as extra parameters in each request URL. This can be useful for
        // [non-standard vendor WMS parameters](https://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
        defaultWmsParams: {
          service: "WMS",
          request: "GetMap",
          // @option layers: String = ''
          // **(required)** Comma-separated list of WMS layers to show.
          layers: "",
          // @option styles: String = ''
          // Comma-separated list of WMS styles.
          styles: "",
          // @option format: String = 'image/jpeg'
          // WMS image format (use `'image/png'` for layers with transparency).
          format: "image/jpeg",
          // @option transparent: Boolean = false
          // If `true`, the WMS service will return images with transparency.
          transparent: !1,
          // @option version: String = '1.1.1'
          // Version of the WMS service to use
          version: "1.1.1"
        },
        options: {
          // @option crs: CRS = null
          // Coordinate Reference System to use for the WMS requests, defaults to
          // map CRS. Don't change this if you're not sure what it means.
          crs: null,
          // @option uppercase: Boolean = false
          // If `true`, WMS request parameter keys will be uppercase.
          uppercase: !1
        },
        initialize: function(t, e) {
          this._url = t;
          var i = l({}, this.defaultWmsParams);
          for (var n in e)
            n in this.options || (i[n] = e[n]);
          e = B(this, e);
          var r = e.detectRetina && b.retina ? 2 : 1, a = this.getTileSize();
          i.width = a.x * r, i.height = a.y * r, this.wmsParams = i;
        },
        onAdd: function(t) {
          this._crs = this.options.crs || t.options.crs, this._wmsVersion = parseFloat(this.wmsParams.version);
          var e = this._wmsVersion >= 1.3 ? "crs" : "srs";
          this.wmsParams[e] = this._crs.code, Ft.prototype.onAdd.call(this, t);
        },
        getTileUrl: function(t) {
          var e = this._tileCoordsToNwSe(t), i = this._crs, n = X(i.project(e[0]), i.project(e[1])), r = n.min, a = n.max, c = (this._wmsVersion >= 1.3 && this._crs === In ? [r.y, r.x, a.y, a.x] : [r.x, r.y, a.x, a.y]).join(","), p = Ft.prototype.getTileUrl.call(this, t);
          return p + Yt(this.wmsParams, p, this.options.uppercase) + (this.options.uppercase ? "&BBOX=" : "&bbox=") + c;
        },
        // @method setParams(params: Object, noRedraw?: Boolean): this
        // Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
        setParams: function(t, e) {
          return l(this.wmsParams, t), e || this.redraw(), this;
        }
      });
      function qr(t, e) {
        return new Fn(t, e);
      }
      Ft.WMS = Fn, Hn.wms = qr;
      var vt = lt.extend({
        // @section
        // @aka Renderer options
        options: {
          // @option padding: Number = 0.1
          // How much to extend the clip area around the map view (relative to its size)
          // e.g. 0.1 would be 10% of map view in each direction
          padding: 0.1
        },
        initialize: function(t) {
          B(this, t), v(this), this._layers = this._layers || {};
        },
        onAdd: function() {
          this._container || (this._initContainer(), S(this._container, "leaflet-zoom-animated")), this.getPane().appendChild(this._container), this._update(), this.on("update", this._updatePaths, this);
        },
        onRemove: function() {
          this.off("update", this._updatePaths, this), this._destroyContainer();
        },
        getEvents: function() {
          var t = {
            viewreset: this._reset,
            zoom: this._onZoom,
            moveend: this._update,
            zoomend: this._onZoomEnd
          };
          return this._zoomAnimated && (t.zoomanim = this._onAnimZoom), t;
        },
        _onAnimZoom: function(t) {
          this._updateTransform(t.center, t.zoom);
        },
        _onZoom: function() {
          this._updateTransform(this._map.getCenter(), this._map.getZoom());
        },
        _updateTransform: function(t, e) {
          var i = this._map.getZoomScale(e, this._zoom), n = this._map.getSize().multiplyBy(0.5 + this.options.padding), r = this._map.project(this._center, e), a = n.multiplyBy(-i).add(r).subtract(this._map._getNewPixelOrigin(t, e));
          b.any3d ? Tt(this._container, a, i) : W(this._container, a);
        },
        _reset: function() {
          this._update(), this._updateTransform(this._center, this._zoom);
          for (var t in this._layers)
            this._layers[t]._reset();
        },
        _onZoomEnd: function() {
          for (var t in this._layers)
            this._layers[t]._project();
        },
        _updatePaths: function() {
          for (var t in this._layers)
            this._layers[t]._update();
        },
        _update: function() {
          var t = this.options.padding, e = this._map.getSize(), i = this._map.containerPointToLayerPoint(e.multiplyBy(-t)).round();
          this._bounds = new N(i, i.add(e.multiplyBy(1 + t * 2)).round()), this._center = this._map.getCenter(), this._zoom = this._map.getZoom();
        }
      }), jn = vt.extend({
        // @section
        // @aka Canvas options
        options: {
          // @option tolerance: Number = 0
          // How much to extend the click tolerance around a path/object on the map.
          tolerance: 0
        },
        getEvents: function() {
          var t = vt.prototype.getEvents.call(this);
          return t.viewprereset = this._onViewPreReset, t;
        },
        _onViewPreReset: function() {
          this._postponeUpdatePaths = !0;
        },
        onAdd: function() {
          vt.prototype.onAdd.call(this), this._draw();
        },
        _initContainer: function() {
          var t = this._container = document.createElement("canvas");
          A(t, "mousemove", this._onMouseMove, this), A(t, "click dblclick mousedown mouseup contextmenu", this._onClick, this), A(t, "mouseout", this._handleMouseOut, this), t._leaflet_disable_events = !0, this._ctx = t.getContext("2d");
        },
        _destroyContainer: function() {
          it(this._redrawRequest), delete this._ctx, D(this._container), $(this._container), delete this._container;
        },
        _updatePaths: function() {
          if (!this._postponeUpdatePaths) {
            var t;
            this._redrawBounds = null;
            for (var e in this._layers)
              t = this._layers[e], t._update();
            this._redraw();
          }
        },
        _update: function() {
          if (!(this._map._animatingZoom && this._bounds)) {
            vt.prototype._update.call(this);
            var t = this._bounds, e = this._container, i = t.getSize(), n = b.retina ? 2 : 1;
            W(e, t.min), e.width = n * i.x, e.height = n * i.y, e.style.width = i.x + "px", e.style.height = i.y + "px", b.retina && this._ctx.scale(2, 2), this._ctx.translate(-t.min.x, -t.min.y), this.fire("update");
          }
        },
        _reset: function() {
          vt.prototype._reset.call(this), this._postponeUpdatePaths && (this._postponeUpdatePaths = !1, this._updatePaths());
        },
        _initPath: function(t) {
          this._updateDashArray(t), this._layers[v(t)] = t;
          var e = t._order = {
            layer: t,
            prev: this._drawLast,
            next: null
          };
          this._drawLast && (this._drawLast.next = e), this._drawLast = e, this._drawFirst = this._drawFirst || this._drawLast;
        },
        _addPath: function(t) {
          this._requestRedraw(t);
        },
        _removePath: function(t) {
          var e = t._order, i = e.next, n = e.prev;
          i ? i.prev = n : this._drawLast = n, n ? n.next = i : this._drawFirst = i, delete t._order, delete this._layers[v(t)], this._requestRedraw(t);
        },
        _updatePath: function(t) {
          this._extendRedrawBounds(t), t._project(), t._update(), this._requestRedraw(t);
        },
        _updateStyle: function(t) {
          this._updateDashArray(t), this._requestRedraw(t);
        },
        _updateDashArray: function(t) {
          if (typeof t.options.dashArray == "string") {
            var e = t.options.dashArray.split(/[, ]+/), i = [], n, r;
            for (r = 0; r < e.length; r++) {
              if (n = Number(e[r]), isNaN(n))
                return;
              i.push(n);
            }
            t.options._dashArray = i;
          } else
            t.options._dashArray = t.options.dashArray;
        },
        _requestRedraw: function(t) {
          this._map && (this._extendRedrawBounds(t), this._redrawRequest = this._redrawRequest || J(this._redraw, this));
        },
        _extendRedrawBounds: function(t) {
          if (t._pxBounds) {
            var e = (t.options.weight || 0) + 1;
            this._redrawBounds = this._redrawBounds || new N(), this._redrawBounds.extend(t._pxBounds.min.subtract([e, e])), this._redrawBounds.extend(t._pxBounds.max.add([e, e]));
          }
        },
        _redraw: function() {
          this._redrawRequest = null, this._redrawBounds && (this._redrawBounds.min._floor(), this._redrawBounds.max._ceil()), this._clear(), this._draw(), this._redrawBounds = null;
        },
        _clear: function() {
          var t = this._redrawBounds;
          if (t) {
            var e = t.getSize();
            this._ctx.clearRect(t.min.x, t.min.y, e.x, e.y);
          } else
            this._ctx.save(), this._ctx.setTransform(1, 0, 0, 1, 0, 0), this._ctx.clearRect(0, 0, this._container.width, this._container.height), this._ctx.restore();
        },
        _draw: function() {
          var t, e = this._redrawBounds;
          if (this._ctx.save(), e) {
            var i = e.getSize();
            this._ctx.beginPath(), this._ctx.rect(e.min.x, e.min.y, i.x, i.y), this._ctx.clip();
          }
          this._drawing = !0;
          for (var n = this._drawFirst; n; n = n.next)
            t = n.layer, (!e || t._pxBounds && t._pxBounds.intersects(e)) && t._updatePath();
          this._drawing = !1, this._ctx.restore();
        },
        _updatePoly: function(t, e) {
          if (this._drawing) {
            var i, n, r, a, c = t._parts, p = c.length, _ = this._ctx;
            if (p) {
              for (_.beginPath(), i = 0; i < p; i++) {
                for (n = 0, r = c[i].length; n < r; n++)
                  a = c[i][n], _[n ? "lineTo" : "moveTo"](a.x, a.y);
                e && _.closePath();
              }
              this._fillStroke(_, t);
            }
          }
        },
        _updateCircle: function(t) {
          if (!(!this._drawing || t._empty())) {
            var e = t._point, i = this._ctx, n = Math.max(Math.round(t._radius), 1), r = (Math.max(Math.round(t._radiusY), 1) || n) / n;
            r !== 1 && (i.save(), i.scale(1, r)), i.beginPath(), i.arc(e.x, e.y / r, n, 0, Math.PI * 2, !1), r !== 1 && i.restore(), this._fillStroke(i, t);
          }
        },
        _fillStroke: function(t, e) {
          var i = e.options;
          i.fill && (t.globalAlpha = i.fillOpacity, t.fillStyle = i.fillColor || i.color, t.fill(i.fillRule || "evenodd")), i.stroke && i.weight !== 0 && (t.setLineDash && t.setLineDash(e.options && e.options._dashArray || []), t.globalAlpha = i.opacity, t.lineWidth = i.weight, t.strokeStyle = i.color, t.lineCap = i.lineCap, t.lineJoin = i.lineJoin, t.stroke());
        },
        // Canvas obviously doesn't have mouse events for individual drawn objects,
        // so we emulate that by calculating what's under the mouse on mousemove/click manually
        _onClick: function(t) {
          for (var e = this._map.mouseEventToLayerPoint(t), i, n, r = this._drawFirst; r; r = r.next)
            i = r.layer, i.options.interactive && i._containsPoint(e) && (!(t.type === "click" || t.type === "preclick") || !this._map._draggableMoved(i)) && (n = i);
          this._fireEvent(n ? [n] : !1, t);
        },
        _onMouseMove: function(t) {
          if (!(!this._map || this._map.dragging.moving() || this._map._animatingZoom)) {
            var e = this._map.mouseEventToLayerPoint(t);
            this._handleMouseHover(t, e);
          }
        },
        _handleMouseOut: function(t) {
          var e = this._hoveredLayer;
          e && (F(this._container, "leaflet-interactive"), this._fireEvent([e], t, "mouseout"), this._hoveredLayer = null, this._mouseHoverThrottled = !1);
        },
        _handleMouseHover: function(t, e) {
          if (!this._mouseHoverThrottled) {
            for (var i, n, r = this._drawFirst; r; r = r.next)
              i = r.layer, i.options.interactive && i._containsPoint(e) && (n = i);
            n !== this._hoveredLayer && (this._handleMouseOut(t), n && (S(this._container, "leaflet-interactive"), this._fireEvent([n], t, "mouseover"), this._hoveredLayer = n)), this._fireEvent(this._hoveredLayer ? [this._hoveredLayer] : !1, t), this._mouseHoverThrottled = !0, setTimeout(d(function() {
              this._mouseHoverThrottled = !1;
            }, this), 32);
          }
        },
        _fireEvent: function(t, e, i) {
          this._map._fireDOMEvent(e, i || e.type, t);
        },
        _bringToFront: function(t) {
          var e = t._order;
          if (e) {
            var i = e.next, n = e.prev;
            if (i)
              i.prev = n;
            else
              return;
            n ? n.next = i : i && (this._drawFirst = i), e.prev = this._drawLast, this._drawLast.next = e, e.next = null, this._drawLast = e, this._requestRedraw(t);
          }
        },
        _bringToBack: function(t) {
          var e = t._order;
          if (e) {
            var i = e.next, n = e.prev;
            if (n)
              n.next = i;
            else
              return;
            i ? i.prev = n : n && (this._drawLast = n), e.prev = null, e.next = this._drawFirst, this._drawFirst.prev = e, this._drawFirst = e, this._requestRedraw(t);
          }
        }
      });
      function Wn(t) {
        return b.canvas ? new jn(t) : null;
      }
      var he = (function() {
        try {
          return document.namespaces.add("lvml", "urn:schemas-microsoft-com:vml"), function(t) {
            return document.createElement("<lvml:" + t + ' class="lvml">');
          };
        } catch {
        }
        return function(t) {
          return document.createElement("<" + t + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
        };
      })(), Gr = {
        _initContainer: function() {
          this._container = I("div", "leaflet-vml-container");
        },
        _update: function() {
          this._map._animatingZoom || (vt.prototype._update.call(this), this.fire("update"));
        },
        _initPath: function(t) {
          var e = t._container = he("shape");
          S(e, "leaflet-vml-shape " + (this.options.className || "")), e.coordsize = "1 1", t._path = he("path"), e.appendChild(t._path), this._updateStyle(t), this._layers[v(t)] = t;
        },
        _addPath: function(t) {
          var e = t._container;
          this._container.appendChild(e), t.options.interactive && t.addInteractiveTarget(e);
        },
        _removePath: function(t) {
          var e = t._container;
          D(e), t.removeInteractiveTarget(e), delete this._layers[v(t)];
        },
        _updateStyle: function(t) {
          var e = t._stroke, i = t._fill, n = t.options, r = t._container;
          r.stroked = !!n.stroke, r.filled = !!n.fill, n.stroke ? (e || (e = t._stroke = he("stroke")), r.appendChild(e), e.weight = n.weight + "px", e.color = n.color, e.opacity = n.opacity, n.dashArray ? e.dashStyle = st(n.dashArray) ? n.dashArray.join(" ") : n.dashArray.replace(/( *, *)/g, " ") : e.dashStyle = "", e.endcap = n.lineCap.replace("butt", "flat"), e.joinstyle = n.lineJoin) : e && (r.removeChild(e), t._stroke = null), n.fill ? (i || (i = t._fill = he("fill")), r.appendChild(i), i.color = n.fillColor || n.color, i.opacity = n.fillOpacity) : i && (r.removeChild(i), t._fill = null);
        },
        _updateCircle: function(t) {
          var e = t._point.round(), i = Math.round(t._radius), n = Math.round(t._radiusY || i);
          this._setPath(t, t._empty() ? "M0 0" : "AL " + e.x + "," + e.y + " " + i + "," + n + " 0," + 65535 * 360);
        },
        _setPath: function(t, e) {
          t._path.v = e;
        },
        _bringToFront: function(t) {
          Rt(t._container);
        },
        _bringToBack: function(t) {
          Bt(t._container);
        }
      }, He = b.vml ? he : qi, ce = vt.extend({
        _initContainer: function() {
          this._container = He("svg"), this._container.setAttribute("pointer-events", "none"), this._rootGroup = He("g"), this._container.appendChild(this._rootGroup);
        },
        _destroyContainer: function() {
          D(this._container), $(this._container), delete this._container, delete this._rootGroup, delete this._svgSize;
        },
        _update: function() {
          if (!(this._map._animatingZoom && this._bounds)) {
            vt.prototype._update.call(this);
            var t = this._bounds, e = t.getSize(), i = this._container;
            (!this._svgSize || !this._svgSize.equals(e)) && (this._svgSize = e, i.setAttribute("width", e.x), i.setAttribute("height", e.y)), W(i, t.min), i.setAttribute("viewBox", [t.min.x, t.min.y, e.x, e.y].join(" ")), this.fire("update");
          }
        },
        // methods below are called by vector layers implementations
        _initPath: function(t) {
          var e = t._path = He("path");
          t.options.className && S(e, t.options.className), t.options.interactive && S(e, "leaflet-interactive"), this._updateStyle(t), this._layers[v(t)] = t;
        },
        _addPath: function(t) {
          this._rootGroup || this._initContainer(), this._rootGroup.appendChild(t._path), t.addInteractiveTarget(t._path);
        },
        _removePath: function(t) {
          D(t._path), t.removeInteractiveTarget(t._path), delete this._layers[v(t)];
        },
        _updatePath: function(t) {
          t._project(), t._update();
        },
        _updateStyle: function(t) {
          var e = t._path, i = t.options;
          e && (i.stroke ? (e.setAttribute("stroke", i.color), e.setAttribute("stroke-opacity", i.opacity), e.setAttribute("stroke-width", i.weight), e.setAttribute("stroke-linecap", i.lineCap), e.setAttribute("stroke-linejoin", i.lineJoin), i.dashArray ? e.setAttribute("stroke-dasharray", i.dashArray) : e.removeAttribute("stroke-dasharray"), i.dashOffset ? e.setAttribute("stroke-dashoffset", i.dashOffset) : e.removeAttribute("stroke-dashoffset")) : e.setAttribute("stroke", "none"), i.fill ? (e.setAttribute("fill", i.fillColor || i.color), e.setAttribute("fill-opacity", i.fillOpacity), e.setAttribute("fill-rule", i.fillRule || "evenodd")) : e.setAttribute("fill", "none"));
        },
        _updatePoly: function(t, e) {
          this._setPath(t, Gi(t._parts, e));
        },
        _updateCircle: function(t) {
          var e = t._point, i = Math.max(Math.round(t._radius), 1), n = Math.max(Math.round(t._radiusY), 1) || i, r = "a" + i + "," + n + " 0 1,0 ", a = t._empty() ? "M0 0" : "M" + (e.x - i) + "," + e.y + r + i * 2 + ",0 " + r + -i * 2 + ",0 ";
          this._setPath(t, a);
        },
        _setPath: function(t, e) {
          t._path.setAttribute("d", e);
        },
        // SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
        _bringToFront: function(t) {
          Rt(t._path);
        },
        _bringToBack: function(t) {
          Bt(t._path);
        }
      });
      b.vml && ce.include(Gr);
      function Un(t) {
        return b.svg || b.vml ? new ce(t) : null;
      }
      E.include({
        // @namespace Map; @method getRenderer(layer: Path): Renderer
        // Returns the instance of `Renderer` that should be used to render the given
        // `Path`. It will ensure that the `renderer` options of the map and paths
        // are respected, and that the renderers do exist on the map.
        getRenderer: function(t) {
          var e = t.options.renderer || this._getPaneRenderer(t.options.pane) || this.options.renderer || this._renderer;
          return e || (e = this._renderer = this._createRenderer()), this.hasLayer(e) || this.addLayer(e), e;
        },
        _getPaneRenderer: function(t) {
          if (t === "overlayPane" || t === void 0)
            return !1;
          var e = this._paneRenderers[t];
          return e === void 0 && (e = this._createRenderer({ pane: t }), this._paneRenderers[t] = e), e;
        },
        _createRenderer: function(t) {
          return this.options.preferCanvas && Wn(t) || Un(t);
        }
      });
      var Vn = Dt.extend({
        initialize: function(t, e) {
          Dt.prototype.initialize.call(this, this._boundsToLatLngs(t), e);
        },
        // @method setBounds(latLngBounds: LatLngBounds): this
        // Redraws the rectangle with the passed bounds.
        setBounds: function(t) {
          return this.setLatLngs(this._boundsToLatLngs(t));
        },
        _boundsToLatLngs: function(t) {
          return t = j(t), [
            t.getSouthWest(),
            t.getNorthWest(),
            t.getNorthEast(),
            t.getSouthEast()
          ];
        }
      });
      function Yr(t, e) {
        return new Vn(t, e);
      }
      ce.create = He, ce.pointsToPath = Gi, gt.geometryToLayer = Ie, gt.coordsToLatLng = Ci, gt.coordsToLatLngs = Ze, gt.latLngToCoords = Ei, gt.latLngsToCoords = Re, gt.getFeature = Ht, gt.asFeature = Be, E.mergeOptions({
        // @option boxZoom: Boolean = true
        // Whether the map can be zoomed to a rectangular area specified by
        // dragging the mouse while pressing the shift key.
        boxZoom: !0
      });
      var qn = ut.extend({
        initialize: function(t) {
          this._map = t, this._container = t._container, this._pane = t._panes.overlayPane, this._resetStateTimeout = 0, t.on("unload", this._destroy, this);
        },
        addHooks: function() {
          A(this._container, "mousedown", this._onMouseDown, this);
        },
        removeHooks: function() {
          $(this._container, "mousedown", this._onMouseDown, this);
        },
        moved: function() {
          return this._moved;
        },
        _destroy: function() {
          D(this._pane), delete this._pane;
        },
        _resetState: function() {
          this._resetStateTimeout = 0, this._moved = !1;
        },
        _clearDeferredResetState: function() {
          this._resetStateTimeout !== 0 && (clearTimeout(this._resetStateTimeout), this._resetStateTimeout = 0);
        },
        _onMouseDown: function(t) {
          if (!t.shiftKey || t.which !== 1 && t.button !== 1)
            return !1;
          this._clearDeferredResetState(), this._resetState(), ee(), di(), this._startPoint = this._map.mouseEventToContainerPoint(t), A(document, {
            contextmenu: kt,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onKeyDown
          }, this);
        },
        _onMouseMove: function(t) {
          this._moved || (this._moved = !0, this._box = I("div", "leaflet-zoom-box", this._container), S(this._container, "leaflet-crosshair"), this._map.fire("boxzoomstart")), this._point = this._map.mouseEventToContainerPoint(t);
          var e = new N(this._point, this._startPoint), i = e.getSize();
          W(this._box, e.min), this._box.style.width = i.x + "px", this._box.style.height = i.y + "px";
        },
        _finish: function() {
          this._moved && (D(this._box), F(this._container, "leaflet-crosshair")), ie(), fi(), $(document, {
            contextmenu: kt,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onKeyDown
          }, this);
        },
        _onMouseUp: function(t) {
          if (!(t.which !== 1 && t.button !== 1) && (this._finish(), !!this._moved)) {
            this._clearDeferredResetState(), this._resetStateTimeout = setTimeout(d(this._resetState, this), 0);
            var e = new Q(
              this._map.containerPointToLatLng(this._startPoint),
              this._map.containerPointToLatLng(this._point)
            );
            this._map.fitBounds(e).fire("boxzoomend", { boxZoomBounds: e });
          }
        },
        _onKeyDown: function(t) {
          t.keyCode === 27 && (this._finish(), this._clearDeferredResetState(), this._resetState());
        }
      });
      E.addInitHook("addHandler", "boxZoom", qn), E.mergeOptions({
        // @option doubleClickZoom: Boolean|String = true
        // Whether the map can be zoomed in by double clicking on it and
        // zoomed out by double clicking while holding shift. If passed
        // `'center'`, double-click zoom will zoom to the center of the
        //  view regardless of where the mouse was.
        doubleClickZoom: !0
      });
      var Gn = ut.extend({
        addHooks: function() {
          this._map.on("dblclick", this._onDoubleClick, this);
        },
        removeHooks: function() {
          this._map.off("dblclick", this._onDoubleClick, this);
        },
        _onDoubleClick: function(t) {
          var e = this._map, i = e.getZoom(), n = e.options.zoomDelta, r = t.originalEvent.shiftKey ? i - n : i + n;
          e.options.doubleClickZoom === "center" ? e.setZoom(r) : e.setZoomAround(t.containerPoint, r);
        }
      });
      E.addInitHook("addHandler", "doubleClickZoom", Gn), E.mergeOptions({
        // @option dragging: Boolean = true
        // Whether the map is draggable with mouse/touch or not.
        dragging: !0,
        // @section Panning Inertia Options
        // @option inertia: Boolean = *
        // If enabled, panning of the map will have an inertia effect where
        // the map builds momentum while dragging and continues moving in
        // the same direction for some time. Feels especially nice on touch
        // devices. Enabled by default.
        inertia: !0,
        // @option inertiaDeceleration: Number = 3000
        // The rate with which the inertial movement slows down, in pixels/second².
        inertiaDeceleration: 3400,
        // px/s^2
        // @option inertiaMaxSpeed: Number = Infinity
        // Max speed of the inertial movement, in pixels/second.
        inertiaMaxSpeed: 1 / 0,
        // px/s
        // @option easeLinearity: Number = 0.2
        easeLinearity: 0.2,
        // TODO refactor, move to CRS
        // @option worldCopyJump: Boolean = false
        // With this option enabled, the map tracks when you pan to another "copy"
        // of the world and seamlessly jumps to the original one so that all overlays
        // like markers and vector layers are still visible.
        worldCopyJump: !1,
        // @option maxBoundsViscosity: Number = 0.0
        // If `maxBounds` is set, this option will control how solid the bounds
        // are when dragging the map around. The default value of `0.0` allows the
        // user to drag outside the bounds at normal speed, higher values will
        // slow down map dragging outside bounds, and `1.0` makes the bounds fully
        // solid, preventing the user from dragging outside the bounds.
        maxBoundsViscosity: 0
      });
      var Yn = ut.extend({
        addHooks: function() {
          if (!this._draggable) {
            var t = this._map;
            this._draggable = new xt(t._mapPane, t._container), this._draggable.on({
              dragstart: this._onDragStart,
              drag: this._onDrag,
              dragend: this._onDragEnd
            }, this), this._draggable.on("predrag", this._onPreDragLimit, this), t.options.worldCopyJump && (this._draggable.on("predrag", this._onPreDragWrap, this), t.on("zoomend", this._onZoomEnd, this), t.whenReady(this._onZoomEnd, this));
          }
          S(this._map._container, "leaflet-grab leaflet-touch-drag"), this._draggable.enable(), this._positions = [], this._times = [];
        },
        removeHooks: function() {
          F(this._map._container, "leaflet-grab"), F(this._map._container, "leaflet-touch-drag"), this._draggable.disable();
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        moving: function() {
          return this._draggable && this._draggable._moving;
        },
        _onDragStart: function() {
          var t = this._map;
          if (t._stop(), this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
            var e = j(this._map.options.maxBounds);
            this._offsetLimit = X(
              this._map.latLngToContainerPoint(e.getNorthWest()).multiplyBy(-1),
              this._map.latLngToContainerPoint(e.getSouthEast()).multiplyBy(-1).add(this._map.getSize())
            ), this._viscosity = Math.min(1, Math.max(0, this._map.options.maxBoundsViscosity));
          } else
            this._offsetLimit = null;
          t.fire("movestart").fire("dragstart"), t.options.inertia && (this._positions = [], this._times = []);
        },
        _onDrag: function(t) {
          if (this._map.options.inertia) {
            var e = this._lastTime = +/* @__PURE__ */ new Date(), i = this._lastPos = this._draggable._absPos || this._draggable._newPos;
            this._positions.push(i), this._times.push(e), this._prunePositions(e);
          }
          this._map.fire("move", t).fire("drag", t);
        },
        _prunePositions: function(t) {
          for (; this._positions.length > 1 && t - this._times[0] > 50; )
            this._positions.shift(), this._times.shift();
        },
        _onZoomEnd: function() {
          var t = this._map.getSize().divideBy(2), e = this._map.latLngToLayerPoint([0, 0]);
          this._initialWorldOffset = e.subtract(t).x, this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
        },
        _viscousLimit: function(t, e) {
          return t - (t - e) * this._viscosity;
        },
        _onPreDragLimit: function() {
          if (!(!this._viscosity || !this._offsetLimit)) {
            var t = this._draggable._newPos.subtract(this._draggable._startPos), e = this._offsetLimit;
            t.x < e.min.x && (t.x = this._viscousLimit(t.x, e.min.x)), t.y < e.min.y && (t.y = this._viscousLimit(t.y, e.min.y)), t.x > e.max.x && (t.x = this._viscousLimit(t.x, e.max.x)), t.y > e.max.y && (t.y = this._viscousLimit(t.y, e.max.y)), this._draggable._newPos = this._draggable._startPos.add(t);
          }
        },
        _onPreDragWrap: function() {
          var t = this._worldWidth, e = Math.round(t / 2), i = this._initialWorldOffset, n = this._draggable._newPos.x, r = (n - e + i) % t + e - i, a = (n + e + i) % t - e - i, c = Math.abs(r + i) < Math.abs(a + i) ? r : a;
          this._draggable._absPos = this._draggable._newPos.clone(), this._draggable._newPos.x = c;
        },
        _onDragEnd: function(t) {
          var e = this._map, i = e.options, n = !i.inertia || t.noInertia || this._times.length < 2;
          if (e.fire("dragend", t), n)
            e.fire("moveend");
          else {
            this._prunePositions(+/* @__PURE__ */ new Date());
            var r = this._lastPos.subtract(this._positions[0]), a = (this._lastTime - this._times[0]) / 1e3, c = i.easeLinearity, p = r.multiplyBy(c / a), _ = p.distanceTo([0, 0]), g = Math.min(i.inertiaMaxSpeed, _), y = p.multiplyBy(g / _), w = g / (i.inertiaDeceleration * c), k = y.multiplyBy(-w / 2).round();
            !k.x && !k.y ? e.fire("moveend") : (k = e._limitOffset(k, e.options.maxBounds), J(function() {
              e.panBy(k, {
                duration: w,
                easeLinearity: c,
                noMoveStart: !0,
                animate: !0
              });
            }));
          }
        }
      });
      E.addInitHook("addHandler", "dragging", Yn), E.mergeOptions({
        // @option keyboard: Boolean = true
        // Makes the map focusable and allows users to navigate the map with keyboard
        // arrows and `+`/`-` keys.
        keyboard: !0,
        // @option keyboardPanDelta: Number = 80
        // Amount of pixels to pan when pressing an arrow key.
        keyboardPanDelta: 80
      });
      var Kn = ut.extend({
        keyCodes: {
          left: [37],
          right: [39],
          down: [40],
          up: [38],
          zoomIn: [187, 107, 61, 171],
          zoomOut: [189, 109, 54, 173]
        },
        initialize: function(t) {
          this._map = t, this._setPanDelta(t.options.keyboardPanDelta), this._setZoomDelta(t.options.zoomDelta);
        },
        addHooks: function() {
          var t = this._map._container;
          t.tabIndex <= 0 && (t.tabIndex = "0"), A(t, {
            focus: this._onFocus,
            blur: this._onBlur,
            mousedown: this._onMouseDown
          }, this), this._map.on({
            focus: this._addHooks,
            blur: this._removeHooks
          }, this);
        },
        removeHooks: function() {
          this._removeHooks(), $(this._map._container, {
            focus: this._onFocus,
            blur: this._onBlur,
            mousedown: this._onMouseDown
          }, this), this._map.off({
            focus: this._addHooks,
            blur: this._removeHooks
          }, this);
        },
        _onMouseDown: function() {
          if (!this._focused) {
            var t = document.body, e = document.documentElement, i = t.scrollTop || e.scrollTop, n = t.scrollLeft || e.scrollLeft;
            this._map._container.focus(), window.scrollTo(n, i);
          }
        },
        _onFocus: function() {
          this._focused = !0, this._map.fire("focus");
        },
        _onBlur: function() {
          this._focused = !1, this._map.fire("blur");
        },
        _setPanDelta: function(t) {
          var e = this._panKeys = {}, i = this.keyCodes, n, r;
          for (n = 0, r = i.left.length; n < r; n++)
            e[i.left[n]] = [-1 * t, 0];
          for (n = 0, r = i.right.length; n < r; n++)
            e[i.right[n]] = [t, 0];
          for (n = 0, r = i.down.length; n < r; n++)
            e[i.down[n]] = [0, t];
          for (n = 0, r = i.up.length; n < r; n++)
            e[i.up[n]] = [0, -1 * t];
        },
        _setZoomDelta: function(t) {
          var e = this._zoomKeys = {}, i = this.keyCodes, n, r;
          for (n = 0, r = i.zoomIn.length; n < r; n++)
            e[i.zoomIn[n]] = t;
          for (n = 0, r = i.zoomOut.length; n < r; n++)
            e[i.zoomOut[n]] = -t;
        },
        _addHooks: function() {
          A(document, "keydown", this._onKeyDown, this);
        },
        _removeHooks: function() {
          $(document, "keydown", this._onKeyDown, this);
        },
        _onKeyDown: function(t) {
          if (!(t.altKey || t.ctrlKey || t.metaKey)) {
            var e = t.keyCode, i = this._map, n;
            if (e in this._panKeys) {
              if (!i._panAnim || !i._panAnim._inProgress)
                if (n = this._panKeys[e], t.shiftKey && (n = P(n).multiplyBy(3)), i.options.maxBounds && (n = i._limitOffset(P(n), i.options.maxBounds)), i.options.worldCopyJump) {
                  var r = i.wrapLatLng(i.unproject(i.project(i.getCenter()).add(n)));
                  i.panTo(r);
                } else
                  i.panBy(n);
            } else if (e in this._zoomKeys)
              i.setZoom(i.getZoom() + (t.shiftKey ? 3 : 1) * this._zoomKeys[e]);
            else if (e === 27 && i._popup && i._popup.options.closeOnEscapeKey)
              i.closePopup();
            else
              return;
            kt(t);
          }
        }
      });
      E.addInitHook("addHandler", "keyboard", Kn), E.mergeOptions({
        // @section Mouse wheel options
        // @option scrollWheelZoom: Boolean|String = true
        // Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
        // it will zoom to the center of the view regardless of where the mouse was.
        scrollWheelZoom: !0,
        // @option wheelDebounceTime: Number = 40
        // Limits the rate at which a wheel can fire (in milliseconds). By default
        // user can't zoom via wheel more often than once per 40 ms.
        wheelDebounceTime: 40,
        // @option wheelPxPerZoomLevel: Number = 60
        // How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
        // mean a change of one full zoom level. Smaller values will make wheel-zooming
        // faster (and vice versa).
        wheelPxPerZoomLevel: 60
      });
      var Jn = ut.extend({
        addHooks: function() {
          A(this._map._container, "wheel", this._onWheelScroll, this), this._delta = 0;
        },
        removeHooks: function() {
          $(this._map._container, "wheel", this._onWheelScroll, this);
        },
        _onWheelScroll: function(t) {
          var e = xn(t), i = this._map.options.wheelDebounceTime;
          this._delta += e, this._lastMousePos = this._map.mouseEventToContainerPoint(t), this._startTime || (this._startTime = +/* @__PURE__ */ new Date());
          var n = Math.max(i - (+/* @__PURE__ */ new Date() - this._startTime), 0);
          clearTimeout(this._timer), this._timer = setTimeout(d(this._performZoom, this), n), kt(t);
        },
        _performZoom: function() {
          var t = this._map, e = t.getZoom(), i = this._map.options.zoomSnap || 0;
          t._stop();
          var n = this._delta / (this._map.options.wheelPxPerZoomLevel * 4), r = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(n)))) / Math.LN2, a = i ? Math.ceil(r / i) * i : r, c = t._limitZoom(e + (this._delta > 0 ? a : -a)) - e;
          this._delta = 0, this._startTime = null, c && (t.options.scrollWheelZoom === "center" ? t.setZoom(e + c) : t.setZoomAround(this._lastMousePos, e + c));
        }
      });
      E.addInitHook("addHandler", "scrollWheelZoom", Jn);
      var Kr = 600;
      E.mergeOptions({
        // @section Touch interaction options
        // @option tapHold: Boolean
        // Enables simulation of `contextmenu` event, default is `true` for mobile Safari.
        tapHold: b.touchNative && b.safari && b.mobile,
        // @option tapTolerance: Number = 15
        // The max number of pixels a user can shift his finger during touch
        // for it to be considered a valid tap.
        tapTolerance: 15
      });
      var Xn = ut.extend({
        addHooks: function() {
          A(this._map._container, "touchstart", this._onDown, this);
        },
        removeHooks: function() {
          $(this._map._container, "touchstart", this._onDown, this);
        },
        _onDown: function(t) {
          if (clearTimeout(this._holdTimeout), t.touches.length === 1) {
            var e = t.touches[0];
            this._startPos = this._newPos = new T(e.clientX, e.clientY), this._holdTimeout = setTimeout(d(function() {
              this._cancel(), this._isTapValid() && (A(document, "touchend", q), A(document, "touchend touchcancel", this._cancelClickPrevent), this._simulateEvent("contextmenu", e));
            }, this), Kr), A(document, "touchend touchcancel contextmenu", this._cancel, this), A(document, "touchmove", this._onMove, this);
          }
        },
        _cancelClickPrevent: function t() {
          $(document, "touchend", q), $(document, "touchend touchcancel", t);
        },
        _cancel: function() {
          clearTimeout(this._holdTimeout), $(document, "touchend touchcancel contextmenu", this._cancel, this), $(document, "touchmove", this._onMove, this);
        },
        _onMove: function(t) {
          var e = t.touches[0];
          this._newPos = new T(e.clientX, e.clientY);
        },
        _isTapValid: function() {
          return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
        },
        _simulateEvent: function(t, e) {
          var i = new MouseEvent(t, {
            bubbles: !0,
            cancelable: !0,
            view: window,
            // detail: 1,
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY
            // button: 2,
            // buttons: 2
          });
          i._simulated = !0, e.target.dispatchEvent(i);
        }
      });
      E.addInitHook("addHandler", "tapHold", Xn), E.mergeOptions({
        // @section Touch interaction options
        // @option touchZoom: Boolean|String = *
        // Whether the map can be zoomed by touch-dragging with two fingers. If
        // passed `'center'`, it will zoom to the center of the view regardless of
        // where the touch events (fingers) were. Enabled for touch-capable web
        // browsers.
        touchZoom: b.touch,
        // @option bounceAtZoomLimits: Boolean = true
        // Set it to false if you don't want the map to zoom beyond min/max zoom
        // and then bounce back when pinch-zooming.
        bounceAtZoomLimits: !0
      });
      var Qn = ut.extend({
        addHooks: function() {
          S(this._map._container, "leaflet-touch-zoom"), A(this._map._container, "touchstart", this._onTouchStart, this);
        },
        removeHooks: function() {
          F(this._map._container, "leaflet-touch-zoom"), $(this._map._container, "touchstart", this._onTouchStart, this);
        },
        _onTouchStart: function(t) {
          var e = this._map;
          if (!(!t.touches || t.touches.length !== 2 || e._animatingZoom || this._zooming)) {
            var i = e.mouseEventToContainerPoint(t.touches[0]), n = e.mouseEventToContainerPoint(t.touches[1]);
            this._centerPoint = e.getSize()._divideBy(2), this._startLatLng = e.containerPointToLatLng(this._centerPoint), e.options.touchZoom !== "center" && (this._pinchStartLatLng = e.containerPointToLatLng(i.add(n)._divideBy(2))), this._startDist = i.distanceTo(n), this._startZoom = e.getZoom(), this._moved = !1, this._zooming = !0, e._stop(), A(document, "touchmove", this._onTouchMove, this), A(document, "touchend touchcancel", this._onTouchEnd, this), q(t);
          }
        },
        _onTouchMove: function(t) {
          if (!(!t.touches || t.touches.length !== 2 || !this._zooming)) {
            var e = this._map, i = e.mouseEventToContainerPoint(t.touches[0]), n = e.mouseEventToContainerPoint(t.touches[1]), r = i.distanceTo(n) / this._startDist;
            if (this._zoom = e.getScaleZoom(r, this._startZoom), !e.options.bounceAtZoomLimits && (this._zoom < e.getMinZoom() && r < 1 || this._zoom > e.getMaxZoom() && r > 1) && (this._zoom = e._limitZoom(this._zoom)), e.options.touchZoom === "center") {
              if (this._center = this._startLatLng, r === 1)
                return;
            } else {
              var a = i._add(n)._divideBy(2)._subtract(this._centerPoint);
              if (r === 1 && a.x === 0 && a.y === 0)
                return;
              this._center = e.unproject(e.project(this._pinchStartLatLng, this._zoom).subtract(a), this._zoom);
            }
            this._moved || (e._moveStart(!0, !1), this._moved = !0), it(this._animRequest);
            var c = d(e._move, e, this._center, this._zoom, { pinch: !0, round: !1 }, void 0);
            this._animRequest = J(c, this, !0), q(t);
          }
        },
        _onTouchEnd: function() {
          if (!this._moved || !this._zooming) {
            this._zooming = !1;
            return;
          }
          this._zooming = !1, it(this._animRequest), $(document, "touchmove", this._onTouchMove, this), $(document, "touchend touchcancel", this._onTouchEnd, this), this._map.options.zoomAnimation ? this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), !0, this._map.options.zoomSnap) : this._map._resetView(this._center, this._map._limitZoom(this._zoom));
        }
      });
      E.addInitHook("addHandler", "touchZoom", Qn), E.BoxZoom = qn, E.DoubleClickZoom = Gn, E.Drag = Yn, E.Keyboard = Kn, E.ScrollWheelZoom = Jn, E.TapHold = Xn, E.TouchZoom = Qn, s.Bounds = N, s.Browser = b, s.CRS = pt, s.Canvas = jn, s.Circle = ki, s.CircleMarker = Oe, s.Class = ft, s.Control = at, s.DivIcon = Dn, s.DivOverlay = dt, s.DomEvent = pr, s.DomUtil = dr, s.Draggable = xt, s.Evented = Kt, s.FeatureGroup = _t, s.GeoJSON = gt, s.GridLayer = le, s.Handler = ut, s.Icon = Nt, s.ImageOverlay = $e, s.LatLng = R, s.LatLngBounds = Q, s.Layer = lt, s.LayerGroup = $t, s.LineUtil = Sr, s.Map = E, s.Marker = ze, s.Mixin = xr, s.Path = wt, s.Point = T, s.PolyUtil = wr, s.Polygon = Dt, s.Polyline = mt, s.Popup = Ne, s.PosAnimation = wn, s.Projection = kr, s.Rectangle = Vn, s.Renderer = vt, s.SVG = ce, s.SVGOverlay = Nn, s.TileLayer = Ft, s.Tooltip = De, s.Transformation = ti, s.Util = Io, s.VideoOverlay = $n, s.bind = d, s.bounds = X, s.canvas = Wn, s.circle = Rr, s.circleMarker = Zr, s.control = re, s.divIcon = Ur, s.extend = l, s.featureGroup = zr, s.geoJSON = Bn, s.geoJson = Nr, s.gridLayer = Vr, s.icon = Or, s.imageOverlay = Dr, s.latLng = C, s.latLngBounds = j, s.layerGroup = Mr, s.map = _r, s.marker = Ir, s.point = P, s.polygon = $r, s.polyline = Br, s.popup = jr, s.rectangle = Yr, s.setOptions = B, s.stamp = v, s.svg = Un, s.svgOverlay = Fr, s.tileLayer = Hn, s.tooltip = Wr, s.transformation = Jt, s.version = h, s.videoOverlay = Hr;
      var Jr = window.L;
      s.noConflict = function() {
        return window.L = Jr, this;
      }, window.L = s;
    }));
  })(pe, pe.exports)), pe.exports;
}
var Zs = Is();
const yt = /* @__PURE__ */ zs(Zs), vo = {
  openstreetmap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attributionShort: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  },
  "carto-positron": {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attributionShort: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>, © <a href="https://carto.com/attributions">CARTO</a>'
  },
  "carto-dark-matter": {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attributionShort: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>, © <a href="https://carto.com/attributions">CARTO</a>'
  }
}, yo = {
  ev: "#1d8cf8",
  ice: "#f6a800",
  overspeed: "#e63946",
  highway: "#7b2cbf",
  solid: "#e63946"
}, Rs = {
  ev: "--journey-viewer-polyline-ev",
  ice: "--journey-viewer-polyline-ice",
  overspeed: "--journey-viewer-polyline-overspeed",
  highway: "--journey-viewer-polyline-highway",
  solid: "--journey-viewer-polyline-solid"
};
function Bs(u, o) {
  const s = getComputedStyle(u), h = {};
  for (const l of Object.keys(yo)) {
    const f = o?.[l];
    if (f) {
      h[l] = f;
      continue;
    }
    const d = Rs[l];
    if (d) {
      const m = s.getPropertyValue(d).trim();
      if (m) {
        h[l] = m;
        continue;
      }
    }
    h[l] = yo[l];
  }
  return h;
}
class $s {
  constructor(o, s) {
    this.container = o, this.cfg = s, this.lastSize = { w: 0, h: 0 };
  }
  /**
   * Init Leaflet once the container has real dimensions.
   *
   * The zero-size container trap: when Lit first renders us into the DOM,
   * the .tv-map div is laid out asynchronously. If we call L.map(container)
   * during that window, Leaflet captures size 0×0 and bakes that into its
   * pixel arithmetic — every later fitBounds works off that stale viewport.
   * Symptoms: tiles render, polyline doesn't, bounds calculation is wrong.
   *
   * Fix: defer init until the container has a non-zero box, then attach a
   * ResizeObserver so subsequent resizes call invalidateSize() too.
   */
  ensure() {
    if (this.map) return this.map;
    const o = this.container.getBoundingClientRect();
    if (o.width === 0 || o.height === 0) return;
    const s = vo[this.cfg.tile_provider ?? "openstreetmap"] ?? vo.openstreetmap, h = this.cfg.gestures === "locked", l = yt.map(this.container, {
      zoomControl: !0,
      // Attribution stays on per OSM / CARTO usage-policy requirements. Style
      // makes it tiny + low-contrast (see card.ts .leaflet-control-attribution
      // rules). Hover fades it up to 0.9 opacity.
      attributionControl: !0,
      scrollWheelZoom: !h,
      dragging: !h,
      touchZoom: !h,
      doubleClickZoom: !h,
      boxZoom: !h,
      keyboard: !h
    });
    return l.attributionControl.setPrefix(!1), yt.tileLayer(s.url, {
      attribution: s.attributionShort,
      maxZoom: 19
    }).addTo(l), this.map = l, this.resizeObserver = new ResizeObserver(([f]) => {
      if (!f) return;
      const { width: d, height: m } = f.contentRect;
      if (d === 0 || m === 0) {
        this.lastSize = { w: 0, h: 0 };
        return;
      }
      l.invalidateSize();
      const v = Math.abs(d - this.lastSize.w) > 1 || Math.abs(m - this.lastSize.h) > 1;
      this.lastSize = { w: d, h: m }, v && this.lastTrip && requestAnimationFrame(() => {
        this.lastTrip && this.render(this.lastTrip);
      });
    }), this.resizeObserver.observe(this.container), setTimeout(() => l.invalidateSize(), 0), requestAnimationFrame(() => l.invalidateSize()), l;
  }
  /** Replace all trip-specific layers with this trip's data. */
  render(o) {
    this.lastTrip = o;
    let s = this.ensure();
    if (!s) {
      this.pendingTrip = o, requestAnimationFrame(() => {
        if (this.pendingTrip) {
          const h = this.pendingTrip;
          this.pendingTrip = void 0, this.render(h);
        }
      });
      return;
    }
    if (this.layer && this.layer.remove(), this.layer = yt.layerGroup().addTo(s), !o.route.length) {
      this.dropEndpoints(o), this.fitAndSettle(s, this.collectCoords(o));
      return;
    }
    this.drawPolyline(o), this.dropEndpoints(o), this.dropBehaviours(o), this.fitAndSettle(s, this.collectCoords(o));
  }
  /**
   * Fit + invalidateSize at multiple staggered checkpoints.
   *
   * In a Lit shadow DOM with HA's grid sections layout, Leaflet's internal
   * size cache can lag the actual container size. We hit invalidateSize at
   * three checkpoints: now (best-effort), next macrotask (post-layout), next
   * frame (post-paint). Each is idempotent + cheap, and at least one will
   * land at the right time across the timing variations we've observed.
   */
  fitAndSettle(o, s) {
    o.invalidateSize(), this.fitToBounds(o, s), setTimeout(() => {
      o.invalidateSize(), this.fitToBounds(o, s);
    }, 0), requestAnimationFrame(() => {
      o.invalidateSize(), this.fitToBounds(o, s);
    });
  }
  // ─── Polyline ─────────────────────────────────────────────────────────────
  drawPolyline(o) {
    const s = this.cfg.polyline ?? {}, h = s.color_by ?? "solid", l = Bs(this.container, s.palette), f = s.weight ?? 4, d = s.opacity ?? 0.9;
    if (h === "solid") {
      const v = o.route.map((M) => [M.lat, M.lon]);
      yt.polyline(v, { color: l.solid, weight: f, opacity: d }).addTo(this.layer);
      return;
    }
    const m = Ns(o.route, h, l);
    for (const v of m)
      yt.polyline(v.coords, { color: v.color, weight: f, opacity: d }).addTo(this.layer);
  }
  // ─── Endpoint pins ────────────────────────────────────────────────────────
  dropEndpoints(o) {
    const s = this.cfg.markers ?? {}, h = s.start?.color ?? "#2a9d8f", l = s.end?.color ?? "#e63946";
    fe(o.start) && yt.circleMarker([o.start.lat, o.start.lon], {
      radius: 8,
      color: "#fff",
      weight: 2,
      fillColor: h,
      fillOpacity: 1
    }).bindTooltip("Start").addTo(this.layer), fe(o.end) && yt.circleMarker([o.end.lat, o.end.lon], {
      radius: 8,
      color: "#fff",
      weight: 2,
      fillColor: l,
      fillOpacity: 1
    }).bindTooltip("End").addTo(this.layer);
  }
  // ─── Behaviour markers ────────────────────────────────────────────────────
  dropBehaviours(o) {
    const s = this.cfg.markers?.behaviours;
    if (!s?.enabled || !o.behaviours?.length) return;
    const h = s.style?.good ?? { color: "#2a9d8f", radius: 6 }, l = s.style?.bad ?? { color: "#e63946", radius: 8 }, f = s.tooltip ?? "{type} severity={severity}";
    for (const d of o.behaviours) {
      if (!fe(d)) continue;
      const m = d.good ? h : l;
      yt.circleMarker([d.lat, d.lon], {
        radius: m.radius ?? 5,
        color: "#fff",
        weight: 1,
        fillColor: m.color ?? "#000",
        fillOpacity: 0.9
      }).bindTooltip(
        f.replace("{type}", String(d.type ?? "?")).replace("{severity}", String(d.severity ?? "?")).replace("{ts}", String(d.ts ?? ""))
      ).addTo(this.layer);
    }
  }
  // ─── Bounds ───────────────────────────────────────────────────────────────
  collectCoords(o) {
    const s = o.route.map((h) => [h.lat, h.lon]);
    return fe(o.start) && s.push([o.start.lat, o.start.lon]), fe(o.end) && s.push([o.end.lat, o.end.lon]), s;
  }
  fitToBounds(o, s) {
    if (!s.length) {
      o.setView([0, 0], 2);
      return;
    }
    if (!this.cfg.zoom_to_fit && s.length > 0) {
      o.setView(s[0], 14);
      return;
    }
    const h = Math.round(this.cfg.padding_pct ?? 10), l = yt.latLngBounds(s);
    o.fitBounds(l, { padding: [h, h], maxZoom: 17 });
  }
  /** Re-layout after container resize (e.g. dashboard resize). */
  invalidateSize() {
    this.map?.invalidateSize();
  }
  destroy() {
    this.resizeObserver?.disconnect(), this.resizeObserver = void 0, this.map?.remove(), this.map = void 0, this.layer = void 0, this.pendingTrip = void 0, this.lastTrip = void 0, this.lastSize = { w: 0, h: 0 };
  }
}
function fe(u) {
  return !!u && typeof u.lat == "number" && typeof u.lon == "number";
}
function Ns(u, o, s) {
  const h = [];
  let l;
  const f = (d) => {
    if (o === "ev") return d.isEv ? s.ev : s.ice;
    if (o === "overspeed") return d.overspeed ? s.overspeed : s.solid;
    if (o === "highway") return d.highway ? s.highway : s.solid;
    if (o === "mode") {
      const m = `mode_${d.mode ?? 0}`;
      return s[m] ?? s.solid;
    }
    return s.solid;
  };
  for (const d of u) {
    const m = f(d);
    (!l || l.color !== m) && (l && l.coords.length ? (h.push(l), l = { color: m, coords: [l.coords[l.coords.length - 1]] }) : l = { color: m, coords: [] }), l.coords.push([d.lat, d.lon]);
  }
  return l && l.coords.length && h.push(l), h;
}
const qe = (u, o = 2) => String(u).padStart(o, "0");
function Ds(u) {
  if (!u) return "—";
  const o = new Date(u);
  if (Number.isNaN(o.getTime())) return "—";
  const s = /* @__PURE__ */ new Date();
  s.setHours(0, 0, 0, 0);
  const h = new Date(o);
  h.setHours(0, 0, 0, 0);
  const l = Math.round((s.getTime() - h.getTime()) / 864e5);
  return l === 0 ? "Today" : l === 1 ? "Yesterday" : l < 7 ? o.toLocaleDateString(void 0, { weekday: "short" }) : o.toLocaleDateString(void 0, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}
function bo(u) {
  if (!u) return "—";
  const o = new Date(u);
  return Number.isNaN(o.getTime()) ? "—" : `${qe(o.getHours())}:${qe(o.getMinutes())}`;
}
function Mo(u) {
  return u == null ? "—" : u < 1e3 ? `${Math.round(u)} m` : `${(u / 1e3).toFixed(2)} km`;
}
function zo(u) {
  if (u == null) return "—";
  const o = Math.round(u);
  if (o < 60) return `${o}s`;
  const s = Math.floor(o / 60), h = o % 60;
  if (s < 60) return `${s}:${qe(h)}`;
  const l = Math.floor(s / 60), f = s % 60;
  return `${l}h ${qe(f)}m`;
}
function Hs(u, o = 3) {
  return u == null ? "—" : `${(u / 1e3).toFixed(o)} L`;
}
const Fs = [
  "{relative_day}",
  "{start_time}",
  "{end_time}",
  "{distance}",
  "{duration}"
];
function js(u) {
  const o = new Set(Fs), s = u.match(/\{[^}]+\}/g) ?? [];
  return Array.from(new Set(s.filter((h) => !o.has(h))));
}
function Ws(u, o) {
  return u.replace("{relative_day}", Ds(o.start_ts)).replace("{start_time}", bo(o.start_ts)).replace("{end_time}", bo(o.end_ts)).replace("{distance}", Mo(o.stats.distance_m)).replace("{duration}", zo(o.stats.duration_s));
}
function xo(u, o, s) {
  if (u == null || typeof u != "number" && typeof u != "string" && typeof u != "boolean")
    return "—";
  const h = typeof u == "number" ? u : Number(u);
  return o === "km" ? Mo(h) : o === "L" ? Hs(h, s ?? 3) : o === "duration" ? zo(h) : o && o.includes("{v") ? o.replace(/\{v:\.0%\}/g, `${Math.round(h * 100)}%`).replace(/\{v:\.(\d+)f\}/g, (l, f) => h.toFixed(Number(f))).replace(/\{v\}/g, String(h)) : s != null && typeof h == "number" ? h.toFixed(s) : String(u);
}
function _e(u, o) {
  return o.split(".").reduce((s, h) => {
    if (s != null && typeof s == "object" && h in s)
      return s[h];
  }, u);
}
function Us(u) {
  if (Array.isArray(u)) return u;
  if (u && typeof u == "object" && "trips" in u) {
    const o = u.trips;
    if (Array.isArray(o)) return o;
  }
  return [];
}
function Vs(u, o) {
  if (!u?.states) return [];
  const s = [];
  for (const h of o) {
    if (!h.entity) continue;
    const l = u.states[h.entity];
    if (!l?.attributes) continue;
    const f = Us(l.attributes.trips);
    for (const d of f) s.push({ ...d, source: d.source ?? h.name });
  }
  return s;
}
function qs(u, o) {
  const s = u.slice();
  return s.sort((h, l) => {
    const f = h.start_ts ? Date.parse(h.start_ts) : 0, d = l.start_ts ? Date.parse(l.start_ts) : 0;
    return o === "newest_first" ? d - f : f - d;
  }), s;
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gs = (u) => (...o) => ({ _$litDirective$: u, values: o });
class Ys {
  constructor(o) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(o, s, h) {
    this._$Ct = o, this._$AM = s, this._$Ci = h;
  }
  _$AS(o, s) {
    return this.update(o, s);
  }
  update(o, s) {
    return this.render(...s);
  }
}
class Ks extends Ys {
  update(o, [s]) {
    return Js().bind(o.element, s), Lt;
  }
  render(o) {
    return Lt;
  }
}
function Js() {
  const u = document.body.querySelector("action-handler");
  if (u) return u;
  const o = document.createElement("action-handler");
  return document.body.appendChild(o), o;
}
const Xs = Gs(
  class extends Ks {
    update(u, o) {
      const [s] = o, h = u.element;
      return h.actionHandler = h.actionHandler ?? { options: {} }, h.actionHandler.options = s ?? {}, super.update(u, o);
    }
  }
);
function Qs(u, o) {
  if (u == null || !o?.length) return;
  let s;
  for (const h of o)
    u >= h.value && (s = h);
  return s;
}
function ta(u, o) {
  if (u == null || !o?.length) return;
  let s, h;
  for (const d of o)
    d.value <= u ? s = d : h || (h = d);
  if (!s) return o[0]?.color;
  if (!h) return s.color;
  if (!s.color || !h.color) return s.color ?? h.color;
  const l = h.value - s.value;
  if (l <= 0) return s.color;
  const f = (u - s.value) / l;
  return `color-mix(in srgb, ${s.color} ${(1 - f) * 100}%, ${h.color})`;
}
function ea(u, o) {
  if (u == null) return;
  if (typeof u == "number") return u;
  const s = _e(o, u);
  return typeof s == "number" ? s : void 0;
}
function ia(u, o) {
  return !Number.isFinite(u) || !Number.isFinite(o) || o <= 0 ? 0 : Math.max(0, Math.min(100, u / o * 100));
}
function na(u, o, s) {
  if (u == null || o == null) return;
  const h = u - o, l = h > 0 ? "up" : h < 0 ? "down" : "flat";
  return { direction: l, delta: h, sentiment: l === "flat" ? "neutral" : s ? (
    // Lower is better: down = good, up = bad
    l === "down" ? "good" : "bad"
  ) : (
    // Higher is better: up = good, down = bad
    l === "up" ? "good" : "bad"
  ) };
}
var oa = Object.defineProperty, xe = (u, o, s, h) => {
  for (var l = void 0, f = u.length - 1, d; f >= 0; f--)
    (d = u[f]) && (l = d(o, s, l) || l);
  return l && oa(o, s, l), l;
};
const ra = "0.1.0", sa = 60, wo = 50, Po = 4, aa = 280;
function la(u, o, s) {
  if (!u) return !0;
  if (!o) return !1;
  for (const h of s)
    if (u.states[h] !== o.states[h]) return !0;
  return !1;
}
const ha = "{relative_day} {start_time} ({distance} / {duration})";
class Gt extends Ut {
  constructor() {
    super(...arguments), this.index = 0, this.trips = [], this.keyboardListenerActive = !1, this.prev = (o) => {
      o?.stopPropagation();
      const s = this.config?.pagination?.wrap ?? !1;
      this.index > 0 ? this.index -= 1 : s && (this.index = this.trips.length - 1);
    }, this.next = (o) => {
      o?.stopPropagation();
      const s = this.config?.pagination?.wrap ?? !1;
      this.index < this.trips.length - 1 ? this.index += 1 : s && (this.index = 0);
    }, this.swallowPointer = (o) => {
      o.stopPropagation();
    }, this.handleKey = (o) => {
      o.key === "ArrowLeft" && this.prev(), o.key === "ArrowRight" && this.next();
    }, this.handleAction = (o) => {
      if (!this.hass || !this.config || !o.detail?.action) return;
      const s = o.detail.action, h = this.config, l = h.sources?.[0]?.entity, f = {
        ...h,
        entity: l,
        tap_action: h.tap_action ?? { action: "more-info" },
        hold_action: h.hold_action ?? { action: "none" },
        double_tap_action: h.double_tap_action ?? { action: "none" }
      }, d = new Event("hass-action", { bubbles: !0, composed: !0 });
      d.detail = {
        config: f,
        action: s
      }, this.dispatchEvent(d);
    };
  }
  // ─── Lovelace lifecycle ────────────────────────────────────────────────
  /** The visual editor lives in its own ESM bundle. Lazy-load it the first
   *  time a user opens the edit dialog; keeps the main card bundle small. */
  static async getConfigElement() {
    return await Promise.resolve().then(() => Sa), document.createElement("journey-viewer-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:journey-viewer-card",
      sources: [{ name: "Vehicle", entity: "" }]
    };
  }
  setConfig(o) {
    if (!o?.sources?.length)
      throw new Error("journey-viewer-card: 'sources' is required");
    if (o.label?.template) {
      const s = js(o.label.template);
      if (s.length)
        throw new Error(
          `journey-viewer-card: unknown label template token(s): ${s.join(", ")}`
        );
    }
    this.config = o, this.index = o.default_index ?? 0, this.rowCache = void 0;
  }
  getCardSize() {
    const o = this.config?.stats_grid?.rows?.length ?? 0, s = this.config?.map?.height ?? aa, h = Math.ceil(o / Po) * wo;
    return Math.ceil(
      (s + sa + h) / wo
    );
  }
  /** Sections-view layout hints (HA 2024.7+). Each grid cell is ~30px wide,
   *  56px tall, with 8px gaps. The card needs at least the map height plus
   *  header plus a couple of stats rows to be usable, and works best at
   *  full section width. Columns must be multiples of 3. */
  getGridOptions() {
    return { rows: 6, columns: 12, min_rows: 4, min_columns: 6 };
  }
  // ─── State updates ─────────────────────────────────────────────────────
  /** Re-render only when something we actually care about changed. */
  shouldUpdate(o) {
    if (!this.config || o.has("config") || o.has("index") || o.has("trips"))
      return !0;
    if (o.has("hass")) {
      const s = o.get("hass"), h = (this.config.sources ?? []).map((l) => l.entity).filter((l) => !!l);
      return la(s, this.hass, h);
    }
    return !1;
  }
  willUpdate(o) {
    (o.has("hass") || o.has("config")) && this.refreshTrips(), o.has("config") && this.syncKeyboardListener();
  }
  /** Keep the document-level keyboard listener in sync with
   *  config.pagination.keyboard. Called from willUpdate (config change) and
   *  from connectedCallback (re-attach after Lovelace edit-mode toggle).
   *  Idempotent: safe to call repeatedly. */
  syncKeyboardListener() {
    const o = !!this.config?.pagination?.keyboard;
    o && !this.keyboardListenerActive ? (document.addEventListener("keydown", this.handleKey), this.keyboardListenerActive = !0) : !o && this.keyboardListenerActive && (document.removeEventListener("keydown", this.handleKey), this.keyboardListenerActive = !1);
  }
  updated(o) {
    this.ensureMap();
    const s = this.currentTrip;
    this.tripMap && s && this.tripMap.render(s);
  }
  refreshTrips() {
    if (!this.config) return;
    const o = Vs(this.hass, this.config.sources ?? []);
    this.trips = qs(o, this.config.order ?? "newest_first"), this.index = Math.min(this.index, Math.max(0, this.trips.length - 1)), this.rowCache = void 0;
  }
  ensureMap() {
    !this.mapEl || this.tripMap || (this.tripMap = new $s(this.mapEl, this.config?.map ?? {}));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.tripMap?.destroy(), this.tripMap = void 0, document.removeEventListener("keydown", this.handleKey), this.keyboardListenerActive = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.syncKeyboardListener(), requestAnimationFrame(() => {
      this.ensureMap();
      const o = this.currentTrip;
      this.tripMap && o && this.tripMap.render(o);
    });
  }
  // ─── Pagination ────────────────────────────────────────────────────────
  get currentTrip() {
    return this.trips[this.index];
  }
  /** True if any action is configured (or tap defaults to more-info because
   *  we have an entity to open). Used to decide whether to wire actionHandler. */
  hasAnyAction() {
    const o = this.config;
    return o ? de(o.tap_action) || de(o.hold_action) || de(o.double_tap_action) ? !0 : !!o.sources?.[0]?.entity : !1;
  }
  // ─── Render ────────────────────────────────────────────────────────────
  render() {
    if (!this.trips.length) return this.renderEmpty();
    const o = this.currentTrip, s = this.config, h = this.hasAnyAction();
    return Z`<ha-card
      class=${h ? "tv-actionable" : ""}
      .actionHandler=${h ? Xs({
      hasHold: de(s?.hold_action),
      hasDoubleClick: de(s?.double_tap_action)
    }) : void 0}
      @action=${h ? this.handleAction : void 0}
    >
      ${this.config?.title ? Z`<div class="tv-title">${this.config.title}</div>` : O}
      <div class="tv-header">
        <div class="tv-label">${Ws(this.config?.label?.template ?? ha, o)}</div>
        ${this.renderPager()}
      </div>
      <div
        class="tv-map-wrap"
        style=${`height: ${this.config?.map?.height ?? 280}px;`}
      >
        <div class="tv-map"></div>
        ${this.renderLegend()}
      </div>
      ${this.renderStats(o)}
    </ha-card>`;
  }
  /** Tiny corner overlay explaining polyline colour semantics.
   *  Each dot's `background` is emitted as a CSS expression that itself
   *  resolves the precedence chain at paint time (yamlVal | var(...) |
   *  fallback). This means the legend stays in sync with the actual
   *  polyline even when a CSS custom property changes at runtime — no Lit
   *  re-render needed. */
  renderLegend() {
    const o = this.config?.map?.polyline, s = o?.color_by ?? "solid";
    if (s === "solid") return O;
    const h = o?.palette ?? {}, l = (d, m) => {
      const v = h[d];
      return v || `var(--journey-viewer-polyline-${d}, ${m})`;
    }, f = [];
    return s === "ev" ? (f.push({ color: l("ev", "#1d8cf8"), label: "EV" }), f.push({ color: l("ice", "#f6a800"), label: "ICE" })) : s === "overspeed" ? (f.push({ color: l("overspeed", "#e63946"), label: "Overspeed" }), f.push({ color: l("solid", "#e63946"), label: "Normal" })) : s === "highway" && (f.push({ color: l("highway", "#7b2cbf"), label: "Highway" }), f.push({ color: l("solid", "#e63946"), label: "City" })), f.length ? Z`<div class="tv-legend">
      ${f.map(
      (d) => Z`<div class="tv-legend-item">
          <span class="tv-legend-dot" style=${`background: ${d.color};`}></span>
          <span>${d.label}</span>
        </div>`
    )}
    </div>` : O;
  }
  renderEmpty() {
    const o = this.config?.empty_state ?? {};
    return Z`<ha-card>
      <div class="tv-empty">
        ${o.icon ? Z`<ha-icon icon=${o.icon}></ha-icon>` : O}
        <div class="tv-empty-title">${o.title ?? "No trips"}</div>
        <div class="tv-empty-body">${o.body ?? "No trip data available."}</div>
      </div>
    </ha-card>`;
  }
  renderPager() {
    if (!this.trips.length) return O;
    const o = this.config?.pagination ?? {}, s = o.show_counter !== !1, h = o.wrap ?? !1, l = !h && this.index === 0, f = !h && this.index === this.trips.length - 1;
    return Z`<div
      class="tv-pager"
      @pointerdown=${this.swallowPointer}
      @click=${this.swallowPointer}
    >
      <button
        class="tv-btn"
        ?disabled=${l}
        @click=${this.prev}
        aria-label="Previous trip"
        title="Previous trip"
      >
        ‹
      </button>
      ${s ? Z`<span class="tv-counter" aria-label="Trip ${this.index + 1} of ${this.trips.length}">${this.index + 1} / ${this.trips.length}</span>` : O}
      <button
        class="tv-btn"
        ?disabled=${f}
        @click=${this.next}
        aria-label="Next trip"
        title="Next trip"
      >
        ›
      </button>
    </div>`;
  }
  renderStats(o) {
    const s = this.config?.stats_grid;
    if (!s?.rows?.length) return O;
    const h = s.columns_default ?? Po, l = s.columns_mobile ?? 2, f = (x) => Math.min(1, Math.max(0, x)), d = s.tile_bg_alpha != null ? f(s.tile_bg_alpha) : 1, m = [
      `--tv-cols: ${h}`,
      `--tv-cols-mobile: ${l}`,
      `--jv-tile-bg-alpha: ${d}`
    ];
    s.tile_bg_color && m.push(`--jv-tile-bg-color: ${s.tile_bg_color}`);
    const M = (this.config?.order ?? "newest_first") === "newest_first" ? this.index + 1 : this.index - 1, z = this.trips[M];
    return (!this.rowCache || this.rowCache.trip !== o || this.rowCache.prevTrip !== z) && (this.rowCache = { trip: o, prevTrip: z, rows: /* @__PURE__ */ new WeakMap() }), Z`<div class="tv-stats" style=${m.join("; ")}>
      ${s.rows.map((x) => this.renderStatTile(x, o, z))}
    </div>`;
  }
  /** Compute the resolved numeric value for a row, honoring `ratio_of`.
   *  Returns the value to display (used by formatStat) and the number to
   *  feed the threshold/bar/trend computations. They diverge only when
   *  ratio_of is set + the denominator is missing → both null. */
  computeRowValue(o, s) {
    let h = o.key ? _e(s, o.key) : void 0, l = typeof h == "number" ? h : h == null ? null : Number(h);
    if (o.ratio_of && l != null && Number.isFinite(l)) {
      const f = _e(s, o.ratio_of), d = typeof f == "number" ? f : Number(f);
      Number.isFinite(d) && d !== 0 ? (l = l / d, h = l) : (l = null, h = null);
    }
    return { display: h, numeric: l };
  }
  /** Resolve the bar background gradient layer for a row. Returns undefined
   *  when no bar is configured or the value is missing/non-finite. */
  computeBarLayer(o, s, h, l) {
    const f = o.bar;
    if (!f || h == null || !Number.isFinite(h)) return;
    const d = ea(f.max, s);
    if (d == null) return;
    const m = ia(h, d), M = (f.color && f.color !== "auto" ? f.color : null) ?? l ?? // Fall back to primary if `auto` was set but no thresholds resolved.
    "var(--primary-color, #03a9f4)", z = f.track ?? "transparent";
    return `linear-gradient(to right, ${M} ${m}%, ${z} ${m}%)`;
  }
  /** Compute trend info for a row, including ratio_of-aware previous value. */
  computeRowTrend(o, s, h) {
    if (!o.trend || !s || !o.key) return;
    const l = _e(s, o.key);
    let f = typeof l == "number" ? l : l == null ? null : Number(l);
    if (o.ratio_of && f != null && Number.isFinite(f)) {
      const d = _e(s, o.ratio_of), m = typeof d == "number" ? d : Number(d);
      f = Number.isFinite(m) && m !== 0 ? f / m : null;
    }
    return na(h, f, o.trend.invert ?? !1);
  }
  /** Build (or reuse) the cached set of computed decorations for one row. */
  getRowComputed(o, s, h) {
    const l = this.rowCache, f = l.rows.get(o);
    if (f) return f;
    const { display: d, numeric: m } = this.computeRowValue(o, s), v = xo(d, o.format, o.decimals), M = Qs(m, o.thresholds), z = (o.color_mode ?? "solid") === "gradient" ? ta(m, o.thresholds) : M?.color, x = o.color_target ?? "value", H = M?.icon ?? o.icon, Y = !!o.bar && (!o.bar.color || o.bar.color === "auto"), K = this.computeBarLayer(o, s, m, z), B = this.computeRowTrend(o, h, m), Yt = {
      formatted: v,
      decorationColor: z,
      effectiveIcon: H,
      colorTarget: x,
      barBgLayer: K,
      barUsesAuto: Y,
      trendInfo: B
    };
    return l.rows.set(o, Yt), Yt;
  }
  renderStatTile(o, s, h) {
    const l = this.getRowComputed(o, s, h), f = l.barUsesAuto ? void 0 : l.decorationColor, d = [], m = ["tv-tile"];
    return f && (l.colorTarget === "value" ? d.push(`--jv-row-color: ${f}`) : d.push(`--jv-tile-bg-color: ${f}`)), l.barBgLayer && (d.push(`--jv-bar-layer: ${l.barBgLayer}`), m.push("has-bar")), l.colorTarget === "value" && f && m.push("colored-value"), Z`<div
      class=${m.join(" ")}
      style=${d.join("; ")}
    >
      <div class="tv-tile-label">
        ${l.effectiveIcon ? o.trend?.position === "replace_icon" && l.trendInfo ? this.renderTrendIcon(l.trendInfo, o.trend.show_delta ?? !1) : Z`<ha-icon icon=${l.effectiveIcon}></ha-icon>` : O}
        ${o.label}
      </div>
      <div class="tv-tile-value">
        ${l.trendInfo && o.trend?.position === "before_value" ? this.renderTrend(l.trendInfo, o.trend.show_delta ?? !1, o) : O}
        ${l.formatted}
        ${l.trendInfo && (o.trend?.position === "after_value" || o.trend?.position == null) ? this.renderTrend(l.trendInfo, o.trend?.show_delta ?? !1, o) : O}
      </div>
    </div>`;
  }
  renderTrend(o, s, h) {
    const l = o.direction === "up" ? "↑" : o.direction === "down" ? "↓" : "→", f = `tv-trend tv-trend-${o.sentiment}`, d = h.trend?.format, m = ["km", "L", "duration"].includes(h.format ?? ""), v = d ?? (m ? h.format : void 0), M = h.decimals ?? (Number.isInteger(o.delta) ? 0 : 2), z = s && o.direction !== "flat" ? ` ${xo(Math.abs(o.delta), v, M)}` : "";
    return Z`<span class=${f}>${l}${z}</span>`;
  }
  renderTrendIcon(o, s) {
    const h = o.direction === "up" ? "mdi:trending-up" : o.direction === "down" ? "mdi:trending-down" : "mdi:trending-neutral", l = `tv-trend tv-trend-${o.sentiment}`;
    return Z`<ha-icon class=${l} icon=${h}></ha-icon>`;
  }
  static {
    this.styles = Ao`
    ${To(Ms)}

    /*
     * Theme tokens. Every value below cascades from HA theme variables when
     * present, otherwise sensible fallbacks. Users can override any of them
     * via:
     *   - theme YAML:  journey-viewer-polyline-ev: "#ff00aa"
     *   - card_mod:    :host { --journey-viewer-polyline-ev: hotpink; }
     *   - per-card YAML: map.polyline.palette.ev: "#ff00aa"  (highest precedence)
     */
    :host {
      --jv-radius: var(--ha-card-border-radius, 12px);
      --jv-radius-sm: 6px;
      --jv-tile-bg: var(--secondary-background-color, #f3f4f6);
      --jv-legend-bg: var(--card-background-color, rgba(255, 255, 255, 0.92));
      --jv-leaflet-control-bg: var(--card-background-color, #fff);
      --jv-leaflet-control-fg: var(--primary-text-color, #333);
    }

    ha-card {
      padding: 12px 12px 8px;
      box-sizing: border-box;
    }
    /* When tap/hold/double-tap actions are configured, hint affordance.
       Cursor only appears outside the map (Leaflet sets its own cursors)
       and outside pager buttons (their own .tv-btn cursor wins). */
    ha-card.tv-actionable {
      cursor: pointer;
    }

    /* Make Leaflet's zoom buttons + attribution legible against any theme.
       Leaflet ships its own white-background controls; without an override
       they look stark against HA dark themes. */
    .leaflet-bar a,
    .leaflet-bar a:hover {
      background-color: var(--jv-leaflet-control-bg);
      color: var(--jv-leaflet-control-fg);
      border-bottom-color: var(--divider-color, #ddd);
    }
    .leaflet-bar a:hover {
      background-color: var(--secondary-background-color, #eee);
    }
    /* Always-on minimal attribution. OSM and CARTO usage policies require
       attribution; styling makes it small and low-contrast so it doesn't fight
       the data. Hovers up to full opacity for users who want to click through. */
    .leaflet-control-attribution {
      background: var(--jv-legend-bg) !important;
      color: var(--secondary-text-color, #666) !important;
      font-size: 8px !important;
      padding: 0 4px !important;
      line-height: 14px !important;
      opacity: 0.4;
      transition: opacity 150ms ease;
    }
    .leaflet-control-attribution:hover {
      opacity: 0.9;
    }
    .leaflet-control-attribution a {
      color: var(--primary-color, #03a9f4) !important;
    }
    .tv-title {
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .tv-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .tv-label {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .tv-pager {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tv-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--primary-color, #03a9f4);
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      transition:
        background 120ms ease,
        opacity 120ms ease;
    }
    /* Hover, mousedown, and keyboard focus all share the filled-accent look.
       Without explicit :active and :focus-visible rules the browser falls
       back to its default light-grey button styling, which is near-identical
       to our [disabled] state and makes a freshly-clicked button look like
       it just got greyed out. */
    .tv-btn:hover:not([disabled]),
    .tv-btn:active:not([disabled]),
    .tv-btn:focus-visible:not([disabled]) {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      outline: none;
    }
    /* Suppress the default focus ring when focus came from a click (mouse).
       :focus-visible above keeps the ring for keyboard users who need it. */
    .tv-btn:focus:not(:focus-visible) {
      outline: none;
    }
    .tv-btn[disabled] {
      opacity: 0.3;
      cursor: default;
      border-color: var(--disabled-text-color, #999);
      color: var(--disabled-text-color, #999);
    }
    .tv-counter {
      font-size: 12px;
      color: var(--secondary-text-color);
      min-width: 36px;
      text-align: center;
    }
    .tv-map-wrap {
      width: 100%;
      border-radius: var(--jv-radius);
      overflow: hidden;
      background: var(--jv-tile-bg);
      /* Confine Leaflet z-index stack to this card. Without isolation, Leaflet
         .leaflet-top/.leaflet-bottom controls (z-index 1000) escape upward and
         overlap HA's side drawer + mobile-app nav. Establishing a new stacking
         context here clamps all Leaflet z-indexes to within. */
      isolation: isolate;
      position: relative;
      z-index: 0;
    }
    .tv-map {
      width: 100%;
      height: 100%;
    }
    .tv-legend {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--jv-legend-bg);
      border-radius: var(--jv-radius-sm);
      padding: 4px 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      display: flex;
      gap: 10px;
      font-size: 11px;
      pointer-events: none;
      z-index: 400;
    }
    .tv-legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-text-color);
    }
    .tv-legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .tv-stats {
      display: grid;
      grid-template-columns: repeat(var(--tv-cols, 4), 1fr);
      gap: 8px;
      margin-top: 8px;
    }
    @media (max-width: 600px) {
      .tv-stats {
        grid-template-columns: repeat(var(--tv-cols-mobile, 2), 1fr);
      }
    }
    .tv-tile {
      /* Background composes two layers when a bar is present:
         1. Bar gradient overlay (top layer, opaque colored fill on left,
            track on right; supplied via --jv-bar-layer).
         2. Tile base color via color-mix (theme bg or per-row override,
            with alpha multiplier).
         When .has-bar is absent, --jv-bar-layer falls back to a transparent
         layer so the tile base shines through. */
      background:
        var(--jv-bar-layer, linear-gradient(transparent, transparent)),
        color-mix(
          in srgb,
          var(--jv-tile-bg-color, var(--jv-tile-bg))
            calc(var(--jv-tile-bg-alpha, 1) * 100%),
          transparent
        );
      border-radius: var(--jv-radius);
      padding: 8px 10px;
    }
    /* When color_target=value, the matched threshold colour rides on
       --jv-row-color which only the value text reads. Default fall-through
       is the tile's own primary text colour (no decoration). */
    .tv-tile.colored-value .tv-tile-value {
      color: var(--jv-row-color);
    }
    /* Trend arrow colours by sentiment. */
    .tv-trend {
      font-weight: 500;
      margin: 0 4px;
      font-size: 13px;
    }
    .tv-trend-good {
      color: var(--success-color, #2a9d8f);
    }
    .tv-trend-bad {
      color: var(--error-color, #e63946);
    }
    .tv-trend-neutral {
      color: var(--secondary-text-color, #888);
    }
    ha-icon.tv-trend {
      --mdc-icon-size: 18px;
    }
    .tv-tile-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tv-tile-label ha-icon {
      --mdc-icon-size: 14px;
    }
    .tv-tile-value {
      font-size: 16px;
      font-weight: 500;
      margin-top: 2px;
    }
    .tv-empty {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .tv-empty ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 8px;
    }
    .tv-empty-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
    }
  `;
  }
}
xe([
  Di({ attribute: !1 })
], Gt.prototype, "hass");
xe([
  Ot()
], Gt.prototype, "config");
xe([
  Ot()
], Gt.prototype, "index");
xe([
  Ot()
], Gt.prototype, "trips");
xe([
  Es(".tv-map")
], Gt.prototype, "mapEl");
customElements.get("journey-viewer-card") || (customElements.define("journey-viewer-card", Gt), window.customCards = window.customCards || [], window.customCards.push({
  type: "journey-viewer-card",
  name: "Journey Viewer",
  description: "Paginated GPS journey viewer. Drive, ride, run, hike. Toyota, Strava, Garmin, Komoot, generic.",
  preview: !0
}), console.info(
  `%c JOURNEY-VIEWER-CARD %c v${ra} `,
  "color: white; background: #1d8cf8; font-weight: 700;",
  "color: #1d8cf8; background: white; font-weight: 700;"
));
function je(u, o) {
  u.dispatchEvent(
    new CustomEvent("config-changed", {
      detail: { config: o },
      bubbles: !0,
      composed: !0
    })
  );
}
const ca = [
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    schema: [
      {
        name: "order",
        selector: { select: { options: ["newest_first", "oldest_first"] } }
      },
      { name: "default_index", selector: { number: { min: 0, mode: "box" } } }
    ]
  }
], ua = [
  {
    type: "grid",
    schema: [
      { name: "show_counter", selector: { boolean: {} } },
      { name: "wrap", selector: { boolean: {} } },
      { name: "keyboard", selector: { boolean: {} } }
    ]
  }
], da = [
  { name: "template", selector: { text: {} } }
], fa = [
  {
    type: "grid",
    schema: [
      {
        name: "height",
        selector: { number: { min: 120, max: 800, mode: "slider", step: 10 } }
      },
      {
        name: "padding_pct",
        selector: { number: { min: 0, max: 30, mode: "box" } }
      },
      {
        name: "gestures",
        selector: { select: { options: ["locked", "enabled"] } }
      },
      {
        name: "tile_provider",
        selector: {
          select: {
            options: ["openstreetmap", "carto-positron", "carto-dark-matter"]
          }
        }
      },
      { name: "zoom_to_fit", selector: { boolean: {} } }
    ]
  }
], pa = [
  {
    type: "grid",
    schema: [
      {
        name: "color_by",
        selector: {
          select: {
            options: ["solid", "ev", "overspeed", "highway", "mode"]
          }
        }
      },
      {
        name: "weight",
        selector: { number: { min: 1, max: 10, mode: "slider", step: 1 } }
      },
      {
        name: "opacity",
        selector: { number: { min: 0, max: 1, mode: "slider", step: 0.05 } }
      }
    ]
  }
], _a = [
  {
    type: "grid",
    schema: [
      { name: "label", required: !0, selector: { text: {} } },
      { name: "icon", selector: { icon: {} } }
    ]
  },
  {
    type: "grid",
    schema: [
      { name: "format", selector: { text: {} } },
      {
        name: "decimals",
        selector: { number: { min: 0, max: 6, mode: "box" } }
      }
    ]
  }
], ma = [
  {
    type: "grid",
    schema: [
      { name: "key", required: !0, selector: { text: {} } },
      { name: "ratio_of", selector: { text: {} } }
    ]
  }
], ga = [
  {
    type: "grid",
    schema: [
      {
        name: "color_target",
        selector: { select: { options: ["value", "tile"] } }
      },
      {
        name: "color_mode",
        selector: { select: { options: ["solid", "gradient"] } }
      }
    ]
  }
], va = [
  {
    type: "grid",
    schema: [
      {
        name: "value",
        required: !0,
        selector: { number: { mode: "box", step: 0.01 } }
      },
      { name: "color", selector: { text: { type: "color" } } },
      { name: "icon", selector: { icon: {} } }
    ]
  }
], ya = [
  { name: "max", selector: { text: {} } },
  {
    type: "grid",
    schema: [
      { name: "color", selector: { text: {} } },
      { name: "track", selector: { text: {} } }
    ]
  }
], ba = [
  {
    type: "grid",
    schema: [
      {
        name: "position",
        selector: {
          select: {
            options: ["after_value", "before_value", "replace_icon"]
          }
        }
      },
      { name: "show_delta", selector: { boolean: {} } },
      { name: "invert", selector: { boolean: {} } }
    ]
  },
  {
    name: "format",
    selector: {
      select: {
        custom_value: !0,
        mode: "dropdown",
        options: [
          { value: "{v:.1f}", label: "1 decimal ({v:.1f})" },
          { value: "{v:.2f}", label: "2 decimals ({v:.2f})" },
          { value: "{v:.0%}", label: "Percent ({v:.0%})" },
          { value: "km", label: "Kilometres (km)" },
          { value: "L", label: "Litres (L)" },
          { value: "duration", label: "Duration (mm:ss)" }
        ]
      }
    }
  }
], xa = [
  {
    type: "grid",
    schema: [
      { name: "name", required: !0, selector: { text: {} } },
      { name: "icon", selector: { icon: {} } }
    ]
  },
  { name: "entity", selector: { entity: {} } },
  { name: "color", selector: { text: { type: "color" } } }
], wa = [
  { name: "title", selector: { text: {} } },
  { name: "body", selector: { text: { multiline: !0 } } },
  { name: "icon", selector: { icon: {} } }
], Pa = {
  title: "Title",
  order: "Trip order",
  default_index: "Default trip index",
  position: "Position",
  show_counter: "Show counter",
  wrap: "Wrap at edges",
  keyboard: "Keyboard arrows",
  template: "Label template",
  height: "Map height (px)",
  padding_pct: "Fit padding (%)",
  gestures: "Gestures",
  tile_provider: "Tile provider",
  zoom_to_fit: "Zoom to fit route",
  color_by: "Colour by",
  weight: "Line weight",
  opacity: "Line opacity",
  body: "Body",
  icon: "Icon",
  name: "Name",
  entity: "Entity",
  color: "Colour",
  label: "Label",
  format: "Format",
  decimals: "Decimals",
  key: "Key (dot-path)",
  ratio_of: "Ratio of (dot-path, optional)",
  stat_id: "Stat",
  color_target: "Colour target",
  color_mode: "Colour mode",
  value: "Value (>=)",
  max: "Max (number or dot-path)",
  track: "Track colour",
  show_delta: "Show numeric delta",
  invert: "Invert (lower = better)"
}, Vt = [
  // Distance / time
  {
    id: "distance",
    label: "Distance",
    description: "Total distance travelled",
    key: "stats.distance_m",
    defaultFormat: "km",
    defaultIcon: "mdi:map-marker-distance",
    defaultDecimals: 2
  },
  {
    id: "duration",
    label: "Duration",
    description: "Trip duration",
    key: "stats.duration_s",
    defaultFormat: "duration",
    defaultIcon: "mdi:timer-outline"
  },
  // Speed
  {
    id: "avg_speed",
    label: "Avg speed",
    description: "Average speed across the trip",
    key: "stats.average_speed_kmh",
    defaultFormat: "{v:.1f} km/h",
    defaultIcon: "mdi:speedometer-medium"
  },
  {
    id: "max_speed",
    label: "Max speed",
    description: "Peak speed during the trip",
    key: "stats.max_speed_kmh",
    defaultFormat: "{v} km/h",
    defaultIcon: "mdi:speedometer"
  },
  // Fuel
  {
    id: "fuel",
    label: "Fuel",
    description: "Fuel consumed (litres)",
    key: "stats.fuel_consumption_ml",
    defaultFormat: "L",
    defaultIcon: "mdi:gas-station",
    defaultDecimals: 3
  },
  // Scores
  {
    id: "score_global",
    label: "Score (global)",
    key: "scores.global",
    defaultFormat: "{v} / 100",
    defaultIcon: "mdi:medal"
  },
  {
    id: "score_accel",
    label: "Score (acceleration)",
    key: "scores.acceleration",
    defaultFormat: "{v} / 100"
  },
  {
    id: "score_brake",
    label: "Score (braking)",
    key: "scores.braking",
    defaultFormat: "{v} / 100"
  },
  // Ratios (used to be `computed`)
  {
    id: "ev_ratio",
    label: "EV ratio",
    description: "EV km ÷ total km",
    key: "stats.ev_distance_m",
    ratio_of: "stats.distance_m",
    defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:lightning-bolt"
  },
  {
    id: "eco_ratio",
    label: "Eco ratio",
    description: "Eco km ÷ total km",
    key: "stats.eco_distance_m",
    ratio_of: "stats.distance_m",
    defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:leaf"
  },
  {
    id: "highway_ratio",
    label: "Highway ratio",
    description: "Highway km ÷ total km",
    key: "stats.length_highway_m",
    ratio_of: "stats.distance_m",
    defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:highway"
  },
  // Escape hatch
  {
    id: "__custom__",
    label: "Custom path…",
    description: "Specify any dot-path manually",
    key: ""
  }
];
function La(u, o) {
  if (u) {
    const s = Vt.find(
      (h) => h.key === u && (h.ratio_of ?? "") === (o ?? "")
    );
    if (s) return s;
  }
  return Vt[Vt.length - 1];
}
var Ta = Object.defineProperty, we = (u, o, s, h) => {
  for (var l = void 0, f = u.length - 1, d; f >= 0; f--)
    (d = u[f]) && (l = d(o, s, l) || l);
  return l && Ta(o, s, l), l;
};
function Aa() {
  (!customElements.get("ha-form") || !customElements.get("hui-card-features-editor")) && customElements.get("hui-tile-card")?.getConfigElement?.(), customElements.get("ha-entity-picker") || customElements.get("hui-entities-card")?.getConfigElement?.();
}
class It extends Ut {
  constructor() {
    super(...arguments), this._yamlMode = !1, this._yamlDraft = "", this._onSectionChange = (o) => (s) => {
      if (!this._config) return;
      const h = s.detail?.value ?? {}, l = this._mergeAtPath(this._config, o, h);
      this._config = l, je(this, l);
    }, this._computeLabel = (o) => Pa[o.name] ?? o.name, this._onSourceChange = (o, s) => {
      if (!this._config) return;
      const h = s.detail?.value ?? {}, l = [...this._config.sources ?? []];
      l[o] = { ...l[o], ...h }, this._updateSources(l);
    }, this._addSource = () => {
      if (!this._config) return;
      const o = [...this._config.sources ?? []];
      o.push({ name: `Source ${o.length + 1}` }), this._updateSources(o);
    }, this._computeStatHelper = (o) => {
      o.name;
    }, this._onRowStatChange = (o, s) => {
      if (!this._config) return;
      const h = s.detail?.value ?? {};
      if (!h.stat_id) return;
      const l = Vt.find((v) => v.id === h.stat_id);
      if (!l) return;
      const f = [...this._config.stats_grid?.rows ?? []], m = { ...f[o] ?? { label: "" } };
      l.id === "__custom__" || (m.key = l.key, l.ratio_of ? m.ratio_of = l.ratio_of : delete m.ratio_of), m.label || (m.label = l.label), !m.format && l.defaultFormat && (m.format = l.defaultFormat), !m.icon && l.defaultIcon && (m.icon = l.defaultIcon), m.decimals == null && l.defaultDecimals != null && (m.decimals = l.defaultDecimals), f[o] = m, this._updateRows(f);
    }, this._onRowFieldsChange = (o, s) => {
      if (!this._config) return;
      const h = s.detail?.value ?? {}, l = [...this._config.stats_grid?.rows ?? []], d = { ...l[o] ?? { label: "" }, ...this._stripEmpty(h) }, m = d;
      for (const v of ["icon", "format", "decimals", "ratio_of"])
        (h[v] === "" || h[v] === null || h[v] === void 0) && delete m[v];
      l[o] = d, this._updateRows(l);
    }, this._addRow = () => {
      if (!this._config) return;
      const o = [...this._config.stats_grid?.rows ?? []], s = Vt[0];
      o.push({
        key: s.key,
        label: s.label,
        format: s.defaultFormat,
        icon: s.defaultIcon,
        decimals: s.defaultDecimals
      }), this._updateRows(o);
    };
  }
  connectedCallback() {
    super.connectedCallback(), Aa();
  }
  setConfig(o) {
    this._config = o;
  }
  // ─── YAML fallback ─────────────────────────────────────────────────────
  _toggleYaml() {
    this._yamlMode || (this._yamlDraft = this._configToYaml(this._config), this._yamlError = void 0), this._yamlMode = !this._yamlMode;
  }
  _onYamlInput(o) {
    this._yamlDraft = o.detail?.value ?? "";
  }
  _applyYaml() {
    try {
      const o = this._yamlToConfig(this._yamlDraft);
      this._yamlError = void 0, this._config = o, je(this, o), this._yamlMode = !1;
    } catch (o) {
      this._yamlError = o.message;
    }
  }
  _configToYaml(o) {
    if (!o) return "";
    const s = window.jsyaml;
    return s ? s.dump(o) : JSON.stringify(o, null, 2);
  }
  _yamlToConfig(o) {
    const s = window.jsyaml, h = s ? s.load(o) : JSON.parse(o);
    if (!h || typeof h != "object")
      throw new Error("Config must be an object");
    return h;
  }
  _mergeAtPath(o, s, h) {
    const l = this._stripEmpty(h), f = o;
    let d;
    if (s === "top")
      d = { ...f, ...l };
    else if (s === "map.polyline") {
      const m = { ...f.map ?? {} };
      m.polyline = {
        ...m.polyline ?? {},
        ...l
      }, d = { ...f, map: m };
    } else
      d = {
        ...f,
        [s]: { ...f[s] ?? {}, ...l }
      };
    return d;
  }
  _stripEmpty(o) {
    const s = {};
    for (const [h, l] of Object.entries(o))
      l === void 0 || l === "" || l === null || (s[h] = l);
    return s;
  }
  _renderForm(o, s, h) {
    return Z`
      <ha-form
        .hass=${this.hass}
        .data=${s ?? {}}
        .schema=${o}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._onSectionChange(h)}
      ></ha-form>
    `;
  }
  // ─── Render ────────────────────────────────────────────────────────────
  render() {
    if (!this._config) return O;
    const o = this._config;
    if (this._yamlMode) return this._renderYaml();
    const s = {
      title: o.title,
      order: o.order,
      default_index: o.default_index
    };
    return Z`
      <div class="jve-root">
        ${this._renderForm(ca, s, "top")}

        ${this._section("Sources", this._renderSources(o.sources ?? []))}

        ${this._section(
      "Pagination",
      this._renderForm(ua, o.pagination, "pagination")
    )}
        ${this._section(
      "Trip label",
      this._renderForm(da, o.label, "label")
    )}
        ${this._section(
      "Map",
      Z`
            ${this._renderForm(fa, o.map, "map")}
            <div class="jve-subhead">Polyline</div>
            ${this._renderForm(
        pa,
        o.map?.polyline,
        "map.polyline"
      )}
          `
    )}

        ${this._section(
      "Stats grid rows",
      this._renderRows(o.stats_grid?.rows ?? [])
    )}

        ${this._section(
      "Empty state",
      this._renderForm(wa, o.empty_state, "empty_state")
    )}

        <div class="jve-yaml-bar">
          <ha-button @click=${this._toggleYaml}>Show YAML</ha-button>
        </div>
      </div>
    `;
  }
  _renderYaml() {
    return Z`
      <div class="jve-yaml">
        <div class="jve-yaml-hint">
          Editing as YAML. Click Apply to commit, or Back to discard.
        </div>
        <ha-code-editor
          mode="yaml"
          autofocus
          .value=${this._yamlDraft}
          @value-changed=${this._onYamlInput}
        ></ha-code-editor>
        ${this._yamlError ? Z`<div class="jve-yaml-error">${this._yamlError}</div>` : O}
        <div class="jve-yaml-bar">
          <ha-button @click=${this._toggleYaml}>Back</ha-button>
          <ha-button raised @click=${this._applyYaml}>Apply</ha-button>
        </div>
      </div>
    `;
  }
  _section(o, s) {
    return Z`
      <ha-expansion-panel outlined header=${o}>
        <div class="jve-body">${s}</div>
      </ha-expansion-panel>
    `;
  }
  // ─── Sources list builder ──────────────────────────────────────────────
  _renderSources(o) {
    return Z`
      <div class="jve-list">
        ${o.map((s, h) => this._renderSourceRow(s, h, o.length))}
        <div class="jve-list-actions">
          <ha-button @click=${this._addSource}>+ Add source</ha-button>
        </div>
      </div>
    `;
  }
  _renderSourceRow(o, s, h) {
    return Z`
      <div class="jve-row">
        <div class="jve-row-head">
          <span class="jve-row-title">
            ${o.name || `Source ${s + 1}`}
            ${o.entity ? Z`<span class="jve-row-sub">${o.entity}</span>` : O}
          </span>
          <div class="jve-row-controls">
            <ha-icon-button
              .disabled=${s === 0}
              .path=${"M7,15L12,10L17,15H7Z"}
              @click=${() => this._moveSource(s, -1)}
              label="Move up"
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${s === h - 1}
              .path=${"M7,10L12,15L17,10H7Z"}
              @click=${() => this._moveSource(s, 1)}
              label="Move down"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              @click=${() => this._removeSource(s)}
              label="Remove"
            ></ha-icon-button>
          </div>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${xa}
          .computeLabel=${this._computeLabel}
          @value-changed=${(l) => this._onSourceChange(s, l)}
        ></ha-form>
      </div>
    `;
  }
  _removeSource(o) {
    if (!this._config) return;
    const s = (this._config.sources ?? []).filter((h, l) => l !== o);
    this._updateSources(s);
  }
  _moveSource(o, s) {
    if (!this._config) return;
    const h = [...this._config.sources ?? []], l = o + s;
    l < 0 || l >= h.length || ([h[o], h[l]] = [h[l], h[o]], this._updateSources(h));
  }
  _updateSources(o) {
    if (!this._config) return;
    const s = { ...this._config, sources: o };
    this._config = s, je(this, s);
  }
  // ─── Stats rows builder ────────────────────────────────────────────────
  _renderRows(o) {
    return Z`
      <div class="jve-list">
        ${o.map((s, h) => this._renderRowCard(s, h, o.length))}
        <div class="jve-list-actions">
          <ha-button @click=${this._addRow}>+ Add row</ha-button>
        </div>
      </div>
    `;
  }
  _renderRowCard(o, s, h) {
    const l = La(o.key, o.ratio_of), f = this._buildStatSchema();
    return Z`
      <div class="jve-row">
        <div class="jve-row-head">
          <span class="jve-row-title">
            ${o.label || `Row ${s + 1}`}
            <span class="jve-row-sub">
              ← ${o.key || "(custom)"}${o.ratio_of ? Z` ÷ ${o.ratio_of}` : O}
            </span>
          </span>
          <div class="jve-row-controls">
            <ha-icon-button
              .disabled=${s === 0}
              .path=${"M7,15L12,10L17,15H7Z"}
              @click=${() => this._moveRow(s, -1)}
              label="Move up"
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${s === h - 1}
              .path=${"M7,10L12,15L17,10H7Z"}
              @click=${() => this._moveRow(s, 1)}
              label="Move down"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              @click=${() => this._removeRow(s)}
              label="Remove"
            ></ha-icon-button>
          </div>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${{ stat_id: l.id }}
          .schema=${f}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeStatHelper}
          @value-changed=${(d) => this._onRowStatChange(s, d)}
        ></ha-form>
        ${l.id === "__custom__" ? Z`<ha-form
              .hass=${this.hass}
              .data=${{ key: o.key ?? "", ratio_of: o.ratio_of ?? "" }}
              .schema=${ma}
              .computeLabel=${this._computeLabel}
              @value-changed=${(d) => this._onRowFieldsChange(s, d)}
            ></ha-form>` : O}
        <ha-form
          .hass=${this.hass}
          .data=${{
      label: o.label,
      icon: o.icon,
      format: o.format,
      decimals: o.decimals
    }}
          .schema=${_a}
          .computeLabel=${this._computeLabel}
          @value-changed=${(d) => this._onRowFieldsChange(s, d)}
        ></ha-form>

        ${this._subPanel(
      "Thresholds",
      Z`
            ${(o.thresholds ?? []).map(
        (d, m) => this._renderThreshold(s, m, d, o.thresholds.length)
      )}
            <div class="jve-list-actions">
              <ha-button @click=${() => this._addThreshold(s)}
                >+ Add threshold</ha-button
              >
            </div>
            <ha-form
              .hass=${this.hass}
              .data=${{
        color_target: o.color_target ?? "value",
        color_mode: o.color_mode ?? "solid"
      }}
              .schema=${ga}
              .computeLabel=${this._computeLabel}
              @value-changed=${(d) => this._onRowFieldsChange(s, d)}
            ></ha-form>
          `
    )}
        ${this._subPanel(
      "Bar background",
      Z`
            <ha-form
              .hass=${this.hass}
              .data=${o.bar ?? {}}
              .schema=${ya}
              .computeLabel=${this._computeLabel}
              @value-changed=${(d) => this._onBarChange(s, d)}
            ></ha-form>
          `
    )}
        ${this._subPanel(
      "Trend",
      Z`
            <ha-form
              .hass=${this.hass}
              .data=${o.trend ?? {}}
              .schema=${ba}
              .computeLabel=${this._computeLabel}
              @value-changed=${(d) => this._onTrendChange(s, d)}
            ></ha-form>
          `
    )}
      </div>
    `;
  }
  _subPanel(o, s) {
    return Z`
      <ha-expansion-panel outlined header=${o} class="jve-subpanel">
        <div class="jve-subpanel-body">${s}</div>
      </ha-expansion-panel>
    `;
  }
  // ─── Thresholds ────────────────────────────────────────────────────────
  _renderThreshold(o, s, h, l) {
    return Z`
      <div class="jve-threshold">
        <div class="jve-threshold-head">
          <span class="jve-threshold-tag">Threshold ${s + 1}</span>
          <div class="jve-row-controls">
            <ha-icon-button
              .disabled=${s === 0}
              .path=${"M7,15L12,10L17,15H7Z"}
              @click=${() => this._moveThreshold(o, s, -1)}
              label="Move up"
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${s === l - 1}
              .path=${"M7,10L12,15L17,10H7Z"}
              @click=${() => this._moveThreshold(o, s, 1)}
              label="Move down"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              @click=${() => this._removeThreshold(o, s)}
              label="Remove"
            ></ha-icon-button>
          </div>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${h}
          .schema=${va}
          .computeLabel=${this._computeLabel}
          @value-changed=${(f) => this._onThresholdChange(o, s, f)}
        ></ha-form>
      </div>
    `;
  }
  _addThreshold(o) {
    if (!this._config) return;
    const s = [...this._config.stats_grid?.rows ?? []], h = s[o], l = [...h.thresholds ?? []], f = l[l.length - 1];
    l.push({ value: f ? f.value + 1 : 0 }), s[o] = { ...h, thresholds: l }, this._updateRows(s);
  }
  _removeThreshold(o, s) {
    if (!this._config) return;
    const h = [...this._config.stats_grid?.rows ?? []], l = h[o], f = (l.thresholds ?? []).filter((d, m) => m !== s);
    h[o] = {
      ...l,
      ...f.length ? { thresholds: f } : {}
    }, f.length || delete h[o].thresholds, this._updateRows(h);
  }
  _moveThreshold(o, s, h) {
    if (!this._config) return;
    const l = [...this._config.stats_grid?.rows ?? []], f = l[o], d = [...f.thresholds ?? []], m = s + h;
    m < 0 || m >= d.length || ([d[s], d[m]] = [d[m], d[s]], l[o] = { ...f, thresholds: d }, this._updateRows(l));
  }
  _onThresholdChange(o, s, h) {
    if (!this._config) return;
    const l = h.detail?.value ?? {}, f = [...this._config.stats_grid?.rows ?? []], d = f[o], m = [...d.thresholds ?? []];
    m[s] = { ...m[s], ...l }, l.color || delete m[s].color, l.icon || delete m[s].icon, f[o] = { ...d, thresholds: m }, this._updateRows(f);
  }
  // ─── Bar / Trend sub-objects ───────────────────────────────────────────
  _onBarChange(o, s) {
    if (!this._config) return;
    const h = s.detail?.value ?? {}, l = [...this._config.stats_grid?.rows ?? []], f = l[o], d = this._stripEmpty(h);
    l[o] = Object.keys(d).length ? { ...f, bar: d } : (() => {
      const { bar: m, ...v } = f;
      return v;
    })(), this._updateRows(l);
  }
  _onTrendChange(o, s) {
    if (!this._config) return;
    const h = s.detail?.value ?? {}, l = [...this._config.stats_grid?.rows ?? []], f = l[o], d = this._stripEmpty(h);
    l[o] = Object.keys(d).length ? { ...f, trend: d } : (() => {
      const { trend: m, ...v } = f;
      return v;
    })(), this._updateRows(l);
  }
  /** Build the stat-picker schema from the catalogue. */
  _buildStatSchema() {
    return [
      {
        name: "stat_id",
        selector: {
          select: {
            mode: "dropdown",
            options: Vt.map((o) => ({
              value: o.id,
              label: o.label
            }))
          }
        }
      }
    ];
  }
  _removeRow(o) {
    if (!this._config) return;
    const s = (this._config.stats_grid?.rows ?? []).filter((h, l) => l !== o);
    this._updateRows(s);
  }
  _moveRow(o, s) {
    if (!this._config) return;
    const h = [...this._config.stats_grid?.rows ?? []], l = o + s;
    l < 0 || l >= h.length || ([h[o], h[l]] = [h[l], h[o]], this._updateRows(h));
  }
  _updateRows(o) {
    if (!this._config) return;
    const s = { ...this._config.stats_grid ?? { rows: [] }, rows: o }, h = { ...this._config, stats_grid: s };
    this._config = h, je(this, h);
  }
  static {
    this.styles = Ao`
    :host {
      display: block;
    }
    .jve-root {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    ha-expansion-panel {
      --expansion-panel-summary-padding: 0 12px;
      --expansion-panel-content-padding: 0;
    }
    .jve-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .jve-subhead {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    .jve-stub {
      font-size: 0.9rem;
      color: var(--secondary-text-color);
    }
    .jve-stub pre {
      background: var(--secondary-background-color);
      padding: 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      white-space: pre-wrap;
      margin: 8px 0 0;
    }
    .jve-yaml {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .jve-yaml-hint {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .jve-yaml-error {
      color: var(--error-color);
      font-size: 0.85rem;
      white-space: pre-wrap;
    }
    .jve-yaml-bar {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .jve-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .jve-list-actions {
      display: flex;
      justify-content: flex-end;
    }
    .jve-row {
      border: 1px solid var(--divider-color, #333);
      border-radius: 8px;
      padding: 8px 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .jve-row-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .jve-row-title {
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .jve-row-sub {
      font-weight: 400;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .jve-row-controls {
      display: flex;
      gap: 0;
    }
    .jve-row-tip {
      margin-top: 4px;
    }
    .jve-subpanel {
      --expansion-panel-summary-padding: 0 8px;
      --expansion-panel-content-padding: 0;
      margin-top: 4px;
    }
    .jve-subpanel-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
    }
    .jve-threshold {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px dashed var(--divider-color, #333);
      border-radius: 6px;
      padding: 4px 8px 8px;
    }
    .jve-threshold-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .jve-threshold-tag {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `;
  }
}
we([
  Di({ attribute: !1 })
], It.prototype, "hass");
we([
  Ot()
], It.prototype, "_config");
we([
  Ot()
], It.prototype, "_yamlMode");
we([
  Ot()
], It.prototype, "_yamlDraft");
we([
  Ot()
], It.prototype, "_yamlError");
customElements.get("journey-viewer-card-editor") || customElements.define("journey-viewer-card-editor", It);
const Sa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  JourneyViewerCardEditor: It
}, Symbol.toStringTag, { value: "Module" }));
export {
  Gt as JourneyViewerCard
};
//# sourceMappingURL=journey-viewer-card.js.map
