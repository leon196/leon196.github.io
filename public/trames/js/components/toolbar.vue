<template>

	<!-- LEFT SIDEBAR -->
	<div class="sidebar_left green_shadow oblique_stripes">
		<div class="sidebar_left_settings">

			<!-- //////////////// -->
			<!-- //////////////// -->
			<!-- MODE -->
			<radio id="mode"
				label="Mode"
				:all_values="[{ 
						mode: 'print',
						label_fr: 'Impression',
						label_en: 'Print'
					},
					{
						mode: 'screen',
						label_fr: 'Écran',
						label_en: 'Screen'
					}
				]"
				:current_value="global_settings.media_mode"
				@change_value="{global_settings.media_mode = $event; update_view('media_mode')}">
			</radio>

			<!-- FORMAT  -->
			<div class="field format" v-if="global_settings.media_mode == 'print'">
				<label>Format</label>
				<div class="numbers">
					<number id="format_x"
						:value="global_settings.format_x"
						min_value="1"
						max_value="1024"
						@change_value="{global_settings.format_x = $event; update_view('format_x')}">
					</number>

					<span class="multiply">&times;</span>

					<number id="format_y"
						:value="global_settings.format_y"
						min_value="1"
						max_value="1024"
						@change_value="{global_settings.format_y = $event; update_view('format_y')}">
					</number>
				</div>
				<div class="unit">mm</div>
			</div>

			<!-- DEFINITION  -->
			<div class="field format definition" v-if="global_settings.media_mode == 'screen'">
				<label>Definition</label>
				<div class="numbers">
					<number id="definition_x"
						:value="global_settings.definition_x"
						min_value="1"
						max_value="50000"
						@change_value="{global_settings.definition_x = $event; update_view('definition_x')}">
					</number>

					<span class="multiply">&times;</span>

					<number id="definition_y"
						:value="global_settings.definition_y"
						min_value="1"
						max_value="50000"
						@change_value="{global_settings.definition_y = $event; update_view('definition_y')}">
					</number>
				</div>
				<div class="unit">px</div>
			</div>

			<!-- RESOLUTION -->
			<template v-if="global_settings.media_mode == 'print'">
				<slider id="resolution"
					label="Résolution"
					:value="global_settings.resolution"
					min_value="100"
					max_value="1200"
					step="100"
					unit="dpi"
					@change_value="{global_settings.resolution = $event; update_view('resolution')}">
				</slider>
			</template>



			<!-- //////////////// -->
			<!-- //////////////// -->
			<!-- LEVELS -->
			<div class="field part">NIVEAUX</div>
			<histogram></histogram>
			<slider id="levels_black" label="Point noir" :value="global_settings.levels_black" min_value="0" max_value="128" step="1" unit="false" @change_value="{global_settings.levels_black = $event; update_view('levels_black')}"></slider>
			<slider id="levels_white" label="Point blanc" :value="global_settings.levels_white" min_value="128" max_value="255" step="1" unit="false" @change_value="{global_settings.levels_white = $event; update_view('levels_white')}"></slider>
			<slider id="levels_grey" label="Tons moyens" :value="global_settings.levels_grey" min_value="0" max_value="255" step="1" unit="false" @change_value="{global_settings.levels_grey = $event; update_view('levels_grey')}"></slider>
			<slider id="levels_black_offset" label="Décalage noir" :value="global_settings.levels_black_offset" min_value="0" max_value="128" step="1" unit="false" @change_value="{global_settings.levels_black_offset = $event; update_view('levels_black_offset')}"></slider>
			<slider id="levels_white_offset" label="Décalage blanc" :value="global_settings.levels_white_offset" min_value="0" max_value="128" step="1" unit="false" @change_value="{global_settings.levels_white_offset = $event; update_view('levels_white_offset')}"></slider>
			
			<!-- //////////////// -->
			<!-- //////////////// -->
			<!-- BLUR -->
			<slider id="blur_size" label="Flou Taille" :value="global_settings.blur_size" min_value="1" max_value="11" step="1" unit="false" @change_value="{global_settings.blur_size = $event; update_view('blur_size')}"></slider>
			<slider id="blur_threshold" label="Flou Seuil" :value="global_settings.blur_threshold" min_value="0" max_value="255" step="1" unit="false" @change_value="{global_settings.blur_threshold = $event; update_view('blur_threshold')}"></slider>



			<!-- //////////////// -->
			<!-- //////////////// -->
			<!-- CHANNELS -->
			<div class="field part">COUCHES	</div>
			<channels></channels>
			

			<!-- //////////////// -->
			<!-- //////////////// -->
			<!-- SCREEN -->
			<div class="field part">TRAME</div>

			<!-- SCREEN PRESENTATION -->
			<div class="screen_intro">
				<img class="screen_thumbnail crisp_image" :src="'trames/'+global_settings.current_screen+'/images/thumbnail_ball.gif'">
				<div class="screen_info">
					<div class="screen_title">{{ screen.name }}</div>
					<div class="description">{{ screen.description }}</div>
					<click_button class="screen_edit" text="Modifier" black="true" action="show_screen_picker"></click_button>
				</div>
			</div>

			<!-- SCREEN DYNAMIC SETTINGS -->
			<template v-for="screen_setting in screen.settings" :key="screen_setting.slug">

				<slider v-if="screen_setting.type == 'slider'"
					:id="'screen_'+screen_setting.slug"
					:label="screen_setting.label_fr"
					:value="screen_setting.value"
					:min_value="screen_setting.min"
					:max_value="screen_setting.max"
					:step="screen_setting.step"
					:unit="screen_setting.unit"
					@change_value="{screen_setting.value = $event; update_view('screen / '+screen_setting.slug)}">
				</slider>

				<checkbox v-if="screen_setting.type == 'checkbox'"
					:id="'screen_'+screen_setting.slug"
					:label="screen_setting.label_fr"
					:value="screen_setting.value"
					@change_value="{screen_setting.value = $event; update_view('screen / checkbox / '+screen_setting.slug)}">
				</checkbox>

				<radio v-if="screen_setting.type == 'radio'" 
					:id="'screen_'+screen_setting.slug"
					:label="screen_setting.label_fr"
					:all_values="screen_setting.all_values"
					:current_value="screen_setting.value"
					@change_value="{screen_setting.value = $event; update_view('screen / radio / '+screen_setting.slug)}">
				</radio>

			</template>
		</div>
	

	<!-- //////////////// -->
	<!-- //////////////// -->
	<!-- BOTTOM -->
	<div class="sidebar_bottom">
		<div class="export_data">
			<div class="export_definition">
				{{ global_settings.definition_x }} &times; {{ global_settings.definition_y }} px
			</div>
			<div class="export_size">
				{{ global_settings.size }}
			</div>
		</div>

		<click_button id="save" text="Enregistrer" black="true" action="save_image"></click_button>
	</div>

