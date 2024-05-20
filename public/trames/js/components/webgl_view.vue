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

			canvas: null,
			engine: null,
			clock: null,

			locations: {},
		}
	},
	mounted: function() {
		this.canvas_width = $("#" + this.id).width() * this.device_pixel_ratio;
		this.canvas_height = $("#" + this.id).height() * this.device_pixel_ratio;
		
		const canvas = $("canvas#" + this.id).get(0);
		const engine = CreateEngine(canvas);
		
		this.canvas = canvas;
		this.engine = engine;
		this.clock = new Date();

		this.isPreview = this.id.includes('preview');
		this.isGradient = this.id.includes('gradient');
		this.isZoom = this.id.includes('zoom');
		
		engine.setOutputSize(2048, 2048);

		// // hook events
		window.addEventListener("mouseup", x => engine.update = true )

		emitter.on('screen_loaded', (trigger) => {
			this.screen_settings = settings.screen;
			this.init_canvas();
		})

		// emitter.on('update_view', (trigger) => {
			
		// 	if (!this.engine || !this.engine.ready) return;

		// 	if (["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"].includes(trigger)) {
		// 		this.engine.process.update = true;
		// 	}
			
		// });

		requestAnimationFrame(this.render);

	},
	created: function() {

	},
	computed: function() {

	},
	watch: {

	},
	methods: {
		init_canvas: function()
		{
			const trame = this.screen_settings;
			this.engine.setTrame(trame);
			

			if (this.isGradient)
			{
				const image = new Image();
				image.src = this.gradient_image_source;
				this.engine.setImage(image.src);
				// image.addEventListener("load", (e) => 
				// 	engine.setInputSize(image.width, image.height));
			}
			else
			{
				const image = this.image_settings.image_object;
				this.engine.setImage(image);
				this.engine.setInputSize(image.width, image.height);
			}
			
			// settings
			this.settings = {};
			for (const [key, item] of Object.entries(trame.settings))
			{
				this.settings[key] = item.value;
			}
			
		},

		render: function()
		{
			requestAnimationFrame(this.render);

			if (!this.engine || !this.engine.ready) return;
			
			const engine = this.engine;
			const elapsed = (this.clock.getTime() - settings.global.start_time)/1000;
			let rect = [0, 0, this.canvas.width, this.canvas.height];

			if (this.isPreview)
			{
				rect[0] = this.canvas_image_offset_x;
				rect[1] = this.canvas_height-this.canvas_image_offset_y-this.canvas_image_height;
				rect[2] = this.canvas_image_width;
				rect[3] = this.canvas_image_height;
			}
			else if (this.isZoom)
			{
				const canvas = this.canvas;
				let w = this.canvas_image_width;
				let h = this.canvas_image_height;
				rect[0] = -this.canvas_image_offset_x * w + canvas.width/2;
				rect[1] = -this.canvas_image_offset_y * h + canvas.height/2;
				rect[2] = w;
				rect[3] = h;
			}
			else if (this.isGradient)
			{
				rect = [0, 0, this.canvas.width, this.canvas.height];
				engine.setInputSize(this.canvas.width, this.canvas.height);
				this.engine.setOutputSize(this.canvas.width, this.canvas.height);
			}

			this.update_uniforms();
			engine.setTime(elapsed);
			engine.setPanzoom(rect);
			engine.setLookUpTable(this.global_settings.levels_lut);
			engine.render();
		},

		update_uniforms: function()
		{
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
				if (this.settings[key] != value)
				{
					this.settings[key] = value;
					if (setting.should_reset_buffer)
					{
						this.engine.reset(settings.screen.settings);
					}
				}

				// update uniform
				this.engine.uniforms[setting.uniform] = value;
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