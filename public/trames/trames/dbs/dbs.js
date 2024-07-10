(function() {
	return {
		slug: "dbs",
		name: "Direct Binary Search",
		description: "Direct Binary Search",
		author: "",
		url_info: "",

		settings: [
		],

		worker: "trames/dbs/dbs.worker.js",
		
		start(engine)
		{
            engine.state.trame = false;
		},

		update(engine)
		{
			const gl = engine.gl;
			const width = engine.width;
			const height = engine.height;
	
			if (engine.worker != undefined)
			{
				engine.worker.terminate();
			}
			
			engine.worker = new Worker(engine.trame.worker);
			engine.worker.onmessage = (e) => 
			{
				const array = e.data.array;
				const width = e.data.width;
				const height = e.data.height;
				engine.media.worker = twgl.createTexture(gl, {
					src: array,
					format: gl.LUMINANCE,
					minMag: gl.NEAREST,
					flipY: false,
					width: width,
					height: height,
				});
				emitter.emit('loading_stop');
			}
	
			// export settings for worker
			const settings = {};
			for (const [key, item] of Object.entries(engine.settings)) {
				let value = item;
				if (typeof value === 'number') {
					settings[key] = value;
				}
			}
	
			const read = new Uint8Array(width*height*4);
			const array = new Uint8Array(width*height);
			const buffer = twgl.createFramebufferInfo(gl, [{ format: gl.RGBA }], width, height);
	
			// draw image in buffer
            engine.settings.image = engine.frame.lut.attachments[0];
			engine.draw(engine.material.blit, engine.mesh.quad, buffer.framebuffer, [0, 0, width, height]);
	
			// read buffer to array
			gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, read);
	
			// prepare data
			for (let i = 0; i < width*height; ++i) array[i] = read[i*4];
	
			engine.worker.postMessage({
				array: array, 
				width: width,
				height: height,
				settings: settings,
			});
			
            engine.state.trame = true;
		},

		get_result(engine)
		{
			return engine.media.worker;
		},
	}
});