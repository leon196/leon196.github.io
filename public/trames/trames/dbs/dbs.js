(function() {
	return {
		slug: "dbs",
		name: "Direct Binary Search",
		description: "Direct Binary Search",
		author: "",
		url_info: "",

		shader: "trames/dbs/dbs.frag",

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
				let src = new Uint8Array(width*height);
				let dest = new Uint8Array(width*height);
				for (let i = 0; i < width*height; ++i) {
					src[i] = state.read[i*4];
					dest[i] = src[i] / 255 + Math.random() - 0.5 > 0.5 ? 255 : 0;
				}
				for (let i = 0; i < 3; ++i) {
					dest = this.apply(src, dest, width, height);
				}
				state.image = twgl.createTexture(gl,
				{
					src: dest,
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
		
		apply: function(src, dest, w, h)
		{
			// Sam Hocevar
			// from libcaca.py

			const abs = (x) => Math.abs(x)
			const matrix = (w,h,v) => Array(h).fill(Array(w).fill(v))
			const getI = (x,y) => (x + y * w)
			const hvs = (x) => Math.pow(Math.E, - Math.sqrt(x))

			let x, y, i, j;

			const srcmat = new Float32Array(w*h);
			const destmat = new Float32Array(w*h);
			const srchvs = new Float32Array(w*h);
			const desthvs = new Float32Array(w*h);
			for (i = 0; i < w*h; ++i)
			{
				srcmat[i] = src[i] / 255;
				destmat[i] = dest[i] / 255;
			}

			const kernel = matrix(8, 8, 0.)
			for (i = 0; i < 6; ++i) {
				for (j = 0; j < 6; ++j) {
					kernel[j][i] = hvs(i * i + j * j)
				}
			}

			// # Build human perception model for both source and destination
			for (y = 0; y < h; ++y) {
				for (x = 0; x < w; ++x) {
					let srcp = 0;
					let destp = 0;
					for (j = -5; j < 6; ++j) {
						if (y + j < 0 || y + j >= h) {
							continue;
						}
						for (i = -5; i < 6; ++i) {
							if (x + i < 0 || x + i >= w) {
								continue;
							}
							const m = kernel[abs(j)][abs(i)];
							srcp += m * srcmat[getI(x + i, y + j)];
							destp += m * destmat[getI(x + i, y + j)];
						}
					}
					srchvs[getI(x, y)] = srcp;
					desthvs[getI(x, y)] = destp;
				}
			}
			
			let swaps = 0;
			let toggles = 0;
			let op = null;
			let d2 = 0;
			let dx = 0;
			let dy = 0;

			for (y = 0; y < h; ++y) {
				for (x = 0; x < w; ++x) {
					const d = destmat[getI(x, y)];
					let best = 0.;

					// # Compute the effect of a toggle

					let e = 0.;
					for (j = -5; j < 6; ++j) {
						if (y + j < 0 || y + j >= h) continue;
						for (i = -5; i < 6; ++i) {
							if (x + i < 0 || x + i >= w) continue;
							const m = kernel[abs(j)][abs(i)];
							const p = srchvs[getI(x + i, y + j)];
							const q1 = desthvs[getI(x + i, y + j)];
							const q2 = q1 - m * d + m * (1-d)
							e += abs(q1 - p) - abs(q2 - p);
						}
					}
					if (e > best) {
						best = e;
						op = null;
					}
					// # Compute the effect of swaps
					const dxs = [0, 0, -1, 1]
					const dys = [1, -1, 0, 0]
					for (let di = 0; di < 4; ++di) {
						dx = dxs[di];
						dy = dys[di];
						if (y + dy < 0 || y + dy >= h || x + dx < 0 || x + dx >= w)
							continue;
						d2 = destmat[getI(x + dx, y + dy)]
						if (d2 == d) continue;
						e = 0.
						for (j = -6; j < 7; ++j) {
							for (i = -6; i < 7; ++i) {
								if (y + j < 0 || y + j >= h || x + i < 0 || x + i >= w)
									continue;
								const ma = kernel[abs(j)][abs(i)]
								const mb = kernel[abs(j - dy)][abs(i - dx)]
								const p = srchvs[getI(x + i, y + j)]
								const q1 = desthvs[getI(x + i, y + j)]
								const q2 = q1 - ma * d + ma * d2 - mb * d2 + mb * d
								e += abs(q1 - p) - abs(q2 - p)
							}
						}
						if (e > best) {
							best = e
							op = [dx, dy]
						}
					}
					// # Apply the change if interesting
					if (best <= 0.) continue;

					if (op != null) {
						dx = op[0];
						dy = op[1];
						d2 = destmat[getI(x + dx, y + dy)]
						destmat[getI(x + dx, y + dy)] = d
					}
					else {
						d2 = 1. - d
					}
					destmat[getI(x, y)] = d2
					for (j = -5; j < 6; ++j) {
						for (i = -5; i < 6; ++i) {
							const m = kernel[abs(j)][abs(i)]
							if (y + j >= 0 && y + j < h && x + i >= 0 && x + i < w) {
								desthvs[getI(x + i, y + j)] -= m * d
								desthvs[getI(x + i, y + j)] += m * d2
							}
							if (op && y + dy + j >= 0 && y + dy + j < h && x + dx + i >= 0 && x + dx + i < w) {
								desthvs[getI(x + dx + i, y + dy + j)] -= m * d2
								desthvs[getI(x + dx + i, y + dy + j)] += m * d
							}
						}
					}
				}
			}

			for (i = 0; i < w*h; ++i) {
				dest[i] = destmat[i] * 255;
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