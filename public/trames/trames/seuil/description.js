(function() {
	return {
		slug: "seuil",
		name: "Seuil",
		description: "Seuil",
		author: "",
		url_info: "",
		shader: "trames/seuil/seuil.frag",

		settings: [{
				label_fr: "Seuil",
				label_en: "Seuil",
				slug: "seuil",
				type: "slider",
				min: 0,
				max: 255,
				value: 100,
				step: 1,
				unit: "",
				uniform: "r_seuil",
				process_to_uniform: function(input) {
					return input / 255;
				},
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Mode négatif",
				label_en: "Invert mode",
				slug: "invert",
				type: "checkbox",
				value: true,
				uniform: "r_invert",
				process_to_uniform: function(input) {

					if (input == true) {
						return 1;
					} else {
						return 0;
					};
				},
				gradient_view: {
					bypass: false
				}
			},
		]
	}
});