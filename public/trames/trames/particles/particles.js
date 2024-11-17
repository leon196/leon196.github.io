(function() {
	return {
		slug: "particles",
		name: "Particles",
		description: "Particles",
		author: "",
		url_info: "",

		count: 0,
		hexagonal: false,

		settings: [
			{
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 1,
				max: 300,
				value: 40,
				step: 1,
				unit: "lpi",
				uniform: "lineature",
				process_to_uniform: x => x,
				gradient_view: {
					bypass: true,
					default: 4
				}
			},
			{
				label_fr: "Size",
				label_en: "Size",
				slug: "size",
				type: "slider",
				min: 1,
				max: 30,
				value: 10,
				step: 1,
				uniform: "size",
				process_to_uniform: x => x/10,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Angle",
				label_en: "Angle",
				slug: "angle",
				type: "slider",
				min: 0,
				max: 180,
				value: 0,
				step: 5,
				unit: "°",
				uniform: "r_angle",
				process_to_uniform: x => x * Math.PI / 180,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Stretch",
				label_en: "Stretch",
				slug: "stretch",
				type: "slider",
				min: 0,
				max: 100,
				value: 0,
				step: 1,
				uniform: "stretch",
				process_to_uniform: x => x / 100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Variation Position",
				label_en: "Variation Position",
				slug: "variation_position",
				type: "slider",
				min: 0,
				max: 10,
				value: 0,
				step: 1,
				uniform: "variation_position",
				process_to_uniform: x => x / 1000,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Variation Rotation",
				label_en: "Variation Rotation",
				slug: "variation_rotation",
				type: "slider",
				min: 0,
				max: 360,
				value: 0,
				step: 1,
				unit: "°",
				uniform: "variation_rotation",
				process_to_uniform: x => x * Math.PI / 180,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Hexagonal",
				label_en: "Hexagonal",
				slug: "hexagonal",
				type: "checkbox",
				value: true,
				uniform: "hexagonal",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Pattern",
				label_en: "Pattern",
				slug: "pattern",
				type: "radio",
				value: 1,
				all_values: [{
						mode: 0,
						label_fr: "Cercle",
						label_en: "Circle"
					},
					{
						mode: 1,
						label_fr: "Carré",
						label_en: "Square"
					},
					{
						mode: 2,
						label_fr: "Personnalisé",
						label_en: "Custom"
					}
				],
				uniform: "r_pattern",
				process_to_uniform: x => x,
				gradient_view: { bypass: false }
			},
		],

		start(engine)
		{
			const gl = engine.gl;
			const particles = this.make_particles(engine);

			const count = engine.trame.settings[0].value;
			engine.mesh.particles = twgl.createBufferInfoFromArrays(gl, particles);
			engine.trame.count = count;

			const path = "trames/particles/";
			engine.load_shaders({
				particles: [path+"particles.vert", path+"particles.frag"],
			}, () => {
				engine.state.trame = false;
				engine.tick = 0;
			});
		},

		get_dimension(engine, count)
		{
			const format = engine.settings.format;
			return [
				Math.floor(2 * format[0] * count / 1000),
				Math.floor(2 * format[1] * count / 1000)
			];
		},

		make_particles(engine)
		{
			const count = engine.trame.settings[0].value;
			const hexagonal = engine.trame.settings[6].value;
			const dimension = this.get_dimension(engine, count);
			return engine.make_particles(dimension[0], dimension[1], hexagonal);
		},

		update(engine, oncomplete)
		{
			const count = engine.trame.settings[0].value;
			const hexagonal = engine.trame.settings[6].value;
			if (count != engine.trame.count || hexagonal != engine.trame.hexagonal)
			{
				const gl = engine.gl;
				const particles = this.make_particles(engine);
				engine.mesh.particles = twgl.createBufferInfoFromArrays(gl, particles);
				engine.trame.count = count;
				engine.trame.hexagonal = hexagonal;
			}

			const image = engine.frame.lut.attachments[0];
			const settings = engine.settings;
			const material = engine.material.particles;
			const mesh = engine.mesh.particles;
			const buffer = engine.frame.trame.framebuffer;
			const viewport = [0, 0, engine.width, engine.height];

			settings.image = image;
			settings.grid_dimension = this.get_dimension(engine, count);
			settings.resolution = [ engine.width, engine.height ];
			
			engine.draw(material, mesh, buffer, viewport);
			
			// done
			engine.state.trame = true;
			engine.should_update = false;
			emitter.emit('loading_stop');
			if (oncomplete != undefined) oncomplete();
		},

	}
})