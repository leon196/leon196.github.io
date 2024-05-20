(function() {
	return {
		slug: "reaction_diffusion",
		name: "Reaction Diffusion",
		description: "Reaction Diffusion",
		author: "",
		url_info: "",
		
		shader: "trames/reaction_diffusion/reaction_diffusion_draw.frag",

		load: (engine) =>
		{
			engine.load("reactionDiffusion", "trames/reaction_diffusion/reaction_diffusion_buffer.frag");
		},

		start: (engine) =>
		{
			const gl = engine.gl;
			const frame = engine.frame;
			const size = engine.rect.output;

			engine.frame.feedback = 
			[
				twgl.createFramebufferInfo(gl, frame.options, size.width, size.height),
				twgl.createFramebufferInfo(gl, frame.options, size.width, size.height),
			];
		},

		update: (engine) =>
		{
			const frame = engine.frame;
			const shader = engine.shader;
			const rect = engine.rect;

			// pre process image (apply LUT)
			// engine.uniforms.image = engine.media.image;
			// engine.draw(shader.lut, frame.lutted.framebuffer, rect.input);
			
			// use lutted image
			engine.uniforms.image = frame.lutted.attachments[0];

			// for (let i = 0; i < 30; ++i)
			{
				// feedback buffer
				let read = frame.feedback[frame.swap];
				let write = frame.feedback[(frame.swap+1)%2];
				frame.swap = (frame.swap+1)%2;
				engine.uniforms.framebuffer = read.attachments[0];
				engine.draw(shader.reactionDiffusion, write.framebuffer, rect.output);
				engine.uniforms.tick = engine.uniforms.tick+1;
			}

			engine.uniforms.image = frame.feedback[(frame.swap+1)%2].attachments[0]; 

			// apply filter
			engine.draw(shader.filter, frame.result.framebuffer, rect.output)
			engine.uniforms.image = frame.result.attachments[0];
			engine.draw(shader.draw, null, rect.panzoom);
		},

		resize: (engine) =>
		{
			if (engine.frame !== undefined && engine.frame.feedback !== undefined)
			{
				const gl = engine.gl;
				const frame = engine.frame;
				const size = engine.rect.output;
				engine.frame.feedback.forEach(f => 
					twgl.resizeFramebufferInfo(gl, f, frame.options, size.width, size.height),
				)
			}
		},

		reset: (engine) =>
		{
			if (engine.frame !== undefined && engine.frame.feedback !== undefined)
			{
				engine.frame.feedback.forEach(f => engine.clear(f.framebuffer))
			}
		},

		settings: [
		]
	}
});