</div>





</template>



<script>
import radio from './ui_elements/radio.vue'
import click_button from './ui_elements/click_button.vue'
import number from './ui_elements/number.vue'
import slider from './ui_elements/slider.vue'
import checkbox from './ui_elements/checkbox.vue'
import channels from './ui_elements/channels.vue'
import histogram from './ui_elements/histogram.vue'

export default {
	components: {
		radio,
		click_button,
		number,
		slider,
		checkbox,
		channels,
		histogram
	},
	data() {
		return {
			global_settings: settings.global,
			screen: settings.screen,
			image: settings.image
		}
	},
	mounted: function() {
		this.load_image(this.image.source);

		emitter.on('load_screen', (screen_slug) => {
			this.load_screen(screen_slug);
		});
	},
	created: function() {

	},
	computed: function() {

	},
	watch: {

	},

	methods: {
		load_image: function(source) {
			// LOAD IMAGE FROM SOURCE URL
			this.image.image_object = new Image();
			let image_object = this.image.image_object;
			image_object.src = source;

			image_object.onload = () => {
				this.image.ratio = image_object.width / image_object.height;
				emitter.emit('image_loaded')
				this.load_screen(this.global_settings.current_screen);
			}
		},
		load_screen: function(screen_slug) {
			let screen_url = "./trames/" + screen_slug + "/";
			$.getMultiScripts([screen_slug + ".js"], screen_url).done((...results) => {
				let description = eval(results[0][0]);
				// let vertex_shader = eval(results[1][0]);
				// let fragment_shader = eval(results[2][0]);

				this.screen = description();
				settings.screen = description();
				emitter.emit('screen_loaded')
				this.update_view("definition_x");
			});

		
		},
		update_view: function(trigger) {
			//	console.log("UPDATE VIEW", this.screen)

			// CALCULATE IMAGE SIZES WHEN FORMAT IS CHANGED
			if (["media_mode", "definition_x", "definition_y", "format_x", "format_y", "resolution"].includes(trigger)) {
				if (this.global_settings.media_mode == "print") {
					this.global_settings.definition_x = Math.round(this.global_settings.format_x * this.global_settings.resolution / inch_to_mm);
					this.global_settings.definition_y = Math.round(this.global_settings.format_y * this.global_settings.resolution / inch_to_mm);
				} else {
					this.global_settings.format_x = Math.round(this.global_settings.definition_x / this.global_settings.resolution * inch_to_mm);
					this.global_settings.format_y = Math.round(this.global_settings.definition_y / this.global_settings.resolution * inch_to_mm);
				}
				this.global_settings.size = humanFileSize(Math.ceil((this.global_settings.definition_x * this.global_settings.definition_y)/8), 1, "fr");
			}

			settings.screen = this.screen;
			//console.log(this.screen);
			//console.log(this.screen.settings[0].value, settings.screen.settings[0].value);

			emitter.emit('update_view', trigger)

		}
	}
}



