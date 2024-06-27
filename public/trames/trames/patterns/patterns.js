(function() {
	return {
		slug: "patterns",
		name: "Motif",
		description: "Motif",
		author: "",
		url_info: "",
		shader: "trames/patterns/patterns.frag",

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
			{
				label_fr: "Angle",
				label_en: "Angle",
				slug: "angle",
				type: "slider",
				min: 0,
				max: 180,
				value: 45,
				step: 5,
				unit: "°",
				uniform: "r_angle",
				process_to_uniform: function(input) {
					return input * (Math.PI / 180);
				},
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Pattern",
				label_en: "Pattern",
				slug: "pattern",
				type: "radio",
				value: 1,
				all_values: [{
						mode: 0,
						label_fr: "Cercle 1",
						label_en: "Circle 1"
					},
					{
						mode: 1,
						label_fr: "Carré 1",
						label_en: "Square 1"
					},
					{
						mode: 2,
						label_fr: "Carré 2",
						label_en: "Square 2"
					},
					{
						mode: 3,
						label_fr: "Lune",
						label_en: "Moon"
					},
					{
						mode: 4,
						label_fr: "Ligne",
						label_en: "Line"
					}
				],
				uniform: "r_pattern",
				process_to_uniform: function(input) {
					return input;
				},
				gradient_view: {
					bypass: false
				}
			},
		]
	}
})