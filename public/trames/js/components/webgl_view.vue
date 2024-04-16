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
			gl_context: null,
			buffer: null,
			current_program: null,

			locations: {},
			gradient_image: {}
		}
	},
	mounted: function() {
		this.canvas_width = $("#" + this.id).width() * this.device_pixel_ratio;
		this.canvas_height = $("#" + this.id).height() * this.device_pixel_ratio;

		emitter.on('screen_loaded', (trigger) => {
			this.screen_settings = settings.screen;
			this.init_canvas();
			requestAnimationFrame(this.render);
		})

		emitter.on('update_view', (trigger) => {
			
			if (!this.engine || !this.engine.ready) return;

			if (["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"].includes(trigger)) {
				this.engine.process.update = true;
			}
			
		});
		// emitter.on('update_view', (trigger) => {
		// 	if (!this.engine || !this.engine.ready) return;
		// 	this.engine.process.update = true;
		// });

	},
	created: function() {

	},
	computed: function() {

	},
	watch: {

	},
	methods: {
		init_canvas: function() {
			this.canvas = $("canvas#" + this.id).get(0);
			try
			{
				this.gl_context = this.canvas.getContext('webgl2', {
					alpha: false,
					antialias: true,
					depth: true,
					failIfMajorPerformanceCaveat: false,
					powerPreference: "default",
					premultipliedAlpha: true,
					// preserveDrawingBuffer: true,
					stencil: false,
					desynchronized: false,
					uniforms_locations: {}
				});
				this.gl_context.getExtension("OES_texture_float")
				this.gl_context.getExtension("EXT_color_buffer_float")
				this.gl_context.getExtension("OES_texture_float_linear")
			} 
			catch (error)
			{
				console.log(error);
			}
			if (!this.gl_context)
			{
				throw "cannot create webgl context";
			}

			const gl = this.gl_context;
			const filter = this.screen_settings.shader;
			const buffer = this.screen_settings.buffer;
			let image = this.image_settings.image_object;

			this.engine = CreateEngine(gl, filter, buffer);

			this.isPreview = this.id.includes('preview');
			this.isGradient = this.id.includes('gradient');
			this.isZoom = this.id.includes('zoom');

			this.settings = {};
			for (const [key, item] of Object.entries(settings.screen.settings))
    		{
				this.settings[key] = item.value;
			}

			if (this.isGradient)
			{
				this.gradient_image = new Image();
				this.gradient_image.src = this.gradient_image_source;
				image = this.gradient_image_source;
			
				this.engine.width = 300;
				this.engine.height = 2100;
			}
			
			this.engine.media = twgl.createTextures(gl,
			{
				image: 
				{
					src: image,
					flipY: true,
				},
			})

			this.engine.uniforms.hasPanzoom = !this.isGradient;// && !this.isZoom;
        	this.engine.process.isGradient = this.isGradient;
			

			// hook events
			window.addEventListener("mouseup", x => this.engine.update = true )
			
		},

		render: function()
		{
			requestAnimationFrame(this.render);
			if (!this.engine || !this.engine.ready) return;
			
			const engine = this.engine;
			const rect = [0,0,this.canvas_width, this.canvas_height];
			const global = this.global_settings;
			let width = this.canvas_width;
			let height = this.canvas_height;

			// pan zoom
			if (this.isPreview)
			{
				rect[0] = this.canvas_image_offset_x;
				rect[1] = this.canvas_height-this.canvas_image_offset_y-this.canvas_image_height;
				rect[2] = this.canvas_image_width;
				rect[3] = this.canvas_image_height;
			}
			else if (this.isZoom)
			{
				rect[0] = this.canvas_image_offset_x;
				rect[1] = this.canvas_image_offset_y-this.canvas_image_height;
				rect[2] = this.canvas_image_width;
				rect[3] = this.canvas_image_height;
			}
			
			if (settings.screen.process != null)
			{
				engine.process.set(settings.screen.process());
			}

			engine.uniforms.time = (new Date().getTime() - settings.global.start_time)/1000;
			engine.viewport = rect;
			this.update_lut_texture();
			this.update_uniforms();
			engine.resize(width, height);
			engine.render();
			
		},

		update_uniforms: function()
		{
			// effect settings
			// for (let setting of settings.screen.settings)
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

				if (this.settings[key] != value)
				{
					this.settings[key] = value;
					if (setting.should_reset_buffer)
					{
						this.engine.reset();
					}
				}

				// update uniform
				this.engine.uniforms[setting.uniform] = value;
			}
		},

		update_lut_texture: function()
		{
			const gl = this.gl_context;
			const engine = this.engine;
			const lut = this.global_settings.levels_lut;

			engine.media.lut = twgl.createTexture(gl,
			{
				src: lut,
				format: gl.LUMINANCE,
				width: lut.length,
				wrap: gl.CLAMP_TO_EDGE,
				minMag: gl.LINEAR,
			});
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