<template>

	<!-- INIT VIEWPORT -->
	<div id="viewport">

		<!-- SHOW ORIGINAL IMAGE BUTTON -->
		<click_button id="show_original_image"
			text="image originale"
			black="false"
			@mouseover="show_original_image = true"
			@mouseout="show_original_image = false">
		</click_button>

		<div id="loading">loading</div>

		<!-- MAIN PREVIEW -->
		<div id="panzoom_container"
			:class="{ 'show_image' : show_original_image}">
			<img id="panzoom_image"
				@mousemove="mouse_move_on_preview($event)"
				:src="image.source">
		</div>

		<webgl_view id="preview"
			:viewport_width="views.preview.viewport_width"
			:viewport_height="views.preview.viewport_height"
			:viewport_x="views.preview.viewport_x"
			:viewport_y="views.preview.viewport_y"
			:canvas_image_width="views.preview.canvas_image_width"
			:canvas_image_height="views.preview.canvas_image_height"
			:zoom_x="views.preview.zoom_x"
			:zoom_y="views.preview.zoom_y"
			:canvas_scale="views.preview.canvas_scale">
		</webgl_view>

		<!-- RULER -->
		<ruler></ruler>

	</div>

	<!-- INIT COLSE-UP BAR -->
	<div id="closeupbar" class="green_shadow">

		<!-- CLOSE UP PREVIEW -->
		<webgl_view id="zoom"
			:viewport_width="views.zoom.viewport_width"
			:viewport_height="views.zoom.viewport_height"
			:viewport_x="views.zoom.viewport_x"
			:viewport_y="views.zoom.viewport_y"
			:canvas_image_width="views.zoom.canvas_image_width"
			:canvas_image_height="views.zoom.canvas_image_height"
			:zoom_x="views.zoom.zoom_x"
			:zoom_y="views.zoom.zoom_y"
			:canvas_scale="views.zoom.canvas_scale">
		</webgl_view>

		<!-- GRADIENT PREVIEW -->
		<div id="gradients">

			<!-- STEPS GRADIENTS -->
			<webgl_view id="gradient_steps" :gradient_image_source="grayscale_steps_image_source"></webgl_view>
			<img id="gradients_steps_img" :src="grayscale_steps_image_source" />

			<!-- CONTINUOUS GRADIENTS -->
			<webgl_view id="gradient_continuous" :gradient_image_source="grayscale_continuous_image_source"></webgl_view>
			<img id="gradients_continuous_img" :src="grayscale_continuous_image_source">

		</div>
	</div>

</template>



<script>
import webgl_view from './webgl_view.vue'
import click_button from './ui_elements/click_button.vue'
import ruler from './ui_elements/ruler.vue'


