
class ShadertoyView extends HTMLElement
{    
    constructor()
    {
        super();

        // dom canvas
        this.canvas = document.createElement('canvas');
        this.appendChild(this.canvas);

        // webgl components
        const gl = this.canvas.getContext("webgl2");
        this.quad = { position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] };
        this.mesh = twgl.createBufferInfoFromArrays(gl, this.quad);
        this.passes = {};
        this.tick = 0;
        this.gl = gl;

        // fancy webgl
        gl.getExtension("OES_texture_float");
        gl.getExtension("OES_texture_float_linear");
        gl.getExtension("EXT_color_buffer_float");
        
        // shader settings
        this.uniforms = {
            iTime: 0,
            iDate: [0,0,0,0],
            iTimeDelta: 0,
            iFrame: 0,
            iResolution: [0, 0],
            iChannel0: 0,
            iChannel1: 0,
            iChannel2: 0,
            iChannel3: 0,
        };
        
        this.attachments = [ {
            internalFormat: gl.RGBA32F,
            format: gl.RGBA,
            type: gl.FLOAT
        }]

        this.buffers = [ "Buffer A", "Buffer B", "Buffer C", "Buffer D" ];
    }
    
    connectedCallback()
    {
        const gl = this.gl;
        const stamp = "?t="+Date.now();

        // detect shader type
        let path = this.getAttribute("src");

        const iChannel0 = this.getAttribute("iChannel0");
        if (iChannel0 != "")
        {
            this.uniforms.iChannel0 = twgl.createTexture(gl, { src: iChannel0, flipY: true })
        }

        // load shader files
        // await fetch("/shader/common/frame.vert").then(e => e.text()).then(e => this.vertex = e);
        const vertex = `#version 300 es
        precision mediump float;
        in vec4 position;
        void main() { gl_Position = position; }
        `;
        const header = `#version 300 es
        precision mediump float;
        out vec4 fragColor;
        uniform int iFrame;
        uniform float iTime, iTimeDelta;
        uniform vec2 iResolution;
        uniform vec4 iMouse;
        uniform sampler2D iChannel0, iChannel1, iChannel2, iChannel3;
        void mainImage(out vec4 fragColor, in vec2 fragCoord);
        void main() { mainImage(fragColor, gl_FragCoord.xy); }
        `;

        // fetch common
        let common = "";
        for (let i = 0; i < this.children.length; ++i)
        {
            const element = this.children[i];
            if (element.id == "Common") common = element.textContent;
        }

        for (let i = 0; i < this.children.length; ++i)
        {
            const element = this.children[i];
            if (element.id != "Common" && element.id != "")
            {
                const fragment = element.textContent;
                const pass = {
                    material: twgl.createProgramInfo(this.gl, [vertex, header+common+fragment])
                };

                // framebuffer
                if (element.id != "Image")
                {
                    pass.frames = [
                        twgl.createFramebufferInfo(gl, this.attachments),
                        twgl.createFramebufferInfo(gl, this.attachments),
                    ];
                }

                // inputs
                for (let c = 0; c < 4; c++) {
                    const attribute = "ichannel"+c;
                    const channel = "iChannel"+c;
                    pass[channel] = -1;
                    if (element.hasAttribute(attribute)) {
                        let path = element.getAttribute(attribute);
                        if (path.split('/')[2] == "previz")
                        {
                            pass[channel] = parseInt(path.split('/')[3][7]);
                        }
                        else {
                            path = "/shader/common"+path;
                            pass[channel] = twgl.createTexture(gl, { src: path, flipY: true })
                        }
                    }
                }

                this.passes[element.id] = pass;
            } 
        }
        this.render(0);

        // main loop
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time)
    {
        const item = this.getBoundingClientRect();
        const visible = item.top >= -item.height && item.bottom <= window.innerHeight+item.height
        if (visible) this.render(time);
        requestAnimationFrame((time) => this.loop(time));
    }

    render(time)
    {
        // webgl components
        const gl = this.gl;
        const mesh = this.mesh;
        const uniforms = this.uniforms;
        const resized = twgl.resizeCanvasToDisplaySize(gl.canvas);

        // shader settings
        uniforms.iTimeDelta = time / 1000 - uniforms.iTime;
        uniforms.iTime = time / 1000;
        uniforms.iFrame = this.tick;
        uniforms.iResolution = [gl.canvas.width, gl.canvas.height];

        this.buffers.forEach(buffer => {
            const pass = this.passes[buffer];
            if (pass != undefined) {
                this.renderpass(pass, resized);
            }
        })

        // draw effect
        const pass = this.passes["Image"];
        const material = pass.material;
        for (let i = 0; i < 4; ++i) {
            const channel = "iChannel"+i;
            if (Number.isInteger(pass[channel])) {
                if (pass[channel] != -1) {
                    uniforms[channel] = this.passes[this.buffers[i]].frames[this.tick%2].attachments[0];
                }
                else
                {
                    uniforms[channel] = null;
                }
            }
            else if (pass[channel] != undefined) {
                uniforms[channel] = pass[channel];
            }
            else
            {
                uniforms[channel] = null;
            }
        }
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);

        // loop
        this.tick += 1;
    }

    renderpass(pass, resized)
    {
        // webgl components
        const gl = this.gl;
        const mesh = this.mesh;
        const uniforms = this.uniforms;
        const frames = pass.frames;
        const attachments = this.attachments;
        const tick = this.tick;


        // resize event
        if (resized)
        {
            twgl.resizeFramebufferInfo(gl, frames[0], attachments);
            twgl.resizeFramebufferInfo(gl, frames[1], attachments);
        }
                    
        // framebuffer swap
        const read = tick % 2;
        const write = (tick + 1) % 2;

        const material = pass.material;
        for (let i = 0; i < 4; ++i) {
            const channel = "iChannel"+i;
            if (Number.isInteger(pass[channel])) {
                if (pass[channel] != -1) {
                    uniforms[channel] = this.passes[this.buffers[i]].frames[this.tick%2].attachments[0];
                }
                else
                {
                    uniforms[channel] = null;
                }
            }
            else if (pass[channel] != undefined) {
                uniforms[channel] = pass[channel];
            }
            else
            {
                uniforms[channel] = null;
            }
        }
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[write].framebuffer);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}

customElements.define("shadertoy-view", ShadertoyView);