
function Plug () {

	this.target = [0,0];
	this.size = .05;
	this.angle = 0.;
	this.ratio = 0.;
	this.outlet = null;
	this.uniforms = {
		time: { value: 0 },
		resolution: { value: [window.innerWidth, window.innerHeight] },
		target: { value: this.target },
		size: { value: this.size },
		angle: { value: this.angle },
		ratio: { value: this.ratio },
		sprite: { value: textures['plug'] },
	};
	var material = new THREE.ShaderMaterial({
		vertexShader: shaders['plug.vert'],
		fragmentShader: shaders['plug.frag'],
		uniforms: this.uniforms,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
	})
	// material.blending = THREE.CustomBlending;
	// material.blendEquation = THREE.MaxEquation;
	// material.blendSrc = THREE.SrcAlphaFactor;
	// material.blendDst = THREE.OneMinusDstAlphaFactor;
	THREE.Mesh.call(this, new THREE.PlaneGeometry(1, 1), material);

	this.updateUniforms = function (elapsed) {
		this.uniforms.time.value = elapsed;
		this.uniforms.target.value = this.target;
		this.uniforms.size.value = this.size;
		this.uniforms.angle.value = this.angle;
		this.uniforms.ratio.value = this.ratio;
	}
}

Plug.prototype = Object.create(THREE.Mesh.prototype)
Plug.prototype.constructor = Plug

