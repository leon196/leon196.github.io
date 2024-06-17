
// WEBGL

function CreateEngine (canvas)
{
    const engine =
    {
        ready: false,
        update: false,
        panzoom: false,
        tiles: 1,
        bucket: 0,
    }

    const media =
    {
        image: {},
        lut: {},
    }

    const gl = canvas.getContext('webgl2',
    {
        alpha: false,
        antialias: true,
        depth: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "default",
        premultipliedAlpha: true,
        stencil: false,
        desynchronized: false,
        uniforms_locations: {}
    });

    gl.getExtension("OES_texture_float");
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");

    const tile_size = 2048;

    // SHADER

    const shader = {};

    const shaderToLoad =
    {
        lut: ["shaders/frame.vert", "shaders/lut.frag"],
        draw: ["shaders/frame.vert", "shaders/draw.frag"],
        blur: ["shaders/frame.vert", "shaders/blur.frag"],
        threshold: ["shaders/frame.vert", "shaders/threshold.frag"],
    };
    
    const uniforms =
    {
        time: 0,
        tick: 0,
        sizeCanvas: [0, 0],
        sizeInput: [0, 0],
        sizeOutput: [0, 0],
        image: null,
        frame: null,
        mouse: [0, 0],
        clic: 0,
    }

    // MESH

    const mesh = 
    {
        quad: twgl.createBufferInfoFromArrays(gl,
        {
            position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
        })
    }

    // FRAME BUFFER
    
    const options = [ {
        internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
        // format: gl.RGBA, type: gl.UNSIGNED_BYTE,
        minMag: gl.LINEAR,
        wrap: gl.CLAMP_TO_EDGE
    } ];

    const vec4 = (x,y,w,h) => { return { x:x|0, y:y|0, width:w|0, height:h|0 } };

    const rect =
    {
        input: vec4(0, 0, 100, 100),
        output: vec4(0, 0, 100, 100),
        canvas: vec4(0, 0, 0, 0),
        panzoom: vec4(0, 0, 0, 0),
    }

    const frame =
    {
        lutted: twgl.createFramebufferInfo(gl, options, rect.input.width, rect.input.height),
        blured: twgl.createFramebufferInfo(gl, options, rect.input.width, rect.input.height),
        result: [],
        swap: 0,
    }

    engine.media = media;
    engine.frame = frame;
    engine.frame.options = options;
    engine.rect = rect;
    engine.uniforms = uniforms;
    engine.shader = shader;
    engine.shaderToLoad = shaderToLoad;
    engine.gl = gl;

    engine.start = function()
    {
        if (engine.trame.start !== undefined)
        {
            engine.trame.start(engine);
        }
        engine.ready = true;
    }

    // DRAW

    engine.draw = function(filter, buffer, rect)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(rect.x, rect.y, rect.width, rect.height);
        gl.useProgram(filter.program);
        twgl.setBuffersAndAttributes(gl, filter, mesh.quad);
        twgl.setUniforms(filter, engine.uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);
    }

    engine.drawTemporal = function(filter)
    {
        const r = rect.output;
        const lod = engine.tiles;
        const i = engine.bucket % (lod*lod);
        // const w = Math.ceil(r.width / lod);
        // const h = Math.ceil(r.height / lod);
        const buffer = frame.result[i].framebuffer;
        engine.uniforms.tile_offset = [(i % lod) / lod, Math.floor(i / lod) / lod]
        gl.viewport(0, 0, tile_size, tile_size);
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.useProgram(filter.program);
        twgl.setBuffersAndAttributes(gl, filter, mesh.quad);
        twgl.setUniforms(filter, engine.uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);
    }

    engine.drawResult = function()
    {
        const r = rect.panzoom;
        // engine.uniforms.image_array = frame.array;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.viewport(r.x, r.y, r.width, r.height);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(shader.draw.program);
        twgl.setBuffersAndAttributes(gl, shader.draw, mesh.quad);

        // const r = rect.panzoom;
        const lod = engine.tiles;
        const w = Math.ceil(r.width / lod);
        const h = Math.ceil(r.height / lod);
        for (let i = 0; i < frame.result.length; ++i)
        {
            const x = r.x + (i % lod) * w;
            const y = r.y + Math.floor(i / lod) * h;
            const re = { x: x, y: y, width: w, height: h };
            engine.uniforms.image = frame.result[i].attachments[0];
            gl.viewport(re.x, re.y, re.width, re.height);
            twgl.setUniforms(shader.draw, engine.uniforms);
            // twgl.drawBufferInfo(gl, mesh.quad);
        }
    }

    engine.render = function()
    {
        if (!engine.ready) return;

        // images
        // engine.uniforms.image = engine.media.image;

        // canvas dimensions
        twgl.resizeCanvasToDisplaySize(gl.canvas)
        rect.canvas.width = gl.canvas.width;
        rect.canvas.height = gl.canvas.height;

        engine.uniforms.sizeInput = [rect.input.width, rect.input.height];
        engine.uniforms.sizeOutput = [rect.output.width, rect.output.height];
        engine.uniforms.sizeCanvas = [rect.canvas.width, rect.canvas.height];

        if (engine.update)
        {
            // apply lut
            engine.uniforms.image = engine.media.image;
            engine.uniforms.lut = engine.media.lut;
            engine.draw(shader.lut, frame.lutted.framebuffer, rect.input);
            engine.uniforms.image = frame.lutted.attachments[0];

            // blur
            // engine.uniforms.image = frame.lutted.attachments[0];
            // engine.draw(shader.blur, frame.blured.framebuffer, rect.input);


            if (engine.trame.update !== undefined)
            {
                engine.trame.update(engine);
            }
            else
            {
                // use blured image
                // engine.uniforms.image = frame.blured.attachments[0];

                // apply filter
                engine.drawTemporal(shader.filter)
                // engine.uniforms.image = frame.result.attachments[0];
            }
            engine.bucket += 1;
            
            engine.drawResult();
        
            if (engine.bucket >= engine.tiles*engine.tiles)
            {
                engine.update = false;
                engine.bucket = 0;
            }
        }

        if (!engine.update && engine.panzoom)
        {
            // draw result
            engine.drawResult();
            engine.panzoom = false;
        }

        engine.uniforms.tick = engine.uniforms.tick+1;
    }

    engine.drawNow = function()
    {
        engine.draw(shader.draw, null, rect.panzoom);
    }

    engine.setTime = function(time_)
    {
        engine.uniforms.time = time_;
    }
    
    engine.setImage = function(image_)
    {
        media.image = twgl.createTexture(gl, {
            src: image_,
            flipY: true,
            // min: gl.NEAREST_MIPMAP_LINEAR,
        });

        engine.refresh();
    }

    engine.setTrame = function(trame_)
    {
        engine.trame = trame_;
        shaderToLoad.filter = ["shaders/frame.vert", trame_.shader];
        engine.reload();
    }

    engine.setPanzoom = function(rect_)
    {
        if (
            rect.panzoom.x != rect_[0] ||
            rect.panzoom.y != rect_[1] ||
            rect.panzoom.width != rect_[2] ||
            rect.panzoom.height != rect_[3])
        {
            engine.panzoom = true;
        }
        rect.panzoom.x = rect_[0];
        rect.panzoom.y = rect_[1];
        rect.panzoom.width = rect_[2];
        rect.panzoom.height = rect_[3];
    }

    engine.setLookUpTable = function(lut_)
    {
        media.lut = twgl.createTexture(gl,
        {
            src: lut_,
            format: gl.LUMINANCE,
            width: lut_.length,
            wrap: gl.CLAMP_TO_EDGE,
            minMag: gl.LINEAR,
        });

        engine.refresh();
    }

    engine.setInputSize = function(width, height)
    {
        if (width != rect.input.width || height != rect.input.height)
        {
            rect.input.width = width;
            rect.input.height = height;
            twgl.resizeFramebufferInfo(gl, frame.lutted, frame.options, width, height);
            twgl.resizeFramebufferInfo(gl, frame.blured, frame.options, width, height);
        }
    }

    engine.setOutputSize = function(width, height)
    {
        if (width != rect.output.width || height != rect.output.height)
        {
            rect.output.width = width;
            rect.output.height = height;
            engine.tiles = Math.ceil(width/tile_size);
            
            for (let i = 0; i < frame.result.length; ++i)
            {
                gl.deleteFramebuffer(frame.result[i].framebuffer);
                frame.result[i] = null;
            }
            frame.result = [];

            const count = engine.tiles*engine.tiles;
            for (let i = 0; i < count; ++i)
            {
                const f = twgl.createFramebufferInfo(gl, frame.options, tile_size, tile_size);
                frame.result.push(f);
            }

            if (engine.trame != undefined && engine.trame.resize != undefined)
            {
                engine.trame.resize(engine);
            }
            engine.refresh()
        }
    }

    engine.refresh = function()
    {
        engine.update = true;
        engine.bucket = 0;
    }

    engine.reset = function(settings)
    {
        if (engine.trame.reset !== undefined)
        {
            engine.trame.reset(engine, settings);
        }
        engine.uniforms.tick = 0;
        engine.refresh();
    }

    engine.clear = function(buffer)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // LOAD FILES

    engine.load = (shaderName, shaderFilePath) =>
    {
        engine.shaderToLoad[shaderName] = ["shaders/frame.vert", shaderFilePath];
    };

    engine.loadFiles = function()
    {
        if (engine.trame.load !== undefined)
        {
            engine.trame.load(engine);
        }

        let assetToLoad = [];
        for (const [key, item] of Object.entries(engine.shaderToLoad))
        {
            if (item instanceof Function) continue;
            if (!assetToLoad.includes(item[0])) assetToLoad.push(item[0]);
            if (!assetToLoad.includes(item[1])) assetToLoad.push(item[1]);
        }
    
        loadFiles("", assetToLoad, "text", function(data)
        {
            for (const [key, item] of Object.entries(engine.shaderToLoad))
            {
                engine.shader[key] = twgl.createProgramInfo(gl, [data[item[0]], data[item[1]]]);
            }
    
            engine.start();
        });
    }
    
    engine.reload = function()
    {
        engine.ready = false;
        engine.reset();
        engine.loadFiles();
    }

    return engine;
}