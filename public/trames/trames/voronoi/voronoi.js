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
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 5,
				max: 300,
				value: 100,
				step: 1,
				unit: "lpi",
				uniform: "r_lineature",
				process_to_uniform: function(input) {
					return input
				},
				gradient_view: {
					bypass: true,
					default: 10
				}
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