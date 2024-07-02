(function() {
	return {
		slug: "Bayer",
		name: "Bayer",
		description: "",
		author: "",
		url_info: "",
		shader: "trames/bayer/bayer.frag",

		settings: [
			{
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 1,
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
					default: 200
				}
			},
			{
				label_fr: "Steps",
				label_en: "Steps",
				slug: "steps",
				type: "slider",
				min: 2,
				max: 10,
				value: 4,
				step: 1,
				uniform: "steps",
				process_to_uniform: function(input) {
					return input
				},
				gradient_view: {
					bypass: false
				}
			},
		]
	}
})