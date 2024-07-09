(function() {
	return {
		slug: "euclid",
		name: "Trame Euclidienne",
		description: "Trame de simili-gravure conventionnelle. Motif rond, elliptique ou carré.",
		author: "Kevin Donnot",
		url_info: "",
		shader: "/trames/euclid/euclid.frag",

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
				label_fr: "Shape",
				label_en: "Shape",
				slug: "shape",
				type: "slider",
				min: -100,
				max: 100,
				value: 0,
				step: 1,
				unit: "",
				uniform: "shape",
				process_to_uniform: x => x / 100,
				gradient_view: {
					bypass: false
				}
			},
		]
	}
})