<template>

	<div :id="id" class="button" :class="{black_button:black}" @click="trigger_event(action)">
		{{ text }}
	</div>

</template>




<script>
export default {
	props: ["id", "text", "black", "action"],
	data() {
		return {
			black: (this.black === "true" || this.black === true)
		}
	},
	methods: {
		trigger_event: function(action) {
			emitter.emit(action)
		}
	}
}
</script>

<style>

.button {
	background-color: white;
	border: 1px solid black;
	height: var(--gui_base_height);
	border-radius: var(--gui_base_height);
	padding: var(--text_button_padding);
	white-space: nowrap;
	transition: var(--gui_transition);
	cursor: pointer;
}

.button:hover {
	background-color: var(--green);
}

.black_button {
	background-color: black;
	color: white;
	text-transform: uppercase;
	height: var(--gui_base_height) ;
}

.black_button:hover {
	color: black;
	background-color: var(--green);
	border: 1px solid black;
}

</style>