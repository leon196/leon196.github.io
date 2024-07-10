#version 300 es
precision mediump float;

uniform sampler2D image;
uniform float thin;
in vec2 uv;
out vec4 fragColor;

void main()
{
    vec4 frame = texture(image, uv);
    fragColor = vec4(step(frame.g-thin, 0.));
    // gl_FragColor = frame;
}