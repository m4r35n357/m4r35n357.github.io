/*jslint white: true, browser: true, safe: true */

//"use strict";

GLOBALS = {
	debug: true,
	BLACK: "#000000",
	WHITE: "#ffffff",
	GREY: "#808080",
	DARKGREY: "#404040",
	PALEGREY: "#c0c0c0",
	RED: "#ff0000",
	GREEN: "#00ff00",
	BLUE: "#0000ff",
	YELLOW: "#808000",
	PURPLE: "#800080",
	CYAN: "#008080",
	scale: 0.2,
	n: 0,
	error: 0.0,
	particles: [],
	CUBEROOT2: Math.pow(2.0, 1.0 / 3.0),
};

function initialize () {
	GLOBALS.np = GLOBALS.particles.length;
	GLOBALS.H0 = hamiltonian();  // initial value
	GLOBALS.Hmin = GLOBALS.H0;
	GLOBALS.Hmax = GLOBALS.H0;
	GLOBALS.error = 0.0;
	switch(GLOBALS.order) {
	    case 2:
                GLOBALS.coefficients = [1.0];
	        break;
	    case 4:
		var y = 1.0 / (2.0 - GLOBALS.CUBEROOT2);
		GLOBALS.coefficients = [y, - GLOBALS.CUBEROOT2 * y];
	        break;
	    case 6:
                GLOBALS.coefficients = [0.78451361047755726381949763,
					0.23557321335935813368479318,
					-1.17767998417887100694641568,
					1.31518632068391121888424973];
	        break;
	    case 8:
                GLOBALS.coefficients = [0.74167036435061295344822780,
					-0.40910082580003159399730010,
					0.19075471029623837995387626,
					-0.57386247111608226665638773,
					0.29906418130365592384446354,
					0.33462491824529818378495798,
					0.31529309239676659663205666,
					-0.79688793935291635401978884];
	        break;
	    case 10:
                GLOBALS.coefficients = [0.09040619368607278492161150,
					0.53591815953030120213784983,
					0.35123257547493978187517736,
					-0.31116802097815835426086544,
					-0.52556314194263510431065549,
					0.14447909410225247647345695,
					0.02983588609748235818064083,
					0.17786179923739805133592238,
					0.09826906939341637652532377,
					0.46179986210411860873242126,
					-0.33377845599881851314531820,
					0.07095684836524793621031152,
					0.23666960070126868771909819,
					-0.49725977950660985445028388,
					-0.30399616617237257346546356,
					0.05246957188100069574521612,
					0.44373380805019087955111365];
	        break;
	    default:
                GLOBALS.coefficients = [1.0];
	        break;
	} 
}

function cog () {
	var a;
	var X = 0.0;
	var Y = 0.0;
	var Z = 0.0;
	var mT = 0.0;
	for (i = 0; i < GLOBALS.np; i += 1) {
		a = GLOBALS.particles[i];
		X += a.Qx * a.mass;
		Y += a.Qy * a.mass;
		Z += a.Qz * a.mass;
		mT += a.mass;
	}
	cogX = X / mT;
	cogY = Y / mT;
	cogZ = Z / mT;
}

function distance (xA, yA, zA, xB, yB, zB) {
	return Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2) + Math.pow(zB - zA, 2));
}

function hamiltonian () {
	var a, b, i, j;
	var totalEnergy = 0.0;
	for (i = 0; i < GLOBALS.np; i += 1) {
		a = GLOBALS.particles[i];
		totalEnergy += 0.5 * (a.Px * a.Px + a.Py * a.Py + a.Pz * a.Pz) / a.mass;
		for (j = 0; j < GLOBALS.np; j += 1) {
			if (i > j) {
				b = GLOBALS.particles[j];
				totalEnergy -= GLOBALS.g * a.mass * b.mass / distance(a.Qx, a.Qy, a.Qz, b.Qx, b.Qy, b.Qz);
			}
		}
	}
	return totalEnergy;
}

function updateQ (c) {
	var a, i, tmp;
	var N = GLOBALS.np;
	var ts = GLOBALS.ts;
	for (i = 0; i < N; i += 1) {
		a = GLOBALS.particles[i];
		tmp = c / a.mass * ts;
		a.Qx += a.Px * tmp;
		a.Qy += a.Py * tmp;
		a.Qz += a.Pz * tmp;
	}
}

function updateP (c) {
	var a, b, i, j, tmp, dPx, dPy, dPz, am, aQx, aQy, aQz, bQx, bQy, bQz;
	var N = GLOBALS.np;
	var g = GLOBALS.g;
	var ts = GLOBALS.ts;
	for (i = 0; i < N; i += 1) {
		a = GLOBALS.particles[i];
		am = a.mass;
		aQx = a.Qx;
		aQy = a.Qy;
		aQz = a.Qz;
		for (j = 0; j < N; j += 1) {
			if (i > j) {
				b = GLOBALS.particles[j];
				bQx = b.Qx;
				bQy = b.Qy;
				bQz = b.Qz;
				tmp = - c * g * am * b.mass / Math.pow(distance(aQx, aQy, aQz, bQx, bQy, bQz), 3) * ts;
				dPx = (bQx - aQx) * tmp;
				dPy = (bQy - aQy) * tmp;
				dPz = (bQz - aQz) * tmp;
				a.Px -= dPx;
				a.Py -= dPy;
				a.Pz -= dPz;
				b.Px += dPx;
				b.Py += dPy;
				b.Pz += dPz;
			}
		}
	}
}

function euler () {
	updateQ(1.0);
	updateP(1.0);
}

function sympBase (c) {
	updateQ(0.5 * c);
	updateP(c);
	updateQ(0.5 * c);
}

function solve () {  // Generalized Symplectic Integrator
	var size = GLOBALS.coefficients.length - 1;
        var i;
        for (i = 0; i < size; i += 1) {  // Composition happens in these loops
                sympBase(GLOBALS.coefficients[i]);
        }
        for (i = size; i >= 0; i -= 1) {
                sympBase(GLOBALS.coefficients[i]);
        }
}

