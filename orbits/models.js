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

var GLOBALS = {
	debug: false,
	TWOPI: 2.0 * Math.PI,
	LOG10: Math.log(10.0),
	rSolar: 700000000.0,
	ergosphere: 2.0,
	dB: function (val, ref) {
		return 10.0 * Math.log(Math.abs((val - ref) / ref)) / this.LOG10;
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
        if (GLOBALS.prograde) {
            return 2.0 * (1.0 + Math.cos(2.0 / 3.0 * Math.acos(- Math.abs(a))));
        } else {
            return 2.0 * (1.0 + Math.cos(2.0 / 3.0 * Math.acos(Math.abs(a))));
        }
	},
	isco: function (a) {
		var z1 = 1.0 + Math.pow(1.0 - a * a, 1.0 / 3.0) * (Math.pow(1.0 + a, 1.0 / 3.0) + Math.pow(1.0 - a, 1.0 / 3.0));
		var z2 = Math.sqrt(3.0 * a * a + z1 * z1);
		if (GLOBALS.prograde) {
			return 3.0 + z2 - Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
		} else {
			return 3.0 + z2 + Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
		}
	},
	suzuki: function (model, base, s, forward, back) {
       		base(model, s * forward);
       		base(model, s * forward);
	        base(model, s * back);
       		base(model, s * forward);
       		base(model, s * forward);
	},
	base2: function (model, c) { // 2nd-order symplectic building block
		model.updateQ(0.5 * c, model.rDot);
		model.updateP(c, model.r);
		model.updateQ(0.5 * c, model.rDot);
	},
	secondOrder: function (model) {
		this.base2(model, 1.0);
	},
	base4: function (model, s) {
		GLOBALS.suzuki(model, GLOBALS.base2, s, GLOBALS.zFwd, GLOBALS.zBack)
	},
	fourthOrder: function (model) {
		this.base4(model, 1.0);
	},
	base6: function (model, s) {
		GLOBALS.suzuki(model, GLOBALS.base4, s, GLOBALS.yFwd, GLOBALS.yBack)
	},
	sixthOrder: function (model) {
		this.base6(model, 1.0);
	},
	base8: function (model, s) {
		GLOBALS.suzuki(model, GLOBALS.base6, s, GLOBALS.xFwd, GLOBALS.xBack)
	},
	eightthOrder: function (model) {
		this.base8(model, 1.0);
	},
	base10: function (model, s) {
		GLOBALS.suzuki(model, GLOBALS.base8, s, GLOBALS.wFwd, GLOBALS.wBack)
	},
	tenthOrder: function (model) {
		this.base10(model, 1.0);
	},
	solve: function (model) {  // Generalized symplectic integrator
		var i, M, r, phiDegrees, tmp, h;
		var rOld = model.rOld = model.r;
		var direction = model.direction;
		var h0 = model.h0;
		this.method(model);
		r = model.r;
		if (((r > rOld) && (direction < 0)) || ((r < rOld) && (direction > 0))) {
			phiDegrees = this.phiDMS(model.phi);
			M = INIT.M;
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
	initialize: function () {
		this.wFwd = 1.0 / (4.0 - 4.0**(1.0 / 9.0))
		this.xFwd = 1.0 / (4.0 - 4.0**(1.0 / 7.0))
		this.yFwd = 1.0 / (4.0 - 4.0**(1.0 / 5.0))
		this.zFwd = 1.0 / (4.0 - 4.0**(1.0 / 3.0))
		this.wBack = 1.0 - 4.0 * this.wFwd
		this.xBack = 1.0 - 4.0 * this.xFwd
		this.yBack = 1.0 - 4.0 * this.yFwd
		this.zBack = 1.0 - 4.0 * this.zFwd
		switch(INIT.order) {
		    case 2:
		        this.method = this.secondOrder;
			break;
		    case 4:
		        this.method = this.fourthOrder;
			break;
		    case 6:
		        this.method = this.sixthOrder;
			break;
		    case 8:
		        this.method = this.eightthOrder;
			break;
		    case 10:
		        this.method = this.tenthOrder;
			break;
		    default:
		        this.method = this.eightthOrder;
			break;
		}
	},
};

var INIT = {
	name: "INIT",
	phi: 0.0,
 	direction: -1.0,
	getFloatById: function (id) {
		return parseFloat(document.getElementById(id).value);
	},
	getHtmlValues: function () {
		GLOBALS.debug && console.info("Restarting . . . ");
		this.timeStep = this.getFloatById('timestep');
		this.lFac = this.getFloatById('lfactor') / 100.0;
		GLOBALS.c = this.getFloatById('c');
		GLOBALS.G = this.getFloatById('G');
		this.M = this.getFloatById('mass') * GLOBALS.G / (GLOBALS.c * GLOBALS.c);
		GLOBALS.debug && console.info(this.name + ".M: " + this.M.toFixed(3));
		this.r = this.getFloatById('radius') / this.M;
		GLOBALS.debug && console.info(this.name + ".r: " + this.r.toFixed(1));
		this.a = this.getFloatById('spin');
		GLOBALS.debug && console.info(this.name + ".a: " + this.a.toFixed(1));
		this.order = this.getFloatById('order');
		GLOBALS.debug && console.info(this.name + ".order: " + this.order);
		this.a >= 0.0 ? GLOBALS.prograde = true : GLOBALS.prograde = false;
		this.horizon = 1.0 + Math.sqrt(1.0 - this.a * this.a);
		GLOBALS.debug && console.info(this.name + ".horizon: " + this.horizon.toFixed(3));
		this.deltaPhi = this.a / (this.horizon * this.horizon + this.a * this.a) * this.timeStep;
	},
	initialize: function (model) {
		model.collided = false;
		model.r = this.r;
		model.rOld = this.r;
		model.phi = this.phi;
		model.direction = this.direction;
	},
};

var NEWTON = {
	name: "NEWTON",
	initialize: function () {
		var V0;
		this.circular(this.r);
		GLOBALS.debug && console.info(this.name + ".L: " + this.L.toFixed(3));
		this.L2 = this.L * this.L;
		this.energyBar = this.V(this.r);
		GLOBALS.debug && console.info(this.name + ".energyBar: " + this.energyBar.toFixed(6));
		this.L = this.L * INIT.lFac;
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
	updateQ: function (c, rDot) {  // update radial position
		this.r += c * rDot * INIT.timeStep;
		this.phiDot = this.L / (this.r * this.r);
		this.phi += c * this.phiDot * INIT.timeStep;
	},
	updateP: function (c, r) {  // update radial momentum
		this.rDot -= c * (1.0 / (r * r) - this.L2 / (r * r * r)) * INIT.timeStep;
	},
	update: function () {
		if (this.r > INIT.horizon) {
			GLOBALS.solve(this);
		} else {
			this.collided = true;
			GLOBALS.debug && console.info(this.name + " - collided\n");
		}
	},
};

var GR = { // can be spinning
	name: "GR",
	initialize: function () {
		var V0;
		this.circular(this.r, INIT.a);
		GLOBALS.debug && console.info(this.name + ".L: " + this.L.toFixed(12));
		GLOBALS.debug && console.info(this.name + ".E: " + this.E.toFixed(12));
		this.intermediates(this.L, this.E, INIT.a);
		this.energyBar = this.V(this.r);
		GLOBALS.debug && console.info(this.name + ".energyBar: " + this.energyBar.toFixed(6));
		this.L = this.L * INIT.lFac;
		this.intermediates(this.L, this.E, INIT.a);
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
	updateQ: function (c, rDot) {  // update radial position
		this.r += c * rDot * INIT.timeStep;
		var r2 = this.r * this.r;
		var delta = r2 + this.a2 - 2.0 * this.r;
		this.tDot = ((r2 + this.a2 * (1.0 + 2.0 / this.r)) * this.E - this.twoAL / this.r) / delta;
		this.t += c * this.tDot * INIT.timeStep;
		this.phiDot = ((1.0 - 2.0 / this.r) * this.L + this.twoAE / this.r) / delta;
		this.phi += c * this.phiDot * INIT.timeStep;
	},
	updateP: function (c, r) {  // update radial momentum
		this.rDot -= c * (1.0 / (r * r) - this.k1 / (r * r * r) + 3.0 * this.k2 / (r * r * r * r)) * INIT.timeStep;
	},
	update: function () {
		if (this.r > INIT.horizon) {
			GLOBALS.solve(this);
		} else {
			this.collided = true;
			GLOBALS.debug && console.info(this.name + " - collided\n");
		}
	},
};

