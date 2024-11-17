#version 300 es
precision mediump float;

uniform sampler2D image, feedback;
uniform float thin;
in vec2 uv;
out vec4 fragColor;

void main()
{
    vec4 img = texture(image, uv);
    vec4 frame = texture(feedback, uv);
    fragColor = vec4(step(frame.g-0.75*img.r, 0.));
    // fragColor = vec4(step(frame.g-0.5, 0.));
    // if (uv.y > .5) fragColor.r = uv.x;
    // gl_FragColor = frame;
}