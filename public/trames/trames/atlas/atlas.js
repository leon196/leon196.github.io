(function() {
	return {
		slug: "atlas",
		name: "Atlas",
		description: "Atlas",
		author: "",
		url_info: "",
		
		shader: "trames/atlas/atlas.frag",
		maps: [
			{
				name: "symbols",
				path: "trames/atlas/images/symbols.png"
			},
		],

		settings: [
			{
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 1,
				max: 20,
				value: 10,
				step: 1,
				unit: "lpi",
				uniform: "r_lineature",
				process_to_uniform: function(input) {
					return input
				},
				gradient_view: {
					bypass: true,
					default: 2
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
		]
	}
})