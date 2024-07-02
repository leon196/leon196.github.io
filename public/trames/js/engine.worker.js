
import * as THREE from './libraries/three.module.js'

let engine = {};

// webgl component
let renderer = null;
let canvas = null;
let camera = new THREE.OrthographicCamera( 0, 0, 0, 0, -10, 10 );

// dimensions
let width = 500;
let height = 500;
let max_size = 500;
let outputSize = [0, 0];

// worker
let worker = null;
let worker_path = null;

// time
let tick = 0;
let time = 0;

// states
let update = false;
let update_blur = false;
let update_lut = false;
let is_gradient = false;
let should_wait = false;

// textures
let image_texture = null;
let data_texture = null;
let lut_texture = null;

// geometry that will panzoom
let quad_result = null;

// frame buffer options
let options = {
    format: THREE.RedFormat,
    // internalFormat: THREE.R8UI,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    colorSpace: THREE.SRGBColorSpace,
    unpackAlignment: 1,
};
let frame_lut = new THREE.WebGLRenderTarget( width, height, options);
let frame_blur = new THREE.WebGLRenderTarget( width, height, options);
let frame_result = new THREE.WebGLRenderTarget( width, height, options);
const uniforms = {
    time: { value: 0 },
    image: { value: null },
    lut: { value: null },
    format: { value: [1, 1] },
    resolution: { value: [ 1, 1 ] },
};

function new_shader(vert, frag) {
    return new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: files[vert],
        fragmentShader: files[frag]
    });
}

const layer_geo = new THREE.PlaneGeometry( 2, 2 );
const layer_blur = new THREE.Scene();
const layer_lut = new THREE.Scene();
const layer_draw = new THREE.Scene();
const layer_filter = new THREE.Scene();
const layer_result = new THREE.Scene();
const layer_load = new THREE.Scene();
let shaders = {};
THREE.Cache.enabled = true;
let files = {};
let files_to_load = ["rect.vert", "fullscreen.vert", "blur.frag", "lut.frag", "draw.frag", "result.frag", "load.frag"]
let loaded = files_to_load.length;
const loader = new THREE.FileLoader();
files_to_load.forEach(element => {
    loader.load("./../shaders/"+element, data => {
        files[element] = data;
        loaded -= 1;
        if (loaded == 0) {
            shaders = {
                blur: new_shader("fullscreen.vert", "blur.frag"),
                lut: new_shader("fullscreen.vert", "lut.frag"),
                filter: new_shader("fullscreen.vert", "draw.frag"),
                draw: new_shader("fullscreen.vert", "draw.frag"),
                result: new_shader("rect.vert", "result.frag"),
                load: new_shader("fullscreen.vert", "load.frag"),
            };
            quad_result = new THREE.Mesh( layer_geo, shaders.result );
            layer_blur.add( new THREE.Mesh( layer_geo, shaders.blur ) );
            layer_draw.add( new THREE.Mesh( layer_geo, shaders.draw ) );
            layer_lut.add( new THREE.Mesh( layer_geo, shaders.lut ) );
            layer_filter.add( new THREE.Mesh( layer_geo, shaders.filter ) );
            layer_load.add( new THREE.Mesh( layer_geo, shaders.load ) );
            layer_result.add( quad_result );
            quad_result.scale.set(250, 250, 1);
        }
    });
});

engine.render = function()
{
    // extra files are loading
    if (should_wait) return;

    // blur
    if (update_blur)
    {
        uniforms.image.value = image_texture;
        uniforms.resolution.value = outputSize;
        renderer.setRenderTarget(frame_blur);
        let layer = is_gradient ? layer_draw : layer_blur;
        renderer.render( layer, camera );
        update_blur = false;
    }
    
    // lut
    if (update_lut)
    {
        uniforms.resolution.value = outputSize;
        uniforms.image.value = frame_blur.texture;
        renderer.setRenderTarget(frame_lut);
        renderer.render( layer_lut, camera );
        update_lut = false;
    }

    if (update)
    {
        // trame with CPU
        if (worker_path !== null)
        {
            const w = outputSize[0];
            const h = outputSize[1];

            // read pixels
            let array = new Uint8Array(w*h);
            renderer.readRenderTargetPixels(frame_lut, 0, 0, w, h, array);

            // export settings for worker
            let settings = {};
            for (const [key, item] of Object.entries(uniforms)) {
                let value = uniforms[key].value;
                if (typeof value === 'number') {
                    settings[key] = value;
                }
            }

            // create worker
            if (worker != null) worker.terminate();
            worker = new Worker("./../"+worker_path);
            worker.postMessage({
                array: array, 
                width: w,
                height: h,
                settings: settings,
            });

            uniforms.image.value = data_texture;

            worker.onmessage = (e) => 
            {
                if (data_texture !== null) data_texture.dispose();
                const array = e.data.array;
                const w = e.data.width;
                const h = e.data.height;
                data_texture = new THREE.DataTexture(array, w, h, THREE.RedFormat);
                data_texture.needsUpdate = true;
                uniforms.image.value = data_texture;
                postMessage({});
            }
        }
        else // trame with shader
        {
            // filter and store in texture array
            uniforms.image.value = frame_lut.texture;
            renderer.setRenderTarget(frame_result);
            renderer.render( layer_filter, camera );
            uniforms.image.value = frame_result.texture;
            postMessage({});
        }

        update = false;
    }
    

    // loading
    // if (loading) renderer.render( layer_load, camera );
    
    uniforms.resolution.value = [ width, height ];
    uniforms.time.value = time;

    // draw result
    renderer.setRenderTarget(null);
    renderer.render(layer_result, camera);

    tick += 1;
}

