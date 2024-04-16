<template>

	<div id="ruler"></div>
	
</template>


<script>

export default {
	data() {
		return {
		}
	},
	mounted: function() {
	},
	methods: {
	}
}
</script>

<style>
#ruler {
	position: absolute;
	bottom: 0px;
	width: 100%;
	height: var(--gui_base_height);
	border-top: var(--gui_border);
	background-color: white;
	z-index: 2;
}
</style>