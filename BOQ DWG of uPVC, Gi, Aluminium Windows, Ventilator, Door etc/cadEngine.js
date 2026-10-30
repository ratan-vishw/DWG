/**
 * =========================================================================
 * uPVC CAD Drawing & BOQ Image Generator - Core 2D Vector CAD Engine
 * File: cadEngine.js
 * =========================================================================
 * Provides:
 * 1. Vector CAD Entity System (LINE, LWPOLYLINE, RECT, CIRCLE, ARC, TEXT, DIMENSION, HATCH)
 * 2. AIA Layer Manager (A-FRAM, A-GLAZ, A-SASH, A-HRDW, A-ANNO-DIMS, etc.)
 * 3. Spatial Queries & OSNAP (Endpoint, Midpoint, Center, Intersection, Grid)
 * 4. Interactive CAD Viewport Controller & Selection Grips
 * 5. True Vector SVG Serializer (Replaces blank SVG placeholder with 1:1 vector paths)
 * 6. Standard AutoCAD R2018 ASCII DXF Exporter (Exact 1:1 metric mm geometry)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        var exp = factory();
        module.exports = exp;
        if (typeof root !== 'undefined') {
            root.CAD_CORE = exp;
            root.CAD_ENGINE = exp;
        }
        if (typeof global !== 'undefined') {
            global.CAD_CORE = exp;
            global.CAD_ENGINE = exp;
        }
    } else {
        var exp = factory();
        root.CAD_CORE = exp;
        root.CAD_ENGINE = exp;
        if (typeof window !== 'undefined') {
            window.CAD_CORE = exp;
            window.CAD_ENGINE = exp;
        }
        if (typeof globalThis !== 'undefined') {
            globalThis.CAD_CORE = exp;
            globalThis.CAD_ENGINE = exp;
        }
    }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function () {

    'use strict';

    /**
     * Unique ID generator
     */
    let _idSeq = 1;
    function generateUid(prefix) {
        return (prefix || 'ent_') + Date.now().toString(36) + '_' + (_idSeq++);
    }

    /**
     * Standard AutoCAD Color Index (ACI) lookup table for AIA Layers
     */
    const ACI_COLORS = {
        RED: 1,
        YELLOW: 2,
        GREEN: 3,
        CYAN: 4,
        BLUE: 5,
        MAGENTA: 6,
        WHITE: 7,
        DARK_GREY: 8,
        LIGHT_GREY: 9
    };

    /**
     * Default AIA Architectural Layers for Fenestration CAD Drawings
     */
    const DEFAULT_LAYERS = {
        'A-FRAM': { name: 'A-FRAM', desc: 'Outer & Inner Frame Profiles', color: '#2563eb', aci: 5, lineWeight: 0.35, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-MULL': { name: 'A-MULL', desc: 'Mullions & Transoms', color: '#0284c7', aci: 4, lineWeight: 0.35, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-SASH': { name: 'A-SASH', desc: 'Window / Door Sashes & Vents', color: '#10b981', aci: 3, lineWeight: 0.30, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-GLAZ': { name: 'A-GLAZ', desc: 'Glass Panes, Tint & Infill', color: '#38bdf8', aci: 140, lineWeight: 0.18, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-HRDW': { name: 'A-HRDW', desc: 'Hardware, Hinges, Locks, Brackets', color: '#f59e0b', aci: 2, lineWeight: 0.25, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-ANNO-DIMS': { name: 'A-ANNO-DIMS', desc: 'Linear & Aligned CAD Dimensions', color: '#ef4444', aci: 1, lineWeight: 0.20, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-ANNO-TEXT': { name: 'A-ANNO-TEXT', desc: 'Text Notes, Sheet Titles & Tags', color: '#f8fafc', aci: 7, lineWeight: 0.25, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-ANNO-SYMB': { name: 'A-ANNO-SYMB', desc: 'Swing Triangles & Sliding Direction', color: '#ec4899', aci: 6, lineWeight: 0.18, lineType: 'DASHED', visible: true, locked: false },
        'A-PLAN': { name: 'A-PLAN', desc: 'Bottom Track Sliding Plan View', color: '#a855f7', aci: 6, lineWeight: 0.25, lineType: 'CONTINUOUS', visible: true, locked: false },
        'A-DRAFT': { name: 'A-DRAFT', desc: 'Custom User CAD Drafting Entities', color: '#22c55e', aci: 3, lineWeight: 0.25, lineType: 'CONTINUOUS', visible: true, locked: false }
    };

    /**
     * ==========================================
     * 1. VECTOR CAD ENTITY DEFINITIONS
     * ==========================================
     */

    class CADEntity {
        constructor(type, props) {
            this.id = props.id || generateUid(type.toLowerCase() + '_');
            this.type = type;
            this.layer = props.layer || 'A-FRAM';
            this.color = props.color || null; // null = ByLayer
            this.strokeWidth = props.strokeWidth || null; // null = ByLayer
            this.lineType = props.lineType || 'CONTINUOUS'; // CONTINUOUS | DASHED | DOTTED | CENTER
            this.visible = props.visible !== false;
            this.selected = false;
            this.isCustom = !!props.isCustom; // user-drawn CAD entity vs parametric window component
            this.meta = props.meta || {};
        }

        getBoundingBox() {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
        }

        containsPoint(px, py, tolerance) {
            return false;
        }

        intersectsBox(bMinX, bMinY, bMaxX, bMaxY) {
            const b = this.getBoundingBox();
            return !(b.maxX < bMinX || b.minX > bMaxX || b.maxY < bMinY || b.minY > bMaxY);
        }

        getGripPoints() {
            return [];
        }

        move(dx, dy) {
            // Implemented by subclasses
        }

        clone() {
            return Object.assign(Object.create(Object.getPrototypeOf(this)), JSON.parse(JSON.stringify(this)), { id: generateUid(this.type.toLowerCase() + '_') });
        }
    }

    class LineEntity extends CADEntity {
        constructor(props) {
            super('LINE', props);
            this.x1 = props.x1 || 0;
            this.y1 = props.y1 || 0;
            this.x2 = props.x2 || 0;
            this.y2 = props.y2 || 0;
        }

        getBoundingBox() {
            const minX = Math.min(this.x1, this.x2);
            const maxX = Math.max(this.x1, this.x2);
            const minY = Math.min(this.y1, this.y2);
            const maxY = Math.max(this.y1, this.y2);
            return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 6;
            const x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
            const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            if (l2 === 0) return Math.hypot(px - x1, py - y1) <= tol;
            let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = x1 + t * (x2 - x1);
            const projY = y1 + t * (y2 - y1);
            return Math.hypot(px - projX, py - projY) <= tol;
        }

        getGripPoints() {
            return [
                { id: 'p1', x: this.x1, y: this.y1 },
                { id: 'mid', x: (this.x1 + this.x2) / 2, y: (this.y1 + this.y2) / 2 },
                { id: 'p2', x: this.x2, y: this.y2 }
            ];
        }

        move(dx, dy) {
            this.x1 += dx; this.y1 += dy;
            this.x2 += dx; this.y2 += dy;
        }
    }

    class RectEntity extends CADEntity {
        constructor(props) {
            super('RECT', props);
            this.x = props.x || 0;
            this.y = props.y || 0;
            this.w = props.w || 0;
            this.h = props.h || 0;
            this.fillColor = props.fillColor || null;
            this.fillOpacity = props.fillOpacity !== undefined ? props.fillOpacity : 1.0;
        }

        getBoundingBox() {
            const minX = Math.min(this.x, this.x + this.w);
            const maxX = Math.max(this.x, this.x + this.w);
            const minY = Math.min(this.y, this.y + this.h);
            const maxY = Math.max(this.y, this.y + this.h);
            return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 5;
            const b = this.getBoundingBox();
            if (this.fillColor) {
                return px >= b.minX - tol && px <= b.maxX + tol && py >= b.minY - tol && py <= b.maxY + tol;
            }
            // Perimeter test if not filled
            const nearLeft = Math.abs(px - b.minX) <= tol && py >= b.minY - tol && py <= b.maxY + tol;
            const nearRight = Math.abs(px - b.maxX) <= tol && py >= b.minY - tol && py <= b.maxY + tol;
            const nearTop = Math.abs(py - b.minY) <= tol && px >= b.minX - tol && px <= b.maxX + tol;
            const nearBottom = Math.abs(py - b.maxY) <= tol && px >= b.minX - tol && px <= b.maxX + tol;
            return nearLeft || nearRight || nearTop || nearBottom;
        }

        getGripPoints() {
            return [
                { id: 'tl', x: this.x, y: this.y },
                { id: 'tr', x: this.x + this.w, y: this.y },
                { id: 'br', x: this.x + this.w, y: this.y + this.h },
                { id: 'bl', x: this.x, y: this.y + this.h },
                { id: 'center', x: this.x + this.w / 2, y: this.y + this.h / 2 }
            ];
        }

        move(dx, dy) {
            this.x += dx;
            this.y += dy;
        }
    }

    class PolylineEntity extends CADEntity {
        constructor(props) {
            super('LWPOLYLINE', props);
            this.vertices = props.vertices ? props.vertices.map(v => ({ x: v.x, y: v.y })) : [];
            this.closed = props.closed !== false;
            this.fillColor = props.fillColor || null;
            this.fillOpacity = props.fillOpacity !== undefined ? props.fillOpacity : 1.0;
        }

        getBoundingBox() {
            if (this.vertices.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (let i = 0; i < this.vertices.length; i++) {
                const v = this.vertices[i];
                if (v.x < minX) minX = v.x;
                if (v.x > maxX) maxX = v.x;
                if (v.y < minY) minY = v.y;
                if (v.y > maxY) maxY = v.y;
            }
            return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 6;
            const v = this.vertices;
            if (v.length < 2) return false;
            // Point in polygon test if closed and filled
            if (this.closed && this.fillColor) {
                let inside = false;
                for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
                    const xi = v[i].x, yi = v[i].y;
                    const xj = v[j].x, yj = v[j].y;
                    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                }
                if (inside) return true;
            }
            // Edge distance test
            const n = this.closed ? v.length : v.length - 1;
            for (let i = 0; i < n; i++) {
                const p1 = v[i];
                const p2 = v[(i + 1) % v.length];
                const line = new LineEntity({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
                if (line.containsPoint(px, py, tol)) return true;
            }
            return false;
        }

        getGripPoints() {
            return this.vertices.map((v, idx) => ({ id: 'v_' + idx, x: v.x, y: v.y, index: idx }));
        }

        move(dx, dy) {
            this.vertices.forEach(v => { v.x += dx; v.y += dy; });
        }
    }

    class CircleEntity extends CADEntity {
        constructor(props) {
            super('CIRCLE', props);
            this.cx = props.cx || 0;
            this.cy = props.cy || 0;
            this.r = props.r || 10;
            this.fillColor = props.fillColor || null;
        }

        getBoundingBox() {
            return {
                minX: this.cx - this.r,
                minY: this.cy - this.r,
                maxX: this.cx + this.r,
                maxY: this.cy + this.r,
                width: this.r * 2,
                height: this.r * 2
            };
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 6;
            const dist = Math.hypot(px - this.cx, py - this.cy);
            if (this.fillColor) return dist <= this.r + tol;
            return Math.abs(dist - this.r) <= tol;
        }

        getGripPoints() {
            return [
                { id: 'center', x: this.cx, y: this.cy },
                { id: 'top', x: this.cx, y: this.cy - this.r },
                { id: 'right', x: this.cx + this.r, y: this.cy },
                { id: 'bottom', x: this.cx, y: this.cy + this.r },
                { id: 'left', x: this.cx - this.r, y: this.cy }
            ];
        }

        move(dx, dy) {
            this.cx += dx;
            this.cy += dy;
        }
    }

    class ArcEntity extends CADEntity {
        constructor(props) {
            super('ARC', props);
            this.cx = props.cx || 0;
            this.cy = props.cy || 0;
            this.r = props.r || 10;
            this.startAngle = props.startAngle || 0; // radians
            this.endAngle = props.endAngle || Math.PI; // radians
        }

        getBoundingBox() {
            return {
                minX: this.cx - this.r,
                minY: this.cy - this.r,
                maxX: this.cx + this.r,
                maxY: this.cy + this.r,
                width: this.r * 2,
                height: this.r * 2
            };
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 6;
            const dist = Math.hypot(px - this.cx, py - this.cy);
            if (Math.abs(dist - this.r) > tol) return false;
            let ang = Math.atan2(py - this.cy, px - this.cx);
            if (ang < 0) ang += Math.PI * 2;
            let s = this.startAngle % (Math.PI * 2); if (s < 0) s += Math.PI * 2;
            let e = this.endAngle % (Math.PI * 2); if (e < 0) e += Math.PI * 2;
            if (s <= e) return ang >= s && ang <= e;
            return ang >= s || ang <= e;
        }

        getGripPoints() {
            return [
                { id: 'center', x: this.cx, y: this.cy },
                { id: 'start', x: this.cx + this.r * Math.cos(this.startAngle), y: this.cy + this.r * Math.sin(this.startAngle) },
                { id: 'end', x: this.cx + this.r * Math.cos(this.endAngle), y: this.cy + this.r * Math.sin(this.endAngle) }
            ];
        }

        move(dx, dy) {
            this.cx += dx;
            this.cy += dy;
        }
    }

    class TextEntity extends CADEntity {
        constructor(props) {
            super('TEXT', props);
            this.x = props.x || 0;
            this.y = props.y || 0;
            this.text = props.text || '';
            this.height = props.height || 14;
            this.rotation = props.rotation || 0; // degrees
            this.align = props.align || 'center'; // left | center | right
            this.baseline = props.baseline || 'middle'; // top | middle | bottom | alphabetic
            this.font = props.font || 'JetBrains Mono, monospace';
            this.fontWeight = props.fontWeight || 'bold';
        }

        getBoundingBox() {
            const estWidth = (this.text.length * this.height * 0.6);
            let minX = this.x;
            if (this.align === 'center') minX = this.x - estWidth / 2;
            else if (this.align === 'right') minX = this.x - estWidth;
            const minY = this.y - this.height / 2;
            return { minX, minY, maxX: minX + estWidth, maxY: minY + this.height, width: estWidth, height: this.height };
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 5;
            const b = this.getBoundingBox();
            return px >= b.minX - tol && px <= b.maxX + tol && py >= b.minY - tol && py <= b.maxY + tol;
        }

        getGripPoints() {
            return [{ id: 'origin', x: this.x, y: this.y }];
        }

        move(dx, dy) {
            this.x += dx;
            this.y += dy;
        }
    }

    class DimensionEntity extends CADEntity {
        constructor(props) {
            super('DIMENSION', props);
            this.layer = props.layer || 'A-ANNO-DIMS';
            this.x1 = props.x1 || 0;
            this.y1 = props.y1 || 0;
            this.x2 = props.x2 || 0;
            this.y2 = props.y2 || 0;
            this.dimPos = props.dimPos !== undefined ? props.dimPos : (props.isVertical ? (props.x1 - 35) : (props.y1 + 35));
            this.isVertical = !!props.isVertical;
            this.text = props.text || '';
            this.subText = props.subText || '';
            this.fontSize = props.fontSize || 12;
            this.tickSize = props.tickSize || 6;
            this.isSub = !!props.isSub;
        }

        getBoundingBox() {
            if (this.isVertical) {
                const minY = Math.min(this.y1, this.y2);
                const maxY = Math.max(this.y1, this.y2);
                const minX = Math.min(this.x1, this.dimPos) - 15;
                const maxX = Math.max(this.x1, this.dimPos) + 15;
                return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
            } else {
                const minX = Math.min(this.x1, this.x2);
                const maxX = Math.max(this.x1, this.x2);
                const minY = Math.min(this.y1, this.dimPos) - 15;
                const maxY = Math.max(this.y1, this.dimPos) + 15;
                return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
            }
        }

        containsPoint(px, py, tolerance) {
            const tol = tolerance || 8;
            const b = this.getBoundingBox();
            return px >= b.minX - tol && px <= b.maxX + tol && py >= b.minY - tol && py <= b.maxY + tol;
        }

        getGripPoints() {
            return [
                { id: 'p1', x: this.x1, y: this.y1 },
                { id: 'p2', x: this.x2, y: this.y2 },
                { id: 'dimLine', x: this.isVertical ? this.dimPos : (this.x1 + this.x2) / 2, y: this.isVertical ? (this.y1 + this.y2) / 2 : this.dimPos }
            ];
        }

        move(dx, dy) {
            this.x1 += dx; this.y1 += dy;
            this.x2 += dx; this.y2 += dy;
            if (this.isVertical) this.dimPos += dx;
            else this.dimPos += dy;
        }
    }

    class HatchEntity extends CADEntity {
        constructor(props) {
            super('HATCH', props);
            this.boundary = props.boundary || []; // [{x, y}]
            this.pattern = props.pattern || 'flymesh'; // flymesh | diagonal | glass_tint
            this.spacing = props.spacing || 12;
            this.angle = props.angle || 45; // degrees
            this.hatchColor = props.hatchColor || 'rgba(148, 163, 184, 0.4)';
        }

        getBoundingBox() {
            if (this.boundary.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (let i = 0; i < this.boundary.length; i++) {
                const p = this.boundary[i];
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            }
            return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }

        containsPoint(px, py, tolerance) {
            const b = this.getBoundingBox();
            return px >= b.minX && px <= b.maxX && py >= b.minY && py <= b.maxY;
        }

        getGripPoints() {
            return [];
        }

        move(dx, dy) {
            this.boundary.forEach(p => { p.x += dx; p.y += dy; });
        }
    }

    /**
     * ==========================================
     * 2. CORE CAD SCENE / DOCUMENT ENGINE
     * ==========================================
     */

    class CADScene {
        constructor() {
            this.layers = JSON.parse(JSON.stringify(DEFAULT_LAYERS));
            this.entities = [];
            this.customEntities = []; // User-drafted custom entities preserved across parametric regenerations
            this.history = [];
            this.historyIndex = -1;
            this.activeLayer = 'A-DRAFT';
        }

        /**
         * Clears parametric window entities while preserving user-drawn CAD drafting entities
         */
        clearParametricEntities() {
            this.entities = this.entities.filter(e => e.isCustom);
        }

        /**
         * Clears all entities including custom ones
         */
        clearAll() {
            this.entities = [];
            this.customEntities = [];
        }

        /**
         * Adds an entity to the scene
         */
        addEntity(entity) {
            if (!entity) return;
            this.entities.push(entity);
            if (entity.isCustom && !this.customEntities.includes(entity)) {
                this.customEntities.push(entity);
            }
            return entity;
        }

        /**
         * Removes an entity by ID
         */
        removeEntity(id) {
            this.entities = this.entities.filter(e => e.id !== id);
            this.customEntities = this.customEntities.filter(e => e.id !== id);
        }

        /**
         * Get entity by ID
         */
        getEntityById(id) {
            return this.entities.find(e => e.id === id) || null;
        }

        /**
         * Get layer definition
         */
        getLayer(layerName) {
            return this.layers[layerName] || this.layers['A-FRAM'];
        }

        /**
         * Get overall bounding box of the entire CAD scene
         */
        getBoundingBox(includeDimensions = true) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            let count = 0;

            for (let i = 0; i < this.entities.length; i++) {
                const ent = this.entities[i];
                if (!ent.visible) continue;
                if (!includeDimensions && ent.type === 'DIMENSION') continue;
                if (ent.layer === 'A-ANNO-TEXT' && ent.meta && ent.meta.isTitleBlock) continue;

                const b = ent.getBoundingBox();
                if (b.width === 0 && b.height === 0) continue;
                if (b.minX < minX) minX = b.minX;
                if (b.minY < minY) minY = b.minY;
                if (b.maxX > maxX) maxX = b.maxX;
                if (b.maxY > maxY) maxY = b.maxY;
                count++;
            }

            if (count === 0 || minX === Infinity) {
                return { minX: 0, minY: 0, maxX: 1000, maxY: 1000, width: 1000, height: 1000 };
            }

            return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }

        /**
         * Hit test: Find topmost entity at coordinate (px, py)
         */
        hitTest(px, py, tolerance = 6) {
            for (let i = this.entities.length - 1; i >= 0; i--) {
                const ent = this.entities[i];
                const layer = this.getLayer(ent.layer);
                if (!ent.visible || !layer.visible || layer.locked) continue;
                if (ent.containsPoint(px, py, tolerance)) {
                    return ent;
                }
            }
            return null;
        }

        /**
         * Box selection: Window (inside) or Crossing (intersects)
         */
        selectInBox(minX, minY, maxX, maxY, isCrossing = true) {
            const found = [];
            for (let i = 0; i < this.entities.length; i++) {
                const ent = this.entities[i];
                const layer = this.getLayer(ent.layer);
                if (!ent.visible || !layer.visible || layer.locked) continue;

                const b = ent.getBoundingBox();
                if (isCrossing) {
                    if (ent.intersectsBox(minX, minY, maxX, maxY)) found.push(ent);
                } else {
                    if (b.minX >= minX && b.maxX <= maxX && b.minY >= minY && b.maxY <= maxY) found.push(ent);
                }
            }
            return found;
        }

        /**
         * OSNAP (Object Snap): Find closest magnetic snap point
         */
        findSnapPoint(px, py, snapRadius = 12, enabledModes = ['endpoint', 'midpoint', 'center', 'intersection']) {
            let bestSnap = null;
            let minDist = snapRadius;

            for (let i = 0; i < this.entities.length; i++) {
                const ent = this.entities[i];
                const layer = this.getLayer(ent.layer);
                if (!ent.visible || !layer.visible) continue;

                // 1. Endpoints & Vertices
                if (enabledModes.includes('endpoint')) {
                    if (ent.type === 'LINE') {
                        const d1 = Math.hypot(px - ent.x1, py - ent.y1);
                        if (d1 < minDist) { minDist = d1; bestSnap = { x: ent.x1, y: ent.y1, type: 'endpoint' }; }
                        const d2 = Math.hypot(px - ent.x2, py - ent.y2);
                        if (d2 < minDist) { minDist = d2; bestSnap = { x: ent.x2, y: ent.y2, type: 'endpoint' }; }
                    } else if (ent.type === 'RECT') {
                        const pts = [{ x: ent.x, y: ent.y }, { x: ent.x + ent.w, y: ent.y }, { x: ent.x + ent.w, y: ent.y + ent.h }, { x: ent.x, y: ent.y + ent.h }];
                        pts.forEach(p => {
                            const d = Math.hypot(px - p.x, py - p.y);
                            if (d < minDist) { minDist = d; bestSnap = { x: p.x, y: p.y, type: 'endpoint' }; }
                        });
                    } else if (ent.type === 'LWPOLYLINE') {
                        ent.vertices.forEach(p => {
                            const d = Math.hypot(px - p.x, py - p.y);
                            if (d < minDist) { minDist = d; bestSnap = { x: p.x, y: p.y, type: 'endpoint' }; }
                        });
                    }
                }

                // 2. Midpoints
                if (enabledModes.includes('midpoint')) {
                    if (ent.type === 'LINE') {
                        const mx = (ent.x1 + ent.x2) / 2;
                        const my = (ent.y1 + ent.y2) / 2;
                        const d = Math.hypot(px - mx, py - my);
                        if (d < minDist) { minDist = d; bestSnap = { x: mx, y: my, type: 'midpoint' }; }
                    } else if (ent.type === 'RECT') {
                        const mids = [
                            { x: ent.x + ent.w / 2, y: ent.y },
                            { x: ent.x + ent.w, y: ent.y + ent.h / 2 },
                            { x: ent.x + ent.w / 2, y: ent.y + ent.h },
                            { x: ent.x, y: ent.y + ent.h / 2 }
                        ];
                        mids.forEach(p => {
                            const d = Math.hypot(px - p.x, py - p.y);
                            if (d < minDist) { minDist = d; bestSnap = { x: p.x, y: p.y, type: 'midpoint' }; }
                        });
                    }
                }

                // 3. Center Points
                if (enabledModes.includes('center')) {
                    if (ent.type === 'CIRCLE' || ent.type === 'ARC') {
                        const d = Math.hypot(px - ent.cx, py - ent.cy);
                        if (d < minDist) { minDist = d; bestSnap = { x: ent.cx, y: ent.cy, type: 'center' }; }
                    } else if (ent.type === 'RECT') {
                        const cx = ent.x + ent.w / 2;
                        const cy = ent.y + ent.h / 2;
                        const d = Math.hypot(px - cx, py - cy);
                        if (d < minDist) { minDist = d; bestSnap = { x: cx, y: cy, type: 'center' }; }
                    }
                }
            }

            return bestSnap;
        }

        /**
         * ==========================================
         * 3. HIGH-LEVEL PARAMETRIC GEOMETRY BUILDERS
         * (Bridge existing drawing logic into vector entities)
         * ==========================================
         */

        addProfileRect(x, y, w, h, t, opts = {}) {
            const frameColor = opts.frameColor || '#18202c';
            const strokeColor = opts.strokeColor || '#0f172a';
            const innerColor = opts.innerColor || '#475569';

            // 1. Frame solid body
            this.addEntity(new RectEntity({
                x, y, w, h,
                layer: 'A-FRAM',
                fillColor: frameColor,
                color: strokeColor,
                strokeWidth: 2.0,
                meta: { component: 'outer_frame' }
            }));

            // 2. Corner welded 45-degree miter lines
            this.addEntity(new LineEntity({ x1: x, y1: y, x2: x + t, y2: y + t, layer: 'A-FRAM', color: innerColor, strokeWidth: 1.2 }));
            this.addEntity(new LineEntity({ x1: x + w, y1: y, x2: x + w - t, y2: y + t, layer: 'A-FRAM', color: innerColor, strokeWidth: 1.2 }));
            this.addEntity(new LineEntity({ x1: x + w, y1: y + h, x2: x + w - t, y2: y + h - t, layer: 'A-FRAM', color: innerColor, strokeWidth: 1.2 }));
            this.addEntity(new LineEntity({ x1: x, y1: y + h, x2: x + t, y2: y + h - t, layer: 'A-FRAM', color: innerColor, strokeWidth: 1.2 }));

            // 3. Inner rebate perimeter
            this.addEntity(new RectEntity({
                x: x + t, y: y + t, w: w - 2 * t, h: h - 2 * t,
                layer: 'A-FRAM',
                color: innerColor,
                strokeWidth: 1.2,
                fillColor: null
            }));
        }

        addMullion(x, y, w, h, isVertical, t, opts = {}) {
            const fillColor = opts.fillColor || '#18202c';
            const strokeColor = opts.strokeColor || '#0f172a';
            const innerColor = opts.innerColor || '#475569';

            // Mullion profile block
            this.addEntity(new RectEntity({
                x, y, w, h,
                layer: 'A-MULL',
                fillColor: fillColor,
                color: strokeColor,
                strokeWidth: 1.8,
                meta: { component: isVertical ? 'mullion' : 'transom' }
            }));

            // Extrusion center V-groove line
            if (isVertical) {
                const cx = x + w / 2;
                this.addEntity(new LineEntity({ x1: cx, y1: y, x2: cx, y2: y + h, layer: 'A-MULL', color: innerColor, strokeWidth: 1.0 }));
            } else {
                const cy = y + h / 2;
                this.addEntity(new LineEntity({ x1: x, y1: cy, x2: x + w, y2: cy, layer: 'A-MULL', color: innerColor, strokeWidth: 1.0 }));
            }
        }

        addSash(x, y, w, h, t, opts = {}) {
            const sashColor = opts.sashColor || '#243042';
            const strokeColor = opts.strokeColor || '#0f172a';
            const innerColor = opts.innerColor || '#475569';

            // Sash frame
            this.addEntity(new RectEntity({
                x, y, w, h,
                layer: 'A-SASH',
                fillColor: sashColor,
                color: strokeColor,
                strokeWidth: 1.6,
                meta: { component: 'sash_frame' }
            }));

            // Corner miters
            this.addEntity(new LineEntity({ x1: x, y1: y, x2: x + t, y2: y + t, layer: 'A-SASH', color: innerColor, strokeWidth: 1.0 }));
            this.addEntity(new LineEntity({ x1: x + w, y1: y, x2: x + w - t, y2: y + t, layer: 'A-SASH', color: innerColor, strokeWidth: 1.0 }));
            this.addEntity(new LineEntity({ x1: x + w, y1: y + h, x2: x + w - t, y2: y + h - t, layer: 'A-SASH', color: innerColor, strokeWidth: 1.0 }));
            this.addEntity(new LineEntity({ x1: x, y1: y + h, x2: x + t, y2: y + h - t, layer: 'A-SASH', color: innerColor, strokeWidth: 1.0 }));

            // Inner glass rebate
            this.addEntity(new RectEntity({
                x: x + t, y: y + t, w: w - 2 * t, h: h - 2 * t,
                layer: 'A-SASH',
                color: innerColor,
                strokeWidth: 1.0,
                fillColor: null
            }));
        }

        addGlass(x, y, w, h, opts = {}) {
            const glassFill = opts.glassFill || 'rgba(186, 230, 253, 0.45)';
            const strokeColor = opts.strokeColor || 'rgba(56, 189, 248, 0.6)';

            // Glass pane
            this.addEntity(new RectEntity({
                x, y, w, h,
                layer: 'A-GLAZ',
                fillColor: glassFill,
                color: strokeColor,
                strokeWidth: 1.0,
                meta: { component: 'glass_pane', bayIndex: opts.bayIndex }
            }));

            // Glass glare reflection lines
            if (w > 40 && h > 40) {
                const glareColor = 'rgba(255, 255, 255, 0.55)';
                this.addEntity(new LineEntity({ x1: x + 15, y1: y + 15, x2: x + Math.min(w - 15, 65), y2: y + Math.min(h - 15, 65), layer: 'A-GLAZ', color: glareColor, strokeWidth: 1.2 }));
                this.addEntity(new LineEntity({ x1: x + 25, y1: y + 15, x2: x + Math.min(w - 15, 80), y2: y + Math.min(h - 15, 70), layer: 'A-GLAZ', color: glareColor, strokeWidth: 0.8 }));
            }

            // Glass engineering numbering badge (GL-1, GL-2)
            if (opts.glassNum) {
                this.addEntity(new CircleEntity({
                    cx: x + w / 2, cy: y + h / 2 - (opts.tagLabel ? 12 : 0),
                    r: 11,
                    layer: 'A-ANNO-TEXT',
                    fillColor: 'rgba(30, 41, 59, 0.85)',
                    color: '#38bdf8',
                    strokeWidth: 1.2
                }));
                this.addEntity(new TextEntity({
                    x: x + w / 2, y: y + h / 2 - (opts.tagLabel ? 12 : 0),
                    text: String(opts.glassNum),
                    height: 10,
                    layer: 'A-ANNO-TEXT',
                    color: '#ffffff',
                    align: 'center',
                    baseline: 'middle'
                }));
            }

            // Glass architectural tag label (FIX, SASH, VENT, DOOR)
            if (opts.tagLabel) {
                this.addEntity(new TextEntity({
                    x: x + w / 2, y: y + h / 2 + 12,
                    text: opts.tagLabel,
                    height: 11,
                    layer: 'A-ANNO-TEXT',
                    color: opts.tagColor || '#0284c7',
                    align: 'center',
                    baseline: 'middle',
                    fontWeight: 'bold'
                }));
            }
        }

        addSwingTriangle(x, y, w, h, direction = 'left', opts = {}) {
            const swingColor = opts.color || '#ec4899';
            let p1, p2, pApex;

            if (direction === 'left') {
                p1 = { x: x, y: y };
                p2 = { x: x, y: y + h };
                pApex = { x: x + w, y: y + h / 2 };
            } else if (direction === 'right') {
                p1 = { x: x + w, y: y };
                p2 = { x: x + w, y: y + h };
                pApex = { x: x, y: y + h / 2 };
            } else if (direction === 'top_hung') {
                p1 = { x: x, y: y };
                p2 = { x: x + w, y: y };
                pApex = { x: x + w / 2, y: y + h };
            } else if (direction === 'bottom_hung') {
                p1 = { x: x, y: y + h };
                p2 = { x: x + w, y: y + h };
                pApex = { x: x + w / 2, y: y };
            } else {
                return;
            }

            this.addEntity(new LineEntity({ x1: p1.x, y1: p1.y, x2: pApex.x, y2: pApex.y, layer: 'A-ANNO-SYMB', color: swingColor, strokeWidth: 1.4, lineType: 'DASHED' }));
            this.addEntity(new LineEntity({ x1: p2.x, y1: p2.y, x2: pApex.x, y2: pApex.y, layer: 'A-ANNO-SYMB', color: swingColor, strokeWidth: 1.4, lineType: 'DASHED' }));
        }

        addHandle(x, y, orientation = 'right', opts = {}) {
            const color = opts.color || '#f59e0b';
            const escW = 6, escH = 24;
            // Escutcheon plate
            this.addEntity(new RectEntity({
                x: x - escW / 2, y: y - escH / 2, w: escW, h: escH,
                layer: 'A-HRDW',
                fillColor: '#ffffff',
                color: '#475569',
                strokeWidth: 1.0
            }));
            // Handle lever
            const leverL = 16 * (orientation === 'left' ? -1 : 1);
            this.addEntity(new LineEntity({
                x1: x, y1: y, x2: x + leverL, y2: y,
                layer: 'A-HRDW',
                color: color,
                strokeWidth: 3.5
            }));
            // Pivot cap
            this.addEntity(new CircleEntity({
                cx: x, cy: y, r: 2.5,
                layer: 'A-HRDW',
                fillColor: '#475569',
                color: '#0f172a',
                strokeWidth: 0.8
            }));
        }

        addHafelePatchHinge(x, y, isGlassToGlass = false, opts = {}) {
            const w = isGlassToGlass ? 38 : 26;
            const h = 18;
            const hwColor = '#94a3b8';
            const strokeColor = '#334155';

            // Stainless steel SS304 hinge body
            this.addEntity(new RectEntity({
                x: x - w / 2, y: y - h / 2, w, h,
                layer: 'A-HRDW',
                fillColor: hwColor,
                color: strokeColor,
                strokeWidth: 1.2,
                meta: { articleNo: '981.55.066', name: 'Hafele SS304 Patch Hinge' }
            }));

            // Hinge pivot pin & clamp screws
            this.addEntity(new CircleEntity({ cx: x, cy: y, r: 2.5, layer: 'A-HRDW', fillColor: '#334155' }));
            this.addEntity(new CircleEntity({ cx: x - w / 3, cy: y, r: 1.8, layer: 'A-HRDW', fillColor: '#475569' }));
            if (isGlassToGlass) {
                this.addEntity(new CircleEntity({ cx: x + w / 3, cy: y, r: 1.8, layer: 'A-HRDW', fillColor: '#475569' }));
            }
        }

        addReinforcementHeaderBar(x, y, w, clampXPositions = [], opts = {}) {
            const barThick = 6;
            const ssColor = '#94a3b8';
            // Ø19mm Stainless steel round header rod tube
            this.addEntity(new RectEntity({
                x, y: y - barThick / 2, w, h: barThick,
                layer: 'A-HRDW',
                fillColor: ssColor,
                color: '#334155',
                strokeWidth: 1.2,
                meta: { articleNo: '981.20.193', name: 'Hafele SS304 Ø19mm Header Rod' }
            }));

            // Glass ceiling / rod clamp brackets
            clampXPositions.forEach(cx => {
                this.addEntity(new RectEntity({
                    x: cx - 4, y: y - 8, w: 8, h: 16,
                    layer: 'A-HRDW',
                    fillColor: '#cbd5e1',
                    color: '#334155',
                    strokeWidth: 1.0,
                    meta: { articleNo: '981.20.210', name: 'Hafele Glass-to-Rod Clamp' }
                }));
            });
        }

        addShowerHandleAndDots(x, y, w, h, drawTowelBar = true, opts = {}) {
            const hColor = '#94a3b8';
            // Back-to-back D-pull handle
            this.addEntity(new LineEntity({ x1: x, y1: y - 25, x2: x, y2: y + 25, layer: 'A-HRDW', color: hColor, strokeWidth: 3.5 }));
            this.addEntity(new CircleEntity({ cx: x, cy: y - 25, r: 2.5, layer: 'A-HRDW', fillColor: '#334155' }));
            this.addEntity(new CircleEntity({ cx: x, cy: y + 25, r: 2.5, layer: 'A-HRDW', fillColor: '#334155' }));

            // Optional horizontal towel bar attachment
            if (drawTowelBar && w > 40) {
                this.addEntity(new LineEntity({ x1: x - w / 2 + 10, y1: y, x2: x + w / 2 - 10, y2: y, layer: 'A-HRDW', color: hColor, strokeWidth: 2.5 }));
            }
        }

        addDimension(x1, y1, x2, y2, isVertical, dimPos, text, opts = {}) {
            this.addEntity(new DimensionEntity({
                x1, y1, x2, y2,
                isVertical,
                dimPos,
                text,
                subText: opts.subText || '',
                layer: 'A-ANNO-DIMS',
                color: opts.color || '#ef4444',
                fontSize: opts.fontSize || 12,
                isSub: opts.isSub || false
            }));
        }

        /**
         * ==========================================
         * 4. TRUE VECTOR SVG SERIALIZER (1:1 Vector Export)
         * ==========================================
         */
        toSVG(options = {}) {
            const bbox = this.getBoundingBox(true);
            const pad = options.padding !== undefined ? options.padding : 50;
            const w = Math.ceil(bbox.width + pad * 2);
            const h = Math.ceil(bbox.height + pad * 2);
            const minX = Math.floor(bbox.minX - pad);
            const minY = Math.floor(bbox.minY - pad);
            const bg = options.background || '#ffffff';
            const isDark = options.theme === 'dark';

            let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">\n`;
            svg += `  <style>\n`;
            svg += `    .ent-text { font-family: 'JetBrains Mono', 'Segoe UI', monospace; }\n`;
            svg += `    .dim-line { stroke: #ef4444; stroke-width: 1.2; stroke-linecap: round; }\n`;
            svg += `    .dim-text { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: bold; fill: #ef4444; text-anchor: middle; dominant-baseline: middle; }\n`;
            svg += `    .dim-tick { stroke: #ef4444; stroke-width: 1.6; }\n`;
            svg += `    .dashed { stroke-dasharray: 6,4; }\n`;
            svg += `  </style>\n`;
            svg += `  <rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="${bg}"/>\n`;

            // Group entities by layer for clean CAD structure
            const layerKeys = Object.keys(this.layers);
            layerKeys.forEach(lKey => {
                const layer = this.layers[lKey];
                if (!layer.visible) return;

                const layerEnts = this.entities.filter(e => e.layer === lKey && e.visible);
                if (layerEnts.length === 0) return;

                svg += `  <g id="layer_${lKey}" data-desc="${layer.desc}">\n`;
                layerEnts.forEach(ent => {
                    const stroke = ent.color || layer.color;
                    const sw = ent.strokeWidth || layer.lineWeight || 1.0;
                    const dashClass = ent.lineType === 'DASHED' ? ' class="dashed"' : '';

                    if (ent.type === 'LINE') {
                        svg += `    <line x1="${ent.x1.toFixed(1)}" y1="${ent.y1.toFixed(1)}" x2="${ent.x2.toFixed(1)}" y2="${ent.y2.toFixed(1)}" stroke="${stroke}" stroke-width="${sw}"${dashClass}/>\n`;
                    } else if (ent.type === 'RECT') {
                        const fill = ent.fillColor ? ` fill="${ent.fillColor}"` : ' fill="none"';
                        const strokeAttr = ent.color ? ` stroke="${ent.color}" stroke-width="${sw}"` : (ent.fillColor ? '' : ` stroke="${stroke}" stroke-width="${sw}"`);
                        svg += `    <rect x="${ent.x.toFixed(1)}" y="${ent.y.toFixed(1)}" width="${ent.w.toFixed(1)}" height="${ent.h.toFixed(1)}"${fill}${strokeAttr}/>\n`;
                    } else if (ent.type === 'LWPOLYLINE') {
                        const fill = ent.fillColor ? ` fill="${ent.fillColor}"` : ' fill="none"';
                        const strokeAttr = ` stroke="${stroke}" stroke-width="${sw}"`;
                        const pts = ent.vertices.map(v => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
                        svg += ent.closed ? `    <polygon points="${pts}"${fill}${strokeAttr}/>\n` : `    <polyline points="${pts}" fill="none"${strokeAttr}/>\n`;
                    } else if (ent.type === 'CIRCLE') {
                        const fill = ent.fillColor ? ` fill="${ent.fillColor}"` : ' fill="none"';
                        const strokeAttr = ent.color ? ` stroke="${ent.color}" stroke-width="${sw}"` : ` stroke="${stroke}" stroke-width="${sw}"`;
                        svg += `    <circle cx="${ent.cx.toFixed(1)}" cy="${ent.cy.toFixed(1)}" r="${ent.r.toFixed(1)}"${fill}${strokeAttr}/>\n`;
                    } else if (ent.type === 'ARC') {
                        const x1 = ent.cx + ent.r * Math.cos(ent.startAngle);
                        const y1 = ent.cy + ent.r * Math.sin(ent.startAngle);
                        const x2 = ent.cx + ent.r * Math.cos(ent.endAngle);
                        const y2 = ent.cy + ent.r * Math.sin(ent.endAngle);
                        let diff = ent.endAngle - ent.startAngle;
                        if (diff < 0) diff += Math.PI * 2;
                        const largeArc = diff > Math.PI ? 1 : 0;
                        svg += `    <path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${ent.r.toFixed(1)} ${ent.r.toFixed(1)} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>\n`;
                    } else if (ent.type === 'TEXT') {
                        const fill = ent.color || stroke;
                        const anchor = ent.align === 'center' ? 'middle' : (ent.align === 'right' ? 'end' : 'start');
                        const rot = ent.rotation ? ` transform="rotate(${ent.rotation} ${ent.x.toFixed(1)} ${ent.y.toFixed(1)})"` : '';
                        svg += `    <text x="${ent.x.toFixed(1)}" y="${ent.y.toFixed(1)}" font-size="${ent.height}" font-weight="${ent.fontWeight || 'normal'}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="${ent.baseline || 'middle'}" class="ent-text"${rot}>${escapeXml(ent.text)}</text>\n`;
                    } else if (ent.type === 'DIMENSION') {
                        svg += this._renderDimensionSVG(ent, stroke);
                    }
                });
                svg += `  </g>\n`;
            });

            svg += `</svg>`;
            return svg;
        }

        _renderDimensionSVG(dim, stroke) {
            let out = '';
            const tick = dim.tickSize || 6;
            if (dim.isVertical) {
                const x = dim.dimPos;
                const y1 = Math.min(dim.y1, dim.y2);
                const y2 = Math.max(dim.y1, dim.y2);
                const midY = (y1 + y2) / 2;
                // Extension lines
                out += `    <line x1="${dim.x1}" y1="${dim.y1}" x2="${x - 4}" y2="${dim.y1}" stroke="${stroke}" stroke-width="0.9" stroke-dasharray="2,2"/>\n`;
                out += `    <line x1="${dim.x2}" y1="${dim.y2}" x2="${x - 4}" y2="${dim.y2}" stroke="${stroke}" stroke-width="0.9" stroke-dasharray="2,2"/>\n`;
                // Main dimension line
                out += `    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${stroke}" stroke-width="1.2"/>\n`;
                // 45-degree architectural ticks
                out += `    <line x1="${x - tick}" y1="${y1 + tick}" x2="${x + tick}" y2="${y1 - tick}" stroke="${stroke}" stroke-width="1.6"/>\n`;
                out += `    <line x1="${x - tick}" y1="${y2 + tick}" x2="${x + tick}" y2="${y2 - tick}" stroke="${stroke}" stroke-width="1.6"/>\n`;
                // Text rotated 90 degrees
                out += `    <text x="${x - 14}" y="${midY}" class="dim-text" fill="${stroke}" transform="rotate(-90 ${x - 14} ${midY})">${escapeXml(dim.text)}</text>\n`;
            } else {
                const y = dim.dimPos;
                const x1 = Math.min(dim.x1, dim.x2);
                const x2 = Math.max(dim.x1, dim.x2);
                const midX = (x1 + x2) / 2;
                // Extension lines
                out += `    <line x1="${dim.x1}" y1="${dim.y1}" x2="${dim.x1}" y2="${y + 4}" stroke="${stroke}" stroke-width="0.9" stroke-dasharray="2,2"/>\n`;
                out += `    <line x1="${dim.x2}" y1="${dim.y2}" x2="${dim.x2}" y2="${y + 4}" stroke="${stroke}" stroke-width="0.9" stroke-dasharray="2,2"/>\n`;
                // Main dimension line
                out += `    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${stroke}" stroke-width="1.2"/>\n`;
                // 45-degree architectural ticks
                out += `    <line x1="${x1 - tick}" y1="${y + tick}" x2="${x1 + tick}" y2="${y - tick}" stroke="${stroke}" stroke-width="1.6"/>\n`;
                out += `    <line x1="${x2 - tick}" y1="${y + tick}" x2="${x2 + tick}" y2="${y - tick}" stroke="${stroke}" stroke-width="1.6"/>\n`;
                // Text centered above dim line
                out += `    <text x="${midX}" y="${y + 16}" class="dim-text" fill="${stroke}">${escapeXml(dim.text)}</text>\n`;
            }
            return out;
        }

        /**
         * ==========================================
         * 5. AUTOCAD R2018 ASCII DXF EXPORTER (1:1 mm Scale)
         * ==========================================
         */
        toDXF(options = {}) {
            const bbox = this.getBoundingBox(true);
            const lines = [];

            function pair(code, val) {
                lines.push(code);
                lines.push(val);
            }

            // 1. HEADER SECTION
            pair(0, 'SECTION');
            pair(2, 'HEADER');
            pair(9, '$ACADVER');
            pair(1, 'AC1027'); // AutoCAD 2013/2016/2018 format
            pair(9, '$INSUNITS');
            pair(70, 4); // Millimeters
            pair(9, '$MEASUREMENT');
            pair(70, 1); // Metric
            pair(9, '$EXTMIN');
            pair(10, bbox.minX.toFixed(2));
            pair(20, -bbox.maxY.toFixed(2));
            pair(30, 0.0);
            pair(9, '$EXTMAX');
            pair(10, bbox.maxX.toFixed(2));
            pair(20, -bbox.minY.toFixed(2));
            pair(30, 0.0);
            pair(0, 'ENDSEC');

            // 2. TABLES SECTION
            pair(0, 'SECTION');
            pair(2, 'TABLES');

            // Layer Table
            pair(0, 'TABLE');
            pair(2, 'LAYER');
            pair(70, Object.keys(this.layers).length);

            Object.keys(this.layers).forEach(k => {
                const lay = this.layers[k];
                pair(0, 'LAYER');
                pair(2, lay.name);
                pair(70, 0);
                pair(62, lay.aci || 7);
                pair(6, lay.lineType || 'CONTINUOUS');
            });
            pair(0, 'ENDTAB');
            pair(0, 'ENDSEC');

            // 3. ENTITIES SECTION
            pair(0, 'SECTION');
            pair(2, 'ENTITIES');

            this.entities.forEach(ent => {
                if (!ent.visible) return;
                const layer = ent.layer || 'A-FRAM';

                if (ent.type === 'LINE') {
                    pair(0, 'LINE');
                    pair(8, layer);
                    pair(10, ent.x1.toFixed(3));
                    pair(20, (-ent.y1).toFixed(3)); // DXF Y is inverted compared to canvas
                    pair(30, 0.0);
                    pair(11, ent.x2.toFixed(3));
                    pair(21, (-ent.y2).toFixed(3));
                    pair(31, 0.0);
                } else if (ent.type === 'RECT') {
                    pair(0, 'LWPOLYLINE');
                    pair(8, layer);
                    pair(90, 4);
                    pair(70, 1); // Closed
                    pair(10, ent.x.toFixed(3)); pair(20, (-ent.y).toFixed(3));
                    pair(10, (ent.x + ent.w).toFixed(3)); pair(20, (-ent.y).toFixed(3));
                    pair(10, (ent.x + ent.w).toFixed(3)); pair(20, (-(ent.y + ent.h)).toFixed(3));
                    pair(10, ent.x.toFixed(3)); pair(20, (-(ent.y + ent.h)).toFixed(3));
                } else if (ent.type === 'LWPOLYLINE') {
                    pair(0, 'LWPOLYLINE');
                    pair(8, layer);
                    pair(90, ent.vertices.length);
                    pair(70, ent.closed ? 1 : 0);
                    ent.vertices.forEach(v => {
                        pair(10, v.x.toFixed(3));
                        pair(20, (-v.y).toFixed(3));
                    });
                } else if (ent.type === 'CIRCLE') {
                    pair(0, 'CIRCLE');
                    pair(8, layer);
                    pair(10, ent.cx.toFixed(3));
                    pair(20, (-ent.cy).toFixed(3));
                    pair(30, 0.0);
                    pair(40, ent.r.toFixed(3));
                } else if (ent.type === 'ARC') {
                    pair(0, 'ARC');
                    pair(8, layer);
                    pair(10, ent.cx.toFixed(3));
                    pair(20, (-ent.cy).toFixed(3));
                    pair(30, 0.0);
                    pair(40, ent.r.toFixed(3));
                    pair(50, (360 - (ent.endAngle * 180 / Math.PI)).toFixed(2));
                    pair(51, (360 - (ent.startAngle * 180 / Math.PI)).toFixed(2));
                } else if (ent.type === 'TEXT') {
                    pair(0, 'TEXT');
                    pair(8, layer);
                    pair(10, ent.x.toFixed(3));
                    pair(20, (-ent.y).toFixed(3));
                    pair(30, 0.0);
                    pair(40, (ent.height || 14).toFixed(2));
                    pair(1, ent.text);
                    if (ent.rotation) pair(50, ent.rotation.toFixed(2));
                } else if (ent.type === 'DIMENSION') {
                    const dim = ent;
                    // Export dimension extension lines & text as DXF primitives for 100% universal reader compatibility
                    const tick = dim.tickSize || 6;
                    if (dim.isVertical) {
                        const x = dim.dimPos;
                        const y1 = Math.min(dim.y1, dim.y2);
                        const y2 = Math.max(dim.y1, dim.y2);
                        // Ext lines
                        pair(0, 'LINE'); pair(8, layer); pair(10, dim.x1.toFixed(3)); pair(20, (-dim.y1).toFixed(3)); pair(30, 0); pair(11, x.toFixed(3)); pair(21, (-dim.y1).toFixed(3)); pair(31, 0);
                        pair(0, 'LINE'); pair(8, layer); pair(10, dim.x2.toFixed(3)); pair(20, (-dim.y2).toFixed(3)); pair(30, 0); pair(11, x.toFixed(3)); pair(21, (-dim.y2).toFixed(3)); pair(31, 0);
                        // Main dim line
                        pair(0, 'LINE'); pair(8, layer); pair(10, x.toFixed(3)); pair(20, (-y1).toFixed(3)); pair(30, 0); pair(11, x.toFixed(3)); pair(21, (-y2).toFixed(3)); pair(31, 0);
                        // Ticks
                        pair(0, 'LINE'); pair(8, layer); pair(10, (x - tick).toFixed(3)); pair(20, (-y1 - tick).toFixed(3)); pair(30, 0); pair(11, (x + tick).toFixed(3)); pair(21, (-y1 + tick).toFixed(3)); pair(31, 0);
                        pair(0, 'LINE'); pair(8, layer); pair(10, (x - tick).toFixed(3)); pair(20, (-y2 - tick).toFixed(3)); pair(30, 0); pair(11, (x + tick).toFixed(3)); pair(21, (-y2 + tick).toFixed(3)); pair(31, 0);
                        // Text
                        pair(0, 'TEXT'); pair(8, layer); pair(10, (x - 14).toFixed(3)); pair(20, (-(y1 + y2) / 2).toFixed(3)); pair(30, 0); pair(40, (dim.fontSize || 13).toFixed(2)); pair(1, dim.text); pair(50, 90.0);
                    } else {
                        const y = dim.dimPos;
                        const x1 = Math.min(dim.x1, dim.x2);
                        const x2 = Math.max(dim.x1, dim.x2);
                        // Ext lines
                        pair(0, 'LINE'); pair(8, layer); pair(10, dim.x1.toFixed(3)); pair(20, (-dim.y1).toFixed(3)); pair(30, 0); pair(11, dim.x1.toFixed(3)); pair(21, (-y).toFixed(3)); pair(31, 0);
                        pair(0, 'LINE'); pair(8, layer); pair(10, dim.x2.toFixed(3)); pair(20, (-dim.y2).toFixed(3)); pair(30, 0); pair(11, dim.x2.toFixed(3)); pair(21, (-y).toFixed(3)); pair(31, 0);
                        // Main dim line
                        pair(0, 'LINE'); pair(8, layer); pair(10, x1.toFixed(3)); pair(20, (-y).toFixed(3)); pair(30, 0); pair(11, x2.toFixed(3)); pair(21, (-y).toFixed(3)); pair(31, 0);
                        // Ticks
                        pair(0, 'LINE'); pair(8, layer); pair(10, (x1 - tick).toFixed(3)); pair(20, (-y - tick).toFixed(3)); pair(30, 0); pair(11, (x1 + tick).toFixed(3)); pair(21, (-y + tick).toFixed(3)); pair(31, 0);
                        pair(0, 'LINE'); pair(8, layer); pair(10, (x2 - tick).toFixed(3)); pair(20, (-y - tick).toFixed(3)); pair(30, 0); pair(11, (x2 + tick).toFixed(3)); pair(21, (-y + tick).toFixed(3)); pair(31, 0);
                        // Text
                        pair(0, 'TEXT'); pair(8, layer); pair(10, ((x1 + x2) / 2).toFixed(3)); pair(20, (-y + 14).toFixed(3)); pair(30, 0); pair(40, (dim.fontSize || 13).toFixed(2)); pair(1, dim.text);
                    }
                }
            });

            pair(0, 'ENDSEC');
            pair(0, 'EOF');

            return lines.join('\n');
        }

        /**
         * ==========================================
         * 6. CANVAS RENDERER & INTERACTIVE VIEWPORT
         * ==========================================
         */
        render(ctx, viewport = {}, theme = {}) {
            if (!ctx) return;
            const zoom = viewport.zoom || 1.0;
            const panX = viewport.panX || 0;
            const panY = viewport.panY || 0;

            ctx.save();
            ctx.translate(panX, panY);
            ctx.scale(zoom, zoom);

            // Draw entities layer by layer
            Object.keys(this.layers).forEach(layerKey => {
                const layer = this.layers[layerKey];
                if (!layer.visible) return;

                const layerEnts = this.entities.filter(e => e.layer === layerKey && e.visible && (!viewport.onlyCustom || e.isCustom));
                layerEnts.forEach(ent => {
                    this._renderEntity(ctx, ent, layer, theme);
                });
            });

            // Draw selection outlines & grip markers
            const selectedEnts = this.entities.filter(e => e.selected && e.visible);
            if (selectedEnts.length > 0) {
                selectedEnts.forEach(ent => {
                    this._renderSelectionGrips(ctx, ent);
                });
            }

            // Draw active snap marker if present
            if (viewport.activeSnap) {
                this._renderSnapGlyph(ctx, viewport.activeSnap);
            }

            ctx.restore();
        }

        _renderEntity(ctx, ent, layer, theme) {
            const strokeColor = ent.color || layer.color;
            const lineWidth = ent.strokeWidth || layer.lineWeight || 1.0;

            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;

            if (ent.lineType === 'DASHED') {
                ctx.setLineDash([8, 5]);
            } else if (ent.lineType === 'DOTTED') {
                ctx.setLineDash([2, 4]);
            } else if (ent.lineType === 'CENTER') {
                ctx.setLineDash([12, 4, 3, 4]);
            } else {
                ctx.setLineDash([]);
            }

            if (ent.type === 'LINE') {
                ctx.beginPath();
                ctx.moveTo(ent.x1, ent.y1);
                ctx.lineTo(ent.x2, ent.y2);
                ctx.stroke();
            } else if (ent.type === 'RECT') {
                if (ent.fillColor) {
                    ctx.fillStyle = ent.fillColor;
                    ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
                }
                if (ent.color || !ent.fillColor) {
                    ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
                }
            } else if (ent.type === 'LWPOLYLINE') {
                if (ent.vertices.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(ent.vertices[0].x, ent.vertices[0].y);
                    for (let i = 1; i < ent.vertices.length; i++) {
                        ctx.lineTo(ent.vertices[i].x, ent.vertices[i].y);
                    }
                    if (ent.closed) ctx.closePath();
                    if (ent.fillColor) {
                        ctx.fillStyle = ent.fillColor;
                        ctx.fill();
                    }
                    ctx.stroke();
                }
            } else if (ent.type === 'CIRCLE') {
                ctx.beginPath();
                ctx.arc(ent.cx, ent.cy, ent.r, 0, Math.PI * 2);
                if (ent.fillColor) {
                    ctx.fillStyle = ent.fillColor;
                    ctx.fill();
                }
                ctx.stroke();
            } else if (ent.type === 'ARC') {
                ctx.beginPath();
                ctx.arc(ent.cx, ent.cy, ent.r, ent.startAngle, ent.endAngle);
                ctx.stroke();
            } else if (ent.type === 'TEXT') {
                ctx.fillStyle = ent.color || strokeColor;
                ctx.font = `${ent.fontWeight || 'normal'} ${ent.height}px ${ent.font || 'JetBrains Mono, monospace'}`;
                ctx.textAlign = ent.align || 'center';
                ctx.textBaseline = ent.baseline || 'middle';
                if (ent.rotation) {
                    ctx.save();
                    ctx.translate(ent.x, ent.y);
                    ctx.rotate(ent.rotation * Math.PI / 180);
                    ctx.fillText(ent.text, 0, 0);
                    ctx.restore();
                } else {
                    ctx.fillText(ent.text, ent.x, ent.y);
                }
            } else if (ent.type === 'DIMENSION') {
                this._renderDimensionCanvas(ctx, ent, strokeColor);
            }

            ctx.restore();
        }

        _renderDimensionCanvas(ctx, dim, strokeColor) {
            const tick = dim.tickSize || 6;
            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = strokeColor;
            ctx.lineWidth = 1.2;

            if (dim.isVertical) {
                const x = dim.dimPos;
                const y1 = Math.min(dim.y1, dim.y2);
                const y2 = Math.max(dim.y1, dim.y2);
                const midY = (y1 + y2) / 2;

                // Extension lines (dashed light)
                ctx.setLineDash([2, 3]);
                ctx.beginPath();
                ctx.moveTo(dim.x1, dim.y1); ctx.lineTo(x - 3, dim.y1);
                ctx.moveTo(dim.x2, dim.y2); ctx.lineTo(x - 3, dim.y2);
                ctx.stroke();

                // Main dimension line
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(x, y1); ctx.lineTo(x, y2);
                // Architectural 45-degree ticks
                ctx.moveTo(x - tick, y1 + tick); ctx.lineTo(x + tick, y1 - tick);
                ctx.moveTo(x - tick, y2 + tick); ctx.lineTo(x + tick, y2 - tick);
                ctx.stroke();

                // Text
                ctx.font = `bold ${dim.fontSize || 12}px JetBrains Mono, monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.save();
                ctx.translate(x - 14, midY);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(dim.text, 0, 0);
                ctx.restore();
            } else {
                const y = dim.dimPos;
                const x1 = Math.min(dim.x1, dim.x2);
                const x2 = Math.max(dim.x1, dim.x2);
                const midX = (x1 + x2) / 2;

                // Extension lines
                ctx.setLineDash([2, 3]);
                ctx.beginPath();
                ctx.moveTo(dim.x1, dim.y1); ctx.lineTo(dim.x1, y + 3);
                ctx.moveTo(dim.x2, dim.y2); ctx.lineTo(dim.x2, y + 3);
                ctx.stroke();

                // Main dimension line
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(x1, y); ctx.lineTo(x2, y);
                // Architectural 45-degree ticks
                ctx.moveTo(x1 - tick, y + tick); ctx.lineTo(x1 + tick, y - tick);
                ctx.moveTo(x2 - tick, y + tick); ctx.lineTo(x2 + tick, y - tick);
                ctx.stroke();

                // Text
                ctx.font = `bold ${dim.fontSize || 12}px JetBrains Mono, monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(dim.text, midX, y - 4);
            }

            ctx.restore();
        }

        _renderSelectionGrips(ctx, ent) {
            const grips = ent.getGripPoints();
            ctx.save();
            ctx.strokeStyle = '#3b82f6';
            ctx.fillStyle = '#60a5fa';
            ctx.lineWidth = 1.2;
            const sz = 6;

            grips.forEach(g => {
                ctx.fillRect(g.x - sz / 2, g.y - sz / 2, sz, sz);
                ctx.strokeRect(g.x - sz / 2, g.y - sz / 2, sz, sz);
            });

            // Bounding box dashed outline
            const b = ent.getBoundingBox();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
            ctx.strokeRect(b.minX - 3, b.minY - 3, b.width + 6, b.height + 6);
            ctx.restore();
        }

        _renderSnapGlyph(ctx, snap) {
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([]);
            const sz = 7;

            if (snap.type === 'endpoint') {
                ctx.strokeRect(snap.x - sz / 2, snap.y - sz / 2, sz, sz);
            } else if (snap.type === 'midpoint') {
                ctx.beginPath();
                ctx.moveTo(snap.x, snap.y - sz);
                ctx.lineTo(snap.x + sz, snap.y + sz);
                ctx.lineTo(snap.x - sz, snap.y + sz);
                ctx.closePath();
                ctx.stroke();
            } else if (snap.type === 'center') {
                ctx.beginPath();
                ctx.arc(snap.x, snap.y, sz, 0, Math.PI * 2);
                ctx.stroke();
            } else if (snap.type === 'intersection') {
                ctx.beginPath();
                ctx.moveTo(snap.x - sz, snap.y - sz); ctx.lineTo(snap.x + sz, snap.y + sz);
                ctx.moveTo(snap.x + sz, snap.y - sz); ctx.lineTo(snap.x - sz, snap.y + sz);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function escapeXml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe).replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    /**
     * Public Engine API
     */
    return {
        CADScene: CADScene,
        LineEntity: LineEntity,
        RectEntity: RectEntity,
        PolylineEntity: PolylineEntity,
        CircleEntity: CircleEntity,
        ArcEntity: ArcEntity,
        TextEntity: TextEntity,
        DimensionEntity: DimensionEntity,
        HatchEntity: HatchEntity,
        DEFAULT_LAYERS: DEFAULT_LAYERS,
        ACI_COLORS: ACI_COLORS
    };
}));
