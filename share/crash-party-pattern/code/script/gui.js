
import * as twgl from "./twgl-full.module.js"
import * as app from "./app.js"

var dom = (selector) => { return document.querySelector(selector) }
var print = (log) => { return console.log(log) }
var hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255
    ] : null;
}

export function set_visible(node, toggle)
{
    node.style.display = toggle ? "inherit" : "none"
}

export function build_list(dict, node)
{
    // shader settings
    Object.keys(dict).forEach(key => {

        // load
        const stored = localStorage.getItem(key)
        if (stored != null) dict[key] = stored

        // style
        const container = document.createElement("div")
        container.setAttribute("class", "row")

        // label
        const label = document.createElement("label")
        label.setAttribute("for", key)
        label.innerHTML = key
        container.append(label)

        // input
        const input = document.createElement("input")
        input.setAttribute("id", key)
        input.setAttribute("name", key)
        input.setAttribute("min", 0.0)
        input.setAttribute("max", 1.0)
        input.setAttribute("step", 0.01)
        input.setAttribute("type", "range")
        input.setAttribute("value", dict[key])
        input.addEventListener("input", (event) => {
            dict[key] = event.target.value
            localStorage.setItem(key, dict[key])
        })
        
        container.append(input)
        node.append(container)
    })
}

export function build_options(dict, node)
{
    // shader settings
    Object.keys(dict).forEach(key => {

        // load
        const stored = localStorage.getItem(key)
        if (stored != null) dict[key] = stored > 0.5

        // style
        const container = document.createElement("div")
        container.setAttribute("class", "row")

        // label
        const label = document.createElement("label")
        label.setAttribute("for", key)
        label.innerHTML = key
        container.append(label)

        // input
        const input = document.createElement("input")
        input.setAttribute("id", key)
        input.setAttribute("name", key)
        input.setAttribute("type", "checkbox")
        input.addEventListener("input", (event) => {
            dict[key] = input.checked
            localStorage.setItem(key, input.checked ? 1.0 : 0.0)
        })
        
        input.checked = dict[key]
        container.append(input)
        node.append(container)
    })
}

// upload image event
dom("#upload_image").addEventListener("change", () => {
    const file = dom("#upload_image").files[0]

    // update shaders
    Object.keys(app.context).forEach(key => {
        const gl = app.context[key].gl
        const image = twgl.createTexture(gl, {
            src: URL.createObjectURL(file),
            minMag: gl.NEAREST,
            flipY: true,
        })
        app.context[key].uniforms.use_custom_mask = true
        app.context[key].uniforms.custom_mask = image
    })

    // save it
    const reader = new FileReader()
    reader.addEventListener("load", () => {
        localStorage.setItem('custom_mask', reader.result)
    })
    reader.readAsDataURL(file)

    // update gui
    set_visible(dom("#upload_image"), false)
    set_visible(dom("#clear_image"), true)
})

// clear image event
dom("#clear_image").addEventListener("click", (event) => {
    Object.keys(app.context).forEach(key => {
        app.context[key].uniforms.use_custom_mask = false
    })
    localStorage.removeItem('custom_mask')

    // update gui
    set_visible(dom("#upload_image"), true)
    set_visible(dom("#clear_image"), false)
})

// export image event
dom("#export_image").addEventListener("click", (event) => {
    const style = app.context.main.gl.canvas.style
    const width = style.width
    const height = style.height
    style.width = dom("#image_width").value + "px"
    style.height = dom("#image_height").value + "px"
    app.render(app.context.main, 0)
    window.open(app.context.main.gl.canvas.toDataURL())
    style.width = width
    style.height = height
})

// reset event
dom("#reset").addEventListener("click", (event) => {

    Object.keys(app.options).forEach(key => app.options[key] = app.defaults[key])
    Object.keys(app.settings).forEach(key => app.settings[key] = app.defaults[key])
    Object.keys(app.settings_mask).forEach(key => app.settings_mask[key] = app.defaults[key])
    localStorage.clear()
    location.reload()
})

const colors = dom("#gui_color").children
const palettes = {
    "Watermelon Sorbet": ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
    "Black White": ["#ffffff", "#ffffff", "#000000", "#000000", "#000000"],
    "Floral Delight": ["#d7263d", "#f46036", "#2e294e", "#1b998b", "#c5d86d"],
    "Candy Pop": ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"],
    "Vibrant Summer": ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
    "Custom": ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"],
}

function update_palette(selected) {
    // make array
    let gradient_array = []
    for (let n = 0; n < colors.length; ++n) {
        const hex = palettes[selected][n]
        gradient_array = gradient_array.concat(hexToRgb(hex))
        colors[n].value = hex
    }
    // update texture
    Object.keys(app.context).forEach(key => {
        const context = app.context[key]
        const gl = context.gl
        context.uniforms.gradient = twgl.createTexture(gl, {
            src: gradient_array,
            minMag: gl.NEAREST,
        })
    })
}

// palette event selection
dom("#palettes").addEventListener("input", (event) => {
    const selected = event.target.value
    update_palette(selected)
    localStorage.setItem("palette", selected)
})

// palette color event
for (let i = 0; i < colors.length; ++i) {
    // input event
    colors[i].addEventListener("input", (event) => {
        // update palette
        palettes["Custom"][i] = event.target.value
        // use previous palette if any
        const selected = localStorage.getItem("palette")
        if (selected != null && selected != "Custom") {
            for (let n = 0; n < colors.length; ++n) {
                if (i != n) {
                    palettes["Custom"][n] = palettes[selected][n]
                    localStorage.setItem("color_"+n, palettes[selected][n])
                }
            }
        }
        // save it
        localStorage.setItem("color_"+i, event.target.value)
        localStorage.setItem("palette", "Custom")
        dom("#palettes").value = "Custom"
        update_palette("Custom")
    })
}

// palette load
export function build_palette() {
    const gui_palettes = dom("#palettes")
    Object.keys(palettes).forEach(palette => {
        const option = document.createElement("option")
        option.setAttribute("value", palette)
        option.textContent = palette
        gui_palettes.append(option)
    })
    for (let i = 0; i < colors.length; ++i) {
        let color = localStorage.getItem("color_"+i)
        palettes["Custom"][i] = color || "#ffffff"
    }
    const stored_palette = localStorage.getItem("palette")
    if (stored_palette != null) {
        dom("#palettes").value = stored_palette
        update_palette(stored_palette)
    }
}

// resize event
const preview_size = 100
const canvas_preview = dom("#canvas_preview")
window.addEventListener("resize", (event) => {
    if (app.options.use_aspect_ratio) {
        canvas_preview.style.width = preview_size + "px"
    }
})