<template>

	<div class="field channel"
		v-for="channel in channels" :key="channel.id">


		<!-- DISPLAY CHANNEL -->
		<div class="display">
			<!-- SHOW CHANNEL BUTTON -->
			<img v-if="channel.visible" class="show_channel" src="images/channel_on_icon.svg" @click="show_channel(channel.id)">
			<img v-else class="show_channel" src="images/channel_off_icon.svg" @click="show_channel(channel.id)">

			<!-- CHANNEL NAME -->
			<label>{{ channel.label }}</label>
		</div>

		<!-- ACTIVE CHANNEL BUTTON -->
		<input class="channel_checkbox"
			type="checkbox"
			:id="'channel_'+channel.id"
			:name="'channel_'+channel.id"
			:checked="channel.active"
			@click="activate_channel(channel.id, $event)" />

	</div>

</template>



<script>
///////////////////
// CHANNELS LOGIC

// $(".show_channel").click(function() {
// 	var channel_state = $(this).attr("data-show");
// 	if (channel_state == "true") {

// 		console.log($(".show_channel[data-show='true']"));
// 		if ($(".show_channel[data-show='true']").length == 1) {
// 			channel_state = true;
// 			alert("Une couche doit au moins être visualisée.");
// 		} else {
// 			channel_state = false;
// 			$(this).attr("src", "images/channel_off_icon.svg");
// 		}


// 	} else {
// 		channel_state = true;
// 		$(this).attr("src", "images/channel_on_icon.svg");
// 	}
// 	$(this).attr("data-show", channel_state);
// });

export default {
	data() {
		return {
			channels: [{
					id: 0,
					label: "Cyan",
					active: true,
					visible: true
				},
				{
					id: 1,
					label: "Magenta",
					active: true,
					visible: true
				},
				{
					id: 2,
					label: "Jaune",
					active: false,
					visible: true
				},
				{
					id: 3,
					label: "Noir",
					active: true,
					visible: true
				},
			]
		}
	},
	methods: {
		show_channel: function(id, event) {

			if (this.channels[id].visible) {
				this.channels[id].visible = false;
			} else {
				this.channels[id].visible = true;
			}

			let count_visible = 0;
			for (let channel of this.channels) {
				if (channel.visible) {
					count_visible++;
				}
			}

			if (count_visible == 0) {
				this.channels[id].visible = true;
				alert("Impossible de désactiver la visibilité de toutes les couches.")
			}
		},

		activate_channel: function(id, event) {
			//alert(id)
			if (this.channels[id].active) {
				this.channels[id].active = false;
			} else {
				this.channels[id].active = true;
			}

			let count_active = 0;
			for (let channel of this.channels) {
				if (channel.active) {
					count_active++;
				}
			}
			if (count_active == 0) {
				// BUG ICI À RÉSOUDRE
				// console.log(this.channels[id]);
				// this.channels[id].active = true;
				// console.log(this.channels[id]);
				alert("Impossible de désactiver toutes les couches.");
			}
		}
	}
}
</script>



<style scoped>
/*RADIO*/
.field.channel {
	position: relative;
	height: var(--gui_base_height);
	padding: var(--text_button_padding);
}

.display {
	position: absolute;
}

.display>* {
	position: relative;
	display: inline-block;
	vertical-align: top;
}

.show_channel {
	margin-left: -2px;
	margin-right: 5px;
	width: 23px;
	cursor: pointer;
}

input.channel_checkbox {
	top: 8px;
}


input.channel_checkbox {
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

input.channel_checkbox::before {
	content: "";
	width: 0.65em;
	height: 0.65em;
	border-radius: 50%;
	transform: scale(0);
	box-shadow: inset 1em 1em black;
	transition: var(--gui_transition);
}

input.channel_checkbox:checked::before {
	transform: scale(1.5);
}

input.channel_checkbox:hover {
	background-color: var(--green);
}

input.channel_checkbox:hover::before {
	box-shadow: none;
}
</style>