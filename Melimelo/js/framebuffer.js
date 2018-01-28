
function FrameBuffer (options) {
	options = options || {};
	this.renderTextures = [];
	this.currentIndex = 0;
	this.count = options.count || 2;
	for (var i = 0; i < this.count; ++i) {
		this.renderTextures.push(new THREE.WebGLRenderTarget(
			options.width || window.innerWidth,
			options.height || window.innerHeight, {
			format: options.format || THREE.RGBAFormat,
			type: options.type || THREE.UnsignedByteType,
			minFilter: options.min || THREE.LinearFilter,
			magFilter: options.mag || THREE.LinearFilter,
			stencilBuffer: options.stencil || true,
			depthBuffer: options.depth || true
		}));
	}

	this.getRenderTarget = function() {
		return this.renderTextures[this.currentIndex];
	}

	this.getTexture = function() {
		return this.renderTextures[this.currentIndex].texture;
	}

	this.swap = function() {
		this.currentIndex = (this.currentIndex + 1) % this.count;
	}

	this.setSize = function(width, height) {
		for (var i = 0; i < this.count; ++i) {
			this.renderTextures[i].setSize(width, height);
		}
	}
}