(function() {
	return {
		slug: "voronoi2",
		name: "Voronoi2",
		description: "Voronoi2",
		author: "",
		url_info: "",
		
		shader: "trames/voronoi2/voronoi_draw.frag",

		load: (engine) =>
		{
			engine.load("voronoi", "trames/voronoi2/voronoi_buffer.frag");
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
			
			// use lutted image
			engine.uniforms.image = frame.lutted.attachments[0];

			for (let i = 0; i < 3; ++i)
			{
				// feedback buffer
				let read = frame.feedback[frame.swap];
				let write = frame.feedback[(frame.swap+1)%2];
				frame.swap = (frame.swap+1)%2;
				engine.uniforms.framebuffer = read.attachments[0];
				engine.draw(shader.voronoi, write.framebuffer, rect.output);
				engine.uniforms.tick = engine.uniforms.tick+1;
			}

			engine.uniforms.image = frame.feedback[(frame.swap+1)%2].attachments[0]; 

			// apply filter
			engine.draw(shader.filter, frame.result.framebuffer, rect.output)
			engine.uniforms.image = frame.result.attachments[0];

			// draw result
			engine.draw(shader.threshold, null, rect.panzoom);
			engine.update = false;
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
			{
				label_fr: "Size",
				label_en: "Size",
				uniform: "size",
				slug: "size",
				type: "slider",
				min: 0,
				max: 200,
				value: 15,
				step: 1,
				unit: "",
				process_to_uniform: x => x / 2000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Distance minimum",
				label_en: "Distance minimum",
				uniform: "nearest",
				slug: "nearest",
				type: "slider",
				min: 1,
				max: 20,
				value: 5,
				step: 1,
				unit: "",
				should_reset_buffer: true,
				process_to_uniform: x => x / 1000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Edge",
				label_en: "Edge",
				slug: "edge",
				type: "checkbox",
				value: false,
				uniform: "edge",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: { bypass: false }
			},
		]
	}
});