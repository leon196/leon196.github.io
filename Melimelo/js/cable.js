
function Cable (count) {

	this.lineMaxLength = .1;
	this.lineMinLength = .075;
	this.lineAngle = .31;
	this.minAngle = .75;
	this.damping = .5;
	this.hitArea = .1;
	this.velocity = [0,0,0];
	this.velocityFriction = .9;
	this.velocitySpeed = .2;
	this.target = [0,0,0];
	this.selected = 0;

	this.uniforms = {
		time: { value: 0 },
		colorA: { value: [1,1,1] },
		colorB: { value: [1,1,1] },
		ratioA: { value: 0 },
		ratioB: { value: 0 },
		resolution: { value: [window.innerWidth, window.innerHeight] },
		segments: { value: count },
	};

	this.points = [];
	this.velocities = [];
	var salt = Math.random();
	for (var i = 0; i < count; ++i) {
		var a = i*(.2+.1*salt);
		var r = i*(.1+.1*salt);
		var x = Math.cos(a)*r;
		var y = Math.sin(a)*r;
		this.points.push([x+salt*.1, y-salt*.1,0]);
		this.velocities.push([0,0]);
	}
	
	var attributes = {
		position: { array: [], itemSize: 3 },
		next: { array: [], itemSize: 3 },
		prev: { array: [], itemSize: 3 },
		path: { array: [], itemSize: 1 },
	}
	for (var i = 0; i < this.points.length; ++i) {
		var next = Math.min(this.points.length-1, i+1);
		var prev = Math.max(0, i-1);
		attributes.position.array.push(this.points[i][0], this.points[i][1],0);
		attributes.next.array.push(this.points[next][0], this.points[next][1],0);
		attributes.prev.array.push(this.points[prev][0], this.points[prev][1],0);
		attributes.path.array.push(i/(this.points.length-1));
	}

	var material = new THREE.ShaderMaterial( {
		vertexShader: shaders['cable.vert'],
		fragmentShader: shaders['cable.frag'],
		uniforms: this.uniforms,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
	});
	material.blending = THREE.CustomBlending;
	material.blendEquation = THREE.AddEquation;
	material.blendSrc = THREE.SrcAlphaFactor;
	material.blendDst = THREE.OneFactor;

	this.geometry = createGeometry(attributes);
	this.mesh = new THREE.Mesh(this.geometry, material);
	this.plugs = [new Plug(), new Plug()];
	this.mesh.add(this.plugs[0], this.plugs[1]);
	
	this.hitTest = function (mouse) {
		for (var i = 0; i < this.points.length; ++i) {
			var dist = distance(this.points[i][0], this.points[i][1], mouse[0], mouse[1]);
			var area = this.hitArea;
			area += (!(i==0||i==this.points.length-1)?0:this.plugs[0].size);
			if (dist < area) {
				return i;
			}
		}
		return -1;
	}

	this.tractage = function(dir,dist){

	}

	this.getOtherSide = function(plug1){ // return outlet opposée ou null si pas plugged
		if(plug1 == this.plugs[0]){
			return this.plugs[1].outlet;
		}
		else{
			return this.plugs[0].outlet;
		}
	}
	this.follow = function(pt, sens){
		var dist = distance(this.points[pt][0], this.points[pt][1], this.points[pt+sens][0], this.points[pt+sens][1]);
		var dir = direction(this.points[pt][0], this.points[pt][1], this.points[pt+sens][0], this.points[pt+sens][1]);
		var radius = Math.min(this.lineMaxLength , Math.max(this.lineMinLength, dist));
		var before = [this.points[pt][0], this.points[pt][1]];
		this.points[pt][0] = this.points[pt+sens][0]-radius*dir[0]/dist;
		this.points[pt][1] = this.points[pt+sens][1]-radius*dir[1]/dist;
	}

	this.relax = function(index, sens, delta) {
		if (index > 0 && index < this.points.length-1) {
			var center = this.points[index];
			var prev = this.points[index+sens*-1];
			var next = this.points[index+sens];
			var centerPrev = direction(center[0], center[1], prev[0], prev[1]);
			var centerNext = direction(center[0], center[1], next[0], next[1]);
			var distCP = distance(prev[0], prev[1], center[0], center[1]);
			var distCN = distance(next[0], next[1], center[0], center[1]);
			var angleCP = Math.atan2(centerPrev[1], centerPrev[0]);
			var angleCN = Math.atan2(centerNext[1], centerNext[0]);
			var diff = Math.abs(angleCP-angleCN);
			if (diff < Math.PI*this.minAngle) {
				var speed = 1.-diff/(Math.PI*this.minAngle);
				var sns = angleCP>angleCN?-1:1;
				// var dir = [Math.cos(angleCN+delta*sns*speed), Math.sin(angleCN+delta*sns*speed)];
				var dir = [Math.cos(lerp(angleCN, angleCN+delta*sns*speed, .1)), Math.sin(lerp(angleCN, angleCN+delta*sns*speed, .1))];
				next[0] = center[0] + dir[0] * distCN;
				next[1] = center[1] + dir[1] * distCN;
				sns *= -1;
				dir = [Math.cos(lerp(angleCP, angleCP+delta*sns*speed, .1)), Math.sin(lerp(angleCP, angleCP+delta*sns*speed, .1))];
				prev[0] = center[0] + dir[0] * distCP;
				prev[1] = center[1] + dir[1] * distCP;
			}
		}
	}

	this.checkCollision = function(cables){
		var seuil = 0.05;
		for( var i = 0; i<cables.length; i++){ // Tous les cables
			if(cables[i] != this){
				for  (var j= 0; j < this.points.length-1; j++){ // Tous mes points
					for (var k= 0; k < cables[i].points.length; k++){ // Tous les points de c
						var distM = distance(this.points[j][0], this.points[j][1], this.points[j+1][0], this.points[j+1][1]);
						var centre = [distM*this.points[j][0], distM*this.points[j][1]];
						var d = distance(cables[i].points[k][0], cables[i].points[k][1] , centre[0], centre[1]);
						if( d < seuil){
							console.log("colidation");
							// return index cable + coordonnées points à bouger
						}
					}
				}	
			}
		}
	}

	this.move = function (target, delta) {
		this.target = target;
		var point = this.points[this.selected];
		this.points[this.selected][0] = lerp(point[0], target[0], this.damping);
		this.points[this.selected][1] = lerp(point[1], target[1], this.damping);
	}

	this.slide = function (velocity) {
		this.velocity[0] += velocity[0] * this.velocitySpeed;
		this.velocity[1] += velocity[1] * this.velocitySpeed;
	}

	this.update = function (elapsed, delta) {

		// var target = this.target;
		// var point = this.points[this.selected];
		// var dir = direction(point[0], point[1], target[0], target[1]);
		// var dist = distance(point[0], point[1], target[0], target[1]);
		// if (dist > .01) {
		// 	this.velocity[0] += dir[0] * this.velocitySpeed;
		// 	this.velocity[1] += dir[1] * this.velocitySpeed;
		// 	this.velocity[0] *= this.velocityFriction;
		// 	this.velocity[1] *= this.velocityFriction;
		// 	this.target[0] = lerp(this.target[0], this.target[0]+this.velocity[0], this.damping);
		// 	this.target[1] = lerp(this.target[1], this.target[1]+this.velocity[1], this.damping);
		// 	this.points[this.selected][0] = lerp(point[0], this.target[0], this.damping);
		// 	this.points[this.selected][1] = lerp(point[1], this.target[1], this.damping);
		// }
		
		this.relax(this.selected, 1, delta);
		this.relax(this.selected, -1, delta);

		for (var i = 0; i < Math.max(this.selected, this.points.length-this.selected); i++) {
			var leftd = this.selected - i-1;
			var rightd = this.selected + i+1;
			if(leftd>=0){
				this.follow(leftd,1);
				this.relax(leftd,1, delta);
			}
			if(rightd<this.points.length){
				this.follow(rightd,-1);
				this.relax(rightd,-1, delta);
			}
		}
		this.updatePlugs();
		this.updateGeometry();
		this.updateUniforms(elapsed);
	}

	this.updatePlugs = function () {
		var last = this.points.length-1;
		this.plugs[0].target = [this.points[0][0], this.points[0][1], 0];
		this.plugs[0].angle = Math.atan2(this.points[1][1] - this.points[0][1], this.points[1][0] - this.points[0][0]);
		this.plugs[1].target = [this.points[last][0], this.points[last][1], 0];
		this.plugs[1].angle = Math.atan2(this.points[last-1][1] - this.points[last][1], this.points[last-1][0] - this.points[last][0]);
	}

	this.updateGeometry = function () {
		var last = this.points.length-1;
		for (var quad = 0; quad < 4; ++quad) {
			for (var pos = 0; pos < 2; ++pos) {
				this.geometry.attributes.next.array[quad*3+pos] = this.points[0][pos];
			}
		}
		for (var point = 0; point < this.points.length; ++point) {
			var next = Math.min(this.points.length-1, point+1);
			for (var quad = 0; quad < 4; ++quad) {
				for (var pos = 0; pos < 2; ++pos) {
					this.geometry.attributes.position.array[(point*4+quad)*3+pos] = this.points[point][pos];
					this.geometry.attributes.next.array[(next*4+quad)*3+pos] = this.points[point][pos];
				}
			}
		}
		for (var quad = 0; quad < 4; ++quad) {
			var dirNext = direction(this.points[last][0], this.points[last][1], this.points[last-1][0], this.points[last-1][1]);
			for (var pos = 0; pos < 2; ++pos) {
				this.geometry.attributes.next.array[(last*4+quad)*3+pos] = this.points[last][pos]+dirNext[pos];
			}
		}
		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.next.needsUpdate = true;
	}

	this.updateUniforms = function (elapsed) {
		this.uniforms.time.value = elapsed;
		this.uniforms.ratioA.value = this.plugs[0].ratio;
		this.uniforms.ratioB.value = this.plugs[1].ratio;
		this.plugs.forEach(function(plug) {
			plug.updateUniforms(elapsed);
		});
	}
}