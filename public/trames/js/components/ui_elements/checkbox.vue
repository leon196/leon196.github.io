<template>

	<div class="field checkbox_field">
		<label :for="id">{{ label }}</label>
		<input class="checkbox" type="checkbox" :id="id" :name="id" v-model="value" v-on:change="$emit('change_value', value)" />

		<div class="checkbox_feedback">
			<template v-if="value == true">
				activé
			</template>
			<template v-else>
				desactivé
			</template>
		</div>
	</div>

</template>



<script>
export default {
	props: ["id", "label", "value"],
	data() {
		return {
			value: (this.value === "true" || this.value === true)
		}
	},
	methods: {
		
	}
}
</script>



<style scoped>
/*RADIO*/
.checkbox_field {
	position: relative;
	height: var(--gui_base_height);
	padding: var(--text_button_padding);
}

.checkbox_field > label {
	position: absolute;
	width: var(--sidebar_left_width);
	cursor: pointer;
}

input.checkbox {
	top: 8px;
}

.checkbox_feedback {
	padding: var(--text_button_padding);
	position: absolute;
	right: 20px;
	top: 0;
	pointer-events: none;
}


input.checkbox {
	position: absolute;
	cursor: pointer;
	right: var(--block_padding);
	/* Add if not using autoprefixer */
	-webkit-appearance: none;
	/* Remove most all native input styles */
	appearance: none;
	/* For iOS < 15 */
	background-color: white;
	/* Not removed via appearance */
	margin: 0;

	color: black;
	width: 1em;
	height: 1em;
	border: var(--gui_border);
	border-radius: 50%;
	transform: translateY(-0.075em);
	display: grid;
	place-content: center;
	transition: all 0.2s ease-in-out;
}

input.checkbox::before {
	content: "";
	width: 0.65em;
	height: 0.65em;
	border-radius: 50%;
	transform: scale(0);
	box-shadow: inset 1em 1em black;
	transition: var(--gui_transition);
}

input.checkbox:checked::before  {
	transform: scale(1.5);
}

input.checkbox:hover {
	background-color: var(--green);
}

input.checkbox:hover::before {
	box-shadow: none;
}


</style>