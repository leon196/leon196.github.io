
function Cursor () {

	this.uniforms = {
		resolution: { value: [window.innerWidth, window.innerHeight] },
		mouse: { value: [0,0,0] },
		cursorTexture: { value: textures['cursor'] },
		cursorState: { value: 0 },
	};
	var material = new THREE.ShaderMaterial({
		vertexShader: shaders['cursor.vert'],
		fragmentShader: shaders['cursor.frag'],
		uniforms: this.uniforms,
		side: THREE.DoubleSide,
		transparent: true,
	})
	THREE.Mesh.call(this, new THREE.PlaneGeometry(1, 1), material);

	this.drag = false;
	this.selected = -1;

	this.setDefault = function () {
		this.uniforms.cursorState.value = 0;
	}

	this.setHover = function () {
		this.uniforms.cursorState.value = 1;
	}

	this.setGrab = function () {
		this.uniforms.cursorState.value = 2;
	}
}

Cursor.prototype = Object.create(THREE.Mesh.prototype)
Cursor.prototype.constructor = Cursor