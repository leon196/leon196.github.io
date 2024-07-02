(function() {
	return {
		slug: "atlas",
		name: "Atlas",
		description: "Atlas",
		author: "",
		url_info: "",
		
		shader: "./trames/atlas/atlas.frag",
		maps: [
			{
				name: "symbols",
				path: "./trames/atlas/images/symbols.png"
			},
		],

		settings: [
			{
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 5,
				max: 300,
				value: 50,
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
})