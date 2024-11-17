(function() {
	return {
		slug: "error_diffusion",
		name: "Error Diffusion",
		description: "Error Diffusion",
		author: "",
		url_info: "",

		worker: "trames/error_diffusion/error_diffusion.worker.js",

		settings: [
			{
				label_fr: "Algorithme",
				label_en: "Algorithme",
				slug: "algorithm",
				type: "radio",
				value: 4,
				should_reset_buffer: true,
				all_values: [{
						mode: 0,
						label_fr: "Sierra24",
						label_en: "Sierra24"
					},
					{
						mode: 1,
						label_fr: "Atkinson",
						label_en: "Atkinson"
					},
					{
						mode: 2,
						label_fr: "Simple 1D",
						label_en: "Simple 1D"
					},
					{
						mode: 3,
						label_fr: "Simple 2D",
						label_en: "Simple 2D"
					},
					{
						mode: 4,
						label_fr: "Floyd Steinberg",
						label_en: "Floyd Steinberg"
					}
				],
				uniform: "r_algorithm",
				process_to_uniform: function(input) {
					return input;
				},
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Serpentine",
				label_en: "Serpentine",
				slug: "serpentine",
				type: "checkbox",
				value: false,
				uniform: "r_serpentine",
				process_to_uniform: function(input) {
					return input ? 1 : 0;
				},
				should_reset_buffer: true,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Level of details",
				label_en: "Level of details",
				slug: "lod",
				type: "slider",
				min: 1,
				max: 20,
				value: 10,
				step: 1,
				uniform: "lod",
				process_to_uniform: x => x,
				gradient_view: { bypass: false }
			},
		],

		start(engine)
		{
            engine.state.trame = false;
		},

		update(engine, oncomplete)
		{
			const gl = engine.gl;
			const lod = engine.trame.settings[2].value;
			const format = engine.settings.format;
			const width = Math.floor(format[0] / lod);
			const height = Math.floor(format[1] / lod);
	
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
				if (oncomplete != undefined) oncomplete();
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