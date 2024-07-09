(function() {
	return {
		slug: "dbscpp",
		name: "C++ Direct Binary Search",
		description: "C++ Direct Binary Search",
		author: "",
		url_info: "",

		worker: "trames/error_diffusion/dbscpp.worker.js",
		packed: true,

		settings: [
		],

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
				let packed_width = (Math.ceil(width / 8) + 15) & ~15;
				let height = rect.input.height;

				if (state.buffer == null || state.width != width || state.height != height)
				{
					state.width = width;
					state.packed_width = packed_width;
					state.height = height;

					Module._free(state.readptr);
					state.readptr = Module._malloc(width * height * 4);
					state.read = Module.HEAPU8.subarray(state.readptr, state.readptr + width * height * 4);

					Module._free(state.arrayptr);
					state.arrayptr = Module._malloc(packed_width * height);
					state.array = Module.HEAPU8.subarray(state.arrayptr, state.arrayptr + packed_width * height);

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

				// Call C++
				Module.ccall('dbs', 'void',
					['number', 'number', 'number', 'number', 'number'],
					[state.readptr, state.width, state.arrayptr, state.packed_width, state.height]);

				state.image = twgl.createTexture(gl,
				{
					src: state.array,
					format: gl.RED_INTEGER,
					internalFormat: gl.R8UI,
					minMag: gl.NEAREST,
					flipY: false,
					width: state.packed_width,
					height: height,
				});

				state.update = false;
			}

			// draw result
			engine.uniforms.image = state.image;
			engine.draw(shader.unpack, null, rect.panzoom);
		},
	}
});