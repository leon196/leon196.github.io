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
				value: 20,
				step: 1,
				unit: "lpi",
				uniform: "r_lineature",
				process_to_uniform: x => x,
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
				process_to_uniform: x => x * Math.PI / 180,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Stretch",
				label_en: "Stretch",
				slug: "stretch",
				type: "slider",
				min: -99,
				max: 99,
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
				max: 100,
				value: 0,
				step: 1,
				uniform: "variation_position",
				process_to_uniform: x => x / 100,
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
				label_fr: "Mode",
				label_en: "Mode",
				slug: "mode",
				type: "checkbox",
				value: true,
				uniform: "mode",
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
						label_fr: "Ligne",
						label_en: "Line"
					}
				],
				uniform: "r_pattern",
				process_to_uniform: x => x,
				gradient_view: { bypass: false }
			},
		]
	}
})