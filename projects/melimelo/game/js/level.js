
function generateLevel (scene, round) {

	var cables = [];
	var cableCount = 1 + round;
	var lineLength = 30;

	var aspect = [window.innerWidth/window.innerHeight,window.innerHeight/window.innerWidth];

	if (window.innerWidth > window.innerHeight) {
		aspect[1] = 1;
	} else {
		aspect[0] = 1;
	}

	for (var c = 0; c < cableCount; ++c) {
		var cable = new Cable();
		var salt = Math.random();
		lineLength += 2*round;
		for (var i = 0; i < lineLength; ++i) {
			var a = i*(.3+.1*salt);
			var r = .4+((lineLength-i)/lineLength)*(.005+.01*salt);
			var x = Math.cos(a)*r/aspect[0];
			var y = Math.sin(a)*r/aspect[1];
			cable.points.push([x+salt*.1, y-salt*.1,0]);
		}
		cable.setup();
		cables.push(cable);
		scene.add(cable.mesh);
	}

	var outlets = [];
	var outletCount = cableCount+1;

	var dimension = 8;
	var grid = [];
	for (var g = 0; g < dimension*dimension; ++g) {
		grid.push(g);
	}
	grid = shuffle(grid);
	for (var c = 0; c < outletCount; ++c) {
		var outlet = new Outlet();
		var x = ((grid[c]%dimension)/dimension)*2.-1.;
		var y = (Math.floor(grid[c]/dimension)/dimension)*2.-1.;
		x /= aspect[0];
		y /= aspect[1];
		outlet.target = [x*.8, y*.8, 0];
		outlet.num = c;
		outlets.push(outlet);
		scene.add(outlet);
	}

	return { cables: cables, outlets: outlets };
}

function resetLevel (scene, level) {
	level.cables.forEach(function(cable){
		scene.remove(cable.mesh);
	})
	level.outlets.forEach(function(outlet){
		scene.remove(outlet);
	})
}