</script>


<style>
.tool {
	position: absolute;
	border-top: 1px solid white;
	top: var(--menu_bar_height);
	bottom: 0;
	width: 100vw;
	z-index: 2;
}


/*LEFT SIDEBAR*/
.sidebar_left {
	position: absolute;
	width: var(--sidebar_left_width);
	border-right: var(--gui_border);
	left: 0;
	height: 100%;
	z-index: 2;
	background-color: white;
	padding-top: 0;
	overflow-y: auto;
	overflow-x: hidden !important;
}

.sidebar_left_settings {
	margin-bottom: calc(var(--gui_base_height) * 2);
}

/*GUI ELEMENTS*/
.field,
.screen_intro,
.levels {
	background-color: white;
	border-bottom: var(--gui_border);
	width: 100%;
}

.field.part {
	height: var(--gui_base_height);
	padding: var(--text_button_padding);
	background-color: var(--green);
}

/*SIDEBAR BOTTOM*/
.sidebar_bottom {
	background-color: white;
	position: fixed;
	bottom: 0px;
	width: calc(var(--sidebar_left_width) - 1px);
	border-top: var(--gui_border);
	padding: var(--small_padding);
	z-index: 4;
}

#save {
	position: absolute;
	bottom: var(--block_padding);
	right: var(--block_padding);
}





.format {
	position: relative;
	height: var(--gui_base_height);
}

.format>label {
	display: inline-block;
	padding: var(--small_padding);
	width: var(--legend_width);
	vertical-align: top;
}

span.multiply {
	margin-left: var(--block_padding);
	margin-right: var(--block_padding);
}

.numbers {
	position: absolute;
	left: var(--legend_width);
	height: var(--gui_base_height);
	padding: var(--small_padding);
	padding-left: 0px;
	top: 0px;
}

.unit {
	position: absolute;
	right: 0.75em;
	top: 0.75em;
	color: var(--grey_selected);
	font-size: var(--very_small_text_size);
	line-height: var(--very_small_text_lh);
	z-index: 1;
}

/*SCREEN INTRO*/
.screen_intro {
	position: relative;
	height: calc(var(--legend_width) + 1px);
}

img.screen_thumbnail {
	position: absolute;
	width: var(--legend_width);
	height: var(--legend_width);
}

.screen_info {
	position: absolute;
	top: 0;
	bottom: 0;
	padding: var(--text_button_padding);
	left: var(--legend_width);
	right: 0;
}

.screen_title {
	text-transform: uppercase;
	margin-bottom: 1em;
}

.screen_edit {
	position: absolute;
	bottom: var(--block_padding);
	right: var(--block_padding);
}
</style>