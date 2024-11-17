(function() {
	return {
		slug: "stipple",
		name: "Stipple",
		description: "Stipple",
		author: "",
		url_info: "",

		count: 0,

		settings: [
			{
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 1,
				max: 300,
				value: 90,
				step: 1,
				unit: "lpi",
				uniform: "lineature",
				process_to_uniform: x => x,
				gradient_view: {
					bypass: true,
					default: 10
				}
			},
			{
				label_fr: "Steps",
				label_en: "Steps",
				slug: "steps",
				type: "slider",
				min: 10,
				max: 3000,
				value: 1000,
				step: 1,
				uniform: "steps",
				process_to_uniform: x => x,
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Size",
				label_en: "Size",
				slug: "size",
				type: "slider",
				min: 1,
				max: 20,
				value: 14,
				step: 1,
				uniform: "size",
				process_to_uniform: x => x / 10,
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Speed",
				label_en: "Speed",
				slug: "speed",
				type: "slider",
				min: 1,
				max: 10,
				value: 3,
				step: 1,
				uniform: "speed",
				process_to_uniform: x => x,
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Crop",
				label_en: "crop",
				slug: "crop",
				type: "checkbox",
				value: false,
				uniform: "crop",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: {
					bypass: false
				}
			},
		],

		start(engine)
		{
			const gl = engine.gl;
			const particles = this.make_particles(engine);

			const count = engine.trame.settings[0].value;
			engine.mesh.particles = twgl.createBufferInfoFromArrays(gl, particles);
			engine.trame.count = count;

			const attachments = [{
				internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
				minMag: gl.NEAREST,
				wrap: gl.CLAMP_TO_EDGE
			}];
            twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, engine.width, engine.height);
            twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, engine.width, engine.height);

			const path = "trames/stipple/";
			engine.load_shaders({
				stipple: [path+"stipple.vert", path+"stipple.frag"],
				position: ["shaders/rect.vert", path+"position.frag"],
				croped_sdf: ["shaders/rect.vert", path+"croped_sdf.frag"],
				croped_draw: ["shaders/rect.vert", path+"croped_draw.frag"],
			}, () => {
				engine.state.trame = false;
				engine.tick = 0;
			});
		},

		make_particles(engine)
		{
			const gl = engine.gl;
			const count = engine.trame.settings[0].value;
			const format = engine.settings.format;
			const width = Math.floor(format[0] * count / 1000);
			const height = Math.floor(format[1] * count / 1000);
			const attachments = [{
				internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
				minMag: gl.NEAREST,
				wrap: gl.CLAMP_TO_EDGE
			}];

			engine.frame.read_particles = twgl.createFramebufferInfo(gl, attachments, width, height);
			engine.frame.write_particles = twgl.createFramebufferInfo(gl, attachments, width, height);

			return engine.make_particles(width, height);
		},

		update(engine, oncomplete)
		{
			const steps = engine.trame.settings[1].value;
			const croped = engine.trame.settings[4].value;

			if (engine.tick < steps)
			{
				const count = engine.trame.settings[0].value;
				if (!croped && count != engine.trame.count)
				{
					const gl = engine.gl;
					const particles = this.make_particles(engine);
					engine.mesh.particles = twgl.createBufferInfoFromArrays(gl, particles);
					engine.trame.count = count;
				}

				const image = engine.frame.lut.attachments[0];
				const settings = engine.settings;
				const quad = engine.mesh.quad;
				const result = engine.frame.trame.framebuffer;
				const viewport = [0, 0, engine.width, engine.height];

				let filter = engine.material.position;
				let material = engine.material.stipple;
				let mesh = engine.mesh.particles;
				let frames = [engine.frame.read_particles, engine.frame.write_particles];
				let format = engine.settings.format;
				let width = Math.floor(format[0] * count / 1000);
				let height = Math.floor(format[1] * count / 1000);

				if (croped) 
				{
					filter = engine.material.croped_sdf;
					material = engine.material.croped_draw;
					frames = [engine.frame.read, engine.frame.write];
					width = engine.width;
					height = engine.height;
					mesh = quad;
				}

				settings.grid_dimension = [ width, height ]
				settings.resolution = [ engine.width, engine.height ];
				settings.tick = engine.tick;
				settings.last_tick = engine.trame.feedback_frames-1;

				const read = frames[(engine.tick)%2];
				const write = frames[(engine.tick+1)%2];

				settings.image = image;
				settings.position = read.attachments[0];
				
				engine.draw(filter, quad, write.framebuffer, [0, 0, width, height]);
				
				settings.image = write.attachments[0];
				engine.draw(material, mesh, result, viewport);
	
				emitter.emit('force_update', engine);
				engine.should_update = true;
				engine.tick += 1;
			}
			else
			{
				// done
				engine.state.trame = true;
				engine.should_update = false;
				emitter.emit('loading_stop');
				if (oncomplete != undefined) oncomplete();
			}
		},

	}
})