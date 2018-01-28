
function Cable () {

	this.lineMaxLength = .05;
	this.lineMinLength = .04;
	this.minAngle = Math.PI*.8;
	this.damping = .5;
	this.hitArea = this.lineMaxLength;
	this.velocity = [0,0,0];
	this.velocityFriction = .9;
	this.velocitySpeed = .2;
	this.target = [0,0,0];
	this.selected = 0;
	this.points = [];

	this.uniforms = {
		time: { value: 0 },
		alpha: { value: 1 },
		ratioA: { value: 0 },
		ratioB: { value: 0 },
		resolution: { value: [window.innerWidth, window.innerHeight] },
		segments: { value: 10 },
	};

	this.setup = function () {

		this.uniforms.segments.value = this.points.length;
	
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
	}
	
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
			if (diff < this.minAngle) {
				var speed = 10.*(1.-(diff/this.minAngle));
				var sns = angleCP>angleCN?-1:1;
				// var dir = [Math.cos(lerp(angleCN, angleCN+delta*sns*speed, .1)), Math.sin(lerp(angleCN, angleCN+delta*sns*speed, .1))];
				var angle = lerp(angleCN, angleCN+delta*sns*speed, .5);
				var dir = [Math.cos(angle), Math.sin(angle)];
				next[0] = center[0] + dir[0] * distCN;//lerp(next[0], center[0] + dir[0] * distCN, .5);
				next[1] = center[1] + dir[1] * distCN;//lerp(next[1], center[1] + dir[1] * distCN, .5);
				sns *= -1;
				angle = lerp(angleCP, angleCP+delta*sns*speed, .5);
				dir = [Math.cos(angle), Math.sin(angle)];
				prev[0] = center[0] + dir[0] * distCP;//lerp(prev[0], center[0] + dir[0] * distCP, .5);
				prev[1] = center[1] + dir[1] * distCP;//lerp(prev[1], center[1] + dir[1] * distCP, .5);
			}
		}
	}

	this.move = function (target, delta) {
		this.target = target;
		var point = this.points[this.selected];
		this.points[this.selected][0] = lerp(point[0], target[0], this.damping);
		this.points[this.selected][1] = lerp(point[1], target[1], this.damping);
		this.clamp(this.selected);
	}

	this.slide = function (velocity) {
		this.velocity[0] += velocity[0] * this.velocitySpeed;
		this.velocity[1] += velocity[1] * this.velocitySpeed;
	}

	this.swing = function (elapsed, delta) {
			var point = this.points[0];
			var pointNext = this.points[1];
			var speed = .05;
			var dir = direction(pointNext[0],pointNext[1],point[0],point[1]);
			var dist = distance(pointNext[0],pointNext[1],point[0],point[1]);
			var angle = Math.atan2(dir[1]/dist, dir[0]/dist);
			dir[0] = Math.cos(angle+Math.sin(elapsed)*.3);
			dir[1] = Math.sin(angle+Math.sin(elapsed)*.3);
			this.moveAt(0, [point[0]+dir[0]*speed, point[1]+dir[1]*speed, 0], delta);

			// this.moveAt(0, [point[0]+dir[0]*speed, point[1]+dir[1]*speed, 0], delta);
			this.plugs.forEach(function(plug){
				plug.size = .05+.01*Math.sin(elapsed*6.);
			})
	}

	this.clamp = function (index) {
		this.points[index][0] = Math.min(.98, Math.max(-.98, this.points[index][0]));
		this.points[index][1] = Math.min(.98, Math.max(-.98, this.points[index][1]));
	}

	this.update = function (elapsed, delta) {
		this.relax(this.selected, 1, delta);
		this.relax(this.selected, -1, delta);

		for (var i = 0; i < Math.max(this.selected, this.points.length-this.selected); i++) {
			var leftd = this.selected - i-1;
			var rightd = this.selected + i+1;
			if(leftd>=0){
				this.follow(leftd,1);
				this.relax(leftd,1, delta);
				this.clamp(leftd);
			}
			if(rightd<this.points.length){
				this.follow(rightd,-1);
				this.relax(rightd,-1, delta);
				this.clamp(rightd);
			}
		}
	}

	this.moveAt = function (index, target, delta) {
		var point = this.points[index];
		this.points[index][0] = lerp(point[0], target[0], .1);
		this.points[index][1] = lerp(point[1], target[1], .1);
		this.relax(index, 1, delta);
		this.relax(index, -1, delta);

		for (var i = 0; i < Math.max(index, this.points.length-index); i++) {
			var leftd = index - i-1;
			var rightd = index + i+1;
			if(leftd>=0){
				this.follow(leftd,1);
				this.relax(leftd,1, delta);
			}
			if(rightd<this.points.length){
				this.follow(rightd,-1);
				this.relax(rightd,-1, delta);
			}
		}
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

	this.resize = function(width, height) {
		this.uniforms.resolution.value[0] = width;
		this.uniforms.resolution.value[1] = height;
		this.plugs.forEach(function(plug) {
			plug.resize(width, height);
		});

	}
}