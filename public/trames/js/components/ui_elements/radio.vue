<template>


	<div class="field radio_group">

		<div class="global_label">
			{{ label }}
		</div>

		<div class="radio_blocs">
			<div class="radio_bloc" v-for="value in all_values" :key="value.mode">
				<label :for="'radio_'+value.mode">{{ value.label_fr }} </label>
				<input type="radio" :id="'radio_'+value.mode" :name="'radio_'+value.mode" :value="value.mode" v-model="radio_value" v-on:change="$emit('change_value', radio_value)" />
			</div>
		</div>
	</div>


</template>




<script>
export default {
	props: ["id", "label", "all_values", "current_value"],
	data() {
		return {
			radio_value: this.current_value
		}
	},
	methods: {
	}
}
</script>

<style>
/*RADIO*/
.global_label {
	display: table-cell;
	min-width: var(--legend_width);
	vertical-align: top;
	padding: var(--small_padding);
}

.radio_blocs {
	display: table-cell;
	width: 100%;
	vertical-align: top;
}

.radio_bloc {
	position: relative;
	width: inherit;
	padding: var(--small_padding);
	border-bottom: var(--gui_border);
	height: var(--gui_base_height);
}

.radio_bloc:last-child {
	border-bottom: none;
}

.radio_bloc>label {
	position: absolute;
	left: 0;
	width: 100%;
	cursor: pointer;
}

input[type="radio"] {
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

input[type="radio"]::before {
	content: "";
	width: 0.65em;
	height: 0.65em;
	border-radius: 50%;
	transform: scale(0);
	box-shadow: inset 1em 1em black;
	transition: var(--gui_transition);
}

input[type="radio"]:checked::before {
	transform: scale(1.5);
}

input[type="radio"]:hover {
	background-color: var(--green);
}

input[type="radio"]:hover::before {
	box-shadow: none;
}
</style>