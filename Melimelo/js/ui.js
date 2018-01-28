
function UI () {
	
	THREE.Object3D.call(this);

	var titleTexture = textures['title'];
	var titleImage = titleTexture.image;

	var uniforms = {
		time: { value: 0 },
		resolution: { value: [window.innerWidth, window.innerHeight] },
		imageResolution: { value: [titleImage.width, titleImage.height] },
		target: { value: [0,1,0] },
		title: { value: titleTexture },
	};
	var material = new THREE.ShaderMaterial({
		vertexShader: shaders['title.vert'],
		fragmentShader: shaders['title.frag'],
		uniforms: uniforms,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
	})

	this.title = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
	this.add(this.title);

	var subtitleTexture = textures['subtitle'];
	var subtitleImage = subtitleTexture.image;

	var uniforms = {
		time: { value: 0 },
		resolution: { value: [window.innerWidth, window.innerHeight] },
		imageResolution: { value: [subtitleImage.width, subtitleImage.height] },
		target: { value: [0,-1,0] },
		subtitle: { value: subtitleTexture },
	};
	var material = new THREE.ShaderMaterial({
		vertexShader: shaders['subtitle.vert'],
		fragmentShader: shaders['subtitle.frag'],
		uniforms: uniforms,
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: false,
	})
	this.subtitle = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
	this.add(this.subtitle);
}

UI.prototype = Object.create(THREE.Object3D.prototype)
UI.prototype.constructor = UI