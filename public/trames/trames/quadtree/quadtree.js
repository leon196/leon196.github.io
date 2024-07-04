(function() {
	return {
		slug: "quadtree",
		name: "Quad Tree",
		description: "Quad Tree",
		author: "",
		url_info: "",
		shader: "trames/quadtree/quadtree.frag",

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
				label_fr: "Etapes",
				label_en: "Steps",
				slug: "total_steps",
				type: "slider",
				min: 1,
				max: 8,
				value: 4,
				step: 1,
				uniform: "total_steps",
				process_to_uniform: input => input,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Seuil",
				label_en: "Threshold",
				slug: "threshold",
				type: "slider",
				min: 1,
				max: 100,
				value: 50,
				step: 1,
				uniform: "threshold",
				process_to_uniform: input => input/100,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "Epaisseur",
				label_en: "Thickness",
				slug: "thickness",
				type: "slider",
				min: 1,
				max: 50,
				value: 20,
				step: 1,
				uniform: "thickness",
				process_to_uniform: input => input/100,
				gradient_view: { bypass: false }
			},
		]
	}
})