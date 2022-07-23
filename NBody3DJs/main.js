/*jslint white: true, browser: true, safe: true */

//"use strict";

var container, stats;
var camera, scene, renderer, group, particle, grid;
var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var scale = 100.0;
init();
animate();

function init() {
    const ONETHIRD = 1.0 / 3.0;
    const PI2 = Math.PI * 2;

    eightBody();
    initialize();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 12000 );
    camera.position.y = - GLOBALS.gridSize;
    camera.position.z = GLOBALS.gridSize;

    scene = new THREE.Scene();

    var program = function ( context ) {
        context.beginPath();
        context.arc( 0, 0, 1, 0, PI2, true );
        context.closePath();
        context.fill();
    }

    group = new THREE.Object3D();
    scene.add( group );

    // Particles
    for (i = 0; i < GLOBALS.particles.length; i += 1) {
        a = GLOBALS.particles[i];
        a.radius = (a.mass / GLOBALS.density)**ONETHIRD;
        particle = new THREE.Particle( new THREE.ParticleCanvasMaterial({ color: a.colour, program: program }));
        particle.position.x = scale * a.Qx;
        particle.position.y = scale * a.Qy;
        particle.position.z = scale * a.Qz;
        particle.scale.x = particle.scale.y = particle.scale.z = GLOBALS.ballScale * a.mass**ONETHIRD;
        group.add(particle);
    }

    // Grid
    var N = GLOBALS.gridN;
    var W = H = GLOBALS.gridSize;
    var grid = new THREE.Mesh(new THREE.PlaneGeometry(N * W, N * H, N, N), new THREE.MeshBasicMaterial({ color: GLOBALS.DARKGREY, wireframe: true }));
    grid.rotation.z = PI2;
    scene.add(grid);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    document.addEventListener( 'mousedown', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function touch () {
    if ( event.touches.length === 1 ) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function onDocumentTouchStart( event ) {
    touch();
}

function onDocumentTouchMove( event ) {
    touch();
}

function animate() {
    requestAnimationFrame( animate );
    update_scene();
    renderer.render( scene, camera );
    stats.update();
}

function update_scene() {
    const MIN_ERROR = 1.0e-18;
    var particle, hNow, dH;

    camera.position.x += ( mouseX - 0.5 * camera.position.x ) * 1.0;
    camera.position.y += ( - mouseY - 0.5 * camera.position.y ) * 1.0;
    camera.lookAt( scene.position );

    // simulate . . .
    GLOBALS.integrator(GLOBALS.ts);
    var centre = cog();
    for (i = 0; i < GLOBALS.particles.length; i += 1) {
        particle = GLOBALS.particles[i];
        group.children[i].position.x = scale * (particle.Qx - centre.X);
        group.children[i].position.y = scale * (particle.Qy - centre.Y);
        group.children[i].position.z = scale * (particle.Qz - centre.Z);
    }

    // monitor Hamiltonian
    if (GLOBALS.debug) {
        if (GLOBALS.step % 100 === 0) {
            hNow = hamiltonian();
            dH = Math.abs(hNow - GLOBALS.H0);
            if (hNow < GLOBALS.Hmin) {
                GLOBALS.Hmin = hNow;
            } else if (hNow > GLOBALS.Hmax) {
                GLOBALS.Hmax = hNow;
            }
            console.log("t: " + (GLOBALS.step * GLOBALS.ts).toFixed(0) +
                        ", H:" + hNow.toExponential(6) + ", H0:" + GLOBALS.H0.toExponential(6) +
                        ", H-:" + GLOBALS.Hmin.toExponential(6) + ", H+:" + GLOBALS.Hmax.toExponential(6) +
                        ", ER:" + (10.0 * Math.log(dH > MIN_ERROR ? dH : MIN_ERROR) / Math.log(10.0)).toFixed(1));
        }
    }
    GLOBALS.step += 1;
}
