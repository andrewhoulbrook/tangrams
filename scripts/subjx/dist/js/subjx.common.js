/*@license
 * Drag/Rotate/Resize Library
 * Released under the MIT license, 2018-2020
 * Karen Sarksyan
 * nichollascarter@gmail.com
 */
"use strict";
const requestAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(e) { return setTimeout(e, 1e3 / 60) },
    cancelAnimFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function(e) { clearTimeout(e) },
    { forEach: forEach, slice: arrSlice, map: arrMap, reduce: arrReduce } = Array.prototype,
    { warn: warn } = console,
    isDef = e => null != e,
    isUndef = e => null == e,
    isFunc = e => "function" == typeof e,
    createMethod = e => isFunc(e) ? function() { e.call(this, ...arguments) } : () => {};
class Helper {
    constructor(e) {
        if ("string" == typeof e) {
            const t = document.querySelectorAll(e);
            this.length = t.length;
            for (let e = 0; e < this.length; e++) this[e] = t[e]
        } else if ("object" != typeof e || 1 !== e.nodeType && e !== document)
            if (e instanceof Helper) { this.length = e.length; for (let t = 0; t < this.length; t++) this[t] = e[t] } else {
                if (!isIterable(e)) throw new Error("Passed parameter must be selector/element/elementArray");
                this.length = 0;
                for (let t = 0; t < this.length; t++) 1 === e.nodeType && (this[t] = e[t], this.length++)
            }
        else this[0] = e, this.length = 1
    }
    css(e) {
        const t = {
            setStyle(e) {
                return ((e, t) => {
                    let s = e.length;
                    for (; s--;)
                        for (const o in t) e[s].style[o] = t[o];
                    return e.style
                })(this, e)
            },
            getStyle() { return (t => { let s = t.length; for (; s--;) return t[s].currentStyle ? t[s].currentStyle[e] : document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(t[s], "")[e] : t[s].style[e] })(this) }
        };
        return "string" == typeof e ? t.getStyle.apply(this, arrSlice.call(arguments, 1)) : "object" != typeof e && e ? (warn(`Method ${e} does not exist`), !1) : t.setStyle.apply(this, arguments)
    }
    on() { let e = this.length; for (; e--;) this[e].events || (this[e].events = {}, this[e].events[arguments[0]] = []), "string" != typeof arguments[1] ? document.addEventListener ? this[e].addEventListener(arguments[0], arguments[1], arguments[2] || { passive: !1 }) : document.attachEvent ? this[e].attachEvent(`on${arguments[0]}`, arguments[1]) : this[e][`on${arguments[0]}`] = arguments[1] : listenerDelegate(this[e], arguments[0], arguments[1], arguments[2], arguments[3], !0); return this }
    off() { let e = this.length; for (; e--;) this[e].events || (this[e].events = {}, this[e].events[arguments[0]] = []), "string" != typeof arguments[1] ? document.removeEventListener ? this[e].removeEventListener(arguments[0], arguments[1], arguments[2]) : document.detachEvent ? this[e].detachEvent(`on${arguments[0]}`, arguments[1]) : this[e][`on${arguments[0]}`] = null : listenerDelegate(this[e], arguments[0], arguments[1], arguments[2], arguments[3], !1); return this }
    is(e) {
        if (isUndef(e)) return !1;
        const t = helper(e);
        let s = this.length;
        for (; s--;)
            if (this[s] === t[s]) return !0;
        return !1
    }
}

function listenerDelegate(e, t, s, o, r, n) { const a = function(e) { let t = e.target; for (; t && t !== this;) t.matches(s) && o.call(t, e), t = t.parentNode };!0 === n ? document.addEventListener ? e.addEventListener(t, a, r || { passive: !1 }) : document.attachEvent ? e.attachEvent(`on${t}`, a) : e[`on${t}`] = a : document.removeEventListener ? e.removeEventListener(t, a, r || { passive: !1 }) : document.detachEvent ? e.detachEvent(`on${t}`, a) : e[`on${t}`] = null }

function isIterable(e) { return isDef(e) && "object" == typeof e && (Array.isArray(e) || isDef(window.Symbol) && "function" == typeof e[window.Symbol.iterator] || isDef(e.forEach) || "number" == typeof e.length && (0 === e.length || e.length > 0 && e.length - 1 in e)) }

function helper(e) { return new Helper(e) }
class Observable {
    constructor() { this.observers = {} }
    subscribe(e, t) { const s = this.observers; return isUndef(s[e]) && Object.defineProperty(s, e, { value: [] }), s[e].push(t), this }
    unsubscribe(e, t) {
        const s = this.observers;
        if (isDef(s[e])) {
            const o = s[e].indexOf(t);
            s[e].splice(o, 1)
        }
        return this
    }
    notify(e, t, s) {
        isUndef(this.observers[e]) || this.observers[e].forEach(o => {
            if (t !== o) switch (e) {
                case "onmove":
                    o.notifyMove(s);
                    break;
                case "onrotate":
                    o.notifyRotate(s);
                    break;
                case "onresize":
                    o.notifyResize(s);
                    break;
                case "onapply":
                    o.notifyApply(s);
                    break;
                case "ongetstate":
                    o.notifyGetState(s)
            }
        })
    }
}
class Event {
    constructor(e) { this.name = e, this.callbacks = [] }
    registerCallback(e) { this.callbacks.push(e) }
    removeCallback(e) {
        const t = this.callbacks(e);
        this.callbacks.splice(t, 1)
    }
}
class EventDispatcher {
    constructor() { this.events = {} }
    registerEvent(e) { this.events[e] = new Event(e) }
    emit(e, t, s) { this.events[t].callbacks.forEach(t => { t.call(e, s) }) }
    addEventListener(e, t) { this.events[e].registerCallback(t) }
    removeEventListener(e, t) { this.events[e].removeCallback(t) }
}
class SubjectModel {
    constructor(e) { this.el = e, this.storage = null, this.proxyMethods = null, this.eventDispatcher = new EventDispatcher, this._onMouseDown = this._onMouseDown.bind(this), this._onTouchStart = this._onTouchStart.bind(this), this._onMouseMove = this._onMouseMove.bind(this), this._onTouchMove = this._onTouchMove.bind(this), this._onMouseUp = this._onMouseUp.bind(this), this._onTouchEnd = this._onTouchEnd.bind(this), this._animate = this._animate.bind(this) }
    enable(e) { this._processOptions(e), this._init(this.el), this.proxyMethods.onInit.call(this, this.el) }
    disable() { throwNotImplementedError() }
    _init() { throwNotImplementedError() }
    _destroy() { throwNotImplementedError() }
    _processOptions() { throwNotImplementedError() }
    _start() { throwNotImplementedError() }
    _moving() { throwNotImplementedError() }
    _end() { throwNotImplementedError() }
    _animate() { throwNotImplementedError() }
    _drag({ dx: e, dy: t, ...s }) {
        const o = { dx: e, dy: t, transform: this._processMove(e, t), ...s };
        this.proxyMethods.onMove.call(this, o), this._emitEvent("drag", o)
    }
    _draw() { this._animate() }
    _onMouseDown(e) { this._start(e), helper(document).on("mousemove", this._onMouseMove).on("mouseup", this._onMouseUp) }
    _onTouchStart(e) { this._start(e.touches[0]), helper(document).on("touchmove", this._onTouchMove).on("touchend", this._onTouchEnd) }
    _onMouseMove(e) { e.preventDefault && e.preventDefault(), this._moving(e, this.el) }
    _onTouchMove(e) { e.preventDefault && e.preventDefault(), this._moving(e.touches[0], this.el) }
    _onMouseUp(e) { helper(document).off("mousemove", this._onMouseMove).off("mouseup", this._onMouseUp), this._end(e, this.el) }
    _onTouchEnd(e) { helper(document).off("touchmove", this._onTouchMove).off("touchend", this._onTouchEnd), 0 === e.touches.length && this._end(e.changedTouches[0], this.el) }
    _emitEvent() { this.eventDispatcher.emit(this, ...arguments) }
    on(e, t) { return this.eventDispatcher.addEventListener(e, t), this }
    off(e, t) { return this.eventDispatcher.removeEventListener(e, t), this }
}
const throwNotImplementedError = () => { throw Error("Method not implemented") },
    EVENTS = ["dragStart", "drag", "dragEnd", "resizeStart", "resize", "resizeEnd", "rotateStart", "rotate", "rotateEnd", "setPointStart", "setPointEnd"],
    RAD = Math.PI / 180,
    snapToGrid = (e, t) => { if (0 === t) return e; { const s = snapCandidate(e, t); if (s - e < t) return s } },
    snapCandidate = (e, t) => 0 === t ? e : Math.round(e / t) * t,
    floatToFixed = (e, t = 6) => Number(e.toFixed(t)),
    getOffset = e => e.getBoundingClientRect(),
    getTransform = e => { return e.css("-webkit-transform") || e.css("-moz-transform") || e.css("-ms-transform") || e.css("-o-transform") || e.css("transform") || "none" },
    parseMatrix = e => { const t = e.match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g); return t ? t.map(e => parseFloat(e)) : [1, 0, 0, 1, 0, 0] },
    addClass = (e, t) => {
        if (t) {
            if (e.classList) {
                if (!(t.indexOf(" ") > -1)) return e.classList.add(t);
                t.split(/\s+/).forEach(t => e.classList.add(t))
            }
            return e
        }
    },
    removeClass = (e, t) => {
        if (t) {
            if (e.classList) {
                if (!(t.indexOf(" ") > -1)) return e.classList.remove(t);
                t.split(/\s+/).forEach(t => e.classList.remove(t))
            }
            return e
        }
    },
    objectsCollide = (e, t) => { const { top: s, left: o } = getOffset(e), { top: r, left: n } = getOffset(t), a = helper(e), i = helper(t); return !(s < r || s + parseFloat(a.css("height")) > r + parseFloat(i.css("height")) || o < n || o + parseFloat(a.css("width")) > n + parseFloat(i.css("width"))) },
    matrixToCSS = e => { const t = `matrix(${e.join()})`; return { transform: t, webkitTranform: t, mozTransform: t, msTransform: t, otransform: t } };
