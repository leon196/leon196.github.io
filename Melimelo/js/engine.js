
var PI2 = Math.PI/2.;

window.onload = function () {

	var frameElapsed = 0;
	var elapsed = 0;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
	camera.position.z = 5;
	var level, cursor, ui;
	var round = 0;

	load(setup);

	function setup () {

		document.body.style.cursor = 'none';

		level = generateLevel(scene, round);

	 	cursor = new Cursor();
	 	scene.add(cursor);

	 	ui = new UI();
	 	scene.add(ui);

		document.addEventListener('keydown', Keyboard.onKeyDown);
  	document.addEventListener('keyup', Keyboard.onKeyUp);
  	document.addEventListener('mousemove', Mouse.onMove);
  	document.addEventListener('mousedown', Mouse.onMouseDown);
  	document.addEventListener('mouseup', Mouse.onMouseUp);

		requestAnimationFrame( update );
	}

	function checkGlobalConnexion(start, connected){
		connected.push(start);
		for(var i = 0; i< start.neighbors.length; i++){
			if(connected.indexOf(start.neighbors[i]) == -1){
				connected = checkGlobalConnexion(start.neighbors[i], connected);
			}
		}
		return connected;
	}
	function update (elapsed) {

		elapsed *= .01;
		var delta = Math.max(0, Math.min(1, elapsed - frameElapsed));
		var mousex = (Mouse.x/window.innerWidth)*2.-1.;
		var mousey = (1.-Mouse.y/window.innerHeight)*2.-1.;
		var lastMouseX = (Mouse.lastX/window.innerWidth)*2.-1.;
		var lastMouseY = (1.-Mouse.lastY/window.innerHeight)*2.-1.;
		var mouse = [mousex, mousey, 0];
		cursor.uniforms.mouse.value = mouse;
		cursor.setDefault();

		var colliding = [];
		if (cursor.drag) {
			if (Mouse.down) {
				cursor.setGrab();
				level.cables[cursor.selected].move(mouse, delta);
				// level.cables[selected].checkCollision(level.cables);
			
			} else {
				cursor.drag = false;
				// level.cables[cursor.selected].slide([mousex-lastMouseX, mousey-lastMouseY]);
			}
		}

		for (var c = 0; c < level.cables.length; ++c) {

			// hit test
			var pointSelected = level.cables[c].hitTest(mouse);
			if (!cursor.drag && pointSelected != -1) {
				cursor.setHover();
				// grab
				if (Mouse.down) {
					cursor.drag = true;
					cursor.selected = c;
					level.cables[c].selected = pointSelected;
				}
			}

			var plugs = level.cables[c].plugs;

			for (var p = 0; p < plugs.length; ++p) {
				var outlets = level.outlets;

				var plugged = false;
				var outletTarget = [0,0,0];
				for (var o = 0; o < outlets.length; ++o) {
					if (outlets[o].hitTestCircle(plugs[p].target[0], plugs[p].target[1], plugs[p].size)) {
						plugged = true;
						outletTarget = outlets[o].target;
						outlets[o].addNeighBor(level.cables[c].getOtherSide(plugs[p]));
						plugs[p].outlet = outlets[o];
						break;
					} else {
						if(outlets[o].neighbors != []){
							outlets[o].rmNeighBor(level.cables[c].getOtherSide(plugs[p]));
						}
						plugs[p].outlet = null;
					}
				}
				var connexions = checkGlobalConnexion(outlets[0], []);
				if(connexions.length == outlets.length){
					console.log("ON a gagné !!! ");
				}

				if (plugged) {
					plugs[p].ratio = Math.min(1, plugs[p].ratio + .01);
					var points = level.cables[c].points;
					var index = p*(points.length-1);
					// level.cables[c].move(outletTarget, delta);
					points[index][0] = lerp(points[index][0], outletTarget[0], .1);
					points[index][1] = lerp(points[index][1], outletTarget[1], .1);
					// level.cables[c].selected = index;
				} else {
					plugs[p].ratio = Math.max(0, plugs[p].ratio - .01);
				}
			}

			// if(plugA.ratio >= 1	&& plugB.ratio >=1){
			// 	console.log("wouhou bravo");
			// }

			level.cables[c].update(elapsed, delta);

			// if(plugA.ratio >= 1	&& plugB.ratio >=1){
			// 	console.log("wouhou bravo");
			// }
		}

		for (var o = 0; o < level.outlets.length; ++o) {
			level.outlets[o].updateUniforms(elapsed);
		}

		renderer.render( scene, camera );
		frameElapsed = elapsed;
		requestAnimationFrame( update );
	}

}