<template>
	<canvas :id="id" :width="canvas_width" :height="canvas_height"></canvas>
</template>

<script>
export default {
	props: {
		id: 					{ type: String,	required: true },
		source_image_width: 	{ type: Number,	required: false },
		source_image_height: 	{ type: Number,	required: false },
		source_image_offset_x: 	{ type: Number,	required: false },
		source_image_offset_y: 	{ type: Number,	required: false },
		canvas_image_width: 	{ type: Number,	required: false },
		canvas_image_height: 	{ type: Number,	required: false },
		canvas_image_offset_x: 	{ type: Number,	required: false, default: 0 },
		canvas_image_offset_y: 	{ type: Number,	required: false, default: 0 },
		canvas_scale: 			{ type: Number,	required: false, default: 1, validator (value) { return value * this.device_pixel_ratio }},
		gradient_image_source:	{ type: String,	required: false }
	},
	data() {
		return {
			id: this.id,
			global_settings: settings.global,
			screen_settings: settings.screen,
			image_settings: settings.image,
			device_pixel_ratio: settings.global.device_pixel_ratio,
			canvas_width: 0,
			canvas_height: 0,
			outputSize: [0,0],
			canvas: null,
			worker: null,
			lut_update: false,
			size_update: false,
			locations: {},
		}
	},
	mounted: function() {
		this.canvas_width = $("#" + this.id).width() * this.device_pixel_ratio;
		this.canvas_height = $("#" + this.id).height() * this.device_pixel_ratio;
		this.canvas = $("canvas#" + this.id).get(0);
		
		this.isPreview = this.id.includes('preview');
		this.isGradient = this.id.includes('gradient');
		this.isZoom = this.id.includes('zoom');
		
		const canvas = this.canvas;
		const globals = this.global_settings;
		const offscreen = canvas.transferControlToOffscreen();

		this.worker = new Worker('./js/engine.worker.js', { type: 'module' });
		this.worker.postMessage({
			event: "create",
			args: {
				canvas: offscreen,
				width: canvas.clientWidth,
				height: canvas.clientHeight,
				is_gradient: this.isGradient,
			}
		}, [offscreen]);

		window.addEventListener( 'resize', (e) =>
		{
			this.worker.postMessage({
				event: "resize",
				args: {
					width: canvas.clientWidth,
					height: canvas.clientHeight,
				}
			});
		});
		
		this.worker.postMessage({
			event: "setLookUpTable",
			args: { array: this.global_settings.levels_lut }
		});

		let imageSrc = "";

		// image
		if (this.isGradient) {
			imageSrc = "./../" + this.gradient_image_source
		} else {
			imageSrc = this.image_settings.image_object.src;
		}
		
		this.worker.postMessage({ event: "setImageSrc", args: { src: imageSrc } });
		
		// update parameters event
		const lut_params = ["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"];
		const size_params = ["format_x", "format_y", "resolution", "definition_x", "definition_y"]
		emitter.on('update_view', (trigger) => {
			if (lut_params.includes(trigger)) {
				this.lut_update = true;
			}
			if (size_params.includes(trigger) && !this.isGradient) {
				this.size_update = true;
				if (this.outputSize[0] == 0 && this.outputSize[1] == 0) {
					this.should_update();
				}
			}
		});
		
		// loaded event
		emitter.on('screen_loaded', (trigger) => {

			// trame
			this.screen_settings = settings.screen;
			const trame = settings.screen;
			this.worker.postMessage({
				event: "setTrame",
				args: { shader: trame.shader, worker: trame.worker, }
			});
			
			// size
			let format = [0, 0];
			let outputSize = [0, 0];
			if (this.isGradient) {
				format = [canvas.width, canvas.height];
				outputSize = [canvas.width, canvas.height];
			} else {
				format = [globals.format_x, globals.format_y];
				outputSize = [globals.definition_x, globals.definition_y];
			}
			this.worker.postMessage({ event: "setFormat", args: { format: format } });
			this.worker.postMessage({ event: "setOutputSize", args: { outputSize: outputSize } });

			// settings
			this.settings = {};
			for (const [key, item] of Object.entries(trame.settings)) {
				this.settings[item.uniform] = item.value;
			}

			this.lut_update = true;
			this.size_update = true;
			this.should_update();
		})

		window.addEventListener("mouseup", (e) => {
			this.should_update();
		})

		// start
		requestAnimationFrame(this.render);
	},
	created: function() {},
	computed: function() {},
	watch: {},
	methods: {
		render: function(elapsed)
		{
			// loop
			requestAnimationFrame(this.render);
			
			const canvas = this.canvas;
			const globals = this.global_settings;
			let rect = [0, 0, canvas.width, canvas.height];

			if (this.isPreview)
			{
				rect[0] = this.canvas_image_offset_x;
				rect[1] = this.canvas_height-this.canvas_image_offset_y-this.canvas_image_height;
				rect[2] = this.canvas_image_width;
				rect[3] = this.canvas_image_height;
			}
			else if (this.isZoom)
			{
				let w = globals.definition_x * 2;
				let h = globals.definition_y * 2;
				rect[0] = -this.canvas_image_offset_x * w + canvas.width/2;
				rect[1] = -this.canvas_image_offset_y * h + canvas.height/2;
				rect[2] = w;
				rect[3] = h;
			}
			else if (this.isGradient)
			{
				rect = [0, 0, canvas.width, canvas.height];
			}

			// this.update_uniforms();
			this.update_settings();
			this.worker.postMessage({ event: "setPanzoom", args: { rect: rect } });
			this.worker.postMessage({ event: "setTime", args: { time: elapsed/1000. } });
			this.worker.postMessage({ event: "render" });

		},

		should_update: function()
		{
			const globals = this.global_settings;

			this.update_uniforms();

			if (this.lut_update) {
				this.worker.postMessage({
					event: "setLookUpTable",
					args: { array: globals.levels_lut }
				});
				this.lut_update = false;
			}

			if (this.size_update) {
				// size
				const canvas = this.canvas;
				let format = [0, 0];
				let outputSize = [0, 0];
				if (this.isGradient) {
					format = [canvas.width, canvas.height];
					outputSize = [canvas.width, canvas.height];
				} else {
					format = [globals.format_x, globals.format_y];
					outputSize = [globals.definition_x, globals.definition_y];
				}
				this.worker.postMessage({
					event: "setFormat",
					args: { format: format }
				});
				this.worker.postMessage({
					event: "setOutputSize",
					args: { outputSize: outputSize }
				});
				this.outputSize = outputSize;
				this.size_update = false;
			}

			this.worker.postMessage({ event: "shouldLoad", args: { loading: false } });
		},

		update_settings: function()
		{
			// const engine = this.engine;
			let trame = settings.screen;
			if (trame.settings == undefined) return;

			// effect settings
			for (const [key, setting] of Object.entries(settings.screen.settings))
			{
				let value = 0;

				// gradient bypass
				if (this.isGradient && setting.gradient_view.bypass)
				{
					// gradient view value
					value = setting.gradient_view.default;
				}
				else
				{
					// prosseced settings
					value = setting.process_to_uniform(setting.value);
				}

				// trigger reset if needed
				if (this.settings[setting.uniform] != value)
				{
					this.settings[setting.uniform] = value;
					if (setting.should_reset_buffer)
					{
						// engine.reset(settings.screen.settings);
					}
					
					this.worker.postMessage({ event: "shouldLoad", args: { loading: true } });
				}
			}
		},

		update_uniforms: function()
		{		
			// effect settings
			for (const [key, value] of Object.entries(this.settings))
			{
				// update uniform
				this.worker.postMessage({
					event: "setUniforms",
					args: {
						name: key,
						value: value,
					}
				});
			}
		},
	}
}
</script>

<style>
#preview
{
	position: absolute;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: white;
	z-index: 1;
	pointer-events: none;
}

#zoom
{
	position: absolute;
	top: 0;
	width: var(--sidebar_right_width);
	height: var(--sidebar_right_width);
	background-color: black;
}
</style>