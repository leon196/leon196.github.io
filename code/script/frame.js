
function get_framebuffer ()
{
    let cursor = 0
    const frames = [ twgl.createFramebufferInfo(gl), twgl.createFramebufferInfo(gl) ]
    const read = () => cursor
    const write = () => (cursor + 1) % 2
    return {
        bind: () => gl.bindFramebuffer(gl.FRAMEBUFFER, frames[write()].framebuffer),
        unbind: () => gl.bindFramebuffer(gl.FRAMEBUFFER, null),
        texture: () => frames[read()].attachments[0],
        swap: () => cursor = (cursor + 1) % 2,
        resize: () => frames.forEach(frame => twgl.resizeFramebufferInfo(gl, frame))
    }
}