class Transformable extends SubjectModel {
    constructor(e, t, s) {
        if (super(e), this.constructor === Transformable) throw new TypeError("Cannot construct Transformable instances directly");
        this.observable = s, EVENTS.forEach(e => { this.eventDispatcher.registerEvent(e) }), this.enable(t)
    }
    _cursorPoint() { throw Error("'_cursorPoint()' method not implemented") }
    _rotate({ radians: e, ...t }) {
        const s = { transform: this._processRotate(e), delta: e, ...t };
        this.proxyMethods.onRotate.call(this, s), this._emitEvent("rotate", s)
    }
    _resize({ dx: e, dy: t, ...s }) {
        const o = {...this._processResize(e, t), dx: e, dy: t, ...s };
        this.proxyMethods.onResize.call(this, o), this._emitEvent("resize", o)
    }
    _processOptions(e) {
        const { el: t } = this;
        addClass(t, "sjx-drag");
        const s = { x: 10, y: 10, angle: 10 * RAD },
            o = { move: !1, resize: !1, rotate: !1 };
        let r = null,
            n = !1,
            a = "xy",
            i = "auto",
            l = "auto",
            c = "auto",
            h = !1,
            d = !0,
            p = !0,
            u = !0,
            f = null,
            x = 50,
            m = !0,
            y = null,
            b = () => {},
            g = () => {},
            v = () => {},
            T = () => {},
            M = () => {},
            E = () => {},
            _ = t.parentNode;
        if (isDef(e)) {
            const { snap: w, each: S, axis: D, cursorMove: V, cursorResize: C, cursorRotate: j, rotationPoint: k, restrict: A, draggable: N, resizable: F, rotatable: z, onInit: R, onDrop: O, onMove: X, onResize: Y, onRotate: L, onDestroy: P, container: G, proportions: H, custom: I, rotatorAnchor: $, rotatorOffset: U, showNormal: B } = e;
            if (isDef(w)) {
                const { x: e, y: t, angle: o } = w;
                s.x = isUndef(e) ? 10 : e, s.y = isUndef(t) ? 10 : t, s.angle = isUndef(o) ? s.angle : o * RAD
            }
            if (isDef(S)) {
                const { move: e, resize: t, rotate: s } = S;
                o.move = e || !1, o.resize = t || !1, o.rotate = s || !1
            }
            isDef(A) && (r = "parent" === A ? t.parentNode : helper(A)[0] || document), i = V || "auto", l = C || "auto", c = j || "auto", a = D || "xy", _ = isDef(G) && helper(G)[0] ? helper(G)[0] : _, h = k || !1, n = H || !1, d = !isDef(N) || N, p = !isDef(F) || F, u = !isDef(z) || z, y = "object" == typeof I && I || null, f = $ || null, x = U || 50, m = !isDef(B) || B, b = createMethod(R), M = createMethod(O), g = createMethod(X), T = createMethod(Y), v = createMethod(L), E = createMethod(P)
        }
        this.options = { axis: a, cursorMove: i, cursorRotate: c, cursorResize: l, rotationPoint: h, restrict: r, container: _, snap: s, each: o, proportions: n, draggable: d, resizable: p, rotatable: u, custom: y, rotatorAnchor: f, rotatorOffset: x, showNormal: m }, this.proxyMethods = { onInit: b, onDrop: M, onMove: g, onResize: T, onRotate: v, onDestroy: E }, this.subscribe(o)
    }
    _animate() {
        const e = this,
            { observable: t, storage: s, options: o } = e;
        if (isUndef(s)) return;
        if (s.frame = requestAnimFrame(e._animate), !s.doDraw) return;
        s.doDraw = !1;
        let { dox: r, doy: n, clientX: a, clientY: i, doDrag: l, doResize: c, doRotate: h, doSetCenter: d, revX: p, revY: u } = s;
        const { snap: f, each: { move: x, resize: m, rotate: y }, restrict: b, draggable: g, resizable: v, rotatable: T } = o;
        if (c && v) {
            const { transform: o, cx: l, cy: c } = s, { x: h, y: d } = this._pointToElement({ x: a, y: i });
            let x = r ? snapToGrid(h - l, f.x / o.scX) : 0,
                y = n ? snapToGrid(d - c, f.y / o.scY) : 0;
            const b = { dx: x = r ? p ? -x : x : 0, dy: y = n ? u ? -y : y : 0, clientX: a, clientY: i };
            e._resize(b), m && t.notify("onresize", e, b)
        }
        if (l && g) {
            const { restrictOffset: o, elementOffset: l, nx: c, ny: h } = s;
            if (isDef(b)) {
                const { left: e, top: t } = o, { left: s, top: r, width: n, height: d } = l, p = c - a, u = h - i, f = b.clientWidth - n, x = b.clientHeight - d, m = r - t, y = s - e;
                m - u < 0 && (i = h - r + t), y - p < 0 && (a = c - s + e), m - u > x && (i = x + (h - r + t)), y - p > f && (a = f + (c - s + e))
            }
            const d = { dx: r ? snapToGrid(a - c, f.x) : 0, dy: n ? snapToGrid(i - h, f.y) : 0, clientX: a, clientY: i };
            e._drag(d), x && t.notify("onmove", e, d)
        }
        if (h && T) {
            const { pressang: o, center: r } = s, n = Math.atan2(i - r.y, a - r.x) - o, l = { clientX: a, clientY: i };
            e._rotate({ radians: snapToGrid(n, f.angle), ...l }), y && t.notify("onrotate", e, { radians: n, ...l })
        }
        if (d && T) {
            const { bx: t, by: o } = s, { x: r, y: n } = this._pointToControls({ x: a, y: i });
            e._moveCenterHandle(r - t, n - o)
        }
    }
    _start(e) {
        const { observable: t, storage: s, options: { axis: o, restrict: r, each: n }, el: a } = this, i = this._compute(e);
        Object.keys(i).forEach(e => { s[e] = i[e] });
        const { onRightEdge: l, onBottomEdge: c, onTopEdge: h, onLeftEdge: d, handle: p, factor: u, revX: f, revY: x, doW: m, doH: y } = i, b = l || c || h || d, { handles: g } = s, { rotator: v, center: T, radius: M } = g;
        isDef(M) && removeClass(M, "sjx-hidden");
        const E = p.is(v),
            _ = !!isDef(T) && p.is(T),
            w = !(E || b || _),
            { clientX: S, clientY: D } = e,
            { x: V, y: C } = this._cursorPoint({ clientX: S, clientY: D }),
            { x: j, y: k } = this._pointToElement({ x: V, y: C }),
            { x: A, y: N } = this._pointToControls({ x: V, y: C }),
            F = { clientX: S, clientY: D, nx: V, ny: C, cx: j, cy: k, bx: A, by: N, doResize: b, doDrag: w, doRotate: E, doSetCenter: _, onExecution: !0, cursor: null, elementOffset: getOffset(a), restrictOffset: isDef(r) ? getOffset(r) : null, dox: /\x/.test(o) && (!b || (p.is(g.ml) || p.is(g.mr) || p.is(g.tl) || p.is(g.tr) || p.is(g.bl) || p.is(g.br))), doy: /\y/.test(o) && (!b || (p.is(g.br) || p.is(g.bl) || p.is(g.bc) || p.is(g.tr) || p.is(g.tl) || p.is(g.tc))) };
        this.storage = {...s, ...F };
        const z = { clientX: S, clientY: D };
        b ? this._emitEvent("resizeStart", z) : E ? this._emitEvent("rotateStart", z) : w && this._emitEvent("dragStart", z);
        const { move: R, resize: O, rotate: X } = n, Y = b ? "resize" : E ? "rotate" : "drag", L = b && O || E && X || w && R;
        t.notify("ongetstate", this, { clientX: S, clientY: D, actionName: Y, triggerEvent: L, factor: u, revX: f, revY: x, doW: m, doH: y }), this._draw()
    }
    _moving(e) {
        const { storage: t, options: s } = this, { x: o, y: r } = this._cursorPoint(e);
        t.e = e, t.clientX = o, t.clientY = r, t.doDraw = !0;
        let { doRotate: n, doDrag: a, doResize: i, cursor: l } = t;
        const { cursorMove: c, cursorResize: h, cursorRotate: d } = s;
        isUndef(l) && (a ? l = c : n ? l = d : i && (l = h), helper(document.body).css({ cursor: l }))
    }
    _end({ clientX: e, clientY: t }) {
        const { options: { each: s }, observable: o, storage: r, proxyMethods: n } = this, { doResize: a, doDrag: i, doRotate: l, frame: c, handles: { radius: h } } = r, d = a ? "resize" : i ? "drag" : "rotate";
        r.doResize = !1, r.doDrag = !1, r.doRotate = !1, r.doSetCenter = !1, r.doDraw = !1, r.onExecution = !1, r.cursor = null, this._apply(d);
        const p = { clientX: e, clientY: t };
        n.onDrop.call(this, p), a ? this._emitEvent("resizeEnd", p) : l ? this._emitEvent("rotateEnd", p) : i && this._emitEvent("dragEnd", p);
        const { move: u, resize: f, rotate: x } = s, m = a && f || l && x || i && u;
        o.notify("onapply", this, { clientX: e, clientY: t, actionName: d, triggerEvent: m }), cancelAnimFrame(c), helper(document.body).css({ cursor: "auto" }), isDef(h) && addClass(h, "sjx-hidden")
    }
    _compute(e) { const { handles: t } = this.storage, s = helper(e.target), { revX: o, revY: r, doW: n, doH: a, ...i } = this._checkHandles(s, t), l = this._getState({ revX: o, revY: r, doW: n, doH: a }), { x: c, y: h } = this._cursorPoint(e), d = Math.atan2(h - l.center.y, c - l.center.x); return {...l, ...i, handle: s, pressang: d } }
    _checkHandles(e, t) { const { tl: s, tc: o, tr: r, bl: n, br: a, bc: i, ml: l, mr: c } = t, h = !!isDef(s) && e.is(s), d = !!isDef(o) && e.is(o), p = !!isDef(r) && e.is(r), u = !!isDef(n) && e.is(n), f = !!isDef(i) && e.is(i), x = !!isDef(a) && e.is(a), m = !!isDef(l) && e.is(l), y = !!isDef(c) && e.is(c); return { revX: h || m || u || d, revY: h || p || d || m, onTopEdge: d || p || h, onLeftEdge: h || m || u, onRightEdge: p || y || x, onBottomEdge: x || f || u, doW: m || y, doH: d || f } }
    notifyMove() { this._drag(...arguments) }
    notifyRotate({ radians: e, ...t }) {
        const { snap: { angle: s } } = this.options;
        this._rotate({ radians: snapToGrid(e, s), ...t })
    }
    notifyResize() { this._resize(...arguments) }
    notifyApply({ clientX: e, clientY: t, actionName: s, triggerEvent: o }) { this.proxyMethods.onDrop.call(this, { clientX: e, clientY: t }), o && (this._apply(s), this._emitEvent(`${s}End`, { clientX: e, clientY: t })) }
    notifyGetState({ clientX: e, clientY: t, actionName: s, triggerEvent: o, ...r }) {
        if (o) {
            const o = this._getState(r);
            this.storage = {...this.storage, ...o }, this._emitEvent(`${s}Start`, { clientX: e, clientY: t })
        }
    }
    subscribe({ resize: e, move: t, rotate: s }) {
        const { observable: o } = this;
        (t || e || s) && o.subscribe("ongetstate", this).subscribe("onapply", this), t && o.subscribe("onmove", this), e && o.subscribe("onresize", this), s && o.subscribe("onrotate", this)
    }
    unsubscribe() {
        const { observable: e } = this;
        e.unsubscribe("ongetstate", this).unsubscribe("onapply", this).unsubscribe("onmove", this).unsubscribe("onresize", this).unsubscribe("onrotate", this)
    }
    disable() {
        const { storage: e, proxyMethods: t, el: s } = this;
        isUndef(e) || (e.onExecution && (this._end(), helper(document).off("mousemove", this._onMouseMove).off("mouseup", this._onMouseUp).off("touchmove", this._onTouchMove).off("touchend", this._onTouchEnd)), removeClass(s, "sjx-drag"), this._destroy(), this.unsubscribe(), t.onDestroy.call(this, s), delete this.storage)
    }
    exeDrag({ dx: e, dy: t }) {
        const { draggable: s } = this.options;
        s && (this.storage = {...this.storage, ...this._getState({ revX: !1, revY: !1, doW: !1, doH: !1 }) }, this._drag({ dx: e, dy: t }), this._apply("drag"))
    }
    exeResize({ dx: e, dy: t, revX: s, revY: o, doW: r, doH: n }) {
        const { resizable: a } = this.options;
        a && (this.storage = {...this.storage, ...this._getState({ revX: s || !1, revY: o || !1, doW: r || !1, doH: n || !1 }) }, this._resize({ dx: e, dy: t }), this._apply("resize"))
    }
    exeRotate({ delta: e }) {
        const { rotatable: t } = this.options;
        t && (this.storage = {...this.storage, ...this._getState({ revX: !1, revY: !1, doW: !1, doH: !1 }) }, this._rotate({ radians: e }), this._apply("rotate"))
    }
}
const matrixTransform = ({ x: e, y: t }, s) => { const [o, r, n, a, i, l] = s; return { x: o * e + n * t + i, y: r * e + a * t + l } },
    matrixInvert = e => {
        const t = [
            [e[0], e[2], e[4]],
            [e[1], e[3], e[5]],
            [0, 0, 1]
        ];
        if (t.length !== t[0].length) return;
        const s = t.length,
            o = [],
            r = [];
        for (let e = 0; e < s; e += 1) { o[o.length] = [], r[r.length] = []; for (let n = 0; n < s; n += 1) o[e][n] = e == n ? 1 : 0, r[e][n] = t[e][n] }
        for (let e = 0; e < s; e += 1) {
            let t = r[e][e];
            if (0 === t) {
                for (let n = e + 1; n < s; n += 1)
                    if (0 !== r[n][e]) { for (let a = 0; a < s; a++) t = r[e][a], r[e][a] = r[n][a], r[n][a] = t, t = o[e][a], o[e][a] = o[n][a], o[n][a] = t; break }
                if (0 === (t = r[e][e])) return
            }
            for (let n = 0; n < s; n++) r[e][n] = r[e][n] / t, o[e][n] = o[e][n] / t;
            for (let n = 0; n < s; n++)
                if (n != e) { t = r[n][e]; for (let a = 0; a < s; a++) r[n][a] -= t * r[e][a], o[n][a] -= t * o[e][a] }
        }
        return [o[0][0], o[1][0], o[0][1], o[1][1], o[0][2], o[1][2]]
    },
    multiplyMatrix = ([e, t, s, o, r, n], [a, i, l, c, h, d]) => {
        const p = [
                [e, s, r],
                [t, o, n],
                [0, 0, 1]
            ],
            u = [
                [a, l, h],
                [i, c, d],
                [0, 0, 1]
            ],
            f = [];
        for (let e = 0; e < u.length; e++) {
            f[e] = [];
            for (let t = 0; t < p[0].length; t++) {
                let s = 0;
                for (let o = 0; o < p.length; o++) s += p[o][t] * u[e][o];
                f[e].push(s)
            }
        }
        return [f[0][0], f[1][0], f[0][1], f[1][1], f[0][2], f[1][2]]
    },
    rotatedTopLeft = (e, t, s, o, r, n, a, i, l) => {
        const c = parseFloat(s) / 2,
            h = parseFloat(o) / 2,
            d = e + c,
            p = t + h,
            u = e - d,
            f = t - p,
            x = Math.atan2(i ? 0 : f, l ? 0 : u) + r,
            m = Math.sqrt(Math.pow(l ? 0 : c, 2) + Math.pow(i ? 0 : h, 2));
        let y = Math.cos(x),
            b = Math.sin(x);
        const g = p + m * (b = !0 === a ? -b : b);
        return { left: floatToFixed(d + m * (y = !0 === n ? -y : y)), top: floatToFixed(g) }
    },
    MIN_SIZE = 2,
    CENTER_DELTA = 7;
