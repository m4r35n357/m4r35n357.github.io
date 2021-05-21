/*
    Copyright (C) 2013-2021  Ian Smith <m4r35n357@gmail.com>

    The JavaScript code in this page is free software: you can
    redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The code is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    that code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.
*/

/*jslint white: true, browser: true, safe: true */

"use strict";

var drawBackground = function () {
    var isco = GLOBALS.radius(GLOBALS.isco(GLOBALS.a)) * GLOBALS.M * DISPLAY.scale;
    var photonSphere = GLOBALS.radius(GLOBALS.photonSphere(GLOBALS.a)) * GLOBALS.M * DISPLAY.scale;
    var ergosphere = GLOBALS.radius(GLOBALS.ergosphere) * GLOBALS.M * DISPLAY.scale;
    var horizon = GLOBALS.radius(GLOBALS.horizon) * GLOBALS.M * DISPLAY.scale;
    // Initialize orbit canvases
    DISPLAY.bg.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
    DISPLAY.tracks.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
    NEWTON.fg.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
    GR.fg.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
    DISPLAY.circularGradient(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, DISPLAY.GREY, DISPLAY.BLACK);
    // Solar perimeter
    DISPLAY.bg.strokeStyle = DISPLAY.YELLOW;
        DISPLAY.bg.beginPath();
        DISPLAY.bg.arc(DISPLAY.originX, DISPLAY.originY, DISPLAY.scale * GLOBALS.rSolar, 0, GLOBALS.TWOPI, true);
        DISPLAY.bg.closePath();
    DISPLAY.bg.stroke();
    // ISCO
    GLOBALS.debug && console.info("ISCO: " + isco.toFixed(1));
    DISPLAY.bg.globalAlpha = 0.1;
    DISPLAY.ball(DISPLAY.bg, DISPLAY.WHITE, DISPLAY.originX, DISPLAY.originY, isco);
    // Ergoregion
    DISPLAY.bg.globalAlpha = 1.0;
    DISPLAY.ball(DISPLAY.bg, DISPLAY.CYAN, DISPLAY.originX, DISPLAY.originY, ergosphere);
    // Photon sphere
    DISPLAY.circle(DISPLAY.bg, DISPLAY.ORANGE, DISPLAY.originX, DISPLAY.originY, photonSphere);
    // Gravitational radius
    DISPLAY.ball(DISPLAY.bg, DISPLAY.BLACK, DISPLAY.originX, DISPLAY.originY, horizon);
    // Initialize potential canvases
    DISPLAY.bgPotential.clearRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
    NEWTON.fgPotential.clearRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
    GR.fgPotential.clearRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
    DISPLAY.linearGradient(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, DISPLAY.GREY, DISPLAY.BLACK);
    // ISCO
    DISPLAY.bgPotential.globalAlpha = 0.1;
    DISPLAY.bgPotential.fillStyle = DISPLAY.WHITE;
    DISPLAY.bgPotential.fillRect(0, 0, isco, DISPLAY.pSize);
    // Ergoregion
    DISPLAY.bgPotential.globalAlpha = 1.0;
    DISPLAY.bgPotential.fillStyle = DISPLAY.CYAN;
    DISPLAY.bgPotential.fillRect(0, 0, ergosphere, DISPLAY.pSize);
    // Photon sphere
    DISPLAY.bgPotential.strokeStyle = DISPLAY.ORANGE;
        DISPLAY.bgPotential.beginPath();
        DISPLAY.bgPotential.moveTo(photonSphere, 0);
        DISPLAY.bgPotential.lineTo(photonSphere, DISPLAY.pSize);
    DISPLAY.bgPotential.stroke();
    // Effective potentials
    DISPLAY.potential(NEWTON);
    DISPLAY.potential(GR);
    // Horizon
    DISPLAY.bgPotential.fillStyle = DISPLAY.BLACK;
    DISPLAY.bgPotential.fillRect(0, 0, horizon, DISPLAY.pSize);
    // Solar perimeter
    DISPLAY.bgPotential.strokeStyle = DISPLAY.YELLOW;
        DISPLAY.bgPotential.beginPath();
        DISPLAY.bgPotential.moveTo(GLOBALS.rSolar * DISPLAY.scale, 0);
        DISPLAY.bgPotential.lineTo(GLOBALS.rSolar * DISPLAY.scale, DISPLAY.pSize);
    DISPLAY.bgPotential.stroke();
    DISPLAY.energyBar();
    // Constants of motion for table
    NEWTON.lDisplay.innerHTML = (GLOBALS.M * NEWTON.L).toFixed(6);
    GR.eDisplay.innerHTML = (GLOBALS.M * GR.E).toFixed(6);
    GR.lDisplay.innerHTML = (GLOBALS.M * GR.L).toFixed(6);
    GR.rsDisplay.innerHTML = (GLOBALS.M * GLOBALS.horizon).toFixed(3);
    // time step counter
    DISPLAY.n = 0;
};

