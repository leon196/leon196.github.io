<template>


	<div class="field slider" :id="id" :value="value" :min_value="min_value" :max_value="max_value" :step="step">
		<label :for="id"> {{ label }}</label>
		<div class="range_track">
			<div class="range_control"
				:style="'left:'+range_x_pos+'px;'">
				{{ slider_value }}
			</div>
		</div>

		<div v-if="unit != 'false'" class="unit">
			{{ unit }}
		</div>
	</div>


</template>




<script>
export default {
	props: ["id", "label", "value", "min_value", "max_value", "step", "unit"],
	data() {
		return {
			slider_value: this.value,
			legend_width: 0,
			sidebar_left_width: 0,
			range_x_pos: 0
		}
	},
	mounted: function() {
		this.legend_width = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--legend_width'), 10);
		let legend_width = this.legend_width;
		this.sidebar_left_width = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar_left_width'), 10);
		let sidebar_left_width = this.sidebar_left_width;
		
		let min = parseFloat(this.min_value);
		let max = parseFloat(this.max_value);
		let step = parseFloat(this.step);
		let value = parseFloat(this.slider_value);

		let $range_control = $('#' + this.id).children(".range_track").children(".range_control");
		let max_x = sidebar_left_width - legend_width - $range_control.outerWidth();
		this.range_x_pos = normalize(value, min , max, 0, max_x);

		let current = this;

		// INIT DRAGGABLE
		$range_control.draggable({
			axis: "x",
			containment: "parent",
			scroll: false,
			start: function(event) {
				event.target.classList.add("green_shadow");
			},
			drag: function(event) {
				let x_pos = event.target.getBoundingClientRect().left - legend_width;
				let max_x = sidebar_left_width - legend_width - event.target.getBoundingClientRect().width;
				let final_value = Math.round(normalize(x_pos, 0, max_x, min, max));
				if (step != 1) {
					final_value = Math.round(final_value / step) * step;
				}
				current.slider_value = final_value;
				current.$emit('change_value', final_value);
			},
			stop: function(event) {
				event.target.classList.remove("green_shadow");
			}
		});

	},
	methods: {
		update_settings: function() {
			// alert("ok")
		}
	}
}


function normalize(value, a, b, c, d) {
	value = (value - a) / (b - a);
	return c + value * (d - c);
}

</script>

<style scoped>
.slider {
	position: relative;
	height: var(--gui_base_height);
}

.slider>label {
	display: inline-block;
	padding: var(--small_padding);
	width: var(--legend_width);
	vertical-align: top;
}

.range_track {
	position: absolute;
	height: var(--gui_base_height);
	left: var(--legend_width);
	right: 0px;
	top: 0px;
	z-index: 2;
}

.range_control {
	position: absolute;
	top: -1px;
	width: 3em;
	height: calc(var(--gui_base_height) + 1px);
	padding: var(--number_button_padding);
	padding-left: 0;
	padding-right: 0;
	border-radius: var(--gui_base_height);
	transition: var(--gui_transition);
	cursor: pointer;
	background-color: white;
	border: var(--gui_border);
	z-index: 2;
	text-align: center;
	/*opacity: 0;*/
}
</style>