
// WEBGL

function CreateEngine (canvas)
{
    const engine =
    {
        ready: false,
        update: true,
        refresh: false,
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
        minMag: gl.NEAREST,
        wrap: gl.REPEAT
    } ];

    const vec4 = (x,y,w,h) => { return { x:x|0, y:y|0, width:w|0, height:h|0 } };

    const rect =
    {
        input: vec4(0, 0, 100, 100),
        output: vec4(0, 0, 5906, 5906),
        canvas: vec4(0, 0, 0, 0),
        panzoom: vec4(0, 0, 0, 0),
    }

    const frame =
    {
        lutted: twgl.createFramebufferInfo(gl, options, rect.input.width, rect.input.height),
        blured: twgl.createFramebufferInfo(gl, options, rect.input.width, rect.input.height),
        result: twgl.createFramebufferInfo(gl, options, rect.output.width, rect.output.height),
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

        // temporal rendering (wip)
        if (rect.width > 1024 || rect.height > 1024)
        {
            const lod = 4;
            const i = engine.uniforms.tick % (lod*lod);
            const w = rect.width / lod;
            const h = rect.height / lod;
            const x = rect.x + (i % lod) * w;
            const y = rect.y + Math.floor(i / lod) * h;
            // gl.viewport(x, y, w, h);
        }
        
        gl.useProgram(filter.program);
        twgl.setBuffersAndAttributes(gl, filter, mesh.quad);
        twgl.setUniforms(filter, engine.uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);
    }

    engine.render = function()
    {
        if (!engine.ready) return;

        // images
        engine.uniforms.image = engine.media.image;
        engine.uniforms.lut = engine.media.lut;

        // canvas dimensions
        twgl.resizeCanvasToDisplaySize(gl.canvas)
        rect.canvas.width = gl.canvas.width;
        rect.canvas.height = gl.canvas.height;

        engine.uniforms.sizeInput = [rect.input.width, rect.input.height];
        engine.uniforms.sizeOutput = [rect.output.width, rect.output.height];
        engine.uniforms.sizeCanvas = [rect.canvas.width, rect.canvas.height];

        if (engine.refresh)
        {
            // apply lut
            engine.uniforms.image = engine.media.image;
            engine.draw(shader.lut, frame.lutted.framebuffer, rect.input);

            // blur
            engine.uniforms.image = frame.lutted.attachments[0];
            engine.draw(shader.blur, frame.blured.framebuffer, rect.input);

            engine.refresh = false;
        }

        if (engine.trame.update !== undefined)
        {
            engine.trame.update(engine);
        }
        else
        {
            // use lutted image
            engine.uniforms.image = frame.blured.attachments[0];

            // apply filter
            engine.draw(shader.filter, frame.result.framebuffer, rect.output)
            engine.uniforms.image = frame.result.attachments[0];

            // draw result
            engine.draw(shader.draw, null, rect.panzoom);
            engine.update = false;
        }

        engine.uniforms.tick = engine.uniforms.tick+1;
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

        engine.refresh = true;
    }

    engine.setTrame = function(trame_)
    {
        engine.trame = trame_;
        shaderToLoad.filter = ["shaders/frame.vert", trame_.shader];
        engine.reload();
    }

    engine.setPanzoom = function(rect_)
    {
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

        engine.refresh = true;
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
            twgl.resizeFramebufferInfo(gl, frame.result, frame.options, width, height);
            if (engine.trame != undefined && engine.trame.resize != undefined)
            {
                engine.trame.resize(engine);
            }
        }
    }

    engine.reset = function(settings)
    {
        if (engine.trame.reset !== undefined)
        {
            engine.trame.reset(engine, settings);
        }
        engine.uniforms.tick = 0;
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