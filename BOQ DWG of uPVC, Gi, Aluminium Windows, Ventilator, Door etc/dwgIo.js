/**
 * =========================================================================
 * uPVC CAD Drawing & BOQ Image Generator - DWG & DXF File I/O Engine
 * File: dwgIo.js
 * =========================================================================
 * Provides:
 * 1. Native AutoCAD ASCII DXF File Reader & Parser (R12 through R2024)
 * 2. In-Browser DWG Binary Import Pipeline (LibreDWG WASM Loader & Bridge)
 * 3. DWG-to-BOQ Elevation Card Extractor (Auto-detects Width x Height & Bays)
 * 4. File Download & Export Helpers (.dxf, .svg, .json)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./cadEngine'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./cadEngine'));
    } else {
        root.DWG_IO = factory(root.CAD_CORE || root.CAD_ENGINE);
    }
}(typeof self !== 'undefined' ? self : this, function (cadCore) {

    'use strict';

    /**
     * ACI (AutoCAD Color Index) to Hex mapping for 1-9
     */
    const ACI_TO_HEX = {
        1: '#ef4444', // Red
        2: '#eab308', // Yellow
        3: '#22c55e', // Green
        4: '#06b6d4', // Cyan
        5: '#3b82f6', // Blue
        6: '#d946ef', // Magenta
        7: '#f8fafc', // White / Light Grey
        8: '#64748b', // Dark Grey
        9: '#94a3b8'  // Light Grey
    };

    /**
     * 1. NATIVE ASCII DXF PARSER
     * Parses AutoCAD .dxf ASCII files into structured CADScene entities.
     */
    function parseDXF(dxfText, targetScene) {
        if (!dxfText || typeof dxfText !== 'string') {
            throw new Error('Invalid DXF input: Expected text string.');
        }

        const lines = dxfText.split(/\r?\n/);
        const pairs = [];

        // Tokenize line pairs into [code, value]
        for (let i = 0; i < lines.length - 1; i += 2) {
            const code = parseInt(lines[i].trim(), 10);
            const val = lines[i + 1].trim();
            if (!isNaN(code)) {
                pairs.push({ code, val });
            }
        }

        const layers = {};
        const importedEntities = [];
        let inSection = null;
        let inTable = null;
        let currentEntity = null;

        for (let i = 0; i < pairs.length; i++) {
            const { code, val } = pairs[i];

            if (code === 0 && val === 'SECTION') {
                if (i + 1 < pairs.length && pairs[i + 1].code === 2) {
                    inSection = pairs[i + 1].val;
                    i++;
                }
                continue;
            }

            if (code === 0 && val === 'ENDSEC') {
                inSection = null;
                continue;
            }

            // --- LAYER PARSING ---
            if (inSection === 'TABLES') {
                if (code === 0 && val === 'LAYER') {
                    const layerDef = { name: '0', color: '#f8fafc', aci: 7 };
                    let j = i + 1;
                    while (j < pairs.length && pairs[j].code !== 0) {
                        if (pairs[j].code === 2) layerDef.name = pairs[j].val;
                        else if (pairs[j].code === 62) {
                            const aci = parseInt(pairs[j].val, 10);
                            layerDef.aci = Math.abs(aci);
                            layerDef.color = ACI_TO_HEX[layerDef.aci] || '#94a3b8';
                        }
                        j++;
                    }
                    layers[layerDef.name] = layerDef;
                }
            }

            // --- ENTITY PARSING ---
            if (inSection === 'ENTITIES') {
                if (code === 0) {
                    if (currentEntity) {
                        importedEntities.push(currentEntity);
                        currentEntity = null;
                    }

                    if (['LINE', 'LWPOLYLINE', 'POLYLINE', 'CIRCLE', 'ARC', 'TEXT', 'MTEXT', 'DIMENSION'].includes(val)) {
                        currentEntity = { type: val, layer: '0', color: null, vertices: [] };
                    }
                } else if (currentEntity) {
                    if (code === 8) currentEntity.layer = val;
                    else if (code === 62) {
                        const aci = parseInt(val, 10);
                        currentEntity.color = ACI_TO_HEX[Math.abs(aci)] || '#94a3b8';
                    } else if (currentEntity.type === 'LINE') {
                        if (code === 10) currentEntity.x1 = parseFloat(val);
                        else if (code === 20) currentEntity.y1 = parseFloat(val);
                        else if (code === 11) currentEntity.x2 = parseFloat(val);
                        else if (code === 21) currentEntity.y2 = parseFloat(val);
                    } else if (currentEntity.type === 'LWPOLYLINE') {
                        if (code === 70) currentEntity.closed = (parseInt(val, 10) & 1) === 1;
                        else if (code === 10) currentEntity._pendingX = parseFloat(val);
                        else if (code === 20 && currentEntity._pendingX !== undefined) {
                            currentEntity.vertices.push({ x: currentEntity._pendingX, y: parseFloat(val) });
                            delete currentEntity._pendingX;
                        }
                    } else if (currentEntity.type === 'CIRCLE') {
                        if (code === 10) currentEntity.cx = parseFloat(val);
                        else if (code === 20) currentEntity.cy = parseFloat(val);
                        else if (code === 40) currentEntity.r = parseFloat(val);
                    } else if (currentEntity.type === 'ARC') {
                        if (code === 10) currentEntity.cx = parseFloat(val);
                        else if (code === 20) currentEntity.cy = parseFloat(val);
                        else if (code === 40) currentEntity.r = parseFloat(val);
                        else if (code === 50) currentEntity.startAngle = (parseFloat(val) * Math.PI) / 180;
                        else if (code === 51) currentEntity.endAngle = (parseFloat(val) * Math.PI) / 180;
                    } else if (currentEntity.type === 'TEXT' || currentEntity.type === 'MTEXT') {
                        if (code === 1) currentEntity.text = val;
                        else if (code === 10) currentEntity.x = parseFloat(val);
                        else if (code === 20) currentEntity.y = parseFloat(val);
                        else if (code === 40) currentEntity.height = parseFloat(val);
                        else if (code === 50) currentEntity.rotation = parseFloat(val);
                    } else if (currentEntity.type === 'DIMENSION') {
                        if (code === 1) currentEntity.text = val;
                        else if (code === 10) currentEntity.x1 = parseFloat(val);
                        else if (code === 20) currentEntity.y1 = parseFloat(val);
                        else if (code === 11) currentEntity.x2 = parseFloat(val);
                        else if (code === 21) currentEntity.y2 = parseFloat(val);
                        else if (code === 42) currentEntity.measuredVal = parseFloat(val);
                    }
                }
            }
        }

        if (currentEntity) {
            importedEntities.push(currentEntity);
        }

        // Convert parsed raw DXF entities into CADCore Entities
        const resultScene = targetScene || new cadCore.CADScene();

        // Register imported layers
        Object.keys(layers).forEach(name => {
            if (!resultScene.layers[name]) {
                resultScene.layers[name] = {
                    name: name,
                    desc: 'Imported DXF Layer',
                    color: layers[name].color,
                    aci: layers[name].aci,
                    lineWeight: 0.25,
                    lineType: 'CONTINUOUS',
                    visible: true,
                    locked: false
                };
            }
        });

        // AutoCAD Y is inverted relative to HTML5 screen coordinates: Invert Y so drawings face upward correctly
        importedEntities.forEach(ent => {
            const layerName = ent.layer || 'A-DRAFT';
            const col = ent.color || (resultScene.layers[layerName] ? resultScene.layers[layerName].color : '#94a3b8');

            if (ent.type === 'LINE' && !isNaN(ent.x1) && !isNaN(ent.y1) && !isNaN(ent.x2) && !isNaN(ent.y2)) {
                resultScene.addEntity(new cadCore.LineEntity({
                    x1: ent.x1,
                    y1: -ent.y1,
                    x2: ent.x2,
                    y2: -ent.y2,
                    layer: layerName,
                    color: col,
                    isCustom: true
                }));
            } else if (ent.type === 'LWPOLYLINE' && ent.vertices.length > 0) {
                const inverted = ent.vertices.map(v => ({ x: v.x, y: -v.y }));
                resultScene.addEntity(new cadCore.PolylineEntity({
                    vertices: inverted,
                    closed: !!ent.closed,
                    layer: layerName,
                    color: col,
                    isCustom: true
                }));
            } else if (ent.type === 'CIRCLE' && !isNaN(ent.cx) && !isNaN(ent.cy) && !isNaN(ent.r)) {
                resultScene.addEntity(new cadCore.CircleEntity({
                    cx: ent.cx,
                    cy: -ent.cy,
                    r: ent.r,
                    layer: layerName,
                    color: col,
                    isCustom: true
                }));
            } else if (ent.type === 'ARC' && !isNaN(ent.cx) && !isNaN(ent.cy) && !isNaN(ent.r)) {
                resultScene.addEntity(new cadCore.ArcEntity({
                    cx: ent.cx,
                    cy: -ent.cy,
                    r: ent.r,
                    startAngle: ent.startAngle || 0,
                    endAngle: ent.endAngle || Math.PI,
                    layer: layerName,
                    color: col,
                    isCustom: true
                }));
            } else if ((ent.type === 'TEXT' || ent.type === 'MTEXT') && ent.text) {
                resultScene.addEntity(new cadCore.TextEntity({
                    x: ent.x || 0,
                    y: -(ent.y || 0),
                    text: ent.text,
                    height: ent.height || 14,
                    rotation: ent.rotation ? -ent.rotation : 0,
                    layer: layerName,
                    color: col,
                    isCustom: true
                }));
            }
        });

        return {
            scene: resultScene,
            entityCount: importedEntities.length,
            layerCount: Object.keys(layers).length
        };
    }

    /**
     * 2. LIBREDWG WEBASSEMBLY BINARY DWG LOADER
     * Reads native binary .dwg files directly in-browser using WebAssembly.
     */
    async function loadDWGBinary(fileOrBuffer, targetScene) {
        let arrayBuffer;
        if (fileOrBuffer instanceof File || fileOrBuffer instanceof Blob) {
            arrayBuffer = await fileOrBuffer.arrayBuffer();
        } else if (fileOrBuffer instanceof ArrayBuffer) {
            arrayBuffer = fileOrBuffer;
        } else {
            throw new Error('Unsupported file format for DWG binary loading.');
        }

        const uint8 = new Uint8Array(arrayBuffer);
        const headerMagic = String.fromCharCode(...uint8.slice(0, 6));

        // Check DWG binary signature (MC0.0, AC1012, AC1014, AC1015, AC1018, AC1021, AC1024, AC1027, AC1032)
        if (!headerMagic.startsWith('AC') && !headerMagic.startsWith('MC')) {
            // Might be an ASCII DXF passed by accident
            const textDecoder = new TextDecoder('utf-8');
            const textContent = textDecoder.decode(uint8);
            if (textContent.includes('SECTION') && textContent.includes('ENTITIES')) {
                return parseDXF(textContent, targetScene);
            }
            throw new Error(`Unrecognized CAD file signature: ${headerMagic}. Expected AutoCAD DWG or DXF.`);
        }

        // Check if LibreDWG WebAssembly is already globally available
        if (window.LibreDWG || window.dwg2dxf) {
            try {
                const converter = window.LibreDWG || window.dwg2dxf;
                const dxfOutput = await converter.convert(uint8);
                return parseDXF(dxfOutput, targetScene);
            } catch (err) {
                console.warn('[DWG_IO] In-memory WASM conversion error:', err);
            }
        }

        // Dynamically load LibreDWG WASM script if not already on page
        try {
            await loadScript('https://cdn.jsdelivr.net/npm/@mlightcad/libredwg-web@latest/dist/libredwg-web.js');
            if (window.LibreDWG) {
                const converter = new window.LibreDWG();
                await converter.init();
                const dxfOutput = await converter.dwgToDxf(uint8);
                return parseDXF(dxfOutput, targetScene);
            }
        } catch (wasmErr) {
            console.warn('[DWG_IO] CDN LibreDWG WASM load note:', wasmErr);
        }

        // Provide informative notice if browser cannot load external WASM module
        throw new Error(`AutoCAD Binary DWG (${headerMagic}) detected. For immediate client-side drafting, save as AutoCAD .DXF in your CAD software, or ensure internet access for the LibreDWG WASM engine.`);
    }

    /**
     * 3. DWG-TO-BOQ CARD ELEVATION EXTRACTOR
     * Converts a selected region or entities from an imported DWG/DXF into a Parametric BOQ Card.
     */
    function extractElevationToBOQ(entitiesOrBbox, options = {}) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let candidateLines = [];

        if (Array.isArray(entitiesOrBbox)) {
            entitiesOrBbox.forEach(ent => {
                const b = ent.getBoundingBox();
                if (b.minX < minX) minX = b.minX;
                if (b.minY < minY) minY = b.minY;
                if (b.maxX > maxX) maxX = b.maxX;
                if (b.maxY > maxY) maxY = b.maxY;
                if (ent.type === 'LINE') candidateLines.push(ent);
            });
        } else if (entitiesOrBbox && typeof entitiesOrBbox === 'object') {
            minX = entitiesOrBbox.minX || 0;
            minY = entitiesOrBbox.minY || 0;
            maxX = entitiesOrBbox.maxX || 1000;
            maxY = entitiesOrBbox.maxY || 1000;
        }

        const width = Math.round(Math.abs(maxX - minX));
        const height = Math.round(Math.abs(maxY - minY));

        if (width < 100 || height < 100) {
            throw new Error(`Invalid elevation bounds: ${width} x ${height} mm. Elevation must be at least 100x100mm.`);
        }

        // Count horizontal and vertical dividing lines within 20% to 80% span
        let verticalMullions = 0;
        let horizontalTransoms = 0;
        let transomHeight = Math.round(height * 0.3);
        let mullionWidth = Math.round(width / 2);

        candidateLines.forEach(l => {
            const isH = Math.abs(l.y1 - l.y2) <= 5 && Math.abs(l.x2 - l.x1) > width * 0.5;
            const isV = Math.abs(l.x1 - l.x2) <= 5 && Math.abs(l.y2 - l.y1) > height * 0.5;

            if (isH) {
                const distFromBottom = Math.abs(l.y1 - maxY);
                if (distFromBottom > height * 0.15 && distFromBottom < height * 0.85) {
                    horizontalTransoms++;
                    transomHeight = Math.round(distFromBottom);
                }
            }
            if (isV) {
                const distFromLeft = Math.abs(l.x1 - minX);
                if (distFromLeft > width * 0.2 && distFromLeft < width * 0.8) {
                    verticalMullions++;
                    mullionWidth = Math.round(distFromLeft);
                }
            }
        });

        // Infer fenestration type based on detected proportions & mullions
        let inferredType = 'casement_transom';
        if (height >= 2000) {
            inferredType = (width >= 1200) ? 'double_door_french' : 'casement_door';
        } else if (width >= 1800 && verticalMullions >= 2) {
            inferredType = 'casement_triple';
        } else if (width > height * 1.3) {
            inferredType = 'sliding_3track';
        } else if (horizontalTransoms >= 1) {
            inferredType = 'casement_transom';
        } else {
            inferredType = 'casement_single';
        }

        const markCode = options.mark || 'W_DWG_' + Math.floor(10 + Math.random() * 90);
        const areaSqFt = (width * height / 1000000) * 10.76391;

        return {
            id: 'card_dwg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            code: markCode,
            type: inferredType,
            width: width,
            height: height,
            transomHeight: transomHeight,
            mullionWidth: mullionWidth,
            profileColor: '#18202c',
            colorName: 'BLACK',
            profileSeries: inferredType.startsWith('sliding') ? 'Veka - I 60 Sliding Series' : 'OKOTECH - O7 CASEMENT SERIES',
            glassType: '5mm Clear Toughened',
            weight: parseFloat((areaSqFt * 1.95).toFixed(2)),
            qty: 1,
            flipHorizontal: false,
            georgianBars: 'none',
            georgianCols: 2,
            georgianRows: 3,
            isFromDWG: true
        };
    }

    /**
     * Helper to dynamically inject external script if needed
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return resolve();
            }
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = (e) => reject(e);
            document.head.appendChild(s);
        });
    }

    /**
     * Client-Side File Download helper
     */
    function downloadBlob(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        parseDXF: parseDXF,
        loadDWGBinary: loadDWGBinary,
        extractElevationToBOQ: extractElevationToBOQ,
        downloadBlob: downloadBlob
    };
}));
