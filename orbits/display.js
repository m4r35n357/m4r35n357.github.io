/*
    Copyright (C) 2013  Ian Smith <m4r35n357@gmail.com>

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

var DISPLAY = {
	msRefresh: 10,
	// Misc. constants
	BLACK: "#000000",
	RED: "#ff0000",
	GREEN: "#00ff00",
	BLUE: "#0000ff",
	YELLOW: "#ffff00",
	CYAN: "#008080",
	MAGENTA: "#800080",
	ORANGE: "#ff8000",
	WHITE: "#ffffff",
	GREY: "#a0a0a0",
	n: 0,
	ballSize: 3,
	blankSize: 4,
	potentialY: 100,
	phiBH: 0.0,
	circularGradient: function (canvas, x, y, innerColour, outerColour) {
		var grd = canvas.createRadialGradient(x, y, 0, x, y, Math.sqrt(x * x + y * y));
		grd.addColorStop(0, innerColour);
		grd.addColorStop(1, outerColour);
		canvas.fillStyle = grd;
		canvas.fillRect(0, 0, 2 * x, 2 * y);
	},
	circle: function (canvas, X, Y, radius, colour) {
		canvas.fillStyle = colour;
			canvas.beginPath();
			canvas.arc(X, Y, this.scale * radius, 0, GLOBALS.TWOPI, true);
			canvas.closePath();
		canvas.fill();
	},
	varTable: function () {
		var M = INIT.M;
		var c = GLOBALS.c;
		var properTime = this.n * INIT.timeStep * M / c;
		var gamma;
		if (! NEWTON.collided) {
			NEWTON.rDisplay.innerHTML = (M * NEWTON.r).toExponential(3);
			NEWTON.phiDisplay.innerHTML = GLOBALS.phiDegrees(NEWTON.phi);
			NEWTON.tDisplay.innerHTML = properTime.toExponential(2);
			NEWTON.vDisplay.innerHTML = GLOBALS.speed(NEWTON).toExponential(3);
		}
		if (! GR.collided) {
			gamma = GR.tDot;
			GR.tDisplay.innerHTML = (M * GR.t / c).toExponential(2);
			GR.rDisplay.innerHTML = (M * GR.r).toExponential(3);
			GR.phiDisplay.innerHTML = GLOBALS.phiDegrees(GR.phi);
			GR.tauDisplay.innerHTML = properTime.toExponential(2);
			GR.tDotDisplay.innerHTML = gamma.toFixed(3);
			GR.rDotDisplay.innerHTML = GR.rDot.toFixed(3);
			GR.phiDotDisplay.innerHTML = (GR.phiDot / M).toFixed(3);
			GR.vDisplay.innerHTML = (GLOBALS.speed(GR) / gamma).toExponential(3);
		}
	},
	pointX: function (r, phi) {
		return this.originX + r * Math.cos(phi);
	},
	pointY: function (r, phi) {
		return this.originY + r * Math.sin(phi);
	},
	plotRotation: function () {
		var canvas = this.tracks;
		var blank = this.blankSize;
		var phiBH, X, Y;
		var radius = 0.7 * INIT.M * this.scale * INIT.horizon;
		this.phiBH += INIT.deltaPhi;
		phiBH = this.phiBH;
		X = this.pointX(radius, phiBH);
		Y = this.pointY(radius, phiBH);
		canvas.clearRect(this.X - blank, this.Y - blank, 2 * blank, 2 * blank);
		canvas.fillStyle = this.RED;
			canvas.beginPath();
			canvas.arc(X, Y, 2, 0, GLOBALS.TWOPI, true);
			canvas.closePath();
		canvas.fill();
		this.X = X;
		this.Y = Y;
	},
	plotOrbit: function (canvas, model) {
		var X, Y, tracksCanvas;
		var blank = this.blankSize;
		var r = model.r * INIT.M * this.scale;
		var phi = model.phi;
		var xOld = model.X;
		var yOld = model.Y;
		var colour = model.colour;
		X = this.pointX(r, phi);
		Y = this.pointY(r, phi);
		canvas.clearRect(xOld - blank, yOld - blank, 2 * blank, 2 * blank);
		canvas.fillStyle = colour;
			canvas.beginPath();
			canvas.arc(X, Y, this.ballSize, 0, GLOBALS.TWOPI, true);
			canvas.closePath();
		canvas.fill();
		if (this.showTracks) {
			tracksCanvas = this.tracks;
			tracksCanvas.strokeStyle = colour;
				tracksCanvas.beginPath();
				tracksCanvas.moveTo(xOld, yOld);
				tracksCanvas.lineTo(X, Y);
			tracksCanvas.stroke();
		}
		model.X = X;
		model.Y = Y;
	},
	energyBar: function () {
		var canvas = DISPLAY.bgPotential;
		canvas.strokeStyle = this.BLACK;
			canvas.beginPath();
			canvas.moveTo(Math.floor(INIT.horizon * INIT.M * this.scale), this.potentialY);
			canvas.lineTo(this.originX, this.potentialY);
		canvas.stroke();
	},
	plotPotential: function (model) {
		var canvas = model.fgPotential;
		var colour = model.colour;
		var blank = this.blankSize;
		var energyBar = this.potentialY;
		var v = energyBar + this.pScale * this.pSize * (model.energyBar - model.V(model.r));
		var scaledMass = INIT.M * this.scale;
		var r = model.r * scaledMass;
		var dBerror = GLOBALS.dB(GLOBALS.h(model), model.h0);
		canvas.clearRect(model.rOld * scaledMass - blank, energyBar - blank, 2 * blank, v + 2 * blank);
		// Potential dropline
		canvas.strokeStyle = colour;
			canvas.beginPath();
			canvas.moveTo(r, v);
			canvas.lineTo(r, energyBar);
		canvas.stroke();
		// Potential ball
		canvas.fillStyle = dBerror < -120.0 ? colour : dBerror < -90.0 ? this.YELLOW : dBerror < -60.0 ? this.ORANGE : this.RED;
			canvas.beginPath();
			canvas.arc(r, energyBar, this.ballSize, 0, GLOBALS.TWOPI, true);
			canvas.closePath();
		canvas.fill();
	},
	plotTauDot: function (model) {
		var canvas = model.fgPotential;
		var colour = this.MAGENTA;
		var tDotValue;
		var xValue = DISPLAY.pSize - 5;
		// dTau/dt plot for GR
		tDotValue = DISPLAY.pSize / model.tDot;
		canvas.clearRect(xValue - 3, 0, xValue + 3, DISPLAY.pSize);
		canvas.fillStyle = colour;
			canvas.beginPath();
			canvas.arc(xValue, tDotValue, this.ballSize, 0, GLOBALS.TWOPI, true);
			canvas.closePath();
		canvas.fill();
		canvas.strokeStyle = colour;
			canvas.beginPath();
			canvas.moveTo(xValue, DISPLAY.pSize);
			canvas.lineTo(xValue, tDotValue);
		canvas.stroke();
	},
	potential: function (model) {
		var canvas = DISPLAY.bgPotential;
		var i;
		canvas.strokeStyle = model.colour;
		canvas.beginPath();
		for (i = Math.floor(INIT.horizon * this.scale); i < this.pSize; i += 1) {
			canvas.lineTo(i, this.potentialY + this.pScale * this.pSize * (model.energyBar - model.V(i / (INIT.M * this.scale))));
		}
		canvas.stroke();
	},
	isco: function () {
		var a = INIT.a;
		var z1 = 1.0 + Math.pow(1.0 - a * a, 1.0 / 3.0) * (Math.pow(1.0 + a, 1.0 / 3.0) + Math.pow(1.0 - a, 1.0 / 3.0));
		var z2 = Math.sqrt(3.0 * a * a + z1 * z1);
		if (GLOBALS.prograde) {
			return 3.0 + z2 - Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
		} else {
			return 3.0 + z2 + Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
		}
	},
};

