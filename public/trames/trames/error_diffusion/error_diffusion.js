(function() {
	return {
		slug: "error_diffusion",
		name: "Error Diffusion",
		description: "Error Diffusion",
		author: "",
		url_info: "",

		worker: "./trames/error_diffusion/error_diffusion.worker.js",

		settings: [
			{
				label_fr: "Algorithme",
				label_en: "Algorithme",
				slug: "algorithm",
				type: "radio",
				value: 4,
				should_reset_buffer: true,
				all_values: [{
						mode: 0,
						label_fr: "Sierra24",
						label_en: "Sierra24"
					},
					{
						mode: 1,
						label_fr: "Atkinson",
						label_en: "Atkinson"
					},
					{
						mode: 2,
						label_fr: "Simple 1D",
						label_en: "Simple 1D"
					},
					{
						mode: 3,
						label_fr: "Simple 2D",
						label_en: "Simple 2D"
					},
					{
						mode: 4,
						label_fr: "Floyd Steinberg",
						label_en: "Floyd Steinberg"
					}
				],
				uniform: "r_algorithm",
				process_to_uniform: function(input) {
					return input;
				},
				gradient_view: {
					bypass: false
				}
			},
			{
				label_fr: "Serpentine",
				label_en: "Serpentine",
				slug: "serpentine",
				type: "checkbox",
				value: false,
				uniform: "r_serpentine",
				process_to_uniform: function(input) {
					return input ? 1 : 0;
				},
				should_reset_buffer: true,
				gradient_view: { bypass: false }
			},
		],
	}
});