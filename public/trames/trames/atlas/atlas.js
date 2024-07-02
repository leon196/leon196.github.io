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
				name: "alphabet",
				path: "./trames/atlas/images/alphabet.png"
			},
			{
				name: "numbers",
				path: "./trames/atlas/images/numbers.png"
			},
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
			{
				label_fr: "Grid",
				label_en: "Grid",
				slug: "grid",
				type: "slider",
				min: 1,
				max: 10,
				value: 5,
				step: 1,
				uniform: "grid",
				process_to_uniform: function(input) {
					return input
				},
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Scale",
				label_en: "Scale",
				slug: "scale",
				type: "slider",
				min: 1,
				max: 100,
				value: 10,
				step: 1,
				uniform: "scale",
				process_to_uniform: function(input) {
					return input/10
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
				value: 0,
				all_values: [{
						mode: 0,
						label_fr: "Alphabet",
						label_en: "Alphabet"
					},
					{
						mode: 1,
						label_fr: "Nombre",
						label_en: "Number"
					},
					{
						mode: 2,
						label_fr: "Symbol",
						label_en: "Symbol"
					}
				],
				uniform: "pattern",
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