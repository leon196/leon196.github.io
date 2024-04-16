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


		<!-- MAIN PREVIEW -->
		<div id="panzoom_container"
			@mousemove="mouse_move_on_preview($event)"
			:class="{ 'show_image' : show_original_image}">
			<img id="panzoom_image" :src="image.source">
		</div>


		<webgl_view id="preview"
			:source_image_width="views.preview.source_image_width"
			:source_image_height="views.preview.source_image_height"
			:source_image_offset_x="views.preview.source_image_offset_x"
			:source_image_offset_y="views.preview.source_image_offset_y"
			:canvas_image_width="views.preview.canvas_image_width"
			:canvas_image_height="views.preview.canvas_image_height"
			:canvas_image_offset_x="views.preview.canvas_image_offset_x"
			:canvas_image_offset_y="views.preview.canvas_image_offset_y"
			:canvas_scale="views.preview.canvas_scale">
		</webgl_view>

		<!-- RULER -->
		<ruler></ruler>

	</div>

	<!-- INIT COLSE-UP BAR -->
	<div id="closeupbar" class="green_shadow">

		<!-- CLOSE UP PREVIEW -->
		<webgl_view id="zoom"
			:source_image_width="views.zoom.source_image_width"
			:source_image_height="views.zoom.source_image_height"
			:source_image_offset_x="views.zoom.source_image_offset_x"
			:source_image_offset_y="views.zoom.source_image_offset_y"
			:canvas_image_width="views.zoom.canvas_image_width"
			:canvas_image_height="views.zoom.canvas_image_height"
			:canvas_image_offset_x="views.zoom.canvas_image_offset_x"
			:canvas_image_offset_y="views.zoom.canvas_image_offset_y"
			:canvas_scale="views.zoom.canvas_scale">
		</webgl_view>

		<!-- GRADIENT PREVIEW -->
		<div id="gradients">

			<!-- STEPS GRADIENTS -->
			<webgl_view id="gradient_steps" :gradient_image_source="grayscale_steps_image_source"></webgl_view>
			<img id="gradients_steps_img" :src="grayscale_steps_image_source" />

			<!-- CONTINUOUS GRADIENTS -->
			<webgl_view id="gradient_continuous" :gradient_image_source="grayscale_continuous_image_source"></webgl_view>
			<img id="gradients_continuous_img" :src="grayscale_continuous_image_source"> -->

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
					source_image_width: 0,
					source_image_height: 0,
					source_image_offset_x: 0,
					source_image_offset_y: 0,
					canvas_image_width: 0,
					canvas_image_height: 0,
					canvas_image_offset_x: 0,
					canvas_image_offset_y: 0,
					canvas_scale: 0
				},
				"zoom": {
					canvas_width: 0,
					canvas_height: 0,
					source_image_width: 0,
					source_image_height: 0,
					source_image_offset_x: 0,
					source_image_offset_y: 0,
					canvas_image_width: 0,
					canvas_image_height: 0,
					canvas_image_offset_x: 0,
					canvas_image_offset_y: 0,
					canvas_scale: 1
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

			this.views.preview.canvas_width = $("#panzoom_container").width();
			this.views.preview.canvas_height = $("#panzoom_container").height();

			let image_view_base_width = $("#panzoom_image").width();
			let image_view_base_height = $("#panzoom_image").height();
			let image_element = $("#panzoom_image")[0];

			let start_x = $("#viewport").width() / 2 - $("#panzoom_image").width() / 2;
			let start_y = ($("#viewport").height() - $("#ruler").height()) / 2 - $("#panzoom_image").height() / 2;

			// INIT PANZOOM WITH RAW IMAGE 
			let panzoom = Panzoom(image_element, {
				//contain: 'inside'
				//step: 0.3,
				canvas: true,
				origin: "top left",
				startScale: 1,
				startX: start_x,
				startY: start_y,
				maxScale: 100,
				minScale: 1,
				pinchAndPan: true
			});

			$("#panzoom_container")[0].addEventListener('wheel', panzoom.zoomWithWheel)


			image_element.addEventListener('panzoomchange', (event) => {

				// CANVAS WIDTH AND HEIGHT
				let c_w = this.views.preview.canvas_width;
				let c_h = this.views.preview.canvas_height;

				// CANVAS IMAGE WIDTH AND HEIGHT
				let ci_w = image_view_base_width * event.detail.scale;
				let ci_h = image_view_base_height * event.detail.scale;

				// CANVAS IMAGE OFFSET VALUE X AND Y
				let co_x = event.detail.x * event.detail.scale;
				let co_y = event.detail.y * event.detail.scale;

				// SOURCE IMAGE WIDTH AND HEIGHT
				let si_w = this.image.image_object.width;
				let si_h = this.image.image_object.height;

				// SOURCE IMAGE OFFSET VALUE X AND Y
				let sio_x = 0;
				let sio_y = 0;
				let view_scale = si_w / ci_w;

				// GET SOURCE IMAGE OFFSET X AND Y FROM TOP AND LEFT OVERFLOWS
				if (co_x < 0) {
					sio_x = -co_x * view_scale;
				}
				if (co_y < 0) {
					sio_y = -co_y * view_scale;
				}

				// NORMALIZE SOURCE IMAGE OFFSET X AND Y
				if (sio_x > si_w) { sio_x = si_w; }
				if (sio_y > si_h) { sio_y = si_h; }

				si_w = ci_w*view_scale;
				si_h = ci_h*view_scale;

				this.views.preview.canvas_image_width = ci_w;
				this.views.preview.canvas_image_height = ci_h;
				this.views.preview.canvas_image_offset_x = co_x;
				this.views.preview.canvas_image_offset_y = co_y;
				this.views.preview.canvas_scale = view_scale;

				this.views.preview.source_image_width = si_w;
				this.views.preview.source_image_height = si_h;
				this.views.preview.source_image_offset_x = sio_x;
				this.views.preview.source_image_offset_y = sio_y;
				
				emitter.emit('update_view')
			});
		},

		mouse_move_on_preview: function(event) {
			let mouse_x = event.layerX;
			let mouse_y = event.layerY;
			// TODO : CALCULATE FROM SCREEN SCALE
			let view_scale = 1; 

			this.views.zoom.canvas_image_width = 3000;
			this.views.zoom.canvas_image_height = 3000;
			this.views.zoom.canvas_image_offset_x = -mouse_x;
			this.views.zoom.canvas_image_offset_y = mouse_y;
			this.views.zoom.canvas_scale = view_scale;

			// this.views.zoom.source_image_width = 300;
			// this.views.zoom.source_image_height = 300;
			// this.views.zoom.source_image_offset_x = -mouse_x;
			// this.views.zoom.source_image_offset_y = -mouse_y;

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
	width: 50%;
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