# Industrial-Grade CAD & Parametric BIM Fenestration Studio

A systematic CAD and Parametric BIM application for uPVC, Aluminium, GI Windows, Doors, Louvers, and Frameless Glass Shower Enclosures. Combines **Revit-style parametric window family modeling** with **CadCraft / AutoCAD-style 2D vector drafting and `.dwg` / `.dxf` editing**.

---

## 🏗️ 5-Layer Modular Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LAYER 5: WORKSPACE UI & CONTROLLERS                  │
│  • Mode Switcher: [1. BIM Family Designer] [2. 2D CAD / DWG Studio]     │
│                   [3. BOQ Schedule & Cutlist]                           │
│  • Revit-Style Properties Palette  • CAD Layer Manager  • Command Bar   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────┐
│   LAYER 3: PARAMETRIC BIM ENGINE      │   │  LAYER 4: DWG / DXF / SVG I/O     │
│        (Revit-Style Generator)        │   │       INTERCHANGE ENGINE          │
│ • Parametric Grid & Bay Model         │   │ • DWG Binary Reader (LibreDWG WASM│
│ • Stepped / Polygon Outer Frames      │   │ • DXF Parser & R2018 DXF Writer   │
│ • Profile Extrusion & Miter Solver    │   │ • True Vector SVG & PDF Generator │
│ • Häfele / uPVC Hardware Rules        │   │ • DWG-to-BOQ Card Extractor       │
└───────────────────┬───────────────────┘   └─────────────────┬─────────────────┘
                    │      Compiles to Vector Entities        │ Parses / Serializes
                    └───────────────────┬─────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│             LAYER 2: CORE 2D VECTOR CAD ENGINE (cadEngine.js)           │
│  • Scene Graph Entities: LINE, LWPOLYLINE, RECT, CIRCLE, ARC, TEXT,     │
│    DIMENSION, HATCH                                                     │
│  • AIA Standard Layers (A-FRAM, A-GLAZ, A-SASH, A-HRDW, A-ANNO-DIMS)    │
│  • Interactive Tools: Select, Move, Copy, Offset, Trim, Mirror, Measure │
│  • Object Snaps (OSNAP: Endpoint, Midpoint, Center, Intersection, Grid) │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               LAYER 1: SINGLE SOURCE OF TRUTH (dataBase.js)             │
│  • Unified Catalog (OKOTECH, Veka, REHAU, Häfele Glass Fittings)        │
│  • Profile Cross-Section & Hardware Rules  • Project & Layer Storage    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
DWG/
├── build.js                                           # Automated bundler for 1-file Apps Script deployment
├── README.md                                          # Architectural overview & documentation
└── BOQ DWG of uPVC, Gi, Aluminium Windows, .../
    ├── Index.html                                     # Studio UI & controllers (modular development)
    ├── Index.dist.html                                # Standalone self-contained bundle for Google Apps Script
    ├── dataBase.js                                    # Unified catalog, presets, profiles & CSV parser
    ├── cadEngine.js                                   # Core 2D Vector CAD Engine, AIA layers, OSNAP, DXF & SVG serializers
    ├── dwgIo.js                                       # DWG binary loader, DXF R2018 parser & DWG-to-BOQ extractor
    └── Code.js                                        # Google Apps Script backend (doGet, include, saveImageToDrive)
```

---

## ⚡ Key Capabilities Implemented (Phases 1 & 2)

### 1. De-duplicated Architecture
- **Single Source of Truth**: All ~810 lines of duplicated `PRESETS`, `getTypeCode()`, and `parseCsvText()` were removed from `Index.html`. Everything is centralized in `dataBase.js` (`CAD_DB`).

### 2. Live Vector CAD Scene Graph (`cadEngine.js`)
- Replaced imperative pixel painting with a live **Vector CAD Scene Graph** (`CADScene`).
- Standard CAD entities: `LINE`, `LWPOLYLINE`, `RECT`, `CIRCLE`, `ARC`, `TEXT`, `DIMENSION`, `HATCH`.
- **10 AIA Fenestration Layers**: `A-FRAM`, `A-MULL`, `A-SASH`, `A-GLAZ`, `A-HRDW`, `A-ANNO-DIMS`, `A-ANNO-TEXT`, `A-ANNO-SYMB`, `A-PLAN`, `A-DRAFT`.

### 3. True Vector SVG & AutoCAD DXF Exporters
- **True Vector Scalable SVG**: Replaces the former blank rectangle placeholder with an authentic SVG serializer exporting crisp vectors at 1:1 scale.
- **AutoCAD R2018 Metric DXF**: Exports valid ASCII DXF files with layers, line weights, and exact millimeter coordinates for AutoCAD, Revit, LibreCAD, QCad, or CNC cutting software.

### 4. Native `.DWG` & `.DXF` Import & Elevation Extraction (`dwgIo.js`)
- **Open .DXF Files**: Client-side parser decodes layers, lines, polylines, circles, arcs, texts, and dimensions.
- **Open .DWG Files**: In-browser WebAssembly integration (LibreDWG) with automatic fallback.
- **DWG-to-BOQ Extractor**: Allows selecting any elevation in an imported CAD file to automatically detect its dimensions (`Width × Height`), internal transoms/mullions, and generate an active BOQ Card.

### 5. Interactive CAD Viewport & Drafting Tools
- **Infinite Viewport**: Mouse wheel zoom-to-cursor, middle-mouse / space-drag pan.
- **Drafting Ribbon**: Select (`ESC`), Pan, Line (`L`), Polyline (`PL`), Rect (`REC`), Circle (`C`), Dimension (`DIM`), Text (`T`), Delete (`DEL`), Clear Custom.
- **Drafting Aids**: Magnetic OSNAP (Endpoint, Midpoint, Center), ORTHO (`F8`), Millimeter Grid Snap.
- **AutoCAD Command Bar**: Type `L`, `REC`, `C`, `DIM`, `T`, `DEL`, `DXF`, `SVG`, `BOQ`, `BIM`, `CAD`, or `EXTRACT` directly in the command prompt.

### 6. Workspace Mode Switcher
1. **Mode 1: BIM Window Designer**: Interactive parametric card customization.
2. **Mode 2: 2D CAD & DWG Studio**: Max-width CAD viewport with drafting tools and layer manager.
3. **Mode 3: BOQ Schedule & Cutlist**: Full tabular schedule with total glass area, linear profile meters, and printable commercial quotation sheet.

---

## 🚀 Deployment & Running

### Option A: Local Browser / Static Web Server
Simply open `Index.html` directly in your browser or run any static server (e.g., Live Server, `npx serve`, or Electron).

### Option B: Google Apps Script
1. Deploy `Code.js` to your Google Apps Script project.
2. Deploy either:
   - The modular files using `include()` in `Code.js`, OR
   - Paste `Index.dist.html` (generated via `node build.js`) directly as `Index.html` in the Apps Script editor for a 1-file zero-dependency deployment.
