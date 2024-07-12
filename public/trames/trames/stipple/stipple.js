(function() {
	return {
		slug: "stipple",
		name: "Stipple",
		description: "Stipple",
		author: "",
		url_info: "",

		particles_count: 100000,
		feedback_frames: 120,

		settings: [
			{
				label_fr: "Atomic Size",
				label_en: "Atomic Size",
				slug: "atomic_size",
				type: "slider",
				min: 1,
				max: 30,
				value: 20,
				step: 1,
				uniform: "atomic_size",
				process_to_uniform: x => x/1000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Particle Size",
				label_en: "Particle Size",
				slug: "particle_size",
				type: "slider",
				min: 1,
				max: 20,
				value: 20,
				step: 1,
				uniform: "particle_size",
				process_to_uniform: x => x/100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Fixed Size",
				label_en: "Fixed Size",
				slug: "fixed_size",
				type: "checkbox",
				value: false,
				uniform: "fixed_size",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Seuil",
				label_en: "Threshold",
				slug: "threshold",
				type: "slider",
				min: 1,
				max: 100,
				value: 70,
				step: 1,
				uniform: "threshold",
				process_to_uniform: x => x/100,
				gradient_view: { bypass: false }
			},
		],

		start(engine)
		{
			const gl = engine.gl;
			const width = engine.width;
			const height = engine.height;
			const attachments = engine.attachments;

			const particles = this.get_particles(engine, engine.trame.particles_count);

			engine.mesh.particles = twgl.createBufferInfoFromArrays(gl, particles);
			engine.frame.particles = twgl.createFramebufferInfo(gl, attachments, width, height);
			engine.frame.particles_render = twgl.createFramebufferInfo(gl, attachments, width, height);

			const dim = Math.sqrt(engine.trame.particles_count);
			engine.frame.read = twgl.createFramebufferInfo(gl, attachments, dim, dim);
			engine.frame.write = twgl.createFramebufferInfo(gl, attachments, dim, dim);

			engine.load_shaders({
				feedback: ["shaders/rect.vert", "trames/stipple/stipple.simulation.frag"],
				particles: ["trames/stipple/stipple.particles.vert", "trames/stipple/stipple.particles.frag"],
				particles_render: ["trames/stipple/stipple.particles.vert", "trames/stipple/stipple.particles.render.frag"],
				trame: ["shaders/rect.vert", "trames/stipple/stipple.render.frag"],
			}, () => {
				engine.state.trame = false;
				engine.tick = 0;
			});
			
            // twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, dim, dim);
            // twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, dim, dim);
		},

		update(engine, oncomplete)
		{
			if (engine.material.particles == undefined
			||  engine.material.particles_render == undefined) return;

			const frames = [engine.frame.read, engine.frame.write];
			const read = frames[(engine.tick)%2];
			const write = frames[(engine.tick+1)%2];
			const dim = Math.sqrt(this.particles_count);
	
			if (engine.tick < engine.trame.feedback_frames)
			{
				// feedback buffer
				engine.settings.image = engine.frame.lut.attachments[0];
				engine.settings.particles = engine.frame.particles.attachments[0];
				engine.settings.tick = engine.tick;
				engine.settings.resolution = [engine.width, engine.height];
				engine.settings.feedback = read.attachments[0];
				engine.draw(engine.material.feedback, engine.mesh.quad, write.framebuffer, [0, 0, dim, dim]);
	
				engine.tick += 1;
				
				// particles draw with areas for simulation
				engine.settings.image = frames[engine.tick%2].attachments[0];
				this.drawAdditive(engine, engine.material.particles, engine.mesh.particles, engine.frame.particles.framebuffer, [0, 0, engine.width, engine.height]);

				// particles draw for rendering
				engine.draw(engine.material.particles_render, engine.mesh.particles, engine.frame.particles_render.framebuffer, [0, 0, engine.width, engine.height]);
				
				// final print
				engine.settings.image = engine.frame.particles_render.attachments[0]; 
				engine.draw(engine.material.trame, engine.mesh.quad, engine.frame.trame.framebuffer, [0, 0, engine.width, engine.height]);
	
				emitter.emit('force_update', engine);
			}
			else
			{
				// // particles draw
				// engine.settings.image = frames[engine.tick%2].attachments[0]; 
				// engine.draw(engine.material.particles, engine.mesh.particles, frames[(engine.tick+1)%2].framebuffer, [0, 0, engine.width, engine.height]);
				
				// // final print
				// engine.settings.image = frames[(engine.tick+1)%2].attachments[0]; 
				// engine.draw(engine.material.trame, engine.mesh.quad, engine.frame.trame.framebuffer, [0, 0, engine.width, engine.height]);
	
				// end feedback
				engine.state.trame = true;
				emitter.emit('loading_stop');
				if (oncomplete != undefined) oncomplete();
			}
		},

		stop(engine)
		{
		},

		drawAdditive(engine, material, mesh, buffer, rect)
		{
			const gl = engine.gl;
			gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
			gl.viewport(rect[0], rect[1], rect[2], rect[3]);
			gl.useProgram(material.program);
			gl.clearColor(0,0,0,0)
			gl.enable(gl.BLEND);
			gl.disable(gl.DEPTH_TEST);
			gl.blendFunc(gl.ONE, gl.ONE);
			// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.clear(gl.COLOR_BUFFER_BIT);
			twgl.setBuffersAndAttributes(gl, material, mesh);
			twgl.setUniforms(material, engine.settings);
			twgl.drawBufferInfo(gl, mesh);
		},

		set_size(engine)
		{
			const gl = engine.gl;
			const attachments = engine.attachments;
			const dim = Math.sqrt(this.particles_count);
			const w = engine.width;
			const h = engine.height;

            twgl.resizeFramebufferInfo(gl, engine.frame.particles, attachments, w, h);
            twgl.resizeFramebufferInfo(gl, engine.frame.particles_render, attachments, w, h);
            twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, dim, dim);
            twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, dim, dim);
		},

		get_particles(engine)
		{
			const triangles = [0, 3, 1, 3, 0, 2];
			const coordinates = [-1,-1, 1,-1, -1,1, 1,1];
	
			// Generated attributes
			const pos = [];
			const uvs = [];
			const ids = [];
			const indices = [];
			// const dim = Math.sqrt(count);
			const ratio = this.particles_count / (engine.width * engine.height);
			const w = engine.width * ratio;
			const h = engine.height * ratio;
	
			for (let quad = 0; quad < this.particles_count; ++quad)
			{
				const position = [(quad % w)/(w-1), Math.floor(quad/w)/(h-1), 0];
				const q = [quad / (this.particles_count - 1), quad];
				
				for (let v = 0; v < 4; ++v)
				{
					pos.push(position[0]);
					pos.push(position[1]);
					pos.push(position[2]);
					uvs.push(coordinates[v*2+0]);
					uvs.push(coordinates[v*2+1]);
					ids.push(q[0]);
					ids.push(q[1]);
				}
	
				// Triangle indices
				for (let i = 0; i < triangles.length; ++i)
				{
					indices.push(quad * 4 + triangles[i]);
				}
			}
	
			return {
				position: { numComponents: 3, data: pos },
				texcoord: { numComponents: 2, data: uvs },
				quantity: { numComponents: 2, data: ids },
				indices: { numComponents: 3, data: new Uint32Array(indices)},
			};
		},

	}
})