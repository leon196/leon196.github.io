(function() {
	return {
		slug: "reaction_diffusion",
		name: "Reaction Diffusion",
		description: "Reaction Diffusion",
		author: "",
		url_info: "",

		feedback_frames: 120,

		settings: [
			{
				label_fr: "Parameter F",
				label_en: "Parameter F",
				slug: "parameter_f",
				type: "slider",
				min: 1,
				max: 100,
				value: 50,
				step: 1,
				uniform: "parameter_f",
				process_to_uniform: x => x/100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Thin",
				label_en: "Thin",
				slug: "thin",
				type: "slider",
				min: 10,
				max: 50,
				value: 20,
				step: 1,
				uniform: "thin",
				process_to_uniform: x => (60-x)/100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Dynamic K",
				label_en: "Dynamic K",
				slug: "dynamic_k",
				type: "checkbox",
				value: false,
				uniform: "dynamic_k",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Parameter K",
				label_en: "Parameter K",
				slug: "parameter_k",
				type: "slider",
				min: 1,
				max: 100,
				value: 50,
				step: 1,
				uniform: "parameter_k",
				process_to_uniform: x => x/100,
				gradient_view: { bypass: false }
			},
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

			
			const gl = engine.gl;
			const attachments = engine.attachments;
            twgl.resizeFramebufferInfo(gl, engine.frame.read, attachments, engine.width, engine.height);
            twgl.resizeFramebufferInfo(gl, engine.frame.write, attachments, engine.width, engine.height);
		},

		update(engine, oncomplete)
		{
			const gl = engine.gl;
			const frames = [engine.frame.read, engine.frame.write];
			const read = frames[(engine.tick)%2];
			const write = frames[(engine.tick+1)%2];
	
			if (engine.tick < engine.trame.feedback_frames)
			{
				// feedback buffer
				engine.settings.image = engine.frame.lut.attachments[0];
				engine.settings.tick = engine.tick;
				engine.settings.resolution = [engine.width, engine.height];
				engine.settings.feedback = read.attachments[0];
				engine.tick += 1;
				engine.draw(engine.material.feedback, engine.mesh.quad, write.framebuffer, [0, 0, engine.width, engine.height]);
	
				// preview
				engine.settings.image = write.attachments[0];
				engine.draw(engine.material.trame, engine.mesh.quad, engine.frame.trame.framebuffer, [0, 0, engine.width, engine.height]);
				emitter.emit('force_update', this);
			}
			else
			{
				// end feedback
				engine.state.trame = true;
				emitter.emit('loading_stop');
				if (oncomplete != undefined) oncomplete();
			}
		},
	}
});