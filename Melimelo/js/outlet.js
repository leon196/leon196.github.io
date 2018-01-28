
function Outlet() {

	this.target = [0,-1,0];
	this.color = [1,0,0];
	this.size = .1;
	this.isFull = false;
	this.neighbors = [];
	this.uniforms = {
		time: { value: 0 },
		resolution: { value: [window.innerWidth, window.innerHeight] },
		target: { value: this.target },
		color: { value: this.color },
		size: { value: this.size },
		sprite: { value: textures['plug'] },
	};
	var material = new THREE.ShaderMaterial({
		vertexShader: shaders['outlet.vert'],
		fragmentShader: shaders['outlet.frag'],
		uniforms: this.uniforms,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
	})
	material.blending = THREE.CustomBlending;
	material.blendEquation = THREE.AddEquation;
	material.blendSrc = THREE.SrcAlphaFactor;
	material.blendDst = THREE.OneFactor;
	THREE.Mesh.call(this, new THREE.PlaneGeometry(1, 1), material);

	this.hitTestBox = function (x, y, w, h) {
		return x > this.target[0]-this.size && x < this.target[0]+this.size
				&& y > this.target[1]-this.size && y < this.target[1]+this.size;
	}

	this.addNeighBor = function(nb){
		if(nb != null && nb != this && this.neighbors.indexOf(nb)==-1){
			this.neighbors.push(nb);
		}
	}
	this.rmNeighBor = function(nb){
		var i = this.neighbors.indexOf(nb);
		this.neighbors.splice(i,1);
	}
	this.hitTestCircle = function (x, y, size) {
		var dist = distance(x,y,this.target[0],this.target[1]);
		return dist < this.size + size;
	}

	this.updateUniforms = function (elapsed) {
		this.uniforms.time.value = elapsed;
		this.uniforms.size.value = this.size;
		this.uniforms.target.value = this.target;
	}
}

Outlet.prototype = Object.create(THREE.Mesh.prototype)
Outlet.prototype.constructor = Outlet