class Draggable extends Transformable {
    _init(e) {
        const { rotationPoint: t, container: s, resizable: o, rotatable: r, showNormal: n } = this.options, { left: a, top: i, width: l, height: c } = e.style, h = document.createElement("div");
        addClass(h, "sjx-wrapper"), s.appendChild(h);
        const d = helper(e),
            p = l || d.css("width"),
            u = c || d.css("height"),
            f = { top: i || d.css("top"), left: a || d.css("left"), width: p, height: u, transform: getTransform(d) },
            x = document.createElement("div");
        addClass(x, "sjx-controls");
        const m = {...r && { normal: n ? ["sjx-normal"] : null, rotator: ["sjx-hdl", "sjx-hdl-m", "sjx-rotator"] }, ...o && { tl: ["sjx-hdl", "sjx-hdl-t", "sjx-hdl-l", "sjx-hdl-tl"], tr: ["sjx-hdl", "sjx-hdl-t", "sjx-hdl-r", "sjx-hdl-tr"], br: ["sjx-hdl", "sjx-hdl-b", "sjx-hdl-r", "sjx-hdl-br"], bl: ["sjx-hdl", "sjx-hdl-b", "sjx-hdl-l", "sjx-hdl-bl"], tc: ["sjx-hdl", "sjx-hdl-t", "sjx-hdl-c", "sjx-hdl-tc"], bc: ["sjx-hdl", "sjx-hdl-b", "sjx-hdl-c", "sjx-hdl-bc"], ml: ["sjx-hdl", "sjx-hdl-m", "sjx-hdl-l", "sjx-hdl-ml"], mr: ["sjx-hdl", "sjx-hdl-m", "sjx-hdl-r", "sjx-hdl-mr"] }, center: t && r ? ["sjx-hdl", "sjx-hdl-m", "sjx-hdl-c", "sjx-hdl-mc"] : void 0 };
        if (Object.keys(m).forEach(e => {
                const t = m[e];
                if (isUndef(t)) return;
                const s = createHandler(t);
                m[e] = s, x.appendChild(s)
            }), isDef(m.center)) { helper(m.center).css({ left: `${e.getAttribute("data-cx")}px`, top: `${e.getAttribute("data-cy")}px` }) }
        h.appendChild(x);
        const y = helper(x);
        y.css(f), this.storage = { controls: x, handles: m, radius: void 0, parent: e.parentNode }, y.on("mousedown", this._onMouseDown).on("touchstart", this._onTouchStart)
    }
    _destroy() {
        const { controls: e } = this.storage;
        helper(e).off("mousedown", this._onMouseDown).off("touchstart", this._onTouchStart);
        const t = e.parentNode;
        t.parentNode.removeChild(t)
    }
    _pointToElement({ x: e, y: t }) { const { transform: s } = this.storage, o = [...s.matrix]; return o[4] = o[5] = 0, this._applyMatrixToPoint(matrixInvert(o), e, t) }
    _pointToControls(e) { return this._pointToElement(e) }
    _applyMatrixToPoint(e, t, s) { return matrixTransform({ x: t, y: s }, e) }
    _cursorPoint({ clientX: e, clientY: t }) { const { container: s } = this.options, o = parseMatrix(getTransform(helper(s))); return matrixTransform({ x: e, y: t }, matrixInvert(o)) }
    _apply() {
        const { el: e, storage: t } = this, { controls: s, handles: o } = t, r = helper(s), n = parseFloat(r.css("width")) / 2, a = parseFloat(r.css("height")) / 2, { center: i } = o, l = isDef(i), c = l ? parseFloat(helper(i).css("left")) : n, h = l ? parseFloat(helper(i).css("top")) : a;
        e.setAttribute("data-cx", c), e.setAttribute("data-cy", h), this.storage.cached = null
    }
    _processResize(e, t) {
        const { el: s, storage: o, options: { proportions: r } } = this, { controls: n, coords: a, cw: i, ch: l, transform: c, refang: h, revX: d, revY: p, doW: u, doH: f } = o, x = u || !u && !f ? (i + e) / i : (l + t) / l, m = r ? i * x : i + e, y = r ? l * x : l + t;
        if (m <= MIN_SIZE || y <= MIN_SIZE) return;
        const b = [...c.matrix],
            g = rotatedTopLeft(b[4], b[5], m, y, h, d, p, u, f),
            v = a.left - g.left,
            T = a.top - g.top;
        b[4] += v, b[5] += T;
        const M = matrixToCSS(b);
        return M.width = `${m}px`, M.height = `${y}px`, helper(n).css(M), helper(s).css(M), o.cached = { dx: v, dy: T }, { width: m, height: y, ox: v, oy: T }
    }
    _processMove(e, t) {
        const { el: s, storage: o } = this, { controls: r, transform: { matrix: n, parentMatrix: a } } = o, i = [...a];
        i[4] = i[5] = 0;
        const l = [...n];
        l[4] = n[4] + e, l[5] = n[5] + t;
        const c = matrixToCSS(l);
        return helper(r).css(c), helper(s).css(c), o.cached = { dx: e, dy: t }, l
    }
    _processRotate(e) {
        const { el: t, storage: { controls: s, transform: o, center: r } } = this, { matrix: n, parentMatrix: a } = o, i = floatToFixed(Math.cos(e), 4), l = floatToFixed(Math.sin(e), 4), c = [1, 0, 0, 1, r.cx, r.cy], h = [i, l, -l, i, 0, 0], d = [...a];
        d[4] = d[5] = 0;
        const p = multiplyMatrix(matrixInvert(d), multiplyMatrix(h, d)),
            u = multiplyMatrix(multiplyMatrix(c, p), matrixInvert(c)),
            f = multiplyMatrix(u, n),
            x = matrixToCSS(f);
        return helper(s).css(x), helper(t).css(x), f
    }
    _getState(e) { const { revX: t, revY: s, doW: o, doH: r } = e, n = t !== s ? -1 : 1, { el: a, storage: { handles: i, controls: l, parent: c }, options: { container: h } } = this, { center: d } = i, p = helper(l), u = parseMatrix(getTransform(helper(h))), f = parseMatrix(getTransform(helper(l))), x = parseMatrix(getTransform(helper(c))), m = Math.atan2(f[1], f[0]) * n, y = c !== h ? multiplyMatrix(x, u) : u, b = { matrix: f, parentMatrix: y, scX: Math.sqrt(f[0] * f[0] + f[1] * f[1]), scY: Math.sqrt(f[2] * f[2] + f[3] * f[3]) }, g = parseFloat(p.css("width")), v = parseFloat(p.css("height")), T = rotatedTopLeft(f[4], f[5], g, v, m, t, s, o, r), M = g / 2, E = v / 2, _ = getOffset(a), w = isDef(d), S = w ? parseFloat(helper(d).css("left")) : M, D = w ? parseFloat(helper(d).css("top")) : E, V = w ? CENTER_DELTA : 0, { x: C, y: j } = matrixTransform({ x: _.left, y: _.top }, matrixInvert(y)); return { transform: b, cw: g, ch: v, coords: T, center: { x: C + S - V, y: j + D - V, cx: -S + M - V, cy: -D + E - V, hx: S, hy: D }, factor: n, refang: m, revX: t, revY: s, doW: o, doH: r } }
    _moveCenterHandle(e, t) {
        const { handles: { center: s }, center: { hx: o, hy: r } } = this.storage, n = `${o+e}px`, a = `${r+t}px`;
        helper(s).css({ left: n, top: a })
    }
    resetCenterPoint() {
        const { handles: { center: e } } = this.storage;
        helper(e).css({ left: null, top: null })
    }
    fitControlsToSize() {}
    get controls() { return this.storage.controls }
}
const createHandler = e => { const t = document.createElement("div"); return e.forEach(e => { addClass(t, e) }), t },
    svgPoint = createSVGElement("svg").createSVGPoint(),
    floatRE = /[+-]?\d+(\.\d+)?/g,
    ALLOWED_ELEMENTS = ["circle", "ellipse", "image", "line", "path", "polygon", "polyline", "rect", "text", "g"];

