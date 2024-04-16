<template>

	<menubar></menubar>
	<toolbar></toolbar>
	<views></views>

	<screen_picker v-if="screen_picker" @hide_screen_picker="screen_picker = false;"></screen_picker>

</template>



<script>
import menubar from './menubar.vue'
import toolbar from './toolbar.vue'
import views from './views.vue'
import screen_picker from './screen_picker.vue'


export default {
	components: {
		menubar,
		toolbar,
		views,
		screen_picker
	},
	data() {
		return {
			screen_picker: false
		}
	},
	mounted: function() {
		emitter.on('show_screen_picker', (trigger) => {
			this.screen_picker = true
		});

	},

	created: function() {

	},
	computed: function() {

	},
	watch: {

	},
	methods: {

	}
}
</script>


<style scoped>



</style>