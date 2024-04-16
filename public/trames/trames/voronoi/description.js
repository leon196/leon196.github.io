(function() {
	return {
		slug: "voronoi",
		name: "Voronoi",
		description: "Voronoi",
		author: "",
		url_info: "",
		shader: "trames/voronoi/voronoi.frag",

		settings: [
			{
				label_fr: "Scale",
				label_en: "Scale",
				slug: "scale",
				type: "slider",
				min: 0,
				max: 300,
				value: 100,
				step: 1,
				unit: "",
				uniform: "scale",
				process_to_uniform: x => x,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Size",
				label_en: "Size",
				slug: "size",
				type: "slider",
				min: 0,
				max: 100,
				value: 50,
				step: 1,
				unit: "",
				uniform: "size",
				process_to_uniform: x => x / 100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Edge Mode",
				label_en: "Edge Mode",
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