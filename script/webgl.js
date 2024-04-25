
loadFiles("shader", ["quad.vert", "filter.frag", "render.frag"], "text", loaded);

function loaded(files)
{
    const canvas = document.getElementById("magic");
    const gl = canvas.getContext("webgl2");

    // shaders
    const shader = {
        filter: twgl.createProgramInfo(gl, [files["quad.vert"], files["filter.frag"]]),
        render: twgl.createProgramInfo(gl, [files["quad.vert"], files["render.frag"]]),
    }

    // meshes
    const mesh = {
        quad: twgl.createBufferInfoFromArrays(gl, {
        position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]}),
    };

    // framebuffers
    const frames = [
        twgl.createFramebufferInfo(gl, null),
        twgl.createFramebufferInfo(gl, null),
    ];

    // images
    // const textures = twgl.createTextures(gl, {
    //     image: {
    //         src: "images/image.jpg",
    //         flipY: true,
    //     },
    // })

    let uniforms = {
        time: 0,
        tick: 0,
        resolution: [0, 0],
        frame: null,
    };

    let tick = 0;

    function loop(time)
    {
        // resolution
        const resized = twgl.resizeCanvasToDisplaySize(gl.canvas);
        if (resized) {
            twgl.resizeFramebufferInfo(gl, frames[0]);
            twgl.resizeFramebufferInfo(gl, frames[1]);
        }

        // framebuffer swap
        const read = tick;
        const write = (tick + 1) % 2;
        
        uniforms.time = time / 1000;
        uniforms.tick = tick;
        uniforms.resolution = [gl.canvas.width, gl.canvas.height];
        uniforms.frame = frames[read].attachments[0];

        // draw video to frame
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[write].framebuffer);
        gl.useProgram(shader.filter.program);
        twgl.setBuffersAndAttributes(gl, shader.filter, mesh.quad);
        twgl.setUniforms(shader.filter, uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);

        // draw frame buffer
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(shader.render.program);
        twgl.setBuffersAndAttributes(gl, shader.render, mesh.quad);
        twgl.setUniforms(shader.render, uniforms);
        twgl.drawBufferInfo(gl, mesh.quad);

        tick = (tick + 1) % 2;
        
        // loop the loop
        requestAnimationFrame(loop);
    }

    // start loop
    requestAnimationFrame(loop);
}