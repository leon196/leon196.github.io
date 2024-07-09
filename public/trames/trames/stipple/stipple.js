(function() {
	return {
		slug: "stipple",
		name: "Stipple",
		description: "Stipple",
		author: "",
		url_info: "",

		shader: "trames/stipple/stipple.frag",
		particles: "trames/stipple/stipple.particles.frag",

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
		]
	}
})