function createSVGElement(e) { return document.createElementNS("http://www.w3.org/2000/svg", e) }
const checkChildElements = e => { const t = []; return isGroup(e) ? forEach.call(e.childNodes, e => { if (1 === e.nodeType) { const s = e.tagName.toLowerCase(); - 1 !== ALLOWED_ELEMENTS.indexOf(s) && ("g" === s && t.push(...checkChildElements(e)), t.push(e)) } }) : t.push(e), t },
    createSVGMatrix = () => createSVGElement("svg").createSVGMatrix(),
    getTransformToElement = (e, t) => { return (t.getScreenCTM() || createSVGMatrix()).inverse().multiply(e.getScreenCTM() || createSVGMatrix()) },
    matrixToString = e => { const { a: t, b: s, c: o, d: r, e: n, f: a } = e; return `matrix(${t},${s},${o},${r},${n},${a})` },
    pointTo = (e, t, s) => (svgPoint.x = t, svgPoint.y = s, svgPoint.matrixTransform(e)),
    cloneMatrix = e => { const t = createSVGMatrix(); return t.a = e.a, t.b = e.b, t.c = e.c, t.d = e.d, t.e = e.e, t.f = e.f, t },
    checkElement = e => { const t = e.tagName.toLowerCase(); return -1 !== ALLOWED_ELEMENTS.indexOf(t) || (warn("Selected element is not allowed to transform. Allowed elements:\ncircle, ellipse, image, line, path, polygon, polyline, rect, text, g"), !1) },
    isIdentity = e => { const { a: t, b: s, c: o, d: r, e: n, f: a } = e; return 1 === t && 0 === s && 0 === o && 1 === r && 0 === n && 0 === a },
    createPoint = (e, t, s) => { if (isUndef(t) || isUndef(s)) return null; const o = e.createSVGPoint(); return o.x = t, o.y = s, o },
    isGroup = e => "g" === e.tagName.toLowerCase(),
    parsePoints = e => e.match(floatRE).reduce((e, t, s, o) => (s % 2 == 0 && e.push(o.slice(s, s + 2)), e), []),
    dRE = /\s*([achlmqstvz])([^achlmqstvz]*)\s*/gi,
    sepRE = /\s*,\s*|\s+/g,
    parsePath = e => {
        let t = dRE.lastIndex = 0;
        const s = [];
        for (; t = dRE.exec(e);) {
            const e = t[1],
                o = e.toUpperCase(),
                r = t[2].replace(/([^e])-/g, "$1 -").replace(/ +/g, " ");
            s.push({ relative: e !== o, key: o, cmd: e, values: r.trim().split(sepRE).map(e => { if (!isNaN(e)) return Number(e) }) })
        }
        return s
    },
    movePath = e => {
        const { path: t, dx: s, dy: o } = e;
        try {
            const e = parsePath(t);
            let r = "",
                n = " ",
                a = !0;
            for (let t = 0, i = e.length; t < i; t++) {
                const i = e[t],
                    { values: l, key: c, relative: h } = i,
                    d = [];
                switch (c) {
                    case "M":
                        for (let e = 0, t = l.length; e < t; e += 2) {
                            let [t, r] = l.slice(e, e + 2);
                            h && !a || (t += s, r += o), d.push(t, r), a = !1
                        }
                        break;
                    case "A":
                        for (let e = 0, t = l.length; e < t; e += 7) {
                            const t = l.slice(e, e + 7);
                            h || (t[5] += s, t[6] += o), d.push(...t)
                        }
                        break;
                    case "C":
                        for (let e = 0, t = l.length; e < t; e += 6) {
                            const t = l.slice(e, e + 6);
                            h || (t[0] += s, t[1] += o, t[2] += s, t[3] += o, t[4] += s, t[5] += o), d.push(...t)
                        }
                        break;
                    case "H":
                        for (let e = 0, t = l.length; e < t; e += 1) {
                            const t = l.slice(e, e + 1);
                            h || (t[0] += s), d.push(t[0])
                        }
                        break;
                    case "V":
                        for (let e = 0, t = l.length; e < t; e += 1) {
                            const t = l.slice(e, e + 1);
                            h || (t[0] += o), d.push(t[0])
                        }
                        break;
                    case "L":
                    case "T":
                        for (let e = 0, t = l.length; e < t; e += 2) {
                            let [t, r] = l.slice(e, e + 2);
                            h || (t += s, r += o), d.push(t, r)
                        }
                        break;
                    case "Q":
                    case "S":
                        for (let e = 0, t = l.length; e < t; e += 4) {
                            let [t, r, n, a] = l.slice(e, e + 4);
                            h || (t += s, r += o, n += s, a += o), d.push(t, r, n, a)
                        }
                        break;
                    case "Z":
                        l[0] = "", n = ""
                }
                r += i.cmd + d.join(",") + n
            }
            return r
        } catch (e) { warn("Path parsing error: " + e) }
    },
    resizePath = e => {
        const { path: t, localCTM: s } = e;
        try {
            const e = parsePath(t);
            let o = "",
                r = " ";
            const n = [];
            let a = !0;
            for (let t = 0, i = e.length; t < i; t++) {
                const i = e[t],
                    { values: l, key: c, relative: h } = i;
                switch (c) {
                    case "A":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 7) {
                                const [o, r, n, a, i, c, d] = l.slice(t, t + 7), p = cloneMatrix(s);
                                h && (p.e = p.f = 0);
                                const { x: u, y: f } = pointTo(p, c, d);
                                e.push(floatToFixed(u), floatToFixed(f)), p.e = p.f = 0;
                                const { x: x, y: m } = pointTo(p, o, r);
                                e.unshift(floatToFixed(x), floatToFixed(m), n, a, i)
                            }
                            n.push(e);
                            break
                        }
                    case "C":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 6) {
                                const [o, r, n, a, i, c] = l.slice(t, t + 6), d = cloneMatrix(s);
                                h && (d.e = d.f = 0);
                                const { x: p, y: u } = pointTo(d, o, r), { x: f, y: x } = pointTo(d, n, a), { x: m, y: y } = pointTo(d, i, c);
                                e.push(floatToFixed(p), floatToFixed(u), floatToFixed(f), floatToFixed(x), floatToFixed(m), floatToFixed(y))
                            }
                            n.push(e);
                            break
                        }
                    case "H":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 1) {
                                const [o] = l.slice(t, t + 1), r = cloneMatrix(s);
                                h && (r.e = r.f = 0);
                                const { x: n } = pointTo(r, o, 0);
                                e.push(floatToFixed(n))
                            }
                            n.push(e);
                            break
                        }
                    case "V":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 1) {
                                const [o] = l.slice(t, t + 1), r = cloneMatrix(s);
                                h && (r.e = r.f = 0);
                                const { y: n } = pointTo(r, 0, o);
                                e.push(floatToFixed(n))
                            }
                            n.push(e);
                            break
                        }
                    case "T":
                    case "L":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 2) {
                                const [o, r] = l.slice(t, t + 2), n = cloneMatrix(s);
                                h && (n.e = n.f = 0);
                                const { x: a, y: i } = pointTo(n, o, r);
                                e.push(floatToFixed(a), floatToFixed(i))
                            }
                            n.push(e);
                            break
                        }
                    case "M":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 2) {
                                const [o, r] = l.slice(t, t + 2), n = cloneMatrix(s);
                                h && !a && (n.e = n.f = 0);
                                const { x: i, y: c } = pointTo(n, o, r);
                                e.push(floatToFixed(i), floatToFixed(c)), a = !1
                            }
                            n.push(e);
                            break
                        }
                    case "Q":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 4) {
                                const [o, r, n, a] = l.slice(t, t + 4), i = cloneMatrix(s);
                                h && (i.e = i.f = 0);
                                const { x: c, y: d } = pointTo(i, o, r), { x: p, y: u } = pointTo(i, n, a);
                                e.push(floatToFixed(c), floatToFixed(d), floatToFixed(p), floatToFixed(u))
                            }
                            n.push(e);
                            break
                        }
                    case "S":
                        {
                            const e = [];
                            for (let t = 0, o = l.length; t < o; t += 4) {
                                const [o, r, n, a] = l.slice(t, t + 4), i = cloneMatrix(s);
                                h && (i.e = i.f = 0);
                                const { x: c, y: d } = pointTo(i, o, r), { x: p, y: u } = pointTo(i, n, a);
                                e.push(floatToFixed(c), floatToFixed(d), floatToFixed(p), floatToFixed(u))
                            }
                            n.push(e);
                            break
                        }
                    case "Z":
                        n.push([""]), r = ""
                }
                o += i.cmd + n[t].join(",") + r
            }
            return o
        } catch (e) { warn("Path parsing error: " + e) }
    },
    MIN_SIZE$1 = 5,
    //THEME_COLOR = "#00a8ff";
    THEME_COLOR = "#ff0000";

