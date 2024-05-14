
// WEBGL

function CreateEngine (gl, filter, filterWithBuffer)
{
    const engine =
    {
        ready: false,
        viewport: [0, 0, 500, 500],
        media: {},
        uniforms:
        {
            time: 0,
            tick: 0,
            resolution: [0, 0],
            image: null,
            frame: null,
            mouse: [0, 0],
            clic: 0,
        },
        width: 0,
        height: 0,
        update: true,
    }

    // SHADER

    const shader =
    {
        lut: ["shaders/frame.vert", "shaders/lut.frag"],
        draw: ["shaders/frame.vert", "shaders/draw.frag"],
        threshold: ["shaders/frame.vert", "shaders/threshold.frag"],
        filter: ["shaders/frame.vert", filter],
    };

    if (filterWithBuffer !== undefined)
    {
        shader.filterWithBuffer = ["shaders/frame.vert", filterWithBuffer];
    }

    let assetToLoad = [];
    for (const [key, item] of Object.entries(shader))
    {
        if (item instanceof Function) continue;
        if (!assetToLoad.includes(item[0])) assetToLoad.push(item[0]);
        if (!assetToLoad.includes(item[1])) assetToLoad.push(item[1]);
    }

    loadFiles("", assetToLoad, "text", function(data)
    {
        for (const [key, item] of Object.entries(shader))
        {
            shader[key] = twgl.createProgramInfo(gl, [data[item[0]], data[item[1]]]);
        }
        engine.ready = true;
    });

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
        minMag: gl.LINEAR, wrap: gl.REPEAT
    } ];
    const createFrame = twgl.createFramebufferInfo;
    const resize = twgl.resizeFramebufferInfo;
    const frame =
    {
        lutted: createFrame(gl, options),
        buffer: createFrame(gl, options),
        swap: 0,
        width: 1024,
        height: 1024,
    }

    if (filterWithBuffer !== null)
    {
        frame.feedback = 
        [
            createFrame(gl, options, frame.width, frame.height),
            createFrame(gl, options, frame.width, frame.height),
        ];
    }

    engine.resize = function(width, height)
    {
        if (width != engine.width || height != engine.height)
        {
            engine.width = width;
            engine.height = height;
            
            if (shader.filterWithBuffer)
            {
                resize(gl, frame.lutted, options, frame.width, frame.height);
                resize(gl, frame.buffer, options, frame.width, frame.height);
            }
            else
            {
                resize(gl, frame.lutted, options, width, height);
                resize(gl, frame.buffer, options, width, height);
            }
            // if (filterWithBuffer !== null)
            // {
            //     frame.feedback.forEach(f =>
            //     {
            //         resize(gl, f, options, width, height)
            //     });
            // }
        }
    }

    engine.reset = function()
    {
        frame.feedback.forEach(f =>
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, f.framebuffer);
            gl.clearColor(0,0,0,0)
            gl.clear(gl.COLOR_BUFFER_BIT);
        });
        engine.uniforms.tick = 0;

        if (engine.process.algo !== null)
        {
            engine.process.update = true;
        }
    }

    // DRAW

    engine.draw = function(filter, buffer, rect)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(rect[0], rect[1], rect[2], rect[3]);
        gl.useProgram(filter.program);
        twgl.setBuffersAndAttributes(gl, filter, mesh.quad);
        twgl.setUniforms(filter, engine.uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);
    }

    engine.render = function()
    {

        // images
        engine.uniforms.image = engine.media.image;
        engine.uniforms.lut = engine.media.lut;

        // dimensions
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        let width = engine.width;
        let height = engine.height;
        let rect = [0, 0, width, height];
        engine.uniforms.resolution = [width, height];
        engine.uniforms.viewport = engine.viewport;

        if (shader.lut)
        {
            // CPU
            if (engine.process.algo !== null)
            {
                // pre process image (apply LUT)
                engine.draw(shader.lut, frame.lutted.framebuffer, rect);
                
                // use lutted image
                engine.uniforms.image = frame.lutted.attachments[0];

                if (engine.process.update)
                {
                    engine.process.apply();
                    engine.process.update = false;
                }
    
                if (engine.process.image !== null)
                {
                    // draw result
                    engine.uniforms.image = engine.process.image;
                    engine.draw(shader.draw, null, engine.viewport);
                }
            }
            // GPU
            else if (shader.filter)
            {
                // effect with feedback buffer
                if (shader.filterWithBuffer)
                {
                    width = frame.width;
                    height = frame.height;
                    rect = [0, 0, width, height];
                    engine.uniforms.resolution = [width, height];

                    // pre process image (apply LUT)
                    engine.draw(shader.lut, frame.lutted.framebuffer, rect);
                    
                    // use lutted image
                    engine.uniforms.image = frame.lutted.attachments[0];

                    for (let i = 0; i < 30; ++i)
                    {
                        // feedback buffer
                        let read = frame.feedback[frame.swap];
                        let write = frame.feedback[(frame.swap+1)%2];
                        frame.swap = (frame.swap+1)%2;
                        engine.uniforms.framebuffer = read.attachments[0];
                        engine.draw(shader.filterWithBuffer, write.framebuffer, rect);
                        engine.uniforms.tick = engine.uniforms.tick+1;
                    }
                    engine.uniforms.image = frame.feedback[(frame.swap+1)%2].attachments[0]; 

                    // apply filter
                    engine.draw(shader.filter, frame.buffer.framebuffer, rect)
                    engine.uniforms.image = frame.buffer.attachments[0];
    
                    // draw result
                    width = engine.width;
                    height = engine.height;
                    engine.uniforms.resolution = [width, height];
                    engine.draw(shader.draw, null, engine.viewport);
                    engine.update = false;
                }
                // simple filter
                else
                {
                    // pre process image (apply LUT)
                    engine.draw(shader.lut, frame.lutted.framebuffer, engine.viewport);
                    
                    // use lutted image
                    engine.uniforms.image = frame.lutted.attachments[0];

                    // apply filter
                    engine.draw(shader.filter, frame.buffer.framebuffer, rect)
                    engine.uniforms.image = frame.buffer.attachments[0];
    
                    // draw result
                    engine.draw(shader.draw, null, rect);
                    engine.update = false;
                }
            }
        }

        engine.uniforms.tick = engine.uniforms.tick+1;
    }

    // CPU process
    
    engine.process =
    {
        algo: null,
        label: null,
        update: false,
        isGradient: false,

        read: null,
        array: null,

        image: null,
        buffer: null,

        width: 0,
        height: 0,
    };

    engine.process.set = function(algo)
    {
        const process = engine.process;
        if (process.algo === null || process.algo.label != algo.label)
        {
            process.algo = algo;
            process.update = true;
        }
    }

    engine.process.apply = function()
    {
        const process = engine.process;
        if (process.algo === null) return;

        // init
        let width = 500;//engine.width;
        let height = 500;//engine.height;
        const image = engine.uniforms.image;

        if (process.isGradient)
        {
            width = engine.width;
            height = engine.height;
        }

        if (process.width != width || process.height != height)
        {
            process.width = width;
            process.height = height;

            process.read = new Uint8Array(width*height*4);
            process.array = new Uint8Array(width*height);
        
            process.buffer = twgl.createFramebufferInfo(gl,
            [{
                format: gl.RGBA,
                width: width,
                height: height,
            }]);
        }
        
        // draw image in buffer
        engine.uniforms.image = image;
        engine.draw(shader.draw, process.buffer.framebuffer, [0, 0, width, height]);

        // read buffer to array
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, process.read);


        // bake result
        process.image = twgl.createTexture(gl,
        {
            src: process.algo.algo(process.read, width, height),
            format: gl.LUMINANCE,
            minMag: gl.NEAREST,
            flipY: false,
            width: width,
            height: height,
        })
    }

    return engine;
}