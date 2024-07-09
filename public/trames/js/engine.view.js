
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
            draw: ["/shaders/viewport.vert", "/shaders/draw.frag"],
        }, callback);
    }

    update(image, viewport)
    {        
        twgl.resizeCanvasToDisplaySize(this.canvas);
        this.settings.image = image;
        
        // viewport = viewport || [0, 0, this.canvas.clientWidth, this.canvas.clientHeight];
        // const canvas_width = this.canvas.clientWidth;
        // const canvas_height = this.canvas.clientHeight;
        // const m4 = twgl.m4;
        // // const x = viewport[0];
        // // const y = viewport[1];
        // const w = viewport[2];
        // const h = viewport[3];
        // const ww = w/this.canvas.clientWidth;
        // const hh = h/this.canvas.clientHeight;
        // // const xx = x/w;
        // // const yy = y/h;
        // const aspect = canvas_width/canvas_height;
        // this.settings.view = (m4.ortho(-aspect, aspect, -1, 1, -1., 1.));
        // // this.settings.panzoom = m4.translation([xx,yy,0]);
        // this.settings.panzoom = m4.scaling([w/h,1,1]);
        this.draw(this.material.draw, this.mesh.quad, null, viewport);
    }

    draw(material, mesh, buffer, rect)
    {
        // default
        material = material || this.material.uv;
        mesh = mesh || this.mesh.quad;
        buffer = buffer || null;
        rect = rect || [0, 0, this.canvas.clientWidth, this.canvas.clientHeight];
        // rect = [0, 0, this.canvas.clientWidth, this.canvas.clientHeight];
        // rect = [-this.canvas.clientWidth, this.canvas.clientHeight, this.canvas.clientWidth, -this.canvas.clientHeight];

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