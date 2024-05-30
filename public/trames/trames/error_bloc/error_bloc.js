(function() {
	return {
		slug: "error_bloc",
		name: "Error Diffusion Bloc",
		description: "Error Diffusion Bloc",
		author: "",
		url_info: "",

		shader: "trames/error_bloc/error_bloc.frag",

		settings: [
		],

		start: function(engine)
		{
			engine.state =
			{
				label: null,
				update: false,
				read: null,
				array: null,
				image: null,
				buffer: null,
				width: 0,
				height: 0,
			}

			engine.state.update = true;
		},

		update: function(engine)
		{
			const gl = engine.gl;
			const frame = engine.frame;
			const shader = engine.shader;
			const rect = engine.rect;
			
			// use lutted image
			const image = frame.lutted.attachments[0];
			
			const state = engine.state;

			if (state.update)
			{
				// init
				let width = rect.input.width;
				let height = rect.input.height;
		
				if (state.buffer == null || state.width != width || state.height != height)
				{
					state.width = width;
					state.height = height;
		
					state.read = new Uint8Array(width*height*4);
					state.array = new Uint8Array(width*height);
				
					state.buffer = twgl.createFramebufferInfo(gl,
					[{
						format: gl.RGBA,
					}], width, height);
				}
				
				// draw image in buffer
				engine.uniforms.image = image;
				engine.draw(shader.draw, state.buffer.framebuffer, rect.input);
		
				// read buffer to array
				gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, state.read);

				// bake result
				let src = new Float32Array(width*height);
				let dest = new Float32Array(width*height);
				for (let i = 0; i < width*height; ++i) {
					let value = state.read[i*4] / 255;
					src[i] = value;
					dest[i] = value + Math.random() - 0.5 > 0.5 ? 1 : 0;
				}
				let w = new Worker("trames/error_bloc/error_bloc_worker.js");
				w.postMessage([ src, dest, width, height ]);
				w.onmessage = (e) => { 
					state.image = twgl.createTexture(gl,
					{
						src: e.data,
						format: gl.LUMINANCE,
						minMag: gl.NEAREST,
						flipY: false,
						width: width,
						height: height,
					})
				}

				state.update = false;
			}

			// draw result
			engine.uniforms.image = state.image;
			engine.draw(shader.draw, null, rect.panzoom);
		},

		reset: function(engine, settings)
		{
			if (settings === undefined) return;

			let current = settings[0].value;
			engine.state.label = settings[0].all_values[current].label_en;
			engine.state.update = true;
		},
	}
});