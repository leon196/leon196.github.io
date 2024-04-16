(function() {
	return {
		slug: "error_diffusion",
		name: "Error Diffusion",
		description: "Error Diffusion",
		author: "",
		url_info: "",
		shader: "trames/error_diffusion/error_diffusion.frag",
		
		process: function()
		{
			let algo = x => x;
			const algorithm = this.settings[0].all_values[this.settings[0].value];

			const shuffle = (w, h) =>
			{

				// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
				const sfc32 = (a, b, c, d) =>
				{
					return function() {
					  a |= 0; b |= 0; c |= 0; d |= 0;
					  let t = (a + b | 0) + d | 0;
					  d = d + 1 | 0;
					  a = b ^ b >>> 9;
					  b = c + (c << 3) | 0;
					  c = (c << 21 | c >>> 11);
					  c = c + t | 0;
					  return (t >>> 0) / 4294967296;
					}
				}
	
				// const r = () => Math.random();
				// const now =  Date.now();
				// const prng = sfc32(now * r(), now * r(), now * r(), now * r());
				const prng = sfc32(1, 2, 3, 4);

				let array = new Uint8Array(w*h);
				for (let i = 0; i < w*h; ++i) array[i] = prng() > 0.5 ? 255 : 0;
				return array;
			}

			switch (algorithm.label_en)
			{
				default:
					algo = (read, width, height) => shuffle(width, height);
				break;

				case "Simple 1D":
					algo = function(read, width, height)
					{
						let array = shuffle(width, height);
						for (let i = 0; i < width*height; ++i)
						{
							let gray = read[i*4];
							let error = Math.floor((array[i] - gray) / 2);
							array[i + 1] += error;
						}
						return array;
					} 
				break;

				case "Simple 2D":
					algo = function(read, width, height)
					{
						let array = shuffle(width, height);
						for (let i = 0; i < width*height; ++i)
						{
							let gray = read[i*4];
							let error = Math.floor((array[i] - gray) / 4);
							array[i + 1] += error;
							array[i + width] += error;
						}
						return array;
					} 
				break;

				case "Atkinson":
					algo = function(read, width, height)
					{
						let array = shuffle(width, height);
						for (let i = 0; i < width*height; ++i)
						{
							let gray = read[i*4];
							let error = Math.floor((array[i] - gray) / 8);
							array[i + 1] += error;
							array[i + 2] += error;
							array[i + width - 1] += error;
							array[i + width] += error;
							array[i + width + 1] += error;
							array[i + width + width] += error;
						}
						return array;
					} 
				break;
				
				case "Sierra24":
					algo = function(read, width, height)
					{
						let array = shuffle(width, height);
						for (let i = 0; i < width*height; ++i)
						{
							let gray = read[i*4];
							let error = Math.floor((array[i] - gray) / 32);
							array[i + 1] += error*5;
							array[i + 2] += error*3;
							array[i + width - 2] += error*2;
							array[i + width - 1] += error*3;
							array[i + width] += error*5;
							array[i + width + 1] += error*3;
							array[i + width + 2] += error*2;
							array[i + width + width - 1] += error*2;
							array[i + width + width] += error*3;
							array[i + width + width + 1] += error*2;
						}
						return array;
					} 
				break;
				
				case "Floyd Steinberg":
					algo = function(read, width, height)
					{
						let array = shuffle(width, height);
						for (let i = 0; i < width*height; ++i)
						{
							let gray = read[i*4];
							let error = Math.floor((array[i] - gray) / 16);
							array[i + 1] += error*7;
							array[i + width - 1] += error*3;
							array[i + width] += error*5;
							array[i + width + 1] += error;
						}
						return array;
					} 
				break;
			}
			return { algo: algo, label: algorithm.label_en };
		},

		settings: [
			{
				label_fr: "Algorithme",
				label_en: "Algorithme",
				slug: "algorithm",
				type: "radio",
				value: 4,
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
			}
		]
	}
});