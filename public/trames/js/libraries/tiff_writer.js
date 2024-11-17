function saveTIFF(width, height, bytes_lines, filename) {
	let padding = 0;

	// One byte = 8 pixels in line encoded as binary
	// Ex: 182 (0xB6) = 10110110
	// Ex: 34  (0x22) = 00100010
	// If pixel number of one line is different than 8, only the first binary digit are kept (101 are the 3 first binary digits of 182)
	let byte_count = Math.ceil(width / 8) * height;



	// PRELUDE
	endianness = new Uint8Array([77, 77]); // 4D4D -> DEFAULT FLAG FOR TIFF
	magic_number = new Uint8Array([0, 42]); // 002A -> DEFAULT FLAG FOR TIFF
	first_ifd_offset = new Uint8Array([0, 0, 0, 20]); // 0000 0014 -> ALWAYS START FIRST IFD FROM 20 OFFSET
	padding_to_20 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 00000000 00000000 00000000 PADDING TO 20 OFFSET
	let prelude = mergeUint8Arrays(endianness, magic_number, first_ifd_offset, padding_to_20)

	// IFD FLAGS
	let params = [];
	params.push({
		// NewSubfileType
		// A general indication of the kind of data contained in this subfile.
		// Leave 0 to set all the 3 bitflags to normal in the usecase of this library
		name: "NewSubfileType",
		tag: 254, // 0x00FE
		type: "long",
		count: 1,
		value: 0
	});

	// Image Width
	params.push({
		name: "ImageWidth",
		tag: 256, // 0x0100
		type: "long",
		count: 1,
		value: width
	});

	// Image Height
	params.push({
		name: "ImageHeight",
		tag: 257, // 0x0101
		type: "long",
		count: 1,
		value: height
	});

	// Compression
	// 0: 		No compression
	// 1: 		No compression, but pack data into bytes as tightly as possible leaving no unused bits except at the end of a row.
	// 2: 		CCITT Group 3, 1-Dimensional Modified Huffman run-length encoding
	// 32773: 	PackBits compression, a simple byte-oriented run-length scheme
	params.push({
		name: "Compression",
		tag: 259, // 0x0103
		type: "short",
		count: 1,
		value: 1
	});

	// Photometric Interpretation
	// 0: WhiteIsZero
	// 1: BlackIsZero.
	params.push({
		name: "PhotometricInterpretation",
		tag: 262, // 0x0106
		type: "short",
		count: 1,
		value: 0
	});

	// Strip Offsets
	// For each strip, the byte offset of that strip.
	// = strip localisation in file
	params.push({
		name: "StripOffsets",
		tag: 273, // 0x0111
		type: "long",
		count: 1,
		value: 182 // 0x0000 00B6
	});

	// Rows Per Strip
	// The number of rows in each strip (except possibly the last strip.)
	// For example, if ImageLength is 24, and RowsPerStrip is 10, then there are 3
	// strips, with 10 rows in the first strip, 10 rows in the second strip, and 4 rows in the
	// third strip.
	params.push({
		name: "RowsPerStrip",
		tag: 278, // 0x0116
		type: "long",
		count: 1,
		value: height
	});

	// StripByteCounts
	// For each strip, the number of bytes in that strip after any compression.
	params.push({
		name: "StripByteCounts",
		tag: 279, // 0x0117
		type: "long",
		count: 1,
		value: byte_count
	});

	// X Resolution
	params.push({
		name: "XResolution",
		tag: 282, // 0x011A
		type: "long",
		count: 1,
		value: 72
	});

	// Y Resolution
	params.push({
		name: "YResolution",
		tag: 283, // 0x011B
		type: "long",
		count: 1,
		value: 72
	});

	// Software
	params.push({
		name: "Software",
		tag: 305, // 0x0131
		type: "long",
		count: 1,
		value: 0
	});

	// DateTime
	params.push({
		name: "DateTime",
		tag: 306, // 0x0132
		type: "long",
		count: 1,
		value: 0
	});

	//////////////////
	// COMPILE ALL IFD PARAMETERS
	//////////////////

	let params_array = [];
	for (var i = 0; i < params.length; i++) {
		let param = params[i];

		// TAG
		let tag = shortToUint8Array(param.tag);

		// COUNT
		let count = longToUint8Array(param.count);

		// TYPE
		let type, value;

		if (param.type == "long") {
			type = new Uint8Array([0, 4]);
			value = longToUint8Array(param.value);

		} else if (param.type == "short") {
			type = new Uint8Array([0, 3]);
			value = shortToUint8Array(param.value);
			// ADD 2 BYTES PADDING TO SHORT
			value = mergeUint8Arrays(value, new Uint8Array([0, 0]));
		}

		params_array[i] = mergeUint8Arrays(tag, type, count, value);
	}

	let params_count = shortToUint8Array(params_array.length);
	let ifd_array = mergeUint8Arrays(params_count, ...params_array);



	//////////////////
	// GENERATE FILE WITH DATA
	//////////////////

	// ADD PADDING TO START AT OFFSET 182 (0xB6)
	let padding_to_0xB6 = new Uint8Array(16); // StripOffsets = 182 = 0xB6

	// MERGE ALL LINES INTO ONE LARGE TYPED ARRAY
	let image_data = mergeUint8Arrays(...bytes_lines);
	//let image_data = new Uint8Array([34, 182, 255, 255, 255, 255, 255, 181]);

	// Compose the blob by the concatenation of Prelude, IFD Array, Padding to 0xB6 abd Image Data
	let blob = new Blob([prelude, ifd_array, padding_to_0xB6, image_data], { type: 'image/tiff' });

	let link = document.createElement('a');
	link.download = filename;
	link.href = URL.createObjectURL(blob);
	link.click();
	URL.revokeObjectURL(link.href);
}












// MERGE MULTIPLES UINT8 ARRAYS
function mergeUint8Arrays(...arrays) {
	const totalSize = arrays.reduce((acc, e) => acc + e.length, 0);
	const merged = new Uint8Array(totalSize);

	arrays.forEach((array, i, arrays) => {
		const offset = arrays.slice(0, i).reduce((acc, e) => acc + e.length, 0);
		merged.set(array, offset);
	});

	return merged;
}


// NUMBER TO 4 BYTES LONG
function longToUint8Array(num) {
	const arr = new Uint8Array(8);
	for (let i = 0; i < 8; i++) {
		arr.set([num / 0x100 ** i], 7 - i)
	}
	const arr_4_bytes = new Uint8Array([arr[4], arr[5], arr[6], arr[7]]);
	return arr_4_bytes;
}

// NUMBER TO 2 BYTES SHORT
function shortToUint8Array(num) {
	const arr = longToUint8Array(num);
	const arr_2_bytes = new Uint8Array([arr[2], arr[3]]);
	return arr_2_bytes;
}