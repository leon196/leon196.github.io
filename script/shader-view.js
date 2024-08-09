
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

        // fancy webgl
        gl.getExtension("OES_texture_float");
        gl.getExtension("OES_texture_float_linear");
        gl.getExtension("EXT_color_buffer_float");

        // shader content
        this.vertex = "";
        this.pixel = "";
        this.filter = "";
        this.filter_feedback = "";
        
        // shader settings
        this.uniforms = {
            iTime: 0,
            iTimeDelta: 0,
            iFrame: 0,
            iResolution: [0, 0],
            iChannel0: 0,
            iChannel1: twgl.createTexture(gl, { src: "/shader/common/bluenoise-shadertoy.png", flipY: true }),
        };
        
        this.attachments = [ {
            internalFormat: gl.RGBA32F,
            format: gl.RGBA,
            type: gl.FLOAT
        }]
    }
    
    async connectedCallback()
    {
        const gl = this.gl;

        // detect shader type
        let path = this.getAttribute("src");
        let is_buffer = false;
        const columns = path.split('.');
        is_buffer = columns[columns.length-2] == "buffer";
        path = path.replace(".buffer", "");

        const stamp = "?t="+Date.now();

        const iChannel0 = this.getAttribute("iChannel0");
        if (iChannel0 != "")
        {
            this.uniforms.iChannel0 = twgl.createTexture(gl, { src: iChannel0, flipY: true, minMag: gl.LINEAR })
        }

        // load shader files
        await fetch("/shader/common/frame.vert").then(e => e.text()).then(e => this.vertex = e);
        await fetch(path+stamp).then(e => e.text()).then(e => this.filter = e);
        
        // shader set up
        this.material = twgl.createProgramInfo(this.gl, [this.vertex, this.filter]);

        // feedback set up
        if (is_buffer)
        {
            // load file
            path = this.getAttribute("src");
            await fetch(path+stamp).then(e => e.text()).then(e => this.filter_feedback = e);
            
            // webgl components
            const gl = this.gl;
            this.material_feedback = twgl.createProgramInfo(gl, [this.vertex, this.filter_feedback]);
            this.frames = [
                twgl.createFramebufferInfo(gl, this.attachments),
                twgl.createFramebufferInfo(gl, this.attachments),
            ];
        }

        if (this.hasAttribute("preview"))
        {
            // hover
            this.addEventListener("mouseenter", e => { this.update = true });
            this.addEventListener("mouseout", e => { this.update = false });
        }
        else
        {
            this.update = true;
        }

        // main loop
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time)
    {
        time /= 1000;

        const item = this.getBoundingClientRect();
        const visible = item.top >= -item.height && item.bottom <= window.innerHeight+item.height

        

        if (visible && this.update) this.render(time - this.elapsed);
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
        const resized = twgl.resizeCanvasToDisplaySize(gl.canvas);

        // shader settings
        uniforms.iTimeDelta = deltaTime;
        uniforms.iTime += deltaTime;
        uniforms.iFrame = this.tick;
        uniforms.iResolution = [gl.canvas.width, gl.canvas.height];

        // feedback effect
        this.feedback(resized);

        // draw effect
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);

        // loop
        this.tick += 1;
    }

    feedback(resized)
    {
        // only if there is feedback
        const material = this.material_feedback;
        if (material == null) return;

        // webgl components
        const gl = this.gl;
        const mesh = this.mesh;
        const uniforms = this.uniforms;
        const frames = this.frames;
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

        // apply feedback effect
        uniforms.iChannel0 = frames[read].attachments[0];
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[write].framebuffer);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}

customElements.define("shader-view", ShaderView);

// export ShaderView