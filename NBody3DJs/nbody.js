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
    step: 0,
    error: 0.0,
    particles: [],
};

function initialize () {
    GLOBALS.H0 = hamiltonian();  // initial value
    GLOBALS.Hmin = GLOBALS.H0;
    GLOBALS.Hmax = GLOBALS.H0;
    GLOBALS.wFwd = 1.0 / (4.0 - 4.0**(1.0 / 9.0));
    GLOBALS.xFwd = 1.0 / (4.0 - 4.0**(1.0 / 7.0));
    GLOBALS.yFwd = 1.0 / (4.0 - 4.0**(1.0 / 5.0));
    GLOBALS.zFwd = 1.0 / (4.0 - 4.0**(1.0 / 3.0));
    GLOBALS.wBack = 1.0 - 4.0 * GLOBALS.wFwd;
    GLOBALS.xBack = 1.0 - 4.0 * GLOBALS.xFwd;
    GLOBALS.yBack = 1.0 - 4.0 * GLOBALS.yFwd;
    GLOBALS.zBack = 1.0 - 4.0 * GLOBALS.zFwd;
    switch(GLOBALS.order) {
        case 2:
            GLOBALS.integrator = secondOrder;
            break;
        case 4:
            GLOBALS.integrator = fourthOrder;
            break;
        case 6:
            GLOBALS.integrator = sixthOrder;
            break;
        case 8:
            GLOBALS.integrator = eightthOrder;
            break;
        case 10:
            GLOBALS.integrator = tenthOrder;
            break;
        default:
            break;
    }
}

function suzuki (base, s, forward, back) {
    base(s * forward);
    base(s * forward);
    base(s * back);
    base(s * forward);
    base(s * forward);
}

function base2 (c) { // 2nd-order symplectic building block
    updateQ(c * 0.5);
    updateP(c);
    updateQ(c * 0.5);
}

function secondOrder (h) {
    base2(h);
}

function base4 (s) {
    suzuki(base2, s, GLOBALS.zFwd, GLOBALS.zBack)
}

function fourthOrder (h) {
    base4(h);
}

function base6 (s) {
    suzuki(base4, s, GLOBALS.yFwd, GLOBALS.yBack)
}

function sixthOrder (h) {
    base6(h);
}

function base8 (s) {
    suzuki(base6, s, GLOBALS.xFwd, GLOBALS.xBack)
}

function eightthOrder (h) {
    base8(h);
}

function base10 (s) {
    suzuki(base8, s, GLOBALS.wFwd, GLOBALS.wBack)
}

function tenthOrder (h) {
    base10(h);
}

function cog () {
    b = GLOBALS.particles;
    var X = Y = Z = mT = 0.0, a;
    for (i = 0; i < GLOBALS.particles.length; i += 1) {
        X += b[i].Qx * b[i].mass;
        Y += b[i].Qy * b[i].mass;
        Z += b[i].Qz * b[i].mass;
        mT += b[i].mass;
    }
    return {
        X: X / mT,
        Y: Y / mT,
        Z: Z / mT
    };
}

function distance (xA, yA, zA, xB, yB, zB) {
    return Math.sqrt((xB - xA) * (xB - xA) + (yB - yA) * (yB - yA) + (zB - zA) * (zB - zA));
}

function hamiltonian () {
    var a, b, i, j, energy = 0.0;
    b = GLOBALS.particles;
    for (i = 0; i < GLOBALS.particles.length; i += 1) {
        energy += 0.5 * (b[i].Px * b[i].Px + b[i].Py * b[i].Py + b[i].Pz * b[i].Pz) / b[i].mass;
        for (j = 0; j < GLOBALS.particles.length; j += 1) {
            if (i > j) {
                energy -= GLOBALS.g * b[i].mass * b[j].mass / distance(b[i].Qx, b[i].Qy, b[i].Qz, b[j].Qx, b[j].Qy, b[j].Qz);
            }
        }
    }
    return energy;
}

function updateQ (c) {
    var a, i, tmp;
    b = GLOBALS.particles;
    for (i = 0; i < GLOBALS.particles.length; i += 1) {
        tmp = c / b[i].mass;
        b[i].Qx += b[i].Px * tmp;
        b[i].Qy += b[i].Py * tmp;
        b[i].Qz += b[i].Pz * tmp;
    }
}

function updateP (c) {
    var a, b, i, j, tmp, dPx, dPy, dPz;
    b = GLOBALS.particles;
    for (i = 0; i < GLOBALS.particles.length; i += 1) {
        for (j = 0; j < i; j += 1) {
            d = distance(b[i].Qx, b[i].Qy, b[i].Qz, b[j].Qx, b[j].Qy, b[j].Qz)
            tmp = - c * GLOBALS.g * b[i].mass * b[j].mass / (d * d * d);
            dPx = (b[j].Qx - b[i].Qx) * tmp;
            dPy = (b[j].Qy - b[i].Qy) * tmp;
            dPz = (b[j].Qz - b[i].Qz) * tmp;
            b[i].Px -= dPx;
            b[i].Py -= dPy;
            b[i].Pz -= dPz;
            b[j].Px += dPx;
            b[j].Py += dPy;
            b[j].Pz += dPz;
        }
    }
}
