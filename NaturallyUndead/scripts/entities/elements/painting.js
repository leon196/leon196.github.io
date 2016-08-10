
function Painting (bufferArray, vertexShader)
{
	bufferArray = bufferArray || createQuads(gl, 128, 128, { x: 0.5, y: 0 });
	Entity.call(this, bufferArray, assets[vertexShader || "painting.vert"], assets["painting.frag"], {
		u_opticalFlow: 0,
		u_videoResolution: [1,1],
		u_resolution: [1,1],
		u_video: 0,
		u_size: [0.06, 0.2],
		// u_texture: twgl.createTexture(gl, { src: "assets/images/leaf.png", flipY: true })
	});

	this.draw = function (video, camera, time)
	{
		if (video.isReady()) 
		{
			this.shader.uniforms.u_time = time;
			this.shader.uniforms.u_video = video.uniforms.u_video;
			this.shader.uniforms.u_view = camera.viewProjection;
			this.shader.uniforms.u_resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight];
			this.shader.uniforms.u_videoResolution = [video.element.videoWidth, video.element.videoHeight];

			gl.useProgram(this.shader.program);
			twgl.setBuffersAndAttributes(gl, this.shader.info, this.buffer);
			twgl.setUniforms(this.shader.info, this.shader.uniforms);
			twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer);
		}
	};

	this.setSize = function (value)
	{
		this.shader.uniforms.u_size = value;
	};
}

Painting.prototype = Object.create(Entity.prototype);
Painting.prototype.constructor = Painting;