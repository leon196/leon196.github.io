
import * as twgl from "./twgl-full.module.js"
import { render } from "./app.js"

var dom = (selector) => { return document.querySelector(selector) }

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

export function build_image_upload(context, node)
{
    // upload image button
    node.addEventListener("change", () => {
        const file = node.files[0]

        // update shaders
        Object.keys(context).forEach(key => {
            const gl = context[key].gl
            const image = twgl.createTexture(gl, {
                src: URL.createObjectURL(file),
                minMag: gl.NEAREST,
                flipY: true,
            })
            context[key].uniforms.use_custom_mask = true
            context[key].uniforms.custom_mask = image
        })

        // save it
        const reader = new FileReader()
        reader.addEventListener("load", () => localStorage.setItem('custom_mask', reader.result))
        reader.readAsDataURL(file)

        // update gui
        set_visible(dom("#upload_image"), false)
        set_visible(dom("#clear_image"), true)
    })
}

export function build_image_clear(context, node)
{
    // clear image button
    node.addEventListener("click", () => {
        Object.keys(context).forEach(key => {
            context[key].uniforms.use_custom_mask = false
        })
        localStorage.removeItem('custom_mask')

        // update gui
        set_visible(dom("#upload_image"), true)
        set_visible(dom("#clear_image"), false)
    })
}

export function build_image_export(context, node)
{
    node.addEventListener("click", () => {
        const style = context.gl.canvas.style
        const width = style.width
        const height = style.height
        style.width = dom("#image_width").value + "px"
        style.height = dom("#image_height").value + "px"
        render(context, 0)
        window.open(context.gl.canvas.toDataURL())
        style.width = width
        style.height = height
    })
}

export function set_visible(node, toggle)
{
    node.style.display = toggle ? "inherit" : "none"
}