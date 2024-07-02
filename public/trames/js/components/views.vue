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
		init_panzoom: function() {

			const viewport = $("#viewport");
			const container = $("#panzoom_container");
			const image = $("#panzoom_image");
			const ruler = $("#ruler");

			let image_element = image[0];
			this.panzoom_image = image_element;

			let start_x = viewport.width() / 2 - image.width() / 2;
			let start_y = (viewport.height() - ruler.height()) / 2 - image.height() / 2;

			// INIT PANZOOM WITH RAW IMAGE 
			let panzoom = Panzoom(image_element, {
				canvas: true,
				startScale: 1,
				startX: start_x,
				startY: start_y,
				maxScale: 100,
				minScale: 0.1,
			});
			
			let parent = image_element.parentElement;
			parent.addEventListener('wheel', panzoom.zoomWithWheel)
			image_element.addEventListener('panzoomchange', (event) => {
				
				// image dimensions
				let width = this.image.image_object.width;
				let height = this.image.image_object.height;

				// panzoom transform
				// todo: check panzoom doc to get matrix instead of parsing css
				const style = window.getComputedStyle(this.panzoom_image)
				const matrix = style.transform;// || style.webkitTransform || style.mozTransform
				const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')
				const scale = parseFloat(matrixValues[0]);
				const x = parseFloat(matrixValues[4]) + (width - width * scale) / 2;
				const y = parseFloat(matrixValues[5]) + (height - height * scale) / 2;

				this.views.preview.viewport_width = width * scale;
				this.views.preview.viewport_height = height * scale;
				this.views.preview.viewport_x = x;
				this.views.preview.viewport_y = - height * scale - y;
				
				emitter.emit('update_view')
			});
		},

		mouse_move_on_preview: function(event)
		{
			let mouse_x = event.offsetX;
			let mouse_y = event.offsetY;

			let width = this.panzoom_image.width;
			let height = this.panzoom_image.height;

			this.views.zoom.zoom_x = mouse_x/width;
			this.views.zoom.zoom_y = 1-mouse_y/height;

			emitter.emit('update_view')

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
	text-align: center;
}

#panzoom_container {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: var(--gui_base_height);
	background-color: var(--viewport_background);
	opacity: 0;
	z-index:3 ;
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