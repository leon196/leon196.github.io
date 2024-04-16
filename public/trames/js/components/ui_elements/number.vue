<template>

	<!-- EDITABLE NUMBER -->
	<span class="number" contenteditable :id="id" v-on:mouseover="getFocus($event)" v-on:focus="getFocus($event)" v-on:keyup="getFocus($event)" v-on:paste="getFocus($event)" v-on:input="getFocus($event)" v-on:focusout="looseFocus($event)" v-on:mouseout="looseFocus($event)">
		{{ number_value }}
	</span>

	<!-- FOCUS BOX -->
	<div v-if="focus" class='numbers_hover light_green_shadow' :style="'width:'+this.focus_w+'px; left:'+this.focus_x+'px; top:'+this.focus_y+ 'px;'">
	</div>

</template>


<script>

export default {
	props: ["id", "value", "max_value", "min_value"],
	data() {
		return {
			number_value: this.value,
			focus: false,
			padding_left: 0,
			gui_base_height: 0,
			focus_x: 0,
			focus_y: 0,
			focus_w: 0
		}
	},
	mounted: function() {
		// GET GLOBAL CSS VARIABLES
		var title = document.getElementById("title");
		this.padding_left = parseFloat(window.getComputedStyle(title, null).getPropertyValue('padding-left'))
		this.gui_base_height = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gui_base_height'), 10);


		// CLEAR PASTED VALUES AND RETURNS
		$('[contenteditable]').on('paste', function(e) {
			var $self = $(this);
			setTimeout(function() { $self.html($self.text()); }, 0);
		}).on('keypress', function(e) {
			return e.which != 13;
		});

	},
	methods: {
		getFocus: function(event) {
			let box = event.target.getBoundingClientRect();
			let p_box = event.target.parentNode.getBoundingClientRect();
			this.focus_x = box.left - p_box.left - this.padding_left * 1.2;
			this.focus_y = box.top - p_box.top - this.gui_base_height / 2 - 1;
			this.focus_w = box.width + this.padding_left * 2.4;
			this.focus = true;


		},
		looseFocus: function(event) {
			let isFocused = (document.activeElement === event.target);
			if (!isFocused) {

				// VALIDATE VALUE
				let entree = parseInt(event.target.innerText, 10);
				if (entree != this.number_value) {

					if (entree > this.max_value) { // OVER MAX
						this.number_value = this.max_value;
						event.target.innerText = this.max_value;
						alert("La valeur maximale de ce champ est " + this.max_value + ".");
						this.$emit('change_value', this.max_value)
	
					} else if (entree < this.min_value) { // UNDER MIN
						this.number_value = this.min_value;
						event.target.innerText = this.min_value;
						alert("La valeur minimale de ce champ est " + this.min_value + ".");
						this.$emit('change_value', this.min_value)
	
					} else if (isNaN(entree)) { // NOT A NUMBER
						event.target.innerText = this.number_value;
	
					} else { // THEN APPLY VALUE
						this.number_value = entree;
						event.target.innerText = entree;
						this.$emit('change_value', entree)
					}
				}
				// DISCARD FOCUS BOX
				this.focus = false;
			}
		}
	}
}
</script>

<style>
.number {
	position: relative;
	display: inline-block;
	z-index: 4;
}

.numbers_hover {
	position: absolute;
	height: calc(var(--gui_base_height) * 1.5);
	background-color: white;
	border: var(--gui_border);
	z-index: 3;
	pointer-events: none;
}
</style>