var plotModel = function (model) {
    if (! model.collided) {
        GLOBALS.update(model);
        DISPLAY.plotOrbit(model);
        DISPLAY.plotPotential(model);
    }
}

var drawForeground = function () {  // main loop
    DISPLAY.refreshId && window.cancelAnimationFrame(DISPLAY.refreshId);
    if ((DISPLAY.n % 10) === 0) {
        DISPLAY.varTable();
    }
    DISPLAY.plotRotation(); // BH spin direction indicator
    plotModel(NEWTON);
    plotModel(GR);
    DISPLAY.plotSpeed(NEWTON);
    DISPLAY.plotSpeed(GR);
    DISPLAY.n += 1;
    DISPLAY.refreshId = window.requestAnimationFrame(drawForeground);
};

var setupModel = function (model, colour) {
    GLOBALS.initialize(model);
    model.initialize(GLOBALS.a, GLOBALS.lFac, GLOBALS.debug);
    model.X = DISPLAY.pointX(GLOBALS.M * DISPLAY.scale * model.r, model.phi);
    model.Y = DISPLAY.pointY(GLOBALS.M * DISPLAY.scale * model.r, model.phi);
    model.colour = colour;
}

var scenarioChange = function () {  // refresh form data
    GLOBALS.getHtmlValues();
    DISPLAY.scale = GLOBALS.getFloatById('scale');
    DISPLAY.pScale = GLOBALS.getFloatById('pscale');
    document.getElementById('showTracks').checked ? DISPLAY.showTracks = true : DISPLAY.showTracks = false;
    SYMPLECTIC.initialize(GLOBALS.order);
    document.getElementById('toggleDebug').checked ? GLOBALS.debug = true : GLOBALS.debug = false;
    setupModel(NEWTON, DISPLAY.GREEN);
    setupModel(GR, DISPLAY.BLUE);
    drawBackground();
    drawForeground();  // start things moving
    return false;  // don't reload from scratch
};

window.onload = function () {  // load static DOM elements
    var orbitPlot = document.getElementById('tracks');
    DISPLAY.oSize = orbitPlot.width;
    DISPLAY.originX = orbitPlot.width / 2;
    DISPLAY.originY = orbitPlot.height / 2;
    DISPLAY.tracks = orbitPlot.getContext('2d');
    DISPLAY.pSize = document.getElementById('bgpot').width;
    NEWTON.fg = document.getElementById('fgorbitn').getContext('2d');
    GR.fg = document.getElementById('fgorbitgr').getContext('2d');
    DISPLAY.bg = document.getElementById('bgorbit').getContext('2d');
    DISPLAY.bgPotential = document.getElementById('bgpot').getContext('2d');
    NEWTON.fgPotential = document.getElementById('fgpotn').getContext('2d');
    GR.fgPotential = document.getElementById('fgpotgr').getContext('2d');
    NEWTON.eDisplay = document.getElementById('eNEWTON');
    NEWTON.lDisplay = document.getElementById('lNEWTON');
    NEWTON.tDisplay = document.getElementById('timeNEWTON');
    NEWTON.rDisplay = document.getElementById('rNEWTON');
    NEWTON.phiDisplay = document.getElementById('phiNEWTON');
    NEWTON.rMinDisplay = document.getElementById('rminNEWTON');
    NEWTON.pDisplay = document.getElementById('pNEWTON');
    NEWTON.rMaxDisplay = document.getElementById('rmaxNEWTON');
    NEWTON.aDisplay = document.getElementById('aNEWTON');
    NEWTON.vDisplay = document.getElementById('vNEWTON');
    GR.rsDisplay = document.getElementById('rs');
    GR.eDisplay = document.getElementById('eGR');
    GR.lDisplay = document.getElementById('lGR');
    GR.tDisplay = document.getElementById('tGR');
    GR.rDisplay = document.getElementById('rGR');
    GR.phiDisplay = document.getElementById('phiGR');
    GR.tauDisplay = document.getElementById('tauGR');
    GR.rMinDisplay = document.getElementById('rminGR');
    GR.pDisplay = document.getElementById('pGR');
    GR.rMaxDisplay = document.getElementById('rmaxGR');
    GR.aDisplay = document.getElementById('aGR');
    GR.tDotDisplay = document.getElementById('tdotGR');
    GR.rDotDisplay = document.getElementById('rdotGR');
    GR.phiDotDisplay = document.getElementById('phidotGR');
    GR.tauDotDisplay = document.getElementById('taudotGR');
    GR.vDisplay = document.getElementById('vGR');
    document.getElementById('scenarioForm').onsubmit = scenarioChange;
    scenarioChange();  // start thimgs moving
};
