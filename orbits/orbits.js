/*
    Copyright (C) 2013-2015  Ian Smith <m4r35n357@gmail.com>

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
	var grd;
	var i;
	var isco = DISPLAY.isco();
	// Initialize orbit canvases
	DISPLAY.bg.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
	DISPLAY.tracks.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
	NEWTON.fg.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
	GR.fg.clearRect(0, 0, DISPLAY.oSize, DISPLAY.oSize);
	DISPLAY.circularGradient(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, DISPLAY.GREY, DISPLAY.BLACK);
	grd = DISPLAY.bgPotential.createLinearGradient(0, 0, DISPLAY.width, 0);
	grd.addColorStop(0, DISPLAY.GREY);
	grd.addColorStop(1, DISPLAY.BLACK);
	// Solar perimeter
	DISPLAY.bg.strokeStyle = DISPLAY.YELLOW;
		DISPLAY.bg.beginPath();
		DISPLAY.bg.arc(DISPLAY.originX, DISPLAY.originY, DISPLAY.scale * GLOBALS.rSolar, 0, GLOBALS.TWOPI, true);
		DISPLAY.bg.closePath();
	DISPLAY.bg.stroke();
	// Stable orbit limit
	GLOBALS.debug && console.info("ISCO: " + isco.toFixed(1));
	DISPLAY.bg.globalAlpha = 0.2;
	DISPLAY.ball(DISPLAY.bg, DISPLAY.YELLOW, DISPLAY.originX, DISPLAY.originY, DISPLAY.scale * INIT.M * isco);
	// Ergoregion
	DISPLAY.bg.globalAlpha = 0.6;
	DISPLAY.ball(DISPLAY.bg, DISPLAY.CYAN, DISPLAY.originX, DISPLAY.originY, DISPLAY.scale * INIT.M * GLOBALS.ergosphere);
	// Gravitational radius
	DISPLAY.bg.globalAlpha = 1.0;
	DISPLAY.ball(DISPLAY.bg, DISPLAY.BLACK, DISPLAY.originX, DISPLAY.originY, DISPLAY.scale * INIT.M * INIT.horizon);
	// Initialize potential canvases
	DISPLAY.bgPotential.clearRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
	NEWTON.fgPotential.clearRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
	GR.fgPotential.clearRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
	// Background
	DISPLAY.bgPotential.fillStyle = grd;
	DISPLAY.bgPotential.fillRect(0, 0, DISPLAY.width, DISPLAY.pSize);
	// Stable orbit limit
	DISPLAY.bgPotential.globalAlpha = 0.2;
	DISPLAY.bgPotential.fillStyle = DISPLAY.YELLOW;
	DISPLAY.bgPotential.fillRect(0, 0, DISPLAY.scale * INIT.M * isco, DISPLAY.pSize); 
	// Ergoregion
	DISPLAY.bgPotential.globalAlpha = 0.6;
	DISPLAY.bgPotential.fillStyle = DISPLAY.CYAN;
	DISPLAY.bgPotential.fillRect(0, 0, DISPLAY.scale * INIT.M * GLOBALS.ergosphere, DISPLAY.pSize); 
	// Effective potentials
	DISPLAY.potential(NEWTON);
	DISPLAY.potential(GR);
	// Horizon
	DISPLAY.bgPotential.globalAlpha = 1.0;
	DISPLAY.bgPotential.fillStyle = DISPLAY.BLACK;
	DISPLAY.bgPotential.fillRect(0, 0, DISPLAY.scale * INIT.M * INIT.horizon, DISPLAY.pSize);
	// Solar perimeter
	DISPLAY.bgPotential.strokeStyle = DISPLAY.YELLOW;
		DISPLAY.bgPotential.beginPath();
		DISPLAY.bgPotential.moveTo(GLOBALS.rSolar * DISPLAY.scale, 0);
		DISPLAY.bgPotential.lineTo(GLOBALS.rSolar * DISPLAY.scale, DISPLAY.pSize);
	DISPLAY.bgPotential.stroke();
	DISPLAY.energyBar();
	// Constants of motion for table
	NEWTON.lDisplay.innerHTML = (INIT.M * NEWTON.L).toFixed(6);
	GR.eDisplay.innerHTML = GR.E.toFixed(6);
	GR.lDisplay.innerHTML = (INIT.M * GR.L).toFixed(6);
	GR.rsDisplay.innerHTML = (INIT.M * INIT.horizon).toFixed(3);
	// time step counter
	DISPLAY.n = 0;
};

var plotModel = function (model) {
	if (! model.collided) {
		model.update();
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
	DISPLAY.plotTauDot(GR);
	DISPLAY.n += 1;
	DISPLAY.refreshId = window.requestAnimationFrame(drawForeground);
};

var setupModel = function (model, colour) {
	INIT.initialize(model);
	model.initialize();
	model.X = DISPLAY.pointX(INIT.M * DISPLAY.scale * model.r, model.phi);
	model.Y = DISPLAY.pointY(INIT.M * DISPLAY.scale * model.r, model.phi);
	model.colour = colour;
}

var scenarioChange = function () {  // refresh form data
	INIT.getHtmlValues();
	DISPLAY.scale = INIT.getFloatById('scale');
	DISPLAY.pScale = INIT.getFloatById('pscale');
	document.getElementById('showTracks').checked ? DISPLAY.showTracks = true : DISPLAY.showTracks = false;
	GLOBALS.initialize();
	setupModel(NEWTON, DISPLAY.GREEN);
	setupModel(GR, DISPLAY.BLUE);
	drawBackground();
	drawForeground();  // start thimgs moving
	return false;  // don't reload from scratch
};

window.onload = function () {  // load static DOM elements
	var orbitPlot = document.getElementById('tracks');
	var potential = document.getElementById('bgpot');
	DISPLAY.oSize = orbitPlot.width;
	DISPLAY.pSize = potential.width;
	DISPLAY.originX = orbitPlot.width / 2;
	DISPLAY.originY = orbitPlot.height / 2;
	DISPLAY.width = potential.width;
	DISPLAY.tracks = orbitPlot.getContext('2d');
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

