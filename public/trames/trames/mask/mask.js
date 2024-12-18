(function() {
	return {
		slug: "mask",
		name: "Mask",
		description: "Mask",
		author: "",
		url_info: "",
		
		shader: "trames/mask/mask.frag",
		maps: [
			{
				name: "mask",
				path: "trames/mask/images/mask.png"
			},
		],

		settings: [
			{
				label_fr: "Linéature",
				label_en: "Linéature",
				slug: "lineature",
				type: "slider",
				min: 1,
				max: 300,
				value: 10,
				step: 1,
				unit: "lpi",
				uniform: "r_lineature",
				process_to_uniform: x => x / 20,
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
				label_fr: "Per Pixel",
				label_en: "Per Pixel",
				slug: "per_pixel",
				type: "checkbox",
				value: true,
				uniform: "per_pixel",
				process_to_uniform: x => x ? 1 : 0,
				gradient_view: { bypass: false }
			},
		]
	}
})