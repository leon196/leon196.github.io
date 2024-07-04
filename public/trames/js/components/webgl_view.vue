<template>
	<canvas :id="id" :width="canvas_width" :height="canvas_height"></canvas>
</template>

<script>
export default {
	props: {
		id: 					{ type: String,	required: true },
		viewport_width: 	{ type: Number,	required: false },
		viewport_height: 	{ type: Number,	required: false },
		viewport_x: 	{ type: Number,	required: false },
		viewport_y: 	{ type: Number,	required: false },
		zoom_x: 	{ type: Number,	required: false, default: 0 },
		zoom_y: 	{ type: Number,	required: false, default: 0 },
		gradient_image_source:	{ type: String,	required: false }
	},
	data() {
		return {
			id: this.id,
			global_settings: settings.global,
			screen_settings: settings.screen,
			image_settings: settings.image,
			device_pixel_ratio: settings.global.device_pixel_ratio,
			canvas: null,
			worker: null,
			started: false,
			lut_update: false,
			size_update: false,
			outputSize: [0,0],
			elapsed: 0,
			locations: {},
		}
	},
	mounted: function() {
		this.canvas = $("canvas#" + this.id).get(0);
		this.isPreview = this.id.includes('preview');
		this.isGradient = this.id.includes('gradient');
		this.isZoom = this.id.includes('zoom');
		
		const canvas = this.canvas;
		const globals = this.global_settings;
		const offscreen = canvas.transferControlToOffscreen();

		// create webgl worker
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

		// initialize image source
		let imageSrc = "";
		if (this.isGradient)
			  imageSrc = "./../" + this.gradient_image_source
		else  imageSrc = this.image_settings.image_object.src;
		this.worker.postMessage({ event: "setImageSrc", args: { src: imageSrc } });
		
		// initialize look up
		this.worker.postMessage({
			event: "setLookUpTable",
			args: { array: this.global_settings.levels_lut }
		});
		
		// trame loaded event
		emitter.on('screen_loaded', (trigger) => {

			// trame
			this.screen_settings = settings.screen;
			const trame = settings.screen;
			this.worker.postMessage({
				event: "setTrame",
				args: {
					feedback: trame.feedback,
					shader: trame.shader,
					worker: trame.worker,
					maps: trame.maps
				}
			});

			// settings
			this.settings = {};
			for (const [key, item] of Object.entries(trame.settings)) {
				this.settings[item.uniform] = item.value;
			}

			this.lut_update = true;
			this.size_update = true;
			this.loading_start();
			this.update_size();
			this.update_screen_settings();
			this.should_update();

			if (!this.started)
			{
				this.started = true;
				requestAnimationFrame(this.render);
			}
		})

		// loading event
		if (this.isPreview)
		{
			this.loading_dom = document.getElementById("loading");
			this.loading_start();

			// stop loading when process is done
			this.worker.addEventListener("message", (e) => {
				this.loading_stop();
			});
		}
		
		// update parameters event
		const lut_params = ["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"];
		const size_params = ["format_x", "format_y", "resolution", "definition_x", "definition_y"];
		emitter.on('update_view', (trigger) =>
		{
			// prepare a lut update
			if (lut_params.includes(trigger))
			{
				this.lut_update = true;
				this.loading_start();
			}
			// prepare a parameter update
			if (size_params.includes(trigger) && !this.isGradient)
			{
				this.size_update = true;

				// force update if first frame
				if (this.outputSize[0] == 0 && this.outputSize[1] == 0)
				{
					this.update_screen_settings();
					this.should_update();
				}
				
				// start loading if changes detected
				if (this.isPreview) {
					let outputSize = [globals.definition_x, globals.definition_y];
					if (outputSize[0] != this.outputSize[0] || this.outputSize[1] != this.outputSize[1])
					{
						this.loading_start();
					}
				}
			}
			// fix radio button event
			if  (trigger != undefined &&
				(trigger.indexOf("radio") != -1 || trigger.indexOf("checkbox") != -1 ))
			{
				this.loading_start();
				this.update_screen_settings();
				this.should_update();
			}
		});

		// update when finishing interacting with interface
		window.addEventListener("mouseup", (e) => {
			this.should_update();
		})

		// resize event
		window.addEventListener( 'resize', (e) => {
			this.worker.postMessage({
				event: "resize",
				args: {
					width: canvas.clientWidth,
					height: canvas.clientHeight,
				}
			});
			if (this.isGradient) {
				const size = [canvas.clientWidth, canvas.clientHeight];
				this.worker.postMessage({ event: "setFormat", args: { format: size } });
				this.worker.postMessage({ event: "setOutputSize", args: { outputSize: size } });
			}
		});
	},
	created: function() {},
	computed: function() {},
	watch: {},
	methods: {
		render: function(elapsed)
		{
			this.elapsed = elapsed;

			this.update_screen_settings();
			this.worker.postMessage({ event: "setTime", args: { time: elapsed/1000. }});
			this.worker.postMessage({ event: "setPanzoom", args: { rect: this.update_viewport() } });
			this.worker.postMessage({ event: "render" });
			
			requestAnimationFrame(this.render);
		},

		should_update: function()
		{
			const globals = this.global_settings;

			// effect settings
			for (const [key, value] of Object.entries(this.settings))
			{
				// update uniform
				this.worker.postMessage({
					event: "setSettings",
					args: { name: key, value: value }
				});
			}

			if (this.lut_update)
			{
				this.worker.postMessage({
					event: "setLookUpTable",
					args: { array: globals.levels_lut }
				});
				this.lut_update = false;
			}

			if (this.size_update)
			{
				this.update_size();
				this.size_update = false;
			}

		},

		update_viewport: function()
		{
			const canvas = this.canvas;
			const globals = this.global_settings;
			let rect = [0, 0, canvas.clientWidth, canvas.clientHeight];

			if (this.isPreview)
			{
				rect[0] = this.viewport_x;
				rect[1] = this.viewport_y;
				rect[2] = this.viewport_width;
				rect[3] = this.viewport_height;
			}
			else if (this.isZoom)
			{
				const zoom = 2;
				const w = globals.definition_x * zoom;
				const h = globals.definition_y * zoom;
				rect[0] = -this.zoom_x * w + canvas.clientWidth/2;
				rect[1] = -this.zoom_y * h + canvas.clientHeight/2 - canvas.clientHeight;
				rect[2] = w;
				rect[3] = h;
			}
			else if (this.isGradient)
			{
				rect = [0, -canvas.clientHeight, canvas.clientWidth, canvas.clientHeight];
			}

			return rect;
		},

		update_screen_settings: function()
		{
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
					this.loading_start();
				}
			}
		},

		update_size: function()
		{
			const canvas = this.canvas;
			const globals = this.global_settings;
			let format = [0, 0];
			let outputSize = [0, 0];
			if (this.isGradient) {
				format = [canvas.clientWidth, canvas.clientHeight];
				outputSize = [canvas.clientWidth, canvas.clientHeight];
			} else {
				format = [globals.format_x, globals.format_y];
				outputSize = [globals.definition_x, globals.definition_y];
			}
			this.worker.postMessage({ event: "setFormat", args: { format: format } });
			this.worker.postMessage({ event: "setOutputSize", args: { outputSize: outputSize } });
			this.outputSize = outputSize;
		},

		loading_start: function()
		{
			if (this.loading_dom != undefined)
			{
				this.loading_dom.style.zIndex = "4";
			}
		},

		loading_stop: function()
		{
			if (this.loading_dom != undefined)
			{
				this.loading_dom.style.zIndex = "0";
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