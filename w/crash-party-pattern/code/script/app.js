import * as twgl from "./twgl-full.module.js"
import * as gui from "./gui.js"
import { shaders } from "./files.js"
import { quad } from "./mesh.js"

var dom = (selector) => { return document.querySelector(selector) }
var print = (log) => { return console.log(log) }

const context = {
    main: {
        gl: dom("#canvas_main").getContext("webgl", { preserveDrawingBuffer: true }),
        filter: "effect.frag",
    },
    preview: {
        gl: dom("#canvas_preview").getContext("webgl"),
        filter: "mask.frag",
    }
}

const options = {
    fixed_aspect_ratio: false,
}

const settings = {
    start_size: 0.5,
    subdivide: 0.5,
    dither: 0.25,
    padding: 0.2,
    salt: 0.5,
}

const settings_mask = {
    level_black: 0.5,
    level_white: 0.0,
    level_min: 0.,
    level_max: 1.0,
}

Object.keys(context).forEach(key => {
    
    // setup content per context
    const filter = context[key].filter
    const gl = context[key].gl

    // settings
    const uniforms = {
        time: 0.0,
        resolution: [1920, 1080],
        bitmap_grid: [16, 10],
        bitmap: twgl.createTexture(gl, {
            src: "/content/image/adlfont16x10.png",
            minMag: gl.NEAREST,
            flipY: true,
        }),
        custom_mask: twgl.createTexture(gl, { src: [255, 255, 255, 255] }),
        use_custom_mask: false,
    }

    // load image from previous session
    const image = localStorage.getItem("custom_mask")
    if (image != null) {
        uniforms.use_custom_mask = true
        uniforms.custom_mask = twgl.createTexture(gl, {
            src: image,
            minMag: gl.NEAREST,
            flipY: true,
        })
        gui.set_visible(dom("#upload_image"), false)
        gui.set_visible(dom("#clear_image"), true)
    }

    context[key].buffer = twgl.createBufferInfoFromArrays(gl, quad)
    context[key].program = twgl.createProgramInfo(gl, [shaders["vertex.vert"], shaders[filter]])
    context[key].uniforms = uniforms
})

export function render(context, time)
{
    const gl = context.gl
    const canvas = gl.canvas
    const programInfo = context.program
    const buffer = context.buffer
    const uniforms = context.uniforms
    twgl.resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(programInfo.program)
    uniforms.time = time/1000.0
    uniforms.resolution = [canvas.width, canvas.height]
    Object.keys(options).forEach(key => uniforms[key] = options[key])
    Object.keys(settings).forEach(key => uniforms[key] = settings[key])
    Object.keys(settings_mask).forEach(key => uniforms[key] = settings_mask[key])
    twgl.setBuffersAndAttributes(gl, programInfo, buffer)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, buffer)
}

// gui
gui.build_list(settings, dom("#gui_settings"))
gui.build_options(options, dom("#gui_settings"))
gui.build_list(settings_mask, dom("#gui_settings_mask"))
gui.build_image_upload(context, dom("#upload_image"))
gui.build_image_clear(context, dom("#clear_image"))
gui.build_image_export(context.main, dom("#export_image"))

// loop
function main(time)
{
    Object.keys(context).forEach(key => render(context[key], time))
    requestAnimationFrame(main)
}

requestAnimationFrame(main)