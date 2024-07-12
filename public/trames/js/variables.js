let inch_to_mm = 25.4;

////////////////////////
////////////////////////
// MASTER GLOBAL VARIABLE
////////////////////////
////////////////////////

let settings = {
	global: {
		media_mode: "print",
		format_x: 500,
		format_y: 500,
		resolution: 200,
		definition_x: 0,
		definition_y: 0,
		size: 0,
		levels_black: 0,
		levels_white: 255,
		levels_grey: 128,
		levels_black_offset:0,
		levels_white_offset:0,
		levels_lut: [],
		current_screen: "patterns",
		start_time: new Date().getTime(),
		time: 0,
		device_pixel_ratio: 1
	},

	screen_set: [
		"patterns",
		"atlas",
		"bayer",
		"euclid",
		"seuil",
		"error_diffusion",
		"voronoi",
		"reaction_diffusion",
		"quadtree",
		"mask",
		"dbs",
		"stipple",
		// "dbscpp",
		// "error_bloc",
	],
	
	all_screens: {},
	screen: {
		loaded: false
	},

	image: {
		source: "images/chat_carre.png",
		filename: "image.jpg",
	},

	generator: {
		output_array: null
	},

	engine: {}
};

////////////////////////////
////////////////////////////






// HELPER FUNCTION TO GET MULTIPLE SCRIPTS AND CALLBACK WHEN ALL LOADED

$.getMultiScripts = function(arr, path) {
	var _arr = $.map(arr, function(scr) {
		return $.getScript((path || "") + scr);
	});

	_arr.push($.Deferred(function(deferred) {
		$(deferred.resolve);
	}));

	return $.when.apply($, _arr);
}


// HELPER FUNCTION TO CONVERTE BYTES TO HUMAN READABLE FORMAT
function humanFileSize(bytes, dp=1, language) {
  const thresh = 1000;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  let units; 
  	if (language == "en") {
    	units = ['kB', 'MB', 'GB', 'TB', 'PB'] 
  	} else {
  		units = ['Ko', 'Mo', 'Go', 'To', 'Po'] 
  	}
  let u = -1;
  const r = 10**dp;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return bytes.toFixed(dp) + ' ' + units[u];
}