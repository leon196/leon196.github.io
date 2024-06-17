
import * as THREE from './libraries/three.module.js'

export function CreateEngine(canvas, callback)
{
    let engine = {};

    const width = canvas.width;
    const height = canvas.height;
    const camera = new THREE.OrthographicCamera( 0, width, height, 0, -10, 10 );
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    let trame = null;
    let worker = null;

    const gl = renderer.getContext();
    gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
    renderer.setSize( width, height );
    renderer.autoClear = false;
    
    let tick = 0;
    let update = false;
    let update_prepass = false;
    let image_loaded = false;
    let outputSize = [0, 0];
    
    let image_texture = null;
    let data_texture = null;
    let lut_texture = null;
    
    let options = {
        format: THREE.RedFormat,
        internalFormat: THREE.R8UI,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        unpackAlignment: 1,
    };
    const max_size = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    let frame_prepass = new THREE.WebGLRenderTarget( width, height, options);
    let frame_result = new THREE.WebGLRenderTarget( width, height, options);
    const uniforms = {
        time: { value: 0 },
        is_gradient: { value: false },
        image: { value: null },
        lut: { value: null },
        format: { value: [1, 1] },
        resolution: { value: [ canvas.width, canvas.height ] },
    };

    function new_shader(vert, frag) {
        return new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: files[vert],
            fragmentShader: files[frag]
        });
    }

    let shaders = {};
    let mesh_result = null;
    const layer_geo = new THREE.PlaneGeometry( 2, 2 );
    const layer_prepass = new THREE.Scene();
    const layer_filter = new THREE.Scene();
    const layer_result = new THREE.Scene();

    engine.render = function(elapsed)
    {
        // trame with CPU
        if (trame.worker !== undefined)
        {
            if (update)
            {
                const w = outputSize[0];
                const h = outputSize[1];

                // image prepass
                uniforms.image.value = image_texture;
                uniforms.resolution.value = outputSize;
                if (update_prepass)
                {
                    renderer.setRenderTarget(frame_prepass);
                    renderer.render( layer_prepass, camera );
                    update_prepass = false;
                }

                // read pixels
                let array = new Uint8Array(w*h);
                renderer.readRenderTargetPixels(frame_prepass, 0, 0, w, h, array);

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
                worker = new Worker(trame.worker);
                worker.postMessage({
                    array: array, 
                    width: w,
                    height: h,
                    settings: settings,
                });

                worker.onmessage = (e) => engine.imageFromData(e.data);

                update = false;
            }
            else
            {
                uniforms.image.value = data_texture;
                renderer.setRenderTarget(null);
                renderer.clear();
                renderer.render(layer_result, camera);
            }
        }
        else // trame with shader
        {
            if (update)
            {
                // prepass
                if (update_prepass) {
                    uniforms.image.value = image_texture;
                    uniforms.resolution.value = outputSize;
                    renderer.setRenderTarget(frame_prepass);
                    renderer.render( layer_prepass, camera );
                    update_prepass = false;
                }

                // filter and store in texture array
                uniforms.image.value = frame_prepass.texture;
                renderer.setRenderTarget(frame_result);
                renderer.render( layer_filter, camera );

                update = false;
            }
                
            // draw result
            uniforms.resolution.value = [ canvas.width, canvas.height ];
            uniforms.image.value = frame_result.texture;
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render( layer_result, camera );
        }

        tick += 1;
    }
        
    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize(e)
    {
        renderer.setSize( canvas.width, canvas.height );
        camera.width = canvas.width;
        camera.height = canvas.height;
        camera.updateProjectionMatrix();
        uniforms.resolution.value = [ canvas.width, canvas.height ];
    }

    engine.reset = (x) => x;
    engine.refresh = () => {
        update = true;
    }
    engine.setTime = (t) => t;
    engine.setPanzoom = (rect) => {
        const x = rect[0];
        const y = rect[1];
        const width = rect[2];
        const height = rect[3];
        if (mesh_result != null) {
            mesh_result.position.set(x+width/2, y+height/2, 0);
            mesh_result.scale.set(width/2, height/2, 1);
        }
    }
    engine.setTrame = (t) => {
        trame = t;
        if (t.shader !== undefined) {
            loader.load(t.shader, data => {
                shaders.filter.fragmentShader = data;
                shaders.filter.needsUpdate = true;
                engine.refresh();
            });
        } else if (t.worker !== undefined) {
            shaders.filter.fragmentShader = files["draw.frag"];
            shaders.filter.needsUpdate = true;
            engine.refresh();
        }
        
    };
    engine.setFormat = (w, h) => {
        uniforms.format.value = [w, h];
    }
    engine.setOutputSize = (w, h) => {
        if (w != outputSize[0] || h != outputSize[1]) {
            outputSize = [w,h];
            frame_prepass.setSize(w, h);
            frame_result.setSize(w, h);
            update_prepass = true;
            engine.refresh();
        }
    }
    engine.setLookUpTable = (array) => {
        lut_texture = new THREE.DataTexture(new Uint8Array(array), array.length, 1, options.format);
        lut_texture.needsUpdate = true;
        uniforms.lut.value = lut_texture;
        update_prepass = true;
        engine.refresh();
    }
    engine.setImageSrc = (src) => {
        image_loaded = false;
        image_texture = new THREE.TextureLoader().load(src, (e) => {
            uniforms.image.value = image_texture;
            update_prepass = true;
            engine.refresh();
        });
    }
    engine.imageFromData = (data) => {
        if (data_texture !== null) data_texture.dispose();
        const array = data.array;
        const w = data.width;
        const h = data.height;
        data_texture = new THREE.DataTexture(array, w, h, THREE.RedFormat);
        data_texture.needsUpdate = true;
    }
    engine.setUniforms = (name, value) => {
        if (uniforms[name] === undefined) uniforms[name] = { value: 0 };
        if (uniforms[name].value != value) {
            uniforms[name].value = value;
            engine.refresh();
        }
    }

    THREE.Cache.enabled = true;
    const loader = new THREE.FileLoader();
    let files = {};
    let files_to_load = ["rect.vert", "fullscreen.vert", "prepass.frag", "draw.frag", "result.frag"]
    let loading = files_to_load.length;
    files_to_load.forEach(element => {
        loader.load("./shaders/"+element, data => {
            files[element] = data;
            loading -= 1;
            if (loading == 0) {
                on_load();
            }
        });
    });

    function on_load()
    {

        shaders = {
            prepass: new_shader("fullscreen.vert", "prepass.frag"),
            filter: new_shader("fullscreen.vert", "draw.frag"),
            result: new_shader("rect.vert", "result.frag"),
        };
        mesh_result = new THREE.Mesh( layer_geo, shaders.result );
        layer_prepass.add( new THREE.Mesh( layer_geo, shaders.prepass ) );
        layer_filter.add( new THREE.Mesh( layer_geo, shaders.filter ) );
        layer_result.add( mesh_result );
        mesh_result.scale.set(250, 250, 1);

        if (callback !== undefined) callback();
    }

    return engine;
}