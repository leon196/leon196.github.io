
import * as twgl from "./libraries/twgl-full.module.js"

export default class Engine
{
    constructor(canvas, callback)
    {
        const gl = canvas.getContext('webgl2',
        {
            alpha: false,
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
        gl.getExtension("OES_element_index_uint");

        this.gl = gl;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        this.mesh = {
            quad: twgl.createBufferInfoFromArrays(gl, {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
            }),
        }

        this.trame = {};
        this.media = {};
        this.material = {};
        this.loaded = false;
        
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

        this.frame = {
            blur: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            lut: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            read: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            write: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            trame: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
            post: twgl.createFramebufferInfo(gl, this.attachments, this.width, this.height),
        };

        this.state = {
            blur: false,
            lut: false,
            trame: false,
        }

        this.limit = {
            viewport: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        }

        this.tick = 0;

        this.load_shaders({
            blit: ["shaders/rect.vert", "shaders/blit.frag"],
            blur: ["shaders/rect.vert", "shaders/blur.frag"],
            lut: ["shaders/rect.vert", "shaders/lut.frag"],
            unpack: ["shaders/rect.vert", "shaders/unpack.frag"],
            draw: ["shaders/rect.vert", "shaders/draw.frag"],
            trame: ["shaders/rect.vert", "shaders/draw.frag"],
            post: ["shaders/rect.vert", "shaders/post.frag"],
            uv: ["shaders/rect.vert", "shaders/uv.frag"],
        }, callback);
    }

    update(elapsed)
    {
        if (!this.loaded) return;

        this.settings.time = elapsed / 1000;
        this.settings.resolution = [this.width, this.height]
        
        if (!this.state.blur) this.apply_blur();
        if (!this.state.lut) this.apply_lut();
        if (!this.state.trame) this.apply_trame();
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
        gl.clearColor(0,0,0,0)
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
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
        if (callback != undefined && callback != null) callback();
        this.loaded = true;
        emitter.emit('force_update');
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
            }, () => {
                this.state.blur = false;
                this.state.lut = false;
                this.state.trame = false;
                this.tick = 0;
                emitter.emit('force_update');
            });

            // will send the image to shaders
            this.settings[key] = this.media[key];
        }
    }

    apply_blur()
    {
        const image = this.media.image;
        const material = this.material.blur;
        const mesh = this.mesh.quad;
        const buffer = this.frame.blur.framebuffer;
        const viewport = [0, 0, this.width, this.height];

        this.settings.image = image;
        this.draw(material, mesh, buffer, viewport);
        this.state.blur = true;
    }

    apply_lut()
    {
        const image = this.frame.blur.attachments[0];
        const material = this.material.lut;
        const mesh = this.mesh.quad;
        const buffer = this.frame.lut.framebuffer;
        const viewport = [0, 0, this.width, this.height];

        this.settings.image = image;
        this.draw(material, mesh, buffer, viewport);
        this.state.lut = true;
    }

    apply_trame()
    {
        // trame has custom update
        if (this.trame.update != undefined)
        {
            this.trame.update(this, () => this.apply_post());
        }
        // update trame
        else
        {
            const image = this.frame.lut.attachments[0];
            const material = this.material.trame;
            const mesh = this.mesh.quad;
            const buffer = this.frame.trame.framebuffer;
            const viewport = [0, 0, this.width, this.height];

            this.settings.image = image;
            this.draw(material, mesh, buffer, viewport);
            this.state.trame = true;
            this.apply_post();
            
            emitter.emit('loading_stop');
        }
    }

    apply_post()
    {
        let image = this.frame.trame.attachments[0];

        // trame has custom result
        if (this.trame.get_result != undefined)
        {
            image = this.trame.get_result(this);
        }

        const material = this.material.post;
        const mesh = this.mesh.quad;
        const buffer = this.frame.post.framebuffer;
        const viewport = [0, 0, this.width, this.height];

        this.settings.image = image;
        this.draw(material, mesh, buffer, viewport);
    }
    
    get_result()
    {
        return this.frame.post.attachments[0];
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
        if (width != this.width || height != this.height)
        {
            this.width = width;
            this.height = height;
            
            const gl = this.gl;
            const frame = this.frame;
            twgl.resizeFramebufferInfo(gl, frame.blur, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.lut, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.read, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.write, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.trame, this.attachments, width, height);
            twgl.resizeFramebufferInfo(gl, frame.post, this.attachments, width, height);

            this.settings.format = [format_width, format_height];

            // trame has custom resize
            if (this.trame.set_size != undefined) this.trame.set_size(this);
    
            this.state.blur = false;
            this.state.lut = false;
            this.state.trame = false;
            this.tick = 0;
        }
    }

    set_trame(trame)
    {
        // clear previous trame
        if (this.trame.stop != undefined)
        {
            this.trame.stop(this);
        }

        this.trame = trame;

        // trame has custom start
        if (trame.start != undefined) trame.start(this);

        // trame with shader
        else if (trame.shader != undefined)
        {
            this.load_shaders({
                trame: ["shaders/rect.vert", trame.shader]
            }, () => {
                this.state.trame = false;
                emitter.emit('force_update');
            })
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

        emitter.emit('force_update');
    }

    set_setting(key, value)
    {
        // update trame if value is new
        const setting = this.settings[key];
        const update = setting == undefined || setting != undefined && setting != value;
        if (update)
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
window.twgl = twgl;