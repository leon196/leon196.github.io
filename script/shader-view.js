
import Thumbnail from "./thumbnail-view.js"

class ShaderView extends Thumbnail
{    
    constructor()
    {
        super();

        // dom canvas
        this.canvas = this.querySelector("canvas");

        // webgl components
        const gl = this.canvas.getContext("webgl2");
        this.quad = { position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] };
        this.mesh = twgl.createBufferInfoFromArrays(gl, this.quad);
        this.material_feedback = null;
        this.elapsed = 0;
        this.tick = 0;
        this.gl = gl;

        // fancy webgl (mobile compatible)
        gl.getExtension("OES_texture_float");
        gl.getExtension("OES_texture_float_linear");
        gl.getExtension("OES_texture_half_float");
        gl.getExtension("OES_texture_half_float_linear");
        gl.getExtension("EXT_color_buffer_half_float");
        gl.getExtension("EXT_color_buffer_float");
        gl.getExtension("WEBGL_color_buffer_float");

        // shader content
        this.vertex = "";
        this.pixel = "";
        this.filter = "";
        this.filter_feedback = "";
        
        // shader settings
        const date = new Date();
        this.uniforms = {
            iTime: 0,
            iTimeDelta: 0,
            iFrame: 0,
            iResolution: [0, 0],
            iMouse: [0, 0, 0, 0],
            iDate: [
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                0],
            alphabet: twgl.createTexture(gl, { 
                src: "/shader/common/font-octavio-good.png",
                flipY: true,
                minMag: gl.LINEAR
            }),
            bluenoise: twgl.createTexture(gl, {
                src: "/shader/common/bluenoise-shadertoy.png",
                flipY: true
            }),
            final_pass: false,
        };
        
        this.attachments = [ {
            internalFormat: gl.RGBA16F,
            format: gl.RGBA,
            type: gl.HALF_FLOAT
        }]

        this.frames = [
            twgl.createFramebufferInfo(gl, this.attachments),
            twgl.createFramebufferInfo(gl, this.attachments),
        ];

        this.vertex = `#version 300 es
        precision mediump float;
        in vec4 position;
        void main() { gl_Position = position; }`
        
        this.filter = this.querySelector("canvas").textContent;
        
        // shader set up
        this.material = twgl.createProgramInfo(this.gl, [this.vertex, this.filter]);
    }

    connectedCallback()
    {
        // mouse event
        this.events();

        // main loop
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time)
    {
        time /= 1000;

        // const item = this.getBoundingClientRect();
        // const visible = item.top >= -item.height && item.bottom <= window.innerHeight+item.height

        if (this.update) this.render(time - this.elapsed);
        this.elapsed = time;

        requestAnimationFrame((time) => this.loop(time));
    }

    render(deltaTime)
    {
        // webgl components
        const gl = this.gl;
        const mesh = this.mesh;
        const material = this.material;
        const uniforms = this.uniforms;
        const frames = this.frames;
        const attachments = this.attachments;
        const tick = this.tick;
        const resized = twgl.resizeCanvasToDisplaySize(gl.canvas);

        if (resized)
        {
            twgl.resizeFramebufferInfo(gl, frames[0], attachments);
            twgl.resizeFramebufferInfo(gl, frames[1], attachments);
        }

        // shader settings
        uniforms.iTimeDelta = deltaTime;
        uniforms.iTime += deltaTime;
        uniforms.iFrame = this.tick;
        uniforms.iResolution = [gl.canvas.width, gl.canvas.height];

        const date = new Date();
        this.uniforms.iDate[3] = date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds();

        // framebuffer swap
        const read = tick % 2;
        const write = (tick + 1) % 2;

        // framebuffer
        uniforms.final_pass = false;
        uniforms.framebuffer = frames[read].attachments[0];
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[write].framebuffer);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);

        // render final pass
        uniforms.final_pass = true;
        uniforms.framebuffer = frames[write].attachments[0];
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);

        // loop
        this.tick += 1;
    }

    events()
    {
        if (this.hasAttribute("preview"))
        {
            // hover
            this.addEventListener("mouseenter", e => { this.update = true });
            this.addEventListener("mousemove", e => { this.update = true });
            this.addEventListener("mouseout", e => { this.update = false });
            
            // loading
            this.parentNode.querySelector(".loading").style.filter = "none";
        }
        else
        {
            this.update = true;

            if (this.filter.includes("iMouse") || this.filter_feedback.includes("iMouse"))
            {
                // mouse interaction
                this.addEventListener("mousemove", e => {
                    const down = this.uniforms.iMouse[2] > 0.5;
                    if (down) {
                        this.uniforms.iMouse[0] = e.offsetX;
                        this.uniforms.iMouse[1] = this.canvas.height - e.offsetY;
                    }
                });
                this.addEventListener("mousedown", e => {
                    this.uniforms.iMouse[0] = e.offsetX;
                    this.uniforms.iMouse[1] = this.canvas.height - e.offsetY;
                    this.uniforms.iMouse[2] = 1;
                });
                this.addEventListener("mouseup", e => {
                    this.uniforms.iMouse[2] = 0;
                });

                // cursor
                this.style.cursor = "pointer";
            }
        }
    }
}

customElements.define("shader-view", ShaderView);
