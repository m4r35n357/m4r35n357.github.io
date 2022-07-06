/*jslint white: true, browser: true, safe: true */

//"use strict";

function infall () {
    GLOBALS.order = 4;
    GLOBALS.g = 1.0;
    GLOBALS.ts = 0.01;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 2;
    GLOBALS.gridSize = 1000;
    GLOBALS.particles[0] = { colour: GLOBALS.GREEN, Qx: 3.0, Qy: 0.0, Qz: 0.0, Px: 0.0, Py:0.0, Pz: 0.0, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.RED, Qx: -3.0, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
}

function twoBody () {
    GLOBALS.order = 2;
    GLOBALS.g = 4.0;
    GLOBALS.ts = 0.1;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 2;
    GLOBALS.gridSize = 1000;
    GLOBALS.particles[0] = { colour: GLOBALS.GREEN, Qx: 0.0, Qy: 1.0, Qz: 0.0, Px: 1.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.RED, Qx: 0.0, Qy: -1.0, Qz: 0.0, Px: -1.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
}

function threeBodyFreeFallF10 () {
    GLOBALS.order = 10;
    GLOBALS.g = 1.0;
    GLOBALS.ts = 0.001;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 2;
    GLOBALS.gridSize = 1000;
    GLOBALS.particles[0] = { colour: GLOBALS.YELLOW, Qx: -0.5, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.WHITE,  Qx:  0.5, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE,   Qx: 0.3089693008, Qy: 0.4236727692, Qz: 0.0, Px: 0.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
}

function threeBodyDragonfly () {
    GLOBALS.order = 2;
    GLOBALS.g = 1.0;
    GLOBALS.ts = 0.005;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 20;
    GLOBALS.gridSize = 100;
    GLOBALS.particles[0] = { colour: GLOBALS.YELLOW, Qx: -1.0, Qy: 0.0, Qz: 0.0, Px: 0.08058, Py: 0.58884, Pz: 0.2, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.WHITE, Qx: 1.0, Qy: 0.0, Qz: 0.0, Px: 0.08058, Py: 0.58884, Pz: -0.2, mass: 1.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: 0.0, Qy: 0.0, Qz: 0.0, Px: -0.16116, Py: -1.17768, Pz: 0.0, mass: 1.0, };
}

function threeBody () {
    GLOBALS.order = 4;
    GLOBALS.g = 1.0;
    GLOBALS.ts = 0.01;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 2;
    GLOBALS.gridSize = 1000;
    GLOBALS.particles[0] = { colour: GLOBALS.YELLOW, Qx: 1.07590, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 0.19509, Pz: 0.0, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.WHITE, Qx: -0.07095, Qy: 0.0, Qz: 0.0, Px: -0.2, Py: -1.23187, Pz: 0.0, mass: 1.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: -1.00496, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 1.03678, Pz: 0.0, mass: 1.0, };
}

function fourBody () {
    GLOBALS.order = 10;
    GLOBALS.g = 3.5;
    GLOBALS.ts = 0.05;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 2;
    GLOBALS.gridSize = 1000;
    GLOBALS.particles[0] = { colour: GLOBALS.RED, Qx: 1.0, Qy: 1.0, Qz: 1.0, Px: -1.0, Py: 1.0, Pz: -1.0, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.GREEN, Qx: -1.0, Qy: -1.0, Qz: 1.0, Px: 1.0, Py: -1.0, Pz: -1.0, mass: 1.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: 1.0, Qy: -1.0, Qz: -1.0, Px: 1.0, Py: 1.0, Pz: 1.0, mass: 1.0, };
    GLOBALS.particles[3] = { colour: GLOBALS.YELLOW, Qx: -1.0, Qy: 1.0, Qz: -1.0, Px: -1.0, Py: -1.0, Pz: 1.0, mass: 1.0, };
}

function fourBodyA () {
    GLOBALS.order = 4;
    GLOBALS.g = 1.0;
    GLOBALS.ts = 0.01;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 2;
    GLOBALS.gridSize = 1000;
    GLOBALS.particles[0] = { colour: GLOBALS.RED, Qx: 0.0, Qy: -0.69548, Qz: 0.69548, Px: 0.87546, Py: -0.31950, Pz: -0.31950, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.YELLOW, Qx: 0.0, Qy: 0.69548, Qz: -0.69548, Px: 0.87546, Py: 0.31950, Pz: 0.31950, mass: 1.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: 0.0, Qy: -0.69548, Qz: -0.69548, Px: -0.87546, Py: -0.31950, Pz: 0.31950, mass: 1.0, };
    GLOBALS.particles[3] = { colour: GLOBALS.GREEN, Qx: 0.0, Qy: 0.69548, Qz: 0.69548, Px: -0.87546, Py: 0.31950, Pz: -0.31950, mass: 1.0, };
}

function outerPlanets () {
    var mass;
    GLOBALS.order = 4;
    GLOBALS.g = 2.95912208286e-4;
    GLOBALS.ts = 1.0; // in days (distances are in AUs)
    GLOBALS.ballScale = 320.0;
    GLOBALS.gridN = 40;
    GLOBALS.gridSize = 4000;
    GLOBALS.particles[0] = { colour: GLOBALS.RED, Qx: 0.0, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 0.0, Pz: 0.0, mass: 1.0, };
    mass = 0.000954786104043  // in solar masses
    GLOBALS.particles[1] = { colour: GLOBALS.GREEN, Qx: -3.5025653, Qy: -3.8169847, Qz: -1.5507963, Px: 0.00565429 * mass, Py: -0.00412490 * mass, Pz: -0.00190589 * mass, mass: mass };
    mass = 0.000285583733151  // in solar masses
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: 9.0755314, Qy: -3.0458353, Qz: -1.6483708, Px: 0.00168318 * mass, Py: 0.00483525 * mass, Pz: 0.00192462 * mass, mass: mass };
    mass = 0.0000437273164546  // in solar masses
    GLOBALS.particles[3] = { colour: GLOBALS.YELLOW, Qx: 8.3101420, Qy: -16.2901086, Qz: -7.2521278, Px: 0.00354178 * mass, Py: 0.00137102 * mass, Pz: 0.00055029 * mass, mass: mass };
    mass = 0.0000517759138449  // in solar masses
    GLOBALS.particles[4] = { colour: GLOBALS.PURPLE, Qx: 11.4707666, Qy: -25.7294829, Qz: -10.8169456, Px: 0.00288930 * mass, Py: 0.00114527 * mass, Pz: 0.00039677 * mass, mass: mass };
}

function eightBody () {
    GLOBALS.order = 10;
    GLOBALS.ts = 0.01;
    GLOBALS.g = 0.05;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 20;
    GLOBALS.gridSize = 100;
    GLOBALS.particles[0] = { colour: GLOBALS.YELLOW, Qx: 0.0, Qy: 0.0, Qz: 0.0, Px: 0.0, Py: 0.0, Pz: 0.0, mass: 100.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.WHITE, Qx: 0.0, Qy: 4.5, Qz: 0.4, Px: -0.2, Py: 0.0, Pz: 1.8, mass: 2.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: -6.0, Qy: 0.0, Qz: -0.4, Px: 0.0, Py: -2.0, Pz: 1.0, mass: 3.0, };
    GLOBALS.particles[3] = { colour: GLOBALS.GREEN, Qx: 3.0, Qy: 0.0, Qz: -0.2, Px: 0.0, Py: 5.8, Pz: -0.2, mass: 5.0, };
    GLOBALS.particles[4] = { colour: GLOBALS.DARKGREY, Qx: 0.0, Qy: -4.0, Qz: 0.1, Px: -3.6, Py: 0.0, Pz: 0.2, mass: 4.0, };
    GLOBALS.particles[5] = { colour: GLOBALS.RED, Qx: -4.0, Qy: 0.0, Qz: -0.1, Px: 0.0, Py: -0.2, Pz: -2.6, mass: 3.0, };
    GLOBALS.particles[6] = { colour: GLOBALS.CYAN, Qx: 8.0, Qy: 0.0, Qz: -0.3, Px: 0.0, Py: 2.0, Pz: -0.2, mass: 3.0, };
    GLOBALS.particles[7] = { colour: GLOBALS.PURPLE, Qx: 0.0, Qy: 4.0, Qz: -0.2, Px: -4.8, Py: 0.0, Pz: -0.2, mass: 4.0, };
}

function eightBodyA () {
    GLOBALS.order = 6;
    GLOBALS.g = 6.0;
    GLOBALS.ts = 0.01;
    GLOBALS.ballScale = 8.0;
    GLOBALS.gridN = 20;
    GLOBALS.gridSize = 100;
    GLOBALS.particles[0] = { colour: GLOBALS.RED, Qx: 1.0, Qy: 1.0, Qz: 1.0, Px: 1.0, Py: -1.0, Pz: -1.0, mass: 1.0, };
    GLOBALS.particles[1] = { colour: GLOBALS.YELLOW, Qx: -1.0, Qy: -1.0, Qz: 1.0, Px: -1.0, Py: 1.0, Pz: -1.0, mass: 1.0, };
    GLOBALS.particles[2] = { colour: GLOBALS.BLUE, Qx: 1.0, Qy: -1.0, Qz: -1.0, Px: 1.0, Py: 1.0, Pz: 1.0, mass: 1.0, };
    GLOBALS.particles[3] = { colour: GLOBALS.GREEN, Qx: -1.0, Qy: 1.0, Qz: -1.0, Px: -1.0, Py: -1.0, Pz: 1.0, mass: 1.0, };

    GLOBALS.particles[4] = { colour: GLOBALS.WHITE, Qx: -1.0, Qy: 1.0, Qz: 1.0, Px: 1.0, Py: 1.0, Pz: 1.0, mass: 1.0, };
    GLOBALS.particles[5] = { colour: GLOBALS.DARKGREY, Qx: 1.0, Qy: -1.0, Qz: 1.0, Px: -1.0, Py: -1.0, Pz: 1.0, mass: 1.0, };
    GLOBALS.particles[6] = { colour: GLOBALS.CYAN, Qx: 1.0, Qy: 1.0, Qz: -1.0, Px: -1.0, Py: 1.0, Pz: -1.0, mass: 1.0, };
    GLOBALS.particles[7] = { colour: GLOBALS.PURPLE, Qx: -1.0, Qy: -1.0, Qz: -1.0, Px: 1.0, Py: -1.0, Pz: -1.0, mass: 1.0, };
}
