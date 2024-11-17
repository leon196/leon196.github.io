
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

        this.positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);

        this.mesh = {
            quad: twgl.createBufferInfoFromArrays(gl, {
                coord: { data: [0,0, 1,0, 0,1, 1,1], numComponents: 2 },
                position: { data: this.positions, numComponents: 2, drawType: gl.DYNAMIC_DRAW },
                indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3] },
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
        
        this.update_positions(rect);

        // webgl drawing
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        gl.useProgram(material.program);
        twgl.setAttribInfoBufferFromArray(gl, mesh.attribs.position, this.positions); 
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, this.settings);
        twgl.drawBufferInfo(gl, mesh);
    }

    update_positions(rect)
    {
        // transform panzoom rect (x,y,w,h) with html canvas dimension reference
        // to webgl viewport (quad corners) in clip space [-1,+1]
        const x = rect[0];
        const y = rect[1];
        const w = rect[2];
        const h = rect[3];
        const ww = this.canvas.clientWidth;
        const hh = this.canvas.clientHeight;
        const xx = ((x+w/2)/ww)*2-1;
        const yy = ((y+h/2)/hh)*2-1;

        const left_bottom = 0;
        const right_bottom = 1;
        const left_top = 2;
        const right_top = 3;
        this.positions[left_bottom*2] = (x*2-ww)/ww;
        this.positions[left_bottom*2+1] = (y*2-hh)/hh;
        this.positions[right_bottom*2] = ((x+w)*2-ww)/ww;
        this.positions[right_bottom*2+1] = (y*2-hh)/hh;
        this.positions[left_top*2] = (x*2-ww)/ww;
        this.positions[left_top*2+1] = ((y+h)*2-hh)/hh;
        this.positions[right_top*2] = ((x+w)*2-ww)/ww;
        this.positions[right_top*2+1] = ((y+h)*2-hh)/hh;
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