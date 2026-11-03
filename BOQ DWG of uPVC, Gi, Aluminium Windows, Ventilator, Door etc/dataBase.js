/**
 * =========================================================================
 * uPVC CAD Drawing & BOQ Image Generator - Core Database & Catalog Engine
 * File: dataBase.js
 * =========================================================================
 * Provides structured fenestration specifications, presets library, default
 * project schedules, profile definitions, and local storage / CSV helpers.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        var exp = factory();
        module.exports = exp;
        if (typeof root !== 'undefined') {
            root.CAD_DB = exp;
            root.CAD_DATABASE = exp;
        }
        if (typeof global !== 'undefined') {
            global.CAD_DB = exp;
            global.CAD_DATABASE = exp;
        }
        if (typeof window !== 'undefined') {
            window.CAD_DB = exp;
            window.CAD_DATABASE = exp;
        }
    } else {
        var exp = factory();
        root.CAD_DB = exp;
        root.CAD_DATABASE = exp;
        if (typeof window !== 'undefined') {
            window.CAD_DB = exp;
            window.CAD_DATABASE = exp;
        }
        if (typeof global !== 'undefined') {
            global.CAD_DB = exp;
            global.CAD_DATABASE = exp;
        }
    }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)), function () {

    'use strict';

    /**
     * Complete Catalog of 30+ Industrial Fenestration Presets
     * Spanning Casement, Sliding, Doors, Ventilators, and Fixed Glazing.
     */
    const PRESETS = [
        {
                "id": "W1",
                "category": "casement",
                "isPdf": true,
                "name": "W1 - Casement w/ Transom",
                "type": "casement_transom",
                "code": "W1",
                "width": 925,
                "height": 1525,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 29.412,
                "desc": "Casement + Top Fix",
                "location": "Master Bedroom (Bed 1)",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "W2",
                "category": "fixed",
                "isPdf": true,
                "name": "W2 - Fix Window",
                "type": "fixed_window",
                "code": "W2",
                "width": 1600,
                "height": 775,
                "transomHeight": 450,
                "mullionWidth": 800,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 21.297,
                "desc": "Single Fixed Glass",
                "location": "Living Room Front",
                "hardware": "Glazing Setting Blocks + EPDM Wedge Gaskets (Fixed Framing)",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "D1",
                "category": "doors",
                "isPdf": true,
                "name": "D1 - Casement Door",
                "type": "casement_door",
                "code": "D1",
                "width": 925,
                "height": 2450,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "6 MM CLEAR TOUGHENED GLASS",
                "weight": 55.756,
                "desc": "Full Casement Door",
                "location": "Main Entrance",
                "hardware": "3D Adjustable Hinges + 5-Point Security Mortise Lock + Lever Handle",
                "reinforcement": "2.0 mm Heavy-Duty Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "D2",
                "category": "doors",
                "isPdf": true,
                "name": "D2 - Casement Door 900",
                "type": "casement_door",
                "code": "D2",
                "width": 900,
                "height": 2450,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "6 MM CLEAR TOUGHENED GLASS",
                "weight": 54.65,
                "desc": "900mm Casement Door",
                "location": "Main Entrance",
                "hardware": "3D Adjustable Hinges + 5-Point Security Mortise Lock + Lever Handle",
                "reinforcement": "2.0 mm Heavy-Duty Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "W3",
                "category": "sliding",
                "isPdf": true,
                "name": "W3 - 3-Track Sliding (1200)",
                "type": "sliding_3track",
                "code": "W3",
                "width": 1200,
                "height": 1825,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 SLIDING SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 65.86,
                "desc": "3-Track Sliding + Mesh",
                "location": "Living Room Balcony Deck",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "W4",
                "category": "sliding",
                "isPdf": true,
                "name": "W4 - 3-Track Sliding (1825)",
                "type": "sliding_3track",
                "code": "W4",
                "width": 1825,
                "height": 2450,
                "transomHeight": 450,
                "mullionWidth": 913,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 SLIDING SERIES",
                "glassType": "6 MM CLEAR TOUGHENED GLASS",
                "weight": 126.03,
                "desc": "1825x2450 3-Track Slider",
                "location": "Living Room Balcony Deck",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "W5",
                "category": "sliding",
                "isPdf": true,
                "name": "W5 - 3-Track Sliding (2050)",
                "type": "sliding_3track",
                "code": "W5",
                "width": 2050,
                "height": 2400,
                "transomHeight": 1200,
                "mullionWidth": 1025,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 SLIDING SERIES",
                "glassType": "11.52mm Security Glass",
                "weight": 192.446,
                "desc": "Large 3-Track Slider",
                "location": "Living Room Balcony Deck",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "W6",
                "category": "casement",
                "isPdf": true,
                "name": "W6 - Casement Window",
                "type": "casement_transom",
                "code": "W6",
                "width": 925,
                "height": 1500,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 29.061,
                "desc": "Casement 925x1500",
                "location": "Guest Bedroom",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "W7",
                "category": "sliding",
                "isPdf": true,
                "name": "W7 - 2-Track Sliding (1600)",
                "type": "sliding_2track",
                "code": "W7",
                "width": 1600,
                "height": 975,
                "transomHeight": 450,
                "mullionWidth": 800,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 SLIDING SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 32.887,
                "desc": "2-Track 2-Sash Slider",
                "location": "Dining Room Terrace",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "W8",
                "category": "sliding",
                "isPdf": true,
                "name": "W8 - 3-Track Sliding (1800)",
                "type": "sliding_3track",
                "code": "W8",
                "width": 1800,
                "height": 2400,
                "transomHeight": 1200,
                "mullionWidth": 900,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 SLIDING SERIES",
                "glassType": "6 MM CLEAR TOUGHENED GLASS",
                "weight": 122.466,
                "desc": "1800x2400 3-Track Slider",
                "location": "Dining Room Terrace",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "W10",
                "category": "casement",
                "isPdf": true,
                "name": "W10 - Casement Window 900",
                "type": "casement_transom",
                "code": "W10",
                "width": 900,
                "height": 1500,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 28.386,
                "desc": "Casement 900x1500",
                "location": "Master Bedroom (Bed 1)",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "W13",
                "category": "casement",
                "isPdf": true,
                "name": "W13 - Tall Casement 800",
                "type": "casement_transom",
                "code": "W13",
                "width": 800,
                "height": 1725,
                "transomHeight": 450,
                "mullionWidth": 400,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 28.492,
                "desc": "Tall Casement 800x1725",
                "location": "Master Bedroom (Bed 1)",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "W14",
                "category": "sliding",
                "isPdf": true,
                "name": "W14 - 3-Track Slider (1525)",
                "type": "sliding_3track",
                "code": "W14",
                "width": 1525,
                "height": 1825,
                "transomHeight": 450,
                "mullionWidth": 763,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 SLIDING SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 77.227,
                "desc": "1525x1825 3-Track Slider",
                "location": "Master Bedroom (Bed 1)",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "W1_VEK",
                "category": "sliding",
                "isPdf": true,
                "name": "W1 Veka - 2-Track + Flymesh",
                "type": "sliding_3track",
                "code": "W1",
                "width": 1800,
                "height": 1500,
                "transomHeight": 450,
                "mullionWidth": 900,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 60 Sliding Series",
                "glassType": "5mm Clear Float",
                "weight": 43.594,
                "desc": "Veka 1800x1500 Slider",
                "location": "Master Bedroom (Bed 1)",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "W3_TOW",
                "category": "casement",
                "isPdf": true,
                "name": "W3 - 4-Tier Casement Tower",
                "type": "casement_tower_4bay",
                "code": "W3",
                "width": 450,
                "height": 3050,
                "transomHeight": 800,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 60 Casement Series",
                "glassType": "6mm Toughened Glass",
                "weight": 23.466,
                "desc": "4-Tier Tower 450x3050",
                "location": "Living Room Balcony Deck",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "V1",
                "category": "ventilator",
                "isPdf": true,
                "name": "V1 - Compact Ventilator",
                "type": "vent_louver_fan",
                "code": "V1",
                "width": 600,
                "height": 900,
                "transomHeight": 450,
                "mullionWidth": 300,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 39 Compact Casement",
                "glassType": "No Glass / Obscure",
                "weight": 3.806,
                "desc": "Fan Cutout + Louver",
                "location": "Toilet / Powder Room",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "V2",
                "category": "ventilator",
                "isPdf": true,
                "name": "V2 - Double Bay Ventilator",
                "type": "vent_double_bay",
                "code": "V2",
                "width": 900,
                "height": 900,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 39 Compact Casement",
                "glassType": "No Glass / Louver",
                "weight": 5.586,
                "desc": "Fan + Louver + Fixed",
                "location": "Toilet / Powder Room",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "V4",
                "category": "ventilator",
                "isPdf": true,
                "name": "V4 - Double Bay Ventilator (Fixed Glass)",
                "type": "vent_double_bay_fix",
                "code": "V4",
                "width": 1157,
                "height": 518,
                "transomHeight": 155,
                "mullionWidth": 578,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 39 Compact Casement",
                "glassType": "5mm Clear Toughened",
                "weight": 6.2,
                "desc": "Fan + Fix Glass + Fixed",
                "location": "Toilet / Powder Room",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "V3",
                "category": "ventilator",
                "isPdf": true,
                "name": "V3 - Wide Ventilator",
                "type": "vent_wide_fan",
                "code": "V3",
                "width": 1800,
                "height": 600,
                "transomHeight": 300,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 60 Casement Series",
                "glassType": "Single Glazing",
                "weight": 9.339,
                "desc": "450 Fan + 1350 Fixed",
                "location": "Kitchen Utility",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "SLD_4P",
                "category": "sliding",
                "isPdf": false,
                "name": "4-Panel Center Opening Sliding Door (O-X-X-O)",
                "type": "sliding_4panel",
                "code": "SD4",
                "width": 2400,
                "height": 2100,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Heavy Duty 2-Track Slider",
                "glassType": "6mm Clear Toughened",
                "weight": 98.5,
                "desc": "Center Opening Patio Door",
                "location": "Bedroom Window",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "SLD_3S",
                "category": "sliding",
                "isPdf": false,
                "name": "3-Track 3-Sash Slider",
                "type": "sliding_3track_3sash",
                "code": "S3S",
                "width": 2400,
                "height": 1800,
                "transomHeight": 450,
                "mullionWidth": 800,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "3-Track 3-Sash Series",
                "glassType": "5mm Clear Toughened",
                "weight": 84,
                "desc": "3 Movable Glass Sashes",
                "location": "Bedroom Window",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "SLD_TR",
                "category": "sliding",
                "isPdf": false,
                "name": "Sliding + Top Fixed Transom",
                "type": "sliding_transom",
                "code": "SWT",
                "width": 1600,
                "height": 2100,
                "transomHeight": 500,
                "mullionWidth": 800,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Sliding Combination Series",
                "glassType": "5mm Clear Toughened",
                "weight": 62,
                "desc": "Slider + Top Fanlight",
                "location": "Bedroom Window",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "CSM_1P",
                "category": "casement",
                "isPdf": false,
                "name": "1-Panel Casement Window",
                "type": "casement_single",
                "code": "CW1",
                "width": 750,
                "height": 1200,
                "transomHeight": 400,
                "mullionWidth": 375,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Casement Series",
                "glassType": "5mm Clear Float",
                "weight": 18.2,
                "desc": "Single Side-Hung Sash",
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "CSM_DBL",
                "category": "casement",
                "isPdf": false,
                "name": "2-Panel Casement (1 Fix + 1 Open)",
                "type": "casement_double_fix_open",
                "code": "CW2",
                "width": 1500,
                "height": 1200,
                "transomHeight": 400,
                "mullionWidth": 750,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Casement Series",
                "glassType": "5mm Clear Toughened",
                "weight": 36.5,
                "desc": "1 Fixed + 1 Openable",
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "CSM_FRN",
                "category": "casement",
                "isPdf": false,
                "name": "2-Panel French Casement",
                "type": "casement_french",
                "code": "FCW",
                "width": 1400,
                "height": 1400,
                "transomHeight": 400,
                "mullionWidth": 700,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm French Casement",
                "glassType": "5mm Clear Toughened",
                "weight": 38,
                "desc": "Both Sashes Openable",
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "CSM_3P",
                "category": "casement",
                "isPdf": false,
                "name": "3-Panel Casement (Open-Fix-Open)",
                "type": "casement_triple",
                "code": "CW3",
                "width": 1800,
                "height": 1200,
                "transomHeight": 400,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Casement Series",
                "glassType": "5mm Clear Toughened",
                "weight": 46.2,
                "desc": "Open + Fix + Open",
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "CSM_TT",
                "category": "casement",
                "isPdf": false,
                "name": "Tilt & Turn Window",
                "type": "tilt_and_turn",
                "code": "TT1",
                "width": 900,
                "height": 1400,
                "transomHeight": 400,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Tilt & Turn Series",
                "glassType": "6mm Clear Toughened",
                "weight": 28.5,
                "desc": "Dual Action Tilt & Turn",
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "CSM_AWN",
                "category": "casement",
                "isPdf": false,
                "name": "Top-Hung / Awning Window",
                "type": "casement_top_hung",
                "code": "AW1",
                "width": 1000,
                "height": 800,
                "transomHeight": 400,
                "mullionWidth": 500,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Casement Series",
                "glassType": "5mm Clear Float",
                "weight": 16,
                "desc": "Outward Top-Hung Awning",
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "DR_SLD4",
                "category": "doors",
                "isPdf": false,
                "name": "Center Opening uPVC Sliding Door (O-X-X-O)",
                "type": "sliding_4panel",
                "code": "PD4",
                "width": 2400,
                "height": 2100,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Heavy Duty 2-Track Sliding Door Series",
                "glassType": "6mm Clear Toughened Glass",
                "weight": 104.5,
                "desc": "White uPVC Center Open Door",
                "location": "Bedroom Window",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "DR_FRN",
                "category": "doors",
                "isPdf": false,
                "name": "French Double Door",
                "type": "double_door_french",
                "code": "FD1",
                "width": 1800,
                "height": 2400,
                "transomHeight": 450,
                "mullionWidth": 900,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Heavy Duty Door Series",
                "glassType": "6mm Toughened Glass",
                "weight": 92,
                "desc": "Double Door Meeting",
                "location": "Balcony Access",
                "hardware": "3D Adjustable Hinges + 5-Point Security Mortise Lock + Lever Handle",
                "reinforcement": "2.0 mm Heavy-Duty Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "DR_MID",
                "category": "doors",
                "isPdf": false,
                "name": "Door with Mid-Rail Kickplate",
                "type": "casement_door_midrail",
                "code": "MD1",
                "width": 900,
                "height": 2100,
                "transomHeight": 900,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Door Series",
                "glassType": "5mm Toughened + Solid Panel",
                "weight": 48,
                "desc": "Glass Top + Kickplate",
                "location": "Balcony Access",
                "hardware": "3D Adjustable Hinges + 5-Point Security Mortise Lock + Lever Handle",
                "reinforcement": "2.0 mm Heavy-Duty Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "DR_TRN",
                "category": "doors",
                "isPdf": false,
                "name": "Door with Top Fanlight",
                "type": "door_with_transom",
                "code": "DT1",
                "width": 900,
                "height": 2400,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm Door Series",
                "glassType": "6mm Clear Toughened",
                "weight": 52,
                "desc": "Door + Fixed Fanlight",
                "location": "Balcony Access",
                "hardware": "3D Adjustable Hinges + 5-Point Security Mortise Lock + Lever Handle",
                "reinforcement": "2.0 mm Heavy-Duty Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "V_LOUV",
                "category": "ventilator",
                "isPdf": false,
                "name": "Full Glass Louvers Ventilator",
                "type": "vent_louver_only",
                "code": "VL1",
                "width": 600,
                "height": 900,
                "transomHeight": 450,
                "mullionWidth": 300,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Compact Louver Series",
                "glassType": "4mm Frosted Louver Blades",
                "weight": 4.8,
                "desc": "100% Louver Slats",
                "location": "Bathroom Vent",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "V_FAN",
                "category": "ventilator",
                "isPdf": false,
                "name": "Exhaust Fan Cutout Ventilator",
                "type": "vent_fan_only",
                "code": "VF1",
                "width": 600,
                "height": 600,
                "transomHeight": 300,
                "mullionWidth": 300,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Exhaust Series",
                "glassType": "5mm Clear w/ 150mm Cutout",
                "weight": 3.5,
                "desc": "Circular Fan Cutout",
                "location": "Bathroom Vent",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "V_AWN",
                "category": "ventilator",
                "isPdf": false,
                "name": "Top-Hung Toilet Ventilator",
                "type": "vent_top_hung",
                "code": "VT1",
                "width": 600,
                "height": 600,
                "transomHeight": 300,
                "mullionWidth": 300,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Compact Casement Series",
                "glassType": "5mm Frosted / Pinhead",
                "weight": 3.9,
                "desc": "Toilet Awning Ventilator",
                "location": "Bathroom Vent",
                "hardware": "Heavy-Duty Pivot Pins + 6-inch Exhaust Fan Ring Mount + Frosted Louvers",
                "reinforcement": "1.2 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 Insect Wire Mesh"
        },
        {
                "id": "FIX_2B",
                "category": "fixed",
                "isPdf": false,
                "name": "2-Bay Fixed Window",
                "type": "fixed_2bay",
                "code": "FW2",
                "width": 2000,
                "height": 1400,
                "transomHeight": 450,
                "mullionWidth": 1000,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Casement Outer Frame",
                "glassType": "6mm Clear Toughened",
                "weight": 48,
                "desc": "2 Fixed Bays with Mullion",
                "location": "Bedroom Window",
                "hardware": "Glazing Setting Blocks + EPDM Wedge Gaskets (Fixed Framing)",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "FIX_3B",
                "category": "fixed",
                "isPdf": false,
                "name": "3-Bay Fixed Picture Window",
                "type": "fixed_3bay",
                "code": "FW3",
                "width": 2700,
                "height": 1500,
                "transomHeight": 450,
                "mullionWidth": 900,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Casement Outer Frame",
                "glassType": "6mm Clear Toughened",
                "weight": 68,
                "desc": "3 Fixed Bays with Mullions",
                "location": "Bedroom Window",
                "hardware": "Glazing Setting Blocks + EPDM Wedge Gaskets (Fixed Framing)",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "FIX_GRD",
                "category": "fixed",
                "isPdf": false,
                "name": "Georgian Grid Fixed Window",
                "type": "fixed_georgian",
                "code": "FG1",
                "width": 1200,
                "height": 1200,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Georgian Casement Series",
                "glassType": "5mm Toughened w/ Grids",
                "weight": 22,
                "desc": "Decorative Colonial Grids",
                "georgianBars": "auto",
                "georgianCols": 2,
                "georgianRows": 2,
                "location": "Bedroom Window",
                "hardware": "Glazing Setting Blocks + EPDM Wedge Gaskets (Fixed Framing)",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "FD_GEO",
                "category": "doors",
                "isPdf": false,
                "name": "Georgian French Double Door",
                "type": "double_door_french",
                "code": "FDG1",
                "width": 1800,
                "height": 2400,
                "transomHeight": 450,
                "mullionWidth": 900,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Heavy Duty Door Series",
                "glassType": "6mm Toughened Glass",
                "weight": 94,
                "desc": "Colonial Grid French Door",
                "georgianBars": "2x4",
                "georgianCols": 2,
                "georgianRows": 4,
                "location": "Balcony Access",
                "hardware": "3D Adjustable Hinges + 5-Point Security Mortise Lock + Lever Handle",
                "reinforcement": "2.0 mm Heavy-Duty Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "PD4_GEO",
                "category": "doors",
                "isPdf": false,
                "name": "Georgian 4-Panel Sliding Patio Door",
                "type": "sliding_4panel",
                "code": "PDG4",
                "width": 2400,
                "height": 2100,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Heavy Duty 2-Track Sliding Door Series",
                "glassType": "6mm Clear Toughened Glass",
                "weight": 106,
                "desc": "White uPVC Georgian Patio Door",
                "georgianBars": "2x3",
                "georgianCols": 2,
                "georgianRows": 3,
                "location": "Bedroom Window",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None"
        },
        {
                "id": "CW_GEO",
                "category": "casement",
                "isPdf": false,
                "name": "Georgian 2-Panel French Casement",
                "type": "casement_french",
                "code": "FCG",
                "width": 1400,
                "height": 1400,
                "transomHeight": 400,
                "mullionWidth": 700,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "60mm French Casement",
                "glassType": "5mm Clear Toughened",
                "weight": 39.5,
                "desc": "French Casement w/ Grids",
                "georgianBars": "2x3",
                "georgianCols": 2,
                "georgianRows": 3,
                "location": "Bedroom Window",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh"
        },
        {
                "id": "SH1",
                "category": "shower",
                "isPdf": true,
                "name": "SH1 - 2-Bay Glass Partition w/ Reinforcement Rod (27\"+45\" × 8')",
                "type": "shower_2bay_rod",
                "code": "SH1",
                "width": 1829,
                "height": 2438,
                "transomHeight": 2438,
                "mullionWidth": 686,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "HAFELE - Frameless Glass Fittings (Ø19mm Header & SS304 Patch)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 111.45,
                "desc": "27\"+45\" × 8' w/ Header Rod",
                "location": "Master Bath Shower",
                "hardware": "Häfele SS 304 Glass-to-Glass 90° Clamps + Header Reinforcement Rod",
                "reinforcement": "10mm Architectural Toughened Safety Glass (Frameless)",
                "mesh": "None"
        },
        {
                "id": "SH2",
                "category": "shower",
                "isPdf": true,
                "name": "SH2 - Stepped 2-Bay Glass Partition (27\"×78\" Door + 45\"×110\" Fix)",
                "type": "shower_2bay_stepped",
                "code": "SH2",
                "width": 1829,
                "height": 2794,
                "transomHeight": 1981,
                "mullionWidth": 686,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "HAFELE - Frameless Glass Fittings (Ø19mm Header & SS304 Patch)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 113.88,
                "desc": "Stepped 78\"/110\" Partition",
                "location": "Master Bath Shower",
                "hardware": "Häfele SS 304 Glass-to-Glass 90° Clamps + Header Reinforcement Rod",
                "reinforcement": "10mm Architectural Toughened Safety Glass (Frameless)",
                "mesh": "None"
        },
        {
                "id": "SH3",
                "category": "shower",
                "isPdf": true,
                "name": "SH3 - Hafele 1-Door & 2-Fixed Panel Layout",
                "type": "shower_3bay_hafele",
                "code": "SH3",
                "width": 2000,
                "height": 2100,
                "transomHeight": 2100,
                "mullionWidth": 700,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "HAFELE - Frameless Glass Fittings (Ø19mm Header & SS304 Patch)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 105,
                "desc": "Hafele 1-Door + 2-Fixed",
                "location": "Master Bath Shower",
                "hardware": "Häfele SS 304 Glass-to-Glass 90° Clamps + Header Reinforcement Rod",
                "reinforcement": "10mm Architectural Toughened Safety Glass (Frameless)",
                "mesh": "None"
        },
        {
                "id": "SL1",
                "category": "slim",
                "isPdf": false,
                "name": "SL1 - SMG Slim 16×45 Single Door + Fixed Panel",
                "type": "slim_partition_swing",
                "code": "SL1",
                "width": 1800,
                "height": 2400,
                "transomHeight": 2400,
                "mullionWidth": 800,
                "slimSystem": "SMG_16_45",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Slim Profile 16×45 (SP-16 Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 86.4,
                "desc": "SMG SP-16 · 800 door + 1000 fixed",
                "location": "Bedroom Window",
                "hardware": "Slim Concealed Pivot Hinge + SP-HL Slim Handle + EPDM Acoustic Gasket",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SL2",
                "category": "slim",
                "isPdf": false,
                "name": "SL2 - Ozone Linea 45×07 2-Panel Sliding Partition",
                "type": "slim_partition_sliding",
                "code": "SL2",
                "width": 1800,
                "height": 2400,
                "transomHeight": 2400,
                "mullionWidth": 900,
                "slimSystem": "OZONE_LINEA",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Ozone - Linea Slim Frame 45×07",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 86.4,
                "desc": "Ozone Linea · 900 fixed + 900 sliding",
                "location": "Bedroom Window",
                "hardware": "Slim Concealed Pivot Hinge + SP-HL Slim Handle + EPDM Acoustic Gasket",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SL3",
                "category": "slim",
                "isPdf": false,
                "name": "SL3 - Grayzo Delta 2-Leaf Swing Partition",
                "type": "slim_partition_double",
                "code": "SL3",
                "width": 1600,
                "height": 2400,
                "transomHeight": 2400,
                "mullionWidth": 800,
                "slimSystem": "GRAYZO_DELTA",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Grayzo - Delta Slim Profile Door System",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 96,
                "desc": "Grayzo Delta · 2 × 800 leaves",
                "location": "Bedroom Window",
                "hardware": "Slim Concealed Pivot Hinge + SP-HL Slim Handle + EPDM Acoustic Gasket",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SL4",
                "category": "slim",
                "isPdf": false,
                "name": "SL4 - SMG Slim 25×45 Fixed Glazed Partition",
                "type": "slim_partition_fixed",
                "code": "SL4",
                "width": 2000,
                "height": 2800,
                "transomHeight": 2800,
                "mullionWidth": 1000,
                "slimSystem": "SMG_25_45",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Slim Profile 25×45 (SP-25 Series)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 140,
                "desc": "SMG SP-25 · fixed glazed partition",
                "location": "Bedroom Window",
                "hardware": "Slim Concealed Pivot Hinge + SP-HL Slim Handle + EPDM Acoustic Gasket",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-PT1",
                "category": "slim",
                "isPdf": false,
                "name": "SMG PT Door 1+1 (180° Flat Swing + Slide)",
                "type": "pt_door_1_1",
                "code": "PT1",
                "width": 1400,
                "height": 2600,
                "transomHeight": 2600,
                "mullionWidth": 700,
                "slimSystem": "SMG_PT_DOOR",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - PT Door System (180° Flat Swing + Sliding)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 91,
                "desc": "SMG SP-PTD 1+1 · 1400×2600 · 1 slide + 1 180° swing leaf against wall",
                "location": "Balcony 180° PT Door",
                "hardware": "180° Flat Swing Wall Pivot + Bottom Roller Runner + Slim Magnetic Lock",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-PT2",
                "category": "slim",
                "isPdf": false,
                "name": "SMG PT Door 1+2 (3-Leaf 180° Flat Swing + Slide)",
                "type": "pt_door_1_2",
                "code": "PT2",
                "width": 2100,
                "height": 2600,
                "transomHeight": 2600,
                "mullionWidth": 700,
                "slimSystem": "SMG_PT_DOOR",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - PT Door System (180° Flat Swing + Sliding)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 136.5,
                "desc": "SMG SP-PTD 1+2 · 2100×2600 · 2 slide + 1 180° swing leaf",
                "location": "Balcony 180° PT Door",
                "hardware": "180° Flat Swing Wall Pivot + Bottom Roller Runner + Slim Magnetic Lock",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-TEL1",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Telescopic 1 Fix + 1 Slide Door",
                "type": "telescopic_1fix_1slide",
                "code": "TL1",
                "width": 1800,
                "height": 2600,
                "transomHeight": 2600,
                "mullionWidth": 900,
                "slimSystem": "SMG_TELESCOPIC",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Telescopic Soft-Close Sliding Door (SP-SL Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 93.6,
                "desc": "SMG SP-SL-1+1 · 900 fix + 900 telescopic slide with soft close",
                "location": "Conference Room / Study",
                "hardware": "Multi-Tier Cascading Cable Drive + Hydraulic Soft-Close Dampers",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-TEL2",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Telescopic 1 Fix + 2 Slide Door",
                "type": "telescopic_1fix_2slide",
                "code": "TL2",
                "width": 2700,
                "height": 2600,
                "transomHeight": 2600,
                "mullionWidth": 900,
                "slimSystem": "SMG_TELESCOPIC",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Telescopic Soft-Close Sliding Door (SP-SL Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 140.4,
                "desc": "SMG SP-SL-1+2 · 900 fix + 2 × 900 telescopic sliding leaves",
                "location": "Conference Room / Study",
                "hardware": "Multi-Tier Cascading Cable Drive + Hydraulic Soft-Close Dampers",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-SYN2",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Synchronized 2 Fix + 2 Slide Door",
                "type": "synchronized_2fix_2slide",
                "code": "SYN",
                "width": 3200,
                "height": 2700,
                "transomHeight": 2700,
                "mullionWidth": 800,
                "slimSystem": "SMG_SYNCHRO",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Synchronized Sliding System (SP-SL Series)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 216,
                "desc": "SMG SP-SL-2+2 · 2 fix + 2 synchro bi-parting sliding doors",
                "location": "Main Hall Bi-Parting Divider",
                "hardware": "Wire-Rope Synchronized Pulley System + Soft-Close Dampers",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-BF2",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Bi-Fold 2-Leaf Partition",
                "type": "sliding_folding_2panel",
                "code": "BF2",
                "width": 1500,
                "height": 2400,
                "transomHeight": 2400,
                "mullionWidth": 750,
                "slimSystem": "SMG_BI_FOLD",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Bi-Fold & Sliding Folding Partition (SP-BF / SP-SF Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 72,
                "desc": "SMG SP-BI FOLD-02 A · 1500×2400 · 2 folding leaves",
                "location": "Living / Dining Folding Partition",
                "hardware": "Top Roller Carriage Guides + 3-Point Concealed Hinges + Recessed Flush Pulls",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-SF3",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Sliding Folding 3-Leaf Partition",
                "type": "sliding_folding_3panel",
                "code": "SF3",
                "width": 2400,
                "height": 2600,
                "transomHeight": 2600,
                "mullionWidth": 800,
                "slimSystem": "SMG_BI_FOLD",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Bi-Fold & Sliding Folding Partition (SP-BF / SP-SF Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 124.8,
                "desc": "SMG SP-SF-03 · 2400×2600 · 3-leaf sliding folding system",
                "location": "Living / Dining Folding Partition",
                "hardware": "Top Roller Carriage Guides + 3-Point Concealed Hinges + Recessed Flush Pulls",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-BF4",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Bi-Fold 4-Leaf Partition",
                "type": "sliding_folding_4panel",
                "code": "BF4",
                "width": 3000,
                "height": 2400,
                "transomHeight": 2400,
                "mullionWidth": 750,
                "slimSystem": "SMG_BI_FOLD",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Bi-Fold & Sliding Folding Partition (SP-BF / SP-SF Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 144,
                "desc": "SMG SP-BI FOLD-04 A · 3000×2400 · 4 folding leaves",
                "location": "Living / Dining Folding Partition",
                "hardware": "Top Roller Carriage Guides + 3-Point Concealed Hinges + Recessed Flush Pulls",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-SF6",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Sliding Folding 6-Leaf Partition",
                "type": "sliding_folding_6panel",
                "code": "SF6",
                "width": 4500,
                "height": 2700,
                "transomHeight": 2700,
                "mullionWidth": 750,
                "slimSystem": "SMG_BI_FOLD",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Bi-Fold & Sliding Folding Partition (SP-BF / SP-SF Series)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 243,
                "desc": "SMG SP-SF-06 · 4500×2700 · 6-leaf bi-parting 3+3 sliding folding",
                "location": "Living / Dining Folding Partition",
                "hardware": "Top Roller Carriage Guides + 3-Point Concealed Hinges + Recessed Flush Pulls",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-SL3",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Perfect 3-Track Sliding (3-Sash)",
                "type": "sliding_3track_3sash",
                "code": "SP3",
                "width": 2400,
                "height": 2600,
                "transomHeight": 2600,
                "mullionWidth": 800,
                "slimSystem": "SMG_PERFECT_SLIDE",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Perfect Multi-Track Sliding Door (SP-SL 0+3 / 0+4 / 0+6)",
                "glassType": "8mm Clear Toughened Glass",
                "weight": 124.8,
                "desc": "SMG SP-SL-0+3 · 3 sliding doors both way opening soft close",
                "location": "Acoustic Office Glazing",
                "hardware": "Heavy-Duty Tandem Rollers + Pop-Up Crescent Lock + Anti-Lift Blocks",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh"
        },
        {
                "id": "SMG-GHOST",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Invisible Ghost Sliding Door",
                "type": "invisible_ghost_door",
                "code": "GD1",
                "width": 1000,
                "height": 2400,
                "transomHeight": 2400,
                "mullionWidth": 1000,
                "slimSystem": "SMG_16_45",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Slim Profile 16×45 (SP-16 Series)",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 60,
                "desc": "SMG SP-GD-01 · 1000×2400 · invisible concealed track ghost slider",
                "location": "Master Suite Walk-In Wardrobe",
                "hardware": "Concealed Wall-Mounted Runner + Hidden Floor Guide Wheels + 1200mm Architectural Bar",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        },
        {
                "id": "SMG-10",
                "category": "slim",
                "isPdf": false,
                "name": "SMG Minimal 10×14 Fixed Glazing w/ Georgian Bars",
                "type": "slim_minimal_fixed",
                "code": "SP10",
                "width": 2000,
                "height": 2800,
                "transomHeight": 2800,
                "mullionWidth": 1000,
                "slimSystem": "SMG_10_14",
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "SMG - Ultra Slim 10×14 / 14mm Series",
                "glassType": "10mm Clear Toughened Glass",
                "weight": 140,
                "georgianBars": "2x3",
                "georgianCols": 2,
                "georgianRows": 3,
                "desc": "SMG SP-10-01 10×14 profile · SGB-16 Georgian colonial grid",
                "location": "Acoustic Office Glazing",
                "hardware": "Slim Concealed Pivot Hinge + SP-HL Slim Handle + EPDM Acoustic Gasket",
                "reinforcement": "6063-T6 Extruded Architectural Aluminium Alloy",
                "mesh": "None"
        }
];

    /**
     * Fenestration Series & Profiles Specification
     */
    const PROFILE_SERIES = [
        { id: 'OKOTECH_O7', name: 'OKOTECH - O7 CASEMENT SERIES', type: 'casement', frameDepth: 60, outerThick: 60, sashThick: 75 },
        { id: 'VEKA_I60', name: 'Veka - I 60 Sliding Series', type: 'sliding', frameDepth: 60, outerThick: 60, sashThick: 66 },
        { id: 'REHAU_EURO', name: 'REHAU - Euro-Design 60 Plus', type: 'casement', frameDepth: 60, outerThick: 60, sashThick: 70 },
        { id: 'PROMINANCE_PREMIUM', name: 'Prominance - 2.5 Track Heavy Duty', type: 'sliding', frameDepth: 88, outerThick: 65, sashThick: 72 },
        { id: 'ALU_SLIM', name: 'Minimal Slim Aluminium Profile', type: 'all', frameDepth: 45, outerThick: 45, sashThick: 55 },
        { id: 'HAFELE_FRAMELESS', name: 'HAFELE - Frameless Glass Fittings (Ø19mm Header & SS304 Patch)', type: 'shower', frameDepth: 19, outerThick: 4, sashThick: 0 },
        // SMG Slim Aluminium Series (Catalogue Edition-II)
        { id: 'SMG_SP16', name: 'SMG - Slim Profile 16×45 (SP-16 Series)', type: 'slim', frameDepth: 45, outerThick: 16, sashThick: 45 },
        { id: 'SMG_SP07', name: 'SMG - Slim Profile 07×45 (SP-07 Series)', type: 'slim', frameDepth: 45, outerThick: 17.8, sashThick: 45 },
        { id: 'SMG_SP25', name: 'SMG - Slim Profile 25×45 (SP-25 Series)', type: 'slim', frameDepth: 45, outerThick: 25, sashThick: 45 },
        { id: 'SMG_PT', name: 'SMG - PT Door System (180° Flat Swing + Sliding)', type: 'slim', frameDepth: 45, outerThick: 16, sashThick: 45 },
        { id: 'SMG_TEL', name: 'SMG - Telescopic Soft-Close Sliding Door (SP-SL Series)', type: 'slim', frameDepth: 45, outerThick: 16, sashThick: 45 },
        { id: 'SMG_SYN', name: 'SMG - Synchronized Sliding System (SP-SL Series)', type: 'slim', frameDepth: 45, outerThick: 16, sashThick: 45 },
        { id: 'SMG_BF', name: 'SMG - Bi-Fold & Sliding Folding Partition (SP-BF / SP-SF Series)', type: 'slim', frameDepth: 45, outerThick: 25, sashThick: 45 },
        { id: 'SMG_SP10', name: 'SMG - Ultra Slim 10×14 / 14mm Series', type: 'slim', frameDepth: 14, outerThick: 10, sashThick: 14 }
    ];

    /**
     * Slim-profile glass partition systems — SMG / Ozone / Grayzo.
     * Sources: SMG "Slim Profile" catalogue Ed. II (SP-07/16/25 series, hardware codes,
     * SFS-7000 80 kg & SFS-8400 120 kg floor hinges, 60–80 kg sliding doors);
     * Ozone Linea 45×07 product data (80 kg, max 1.2 m W × 2.7 m H); Ozone Stealth 45×16;
     * Grayzo Delta catalogue (12 ft = 3658 mm max height, 4 ft = 1219 mm leaf, GSP/GPST codes).
     * Where a vendor does not publish a value the entry is marked "app limit".
     */
    const SLIM_SYSTEMS = [
        {
            id: 'SMG_16_45',
            brand: 'SMG',
            name: 'SMG Slim Profile 16×45',
            seriesLabel: 'SMG - Slim Profile 16×45 (SP-16 Series)',
            face: 45,
            depth: 16,
            glassMm: [8],
            glassNote: '8 mm glass (SP-16 profile)',
            configs: 'Fixed / single swing / double swing / openable / 2-panel sliding',
            maxDoorW: 1100,
            maxDoorH: 3000,
            maxDoorKg: 80,
            maxPanelW: 1100,
            hardware: 'SP-16-11 vertical · SP-16-22 horizontal · SP-16-12 centre · SP-16-15 openable · SP-SL-Track 35×36.5 · SP-SH-06/07/08 hinges · SFS-7000 floor hinge 80 kg · SP-HL-05 handle',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'Door width and height are app limits; sliding hardware is rated 60–80 kg.'
        },
        {
            id: 'SMG_07_45',
            brand: 'SMG',
            name: 'SMG Slim Profile 07×45',
            seriesLabel: 'SMG - Slim Profile 07×45 (SP-07 Series)',
            face: 45,
            depth: 17.8,
            glassMm: [10],
            glassNote: '10 mm glass (SP-07 profile)',
            configs: 'Fixed / swing / sliding partition',
            maxDoorW: 1100,
            maxDoorH: 3000,
            maxDoorKg: 80,
            maxPanelW: 1100,
            hardware: 'SP-07-11 vertical (45 mm face, 7 mm visible) · SP-07-22 horizontal · SP-07-12 centre · SGB-17 Georgian bar · SP-SL-Track 35×36.5 · SP-SH-06/08 hinges · SP-TB-04 handle',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'Ultra-slim 7 mm visible face; door limits are app limits.'
        },
        {
            id: 'SMG_25_45',
            brand: 'SMG',
            name: 'SMG Slim Profile 25×45',
            seriesLabel: 'SMG - Slim Profile 25×45 (SP-25 Series)',
            face: 45,
            depth: 25,
            glassMm: [10, 12],
            glassNote: '10–12 mm glass (SP-D-10 / SP-D-12 dividers)',
            configs: 'Swing door / double door / partition / floor-spring door',
            maxDoorW: 1200,
            maxDoorH: 3000,
            maxDoorKg: 120,
            maxPanelW: 1400,
            hardware: 'SP-25-01 partition · SP-25-02 openable · SP-25-10 door frame · SFS-8400 floor hinge 120 kg · SHFS-100 hydraulic 80 kg · SP-SH-09 soft-close hinge · SGH-55 pull handle · SP-SL-21/22 lock',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'Heavy-duty 25×45 mm section; 120 kg floor hinge rating (SFS-8400).'
        },
        {
            id: 'OZONE_LINEA',
            brand: 'Ozone',
            name: 'Ozone Linea Slim Frame 45×07',
            seriesLabel: 'Ozone - Linea Slim Frame 45×07',
            face: 45,
            depth: 7,
            glassMm: [8, 10],
            glassNote: '8–10 mm glass (thickness not published by Ozone)',
            configs: 'Pocket sliding · telescopic 1+2 / 1+3 · synchro 2+2',
            maxDoorW: 1200,
            maxDoorH: 2700,
            maxDoorKg: 80,
            maxPanelW: 1200,
            hardware: 'Linea sliding door kit (OSTF7F-PKT-SYS) · top & bottom profile with PVC seal · vertical profile · 3 m top track · pocket support plate 3 m · corner cleat kit',
            finishes: 'Black Matt · Phantom Grey · Tan Brass · Vintage Brass Brush · Black Luxe Glossy',
            note: 'Published: max door 1.2 m W × 2.7 m H, 80 kg load.'
        },
        {
            id: 'OZONE_STEALTH',
            brand: 'Ozone',
            name: 'Ozone Stealth 45×16',
            seriesLabel: 'Ozone - Stealth Slim Frame 45×16',
            face: 45,
            depth: 16,
            glassMm: [8, 10],
            glassNote: '8–10 mm glass (confirm glass with Ozone)',
            configs: 'Single / double sliding · swing door · fixed partition',
            maxDoorW: 1200,
            maxDoorH: 3000,
            maxDoorKg: 80,
            maxPanelW: 1200,
            hardware: 'Stealth top track, roller carriages, concealed hinges and swing-door kit',
            finishes: 'Ozone Stealth finish range',
            note: '45×16 mm frontal; vertical span up to ~3 m. Door limits are app limits.'
        },
        {
            id: 'GRAYZO_DELTA',
            brand: 'Grayzo',
            name: 'Grayzo Delta System',
            seriesLabel: 'Grayzo - Delta Slim Profile Door System',
            face: 45,
            depth: 16,
            glassMm: [8, 10],
            glassNote: '8–10 mm glass (thickness not published by Grayzo)',
            configs: 'Synchro · telescopic 3/4/5 door · two-way 2+2 / 3+3 / 4+4 · soft close · pocket · swing with floor spring or hinge',
            maxDoorW: 1219,
            maxDoorH: 3658,
            maxDoorKg: 100,
            maxPanelW: 1219,
            hardware: 'GSP 601 / 602 / 604 / 605 / 606 · GPST 01 track set',
            finishes: 'Black · Brush Gold · Champagne',
            note: 'Published: 12 ft (3658 mm) max height, 4 ft (1219 mm) leaf width; door weight is an app limit.'
        },
        {
            id: 'GRAYZO_LINEA',
            brand: 'Grayzo',
            name: 'Grayzo Linea Shower Enclosure',
            seriesLabel: 'Grayzo - Linea Shower Enclosure (Framed / Frameless)',
            face: 40,
            depth: 15,
            glassMm: [8, 10],
            glassNote: '8–10 mm toughened glass',
            configs: 'Framed door · frameless door · fixed side panel',
            maxDoorW: 900,
            maxDoorH: 2200,
            maxDoorKg: 45,
            maxPanelW: 1200,
            hardware: 'GPST 01 · GSP 401 / 402 · GSP 601 / 602 · shower hinges and handles',
            finishes: 'Black · Brush Gold · Chrome · Coffee Brown',
            note: 'Shower enclosure range; door limits are app limits matched to the 45 kg hinge rule.'
        },
        {
            id: 'SMG_PT_DOOR',
            brand: 'SMG',
            name: 'SMG PT Door System (180° Openable + Sliding)',
            seriesLabel: 'SMG - PT Door System (180° Flat Swing + Sliding)',
            face: 45,
            depth: 16,
            glassMm: [8, 10],
            glassNote: '8–10 mm toughened glass (SP-16 profile)',
            configs: 'PT Door 1+1 (1 Slide + 1 180° Flat Swing), PT Door 1+2 (2 Slide + 1 180° Flat Swing)',
            maxDoorW: 1400,
            maxDoorH: 2700,
            maxDoorKg: 80,
            maxPanelW: 1000,
            hardware: 'SP-PTD 1+1-01 / 1+2-01 hardware kit · top sliding-swing pivot · 180° flat wall hinge · SP-16 slim profile · bottom guide',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'SMG Catalogue Ed. II Pages 01–02: Allows door to slide and swing flat 180° against the wall for 100% clear opening.'
        },
        {
            id: 'SMG_TELESCOPIC',
            brand: 'SMG',
            name: 'SMG Telescopic Sliding Door (Soft Close)',
            seriesLabel: 'SMG - Telescopic Soft-Close Sliding Door (SP-SL Series)',
            face: 45,
            depth: 16,
            glassMm: [8, 10],
            glassNote: '8–10 mm toughened glass',
            configs: 'SP-SL-1+1 (1 Fix + 1 Sliding), SP-SL-1+2 (1 Fix + 2 Sliding), SP-SL-1+3 (1 Fix + 3 Sliding), SP-SL-1+4 (1 Fix + 4 Sliding)',
            maxDoorW: 1200,
            maxDoorH: 3000,
            maxDoorKg: 80,
            maxPanelW: 1200,
            hardware: 'Telescopic simultaneous drive pulley set · soft close damper (60–80 kg) · top track 35×36.5 · concealed floor guides',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'SMG Catalogue Ed. II Pages 09–10: Simultaneous cascading sliding action with dual-end soft closing.'
        },
        {
            id: 'SMG_SYNCHRO',
            brand: 'SMG',
            name: 'SMG Synchronized Bi-Parting Slider (Soft Close)',
            seriesLabel: 'SMG - Synchronized Sliding System (SP-SL Series)',
            face: 45,
            depth: 16,
            glassMm: [8, 10],
            glassNote: '8–10 mm toughened glass',
            configs: 'SP-SL-2+2 (2 Fix + 2 Sliding Bi-parting), 3+3 (2 Fix + 4 Sliding)',
            maxDoorW: 1200,
            maxDoorH: 3000,
            maxDoorKg: 80,
            maxPanelW: 1200,
            hardware: 'Synchronized stainless wire rope pulley carriage · bidirectional soft-close dampers (60–80 kg) · central magnetic meeting seal',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'SMG Catalogue Ed. II Page 11: Bi-parting synchronized opening; moving one sash automatically slides the other.'
        },
        {
            id: 'SMG_BI_FOLD',
            brand: 'SMG',
            name: 'SMG Bi-Fold & Sliding Folding Partition',
            seriesLabel: 'SMG - Bi-Fold & Sliding Folding Partition (SP-BF / SP-SF Series)',
            face: 45,
            depth: 25,
            glassMm: [8, 10],
            glassNote: '8–10 mm toughened glass',
            configs: 'SP-BI FOLD -02 A/B (1500 × 2400/3000 mm), SP-BI FOLD -04 A/B (3000 × 2400/3000 mm), SP-SF-02/03/04/06',
            maxDoorW: 900,
            maxDoorH: 3000,
            maxDoorKg: 60,
            maxPanelW: 900,
            hardware: 'SP-BI FOLD top track · heavy-duty folding carriage · stainless concealed folding hinges · bottom flush track · flush bolts',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'SMG Catalogue Ed. II Pages 05–08: Full-span folding partition opening with minimal stack footprint.'
        },
        {
            id: 'SMG_PERFECT_SLIDE',
            brand: 'SMG',
            name: 'SMG Perfect Multi-Track Sliding (Soft Close)',
            seriesLabel: 'SMG - Perfect Multi-Track Sliding Door (SP-SL 0+3 / 0+4 / 0+6)',
            face: 45,
            depth: 16,
            glassMm: [8, 10],
            glassNote: '8–10 mm toughened glass',
            configs: 'SP-SL-0+3 (3 Sliding both-way opening), SP-SL-0+4 (4 Sliding), SP-SL-0+6 (6 Sliding)',
            maxDoorW: 1200,
            maxDoorH: 3000,
            maxDoorKg: 80,
            maxPanelW: 1200,
            hardware: 'All doors both-way opening with soft close · 60–80 kg carriages · SP-SL-Track · sliding handles · interlock weatherstrips',
            finishes: 'Black Matt · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'SMG Catalogue Ed. II Pages 03–04: All panels movable with dual-direction soft-close damper.'
        },
        {
            id: 'SMG_10_14',
            brand: 'SMG',
            name: 'SMG Slim Profile 10×14mm Series',
            seriesLabel: 'SMG - Ultra Slim 10×14 / 14mm Series',
            face: 14,
            depth: 10,
            glassMm: [10],
            glassNote: '10 mm toughened glass with SP-10-01 / SP-14-01 profiles',
            configs: 'Fixed internal partition / display panel / Georgian grid divider',
            maxDoorW: 1000,
            maxDoorH: 3000,
            maxDoorKg: 60,
            maxPanelW: 1200,
            hardware: 'SP-10-01 10mm slim profile · SP-14-01 14mm profile · SGB-10 corner · SGB-11 T-shape · SGB-16 Georgian bar (16mm) · SGB-20 (20mm)',
            finishes: 'Black Matt · Grey · Brush Gold · Brush Rose Gold · Metallic Gold · Brush Champagne',
            note: 'SMG Catalogue Ed. II Page 12 (doc p15): 10 mm and 14 mm ultra-slim sightlines with Georgian grids.'
        }
    ];

    /**
     * Architectural Glass Options
     */
    const GLASS_OPTIONS = [
        { id: '5MM_CLEAR_TOUGH', name: '5mm Clear Toughened Glass', thickness: 5, weightPerSqM: 12.5, uValue: 5.7 },
        { id: '5MM_CLEAR_FLOAT', name: '5mm Clear Float Glass', thickness: 5, weightPerSqM: 12.5, uValue: 5.8 },
        { id: '8MM_CLEAR_TOUGH', name: '8mm Clear Toughened Glass', thickness: 8, weightPerSqM: 20.0, uValue: 5.6 },
        { id: '10MM_CLEAR_TOUGH', name: '10mm Clear Toughened Glass', thickness: 10, weightPerSqM: 25.0, uValue: 5.5 },
        { id: '12MM_CLEAR_TOUGH', name: '12mm Clear Toughened Glass', thickness: 12, weightPerSqM: 30.0, uValue: 5.4 },
        { id: '6MM_TINTED_GREEN', name: '6mm Light Green Tinted Float', thickness: 6, weightPerSqM: 15.0, uValue: 5.5 },
        { id: 'DGU_5_12A_5', name: 'DGU 22mm (5mm + 12A + 5mm) Double Glazed', thickness: 22, weightPerSqM: 25.0, uValue: 2.8 },
        { id: 'FROSTED_PINHEAD', name: '5mm Frosted / Pinhead Obscure Glass', thickness: 5, weightPerSqM: 12.5, uValue: 5.8 },
        { id: 'SS304_FLY_MESH', name: 'SS304 Stainless Steel High-Tension Flymesh', thickness: 0.8, weightPerSqM: 1.8, uValue: 0 }
    ];

    /**
     * Color Finishes & RAL Values
     */
    const COLOR_FINISHES = [
        { id: 'BLACK', name: 'Dark Charcoal / Black', frameHex: '#111827', sashHex: '#1f2937', innerHex: '#374151' },
        { id: 'WHITE', name: 'uPVC Pure White', frameHex: '#f8fafc', sashHex: '#e2e8f0', innerHex: '#cbd5e1' },
        { id: 'ANTHRACITE', name: 'Anthracite Grey (RAL 7016)', frameHex: '#334155', sashHex: '#475569', innerHex: '#64748b' },
        { id: 'WOODEN', name: 'Golden Oak Woodgrain', frameHex: '#78350f', sashHex: '#9a3412', innerHex: '#d97706' }
    ];

    const DEFAULT_PROJECT_ITEMS = [
        {
                "id": "card_1",
                "code": "CWT",
                "type": "casement_transom",
                "desc": "Casement Window with Fixed Transom",
                "location": "Master Bedroom (Bed 1)",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh",
                "width": 925,
                "height": 1525,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 29.412,
                "qty": 2
        },
        {
                "id": "card_2",
                "code": "FW1",
                "type": "fixed_window",
                "desc": "Picture Fixed Glazing Window",
                "location": "Living Room East",
                "hardware": "Direct Fixing Screws + EPDM Glazing Gaskets",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None",
                "width": 1600,
                "height": 775,
                "transomHeight": 450,
                "mullionWidth": 800,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 21.297,
                "qty": 4
        },
        {
                "id": "card_3",
                "code": "D1",
                "type": "casement_door",
                "desc": "Heavy-Duty Single Rebate Door",
                "location": "Balcony Deck",
                "hardware": "3-Point Espag Door Lock + Euro Profile Cylinder Keyed Both Sides",
                "reinforcement": "2.0 mm Heavy Duty Galvanised Steel",
                "mesh": "None",
                "width": 900,
                "height": 2400,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 42.105,
                "qty": 1
        },
        {
                "id": "card_4",
                "code": "DT1",
                "type": "door_with_transom",
                "desc": "Main Entry Door with Fanlight Transom",
                "location": "Main Foyer Entrance",
                "hardware": "Heavy 3D Adjustable Butt Hinges + Multi-Point Cylinder Lock",
                "reinforcement": "2.0 mm Heavy Duty Galvanised Steel",
                "mesh": "None",
                "width": 950,
                "height": 2450,
                "transomHeight": 450,
                "mullionWidth": 475,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 46.215,
                "qty": 2
        },
        {
                "id": "card_5",
                "code": "SW3",
                "type": "sliding_3track",
                "desc": "3-Track 3-Panel Patio Sliding Door",
                "location": "Living Room Verandah",
                "hardware": "Heavy-Duty Tandem SS Rollers (120kg/panel) + Pop-Up Crescent Lock",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh",
                "width": 1800,
                "height": 1500,
                "transomHeight": 450,
                "mullionWidth": 900,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 60 Sliding Series",
                "glassType": "5mm Clear Float",
                "weight": 43.594,
                "qty": 3
        },
        {
                "id": "card_6",
                "code": "CWT",
                "type": "casement_transom",
                "desc": "Left-Hand Casement with Top Transom",
                "location": "Guest Bedroom (Bed 2)",
                "hardware": "Multi-Point Espag Gear + Keyed Handle + SS 304 Friction Stays",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh",
                "width": 925,
                "height": 1525,
                "transomHeight": 450,
                "mullionWidth": 450,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 29.412,
                "qty": 1,
                "flipHorizontal": true
        },
        {
                "id": "card_7",
                "code": "SW2",
                "type": "sliding_2track",
                "desc": "2-Track 2-Panel Glazed Slider",
                "location": "Kitchen Service Yard",
                "hardware": "Adjustable Brass Tandem Rollers + Flush Touch Lock with Anti-Lift",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "Plisse / Pleated Mosquito Mesh",
                "width": 1600,
                "height": 1200,
                "transomHeight": 450,
                "mullionWidth": 800,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 31.05,
                "qty": 1
        },
        {
                "id": "card_8",
                "code": "V1",
                "type": "vent_louver_fan",
                "desc": "Toilet Ventilator with Louver & Exhaust",
                "location": "Master Toilet / Powder Room",
                "hardware": "PVC Operable Louver Clips + 150mm Exhaust Fan Cutout Ring",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh",
                "width": 600,
                "height": 600,
                "transomHeight": 250,
                "mullionWidth": 300,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "4mm Frosted Pinhead",
                "weight": 9.85,
                "qty": 3
        },
        {
                "id": "card_9",
                "code": "PD4",
                "type": "sliding_4panel",
                "desc": "4-Panel Center-Opening Sliding Patio Door",
                "location": "Dining / Garden Courtyard",
                "hardware": "Twin Heavy Tandem Rollers + Multi-Point Transmission Rod Lock",
                "reinforcement": "2.0 mm Heavy Duty Galvanised Steel",
                "mesh": "Plisse / Pleated Mosquito Mesh",
                "width": 2400,
                "height": 1800,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 60 Sliding Series",
                "glassType": "5mm Clear Float",
                "weight": 62.4,
                "qty": 1
        },
        {
                "id": "card_10",
                "code": "CW2",
                "type": "casement_double_fix_open",
                "desc": "Double Casement (1 Fix + 1 Openable)",
                "location": "Study / Home Office",
                "hardware": "Concealed Multi-Point Espag Gear + Cockspur Sub-Sash Handle",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "SS 304 High-Tensile Security Wire Mesh",
                "width": 1200,
                "height": 1400,
                "transomHeight": 450,
                "mullionWidth": 600,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 32.8,
                "qty": 1
        },
        {
                "id": "card_11",
                "code": "AW1",
                "type": "casement_top_hung",
                "desc": "Top-Hung Awning Projection Window",
                "location": "Kitchen Sink Counter",
                "hardware": "Heavy Awning Friction Stay + Cam Lock Handle with Strike Plate",
                "reinforcement": "1.5 mm Galvanised Steel (IS 277)",
                "mesh": "None",
                "width": 750,
                "height": 900,
                "transomHeight": 450,
                "mullionWidth": 375,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "OKOTECH - O7 CASEMENT SERIES",
                "glassType": "5mm Clear Toughened",
                "weight": 14.2,
                "qty": 2
        },
        {
                "id": "card_12",
                "code": "S3S",
                "type": "sliding_3track_3sash",
                "desc": "3-Track 3-Sash Telescopic Slider",
                "location": "Penthouse Terrace",
                "hardware": "Heavy Tandem SS Rollers + Embedded Pop-Up Crescent Lock + Interlocks",
                "reinforcement": "2.0 mm Heavy Duty Galvanised Steel",
                "mesh": "SS 304 High-Tensile Security Wire Mesh",
                "width": 2100,
                "height": 1500,
                "transomHeight": 450,
                "mullionWidth": 700,
                "profileColor": "#ffffff",
                "colorName": "WHITE",
                "profileSeries": "Veka - I 60 Sliding Series",
                "glassType": "5mm Clear Float",
                "weight": 48.5,
                "qty": 1
        }
];

    /**
     * Standard Fenestration Schedule Type Code Mapping
     * Guarantees each window/door type has its own locked, distinct architectural code
     */
    function getTypeCode(type) {
        const codes = {
            // Fixed Windows
            fixed_window: 'FW1',
            fixed_2bay: 'FW2',
            fixed_3bay: 'FW3',
            fixed_georgian: 'FG1',
            // Casement Windows
            casement_single: 'CW1',
            casement_transom: 'CWT',
            casement_double_fix_open: 'CW2',
            casement_french: 'FCW',
            casement_triple: 'CW3',
            casement_top_hung: 'AW1',
            tilt_and_turn: 'TT1',
            casement_tower_4bay: 'CT4',
            // Sliding Windows & Patio Doors
            sliding_2track: 'SW2',
            sliding_3track: 'SW3',
            sliding_3track_3sash: 'S3S',
            sliding_4panel: 'PD4',
            sliding_transom: 'SWT',
            // Doors
            casement_door: 'D1',
            casement_door_midrail: 'MD1',
            double_door_french: 'FD1',
            door_with_transom: 'DT1',
            // Ventilators
            vent_louver_fan: 'V1',
            vent_double_bay: 'V2',
            vent_double_bay_fix: 'V4',
            vent_wide_fan: 'V3',
            vent_louver_only: 'VL1',
            vent_fan_only: 'VF1',
            vent_top_hung: 'VT1',
            // Frameless Shower & Glass Partitions
            shower_2bay_rod: 'SH1',
            shower_2bay_stepped: 'SH2',
            shower_3bay_hafele: 'SH3',
            // Slim-profile Glass Partitions
            slim_partition_swing: 'SL1',
            slim_partition_sliding: 'SL2',
            slim_partition_double: 'SL3',
            slim_partition_fixed: 'SL4',
            // PT Doors (180° Flat Swing + Sliding)
            pt_door_1_1: 'PT1',
            pt_door_1_2: 'PT2',
            // Bi-Fold & Sliding Folding Systems
            sliding_folding_2panel: 'BF2',
            sliding_folding_3panel: 'SF3',
            sliding_folding_4panel: 'BF4',
            sliding_folding_6panel: 'SF6',
            // Telescopic & Synchronized Soft-Close Sliding
            telescopic_1fix_1slide: 'TL1',
            telescopic_1fix_2slide: 'TL2',
            telescopic_1fix_3slide: 'TL3',
            synchronized_2fix_2slide: 'SYN',
            invisible_ghost_door: 'GD1',
            slim_minimal_fixed: 'SM1'
        };
        return codes[type] || 'CW1';
    }

    function getTypeName(type) {
        const names = {
            casement_single: '1-Panel Casement',
            casement_transom: 'Casement + Transom',
            casement_double_fix_open: '2-Panel (1 Fix + 1 Open)',
            casement_french: 'French Casement',
            casement_triple: '3-Panel Casement',
            casement_top_hung: 'Top-Hung Awning',
            tilt_and_turn: 'Tilt & Turn',
            casement_tower_4bay: '4-Tier Tower',
            fixed_window: 'Fixed Picture Glass',
            fixed_2bay: '2-Bay Fixed',
            fixed_3bay: '3-Bay Fixed',
            fixed_georgian: 'Georgian Grid',
            casement_door: 'Casement Door',
            casement_door_midrail: 'Door w/ Kickplate',
            double_door_french: 'French Double Door',
            door_with_transom: 'Door w/ Top Fanlight',
            sliding_2track: '2-Track Slider',
            sliding_3track: '3-Track Slider + Mesh',
            sliding_3track_3sash: '3-Track 3-Sash Slider',
            sliding_4panel: '4-Panel Center Opening Door (O-X-X-O)',
            sliding_transom: 'Slider + Top Transom',
            vent_louver_fan: 'Vent: Fan + Louver',
            vent_double_bay: 'Vent: Double Bay (Fan+Louver)',
            vent_double_bay_fix: 'Vent: Double Bay (Fan+Fix Glass)',
            vent_wide_fan: 'Vent: Wide Fan + Fix',
            vent_louver_only: 'Full Louvers',
            vent_fan_only: 'Fan Cutout Only',
            vent_top_hung: 'Toilet Awning',
            shower_2bay_rod: '2-Bay Shower w/ Header Rod',
            shower_2bay_stepped: 'Stepped 2-Bay Glass Partition',
            shower_3bay_hafele: 'Hafele 1-Door 2-Fix Partition',
            slim_partition_swing: 'Slim Partition (Swing + Fixed)',
            slim_partition_sliding: 'Slim Partition (2-Panel Sliding)',
            slim_partition_double: 'Slim Partition (Double Swing)',
            slim_partition_fixed: 'Slim Partition (Fixed Glazed)',
            sliding_folding_2panel: 'Bi-Fold 2-Leaf Partition',
            sliding_folding_3panel: 'Sliding Folding 3-Leaf Partition',
            sliding_folding_4panel: 'Bi-Fold 4-Leaf Partition',
            sliding_folding_5panel: 'Bi-Fold 5-Leaf Partition',
            sliding_folding_6panel: 'Bi-Fold 6-Leaf Partition',
            sliding_telescopic_3track: 'Telescopic 3-Track Slider',
            sliding_telescopic_4panel: 'Telescopic 4-Track Slider',
            sliding_pocket_door: 'Pocket Sliding System',
            sliding_corner_90deg: 'Corner 90° Slider',
            sliding_lift_slide: 'Heavy-Duty Lift & Slide',
            sliding_vertical_hung: 'Vertical Guillotine Slider',
            slide_and_turn: 'Slide & Turn Frameless Balcony System'
        };
        return names[type] || (type ? type.replace(/_/g, ' ') : 'Window');
    }

    /**
     * Database Public Interface
     */
    return {
        PRESETS: PRESETS,
        PROFILE_SERIES: PROFILE_SERIES,
        SLIM_SYSTEMS: SLIM_SYSTEMS,
        GLASS_OPTIONS: GLASS_OPTIONS,
        COLOR_FINISHES: COLOR_FINISHES,
        DEFAULT_PROJECT_ITEMS: DEFAULT_PROJECT_ITEMS,

        /**
         * Standard Fenestration Schedule Type Code Mapping
         * Guarantees each window/door type has its own locked, distinct architectural code
         */
        getTypeCode: getTypeCode,
        getTypeName: getTypeName,

        /**
         * Get presets filtered by category ('all', 'casement', 'sliding', 'doors', 'ventilator', 'fixed')
         */
        getPresets: function (category) {
            if (!category || category === 'all') return PRESETS;
            if (category === 'pdf') return PRESETS.filter(function (p) { return p.isPdf; });
            return PRESETS.filter(function (p) { return p.category === category; });
        },

        /**
         * Find preset by ID or Code
         */
        getPresetById: function (id) {
            for (let i = 0; i < PRESETS.length; i++) {
                if (PRESETS[i].id === id || PRESETS[i].code === id) {
                    return PRESETS[i];
                }
            }
            return null;
        },

        /**
         * Calculate area and estimated weight for any item
         */
        calculateMetrics: function (width, height, qty, weightFactor) {
            const w = parseFloat(width) || 0;
            const h = parseFloat(height) || 0;
            const q = parseInt(qty, 10) || 1;
            const areaSqM = (w * h) / 1000000;
            const areaSqFt = areaSqM * 10.76391;
            const estWeight = areaSqFt * (weightFactor || 1.937);
            return {
                areaSqM: areaSqM,
                areaSqFt: areaSqFt,
                totalAreaSqFt: areaSqFt * q,
                estWeightKg: estWeight,
                totalWeightKg: estWeight * q
            };
        },

        /**
         * Local Storage Persistence Manager
         */
        storage: {
            load: function (key) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                            // Reconcile item codes so identical window types always share the exact same code
                            const getCode = getTypeCode;
                            parsed.items.forEach(function (it) {
                                it.code = getCode(it.type);
                            });
                            return parsed;
                        }
                    }
                } catch (e) {
                    console.warn('[CAD_DB] Storage read error:', e);
                }
                return { items: DEFAULT_PROJECT_ITEMS, activeId: 'card_1' };
            },
            save: function (key, data) {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (e) {
                    console.error('[CAD_DB] Storage write error:', e);
                    return false;
                }
            }
        },

        /**
         * Robust CSV & Dimension Parser
         * Supports:
         * 1. Standard CSV / TSV with headers or positional columns
         * 2. Quoted cells containing commas e.g. "1,200", "1,500"
         * 3. Plain dimension strings e.g. "1200 x 1500", "1600 * 775"
         * 4. Smart unit auto-detection (mm, inches, feet)
         * 5. Fuzzy fenestration type normalization (3-track, slider, casement, etc.)
         */
        parseCsv: function (csvText, defaultType, defaultColor, unitMode) {
            if (!csvText || typeof csvText !== 'string') return [];
            const defType = defaultType || 'casement_transom';
            const defColor = defaultColor || 'WHITE';
            const uMode = unitMode || 'auto';

            const validTypes = [
                'casement_single', 'casement_transom', 'casement_double_fix_open', 'casement_french', 'casement_triple',
                'casement_top_hung', 'tilt_and_turn', 'casement_tower_4bay', 'fixed_window', 'fixed_2bay', 'fixed_3bay',
                'fixed_georgian', 'casement_door', 'casement_door_midrail', 'double_door_french', 'door_with_transom',
                'sliding_2track', 'sliding_3track', 'sliding_3track_3sash', 'sliding_4panel', 'sliding_transom',
                'vent_louver_fan', 'vent_double_bay', 'vent_double_bay_fix', 'vent_wide_fan', 'vent_louver_only', 'vent_fan_only', 'vent_top_hung',
                'shower_2bay_rod', 'shower_2bay_stepped', 'shower_3bay_hafele'
            ];

            function normalizeType(inputStr) {
                if (!inputStr || typeof inputStr !== 'string') return defType;
                const s = inputStr.trim().toLowerCase().replace(/[-_]+/g, ' ');
                const rawKey = inputStr.trim().toLowerCase().replace(/\s+/g, '_');
                if (validTypes.includes(rawKey)) return rawKey;

                if (/stepped|78.*110|110.*78|sh2/i.test(s)) return 'shower_2bay_stepped';
                if (/3\s*bay.*shower|hafele.*3|hafele|1\s*door.*2\s*fix|sh3/i.test(s)) return 'shower_3bay_hafele';
                if (/reinforcement|header\s*rod|header\s*bar|2\s*bay.*shower|shower|partition|sh1/i.test(s)) return 'shower_2bay_rod';

                if (/4\s*panel|oxxo|center\s*open|patio\s*door|sliding\s*door|french\s*slid/i.test(s)) return 'sliding_4panel';
                if (/3\s*sash/i.test(s)) return 'sliding_3track_3sash';
                if (/3\s*track|three\s*track|fly\s*mesh/i.test(s)) return 'sliding_3track';
                if (/2\s*track|two\s*track/i.test(s)) return 'sliding_2track';
                if (/sliding.*transom|slider.*transom/i.test(s)) return 'sliding_transom';
                if (/sliding|slider/i.test(s)) return 'sliding_3track';

                if (/tilt.*turn/i.test(s)) return 'tilt_and_turn';
                if (/tower|4\s*tier|4\s*bay\s*case/i.test(s)) return 'casement_tower_4bay';
                if (/french\s*door|double\s*door/i.test(s)) return 'double_door_french';
                if (/mid\s*rail|kick\s*plate/i.test(s)) return 'casement_door_midrail';
                if (/door.*transom|door.*fanlight/i.test(s)) return 'door_with_transom';
                if (/door/i.test(s)) return 'casement_door';

                if (/french\s*case|french\s*win/i.test(s)) return 'casement_french';
                if (/triple|open\s*fix\s*open|3\s*panel/i.test(s)) return 'casement_triple';
                if (/double.*fix|fix.*open|2\s*panel.*case/i.test(s)) return 'casement_double_fix_open';
                if (/single\s*case|1\s*panel/i.test(s)) return 'casement_single';
                if (/awning|top\s*hung/i.test(s)) return 'casement_top_hung';
                if (/transom|fanlight|top\s*fix/i.test(s)) return 'casement_transom';

                if (/georgian|colonial|grid/i.test(s)) return 'fixed_georgian';
                if (/3\s*bay\s*fix/i.test(s)) return 'fixed_3bay';
                if (/2\s*bay\s*fix/i.test(s)) return 'fixed_2bay';
                if (/fix|picture|glass/i.test(s)) return 'fixed_window';

                if (/louver.*fan|fan.*louver/i.test(s)) return 'vent_louver_fan';
                if (/double\s*bay.*(fix|glass)/i.test(s) || /vent.*double.*fix/i.test(s) || /v4/i.test(s)) return 'vent_double_bay_fix';
                if (/double\s*bay\s*vent/i.test(s)) return 'vent_double_bay';
                if (/wide\s*vent/i.test(s)) return 'vent_wide_fan';
                if (/louver/i.test(s)) return 'vent_louver_only';
                if (/exhaust|fan/i.test(s)) return 'vent_fan_only';
                if (/toilet|vent.*top/i.test(s)) return 'vent_top_hung';
                if (/vent/i.test(s)) return 'vent_louver_fan';

                if (/case/i.test(s)) return 'casement_transom';

                return defType;
            }

            function parseCleanNum(val) {
                if (val === undefined || val === null) return NaN;
                if (typeof val === 'number') return isNaN(val) ? NaN : val;
                const s = String(val).trim().replace(/,/g, '');
                const cleanUnit = s.replace(/\s*(mm|inch|in|ft|feet|sqft|sqm)\s*$/i, '');
                if (/^-?\d+(\.\d+)?$/.test(cleanUnit)) {
                    return parseFloat(cleanUnit);
                }
                return NaN;
            }

            function tokenizeLine(line, delim) {
                const res = [];
                let cur = '';
                let inQ = false;
                for (let j = 0; j < line.length; j++) {
                    const c = line[j];
                    if (c === '"' || c === "'") {
                        if (inQ && line[j + 1] === c) {
                            cur += c;
                            j++;
                        } else {
                            inQ = !inQ;
                        }
                    } else if (!inQ && (delim ? c === delim : (c === ',' || c === '\t' || c === ';'))) {
                        res.push(cur.trim());
                        cur = '';
                    } else {
                        cur += c;
                    }
                }
                res.push(cur.trim());
                return res.map(function (s) { return s.replace(/^["']|["']$/g, '').trim(); });
            }

            const cleanText = csvText.replace(/^\uFEFF/, '');
            const lines = cleanText.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
            if (lines.length === 0) return [];

            let delim = ',';
            const sample = lines.slice(0, 3).join('\n');
            const tabCount = (sample.match(/\t/g) || []).length;
            const semiCount = (sample.match(/;/g) || []).length;
            const commaCount = (sample.match(/,/g) || []).length;
            if (tabCount > commaCount && tabCount > semiCount) delim = '\t';
            else if (semiCount > commaCount && semiCount > tabCount) delim = ';';

            const parsedRows = lines.map(function (l) { return tokenizeLine(l, delim); });
            const row0 = parsedRows[0];
            const headerRow = row0.map(function (h) { return h.toLowerCase().replace(/[-_]+/g, ' ').trim(); });

            let colMap = { width: -1, height: -1, mark: -1, type: -1, qty: -1, color: -1, glass: -1, series: -1 };
            let hasHeader = false;

            headerRow.forEach(function (col, i) {
                if (/^(width|w\b|breadth|b\b|total\s*width|frame\s*width|size\s*w)/i.test(col)) { colMap.width = i; hasHeader = true; }
                else if (/^(height|h\b|total\s*height|frame\s*height|size\s*h|depth)/i.test(col)) { colMap.height = i; hasHeader = true; }
                else if (/^(mark|tag|code|item\b|item\s*code|window\s*(?:no|code|mark)|ref\b|reference)/i.test(col)) { colMap.mark = i; hasHeader = true; }
                else if (/^(type|window\s*type|model|description|item\s*type|system|spec)/i.test(col)) { colMap.type = i; hasHeader = true; }
                else if (/^(qty|quantity|count|nos?\b|units?|number)/i.test(col)) { colMap.qty = i; hasHeader = true; }
                else if (/^(color|colour|finish|ral|profile\s*color)/i.test(col)) { colMap.color = i; hasHeader = true; }
                else if (/^(glass|glazing)/i.test(col)) { colMap.glass = i; hasHeader = true; }
                else if (/^(series|profile\s*series)/i.test(col)) { colMap.series = i; hasHeader = true; }
            });

            if (colMap.width !== -1 && colMap.height !== -1) {
                if (!isNaN(parseCleanNum(row0[colMap.width])) && !isNaN(parseCleanNum(row0[colMap.height]))) {
                    hasHeader = false;
                }
            }

            let startIdx = 0;
            if (hasHeader) {
                startIdx = 1;
            } else {
                colMap = { width: -1, height: -1, mark: -1, type: -1, qty: -1, color: -1, glass: -1, series: -1 };
                const f = row0;
                if (f.length === 2) {
                    colMap.width = 0;
                    colMap.height = 1;
                } else if (f.length >= 3) {
                    if (isNaN(parseCleanNum(f[0])) && !isNaN(parseCleanNum(f[1])) && !isNaN(parseCleanNum(f[2]))) {
                        colMap.mark = 0;
                        colMap.width = 1;
                        colMap.height = 2;
                        if (f.length > 3) {
                            if (isNaN(parseCleanNum(f[3]))) colMap.type = 3;
                            else colMap.qty = 3;
                        }
                        if (f.length > 4) {
                            if (colMap.type === 3) colMap.qty = 4;
                            else colMap.type = 4;
                        }
                    } else {
                        colMap.width = 0;
                        colMap.height = 1;
                        if (isNaN(parseCleanNum(f[2]))) colMap.type = 2;
                        else colMap.qty = 2;
                        if (f.length > 3) {
                            if (colMap.type === -1) colMap.type = 3;
                            else if (colMap.qty === -1) colMap.qty = 3;
                        }
                    }
                }
            }

            const items = [];
            let itemSeq = 1;

            for (let i = startIdx; i < parsedRows.length; i++) {
                const row = parsedRows[i];
                if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

                let mark = null;
                let w = NaN;
                let h = NaN;
                let typeStr = null;
                let qty = 1;
                let colorStr = null;
                let glassStr = null;
                let seriesStr = null;

                if (colMap.width !== -1 && row[colMap.width] !== undefined) w = parseCleanNum(row[colMap.width]);
                if (colMap.height !== -1 && row[colMap.height] !== undefined) h = parseCleanNum(row[colMap.height]);
                if (colMap.mark !== -1 && row[colMap.mark]) mark = row[colMap.mark];
                if (colMap.type !== -1 && row[colMap.type]) typeStr = row[colMap.type];
                if (colMap.qty !== -1 && row[colMap.qty]) {
                    const q = parseCleanNum(row[colMap.qty]);
                    if (!isNaN(q) && q > 0) qty = Math.round(q);
                }
                if (colMap.color !== -1 && row[colMap.color]) colorStr = row[colMap.color];
                if (colMap.glass !== -1 && row[colMap.glass]) glassStr = row[colMap.glass];
                if (colMap.series !== -1 && row[colMap.series]) seriesStr = row[colMap.series];

                if (isNaN(w) || isNaN(h)) {
                    const fullLine = lines[i];
                    const dimMatch = fullLine.match(/(?:([A-Za-z0-9_-]+)[:\s]+)?([0-9,.]+)\s*(?:[xX*×]|\s+by\s+|\s+BY\s+)\s*([0-9,.]+)(?:\s+(?:qty[:\s]*)?(\d+))?/i);
                    if (dimMatch) {
                        if (!mark && dimMatch[1]) mark = dimMatch[1];
                        w = parseCleanNum(dimMatch[2]);
                        h = parseCleanNum(dimMatch[3]);
                        if (dimMatch[4]) qty = parseInt(dimMatch[4], 10);
                        if (!typeStr) {
                            const rem = fullLine.replace(dimMatch[0], '').trim();
                            if (rem) {
                                typeStr = rem;
                                if (!colorStr && /white|upvc/i.test(rem)) colorStr = 'WHITE';
                            }
                        }
                    }
                }

                if (isNaN(w) || isNaN(h)) {
                    const nums = row.map(parseCleanNum).filter(function (n) { return !isNaN(n) && n > 0; });
                    if (nums.length >= 2) {
                        if (nums.length >= 3 && nums[0] < 100 && (nums[1] >= 100 || nums[2] >= 100)) {
                            w = nums[1];
                            h = nums[2];
                            if (nums[3]) qty = Math.round(nums[3]);
                        } else {
                            w = nums[0];
                            h = nums[1];
                            if (nums[2] && nums[2] <= 100) qty = Math.round(nums[2]);
                        }
                    }
                }

                if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) continue;

                let finalW = w;
                let finalH = h;
                if (uMode === 'feet') {
                    finalW = Math.round(w * 304.8);
                    finalH = Math.round(h * 304.8);
                } else if (uMode === 'inch') {
                    finalW = Math.round(w * 25.4);
                    finalH = Math.round(h * 25.4);
                } else if (uMode === 'auto') {
                    if (w <= 14 && h <= 14) {
                        finalW = Math.round(w * 304.8);
                        finalH = Math.round(h * 304.8);
                    } else if (w <= 120 && h <= 120 && w >= 15 && h >= 15) {
                        finalW = Math.round(w * 25.4);
                        finalH = Math.round(h * 25.4);
                    } else {
                        finalW = Math.round(w);
                        finalH = Math.round(h);
                    }
                } else {
                    finalW = Math.round(w);
                    finalH = Math.round(h);
                }

                finalW = Math.max(150, Math.min(finalW, 8000));
                finalH = Math.max(150, Math.min(finalH, 8000));

                const resolvedType = normalizeType(typeStr);
                const typeCode = getTypeCode(resolvedType);

                if (!mark || mark.trim().length === 0 || /^W\d+$/i.test(mark.trim())) {
                    mark = typeCode;
                }

                let colorKey = defColor || 'WHITE';
                if (colorStr) {
                    const cs = colorStr.toUpperCase();
                    if (cs.includes('WHITE')) colorKey = 'WHITE';
                    else if (cs.includes('ANTH') || cs.includes('GREY') || cs.includes('GRAY')) colorKey = 'ANTHRACITE';
                    else if (cs.includes('WOOD') || cs.includes('OAK') || cs.includes('BROWN')) colorKey = 'WOODEN';
                    else if (cs.includes('BLACK')) colorKey = 'BLACK';
                    else colorKey = 'WHITE';
                }

                const profileColor = colorKey === 'WHITE' ? '#ffffff' : (colorKey === 'ANTHRACITE' ? '#334155' : (colorKey === 'WOODEN' ? '#78350f' : '#111827'));
                const resolvedSeries = seriesStr || (resolvedType.includes('sliding') ? 'Veka - I 60 Sliding Series' : 'OKOTECH - O7 CASEMENT SERIES');
                const resolvedGlass = glassStr || (resolvedType.includes('vent') ? 'Single Glazing / Obscure' : '5mm Clear Toughened');
                const areaSqFt = (finalW * finalH / 1000000) * 10.7639;
                const weight = parseFloat((areaSqFt * 1.95).toFixed(2));

                const rawLine = ((lines[i] || '') + ' ' + (typeStr || '')).toLowerCase();
                const isGeo = /georgian|colonial|astragal|muntin|grid/.test(rawLine) || resolvedType === 'fixed_georgian';

                items.push({
                    id: 'card_csv_' + Date.now() + '_' + itemSeq + '_' + Math.random().toString(36).substr(2, 4),
                    code: mark,
                    type: resolvedType,
                    desc: getTypeName(resolvedType),
                    location: 'Opening ' + itemSeq,
                    hardware: resolvedType.includes('sliding') ? 'Tandem Rollers + Pop-Up Crescent Lock' : 'Multi-Point Espag Gear + Friction Stays',
                    reinforcement: '1.5 mm Galvanised Steel (IS 277)',
                    mesh: resolvedType.includes('sliding') ? 'SS 304 High-Tensile Security Wire Mesh' : 'None',
                    width: finalW,
                    height: finalH,
                    transomHeight: Math.round(Math.min(finalH * 0.3, 500)),
                    mullionWidth: Math.round(finalW / 2),
                    profileColor: profileColor,
                    colorName: colorKey,
                    profileSeries: resolvedSeries,
                    glassType: resolvedGlass,
                    weight: weight,
                    qty: qty,
                    flipHorizontal: false,
                    georgianBars: isGeo ? 'auto' : 'none',
                    georgianCols: 2,
                    georgianRows: 3
                });

                itemSeq++;
            }
            return items;
        },

        /**
         * Export Schedule to CSV String
         */
        exportToCsv: function (items) {
            const headers = ['Serial', 'Mark', 'Type', 'Width (mm)', 'Height (mm)', 'Quantity', 'Area (Sq.Ft)', 'Total Area (Sq.Ft)', 'Finish', 'Glass Spec', 'Georgian Grids'];
            const rows = [headers.join(',')];

            (items || []).forEach(function (it, idx) {
                const metrics = (typeof it.width === 'number' && typeof it.height === 'number')
                    ? ((it.width * it.height / 1000000) * 10.76391)
                    : 0;
                const totalArea = metrics * (it.qty || 1);
                const geoLabel = it.georgianBars && it.georgianBars !== 'none' ? (it.georgianBars + ' (' + (it.georgianCols || 2) + 'x' + (it.georgianRows || 3) + ')') : 'None';
                rows.push([
                    '#' + (idx + 1),
                    '"' + (it.code || 'W1') + '"',
                    '"' + (it.type || 'casement_transom') + '"',
                    it.width || 0,
                    it.height || 0,
                    it.qty || 1,
                    metrics.toFixed(3),
                    totalArea.toFixed(3),
                    '"' + (it.colorName || 'WHITE') + '"',
                    '"' + (it.glassType || '5mm Clear') + '"',
                    '"' + geoLabel + '"'
                ].join(','));
            });

            return rows.join('\n');
        }
    };
}));
