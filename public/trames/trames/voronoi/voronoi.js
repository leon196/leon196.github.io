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
					default: 4
				}
			},
		]
	}
});