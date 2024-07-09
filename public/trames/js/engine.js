
import * as twgl from "./libraries/twgl-full.module.js"

export default class Engine
{
    constructor(canvas, callback)
    {
        const gl = canvas.getContext('webgl2',
        {
            alpha: true,
            antialias: true,
            depth: true,
            failIfMajorPerformanceCaveat: false,
            powerPreference: "default",
            premultipliedAlpha: true,
            stencil: false,
            desynchronized: true,
            uniforms_locations: {}
        });
    
        gl.getExtension("OES_texture_float");
        gl.getExtension("EXT_color_buffer_float");
        gl.getExtension("OES_texture_float_linear");

        this.gl = gl;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        this.mesh = {
            quad: twgl.createBufferInfoFromArrays(gl, {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
            })
        }

        // console.log(gl.getParameter(gl.MAX_VIEWPORT_DIMS));

        this.media = {
            worker: null,
        };

        this.material = {};
        
        this.settings = {
            time: 0,
            tick: 0,
            resolution: [0, 0],
            format: [0, 0],
        };
    
        this.attachments = [{
            internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT,
            minMag: gl.NEAREST,
            wrap: gl.CLAMP_TO_EDGE
        }];
    
        this.attachments_uint = [{
            internalFormat: gl.R8UI,
            minMag: gl.NEAREST,
            wrap: gl.CLAMP_TO_EDGE
        }];

        this.frame = {
            blur: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            lut: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            read: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            write: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            trame: twgl.createFramebufferInfo(gl, this.attachments_uint, this.width, this.height),
        };

        this.state = {
            blur: false,
            lut: false,
            trame: false,
        }

        this.limit = {
            viewport: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        }

        this.trame = {};
        this.worker = null;
        this.tick = 0;

        this.load_shaders({
            blit: ["shaders/rect.vert", "shaders/blit.frag"],
            blur: ["shaders/rect.vert", "shaders/blur.frag"],
            lut: ["shaders/rect.vert", "shaders/lut.frag"],
            unpack: ["shaders/rect.vert", "shaders/unpack.frag"],
            draw: ["shaders/rect.vert", "shaders/draw.frag"],
            trame: ["shaders/rect.vert", "shaders/draw.frag"],
            uv: ["shaders/rect.vert", "shaders/uv.frag"],
        }, callback);
    }

    update(elapsed, viewport)
    {
        // actual canvas is not in DOM
        // const canvas = this.canvas;
        // const resized = twgl.resizeCanvasToDisplaySize(canvas);

        this.settings.time = elapsed / 1000;
        this.settings.resolution = [this.width, this.height]
        
        if (!this.state.blur) this.apply_blur();
        if (!this.state.lut) this.apply_lut();
        if (!this.state.trame) this.apply_trame();

        // used for debug
        // this.settings.image = this.media.image;
        // this.draw(this.material.blur, this.mesh.quad, this.frame.trame.framebuffer, [0, 0, this.width, this.height]);

        // result is drawn by EngineView instances
        // this.settings.image = this.frame.trame.attachments[0];
        // this.draw(this.material.draw, this.mesh.quad, null, viewport);
    }

