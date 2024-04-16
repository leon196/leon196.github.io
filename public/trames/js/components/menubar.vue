<template>
	<!-- START TEMPLATE -->

		
	<div class="menu_bar">
		
		<div id="title">Dither and the Dots</div>

		<ul id="menu">
			<li v-for="menu_element in general_menu" :key="menu_element.id" @mouseenter="load_dropdown($event, menu_element)" @mouseleave="hide_dropdown($event, 'menu_element', menu_element)">
				<span :class="{selected_menu: menu_element.selected} ">
					{{ menu_element.name }}
				</span>
			</li>
		</ul>
	
		<div class="filename">{{ filename }}</div>

		
		<div class="account">
			<img class="account_icon" src="images/account_icon.svg">
			<div class="account_name">Élise Gay</div>
		</div>
	</div>


	<!-- DROPDOWN -->
	<div class="dropdown" v-if="dropdown != false" :style="{ left: dropdown_x + 'px' }" @mouseleave="hide_dropdown($event, 'dropdown')">
		<ul class="sub_menu green_shadow">
			<li v-for="dropdown_element in dropdown">
				{{ dropdown_element.name }}
			</li>
		</ul>
	</div>



</template>



<script >

export default {
	components: {},
	data() {
		return {
			filename: settings.image.filename,
			general_menu: [{
					name: "Fichier",
					selected: false,
					children: [{
							name: "Ouvrir un fichier",
							menu_method: "open_file"
						},
						{
							name: "Ouvrir2",
							menu_method: "open2"
						},
						{
							name: "Ouvrir3",
							menu_method: "open3"
						}
					]
				},
				{
					name: "Trames",
					selected: false,
					children: [{
							name: "Trame1",
							menu_method: "open_file"
						},
						{
							name: "Trame2",
							menu_method: "open2"
						},
						{
							name: "Trame3",
							menu_method: "open3"
						}
					]
				},
				{
					name: "Interface",
					selected: false,
					children: [{
							name: "Ouvrir un fichier",
							menu_method: "open_file"
						},
						{
							name: "Ouvrir2",
							menu_method: "open2"
						},
						{
							name: "Ouvrir3",
							menu_method: "open3"
						}
					]
				},
				{
					name: "Aide",
					selected: false,
					children: [{
							name: "Ouvrir un fichier",
							menu_method: "open_file"
						},
						{
							name: "Ouvrir2",
							menu_method: "open2"
						},
						{
							name: "Ouvrir3",
							menu_method: "open3"
						}
					]
				},
			],
			dropdown: false,
			dropdown_x: 0,
			msg: 'world!',
			color: 'blue',
			padding_left: 0
		}
	},
	mounted: function() {
		//console.log(getComputedStyle(document.documentElement).getPropertyValue('--legend_width'));
		var title = document.getElementById("title");
		this.padding_left = parseFloat(window.getComputedStyle(title, null).getPropertyValue('padding-left'))
	},
	created: function() {

	},
	computed: function() {
		
	},
	watch: {
	},
	methods: {
		load_dropdown: function(event, menu_element) {
			this.dropdown_x = event.target.getBoundingClientRect().left - this.padding_left;
			menu_element.selected = true;
			this.dropdown = menu_element.children;

		},
		hide_dropdown: function(event, source, menu_element) {
			if (source == "dropdown") {
				this.dropdown = [];
				this.general_menu.forEach(function(item) {
					item.selected = false;
				});
			} else {
				var toElement = event.toElement.parentNode;
				if (toElement.classList.contains('menu_bar')) {
					this.dropdown = [];
					menu_element.selected = false;
				}
			}
		}
	}
}
</script>


<style scoped>
.menu_bar {
	position: relative;
	top: 0;
	left: 0;
	padding: 0;
	background-color: black;
	color: white;
	width: 100vw;
	z-index: 10;
	height: var(--menu_bar_height);
	overflow: hidden;
}

.menu_bar>* {
	display: block;
	padding: var(--small_padding);
}

.title {
	position: absolute;
	font-family: Favorit_bold;
	min-width: 170px;
}

.filename {
	position: absolute;
	top: 0;
	left: var(--sidebar_left_width);
	right: var(--sidebar_right_width);
	text-align: center;
}

ul#menu {
	position: absolute;
	left: var(--legend_width);
	padding-left: 0;
	top: 0px;
}

#menu>li {
	display: inline-block;
	height: 30px;
	top: 0px;
	margin-right: 15px;
	cursor: default;
}

.selected_menu {
	color: var(--green);
}

.dropdown {
	position: absolute;
	color: white;
	left: 0;
	top: var(--menu_bar_height);
	z-index: 9;
	padding: 0;
	opacity: 1;
}

.dropdown>ul {
	background-color: black;
	cursor: pointer;
	padding: var(--small_padding);
	margin: 0;
	padding-top: 0;
}

.dropdown>ul>li {
	list-style-type: none;
	padding-bottom: 0.3rem;
	padding-top: 0.2rem;

}

.dropdown>ul>li:hover {
	color: var(--green);
	transition: color 0.1s linear;
}

.account {
	position: absolute;
	right: 0;
	top: 0;
	cursor: pointer;
}

.account_icon {
	display: inline-block;
	width: 15px;
	margin: 0;
	padding: 0;
	margin-right: 3px;
	vertical-align: top;
	margin-top: -1px;
}

.account_name {
	display: inline-block;
	padding: 0;
}

ul {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	vertical-align: baseline;
}
</style>


//import { LitElement, html, css } from '../libraries/lit3-all.min.js';
// import $ from '../libraries/jquery-3.7.1.min.js'
//import { state } from '../libraries/lit3-all.min.js';


/*
class MenuBar extends LitElement {

///////////////////////////////
// GET VARIABLES FROM PARENT
///////////////////////////////
static get properties() {
return {
mood: { type: String }
}
}

_firstRendered() {
c
}

constructor() {
super();
// alert("ok");
//this.foo = 'Default';
//alert(jQuery().jquery);
// $("body").mousemove(function(event) {
// alert("ok");
// });
// this.shadowRoot.querySelector('slot')
console.log(this.shadowRoot); // log shadow root
console.log(this.shadowRoot.getElementById('draw')); // log null

this.addEventListener('click', function() {
alert("click");
});
// const menu = document.querySelector(".menu")
// menu.addEventListener('click', function() {
// alert("click");
// });

$(document).on("mousemove", "menu-bar", function(event) {
// alert("ok")
});

$(document).on("mousemove", ".menu", function(event) {
alert("ok")
});

connectedCallback() {
super.connectedCallback();
$(document).on("mousemove", "menu-bar > .menu", function(event) {
alert("ok")
});
}


*/