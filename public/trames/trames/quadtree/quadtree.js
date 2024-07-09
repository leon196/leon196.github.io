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
				label_fr: "Seuil",
				label_en: "Threshold",
				slug: "threshold",
				type: "slider",
				min: 1,
				max: 30,
				value: 20,
				step: 1,
				uniform: "threshold",
				process_to_uniform: input => input/1000,
				gradient_view: { bypass: false }
			},
		]
	}
})