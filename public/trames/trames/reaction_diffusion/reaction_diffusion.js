(function() {
	return {
		slug: "reaction_diffusion",
		name: "Reaction Diffusion",
		description: "Reaction Diffusion",
		author: "",
		url_info: "",

		feedback_frames: 1000,

		settings: [
			{
				label_fr: "Size",
				label_en: "Size",
				slug: "size",
				type: "slider",
				min: 1,
				max: 10,
				value: 1,
				step: 1,
				uniform: "size",
				process_to_uniform: x => x,
				gradient_view: {
					bypass: true,
					default: 1
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
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Min K",
				label_en: "Min K",
				slug: "min_k",
				type: "slider",
				min: 550,
				max: 700,
				value: 610,
				step: 1,
				uniform: "min_k",
				process_to_uniform: x => x/10000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Max K",
				label_en: "Max K",
				slug: "max_k",
				type: "slider",
				min: 550,
				max: 700,
				value: 700,
				step: 1,
				uniform: "max_k",
				process_to_uniform: x => x/10000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Min F",
				label_en: "Min F",
				slug: "min_f",
				type: "slider",
				min: 550,
				max: 700,
				value: 681,
				step: 1,
				uniform: "min_f",
				process_to_uniform: x => x/10000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Max F",
				label_en: "Max F",
				slug: "max_f",
				type: "slider",
				min: 550,
				max: 700,
				value: 700,
				step: 1,
				uniform: "max_f",
				process_to_uniform: x => x/10000,
				gradient_view: { bypass: false }
			},
			// {
			// 	label_fr: "Thin",
			// 	label_en: "Thin",
			// 	slug: "thin",
			// 	type: "slider",
			// 	min: 10,
			// 	max: 50,
			// 	value: 50,
			// 	step: 1,
			// 	uniform: "thin",
			// 	process_to_uniform: x => (60-x)/100,
			// 	gradient_view: { bypass: false }
			// },
		],

		start(engine)
		{
			engine.load_shaders({
				trame: [
					"shaders/rect.vert",
					"trames/reaction_diffusion/reaction_diffusion_draw.frag"],
				feedback: [
					"shaders/rect.vert", 
					"trames/reaction_diffusion/reaction_diffusion_buffer.frag"]
			}, () => {
				engine.state.trame = false;
				engine.tick = 0;
			});

			let width = engine.width;
			let height = engine.height;
			const format = engine.settings.format;
			let format_width = format[0];
			let format_height = format[1];
			
			const gl = engine.gl;
			// const attachments = engine.attachments;
			const attachments = [{
				// internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
				minMag: gl.LINEAR,
				wrap: gl.CLAMP_TO_EDGE
			}];

            // twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, format_width, format_height);
            // twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, format_width, format_height);
			engine.frame.read = twgl.createFramebufferInfo(gl, attachments, format_width, format_height);
			engine.frame.write = twgl.createFramebufferInfo(gl, attachments, format_width, format_height);
			// engine.frame.upscale = twgl.createFramebufferInfo(gl, attachments, width, height);
			engine.frame.print = twgl.createFramebufferInfo(gl, attachments, width, height);
		},

		set_size(engine, width, height, format_width, format_height)
		{
			const gl = engine.gl;
			// const attachments = engine.attachments;

			const attachments = [{
				// internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
				// internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
				minMag: gl.LINEAR,
				wrap: gl.CLAMP_TO_EDGE
			}];
            twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, format_width, format_height);
            twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, format_width, format_height);
            // twgl.resizeFramebufferInfo(gl, engine.frame.upscale, attachments, width, height);
            twgl.resizeFramebufferInfo(gl, engine.frame.print, attachments, width, height);
            // twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, format_width, format_height);
            // twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, format_width, format_height);
            // twgl.resizeFramebufferInfo(gl, engine.frame.print, attachments, format_width, format_height);
		},

		update(engine, oncomplete)
		{
			const gl = engine.gl;
			const frames = [engine.frame.read, engine.frame.write];
			const read = frames[(engine.tick)%2];
			const write = frames[(engine.tick+1)%2];
			const upscale = engine.frame.upscale;

			let width = engine.width;
			let height = engine.height;
			const format = engine.settings.format;
			let format_width = format[0];
			let format_height = format[1];

			const steps = engine.trame.settings[1].value;
			// if (engine.tick < engine.trame.feedback_frames)
			if (engine.tick < steps)
			{
				// feedback buffer
				engine.settings.image = engine.frame.lut.attachments[0];
				engine.settings.tick = engine.tick;
				engine.settings.resolution = [format_width, format_height];
				engine.settings.feedback = read.attachments[0];
				engine.tick += 1;
				engine.draw(engine.material.feedback, engine.mesh.quad, write.framebuffer, [0, 0, format_width, format_height]);

				// blur
				// engine.settings.image = write.attachments[0];
				// engine.draw(engine.material.blit, engine.mesh.quad, upscale.framebuffer, [0, 0, width, height]);
	
				// render
				engine.settings.image = engine.frame.lut.attachments[0];
				// engine.settings.feedback = upscale.attachments[0];
				engine.settings.feedback = write.attachments[0];
				engine.draw(engine.material.trame, engine.mesh.quad, engine.frame.print.framebuffer, [0, 0, width, height]);
				
				// preview
				engine.settings.image = engine.frame.print.attachments[0];
				engine.draw(engine.material.blit, engine.mesh.quad, engine.frame.trame.framebuffer, [0, 0, width, height]);
				emitter.emit('force_update', this);

				engine.should_update = true;
			}
			else
			{
				// end feedback
				engine.should_update = false;
				engine.state.trame = true;
				emitter.emit('loading_stop');
				if (oncomplete != undefined) oncomplete();
			}
		},

		// get_result()
		// {
		// 	return engine.frame.trame.framebuffer.attachments[0];
		// }
	}
});