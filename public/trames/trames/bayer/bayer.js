(function() {
	return {
		slug: "bayer",
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
				value: 40,
				step: 1,
				unit: "lpi",
				uniform: "r_lineature",
				process_to_uniform: function(input) {
					return input
				},
				gradient_view: {
					bypass: true,
					default: 5
				}
			},
			{
				label_fr: "Matrice",
				label_en: "Matrix",
				slug: "matrice",
				type: "slider",
				min: 0,
				max: 5,
				value: 3,
				step: 1,
				uniform: "matrice",
				process_to_uniform: function(input) {
					return input
				},
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Steps",
				label_en: "Steps",
				slug: "steps",
				type: "slider",
				min: 3,
				max: 100,
				value: 100,
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