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

var GLOBALS = {
    debug: false,
    TWOPI: 2.0 * Math.PI,
    LOG10: Math.log(10.0),
    rSolar: 700000000.0,
    ergosphere: 2.0,
    dB: function (val, ref) {
        return 10.0 * Math.log(Math.abs((val - ref) / ref)) / this.LOG10;
    },
    radius: function (r) {
        return Math.sqrt(r * r + this.a * this.a);
    },
    deltaPhi: function (r) {  // omega = - g_t_phi / g_phi_phi
        return this.Rs * this.a * this.c / (r * r * r + (r + this.Rs) * this.a * this.a) * this.timeStep;
    },
    phiDegrees: function (phiRadians) {
        return (phiRadians * 360.0 / this.TWOPI % 360).toFixed(0) + "&deg;";
    },
    phiDMS: function (phiRadians) {
        var totalDegrees = phiRadians * 360.0 / this.TWOPI;
        var circularDegrees = totalDegrees - Math.floor(totalDegrees / 360.0) * 360;
        var minutes = (circularDegrees - Math.floor(circularDegrees)) * 60;
        var seconds = (minutes - Math.floor(minutes)) * 60;
        return circularDegrees.toFixed(0) + "&deg;" + minutes.toFixed(0) + "&#39;" + seconds.toFixed(0) + "&#34;";
    },
    h: function (model) {  // the radial "Hamiltonian"
        return 0.5 * model.rDot * model.rDot + model.V(model.r);
    },
    photonSphere: function (a) {
        if (this.prograde) {
            return 2.0 * (1.0 + Math.cos(2.0 / 3.0 * Math.acos(- Math.abs(a))));
        } else {
            return 2.0 * (1.0 + Math.cos(2.0 / 3.0 * Math.acos(Math.abs(a))));
        }
    },
    isco: function (a) {
        var z1 = 1.0 + Math.pow(1.0 - a * a, 1.0 / 3.0) * (Math.pow(1.0 + a, 1.0 / 3.0) + Math.pow(1.0 - a, 1.0 / 3.0));
        var z2 = Math.sqrt(3.0 * a * a + z1 * z1);
        if (this.prograde) {
            return 3.0 + z2 - Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
        } else {
            return 3.0 + z2 + Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
        }
    },
    solve: function (model) {  // Generalized symplectic integrator
        var i, M, r, phiDegrees, tmp, h;
        var rOld = model.rOld = model.r;
        var direction = model.direction;
        var h0 = model.h0;
        SYMPLECTIC.method(model, this.timeStep);
        r = model.r;
        if (((r > rOld) && (direction < 0)) || ((r < rOld) && (direction > 0))) {
            phiDegrees = this.phiDMS(model.phi);
            M = this.M;
            if (direction === -1) {
                model.rMinDisplay.innerHTML = (M * r).toFixed(3);
                model.pDisplay.innerHTML = phiDegrees;
                this.debug && console.log(model.name + ": Perihelion");
            } else {
                model.rMaxDisplay.innerHTML = (M * r).toFixed(3);
                model.aDisplay.innerHTML = phiDegrees;
                this.debug && console.log(model.name + ": Aphelion");
            }
            model.direction = - direction;
            h = this.h(model);
            this.debug && console.log("H0: " + h0.toExponential(6) + ", H: " + h.toExponential(6) + ", E: " + this.dB(h, h0).toFixed(1) + "dBh0");
        }
    },
    update: function (model) {
        if (model.r > this.horizon) {
            this.solve(model);
        } else {
            model.collided = true;
            this.debug && console.info(model.name + " - collided\n");
        }
    },
    getFloatById: function (id) {
        return parseFloat(document.getElementById(id).value);
    },
    getHtmlValues: function () {
        this.debug && console.info("Restarting . . . ");
        this.timeStep = this.getFloatById('timestep');
        this.lFac = this.getFloatById('lfactor') / 100.0;
        this.c = this.getFloatById('c');
        this.G = this.getFloatById('G');
        this.M = this.getFloatById('mass') * this.G / (this.c * this.c);
        this.Rs = 2.0 * this.M;
        this.debug && console.info(this.name + ".M: " + this.M.toFixed(3));
        this.r = this.getFloatById('radius') / this.M;
        this.debug && console.info(this.name + ".r: " + this.r.toFixed(1));
        this.a = this.getFloatById('spin');
        this.debug && console.info(this.name + ".a: " + this.a.toFixed(1));
        this.order = this.getFloatById('order');
        this.debug && console.info(this.name + ".order: " + this.order);
        this.a >= 0.0 ? this.prograde = true : this.prograde = false;
        this.horizon = 1.0 + Math.sqrt(1.0 - this.a * this.a);
        this.debug && console.info(this.name + ".horizon: " + this.horizon.toFixed(3));
    },
    initialize: function (model) {
        model.collided = false;
        model.r = this.r;
        model.rOld = this.r;
        model.phi = 0.0;
        model.direction = - 1.0;
    },
};

