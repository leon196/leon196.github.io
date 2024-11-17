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
				label_fr: "iterations",
				label_en: "iterations",
				slug: "iterations",
				type: "slider",
				min: 1,
				max: 10,
				value: 8,
				step: 1,
				uniform: "iterations",
				process_to_uniform: x => x,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "threshold_fixed",
				label_en: "threshold_fixed",
				slug: "threshold_fixed",
				type: "slider",
				min: 0,
				max: 100,
				value: 100,
				step: 1,
				uniform: "threshold_fixed",
				process_to_uniform: x => x / 100.,
				gradient_view: { bypass: false }
			},
			{
				label_fr: "threshold_progressive",
				label_en: "threshold_progressive",
				slug: "threshold_progressive",
				type: "slider",
				min: 0,
				max: 100,
				value: 50,
				step: 1,
				uniform: "threshold_progressive",
				process_to_uniform: x => x / 100,
				gradient_view: { bypass: false }
			},
		]
	}
})