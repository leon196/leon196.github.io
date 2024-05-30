<template>

	<!-- INIT VIEWPORT -->
	<div id="screen_picker" class="modal" @click.self="$emit('hide_screen_picker')">

		<div class="modal_title">ALGORITHMES</div>
		<div class="modal_content">

			<div class="screen_picker_block" v-for="screen in all_screens" :key="screen.slug" @click="load_screen(screen.slug)">

				<div class="screen_picker_data">
					<div class="screen_picker_title"> {{ screen.name }} </div>
					<div class="screen_picker_description">{{ screen.description }}</div>
					<a class="screen_more_info" :href="screen.url_info" target="_blank">en savoir plus</a>
				</div>

				<div class="thumbnails">
					<img class="thumbnail_ball crisp_image" :src="'./trames/'+screen.slug+'/images/'+thumbnail_ball_source">
					<div class="thumbnail_gradient crisp_image" :style="'background-image:url(./trames/'+screen.slug+'/images/'+thumbnail_gradient+')'"></div>
				</div>

			</div>



		</div>
	</div>

</template>



<script>
export default {

	data() {
		return {
			screen_set: settings.screen_set,
			thumbnail_ball_source: "thumbnail_ball.gif",
			thumbnail_gradient: "thumbnail_gradient.gif",
			all_screens: settings.all_screens
		}
	},
	mounted: function() {

		//
		if (Object.keys(settings.all_screens).length < 1) {
			let screen_descriptions = [];
			for (let screen_slug of this.screen_set) {
				screen_descriptions.push(screen_slug + '/' + screen_slug + '.js')
			}

			$.getMultiScripts(screen_descriptions, './trames/').done((...results) => {
				// FOR EACH LOADED DESCRIPTION, STORE IN GLOBAL VARIABLE
				for (let i = 0; i < results.length - 1; i++) {
					let result = results[i][0];
					let description = eval(result)();
					this.all_screens[description.slug] = description;
					settings.all_screens[description.slug] = description;
				}
			});
		} else {
			this.all_screens = settings.all_screens;
		}


	},

	created: function() {

	},
	computed: function() {

	},
	watch: {

	},
	methods: {
		load_screen: function(screen_slug) {
			emitter.emit("load_screen", screen_slug);
			this.$emit('hide_screen_picker');
		}
	}
}
</script>


<style scoped>
#screen_picker {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background-color: var(--transparent_green);
	z-index: 10;
	cursor:url(./images/cross_30.png) 15 15, auto;
}

.modal_content {
	margin-top: var(--block_padding);
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: var(--block_padding);
	row-gap: var(--block_padding);
	cursor: default;
}

.modal_title {
	cursor: default;
}

.screen_picker_block {
	border: var(--gui_border);
	background-color: white;
	cursor: pointer;
	transition: var(--gui_transition);
	
}

.screen_picker_block:hover {
	box-shadow: 3px 3px 15px 1px black;
	/*opacity: 0.8;*/
}

.screen_picker_data {
	position: relative;
	display: table;
	text-align: left;
	padding: var(--block_padding);
	padding-bottom: 0.15rem;
	border-bottom: var(--gui_border);
	width: 100%;
}

.screen_picker_data>* {
	display: table-cell;
	position: relative;
	vertical-align: baseline
}

.screen_picker_title {
	text-transform: uppercase;
	white-space: nowrap;
	width: 50px;
	font-size: var(--medium_text_size);
	line-height: var(--medium_text_size_lh);
}

.screen_picker_description {
	width: auto;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.screen_more_info {
	position: relative;
	width: 50px;
	white-space: nowrap;
	text-align: right;
}

.thumbnails {
	position: relative;
	height: 50px;

}

.thumbnail_ball {
	position: absolute;
	left: 0px;
	top: 0px;
	height: 50px;
}

.thumbnail_gradient {
	position: absolute;
	left: 50px;
	top: 0px;
	right: 0;
	bottom: 0px;
	background-size: cover;
}
</style>