var NEWTON = {
    name: "NEWTON",
    initialize: function (a, lFac, debug) {
        var V0;
        this.circular(this.r);
        debug && console.info(this.name + ".L: " + this.L.toFixed(3));
        this.L2 = this.L * this.L;
        this.energyBar = this.V(this.r);
        debug && console.info(this.name + ".energyBar: " + this.energyBar.toFixed(6));
        this.L = this.L * lFac;
        this.L2 = this.L * this.L;
        V0 = this.V(this.r); // using (possibly) adjusted L from above
        this.rDot = - Math.sqrt(2.0 * (this.energyBar - V0));
        this.h0 =  0.5 * this.rDot * this.rDot + V0;
    },
    speed: function () {
        return Math.sqrt(this.rDot * this.rDot + this.r * this.r * this.phiDot * this.phiDot);
    },
    circular: function (r) {  // L for a circular orbit of r
        this.L = Math.sqrt(r);
    },
    V: function (r) {  // the Effective Potential
        return - 1.0 / r + this.L2 / (2.0 * r * r);
    },
    updateQ: function (c) {  // update radial position
        this.r += c * this.rDot;
        this.phiDot = this.L / (this.r * this.r);
        this.phi += c * this.phiDot;
    },
    updateP: function (c) {  // update radial momentum
        var r2 = this.r * this.r;
        this.rDot -= c * (1.0 / r2 - this.L2 / (r2 * this.r));
    },
};

var GR = { // can be spinning
    name: "GR",
    initialize: function (a, lFac, debug) {
        var V0;
        this.circular(this.r, a);
        debug && console.info(this.name + ".L: " + this.L.toFixed(12));
        debug && console.info(this.name + ".E: " + this.E.toFixed(12));
        this.intermediates(this.L, this.E, a);
        this.energyBar = this.V(this.r);
        debug && console.info(this.name + ".energyBar: " + this.energyBar.toFixed(6));
        this.L = this.L * lFac;
        this.intermediates(this.L, this.E, a);
        this.t = 0.0;
        this.tDot = 1.0;
        V0 = this.V(this.r); // using (possibly) adjusted L from above
        this.rDot = - Math.sqrt(2.0 * (this.energyBar - V0));
        this.h0 =  0.5 * this.rDot * this.rDot + V0;
    },
    speed: function () {
        return Math.sqrt(1.0 - 1.0 / (this.tDot * this.tDot));
    },
    circular: function (r, a) {  // L and E for a circular orbit of r
        var sqrtR = Math.sqrt(r);
        var tmp = Math.sqrt(r * r - 3.0 * r + 2.0 * a * sqrtR);
        this.L = (r * r - 2.0 * a * sqrtR + a * a) / (sqrtR * tmp);
        this.E = (r * r - 2.0 * r + a * sqrtR) / (r * tmp);
    },
    intermediates: function (L, E, a) {
        this.k1 = L * L - a * a * (E * E - 1.0);
        this.k2 = (L - a * E) * (L - a * E);
        this.a2 = a * a;
        this.twoAE = 2.0 * a * E;
        this.twoAL = 2.0 * a * L;
    },
    V: function (r) {  // the Effective Potential
        return - 1.0 / r + this.k1 / (2.0 * r * r) - this.k2 / (r * r * r);
    },
    updateQ: function (c) {  // update radial position
        this.r += c * this.rDot;
        var r2 = this.r * this.r;
        var delta = r2 + this.a2 - 2.0 * this.r;
        this.tDot = ((r2 + this.a2 * (1.0 + 2.0 / this.r)) * this.E - this.twoAL / this.r) / delta;
        this.t += c * this.tDot;
        this.phiDot = ((1.0 - 2.0 / this.r) * this.L + this.twoAE / this.r) / delta;
        this.phi += c * this.phiDot;
    },
    updateP: function (c) {  // update radial momentum
        var r2 = this.r * this.r;
        this.rDot -= c * (1.0 / r2 - this.k1 / (r2 * this.r) + 3.0 * this.k2 / (r2 * r2));
    },
};
