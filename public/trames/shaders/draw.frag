#version 300 es
precision mediump float;

uniform sampler2D image;

in vec2 uv;
out vec4 outputColor;

void main()
{
    outputColor = texture(image, uv);
}