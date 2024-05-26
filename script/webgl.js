
let engine = {};

window.addEventListener("load", (event) =>
{
    const canvas = document.getElementById("magic");
    const gl = canvas.getContext("webgl2");
    gl.getExtension("OES_texture_float");
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");
    let ready = false;
    let tick = 0;
    let elapsed = 0;

    let effect = ["oil_sim", "oil_render"]
    engine.select = (filter, render) => effect = [filter, render]
    
    let shader = {
        filter: ["frame.vert", "filter.frag"],
        render: ["frame.vert", "render.frag"],
        oil_sim: ["frame.vert", "oil_sim.frag"],
        oil_render: ["frame.vert", "oil_render.frag"],
        smoke_sim: ["frame.vert", "smoke_sim.frag"],
        smoke_render: ["frame.vert", "smoke_render.frag"],
        cloud: ["frame.vert", "cloud.frag"],
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
    
    let assetToLoad = []
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
    
        if (effect[0] != "none")
        {
            draw(shader[effect[0]], frames[write].framebuffer);
        }

        draw(shader[effect[1]], null);
    
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
    
    // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
    let isMobile = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);

    uniforms.desktop = isMobile ? 0 : 1;
    
});