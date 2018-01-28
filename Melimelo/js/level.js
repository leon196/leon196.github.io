
function generateLevel (scene, round) {

	var cables = [];
	var lineLength = 30 + round;
	var cableCount = 3 + round;
	for (var c = 0; c < cableCount; ++c) {
		cables.push(new Cable(lineLength+Math.round(Math.random()*(3+round))));
	}

	var outlets = [];
	var outletCount = cableCount+1;
	for (var c = 0; c < outletCount; ++c) {
		outlets.push(new Outlet());
		// var p = Math.random()*2.-1.;
		var x = Math.random()*2.-1.;//(Math.random()<.5?-1:1)*(Math.random()<.5?0:1);
		var y = Math.random()*2.-1.;//(Math.random()<.5?-1:1)*(x==0?0:1);
		outlets[c].target = [x, y, 0];
	}

	for (var i = 0; i < cables.length; ++i) {
		scene.add(cables[i].mesh);
		cables[i].move([0,0]);
	}

	for (var i = 0; i < outlets.length; ++i) {
		scene.add(outlets[i]);
	}

	return { cables: cables, outlets: outlets };
}