    draw(material, mesh, buffer, rect)
    {
        // default
        material = material || this.material.uv;
        mesh = mesh || this.mesh.quad;
        buffer = buffer || null;
        rect = rect || [0, 0, this.canvas.clientWidth, this.canvas.clientHeight];

        // webgl drawing
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.viewport(rect[0], rect[1], rect[2], rect[3]);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, this.settings);
        twgl.drawBufferInfo(gl, mesh);
    }

    async load_shaders(shaders, callback)
    {
        const loaded = {};
        for (const [key, item] of Object.entries(shaders)) {
            if (item instanceof Function) continue;
            for (let i = 0; i < item.length; ++i) {
                const path = item[i];
                if (loaded[path] == undefined) {
                    await fetch(path).then(x => x.text()).then(x => loaded[path] = x);
                }
            }
            this.material[key] = twgl.createProgramInfo(this.gl, [loaded[item[0]], loaded[item[1]]]);
        }
        if (callback != undefined) callback();
    }

    load_images(images)
    {
        const gl = this.gl;
        for (const [key, path] of Object.entries(images)) {
            this.media[key] = twgl.createTexture(gl, {
                src: path,
                flipY: true,
                wrap: gl.CLAMP_TO_EDGE,
                minMag: gl.LINEAR,
            });
            this.settings[key] = this.media[key];
        }
    }

    apply_blur()
    {
        this.settings.image = this.media.image;
        this.draw(this.material.blur, this.mesh.quad, this.frame.blur.framebuffer, [0, 0, this.width, this.height]);
        this.state.blur = true;
    }

    apply_lut()
    {
        this.settings.image = this.frame.blur.attachments[0];
        this.draw(this.material.lut, this.mesh.quad, this.frame.lut.framebuffer, [0, 0, this.width, this.height]);
        this.state.lut = true;
    }

    apply_trame()
    {
        emitter.emit('loading_start');

        this.settings.image = this.frame.lut.attachments[0];

        // trame is a CPU worker
        if (this.trame.worker != undefined)
        {
            this.apply_trame_worker(this.width, this.height);
            this.state.trame = true;
        }
        // trame has feedback shader
        else if (this.trame.feedback != undefined)
        {
            const frames = [this.frame.read, this.frame.write];
            const read = frames[(this.tick)%2];
            const write = frames[(this.tick+1)%2];

            if (this.tick < this.trame.feedback_frames)
            {
                // feedback buffer
                this.settings.image = this.frame.lut.attachments[0];
                this.settings.tick = this.tick;
                this.settings.resolution = [this.width, this.height];
                this.settings.feedback = read.attachments[0];
                this.draw(this.material.feedback, this.mesh.quad, write.framebuffer, [0, 0, this.width, this.height]);

                this.tick += 1;

                emitter.emit('force_update', this);
            }
            else
            {
                // final print
                this.settings.image = frames[this.tick%2].attachments[0]; 
                this.draw(this.material.trame, this.mesh.quad, this.frame.trame.framebuffer, [0, 0, this.width, this.height]);

                // end feedback
                this.state.trame = true;
                emitter.emit('loading_stop');
            }
        }
        // trame is a simple shader
        else
        {
            this.draw(this.material.trame, this.mesh.quad, this.frame.trame.framebuffer, [0, 0, this.width, this.height]);
            this.state.trame = true;
            emitter.emit('loading_stop');
        }

    }

    apply_trame_worker(width, height)
    {
        const gl = this.gl;

        if (this.worker != undefined)
        {
            this.worker.terminate();
        }
        
        this.worker = new Worker(this.trame.worker);
        this.worker.onmessage = (e) => 
        {
            const array = e.data.array;
            const width = e.data.width;
            const height = e.data.height;
            this.media.worker = twgl.createTexture(gl, {
                src: array,
                format: gl.RED_INTEGER,
                internalFormat: gl.R8UI,
                minMag: gl.NEAREST,
                flipY: false,
                width: width,
                height: height,
            });
            emitter.emit('loading_stop');
        }

        // export settings for worker
        const settings = {};
        for (const [key, item] of Object.entries(this.settings)) {
            let value = item;
            if (typeof value === 'number') {
                settings[key] = value;
            }
        }

        const read = new Uint8Array(width*height*4);
        const array = new Uint8Array(width*height);
        const buffer = twgl.createFramebufferInfo(gl, [{ format: gl.RGBA }], width, height);

        // draw image in buffer
        this.draw(this.material.blit, this.mesh.quad, buffer.framebuffer, [0, 0, width, height]);

        // read buffer to array
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, read);

        // prepare data
        for (let i = 0; i < width*height; ++i) array[i] = read[i*4];

        this.worker.postMessage({
            array: array, 
            width: width,
            height: height,
            settings: settings,
        });
    }

    get_result()
    {
        if (this.trame.worker != undefined)
        {
            return this.media.worker;
        }
        else
        {
            return this.frame.trame.attachments[0];
        }
    }

    set_lut(array)
    {
        const gl = this.gl;
        this.settings.lut = twgl.createTexture(gl, {
            src: array,
            format: gl.LUMINANCE,
            width: array.length,
            wrap: gl.CLAMP_TO_EDGE,
            minMag: gl.LINEAR,
        });
        this.state.lut = false;
        this.state.trame = false;
        this.tick = 0;
    }

    set_size(width, height, format_width, format_height)
    {
        if (width != this.width && height != this.height)
        {
            this.width = width;
            this.height = height;
            
            const gl = this.gl;
            const frame = this.frame;
            twgl.resizeFramebufferInfo(gl, frame.blur, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.lut, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.read, this.attachments, this.width, this.height);
            twgl.resizeFramebufferInfo(gl, frame.write, this.attachments, this.width, this.height);
            twgl.resizeFramebufferInfo(gl, frame.trame, this.attachments_uint, width, height);

            this.settings.format = [format_width, format_height];
    
            this.state.blur = false;
            this.state.lut = false;
            this.state.trame = false;
            this.tick = 0;
        }
    }

    set_trame(trame)
    {
        this.trame = trame;

        // clean
        if (this.worker != null) this.worker.terminate();

        // trame with shader
        if (trame.shader != undefined)
        {
            // shader needs feedback
            if (trame.feedback != undefined)
            {
                this.load_shaders({
                    trame: ["shaders/rect.vert", trame.shader],
                    feedback: ["shaders/rect.vert", trame.feedback]
                }, () => {
                    this.state.trame = false;
                    this.tick = 0;
                })
            }
            else
            {
                this.load_shaders({
                    trame: ["shaders/rect.vert", trame.shader]
                }, () => {
                    this.state.trame = false;
                })
            }
        }

        // trame with worker
        else if (trame.worker != undefined)
        {
            this.state.trame = false;
        }

        // trame has maps to load
        if (trame.maps != undefined)
        {
            const map = {};
            for (const [key, item] of Object.entries(trame.maps)) {
                map[item.name] = item.path;
            }
            this.load_images(map);
        }
    }

    set_setting(key, value)
    {
        if (this.settings[key] != undefined)
        {
            if (this.settings[key] != value)
            {
                this.state.trame = false;
                this.tick = 0;
            }
        }
        else
        {
            this.state.trame = false;
            this.tick = 0;
        }
        this.settings[key] = value;
    }

    disable_blur()
    {
        this.load_shaders({
            blur: ["shaders/rect.vert", "shaders/blit.frag"]
        }, () => {
            this.state.blur = false;
            this.state.lut = false;
            this.state.trame = false;
        })
    }
}

// from module to vanilla
window.Engine = Engine;