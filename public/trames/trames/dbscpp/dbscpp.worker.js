
onmessage = function(o)
{
    // init
    let read = o.data.array;
    let settings = o.data.settings;

    let width = o.data.width;
    let packed_width = (Math.ceil(width / 8) + 15) & ~15;
    let height = o.data.height;

    // Module._free(readptr);
    // const readptr = Module._malloc(width * height * 4);
    // const read = Module.HEAPU8.subarray(readptr, readptr + width * height * 4);

    Module._free(arrayptr);
    const arrayptr = Module._malloc(packed_width * height);
    const result = Module.HEAPU8.subarray(arrayptr, arrayptr + packed_width * height);
    
    Module.ccall('dbs', 'void',
        ['number', 'number', 'number', 'number', 'number'],
        [readptr, width, arrayptr, packed_width, height]);

    postMessage({
        array: result,
        width: ww,
        height: hh,
    });

}