
function gui_add_setting(node, key, item)
{
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
    input.setAttribute("min", item.min)
    input.setAttribute("max", item.max)
    input.setAttribute("step", item.step || 0.01)
    input.setAttribute("type", "range")
    input.setAttribute("value", item.value)

    container.append(input)
    node.append(container)

    return input
}

function relaxedJSONParse(str)
{
  // Remove trailing commas before } or ]
  return str.replace(/,\s*([}\]])/g, '$1');
}

function gui_get_data(shaderSource)
{
    shaderSource = relaxedJSONParse(shaderSource)
    const commentMatch = shaderSource.match(/\/\*([\s\S]*?)\*\//)
    if (!commentMatch) return {}
    const commentContent = commentMatch[1].trim()
    if (!commentContent.startsWith("{")) return {}
    let data = {};
    try {
        data = JSON.parse(commentContent)
    } catch (err) {
        console.log("Failed to parse ISF JSON: " + err.message)
    }
    return data;
}

function gui_clear(node)
{
    node.innerHTML = ""
}