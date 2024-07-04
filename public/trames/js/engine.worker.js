
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
let has_feedback = false;
let feedback_done = false;
let should_wait = false;

// textures
let image_texture = null;
let data_texture = null;
let lut_texture = null;

// geometry that will panzoom
let quad_result = null;

// geometry and layers
const layer_geo = new THREE.PlaneGeometry( 2, 2 );
const layer_blur = new THREE.Scene();
const layer_lut = new THREE.Scene();
const layer_draw = new THREE.Scene();
const layer_filter = new THREE.Scene();
const layer_feedback = new THREE.Scene();
const layer_result = new THREE.Scene();
const layer_load = new THREE.Scene();

// frame buffer options
let options = {
    format: THREE.RedFormat,
    // internalFormat: THREE.R8UI,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    colorSpace: THREE.SRGBColorSpace,
    unpackAlignment: 1,
};
let feedback = {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    colorSpace: THREE.SRGBColorSpace,
    generateMipmaps: true,
    unpackAlignment: 1,
};
let frame_lut = new THREE.WebGLRenderTarget(width, height, options);
let frame_blur = new THREE.WebGLRenderTarget(width, height, options);
let frame_result = new THREE.WebGLRenderTarget(width, height, options);
let frame_feedback = [
    new THREE.WebGLRenderTarget(width, height, feedback),
    new THREE.WebGLRenderTarget(width, height, feedback)
];

// shader settings
const uniforms = {
    time: { value: 0 },
    tick: { value: 0 },
    image: { value: null },
    feedback: { value: null },
    lut: { value: null },
    format: { value: [1, 1] },
    resolution: { value: [ 1, 1 ] },
};

// shaders
let shaders = {};
let files = {};
let files_to_load = [
    "rect.vert",
    "fullscreen.vert",
    "blur.frag",
    "lut.frag",
    "draw.frag",
    "result.frag",
    "load.frag"
]
let loaded = files_to_load.length;
const loader = new THREE.FileLoader();
THREE.Cache.enabled = true;
files_to_load.forEach(element => {
    const new_shader = (vert, frag) =>
        new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: files[vert],
            fragmentShader: files[frag]
        });
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
                feedback: new_shader("fullscreen.vert", "draw.frag"),
                load: new_shader("fullscreen.vert", "load.frag"),
            };
            quad_result = new THREE.Mesh( layer_geo, shaders.result );
            layer_blur.add( new THREE.Mesh( layer_geo, shaders.blur ) );
            layer_draw.add( new THREE.Mesh( layer_geo, shaders.draw ) );
            layer_lut.add( new THREE.Mesh( layer_geo, shaders.lut ) );
            layer_filter.add( new THREE.Mesh( layer_geo, shaders.filter ) );
            layer_feedback.add( new THREE.Mesh( layer_geo, shaders.feedback ) );
            layer_load.add( new THREE.Mesh( layer_geo, shaders.load ) );
            layer_result.add( quad_result );
            quad_result.scale.set(250, 250, 1);
        }
    });
});

// main loop
engine.render = function()
{
    // extra files are loading
    if (should_wait) return;
    
    // common shader settings
    uniforms.resolution.value = [ width, height ];
    uniforms.time.value = time;
    uniforms.tick.value = tick;

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

    // trame should updated
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

            // worker finished
            worker.onmessage = (e) => 
            {
                if (data_texture !== null) data_texture.dispose();
                const array = e.data.array;
                const w = e.data.width;
                const h = e.data.height;
                data_texture = new THREE.DataTexture(array, w, h, THREE.RedFormat);
                data_texture.needsUpdate = true;
                uniforms.image.value = data_texture;

                // stop loading frontend
                postMessage({});
            }

            // stop update (async)
            update = false;
        }
        else // trame with shader
        {
            // shader with feedback effect
            if (has_feedback)
            {
                const read = frame_feedback[tick % 2];
                const write = frame_feedback[(tick+1) % 2];
                if (!feedback_done)
                {
                    // feedback
                    uniforms.image.value = frame_lut.texture;
                    uniforms.feedback.value = read.texture;
                    uniforms.resolution.value = outputSize;
                    renderer.setRenderTarget(write);
                    renderer.render( layer_feedback, camera );
                    feedback_done = tick > 60;
                    tick += 1;

                    // preview
                    // uniforms.image.value = write.texture;
                    // renderer.setRenderTarget(frame_result);
                    // renderer.render( layer_filter, camera );
                    // uniforms.image.value = frame_result.texture;
                }
                else
                {
                    //
                    uniforms.image.value = write.texture;
                    renderer.setRenderTarget(frame_result);
                    renderer.render( layer_filter, camera );
                    uniforms.image.value = frame_result.texture;

                    // stop loading frontend
                    postMessage({});
                
                    // stop updating
                    update = false;
                }
            }
            // simple filter
            else
            {
                // filter and store in texture array
                uniforms.image.value = frame_lut.texture;
                renderer.setRenderTarget(frame_result);
                renderer.render( layer_filter, camera );
                uniforms.image.value = frame_result.texture;
                
                // stop loading frontend
                postMessage({});
            
                // stop updating
                update = false;
            }
        }

    }

    // draw result
    renderer.setRenderTarget(null);
    renderer.render(layer_result, camera);
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
    camera.right = width;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
}

engine.refresh = () =>
{
    tick = 0;
    update = true;
    feedback_done = false;
}

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
                const texture = new THREE.CanvasTexture( imageBitmap );
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                uniforms[args.maps[i].name] = { value: texture };
                engine.refresh();
                file_loaded += 1;
                if (file_loaded == args.maps.length) should_wait = false;
            }, x => x, e => console.log(e));
        }
    }
    // trame has feedback
    has_feedback = args.feedback !== undefined;
    if (has_feedback)
    {
        loader.load("./../"+args.feedback, data => {
            shaders.feedback.fragmentShader = data;
            shaders.feedback.needsUpdate = true;
            const w = outputSize[0];
            const h = outputSize[1];
            frame_feedback[0].setSize(w, h);
            frame_feedback[1].setSize(w, h);
            engine.refresh();
        }, x => x, (e) => console.log(e));
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
        if (has_feedback) {
            frame_feedback[0].setSize(w, h);
            frame_feedback[1].setSize(w, h);
        }
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