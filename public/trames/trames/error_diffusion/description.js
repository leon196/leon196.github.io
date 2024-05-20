(function() {
	return {
		slug: "error_diffusion",
		name: "Error Diffusion",
		description: "Error Diffusion",
		author: "",
		url_info: "",

		shader: "trames/error_diffusion/error_diffusion.frag",

		getKernel: function(algoName)
		{
			let mat = [[ -1, 1]];
			 
			switch (algoName)
			{
				case "Simple 1D":
					mat = 
					[[ -1, 1]];
					break;

				case "Simple 2D":
					mat =
					[[ -1,    1/2.],
					 [  1/2.,    0]];
					break;

				case "Atkinson":
					mat =
					[[   0.,   -1, 1./8, 1./8],
					 [ 1./8, 1./8, 1./8,   0.],
					 [   0., 1./8,   0.,   0.]]
					break;

				case "Sierra24":
					mat = 
					[[    0.,    0.,    -1, 5./32, 3./32],
					 [ 2./32, 4./32, 5./32, 4./32, 2./32],
					 [    0., 2./32, 3./32, 2./32,    0.]]
					break;

				case "Floyd Steinberg":
					mat = 
					[[    0.,    -1, 7./16],
					 [ 3./16, 5./16, 1./16]]
					break;
			}
			return mat;
		},

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
				uniform: "edge",
				process_to_uniform: x => x ? 1 : 0,
				should_reset_buffer: true,
				gradient_view: { bypass: false }
			},
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

			const current = this.settings[0].value;
			engine.state.label = this.settings[0].all_values[current].label_en;
			engine.state.update = true;
		},

		update: function(engine)
		{
			const gl = engine.gl;
			const frame = engine.frame;
			const shader = engine.shader;
			const rect = engine.rect;

			// pre process image (apply LUT)
			engine.uniforms.image = engine.media.image;
			engine.draw(shader.lut, frame.lutted.framebuffer, rect.input);
			
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
		
				// kernel
				const kernel = this.getKernel(state.label);

				// bake result
				const result = this.apply(state.read, width, height, kernel);
				state.image = twgl.createTexture(gl,
				{
					src: result,
					format: gl.LUMINANCE,
					minMag: gl.NEAREST,
					// mag: gl.NEAREST,
					flipY: false,
					width: width,
					height: height,
				})

				state.update = false;
			}

			// draw result
			engine.uniforms.image = state.image;
			engine.draw(shader.draw, null, rect.panzoom);
		},
		
		apply: function(src, w, h, mat)
		{
			let serpentine = this.settings[1].value;

			// javascript equivalent of python functions
			const range = (w) => [...Array(w).keys()]
			const repeat = (w, v) => Array(w).fill(v)
			const matrix = (w,h,v) => Array(h).fill(Array(w).fill(v))
			const getI = (x,y,w) => (x + y * w) * 4
			const setI = (x,y,w) => (x + y * w)
			const range2 = (start, stop, step) => 
			{
				let a = [];
				let i = start;
				while (i != stop)
				{
					a.push(i);
					i += step;
				}
				return a;
			}
		
			// by Sam Hocevar from libcaca.py
			let dest = new Uint8Array(w*h);
			let lines = mat.length;
			let rows = mat[0].length;
			let offset = mat[0].indexOf(-1);
			let ey = matrix(w + rows - 1, lines, 0);
			let width_range = range(w);
			let serp_range = range2(w - 1, -1, -1);

			for (let y = 0; y < h; ++y)
			{
				let ex = repeat(rows-offset,0);
				let xrange = width_range;
				if (serpentine && (y & 1 == 1)) xrange = serp_range;

				for (let xr = 0; xr < w; ++xr)
				{
					let x = xrange[xr];
					let c = src[getI(x,y,w)] + ex[0] + ey[0][x + offset]
					let d = c > 125 ? 255 : 0;
					dest[setI(x,y,w)] = d
					let error = c - d;
					for (let dx = 0; dx < rows - offset - 2; ++dx)
						ex[dx] = ex[dx + 1] + error * mat[0][offset + 1 + dx]
					ex[rows - offset - 2] = error * mat[0][rows - 1]
					
					if (serpentine && (y & 1) == 1)
						for (let dy = 1; dy < lines; ++dy)
							for (let dx = 0; dx < rows; ++dx)
								ey[dy][x + dx] += error * mat[dy][rows - 1 - dx]
					else
						for (let dy = 1; dy < lines; ++dy)
							for (let dx = 0; dx < rows; ++dx)
								ey[dy][x + dx] += error * mat[dy][dx]

				}
				for (let dy = 0; dy < lines - 1; ++dy)
					ey[dy] = ey[dy + 1]
				ey[lines - 1] = repeat(w + rows - 1, 0)
			}
				
			return dest;
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