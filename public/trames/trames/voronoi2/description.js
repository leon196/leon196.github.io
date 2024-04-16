(function() {
	return {
		slug: "voronoi2",
		name: "Voronoi2",
		description: "Voronoi2",
		author: "",
		url_info: "",
		
		buffer: "trames/voronoi2/voronoi_buffer.frag",
		shader: "trames/voronoi2/voronoi_draw.frag",

		settings: [
			{
				label_fr: "Size",
				label_en: "Size",
				uniform: "size",
				slug: "size",
				type: "slider",
				min: 0,
				max: 200,
				value: 100,
				step: 1,
				unit: "",
				process_to_uniform: x => x / 100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Distance minimum",
				label_en: "Distance minimum",
				uniform: "nearest",
				slug: "nearest",
				type: "slider",
				min: 5,
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
				value: true,
				uniform: "edge",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: { bypass: false }
			},
		]
	}
});