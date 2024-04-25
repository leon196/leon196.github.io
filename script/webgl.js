
const webgl = (filter, render) => {
window.onload = (event) =>
{
    const canvas = document.getElementById("magic");
    const gl = canvas.getContext("webgl2");
    gl.getExtension("OES_texture_float");
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");
    let ready = false;
    let tick = 0;
    let elapsed = 0;
    
    let shader = {
        filter: ["frame.vert", "filter.frag"],
        render: ["frame.vert", "render.frag"],
        oil_sim: ["frame.vert", "oil_sim.frag"],
        oil_render: ["frame.vert", "oil_render.frag"],
        smoke_sim: ["frame.vert", "smoke_sim.frag"],
        smoke_render: ["frame.vert", "smoke_render.frag"],
    };
    
    // meshes
    const mesh = {
        quad: twgl.createBufferInfoFromArrays(gl, {
        position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]}),
    };
    
    // framebuffers
    const attachments = [ { internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT }]
    const frames = [
        twgl.createFramebufferInfo(gl, attachments),
        twgl.createFramebufferInfo(gl, attachments),
    ];
    
    // images
    const images = twgl.createTextures(gl, {
        bluenoise: {
            src: "media/images/bluenoise-shadertoy.png",
            flipY: true,
        },
    })
    
    let uniforms = {
        time: 0,
        timeDelta: 0,
        tick: 0,
        resolution: [0, 0],
        framebuffer: null,
        bluenoise: images.bluenoise,
    };

    let mouse = {
        clic: 0,
        position: [0,0],
    }
    
    let assetToLoad = [];
    for (const [key, item] of Object.entries(shader))
    {
        if (!assetToLoad.includes(item[0])) assetToLoad.push(item[0]);
        if (!assetToLoad.includes(item[1])) assetToLoad.push(item[1]);
    }
    
    loadFiles("shader", assetToLoad, "text", function loaded(files)
    {
        for (const [key, item] of Object.entries(shader))
        {
            shader[key] = twgl.createProgramInfo(gl, [files[item[0]], files[item[1]]]);
        }
        ready = true;
    });

    function draw(filter, buffer)
    {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.useProgram(filter.program);
        twgl.setBuffersAndAttributes(gl, filter, mesh.quad);
        twgl.setUniforms(filter, uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);
    }
    
    function loop(time)
    {
        // loop the loop
        requestAnimationFrame(loop);
        if (!ready) return;
    
        // resolution
        const resized = twgl.resizeCanvasToDisplaySize(gl.canvas);
        if (resized)
        {
            twgl.resizeFramebufferInfo(gl, frames[0], attachments);
            twgl.resizeFramebufferInfo(gl, frames[1], attachments);
        }
    
        // framebuffer swap
        const read = tick % 2;
        const write = (tick + 1) % 2;
        
        uniforms.time = time / 1000;
        uniforms.timeDelta = uniforms.time - elapsed;
        uniforms.tick = tick;
        uniforms.resolution = [gl.canvas.width, gl.canvas.height];
        uniforms.clic = mouse.clic;
        uniforms.mouse = mouse.position;
        uniforms.framebuffer = frames[read].attachments[0];
    
        draw(shader[filter], frames[write].framebuffer);
        draw(shader[render], null);
    
        tick += 1;
        elapsed = time / 1000;
    }

    // mouse events   
    canvas.addEventListener('mousemove', input);
    canvas.addEventListener('mouseleave', () => mouse.clic = 0);
    canvas.addEventListener('mousedown', () => mouse.clic = 1);
    window.addEventListener('mouseup', () => mouse.clic = 0);

    function input(e)
    {
        mouse.position[0] = e.clientX / gl.canvas.clientWidth;
        mouse.position[1] = 1 - (e.clientY / gl.canvas.clientHeight);
    }
    
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', e => touch(e, 1), {passive: false});
    canvas.addEventListener('touchend', e => touch(e, 0), {passive: false});
    canvas.addEventListener('touchcancel', e => touch(e, 0), {passive: false});
    canvas.addEventListener('touchmove', e => touch(e, 1), {passive: false});
    
    function touch(e, clic)
    {
        e.preventDefault();
        input(e.touches[0]);
        mouse.clic = clic;
    }
    
    // start loop
    requestAnimationFrame(loop);
    
}
}