export default {
	components: {
		webgl_view,
		click_button,
		ruler
	},
	data() {
		return {
			grayscale_steps_image_source: "./images/grayscale_steps.png",
			grayscale_continuous_image_source: "./images/grayscale_continuous.png",
			image: settings.image,
			global: settings.global,
			show_original_image: false,
			panzoom: [0,0,500,500],
			zoom: [0,0,500,500],
			elapsed: 0,
			mouse: {
				up: false,
				down: false,
				position: [0,0],
				previous: [0,0],
				elapsed: 0,
				delay: 0.1,
				moved: false,
			},
			views: {
				"preview": {
					canvas_width: 0,
					canvas_height: 0,
					viewport_width: 0,
					viewport_height: 0,
					viewport_x: 0,
					viewport_y: 0,
				},
				"zoom": {
					zoom_x: 0,
					zoom_y: 0,
				}
			}
		}
	},
	mounted: function() {
		settings.global.device_pixel_ratio = this.getDevicePixelRatio();
		this.init_webgl();

		emitter.on('image_loaded', (trigger) => {
			this.init_panzoom();
		});

	},

	created: function() {

	},
	computed: function() {

	},
	watch: {

	},
	methods: {

		init_webgl: function()
		{
			const global = this.global;

			// virtual canvas
			const canvas = document.createElement("canvas");
			canvas.width = 500;
			canvas.height = 500;

			this.dom_debug = document.getElementById("debug");

			// create engine
			const engine = new Engine(canvas, () => {
				engine.set_lut(global.levels_lut);
				engine.set_trame(settings.screen);
				engine.set_size(global.definition_x, global.definition_y, global.format_x, global.format_y);
				this.init_events();
				this.update_settings();
				this.update_trame();
				requestAnimationFrame(this.update);
			});

			// preview render
			this.previewView = new EngineView(document.getElementById("preview"));

			// zoon on result
			this.zoomView = new EngineView(document.getElementById("zoom"));

			// create engine for gradient steps
			const gradient_steps = document.getElementById("gradient_steps");
			const engine_gradient_steps = new Engine(canvas, () => {
				engine_gradient_steps.disable_blur();
				engine_gradient_steps.set_lut(global.levels_lut);
				engine_gradient_steps.set_trame(settings.screen);
				engine_gradient_steps.set_size(gradient_steps.clientWidth, gradient_steps.clientHeight, gradient_steps.clientWidth, gradient_steps.clientHeight);
			});
			this.gradientStepsView = new EngineView(gradient_steps);

			// create engine for gradient continuous
			const gradient_continuous = document.getElementById("gradient_continuous");
			const engine_gradient_continuous = new Engine(canvas, () => {
				engine_gradient_continuous.disable_blur();
				engine_gradient_continuous.set_lut(global.levels_lut);
				engine_gradient_continuous.set_trame(settings.screen);
				engine_gradient_continuous.set_size(gradient_continuous.clientWidth, gradient_continuous.clientHeight, gradient_continuous.clientWidth, gradient_continuous.clientHeight);
			});
			this.gradientContinuousView = new EngineView(gradient_continuous);

			// load images
			engine.load_images({
				image: settings.image.source,
			});
			engine_gradient_steps.load_images({
				image: "/images/grayscale_steps.png",
			});
			engine_gradient_continuous.load_images({
				image: "/images/grayscale_continuous.png",
			});

			// todo: fix async startup
			setTimeout(() => {
				this.update_trame();
			}, 1000);

			// main engine
			this.engine = engine;
			this.engine_gradient_steps = engine_gradient_steps;
			this.engine_gradient_continuous = engine_gradient_continuous;

			// loading dom
			this.loading_dom = document.getElementById("loading");
		},

		init_events: function()
		{
			const engine = this.engine;
			const global = this.global;
			const engine_gradient_steps = this.engine_gradient_steps;
			const engine_gradient_continuous = this.engine_gradient_continuous;

			emitter.on('screen_loaded', () => {
				engine.set_trame(settings.screen);
				engine_gradient_steps.set_trame(settings.screen);
				engine_gradient_continuous.set_trame(settings.screen);
				this.update_settings();

				// todo: fix async startup
				setTimeout(() => {
					this.update_trame();
				}, 1000);
			})

			const triggers = {
				lut: ["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"],
				size: ["format_x", "format_y", "resolution", "definition_x", "definition_y"],
			}
			
			emitter.on('update_view', (trigger) =>
			{
				emitter.emit('loading_start');

				if (triggers.lut.includes(trigger))
				{
					engine.set_lut(global.levels_lut);
					engine_gradient_steps.set_lut(global.levels_lut);
					engine_gradient_continuous.set_lut(global.levels_lut);
				}

				else if (triggers.size.includes(trigger))
				{
					engine.set_size(
						global.definition_x, global.definition_y,
						global.format_x, global.format_y,
					);
				}

				else
				{
					this.update_settings();
				}
			});

			window.addEventListener("mousedown", (e) => {
				this.mouse.down = true;
			});

			window.addEventListener("mouseup", (e) => {
				this.mouse.up = true;
			});

			window.addEventListener("mousemove", (e) => {
				this.mouse.position = [e.clientX, e.clientY];
			});

			emitter.on('loading_start', () => {
				if (this.loading_dom != undefined) {
					this.loading_dom.style.zIndex = "4";
					this.loading_dom.style.display = "inline-block";
				}
			});

			emitter.on('loading_stop', () => {
				if (this.loading_dom != undefined) {
					this.loading_dom.style.zIndex = "0";
					this.loading_dom.style.display = "none";
				}
			});

			emitter.on('force_update', (self) => {
				self.update(this.elapsed);
			})
		},

		update_trame: function()
		{
			const elapsed = this.elapsed;
			const engine = this.engine;
			const engine_gradient_steps = this.engine_gradient_steps;
			const engine_gradient_continuous = this.engine_gradient_continuous;

			// process trame
			engine.update(elapsed);
			engine_gradient_steps.update(elapsed);
			engine_gradient_continuous.update(elapsed);
		},
		
		update: function(elapsed)
		{
			const engine = this.engine;
			const steps = this.engine_gradient_steps;
			const continuous = this.engine_gradient_continuous;

			// frame rate
			const delta = elapsed/1000. - this.elapsed;
			// const frameRate = Math.ceil(1.0/delta);
			// this.dom_debug.textContent = frameRate;
			this.elapsed = elapsed/1000.;

			// detect user activity to update trame
			this.mouse_activity(delta);

			// draw trame
			const result = engine.get_result();
			this.previewView.update(result, this.panzoom);
			this.zoomView.update(result, this.zoom);
			
			// gradients
			this.gradientStepsView.update(steps.get_result());
			this.gradientContinuousView.update(continuous.get_result());

			// loop
			requestAnimationFrame(this.update);
		},

		update_settings: function()
		{
			const engine = this.engine;
			const steps = this.engine_gradient_steps;
			const continuous = this.engine_gradient_continuous;

			for (const [key, setting] of Object.entries(settings.screen.settings))
			{
				// process value for trame
				let value = setting.process_to_uniform(setting.value);
				engine.set_setting(setting.uniform, value);

				// gradients
				if (setting.gradient_view.bypass) {
					value = setting.gradient_view.default;
				}
				steps.set_setting(setting.uniform, value);
				continuous.set_setting(setting.uniform, value);
			}
		},

		init_panzoom: function() {

			const viewport = $("#viewport");
			const image = $("#panzoom_image");
			const ruler = $("#ruler");

			let image_element = image[0];
			this.panzoom_image = image_element;
			this.dom_zoom = document.getElementById("zoom");

			let start_x = viewport.width() / 2 - image.width() / 2;
			let start_y = (viewport.height() - ruler.height()) / 2 - image.height() / 2;

			// INIT PANZOOM WITH RAW IMAGE 
			let panzoom = Panzoom(image_element, {
				canvas: true,
				startScale: 1,
				startX: start_x,
				startY: start_y,
				maxScale: 20,
				minScale: 1,
			});
			
			let parent = image_element.parentElement;
			parent.addEventListener('wheel', panzoom.zoomWithWheel)
			image_element.addEventListener('panzoomchange', (event) => {
				
				// image dimensions
				let width = this.image.image_object.width;
				let height = this.image.image_object.height;

				// panzoom transform
				const style = window.getComputedStyle(image_element)
				const matrix = style.transform;// || style.webkitTransform || style.mozTransform
				const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')
				const scale = parseFloat(matrixValues[0]);

				// css panzoom to webgl panzoom
				let x = parseFloat(matrixValues[4]) + (width - width * scale) / 2;
				let y = parseFloat(matrixValues[5]) + (height - height * scale) / 2;
				y = viewport.height() - y - height * scale;
				let w = width * scale;
				let h = height * scale;

				// viewport for webgl
				this.panzoom = [x, y, w, h];
			});
		},

		mouse_activity: function(delta)
		{
			let update = false;

			if(this.mouse.down
			&& this.mouse.moved
			&& this.mouse.position[0] == this.mouse.previous[0]
			&& this.mouse.position[1] == this.mouse.previous[1])
			{
				this.mouse.elapsed += delta;
			}
			else
			{
				this.mouse.elapsed = 0;
			}

			if (this.mouse.position[0] != this.mouse.previous[0]
			 || this.mouse.position[1] != this.mouse.previous[1])
			{
				this.mouse.moved = true;
			}

			this.mouse.previous[0] = this.mouse.position[0];
			this.mouse.previous[1] = this.mouse.position[1];

			if (this.mouse.down && this.mouse.elapsed > this.mouse.delay && this.mouse.moved)
			{
				update = true;
				this.mouse.moved = false;
			}

			if (this.mouse.up)
			{
				update = true;
				this.mouse.up = false;
			}

			if (update)
			{
				this.update_trame();
			}
		},

		mouse_move_on_preview: function(event)
		{
			let mouse_x = event.offsetX;
			let mouse_y = event.offsetY;

			if (this.panzoom_image == undefined) return;

			let width = this.panzoom_image.width;
			let height = this.panzoom_image.height;

			this.views.zoom.zoom_x = mouse_x/width;
			this.views.zoom.zoom_y = 1-mouse_y/height;
			
			const zoom = 2;
			const w = this.global.definition_x * zoom;
			const h = this.global.definition_y * zoom;
			const x = -this.views.zoom.zoom_x * w + this.dom_zoom.clientWidth/2;
			const y = -this.views.zoom.zoom_y * h + this.dom_zoom.clientHeight/2;

			this.zoom = [x, y, w, h];
		},

		getDevicePixelRatio: function() {
			var mediaQuery;
			var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			if (window.devicePixelRatio !== undefined && !is_firefox) {
				return window.devicePixelRatio;
			} else if (window.matchMedia) {
				mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
		          (min--moz-device-pixel-ratio: 1.5),\
		          (-o-min-device-pixel-ratio: 3/2),\
		          (min-resolution: 1.5dppx)";
				if (window.matchMedia(mediaQuery).matches) {
					return 1.5;
				}
				mediaQuery = "(-webkit-min-device-pixel-ratio: 2),\
		          (min--moz-device-pixel-ratio: 2),\
		          (-o-min-device-pixel-ratio: 2/1),\
		          (min-resolution: 2dppx)";
				if (window.matchMedia(mediaQuery).matches) {
					return 2;
				}
				mediaQuery = "(-webkit-min-device-pixel-ratio: 0.75),\
		          (min--moz-device-pixel-ratio: 0.75),\
		          (-o-min-device-pixel-ratio: 3/4),\
		          (min-resolution: 0.75dppx)";
				if (window.matchMedia(mediaQuery).matches) {
					return 0.7;
				}
			} else {
				return 1;
			}
		}
	}
}
</script>


