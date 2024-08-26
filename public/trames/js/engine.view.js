
import * as twgl from "./libraries/twgl-full.module.js"

export default class EngineView
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
            desynchronized: false,
            uniforms_locations: {}
        });

        this.gl = gl;
        this.canvas = canvas;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;

        this.mesh = {
            quad: twgl.createBufferInfoFromArrays(gl, {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
            })
        }

        this.material = {};
        this.settings = {
            time: 0,
            view: 0,
            panzoom: 0,
        };

        this.load_shaders({
            draw: ["shaders/viewport.vert", "shaders/draw.frag"],
        }, callback);
    }

    update(image, viewport)
    {        
        twgl.resizeCanvasToDisplaySize(this.canvas);
        this.settings.image = image;
        this.draw(this.material.draw, this.mesh.quad, null, viewport);
    }

    draw(material, mesh, buffer, rect)
    {
        // default
        material = material || this.material.uv;
        mesh = mesh || this.mesh.quad;
        buffer = buffer || null;
        rect = rect || [0, 0, this.canvas.clientWidth, this.canvas.clientHeight];

        const f = x => Math.floor(x);
        const w = f(rect[2]) - f(rect[0]);
        const h = f(rect[3]) - f(rect[1]);
        const x = w / 2;
        const y = h / 2;
        // rect[0] = x - w / 2;
        // rect[0] = y - h / 2;
        // rect[2] = x + w / 2;
        // rect[3] = y + h / 2;
        // console.log(rect)

        // webgl drawing
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
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
}

// from module to vanilla
window.EngineView = EngineView;