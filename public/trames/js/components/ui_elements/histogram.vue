<template>


	<div class="levels">
		<div class="levels_title">Histogramme</div>
		<svg id="levels_visualisation" xmlns="http://www.w3.org/2000/svg">
			<path class="curve" :d="path_code" />
			<ellipse class="debug curve_midpoint" cx="0" cy="0" rx="5" ry="5" />
			<ellipse class="debug curve_handle" cx="0" cy="0" rx="5" ry="5" />
		</svg>
		<canvas id="histogram"></canvas>
	</div>


</template>




<script>
export default {
	data() {
		return {
			global_settings: settings.global,
			path_code: "M0 0"

		}
	},
	mounted: function() {
		emitter.on('update_view', (trigger) => {
			if (["levels_black", "levels_white", "levels_grey", "levels_black_offset", "levels_white_offset"].includes(trigger)) {
				
				let black = this.global_settings.levels_black;
				let white = this.global_settings.levels_white;
				let grey = this.global_settings.levels_grey;
				let black_offset = this.global_settings.levels_black_offset;
				let white_offset = this.global_settings.levels_white_offset;

				let histogram_width = $("#levels_visualisation").width();
				let histogram_height = $("#levels_visualisation").height();

				let x1 = normalize(black, 0, 255, 0, histogram_width);
				let y1 = normalize(black_offset, 0, 255, histogram_height, 0);
				let x2 = normalize(white, 0, 255, 0, histogram_width);
				let y2 = normalize(white_offset, 0, 255, 0, histogram_height);

				let mx = (x1 + x2) / 2;
				let my = (y1 + y2) / 2;

				let handle_x = normalize(grey, 0, 255, x1, x2);
				let handle_y = normalize(grey, 0, 255, y2, y1);

				// DRAW CURVE ON SVG
				this.path_code = "M 0 " + y1 + " L " + x1 + " " + y1 + " Q " + handle_x + " " + handle_y + " " + x2 + " " + y2 + " L " + histogram_width + " " + y2;

				// DEBUG HANDLE POINT
				// $("ellipse.curve_midpoint").attr({
				// 	"cx": mx,
				// 	"cy": my
				// });

				// $("ellipse.curve_handle").attr({
				// 	"cx": handle_x,
				// 	"cy": handle_y
				// });

				// PREPARE VALUES FOR LUT
				let b_x1 = normalize(black, 0, 255, 0, 1);
				let b_y1 = normalize(black_offset, 0, 255, 1, 0);
				let b_x2 = normalize(white, 0, 255, 0, 1);
				let b_y2 = normalize(white_offset, 0, 255, 0, 1);
				let b_handle_x = normalize(grey, 0, 255, b_x1, b_x2);
				let b_handle_y = normalize(grey, 0, 255, b_y2, b_y1);

				//////////////////////////////////
				//////////////////////////////////
				// INIT LUT
				// WILL CONTAIN THE 256 MULTIPLICATION COEFS
				let levels_lut = [];
				let count = 0;

				// FILL LUT WITH BLACK STATIC VALUES
				for (var i = 0; i < black; i++) {
					levels_lut[count] = 255 - b_y1 * 255;
					count++;
				}

				// FILL LUT WITH BEZIER CALCULATION
				var steps = white - black;
				var step = 1 / steps;
				for (var i = 0; i < 1; i += step) {
					levels_lut[count] = 255 - bezier_y_from_x(i, b_y1, b_handle_y, b_handle_y, b_y2) * 255;
					count++;
				}

				// FILL LUT WITH WHITE STATIC VALUES
				for (var i = 0; i < 256 - white; i++) {
					levels_lut[count] = 255 - b_y2 * 255;
					count++;
				}

				this.global_settings.levels_lut = levels_lut;
				emitter.emit('update_view', "levels_lut");
			}
		})
		emitter.emit('update_view', "levels_black");

	},
	watch: {
	},
	methods: {
	}
}


function normalize(value, a, b, c, d) {
	value = (value - a) / (b - a);
	return c + value * (d - c);
}

function bezier_y_from_x(x, y1, y2, y3, y4) {
	// POSITIONS Y2 = Y3 FOR QUADRATIC BEZIER
	var y = Math.pow(1 - x, 3) * y1 + 3 * Math.pow(1 - x, 2) * x * y2 + 3 * (1 - x) * Math.pow(x, 2) * y3 + Math.pow(x, 3) * y4;
	return y;
}
</script>

<style scoped>
.levels {
	padding: var(--small_padding);
	position: relative;
	height: var(--histogram_height);
}

canvas#histogram,
svg#levels_visualisation {
	position: absolute;
	right: 0;
	top: 0;
	width: calc(var(--sidebar_left_width) - var(--legend_width) - 1px);
	height: calc(var(--histogram_height) - 1px);
	background-color: transparent;
}

svg#levels_visualisation {
	z-index: 3;
}

canvas#histogram {
	background-color: lightgrey;
	z-index: 2;
}

path.curve {
	stroke: black;
	stroke-dasharray: 2, 2;
	fill: transparent;
}

ellipse.debug {
	display: none;
}
</style>