<style scoped>
/*VIEWPORT*/
#viewport {
	position: absolute;
	left: var(--sidebar_left_width);
	right: var(--sidebar_right_width);
	top: var(--menu_bar_height);
	bottom: 0;
	background-color: var(--viewport_background);
	z-index: 1;
	/* opacity: 0.5; */
	text-align: center;
}

#panzoom_container {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: var(--gui_base_height);
	background-color: var(--viewport_background);
	/* opacity: 0.5; */
	opacity: 0;
	z-index: 3;
}

#panzoom_image {
	position: absolute;
	left: 0;
	top: 0;
}

#closeupbar {
	position: absolute;
	width: var(--sidebar_right_width);
	height: 100%;
	right: 0;
	border-left: var(--gui_border);
	z-index: 2;
}

#show_original_image{
	position: relative;
	display: inline-block;
	margin-top: 8px;
	z-index: 4;
	top: 0px;
	cursor: default;
}

#loading
{
	position: relative;
	display: inline-block;
	z-index: 0;
	font-size: 20px;
	top: 50%;
	cursor: default;
	background-color: white;
	padding: 10px;
	text-align: center;
}

#debug
{
	position: absolute;
	display: inline-block;
	z-index: 10;
	font-size: 20px;
	left: 10%;
	top: 10%;
	cursor: default;
	color: white;
	background-color: black;
	padding: 10px;
	text-align: center;
}

#gradients {
	position: absolute;
	top: var(--sidebar_right_width);
	width: var(--sidebar_right_width);
	height: calc(100vh - var(--sidebar_right_width) - var(--menu_bar_height));
	background-color: grey;
	z-index: 2;
}

#gradients>* {
	position: relative;
	display: inline-block;
	width: 25%;
	height: 100%;
}

.show_image {
	opacity: 1 !important;
}
</style>