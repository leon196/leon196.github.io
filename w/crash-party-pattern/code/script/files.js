
export const shaders = {}

var files = [
  "vertex.vert",
  "effect.frag",
  "mask.frag",
]

// timestamp to ignore cache when reload
const ts = Date.now().toString()

// load file
const path = "/code/shader/"
for (const file in files) {
    await fetch(path+files[file]+"?ts="+ts)
    .then(t => t.text())
    .then(t => shaders[files[file]] = t)
}