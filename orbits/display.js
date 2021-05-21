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
    ORANGE: "#ff4000",
    WHITE: "#ffffff",
    GREY: "#a0a0a0",
    n: 0,
    ballSize: 3,
    blank: 4,
    potentialY: 100,
    phiBH: 0.0,
    pointX: function (r, phi) {
        return this.originX + r * Math.cos(phi);
    },
    pointY: function (r, phi) {
        return this.originY + r * Math.sin(phi);
    },
    line: function (canvas, colour, x1, y1, x2, y2) {
        canvas.strokeStyle = colour;
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.stroke();
    },
    ball: function (canvas, colour, x, y, radius) {
        canvas.fillStyle = colour;
        canvas.beginPath();
        canvas.arc(x, y, radius, 0, GLOBALS.TWOPI, true);
        canvas.closePath();
        canvas.fill();
    },
    circle: function (canvas, colour, x, y, radius) {
        canvas.strokeStyle = colour;
        canvas.beginPath();
        canvas.arc(x, y, radius, 0, GLOBALS.TWOPI, true);
        canvas.closePath();
        canvas.stroke();
    },
    circularGradient: function (canvas, x, y, innerColour, outerColour) {
        var grd = canvas.createRadialGradient(x, y, 0, x, y, Math.sqrt(x * x + y * y));
        grd.addColorStop(0, innerColour);
        grd.addColorStop(1, outerColour);
        canvas.fillStyle = grd;
        canvas.fillRect(0, 0, 2 * x, 2 * y);
    },
    linearGradient: function (canvas, x, y, innerColour, outerColour) {
        var grd = DISPLAY.bgPotential.createLinearGradient(0, 0, DISPLAY.pSize, 0);
        grd.addColorStop(0, innerColour);
        grd.addColorStop(1, outerColour);
        DISPLAY.bgPotential.fillStyle = grd;
        DISPLAY.bgPotential.fillRect(0, 0, DISPLAY.pSize, DISPLAY.pSize);
    },
    varTable: function () {
        var M = GLOBALS.M;
        var c = GLOBALS.c;
        var properTime = this.n * GLOBALS.timeStep * M / c;
        if (! NEWTON.collided) {
            NEWTON.rDisplay.innerHTML = (M * NEWTON.r).toFixed(3);
            NEWTON.phiDisplay.innerHTML = GLOBALS.phiDegrees(NEWTON.phi);
            NEWTON.tDisplay.innerHTML = properTime.toFixed(1);
            NEWTON.vDisplay.innerHTML = NEWTON.speed().toFixed(6);
        }
        if (! GR.collided) {
            GR.tDisplay.innerHTML = (M * GR.t / c).toFixed(1);
            GR.rDisplay.innerHTML = (M * GR.r).toFixed(3);
            GR.phiDisplay.innerHTML = GLOBALS.phiDegrees(GR.phi);
            GR.tauDisplay.innerHTML = properTime.toFixed(1);
            GR.tDotDisplay.innerHTML = GR.tDot.toFixed(3);
            GR.rDotDisplay.innerHTML = GR.rDot.toFixed(3);
            GR.phiDotDisplay.innerHTML = (GR.phiDot / M).toFixed(3);
            GR.vDisplay.innerHTML = GR.speed().toFixed(6);
        }
    },
    plotRotation: function () {
        var phiBH, X, Y;
        var radius = GLOBALS.radius(GLOBALS.Rs) * this.scale;
        this.phiBH += GLOBALS.deltaPhi(GLOBALS.Rs);
        phiBH = this.phiBH;
        X = this.pointX(radius, phiBH);
        Y = this.pointY(radius, phiBH);
        this.tracks.clearRect(this.X - this.blank, this.Y - this.blank, 2 * this.blank, 2 * this.blank);
        this.ball(this.tracks, this.WHITE, X, Y, 2);
        this.X = X;
        this.Y = Y;
    },
    errorColour: function (model) {
        var error = GLOBALS.dB(GLOBALS.h(model), model.h0);
        return error < -120.0 ? model.colour : (error < -90.0 ? this.YELLOW : (error < -60.0 ? this.ORANGE : this.RED));
    },
    plotOrbit: function (model) {
        var r = GLOBALS.radius(model.r) * GLOBALS.M * this.scale;
        var X = this.pointX(r, model.phi);
        var Y = this.pointY(r, model.phi);
        model.fg.clearRect(model.X - this.blank, model.Y - this.blank, 2 * this.blank, 2 * this.blank);
        this.ball(model.fg, this.errorColour(model), X, Y, this.ballSize);
        if (this.showTracks) {
            this.line(this.tracks, model.colour, model.X, model.Y, X, Y);
        }
        model.X = X;
        model.Y = Y;
    },
    energyBar: function () {
        this.line(DISPLAY.bgPotential, this.BLACK, Math.floor(GLOBALS.horizon * GLOBALS.M * this.scale), this.potentialY, this.originX, this.potentialY);
    },
    canvasPotential: function (model, r) {
        return this.potentialY + this.pScale * this.pSize * (model.energyBar - model.V(r));
    },
    plotPotential: function (model) {
        var v = this.canvasPotential(model, model.r);
        var r = GLOBALS.radius(model.r) * GLOBALS.M * this.scale;
        model.fgPotential.clearRect(GLOBALS.radius(model.rOld) * GLOBALS.M * this.scale - this.blank, this.potentialY - this.blank, 2 * this.blank, v + 2 * this.blank);
        this.line(model.fgPotential, model.colour, r, v, r, this.potentialY);
        this.ball(model.fgPotential, this.errorColour(model), r, this.potentialY, this.ballSize);
    },
    plotSpeed: function (model) {  // dTau/dt plot for GR
        var xValue = DISPLAY.pSize - 5;
        var tDotValue = DISPLAY.pSize * (1.0 - model.speed());
        model.fgPotential.clearRect(xValue - 3, 0, xValue + 3, DISPLAY.pSize);
        this.line(model.fgPotential, model.colour, xValue, DISPLAY.pSize, xValue, tDotValue);
        this.ball(model.fgPotential, model.colour, xValue, tDotValue, this.ballSize);
    },
    potential: function (model) {
        var i, r;
        DISPLAY.bgPotential.strokeStyle = model.colour;
        DISPLAY.bgPotential.beginPath();
        for (i = this.pSize; i > 0; i -= 1) {
            r = i / (GLOBALS.M * this.scale);
            DISPLAY.bgPotential.lineTo(i, this.canvasPotential(model, Math.sqrt(r * r - GLOBALS.a * GLOBALS.a)));
        }
        DISPLAY.bgPotential.stroke();
    },
};
