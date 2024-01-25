
loadFiles("shader", ["quad.vert", "video.vert", "framebuffer.frag", "render.frag", "draw.frag"], "text", loaded, progress);

function progress(e)
{
    // console.log(e);
}

function loaded(shader)
{
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");

    // shaders
    const programs = {
        draw: twgl.createProgramInfo(gl, [shader["quad.vert"], shader["draw.frag"]]),
        filter: twgl.createProgramInfo(gl, [shader["quad.vert"], shader["framebuffer.frag"]]),
        render: twgl.createProgramInfo(gl, [shader["video.vert"], shader["render.frag"]]),
    }

    // meshes
    const buffers = {
        quad: twgl.createBufferInfoFromArrays(gl, {
        position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]}),
    };

    // framebuffers
    const frames = [
        twgl.createFramebufferInfo(gl, null, 1920, 1080),
        twgl.createFramebufferInfo(gl, null, 1920, 1080),
    ];

    const snapshot = twgl.createFramebufferInfo(gl, null, 1920, 1080);

    // images
    const textures = twgl.createTextures(gl, {
        media: {
            src: "image/image.png",
            flipY: true,
        },
    })

    // video
    const video = document.createElement("video");
    video.playsInline = true;
    video.loop = true;
    video.src = "video/video1.mp4";

    let tick = 0;
    let mousepos = [0, 0];
    let mouseclic = 0;
    let snapped = false;
    let snappos = [0, 0];
    let started = 0;
    let chapter = 0;
    let lombric = 1;

    function start()
    {
        started = true;
        video.play();
        video.muted = true;
        button.style.display = "none";
        for (const [key, item] of Object.entries(ui)) {
            item.dom.style.display = "block";
        }

        ui.play.dom.style.display = "none";
    }

    function loop(time)
    {
        if (started) render(time);
        requestAnimationFrame(loop);
    }

    function render(time)
    {
        // resolution
        const resized = twgl.resizeCanvasToDisplaySize(gl.canvas);
        // if (resized) {
        //     twgl.resizeFramebufferInfo(gl, frames[0]);
        //     twgl.resizeFramebufferInfo(gl, frames[1]);
        // }
        
        // update video
        if (video.currentTime > 0) {
            gl.bindTexture(gl.TEXTURE_2D, textures.media)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        }

        // framebuffer swap
        const read = tick;
        const write = (tick + 1) % 2;

        // used by shaders
        const uniforms = {
            time: time * 0.001,
            resolution: [gl.canvas.width, gl.canvas.height],
            media: textures.media,
            frame: frames[read].attachments[0],
            snapshot: snapshot.attachments[0],
            mouse: mousepos,
            snappos: snappos,
            clic: mouseclic,
            lombric: lombric,
            fade: started*0.5+0.5,
        };

        // draw video to snapshot
        if (!snapped && mouseclic === 1)
        {
            snapped = true;
            snappos[0] = mousepos[0];
            snappos[1] = mousepos[1];
            gl.viewport(0, 0, 1920., 1080.);
            gl.bindFramebuffer(gl.FRAMEBUFFER, snapshot.framebuffer);
            gl.useProgram(programs.draw.program);
            twgl.setBuffersAndAttributes(gl, programs.draw, buffers.quad);
            twgl.setUniforms(programs.draw, uniforms);
            twgl.drawBufferInfo(gl, buffers.quad);
        }
        if (mouseclic === 0)
        {
            snapped = false;
        }

        // draw video to frame
        gl.viewport(0, 0, 1920., 1080.);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[write].framebuffer);
        gl.useProgram(programs.filter.program);
        twgl.setBuffersAndAttributes(gl, programs.filter, buffers.quad);
        twgl.setUniforms(programs.filter, uniforms);
        twgl.drawBufferInfo(gl, buffers.quad);

        // draw frame buffer
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(programs.render.program);
        twgl.setBuffersAndAttributes(gl, programs.render, buffers.quad);
        twgl.setUniforms(programs.render, uniforms);
        twgl.drawBufferInfo(gl, buffers.quad);

        tick = (tick + 1) % 2;
    }

    // mouse events   
    canvas.addEventListener('mousemove', setMousePos);
    canvas.addEventListener('mouseleave', () => mouseclic = 0);
    canvas.addEventListener('mousedown', () => mouseclic = 1);
    window.addEventListener('mouseup', () => mouseclic = 0);
    
    function handleTouch(e, clic) {
        e.preventDefault();
        setMousePos(e.touches[0]);
        mouseclic = clic;
    }

    function setMousePos(e) {

        if (gl.canvas.clientWidth / gl.canvas.clientHeight < 16./9.)
        {
            mousepos[0] = e.clientX / gl.canvas.clientWidth;
            const h = gl.canvas.clientWidth * 9.0 / 16.0;
            const y = (gl.canvas.clientHeight - h);
            mousepos[1] = 1 - ((e.clientY-y/2) / h);
        }
        else
        {
            const w = gl.canvas.clientHeight * 16.0 / 9.0;
            const x = (gl.canvas.clientWidth - w);
            mousepos[0] = (e.clientX-x/2) / w;
            mousepos[1] = 1 - (e.clientY / gl.canvas.clientHeight);
        }
    }
    
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', e => handleTouch(e, 1), {passive: false});
    canvas.addEventListener('touchend', e => handleTouch(e, 0), {passive: false});
    canvas.addEventListener('touchcancel', e => handleTouch(e, 0), {passive: false});
    canvas.addEventListener('touchmove', e => handleTouch(e, 1), {passive: false});

    // video controls
    const ui = {
        rewind: { src: "rewind.png", order: 0 },
        play: { src: "play.png", order: 1 },
        pause: { src: "pause.png", order: 1 },
        next: { src: "next.png", order: 2 },
        reset: { src: "reset.svg", order: 0, topRight: true },
        lombric: { src: "lombric.svg", order: 1, topRight: true },
    };
    
    // generate dom of video controls
    for (const [key, item] of Object.entries(ui)) {
        const button = document.createElement("button");
        const img = document.createElement("img");
        button.style.display = "none";
        img.src = "image/" + item.src;
        button.append(img);
        document.body.append(button);
        ui[key].dom = button;

        if (item.topRight) {
            button.style.right = (20*(1+item.order)*1.5) + "px";
            button.classList.add("control-filter");
        }
        else {
            button.style.left = (20*(1+item.order)*1.5) + "px";
            button.classList.add("control-video");
        }
    }

    // start button
    const button = document.createElement("button");
    const img = document.createElement("img");
    button.classList.add("center");
    button.addEventListener('mousedown', start);
    img.src = "image/start.svg";
    img.style.width = "100px";
    button.append(img);
    document.body.append(button);

    function playVideo()
    {
        ui.play.dom.style.display = "none";
        ui.pause.dom.style.display = "block";
        video.play();
    }

    // resume button
    ui.play.dom.addEventListener('mousedown', () =>
    {
        playVideo();
    });

    // pause button
    ui.pause.dom.addEventListener('mousedown', () =>
    {
        ui.pause.dom.style.display = "none";
        ui.play.dom.style.display = "block";
        video.pause();
    });

    // rewind button
    ui.rewind.dom.addEventListener('mousedown', () =>
    {
        video.currentTime = 0;
        playVideo();
    });

    // next button
    ui.next.dom.addEventListener('mousedown', () =>
    {
        chapter = (chapter + 1) % 3;
        video.src = "video/video" + (chapter+1) + ".mp4";
        playVideo();
    });

    // reset button
    ui.reset.dom.addEventListener('mousedown', () =>
    {
        gl.viewport(0, 0, 1920., 1080.);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[0].framebuffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frames[1].framebuffer);
        gl.clearColor(0,0,0,0)
        gl.clear(gl.COLOR_BUFFER_BIT);
    });

    ui.lombric.dom.addEventListener('mousedown', () => 
    {
        lombric = 1-lombric;
    });

    // start loop
    requestAnimationFrame(loop);
}