engine.create = (args) =>
{
    canvas = args.canvas;
    width = args.width;
    height = args.height;
    is_gradient = args.is_gradient;

    // webgl renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);

    // max size from hardware
    const gl = renderer.getContext();
    gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
    max_size = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    
    // resize
    engine.resize(args);
}

engine.resize = (args) =>
{
    // resize webgl renderer
    width = args.width;
    height = args.height;
    renderer.setSize( width, height, false );

    // match html coordinates (easier panzoom integration)
    // camera.left = -width/2;
    camera.right = width;
    camera.bottom = -height;
    // camera.top = height/2;
    camera.updateProjectionMatrix();
}

engine.reset = (x) => x;

engine.refresh = () => update = true;

engine.setPanzoom = (args) =>
{
    const rect = args.rect;
    if (quad_result != null)
    {
        const x = rect[0];
        const y = rect[1];
        const width = rect[2];
        const height = rect[3];

        // transform quad to match panzoom
        quad_result.position.set(x+width/2, y+height/2, 0);
        quad_result.scale.set(width/2, height/2, 1);
    }
}

engine.setTrame = (args) =>
{
    // trame with gpu
    if (args.shader !== undefined)
    {
        worker_path = null;
        loader.load("./../"+args.shader, data => {
            shaders.filter.fragmentShader = data;
            shaders.filter.needsUpdate = true;
            engine.refresh();
        }, x => x, (e) => console.log(e));
    }
    // trame with cpu worker
    else if (args.worker !== undefined)
    {
        worker_path = args.worker;
        engine.refresh();
    }
    // maps to load
    if (args.maps !== undefined)
    {
        should_wait = true;
        let file_loaded = 0;
        const bitmap = new THREE.ImageBitmapLoader();
        bitmap.setOptions( { imageOrientation: 'flipY' } );
        for (let i = 0; i < args.maps.length; ++i) {
            bitmap.load("./../" + args.maps[i].path, function ( imageBitmap ) {
                uniforms[args.maps[i].name] = { value: new THREE.CanvasTexture( imageBitmap ) };
                engine.refresh();
                file_loaded += 1;
                if (file_loaded == args.maps.length) should_wait = false;
            }, x => x, e => console.log(e));
        }
    }
}

engine.setFormat = (args) =>
{
    const w = args.format[0];
    const h = args.format[1];
    if (w != 0 && h != 0) {
        uniforms.format.value = [w, h];
    }
}

engine.setOutputSize = (args) =>
{
    const w = args.outputSize[0];
    const h = args.outputSize[1];
    if (w != 0 && h != 0 && (w != outputSize[0] || h != outputSize[1])) {
        outputSize = [w,h];
        frame_blur.setSize(w, h);
        frame_lut.setSize(w, h);
        frame_result.setSize(w, h);
        update_blur = true;
        update_lut = true;
        engine.refresh();
    }
}

engine.setLookUpTable = (args) =>
{
    const array = args.array;
    lut_texture = new THREE.DataTexture(array, array.length, 1, options.format);
    lut_texture.needsUpdate = true;
    uniforms.lut.value = lut_texture;
    update_lut = true;
    engine.refresh();
}

engine.setImageSrc = (args) =>
{
    const bitmap = new THREE.ImageBitmapLoader();
	bitmap.setOptions( { imageOrientation: 'flipY' } );
	bitmap.load(args.src, function ( imageBitmap ) {
		image_texture = new THREE.CanvasTexture( imageBitmap );
        uniforms.image.value = image_texture;
        update_blur = true;
        update_lut = true;
        engine.refresh();
    }, x => x, e => console.log(e));
}

engine.setSettings = (args) =>
{
    const name = args.name;
    const value = args.value;
    if (uniforms[name] === undefined) uniforms[name] = { value: 0 };
    if (uniforms[name].value != value) {
        uniforms[name].value = value;
        engine.refresh();
    }
}

engine.setTime = (args) =>
{
    time = args.time;
}

onmessage = function(e)
{
    const event = e.data.event;
    if (engine[event] != undefined) {
        engine[event](e.data.args);
    }
}