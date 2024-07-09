#version 300 es
precision mediump float;

uniform sampler2D image;
in vec2 uv;
out uint fragColor;

void main()
{
    vec4 frame = texture(image, uv);
    fragColor = uint(step(frame.g-.2, 0.)*255.);
    // gl_FragColor = frame;
}