class DraggableSVG extends Transformable {
    _init(e) {
        const { rotationPoint: t, container: s, resizable: o, rotatable: r, rotatorAnchor: n, rotatorOffset: a, showNormal: i, custom: l } = this.options, c = createSVGElement("g");
        addClass(c, "sjx-svg-wrapper"), s.appendChild(c);
        const { width: h, height: d, x: p, y: u } = e.getBBox(), f = getTransformToElement(e, s), x = createSVGElement("rect");
        [
            ["width", h],
            ["height", d],
            ["x", p],
            ["y", u],
            ["fill", THEME_COLOR],
            ["fill-opacity", .1],
            ["stroke", THEME_COLOR],
            ["stroke-dasharray", "3 3"],
            ["vector-effect", "non-scaling-stroke"],
            ["transform", matrixToString(f)]
        ].forEach(([e, t]) => { x.setAttribute(e, t) });
        const m = createSVGElement("g"),
            y = createSVGElement("g"),
            b = createSVGElement("g");
        addClass(b, "sjx-svg-box-group"), addClass(m, "sjx-svg-handles"), addClass(y, "sjx-svg-normal-group"), b.appendChild(x), c.appendChild(b), c.appendChild(y), c.appendChild(m);
        const g = x.getBBox(),
            { x: v, y: T, width: M, height: E } = g,
            _ = e.getAttribute("data-cx"),
            w = e.getAttribute("data-cy"),
            S = getTransformToElement(x, x.parentNode),
            D = pointTo(S, v + M / 2, T + E / 2),
            V = pointTo(S, v, T),
            C = pointTo(S, v + M, T),
            j = pointTo(S, v + M, T + E / 2),
            k = pointTo(S, v, T + E / 2),
            A = pointTo(S, v + M / 2, T),
            N = pointTo(S, v + M / 2, T + E),
            F = pointTo(S, v + M, T + E),
            z = pointTo(S, v, T + E),
            R = { tl: V, tr: C, br: F, bl: z, tc: A, bc: N, ml: k, mr: j };
        let O = {},
            X = null;
        if (r) {
            const e = {};
            let s = 1;
            switch (n) {
                case "n":
                    e.x = A.x, e.y = A.y;
                    break;
                case "s":
                    e.x = N.x, e.y = N.y, s = -1;
                    break;
                case "w":
                    e.x = k.x, e.y = k.y, s = -1;
                    break;
                case "e":
                default:
                    e.x = j.x, e.y = j.y
            }
            const o = "n" === n || "s" === n ? Math.atan2(z.y - V.y, z.x - V.x) : Math.atan2(V.y - C.y, V.x - C.x);
            X = { x: e.x - a * s * Math.cos(o), y: e.y - a * s * Math.sin(o) };
            const r = i ? createSVGElement("line") : null;
            i && (r.x1.baseVal.value = e.x, r.y1.baseVal.value = e.y, r.x2.baseVal.value = X.x, r.y2.baseVal.value = X.y, setLineStyle(r, THEME_COLOR), y.appendChild(r));
            let l = null;
            t && (l = createSVGElement("line"), addClass(l, "sjx-hidden"), l.x1.baseVal.value = D.x, l.y1.baseVal.value = D.y, l.x2.baseVal.value = _ || D.x, l.y2.baseVal.value = w || D.y, setLineStyle(l, "#fe3232"), l.setAttribute("opacity", .5), y.appendChild(l)), O = { normal: r, radius: l }
        }
        const Y = {...o && R, rotator: X, center: t && r ? createPoint(s, _, w) || D : void 0 };
        Object.keys(Y).forEach(e => {
            const t = Y[e];
            if (isUndef(t)) return;
            const { x: s, y: o } = t, r = "center" === e ? "#fe3232" : THEME_COLOR;
            isDef(l) && isFunc(l[e]) ? Y[e] = l[e](S, g, pointTo) : Y[e] = createHandler$1(s, o, r, e), m.appendChild(Y[e])
        }), this.storage = { wrapper: c, box: x, handles: {...Y, ...O }, parent: e.parentNode }, helper(c).on("mousedown", this._onMouseDown).on("touchstart", this._onTouchStart)
    }
    _destroy() {
        const { wrapper: e } = this.storage;
        helper(e).off("mousedown", this._onMouseDown).off("touchstart", this._onTouchStart), e.parentNode.removeChild(e)
    }
    _cursorPoint({ clientX: e, clientY: t }) { const { container: s } = this.options; return pointTo(s.getScreenCTM().inverse(), e, t) }
    _pointToElement({ x: e, y: t }) { const { transform: s } = this.storage, { ctm: o } = s, r = o.inverse(); return r.e = r.f = 0, this._applyMatrixToPoint(r, e, t) }
    _pointToControls({ x: e, y: t }) { const { transform: s } = this.storage, { boxCTM: o } = s, r = o.inverse(); return r.e = r.f = 0, this._applyMatrixToPoint(r, e, t) }
    _applyMatrixToPoint(e, t, s) { const { container: o } = this.options, r = o.createSVGPoint(); return r.x = t, r.y = s, r.matrixTransform(e) }
    _apply(e) {
        const { el: t, storage: s, options: o, options: { container: r } } = this, { box: n, handles: a, cached: i, transform: l } = s, { matrix: c, boxCTM: h, bBox: d, ctm: p } = l, u = t.getBBox(), { x: f, y: x, width: m, height: y } = u, b = isDef(a.center) ? pointTo(h, a.center.cx.baseVal.value, a.center.cy.baseVal.value) : pointTo(c, f + m / 2, x + y / 2);
        if (t.setAttribute("data-cx", b.x), t.setAttribute("data-cy", b.y), isUndef(i)) return;
        const { scaleX: g, scaleY: v, dx: T, dy: M, ox: E, oy: _ } = i;
        if ("drag" === e) {
            if (0 === T && 0 === M) return;
            const e = createSVGMatrix();
            e.e = T, e.f = M;
            const s = e.multiply(c).multiply(e.inverse());
            if (t.setAttribute("transform", matrixToString(s)), isGroup(t)) {
                checkChildElements(t).forEach(e => {
                    const s = r.createSVGPoint(),
                        o = getTransformToElement(t.parentNode, r).inverse();
                    s.x = E, s.y = _, o.e = o.f = 0;
                    const n = s.matrixTransform(o),
                        a = createSVGMatrix();
                    a.e = T, a.f = M;
                    const i = a.multiply(getTransformToElement(e, e.parentNode)).multiply(a.inverse());
                    isIdentity(i) || e.setAttribute("transform", matrixToString(i)), isGroup(e) || applyTranslate(e, { x: n.x, y: n.y })
                })
            } else applyTranslate(t, { x: T, y: M })
        }
        if ("resize" === e) {
            const { x: e, y: a, width: i, height: l } = n.getBBox();
            if (applyTransformToHandles(s, o, { x: e, y: a, width: i, height: l, boxMatrix: null }), isGroup(t)) { checkChildElements(t).forEach(e => { isGroup(e) || applyResize(e, { scaleX: g, scaleY: v, defaultCTM: e.__ctm__, bBox: d, container: r, storage: s }) }) } else applyResize(t, { scaleX: g, scaleY: v, defaultCTM: p, bBox: d, container: r, storage: s });
            t.setAttribute("transform", matrixToString(c))
        }
        this.storage.cached = null
    }
    _processResize(e, t) {
        const { el: s, storage: o, options: r, options: { proportions: n } } = this, { left: a, top: i, cw: l, ch: c, transform: h, revX: d, revY: p, doW: u, doH: f } = o, { matrix: x, scMatrix: m, trMatrix: y, scaleX: b, scaleY: g } = h;
        let { width: v, height: T } = s.getBBox();
        const M = u || !u && !f ? (l + e) / l : (c + t) / c;
        if (v = n ? l * M : l + e, T = n ? c * M : c + t, Math.abs(v) <= MIN_SIZE$1 || Math.abs(T) <= MIN_SIZE$1) return;
        const E = v / l,
            _ = T / c;
        m.a = E, m.b = 0, m.c = 0, m.d = _, m.e = 0, m.f = 0, y.e = b, y.f = g;
        const w = y.multiply(m).multiply(y.inverse()),
            S = x.multiply(w);
        s.setAttribute("transform", matrixToString(S));
        const D = a - (v - l) * (f ? .5 : d ? 1 : 0),
            V = i - (T - c) * (u ? .5 : p ? 1 : 0);
        this.storage.cached = { scaleX: E, scaleY: _ };
        const C = { x: D, y: V, width: v, height: T };
        return applyTransformToHandles(o, r, {...C, boxMatrix: null }), C
    }
    _processMove(e, t) {
        const { transform: s, wrapper: o, center: r } = this.storage, { matrix: n, trMatrix: a, scMatrix: i, wrapperMatrix: l, parentMatrix: c } = s;
        i.e = e, i.f = t;
        const h = i.multiply(l);
        o.setAttribute("transform", matrixToString(h)), c.e = c.f = 0;
        const { x: d, y: p } = pointTo(c.inverse(), e, t);
        a.e = d, a.f = p;
        const u = a.multiply(n);
        if (this.el.setAttribute("transform", matrixToString(u)), this.storage.cached = { dx: d, dy: p, ox: e, oy: t }, r.isShifted) {
            const s = l.inverse();
            s.e = s.f = 0;
            const { x: o, y: r } = pointTo(s, e, t);
            this._moveCenterHandle(-o, -r)
        }
        return u
    }
    _processRotate(e) {
        const { center: t, transform: s, wrapper: o } = this.storage, { matrix: r, wrapperMatrix: n, parentMatrix: a, trMatrix: i, scMatrix: l, rotMatrix: c } = s, h = floatToFixed(Math.cos(e)), d = floatToFixed(Math.sin(e));
        i.e = t.x, i.f = t.y, c.a = h, c.b = d, c.c = -d, c.d = h;
        const p = i.multiply(c).multiply(i.inverse()).multiply(n);
        o.setAttribute("transform", matrixToString(p)), l.e = t.el_x, l.f = t.el_y, a.e = a.f = 0;
        const u = a.inverse().multiply(c).multiply(a),
            f = l.multiply(u).multiply(l.inverse()).multiply(r);
        return this.el.setAttribute("transform", matrixToString(f)), f
    }
    _getState({ revX: e, revY: t, doW: s, doH: o }) { const { el: r, storage: n, options: { container: a } } = this, { box: i, wrapper: l, parent: c, handles: { center: h } } = n, d = r.getBBox(), { x: p, y: u, width: f, height: x } = d, { width: m, height: y, x: b, y: g } = i.getBBox(), v = getTransformToElement(r, c), T = getTransformToElement(r, a), M = getTransformToElement(i.parentNode, a), E = getTransformToElement(c, a), _ = p + f * (o ? .5 : e ? 1 : 0), w = u + x * (s ? .5 : t ? 1 : 0), S = { matrix: v, ctm: T, boxCTM: M, parentMatrix: E, wrapperMatrix: getTransformToElement(l, l.parentNode), trMatrix: createSVGMatrix(), scMatrix: createSVGMatrix(), rotMatrix: createSVGMatrix(), scaleX: _, scaleY: w, scX: Math.sqrt(T.a * T.a + T.b * T.b), scY: Math.sqrt(T.c * T.c + T.d * T.d), bBox: d }, D = b + m / 2, V = g + y / 2, C = h ? h.cx.baseVal.value : D, j = h ? h.cy.baseVal.value : V, { x: k, y: A } = pointTo(M, C, j), { x: N, y: F } = isDef(h) ? pointTo(E.inverse(), k, A) : pointTo(v, p + f / 2, u + x / 2), { x: z, y: R } = pointTo(getTransformToElement(i, a), D, V); return checkChildElements(r).forEach(e => { e.__ctm__ = getTransformToElement(e, a) }), { transform: S, cw: m, ch: y, center: { x: h ? k : z, y: h ? A : R, el_x: N, el_y: F, hx: h ? h.cx.baseVal.value : null, hy: h ? h.cy.baseVal.value : null, isShifted: floatToFixed(z, 3) !== floatToFixed(k, 3) && floatToFixed(R, 3) !== floatToFixed(A, 3) }, left: b, top: g, revX: e, revY: t, doW: s, doH: o } }
    _moveCenterHandle(e, t) {
        const { handles: { center: s, radius: o }, center: { hx: r, hy: n } } = this.storage;
        if (isUndef(s)) return;
        const a = r + e,
            i = n + t;
        s.cx.baseVal.value = a, s.cy.baseVal.value = i, o.x2.baseVal.value = a, o.y2.baseVal.value = i
    }
    resetCenterPoint() {
        const { box: e, handles: { center: t, radius: s } } = this.storage, { width: o, height: r, x: n, y: a } = e.getBBox(), i = getTransformToElement(e, e.parentNode), { x: l, y: c } = pointTo(i, n + o / 2, a + r / 2);
        t.cx.baseVal.value = l, t.cy.baseVal.value = c, t.isShifted = !1, s.x2.baseVal.value = l, s.y2.baseVal.value = c
    }
    fitControlsToSize() {
        const { el: e, storage: { box: t, wrapper: s }, options: { container: o } } = this, { width: r, height: n, x: a, y: i } = e.getBBox(), l = getTransformToElement(e, o);
        s.removeAttribute("transform"), t.setAttribute("transform", matrixToString(l)), applyTransformToHandles(this.storage, this.options, { x: a, y: i, width: r, height: n, boxMatrix: l })
    }
    get controls() { return this.storage.wrapper }
}
const applyTranslate = (e, { x: t, y: s }) => {
        const o = [];
        switch (e.tagName.toLowerCase()) {
            case "text":
                {
                    const r = isDef(e.x.baseVal[0]) ? e.x.baseVal[0].value + t : (Number(e.getAttribute("x")) || 0) + t,
                        n = isDef(e.y.baseVal[0]) ? e.y.baseVal[0].value + s : (Number(e.getAttribute("y")) || 0) + s;o.push(["x", r], ["y", n]);
                    break
                }
            case "use":
            case "image":
            case "rect":
                {
                    const r = isDef(e.x.baseVal.value) ? e.x.baseVal.value + t : (Number(e.getAttribute("x")) || 0) + t,
                        n = isDef(e.y.baseVal.value) ? e.y.baseVal.value + s : (Number(e.getAttribute("y")) || 0) + s;o.push(["x", r], ["y", n]);
                    break
                }
            case "circle":
            case "ellipse":
                {
                    const r = e.cx.baseVal.value + t,
                        n = e.cy.baseVal.value + s;o.push(["cx", r], ["cy", n]);
                    break
                }
            case "line":
                {
                    const r = e.x1.baseVal.value + t,
                        n = e.y1.baseVal.value + s,
                        a = e.x2.baseVal.value + t,
                        i = e.y2.baseVal.value + s;o.push(["x1", r], ["y1", n], ["x2", a], ["y2", i]);
                    break
                }
            case "polygon":
            case "polyline":
                { const r = parsePoints(e.getAttribute("points")).map(e => (e[0] = Number(e[0]) + t, e[1] = Number(e[1]) + s, e.join(" "))).join(" ");o.push(["points", r]); break }
            case "path":
                { const r = e.getAttribute("d");o.push(["d", movePath({ path: r, dx: t, dy: s })]); break }
        }
        o.forEach(t => { e.setAttribute(t[0], t[1]) })
    },
    applyResize = (e, t) => {
        const { scaleX: s, scaleY: o, bBox: r, defaultCTM: n, container: a } = t, { width: i, height: l } = r, c = [], h = getTransformToElement(e, a), d = n.inverse().multiply(h);
        switch (e.tagName.toLowerCase()) {
            case "text":
                {
                    const t = isDef(e.x.baseVal[0]) ? e.x.baseVal[0].value : Number(e.getAttribute("x")) || 0,
                        r = isDef(e.y.baseVal[0]) ? e.y.baseVal[0].value : Number(e.getAttribute("y")) || 0,
                        { x: n, y: a } = pointTo(d, t, r);c.push(["x", n + (s < 0 ? i : 0)], ["y", a + (o < 0 ? l : 0)]);
                    break
                }
            case "circle":
                {
                    const t = e.r.baseVal.value,
                        r = e.cx.baseVal.value,
                        n = e.cy.baseVal.value,
                        a = t * (Math.abs(s) + Math.abs(o)) / 2,
                        { x: i, y: l } = pointTo(d, r, n);c.push(["r", a], ["cx", i], ["cy", l]);
                    break
                }
            case "image":
            case "rect":
                {
                    const t = e.width.baseVal.value,
                        r = e.height.baseVal.value,
                        n = e.x.baseVal.value,
                        a = e.y.baseVal.value,
                        { x: i, y: l } = pointTo(d, n, a),
                        h = Math.abs(t * s),
                        p = Math.abs(r * o);c.push(["x", i - (s < 0 ? h : 0)], ["y", l - (o < 0 ? p : 0)], ["width", h], ["height", p]);
                    break
                }
            case "ellipse":
                {
                    const t = e.rx.baseVal.value,
                        r = e.ry.baseVal.value,
                        n = e.cx.baseVal.value,
                        a = e.cy.baseVal.value,
                        { x: i, y: l } = pointTo(d, n, a),
                        h = createSVGMatrix();h.a = s,
                    h.d = o;
                    const { x: p, y: u } = pointTo(h, t, r);c.push(["rx", Math.abs(p)], ["ry", Math.abs(u)], ["cx", i], ["cy", l]);
                    break
                }
            case "line":
                {
                    const t = e.x1.baseVal.value,
                        s = e.y1.baseVal.value,
                        o = e.x2.baseVal.value,
                        r = e.y2.baseVal.value,
                        { x: n, y: a } = pointTo(d, t, s),
                        { x: i, y: l } = pointTo(d, o, r);c.push(["x1", n], ["y1", a], ["x2", i], ["y2", l]);
                    break
                }
            case "polygon":
            case "polyline":
                { const t = parsePoints(e.getAttribute("points")).map(e => { const { x: t, y: s } = pointTo(d, Number(e[0]), Number(e[1])); return e[0] = t, e[1] = s, e.join(" ") }).join(" ");c.push(["points", t]); break }
            case "path":
                { const t = e.getAttribute("d");c.push(["d", resizePath({ path: t, localCTM: d })]); break }
        }
        c.forEach(([t, s]) => { e.setAttribute(t, s) })
    },
    applyTransformToHandles = (e, t, s) => {
        const { rotatable: o, rotatorAnchor: r, rotatorOffset: n } = t, { box: a, handles: i, center: l } = e;
        let { x: c, y: h, width: d, height: p, boxMatrix: u } = s;
        const f = d / 2,
            x = p / 2,
            m = null !== u ? u : getTransformToElement(a, a.parentNode),
            y = pointTo(m, c + f, h + x),
            b = { tl: pointTo(m, c, h), tr: pointTo(m, c + d, h), br: pointTo(m, c + d, h + p), bl: pointTo(m, c, h + p), tc: pointTo(m, c + f, h), bc: pointTo(m, c + f, h + p), ml: pointTo(m, c, h + x), mr: pointTo(m, c + d, h + x), center: isDef(i.center) && !l.isShifted ? y : void 0 };
        if (o) {
            const e = {};
            let t = 1;
            switch (r) {
                case "n":
                    e.x = b.tc.x, e.y = b.tc.y;
                    break;
                case "s":
                    e.x = b.bc.x, e.y = b.bc.y, t = -1;
                    break;
                case "w":
                    e.x = b.ml.x, e.y = b.ml.y, t = -1;
                    break;
                case "e":
                default:
                    e.x = b.mr.x, e.y = b.mr.y
            }
            const s = "n" === r || "s" === r ? Math.atan2(b.bl.y - b.tl.y, b.bl.x - b.tl.x) : Math.atan2(b.tl.y - b.tr.y, b.tl.x - b.tr.x),
                o = { x: e.x - n * t * Math.cos(s), y: e.y - n * t * Math.sin(s) },
                { normal: a, radius: c } = i;
            isDef(a) && (a.x1.baseVal.value = e.x, a.y1.baseVal.value = e.y, a.x2.baseVal.value = o.x, a.y2.baseVal.value = o.y), isDef(c) && (c.x1.baseVal.value = y.x, c.y1.baseVal.value = y.y, l.isShifted || (c.x2.baseVal.value = y.x, c.y2.baseVal.value = y.y)), b.rotator = o
        }
        const g = { x: c += d < 0 ? d : 0, y: h += p < 0 ? p : 0, width: Math.abs(d), height: Math.abs(p) };
        Object.keys(g).forEach(e => { a.setAttribute(e, g[e]) }), Object.keys(b).forEach(e => {
            const t = i[e],
                s = b[e];
            isUndef(s) || isUndef(t) || (t.setAttribute("cx", s.x), t.setAttribute("cy", s.y))
        })
    },
    createHandler$1 = (e, t, s, o) => {
        const r = createSVGElement("circle");
        addClass(r, `sjx-svg-hdl-${o}`);
        const n = { cx: e, cy: t, r: 5.5, fill: s, stroke: "#fff", "fill-opacity": 1, "vector-effect": "non-scaling-stroke", "stroke-width": 1 };
        return Object.keys(n).map(e => { r.setAttribute(e, n[e]) }), r
    },
    setLineStyle = (e, t) => { e.setAttribute("stroke", t), e.setAttribute("stroke-dasharray", "3 3"), e.setAttribute("vector-effect", "non-scaling-stroke") };

