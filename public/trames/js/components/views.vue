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
			force_update: false,
			mouse: new Mouse(),
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
				image: "images/grayscale_steps.png",
			});
			engine_gradient_continuous.load_images({
				image: "images/grayscale_continuous.png",
			});

			// main engine
			this.engine = engine;
			this.engine_gradient_steps = engine_gradient_steps;
			this.engine_gradient_continuous = engine_gradient_continuous;

			// loading dom
			this.loading_dom = document.getElementById("loading");
			
			this.init_events();
		},

		init_events: function()
		{
			const engine = this.engine;
			const global = this.global;
			const engine_gradient_steps = this.engine_gradient_steps;
			const engine_gradient_continuous = this.engine_gradient_continuous;

			this.mouse.init_events();
			
			emitter.on('force_update', () => {
				this.force_update = true;
			})

			emitter.on('screen_loaded', () => {
				engine.set_trame(settings.screen);
				engine_gradient_steps.set_trame(settings.screen);
				engine_gradient_continuous.set_trame(settings.screen);
				this.update_settings();
				this.update_trame();
			})

			const gradient_steps = document.getElementById("gradient_steps");
			const gradient_continuous = document.getElementById("gradient_continuous");
			window.addEventListener("resize", (event) => {
				this.update_panzoom();


				engine_gradient_steps.set_size(gradient_steps.clientWidth, gradient_steps.clientHeight, gradient_steps.clientWidth, gradient_steps.clientHeight);
				engine_gradient_continuous.set_size(gradient_continuous.clientWidth, gradient_continuous.clientHeight, gradient_continuous.clientWidth, gradient_continuous.clientHeight);

				const elapsed = this.elapsed;
				engine_gradient_steps.update(elapsed);
				engine_gradient_continuous.update(elapsed);
			});


			const triggers = {
				lut: ["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"],
				size: ["format_x", "format_y", "resolution", "definition_x", "definition_y"],
				blur: ["blur_size", "blur_threshold"],
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

				else if (triggers.blur.includes(trigger))
				{
					const size = global.blur_size;
					const threshold = global.blur_threshold/255.;
					engine.set_blur(size, threshold);
					engine_gradient_steps.set_blur(size, threshold);
					engine_gradient_continuous.set_blur(size, threshold);
				}

				else
				{
					this.update_settings();
				}
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

			// drag and drop
			const viewport = document.querySelector("#viewport");
			const panzoom_image = document.querySelector("#panzoom_image");
			viewport.addEventListener("drop", (e) => {
  				e.preventDefault();
				let reader = new FileReader()
  				reader.readAsDataURL(e.dataTransfer.files[0])
				reader.onloadend = () => {
				
					panzoom_image.src = reader.result;
					
					engine.load_images({
						image: panzoom_image.src,
					});

					panzoom_image.onload = () => {

						global.format_x = panzoom_image.width;
						global.format_y = panzoom_image.height;
						emitter.emit("update_view", ["format_x"]);

						
						// to replace with toolbar.update_view()
						if (global.media_mode == "print") {
							global.definition_x = Math.round(global.format_x * global.resolution / inch_to_mm);
							global.definition_y = Math.round(global.format_y * global.resolution / inch_to_mm);
						} else {
							global.format_x = Math.round(global.definition_x / global.resolution * inch_to_mm);
							global.format_y = Math.round(global.definition_y / global.resolution * inch_to_mm);
						}
						global.size = humanFileSize(Math.ceil((global.definition_x * global.definition_y)/8), 1, "fr");
						
						console.log(global.definition_x, global.definition_y)
						engine.set_size(global.definition_x, global.definition_y, global.format_x, global.format_y);
						this.update_panzoom();
					}
				}
			})

			viewport.addEventListener("dragover", (e) => { e.preventDefault(); })

			// export image
			emitter.on('save_image', () => {

				const data = engine.get_result_as_array();
				const width = engine.width;
				const height = engine.height;

				// CREATE BIT MAP ARRAY FROM IMAGE PIXELS
				let pixels_bits = [];
				for (var y = 0; y < height; y++) {
					let pixels_bits_x = [];
					for (var x = 0; x < width; x++) {
						let pos = (width * (height-y-1) + x) * 4;
						const red = data[pos];
						if (red > 127) {
							pixels_bits_x[x] = '0';
						} else {
							pixels_bits_x[x] = '1';
						}
					}
					pixels_bits[y] = pixels_bits_x;
				}

				// CREATE BIT STRINGS AND PARSE TO BYTES
				let bytes_lines = [];
				for (var y = 0; y < pixels_bits.length; y++) {
					let ligne = pixels_bits[y];
					let bytes_line = new Uint8Array(Math.ceil(ligne.length/8));
					for (var i = 0; i < ligne.length; i += 8) {

						if (ligne[i+1] === undefined) {
							ligne[i+1] = '0';
						}
						if (ligne[i+2] === undefined) {
							ligne[i+2] = '0';
						}
						if (ligne[i+3] === undefined) {
							ligne[i+3] = '0';
						}
						if (ligne[i+4] === undefined) {
							ligne[i+4] = '0';
						}
						if (ligne[i+5] === undefined) {
							ligne[i+5] = '0';
						}
						if (ligne[i+6] === undefined) {
							ligne[i+6] = '0';
						}
						if (ligne[i+7] === undefined) {
							ligne[i+7] = '0';
						}
						let bit_string = ligne[i] + ligne[i + 1] + ligne[i + 2] + ligne[i + 3] + ligne[i + 4] + ligne[i + 5] + ligne[i + 6] + ligne[i + 7];
						let byte = parseInt(bit_string, 2);
						bytes_line[i/8] = byte;


					}
					bytes_lines[y] = bytes_line;
				}

				saveTIFF(width, height, bytes_lines, "image.tiff");
			});

			// drag and drop custom pattern
			const toolbar = document.querySelector("#toolbar");
			toolbar.addEventListener("drop", (e) => {
  				e.preventDefault();
				let reader = new FileReader()
  				reader.readAsDataURL(e.dataTransfer.files[0])
				reader.onloadend = () => {
					engine.load_images({
						custom_pattern: reader.result,
					});
				}
			})
			
			toolbar.addEventListener("dragover", (e) => { e.preventDefault(); })
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
			if (this.mouse.activity(delta))
			{
				this.force_update = true;
			}

			// this.update_trame();
			if (this.force_update || engine.should_update)
			{
				this.update_trame();
				this.force_update = false;
			}

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
			let will_update = false;

			for (const [key, setting] of Object.entries(settings.screen.settings))
			{
				// process value for trame
				let value = setting.process_to_uniform(setting.value);
				will_update |= engine.set_setting(setting.uniform, value);

				// gradients
				if (setting.gradient_view.bypass) {
					value = setting.gradient_view.default;
				}
				steps.set_setting(setting.uniform, value);
				continuous.set_setting(setting.uniform, value);
			}

			if (!will_update)
			{
				emitter.emit('loading_stop');
			}
		},

		init_panzoom: function() {

			const viewport = $("#viewport");
			const image = $("#panzoom_image");
			const ruler = $("#ruler");

			let image_element = image[0];
			this.panzoom_image = image_element;
			this.panzoom_viewport = viewport;
			this.dom_zoom = document.getElementById("zoom");

			let start_x = viewport.width() / 2 - image.width() / 2;
			let start_y = (viewport.height() - ruler.height()) / 2 - image.height() / 2;

			// INIT PANZOOM WITH RAW IMAGE 
			let panzoom = Panzoom(image_element, {
				canvas: true,
				startScale: 1,
				startX: start_x,
				startY: start_y,
				maxScale: 100,
				minScale: 1,
			});
			
			let parent = image_element.parentElement;
			parent.addEventListener('wheel', panzoom.zoomWithWheel)
			image_element.addEventListener('panzoomchange', (event) => this.update_panzoom());
		},

		update_panzoom: function()
		{
			// image dimensions
			let width = this.panzoom_image.width;
			let height = this.panzoom_image.height;

			// panzoom transform
			const style = window.getComputedStyle(this.panzoom_image)
			const matrix = style.transform;// || style.webkitTransform || style.mozTransform
			const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')
			const scale = parseFloat(matrixValues[0]);

			// css panzoom to webgl panzoom
			let x = parseFloat(matrixValues[4]) + (width - width * scale) / 2;
			let y = parseFloat(matrixValues[5]) + (height - height * scale) / 2;
			y = this.panzoom_viewport.height() - y - height * scale;
			let w = width * scale;
			let h = height * scale;

			// viewport for webgl
			this.panzoom = [x, y, w, h];
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