(function() {
	return {
		slug: "error_bloc",
		name: "Error Diffusion Bloc",
		description: "Error Diffusion Bloc",
		author: "",
		url_info: "",

		settings: [
		],

		update: function(array, width, height, callback)
		{
			let w = new Worker("./trames/error_bloc/error_bloc_worker.js");
			w.postMessage([ array, width, height ]);
			w.onmessage = (e) => callback(e.data);
		},
	}
});