function drag(e, t) { if (this.length) { const s = isDef(t) && t instanceof Observable ? t : new Observable; return arrReduce.call(this, (t, o) => (o instanceof SVGElement ? checkElement(o) && t.push(new DraggableSVG(o, e, s)) : t.push(new Draggable(o, e, s)), t), []) } }
class Cloneable extends SubjectModel {
    constructor(e, t) { super(e), this.enable(t) }
    _init() {
        const { el: e, options: t } = this, s = helper(e), { style: o, appendTo: r } = t, n = { position: "absolute", "z-index": "2147483647", ...o };
        this.storage = { css: n, parent: isDef(r) ? helper(r)[0] : document.body }, s.on("mousedown", this._onMouseDown).on("touchstart", this._onTouchStart), EVENTS.slice(0, 3).forEach(e => { this.eventDispatcher.registerEvent(e) })
    }
    _processOptions(e) {
        let t = {},
            s = null,
            o = document,
            r = () => {},
            n = () => {},
            a = () => {},
            i = () => {};
        if (isDef(e)) {
            const { style: o, appendTo: l, stack: c, onInit: h, onMove: d, onDrop: p, onDestroy: u } = e;
            t = isDef(o) && "object" == typeof o ? o : t, s = l || null;
            const f = isDef(c) ? helper(c)[0] : document;
            r = createMethod(h), n = createMethod(d), a = isFunc(p) ? function(e) {
                const { clone: t } = this.storage;
                objectsCollide(t, f) && p.call(this, e, this.el, t)
            } : () => {}, i = createMethod(u)
        }
        this.options = { style: t, appendTo: s, stack: o }, this.proxyMethods = { onInit: r, onDrop: a, onMove: n, onDestroy: i }
    }
    _start({ clientX: e, clientY: t }) {
        const { storage: s, el: o } = this, { parent: r, css: n } = s, { left: a, top: i } = getOffset(r);
        n.left = `${e-a}px`, n.top = `${t-i}px`;
        const l = o.cloneNode(!0);
        helper(l).css(n), s.clientX = e, s.clientY = t, s.cx = e, s.cy = t, s.clone = l, helper(r)[0].appendChild(l), this._draw()
    }
    _moving({ clientX: e, clientY: t }) {
        const { storage: s } = this;
        s.clientX = e, s.clientY = t, s.doDraw = !0, s.doMove = !0
    }
    _end(e) {
        const { storage: t } = this, { clone: s, frameId: o } = t;
        t.doDraw = !1, cancelAnimFrame(o), isUndef(s) || (this.proxyMethods.onDrop.call(this, e), s.parentNode.removeChild(s), delete t.clone)
    }
    _animate() {
        const { storage: e } = this;
        e.frameId = requestAnimFrame(this._animate);
        const { doDraw: t, clientX: s, clientY: o, cx: r, cy: n } = e;
        t && (e.doDraw = !1, this._drag({ dx: s - r, dy: o - n }))
    }
    _processMove(e, t) {
        const { clone: s } = this.storage, o = `translate(${e}px, ${t}px)`;
        helper(s).css({ transform: o, webkitTranform: o, mozTransform: o, msTransform: o, otransform: o })
    }
    _destroy() {
        const { storage: e, proxyMethods: t, el: s } = this;
        isUndef(e) || (helper(s).off("mousedown", this._onMouseDown).off("touchstart", this._onTouchStart), t.onDestroy.call(this, s), delete this.storage)
    }
    disable() { this._destroy() }
}

function clone(e) { if (this.length) return arrMap.call(this, t => new Cloneable(t, e)) }
class Subjx extends Helper {
    drag() { return drag.call(this, ...arguments) }
    clone() { return clone.call(this, ...arguments) }
}

function subjx(e) { return new Subjx(e) }
Object.defineProperty(subjx, "createObservable", { value: () => new Observable }), Object.defineProperty(subjx, "Subjx", { value: Subjx }), Object.defineProperty(subjx, "Observable", { value: Observable }), module.exports = subjx;